// src/components/CarPhysics.jsx
import { useRef, useEffect } from "react";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import CarModel from "./CarModel";

export default function CarPhysics() {
  const [ref, api] = useBox(() => ({
    mass: 1200,
    position: [0, 0.5, 0], // altura inicial segura
    args: [1.6, 0.8, 3.8],
    angularDamping: 0.8,
    linearDamping: 0.4,
    allowSleep: false,
  }));

  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  const rotation = useRef(0);
  const velocity = useRef(0);
  const pos = useRef([0, 0.5, 0]);

  // Controles
  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (k === "w") keys.current.forward = true;
      if (k === "s") keys.current.backward = true;
      if (k === "a") keys.current.left = true;
      if (k === "d") keys.current.right = true;

      if (k === "r") {
        api.position.set(0, 0.5, 0);
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);
        api.rotation.set(0, 0, 0);
        rotation.current = 0;
        velocity.current = 0;
      }
    };
    const up = (e) => {
      const k = e.key.toLowerCase();
      if (k === "w") keys.current.forward = false;
      if (k === "s") keys.current.backward = false;
      if (k === "a") keys.current.left = false;
      if (k === "d") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [api]);

  useFrame(() => {
    const accel = 400;
    const brake = 250;
    const maxSpeed = 22;
    const turnSpeed = 0.035;

    // Velocidade
    api.velocity.subscribe((v) => {
      velocity.current = Math.sqrt(v[0] ** 2 + v[2] ** 2);
    });

    // Movimento
    const forwardDir = new THREE.Vector3(Math.sin(rotation.current), 0, Math.cos(rotation.current)).normalize();

    if (keys.current.forward && velocity.current < maxSpeed) {
      api.applyForce([forwardDir.x * accel, 0, forwardDir.z * accel], [0, 0, 0]);
    }
    if (keys.current.backward && velocity.current < maxSpeed / 2) {
      api.applyForce([-forwardDir.x * brake, 0, -forwardDir.z * brake], [0, 0, 0]);
    }

    // Rotação
    if (Math.abs(velocity.current) > 0.5) {
      const turnFactor = turnSpeed * (velocity.current / maxSpeed);
      if (keys.current.left) rotation.current += turnFactor;
      if (keys.current.right) rotation.current -= turnFactor;
    }

    // Impede tombos
    api.angularVelocity.set(0, api.angularVelocity.y, 0);

    // Pega posição atual
    api.position.subscribe((p) => {
      pos.current = p;
    });
  });

  return (
    <>
      {/* Mesh invisível para física */}
      <mesh ref={ref} visible={false}>
        <boxGeometry args={[1.6, 0.8, 3.8]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Modelo do carro seguindo a física */}
      <group position={pos.current} rotation-y={rotation.current}>
        <CarModel scale={[0.7, 0.7, 0.7]} />
      </group>
    </>
  );
}
