"use client";

import { QuoteBreakdown } from "@/utils/hvacEngine";

interface PricingSummaryProps {
  quote: QuoteBreakdown;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function PricingSummary({ quote }: PricingSummaryProps) {
  return (
    <div className="space-y-2 text-xs">
      <h3 className="font-semibold uppercase tracking-wide text-slate-800">
        Live Quotation Breakdown
      </h3>
      <div className="flex justify-between text-slate-600">
        <span>Indoor Units:</span>
        <span>{formatCurrency(quote.indoorUnitsTotal)}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Outdoor Compressor:</span>
        <span>{formatCurrency(quote.outdoorUnitTotal)}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Piping ({quote.estimatedPipingMeters}m est.):</span>
        <span>{formatCurrency(quote.pipingTotal)}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Installation / Labor:</span>
        <span>{formatCurrency(quote.laborTotal)}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Tax:</span>
        <span>{formatCurrency(quote.taxAmount)}</span>
      </div>
      <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-bold text-slate-900">
        <span>Total (Incl. Tax):</span>
        <span>{formatCurrency(quote.totalInclTax)}</span>
      </div>
    </div>
  );
}
