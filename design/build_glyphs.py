import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os
H=280  # cap height in px
def load(n):
    im=Image.open(f'raw/{n}.png').convert('L')
    s=H/im.height
    im=im.resize((max(1,round(im.width*s)),H),Image.LANCZOS)
    # Slightly thinner than the sign so the small counters (A, B, R, O...) stay open.
    return thin(im.point(lambda v:255 if v>140 else 0))
def thin(im, blur=10, cut=236):
    # Pad first so the outer edges thin too (letters are cropped tight), then crop back.
    P=30; pad=Image.new('L',(im.width+2*P,im.height+2*P),0); pad.paste(im,(P,P))
    t=pad.filter(ImageFilter.GaussianBlur(blur)).point(lambda v:255 if v>cut else 0)
    bb=t.getbbox(); return t.crop((bb[0],P,bb[2],P+im.height))
G={}
for k,src in {'A':'A','B':'B','C':'C','E':'E2','F':'F','G':'G','I':'I','M':'M','N':'N','O':'O','R':'R','S':'S','T':'T','V':'V','&':'AMP'}.items():
    G[k]=load(src)
# É keeps its accent above cap height
ea=Image.open('raw/Eacute.png').convert('L'); s=H/ (ea.height*0.78); ea=thin(ea.resize((round(ea.width*s),round(ea.height*s)),Image.LANCZOS).point(lambda v:255 if v>140 else 0))
G['É']=ea
I=np.array(G['I'])>0
sw=int(np.median(I.sum(axis=1)[H//4:3*H//4]))  # stem width (after thinning, so drawn letters match)
print('stem width',sw)
def canvas(w): return Image.new('L',(w,H),0)
def bar(d,x0,y0,x1,y1):  # rounded bar
    d.rounded_rectangle([x0,y0,x1,y1],radius=min(x1-x0,y1-y0)//2,fill=255)
def stroke(d,p,q,w=None):
    w=w or sw; d.line([p,q],fill=255,width=w); r=w/2
    for (x,y) in (p,q): d.ellipse([x-r,y-r,x+r,y+r],fill=255)
def arr(im): return np.array(im)>0
def img(a): return Image.fromarray((a*255).astype('uint8'))
# L from E: keep stem and bottom bar
E=arr(G['E']); cols=np.nonzero(E.any(0))[0]; x0=cols[0]
L=E.copy(); L[:H-int(sw*1.15), x0+int(sw*1.05):]=False; G['L']=img(L)
# H: two stems + middle bar
w=int(H*0.78); c=canvas(w); d=ImageDraw.Draw(c); c.paste(G['I'],(0,0)); c.paste(G['I'],(w-G['I'].width,0),G['I']); bar(d,sw//2,H//2-sw//2+4,w-sw//2,H//2+sw//2+4); G['H']=c
# D: stem + right half of O + top/bottom bars
O=arr(G['O']); ow=O.shape[1]; cx=ow//2
w=int(ow*0.92)+sw//2; c=canvas(w); d=ImageDraw.Draw(c)
right=img(O[:,cx:]); c.paste(right,(w-right.width,0),right); c.paste(G['I'],(0,0),G['I'])
top=np.nonzero(O[:,cx])[0]; bar(d,sw//3,top[0],w-right.width+sw//2,top[0]+sw); bar(d,sw//3,H-sw-(H-1-top[-1]),w-right.width+sw//2,H-(H-1-top[-1]))
G['D']=c
# P: R without the leg
R=arr(G['R']); P=R.copy(); rows=R.sum(1)
cut=int(H*0.6); P[cut:, int(sw*1.1)+np.nonzero(R.any(0))[0][0]:]=False; G['P']=img(P)
# U: lower half of O + two side bars
w=ow; c=canvas(w); d=ImageDraw.Draw(c); low=img(O[H//2:,:]); c.paste(low,(0,H//2),low)
lc=np.nonzero(O[H//2,:])[0]; bar(d,lc[0],0,lc[0]+sw,H//2+sw//2); bar(d,lc[-1]-sw,0,lc[-1],H//2+sw//2); G['U']=c
# J: right bar + bottom hook
U=arr(G['U']); J=U.copy(); J[:int(H*0.62),:w//2]=False; jc=np.nonzero(J.any(0))[0]; G['J']=img(J[:,jc[0]:jc[-1]+1])
# K
w=int(H*0.74); c=canvas(w); d=ImageDraw.Draw(c); c.paste(G['I'],(0,0),G['I']); m=(int(sw*0.9),int(H*0.55))
stroke(d,m,(w-sw//2,sw//2)); stroke(d,(int(sw*1.2),int(H*0.45)),(w-sw//2,H-sw//2)); G['K']=c
# W: two Vs
V=G['V']; vw=V.width; off=int(vw*0.58); c=canvas(vw+off); c.paste(V,(0,0),V); c.paste(V,(off,0),V); G['W']=c
# X, Y, Z drawn
w=int(H*0.78); c=canvas(w); d=ImageDraw.Draw(c); stroke(d,(sw//2,sw//2),(w-sw//2,H-sw//2)); stroke(d,(w-sw//2,sw//2),(sw//2,H-sw//2)); G['X']=c
w=int(H*0.8); c=canvas(w); d=ImageDraw.Draw(c); mid=(w//2,int(H*0.52)); stroke(d,(sw//2,sw//2),mid); stroke(d,(w-sw//2,sw//2),mid); bar(d,w//2-sw//2,int(H*0.45),w//2+sw//2,H); G['Y']=c
w=int(H*0.72); c=canvas(w); d=ImageDraw.Draw(c); bar(d,0,0,w,sw); bar(d,0,H-sw,w,H); stroke(d,(w-sw*0.8,sw*0.8),(sw*0.8,H-sw*0.8)); G['Z']=c
# Q: O + tail
c=G['O'].copy(); d=ImageDraw.Draw(c); w=c.width; c2=canvas(w+sw//2); c2.paste(c,(0,0)); d=ImageDraw.Draw(c2); stroke(d,(int(w*0.62),int(H*0.72)),(w,H-sw//2)); G['Q']=c2
# punctuation
r=int(sw*0.6)
def dot(cv,x,y): ImageDraw.Draw(cv).ellipse([x-r,y-r,x+r,y+r],fill=255)
c=canvas(2*r+2); dot(c,r+1,H-r-1); G['.']=c
c=Image.new('L',(2*r+14,H+int(r*2.4)),0); dot(c,r+8,H-r-1); stroke(ImageDraw.Draw(c),(r+12,H-r),(r,H+int(r*1.7)),int(sw*0.6)); G[',']=c
c=canvas(sw+2); bar(ImageDraw.Draw(c),1,0,sw+1,int(H*0.32)); G["'"]=c
c=canvas(int(H*0.42)); bar(ImageDraw.Draw(c),0,int(H*0.5)-sw//2,c.width,int(H*0.5)+sw//2); G['-']=c
c=canvas(2*r+2); dot(c,r+1,H-r-1); dot(c,r+1,int(H*0.4)); G[':']=c
c=canvas(sw+2); bar(ImageDraw.Draw(c),1,0,sw+1,int(H*0.68)); dot(c,sw//2+1,H-r-1); G['!']=c
w=int(H*0.74); c=canvas(w); d=ImageDraw.Draw(c); d.arc([0,0,w,int(H*0.6)],180,95,fill=255,width=sw); d.ellipse([0,int(H*0.3)-sw//2-sw//2+sw//2,sw,int(H*0.3)+sw//2],fill=255)
bar(d,w//2-sw//2,int(H*0.5),w//2+sw//2,int(H*0.74)); dot(c,w//2,H-r-1); G['?']=c
os.makedirs('glyphs',exist_ok=True)
for k,im in G.items():
    name={'&':'amp','.':'period',',':'comma',"'":'quote','-':'hyphen',':':'colon','!':'exclam','?':'question','É':'Eacute'}.get(k,k)
    # pad so tracing sees edges; keep baseline: bottom of cap = row H
    pad=Image.new('L',(im.width+20,max(im.height,H)+60),0); pad.paste(im,(10,30))
    # Trace at 2x with a soft blur so the outlines come out smooth.
    pad=pad.resize((pad.width*2,pad.height*2),Image.LANCZOS).filter(ImageFilter.GaussianBlur(18))
    pad.point(lambda v:255 if v>127 else 0).save(f'glyphs/{name}.png')
print(sorted(G))
