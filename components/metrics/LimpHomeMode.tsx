"use client"

import { useState, useEffect, useRef } from "react"

interface DataPoint {
  time: number
  value: number
}

export default function LimpHomeModeGraph() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const width = 600
  const height = 200
  const padding = 40
  const graphWidth = width - 2 * padding
  const graphHeight = height - 2 * padding

  // Limp Home Mode: 0 (Off), 1 (On)
  const minValue = 0
  const maxValue = 1
  const timeWindow = 20

  useEffect(() => {
    const initialValue = Math.random() > 0.8 ? 1 : 0 // Start mostly off
    setDataPoints([{ time: 0, value: initialValue }])
    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 1
        // Randomly toggle mode
        const newValue = Math.random() > 0.95 ? 1 : 0
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Limp Home Mode Monitor</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${currentValue === 1 ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">Live Data</span>
            </div>
            <div className={`text-lg font-semibold ${currentValue === 1 ? 'text-red-500' : 'text-gray-900'}`}>{currentValue === 1 ? 'ON' : 'OFF'}</div>
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
            {[0, 1].map((val) => (
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
                  {val === 1 ? 'ON' : 'OFF'}
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
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
              style={{ filter: "drop-shadow(0 2px 4px rgba(239, 68, 68, 0.2))" }}
            />
            {dataPoints
              .filter((point) => currentTime <= timeWindow || point.time > currentTime - timeWindow)
              .map((point, index) => (
                <g key={`${point.time}-${index}`}>
                  <circle
                    cx={getX(point.time)}
                    cy={getY(point.value)}
                    r="4"
                    fill={point.value === 1 ? "#ef4444" : "#e5e7eb"}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:r-6 cursor-pointer"
                  />
                  <circle
                    cx={getX(point.time)}
                    cy={getY(point.value)}
                    r="12"
                    fill="transparent"
                    className="hover:fill-red-500 hover:fill-opacity-10 cursor-pointer transition-all duration-200"
                  >
                    <title>{`Time: ${point.time}s, Mode: ${point.value === 1 ? 'ON' : 'OFF'}`}</title>
                  </circle>
                </g>
              ))}
            {dataPoints.length > 0 && (
              <circle
                cx={getX(dataPoints[dataPoints.length - 1].time)}
                cy={getY(dataPoints[dataPoints.length - 1].value)}
                r="6"
                fill={currentValue === 1 ? "#ef4444" : "#e5e7eb"}
                stroke="white"
                strokeWidth="3"
                className="animate-pulse"
                style={{ filter: currentValue === 1 ? "drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))" : "none" }}
              />
            )}
          </svg>
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>
            Mode: OFF (0) / ON (1)
          </span>
          <span>Update Interval: 1s</span>
        </div>
      </div>
    </div>
  )
}
