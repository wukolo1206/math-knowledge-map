---
project: knowledge-map
category: 學科工具集
status: 開發中
version: "資料品質文件與來源備註同步 2026-05-26"
url: https://wukolo1206.github.io/math-knowledge-map/
next_action: 整理上層 repo 中知識地圖資料變動，確認是否提交抽取腳本
updated: 2026-05-26
---

# CLAUDE.md — knowledge-map

國小數學知識地圖。此專案資料量大，包含概念、活動、課綱、來源文件、跨年級主線與前端互動頁。

## 技術框架

- 靜態 HTML/JS
- `data/` 內 CSV/JSON 為主要資料來源
- `scripts/` 內檢查與同步腳本
- GitHub Pages 部署

## 主要檔案

- `index.html`：互動知識地圖入口
- `map.js`：前端互動與資料顯示
- `stats.html`：統計/盤點頁
- `SOURCES.md`：資料來源
- `data/`：知識地圖資料
- `scripts/`：同步與檢查腳本

## 不能動的地方

- 來源文件與資料引用關係，未查證不可改成確定內容。
- `data/` 的 ID 命名、關係鍵與課綱引用要保持一致。
- `.bak` 與校對文件不要任意刪除。

## 部署後驗證清單

- 開啟 `https://wukolo1206.github.io/math-knowledge-map/`。
- 確認首頁、地圖、指標/單元篩選可用。
- 跑資料品質檢查腳本。
- 抽查至少一個單元卡與一個課綱指標。

## 資料原則

- 以教材 PDF、教師手冊、學習地圖 PDF、課綱與既有 CSV/Markdown 為主。
- 不用推測補先備、後續、課綱對齊或易錯概念。
- 不足時標示待確認或待補資料。

