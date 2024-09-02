function getParquetSchema(name) {
    const parquetSchema = {
        'branchDetails':{
          SMR2_BranchId: { type: 'INT32', optional: false },
          QEnd_date: { type: 'UTF8', optional: false, length: 20 },
          Report_Date: { type: 'TIMESTAMP_MICROS', optional: true },
          Validation_Status: { type: 'UTF8', optional: true, length: 20 },
          BranchName: { type: 'UTF8', optional: true, length: 30 },
          Region: { type: 'UTF8', optional: true, length: 80 },
          Zone: { type: 'UTF8', optional: true, length: 20 },
          State: { type: 'UTF8', optional: true, length: 20 },
          District: { type: 'UTF8', optional: true, length: 20 },
          BranchCategory: { type: 'UTF8', optional: true, length: 20 },
          RiskClass: { type: 'UTF8', optional: true, length: 20 },
          AuthoriCashHoldLimit: { type: 'UTF8', optional: true, length: 20 },
          DealingBranch: { type: 'UTF8', optional: true, length: 20 },
          GoldHeld: { type: 'UTF8', optional: true, length: 20 },
          No_CashVans: { type: 'UTF8', optional: true, length: 20 },
          No_AGAuthorised: { type: 'UTF8', optional: true, length: 20 },
          No_AGPosted_Bank: { type: 'UTF8', optional: true, length: 20 },
          No_AGPosted_OutSoursed: { type: 'UTF8', optional: true, length: 20 },
          ElectAlarm: { type: 'UTF8', optional: true, length: 20 },
          FireAlarm: { type: 'UTF8', optional: true, length: 20 },
          CollapGate: { type: 'UTF8', optional: true, length: 20 },
          RollingShutter: { type: 'UTF8', optional: true, length: 20 },
          NightLatch: { type: 'UTF8', optional: true, length: 20 },
          StrongRoom: { type: 'UTF8', optional: true, length: 20 },
          NormalCashvan: { type: 'UTF8', optional: true, length: 20 },
          ArmouredCashVan: { type: 'UTF8', optional: true, length: 20 },
          CCTV: { type: 'UTF8', optional: true, length: 20 },
          TimeLock: { type: 'UTF8', optional: true, length: 20 },
          DepositVault: { type: 'UTF8', optional: true, length: 20 },
          PoliceArmGuaProvided: { type: 'UTF8', optional: true, length: 20 },
          ClockGuards: { type: 'UTF8', optional: true, length: 20 },
          HotLineTele: { type: 'UTF8', optional: true, length: 20 },
          TotalATMs: { type: 'UTF8', optional: true, length: 20 },
          NoATM_SecGua: { type: 'UTF8', optional: true, length: 20 },
          SolId: { type: 'UTF8', optional: true, length: 10 },
          CashSafe: { type: 'UTF8', optional: true, length: 20 },
          tot_No_ATM_CT: { type: 'UTF8', optional: true, length: 20 },
          Water_Type: { type: 'UTF8', optional: true, length: 20 },
          DCP_Type: { type: 'UTF8', optional: true, length: 20 },
          CO2_Type: { type: 'UTF8', optional: true, length: 20 },
          ABC_Type: { type: 'UTF8', optional: true, length: 20 },
          '"NoOfGuns"': { type: 'UTF8', optional: true, length: 20 },
          GuardType: { type: 'UTF8', optional: true, length: 20 },
          TotalSGBankOwned: { type: 'UTF8', optional: true, length: 20 }
        },
        'guardDetail':{
          SMR2_BranchId: { type: 'INT32', optional: false },
          Guard_Name: { type: 'UTF8', optional: true, length: 30 },
          Guard_PFNo: { type: 'UTF8', optional: true, length: 20 },
          Guard_DOB: { type: 'TIMESTAMP_MICROS', optional: true },
          Guard_Joindate: { type: 'TIMESTAMP_MICROS', optional: true }
        }
    };

  
    return parquetSchema;
  }

  module.exports = convertJsonSchemaToParquet