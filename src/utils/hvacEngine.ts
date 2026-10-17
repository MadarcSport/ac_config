import { PricingCatalog, UnitPricing } from "@/config/pricingCatalog";
import { OutdoorUnitConfig, RoomConfig } from "@/types/configurator";

export interface QuoteBreakdown {
  indoorUnitsTotal: number;
  outdoorUnitTotal: number;
  estimatedPipingMeters: number;
  pipingTotal: number;
  laborTotal: number;
  subtotalExclTax: number;
  taxAmount: number;
  totalInclTax: number;
  assignedOutdoorUnit?: UnitPricing;
}

export function getRequiredKw(room: RoomConfig): number {
  const volumeM3 =
    (room.dimensions.length / 100) *
    (room.dimensions.width / 100) *
    (room.dimensions.height / 100);

  return (volumeM3 * 40) / 1000;
}

export function pickIndoorUnit(
  kwRequired: number,
  catalog: PricingCatalog,
): UnitPricing {
  const sorted = [...catalog.indoorUnits].sort(
    (a, b) => a.coolingCapacityKw - b.coolingCapacityKw,
  );

  return (
    sorted.find((unit) => unit.coolingCapacityKw >= kwRequired) ??
    sorted[sorted.length - 1]
  );
}

export function calculateTotalPipingDistance(
  rooms: RoomConfig[],
  outdoorUnit: OutdoorUnitConfig,
): number {
  let totalDistanceMeters = 0;
  const [ox, oy, oz] = outdoorUnit.position;

  rooms.forEach((room) => {
    const [rx, ry, rz] = room.position;
    const dX = Math.abs(rx - ox);
    const dZ = Math.abs(rz - oz);
    const indoorUnitHeight = ry + room.dimensions.height / 100 - 0.25;
    const dY = Math.abs(indoorUnitHeight - oy);
    totalDistanceMeters += dX + dZ + dY;
  });

  return Math.max(5, Math.ceil(totalDistanceMeters));
}

export function generateQuote(
  rooms: RoomConfig[],
  outdoorUnit: OutdoorUnitConfig,
  catalog: PricingCatalog,
): QuoteBreakdown {
  let indoorUnitsTotal = 0;
  let totalKw = 0;

  rooms.forEach((room) => {
    const kw = getRequiredKw(room);
    totalKw += kw;
    const unit = pickIndoorUnit(kw, catalog);
    indoorUnitsTotal += unit.unitCost;
  });

  const roomCount = rooms.length;
  const matchingOutdoor =
    catalog.outdoorUnits.find(
      (outdoor) =>
        (outdoor.maxRoomsSupported ?? 1) >= roomCount &&
        outdoor.coolingCapacityKw >= totalKw * 0.8,
    ) ?? catalog.outdoorUnits[catalog.outdoorUnits.length - 1];

  const outdoorUnitTotal =
    matchingOutdoor && roomCount > 0 ? matchingOutdoor.unitCost : 0;
  const estimatedPipingMeters = calculateTotalPipingDistance(
    rooms,
    outdoorUnit,
  );
  const pipingTotal =
    roomCount > 0
      ? estimatedPipingMeters *
        (catalog.rates.copperPipingPerMeter +
          catalog.rates.electricalWiringPerMeter)
      : 0;
  const laborTotal =
    roomCount > 0
      ? catalog.rates.laborBaseFee +
        roomCount * catalog.rates.laborPerIndoorUnit
      : 0;
  const subtotalExclTax =
    indoorUnitsTotal + outdoorUnitTotal + pipingTotal + laborTotal;
  const taxAmount = (subtotalExclTax * catalog.rates.taxRatePercentage) / 100;

  return {
    indoorUnitsTotal,
    outdoorUnitTotal,
    estimatedPipingMeters: roomCount > 0 ? estimatedPipingMeters : 0,
    pipingTotal,
    laborTotal,
    subtotalExclTax,
    taxAmount,
    totalInclTax: subtotalExclTax + taxAmount,
    assignedOutdoorUnit: matchingOutdoor,
  };
}
