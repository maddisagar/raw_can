import { AlertTriangle } from "lucide-react"

const WARNING_ALERTS_LIST = [
  { code: "MtrTempSnsrOcFlt", type: "warning", icon: AlertTriangle },
  { code: "MtrTempSnsrScFlt", type: "warning", icon: AlertTriangle },
  { code: "MtrTempCutbackLmtErr", type: "warning", icon: AlertTriangle },
  { code: "CtlrTempSnsrOcFlt", type: "warning", icon: AlertTriangle },
  { code: "CtlrTempSnsrScFlt", type: "warning", icon: AlertTriangle },
  { code: "CtlrTempCutbackLmtErr", type: "warning", icon: AlertTriangle },
  { code: "PhACurrSnsrOverCurrFlt", type: "warning", icon: AlertTriangle },
  // Add other errors as needed
]

export function getCustomMessage(code) {
  switch (code) {
    case "MtrTempSnsrOcFlt":
      return "Motor temp sensor disconnected or faulty; check wiring."
    case "MtrTempSnsrScFlt":
      return "Motor temp sensor shorted; inspect for wiring issues."
    case "MtrTempCutbackLmtErr":
      return "Motor is overheating; performance reduced to protect system."
    case "CtlrTempSnsrOcFlt":
      return "Controller temp sensor not responding; verify connection."
    case "CtlrTempSnsrScFlt":
      return "Controller temp sensor short detected; check for faults."
    case "CtlrTempCutbackLmtErr":
      return "Controller overheating; system performance limited."
    case "PhACurrSnsrOverCurrFlt":
      return "High AC current detected; possible short or overload condition."
    default:
      return `${code} is active`
  }
}

export default WARNING_ALERTS_LIST
