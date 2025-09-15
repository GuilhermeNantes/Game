// src/Scene.tsx

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Box } from '@react-three/drei';
import { Mesh } from 'three';

const SpinningCube = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  return (
    <Box ref={meshRef} args={[1, 1, 1]} position={[0, 0.5, 0]}>
      <meshStandardMaterial attach="material" color="hotpink" />
    </Box>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* O GridHelper cria o chão quadriculado */}
      <Grid
        args={[10, 10]} // Tamanho do grid
        cellColor={"#6f6f6f"}
        sectionColor={"#9d4b4b"}
        cellThickness={0.5}
        sectionThickness={1}
      />

      {/* Cubo que gira */}
      <SpinningCube />

      {/* Adiciona OrbitControls para a câmera */}
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;