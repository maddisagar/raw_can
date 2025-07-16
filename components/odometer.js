"use client"

import React from "react"
import AnimatedCounter from "./animated-counter"
import "./odometer.css"

export default function Odometer({ value, max, unit, color }) {
  // Validate max and value
  const safeMax = typeof max === "number" && max > 0 ? max : 1
  const safeValue = typeof value === "number" ? Math.min(Math.max(value, 0), safeMax) : 0

  // Calculate the rotation angle for the needle based on safeValue and safeMax
  const angle = Math.min(180, (safeValue / safeMax) * 180) // 0 to 180 degrees

  // Calculate x2 and y2 as strings to avoid React warnings
  const x2 = String(75 + 65 * Math.cos(Math.PI - (angle * Math.PI) / 180))
  const y2 = String(70 - 65 * Math.sin(Math.PI - (angle * Math.PI) / 180))

  return (
    <div className="odometer-container">
      <svg
        viewBox="0 0 150 80"
        className="odometer-svg"
      >
        {/* Semi-circle gauge background */}
        <path
          d="M 10 70 A 65 65 0 0 1 140 70"
          fill="none"
          stroke="#eee"
          strokeWidth="10"
        />
        {/* Colored arc representing the value */}
        <path
          d="M 10 70 A 65 65 0 0 1 140 70"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${(safeValue / safeMax) * 204} 204`}
          strokeLinecap="round"
        />
        {/* Needle */}
        <line
          x1="75"
          y1="70"
          x2={x2}
          y2={y2}
          stroke="#333"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transition: "all 0.5s ease" }}
        />
        {/* Center circle */}
        <circle cx="75" cy="70" r="6" fill="#333" />
      </svg>
      {/* Numeric value with animated counter */}
      {/* 
      <div
        style={{
          position: "absolute",
          width: "100%",
          top: "10px",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "1.5rem",
          color: color,
          userSelect: "none",
        }}
      >
        <AnimatedCounter value={safeValue} /> <span style={{ fontSize: "1rem" }}>{unit}</span>
      </div>
      */}
    </div>
  )
}
