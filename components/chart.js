import React, { useEffect, useRef } from "react";
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

const Chart = React.forwardRef(
  ({ data, metrics, height = 200, overlay = false, darkMode = true }, ref) => {
    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
      if (chartRef.current) {
        canvasRef.current = chartRef.current.container.querySelector("canvas");
      }
    }, []);

    const yAxisSpacing = 50;
    const yAxisWidth = 40;

    const tempGroupKeys = ["CtlrTemp", "CtlrTemp1", "CtlrTemp2", "MtrTemp"];
    const currentGroupKeys = ["AcCurrMeaRms", "DcCurrEstd"];
    const uniqueMetrics = [];
    const seenGroup = new Set();

    metrics.forEach((m) => {
      if (tempGroupKeys.includes(m.key)) {
        if (!seenGroup.has("groupedTemp")) {
          uniqueMetrics.push({
            key: "groupedTemp",
            label: "Controller & Motor Temps",
            color: "#ff0000",
            scale: { min: 0, max: 200 },
          });
          seenGroup.add("groupedTemp");
        }
      } else if (currentGroupKeys.includes(m.key)) {
        if (!seenGroup.has("groupedCurrent")) {
          uniqueMetrics.push({
            key: "groupedCurrent",
            label: "AC & DC Current",
            color: "#00bfff",
            scale: { min: 0, max: 0.5},
          });
          seenGroup.add("groupedCurrent");
        }
      } else {
        uniqueMetrics.push(m);
      }
    });

    const leftMargin = yAxisWidth - 45; // fixed left margin for first y-axis plus padding

    const renderChart = () => {
      if (overlay) {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: leftMargin, bottom: 5 }}
              ref={chartRef}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? "#666" : "#ccc"}
              />
              <XAxis
                dataKey="timestamp"
                stroke={darkMode ? "#fff" : "#000"}
                hide={true}
              />
              {uniqueMetrics.map((m, index) => {
                let domain;
                switch (m.key) {
                  case "groupedTemp":
                    domain = [0, 200];
                    break;
                  case "groupedCurrent":
                    domain = [0, 0.5];
                    break;
                  case "DcBusVolt":
                    domain = [0, 80];
                    break;
                  case "MtrSpd":
                    domain = [0, 8000];
                    break;
                  case "ThrotVolt":
                    domain = [0, 5];
                    break;
                  default:
                    domain = [0, 1];
                }
                return (
                  <YAxis
                    key={m.key}
                    yAxisId={m.key}
                    orientation="left"
                    stroke={m.color}
                    tick={{ fill: darkMode ? "#fff" : "#000", fontSize: 12 }}
                    domain={domain}
                    width={yAxisWidth}
                    mirror={false}
                    hide={false}
                    allowDataOverflow={true}
                    offset={index === 0 ? 0 : yAxisWidth + (index - 1) * 10}
                  />
                );
              })}
              <Tooltip
                labelFormatter={(label) => {
                  if (!label) return "";
                  const date = new Date(label);
                  const pad = (n) => n.toString().padStart(2, "0");
                  const day = pad(date.getDate());
                  const month = pad(date.getMonth() + 1);
                  const year = date.getFullYear();
                  const hours = pad(date.getHours());
                  const minutes = pad(date.getMinutes());
                  const seconds = pad(date.getSeconds());
                  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
                }}
                contentStyle={{
                  backgroundColor: darkMode ? "#222" : "#fff",
                  borderRadius: 5,
                }}
                itemStyle={{ color: "inherit" }}
              />
              <Legend
                wrapperStyle={{ color: darkMode ? "#fff" : "#000" }}
                formatter={(value, entry) => {
                  const metric = metrics.find((m) => m.key === entry.dataKey);
                  return (
                    <span style={{ color: metric ? metric.color : "#000" }}>
                      {value}
                    </span>
                  );
                }}
              />
              {metrics.map((m) => {
                const yAxisId = tempGroupKeys.includes(m.key)
                  ? "groupedTemp"
                  : currentGroupKeys.includes(m.key)
                  ? "groupedCurrent"
                  : m.key;
                return (
                  <Line
                    key={m.key}
                    yAxisId={yAxisId}
                    type="monotone"
                    dataKey={m.key}
                    stroke={m.color}
                    dot={false}
                    name={m.label}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        );
      } else {
        const metric = metrics[0];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              ref={chartRef}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? "#666" : "#ccc"}
              />
              <XAxis
                dataKey="timestamp"
                stroke={darkMode ? "#fff" : "#000"}
              />
              <YAxis
                stroke={darkMode ? "#fff" : "#000"}
                domain={[metric.scale.min, metric.scale.max]}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                dot={false}
                name={metric.label}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    };

    return renderChart();
  }
);

Chart.displayName = "Chart";

export default Chart; 