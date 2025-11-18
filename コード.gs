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
      const c11 = sheet.getRange('C11').getValue();
      const d11 = sheet.getRange('D11').getValue();
      const e11 = sheet.getRange('E11').getValue();
      const f11 = sheet.getRange('F11').getValue();
      return ContentService.createTextOutput(JSON.stringify({ c11: c11, d11: d11, e11: e11, f11: f11 }))
                           .setMimeType(ContentService.MimeType.JSON);
    } else {
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
  const sourceRange = source.getDataRange();
  
  // ターゲット側にも同じ範囲を取得
  const targetRange = target.getRange(
    1, 
    1,
    sourceRange.getNumRows(),
    sourceRange.getNumColumns()
  );

  // 完全コピー（数式・背景色・書式すべて）
  sourceRange.copyTo(targetRange, {contentsOnly: false}); 
}
