const fse = require("fs-extra");
const fs = require("fs");
const src = "./upload/temp";
const {
  getDelegationToken,
  getSystemToken,
} = require("../../middleware/hdfsHelper");
const webHDFS = require("webhdfs");
const axios = require("axios");
const parquetschema = require("../../database/parquetSchema");
// const getMonth = require("../../middleware/returnMonth");

const XLSX = require("xlsx");
const parquet = require("parquetjs");
const path = require("path");
const { Readable } = require("stream");
class fileHandler {
  // hdfsUrl = 'https://edlvduna002.ubimarigold.in:14000/webhdfs/v1'
  hdfsUrl = "http://127.0.0.1:50070/webhdfs/v1";
  client;
  systemToken;
  delegationToken;

  constructor() {
    // this.generateToken()
    // const options = {
    //   headers: {
    //     'Authorization': `Negotiate ${this.systemToken}`,
    //     'Content-Type': 'application/octet-stream'
    //   },
    // }
    this.client = webHDFS.createClient({
      user: "aurav",
      host: "127.0.0.1",
      port: 50070,
      protocol: "http",
    });
  }
  async generateToken() {
    this.systemToken = await getSystemToken();
    this.delegationToken = await getDelegationToken(this.systemToken);
    return;
  }

  // async pathExists(vertical_name, year, qtr, report_name) {
  //   const result = await fse.pathExists(
  //     `./upload/uploaded/${vertical_name}/${report_name}/${year}/${qtr}`
  //   );
  //   return result;
  // }

  async pathExists(path) {
    let url;
    url = `${this.hdfsUrl}${path}?user.name=aurav&op=GETFILESTATUS`;
    try {
      await axios.get(url);
      return true;
    } catch (err) {
      if (
        err.response.status == 404 &&
        err.response.data.RemoteException.exception == "FileNotFoundException"
      ) {
        return false;
      }
    }
  }

  async createFolderUploaded(path) {
    let url;
    url = `${this.hdfsUrl}${path}?user.name=aurav&op=MKDIRS`;
    const { data } = await axios.put(url);
    return data;
  }

  async fileExists(fileName, vertical_name, year, qtr, report_name) {
    const result = await fse.pathExists(
      `./upload/uploaded/${vertical_name}/${report_name}/${year}/${qtr}/${fileName}`
    );
    return result;
  }

  // async fileCount(fileName, vertical_name, year, qtr, report_name) {
  //   let files = await fse.readdir(
  //     `./upload/uploaded/${vertical_name}/${report_name}/${year}/${qtr}/`
  //   );
  //   files = this.getFiles(files, fileName);
  //   return files;
  // }

  async fileCount(fileName, path) {
    let url;
    url = `${this.hdfsUrl}${path}?user.name=aurav&op=LISTSTATUS`;

    const { data } = await axios.get(url);

    let files = this.getFiles(data.FileStatuses.FileStatus, fileName);
    return files;
  }

  // async createFolderUploaded(vertical_name, year, qtr, report_name) {
  //   const result = await fse.mkdirp(
  //     `./upload/uploaded/${vertical_name}/${report_name}/${year}/${qtr}/`
  //   );
  //   return result;
  // }

  // async createFolderVerified(vertical_name, year, qtr, report_name) {
  //   const result = await fse.mkdirp(
  //     `./upload/verified/${vertical_name}/${report_name}/${year}/${qtr}/`
  //   );
  //   return result;
  // }

  async createFolderVerified(path) {
    let url;
    url = `${this.hdfsUrl}/ENCRYPTED_LDZ/${path}?user.name=aurav&op=MKDIRS`;
    const { data } = await axios.put(url);
    return data;
  }

  // async moveFileToUploaded(
  //   fileName,
  //   vertical_name,
  //   year,
  //   qtr,
  //   report_name,
  //   fileCount
  // ) {
  //   let newFileName;
  //   if (fileCount.length > 0) {
  //     newFileName = fileName + `_.${fileCount.length + 1}`;
  //   } else {
  //     newFileName = fileName;
  //   }
  //   await fse.move(
  //     `${src}/${fileName}`,
  //     `./upload/uploaded/${vertical_name}/${report_name}/${year}/${qtr}/${newFileName}`
  //   );
  //   return newFileName;
  // }

  // async moveFileToUploaded(
  //   fileName,
  //   vertical_name,
  //   year,
  //   qtr,
  //   report_name,
  //   fileCount
  // ) {
  //   let newFileName;
  //   if (fileCount.length > 0) {
  //     newFileName = fileName + `_.${fileCount.length + 1}`;
  //   } else {
  //     newFileName = fileName;
  //   }
  //   await fse.move(
  //     `${src}/${fileName}`,
  //     `./upload/uploaded/${vertical_name}/${report_name}/${year}/${qtr}/${newFileName}`
  //   );
  //   return newFileName;
  // }

  async moveFileToUploaded(
    fileName,
    vertical_name,
    year,
    qtr,
    report_name,
    fileCount,
    monthly,
    monthName
  ) {
    let newFileName;
    let url;
    if (fileCount.length > 0) {
      let tempFileName = fileName.split(".");
      newFileName =
        tempFileName[0] + `_${fileCount.length + 1}` + "." + tempFileName[1];
    } else {
      newFileName = fileName;
    }

    if (monthly) {
      url = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${monthName}/${qtr}/${newFileName}`;
    } else {
      url = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${qtr}/${newFileName}`;
    }

    return new Promise((resolve, reject) => {
      var localFileStream = fs.createReadStream(`${src}/${fileName}`);
      var remoteStream = this.client.createWriteStream(url, {
        overwrite: "true",
      });

      remoteStream.on("error", (err) => {
        reject(err);
      });

      remoteStream.on("finish", () => {
        fs.unlink(`${src}/${fileName}`, (err) => {
          resolve(newFileName);
        });
      });
      localFileStream.pipe(remoteStream);
      remoteStream.end();
    });
  }
  // getFiles(files, fileName) {
  //   files = files.filter((file) => {
  //     const lastUnderscoreIndex = file.lastIndexOf("_.");
  //     if (lastUnderscoreIndex == -1) {
  //       if (file == fileName) {
  //         return file;
  //       }
  //     } else {
  //       file = file.substring(0, lastUnderscoreIndex);
  //       if (file == fileName) {
  //         return file;
  //       }
  //     }
  //   });
  //   return files;
  // }
  getFiles(files, fileName) {
    files = files.filter((file) => {
      console.log(file.pathSuffix)
      let tempFileName = file.pathSuffix.split(".")[0];
      const lastUnderscoreIndex = tempFileName.lastIndexOf("_");
      if (lastUnderscoreIndex == -1) {
        if (file.pathSuffix == fileName) {
          return file.pathSuffix;
        }
      } else {
        file.pathSuffix =
          tempFileName.substring(0, lastUnderscoreIndex) +
          "." +
          file.pathSuffix.split(".")[1];
        if (file.pathSuffix == fileName) {
          return file.pathSuffix;
        }
      }
    });
    return files;
  }

  // async moveFileToVerified(fileName, vertical_name, year, qtr, report_name, override) {
  //   let newFilename;
  //   const checkFolder = await fse.pathExists(
  //     `./upload/verified/${vertical_name}/${report_name}/${year}/${qtr}`
  //   );
  //   if (!checkFolder) {
  //     await this.createFolderVerified(vertical_name, year, qtr, report_name);
  //   }
  //   newFilename = fileName.split("_")[0]

  //   await fse.move(
  //     `./upload/uploaded/${vertical_name}/${report_name}/${year}/${qtr}/${fileName}`,
  //     `./upload/verified/${vertical_name}/${report_name}/${year}/${qtr}/${newFilename}`
  //   );
  //   return;
  // }

  //Inside verified folder also file will be uploaded and check the append to overwrite raw file after that create a parquet file and overwrite
  async moveFileToHdfsParquet(
    fileName,
    verifiedPath,
    uploadedPath,
    report_name,
    override
  ) {
    //get parget schema forthe report name and create parquet data from the excel.

    let tempFileName = fileName.split(".");

    let newFileName = tempFileName[0].split("_")[0] + "." + tempFileName[1];

    const checkFolder = this.pathExists(verifiedPath);
    if (!checkFolder) {
      await this.createFolderVerified(verifiedPath);
    }
    return new Promise(async (resolve, reject) => {
      await this.readFileFromHdfs(
        `${uploadedPath}/${fileName}`,
        `${src}/${newFileName}`
      );

      // Write file to parquet file
      //convert new excel data to parquet
      let parquetfile = newFileName.split(".");
      parquetfile = parquetfile[0] + ".parquet";
      await this.convertExcelToParquet(
        `${src}/${newFileName}`,
        `${src}/${parquetfile}`,
        report_name
      );

      if (override) {
        var localFileStream = fs.createReadStream(`${src}/${parquetfile}`);
        var remoteStream = this.client.createWriteStream(
          `${verifiedPath}/${parquetfile}`,
          {
            // delegation: `${this.delegationToken}`,
            overwrite: true,
          }
        );
        remoteStream.on("error", (err) => {
          reject(err);
        });
        remoteStream.on("finish", () => {
          fs.unlink(`${src}/${newFileName}`, async (err) => {
            fs.unlink(`${src}/${parquetfile}`, async (err) => {
              resolve(newFileName);
            });
          });
        });
        localFileStream.pipe(remoteStream);
        remoteStream.end();
      } else {
        console.log(`${verifiedPath}/${parquetfile}`);
        await this.readFileFromHdfs(
          `${verifiedPath}/${parquetfile}`,
          `${src}/existing_${parquetfile}`
        );
        const existingTable = await parquet.ParquetReader.openFile(
          `${src}/existing_${parquetfile}`
        );
        const existingData = [];
        let record;
        const cursor = existingTable.getCursor();
        while ((record = await cursor.next())) {
          existingData.push(record);
        }
        await existingTable.close();

        const newTable = await parquet.ParquetReader.openFile(
          `${src}/${parquetfile}`
        );
        const newData = [];
        const newCursor = newTable.getCursor();
        while ((record = await newCursor.next())) {
          newData.push(record);
        }
        await newTable.close();
        const combinedData = existingData.concat(newData);

        // Write combined data to new file
        const schema = existingTable.schema; // Assuming the schema is the same
        const writer = await parquet.ParquetWriter.openFile(
          schema,
          `${src}/new_${parquetfile}`
        );
        for (const row of combinedData) {
          await writer.appendRow(row);
        }
        await writer.close();

        var localFileStream = fs.createReadStream(`${src}/new_${parquetfile}`);

        var remoteStream = this.client.createWriteStream(
          `${verifiedPath}/${parquetfile}`,
          {
            // delegation: `${this.delegationToken}`,
            overwrite: true,
          }
        );
        remoteStream.on("error", (err) => {
          reject(err);
        });
        remoteStream.on("finish", () => {
          fs.unlink(`${src}/${newFileName}`, async (err) => {
            fs.unlink(`${src}/${parquetfile}`, async (err) => {
              fs.unlink(`${src}/new_${parquetfile}`, async (err) => {
                fs.unlink(`${src}/existing_${parquetfile}`, async (err) => {
                  resolve(newFileName);
                });
              });
            });
          });
        });
        localFileStream.pipe(remoteStream);
        remoteStream.end();
      }
    });
  }

  async moveFileToCancelled(fileName, vertical_name, year, qtr, report_name) {
    const checkFolder = await fse.pathExists(
      `./upload/cancelled/${vertical_name}/${report_name}/${year}/${qtr}`
    );
    if (!checkFolder) {
      await this.createFolderVerified(vertical_name, year, qtr, report_name);
    }
    await fse.move(
      `./upload/uploaded/${vertical_name}/${report_name}/${year}/${qtr}/${fileName}`,
      `./upload/cancelled/${vertical_name}/${report_name}/${year}/${qtr}/${fileName}`
    );
    return;
  }

  async downloadFileUploaded(fileName, path) {
    await this.readFileFromHdfs(`${path}/${fileName}`, `${src}/${fileName}`);

    const fileStream = fse.createReadStream(`${src}/${fileName}`);
    return { fileStream: fileStream, filePath: `${src}/${fileName}` };
  }

  async replaceFileToUploaded(fileName, path) {
    return new Promise((resolve, reject) => {
      var localFileStream = fs.createReadStream(`${src}/${fileName}`);

      var remoteStream = this.client.createWriteStream(`${path}/${fileName}`, {
        overwrite: "true",
      });

      remoteStream.on("error", (err) => {
        reject(err.message);
      });

      remoteStream.on("finish", () => {
        fs.unlink(`${src}/${fileName}`, (err) => {
          resolve("");
        });
      });
      localFileStream.pipe(remoteStream);
      remoteStream.end();
    });
    return;
  }

  async downloadTemplate(fileName, vertical_name) {
    const filePath = `./public/template/${vertical_name}/${fileName}`;
    const fileStream = fse.createReadStream(filePath);
    return { fileStream: fileStream, filePath: filePath };
  }

  async readFileFromHdfs(sourcePath, tempPath) {
    try {
      // const url = `${this.hdfsUrl}${sourcePath}?op=OPEN&user.name=edlgapdev&delegation=${this.delegationToken}`;
      const url = `${this.hdfsUrl}${sourcePath}?op=OPEN&user.name=aurav`;
      const response = await axios({
        url: url,
        method: "GET",
        responseType: "stream",
      });
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  async deletFileFromHdfs(sourcePath) {
    try {
      // const url = `${this.hdfsUrl}${sourcePath}?op=DELETE&user.name=edlgapdev&delegation=${this.delegationToken}`;
      const url = `${this.hdfsUrl}${sourcePath}?op=DELETE&user.name=aurav`;

      await axios.delete(sourcePath);
    } catch (err) {
      console.log(err.message);
    }
  }

  async convertExcelToParquet(excelFilePath, parquetFilePath, report_name) {
    // Read Excel file
    const getParquetSchema = await parquetschema.getParquetSchema(report_name);
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0]; // Use the first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Read data as an array of arrays
    const dateColumns = getParquetSchema.datecolumns.split(",");
    if (data.length === 0) {
      console.error("No data found in the Excel file.");
      return;
    }

    // Extract headers and rows
    const headers = data[0];
    const rows = data.slice(2);

    // // Define Parquet schema
    const schema = new parquet.ParquetSchema(getParquetSchema.schema);

    // // Create Parquet writer
    const writer = await parquet.ParquetWriter.openFile(
      schema,
      parquetFilePath
    );

    // // Add rows to Parquet file
    for (const row of rows) {
      const record = headers.reduce((acc, header, index) => {
        if (dateColumns.includes(header)) {
          acc[header] = new Date(row[index]) * 1000 || null;
        } else {
          acc[header] = row[index] || null; // Default to null if value is missing
        }
        return acc;
      }, {});
      await writer.appendRow(record);
    }

    // // Close the Parquet writer
    await writer.close();
    console.log(
      `Data has been successfully converted to Parquet format and saved to ${parquetFilePath}`
    );
  }

  async moveJsonToFlatFiles(json, path, filename) {
    console.log(json)
    //tomorrow morning count files and then store and then store into request wuth file name also create a sequence.
    return new Promise((resolve, reject) => {
      
      const jsonData = JSON.stringify(json);
      const jsonStream = new Readable({
        read() {
          this.push(jsonData);
          this.push(null); // Signal the end of the stream
        }
      });
      const remoteStream = this.client.createWriteStream(`${path}/${filename}`);
      jsonStream
        .pipe(remoteStream)
        .on("error", (err) => {
          reject("Error writing to HDFS:", err);
        })
        .on("finish", () => {
          resolve("JSON data successfully written to HDFS");
        });
    });
  }
}

module.exports = fileHandler;
