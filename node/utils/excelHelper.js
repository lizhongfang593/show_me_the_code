// import fs from 'fs';
// import Excel from 'exceljs';

// import XLSX from 'xlsx';

// import { XLSX as XLSXEXTRACT } from 'xlsx-extract';

var fs = require('fs');
var Excel = require('exceljs');
var XLSX = require('xlsx');
var XLSXEXTRACT = require('xlsx-extract').XLSX;


// 从 Excel 文件 读取
// 输入： 文件路径
// 输出： [ [ DATA_MATRIX ] ]
export const ReadExcel = function (filePath) {
    return ExportFromExcelWithXLSX(filePath);
    // return ExportFromExcelWithXLSXEXTRACT(filePath);
}

export const ReadExcelToJsonRaws = function (filePath) {
    return ExportFromExcelWithXLSX(filePath);
    // return ExportFromExcelWithXLSXEXTRACT(filePath);
}

const ExportFromExcelWithXLSXEXTRACT = function (filePath) {
    return new Promise(function (resolve, reject) {
        let totalRows = [];
        let xlsxExtract = new XLSXEXTRACT();
        xlsxExtract.extract(filePath, { sheet_all: true, raw_values: true, parser:"expat" })
            .on('row', function (row) { totalRows.push(row); })
            .on('end', function (err) {
                if (err) {
                    return reject(err);
                }
                xlsxExtract = null;
                return resolve(totalRows);
            });
    })
}

const ExportFromExcelWithXLSX = function (filePath) {
    let workbook = XLSX.readFile(filePath); //workbook就是xls文档对象

    let sheetNames = workbook.SheetNames; //获取表明

    var result = [];
    for (var i = 0; i < sheetNames.length; i++) {
        result.push({
            sheetName: sheetNames[i],
            data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[i]])
        })
    }

    let sheet = workbook.Sheets[sheetNames[0]]; //通过表明得到表对象

    return Promise.resolve(result); //通过工具将表对象的数据读出来并转成json

    
}






// 写入 Excel 文件
// 参数 sheetDatas: [ { name: 'SheetName', data: [[DATA_MATRIX]] }... ]
// 参数 filePath: 目标路径

export const WriteExcel = function (sheetDatas, filePath) {
    return ExportToExcelWithBasicXLSX(sheetDatas, filePath);
}

const ExportToExcelWithBasicXLSX = function (sheetDatas, filePath) {
    var workbook = XLSX.utils.book_new();

    for (let i = 0; i < sheetDatas.length; i++) {
        const sheet = sheetDatas[i];
        let worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name || ('sheet'+ (i + 1)));
    }

    return XLSX.writeFile(workbook, filePath, { bookSST: true, compression: true });
}