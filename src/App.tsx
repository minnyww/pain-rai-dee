import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Eraser, Paintbrush, Redo2, RotateCcw, Sparkles, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { drawTemplate } from '@/lib/templates'

type Template = { id: string; name: string; emoji: string; tag: string; tint: string }
type Point = { x: number; y: number }

const templates: Template[] = [
  { id: 'unicorn', name: 'ยูนิคอร์น', emoji: '🦄', tag: 'ยอดนิยม', tint: '#ffe4f4' },
  { id: 'dino', name: 'ไดโนเสาร์', emoji: '🦕', tag: 'ผจญภัย', tint: '#e5f7dc' },
  { id: 'space', name: 'อวกาศ', emoji: '🚀', tag: 'น่าตื่นเต้น', tint: '#e3f1ff' },
  { id: 'ocean', name: 'ใต้ทะเล', emoji: '🐳', tag: 'โลกสีฟ้า', tint: '#dff4ff' },
  { id: 'garden', name: 'สวนดอกไม้', emoji: '🌻', tag: 'สดใส', tint: '#fff3c9' },
  { id: 'cat', name: 'แมวน้อย', emoji: '🐱', tag: 'น่ารัก', tint: '#ffe9d4' },
  { id: 'castle', name: 'ปราสาท', emoji: '🏰', tag: 'เทพนิยาย', tint: '#f1e6ff' },
  { id: 'robot', name: 'หุ่นยนต์', emoji: '🤖', tag: 'ล้ำอนาคต', tint: '#e2f6f2' },
  { id: 'fruit', name: 'ผลไม้', emoji: '🍉', tag: 'อร่อย', tint: '#ffe4e4' },
  { id: 'butterfly', name: 'ผีเสื้อ', emoji: '🦋', tag: 'แสนสวย', tint: '#f3e8ff' },
]
const colors = [
  { c: '#ff5d8f', n: 'ชมพู' }, { c: '#ff943d', n: 'ส้ม' }, { c: '#ffd43b', n: 'เหลือง' }, { c: '#57d883', n: 'เขียว' },
  { c: '#38bdf8', n: 'ฟ้า' }, { c: '#7968ef', n: 'คราม' }, { c: '#a855f7', n: 'ม่วง' }, { c: '#5b3a29', n: 'น้ำตาล' },
]

function App(){
 const canvasRef=useRef<HTMLCanvasElement>(null),drawing=useRef(false),last=useRef<Point>({x:0,y:0}),history=useRef<ImageData[]>([]),step=useRef(-1),cursorRef=useRef<HTMLDivElement>(null)
 const [template,setTemplate]=useState(templates[0]),[color,setColor]=useState(colors[0].c),[effect,setEffect]=useState('normal'),[size,setSize]=useState(18),[burst,setBurst]=useState<Point|null>(null)
 const saveHistory=useCallback(()=>{const c=canvasRef.current;if(!c)return;const x=c.getContext('2d')!;history.current=history.current.slice(0,step.current+1);history.current.push(x.getImageData(0,0,c.width,c.height));if(history.current.length>20)history.current.shift();step.current=history.current.length-1},[])
 const resetCanvas=useCallback(()=>{const c=canvasRef.current;if(!c)return;const x=c.getContext('2d')!;x.fillStyle='white';x.fillRect(0,0,c.width,c.height);drawTemplate(x,template.id,c.width,c.height);history.current=[x.getImageData(0,0,c.width,c.height)];step.current=0},[template])
 useEffect(()=>resetCanvas(),[resetCanvas])
 const pos=(e:React.PointerEvent<HTMLCanvasElement>)=>{const c=canvasRef.current!,r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}}
 const pop=(x:number,y:number)=>{setBurst({x,y});window.setTimeout(()=>setBurst(null),180)}
 const trackCursor=(e:React.PointerEvent<HTMLCanvasElement>)=>{const el=cursorRef.current,c=canvasRef.current;if(!el||!c||e.pointerType!=='mouse')return
  const r=c.getBoundingClientRect(),s=r.width/c.width
  el.style.left=`${e.clientX-r.left}px`;el.style.top=`${e.clientY-r.top}px`;el.style.width=el.style.height=`${Math.max(10,size*s)}px`
  el.style.setProperty('--cur',effect==='eraser'?'#8f95ad':effect==='normal'?color:'#a855f7')
  el.classList.toggle('eraser',effect==='eraser');el.classList.add('on')}
 const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{drawing.current=true;last.current=pos(e);e.currentTarget.setPointerCapture(e.pointerId)}
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{trackCursor(e);if(!drawing.current)return;const c=canvasRef.current!,x=c.getContext('2d')!,p=pos(e);x.save();x.lineCap='round';x.lineJoin='round';x.lineWidth=size
  if(effect==='rainbow'){const g=x.createLinearGradient(last.current.x,last.current.y,p.x+80,p.y);['#ff467e','#ffad32','#ffe14a','#54db82','#3bbdf5','#8c67f4'].forEach((v,i)=>g.addColorStop(i/5,v));x.strokeStyle=g}else if(effect==='galaxy'){const g=x.createRadialGradient(p.x,p.y,1,p.x,p.y,size*2);g.addColorStop(0,'#f5d0fe');g.addColorStop(.35,'#8b5cf6');g.addColorStop(1,'#172554');x.strokeStyle=g}else x.strokeStyle=color
  x.globalCompositeOperation=effect==='eraser'?'destination-out':'source-over';x.beginPath();x.moveTo(last.current.x,last.current.y);x.lineTo(p.x,p.y);x.stroke();x.restore();drawTemplate(x,template.id,c.width,c.height);last.current=p;pop(e.clientX,e.clientY)}
 const end=()=>{if(drawing.current){drawing.current=false;saveHistory()}}
 const timeTravel=(dir:number)=>{const c=canvasRef.current,n=step.current+dir;if(!c||n<0||n>=history.current.length)return;step.current=n;c.getContext('2d')!.putImageData(history.current[n],0,0)}
 const download=()=>{const c=canvasRef.current;if(!c)return;const a=document.createElement('a');a.download=`สีสนุก-${template.name}.png`;a.href=c.toDataURL('image/png');a.click()}
 const pickColor=(c:string)=>(e:React.MouseEvent)=>{setColor(c);setEffect('normal');pop(e.clientX,e.clientY)}
 const activeName=effect==='eraser'?'ยางลบ':effect==='rainbow'?'สายรุ้ง':effect==='galaxy'?'กาแล็กซี':colors.find(k=>k.c===color)?.n??'สีพิเศษ'
 const rainbowActive=effect==='normal'&&!colors.some(k=>k.c===color)
 return <TooltipProvider><main className="app-shell"><div className="blob blob-1"/><div className="blob blob-2"/><header className="topbar"><div className="brand"><span className="logo-mark">🖍️</span><div><strong className="brand-title"><i style={{color:'#f653a1'}}>สี</i><i style={{color:'#7457e8'}}>สนุ</i><i style={{color:'#ff943d'}}>ก</i></strong><small>โลกใบเล็กที่หนูแต่งสีได้</small></div></div><Button className="download" onClick={download}><Download data-icon="inline-start"/>ดาวน์โหลดภาพ</Button></header>
 <section className="workspace"><aside className="gallery"><div className="gallery-title"><div><span>เลือกภาพระบายสี</span><small>{templates.length} ภาพน่ารัก</small></div><Sparkles/></div><div className="template-grid">{templates.map(t=><button key={t.id} className={`template-card ${template.id===t.id?'selected':''}`} style={{'--tint':t.tint} as React.CSSProperties} onClick={()=>setTemplate(t)}><span className="template-emoji">{t.emoji}</span><b>{t.name}</b><small>{t.tag}</small>{template.id===t.id&&<i>✓</i>}</button>)}</div></aside>
 <section className="studio"><div className="paper-head"><div><span className="eyebrow">กำลังระบาย</span><h1>{template.emoji} {template.name}</h1></div><div className="history"><Tooltip><TooltipTrigger render={<Button variant="outline" size="icon" onClick={()=>timeTravel(-1)}/> }><Undo2/></TooltipTrigger><TooltipContent>ย้อนกลับ</TooltipContent></Tooltip><Tooltip><TooltipTrigger render={<Button variant="outline" size="icon" onClick={()=>timeTravel(1)}/> }><Redo2/></TooltipTrigger><TooltipContent>ทำซ้ำ</TooltipContent></Tooltip><Tooltip><TooltipTrigger render={<Button variant="outline" size="icon" onClick={resetCanvas}/> }><RotateCcw/></TooltipTrigger><TooltipContent>เริ่มใหม่</TooltipContent></Tooltip></div></div>
 <div className="canvas-wrap"><canvas ref={canvasRef} width={900} height={700} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onPointerEnter={trackCursor} onPointerLeave={()=>cursorRef.current?.classList.remove('on')}/><span className="tape tape-left"/><span className="tape tape-right"/><div ref={cursorRef} className="brush-cursor"/></div>
 <Card className="toolbox"><CardContent><div className="tool-section palette"><label>กล่องแท่งสี <b className="color-name">{activeName}</b></label><div className="crayon-tray">{colors.map(k=><button key={k.c} aria-label={`แท่งสี${k.n}`} title={k.n} className={`crayon ${color===k.c&&effect==='normal'?'active':''}`} style={{'--c':k.c} as React.CSSProperties} onClick={pickColor(k.c)}><span className="stick"/><span className="band"/></button>)}<label className={`crayon rainbow-crayon ${rainbowActive?'active':''}`} title="สีพิเศษ"><span className="stick"/><span className="band"/><input aria-label="ผสมสีเอง" type="color" value={color} onChange={e=>{setColor(e.target.value);setEffect('normal')}}/></label></div></div><div className="tool-section magic"><label>สีวิเศษ</label><div className="effects"><button className={effect==='rainbow'?'active':''} onClick={()=>setEffect('rainbow')}><span className="rainbow-dot"/>สายรุ้ง</button><button className={effect==='galaxy'?'active':''} onClick={()=>setEffect('galaxy')}><span className="galaxy-dot"/>กาแล็กซี</button><button className={effect==='eraser'?'active':''} onClick={()=>setEffect('eraser')}><Eraser/>ยางลบ</button></div></div><div className="tool-section brush"><label><Paintbrush/>ขนาดแปรง <b>{size}</b></label><Slider min={6} max={50} value={[size]} onValueChange={v=>setSize(Array.isArray(v)?v[0]:v)}/></div></CardContent></Card>
 </section></section>{burst&&<span className="paint-burst" style={{left:burst.x,top:burst.y}}>✦</span>}<div className="ambient a1">✿</div><div className="ambient a2">★</div></main></TooltipProvider>
}
export default App
