"use client"

import { useState, useEffect, useRef } from "react"

interface DataPoint {
  time: number
  temperature: number
}

export default function CtlrTemp() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Graph dimensions
  const width = 600
  const height = 300
  const padding = 40
  const graphWidth = width - 2 * padding
  const graphHeight = height - 2 * padding

  // Temperature range (20°C to 100°C)
  const minTemp = 20
  const maxTemp = 100
  const timeWindow = 20 // Show 20 seconds

  useEffect(() => {
    // Generate initial data point
    const initialTemp = 45 + Math.random() * 20 // Start around 45-65°C
    setDataPoints([{ time: 0, temperature: initialTemp }])

    // Start continuous plotting
    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 1

        // Generate new temperature with some variation
        const lastTemp = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].temperature : 50
        const variation = (Math.random() - 0.5) * 10 // ±5°C variation
        const newTemp = Math.max(minTemp, Math.min(maxTemp, lastTemp + variation))

        setDataPoints((prevPoints) => {
          const newPoint = { time: newTime, temperature: newTemp }

          if (newTime <= timeWindow) {
            // Still within initial 20 seconds
            return [...prevPoints, newPoint]
          } else {
            // Shift window - keep last 20 seconds
            const filteredPoints = prevPoints.filter((point) => point.time > newTime - timeWindow)
            return [...filteredPoints, newPoint]
          }
        })

        return newTime
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Convert data coordinates to SVG coordinates
  const getX = (time: number) => {
    const displayTime = currentTime <= timeWindow ? time : time - (currentTime - timeWindow)
    return padding + (displayTime / timeWindow) * graphWidth
  }

  const getY = (temperature: number) => {
    return padding + (1 - (temperature - minTemp) / (maxTemp - minTemp)) * graphHeight
  }

  // Create SVG path
  const createPath = () => {
    if (dataPoints.length < 2) return ""

    const visiblePoints =
      currentTime <= timeWindow ? dataPoints : dataPoints.filter((point) => point.time > currentTime - timeWindow)

    if (visiblePoints.length < 2) return ""

    let path = `M ${getX(visiblePoints[0].time)} ${getY(visiblePoints[0].temperature)}`

    for (let i = 1; i < visiblePoints.length; i++) {
      path += ` L ${getX(visiblePoints[i].time)} ${getY(visiblePoints[i].temperature)}`
    }

    return path
  }

  // Get current temperature
  const currentTemp = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].temperature : 0

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] border border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Controller Temp Avg Monitor</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Data</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">{currentTemp.toFixed(1)}°C</div>
            <div className="text-sm text-gray-500">Time: {currentTime}s</div>
          </div>
        </div>

        <div className="relative">
          <svg width={width} height={height} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Y-axis labels */}
            {[20, 40, 60, 80, 100].map((temp) => (
              <g key={temp}>
                <line
                  x1={padding}
                  y1={getY(temp)}
                  x2={width - padding}
                  y2={getY(temp)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text x={padding - 10} y={getY(temp) + 4} textAnchor="end" className="text-xs fill-gray-500">
                  {temp}°C
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {[0, 5, 10, 15, 20].map((time) => (
              <g key={time}>
                <line
                  x1={padding + (time / timeWindow) * graphWidth}
                  y1={padding}
                  x2={padding + (time / timeWindow) * graphWidth}
                  y2={height - padding}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding + (time / timeWindow) * graphWidth}
                  y={height - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {currentTime <= timeWindow ? time : currentTime - timeWindow + time}s
                </text>
              </g>
            ))}

            {/* Main graph line */}
            <path
              d={createPath()}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(37, 99, 235, 0.2))",
              }}
            />

            {/* Data points */}
            {dataPoints
              .filter((point) => currentTime <= timeWindow || point.time > currentTime - timeWindow)
              .map((point, index) => (
                <g key={`${point.time}-${index}`}>
                  <circle
                    cx={getX(point.time)}
                    cy={getY(point.temperature)}
                    r="4"
                    fill="#2563eb"
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:r-6 cursor-pointer"
                  />
                  {/* Hover tooltip */}
                  <circle
                    cx={getX(point.time)}
                    cy={getY(point.temperature)}
                    r="12"
                    fill="transparent"
                    className="hover:fill-blue-600 hover:fill-opacity-10 cursor-pointer transition-all duration-200"
                  >
                    <title>{`Time: ${point.time}s, Temp: ${point.temperature.toFixed(1)}°C`}</title>
                  </circle>
                </g>
              ))}

            {/* Current point highlight */}
            {dataPoints.length > 0 && (
              <circle
                cx={getX(dataPoints[dataPoints.length - 1].time)}
                cy={getY(dataPoints[dataPoints.length - 1].temperature)}
                r="6"
                fill="#2563eb"
                stroke="white"
                strokeWidth="3"
                className="animate-pulse"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(37, 99, 235, 0.6))",
                }}
              />
            )}
          </svg>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>
            Temperature Range: {minTemp}°C - {maxTemp}°C
          </span>
          <span>Update Interval: 1s</span>
        </div>
      </div>
    </div>
  )
}
