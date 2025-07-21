"use client"

import { useMemo } from "react"
import { useData } from "../data-context"

interface DataPoint {
  time: number
  value: number
}

export default function DcCurrEstdGraph() {
  const { history, isConnected } = useData()

  const width = 480
  const height = 250
  const padding = 40
  const graphWidth = width - 2 * padding
  const graphHeight = height - 2 * padding

  const minValue = 0
  const maxValue = 300
  const timeWindow = 20 // in seconds

  const points: DataPoint[] = useMemo(() => {
    if (!history || history.length === 0) return []

    return history
      .filter((entry) => typeof entry.measurement617?.DcCurrEstd === "number")
      .map((entry, index) => ({
        time: index,
        value: entry.measurement617.DcCurrEstd,
      }))
  }, [history])

  const visiblePoints = useMemo(() => {
    if (points.length === 0) return []

    const maxTime = points[points.length - 1].time
    return points.filter((point) => point.time >= maxTime - timeWindow)
  }, [points])

  const getX = (time: number) => {
    const maxTime = points.length > 0 ? points[points.length - 1].time : 0
    const displayTime = maxTime <= timeWindow ? time : time - (maxTime - timeWindow)
    return padding + (displayTime / timeWindow) * graphWidth
  }

  const getY = (value: number) => {
    return padding + (1 - (value - minValue) / (maxValue - minValue)) * graphHeight
  }

  const createPath = () => {
    if (visiblePoints.length < 2) return ""
    let path = `M ${getX(visiblePoints[0].time)} ${getY(visiblePoints[0].value)}`
    for (let i = 1; i < visiblePoints.length; i++) {
      path += ` L ${getX(visiblePoints[i].time)} ${getY(visiblePoints[i].value)}`
    }
    return path
  }

  const currentValue = visiblePoints.length > 0 ? visiblePoints[visiblePoints.length - 1].value : 0
  const currentTime = visiblePoints.length > 0 ? visiblePoints[visiblePoints.length - 1].time : 0

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">DC Current Est Monitor</h2>
          <div className="text-base font-semibold text-gray-900">Waiting for CAN connection...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">DC Current Est Monitor</h2>
          <div className="flex items-center gap-4">
            <div className="text-base font-semibold text-gray-900">{currentValue.toFixed(1)}A</div>
          </div>
        </div>
        <div className="relative">
          <svg width={width} height={height} className="border border-gray-200 rounded bg-white overflow-visible" style={{ display: 'block', margin: '0 auto' }}>
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {[0, 50, 100, 150, 200, 250, 300].map((val) => (
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
                  {val}A
                </text>
              </g>
            ))}
            {/* {[0, 5, 10, 15, 20].map((t) => (
              <g key={t}>
                <line
                  x1={padding + (t / timeWindow) * graphWidth}
                  y1={padding}
                  x2={padding + (t / timeWindow) * graphWidth}
                  y2={height - padding}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding + (t / timeWindow) * graphWidth}
                  y={height - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {currentTime <= timeWindow ? t : currentTime - timeWindow + t}s
                </text>
              </g>
            ))} */}
            <path
              d={createPath()}
              fill="none"
              stroke="#16a34a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
              style={{ filter: "drop-shadow(0 2px 4px rgba(22, 163, 74, 0.2))" }}
            />
            {visiblePoints.map((point, index) => (
              <g key={`${point.time}-${index}`}>
                <circle
                  cx={getX(point.time)}
                  cy={getY(point.value)}
                  r="4"
                  fill="#16a34a"
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-300 hover:r-6 cursor-pointer"
                />
                <circle
                  cx={getX(point.time)}
                  cy={getY(point.value)}
                  r="12"
                  fill="transparent"
                  className="hover:fill-green-700 hover:fill-opacity-10 cursor-pointer transition-all duration-200"
                >
                  <title>{`Time: ${point.time}s, Current: ${point.value.toFixed(1)}A`}</title>
                </circle>
              </g>
            ))}
            {visiblePoints.length > 0 && (
              <circle
                cx={getX(visiblePoints[visiblePoints.length - 1].time)}
                cy={getY(visiblePoints[visiblePoints.length - 1].value)}
                r="6"
                fill="#16a34a"
                stroke="white"
                strokeWidth="3"
                className="animate-pulse"
                style={{ filter: "drop-shadow(0 0 8px rgba(22, 163, 74, 0.6))" }}
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
