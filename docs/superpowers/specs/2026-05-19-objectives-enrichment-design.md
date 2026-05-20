# 設計文件：全年級教材分布（objectives）補充

日期：2026-05-19

## 目標

將 `knowledge-map/data/units.json` 中全年級 111 個單元的 `objectives` 欄位，從現有的簡略摘要（1～3 條）升級為教冊資料篇「教材分布」的完整條列（3～5 條）。

## 背景

- 現狀：`objectives` 來自學習地圖 PDF 的自動抽取，60 個單元只有 1 條，部分有截斷
- 目標：與教冊資料篇「教材分布」欄位一致，每單元 3～5 條完整學習重點
- 卡片標題「學習目標」維持不變，不改為「教材分布」

## 資料來源

教冊資料篇 PDF（位於 `../數學學習地圖/`）：

| 輪次 | PDF | 涵蓋年級 | 單元數 |
|---|---|---|---|
| Round 1 | `114(2)數學2下教冊(資料篇).pdf` | 1上、1下、2上、2下 | 約 36 |
| Round 2 | `114(2)數學4下教冊(資料篇).pdf` | 3上、3下、4上、4下 | 約 38 |
| Round 3 | `114(2)數學6下教冊(資料篇).pdf` | 5上、5下、6上、6下 | 約 37 |

每本教冊的教材分布欄位涵蓋兩個年級（上下冊），因此只需讀三本。

## 執行流程

1. 逐輪讀取 PDF → 整理成條列格式 → 呈現給使用者確認
2. 使用者確認後繼續下一輪
3. 三輪完成後，一次更新 `units.json`
4. 同步修正 `build_units.py`，避免重跑腳本覆蓋三下資料

## 每輪輸出格式

```
X年X 第N單元 單元名稱
  ・學習重點一
  ・學習重點二
  ・學習重點三
```

## 異動範圍

| 檔案 | 異動內容 |
|---|---|
| `knowledge-map/data/units.json` | 更新所有 111 個單元的 `objectives` 陣列 |
| `scripts/build_units.py` | 移除 GRADE3D_DATA 裡的 `prerequisites`/`successors` 硬編碼（已被教材地位校正），改只補充 activities/indicators/tools/notes，不覆蓋 objectives |

## 不異動的項目

- 卡片 HTML 結構（`map.js` / `index.html`）
- 卡片標題「學習目標」不改名
- `prerequisites` / `successors` 關係不動
- `indicators` / `activities` / `tools` / `notes` 欄位不動
