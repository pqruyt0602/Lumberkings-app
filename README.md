# 木作設備中心｜GitHub Pages 版

這個資料夾可以直接上傳到 GitHub Repository，並使用 GitHub Pages 發佈。

## 目前功能
- 新增工具
- 自動產生設備編號
- 搜尋工具
- 建立報修紀錄
- 記錄維修費
- 查看累積維修成本
- 匯出 / 匯入 JSON 備份
- PWA 安裝
- 基本離線快取
- iPhone / Android 主畫面圖示

## GitHub Pages 部署
1. 登入 GitHub。
2. 建立一個新的 Repository，例如：woodtool-app
3. 將本資料夾內所有檔案上傳到 Repository 根目錄。
4. 進入 Repository → Settings → Pages。
5. Build and deployment 選 Deploy from a branch。
6. Branch 選 main，資料夾選 /(root)。
7. 按 Save。
8. 等 GitHub Pages 產生 HTTPS 網址。

網址通常會是：
https://你的GitHub帳號.github.io/woodtool-app/

## iPhone 安裝
1. 用 Safari 開啟 GitHub Pages 網址。
2. 點分享。
3. 點「加入主畫面」。
4. 點「加入」。

## Android 安裝
1. 用 Chrome 開啟網址。
2. 點右上角選單。
3. 點「安裝應用程式」或「加入主畫面」。

## 重要限制
目前資料使用瀏覽器 localStorage 保存。
這代表：
- 同一支手機可以持續使用。
- 換手機不會自動同步。
- 不同員工無法共用資料。
- 清除瀏覽器資料可能會刪除紀錄。

正式公司共用版下一階段建議：
- Supabase / Firebase 雲端資料庫
- 員工登入與權限
- QR Code 掃描
- 每台設備自動產生 QR 標籤
- 借出 / 歸還
- 維修照片
- 保養提醒
- 雲端備份
