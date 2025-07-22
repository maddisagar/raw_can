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

import { useEffect } from "react";

export default function GraphContainer({ mode, fullView = false, darkMode = true }) {
  const { history, isConnected } = useData();
  const [selectedGraphs, setSelectedGraphs] = useState([]);
  const [quadSelection, setQuadSelection] = useState(["DcBusVolt", "MtrSpd", "AcCurrMeaRms", "MtrTemp"]);

  useEffect(() => {
    if (mode === "quad") {
      setQuadSelection(["", "", "", ""]);
    }
  }, [mode]);

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
            gap: 2rem;
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
            height: 100%;
            display: flex;
            align-items: stretch;
          }
          .two-graphs-row :global(.shadow-md):hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.25);
          }
          .two-graphs-row :global(.p-4) {
            padding: 1.5rem !important;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @media (max-width: 900px) {
            .two-graphs-row {
              grid-template-columns: 1fr;
              padding: 0.5rem;
              gap: 1rem;
            }
          }
        `}</style>
        <div className="two-graphs-row">
          {[CtlrTemp1, CtlrTemp2, CtlrTemp, MtrTemp, AcCurrMeaRms, DcCurrEstd, DcBusVolt, MtrSpd, ThrotVolt, LimpHomeMode, EcoBoost, RegenMode, Forward, Reverse, Brake].map((GraphComp, idx) => (
            <Card className="shadow-md" key={idx}>
              <CardContent className="p-4">
                <GraphComp />
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (mode === "overlay") {
    // Helper function to transform history data for overlay chart
    const prepareOverlayData = () => {
      if (!history || history.length === 0 || selectedGraphs.length === 0) return [];

      return history.map((entry) => {
        const dataPoint = { timestamp: entry.timestamp || entry.time || 0 };
        selectedGraphs.forEach((key) => {
          // Extract value for each selected metric key from entry
          // The metric keys correspond to nested keys in entry, e.g. measurement617.AcCurrMeaRms
          // We need to find the correct path for each metric key from allMetrics category or key
          // For simplicity, try to find value in entry by key directly or nested under category keys
          // We'll try direct key first, then search in known categories

          // Find metric info
          const metricInfo = allMetrics.find((m) => m.key === key);
          if (!metricInfo) {
            dataPoint[key] = null;
            return;
          }

          // Try direct key
          if (entry[key] !== undefined) {
            dataPoint[key] = entry[key];
            return;
          }

          // Try nested keys based on category
          if (metricInfo.category && entry[metricInfo.category] && entry[metricInfo.category][key] !== undefined) {
            dataPoint[key] = entry[metricInfo.category][key];
            return;
          }

          // Fallback null
          dataPoint[key] = null;
        });
        return dataPoint;
      });
    };

    const overlayData = prepareOverlayData();

    // Prepare metrics array for Chart component
    const overlayMetrics = selectedGraphs
      .map((key) => allMetrics.find((m) => m.key === key))
      .filter(Boolean);

    return (
      <div className="flex flex-col items-center w-full">
        <style jsx>{`
          .metric-button {
            position: relative;
            padding: 0.6rem 1.2rem;
            margin: 0.3rem;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 30px;
            border: 2px solid transparent;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.4s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.6);
          }
          .metric-button::before {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(255,255,255,0.3), transparent 70%);
            transform: rotate(25deg);
            transition: all 0.5s ease;
            pointer-events: none;
          }
          .metric-button:hover::before {
            top: -30%;
            left: -30%;
            width: 260%;
            height: 260%;
            background: radial-gradient(circle at center, rgba(255,255,255,0.5), transparent 60%);
          }
          .metric-button:hover {
            background: linear-gradient(135deg, #764ba2, #667eea);
            box-shadow: 0 6px 20px rgba(118, 75, 162, 0.8);
            transform: scale(1.05);
            border-color: white;
          }
          .metric-button.selected {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            box-shadow: 0 6px 20px rgba(34, 197, 94, 0.8);
            border-color: #16a34a;
            color: white;
          }
          .metric-button.selected::before {
            background: radial-gradient(circle at center, rgba(255,255,255,0.6), transparent 50%);
          }
        `}</style>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {allMetrics.map((metric) => (
            <button
              key={metric.key}
              className={`metric-button ${selectedGraphs.includes(metric.key) ? "selected" : ""}`}
              onClick={() => toggleGraphSelection(metric.key)}
              title={metric.label}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {selectedGraphs.length > 0 ? (
          <Card className="shadow-md w-full max-w-5xl">
            <CardContent className="p-4">
              <Chart
                data={overlayData}
                metrics={overlayMetrics}
                overlay={true}
                height={400}
                darkMode={darkMode}
                ref={overlayCanvasRef}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-gray-500">Select one or more metrics to overlay</div>
        )}
      </div>
    );
  }

  if (mode === "quad") {
    // Map metric keys to their respective components for rendering
    const metricComponentsMap = {
      CtlrTemp1,
      CtlrTemp2,
      CtlrTemp,
      MtrTemp,
      AcCurrMeaRms,
      DcCurrEstd,
      DcBusVolt,
      MtrSpd,
      ThrotVolt,
      LimpHomeMode,
      EcoBoost,
      RegenMode,
      Forward,
      Reverse,
      Brake,
    };

    return (
      <>
        <style jsx>{`
          .quad-grid-container {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1.5rem;
            padding: 1rem;
          }
          @media (min-width: 768px) {
            .quad-grid-container {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          .quad-graph-card {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .quad-dropdown-label {
            font-weight: 600;
            color: ${darkMode ? "#22c55e" : "#16a34a"};
            margin-bottom: 0.25rem;
          }
        `}</style>
        <div className="quad-grid-container">
          {[0, 1, 2, 3].map((index) => {
            const metricKey = quadSelection[index];
            const MetricComponent = metricComponentsMap[metricKey];
            if (!MetricComponent) {
              return (
                <div key={index} className="quad-graph-card">
                  <label className="quad-dropdown-label">{`Graph ${index + 1}:`}</label>
                  <CustomDropdown
                    options={allMetrics.map((metric) => ({ value: metric.key, label: metric.label }))}
                    value={metricKey}
                    onChange={(value) => updateQuadSelection(index, value)}
                    darkMode={darkMode}
                  />
                  <Card>
                    <CardContent>
                      {/* Empty placeholder when no metric selected */}
                      <div style={{ height: 120 }}></div>
                    </CardContent>
                  </Card>
                </div>
              );
            }
            return (
              <div key={index} className="quad-graph-card">
                <label className="quad-dropdown-label">{`Graph ${index + 1}:`}</label>
                <CustomDropdown
                  options={allMetrics.map((metric) => ({ value: metric.key, label: metric.label }))}
                  value={metricKey}
                  onChange={(value) => updateQuadSelection(index, value)}
                  darkMode={darkMode}
                />
                <Card>
                  <CardContent>
                    <MetricComponent darkMode={darkMode} />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return null;
}
