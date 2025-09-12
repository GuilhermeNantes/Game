// src/components/Ground.jsx
import { useBox } from "@react-three/cannon";

export default function Ground() {
  const [ref] = useBox(() => ({
    args: [100, 1, 100],
    position: [0, -0.5, 0],
    type: "Static",
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[100, 1, 100]} />
      <meshStandardMaterial color="#3a6b35" roughness={0.8} />
    </mesh>
  );
}