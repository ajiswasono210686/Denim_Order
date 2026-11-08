'use client';
import { useState } from 'react';
import { Activity, CalendarDays, ChartNoAxesCombined, CircleDollarSign, Cloud, Gauge, Menu, Plus, Settings, Shirt, Users, X } from 'lucide-react';
import type { ReactNode } from 'react';

export type ModuleKey='dashboard'|'customers'|'orders'|'schedule'|'cashbook'|'settings';
const navItems=[
 {id:'dashboard' as const,label:'Dashboard',short:'Home',icon:Gauge},
 {id:'customers' as const,label:'Pelanggan & Ukuran',short:'Pelanggan',icon:Users},
 {id:'orders' as const,label:'Pesanan & Produksi',short:'Pesanan',icon:Shirt},
 {id:'schedule' as const,label:'Jadwal & Kapasitas',short:'Jadwal',icon:CalendarDays},
 {id:'cashbook' as const,label:'Buku Kas',short:'Kas',icon:CircleDollarSign},
 {id:'settings' as const,label:'Pengaturan',short:'Setelan',icon:Settings}
];
export function AppShell({active,onNavigate,onNewOrder,children}:{active:ModuleKey;onNavigate:(key:ModuleKey)=>void;onNewOrder:()=>void;children:ReactNode}){
 const [mobileMenu,setMobileMenu]=useState(false);
 const navigate=(id:ModuleKey)=>{onNavigate(id);setMobileMenu(false);};
 return <div className="min-h-screen bg-slate-100 text-slate-900">
  <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#111a26] text-white lg:flex">
   <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-copper text-white"><Shirt size={23}/></div><div><p className="font-black tracking-[.16em]">DENIM</p><p className="text-xs font-semibold tracking-[.22em] text-orange-300">WORKSHOP</p></div></div>
   <div className="px-4 pt-7"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Workspace</p><nav className="space-y-1">{navItems.map(({id,label,icon:Icon})=><button key={id} onClick={()=>navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active===id?'bg-white/10 text-orange-300 shadow-inner':'text-slate-300 hover:bg-white/5 hover:text-white'}`}><Icon size={18}/><span>{label}</span>{active===id&&<span className="ml-auto h-1.5 w-1.5 rounded-full bg-copper"/>}</button>)}</nav></div>
   <div className="mt-auto space-y-4 p-4"><div className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400"/><span className="text-xs font-semibold">Local data aktif</span></div><div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400"><Cloud size={12}/> Cloud sync siap dikonfigurasi</div></div><button onClick={onNewOrder} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d97736] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-[#b45309]"><Plus size={18}/> Order Baru</button><p className="text-center text-[10px] tracking-wide text-slate-600">BRKH DENIM · RAW AUTHENTIC DURABLE</p></div>
  </aside>
  <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8"><div className="flex items-center gap-3"><button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu?<X size={20}/>:<Menu size={20}/>}</button><div className="lg:hidden"><p className="text-sm font-black tracking-widest">BRKH DENIM</p><p className="text-[9px] font-semibold tracking-[.18em] text-copper">WORKSHOP MANAGEMENT</p></div><div className="hidden lg:block"><p className="text-xs font-medium text-slate-400">BRKH DENIM / WORKSPACE</p><p className="text-sm font-bold">Workshop Management System</p></div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/> Tersimpan lokal</div><button onClick={onNewOrder} className="flex items-center gap-2 rounded-lg bg-[#d97736] px-3 py-2 text-xs font-bold text-white hover:bg-[#b45309] sm:hidden"><Plus size={16}/> Order</button><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e293b] text-xs font-bold text-white">BD</div></div></header>
   {mobileMenu&&<div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={()=>setMobileMenu(false)}><div className="h-full w-72 bg-[#111a26] p-5 text-white" onClick={e=>e.stopPropagation()}><div className="mb-7 flex items-center justify-between"><span className="font-black tracking-widest">DENIM WORKSHOP</span><button onClick={()=>setMobileMenu(false)}><X/></button></div>{navItems.map(({id,label,icon:Icon})=><button key={id} onClick={()=>navigate(id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${active===id?'bg-white/10 text-orange-300':'text-slate-300'}`}><Icon size={18}/>{label}</button>)}</div></div>}
   <main className="min-h-[calc(100vh-4rem)] px-4 pb-28 pt-6 md:px-8 md:pt-8 lg:pb-10">{children}</main>
  </div>
  <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-[#111a26] px-1 pb-[env(safe-area-inset-bottom)] pt-2 text-white shadow-[0_-8px_24px_rgba(15,23,42,.12)] lg:hidden">{navItems.map(({id,short,icon:Icon})=><button key={id} onClick={()=>navigate(id)} className={`flex min-w-0 flex-col items-center gap-1 py-1.5 text-[9px] font-semibold ${active===id?'text-orange-300':'text-slate-400'}`}><Icon size={19}/><span className="max-w-full truncate">{short}</span><span className={`h-0.5 w-5 rounded-full ${active===id?'bg-copper':'bg-transparent'}`}/></button>)}</nav>
  <button onClick={onNewOrder} aria-label="Buat order baru" className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#d97736] text-white shadow-xl shadow-orange-950/30 transition hover:scale-105 hover:bg-[#b45309] lg:hidden"><Plus size={27}/></button>
 </div>;
}
