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
