const { Client } = require('pg');
const XLSX = require('xlsx');
// Define type mapping from SQL to Parquet
const typeMapping = {
  'smallint': 'INT32',
  'int': 'INT32',
  'bigint': 'INT64',
  'tinyint': 'INT32',
  'bit': 'BOOLEAN',
  'decimal': 'DECIMAL',
  'numeric': 'DECIMAL',
  'float': 'FLOAT',
  'real': 'FLOAT',
  'money': 'DOUBLE',
  'varchar': 'UTF8',
  'char': 'BYTE_ARRAY',
  'text': 'UTF8',
  'nchar': 'UTF8',
  'nvarchar': 'UTF8',
  'ntext': 'UTF8',
  'date': 'TIMESTAMP_MICROS',
  'datetime': 'TIMESTAMP_MICROS',
  'smalldatetime': 'TIMESTAMP_MICROS',
  'timestamp': 'TIMESTAMP_MICROS',
  'time': 'TIMESTAMP_MICROS',
  'binary': 'BYTE_ARRAY',
  'varbinary': 'BYTE_ARRAY',
  'uniqueidentifier': 'FIXED_LEN_BYTE_ARRAY'
};

// Function to create Excel file based on schema
// Function to create Excel file based on schema
// Function to create Excel file based on schema and insert sample data
function generateExcelFromSchemaWithSampleData(columns, outputFileName) {
  const data = [];
  const headerRow = [];
  const typeRow = [];
  const sampleRow = [];

  for (const [colName, colInfo] of Object.entries(columns)) {
    headerRow.push(colName);

    let dataType;
    let sampleValue;

    switch (colInfo.type) {
      case 'INT32':
      case 'INT64':
        dataType = 'Integer';
        sampleValue = 123; // Sample integer value
        break;
      case 'FLOAT':
      case 'DOUBLE':
        dataType = 'Float';
        sampleValue = 123.45; // Sample float value
        break;
      case 'BOOLEAN':
        dataType = 'Boolean';
        sampleValue = true; // Sample boolean value
        break;
      case 'UTF8':
        dataType = 'String';
        sampleValue = 'Sample Text'; // Sample string value
        break;
      case 'BYTE_ARRAY':
      case 'FIXED_LEN_BYTE_ARRAY':
        dataType = 'Binary';
        sampleValue = 'BinaryData'; // Sample binary value
        break;
      case 'TIMESTAMP_MICROS':
        dataType = 'Timestamp';
        sampleValue = new Date().toISOString(); // Sample timestamp value
        break;
      case 'DECIMAL':
        dataType = `Decimal(${colInfo.precision}, ${colInfo.scale})`;
        sampleValue = 123.45; // Sample decimal value
        break;
      default:
        dataType = 'String';
        sampleValue = 'Sample Text'; // Default sample value
        break;
    }

    typeRow.push(dataType);
    sampleRow.push(sampleValue);
  }

  // Add headers, types, and sample data to the Excel sheet
  data.push(headerRow); // Column names
  data.push(typeRow);   // Data types
  data.push(sampleRow); // Sample data

  // Create a new workbook and add a worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Save the workbook to an Excel file
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, outputFileName);
}

// Parse DDL to extract column details
function parseDDL(ddl) {
  const regex = /\[(.*?)\]\s+\[(\w+)\](?:\((\d+)(?:,\s*(\d+))?\))?\s*(NULL|NOT NULL)?/g;
  let match;
  const parsedColumns = {};

  while ((match = regex.exec(ddl)) !== null) {
    const [_, colName, baseType, lengthOrPrecision, scale, nullable] = match;
    const baseTypeLower = baseType.toLowerCase();

    if (baseTypeLower === 'decimal' || baseTypeLower === 'numeric') {
      const precision = lengthOrPrecision ? parseInt(lengthOrPrecision) : null;
      const scaleValue = scale ? parseInt(scale) : 0;
      
      let parquetType;
      if (precision <= 9) parquetType = 'INT32';
      else if (precision <= 18) parquetType = 'INT64';
      else parquetType = 'FIXED_LEN_BYTE_ARRAY';

      parsedColumns[colName] = {
        type: parquetType,
        optional: nullable === 'NULL',
        precision,
        scale: scaleValue
      };
    } else if (baseTypeLower === 'varchar' || baseTypeLower === 'char') {
      parsedColumns[colName] = {
        type: 'UTF8',
        optional: nullable === 'NULL',
        length: lengthOrPrecision ? parseInt(lengthOrPrecision) : null
      };
    } else {
      const parquetType = typeMapping[baseTypeLower] || 'BYTE_ARRAY';
      parsedColumns[colName] = {
        type: parquetType,
        optional: nullable === 'NULL'
      };
    }
  }

  return parsedColumns;
}

// Generate Parquet schema from parsed columns
function generateParquetSchema(columns) {
  const schema = {};

  for (const [colName, colInfo] of Object.entries(columns)) {
    const columnSchema = { type: colInfo.type, optional: colInfo.optional };

    if (colInfo.type === 'UTF8' && 'length' in colInfo) {
      columnSchema.length = colInfo.length;
    }

    if (['INT32', 'INT64', 'FIXED_LEN_BYTE_ARRAY'].includes(colInfo.type) && 'precision' in colInfo) {
      columnSchema.precision = colInfo.precision;
      columnSchema.scale = colInfo.scale;
    }

    schema[colName] = columnSchema;
  }

  return schema;
}

// Generate Hive DDL from Parquet schema
function generateHiveExternalTableDDL(parquetSchema, tableName,) {
  const parquetToHive = {
    'INT32': 'INT',
    'INT64': 'BIGINT',
    'FLOAT': 'FLOAT',
    'DOUBLE': 'DOUBLE',
    'BOOLEAN': 'BOOLEAN',
    'UTF8': length => `VARCHAR(${length})`,
    'BYTE_ARRAY': 'BINARY',
    'FIXED_LEN_BYTE_ARRAY': 'BINARY',
    'TIMESTAMP_MICROS': 'TIMESTAMP',
    'TIME_MICROS': 'STRING',
    'DECIMAL': (precision, scale) => `DECIMAL(${precision}, ${scale})`
  };

  let ddl = `CREATE EXTERNAL TABLE ${tableName} (\n`;

  for (const [colName, colInfo] of Object.entries(parquetSchema)) {
    let colType = parquetToHive[colInfo.type];
    const nullable = colInfo.optional ? 'NULL' : 'NOT NULL';

    if (typeof colType === 'function') {
      colType = colType((colInfo.length?colInfo.length:99) || colInfo.precision, colInfo.scale || 0);
    }

    ddl += `    ${colName} ${colType} ${nullable},\n`;
  }

  ddl = ddl.replace(/,\n$/, '\n)');

  return ddl;
}

// Save schema to PostgreSQL
async function saveSchemaToPostgres(schema,tableName) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '1234',
    port: 5432
  });

  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS parquet_schemas (
      id SERIAL PRIMARY KEY,
      schema JSONB,
      tableName varchar,
      dateColumns varchar
    )
  `);

  await client.query(`
    INSERT INTO parquet_schemas (schema,tableName,dateColumns)
    VALUES ($1,$2,$3)
  `, [JSON.stringify(schema),tableName,'DbtDt,LosDt,UpgrdDt,NPADt']);

  await client.end();
}

// Example usage
(async () => {
  const ddl = `
CREATE TABLE [dbo].[SMR2Branch](
  [SMR2_BranchId] [int] IDENTITY(1,1) NOT NULL,
	[QEnd_date] [varchar](20) NOT NULL,
	[Report_Date] [datetime] NULL,
	[Validation_Status] [varchar](20) NULL,
	[BranchName] [varchar](30) NULL,
	[Region] [varchar](80) NULL,
	[Zone] [varchar](20) NULL,
	[State] [varchar](20) NULL,
	[District] [varchar](20) NULL,
	[BranchCategory] [varchar](20) NULL,
	[RiskClass] [varchar](20) NULL,
	[AuthoriCashHoldLimit] [varchar](20) NULL,
	[DealingBranch] [varchar](20) NULL,
	[GoldHeld] [varchar](20) NULL,
	[No_CashVans] [varchar](20) NULL,
	[No_AGAuthorised] [varchar](20) NULL,
	[No_AGPosted_Bank] [varchar](20) NULL,
	[No_AGPosted_OutSoursed] [varchar](20) NULL,
	[ElectAlarm] [varchar](20) NULL,
	[FireAlarm] [varchar](20) NULL,
	[CollapGate] [varchar](20) NULL,
	[RollingShutter] [varchar](20) NULL,
	[NightLatch] [varchar](20) NULL,
	[StrongRoom] [varchar](20) NULL,
	[NormalCashvan] [varchar](20) NULL,
	[ArmouredCashVan] [varchar](20) NULL,
	[CCTV] [varchar](20) NULL,
	[TimeLock] [varchar](20) NULL,
	[DepositVault] [varchar](20) NULL,
	[PoliceArmGuaProvided] [varchar](20) NULL,
	[ClockGuards] [varchar](20) NULL,
	[HotLineTele] [varchar](20) NULL,
	[TotalATMs] [varchar](20) NULL,
	[NoATM_SecGua] [varchar](20) NULL,
	[SolId] [varchar](10) NULL,
	[CashSafe] [varchar](20) NULL,
	[tot_No_ATM_CT] [varchar](20) NULL,
	[Water_Type] [varchar](20) NULL,
	[DCP_Type] [varchar](20) NULL,
	[CO2_Type] [varchar](20) NULL,
	[ABC_Type] [varchar](20) NULL,
	["NoOfGuns"] [varchar](20) NULL,
	[GuardType] [varchar](20) NULL,
	[TotalSGBankOwned] [varchar](20) NULL,
)
  `;
  
  const parsedColumns = parseDDL(ddl);
  const parquetSchema = generateParquetSchema(parsedColumns);
  // generateExcelFromSchemaWithSampleData(parsedColumns, 'AdvCustNPAdetail.xlsx');s
  console.log(parquetSchema);
  const hiveDDL = generateHiveExternalTableDDL(parquetSchema, 'smr2Branch');
  console.log(hiveDDL);
  const tableName = 'AdvCustNPAdetail'
  // await saveSchemaToPostgres(parquetSchema,tableName);
})();
