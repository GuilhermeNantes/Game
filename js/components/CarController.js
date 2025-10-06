// js/components/CarController.js

export class CarController {
    constructor(carMesh, wheels, velocity = new THREE.Vector3()) {
        this.carMesh = carMesh;
        this.wheels = wheels;
        this.velocity = velocity;
        this.steeringInput = 0;
        
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


    update(keyboard) {
        const isHandbraking = keyboard[' '];
        const currentSpeed = this.velocity.length();
        
        // 1. Aceleração / Freio
        if (keyboard['ArrowUp']) {
            if (currentSpeed < this.maxSpeed) {
                this.velocity.add(new THREE.Vector3(0, 0, this.accelerationRate).applyQuaternion(this.carMesh.quaternion));
            }
        } else if (keyboard['ArrowDown']) {
            this.velocity.sub(new THREE.Vector3(0, 0, this.brakingRate).applyQuaternion(this.carMesh.quaternion));
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

        // 3. Lógica de Drift e Tração
        const forwardVector = new THREE.Vector3(0, 0, 1).applyQuaternion(this.carMesh.quaternion);
        const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(this.carMesh.quaternion);
        const sideVelocity = rightVector.multiplyScalar(this.velocity.dot(rightVector));
        const forwardVelocity = forwardVector.multiplyScalar(this.velocity.dot(forwardVector));

        let currentTraction = this.traction;
        let currentDrag = this.drag;
        if (isHandbraking && currentSpeed > 0.1) {
            currentTraction = this.driftTractionFactor;
            currentDrag = this.driftDrag;
        }

        // Aplica tração (para frente) e arrasto (lateral)
        this.velocity = forwardVelocity.multiplyScalar(currentTraction).add(sideVelocity.multiplyScalar(1 - currentTraction));
        this.velocity.multiplyScalar(currentDrag);

        // 4. Rotação do Carro e Suspensão Visual
        const rotationAngle = (this.steeringInput * this.velocity.length() * (isHandbraking ? 1.5 : 1));
        this.carMesh.rotation.y += rotationAngle;
        
        const tiltFactor = this.velocity.length() * 0.5;
        const targetTiltZ = -this.steeringInput * tiltFactor;
        this.carMesh.rotation.z += (targetTiltZ - this.carMesh.rotation.z) * 0.1;

        // 5. Aplica o movimento final
        this.carMesh.position.add(this.velocity);

        // 6. Rotação e Direção das Rodas
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