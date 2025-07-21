"use client"

import { useMemo } from "react"
import { useData } from "../data-context"

interface DataPoint {
  time: number
  value: number
}

export default function ForwardGraph() {
  const { history, isConnected } = useData()

  const width = 480
  const height = 250
  const padding = 40
  const graphWidth = width - 2 * padding
  const graphHeight = height - 2 * padding

  const minValue = 0
  const maxValue = 1
  const timeWindow = 20

  const forwardData: DataPoint[] = useMemo(() => {
    if (!isConnected || !history.length) return []

    const data: DataPoint[] = history
      .map((entry, index) => {
        const forward = entry?.status615?.Forward
        if (typeof forward !== "boolean") return null
        return {
          time: index,
          value: forward ? 1 : 0,
        }
      })
      .filter((point): point is DataPoint => point !== null)

    const startIndex = Math.max(0, data.length - timeWindow)
    return data.slice(startIndex)
  }, [history, isConnected])

  const currentTime = forwardData.length > 0 ? forwardData[forwardData.length - 1].time : 0
  const currentValue = forwardData.length > 0 ? forwardData[forwardData.length - 1].value : 0

  const getX = (time: number) => {
    const relativeTime = currentTime <= timeWindow ? time : time - (currentTime - timeWindow)
    return padding + (relativeTime / timeWindow) * graphWidth
  }

  const getY = (value: number) => {
    return padding + (1 - (value - minValue) / (maxValue - minValue)) * graphHeight
  }

  const pathData = useMemo(() => {
    if (forwardData.length < 2) return ""
    return forwardData.reduce((path, point, index) => {
      const command = index === 0 ? "M" : "L"
      return `${path} ${command} ${getX(point.time)} ${getY(point.value)}`
    }, "")
  }, [forwardData])

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Forward Mode Monitor</h2>
          <div className="text-base font-semibold text-gray-900">Waiting for CAN connection...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Forward Mode Monitor</h2>
          <div className="flex items-center gap-4">
            <div className={`text-base font-semibold ${currentValue === 1 ? 'text-green-500' : 'text-gray-900'}`}>
              {currentValue === 1 ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>
        <div className="relative">
          <svg
            width={width}
            height={height}
            className="border border-gray-200 rounded bg-white overflow-visible"
            style={{ display: "block", margin: "0 auto" }}
          >
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
                <text x={padding - 10} y={getY(val) + 4} textAnchor="end" fontSize="11" fill="#6b7280">
                  {val === 1 ? "ON" : "OFF"}
                </text>
              </g>
            ))}
{/* 
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
            ))} */}

            <path
              d={pathData}
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
              style={{ filter: "drop-shadow(0 2px 4px rgba(34, 197, 94, 0.2))" }}
            />

            {forwardData.map((point, index) => (
              <g key={`${point.time}-${index}`}>
                <circle
                  cx={getX(point.time)}
                  cy={getY(point.value)}
                  r="4"
                  fill={point.value === 1 ? "#22c55e" : "#e5e7eb"}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-300 hover:r-6 cursor-pointer"
                />
                <circle
                  cx={getX(point.time)}
                  cy={getY(point.value)}
                  r="12"
                  fill="transparent"
                  className="hover:fill-green-500 hover:fill-opacity-10 cursor-pointer transition-all duration-200"
                >
                  <title>{`Time: ${point.time}s, Mode: ${point.value === 1 ? 'ON' : 'OFF'}`}</title>
                </circle>
              </g>
            ))}

            {forwardData.length > 0 && (
              <circle
                cx={getX(forwardData[forwardData.length - 1].time)}
                cy={getY(forwardData[forwardData.length - 1].value)}
                r="6"
                fill={currentValue === 1 ? "#22c55e" : "#e5e7eb"}
                stroke="white"
                strokeWidth="3"
                className="animate-pulse"
                style={{
                  filter: currentValue === 1 ? "drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))" : "none",
                }}
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
