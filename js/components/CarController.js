// js/components/CarController.js

const THREE = window.THREE; 

// Pré-aloca vetores temporários no escopo do módulo para evitar alocação no loop
const TEMP_VECTOR_1 = new THREE.Vector3(); 
const TEMP_FORWARD = new THREE.Vector3(0, 0, 1);
const TEMP_RIGHT = new THREE.Vector3(1, 0, 0);
// NOVO: Raycaster para colisões de parede
const TEMP_RAYCASTER = new THREE.Raycaster(); 

export class CarController {
    constructor(carMesh, wheels, velocity = new THREE.Vector3()) {
        this.carMesh = carMesh;
        this.wheels = wheels;
        this.velocity = velocity;
        this.steeringInput = 0;
        
        // Referências aos vetores pré-alocados para reutilização
        this._tempVec1 = TEMP_VECTOR_1;
        this._forwardVector = TEMP_FORWARD;
        this._rightVector = TEMP_RIGHT;

        // NOVO: Constante para a distância de verificação de colisão
        this.COLLISION_DISTANCE = 3.0;
        
        // Parâmetros de física
        this.maxSpeed = 10.0;
        this.accelerationRate = 0.03;
        this.brakingRate = 0.08;
        this.drag = 0.98;
        this.traction = 0.95;
        this.steeringSpeed = 0.03;
        this.maxSteeringAngle = Math.PI / 8;
        this.driftTractionFactor = 0.08;
        this.driftDrag = 0.9;
        this.wheelRotationSpeedMultiplier = 20;
    }


    update(keyboard, wallMeshes) { // NOVO PARÂMETRO: wallMeshes
        const isHandbraking = keyboard[' '];
        const currentSpeed = this.velocity.length();
        
        // 1. Aceleração / Freio (OTIMIZAÇÃO: Usando _tempVec1)
        if (keyboard['ArrowUp']) {
            if (currentSpeed < this.maxSpeed) {
                this._tempVec1.set(0, 0, this.accelerationRate).applyQuaternion(this.carMesh.quaternion);
                this.velocity.add(this._tempVec1);
            }
        } else if (keyboard['ArrowDown']) {
            this._tempVec1.set(0, 0, this.brakingRate).applyQuaternion(this.carMesh.quaternion);
            this.velocity.sub(this._tempVec1);
            if (currentSpeed < 0.05) this.velocity.set(0,0,0);
        }

        // 2. Direção (Steering)
        let targetSteering = 0;
        if (keyboard['ArrowLeft']) {
            targetSteering = this.maxSteeringAngle;
        } else if (keyboard['ArrowRight']) {
            targetSteering = -this.maxSteeringAngle;
        }
        this.steeringInput += (targetSteering - this.steeringInput) * this.steeringSpeed;

        // 3. Lógica de Drift e Tração (OTIMIZAÇÃO: Reutilizando vetores globais com .copy())
        const forwardVector = this._forwardVector.set(0, 0, 1).applyQuaternion(this.carMesh.quaternion);
        const rightVector = this._rightVector.set(1, 0, 0).applyQuaternion(this.carMesh.quaternion);
        
        // É necessário usar .clone() aqui pois multiplyScalar altera o vetor original
        const sideVelocity = rightVector.clone().multiplyScalar(this.velocity.dot(rightVector));
        const forwardVelocity = forwardVector.clone().multiplyScalar(this.velocity.dot(forwardVector));

        let currentTraction = this.traction;
        let currentDrag = this.drag;
        if (isHandbraking && currentSpeed > 0.1) {
            currentTraction = this.driftTractionFactor;
            currentDrag = this.driftDrag;
        }

        // Aplica tração (para frente) e arrasto (lateral)
        this.velocity = forwardVelocity.multiplyScalar(currentTraction).add(sideVelocity.multiplyScalar(1 - currentTraction));
        this.velocity.multiplyScalar(currentDrag);
        
        // 4. VERIFICA COLISÃO COM PAREDES ANTES DE MOVER (NOVA LÓGICA DE PAREDE)
        if (wallMeshes.length > 0 && currentSpeed > 0.01) {
            
            // a. Determina a direção da velocidade (normalizada)
            const direction = this.velocity.clone().normalize();

            // b. Configura o Raycaster
            // Dispara um raio da posição do carro, na direção da velocidade
            TEMP_RAYCASTER.set(this.carMesh.position, direction);
            
            // c. Verifica interseção com as malhas de parede
            const wallHits = TEMP_RAYCASTER.intersectObjects(wallMeshes, true);

            if (wallHits.length > 0 && wallHits[0].distance < this.COLLISION_DISTANCE) {
                // Colisão detectada!
                // Aplica uma força de repulsão suave (simula quique)
                this.velocity.negate().multiplyScalar(0.2); 
            }
        }
        
        // 5. Rotação do Carro e Suspensão Visual
        const rotationAngle = (this.steeringInput * this.velocity.length() * (isHandbraking ? 1.5 : 1));
        this.carMesh.rotation.y += rotationAngle;
        
        const tiltFactor = this.velocity.length() * 0.5;
        const targetTiltZ = -this.steeringInput * tiltFactor;
        this.carMesh.rotation.z += (targetTiltZ - this.carMesh.rotation.z) * 0.1;

        // 6. Aplica o movimento final
        this.carMesh.position.add(this.velocity);

        // 7. Rotação e Direção das Rodas
        if (this.wheels.frontLeft) {
            const wheelSpeed = currentSpeed * this.wheelRotationSpeedMultiplier;
            this.wheels.frontLeft.rotation.x += wheelSpeed;
            this.wheels.frontRight.rotation.x += wheelSpeed;
            this.wheels.rearLeft.rotation.x += wheelSpeed;
            this.wheels.rearRight.rotation.x += wheelSpeed;
            
            this.wheels.frontLeft.rotation.y = this.steeringInput;
            this.wheels.frontRight.rotation.y = this.steeringInput;
        }
    }
}