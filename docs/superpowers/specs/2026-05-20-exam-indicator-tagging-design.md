# 考古題課綱代碼 AI 標記設計

**日期：** 2026-05-20
**目標檔案：** `學力檢測考古題/tag_indicators.py`

---

## 功能概述

用 Claude API 批次分析 `exam_questions.json` 中的 661 道考古題，為每道題填入對應的 108 課綱代碼（`indicators` 欄位），輸出 `exam_questions_tagged.json`。

---

## 資料流

```
knowledge-map/data/units.json     學力檢測考古題/exam_questions.json
        ↓ 抽取 140 個代碼 + 說明文字        ↓ 讀入 661 題
                    ↓
            tag_indicators.py
            （每 10 題一批呼叫 Claude API）
                    ↓
        學力檢測考古題/exam_questions_tagged.json
```

- 原始 `exam_questions.json` **不覆蓋**
- 輸出結構與原檔相同，只填入 `indicators` 與 `needs_review` 欄位

---

## 輸出格式

每道題新增兩個欄位：

```json
{
  "q_no": 1,
  "stem": "...",
  "options": {"1": "...", "2": "..."},
  "answer": 3,
  "has_image": false,
  "content_notes": [],
  "indicators": ["N-3-3"],
  "needs_review": false
}
```

| 欄位 | 說明 |
|---|---|
| `indicators` | AI 建議的課綱代碼，1-3 個，格式與 units.json 一致 |
| `needs_review` | `true` 條件：(1) `has_image: true`，或 (2) 該批 API 呼叫失敗 |

---

## 批次策略

- **批次大小：** 每批 10 題
- **每批內容：** 10 道題的題幹 + 選項 + 完整 140 個代碼說明
- **API 模型：** `claude-haiku-4-5-20251001`（速度快、費用低，標記任務不需要複雜推理）
- **回傳格式：** 純 JSON 陣列

提示詞結構：
```
你是國小數學課綱專家。以下是 108 課綱數學學習內容代碼：
N-1-1: ...
N-1-2: ...
...（140個）

請為下列每道題標出 1-3 個最符合的代碼，只回傳 JSON：
[{"q_no":1,"indicators":["N-3-3"]}, ...]

題目：
1. [題幹] 選項：1)... 2)... 3)... 4)...
...
```

---

## 斷點續跑

- 每批完成後**立即寫入**輸出檔（不等全部完成）
- 重新執行時：`indicators != []` 或 `needs_review == true` 的題目直接跳過
- 首次執行：從 `exam_questions.json` 複製全部資料，`indicators` 全為 `[]`，`needs_review` 全為 `false`

---

## 錯誤處理

| 情況 | 處理方式 |
|---|---|
| API 回傳非 JSON | 該批 10 題 `needs_review: true`，`indicators` 留 `[]` |
| API 呼叫失敗（網路/timeout） | 重試 2 次，仍失敗則標記同上 |
| 回傳題號對不上 | 跳過該題，記錄至 `tag_errors.log` |

錯誤記錄格式（`tag_errors.log`）：
```
[114年 3年級 批次2] JSON解析失敗：...
[110年 4年級 批次1] API逾時（重試2次）
```

---

## 進度顯示

```
[106年 3年級] 批次 1/3... OK (10題)
[106年 3年級] 批次 2/3... OK (10題)
[106年 3年級] 批次 3/3... OK (5題)
...
完成：661題，含圖需審閱 129題，錯誤 0批
輸出：exam_questions_tagged.json
```

---

## 不在此次範圍

- 審閱 UI（老師逐題確認介面）
- 自動整合進 knowledge-map 卡片
- 多代碼的優先排序或信心分數
