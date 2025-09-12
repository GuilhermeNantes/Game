// src/components/CarDebug.jsx
import { useRef, useEffect, useState } from "react";
import { useBox } from "@react-three/cannon";
import { useGLTF, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CarDebug() {
  const { scene } = useGLTF("/src/assets/models/car.glb");
  const [ref, api] = useBox(() => ({
    mass: 1500,
    position: [0, 1, 0],
    args: [2, 1, 4],
  }));

  const [showDebug, setShowDebug] = useState(true);
  const rotation = useRef(0);

  useEffect(() => {
    // Configurar o modelo
    scene.scale.set(0.8, 0.8, 0.8);
    scene.position.set(0, -0.5, 0);
    
    // Adicionar tecla para toggle do debug
    const handleKeyPress = (e) => {
      if (e.key === "h" || e.key === "H") setShowDebug(!showDebug);
    };
    window.addEventListener("keydown", handleKeyPress);
    
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showDebug, scene]);

  useFrame(() => {
    // Rotação contínua para debug visual
    rotation.current += 0.01;
    api.rotation.set(0, rotation.current, 0);
    
    // Atualizar rotação visual do modelo
    if (ref.current) {
      ref.current.rotation.y = rotation.current;
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <primitive object={scene} />
      </mesh>
      
      {showDebug && (
        <>
          {/* Eixos de orientação */}
          <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 2, 0xff0000]} />
          <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2, 0x00ff00]} />
          <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 2, 0x0000ff]} />
          
          {/* Texto de orientação */}
          <Text position={[0, 2, 0]} color="white" fontSize={0.5}>
            Frente (Z+)
          </Text>
          <Text position={[2, 0, 0]} color="red" fontSize={0.5}>
            Direita (X+)
          </Text>
          <Text position={[0, 0, 2]} color="blue" fontSize={0.5}>
            Frente Real (Z+)
          </Text>
          
          {/* Grade de referência */}
          <gridHelper args={[10, 10]} />
        </>
      )}
    </group>
  );
}