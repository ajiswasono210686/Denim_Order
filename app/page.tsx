'use client';
import { useState } from 'react';
import { AppShell, type ModuleKey } from '@/components/layout/AppShell';
import CustomersView from '@/components/customers/CustomersView';
import OrdersQueueView from '@/components/orders/OrdersQueueView';
import ScheduleCapacityView from '@/components/schedule/ScheduleCapacityView';
import CashbookView from '@/components/cashbook/CashbookView';
import DashboardView from '@/components/dashboard/DashboardView';
import SettingsView from '@/components/settings/SettingsView';

const titles:Record<ModuleKey,{title:string;subtitle:string}>={dashboard:{title:'Dashboard',subtitle:'Ringkasan aktivitas dan performa workshop.'},customers:{title:'Pelanggan & Ukuran',subtitle:'Database pelanggan dan profil ukuran tersimpan.'},orders:{title:'Pesanan & Antrean Produksi',subtitle:'Pantau status order, tenggat, dan beban produksi.'},schedule:{title:'Jadwal & Kapasitas Kerja',subtitle:'Gambaran beban kerja harian dan kapasitas workshop.'},cashbook:{title:'Buku Kas & Pembukuan',subtitle:'Catatan pemasukan, pengeluaran, dan arus kas.'},settings:{title:'Pengaturan & Cloud Sync',subtitle:'Konfigurasi identitas workshop dan preferensi aplikasi.'}};
export default function Home(){
 const [active,setActive]=useState<ModuleKey>('dashboard');
 const [showQuick,setShowQuick]=useState(false);
 const newOrder=()=>{setActive('orders');setShowQuick(false);};
 return <AppShell active={active} onNavigate={setActive} onNewOrder={newOrder}>
  <div className="mx-auto max-w-7xl">
   <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-copper"><span className="h-px w-6 bg-copper"/> Workshop overview</div><h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{titles[active].title}</h1><p className="mt-1 text-sm text-slate-500">{titles[active].subtitle}</p></div><div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500">{new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div>
   {active==='dashboard'&&<DashboardView onNavigate={setActive}/>}
   {active==='customers'&&<CustomersView/>}
   {active==='orders'&&<OrdersQueueView/>}
   {active==='schedule'&&<ScheduleCapacityView/>}
   {active==='cashbook'&&<CashbookView/>}
   {active==='settings'&&<SettingsView/>}
  </div>
  {showQuick&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={()=>setShowQuick(false)}><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-lg font-black">Order Baru</h2><button onClick={()=>setShowQuick(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">×</button></div><p className="mt-2 text-sm leading-relaxed text-slate-500">Gunakan modul Pesanan untuk membuat transaksi baru.</p><div className="mt-5 flex gap-2"><button onClick={()=>{setShowQuick(false);setActive('orders')}} className="flex-1 rounded-xl bg-copper px-4 py-3 text-sm font-bold text-white hover:bg-copperHover">Buka Pesanan</button><button onClick={()=>setShowQuick(false)} className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600">Tutup</button></div></div></div>}
 </AppShell>;
}
