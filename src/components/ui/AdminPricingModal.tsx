"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";

import { PricingCatalog } from "@/config/pricingCatalog";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";

export function AdminPricingModal() {
  const { catalog, updateCatalog } = useConfiguratorStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PricingCatalog>(catalog);

  const updateRate = (key: keyof PricingCatalog["rates"], value: number) => {
    setDraft((current) => ({
      ...current,
      rates: {
        ...current.rates,
        [key]: value,
      },
    }));
  };

  const save = () => {
    updateCatalog(draft);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraft(catalog);
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded border border-slate-300 bg-white py-2 font-medium text-slate-700 hover:bg-slate-100"
      >
        <Settings size={14} /> Edit Pricing Rates
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Admin Pricing
                </h2>
                <p className="text-xs text-slate-500">
                  Adjust rates used by the quote engine.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {Object.entries(draft.rates).map(([key, value]) => (
                <label
                  key={key}
                  className="space-y-1 text-xs font-medium text-slate-600"
                >
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  <input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(event) =>
                      updateRate(
                        key as keyof PricingCatalog["rates"],
                        Number(event.target.value),
                      )
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Rates
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
