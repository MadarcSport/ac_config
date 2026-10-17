"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, Text } from "@react-three/drei";

import { OutdoorUnit } from "@/components/canvas/OutdoorUnit";
import { PipingLines } from "@/components/canvas/PipingLines";
import { RoomBox } from "@/components/canvas/RoomBox";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";
import { FloorConfig, RoomConfig } from "@/types/configurator";

interface FloorFootprint {
  center: [number, number];
  size: [number, number];
}

const DEFAULT_FLOOR_FOOTPRINT: FloorFootprint = {
  center: [0, 0],
  size: [6, 5],
};

function getRoomsFootprint(rooms: RoomConfig[]): FloorFootprint | null {
  if (rooms.length === 0) {
    return null;
  }

  const bounds = rooms.reduce(
    (accumulator, room) => {
      const lengthM = room.dimensions.length / 100;
      const widthM = room.dimensions.width / 100;
      const [x, , z] = room.position;

      return {
        minX: Math.min(accumulator.minX, x - lengthM / 2),
        maxX: Math.max(accumulator.maxX, x + lengthM / 2),
        minZ: Math.min(accumulator.minZ, z - widthM / 2),
        maxZ: Math.max(accumulator.maxZ, z + widthM / 2),
      };
    },
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minZ: Number.POSITIVE_INFINITY,
      maxZ: Number.NEGATIVE_INFINITY,
    },
  );

  const margin = 0.6;
  const width = Math.max(2, bounds.maxX - bounds.minX + margin * 2);
  const depth = Math.max(2, bounds.maxZ - bounds.minZ + margin * 2);

  return {
    center: [(bounds.minX + bounds.maxX) / 2, (bounds.minZ + bounds.maxZ) / 2],
    size: [width, depth],
  };
}

function getFloorFootprints(
  floors: FloorConfig[],
  rooms: RoomConfig[],
): Record<string, FloorFootprint> {
  const sortedFloors = [...floors].sort((a, b) => a.level - b.level);

  return sortedFloors.reduce<Record<string, FloorFootprint>>(
    (footprints, floor, index) => {
      const previousFloor = sortedFloors[index - 1];
      const previousRooms = previousFloor
        ? rooms.filter((room) => room.floorId === previousFloor.id)
        : [];
      const currentRooms = rooms.filter((room) => room.floorId === floor.id);

      footprints[floor.id] =
        (previousFloor ? getRoomsFootprint(previousRooms) : null) ??
        getRoomsFootprint(currentRooms) ??
        (previousFloor ? footprints[previousFloor.id] : null) ??
        DEFAULT_FLOOR_FOOTPRINT;

      return footprints;
    },
    {},
  );
}

function FloorPlate({
  floor,
  footprint,
  selected,
}: {
  floor: FloorConfig;
  footprint: FloorFootprint;
  selected: boolean;
}) {
  const [centerX, centerZ] = footprint.center;
  const [width, depth] = footprint.size;

  return (
    <group position={[0, floor.elevation, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerX, -0.02, centerZ]}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={selected ? "#bfdbfe" : "#e2e8f0"}
          transparent
          opacity={floor.level === 0 ? 0.28 : 0.18}
          roughness={0.9}
        />
      </mesh>
      <Text
        position={[
          centerX - width / 2 + 0.25,
          0.08,
          centerZ - depth / 2 + 0.25,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.38}
        color={selected ? "#1d4ed8" : "#64748b"}
        anchorX="left"
      >
        {`${floor.name} (${floor.elevation.toFixed(1)}m)`}
      </Text>
    </group>
  );
}

export function Scene() {
  const { floors, rooms, selectedFloorId, selectRoom } = useConfiguratorStore();
  const floorFootprints = useMemo(
    () => getFloorFootprints(floors, rooms),
    [floors, rooms],
  );

  return (
    <Canvas
      camera={{ position: [10, 12, 14], fov: 45 }}
      onPointerMissed={() => selectRoom(null)}
      className="h-full w-full bg-slate-100"
    >
      <color attach="background" args={["#e2e8f0"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[15, 20, 10]} intensity={1.2} castShadow />
      <OrbitControls makeDefault dampingFactor={0.05} />
      <Grid
        infiniteGrid
        cellSize={1}
        sectionSize={5}
        cellColor="#94a3b8"
        sectionColor="#64748b"
        fadeDistance={35}
      />

      {floors.map((floor) => (
        <FloorPlate
          key={floor.id}
          floor={floor}
          footprint={floorFootprints[floor.id] ?? DEFAULT_FLOOR_FOOTPRINT}
          selected={selectedFloorId === floor.id}
        />
      ))}

      {rooms.map((room) => (
        <RoomBox key={room.id} room={room} />
      ))}

      <OutdoorUnit />
      <PipingLines />
    </Canvas>
  );
}
