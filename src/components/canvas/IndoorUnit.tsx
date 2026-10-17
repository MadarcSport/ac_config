"use client";

import { Edges, Text } from "@react-three/drei";

interface IndoorUnitProps {
  coolingCapacityKw: number;
}

export function IndoorUnit({ coolingCapacityKw }: IndoorUnitProps) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.8, 0.28, 0.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        <Edges color="#64748b" />
      </mesh>
      <Text
        position={[0, 0.25, 0]}
        fontSize={0.12}
        color="#0f172a"
        anchorX="center"
      >
        {`${coolingCapacityKw} kW Split`}
      </Text>
    </group>
  );
}
