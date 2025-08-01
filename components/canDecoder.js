/**
 * CAN Decoder module to decode raw CAN frames based on dbc_v08_1 definitions.
 * This mimics the decoding logic from dbc_v08_1.c and decodeCANMessage function.
 */

const DBC_V08_1_DT007_B001_STATUS_FRAME_ID = 0x615;
const DBC_V08_1_DT008_B002_FRAME_ID = 0x616;
const DBC_V08_1_DT009_B003_FRAME_ID = 0x617;

/**
 * Helper functions for bit extraction from data bytes.
 */
function getBit(data, bitIndex) {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitPos = bitIndex % 8;
  return (data[byteIndex] >> bitPos) & 0x01;
}

function getBits(data, startBit, length) {
  // Extract bits starting at startBit for length bits (little endian)
  let value = 0;
  for (let i = 0; i < length; i++) {
    const bit = getBit(data, startBit + i);
    value |= (bit << i);
  }
  return value;
}

/**
 * Decode functions for signals in DT007_B001_Status message.
 * These are simple boolean or uint8 decodes as per dbc.
 */
function decodeBoolean(value) {
  return value !== 0;
}

/**
 * Decode DT007_B001_Status message signals from raw data bytes.
 * Returns an object with decoded signals.
 */
function decodeDT007_B001_Status(data) {
  // data is Uint8Array or array of bytes length 8
  return {
    ThrotMode: decodeBoolean(getBit(data, 0)),
    EcoBoost: decodeBoolean(getBit(data, 1)),
    LimpHomeMode: decodeBoolean(getBit(data, 2)),
    Brake: decodeBoolean(getBit(data, 3)),
    Forward: decodeBoolean(getBit(data, 4)),
    Reverse: decodeBoolean(getBit(data, 5)),
    Neutral: decodeBoolean(getBit(data, 6)),
    HillholdMode: decodeBoolean(getBit(data, 7)),
    RegenMode: decodeBoolean(getBit(data, 8)),
    DcuControlModeStatus: decodeBoolean(getBit(data, 9)),
    AscMode: decodeBoolean(getBit(data, 10)),
    SnsrHealthStatus: decodeBoolean(getBit(data, 11)),
    SnsrHealthStatusDcBus: decodeBoolean(getBit(data, 12)),
    SnsrHealthStatus12V: decodeBoolean(getBit(data, 13)),
    SnsrHealthStatus5V: decodeBoolean(getBit(data, 14)),
    SnsrHealthStatusPhBCurr: decodeBoolean(getBit(data, 15)),
    SnsrHealthStatusPhCCurr: decodeBoolean(getBit(data, 16)),
    SnsrHealthStatusThrot1: decodeBoolean(getBit(data, 17)),
    SnsrHealthStatusQep: decodeBoolean(getBit(data, 19)),
    SnsrHealthStatusCtlrTemp1: decodeBoolean(getBit(data, 21)),
    SnsrHealthStatusMtrTemp: decodeBoolean(getBit(data, 20)),
    SnsrHealthStatusThrot2: decodeBoolean(getBit(data, 18)),
    SnsrHealthStatusCtlrTemp2: decodeBoolean(getBit(data, 22)),
    PcModeEnable: decodeBoolean(getBit(data, 23)),
    StartStop: decodeBoolean(getBit(data, 24)),
    IdleShutdown: decodeBoolean(getBit(data, 25)),
  };
}

/**
 * Decode DT008_B002 message signals from raw data bytes.
 * Temperatures with scale 0.1 and offset -100.
 */
function decodeTemperature(rawValue) {
  return rawValue * 0.1 - 100.0;
}

function decodeDT008_B002(data) {
  // data length 8 bytes
  const ctrlr_temp1 = data[0] | ((data[1] & 0x0F) << 8);
  const ctrlr_temp2 = ((data[1] >> 4) & 0x0F) | (data[2] << 4);
  const ctrlr_temp = data[3] | ((data[4] & 0x0F) << 8);
  const mtr_temp = ((data[4] >> 4) & 0x0F) | (data[5] << 4);

  return {
    CtlrTemp1: decodeTemperature(ctrlr_temp1),
    CtlrTemp2: decodeTemperature(ctrlr_temp2),
    CtlrTemp: decodeTemperature(ctrlr_temp),
    MtrTemp: decodeTemperature(mtr_temp),
  };
}

/**
 * Decode DT009_B003 message signals from raw data bytes.
 * Signals with scale and offset as per dbc.
 */
function decodeDT009_B003(data) {
  // data length 8 bytes
  const ac_curr_mea_rms = data[0] | ((data[1] & 0x1F) << 8);
  const dc_curr_estd = ((data[1] >> 5) & 0x07) | (data[2] << 3) | ((data[3] & 0x03) << 11);
  const dc_bus_volt = ((data[3] >> 2) & 0x3F) | ((data[4] & 0x0F) << 6);
  const mtr_spd = ((data[4] >> 4) & 0x0F) | (data[5] << 4) | ((data[6] & 0x3F) << 12);
  const throt_volt = ((data[6] >> 6) & 0x03) | (data[7] << 2);

  return {
    AcCurrMeaRms: ac_curr_mea_rms * 0.1,
    DcCurrEstd: (dc_curr_estd * 0.1) - 300.0,
    DcBusVolt: dc_bus_volt * 0.1,
    MtrSpd: (mtr_spd * 0.1) - 12000.0,
    ThrotVolt: throt_volt * 0.01,
  };
}

/**
 * Main decode function for raw CAN frame.
 * @param {number} messageID - CAN message ID
 * @param {Uint8Array} data - CAN data bytes
 * @returns {object|null} Decoded signals object or null if unknown ID
 */
export function decodeCANFrame(messageID, data) {
  switch (messageID) {
    case DBC_V08_1_DT007_B001_STATUS_FRAME_ID:
      return decodeDT007_B001_Status(data);
    case DBC_V08_1_DT008_B002_FRAME_ID:
      return decodeDT008_B002(data);
    case DBC_V08_1_DT009_B003_FRAME_ID:
      return decodeDT009_B003(data);
    case 0x03:
      // System Alerts: decode 6 bytes (48 bits) into DBC-defined fault/warning/error codes
      const bitToCode = [
        // Byte 0
        'CanErr', 'CtrlrTempCutbackLmtErr', 'CtrlrTempCutoffLmtErr', 'CtrlrTempSnsrOcFlt',
        'CtrlrTempSnsrScFlt', 'DcBusOvErr', 'DcBusSnsrOcFlt', 'DcBusSnsrScFlt',
        // Byte 1
        'DcBusUvErr', 'MtrTempCutbackLmtErr', 'MtrTempCutoffLmtErr', 'MtrTempSnsrOcFlt',
        'MtrTempSnsrScFlt', 'PhBCurrSnsrOcFlt', 'PhBCurrSnsrOverCurrFlt', 'PhBCurrSnsrScCurrFlt',
        // Byte 2
        'PhBCurrSnsrScFlt', 'PhCCurrSnsrOcFlt', 'PhCCurrSnsrOverCurrFlt', 'PhCCurrSnsrScCurrFlt',
        'PhCCurrSnsrScFlt', 'QepFlt', 'SocLowLmtErr', 'ThrotLowLmtErr',
        // Byte 3
        'ThrotRedunErr', 'ThrotStuckErr', 'ThrotUpLmtErr', 'UnexpectedParkSenseHighErr',
        'UnintendedAccelerationErr', 'UnintendedDecelerationErr', 'DcBusLvErr', 'ThrotSnsrOcFlt',
        // Byte 4
        'ThrotSnsrScFlt', 'FnrErr', 'FnrWarn', 'Supply12SnsrOcFlt',
        'Supply5SnsrOcFlt', 'Supply12UvErr', 'Supply5UvErr', 'HwOverCurrFlt',
        // Byte 5
        'Type_0_Err', 'Type_1_Err', 'Type_2_Err', 'Type_3_Err',
        'Type_4_Err', 'QepFlt_2', 'PhACurrSnsrOverCurrFlt', 'PhACurrSnsrScCurrFlt'
      ];
      const result = {};
      for (let i = 0; i < bitToCode.length; i++) {
        const byte = Math.floor(i / 8);
        const bit = i % 8;
        if (data[byte] !== undefined) {
          result[bitToCode[i]] = !!((data[byte] >> bit) & 1);
        }
      }
      return result;
    default:
      return null;
  }
}