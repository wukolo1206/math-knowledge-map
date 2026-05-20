# 全年級教材分布補充 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 `knowledge-map/data/units.json` 中全年級 111 個單元的 `objectives` 欄位，從簡略摘要升級為教冊資料篇「教材分布」完整條列。

**Architecture:** 分三輪各讀一本教冊資料篇 PDF（第 16～17 頁），整理為 patch JSON 經使用者確認後，Python 腳本合併入 units.json；最後修正 build_units.py 避免重跑覆蓋。

**Tech Stack:** PyMuPDF (fitz) for PDF reading、Python for merge、units.json as target

---

## PDF 頁面對照

| PDF | 頁碼（1-indexed） | 涵蓋 |
|---|---|---|
| `114(2)數學2下教冊(資料篇).pdf` | 第 16 頁（1上+1下）、第 17 頁（2上+2下） | 1年上、1年下、2年上、2年下 |
| `114(2)數學4下教冊(資料篇).pdf` | 第 16 頁（3上+3下）、第 17 頁（4上+4下） | 3年上、3年下、4年上、4年下 |
| `114(2)數學6下教冊(資料篇).pdf` | 第 16 頁（5上+5下）、第 17 頁（6上+6下） | 5年上、5年下、6年上、6年下 |

## Patch JSON 格式

每輪產生一個 patch 檔，key 為 units.json 的 `id`，value 為 objectives 字串陣列：

```json
{
  "1u-u1-10-以內的數": [
    "能唱數1到10，並確定10以內的數量",
    "以具體的量、聲音、圖象和數字，進行10以內數的說、讀、聽、寫活動",
    "認識0",
    "用不同形式表徵10以內的數量"
  ],
  "1u-u2-比長短": [
    "認識長度",
    "直接比較兩物件的長度（長短、高矮、厚薄）",
    "認識直線與曲線，並知道兩點間的連線，以直線最短",
    "能用直尺畫出直線"
  ]
}
```

---

## Task 1：Round 1 — 讀 2下教冊，整理 1～2 年級教材分布

**Files:**
- Read: `d:/備課ai/三下數學/數學學習地圖/114(2)數學2下教冊(資料篇).pdf`（頁 16-17）
- Create: `knowledge-map/data/objectives_patch_r1.json`

- [ ] **Step 1：用 fitz 讀取頁面文字**

```python
import fitz, sys, json
sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('d:/備課ai/三下數學/數學學習地圖/114(2)數學2下教冊(資料篇).pdf')
print(doc[15].get_text())  # 第16頁：1上+1下
print('---')
print(doc[16].get_text())  # 第17頁：2上+2下
```

- [ ] **Step 2：依 PDF 文字整理 patch，對照 units.json ID**

參考 ID 對照：
| 年級學期 | units.json ID 格式 |
|---|---|
| 1年上 U1 | `1u-u1-10-以內的數` |
| 1年上 U2 | `1u-u2-比長短` |
| 1年下 U1 | `1d-u1-50-以內的數` |
| 2年上 U1 | `2u-u1-200-以內的數` |
| 2年下 U1 | `2d-u1-1000-以內的數` |

完整 ID 清單從 units.json 取得：
```python
import json
with open('d:/備課ai/三下數學/knowledge-map/data/units.json', encoding='utf-8') as f:
    units = json.load(f)
for u in units:
    if u['grade'] <= 2:
        print(u['id'], '|', u['title'])
```

- [ ] **Step 3：將整理好的 patch 完整列出給使用者確認**

格式：
```
1年上 第一單元 10以內的數
  ・能唱數1到10，並確定10以內的數量
  ・以具體的量、聲音、圖象和數字，進行10以內數的說、讀、聽、寫活動
  ...
```

**等待使用者確認後再進行 Step 4。**

- [ ] **Step 4：存為 patch 檔**

```python
patch_r1 = {
    "1u-u1-10-以內的數": ["...", "..."],
    # ... 所有 1上、1下、2上、2下單元
}
with open('d:/備課ai/三下數學/knowledge-map/data/objectives_patch_r1.json', 'w', encoding='utf-8') as f:
    json.dump(patch_r1, f, ensure_ascii=False, indent=2)
print('已存 objectives_patch_r1.json')
```

---

## Task 2：Round 2 — 讀 4下教冊，整理 3～4 年級教材分布

**Files:**
- Read: `d:/備課ai/三下數學/數學學習地圖/114(2)數學4下教冊(資料篇).pdf`（頁 16-17）
- Create: `knowledge-map/data/objectives_patch_r2.json`

- [ ] **Step 1：讀取頁面文字**

```python
import fitz, sys
sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('d:/備課ai/三下數學/數學學習地圖/114(2)數學4下教冊(資料篇).pdf')
print(doc[15].get_text())  # 第16頁：3上+3下
print('---')
print(doc[16].get_text())  # 第17頁：4上+4下
```

- [ ] **Step 2：對照 ID、整理 patch**

```python
for u in units:
    if u['grade'] in [3, 4]:
        print(u['id'], '|', u['title'])
```

- [ ] **Step 3：列出給使用者確認（同 Task 1 格式）**

**等待使用者確認後再進行 Step 4。**

- [ ] **Step 4：存為 patch 檔**

```python
patch_r2 = { ... }  # 填入確認後的資料
with open('d:/備課ai/三下數學/knowledge-map/data/objectives_patch_r2.json', 'w', encoding='utf-8') as f:
    json.dump(patch_r2, f, ensure_ascii=False, indent=2)
print('已存 objectives_patch_r2.json')
```

---

## Task 3：Round 3 — 讀 6下教冊，整理 5～6 年級教材分布

**Files:**
- Read: `d:/備課ai/三下數學/數學學習地圖/114(2)數學6下教冊(資料篇).pdf`（頁 16-17）
- Create: `knowledge-map/data/objectives_patch_r3.json`

- [ ] **Step 1：讀取頁面文字**

```python
import fitz, sys
sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('d:/備課ai/三下數學/數學學習地圖/114(2)數學6下教冊(資料篇).pdf')
print(doc[15].get_text())  # 第16頁：5上+5下
print('---')
print(doc[16].get_text())  # 第17頁：6上+6下
```

- [ ] **Step 2：對照 ID、整理 patch**

```python
for u in units:
    if u['grade'] in [5, 6]:
        print(u['id'], '|', u['title'])
```

- [ ] **Step 3：列出給使用者確認（同 Task 1 格式）**

**等待使用者確認後再進行 Step 4。**

- [ ] **Step 4：存為 patch 檔**

```python
patch_r3 = { ... }
with open('d:/備課ai/三下數學/knowledge-map/data/objectives_patch_r3.json', 'w', encoding='utf-8') as f:
    json.dump(patch_r3, f, ensure_ascii=False, indent=2)
print('已存 objectives_patch_r3.json')
```

---

## Task 4：合併三份 patch 更新 units.json

**Files:**
- Read: `knowledge-map/data/objectives_patch_r1.json`, `r2.json`, `r3.json`
- Modify: `knowledge-map/data/units.json`

- [ ] **Step 1：執行合併腳本**

```python
import json

# 載入三份 patch
patches = {}
for r in ['r1', 'r2', 'r3']:
    with open(f'd:/備課ai/三下數學/knowledge-map/data/objectives_patch_{r}.json', encoding='utf-8') as f:
        patches.update(json.load(f))

# 載入 units.json
with open('d:/備課ai/三下數學/knowledge-map/data/units.json', encoding='utf-8') as f:
    units = json.load(f)

# 更新 objectives
updated = 0
missing = []
for u in units:
    if u['id'] in patches:
        u['objectives'] = patches[u['id']]
        updated += 1
    else:
        missing.append(f"{u['grade']}年{'上' if u['semester']==1 else '下'} {u['title']}")

print(f'更新: {updated} 個單元')
if missing:
    print(f'未覆蓋: {missing}')

# 驗證：所有單元都有 2 條以上
thin = [u for u in units if len(u['objectives']) < 2]
if thin:
    print(f'警告：{len(thin)} 個單元只有 1 條 objectives:')
    for u in thin:
        print(f'  {u["id"]}: {u["objectives"]}')

# 存檔
with open('d:/備課ai/三下數學/knowledge-map/data/units.json', 'w', encoding='utf-8') as f:
    json.dump(units, f, ensure_ascii=False, indent=2)
print('units.json 已更新')
```

- [ ] **Step 2：確認無截斷句子**

```python
for u in units:
    for obj in u['objectives']:
        if obj.endswith('及') or obj.endswith('和') or obj.endswith('與') or obj.endswith('、'):
            print(f'可能截斷：{u["id"]} → {obj}')
```

- [ ] **Step 3：commit**

```bash
git add knowledge-map/data/units.json knowledge-map/data/objectives_patch_r1.json knowledge-map/data/objectives_patch_r2.json knowledge-map/data/objectives_patch_r3.json
git commit -m "feat: 補全全年級 111 個單元教材分布（來源：教冊資料篇第16-17頁）"
```

---

## Task 5：修正 build_units.py 避免覆蓋

**Files:**
- Modify: `scripts/build_units.py`

- [ ] **Step 1：移除 GRADE3D_DATA 中 objectives 的覆蓋**

在 `build_units.py` 的 `build()` 函式裡，`unit.update(extra)` 會把 GRADE3D_DATA 的所有欄位覆蓋進去，包含簡略的 objectives 和已被校正的 prerequisites/successors。

將這段：
```python
if extra:
    unit.update(extra)
    enriched += 1
```

改為只更新安全欄位：
```python
if extra:
    for key in ['activities', 'indicators', 'tools', 'notes']:
        if key in extra:
            unit[key] = extra[key]
    enriched += 1
```

- [ ] **Step 2：驗證腳本不會覆蓋 objectives**

```bash
python scripts/build_units.py
```

確認輸出為：`[OK] 111 個單元，其中 9 個三下單元已完整補充`

再確認三下某單元的 objectives 沒有被改回舊版：
```python
import json
with open('d:/備課ai/三下數學/knowledge-map/data/units.json', encoding='utf-8') as f:
    units = json.load(f)
u = next(u for u in units if u['title'] == '除法' and u['grade'] == 3)
print(u['objectives'])  # 應為教材分布版本（多條），不是 build_units.py 舊版
```

- [ ] **Step 3：commit**

```bash
git add scripts/build_units.py
git commit -m "fix: build_units.py 改只補充 activities/indicators/tools/notes，不覆蓋 objectives 和先備關係"
```
