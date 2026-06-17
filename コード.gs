// スプレッドシートのシート名
const SHEET_NAME = 'シート1';
// スクリプトプロパティのキー名
const PROPERTY_WEBHOOK_URL = 'CHAT_WEBHOOK_URL';

/**
 * メインの通知処理関数
 * レコード追加時や再トライトリガーで実行されます。
 */
function processNotifications() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  const range = sheet.getDataRange();
  const data = range.getValues();
  const header = data.shift(); // ヘッダー除去
  if (data.length === 0) return;

  const webhookUrl = PropertiesService.getScriptProperties().getProperty(PROPERTY_WEBHOOK_URL);
  if (!webhookUrl) return console.error('Webhook URLが未設定です。');

  let hasError = false;
  const remainingRows = []; // シートに残す（エラーになった）行を格納する配列

  data.forEach(([mention, message, status]) => {
    if (!mention && !message) return; // 空行はスキップ
    
    try {
      const uid = getUserIdByEmail(String(mention).trim()),
            mentionText = uid !== null ? `<users/${getUserIdByEmail(String(mention).trim())}>` : `@${String(mention).trim()}`,
            response = UrlFetchApp.fetch(webhookUrl, {
              method: "post",
              headers: { "Content-Type": "application/json" },
              payload: JSON.stringify({ text: `${mentionText}\n${message}` }),
              muteHttpExceptions: true
            });
      
      if (response.getResponseCode() !== 200) throw new Error();
      // 成功した場合は、remainingRows に追加しない（＝削除される）
      
    } catch (error) {
      // エラーの場合はフラグを更新して、残す配列に追加
      remainingRows.push([mention, message, 'エラー']);
      hasError = true;
    }
  });

  // 最後にシートを一括更新
  sheet.clearContents(); // 一旦クリア
  
  // ヘッダーと残ったエラー行を結合して書き込み
  const outputData = [header, ...remainingRows];
  sheet.getRange(1, 1, outputData.length, header.length).setValues(outputData);

  if (hasError) setRetryTrigger();
}

/**
 * emailアドレスからユーザーIDを逆引きする（現状、Workspaceで一定の権限ないと動作しない）
 */
function getUserIdByEmail(email) {
  try {
    // 【重要】メールアドレスから見えない特殊文字（ゼロ幅スペース等）を強制排除
    if (email) {
      email = email.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    }

    // viewTypeを指定してユーザー情報を取得
    const user = AdminDirectory.Users.get(email, { viewType: 'domain_public' });
    return user.id; 
  } catch (e) {
    console.error("ユーザー情報の取得に失敗しました: " + e.message);
    return null;
  }
}

/**
 * 10分後に再トライするトリガーをセットする
 */
function setRetryTrigger() {
  const triggerName = 'retryProcess';
  
  // 既存の再実行トリガーをクリア（重複防止）
  deleteTriggerByName(triggerName);
  
  // 10分後 (10 * 60 * 1000 ミリ秒) にトリガーを設定
  ScriptApp.newTrigger(triggerName)
    .timeBased()
    .after(10 * 60 * 1000)
    .create();
}

/**
 * 再トライ時に実行される関数
 */
function retryProcess() {
  const triggerName = 'retryProcess';
  // 実行されたので自身のトリガーを削除
  deleteTriggerByName(triggerName);
  
  // 再度通知処理を実行
  processNotifications();
}

/**
 * 指定した関数名のトリガーを削除するヘルパー関数
 */
function deleteTriggerByName(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  for (let trigger of triggers) {
    if (trigger.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

/**
 * 初回設定用: 変更時のトリガーを自動設定する関数
 * ※一度だけ手動で実行してください。
 */
function setupTrigger() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 既存の同名トリガーがあれば削除（二重登録防止）
  deleteTriggerByName('processNotifications');
  
  // スプレッドシートが変更（追加・編集等）された時に processNotifications を実行
  ScriptApp.newTrigger('processNotifications')
    .forSpreadsheet(sheet)
    .onChange()
    .create();
    
  Browser.msgBox("トリガーの設定が完了しました。以降、スプレッドシートへの入力時に自動で動作します。");
}
