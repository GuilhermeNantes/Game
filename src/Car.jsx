// src/components/CarPhysics.jsx
import { useRef, useEffect } from "react";
import { useBox } from "@react-three/cannon";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function CarPhysics() {
  const { scene } = useGLTF("/src/assets/models/car.glb");
  const [ref, api] = useBox(() => ({
    mass: 1500,
    position: [0, 0.5, 0], // levanta o carro do chão
    args: [2, 1, 4],
    angularDamping: 0.5,
  }));

  const keys = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    const down = (e) => {
      if (e.key === "w") keys.current.forward = true;
      if (e.key === "s") keys.current.backward = true;
      if (e.key === "a") keys.current.left = true;
      if (e.key === "d") keys.current.right = true;
    };
    const up = (e) => {
      if (e.key === "w") keys.current.forward = false;
      if (e.key === "s") keys.current.backward = false;
      if (e.key === "a") keys.current.left = false;
      if (e.key === "d") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(() => {
    // pegar velocidade atual
    api.velocity.subscribe((v) => (v[1] = 0)); // impede o carro de cair infinitamente
    api.angularVelocity.subscribe((v) => (v[0] = 0, v[2] = 0));

    let speed = 0;
    if (keys.current.forward) speed = -5;
    if (keys.current.backward) speed = 2;

    let turn = 0;
    if (keys.current.left) turn = 0.03;
    if (keys.current.right) turn = -0.03;

    // aplica velocidade e rotação
    api.velocity.set(0, 0, speed);
    api.angularVelocity.set(0, turn, 0);
  });

  return (
    <mesh ref={ref}>
      <primitive object={scene} position={[0, 0, 0]} />
    </mesh>
  );
}
