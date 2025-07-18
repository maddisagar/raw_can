"use client"

import { useState, useEffect, useRef } from "react"

interface DataPoint {
  time: number
  value: number
}

export default function MtrSpdGraph() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const width = 600
  const height = 300
  const padding = 40
  const graphWidth = width - 2 * padding
  const graphHeight = height - 2 * padding

  // Motor Speed range (0 to 8000 RPM)
  const minValue = 0
  const maxValue = 8000
  const timeWindow = 20

  useEffect(() => {
    const initialValue = 1000 + Math.random() * 1000 // Start around 1000-2000 RPM
    setDataPoints([{ time: 0, value: initialValue }])
    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 1
        const lastValue = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 1500
        const variation = (Math.random() - 0.5) * 400 // ±200 RPM variation
        const newValue = Math.max(minValue, Math.min(maxValue, lastValue + variation))
        setDataPoints((prevPoints) => {
          const newPoint = { time: newTime, value: newValue }
          if (newTime <= timeWindow) {
            return [...prevPoints, newPoint]
          } else {
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

  const getX = (time: number) => {
    const displayTime = currentTime <= timeWindow ? time : time - (currentTime - timeWindow)
    return padding + (displayTime / timeWindow) * graphWidth
  }

  const getY = (value: number) => {
    return padding + (1 - (value - minValue) / (maxValue - minValue)) * graphHeight
  }

  const createPath = () => {
    if (dataPoints.length < 2) return ""
    const visiblePoints =
      currentTime <= timeWindow ? dataPoints : dataPoints.filter((point) => point.time > currentTime - timeWindow)
    if (visiblePoints.length < 2) return ""
    let path = `M ${getX(visiblePoints[0].time)} ${getY(visiblePoints[0].value)}`
    for (let i = 1; i < visiblePoints.length; i++) {
      path += ` L ${getX(visiblePoints[i].time)} ${getY(visiblePoints[i].value)}`
    }
    return path
  }

  const currentValue = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 0

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] border border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Motor Speed Monitor</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Data</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">{currentValue.toFixed(0)} RPM</div>
            <div className="text-sm text-gray-500">Time: {currentTime}s</div>
          </div>
        </div>
        <div className="relative">
          <svg width={width} height={height} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {[0, 2000, 4000, 6000, 8000].map((val) => (
              <g key={val}>
                <line
                  x1={padding}
                  y1={getY(val)}
                  x2={width - padding}
                  y2={getY(val)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text x={padding - 10} y={getY(val) + 4} textAnchor="end" className="text-xs fill-gray-500">
                  {val} RPM
                </text>
              </g>
            ))}
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
            <path
              d={createPath()}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
              style={{ filter: "drop-shadow(0 2px 4px rgba(139, 92, 246, 0.2))" }}
            />
            {dataPoints
              .filter((point) => currentTime <= timeWindow || point.time > currentTime - timeWindow)
              .map((point, index) => (
                <g key={`${point.time}-${index}`}>
                  <circle
                    cx={getX(point.time)}
                    cy={getY(point.value)}
                    r="4"
                    fill="#8b5cf6"
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:r-6 cursor-pointer"
                  />
                  <circle
                    cx={getX(point.time)}
                    cy={getY(point.value)}
                    r="12"
                    fill="transparent"
                    className="hover:fill-purple-500 hover:fill-opacity-10 cursor-pointer transition-all duration-200"
                  >
                    <title>{`Time: ${point.time}s, Speed: ${point.value.toFixed(0)} RPM`}</title>
                  </circle>
                </g>
              ))}
            {dataPoints.length > 0 && (
              <circle
                cx={getX(dataPoints[dataPoints.length - 1].time)}
                cy={getY(dataPoints[dataPoints.length - 1].value)}
                r="6"
                fill="#8b5cf6"
                stroke="white"
                strokeWidth="3"
                className="animate-pulse"
                style={{ filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))" }}
              />
            )}
          </svg>
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>
            Speed Range: {minValue} - {maxValue} RPM
          </span>
          <span>Update Interval: 1s</span>
        </div>
      </div>
    </div>
  )
}
