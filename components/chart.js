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
            <Tooltip />
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
