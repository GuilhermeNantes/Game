// js/main.js

// O caminho './components/...' indica que o navegador deve procurar
// dentro da pasta 'components' que está no mesmo nível que 'main.js'.
import { CarController } from './components/CarController.js'; 
import { RaceManager } from './components/RaceManager.js';

// NOTA: O THREE É AUTOMATICAMENTE USADO POIS NÃO ESTÁ EM CLASSE/MÓDULO ISOLADO AQUI.
// Se precisar referenciar THREE.js dentro das classes, use `const THREE = window.THREE;` (como fizemos acima).

// Variáveis globais de cena e input
const logElement = document.getElementById('log');
const hudElement = document.getElementById('hud');
const keyboard = {}; // Objeto que armazena o estado das teclas (e botões mobile)

// Configuração da Cena (THREE.js)
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color(0x87ceeb);

// Configuração das Luzes
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(20, 30, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

// Configuração da Câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraTarget = new THREE.Vector3();
const cameraOffset = new THREE.Vector3(0, 3.5, -7);

// Instâncias de Gerenciamento
let carMesh = null;
let trackMesh = null;
let carController = null;
let raceManager = new RaceManager(scene); // Instancia o RaceManager

const START_Y_LEVEL = 35.30;
const startPosition = new THREE.Vector3(45.01, START_Y_LEVEL, 197.00); 
const startRotationY = -Math.PI / 2;
let wheels = {}; 

// ----------------------------------------------------
// INPUT E RAYCASTING (INCLUINDO LÓGICA MOBILE)
// ----------------------------------------------------

// 1. Ouvintes de Eventos de Teclado (Desktop)
document.addEventListener('keydown', (e) => keyboard[e.key] = true);
document.addEventListener('keyup', (e) => keyboard[e.key] = false);

// 2. Mapeamento e Lógica de Controles Mobile
const mobileControls = {
    'btn-up': 'ArrowUp',
    'btn-down': 'ArrowDown',
    'btn-left': 'ArrowLeft',
    'btn-right': 'ArrowRight',
    'btn-drift': ' ', // Espaço é o drift/freio de mão
};

function handleControlStart(controlId) {
    const key = mobileControls[controlId];
    if (key) {
        keyboard[key] = true;
    }
}

function handleControlEnd(controlId) {
    const key = mobileControls[controlId];
    if (key) {
        keyboard[key] = false;
    }
}

// 3. Adiciona ouvintes para os Botões Mobile
document.addEventListener('DOMContentLoaded', () => {
    Object.keys(mobileControls).forEach(controlId => {
        const button = document.getElementById(controlId);
        if (button) {
            // Touch Events (Mobile)
            button.addEventListener('touchstart', (e) => {
                e.preventDefault(); 
                handleControlStart(controlId);
            }, { passive: false }); // Usamos passive: false para o preventDefault
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleControlEnd(controlId);
            }, { passive: false });
            
            // Mouse Events (Desktop Teste)
            button.addEventListener('mousedown', () => handleControlStart(controlId));
            button.addEventListener('mouseup', () => handleControlEnd(controlId));
            button.addEventListener('mouseleave', () => handleControlEnd(controlId)); 
        }
    });
});


const raycaster = new THREE.Raycaster();
const downwardVector = new THREE.Vector3(0, -1, 0);

// Loaders
const loader = new THREE.GLTFLoader();
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
loader.setDRACOLoader(dracoLoader);

// Função auxiliar
function setupShadows(object) {
    object.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

// ----------------------------------------------------
// Função de Carregamento Assíncrono
// ----------------------------------------------------

function loadCar() {
    loader.load(
        'assets/models/1967_shelby_gt500.glb', // Caminho corrigido
        function(carGltf) {
            carMesh = carGltf.scene;
            setupShadows(carMesh);
            carMesh.scale.set(0.75, 0.75, 0.75);
            scene.add(carMesh);
            
            carMesh.position.copy(startPosition);
            carMesh.rotation.y = startRotationY;

            // Mapeia as rodas
            carMesh.traverse((child) => {
                if (child.name.includes("wheel")) {
                    if (child.name.includes("front_left")) wheels.frontLeft = child;
                    if (child.name.includes("front_right")) wheels.frontRight = child;
                    if (child.name.includes("rear_left")) wheels.rearLeft = child;
                    if (child.name.includes("rear_right")) wheels.rearRight = child;
                }
            });

            // INSTANCIA O CONTROLADOR DEPOIS DE TUDO CARREGADO
            carController = new CarController(carMesh, wheels); 
            logElement.textContent = 'Carro carregado. Comece a correr!';
        },
        (xhr) => { logElement.textContent = `Carregando carro: ${ (xhr.loaded / xhr.total * 100).toFixed(0) }%`; },
        (error) => { console.error('Erro ao carregar o modelo do carro:', error); }
    );
}

// Carrega a pista primeiro
loader.load(
    'assets/models/cartoon_race_track_spielberg.glb', // Caminho corrigido
    function(gltf) {
        trackMesh = gltf.scene;
        setupShadows(trackMesh);
        
        // CORREÇÃO: CENTRALIZA O MODELO DA PISTA NO CENTRO DA CENA (0, 0, 0)
        const box = new THREE.Box3().setFromObject(trackMesh);
        const center = box.getCenter(new THREE.Vector3());
        trackMesh.position.sub(center); 
        // A partir daqui, (0, 0, 0) é o centro geométrico da pista.
        
        scene.add(trackMesh);
        logElement.textContent = 'Pista carregada.';
        loadCar(); // Carrega o carro após a pista
    },
    (xhr) => { logElement.textContent = `Carregando pista: ${ (xhr.loaded / xhr.total * 100).toFixed(0) }%`; },
    (error) => { console.error('Erro ao carregar o modelo da pista:', error); }
);
// ----------------------------------------------------
// O LOOP PRINCIPAL (Game Loop)
// ----------------------------------------------------

function animate() {
    requestAnimationFrame(animate);

    if (carMesh && carController && trackMesh) {
        
        // 1. ATUALIZA FÍSICA E MOVIMENTO (CarController)
        carController.update(keyboard);
        
        // 2. VERIFICA COLISÃO COM O CHÃO (Raycasting)
        raycaster.set(carMesh.position, downwardVector);
        const intersects = raycaster.intersectObjects(trackMesh.children, true);
        if (intersects.length > 0) {
            const firstHit = intersects[0];
            // CORRIGIDO: Usa new THREE.Box3, garantido que THREE está acessível
            const carHeight = new THREE.Box3().setFromObject(carMesh).getSize(new THREE.Vector3()).y;
            carMesh.position.y = firstHit.point.y + carHeight / 2;
        } else {
            // Se cair da pista, aplica gravidade
            carMesh.position.y -= 0.1;
        }
        
        // 3. ATUALIZA LÓGICA DE CORRIDA (RaceManager)
        raceManager.checkCheckpoint(carMesh.position);
        
        // 4. ATUALIZA CÂMERA
        cameraTarget.copy(carMesh.position);
        const rotatedCameraOffset = cameraOffset.clone().applyQuaternion(carMesh.quaternion);
        const currentSpeed = carController.velocity.length();
        const cameraShake = new THREE.Vector3(
             Math.sin(Date.now() * 0.005) * currentSpeed * 0.2,
             Math.cos(Date.now() * 0.005) * currentSpeed * 0.1,
             0
        );
        const newCameraPosition = carMesh.position.clone().add(rotatedCameraOffset).add(cameraShake);
        camera.position.lerp(newCameraPosition, 0.1);
        camera.lookAt(cameraTarget);
        
        // 5. ATUALIZA HUD (Velocidade e Status)
        const speedKmh = Math.floor(currentSpeed * 180);
        const steeringDeg = Math.floor(carController.steeringInput * (180 / Math.PI));
        hudElement.innerHTML = `Velocidade: ${speedKmh} km/h<br>Ângulo: ${steeringDeg}°`;
        
        raceManager.updateCoordinateHUD(carMesh.position);
    }

    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});