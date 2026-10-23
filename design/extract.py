import numpy as np
from PIL import Image
from scipy import ndimage
lab=np.load('lab.npy')
def comp(i):
    sl=ndimage.find_objects(lab)[i-1]
    return (lab[sl]==i), sl
# fit circle through arc letter centres
arc={14:'M',10:'A2',7:'N',5:'G',3:'I2',2:'A3',1:'AMP',4:'B2',6:'E2',9:'V',13:'I3'}
cs=[]
for i in arc:
    m,sl=comp(i); yy,xx=np.nonzero(m); cs.append((xx.mean()+sl[1].start, yy.mean()+sl[0].start))
cs=np.array(cs); x,y=cs[:,0],cs[:,1]
A=np.c_[2*x,2*y,np.ones(len(x))]; b=x**2+y**2
cx,cy,c=np.linalg.lstsq(A,b,rcond=None)[0]; r=np.sqrt(c+cx**2+cy**2)
print('circle',round(cx),round(cy),round(r))
out={}
for (i,name),(px,py) in zip(arc.items(),cs):
    m,sl=comp(i)
    ang=np.degrees(np.arctan2(py-cy,px-cx))+90  # letter 'up' points away from centre
    im=Image.fromarray((m*255).astype('uint8'))
    pad=Image.new('L',(im.width+40,im.height+40),0); pad.paste(im,(20,20))
    rot=pad.rotate(ang,resample=Image.BICUBIC,expand=True)
    out[name]=rot
straight={38:'C',39:'A',40:'F',37:'Eacute',41:'B',42:'I',43:'S',44:'T',45:'R',46:'O'}
for i,name in straight.items():
    m,sl=comp(i); out[name]=Image.fromarray((m*255).astype('uint8'))
import os; os.makedirs('raw',exist_ok=True)
for k,im in out.items():
    bb=im.point(lambda v:255 if v>127 else 0).getbbox(); im.crop(bb).save(f'raw/{k}.png'); print(k, im.crop(bb).size)
