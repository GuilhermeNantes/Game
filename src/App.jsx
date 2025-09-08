import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import CarPhysics from "./components/CarPhysics";
import Ground from "./components/Ground";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <OrbitControls />
        <Environment preset="sunset" />

        <Physics gravity={[0, -9.81, 0]}>
          <Ground />
          <CarPhysics />
        </Physics>
      </Canvas>
    </div>
  );
}
