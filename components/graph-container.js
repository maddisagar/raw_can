import React, { useState, useRef } from "react";
import { useData } from "./data-context";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
    { key: "CtlrTemp1", label: "Ctlr Temp 1", category: "temp616", color: "#3b82f6", unit: "°C" },
    { key: "CtlrTemp2", label: "Ctlr Temp 2", category: "temp616", color: "#1d4ed8", unit: "°C" },
    { key: "CtlrTemp", label: "Ctlr Temp Avg", category: "temp616", color: "#2563eb", unit: "°C" },
    { key: "MtrTemp", label: "Motor Temp", category: "temp616", color: "#ef4444", unit: "°C" },
    { key: "AcCurrMeaRms", label: "AC Curr RMS", category: "measurement617", color: "#22c55e", unit: "A" },
    { key: "DcCurrEstd", label: "DC Curr Est", category: "measurement617", color: "#16a34a", unit: "A" },
    { key: "DcBusVolt", label: "DC Bus Voltage", category: "measurement617", color: "#f59e0b", unit: "V" },
    { key: "MtrSpd", label: "Motor Speed", category: "measurement617", color: "#8b5cf6", unit: "RPM" },
    { key: "ThrotVolt", label: "Throttle Volt", category: "measurement617", color: "#06b6d4", unit: "V" },
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

          /* Dark mode styles for individual mode graph page */
          :global(.app.dark) .two-graphs-row {
            background: linear-gradient(135deg, #0f172a, #1e293b);
            border-radius: 16px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.8);
          }
          :global(.app.dark) .two-graphs-row :global(.shadow-md) {
            background: #1e293b;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
            border-radius: 12px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            color: #cbd5e1;
          }
          :global(.app.dark) .two-graphs-row :global(.shadow-md):hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.9);
          }
          :global(.app.dark) .two-graphs-row :global(.p-4) {
            padding: 1.5rem !important;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #cbd5e1;
          }

          @media (min-width: 1500px) {
          .two-graphs-row {
              grid-template-columns: repeat(3, 1fr);
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
    // Rolling buffer for smooth overlay graph
    const OVERLAY_BUFFER_SIZE = 1200; // Number of points to display
    const prepareOverlayData = () => {
      if (!history || history.length === 0 || selectedGraphs.length === 0) return [];
      // Only keep the last OVERLAY_BUFFER_SIZE points
      const bufferHistory = history.length > OVERLAY_BUFFER_SIZE
        ? history.slice(-OVERLAY_BUFFER_SIZE)
        : history;
      return bufferHistory.map((entry) => {
        // Avoid mutating the same object, always create a new one
        const dataPoint = { timestamp: entry.timestamp || entry.time || 0 };
        selectedGraphs.forEach((key) => {
          const metricInfo = allMetrics.find((m) => m.key === key);
          if (!metricInfo) {
            dataPoint[key] = null;
            return;
          }
          if (entry[key] !== undefined) {
            dataPoint[key] = entry[key];
            return;
          }
          if (metricInfo.category && entry[metricInfo.category] && entry[metricInfo.category][key] !== undefined) {
            dataPoint[key] = entry[metricInfo.category][key];
            return;
          }
          dataPoint[key] = null;
        });
        return { ...dataPoint };
      });
    };

    const overlayData = prepareOverlayData();
    const overlayMetrics = selectedGraphs
      .map((key) => allMetrics.find((m) => m.key === key))
      .filter(Boolean);


    // Grouping logic for y-axes (groupedTemp, groupedCurrent, groupedStatus, others)
    const tempGroupKeys = ["CtlrTemp", "CtlrTemp1", "CtlrTemp2", "MtrTemp"];
    const currentGroupKeys = ["AcCurrMeaRms", "DcCurrEstd"];
    const statusGroupKeys = ["LimpHomeMode", "EcoBoost", "RegenMode", "Forward", "Reverse", "Brake"];
    // Compose uniqueMetrics for axes
    const uniqueMetrics = [];
    const seenGroup = new Set();
    overlayMetrics.forEach((m) => {
      if (tempGroupKeys.includes(m.key)) {
        if (!seenGroup.has("groupedTemp")) {
          uniqueMetrics.push({
            key: "groupedTemp",
            label: "Controller & Motor Temps",
            color: "#ef4444",
            scale: { min: 0, max: 200 },
          });
          seenGroup.add("groupedTemp");
        }
      } else if (currentGroupKeys.includes(m.key)) {
        if (!seenGroup.has("groupedCurrent")) {
          uniqueMetrics.push({
            key: "groupedCurrent",
            label: "AC & DC Current",
            color: "#22c55e",
            scale: { min: 0, max: 0.5 },
          });
          seenGroup.add("groupedCurrent");
        }
      } else if (statusGroupKeys.includes(m.key)) {
        if (!seenGroup.has("groupedStatus")) {
          uniqueMetrics.push({
            key: "groupedStatus",
            label: "Status Flags",
            color: "#8b5cf6",
            scale: { min: 0, max: 1 },
          });
          seenGroup.add("groupedStatus");
        }
      } else {
        uniqueMetrics.push({
          ...m,
          scale: {
            min:
              m.key === "DcBusVolt"
                ? 0
                : m.key === "MtrSpd"
                ? 0
                : m.key === "ThrotVolt"
                ? 0
                : 0,
            max:
              m.key === "DcBusVolt"
                ? 80
                : m.key === "MtrSpd"
                ? 8000
                : m.key === "ThrotVolt"
                ? 5
                : 1,
          },
        });
      }
    });


    // Helper for tooltip formatting
    const formatTooltip = (value, name, props) => {
      const metric = overlayMetrics.find((m) => m.key === name);
      return metric ? `${value} ${metric.unit}` : value;
    };


    // Helper for timestamp formatting
    const formatTimestamp = (ts) => {
      if (!ts) return "";
      const d = new Date(ts);
      return d.toLocaleTimeString();
    };

    // Calculate left offset for each axis
    const axisSpacing = 50;
    // Only show axes for selected metrics, grouped as above
    return (
      <div className="flex flex-col items-center w-full">
        <style jsx>{`
          .metric-button {
            position: relative;
            padding: 0.2rem 0.8rem;
            margin: 0.3rem;
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 24px;
            border: 2px solid transparent;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.4s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.6);
            width: 130px;
            text-align: center;
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
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.7);
          }
          .metric-button.selected::before {
            background: radial-gradient(circle at center, rgba(255,255,255,0.6), transparent 50%);
          }

          @media (min-width: 1500px) {
            .metric-button {
              width: 195px;
              padding: 0.5rem 1rem;
        }
          }
        `}</style>
        <div className="flex flex-col items-center mb-4">
          <div className="flex gap-2 mb-2">
            {/* <button
              className="metric-button"
              style={{ background: '#22c55e', color: 'white', fontWeight: 700 }}
              onClick={() => setSelectedGraphs(allMetrics.map(m => m.key))}
            >
              Select All
            </button>
            <button
              className="metric-button"
              style={{ background: '#ef4444', color: 'white', fontWeight: 700 }}
              onClick={() => setSelectedGraphs([])}
            >
              Deselect All
            </button> */}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
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
            <button
              className="metric-button"
              style={{ background: '#22c55e', color: 'white', fontWeight: 700 }}
              onClick={() => setSelectedGraphs(allMetrics.map(m => m.key))}
            >
              Select All
            </button>
            <button
              className="metric-button"
              style={{ background: '#ef4444', color: 'white', fontWeight: 700 }}
              onClick={() => setSelectedGraphs([])}
            >
              Deselect All
            </button>
          </div>
        </div>

        {selectedGraphs.length > 0 ? (
          <Card className="shadow-md w-full max-w-5xl">
            <CardContent className="p-4">
              <div style={{ width: "100%", height: 650, position: "relative", marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overlayData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
                    <XAxis
                      dataKey="timestamp"
                      tick={false}
                      axisLine={false}
                      stroke={darkMode ? "#cbd5e1" : "#334155"}
                    />
                    {/* Grouped color-coded Y-axes, spaced apart */}
                    {uniqueMetrics.map((metric, idx) => (
                      <YAxis
                        key={metric.key}
                        yAxisId={metric.key}
                        domain={[metric.scale.min, metric.scale.max]}
                        orientation="left"
                        axisLine={true}
                        tickLine={true}
                        tick={{ fill: metric.color, fontSize: 12 }}
                        stroke={metric.color}
                        width={40}
                        style={{ zIndex: 2 }}
                        allowDecimals={true}
                        mirror={false}
                      />
                    ))}
                    <Tooltip
                      labelFormatter={formatTimestamp}
                      formatter={(value, name) => {
                        // Find group label if grouped
                        if (tempGroupKeys.includes(name)) {
                          return [value, "Controller & Motor Temps"];
                        } else if (currentGroupKeys.includes(name)) {
                          return [value, "AC & DC Current"];
                        } else if (statusGroupKeys.includes(name)) {
                          return [value, "Status Flags"];
                        }
                        const metric = overlayMetrics.find((m) => m.key === name);
                        return metric ? [value, metric.label] : [value, name];
                      }}
                      contentStyle={{ background: darkMode ? "#1e293b" : "#fff", color: darkMode ? "#cbd5e1" : "#334155" }}
                    />
                    <Legend
                      formatter={(value) => {
                        // Find group label if grouped
                        if (tempGroupKeys.includes(value)) {
                          return <span style={{ color: "#ef4444" }}>Controller & Motor Temps</span>;
                        } else if (currentGroupKeys.includes(value)) {
                          return <span style={{ color: "#22c55e" }}>AC & DC Current</span>;
                        } else if (statusGroupKeys.includes(value)) {
                          return <span style={{ color: "#8b5cf6" }}>Status Flags</span>;
                        }
                        const metric = overlayMetrics.find((m) => m.key === value);
                        return (
                          <span style={{ color: metric?.color }}>{metric?.label || value}</span>
                        );
                      }}
                    />
                    {/* Render lines for each metric, color-matched and axis-matched */}
                    {overlayMetrics.map((m) => {
                      let yAxisId = m.key;
                      let color = m.color;
                      if (tempGroupKeys.includes(m.key)) {
                        yAxisId = "groupedTemp";
                        color = "#ef4444";
                      } else if (currentGroupKeys.includes(m.key)) {
                        yAxisId = "groupedCurrent";
                        color = "#22c55e";
                      } else if (statusGroupKeys.includes(m.key)) {
                        yAxisId = "groupedStatus";
                        color = "#8b5cf6";
                      }
                      return (
                        <Line
                          key={m.key}
                          yAxisId={yAxisId}
                          type="monotone"
                          dataKey={m.key}
                          stroke={color}
                          dot={false}
                          strokeWidth={2}
                          isAnimationActive={false}
                          name={m.label}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
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