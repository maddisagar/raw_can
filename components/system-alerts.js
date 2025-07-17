"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, XCircle, Bell, Thermometer, Zap } from "lucide-react"

const ERROR_LIST = [
  { code: "DcBusOvErr", type: "critical", icon: AlertTriangle },
  { code: "DcBusUvErr", type: "critical", icon: AlertTriangle },
  { code: "DcBusSnrScFlt", type: "critical", icon: AlertTriangle },
  { code: "DcBusSnsrOcFlt", type: "critical", icon: AlertTriangle },
  { code: "DcBusLvErr", type: "critical", icon: AlertTriangle },
  { code: "PhBCurrSnsrOverCurrFlt", type: "critical", icon: AlertTriangle },
  { code: "PhBCurrSnsrScCurrFlt", type: "critical", icon: AlertTriangle },
  { code: "PhBCurrSnsrOcFlt", type: "critical", icon: AlertTriangle },
  { code: "PhBCurrSnsrScFlt", type: "critical", icon: AlertTriangle },
  { code: "PhCCurrSnsrOverCurrFlt", type: "critical", icon: AlertTriangle },
  { code: "PhCCurrSnsrScCurrFlt", type: "critical", icon: AlertTriangle },
  { code: "PhCCurrSnsrOcFlt", type: "critical", icon: AlertTriangle },
  { code: "PhCCurrSnsrScFlt", type: "critical", icon: AlertTriangle },
  { code: "PhACurrSnsrOverCurrFlt", type: "critical", icon: AlertTriangle },
  { code: "PhACurrSnsrScCurrFlt", type: "critical", icon: AlertTriangle },
  { code: "ThrotLowLmtErr", type: "critical", icon: AlertTriangle },
  { code: "ThrotUpLmtErr", type: "critical", icon: AlertTriangle },
  { code: "ThrotStuckErr", type: "critical", icon: AlertTriangle },
  { code: "ThrotRedunErr", type: "critical", icon: AlertTriangle },
  { code: "QepFlt", type: "critical", icon: AlertTriangle },
  { code: "MtrTempCutoffLmtErr", type: "critical", icon: AlertTriangle },
  { code: "CtlrTempCutoffLmtErr", type: "critical", icon: AlertTriangle },
  { code: "UnintendedAccelerationErr", type: "critical", icon: AlertTriangle },
  { code: "UnintendedDecelerationErr", type: "critical", icon: AlertTriangle },
  { code: "CanErr", type: "critical", icon: AlertTriangle },
  { code: "UnexpectedParkSenseHighErr", type: "critical", icon: AlertTriangle },
  { code: "ThrotSnsrOcFlt", type: "critical", icon: AlertTriangle },
  { code: "ThrotSnsrScFlt", type: "critical", icon: AlertTriangle },
  { code: "FnrErr", type: "critical", icon: AlertTriangle },
  { code: "Supply12UvErr", type: "critical", icon: AlertTriangle },
  { code: "Supply5UvErr", type: "critical", icon: AlertTriangle },
  { code: "HwOverCurrFlt", type: "critical", icon: AlertTriangle },
  { code: "MtrTempCutbackLmtErr", type: "critical", icon: AlertTriangle },
  { code: "CtlrTempCutbackLmtErr", type: "critical", icon: AlertTriangle },
]

function getRandomActiveErrors(errorList, maxCount = 5) {
  const count = Math.floor(Math.random() * maxCount) + 1
  const shuffled = errorList.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count).map((error, index) => ({
    id: `${error.code}-${Date.now()}-${index}`,
    ...error,
    message: getCustomMessage(error.code),
    timestamp: new Date().toLocaleTimeString(),
  }))
}

function getCustomMessage(code) {
  switch (code) {
    case "DcBusOvErr":
      return "DC Bus overvoltage error detected."
    case "DcBusUvErr":
      return "DC Bus undervoltage error detected."
    case "DcBusSnrScFlt":
      return "DC Bus sensor short circuit fault."
    case "DcBusSnsrOcFlt":
      return "DC Bus sensor open circuit fault."
    case "DcBusLvErr":
      return "DC Bus sensor open circuit fault."
    case "PhBCurrSnsrOverCurrFlt":
      return "Phase B current sensor overcurrent fault."
    case "PhBCurrSnsrScCurrFlt":
      return "Phase B current sensor short circuit fault."
    case "PhBCurrSnsrOcFlt":
      return "Phase B current sensor open circuit fault."
    case "PhBCurrSnsrScFlt":
      return "Phase B current sensor short fault."
    case "PhCCurrSnsrOverCurrFlt":
      return "Phase C current sensor overcurrent fault."
    case "PhCCurrSnsrScCurrFlt":
      return "Phase C current sensor short circuit fault."
    case "PhCCurrSnsrOcFlt":
      return "Phase C current sensor open circuit fault."
    case "PhCCurrSnsrScFlt":
      return "Phase C current sensor short fault."
    case "PhACurrSnsrOverCurrFlt":
      return "Phase A current sensor overcurrent fault."
    case "PhACurrSnsrScCurrFlt":
      return "Phase A current sensor short circuit fault."
    case "ThrotLowLmtErr":
      return "Throttle lower limit error."
    case "ThrotUpLmtErr":
      return "Throttle upper limit error."
    case "ThrotStuckErr":
      return "Throttle stuck error."
    case "ThrotRedunErr":
      return "Throttle redundancy error."
    case "QepFlt":
      return "Quadrature encoder pulse fault."
    case "MtrTempCutoffLmtErr":
      return "Motor temperature cutoff limit reached."
    case "CtlrTempCutoffLmtErr":
      return "Controller temperature cutoff limit reached."
    case "UnintendedAccelerationErr":
      return "Unintended acceleration detected."
    case "UnintendedDecelerationErr":
      return "Unintended deceleration detected."
    case "CanErr":
      return "CAN communication error."
    case "UnexpectedParkSenseHighErr":
      return "Unexpected park sense signal high."
    case "ThrotSnsrOcFlt":
      return "Throttle sensor open circuit fault."
    case "ThrotSnsrScFlt":
      return "Throttle sensor short circuit fault."
    case "FnrErr":
      return "Forward/Reverse error detected."
    case "Supply12UvErr":
      return "12V supply undervoltage error."
    case "Supply5UvErr":
      return "5V supply undervoltage error."
    case "HwOverCurrFlt":
      return "Hardware overcurrent fault."
    case "MtrTempCutbackLmtErr":
      return "Motor temperature cutback limit reached."
    case "CtlrTempCutbackLmtErr":
      return "Controller temperature cutback limit reached."
    default:
      return `${code} is active`
  }
}

export default function SystemAlerts({ isConnected }) {
  const [activeErrors, setActiveErrors] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [testWarningMode, setTestWarningMode] = useState(true) // Enabled test mode by default
  const [testCriticalMode, setTestCriticalMode] = useState(true) // Enabled test mode by default

  const allowedAlertCodes = [
    "DcBusOvErr", "DcBusUvErr", "DcBusSnrScFlt", "DcBusSnsrOcFlt", "DcBusLvErr", "PhBCurrSnsrOverCurrFlt", "PhBCurrSnsrScCurrFlt",
    "PhBCurrSnsrOcFlt", "PhBCurrSnsrScFlt", "PhCCurrSnsrOverCurrFlt", "PhCCurrSnsrScCurrFlt", "PhCCurrSnsrOcFlt",
    "PhCCurrSnsrScFlt", "PhACurrSnsrOverCurrFlt", "PhACurrSnsrScCurrFlt", "ThrotLowLmtErr", "ThrotUpLmtErr",
    "ThrotStuckErr", "ThrotRedunErr", "QepFlt", "MtrTempCutoffLmtErr", "CtlrTempCutoffLmtErr", "UnintendedAccelerationErr",
    "UnintendedDecelerationErr", "CanErr", "UnexpectedParkSenseHighErr", "ThrotSnsrOcFlt", "ThrotSnsrScFlt",
    "FnrErr", "Supply12UvErr", "Supply5UvErr", "HwOverCurrFlt", "MtrTempCutbackLmtErr", "CtlrTempCutbackLmtErr"
  ]

  function getRandomActiveErrorsFiltered(errorList, maxCount = 5) {
    const filteredList = errorList.filter(error => allowedAlertCodes.includes(error.code))
    const count = Math.floor(Math.random() * maxCount) + 1
    const shuffled = filteredList.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count).map((error, index) => ({
      id: `${error.code}-${Date.now()}-${index}`,
      ...error,
      message: `${error.code} is active`,
      timestamp: new Date().toLocaleTimeString(),
    }))
  }

  // New function to get only warning errors for test mode
  function getTestWarningErrors() {
    const warningCodes = [
      "MtrTempSnsrOcFlt",
      "MtrTempSnsrScFlt",
      "MtrTempCutbackLmtErr",
      "CtlrTempSnsrOcFlt",
      "CtlrTempSnsrScFlt",
      "CtlrTempCutbackLmtErr",
      "PhACurrSnsrOverCurrFlt"
    ]
    return warningCodes.map((code, index) => ({
      id: `${code}-test-${index}`,
      code,
      type: "warning",
      icon: AlertTriangle,
      message: getCustomMessage(code),
      timestamp: new Date().toLocaleTimeString(),
    }))
  }

  // New function to get only critical errors for test mode
  function getTestCriticalErrors() {
    return allowedAlertCodes.map((code, index) => ({
      id: `${code}-test-${index}`,
      code,
      type: "critical",
      icon: AlertTriangle,
      message: getCustomMessage(code),
      timestamp: new Date().toLocaleTimeString(),
    }))
  }

  useEffect(() => {
    // Show system alerts even when disconnected
    if (!isConnected) {
      if (testCriticalMode && testWarningMode) {
        setActiveErrors([...getTestCriticalErrors(), ...getTestWarningErrors()])
      } else if (testCriticalMode) {
        setActiveErrors(getTestCriticalErrors())
      } else if (testWarningMode) {
        setActiveErrors(getTestWarningErrors())
      } else {
        setActiveErrors([])
      }
      return
    }
    if (testCriticalMode && testWarningMode) {
      setActiveErrors([...getTestCriticalErrors(), ...getTestWarningErrors()])
    } else if (testCriticalMode) {
      setActiveErrors(getTestCriticalErrors())
    } else if (testWarningMode) {
      setActiveErrors(getTestWarningErrors())
    } else {
      const interval = setInterval(() => {
        setActiveErrors(getRandomActiveErrorsFiltered(ERROR_LIST, 10))
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isConnected, testWarningMode, testCriticalMode])

  const criticalCount = activeErrors.filter((e) => e.type === "critical").length
  const warningCount = activeErrors.filter((e) => e.type === "warning").length

  return (
    <>
      <div className="container-full" style={{ padding: "0.1rem 1rem", border: "3px solid #495e70", borderRadius: "8px", backgroundColor: "rgba(255, 255, 255, 0.05)", marginBottom: "1.5rem" }}>
        <div className="alerts-header">
          <div className="alerts-title">
            <Bell size={20} />
            <h3>System Alerts</h3>
          </div>
          <div className="alert-counts">
            {/* Removed critical and warning counts from top right side */}
          </div>
        </div>

        <div className="alerts-columns-full" style={{ display: "flex", gap: "1rem" }}>
          {activeErrors.length === 0 ? (
            <div className="no-alerts">
              <XCircle size={24} />
              <span>All systems operating normally</span>
            </div>
          ) : (
            <>
              <div
                className="alerts-column critical"
                style={{
                  flex: "1",
                  borderRight: "2px solid rgba(128, 128, 128, 0.7)",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  minHeight: "auto",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "0.5rem",
                }}
              >
                <h4 className="column-title">Critical Alerts</h4>
                {activeErrors
                  .filter((alert) => alert.type === "critical")
                  .sort((a, b) => a.code.localeCompare(b.code))  // Sort critical alerts alphabetically
                  .map((alert) => {
                    const IconComponent = alert.icon
                    return (
                      <div key={alert.id} className={`alert-item ${alert.type}`}>
                        <div className="alert-icon">
                          <IconComponent size={18} />
                        </div>
                        <div className="alert-content">
                          <div className="alert-header">
                            <span className="alert-category">{alert.code}</span>
                            <span className="alert-time">{alert.timestamp}</span>
                          </div>
                          <div className="alert-message">{alert.message}</div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div
                className="alerts-column warning"
                style={{
                  flex: "1",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  minHeight: "auto",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "0.5rem",
                }}
              >
                <h4 className="column-title">Warning Alerts</h4>
                {activeErrors
                  .filter((alert) => alert.type === "warning")
                  .map((alert) => {
                    const IconComponent = alert.icon
                    return (
                      <div key={alert.id} className={`alert-item ${alert.type}`}>
                        <div className="alert-icon">
                          <IconComponent size={18} />
                        </div>
                        <div className="alert-content">
                          <div className="alert-header">
                            <span className="alert-category">{alert.code}</span>
                            <span className="alert-time">{alert.timestamp}</span>
                          </div>
          <div className="alert-message">
            <div style={{ fontSize: "0.8em", marginTop: "0.2em" }}>{alert.message}</div>
          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .container-full {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .container {
          display: flex;
          height: 100%;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .left-half {
          flex: 1;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 16px 0 0 16px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        .vertical-divider {
          width: 1px;
          background-color: rgba(34, 197, 94, 0.3);
          margin: 0 1rem;
        }

        .right-half {
          flex: 1;
          padding: 1.5rem;
          background: transparent;
        }

        .alerts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          color: #22c55e;
          flex-wrap: wrap;
          margin-bottom: -2rem;
        }

        .alerts-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .alert-counts {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .alert-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }

        .alert-badge.critical {
          background: #ef4444;
        }

        .alert-badge.warning {
          background: #f59e0b;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
          max-height: calc(100vh - 150px);
        }

        .no-alerts {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem;
          color: #22c55e;
          font-weight: 500;
        }

        .alerts-group {
          margin-bottom: 1rem;
        }

        .group-title {
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 0.5rem;
          color: inherit;
        }

        .alerts-group.critical .group-title {
          color: #ef4444;
        }

        .alerts-group.warning .group-title {
          color: #f59e0b;
        }

        .alert-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.3rem 1rem;
          margin-bottom: 0.3rem;
          min-height: 40px;
          border-left: 4px solid;
          transition: all 0.3s ease;
          cursor: default;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .alert-item.critical {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .alert-item.warning {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .alert-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 0.2rem;
          color: inherit;
        }

        .alert-content {
          flex: 1;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
          font-weight: 600;
          font-size: 0.9rem;
          opacity: 0.85;
        }

        .alert-category {
          font-weight: 700;
        }

        .alert-time {
          font-size: 0.75rem;
          opacity: 0.6;
        }

        .alert-message {
          font-weight: 500;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .container {
            flex-direction: column;
          }

          .left-half,
          .right-half {
            border-radius: 16px;
            padding: 1rem;
          }

          .vertical-divider {
            width: 100%;
            height: 1px;
            margin: 1rem 0;
          }
        }
        @media (max-width: 768px) {
          .container-full {
            padding: 0.1rem 0.5rem;
          }

          .alerts-columns-full {
            flex-direction: column;
          }

          .alerts-column {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            margin-bottom: 1rem;
            border-right: none !important;
          }

          .alerts-column.critical {
            border-right: none !important;
            border-bottom: 2px solid rgba(128, 128, 128, 0.7);
            padding-bottom: 1rem;
          }

          .alert-item {
            padding: 0.75rem;
          }

          .alert-header {
            font-size: 0.85rem;
          }

          .alert-message {
            font-size: 0.8rem;
          }

          .alerts-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .alerts-title h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  )
}
