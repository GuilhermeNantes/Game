// src/Car.tsx

import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, Cylinder, Grid } from "@react-three/drei";
import * as THREE from "three";
import * as CANNON from "cannon-es";

const Car = () => {
  const worldRef = useRef<CANNON.World | null>(null);
  const chassisMeshRef = useRef<THREE.Mesh>(null);
  const wheelMeshRefs = useRef<THREE.Mesh[]>([]);
  const chassisBodyRef = useRef<CANNON.Body | null>(null);
  const wheelBodiesRef = useRef<CANNON.Body[]>([]);
  const keys = useRef({ w: false, s: false, a: false, d: false });

  // === 1. CONFIGURAÇÃO DA FÍSICA ===
  useEffect(() => {
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    worldRef.current = world;

    const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // Chassis Body
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
    const chassisBody = new CANNON.Body({ mass: 150, angularDamping: 0.95 });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 1, 0);
    world.addBody(chassisBody);
    chassisBodyRef.current = chassisBody;

    // Wheel Bodies
    const wheelShape = new CANNON.Cylinder(0.5, 0.5, 0.4, 32);
    const wheelQuaternion = new CANNON.Quaternion().setFromEuler(0, 0, -Math.PI / 2);

    const wheelPositions = [
      new CANNON.Vec3(-1, 0.5, 1.7), // Front Left
      new CANNON.Vec3(1, 0.5, 1.7),  // Front Right
      new CANNON.Vec3(-1, 0.5, -1.7), // Rear Left
      new CANNON.Vec3(1, 0.5, -1.7),  // Rear Right
    ];
    
    wheelBodiesRef.current = wheelPositions.map((pos) => {
      const wheelBody = new CANNON.Body({ mass: 10, angularDamping: 0.5 });
      wheelBody.addShape(wheelShape, new CANNON.Vec3(), wheelQuaternion);
      wheelBody.position.set(chassisBody.position.x + pos.x, chassisBody.position.y + pos.y, chassisBody.position.z + pos.z);
      world.addBody(wheelBody);
      return wheelBody;
    });

    // Constraints to connect wheels to chassis
    const axleAxis = new CANNON.Vec3(0, 0, 1);
    const wheelAxis = new CANNON.Vec3(1, 0, 0);
    
    const constraints = wheelBodiesRef.current.map((wheel, i) => {
      const chassisConnectionPoint = wheelPositions[i];
      const constraint = new CANNON.HingeConstraint(chassisBody, wheel, {
        pivotA: new CANNON.Vec3(chassisConnectionPoint.x, -0.5, chassisConnectionPoint.z),
        axisA: wheelAxis,
        pivotB: new CANNON.Vec3(0, 0, 0),
        axisB: wheelAxis,
      });
      world.addConstraint(constraint);
      return constraint;
    });

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase() as "w"|"s"|"a"|"d"] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase() as "w"|"s"|"a"|"d"] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      world.removeBody(chassisBody);
      wheelBodiesRef.current.forEach((wheel) => world.removeBody(wheel));
    };
  }, []);

  // === 2. LOOP DE ANIMAÇÃO E SINCRONIZAÇÃO ===
  useFrame(() => {
    if (!worldRef.current || !chassisBodyRef.current) return;
    worldRef.current.fixedStep();

    const maxForce = 2000;
    const maxSteer = Math.PI / 8;
    
    // Applying forces
    const chassisBody = chassisBodyRef.current;
    if (keys.current.w) {
      chassisBody.applyForce(new CANNON.Vec3(0, 0, maxForce), new CANNON.Vec3(0, 0, 0));
    }
    if (keys.current.s) {
      chassisBody.applyForce(new CANNON.Vec3(0, 0, -maxForce), new CANNON.Vec3(0, 0, 0));
    }

    // Sincroniza a posição da carroceria
    if (chassisMeshRef.current) {
      chassisMeshRef.current.position.copy(chassisBody.position);
      chassisMeshRef.current.quaternion.copy(chassisBody.quaternion);
    }
    
    // Sincroniza a posição das rodas
    wheelBodiesRef.current.forEach((wheelBody, i) => {
      if (wheelMeshRefs.current[i]) {
        wheelMeshRefs.current[i].position.copy(wheelBody.position);
        wheelMeshRefs.current[i].quaternion.copy(wheelBody.quaternion);
      }
    });
  });

  return (
    <>
      <Grid args={[100, 100]} />
      
      {/* Carroceria visual */}
      <mesh ref={chassisMeshRef}>
        <Box args={[2, 1, 4]}>
          <meshStandardMaterial color="blue" />
        </Box>
        <Box args={[2, 1, 2]} position={[0, 0.3, 0.1]}>
          <meshStandardMaterial color="blue" />
        </Box>
      </mesh>

      {/* Rodas visuais */}
      <group>
        {[...Array(4)].map((_, i) => (
          <mesh key={i} ref={(el) => (wheelMeshRefs.current[i] = el!)}>
            <Cylinder 
              args={[0.5, 0.5, 0.4, 32]}
              // LINHA CORRIGIDA: Rotação para a roda ficar de pé
              rotation={[0, 0, Math.PI / 2]}
            >
              <meshStandardMaterial color="black" />
            </Cylinder>
          </mesh>
        ))}
      </group>
    </>
  );
};

export default Car;