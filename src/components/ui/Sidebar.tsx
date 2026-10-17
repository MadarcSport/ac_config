"use client";

import { FormEvent, useState } from "react";
import { Download, Layers, Plus, Trash2 } from "lucide-react";

import { AdminPricingModal } from "@/components/ui/AdminPricingModal";
import { PricingSummary } from "@/components/ui/PricingSummary";
import {
  DEFAULT_DOOR,
  useConfiguratorStore,
} from "@/store/useConfiguratorStore";
import { DoorConfig, DoorWall, RoomConfig } from "@/types/configurator";
import { getRequiredKw, pickIndoorUnit } from "@/utils/hvacEngine";

const ROOM_LIMITS = {
  length: { min: 150, max: 1500 },
  width: { min: 150, max: 1500 },
  height: { min: 200, max: 500 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getDoorWallLength(room: RoomConfig, wall: DoorWall): number {
  return wall === "front" || wall === "back"
    ? room.dimensions.length / 100
    : room.dimensions.width / 100;
}

function getDoorOffsetLimit(room: RoomConfig, door: DoorConfig): number {
  const wallLength = getDoorWallLength(room, door.wall);

  return Math.max(0, wallLength / 2 - door.widthMeters / 2);
}

export function Sidebar() {
  const {
    floors,
    rooms,
    selectedFloorId,
    addFloor,
    selectFloor,
    addRoom,
    updateRoomDoor,
    removeRoom,
    selectedRoomId,
    selectRoom,
    quote,
    exportProjectJson,
    catalog,
  } = useConfiguratorStore();
  const [name, setName] = useState("");
  const [length, setLength] = useState(400);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(250);
  const selectedFloor =
    floors.find((floor) => floor.id === selectedFloorId) ?? floors[0];
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
  const selectedRoomDoor = selectedRoom?.door ?? DEFAULT_DOOR;
  const doorOffsetLimit = selectedRoom
    ? getDoorOffsetLimit(selectedRoom, selectedRoomDoor)
    : 0;

  const handleDoorChange = (door: DoorConfig) => {
    if (!selectedRoom) {
      return;
    }

    const offsetLimit = getDoorOffsetLimit(selectedRoom, door);

    updateRoomDoor(selectedRoom.id, {
      ...door,
      offsetMeters: clamp(door.offsetMeters, -offsetLimit, offsetLimit),
    });
  };

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    addRoom(name.trim(), {
      length: clamp(
        Number(length),
        ROOM_LIMITS.length.min,
        ROOM_LIMITS.length.max,
      ),
      width: clamp(Number(width), ROOM_LIMITS.width.min, ROOM_LIMITS.width.max),
      height: clamp(
        Number(height),
        ROOM_LIMITS.height.min,
        ROOM_LIMITS.height.max,
      ),
    });
    setName("");
  };

  const handleDownload = () => {
    const json = exportProjectJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `project-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="z-10 flex h-full w-full flex-col border-r border-slate-200 bg-white shadow-lg lg:w-96">
      <div className="border-b border-slate-200 bg-slate-950 p-5 text-white">
        <p className="mb-2 inline-flex rounded-full bg-blue-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-blue-200">
          Reversible AC
        </p>
        <h1 className="text-xl font-bold">HVAC 3D Configurator</h1>
        <p className="text-xs text-slate-400">
          Room layout, sizing, piping, and live estimates.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Floors</h2>
              <p className="text-xs text-slate-500">
                Add storeys above ground level and place rooms on the active
                floor.
              </p>
            </div>
            <button
              type="button"
              onClick={addFloor}
              className="inline-flex shrink-0 items-center gap-1.5 rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Layers size={14} /> Add Floor
            </button>
          </div>

          <div className="grid gap-2">
            {floors.map((floor) => {
              const roomCount = rooms.filter(
                (room) => room.floorId === floor.id,
              ).length;

              return (
                <button
                  key={floor.id}
                  type="button"
                  onClick={() => selectFloor(floor.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                    selectedFloorId === floor.id
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>
                    <span className="block font-semibold">{floor.name}</span>
                    <span>{floor.elevation.toFixed(1)}m elevation</span>
                  </span>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 shadow-sm">
                    {roomCount} rooms
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <form
          onSubmit={handleAdd}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Add New Room
            </h2>
            <p className="text-xs text-slate-500">
              New rooms will be placed on {selectedFloor.name}.
            </p>
          </div>
          <input
            type="text"
            placeholder="Room Name (e.g. Living Room)"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <label className="space-y-1 text-slate-500">
              <span>Length (cm)</span>
              <input
                type="number"
                min={ROOM_LIMITS.length.min}
                max={ROOM_LIMITS.length.max}
                value={length}
                onChange={(event) => setLength(Number(event.target.value))}
                className="w-full rounded border border-slate-300 px-2 py-1 text-slate-900"
              />
            </label>
            <label className="space-y-1 text-slate-500">
              <span>Width (cm)</span>
              <input
                type="number"
                min={ROOM_LIMITS.width.min}
                max={ROOM_LIMITS.width.max}
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
                className="w-full rounded border border-slate-300 px-2 py-1 text-slate-900"
              />
            </label>
            <label className="space-y-1 text-slate-500">
              <span>Height (cm)</span>
              <input
                type="number"
                min={ROOM_LIMITS.height.min}
                max={ROOM_LIMITS.height.max}
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
                className="w-full rounded border border-slate-300 px-2 py-1 text-slate-900"
              />
            </label>
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Plus size={14} /> Add Room to Layout
          </button>
        </form>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Rooms ({rooms.length})
          </h2>
          {rooms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
              Add a room to generate a 3D shell, indoor split, piping route, and
              quote.
            </div>
          ) : null}
          {rooms.map((room) => {
            const kwRequired = getRequiredKw(room);
            const indoorUnit = pickIndoorUnit(kwRequired, catalog);

            return (
              <div
                key={room.id}
                onClick={() => selectRoom(room.id)}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-xs transition-all ${
                  selectedRoomId === room.id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {room.name}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      {floors.find((floor) => floor.id === room.floorId)
                        ?.name ?? "Floor"}
                    </span>
                  </p>
                  <p className="text-slate-500">
                    {room.dimensions.length / 100}m ×{" "}
                    {room.dimensions.width / 100}m ·{" "}
                    {(
                      (room.dimensions.length * room.dimensions.width) /
                      10000
                    ).toFixed(1)}
                    m²
                  </p>
                  <p className="text-slate-500">
                    {kwRequired.toFixed(2)} kW load →{" "}
                    {indoorUnit.coolingCapacityKw} kW unit
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeRoom(room.id);
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${room.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Door Location
            </h2>
            <p className="text-xs text-slate-500">
              Select a room, choose the door wall, then slide the door along it.
            </p>
          </div>

          {selectedRoom ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                Editing door for{" "}
                <span className="font-semibold">{selectedRoom.name}</span>
              </div>

              <label className="space-y-1 text-xs font-medium text-slate-600">
                <span>Door wall</span>
                <select
                  value={selectedRoomDoor.wall}
                  onChange={(event) =>
                    handleDoorChange({
                      ...selectedRoomDoor,
                      wall: event.target.value as DoorWall,
                    })
                  }
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="front">Front wall</option>
                  <option value="back">Back wall</option>
                  <option value="left">Left wall</option>
                  <option value="right">Right wall</option>
                </select>
              </label>

              <label className="space-y-2 text-xs font-medium text-slate-600">
                <span className="flex items-center justify-between">
                  <span>Offset from wall center</span>
                  <span>{selectedRoomDoor.offsetMeters.toFixed(1)}m</span>
                </span>
                <input
                  type="range"
                  min={-doorOffsetLimit}
                  max={doorOffsetLimit}
                  step={0.1}
                  value={clamp(
                    selectedRoomDoor.offsetMeters,
                    -doorOffsetLimit,
                    doorOffsetLimit,
                  )}
                  onChange={(event) =>
                    handleDoorChange({
                      ...selectedRoomDoor,
                      offsetMeters: Number(event.target.value),
                    })
                  }
                  className="w-full accent-orange-500"
                />
              </label>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
              Select a room to edit its door location.
            </div>
          )}
        </section>
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-4 text-xs">
        <PricingSummary quote={quote} />
        <AdminPricingModal />
        <button
          type="button"
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-1.5 rounded bg-slate-900 py-2 font-medium text-white hover:bg-slate-800"
        >
          <Download size={14} /> Export Layout JSON
        </button>
      </div>
    </aside>
  );
}
