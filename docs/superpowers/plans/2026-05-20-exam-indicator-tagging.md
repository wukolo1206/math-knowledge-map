# 考古題課綱代碼 AI 標記 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 `tag_indicators.py`，用 Claude Haiku API 批次為 661 道考古題填入 108 課綱代碼，支援斷點續跑，輸出 `exam_questions_tagged.json`。

**Architecture:** 讀取 `units.json`（140 個代碼說明）與 `exam_questions.json`（661 題），每 10 題一批送 Claude Haiku，解析 JSON 回應後立即寫入輸出檔。含圖題標記完成後加 `needs_review: true`；API 失敗批次也標記 `needs_review: true`。重新執行時跳過已處理題目。

**Tech Stack:** Python 3.x、`anthropic` SDK 0.84.0、`json`、`os`

---

## 檔案結構

```
學力檢測考古題/
├── exam_questions.json           ← 輸入（不修改）
├── exam_questions_tagged.json    ← 輸出（Create）
├── tag_indicators.py             ← 主腳本（Create）
├── test_tag_indicators.py        ← 測試（Create）
├── tag_errors.log                ← 執行時自動產生
└── build_exam_db.py              ← 已存在，不動
```

**重要路徑常數（寫進腳本）：**
```
EXAM_JSON   = 學力檢測考古題/exam_questions.json  （此腳本所在目錄）
TAGGED_JSON = 學力檢測考古題/exam_questions_tagged.json
UNITS_JSON  = （此腳本往上兩層）/knowledge-map/data/units.json
ERROR_LOG   = 學力檢測考古題/tag_errors.log
```

---

## Task 1: 資料載入函式

**Files:**
- Create: `D:\備課ai\三下數學\學力檢測考古題\tag_indicators.py`
- Create: `D:\備課ai\三下數學\學力檢測考古題\test_tag_indicators.py`

- [ ] **Step 1: 寫失敗測試**

建立 `test_tag_indicators.py`：

```python
import json, os, sys, tempfile, unittest

sys.path.insert(0, os.path.dirname(__file__))
import tag_indicators as ti

SAMPLE_UNITS = [
    {"id": "3d-u2", "indicators": [{"code": "N-3-1", "text": "除以一位數：除法直式計算"}]},
    {"id": "3d-u1", "indicators": [{"code": "N-3-3", "text": "乘法：多位數乘法直式"}]},
]

class TestLoadIndicators(unittest.TestCase):
    def test_returns_dict_code_to_text(self):
        with tempfile.NamedTemporaryFile('w', suffix='.json',
                                         delete=False, encoding='utf-8') as f:
            json.dump(SAMPLE_UNITS, f, ensure_ascii=False)
            path = f.name
        result = ti.load_indicators(path)
        self.assertEqual(result["N-3-1"], "除以一位數：除法直式計算")
        self.assertEqual(result["N-3-3"], "乘法：多位數乘法直式")
        self.assertEqual(len(result), 2)
        os.unlink(path)

class TestLoadOrInitTagged(unittest.TestCase):
    def test_init_from_source_adds_needs_review_false(self):
        source = [{"year": 114, "grade": 3, "pdf": "x.pdf",
                   "questions": [{"q_no": 1, "stem": "題目", "options": {},
                                  "has_image": False, "content_notes": [],
                                  "indicators": [], "answer": 1}]}]
        with tempfile.NamedTemporaryFile('w', suffix='.json',
                                         delete=False, encoding='utf-8') as f:
            json.dump(source, f, ensure_ascii=False)
            src_path = f.name
        out_path = src_path + "_out.json"
        result = ti.load_or_init_tagged(src_path, out_path)
        self.assertEqual(result[0]["questions"][0]["needs_review"], False)
        os.unlink(src_path)
        os.unlink(out_path)

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: 執行測試，確認失敗**

```
cd D:\備課ai\三下數學\學力檢測考古題
python test_tag_indicators.py
```

預期：`ModuleNotFoundError: No module named 'tag_indicators'`

- [ ] **Step 3: 實作 `load_indicators` 與 `load_or_init_tagged`**

建立 `tag_indicators.py`：

```python
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXAM_JSON   = os.path.join(BASE_DIR, "exam_questions.json")
TAGGED_JSON = os.path.join(BASE_DIR, "exam_questions_tagged.json")
UNITS_JSON  = os.path.join(BASE_DIR, "..", "knowledge-map", "data", "units.json")
ERROR_LOG   = os.path.join(BASE_DIR, "tag_errors.log")


def load_indicators(units_path=UNITS_JSON):
    """回傳 {code: text} 字典，從 units.json 抽取所有 indicator。"""
    with open(units_path, encoding="utf-8") as f:
        units = json.load(f)
    codes = {}
    for u in units:
        for ind in u.get("indicators", []):
            if ind.get("code") and ind.get("text"):
                codes[ind["code"]] = ind["text"]
    return codes


def load_or_init_tagged(source_path=EXAM_JSON, tagged_path=TAGGED_JSON):
    """
    若 tagged_path 已存在，讀取並回傳。
    否則從 source_path 複製，為每道題加入 needs_review: false，寫入 tagged_path。
    """
    if os.path.exists(tagged_path):
        with open(tagged_path, encoding="utf-8") as f:
            return json.load(f)
    with open(source_path, encoding="utf-8") as f:
        data = json.load(f)
    for record in data:
        for q in record["questions"]:
            if "needs_review" not in q:
                q["needs_review"] = False
    with open(tagged_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return data
```

- [ ] **Step 4: 執行測試，確認通過**

```
python test_tag_indicators.py
```

預期：`OK`（2 tests passed）

- [ ] **Step 5: Commit**

```
cd D:\備課ai\三下數學\學力檢測考古題
git -C "D:\備課ai\三下數學" add 學力檢測考古題/tag_indicators.py 學力檢測考古題/test_tag_indicators.py
git -C "D:\備課ai\三下數學" commit -m "feat: tag_indicators — 資料載入函式"
```

---

## Task 2: 提示詞建構與 API 解析

**Files:**
- Modify: `D:\備課ai\三下數學\學力檢測考古題\tag_indicators.py`
- Modify: `D:\備課ai\三下數學\學力檢測考古題\test_tag_indicators.py`

- [ ] **Step 1: 新增測試**

在 `test_tag_indicators.py` 末尾的 `if __name__` 之前加入：

```python
class TestBuildPrompt(unittest.TestCase):
    def test_contains_all_codes(self):
        codes = {"N-3-1": "除以一位數", "N-3-3": "乘法直式"}
        questions = [{"q_no": 1, "stem": "計算 24÷3=？",
                      "options": {"1": "6", "2": "7", "3": "8", "4": "9"}}]
        prompt = ti.build_prompt(codes, questions)
        self.assertIn("N-3-1", prompt)
        self.assertIn("N-3-3", prompt)
        self.assertIn("計算 24÷3=？", prompt)
        self.assertIn("q_no", prompt)

class TestParseResponse(unittest.TestCase):
    def test_valid_json(self):
        raw = '[{"q_no":1,"indicators":["N-3-1"]},{"q_no":2,"indicators":["N-3-3","N-3-1"]}]'
        result = ti.parse_response(raw, [1, 2])
        self.assertEqual(result[1], ["N-3-1"])
        self.assertEqual(result[2], ["N-3-3", "N-3-1"])

    def test_json_in_markdown_block(self):
        raw = '```json\n[{"q_no":1,"indicators":["N-3-1"]}]\n```'
        result = ti.parse_response(raw, [1])
        self.assertEqual(result[1], ["N-3-1"])

    def test_invalid_json_raises(self):
        with self.assertRaises(ValueError):
            ti.parse_response("not json", [1])

    def test_missing_q_no_skipped(self):
        raw = '[{"q_no":1,"indicators":["N-3-1"]}]'
        result = ti.parse_response(raw, [1, 2])
        self.assertIn(1, result)
        self.assertNotIn(2, result)
```

- [ ] **Step 2: 執行測試，確認失敗**

```
python test_tag_indicators.py
```

預期：`AttributeError: module 'tag_indicators' has no attribute 'build_prompt'`

- [ ] **Step 3: 實作 `build_prompt` 與 `parse_response`**

在 `tag_indicators.py` 的函式區塊末尾加入：

```python
def build_prompt(indicators_dict, questions):
    """
    建構給 Claude 的提示詞。
    indicators_dict: {code: text}
    questions: list of question dicts（含 q_no, stem, options）
    """
    code_lines = "\n".join(
        "{}: {}".format(code, text)
        for code, text in sorted(indicators_dict.items())
    )

    q_lines = []
    for q in questions:
        opts = "  ".join(
            "{}) {}".format(k, v)
            for k, v in sorted(q.get("options", {}).items())
        )
        q_lines.append("{}. {}\n   選項：{}".format(q["q_no"], q["stem"], opts))
    questions_text = "\n\n".join(q_lines)

    return (
        "你是國小數學課綱專家。以下是 108 課綱數學學習內容代碼清單：\n\n"
        "{}\n\n"
        "請為下列每道題標出 1-3 個最符合的代碼，"
        "只回傳 JSON 陣列，格式：\n"
        '[{{"q_no":1,"indicators":["N-3-1"]}}, ...]\n\n'
        "題目：\n\n{}"
    ).format(code_lines, questions_text)


def parse_response(raw_text, expected_q_nos):
    """
    解析 Claude 回傳的 JSON。
    回傳 {q_no: [codes]} 字典；解析失敗拋出 ValueError。
    expected_q_nos 中不存在的 q_no 會被忽略。
    """
    import re
    text = raw_text.strip()
    # 移除 markdown code fence
    text = re.sub(r"^```[a-z]*\n?", "", text)
    text = re.sub(r"\n?```$", "", text)
    text = text.strip()
    try:
        items = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError("JSON 解析失敗：{}".format(e))
    result = {}
    for item in items:
        q_no = item.get("q_no")
        if q_no in expected_q_nos:
            result[q_no] = item.get("indicators", [])
    return result
```

- [ ] **Step 4: 執行測試，確認通過**

```
python test_tag_indicators.py
```

預期：`OK`（6 tests passed）

- [ ] **Step 5: Commit**

```
git -C "D:\備課ai\三下數學" add 學力檢測考古題/tag_indicators.py 學力檢測考古題/test_tag_indicators.py
git -C "D:\備課ai\三下數學" commit -m "feat: tag_indicators — 提示詞建構與回應解析"
```

---

## Task 3: API 呼叫與錯誤處理

**Files:**
- Modify: `D:\備課ai\三下數學\學力檢測考古題\tag_indicators.py`
- Modify: `D:\備課ai\三下數學\學力檢測考古題\test_tag_indicators.py`

- [ ] **Step 1: 新增測試**

在 `test_tag_indicators.py` 末尾 `if __name__` 之前加入：

```python
from unittest.mock import MagicMock, patch

class TestCallApi(unittest.TestCase):
    def _make_client(self, response_text):
        client = MagicMock()
        msg = MagicMock()
        msg.content = [MagicMock(text=response_text)]
        client.messages.create.return_value = msg
        return client

    def test_returns_parsed_result_on_success(self):
        raw = '[{"q_no":1,"indicators":["N-3-1"]}]'
        client = self._make_client(raw)
        result = ti.call_api_with_retry(client, "prompt", [1])
        self.assertEqual(result[1], ["N-3-1"])

    def test_retries_on_exception_then_raises(self):
        client = MagicMock()
        client.messages.create.side_effect = Exception("network error")
        with self.assertRaises(Exception):
            ti.call_api_with_retry(client, "prompt", [1], max_retries=2)
        self.assertEqual(client.messages.create.call_count, 2)

    def test_retries_on_invalid_json_then_raises(self):
        client = self._make_client("not json")
        with self.assertRaises(ValueError):
            ti.call_api_with_retry(client, "prompt", [1], max_retries=2)
        self.assertEqual(client.messages.create.call_count, 2)
```

- [ ] **Step 2: 執行測試，確認失敗**

```
python test_tag_indicators.py
```

預期：`AttributeError: module 'tag_indicators' has no attribute 'call_api_with_retry'`

- [ ] **Step 3: 實作 `call_api_with_retry` 與 `log_error`**

在 `tag_indicators.py` 末尾加入：

```python
def log_error(message, error_log=ERROR_LOG):
    """將錯誤訊息附加到 tag_errors.log。"""
    with open(error_log, "a", encoding="utf-8") as f:
        f.write(message + "\n")


def call_api_with_retry(client, prompt, expected_q_nos, max_retries=2):
    """
    呼叫 Claude API，失敗時重試最多 max_retries 次。
    成功回傳 {q_no: [codes]}；全部失敗則拋出最後一個例外。
    """
    last_exc = None
    for attempt in range(max_retries):
        try:
            message = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )
            raw = message.content[0].text
            return parse_response(raw, expected_q_nos)
        except Exception as e:
            last_exc = e
    raise last_exc
```

- [ ] **Step 4: 執行測試，確認通過**

```
python test_tag_indicators.py
```

預期：`OK`（9 tests passed）

- [ ] **Step 5: Commit**

```
git -C "D:\備課ai\三下數學" add 學力檢測考古題/tag_indicators.py 學力檢測考古題/test_tag_indicators.py
git -C "D:\備課ai\三下數學" commit -m "feat: tag_indicators — API呼叫與重試邏輯"
```

---

## Task 4: 主流程（批次標記 + 斷點續跑）

**Files:**
- Modify: `D:\備課ai\三下數學\學力檢測考古題\tag_indicators.py`

- [ ] **Step 1: 實作 `main()`**

在 `tag_indicators.py` 末尾加入：

```python
def main():
    import anthropic
    import math

    indicators_dict = load_indicators()
    data = load_or_init_tagged()
    client = anthropic.Anthropic()

    total_tagged = 0
    total_review = 0
    total_errors = 0

    for record in data:
        year, grade = record["year"], record["grade"]
        questions = record["questions"]

        # 找出尚未標記的題目
        pending = [
            q for q in questions
            if q.get("indicators") == [] and not q.get("needs_review", False)
        ]
        if not pending:
            continue

        n_batches = math.ceil(len(pending) / 10)
        for batch_idx in range(n_batches):
            batch = pending[batch_idx * 10 : (batch_idx + 1) * 10]
            q_nos = [q["q_no"] for q in batch]
            label = "[{}年 {}年級 批次 {}/{}]".format(year, grade, batch_idx + 1, n_batches)
            print("{}...".format(label), end=" ", flush=True)

            try:
                prompt = build_prompt(indicators_dict, batch)
                result = call_api_with_retry(client, prompt, q_nos)

                # 把結果寫回 questions
                q_map = {q["q_no"]: q for q in questions}
                for q_no, codes in result.items():
                    q = q_map[q_no]
                    q["indicators"] = codes
                    # 含圖題額外標記需審閱
                    if q.get("has_image"):
                        q["needs_review"] = True
                        total_review += 1
                    else:
                        q["needs_review"] = False
                    total_tagged += 1

                # 批次中未被回傳的題號（AI 漏回）
                missing = set(q_nos) - set(result.keys())
                if missing:
                    msg = "{} 漏回題號：{}".format(label, sorted(missing))
                    log_error(msg)
                    for q_no in missing:
                        q_map[q_no]["needs_review"] = True
                    total_review += len(missing)

                print("OK ({} 題)".format(len(result)))

            except Exception as e:
                err_msg = "{} 失敗：{}".format(label, e)
                log_error(err_msg)
                print("FAIL（已記錄）")
                for q in batch:
                    q["needs_review"] = True
                total_errors += 1
                total_review += len(batch)

            # 每批立即寫入
            with open(TAGGED_JSON, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n完成：{}題已標記，{}題需審閱，{}批失敗".format(
        total_tagged, total_review, total_errors))
    print("輸出：{}".format(TAGGED_JSON))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 確認語法無誤**

```
python -c "import tag_indicators; print('OK')"
```

預期：`OK`

- [ ] **Step 3: 執行完整測試**

```
python test_tag_indicators.py
```

預期：`OK`（9 tests passed）

- [ ] **Step 4: Commit**

```
git -C "D:\備課ai\三下數學" add 學力檢測考古題/tag_indicators.py
git -C "D:\備課ai\三下數學" commit -m "feat: tag_indicators — 主流程完成，支援斷點續跑"
```

---

## Task 5: 試跑驗證

**Files:**
- 無新增，驗證腳本可正常執行

- [ ] **Step 1: 確認 ANTHROPIC_API_KEY 已設定**

```
python -c "import os; print('KEY:', 'OK' if os.environ.get('ANTHROPIC_API_KEY') else 'MISSING')"
```

若顯示 MISSING，在 PowerShell 執行：
```
$env:ANTHROPIC_API_KEY = "your-key-here"
```

- [ ] **Step 2: 先只跑一份試卷測試（114年三年級）**

暫時修改 `main()` 第一行後加上限制，或手動建一個小版本測試：

```python
# 建立只含 114年3年級的測試輸入
python -c "
import json
with open('exam_questions.json', encoding='utf-8') as f:
    data = json.load(f)
test = [r for r in data if r['year']==114 and r['grade']==3]
with open('exam_questions_test.json', 'w', encoding='utf-8') as f:
    json.dump(test, f, ensure_ascii=False, indent=2)
print('建立測試檔：', len(test[0]['questions']), '題')
"
```

- [ ] **Step 3: 用測試檔跑一次，確認輸出格式正確**

暫時將 `tag_indicators.py` 中的 `EXAM_JSON` 和 `TAGGED_JSON` 改為測試路徑，執行：

```python
# 在 tag_indicators.py 頂端暫時加：
EXAM_JSON   = os.path.join(BASE_DIR, "exam_questions_test.json")
TAGGED_JSON = os.path.join(BASE_DIR, "exam_questions_test_tagged.json")
```

```
python tag_indicators.py
```

預期輸出：
```
[114年 3年級 批次 1/3]... OK (10 題)
[114年 3年級 批次 2/3]... OK (10 題)
[114年 3年級 批次 3/3]... OK (5 題)
完成：25題已標記，N題需審閱，0批失敗
```

- [ ] **Step 4: 檢查輸出 JSON 格式**

```python
python -c "
import json
with open('exam_questions_test_tagged.json', encoding='utf-8') as f:
    data = json.load(f)
q = data[0]['questions'][0]
print('q_no:', q['q_no'])
print('indicators:', q['indicators'])
print('needs_review:', q['needs_review'])
"
```

預期：`indicators` 為非空陣列（如 `["N-3-3"]`），`needs_review` 為 bool。

- [ ] **Step 5: 還原正式路徑，刪除測試檔，執行完整標記**

```python
# 還原 tag_indicators.py 頂端路徑常數：
EXAM_JSON   = os.path.join(BASE_DIR, "exam_questions.json")
TAGGED_JSON = os.path.join(BASE_DIR, "exam_questions_tagged.json")
```

```
del exam_questions_test.json exam_questions_test_tagged.json
python tag_indicators.py
```

完整執行預計 10-15 分鐘（661 題 ÷ 10 = 67 批）。

- [ ] **Step 6: 最終 commit**

```
git -C "D:\備課ai\三下數學" add 學力檢測考古題/exam_questions_tagged.json
git -C "D:\備課ai\三下數學" commit -m "data: exam_questions_tagged — AI 課綱代碼標記完成"
```
