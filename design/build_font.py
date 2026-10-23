import json, re
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.boundsPen import BoundsPen
H=280; F=2; SCALE=700/(H*F); SB=45
paths=json.load(open('paths.json'))
def tokens(d): return re.findall(r'[MCLZ]|-?\d+\.?\d*',d)
def draw(pen,d,base):
    t=tokens(d); i=0; cmd=None; started=False
    def pt():
        nonlocal i
        x=float(t[i]); y=float(t[i+1]); i+=2
        return ((x-10*F)*SCALE+SB, (base*F-y)*SCALE)
    while i<len(t):
        if t[i] in 'MCLZ':
            cmd=t[i]; i+=1
            if cmd=='M':
                if started: pen.closePath()
                pen.moveTo(pt()); started=True
            continue
        if cmd=='C': pen.curveTo(pt(),pt(),pt())
        elif cmd in ('L','M'): pen.lineTo(pt())
    if started: pen.closePath()
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.areaPen import AreaPen
from fontTools.pens.reverseContourPen import ReverseContourPen
def oriented(out,d,base):
    # Outer contours counter-clockwise, holes clockwise (by nesting depth), so counters stay open.
    rec=RecordingPen(); draw(rec,d,base)
    contours=[]; cur=[]
    for op,args in rec.value:
        cur.append((op,args))
        if op=='closePath': contours.append(cur); cur=[]
    def bounds(c):
        b=BoundsPen(None)
        for op,args in c: getattr(b,op)(*args)
        return b.bounds
    def area(c):
        a=AreaPen()
        for op,args in c: getattr(a,op)(*args)
        return a.value
    bb=[bounds(c) for c in contours]
    for i,c in enumerate(contours):
        depth=sum(1 for j,o in enumerate(bb) if j!=i and o[0]<=bb[i][0] and o[1]<=bb[i][1] and o[2]>=bb[i][2] and o[3]>=bb[i][3])
        want_ccw = depth%2==0
        is_ccw = area(c)>0
        target = out if want_ccw==is_ccw else ReverseContourPen(out)
        for op,args in c: getattr(target,op)(*args)
names={'A':'A','B':'B','C':'C','D':'D','E':'E','Eacute':'Eacute','F':'F','G':'G','H':'H','I':'I','J':'J','K':'K','L':'L','M':'M','N':'N','O':'O','P':'P','Q':'Q','R':'R','S':'S','T':'T','U':'U','V':'V','W':'W','X':'X','Y':'Y','Z':'Z',
       'amp':'ampersand','period':'period','comma':'comma','quote':'quotesingle','hyphen':'hyphen','colon':'colon','exclam':'exclam','question':'question'}
order=['.notdef','space']+list(names.values())
cmap={32:'space'}
for k,g in names.items():
    if len(k)==1: cmap[ord(k)]=g; cmap[ord(k.lower())]=g
cmap.update({0xC9:'Eacute',0xE9:'Eacute',ord('&'):'ampersand',ord('.'):'period',ord(','):'comma',ord("'"):'quotesingle',0x2019:'quotesingle',ord('-'):'hyphen',ord(':'):'colon',ord('!'):'exclam',ord('?'):'question'})
charstrings={}; metrics={}
p=T2CharStringPen(500,None); p.lineTo  # .notdef empty box
p.moveTo((50,0)); p.lineTo((450,0)); p.lineTo((450,700)); p.lineTo((50,700)); p.closePath()
charstrings['.notdef']=p.getCharString(); metrics['.notdef']=(500,50)
p=T2CharStringPen(260,None); charstrings['space']=p.getCharString(); metrics['space']=(260,0)
for key,gname in names.items():
    g=paths[key]; base=30+(359 if key=='Eacute' else H)
    adv=round((g['w']-20*F)*SCALE+2*SB)
    pen=T2CharStringPen(adv,None); oriented(pen,g['d'],base)
    cs=pen.getCharString(); charstrings[gname]=cs
    bp=BoundsPen(None); draw(bp,g['d'],base); lsb=round(bp.bounds[0]) if bp.bounds else 0
    metrics[gname]=(adv,lsb)
fb=FontBuilder(1000,isTTF=False)
fb.setupGlyphOrder(order); fb.setupCharacterMap(cmap)
fb.setupCFF('SiRoSign-Regular',{'FullName':'SiRo Sign'},charstrings,{})
fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=900,descent=-200)
fb.setupNameTable({'familyName':'SiRo Sign','styleName':'Regular','copyright':"Lettering traced from the SiRo' Mangia & Bevi sign; missing letters drawn to match."})
fb.setupOS2(sTypoAscender=900,sTypoDescender=-200,usWinAscent=1000,usWinDescent=250,sCapHeight=700,sxHeight=700)
fb.setupPost()
fb.save('SiRoSign.otf')
from fontTools.ttLib import TTFont
f=TTFont('SiRoSign.otf'); f.flavor='woff2'; f.save('siro-sign.woff2')
import os; print(os.path.getsize('siro-sign.woff2'),'bytes')
