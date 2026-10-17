"use client";

import { useMemo } from "react";
import { Edges, PivotControls, Text } from "@react-three/drei";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";

import { DoorConfig, RoomConfig } from "@/types/configurator";
import { getRequiredKw, pickIndoorUnit } from "@/utils/hvacEngine";
import {
  DEFAULT_DOOR,
  useConfiguratorStore,
} from "@/store/useConfiguratorStore";
import { IndoorUnit } from "@/components/canvas/IndoorUnit";

interface RoomBoxProps {
  room: RoomConfig;
}

function clampDoorOffset(
  offset: number,
  wallLengthMeters: number,
  doorWidthMeters: number,
): number {
  const maxOffset = Math.max(0, wallLengthMeters / 2 - doorWidthMeters / 2);

  return Math.min(Math.max(offset, -maxOffset), maxOffset);
}

function RoomDoor({
  door,
  lengthM,
  widthM,
  heightM,
}: {
  door: DoorConfig;
  lengthM: number;
  widthM: number;
  heightM: number;
}) {
  const doorHeight = Math.min(2, heightM - 0.15);
  const wallLength =
    door.wall === "front" || door.wall === "back" ? lengthM : widthM;
  const offset = clampDoorOffset(
    door.offsetMeters,
    wallLength,
    door.widthMeters,
  );
  const panelColor = "#f97316";
  const frameColor = "#7c2d12";

  const doorProps = (() => {
    switch (door.wall) {
      case "back":
        return {
          position: [offset, doorHeight / 2, -widthM / 2 - 0.035] as [
            number,
            number,
            number,
          ],
          args: [door.widthMeters, doorHeight, 0.06] as [
            number,
            number,
            number,
          ],
        };
      case "left":
        return {
          position: [-lengthM / 2 - 0.035, doorHeight / 2, offset] as [
            number,
            number,
            number,
          ],
          args: [0.06, doorHeight, door.widthMeters] as [
            number,
            number,
            number,
          ],
        };
      case "right":
        return {
          position: [lengthM / 2 + 0.035, doorHeight / 2, offset] as [
            number,
            number,
            number,
          ],
          args: [0.06, doorHeight, door.widthMeters] as [
            number,
            number,
            number,
          ],
        };
      case "front":
      default:
        return {
          position: [offset, doorHeight / 2, widthM / 2 + 0.035] as [
            number,
            number,
            number,
          ],
          args: [door.widthMeters, doorHeight, 0.06] as [
            number,
            number,
            number,
          ],
        };
    }
  })();

  return (
    <group>
      <mesh position={doorProps.position}>
        <boxGeometry args={doorProps.args} />
        <meshStandardMaterial
          color={panelColor}
          transparent
          opacity={0.82}
          roughness={0.45}
        />
        <Edges color={frameColor} threshold={15} lineWidth={2} />
      </mesh>
      <Text
        position={[
          doorProps.position[0],
          doorHeight + 0.18,
          doorProps.position[2],
        ]}
        fontSize={0.13}
        color={frameColor}
        anchorX="center"
        anchorY="middle"
      >
        Door
      </Text>
    </group>
  );
}

export function RoomBox({ room }: RoomBoxProps) {
  const { selectedRoomId, selectRoom, updateRoomPosition, catalog } =
    useConfiguratorStore();
  const isSelected = selectedRoomId === room.id;

  const lengthM = room.dimensions.length / 100;
  const widthM = room.dimensions.width / 100;
  const heightM = room.dimensions.height / 100;
  const kw = getRequiredKw(room);
  const indoorUnit = pickIndoorUnit(kw, catalog);
  const door = room.door ?? DEFAULT_DOOR;
  const matrix = useMemo(
    () =>
      new Matrix4().compose(
        new Vector3(...room.position),
        new Quaternion(),
        new Vector3(1, 1, 1),
      ),
    [room.position],
  );

  return (
    <PivotControls
      visible={isSelected}
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
        updateRoomPosition(room.id, [position.x, room.position[1], position.z]);
      }}
    >
      <group
        onClick={(event) => {
          event.stopPropagation();
          selectRoom(room.id);
        }}
      >
        <mesh position={[0, heightM / 2, 0]}>
          <boxGeometry args={[lengthM, heightM, widthM]} />
          <meshStandardMaterial
            color={isSelected ? "#3b82f6" : "#94a3b8"}
            transparent
            opacity={0.35}
            roughness={0.1}
          />
          <Edges
            color={isSelected ? "#1d4ed8" : "#334155"}
            threshold={15}
            lineWidth={2}
          />
        </mesh>

        <mesh position={[0, 0.01, 0]} rotation={new Euler(-Math.PI / 2, 0, 0)}>
          <planeGeometry args={[lengthM, widthM]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>

        <group position={[0, heightM - 0.25, -widthM / 2 + 0.12]}>
          <IndoorUnit coolingCapacityKw={indoorUnit.coolingCapacityKw} />
        </group>

        <RoomDoor
          door={door}
          lengthM={lengthM}
          widthM={widthM}
          heightM={heightM}
        />

        <Text
          position={[0, heightM + 0.3, 0]}
          fontSize={0.25}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
        >
          {`${room.name} · Floor ${Math.round(room.position[1] / 3.2)} (${(lengthM * widthM).toFixed(1)}m²)`}
        </Text>
      </group>
    </PivotControls>
  );
}
