# CHANGELOG — knowledge-map

## @2026-10-08 — 四上 U4 補學習表現 n-II-2、n-II-3

只動 `4u-u4-整數的除法`（`indicators` 與 `notes` 末尾一句），其他單元未變。

- **indicators 補 `n-II-2`、`n-II-3`**，原文照課綱 PDF 印刷p9。依據：課綱 N-4-2 的「對應學習表現」欄（印刷p26）列 n-II-2、n-II-3；教冊 U4 連結架構頁（印刷p50）只列 n-II-3。使用者決定兩者都列，`notes` 註明 n-II-2 來源是課綱。
- **更正 2026-10-01 的「未做」**：當時寫「學習表現（教冊 U4 只列 N-4-2）」，那是只看了教學計畫頁；連結架構頁有 n-II-3。審核表已加第六節更正。
- 備份 `data/units.json.bak_20261008`（不進版控）。驗證：`check-data-quality.js`、`check-g4a-completion-gap.js`、`check-indicator-filter-ui.js` 通過；`git diff` 只有 U4 區塊（+9／−1）。
- 已同步（2026-10-09）：`數學學習地圖/data/concept_standards.csv` 的 U4 四個除法概念補 `n-II-2`（`supporting`；上層 repo commit 26579ee），與 `units.json` 一致。已 push（4d8b982..0c605d1），GitHub Pages 的 `data/units.json` 已含 n-II-2、n-II-3。

## @2026-10-01 — 四上 U4 整數的除法回寫（備課分析 → 證據閘門）

依 `四上U4除法回寫審核表.md`，使用者裁決 A～D 全部寫入、A4 列為延伸；腳本 `scripts/writeback_g4a_u4.py`（四道保護，重跑冪等），只動 `4u-u4-整數的除法`：

- **新增迷思 4 筆**：`C-DIV-QUOTIENT-ZERO` 不夠分時商漏記 0（教冊印44 明文，`manual_explicit`）、`C-DIV-REMAINDER-NOT-LESS` 餘數沒有比除數小（110 年學力檢測第16題 20%，`actual_response`）、`C-DIV-REVERSED-SMALL` 被除數比除數小時對調（課本 p53 教師註記，`manual_explicit`）、`C-DIV-HALVE-ALL` 除數變一半以為商餘都減半（同題 15%＋10%，`actual_response`，scope `extension`）
- **修改** `C-DIV-QUOTIENT-PLACE` 只描述商的起始位與位數（漏補 0 移到新條目），補課本對應；`C-DIV-INVERSE-REMAINDER` 註明課本無此題型
- **易錯影響 5 條**、**活動 4 條改為「名稱（頁碼）：內容」**、notes 補開門活動與練習百分百、**單元目標 3→6 條**（教冊資料篇印40）
- 驗證：`unit_brief.py 4 1 4` 閘門由「未通過（弱證據 2）」變為「通過（強證據 4、弱證據 2）」；`node scripts/check-all-completion-gaps.js` 全過
- 未做：學習表現（教冊 U4 只列 N-4-2）；網站三分頁的 Playwright 檢查待補

## @2026-09-13 — 四上 U3 角度補教冊明文迷思（備課分析回寫）

依 `docs/superpowers/specs/2026-09-13-u3-angle-analysis.md` ②-1，使用者裁決補入，只動 `4u-u3-角度`：

- **新增** `C-ANGLE-CONSERVATION` 角度保留（教冊 PDF p36／印 p34 教學注意事項 3 明文，`manual_explicit`）
- `C-ANGLE-PROTRACTOR-SCALE` source_note 補注意事項 2 原句「誤將 70°報讀成 110°」
- `C-ANGLE-ROTATION` source_note 補指導重點 6；屬教學提醒，**證據強度維持 `distractor_hypo`**
- 備份 `data/units.json.bak`（取於同日 U1/U2 回寫之後）
- `4u-u3-角度` 回填 `tools`：量角器與角度（`../4上U03_角度_angle-protractor/index.html`；已部署 https://wukolo1206.github.io/angle-protractor/）；`check-data-quality.js`、`check-all-completion-gaps.js` 通過
- ⚠️ 既有風險：四上迷思不在 `數學學習地圖/data/concepts.csv`，重跑 `sync-g4a-concepts.js` 會清掉（已記入資料完整性檢查清單）

## @2026-09-13 — 四上 U1/U2 以教具備課成果補齊，對齊三下範本

依 `四上U1U2教具回寫審核表.md`（使用者裁決全部寫入），只動 `4u-u1`、`4u-u2`，其他 109 單元經腳本比對未變。

- **indicators 補學習表現**（三下範本有、四上缺）：U1 `n-II-1`、U2 `n-II-2`，原文經教冊連結架構頁與課綱 PDF 雙重核對
- **U2 objectives**：2 條 → 教冊印刷頁 30 原文 4 條（補「能熟練乘法直式計算」）
- **concept_relations 補「易錯影響」**（三下範本有、四上缺）：U1 5 條、U2 7 條
- **activities**：名稱後加課本印刷頁碼與一句內容
- **notes**：U1 補讀法規則與具體物起點；U2 補進位記號三種說法、p24/p25 兩種直式、開門活動與練習百分百
- **misconceptions**：8 筆 description 補「課本對應」頁碼／題號
- 全部頁碼逐頁核對課本 PDF；U1 設計文件頁碼有誤（見 PITFALLS）
- `check-all-completion-gaps.js`、`check-data-quality.js` 通過；備份 `data/units.json.bak_20260913`

## @2026-08-27 — 四下 U6/U7/U10 回填 tools，兩支教具歸位

- `3d-u1 分數的加減`：移除誤掛的「等值分數動畫」「異分母分數加減」
- `4d-u6 周長與面積`：補 area-perimeter
- `4d-u7 等值分數`：補 equivalent-fractions、fraction-add-subtract
  - fraction-add-subtract 只支援倍數分母，正對應 4d-u7 學習目標
    「簡單異分母分數的比較與加減（分母為另一分母的倍數）」；
    五上 U6 需通分／最小公倍數，該工具做不到，故**不歸五上**
- `4d-u10 立方公分`：補 math-cube-3d
- `scripts/check-data-quality.js` 通過
- 起因：整理 `專案統整網頁` 導航站分類時發現這三個單元 tools 欄為空

## @2026-08-23 — 四上 U2 回填 tools 欄位

- U2「整數的乘法」登錄 5 個互動教具連結（乘法直式板 multiplication-board）
- 對應 https://wukolo1206.github.io/multiplication-board/

## @2026-08-23 — 四上 U2「整數的乘法」迷思概念證據補強

- U2 原本 3 筆迷思全為誘答假設，`unit_brief.py` 閘門判定未通過
- 從教冊「本單元教學注意事項」補入 2 筆教冊明文（★）：
  - 乘法直式遺漏進位的數字（印刷頁27／PDF29 注意事項二）
  - 把「一位數×二位數」改寫成「二位數×一位數」（印刷頁26／PDF28 注意事項一）
- 「部分積位值對齊錯誤」由誘答假設升級為教冊明文（印刷頁27 注意事項三之3）
- 新增 1 筆教材推論：把二位數×二位數當成「同位對應相乘」只寫一列
  （課本p29 練習百分百(二)第2題① 21×43＝83，已核對課本原圖）
- 「複名數乘法未先化聚」標為 `scope: extension`（課本習作均無此題型）
- 所有來源改為**雙頁碼標示**（印刷頁＋PDF頁）——原本只寫一種而標錯
- 閘門重跑：通過（強證據 3 筆／弱證據 3 筆）

## @2026-05-27 — 110年六年級題目補完

- 新增 18 道缺漏六年級考古題（q01-q09, q12-17, q20, q21, q25），全部加入官方答案與評量向度
- 修正 7 筆既有條目答案與指標
- 資料庫共 702 題

## @2026-05-26 — 子專案文件初始化

- 新增固定專案文件
- 將 knowledge-map 的資料原則、部署驗證與交接規則收斂到本資料夾
