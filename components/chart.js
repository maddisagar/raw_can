import React, { useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Chart = React.forwardRef(({ data, metric, metrics, height = 200, overlay = false, darkMode = true }, ref) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      canvasRef.current = chartRef.current.container.querySelector("canvas");
    }
  }, []);

  const renderChart = () => {
    if (overlay) {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} ref={chartRef}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#666" : "#ccc"} />
            <XAxis dataKey="timestamp" stroke={darkMode ? "#fff" : "#000"} />
            <YAxis stroke={darkMode ? "#fff" : "#000"} />
            <Tooltip labelFormatter={(label) => {
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
            }} />
            <Legend />
            {metrics.map((m) => (
              <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} dot={false} name={m.label} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} ref={chartRef}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#666" : "#ccc"} />
            <XAxis dataKey="timestamp" stroke={darkMode ? "#fff" : "#000"} />
            <YAxis stroke={darkMode ? "#fff" : "#000"} />
            <Tooltip />
            <Line type="monotone" dataKey={metric.key} stroke={metric.color} dot={false} name={metric.label} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };

  return renderChart();
});

Chart.displayName = "Chart";

export default Chart;
