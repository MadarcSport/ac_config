"use client";

import { useState } from "react";
import { ClipboardList, FileDown, Settings2, UserRound } from "lucide-react";

import { Scene } from "@/components/canvas/Scene";
import { Sidebar } from "@/components/ui/Sidebar";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";

type AppTab = "info" | "configuration" | "export";

const tabs: { id: AppTab; label: string; description: string }[] = [
  {
    id: "info",
    label: "Info",
    description: "Customer and building details",
  },
  {
    id: "configuration",
    label: "Configuration",
    description: "Rooms, AC units, and piping",
  },
  {
    id: "export",
    label: "Export",
    description: "Prepare the future A4 PDF",
  },
];

function InfoPage() {
  const { customerInfo, updateCustomerInfo } = useConfiguratorStore();

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <UserRound size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Project information
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Customer Information
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Enter the customer and building details here. These values will
                be reused later for the full PDF export.
              </p>
            </div>
          </div>
        </div>

        <form className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Customer name</span>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(event) =>
                updateCustomerInfo({ name: event.target.value })
              }
              placeholder="John Smith"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Phone number</span>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(event) =>
                updateCustomerInfo({ phone: event.target.value })
              }
              placeholder="+33 6 00 00 00 00"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Address</span>
            <input
              type="text"
              value={customerInfo.address}
              onChange={(event) =>
                updateCustomerInfo({ address: event.target.value })
              }
              placeholder="Street, postal code, city"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(event) =>
                updateCustomerInfo({ email: event.target.value })
              }
              placeholder="customer@example.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Home construction date</span>
            <input
              type="text"
              value={customerInfo.constructionDate}
              onChange={(event) =>
                updateCustomerInfo({ constructionDate: event.target.value })
              }
              placeholder="e.g. 1998 or 12/03/1998"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Type of building</span>
            <select
              value={customerInfo.buildingType}
              onChange={(event) =>
                updateCustomerInfo({
                  buildingType: event.target
                    .value as typeof customerInfo.buildingType,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="office">Office</option>
              <option value="commercial">Commercial</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Additional notes</span>
            <textarea
              value={customerInfo.notes}
              onChange={(event) =>
                updateCustomerInfo({ notes: event.target.value })
              }
              placeholder="Access constraints, insulation notes, customer requests..."
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </form>
      </div>
    </section>
  );
}

function ConfigurationPage() {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-100 lg:flex-row">
      <div className="h-[48vh] lg:h-full">
        <Sidebar />
      </div>
      <div className="relative min-h-0 flex-1">
        <Scene />
      </div>
    </section>
  );
}

function ExportPage() {
  const { customerInfo, floors, rooms, quote, exportProjectJson } =
    useConfiguratorStore();

  const handleDownloadJson = () => {
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
    <section className="min-h-0 flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <FileDown size={28} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
                  Export center
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-950">
                  A4 PDF export preview
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  This page is prepared for the future PDF export. Later it can
                  include customer info, price details, room configuration, and
                  captured 3D views from the configurator.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    PDF A4 document
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    HVAC configuration proposal
                  </h2>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  Preview
                </span>
              </div>

              <div className="grid flex-1 gap-4 py-6 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Customer
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm text-slate-600">
                    <div>
                      <dt className="text-xs uppercase text-slate-400">Name</dt>
                      <dd>{customerInfo.name || "Not filled yet"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-400">
                        Address
                      </dt>
                      <dd>{customerInfo.address || "Not filled yet"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-400">
                        Contact
                      </dt>
                      <dd>
                        {[customerInfo.phone, customerInfo.email]
                          .filter(Boolean)
                          .join(" · ") || "Not filled yet"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Configuration
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between gap-4">
                      <dt>Floors</dt>
                      <dd className="font-semibold text-slate-900">
                        {floors.length}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Rooms</dt>
                      <dd className="font-semibold text-slate-900">
                        {rooms.length}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Estimated total</dt>
                      <dd className="font-semibold text-slate-900">
                        €{quote.totalInclTax.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500 md:col-span-2">
                  Future 3D configurator screenshots and technical drawings will
                  appear here.
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Export actions</h2>
          <p className="mt-2 text-sm text-slate-500">
            PDF generation will be added later. For now, the full project data
            can still be downloaded as JSON.
          </p>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FileDown size={18} /> Export JSON
          </button>
          <button
            type="button"
            disabled
            className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400"
          >
            <FileDown size={18} /> Export A4 PDF soon
          </button>
        </aside>
      </div>
    </section>
  );
}

export default function ConfiguratorPage() {
  const [activeTab, setActiveTab] = useState<AppTab>("configuration");

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100">
      <header className="z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
              Reversible AC
            </p>
            <h1 className="text-xl font-bold text-slate-950">
              HVAC 3D Configurator
            </h1>
          </div>

          <nav className="grid gap-2 rounded-2xl bg-slate-100 p-1 sm:grid-cols-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon =
                tab.id === "info"
                  ? ClipboardList
                  : tab.id === "configuration"
                    ? Settings2
                    : FileDown;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {tab.label}
                    </span>
                    <span
                      className={`hidden truncate text-xs sm:block ${
                        isActive ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {activeTab === "info" ? <InfoPage /> : null}
      {activeTab === "configuration" ? <ConfigurationPage /> : null}
      {activeTab === "export" ? <ExportPage /> : null}
    </main>
  );
}
