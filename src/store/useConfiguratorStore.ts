import { create } from "zustand";

import { defaultPricingCatalog, PricingCatalog } from "@/config/pricingCatalog";
import {
  CustomerInfo,
  DoorConfig,
  FloorConfig,
  OutdoorUnitConfig,
  RoomConfig,
  RoomDimensions,
} from "@/types/configurator";
import { generateQuote, QuoteBreakdown } from "@/utils/hvacEngine";

export const FLOOR_HEIGHT_METERS = 3.2;

interface ConfiguratorState {
  customerInfo: CustomerInfo;
  floors: FloorConfig[];
  rooms: RoomConfig[];
  outdoorUnit: OutdoorUnitConfig;
  catalog: PricingCatalog;
  quote: QuoteBreakdown;
  selectedFloorId: string;
  selectedRoomId: string | null;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  addFloor: () => void;
  selectFloor: (id: string) => void;
  addRoom: (
    name: string,
    dimensions: RoomDimensions,
    type?: RoomConfig["type"],
  ) => void;
  updateRoomPosition: (id: string, position: [number, number, number]) => void;
  updateRoomDoor: (id: string, door: DoorConfig) => void;
  removeRoom: (id: string) => void;
  selectRoom: (id: string | null) => void;
  updateOutdoorPosition: (position: [number, number, number]) => void;
  updateCatalog: (newCatalog: PricingCatalog) => void;
  exportProjectJson: () => string;
}

const initialOutdoorUnit: OutdoorUnitConfig = {
  id: "outdoor-unit-1",
  position: [0, 0, -4],
};

const initialFloors: FloorConfig[] = [
  {
    id: "floor-ground",
    name: "Ground Floor",
    level: 0,
    elevation: 0,
  },
];

const initialCustomerInfo: CustomerInfo = {
  name: "",
  address: "",
  phone: "",
  email: "",
  constructionDate: "",
  buildingType: "house",
  notes: "",
};

export const DEFAULT_DOOR: DoorConfig = {
  wall: "front",
  offsetMeters: 0,
  widthMeters: 0.9,
};

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  customerInfo: initialCustomerInfo,
  floors: initialFloors,
  rooms: [],
  outdoorUnit: initialOutdoorUnit,
  catalog: defaultPricingCatalog,
  quote: generateQuote([], initialOutdoorUnit, defaultPricingCatalog),
  selectedFloorId: initialFloors[0].id,
  selectedRoomId: null,

  updateCustomerInfo: (info) => {
    set({ customerInfo: { ...get().customerInfo, ...info } });
  },

  addFloor: () => {
    const nextLevel = get().floors.length;
    const newFloor: FloorConfig = {
      id: createId("floor"),
      name: nextLevel === 1 ? "First Floor" : `Floor ${nextLevel}`,
      level: nextLevel,
      elevation: nextLevel * FLOOR_HEIGHT_METERS,
    };

    set({
      floors: [...get().floors, newFloor],
      selectedFloorId: newFloor.id,
      selectedRoomId: null,
    });
  },

  selectFloor: (id) => set({ selectedFloorId: id, selectedRoomId: null }),

  addRoom: (name, dimensions, type = "living_room") => {
    const selectedFloor =
      get().floors.find((floor) => floor.id === get().selectedFloorId) ??
      get().floors[0];
    const floorRoomCount = get().rooms.filter(
      (room) => room.floorId === selectedFloor.id,
    ).length;
    const spacingX = floorRoomCount * 5;
    const newRoom: RoomConfig = {
      id: createId("room"),
      name,
      type,
      floorId: selectedFloor.id,
      dimensions,
      position: [spacingX, selectedFloor.elevation, 0],
      door: DEFAULT_DOOR,
    };
    const updatedRooms = [...get().rooms, newRoom];

    set({
      rooms: updatedRooms,
      selectedRoomId: newRoom.id,
      quote: generateQuote(updatedRooms, get().outdoorUnit, get().catalog),
    });
  },

  updateRoomPosition: (id, position) => {
    const updatedRooms = get().rooms.map((room) =>
      room.id === id ? { ...room, position } : room,
    );

    set({
      rooms: updatedRooms,
      quote: generateQuote(updatedRooms, get().outdoorUnit, get().catalog),
    });
  },

  updateRoomDoor: (id, door) => {
    const updatedRooms = get().rooms.map((room) =>
      room.id === id ? { ...room, door } : room,
    );

    set({ rooms: updatedRooms });
  },

  removeRoom: (id) => {
    const updatedRooms = get().rooms.filter((room) => room.id !== id);

    set({
      rooms: updatedRooms,
      selectedRoomId: get().selectedRoomId === id ? null : get().selectedRoomId,
      quote: generateQuote(updatedRooms, get().outdoorUnit, get().catalog),
    });
  },

  selectRoom: (id) => {
    const selectedRoom = get().rooms.find((room) => room.id === id);

    set({
      selectedRoomId: id,
      selectedFloorId: selectedRoom?.floorId ?? get().selectedFloorId,
    });
  },

  updateOutdoorPosition: (position) => {
    const outdoorUnit = { ...get().outdoorUnit, position };

    set({
      outdoorUnit,
      quote: generateQuote(get().rooms, outdoorUnit, get().catalog),
    });
  },

  updateCatalog: (newCatalog) => {
    set({
      catalog: newCatalog,
      quote: generateQuote(get().rooms, get().outdoorUnit, newCatalog),
    });
  },

  exportProjectJson: () => {
    const { customerInfo, floors, rooms, outdoorUnit } = get();

    return JSON.stringify(
      {
        metadata: {
          projectId: createId("project"),
          projectName: "HVAC Configurator Layout",
          sellerId: "seller-demo",
          clientName: customerInfo.name || "Client",
          createdAt: new Date().toISOString(),
        },
        customerInfo,
        layout: { floors, rooms, outdoorUnit },
      },
      null,
      2,
    );
  },
}));
