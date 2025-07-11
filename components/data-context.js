"use client"

import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react"
import { decodeCANFrame } from "./canDecoder"

const DataContext = createContext()

const decodedDataQueueRef = { current: [] }

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

const getWebSocketUrl = () => {
  return "ws://192.168.137.57:81"
}

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
    newData.measurement617 = { ...newData.measurement617, ...sanitizedSignals }
  } else {
    // For faults or other message IDs, merge into faults
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
  const [history, setHistory] = useState([])
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
    if (typeof window === "undefined") return

    const wsUrl = getWebSocketUrl()
    console.log("Connecting to WebSocket:", wsUrl)
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log("WebSocket connection opened")
      setIsConnected(true)
    }

    socket.onmessage = (event) => {
      console.log("WebSocket message received:", event.data)
      try {
        // Check if event.data is a JSON string before parsing
        if (event.data && (event.data.startsWith("{") || event.data.startsWith("["))) {
          const message = JSON.parse(event.data)
          if (message && typeof message === "object") {
            if (message.timestamp) {
              // Existing handling for messages with timestamp
              setCurrentData((prevData) => ({
                ...prevData,
                ...message,
              }))
              setHistory((prevHistory) => [...prevHistory, message])
            } else if (
              typeof message.id === "number" &&
              typeof message.dlc === "number" &&
              Array.isArray(message.data)
            ) {
              // New handling for raw CAN frames
              const decodedSignals = decodeCANFrame(message.id, message.data)
              if (decodedSignals) {
                // Throttle decoding to 1ms using a timestamp check
                const now = Date.now()
                if (!decodedDataQueueRef.lastDecodeTime || now - decodedDataQueueRef.lastDecodeTime >= 50) {
                  decodedDataQueueRef.lastDecodeTime = now
                  setCurrentData((prevData) => {
                    const merged = mergeDecodedSignals(prevData, decodedSignals, message.id)
                    return {
                      ...merged,
                      timestamp: new Date().toISOString(),
                    }
                  })
                  setHistory((prevHistory) => [...prevHistory, { ...decodedSignals, timestamp: new Date().toISOString() }])
                  setDisplayData(decodedSignals) // Set display data to show for 700ms
                  // Clear display data after 700ms
                  if (decodedDataQueueRef.displayTimeout) {
                    clearTimeout(decodedDataQueueRef.displayTimeout)
                  }
                  decodedDataQueueRef.displayTimeout = setTimeout(() => {
                    setDisplayData(null)
                  }, 700)
                }
              } else {
                console.warn("Unknown CAN message ID, cannot decode:", message.id)
              }
            } else {
              console.warn("Received non-data WebSocket message:", event.data)
            }
          } else {
            console.warn("Received non-data WebSocket message:", event.data)
          }
        } else {
          // Handle non-JSON messages gracefully, e.g., ignore or log
          console.warn("Received non-JSON WebSocket message:", event.data)
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    socket.onerror = (error) => {
      if (error && error.message) {
        console.error("WebSocket error:", error.message)
      } else {
        console.error("WebSocket error:", JSON.stringify(error))
      }
    }

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.reason)
      setIsConnected(false)
    }

    return () => {
      console.log("Closing WebSocket connection")
      socket.close()
    }
  }, [])


  const aggregateDailyReport = (date) => {
    if (!history || history.length === 0) return null
    const dayData = history.filter((item) => item.timestamp.startsWith(date))
    if (dayData.length === 0) return null

    const criticalAlertsCount = dayData.reduce((count, item) => {
      return count + (item.status615?.LimpHomeMode ? 1 : 0)
    }, 0)

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

  // Temperature alerts
  if (currentData.temp616.MtrTemp > 70) {
    newAlerts.push({
      id: `motor-temp-${Date.now()}`,
      type: "critical",
      category: "Temperature",
      message: `Motor temperature critical: ${currentData.temp616.MtrTemp.toFixed(1)}°C`,
      timestamp,
      value: currentData.temp616.MtrTemp,
      threshold: 70,
    })
  }

  if (currentData.temp616.CtlrTemp1 > 65 || currentData.temp616.CtlrTemp2 > 65) {
    newAlerts.push({
      id: `controller-temp-${Date.now()}`,
      type: "warning",
      category: "Temperature",
      message: `Controller temperature high: ${Math.max(currentData.temp616.CtlrTemp1, currentData.temp616.CtlrTemp2).toFixed(1)}°C`,
      timestamp,
      value: Math.max(currentData.temp616.CtlrTemp1, currentData.temp616.CtlrTemp2),
      threshold: 65,
    })
  }

  // Voltage alerts
  if (currentData.measurement617.DcBusVolt > 450 || currentData.measurement617.DcBusVolt < 250) {
    newAlerts.push({
      id: `voltage-${Date.now()}`,
      type: currentData.measurement617.DcBusVolt > 450 ? "critical" : "warning",
      category: "Electrical",
      message: `DC Bus voltage ${currentData.measurement617.DcBusVolt > 450 ? "overvoltage" : "undervoltage"}: ${currentData.measurement617.DcBusVolt.toFixed(1)}V`,
      timestamp,
      value: currentData.measurement617.DcBusVolt,
      threshold: currentData.measurement617.DcBusVolt > 450 ? 450 : 250,
    })
  }

  // Current alerts
  if (currentData.measurement617.AcCurrMeaRms > 80) {
    newAlerts.push({
      id: `current-${Date.now()}`,
      type: "warning",
      category: "Electrical",
      message: `AC Current high: ${currentData.measurement617.AcCurrMeaRms.toFixed(1)}A`,
      timestamp,
      value: currentData.measurement617.AcCurrMeaRms,
      threshold: 80,
    })
  }

  // System status alerts
  if (currentData.status615.LimpHomeMode) {
    newAlerts.push({
      id: `limp-mode-${Date.now()}`,
      type: "critical",
      category: "System",
      message: "Vehicle in Limp Home Mode",
      timestamp,
      value: "ACTIVE",
      threshold: "OFF",
    })
  }

  // Sensor health alerts
  const sensorHealthIssues = Object.entries(currentData.status615)
    .filter(([key, value]) => key.startsWith("SnsrHealthStatus") && !value)
    .map(([key]) => key.replace("SnsrHealthStatus", ""))

  if (sensorHealthIssues.length > 0) {
    newAlerts.push({
      id: `sensor-health-${Date.now()}`,
      type: "warning",
      category: "Sensors",
      message: `Sensor health issues: ${sensorHealthIssues.join(", ")}`,
      timestamp,
      value: sensorHealthIssues.length,
      threshold: 0,
    })
  }

  // Fault alerts from DTFS001_Type
  if (currentData.faults) {
    Object.entries(currentData.faults).forEach(([faultKey, faultValue]) => {
      if (faultValue) {
        newAlerts.push({
          id: `fault-${faultKey}-${Date.now()}`,
          type: "critical",
          category: "Fault",
          message: `System fault detected: ${faultKey}`,
          timestamp,
          value: "ACTIVE",
          threshold: "OFF",
        })
      }
    })
  }

  return newAlerts
}
