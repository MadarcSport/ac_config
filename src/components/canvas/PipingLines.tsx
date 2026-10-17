"use client";

import { Line } from "@react-three/drei";

import { useConfiguratorStore } from "@/store/useConfiguratorStore";

export function PipingLines() {
  const { rooms, outdoorUnit } = useConfiguratorStore();

  return (
    <group>
      {rooms.map((room) => {
        const heightM = room.dimensions.height / 100;
        const widthM = room.dimensions.width / 100;
        const start: [number, number, number] = outdoorUnit.position;
        const end: [number, number, number] = [
          room.position[0],
          room.position[1] + heightM - 0.25,
          room.position[2] - widthM / 2 + 0.12,
        ];

        return (
          <Line
            key={room.id}
            points={[
              start,
              [start[0], 0.05, start[2]],
              [end[0], 0.05, end[2]],
              end,
            ]}
            color="#ef4444"
            lineWidth={2.5}
            dashed
            dashScale={5}
          />
        );
      })}
    </group>
  );
}
