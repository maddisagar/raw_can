import React, { useState, useRef } from "react";
import { useData } from "./data-context";
import Chart from "./chart";
import CustomDropdown from "./custom-dropdown";
import { Card, CardContent } from "components/ui/card";
import MotorTemperatureGraph from "./MotorTemperatureGraph";
import CtlrTemp1 from "./metrics/CtlrTemp1";
import CtlrTemp2 from "./metrics/CtlrTemp2";
import CtlrTemp from "./metrics/CtlrTemp";
import MtrTemp from "./metrics/MtrTemp";
import AcCurrMeaRms from "./metrics/AcCurrMeaRms";
import DcCurrEstd from "./metrics/DcCurrEstd";
import DcBusVolt from "./metrics/DcBusVolt";
import MtrSpd from "./metrics/MtrSpd";
import ThrotVolt from "./metrics/ThrotVolt";
import LimpHomeMode from "./metrics/LimpHomeMode";
import EcoBoost from "./metrics/EcoBoost";
import RegenMode from "./metrics/RegenMode";
import Forward from "./metrics/Forward";
import Reverse from "./metrics/Reverse";
import Brake from "./metrics/Brake";

export default function GraphContainer({ mode, fullView = false, darkMode = true }) {
  const { history, isConnected } = useData();
  const [selectedGraphs, setSelectedGraphs] = useState([]);
  const [quadSelection, setQuadSelection] = useState(["DcBusVolt", "MtrSpd", "AcCurrMeaRms", "MtrTemp"]);

  const individualCanvasRefs = useRef([]);
  const overlayCanvasRef = useRef(null);
  const quadCanvasRefs = useRef([]);

  const allMetrics = [
    { key: "CtlrTemp1", label: "Controller Temp 1", category: "temp616", color: "#3b82f6", unit: "°C" },
    { key: "CtlrTemp2", label: "Controller Temp 2", category: "temp616", color: "#1d4ed8", unit: "°C" },
    { key: "CtlrTemp", label: "Controller Temp Avg", category: "temp616", color: "#2563eb", unit: "°C" },
    { key: "MtrTemp", label: "Motor Temperature", category: "temp616", color: "#ef4444", unit: "°C" },
    { key: "AcCurrMeaRms", label: "AC Current RMS", category: "measurement617", color: "#22c55e", unit: "A" },
    { key: "DcCurrEstd", label: "DC Current Est", category: "measurement617", color: "#16a34a", unit: "A" },
    { key: "DcBusVolt", label: "DC Bus Voltage", category: "measurement617", color: "#f59e0b", unit: "V" },
    { key: "MtrSpd", label: "Motor Speed", category: "measurement617", color: "#8b5cf6", unit: "RPM" },
    { key: "ThrotVolt", label: "Throttle Voltage", category: "measurement617", color: "#06b6d4", unit: "V" },
    { key: "LimpHomeMode", label: "Limp Home Mode", category: "status615", color: "#ef4444", unit: "" },
    { key: "EcoBoost", label: "Eco Mode", category: "status615", color: "#22c55e", unit: "" },
    { key: "RegenMode", label: "Regen Mode", category: "status615", color: "#8b5cf6", unit: "" },
    { key: "Forward", label: "Forward Gear", category: "status615", color: "#22c55e", unit: "" },
    { key: "Reverse", label: "Reverse Gear", category: "status615", color: "#f59e0b", unit: "" },
    { key: "Brake", label: "Brake Status", category: "status615", color: "#ef4444", unit: "" },
  ];

  const toggleGraphSelection = (metric) => {
    setSelectedGraphs((prev) => (prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]));
  };

  const updateQuadSelection = (index, metric) => {
    setQuadSelection((prev) => {
      const updated = [...prev];
      updated[index] = metric;
      return updated;
    });
  };

if (mode === "individual" || fullView) {
    return (
      <>
        <style jsx>{`
          .two-graphs-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            padding: 1rem;
            background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
            border-radius: 16px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          }
          .two-graphs-row :global(.shadow-md) {
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            background: white;
          }
          .two-graphs-row :global(.shadow-md):hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.25);
          }
          .two-graphs-row :global(.p-4) {
            padding: 1.25rem !important;
          }
          .live-data {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-weight: 600;
            font-size: 1rem;
            color: #1e3a8a;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            user-select: none;
            margin-bottom: 1rem;
          }
          .live-data .dot {
            width: 12px;
            height: 12px;
            background-color: #ef4444;
            border-radius: 50%;
            box-shadow: 0 0 6px 2px #ef4444;
          }
          .live-data .temp {
            font-weight: 700;
            font-size: 1.25rem;
            color: #111827;
          }
          .live-data .time {
            font-weight: 400;
            font-size: 1rem;
            color: #6b7280;
          }
          @media (max-width: 768px) {
            .two-graphs-row {
              grid-template-columns: 1fr;
              padding: 0.5rem;
              gap: 1rem;
            }
            .live-data {
              font-size: 0.875rem;
              gap: 0.3rem;
              margin-bottom: 0.75rem;
            }
            .live-data .temp {
              font-size: 1rem;
            }
            .live-data .time {
              font-size: 0.875rem;
            }
            .live-data .dot {
              width: 10px;
              height: 10px;
            }
          }
        `}</style>
        <div className="two-graphs-row">
          <Card className="shadow-md"><CardContent className="p-4"><CtlrTemp1 /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><CtlrTemp2 /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><CtlrTemp /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><MtrTemp /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><AcCurrMeaRms /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><DcCurrEstd /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><DcBusVolt /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><MtrSpd /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><ThrotVolt /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><LimpHomeMode /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><EcoBoost /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><RegenMode /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><Forward /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><Reverse /></CardContent></Card>
          <Card className="shadow-md"><CardContent className="p-4"><Brake /></CardContent></Card>
        </div>
      </>
    );
  }

  if (mode === "overlay") {
    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {allMetrics.map((metric) => (
            <button
              key={metric.key}
              className={`px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-secondary focus:outline-none focus:bg-secondary transition-colors ${
                selectedGraphs.includes(metric.key) ? "bg-secondary text-secondary-foreground" : ""
              }`}
              onClick={() => toggleGraphSelection(metric.key)}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {selectedGraphs.length > 0 && (
          <Card className="w-full shadow-md">
            <CardContent className="p-4">
              <Chart
                data={history}
                metrics={allMetrics.filter((m) => selectedGraphs.includes(m.key))}
                height={400}
                overlay={true}
                darkMode={darkMode}
                ref={overlayCanvasRef}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (mode === "quad") {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((index) => {
            const metric = allMetrics.find((m) => m.key === quadSelection[index]);
            return (
              <div key={index} className="flex flex-col gap-2">
                <CustomDropdown
                  options={allMetrics.map((metric) => ({ value: metric.key, label: metric.label }))}
                  value={quadSelection[index]}
                  onChange={(value) => updateQuadSelection(index, value)}
                  label={`Graph ${index + 1}:`}
                  darkMode={darkMode}
                />
                <Card className="shadow-md">
                  <CardContent className="p-4">
                    <Chart
                      data={history}
                      metric={metric}
                      height={120}
                      darkMode={darkMode}
                      ref={(el) => (quadCanvasRefs.current[index] = el?.canvasRef?.current)}
                    />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
