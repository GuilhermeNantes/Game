// src/App.jsx
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { OrbitControls, Sky, Text } from "@react-three/drei";
import Ground from "./components/Ground";
import CarPhysics from "./components/CarPhysics";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <Sky sunPosition={[10, 10, 5]} />
        
        <Physics gravity={[0, -9.81, 0]}>
          <Ground />
          <CarPhysics />
        </Physics>
        
        <OrbitControls />
        
        {/* Indicadores de direção */}
        <Text position={[0, 0, 5]} color="blue" fontSize={1}>
          ↑ Frente (Z+)
        </Text>
        <Text position={[5, 0, 0]} color="red" fontSize={1}>
          → Direita (X+)
        </Text>
        <Text position={[-5, 0, 0]} color="green" fontSize={1}>
          ← Esquerda (X-)
        </Text>
        <Text position={[0, 0, -5]} color="orange" fontSize={1}>
          ↓ Trás (Z-)
        </Text>
      </Canvas>
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Controles:</div>
        <div>W - Mover para frente (Z+)</div>
        <div>S - Mover para trás (Z-)</div>
        <div>A - Virar para esquerda</div>
        <div>D - Virar para direita</div>
        <div>O carro foi girado 90° para ficar virado para Z+</div>
      </div>
    </div>
  );
}