"use client"

import { useState, useEffect } from "react"
import GraphContainer from "./graph-container"

// Sample test data generator for graph testing
const generateSampleHistory = () => {
  const now = new Date()
  const history = []
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(now.getTime() - (100 - i) * 60000).toISOString() // 1 min intervals
    history.push({
      timestamp,
      temp616: {
        CtlrTemp1: 40 + Math.sin(i / 10) * 5,
        CtlrTemp2: 42 + Math.cos(i / 10) * 5,
        CtlrTemp: 41 + Math.sin(i / 15) * 4,
        MtrTemp: 50 + Math.cos(i / 8) * 6,
      },
      measurement617: {
        AcCurrMeaRms: 60 + Math.sin(i / 5) * 10,
        DcCurrEstd: 35 + Math.cos(i / 7) * 8,
        DcBusVolt: 340 + Math.sin(i / 6) * 15,
        MtrSpd: 1500 + Math.cos(i / 4) * 300,
        ThrotVolt: 3 + Math.sin(i / 3) * 0.5,
      },
      status615: {
        LimpHomeMode: i % 20 < 10 ? 1 : 0,
        EcoBoost: i % 15 < 7 ? 1 : 0,
        RegenMode: i % 25 < 12 ? 1 : 0,
        Forward: i % 30 < 15 ? 1 : 0,
        Reverse: i % 40 < 20 ? 1 : 0,
        Brake: i % 10 < 5 ? 1 : 0,
      },
    })
  }
  return history
}

export default function TestGraphSample() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const sampleData = generateSampleHistory()
    setHistory(sampleData)
  }, [])

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Test Graph Sample Page</h2>
      <GraphContainer mode="individual" fullView={true} darkMode={false} history={history} />
    </div>
  )
}
