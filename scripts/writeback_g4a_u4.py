# 四上 U4 整數的除法：回寫知識地圖（2026-10-01）
# 依 scripts/writeback_template_g4a_u1u2.py；審核表：四上U4除法回寫審核表.md（使用者核可 A～D 全部寫入，A4 scope=extension）
# 四道保護：無損重寫、只動目標單元、冪等、關係名稱查證

import json
P = r'd:\備課ai\30_康軒數學\knowledge-map\data\units.json'
raw = open(P, encoding='utf-8').read()
d = json.loads(raw)
dump = lambda o: json.dumps(o, ensure_ascii=False, indent=2)
assert dump(d) == raw, '原檔無法無損重寫，停止'

U = '4u-u4-整數的除法'
u = next(x for x in d if x['id'] == U)
before = {x['id']: dump(x) for x in d if x['id'] != U}

# A. 迷思
def add_mc(m):
    if not any(x['id'] == m['id'] for x in u['misconceptions']):
        u['misconceptions'].append(m)

add_mc({
    'id': 'C-DIV-QUOTIENT-ZERO',
    'name': '不夠分時商漏記 0',
    'description': '直式中某一位不夠分時，沒有在商的那一位記 0，商少一位（例：2453÷8 寫成 36…5、1900÷18 寫成 15…10）。課本對應：活動1第②題（p49，2453÷8「5 個十÷8 不夠分到 1 個十，所以在商的十位記 0」）、第③題（p49，3042÷5）；活動4第②題（p57，1900÷18 填空式對話）；練習百分百（四）第1題③（p59，3821÷36）',
    'source_note': '114(1)數學4上教冊(資料篇) 印刷頁44（PDF第46頁）「本單元指導重點」：「學生在進行『除法直式計算』的『估商』策略並執行運算時，常常出現『忘記在商的十位數位置補上0』」，並建議提醒學生「若中間的數遇有『不夠分』的情形，記得在該『位值』的位置上補『0』」。',
    'evidence_level': 'manual_explicit',
    'scope': 'core',
})
add_mc({
    'id': 'C-DIV-REMAINDER-NOT-LESS',
    'name': '餘數沒有比除數小（商估小沒有調大）',
    'description': '試商偏小時沒有把商調大，寫出比除數大或相等的餘數（例：87÷25 寫成 2…37、68÷17 寫成 3…17）。課本對應：活動2第③題左邊做法（p51，「還剩下 16 顆，可以再裝成 1 盒」）、第⑤題（p52，68÷17）、第⑥題右邊做法（p53，「37 比 25 大，還可以再分」）；活動3動動腦（p55，判斷 57)522 商 8 剩 66）',
    'source_note': '114(1)數學4上教冊(資料篇) 印刷頁47（PDF第49頁）引 110 年度四年級學力檢測第16題：20% 學生（低分組 29%）選「每人分到52顆蘋果，剩下23顆蘋果」，教冊判讀「他們並未注意『餘數必須小於除數』的約定」。另：課本 p52 教師註記「第5題的除數如果估為20，學生可能會將商低估的情形，教師可提醒學生將商調大再計算」。注意：選答比例為全國資料，非本班學生作答。',
    'evidence_level': 'actual_response',
    'scope': 'core',
})
add_mc({
    'id': 'C-DIV-REVERSED-SMALL',
    'name': '被除數比除數小時改用大數除以小數',
    'description': '被除數比除數小時，把兩數對調來算（例：26÷29 算成 29÷26＝1…3），不知道商是 0、餘數是被除數。課本對應：活動2第⑦題（p53，26÷29）、做做看③（p53，50÷58）',
    'source_note': '課本 p53 教師註記：「第7題讓學生經驗被除數小於除數如何處理的情境，以免學生直接用大數除以小數來計算」。114(1)數學4上教冊(資料篇) 印刷頁44（PDF第46頁）說明此題用意：讓學生「形成『當被除數比除數小時，則商必為0』的推論」。',
    'evidence_level': 'manual_explicit',
    'scope': 'core',
})
add_mc({
    'id': 'C-DIV-HALVE-ALL',
    'name': '除數變一半時，以為商和餘數都跟著變一半',
    'description': '已知「平分給 36 人，每人 26 顆，剩 23 顆」，改平分給 18 人時，以為每人分到的數量和剩下的數量都變一半。課本 p47–60 沒有「除數改變、比較結果」的題型，列為延伸',
    'source_note': '114(1)數學4上教冊(資料篇) 印刷頁47（PDF第49頁）引 110 年度四年級學力檢測第16題：15% 學生選「每人分到13顆，剩下12顆」、10% 選「每人分到13顆，剩下11顆」（低分組 25%、18%），教冊判讀「他們誤認為：當『平分的人數』變為一半時，則『每人分到的蘋果數量』及『剩下的蘋果數量』也會變為一半」。注意：選答比例為全國資料，非本班學生作答。',
    'evidence_level': 'actual_response',
    'scope': 'extension',
})

# A5、A6 修改既有迷思
mp = next(x for x in u['misconceptions'] if x['id'] == 'C-DIV-QUOTIENT-PLACE')
if '課本對應' not in mp['description']:
    mp['description'] = '商從哪一位開始寫、商有幾位判斷錯誤（例：225÷40 把商 5 寫在十位，讀成 50）。中間不夠分漏記 0 另見「不夠分時商漏記 0」。課本對應：活動3第①題②（p54，225÷40 商寫在個位）、第①題③（p55，「將 7 記在商的個位」）；習作 p52 第2、3題（判斷商是幾位數）'
mi = next(x for x in u['misconceptions'] if x['id'] == 'C-DIV-INVERSE-REMAINDER')
if '課本 p47–60' not in mi['description']:
    mi['description'] += '。課本 p47–60 沒有由商與餘數反推除數或被除數的題目'

# B. 易錯影響
def rel(mid, to, note):
    name = next(x for x in u['misconceptions'] if x['id'] == mid)['name']
    assert any(c['name'] == to for c in u['concepts']), to
    if not any(r['from'] == name and r['to'] == to for r in u['concept_relations']):
        u['concept_relations'].append({'from': name, 'to': to, 'type': '易錯影響', 'note': note})
rel('C-DIV-QUOTIENT-ZERO', '四位數除以一位數', '2453÷8 漏記十位的 0 會寫成 36')
rel('C-DIV-QUOTIENT-ZERO', '四位數除以二位數', '1900÷18 漏記十位的 0 會寫成 15')
rel('C-DIV-REMAINDER-NOT-LESS', '二位數除以二位數', '估商偏小沒有調大，餘數會大於除數')
rel('C-DIV-REMAINDER-NOT-LESS', '三位數除以二位數', '估商偏小沒有調大，餘數會大於除數')
rel('C-DIV-REVERSED-SMALL', '二位數除以二位數', '被除數比除數小時對調計算，商與餘數都錯')

# C. 活動（只放課本編號活動），非編號活動寫 notes
u['activities'] = [
    '四位數÷一位數（p48–49）：5918÷4 用「幾個千、幾個百」說明每一輪；2453÷8 千位不夠分、十位記 0；3042÷5',
    '二位數÷二位數（p50–53）：整十÷整十用硬幣想；86÷21 看成 20 估商；64÷12 兩種做法（分兩次商／估 6 改 5）；95÷28 看成 30；87÷25 兩種估法都要調整；26÷29 商 0',
    '三位數÷二位數（p54–56）：225÷40 商寫在個位；215÷32 試 7 改 6；動動腦判斷餘數大於除數；672÷21 商二位數；500 人每人一片最少切幾個西瓜',
    '四位數÷二位數（p57–58）：6820÷20；1900÷18 十位記 0；2150÷26 示範驗算「除數×商＋餘數＝被除數」',
]
if '非編號活動' not in u['notes']:
    u['notes'] += '另有兩段非編號活動：開門活動（p47）牧場發胡蘿蔔，129÷3＝43，判斷誰領到最後一袋；練習百分百（四）（p59–60），含 564 人每車最多 42 人、最少要幾輛（要進位成 14 輛）。'

# D. 單元目標（教冊資料篇印刷頁40「單元目標」）
u['objectives'] = [
    '能使用除法直式解決生活情境中，四位數除以一位數的問題。',
    '能使用除法直式解決生活情境中，二位數除以二位數的問題。',
    '能使用除法直式解決生活情境中，三位數除以二位數的問題。',
    '能使用除法直式解決生活情境中，四位數除以二位數的問題。',
    '能熟練除法直式計算。',
    '能透過驗算，檢驗除法答案的正確性。',
]

after = {x['id']: dump(x) for x in d if x['id'] != U}
assert before == after, '其他單元被改到，停止'
open(P, 'w', encoding='utf-8').write(dump(d))
print('寫入完成', {k: len(v) for k, v in u.items() if isinstance(v, list)})
