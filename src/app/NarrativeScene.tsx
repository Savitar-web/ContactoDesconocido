import { useEffect, useState } from 'react';
export default function NarrativeScene({text,onClose}:{text:string;onClose:()=>void}) {
  const [count,setCount]=useState(0);
  const [complete,setComplete]=useState(false);
  useEffect(()=>{
    if(complete||matchMedia('(prefers-reduced-motion: reduce)').matches){setCount(text.length);return;}
    setCount(0);let current=0;
    const timer=setInterval(()=>{current=Math.min(text.length,current+3);setCount(current);if(current>=text.length)clearInterval(timer);},30);
    return()=>clearInterval(timer);
  },[text,complete]);
  return <div className="fade-scene" role="dialog" aria-modal="true" aria-label="Escena de la historia"><p aria-label={text}>{text.slice(0,count)}</p><div className="row">{count<text.length&&<button className="ghost" onClick={()=>setComplete(true)}>Mostrar texto completo</button>}<button className="primary" onClick={onClose}>Volver al teléfono</button></div></div>;
}
