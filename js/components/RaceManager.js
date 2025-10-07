// js/components/RaceManager.js

// Importa THREE do escopo global (window)
const THREE = window.THREE; 

// Configuração dos Checkpoints (Dados fixos)
const CHECKPOINTS = [
    { pos: new THREE.Vector3(22, -35, 197.00), name: "Largada/Chegada" }, 
    { pos: new THREE.Vector3(-181, -10, -101.81), name: "Ponto 1" }, 
    { pos: new THREE.Vector3(111, -15.93, -47.63), name: "Ponto 2" },  
];

export class RaceManager {
    constructor(scene) {
        this.scene = scene;
        this.currentCheckpointIndex = 0;
        this.checkpointTolerance = 20; 
        this.laps = 0;
        this.totalLaps = 3;
        this.raceStarted = false;
        this.checkpointsReachedInCurrentLap = 0;
        this.nextCheckpointMesh = null;
        this.lastCheckpointTime = Date.now();

        // Referências aos elementos do DOM
        this.logElement = document.getElementById('log');
        this.coordinateDisplay = document.getElementById('coordinate-display');
        
        // Inicializa o marcador
        this.updateCheckpointMarker();
    }

    createCheckpointMarker() {
        // Cria a "parede" vermelha que indica o checkpoint
        const geometry = new THREE.BoxGeometry(40, 10, 1); 
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.7 
        });
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    updateCheckpointMarker() {
        if (this.nextCheckpointMesh) {
            this.scene.remove(this.nextCheckpointMesh);
        }
        if (this.laps < this.totalLaps) {
            this.nextCheckpointMesh = this.createCheckpointMarker();
            const nextCp = CHECKPOINTS[this.currentCheckpointIndex];
            
            this.nextCheckpointMesh.position.copy(nextCp.pos);
            // Eleva o checkpoint acima do chão
            this.nextCheckpointMesh.position.add(new THREE.Vector3(0, 5.5, 0)); 
            
            // Rotaciona a linha de chegada para ficar perpendicular ao carro
            if (this.currentCheckpointIndex === 0) {
                 this.nextCheckpointMesh.rotation.y = Math.PI / 2; 
            }
            
            this.scene.add(this.nextCheckpointMesh);
        }
    }
    
    checkCheckpoint(carPosition) {
        if (this.laps >= this.totalLaps) return;

        const nextCheckpoint = CHECKPOINTS[this.currentCheckpointIndex];
        const totalIntermediateCheckpoints = CHECKPOINTS.length - 1;

        if (carPosition.distanceTo(nextCheckpoint.pos) < this.checkpointTolerance) {
            
            if (this.currentCheckpointIndex === 0) { // Linha de Chegada/Largada
                if (!this.raceStarted) {
                    this.raceStarted = true;
                    this.logElement.textContent = `🟢 CORRIDA INICIADA! Passe pelo Ponto 1.`;
                } else if (this.checkpointsReachedInCurrentLap === totalIntermediateCheckpoints) {
                    this.laps++;
                    
                    const lapTime = ((Date.now() - this.lastCheckpointTime) / 1000).toFixed(2);
                    
                    if (this.laps >= this.totalLaps) {
                        this.logElement.textContent = `🏆 CORRIDA FINALIZADA! Última Volta em ${lapTime}s`;
                    } else {
                        this.logElement.textContent = `✅ Volta ${this.laps}/${this.totalLaps} completada! Tempo: ${lapTime}s`;
                    }
                    this.checkpointsReachedInCurrentLap = 0; 
                } else {
                    // Impede o jogador de cruzar a linha de chegada antes de completar todos os checkpoints
                    const missing = totalIntermediateCheckpoints - this.checkpointsReachedInCurrentLap;
                    const nextCpName = CHECKPOINTS[this.currentCheckpointIndex + 1].name;
                    this.logElement.textContent = `🚫 FALTA ${missing} checkpoint(s) antes de cruzar a Linha! Próximo: ${nextCpName}`;
                    return; 
                }
            
            } else { // Checkpoints Intermediários
                this.checkpointsReachedInCurrentLap++; 
                const nextIndex = (this.currentCheckpointIndex + 1) % CHECKPOINTS.length;
                this.logElement.textContent = `Checkpoint "${nextCheckpoint.name}" atingido! Próximo: ${CHECKPOINTS[nextIndex].name}`;
            }

            // Avança para o PRÓXIMO checkpoint
            this.currentCheckpointIndex = (this.currentCheckpointIndex + 1) % CHECKPOINTS.length;
            this.updateCheckpointMarker();
            this.lastCheckpointTime = Date.now();
        }
    }

    updateCoordinateHUD(carPosition) {
        const pos = carPosition;
        let nextCpName = "Corrida Finalizada";
        if (this.laps < this.totalLaps) {
            nextCpName = CHECKPOINTS[this.currentCheckpointIndex].name;
        }
        this.coordinateDisplay.innerHTML = `Coordenadas:<br>X: ${pos.x.toFixed(2)}<br>Y: ${pos.y.toFixed(2)}<br>Z: ${pos.z.toFixed(2)}<br><br>Voltas: ${this.laps}/${this.totalLaps}<br>Próximo: ${nextCpName}`;
    }
}