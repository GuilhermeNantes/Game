// src/CarPhysics.jsx
import { useRef } from "react";
import { useBox } from "@react-three/cannon";
import Car from "./Car.jsx";
export default function CarPhysics(props) {
  // Cria um box de colisão para o carro
  // Ajuste o tamanho para cobrir o carro
  const [ref] = useBox(() => ({
    mass: 1000, // peso do carro em kg
    position: [0, 0.5, 0], // altura inicial do carro
    args: [2, 0.5, 4], // largura, altura, comprimento da caixa de colisão
    ...props
  }));

  return (
    <group ref={ref}>
      <Car />
    </group>
  );
}
