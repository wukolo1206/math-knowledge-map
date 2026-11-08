# 工作交接 — 2026-10-01

## 已完成
- 四上 U4 整數的除法回寫（審核表 `四上U4除法回寫審核表.md`，腳本 `scripts/writeback_g4a_u4.py`）：新增迷思 4（2 筆教冊明文、2 筆學力檢測選答）、修改 2、易錯影響 5、活動 4 條含頁碼、目標 6 條。
- `unit_brief.py 4 1 4` 閘門由未通過變通過；`check-all-completion-gaps.js` 全過。

## 目前進度
U4 已回寫；U5～U10 待處理。

## 未完成／待確認
- U4 `tools` 回填「除法直式板 https://teacherwu.xdai.tw/division/」待使用者同意。
- 網站卡片三分頁（概念／關聯／來源）的 Playwright 檢查尚未做。
- 工作區有 50 多個不屬於本次的改動（scripts、md 等），本次只 commit U4 相關檔案。

## 下一步
1. 補 U4 網站三分頁檢查與 tools。
2. 照 `docs/單元回寫知識地圖流程.md` 處理 U5～U10。

## 2026-10-08 補充

- 四上 U4 已補 `n-II-2`、`n-II-3`（見 CHANGELOG）。**待辦：** `數學學習地圖/data/concept_standards.csv` 的 U4 已於 2026-10-09 補 n-II-2（`supporting`），與 `units.json` 一致，U4 的 push 也已完成；`sync-g4a-concepts.js` 仍不可重跑。
- 對照架構文件在 `../4上U03-10_鷹架診斷_scaffold-diagnostic/docs/units/G4A-U04/U4課綱與教冊對照架構_v0.1.md`（含教冊15個活動目標代碼、課綱 N-4-2 備註、與鷹架技能的對照）。
- 順帶發現（未處理）：`3d-u1-分數的加減` 的 `n-II-10`、`3d-u2-除法` 的 `n-II-6` 文字與課綱不符（課綱 n-II-10 是時間加減、n-II-6 是同分母分數），疑似沿用舊版或其他來源的編號，可對照 `domain-indicator不一致校對清單.md` 核對。

## 2026-11-07 補充

- `data/units.json` 的 `4u-u6-三角形` 已登錄 `tools`：`三角形工作室（https://teacherwu.xdai.tw/triangle/）`。工作區其餘非本次檔案維持不動，僅 commit 本次異動檔。

## 注意事項
- 不可重跑 `sync-g4a-concepts.js`（會清掉四上迷思與易錯影響）。

---

## 先前交接（保留）
# 工作交接 — 2026-09-14

## 已完成

- **四上 U1/U2 以教具備課成果補齊 `data/units.json`**，對齊三下範本（commit `354b0b0`，已 push）
  - indicators 補學習表現：U1 `n-II-1`、U2 `n-II-2`（教冊連結架構頁＋課綱 PDF 原文核對）
  - U2 objectives 改教冊原文 4 條
  - concept_relations 補「易錯影響」：U1 5 條、U2 7 條
  - activities 加課本印刷頁碼與一句內容；notes 補充；8 筆迷思 description 補「課本對應」
  - 審核表：`四上U1U2教具回寫審核表.md`（頂端有寫入時的修正說明）
- **把做法存成可重用流程**（commit `b32e22c`，已 push）
  - `docs/單元回寫知識地圖流程.md`：八步流程、欄位寫法規格、六個坑、各單元進度表
  - `scripts/writeback_template_g4a_u1u2.py`：寫入腳本範本，已驗證可安全重跑
  - `~/.claude/skills/unit-design/SKILL.md`「完成後」加入回寫流程提醒
- PITFALLS 記錄：教具設計文件的課本頁碼可能是 PDF 頁碼、圈號可能是自編步驟號
- 上層 `數學學習地圖/資料完整性檢查清單.md` 補紀錄與尚存缺口（上層 repo commit `efafae3`，**未 push**）

（同日另一 session 做了 U3 角度迷思與 tools 回寫，見 CHANGELOG）

## 目前進度

四上 U1、U2 已依流程完整回寫並上線；U3 只補了迷思與 tools；U4～U10 尚未處理。

## 未完成／待確認

- 本 repo 本機領先 origin 1 筆（U3 session 的 commit），尚未 push
- 上層 `D:\備課ai` repo 領先數筆（含本次 `efafae3` 與其他專案 commit），尚未 push，需使用者決定
- U1「最小／最大 n 位數」迷思仍只有 1 題考古題佐證；課本 p6、p10、p11 有三處「是幾位數」提問，可評估補佐證
- 四上各單元活動格式不一致（U1/U2 有頁碼內容，其他沒有）
- `AGENTS.md` 的「收工四件事」規則同步（非本 session 撰寫）已於收工時另開一筆 commit 收進版控

## 下一步

1. 四上 U3～U10 照 `docs/單元回寫知識地圖流程.md` 補學習表現指標與易錯影響關係
2. 決定 U1「最小 n 位數」迷思是否以課本提問補佐證
3. 處理 `sync-g4a-concepts.js` 會清掉四上迷思與易錯影響的風險

## 注意事項

- ⚠️ **不要重跑 `scripts/sync-g4a-concepts.js`**：會以 `數學學習地圖/data/*.csv` 整批覆蓋四上 concepts、misconceptions、concept_relations，四上迷思與易錯影響不在 CSV 裡，會被清掉
- 課本頁碼一律回 `教材/四上/課本/*.pdf` 看頁尾印刷頁；U1 印刷頁＝PDF 頁＋4
- 網站卡片分「概念／關聯／來源」三分頁，驗證時三個都要看
- 不要 `git add -A`；工作區有大量只差 CRLF 的檔案，用 `git diff --ignore-cr-at-eol` 看真正改動
- 不要用推測補知識關係或迷思
