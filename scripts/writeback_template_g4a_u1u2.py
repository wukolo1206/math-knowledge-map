# 單元回寫知識地圖：寫入腳本範本（2026-09-13 四上 U1/U2 實際使用版）
# 用法：複製成新檔，改掉「單元 id」與各段內容；四道保護（無損重寫、只動目標單元、冪等、關係名稱查證）不要拿掉。
# 流程說明：docs/單元回寫知識地圖流程.md
# 注意：可安全重跑（冪等）：indicators/relations/課本對應/notes 已存在就跳過，activities/objectives 為整段覆寫。

import json, sys
P = r'd:\備課ai\康軒數學\knowledge-map\data\units.json'
raw = open(P, encoding='utf-8').read()
d = json.loads(raw)
dump = lambda o: json.dumps(o, ensure_ascii=False, indent=2)
assert dump(d) == raw, '原檔無法無損重寫，停止'

u1 = next(x for x in d if x['id'] == '4u-u1-一億以內的數')
u2 = next(x for x in d if x['id'] == '4u-u2-整數的乘法')
before = {k: dump(v) for k, v in ((x['id'], x) for x in d) if k not in (u1['id'], u2['id'])}

# A. 學習表現
def add_ind(u, code, text):
    if not any(i['code'] == code for i in u['indicators']):
        u['indicators'].append({'code': code, 'text': text})
add_ind(u1, 'n-II-1', '理解一億以內數的位值結構，並據以作為各種運算與估算之基礎。')
add_ind(u2, 'n-II-2', '熟練較大位數之加、減、乘計算或估算，並能應用於日常解題。')

# B. U2 單元目標（教冊資料篇印刷頁30「本單元」）
u2['objectives'] = [
    '能使用乘法直式解決生活情境中，四位數乘以一位數的問題。',
    '能使用乘法直式解決生活情境中，一、二位數乘以二位數的問題。',
    '能使用乘法直式解決生活情境中，三、四位數乘以二位數的問題。',
    '能熟練乘法直式計算。',
]

# 第7項 活動內容（課本印刷頁，已逐頁核對）
u1['activities'] = [
    '十萬以內的數（p6–9）：10 張 1000 元紮成一疊＝1 萬，認識萬位、十萬位；讀寫中間有 0 的數，分解與合成',
    '一億以內的數（p10–13）：認識百萬位、千萬位，9 千萬＋1 千萬＝一億；四位一組報讀與讀零規則',
    '數的大小比較（p14）：課本兩種方法並陳——從最高位比、先用位數比',
    '大數的加減（p15–16）：直式計算，「377萬＋92萬」簡記法；素養吧用幾個一、幾個萬計算',
]
u2['activities'] = [
    '四位數×一位數（p20–21）：3×2 到 3000×2 只變 0 的個數；1426×3 兩次進位；2009×6 被乘數中間有 0',
    '一、二位數×二位數（p22–25）：一位數×整十、整十×整十；6×28；24×12 配行列圖形；28×74；53×80 補 0 兩種寫法',
    '三、四位數×二位數（p26–28）：218×39；402×36 中間有 0；190×30 與 205×20 比大小；2008×21；素養吧判斷缺少的資訊',
]

# 1～3 備課提醒補充
if '讀法細節' not in u1['notes']: u1['notes'] += '讀法細節：數字開頭的「十萬」不讀「一十萬」（課本p6），數字中間的「一十」不能省，如「八千零一十萬零六」（課本p17）。課本從「10 張 1000 元紮成一疊＝1 萬元」開始（p6），不要直接從 1 萬元講起，以免跳過千→萬的化聚。'
if '進位記號寫在哪' not in u2['notes']: u2['notes'] += '進位記號寫在哪有三種說法：課本p21「在十位上方記1」、課本p25教師註記「記在心裡、手指頭或紙上的其他地方」、教冊（資料篇印刷頁27）建議記在進位後數字的下方，不宜只認定一種寫法。課本p24的24×12先列四列展開（8、40、40、200）對應行列圖形四塊，再給兩列寫法（48、240）；p25的53×80乘數個位是0，可省略一列直接寫4240。另有兩段非編號活動：開門活動（p19）郵局文旦包裹費率表，先判讀表格再算運費；練習百分百（二）（p29–30）第2題給錯誤直式，要學生判斷對錯並訂正。'

# 4 迷思 → 課本對應
def ref(u, mid, text):
    m = next(x for x in u['misconceptions'] if x['id'] == mid)
    if '課本對應' not in m['description']:
        m['description'] += '。課本對應：' + text
ref(u1, 'C-BIGNUM-ZERO-PLACE', '活動一p7（30100、38005）、活動二p12（捷運人次讀零規則）、練習百分百（一）p17')
ref(u1, 'C-BIGNUM-UNIT-CONVERT', '活動一p9、活動二p13（幾個萬、幾個千的分解與合成）；練習百分百（一）p18第5題（不同寫法的數比大小）')
ref(u1, 'C-BIGNUM-BORROW', '活動四p15（中文類比外文類多幾冊）、素養吧p16（出生人數比死亡人數少幾人）、練習百分百（一）p18第7題')
ref(u2, 'C-MUL-PARTIAL-ALIGN', '活動二第⑤⑥題（p24–25）、練習百分百（二）第2題②（p29，37×52的185沒有左移）')
ref(u2, 'C-MUL-CARRY-OMIT', '活動一第③題（p21，1426×3）、活動二第⑥題（p25，28×74）')
ref(u2, 'C-MUL-SWAP-OPERANDS', '活動二第②題（p22，6×28）')
ref(u2, 'C-MUL-DIGITWISE-PAIRING', '練習百分百（二）第2題①（p29，21×43寫成83）')
ref(u2, 'C-MUL-PLACE-MEANING', '活動二第⑤題行列圖形（p24）')

# C 易錯影響
def rel(u, mid, to, note):
    name = next(x for x in u['misconceptions'] if x['id'] == mid)['name']
    assert any(c['name'] == to for c in u['concepts']), to
    if not any(r['from'] == name and r['to'] == to for r in u['concept_relations']):
        u['concept_relations'].append({'from': name, 'to': to, 'type': '易錯影響', 'note': note})
rel(u1, 'C-BIGNUM-BORROW', '大數的加減', '跨萬位借位出錯會直接影響大數減法')
rel(u1, 'C-BIGNUM-ZERO-PLACE', '十萬以內的數', '判斷不出 0 所在位值會影響十萬以內數的讀寫')
rel(u1, 'C-BIGNUM-ZERO-PLACE', '一億以內的數', '讀零規則不穩會影響一億以內數的報讀與記數')
rel(u1, 'C-BIGNUM-UNIT-CONVERT', '大數大小比較', '未換成相同單位就比較，會影響大數大小判斷（延伸範圍）')
rel(u1, 'C-BIGNUM-DIGIT-BOUND', '十萬以內的數', '位數概念不穩會影響認識萬位、十萬位的數（證據較弱）')
rel(u2, 'C-MUL-PARTIAL-ALIGN', '一二位數乘以二位數', '第二列部分積未左移會直接算錯二位數×二位數')
rel(u2, 'C-MUL-PARTIAL-ALIGN', '三四位數乘以二位數', '部分積位值對齊錯誤會影響三四位數×二位數')
rel(u2, 'C-MUL-CARRY-OMIT', '四位數乘以一位數', '漏加進位會影響四位數×一位數的多次進位')
rel(u2, 'C-MUL-CARRY-OMIT', '三四位數乘以二位數', '部分積與相加過程漏加進位會影響多位數乘法')
rel(u2, 'C-MUL-SWAP-OPERANDS', '一二位數乘以二位數', '把一位數×二位數改寫成二位數×一位數，會失去學二位數乘數直式的基礎')
rel(u2, 'C-MUL-DIGITWISE-PAIRING', '一二位數乘以二位數', '同位對應相乘只寫一列，會使二位數×二位數算錯')
rel(u2, 'C-MUL-PLACE-MEANING', '一二位數乘以二位數', '說不出部分積位值意義，難以理解二位數×二位數直式的合理性')

after = {x['id']: dump(x) for x in d if x['id'] not in (u1['id'], u2['id'])}
assert before == after, '其他單元被動到，停止'
out = dump(d)
json.loads(out)
open(P, 'w', encoding='utf-8', newline='').write(out)
print('寫入完成')
for u in (u1, u2):
    print(u['id'], 'indicators', len(u['indicators']), 'objectives', len(u['objectives']),
          'activities', len(u['activities']), 'relations', len(u['concept_relations']))
