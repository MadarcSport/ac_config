export type RoomType =
  | "living_room"
  | "bedroom"
  | "office"
  | "kitchen"
  | "other";

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
}

export type DoorWall = "front" | "back" | "left" | "right";

export interface DoorConfig {
  wall: DoorWall;
  offsetMeters: number;
  widthMeters: number;
}

export interface RoomConfig {
  id: string;
  name: string;
  type: RoomType;
  floorId: string;
  dimensions: RoomDimensions;
  position: [number, number, number];
  door?: DoorConfig;
  assignedIndoorUnitId?: string;
}

export interface FloorConfig {
  id: string;
  name: string;
  level: number;
  elevation: number;
}

export interface OutdoorUnitConfig {
  id: string;
  position: [number, number, number];
  assignedModelId?: string;
}

export type BuildingType =
  | "house"
  | "apartment"
  | "office"
  | "commercial"
  | "other";

export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  constructionDate: string;
  buildingType: BuildingType;
  notes: string;
}

export interface ProjectLayoutSnapshot {
  metadata: {
    projectId: string;
    projectName: string;
    sellerId: string;
    clientName: string;
    createdAt: string;
  };
  customerInfo: CustomerInfo;
  layout: {
    floors: FloorConfig[];
    rooms: RoomConfig[];
    outdoorUnit: OutdoorUnitConfig;
  };
}
