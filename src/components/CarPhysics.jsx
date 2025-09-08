// src/components/CarPhysics.jsx
import { useRef } from "react";
import { useBox } from "@react-three/cannon";
import { useGLTF } from "@react-three/drei";

export default function CarPhysics() {
  const carRef = useRef();

  // Corpo físico
  const [carBody] = useBox(() => ({
    mass: 1500,
    position: [0, 0.5, 0], // levanta o carro para não atravessar o chão
    args: [2, 1, 4],
  }));

  const { scene } = useGLTF("/src/assets/models/car.glb");

  return (
    <group ref={carBody}>
      <primitive object={scene} position={[0, 0, 0]} />
    </group>
  );
}
