# AI Prompt Lab

AI Prompt Lab 是一個輕量的瀏覽器工具，可以把模糊的 AI 任務整理成更清楚的結構化 prompt。

這個專案是純靜態網頁，不需要 API key、不需要後端，也不需要建置流程。你可以直接打開 `index.html`，或部署到 GitHub Pages、Vercel、Netlify 等靜態網站服務。

## 線上 Demo

```text
https://greg59701029.github.io/ai-prompt-lab/
```

## 功能

- 依照角色、目標、受眾、背景、限制、語氣和輸出格式建立 prompt
- 內建產品規劃、程式開發、研究摘要、行銷企劃、客服回覆和資料分析模板
- 使用啟發式規則檢查 prompt 的完整度、證據、限制和不確定性處理
- 顯示字數與字元數
- 一鍵複製或下載 prompt
- 匯出 / 匯入 JSON preset，方便保存可再次編輯的 prompt 設定
- 使用瀏覽器本機儲存最近使用過的 prompt

品質分數是固定規則的 heuristic，不會呼叫 AI 模型，也不代表權威評分；它比較像一份可快速檢查的 prompt checklist。

## Preset

`Download` 會把產生出來的 prompt 存成純文字；`Export preset` 則會把目前表單欄位存成 JSON，之後可以用 `Import preset` 載回來繼續編輯。

範例格式可以看：

```text
examples/product-preset.json
```

## 本機使用

```bash
python -m http.server 8080
```

接著開啟：

```text
http://localhost:8080
```

也可以直接用瀏覽器開啟 `index.html`。

## 開發與測試

```bash
python tests/smoke_test.py
```

測試會確認核心檔案、UI 目標、模板、統計功能和基本安全檢查是否存在。

## 維護方向

這個專案保持小型、容易理解、無依賴。未來優先改進：

- 更多實用 prompt 模板
- 更好的 prompt 品質檢查
- 匯入與匯出模板
- prompt 差異比較
- GitHub Pages 線上展示

## 授權

MIT
