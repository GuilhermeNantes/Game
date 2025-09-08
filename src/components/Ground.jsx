import { useBox } from "@react-three/cannon";

export default function Ground() {
  const [ref] = useBox(() => ({
    args: [100, 1, 100],  // tamanho do chão
    position: [0, -0.5, 0],
    type: "Static",       // chão não se move
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[100, 1, 100]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}
