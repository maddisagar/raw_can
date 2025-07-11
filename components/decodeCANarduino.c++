void decodeCANMessage(uint32_t messageID, uint8_t* data, uint8_t length) {
  switch (messageID) {
    case DBC_V08_1_DT007_B001_STATUS_FRAME_ID:
      if (!dbc_v08_1_dt007_b001_status_unpack(&canData_status, (const uint8_t*)data, length)) {
        canData.ECO_BOOST     = dbc_v08_1_dt007_b001_status_eco_boost_decode(canData_status.eco_boost);
        canData.LHM           = dbc_v08_1_dt007_b001_status_limp_home_mode_decode(canData_status.limp_home_mode);
        canData.BRAKE         = dbc_v08_1_dt007_b001_status_brake_decode(canData_status.brake);
        canData.FORWARD       = dbc_v08_1_dt007_b001_status_forward_decode(canData_status.forward);
        canData.REVERSE       = dbc_v08_1_dt007_b001_status_reverse_decode(canData_status.reverse);
        canData.NEUTRAL       = dbc_v08_1_dt007_b001_status_neutral_decode(canData_status.neutral);
        canData.HILLHOLD_FLAG = dbc_v08_1_dt007_b001_status_hillhold_mode_decode(canData_status.hillhold_mode);
        canData.REGEN_FLAG    = dbc_v08_1_dt007_b001_status_regen_mode_decode(canData_status.regen_mode);
        canData.THROTTLE_FLAG = dbc_v08_1_dt007_b001_status_throt_mode_decode(canData_status.throt_mode);
        canData.ASC_FLAG      = dbc_v08_1_dt007_b001_status_asc_mode_decode(canData_status.asc_mode);
        canData.SHS           = dbc_v08_1_dt007_b001_status_snsr_health_status_decode(canData_status.snsr_health_status);
        canData.SHS_DC_BUS    = dbc_v08_1_dt007_b001_status_snsr_health_status_dc_bus_decode(canData_status.snsr_health_status_dc_bus);
        canData.SHS_12V       = dbc_v08_1_dt007_b001_status_snsr_health_status12_v_decode(canData_status.snsr_health_status12_v);
        canData.SHS_5V        = dbc_v08_1_dt007_b001_status_snsr_health_status5_v_decode(canData_status.snsr_health_status5_v);
        canData.SHS_B_PH      = dbc_v08_1_dt007_b001_status_snsr_health_status_ph_b_curr_decode(canData_status.snsr_health_status_ph_b_curr);
        canData.SHS_C_PH      = dbc_v08_1_dt007_b001_status_snsr_health_status_ph_c_curr_decode(canData_status.snsr_health_status_ph_c_curr);
        canData.SHS_ENCODER   = dbc_v08_1_dt007_b001_status_snsr_health_status_qep_decode(canData_status.snsr_health_status_qep);
        canData.SHS_CONTOLLER_TEMP1 = dbc_v08_1_dt007_b001_status_snsr_health_status_ctlr_temp1_decode(canData_status.snsr_health_status_ctlr_temp1);
        canData.SHS_CONTOLLER_TEMP2 = dbc_v08_1_dt007_b001_status_snsr_health_status_ctlr_temp2_decode(canData_status.snsr_health_status_ctlr_temp2);
        canData.SHS_MOTOR_TEMP      = dbc_v08_1_dt007_b001_status_snsr_health_status_mtr_temp_decode(canData_status.snsr_health_status_mtr_temp);
        canData.SHS_THROTTLE1       = dbc_v08_1_dt007_b001_status_snsr_health_status_throt1_decode(canData_status.snsr_health_status_throt1);
        canData.SHS_THROTTLE2       = dbc_v08_1_dt007_b001_status_snsr_health_status_throt2_decode(canData_status.snsr_health_status_throt2);
        canData.PC_MODE             = dbc_v08_1_dt007_b001_status_pc_mode_enable_decode(canData_status.pc_mode_enable);
        canData.START_STOP          = dbc_v08_1_dt007_b001_status_start_stop_decode(canData_status.start_stop);
        canData.DCU_MODE            = dbc_v08_1_dt007_b001_status_dcu_control_mode_status_decode(canData_status.dcu_control_mode_status);
        canData.IDLE_SHUTDOWN       = dbc_v08_1_dt007_b001_status_idle_shutdown_decode(canData_status.idle_shutdown);
      }
      break;

    case DBC_V08_1_DT008_B002_FRAME_ID:
      if (!dbc_v08_1_dt008_b002_unpack(&canData_msg1, (const uint8_t*)data, length)) {
        canData.CONTROLLER_TEMP1 = dbc_v08_1_dt008_b002_ctrlr_temp1_decode(canData_msg1.ctrlr_temp1);
        canData.CONTROLLER_TEMP2 = dbc_v08_1_dt008_b002_ctrlr_temp2_decode(canData_msg1.ctrlr_temp2);
        canData.CONTROLLER_TEMP  = dbc_v08_1_dt008_b002_ctrlr_temp_decode(canData_msg1.ctrlr_temp);
        canData.MOTOR_TEMP       = dbc_v08_1_dt008_b002_mtr_temp_decode(canData_msg1.mtr_temp);
      }
      break;

    case DBC_V08_1_DT009_B003_FRAME_ID:
      if (!dbc_v08_1_dt009_b003_unpack(&canData_msg2, (const uint8_t*)data, length)) {
        canData.AC_CURRENT   = dbc_v08_1_dt009_b003_ac_curr_mea_rms_decode(canData_msg2.ac_curr_mea_rms);
        canData.DC_CURRENT   = dbc_v08_1_dt009_b003_dc_curr_estd_decode(canData_msg2.dc_curr_estd);
        canData.DC_BUS_VOLT  = dbc_v08_1_dt009_b003_dc_bus_volt_decode(canData_msg2.dc_bus_volt);
        canData.MOTOR_SPEED  = dbc_v08_1_dt009_b003_mtr_spd_decode(canData_msg2.mtr_spd);
        canData.THROTTLE_VOLT = dbc_v08_1_dt009_b003_throt_volt_decode(canData_msg2.throt_volt);
         
        Serial.print("AC_CURRENT: ");
        Serial.println(canData.AC_CURRENT);
        Serial.print("DC_CURRENT: ");
        Serial.println(canData.DC_CURRENT);
        Serial.print("DC_BUS_VOLT: ");
        Serial.println(canData.DC_BUS_VOLT);
        Serial.print("MOTOR_SPEED: ");
        Serial.println(canData.MOTOR_SPEED);
        Serial.print("THROTTLE_VOLT: ");
        Serial.println(canData.THROTTLE_VOLT);  
      }
      break;
  }
}
