"use client"

import { useData } from "./data-context"
import { TrendingUp, TrendingDown, Minus, Gauge, Zap, Activity } from "lucide-react"
import Odometer from "./odometer"

export default function PerformanceMetrics() {
  const { currentData, history, alerts, isConnected } = useData()

  if (!currentData.measurement617 || !currentData.temp616) return null

  const criticalCount = alerts.filter((alert) => alert.type === "critical").length
  const warningCount = alerts.filter((alert) => alert.type === "warning").length
  const infoCount = alerts.filter((alert) => alert.type === "info").length

  const sensorHealthStatusKeys = [
    "SnsrHealthStatus",
    "SnsrHealthStatusDcBus",
    "SnsrHealthStatus12V",
    "SnsrHealthStatus5V",
    "SnsrHealthStatusPhBCurr",
    "SnsrHealthStatusPhCCurr",
    "SnsrHealthStatusThrot1",
    "SnsrHealthStatusQep",
    "SnsrHealthStatusCtlrTemp1",
    "SnsrHealthStatusMtrTemp",
    "SnsrHealthStatusThrot2",
    "SnsrHealthStatusCtlrTemp2",
  ]

  // Create a copy of status615 to modify for display
  const displayStatus615 = { ...currentData.status615 }

  if (!isConnected) {
    sensorHealthStatusKeys.forEach((key) => {
      displayStatus615[key] = true
    })
  }

  const sensorHealthKeys = Object.keys(displayStatus615).filter((key) =>
    key.startsWith("SnsrHealthStatus")
  )
  const totalSensors = sensorHealthKeys.length
  const healthySensors = sensorHealthKeys.filter((key) => displayStatus615[key]).length

  const calculateTrend = (key, category) => {
    if (history.length < 2) return 0
    const recent = history.slice(-5)
    const values = recent.map((item) => (item[category] ? item[category][key] : 0))
    if (values.length < 2) return 0
    const firstValue = values[0]
    const lastValue = values[values.length - 1]
    return ((lastValue - firstValue) / firstValue) * 100
  }

  const getEfficiencyScore = () => {
    const motorTemp = currentData.temp616.MtrTemp
    const voltage = currentData.measurement617.DcBusVolt
    const current = currentData.measurement617.AcCurrMeaRms
    const speed = currentData.measurement617.MtrSpd
    let score = 100
    if (motorTemp > 60) score -= 20
    else if (motorTemp > 40) score -= 10
    if (voltage < 300 || voltage > 400) score -= 15
    if (current > 70) score -= 15
    if (speed > 2500) score -= 10
    return Math.max(0, score)
  }

  const getPowerConsumption = () => {
    const voltage = currentData.measurement617.DcBusVolt
    const current = currentData.measurement617.DcCurrEstd
    return (voltage * current) / 1000
  }

  const metrics = [
    {
      title: "Motor Speed",
      value: currentData.measurement617.MtrSpd,
      unit: "RPM",
      trend: calculateTrend("Mtrspd", "measurement617"),
      icon: Gauge,
      color: "#8b5cf6",
      max: 7500,
    },
    {
      title: "DC Bus Voltage",
      value: currentData.measurement617.DcBusVolt,
      unit: "V",
      trend: calculateTrend("DcBusVolt", "measurement617"),
      icon: Zap,
      color: "#FFD700",
      max: 80,
    },
    {
      title: "AC Current RMS",
      value: currentData.measurement617.AcCurrMeaRms,
      unit: "A",
      trend: calculateTrend("AcCurrMeaRms", "measurement617"),
      icon: Activity,
      color: "#22c550",
      max: 500,
    },
    {
      title: "Motor Temperature",
      value: currentData.temp616.MtrTemp,
      unit: "°C",
      trend: calculateTrend("MtrTemp", "temp616"),
      icon: Gauge,
      color: "#ef4444",
      max: 200,
    },
  ]

  const getTrendIcon = (trend) => {
    if (trend > 1) return TrendingUp
    if (trend < -1) return TrendingDown
    return Minus
  }

  const getTrendColor = (trend) => {
    if (trend > 1) return "#22c55e"
    if (trend < -1) return "#ef4444"
    return "#6b7280"
  }

  return (
    <div className="performance-metrics">
      <div className="metrics-header">
        <h3>Performance Metrics</h3>
        <div className="overall-stats">
          <div className="stat-item">
            <span className="stat-label">Critical</span>
            <span className="stat-value critical">{criticalCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Warning</span>
            <span className="stat-value warning">{warningCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Info</span>
            <span className="stat-value info">{infoCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Healthy Sensors</span>
            <span className="stat-value good">{healthySensors}/{totalSensors} Healthy</span>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => {
          const IconComponent = metric.icon
          return (
            <div key={metric.title} className={`metric-card ${metric.title === "Motor Speed" ? "motor-speed-card" : ""}`}>
              <div className="metric-header">
                <h4>{metric.title}</h4>
                <div className="icon-group">
                  {metric.title === "Motor Speed" && (
                    <div className="motor-direction-icons">
                      <button
                        className={`icon forward-icon letter-button ${metric.value > 0 ? "active" : "inactive"}`}
                        title="Forward"
                        aria-label="Forward"
                        type="button"
                      >
                        F
                      </button>
                      <button
                        className={`icon reverse-icon letter-button ${metric.value < 0 ? "active" : "inactive"}`}
                        title="Reverse"
                        aria-label="Reverse"
                        type="button"
                      >
                        R
                      </button>
                    </div>
                  )}
                  <div className="metric-icon" style={{ color: metric.color }}>
                    <IconComponent size={20} />
                  </div>
                </div>
              </div>

              <div className="metric-content">
                <div className="metric-value">
                  <span className="value">{metric.title === "Motor Speed" ? Math.abs(metric.value ?? 0).toFixed(1) : (metric.value ?? 0).toFixed(1)}</span>
                  <span className="unit">{metric.unit}</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "0.5rem",
                  width: "100%"
                }}>
                  <div style={{ transform: "scale(1.25)", transformOrigin: "center" }}>
                    <Odometer
                      value={metric.value ?? 0}
                      max={typeof metric.max === "number" && metric.max > 0 ? metric.max : 1}
                      unit={metric.unit}
                      color={metric.color}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .performance-metrics {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 3px solid #495e70;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .metrics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .metrics-header h3 {
          margin: 0;
          color: #22c55e;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .overall-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-label {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .stat-value.good { color: #22c55e; }
        .stat-value.warning { color: #f59e0b; }
        .stat-value.critical { color: #ef4444; }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          align-items: stretch;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.03);
          border: 3px solid #C0C1EF;
          border-radius: 12px;
          padding: 0rem 1rem 1rem 1.25rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 230px;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-header h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #000000ff;
        }

        .icon-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .motor-speed-card .icon-group {
          justify-content: space-between;
          width: 80px;
        }


        .motor-direction-icons {
          display: flex;
          gap: 0.4rem;
        }

        .icon {
          font-weight: 700;
          font-size: 0.75rem;
          border-radius: 4px;
          border: 1px solid transparent;
          padding: 0.15rem 0.35rem;
        }

        .icon.active {
          color: black;
          border-color: #22c55e;
          box-shadow: 0 0 6px 2px #22c55e;
        }

        .icon.inactive {
          color: white;
          opacity: 0.5;
        }

        .metric-content {
          margin-top: 0.5rem;
        }

        .metric-value {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .metric-value .unit {
          font-size: 1.2rem;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .performance-metrics {
            max-width: 100%;
            box-sizing: border-box;
            padding: 1rem;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }

          .overall-stats {
            justify-content: center;
            gap: 1rem;
          }

          .metric-card {
            padding: 0rem 0.5rem;
            min-height: 180px;
            box-sizing: border-box;
          }
        }
      `}</style>
    </div>
  )
}
