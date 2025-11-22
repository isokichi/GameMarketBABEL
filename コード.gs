function doGet(e) {
  const spreadsheetId = '1xl_wmsqNffZdqQWyhHY4PLrWXK0NoV1LpIhhxHn3yDc'; // ユーザーが提供したスプレッドシートID
  const sheetName = 'シート1'; // デフォルトのシート名。必要に応じて変更してください。

  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' が見つかりません。` }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    if (e.parameter.action === 'getChartData') {
      const range = sheet.getRange('C4:F11');
      const values = range.getValues(); // 二次元配列として取得

      // 取得した値をフラットなオブジェクトに変換
      const chartData = {};
      const startRow = range.getRow();
      const startCol = range.getColumn();

      for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < values[i].length; j++) {
          const row = startRow + i;
          const col = startCol + j;
          const colLetter = String.fromCharCode('A'.charCodeAt(0) + col - 1); // 列番号を文字に変換
          const cellName = `${colLetter}${row}`;
          chartData[cellName] = values[i][j];
        }
      }

      Logger.log(`[getChartData] Data: ${JSON.stringify(chartData)}`);
      return ContentService.createTextOutput(JSON.stringify(chartData))
                           .setMimeType(ContentService.MimeType.JSON);
    } else if (e.parameter.action === 'getNextBonus') {
      const b19 = sheet.getRange('B19').getValue();
      const c19 = sheet.getRange('C19').getValue();
      const d19 = sheet.getRange('D19').getValue();
      const e19 = sheet.getRange('E19').getValue();
      return ContentService.createTextOutput(JSON.stringify({ b19: b19, c19: c19, d19: d19, e19: e19 }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    else {
      // デフォルトのA1セルの情報取得
      const a1Value = sheet.getRange('A1').getValue();
      return ContentService.createTextOutput(JSON.stringify({ a1Value: a1Value.toString() }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function resetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName("シート1 のコピー"); // 初期状態（数式あり）
  const target = ss.getSheetByName("シート1");          // 現在の作業シート

  // 初期シート全体の範囲
  const sourceRange = source.getRange("C4:F11");
  
  // ターゲット側にも同じ範囲を取得
  const targetRange = target.getRange(
    4, 
    3,
    sourceRange.getNumRows(),
    sourceRange.getNumColumns()
  );

  // 完全コピー（数式・背景色・書式すべて）
  sourceRange.copyTo(targetRange, {contentsOnly: false}); 

  //次以降のボーナスを一行上にコピペ
  const nextbonus = target.getRange(20,2,target.getLastRow(),4).getValues()
  target.getRange(19,2,target.getLastRow(),4).setValues(nextbonus)
  SpreadsheetApp.flush()
}
