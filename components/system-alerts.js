"use client"

import { useData } from "./data-context"
import { AlertTriangle, XCircle, Bell } from "lucide-react"

export default function SystemAlerts() {
  const { isConnected, alerts } = useData()

  const criticalAlerts = alerts.filter(alert => alert.type === "critical")
  const warningAlerts = alerts.filter(alert => alert.type === "warning")

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
          {!isConnected || (criticalAlerts.length === 0 && warningAlerts.length === 0) ? (
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
                {criticalAlerts
                  .sort((a, b) => a.id.localeCompare(b.id))  // Sort critical alerts alphabetically by id
                  .map((alert) => {
                    const IconComponent = AlertTriangle
                    return (
                      <div key={alert.id} className={`alert-item critical`}>
                        <div className="alert-icon">
                          <IconComponent size={18} />
                        </div>
                        <div className="alert-content">
                          <div className="alert-header">
                            <span className="alert-category">{alert.category || alert.code || "Critical"}</span>
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
                {warningAlerts
                  .sort((a, b) => a.id.localeCompare(b.id))  // Sort warning alerts alphabetically by id
                  .map((alert) => {
                    const IconComponent = AlertTriangle
                    return (
                      <div key={alert.id} className={`alert-item warning`}>
                        <div className="alert-icon">
                          <IconComponent size={18} />
                        </div>
                        <div className="alert-content">
                          <div className="alert-header">
                            <span className="alert-category">{alert.category || alert.code || "Warning"}</span>
                            <span className="alert-time">{alert.timestamp}</span>
                          </div>
                          <div className="alert-message">{alert.message}</div>
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

        .alerts-columns-full {
          display: flex;
          gap: 1rem;
        }

        .alerts-column {
          flex: 1;
          padding-left: 1rem;
          padding-right: 1rem;
          min-height: auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          margin-bottom: 0.5rem;
        }

        .alerts-column.critical {
          border-right: 2px solid rgba(128, 128, 128, 0.7);
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

        .no-alerts {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem;
          color: #22c55e;
          font-weight: 500;
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
