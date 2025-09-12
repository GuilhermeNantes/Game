// src/components/CarModel.jsx
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

export default function CarModel() {
  const { scene } = useGLTF("/src/assets/models/car.glb");

  useEffect(() => {
    // Escala, posição e rotação base
    scene.scale.set(0.7, 0.7, 0.7);
    scene.position.set(0, -0.6, 0); // ajusta para o carro não flutuar
    scene.rotation.y = -Math.PI / 2; // frente no eixo Z+

    // Ativa sombras
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}
