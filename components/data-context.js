// FileName: MultipleFiles/data-context.js
// FileContents:
"use client"

import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react"
import { decodeCANFrame } from "./canDecoder"
import CRITICAL_ALERTS_LIST from "./critical-alerts-list"
import WARNING_ALERTS_LIST, { getCustomMessage } from "./warning-alerts-list"

const DataContext = createContext()

const decodedDataQueueRef = { current: [] }

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

import { createWebSocket } from "./websocketurl"


// Helper function to merge decoded signals into currentData categories
function mergeDecodedSignals(currentData, decodedSignals, messageID) {
  const newData = { ...currentData }

  // Sanitize decodedSignals: convert any NaN or non-numeric values to 0 for numeric keys
  const sanitizedSignals = {}
  for (const [key, value] of Object.entries(decodedSignals)) {
    if (typeof value === "number") {
      sanitizedSignals[key] = Number.isNaN(value) ? 0 : value
    } else {
      sanitizedSignals[key] = value
    }
  }

  // Map messageID to category keys
  // Correct mapping for actual CAN IDs
  if (messageID === 0x615) {
    newData.status615 = { ...newData.status615, ...sanitizedSignals }
  } else if (messageID === 0x616) {
    newData.temp616 = { ...newData.temp616, ...sanitizedSignals }
  } else if (messageID === 0x617) {
    // Normalize MtrSpd: if between -1 and +1, set to 0
    const mergedMeasurement = { ...newData.measurement617, ...sanitizedSignals }
    if (typeof mergedMeasurement.MtrSpd === "number" && mergedMeasurement.MtrSpd > -1 && mergedMeasurement.MtrSpd < 1) {
      mergedMeasurement.MtrSpd = 0
    }
    newData.measurement617 = mergedMeasurement
  } else if (messageID === 0x03) { // Only update faults for system alerts CAN ID (0x03)
    newData.faults = { ...newData.faults, ...sanitizedSignals }
  }

  // Normalize keys to avoid undefined values causing UI errors
  // Define expected keys for each category with default values
  const statusKeys = [
    "EcoBoost", "LimpHomeMode", "Brake", "Forward", "Reverse", "Neutral", "HillholdMode", "RegenMode",
    "ThrotMode", "AscMode", "SnsrHealthStatus", "SnsrHealthStatusDcBus", "SnsrHealthStatus12V",
    "SnsrHealthStatus5V", "SnsrHealthStatusPhBCurr", "SnsrHealthStatusPhCCurr", "SnsrHealthStatusThrot1",
    "SnsrHealthStatusQep", "SnsrHealthStatusCtlrTemp1", "SnsrHealthStatusMtrTemp", "SnsrHealthStatusThrot2",
    "SnsrHealthStatusCtlrTemp2", "PcModeEnable", "StartStop", "DcuControlModeStatus", "IdleShutdown"
  ]

  const tempKeys = ["CtlrTemp1", "CtlrTemp2", "CtlrTemp", "MtrTemp"]

  const measurementKeys = ["AcCurrMeaRms", "DcCurrEstd", "DcBusVolt", "MtrSpd", "ThrotVolt"]

  const faultKeys = [
    "CanErr", "DcBusOvErr", "DcBusSnrScFlt", "DcBusUvErr", "MtrTempCutbackLmtErr", "CtlrTempCutbackLmtErr",
    "MtrTempCutoffLmtErr", "CtlrTempCutoffLmtErr", "MtrTempSnsrOcFlt", "CtlrTempSnsrOcFlt", "MtrTempSnsrScFlt",
    "CtlrTempSnsrScFlt", "PhBCurrSnsrOverCurrFlt", "PhBCurrSnsrScCurrFlt", "PhBCurrSnsrScFlt", "DcBusSnsrOcFlt",
    "PhBCurrSnsrOcFlt", "PhCCurrSnsrOcFlt", "PhCCurrSnsrOverCurrFlt", "PhCCurrSnsrScCurrFlt", "PhCCurrSnsrScFlt",
    "QepFlt", "SocLowLmtErr", "ThrotLowLmtErr", "ThrotRedunErr", "ThrotStuckErr", "ThrotUpLmtErr",
    "UnexpectedParkSenseHighErr", "UnintendedAccelerationErr", "UnintendedDecelerationErr", "ThrotSnsrOcFlt",
    "ThrotSnsrScFlt", "FnrErr", "FnrWarn", "Supply12SnsrOcFlt", "Supply5SnsrOcFlt", "Supply12UvErr", "Supply5UvErr",
    "HwOverCurrFlt", "Type_0_Err", "Type_1_Err", "Type_2_Err", "Type_3_Err", "Type_4_Err", "QepFlt_2",
    "PhACurrSnsrOverCurrFlt", "PhACurrSnsrScCurrFlt", "DcBusLvErr"
  ]

  // Fill missing keys with default values
  for (const key of statusKeys) {
    if (!(key in newData.status615)) {
      newData.status615[key] = false
    }
  }

  for (const key of tempKeys) {
    if (!(key in newData.temp616)) {
      newData.temp616[key] = 0
    }
  }

  for (const key of measurementKeys) {
    if (!(key in newData.measurement617)) {
      newData.measurement617[key] = 0
    }
  }

  for (const key of faultKeys) {
    if (!(key in newData.faults)) {
      newData.faults[key] = false
    }
  }

  return newData
}

export const DataProvider = ({ children }) => {
  const [currentData, setCurrentData] = useState({
    timestamp: new Date().toISOString(),
    status615: {},
    temp616: {},
    measurement617: {},
    faults: {},
  })
  const [displayData, setDisplayData] = useState(null) // New state for controlling display duration
  const [history, setHistory] = useState(() => {
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem("canHistory")
      return storedHistory ? JSON.parse(storedHistory) : []
    }
    return []
  })
  const [dailyReports, setDailyReports] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dailyReports")
      if (stored) {
        return JSON.parse(stored)
      } else {
        const startDate = new Date("2026-06-20")
        const today = new Date()
        const reports = {}
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10)
          reports[dateStr] = {
            criticalAlertsCount: Math.floor(Math.random() * 50),
            systemModesCounts: {
              regenMode: Math.floor(Math.random() * 100),
              ascMode: Math.floor(Math.random() * 100),
              hillHold: Math.floor(Math.random() * 100),
              limp: Math.floor(Math.random() * 50),
              idleShutdown: Math.floor(Math.random() * 100),
            },
            temperatureStats: {
              minMotorTemp: (Math.random() * 20 + 40).toFixed(1),
              maxMotorTemp: (Math.random() * 20 + 60).toFixed(1),
              minControllerTemp: (Math.random() * 20 + 30).toFixed(1),
              maxControllerTemp: (Math.random() * 20 + 60).toFixed(1),
            },
          }
        }
        return reports
      }
    }
    return {}
  })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dailyReports", JSON.stringify(dailyReports))
    }
  }, [dailyReports])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("canHistory", JSON.stringify(history))
    }
  }, [history])

  useEffect(() => {
    if (typeof window === "undefined") return;

    let socket = null;
    let reconnectInterval = null;

    const connectWebSocket = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Already connected
        return;
      }

      socket = createWebSocket();
      if (!socket) return;

      const onOpen = () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
      };

      const onMessage = (event) => {
        console.log("WebSocket message received:", event.data);
        try {
          if (event.data && (event.data.startsWith("{") || event.data.startsWith("["))) {
            const message = JSON.parse(event.data);
            if (message && typeof message === "object") {
              if (message.timestamp) {
                setCurrentData((prevData) => ({
                  ...prevData,
                  ...message,
                }));
              } else if (
                typeof message.id === "number" &&
                typeof message.dlc === "number" &&
                Array.isArray(message.data)
              ) {
                const decodedSignals = decodeCANFrame(message.id, message.data);
                if (decodedSignals) {
                  const now = Date.now();
                  if (!decodedDataQueueRef.lastDecodeTime || now - decodedDataQueueRef.lastDecodeTime >= 10) {
                    decodedDataQueueRef.lastDecodeTime = now;
                    setCurrentData((prevData) => {
                      const merged = mergeDecodedSignals(prevData, decodedSignals, message.id);
                      const newTimestamp = new Date().toISOString();
                      setHistory((prevHistory) => {
                        const updated = [...prevHistory, { ...merged, timestamp: newTimestamp }];
                        return updated.length > 200 ? updated.slice(-200) : updated;
                      });
                      return {
                        ...merged,
                        timestamp: newTimestamp,
                      };
                    });
                    setDisplayData(decodedSignals);
                    if (decodedDataQueueRef.displayTimeout) {
                      clearTimeout(decodedDataQueueRef.displayTimeout);
                    }
                    decodedDataQueueRef.displayTimeout = setTimeout(() => {
                      setDisplayData(null);
                    }, 700);
                  }
                } else {
                  console.warn("Unknown CAN message ID, cannot decode:", message.id);
                }
              } else {
                console.warn("Received non-data WebSocket message:", event.data);
              }
            } else {
              console.warn("Received non-data WebSocket message:", event.data);
            }
          } else {
            console.warn("Received non-JSON WebSocket message:", event.data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      const onError = (error) => {
        if (error && error.message) {
          console.error("WebSocket error:", error.message);
        } else {
          console.error("WebSocket error:", JSON.stringify(error));
        }
      };

      const onClose = (event) => {
        console.log("❌ WebSocket closed:", event.reason);
        setIsConnected(false);
        if (!reconnectInterval) {
          reconnectInterval = setInterval(() => {
            if (!socket || socket.readyState === WebSocket.CLOSED) {
              connectWebSocket();
            }
          }, 10);
        }
      };

      socket.addEventListener("open", onOpen);
      socket.addEventListener("message", onMessage);
      socket.addEventListener("error", onError);
      socket.addEventListener("close", onClose);
    };

    connectWebSocket();

    return () => {
      if (reconnectInterval) clearInterval(reconnectInterval);
      if (socket) socket.close();
    };
  }, []);


  const aggregateDailyReport = (date) => {
    if (!history || history.length === 0) return null
    const dayData = history.filter((item) => item.timestamp.startsWith(date))
    if (dayData.length === 0) return null

    // Calculate critical alerts count based on the alerts generated for each history item
    const criticalAlertsCount = dayData.reduce((count, item) => {
      const alerts = calculateAlerts(item);
      return count + alerts.filter(alert => alert.type === "critical").length;
    }, 0);

    const systemModesCounts = {
      regenMode: dayData.reduce((sum, item) => sum + (item.status615?.RegenMode ? 1 : 0), 0),
      ascMode: dayData.reduce((sum, item) => sum + (item.status615?.AscMode ? 1 : 0), 0),
      hillHold: dayData.reduce((sum, item) => sum + (item.status615?.HillholdMode ? 1 : 0), 0),
      limp: dayData.reduce((sum, item) => sum + (item.status615?.LimpHomeMode ? 1 : 0), 0),
      idleShutdown: dayData.reduce((sum, item) => sum + (item.status615?.IdleShutdown ? 1 : 0), 0),
    }

    const motorTemps = dayData.map((item) => item.temp616?.MtrTemp).filter((t) => typeof t === "number")
    const controllerTemps1 = dayData.map((item) => item.temp616?.CtlrTemp1).filter((t) => typeof t === "number")
    const controllerTemps2 = dayData.map((item) => item.temp616?.CtlrTemp2).filter((t) => typeof t === "number")

    const minMotorTemp = motorTemps.length ? Math.min(...motorTemps) : null
    const maxMotorTemp = motorTemps.length ? Math.max(...motorTemps) : null

    const minControllerTemp =
      controllerTemps1.length && controllerTemps2.length
        ? Math.min(Math.min(...controllerTemps1), Math.min(...controllerTemps2))
        : null
    const maxControllerTemp =
      controllerTemps1.length && controllerTemps2.length
        ? Math.max(Math.max(...controllerTemps1), Math.max(...controllerTemps2))
        : null

    return {
      criticalAlertsCount,
      systemModesCounts,
      temperatureStats: {
        minMotorTemp,
        maxMotorTemp,
        minControllerTemp,
        maxControllerTemp,
      },
    }
  }

  useEffect(() => {
    const updateDailyReport = () => {
      const today = new Date().toISOString().slice(0, 10)
      const report = aggregateDailyReport(today)
      if (report) {
        setDailyReports((prev) => ({ ...prev, [today]: report }))
      }
    }

    updateDailyReport()

    const now = new Date()
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()

    const timeoutId = setTimeout(() => {
      updateDailyReport()
      setInterval(updateDailyReport, 24 * 60 * 60 * 1000)
    }, msUntilMidnight)

    return () => {
      clearTimeout(timeoutId)
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history])

  // The rest of the useEffect code remains unchanged

  const alerts = useMemo(() => calculateAlerts(currentData), [currentData])

  // Function to get report by date or date range
  const getReportsByDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return null
    const reports = {}
    const currentDate = new Date(startDate)
    const lastDate = new Date(endDate)
    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().slice(0, 10)
      if (dailyReports[dateStr]) {
        reports[dateStr] = dailyReports[dateStr]
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return reports
  }

  return (
    <DataContext.Provider
      value={{
        currentData,
        history,
        dailyReports,
        isConnected,
        alerts,
        getReportsByDateRange,
        displayData, // Expose displayData for dynamic rendering
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// Sample fallback data for when WebSocket is not connected
const sampleWebSocketData = {
  timestamp: new Date().toISOString(),
  status615: {
    EcoBoost: true,
    LimpHomeMode: false,
    Brake: true,
    Forward: true,
    Reverse: false,
    Neutral: true,
    HillholdMode: false,
    RegenMode: true,
    ThrotMode: false,
    AscMode: true,
    SnsrHealthStatus: true,
    SnsrHealthStatusDcBus: true,
    SnsrHealthStatus12V: true,
    SnsrHealthStatus5V: true,
    SnsrHealthStatusPhBCurr: true,
    SnsrHealthStatusPhCCurr: true,
    SnsrHealthStatusThrot1: true,
    SnsrHealthStatusQep: true,
    SnsrHealthStatusCtlrTemp1: true,
    SnsrHealthStatusMtrTemp: true,
    SnsrHealthStatusThrot2: true,
    SnsrHealthStatusCtlrTemp2: true,
    PcModeEnable: true,
    StartStop: false,
    DcuControlModeStatus: true,
    IdleShutdown: false,
  },
  temp616: {
    CtlrTemp1: 45.3,
    CtlrTemp2: 47.8,
    CtlrTemp: 46.5,
    MtrTemp: 55.2,
  },
  measurement617: {
    AcCurrMeaRms: 65.4,
    DcCurrEstd: 40.2,
    DcBusVolt: 350.7,
    MtrSpd: 1800,
    ThrotVolt: 3.2,
  },
  faults: {},
}

export function calculateAlerts(currentData) {
  if (!currentData.temp616 || !currentData.measurement617 || !currentData.status615) return []

  const newAlerts = []
  const timestamp = new Date().toLocaleString()

  // Debug: Log currentData faults and status615
  console.log("[calculateAlerts] faults:", currentData.faults);
  console.log("[calculateAlerts] status615:", currentData.status615);

  // Generate critical alerts only from CRITICAL_ALERTS_LIST based on currentData.faults and status615
  CRITICAL_ALERTS_LIST.forEach(alert => {
    const code = alert.code
    let isActive = false

    // Check in faults
    if (currentData.faults && currentData.faults[code]) {
      isActive = true
    }
    // Check in status615
    else if (currentData.status615 && currentData.status615[code]) {
      isActive = true
    }

    if (isActive) {
      newAlerts.push({
        id: `critical-${code}-${Date.now()}`,
        type: "critical",
        category: alert.category || "Critical",
        code: code,
        message: alert.message || `${code} is active`,
        timestamp,
      })
    }
  })

  // Generate warning alerts only from WARNING_ALERTS_LIST based on currentData.status615 and faults
  WARNING_ALERTS_LIST.forEach(alert => {
    const code = alert.code
    let isActive = false

    // Check in faults
    if (currentData.faults && currentData.faults[code]) {
      isActive = true
    }
    // Check in status615
    else if (currentData.status615 && currentData.status615[code]) {
      isActive = true
    }

    if (isActive) {
      newAlerts.push({
        id: `warning-${code}-${Date.now()}`,
        type: "warning",
        category: alert.category || "Warning",
        code: code,
        message: alert.message || getCustomMessage(code) || `${code} is active`,
        timestamp,
      })
    }
  })

  // Debug: Log generated alerts
  console.log("[calculateAlerts] generated alerts:", newAlerts);

  return newAlerts
}