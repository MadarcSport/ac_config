"use client";

import { useMemo } from "react";
import { Edges, PivotControls, Text } from "@react-three/drei";
import { Matrix4, Quaternion, Vector3 } from "three";

import { useConfiguratorStore } from "@/store/useConfiguratorStore";

export function OutdoorUnit() {
  const { outdoorUnit, updateOutdoorPosition, quote } = useConfiguratorStore();
  const matrix = useMemo(
    () =>
      new Matrix4().compose(
        new Vector3(...outdoorUnit.position),
        new Quaternion(),
        new Vector3(1, 1, 1),
      ),
    [outdoorUnit.position],
  );

  return (
    <PivotControls
      activeAxes={[true, false, true]}
      disableRotations
      disableScaling
      depthTest={false}
      lineWidth={3}
      matrix={matrix}
      autoTransform={false}
      anchor={[0, -1, 0]}
      onDrag={(localMatrix) => {
        const position = new Vector3();
        localMatrix.decompose(position, new Quaternion(), new Vector3());
        updateOutdoorPosition([position.x, 0, position.z]);
      }}
    >
      <group>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.95, 0.75, 0.4]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.4}
            roughness={0.5}
          />
          <Edges color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.45, 0.23]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <Text
          position={[0, 1.0, 0]}
          fontSize={0.2}
          color="#0f172a"
          anchorX="center"
        >
          {quote.assignedOutdoorUnit?.name ?? "Outdoor Compressor"}
        </Text>
      </group>
    </PivotControls>
  );
}
