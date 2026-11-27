#!/usr/bin/env bash
# Control de calidad de un MP4: ffprobe (fotogramas contados), cortes bruscos, fotogramas negros,
# tramos congelados, silencios y sonoridad EBU R128.
F=$1
FF=${FFMPEG:-/usr/bin/ffmpeg}
FP=${FFPROBE:-/usr/bin/ffprobe}
$FP -v error -count_frames -show_entries stream=codec_name,width,height,r_frame_rate,nb_read_frames:format=duration -of compact "$F"
$FF -v error -i "$F" -vf scale=96:54,format=gray -f rawvideo - | python3 -c "
import sys,numpy as np
d=np.frombuffer(sys.stdin.buffer.read(),np.uint8).astype(float)
W,H=96,54
if '$2'=='v': W,H=54,96
d=d.reshape(-1,H,W)
m=d.mean((1,2)); df=np.abs(np.diff(d,axis=0)).mean((1,2))
print('fotogramas',len(d),'| luma mínima',round(m.min(),1),'en',round(m.argmin()/30,2),'s | negros (<6):',int((m<6).sum()))
print('cortes>35:',[round((i+1)/30,2) for i in np.where(df>35)[0]])
st=0;mx=0;pos=0
for i,v in enumerate(df):
  st=st+1 if v<0.15 else 0
  if st>mx: mx,pos=st,i
print('tramo casi estático más largo:',mx,'fotogramas, termina en',round(pos/30,2),'s')
"
$FF -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | grep -E "I:|LRA:|Peak:"
$FF -v error -i "$F" -ac 1 -ar 8000 -f s16le - | python3 -c "
import sys,numpy as np
a=np.frombuffer(sys.stdin.buffer.read(),np.int16).astype(float)/32768
w=a[:len(a)//4000*4000].reshape(-1,4000); r=20*np.log10(np.sqrt((w**2).mean(1))+1e-9)
q=[i/2 for i in np.where(r<-45)[0]]
print('ventanas de 0,5 s por debajo de −45 dB:',len(q),q[:20])"
