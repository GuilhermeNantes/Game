// src/App.tsx

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import Car from './Car';
import './App.css'; // Mantenha o CSS para a tela cheia

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <Grid args={[15, 15]} />
        
        <Car />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;