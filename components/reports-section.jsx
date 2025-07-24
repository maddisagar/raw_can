"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import "../src/app/date-picker.css"
import {
  AlertCircle,
  BarChart2,
  AlertTriangle,
  Thermometer,
  TrendingUp,
  Activity,
  ChevronDown,
} from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useData } from "./data-context"

function CircularProgress({ percentage }) {
  const radius = 40
  const stroke = 8
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <svg height={radius * 2} width={radius * 2} className="circular-progress">
      <circle
        stroke="#fcd34d"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ opacity: 0.3 }}
      />
      <circle
        stroke="#f97316"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="20"
        fill="#1e293b"
        fontWeight="700"
      >
        {percentage}%
      </text>
    </svg>
  )
}

export default function ReportsSection() {
  const reportRef = useRef(null)
  const { dailyReports } = useData()

  const [selectedDate, setSelectedDate] = useState(new Date())

  // Memoize report data for selected date
  const reportData = useMemo(() => {
    if (!selectedDate) return null
    const dateStr = selectedDate.toISOString().slice(0, 10)
    return dailyReports[dateStr] || {
      criticalAlertsCount: 0,
      systemModesCounts: {
        regenMode: 0,
        ascMode: 0,
        hillHold: 0,
        limp: 0,
        idleShutdown: 0,
      },
      temperatureStats: {
        minMotorTemp: null,
        maxMotorTemp: null,
        minControllerTemp: null,
        maxControllerTemp: null,
      },
    }
  }, [selectedDate, dailyReports])

  // PDF download function remains unchanged
  function handleDownloadPDF() {
    if (!reportRef.current) return

    const input = reportRef.current
    html2canvas(input, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png")
        const padding = 20
        const extraTopSpace = 30
        const pdfWidth = canvas.width + padding * 2
        const pdfHeight = canvas.height + padding * 2 + extraTopSpace
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: [pdfWidth, pdfHeight],
        })
        const dateStr = new Date().toISOString().split("T")[0]
        pdf.setFontSize(32)
        const textWidth = pdf.getTextWidth(dateStr)
        pdf.text(dateStr, (pdfWidth - textWidth) / 2, padding + 15)
        pdf.addImage(imgData, "PNG", padding, padding + extraTopSpace, canvas.width, canvas.height)
        pdf.save(`report-${dateStr}.pdf`)
      })
      .catch((err) => {
        alert("Failed to generate PDF: " + err.message)
      })
  }

  if (!selectedDate) {
    return <div>Loading...</div>
  }

  return (
    <div className="reports-section">
      <div className="header-row">
        <h2>Report</h2>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          maxDate={new Date()}
          dateFormat="yyyy-MM-dd"
          className="date-picker"
          aria-label="Select report date"
          showPopperArrow={false}
        />
        <button onClick={handleDownloadPDF} className="download-button" aria-label="Download report as PDF">
          Download PDF
        </button>
      </div>

      <div ref={reportRef}>
        <div className="top-card">
          <div className="critical-alerts">
            <div className="icon-circle red-bg">
              <AlertCircle size={24} color="white" />
            </div>
            <div className="critical-text">
              <div className="title">Critical</div>
              <div className="title">Alerts</div>
              <div className="value">{reportData.criticalAlertsCount}</div>
            </div>
          </div>

          <div className="system-modes">
            <div className="mode-item green">
              <BarChart2 size={20} />
              <div>
                <div className="mode-label">Regen</div>
                <div className="mode-sub-label">Mode</div>
                <div className="mode-value">{reportData.systemModesCounts.regenMode}</div>
              </div>
            </div>
            <div className="mode-item green">
              <TrendingUp size={20} />
              <div>
                <div className="mode-label">ASC</div>
                <div className="mode-sub-label">Mode</div>
                <div className="mode-value">{reportData.systemModesCounts.ascMode}</div>
              </div>
            </div>
            <div className="mode-item yellow">
              <Activity size={20} />
              <div>
                <div className="mode-label">Hill</div>
                <div className="mode-sub-label">Hold</div>
                <div className="mode-value">{reportData.systemModesCounts.hillHold}</div>
              </div>
            </div>
            <div className="mode-item red">
              <AlertTriangle size={20} />
              <div>
                <div className="mode-label">Limp</div>
                <div className="mode-value">{reportData.systemModesCounts.limp}</div>
              </div>
            </div>
            <div className="mode-item green">
              <ChevronDown size={20} />
              <div>
                <div className="mode-value">
                  <CircularProgress percentage={reportData.systemModesCounts.idleShutdown} />
                </div>
                <div className="mode-label">Idle Shutdown</div>
              </div>
            </div>
          </div>
        </div>

        <div className="temperature-cards">
          <div className="temp-card red-bg-light">
            <div className="temp-icon">
              <Thermometer size={20} color="#ea580c" />
            </div>
            <div className="temp-content">
              <div className="temp-title">Motor Temperature</div>
              <div className="temp-values">
                <div>
                  Min <strong>{reportData.temperatureStats.minMotorTemp !== null && reportData.temperatureStats.minMotorTemp !== 0 ? reportData.temperatureStats.minMotorTemp.toFixed(1) : "--"}°C</strong>
                </div>
                <div>
                  Max <strong>{reportData.temperatureStats.maxMotorTemp !== null ? reportData.temperatureStats.maxMotorTemp.toFixed(1) : "--"}°C</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="temp-card green-bg-light">
            <div className="temp-icon">
              <Thermometer size={20} color="#22c55e" />
            </div>
            <div className="temp-content">
              <div className="temp-title">Controller Temperature</div>
              <div className="temp-values">
                <div>
                  Min <strong>{reportData.temperatureStats.minControllerTemp !== null && reportData.temperatureStats.minControllerTemp !== 0 ? reportData.temperatureStats.minControllerTemp.toFixed(1) : "--"}°C</strong>
                </div>
                <div>
                  Max <strong>{reportData.temperatureStats.maxControllerTemp !== null ? reportData.temperatureStats.maxControllerTemp.toFixed(1) : "--"}°C</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
