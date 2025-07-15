import { decodeCANFrame } from './canDecoder.js';

// Helper: create Uint8Array from array of bits
function bitsToBytes(bits) {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  bits.forEach((bit, index) => {
    if (bit) {
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      bytes[byteIndex] |= (1 << bitIndex);
    }
  });
  return bytes;
}

// Test data for DT007_B001_Status (ID 0x615)
const dt007AllZeroBits = new Uint8Array(8);
const dt007AllOneBits = bitsToBytes(Array(26).fill(1).concat(Array(38).fill(0)));

// Test data for DT008_B002 (ID 0x616)
const dt008Min = new Uint8Array(8);
const dt008Max = new Uint8Array([
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00
]);

// Test data for DT009_B003 (ID 0x617)
const dt009Min = new Uint8Array(8);
const dt009Max = new Uint8Array([
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
]);

// Assertion helper with value display
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    console.error(`❌ ${message}: Expected ${expected}, Got ${actual}`);
  } else {
    console.log(`✅ ${message}: ${actual}`);
  }
}

// Test DT007_B001_Status
function testDecodeDT007() {
  console.log('📝 Testing DT007_B001_Status...');

  let decoded = decodeCANFrame(0x615, dt007AllZeroBits);
  console.log("Data: All Zero Bits");
  Object.entries(decoded).forEach(([key, value]) => {
    assertEqual(value, false, `DT007 ${key}`);
  });

  decoded = decodeCANFrame(0x615, dt007AllOneBits);
  console.log("Data: All One Bits (for bits 0-25)");
  Object.entries(decoded).forEach(([key, value]) => {
    assertEqual(value, true, `DT007 ${key}`);
  });
}

// Test DT008_B002
function testDecodeDT008() {
  console.log('📝 Testing DT008_B002...');

  let decoded = decodeCANFrame(0x616, dt008Min);
  console.log("Data: Min Values (All Zeros)");
  assertEqual(decoded.CtrlrTemp1, -100.0, 'CtrlrTemp1');
  assertEqual(decoded.CtrlrTemp2, -100.0, 'CtrlrTemp2');
  assertEqual(decoded.CtrlrTemp, -100.0, 'CtrlrTemp');
  assertEqual(decoded.MtrTemp, -100.0, 'MtrTemp');

  decoded = decodeCANFrame(0x616, dt008Max);
  const maxTemp = 4095 * 0.1 - 100; // = 309.5
  console.log("Data: Max Values (0xFFF for each)");
  assertEqual(Math.round(decoded.CtrlrTemp1 * 10) / 10, 309.5, 'CtrlrTemp1');
  assertEqual(Math.round(decoded.CtrlrTemp2 * 10) / 10, 309.5, 'CtrlrTemp2');
  assertEqual(Math.round(decoded.CtrlrTemp * 10) / 10, 309.5, 'CtrlrTemp');
  assertEqual(Math.round(decoded.MtrTemp * 10) / 10, 309.5, 'MtrTemp');
}

// Test DT009_B003
function testDecodeDT009() {
  console.log('📝 Testing DT009_B003...');

  let decoded = decodeCANFrame(0x617, dt009Min);
  console.log("Data: Min Values (All Zeros)");
  assertEqual(decoded.AcCurrMeaRms, 0.0, 'AcCurrMeaRms');
  assertEqual(decoded.DcCurrEstd, -300.0, 'DcCurrEstd');
  assertEqual(decoded.DcBusVolt, 0.0, 'DcBusVolt');
  assertEqual(decoded.MtrSpd, -12000.0, 'MtrSpd');
  assertEqual(decoded.ThrotVolt, 0.0, 'ThrotVolt');

  decoded = decodeCANFrame(0x617, dt009Max);
  console.log("Data: Max Values (All 0xFF)");

  // Raw decoded values (from raw max)
  assertEqual(Math.round(decoded.AcCurrMeaRms * 10) / 10, 819.1, 'AcCurrMeaRms (raw max)');
  assertEqual(Math.round(decoded.DcCurrEstd * 10) / 10, 1338.3, 'DcCurrEstd (raw max)');
  assertEqual(Math.round(decoded.DcBusVolt * 10) / 10, 102.3, 'DcBusVolt (raw max)');
  assertEqual(Math.round(decoded.MtrSpd * 10) / 10, 14214.3, 'MtrSpd (raw max)');
  assertEqual(Math.round(decoded.ThrotVolt * 100) / 100, 5.11, 'ThrotVolt (raw max)');

  // Clamped values
  console.log("→ Clamped Values per DBC limits");
  assertEqual(decoded.AcCurrMeaRmsClamped, 400.0, 'AcCurrMeaRms Clamped');
  assertEqual(decoded.DcBusVoltClamped, 100.0, 'DcBusVolt Clamped');
  assertEqual(decoded.MtrSpdClamped, 12000.0, 'MtrSpd Clamped');
}

// Run all tests
function runTests() {
  testDecodeDT007();
  testDecodeDT008();
  testDecodeDT009();
}

runTests();
