export interface UnitPricing {
  modelId: string;
  name: string;
  coolingCapacityKw: number;
  heatingCapacityKw: number;
  maxRoomsSupported?: number;
  unitCost: number;
}

export interface PricingCatalog {
  indoorUnits: UnitPricing[];
  outdoorUnits: UnitPricing[];
  rates: {
    copperPipingPerMeter: number;
    electricalWiringPerMeter: number;
    laborBaseFee: number;
    laborPerIndoorUnit: number;
    taxRatePercentage: number;
  };
}

export const defaultPricingCatalog: PricingCatalog = {
  indoorUnits: [
    {
      modelId: "in-2.0kw",
      name: "Wall Split 2.0 kW (<20m²)",
      coolingCapacityKw: 2.0,
      heatingCapacityKw: 2.5,
      unitCost: 350,
    },
    {
      modelId: "in-2.5kw",
      name: "Wall Split 2.5 kW (20–30m²)",
      coolingCapacityKw: 2.5,
      heatingCapacityKw: 3.2,
      unitCost: 420,
    },
    {
      modelId: "in-3.5kw",
      name: "Wall Split 3.5 kW (30–45m²)",
      coolingCapacityKw: 3.5,
      heatingCapacityKw: 4.0,
      unitCost: 550,
    },
    {
      modelId: "in-5.0kw",
      name: "Wall Split 5.0 kW (45–65m²)",
      coolingCapacityKw: 5.0,
      heatingCapacityKw: 5.8,
      unitCost: 780,
    },
  ],
  outdoorUnits: [
    {
      modelId: "out-mono-3.5",
      name: "Inverter Mono-split 3.5 kW",
      coolingCapacityKw: 3.5,
      heatingCapacityKw: 4.0,
      maxRoomsSupported: 1,
      unitCost: 650,
    },
    {
      modelId: "out-bi-5.0",
      name: "Multi-split Bi-split 5.0 kW",
      coolingCapacityKw: 5.0,
      heatingCapacityKw: 5.6,
      maxRoomsSupported: 2,
      unitCost: 1100,
    },
    {
      modelId: "out-tri-7.0",
      name: "Multi-split Tri-split 7.0 kW",
      coolingCapacityKw: 7.0,
      heatingCapacityKw: 8.0,
      maxRoomsSupported: 3,
      unitCost: 1550,
    },
    {
      modelId: "out-quad-8.5",
      name: "Multi-split Quadri-split 8.5 kW",
      coolingCapacityKw: 8.5,
      heatingCapacityKw: 9.5,
      maxRoomsSupported: 4,
      unitCost: 1950,
    },
    {
      modelId: "out-penta-10.0",
      name: "Multi-split 5-Port 10.0 kW",
      coolingCapacityKw: 10.0,
      heatingCapacityKw: 11.5,
      maxRoomsSupported: 5,
      unitCost: 2400,
    },
  ],
  rates: {
    copperPipingPerMeter: 35,
    electricalWiringPerMeter: 12,
    laborBaseFee: 450,
    laborPerIndoorUnit: 200,
    taxRatePercentage: 20,
  },
};
