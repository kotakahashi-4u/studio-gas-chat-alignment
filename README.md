# WorkspaceStudio × GAS による同一チャットへの通知の実現

## 最終的なゴール
1. 特定のスペースにユーザーがチャットを送信する
2. WorkspaceStudioがチャットの送信をトリガーとして動作する（例えば、NotebookLMへの問い合わせなど）
3. 同一のチャットスペースに回答を送信する

## 事前準備
1. スプレッドシートの準備
   以下のような構成のスプレッドシートを準備する。
   <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/54925355-1021-4e88-81f2-f4e424fa5e37" />  
     
2. 特定のスペースの準備　
   1. WorkspaceStudioを介してやり取りを行うスペースを準備する。
   2. スペースの設定において、着信Webhookを追加する。  
      ※この時、作成したWebhookのURLは後ほど利用するため、控えておく。
      <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/660adeed-3f91-460b-8d35-981fc0f1d5fe" />  

## 同一チャットへの通知実現に向けた手順
1. WorkspaceStudioより「フローの新規作成」を押下する。
   <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/d7954827-856b-4783-99ea-aa7d7520b289" />  
2. 開始条件の選択にて、「チャット メッセージを受信したとき」を選択する。
   <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/54f90d7c-5f0b-463b-8c4b-1dbc83b9df7c" />  
3. 「チャット メッセージを受信したとき」の詳細設定として、以下の通り設定を行う。
   * 会話の種類別
   * 会話の種類: スペースと名前付きグループDM
   * スペース: 事前準備において作成したスペース
   * その他: 特定条件で発動させたい場合には各種設定を用いる
   <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/1d108d14-f983-44e0-8818-ffd6c6786790" />  
4. 次ステップの選択より、実施したいステップを追加する。例ではNotebookLMへの質問を作成しており、以降これをベースに手順を作成する。
   <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/6da55506-3fe6-4865-a2a2-c2088b8d1e15" />  
5. 次ステップの選択より、スプレッドシートの「行の追加」を選択し、事前準備で作成したスプレッドシートを設定する。また、以下のように詳細設定を行う。
   * 行を追加: 最後のデータ行の後
   * 宛先情報: ステップ1:送信者のメールアドレス
   * 送信メッセージ: ステップ2:NotebookLMによって作成されたコンテンツ
   <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/9e261dc6-4054-4003-b1a6-dc1e7d4ae9e0" />  
6. スプレッドシートの拡張機能よりApps Scriptを選択し、コンテナバインド型でGASエディタを開く。

7. （任意）開いたスクリプトエディタ上の「無題のプロジェクト」欄にクリックし、プロジェクト名を管理しやすいような名称に変更する。
   <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/48ad5694-9c3a-419b-b305-bd3274860d1b" />  
    
8. 開いたスクリプトエディタ上のコード.gsに本リポジトリの <a href="https://github.com/kotakahashi-4u/studio-gas-chat-alignment/blob/main/%E3%82%B3%E3%83%BC%E3%83%89.gs" target="_blank">コード.gs</a>(Windows: **Ctrl+Click** / Mac: **Cmd+Click**) の内容をコピーして、貼り付ける。貼り付け後は必ず、エディタ上部の保存ボタンを押下すること。
    <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/ce148495-8841-433d-8924-953208dede1d" />  
 
9. 左側のサイドパネルより「サービス」を押下し、表示された一覧の中から「Admin SDK API」を選択し、バージョン `directory_v1` を追加する。
    <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/549c581e-ed82-45be-8168-f78a6e392e7e" />  

10. 左側のサイドパネルにある「プロジェクトの設定」を押下し、一番下のスクリプトプロパティに以下の通り設定を行う。
    プロパティ: CHAT_WEBHOOK_URL
    値: 事前準備で控えておいたWebhookURL
    <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/fdd741ca-c4dd-492b-a37f-ab92583b7e1a" />  

11. コードの保存、サービスの追加、スクリプトプロパティの追加が完了したら、関数一覧から「setupTrigger」を選択した上で「実行」ボタンを押下する。
    <img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/df068dbe-ccfa-45ad-814d-9bc6e52399d1" />  

12. 本プログラムに対する権限承認ダイアログが表示されるため、適宜対応を行う。対応に迷ったときはGeminiに相談を行い、どのように許可すればいいかを確認する。

13. 全体の準備が完了したため、対象のスペースよりチャットメッセージを送信し、WorkspaceStudioの動作、スプレッドシートへの出力、Googleチャットへの通知が動作するかを確認する。エラー等が出た場合には、上記手順をもう一度確認し、対応漏れがないかを確認する。












