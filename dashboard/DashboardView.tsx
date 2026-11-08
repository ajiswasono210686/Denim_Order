'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarClock, CheckCircle2, Clock3, Package, Users, Wallet } from 'lucide-react';
import { formatCurrency, useWorkshop } from '@/context/WorkshopContext';
import type { CashflowTransaction, Order, OrderStatus } from '@/types/workshop';

const STATUS: OrderStatus[] = ['Received', 'In Progress', 'Completed', 'Picked Up'];
const STATUS_LABEL: Record<OrderStatus, string> = { Received: 'Diterima', 'In Progress': 'Dalam Proses', Completed: 'Selesai', 'Picked Up': 'Diambil' };
const STATUS_STYLE: Record<OrderStatus, string> = {
  Received: 'border-blue-100 bg-blue-50 text-blue-700',
  'In Progress': 'border-amber-100 bg-amber-50 text-amber-700',
  Completed: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  'Picked Up': 'border-slate-200 bg-slate-100 text-slate-600',
};
const NAVY = '#111a26';
const COPPER = '#d97736';
const GREEN = '#10b981';
const RED = '#ef4444';

function localDate(date = new Date()) {
  const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function money(value: number, currency: 'IDR' | 'USD' | 'SGD' | 'MYR') { return formatCurrency(value, currency); }
function dateLabel(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>{children}</section>; }

function ServiceMixDonut({ orders, currency }: { orders: Order[]; currency: 'IDR' | 'USD' | 'SGD' | 'MYR' }) {
  const data = useMemo(() => (['Custom', 'Repair'] as const).map(type => {
    const items = orders.flatMap(order => order.items).filter(item => item.service_type === type);
    return { type, count: items.reduce((sum, item) => sum + item.qty, 0), revenue: items.reduce((sum, item) => sum + item.subtotal, 0) };
  }), [orders]);
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const circumference = 2 * Math.PI * 43;
  let offset = 0;
  return <Card>
    <div className="mb-4"><h2 className="font-bold text-slate-900">Komposisi layanan</h2><p className="mt-1 text-xs text-slate-500">Perbandingan Custom dan Repair dari seluruh item order</p></div>
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-around">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 120 120" role="img" aria-label="Donut komposisi layanan" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="43" fill="none" stroke="#e2e8f0" strokeWidth="16" />
          {data.map((item, index) => { const length = total ? item.count / total * circumference : 0; const current = offset; offset += length; return <circle key={item.type} cx="60" cy="60" r="43" fill="none" stroke={index === 0 ? NAVY : COPPER} strokeWidth="16" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-current} strokeLinecap="butt"><title>{item.type}: {item.count} item, {money(item.revenue, currency)}</title></circle>; })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><strong className="text-3xl text-slate-900">{total}</strong><span className="text-[10px] text-slate-500">total item</span></div>
      </div>
      <div className="w-full space-y-4">
        {data.map((item, index) => <div key={item.type}>
          <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-sm font-bold"><span className="h-3 w-3 rounded-sm" style={{ background: index === 0 ? NAVY : COPPER }} />{item.type}</span><span className="text-sm font-bold">{total ? Math.round(item.count / total * 100) : 0}%</span></div>
          <div className="mt-1 flex justify-between text-xs text-slate-500"><span>{item.count} item</span><span>{money(item.revenue, currency)}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${total ? item.count / total * 100 : 0}%`, background: index === 0 ? NAVY : COPPER }} /></div>
          <p className="mt-1 text-[10px] text-slate-400">Kontribusi omzet {totalRevenue ? Math.round(item.revenue / totalRevenue * 100) : 0}%</p>
        </div>)}
      </div>
    </div>
  </Card>;
}

function DailyCashflowChart({ transactions, currency, year, month }: { transactions: CashflowTransaction[]; currency: 'IDR' | 'USD' | 'SGD' | 'MYR'; year: number; month: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const days = new Date(year, month + 1, 0).getDate();
  const values = useMemo(() => Array.from({ length: days }, (_, i) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    const day = transactions.filter(t => t.transaction_date.slice(0, 10) === date);
    return { day: i + 1, income: day.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0), expense: day.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0) };
  }), [transactions, days, year, month]);
  const max = Math.max(1, ...values.flatMap(v => [v.income, v.expense]));
  const width = 720; const height = 220; const left = 12; const top = 12; const bottom = 32; const plotH = height - top - bottom; const slot = (width - left * 2) / days; const barW = Math.max(2, Math.min(9, slot * .29));
  const selected = hover === null ? null : values[hover];
  return <Card>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold">Arus kas harian</h2><p className="mt-1 text-xs text-slate-500">Pemasukan dan pengeluaran pada bulan berjalan</p></div><div className="flex gap-3 text-[11px] font-semibold"><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: GREEN }} />Masuk</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: RED }} />Keluar</span></div></div>
    {selected && <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-xs"><b>{selected.day} {new Date(year, month).toLocaleDateString('id-ID', { month: 'long' })}</b><span className="ml-3 text-emerald-700">Masuk {money(selected.income, currency)}</span><span className="ml-3 text-red-600">Keluar {money(selected.expense, currency)}</span></div>}
    <div className="w-full overflow-x-auto"><svg viewBox={`0 0 ${width} ${height}`} className="min-w-[560px] w-full" role="img" aria-label="Grafik batang arus kas harian">
      {[0, .5, 1].map((fraction, i) => <g key={i}><line x1={left} x2={width - left} y1={top + plotH * fraction} y2={top + plotH * fraction} stroke="#e2e8f0" strokeDasharray="3 4"/><text x={left} y={top + plotH * fraction - 4} fontSize="9" fill="#94a3b8">{fraction === 1 ? '0' : fraction === .5 ? '50%' : '100%'}</text></g>)}
      {values.map((v, i) => { const x = left + i * slot + slot / 2; const h1 = v.income / max * plotH; const h2 = v.expense / max * plotH; return <g key={v.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} tabIndex={0} role="button" aria-label={`Tanggal ${v.day}: pemasukan ${v.income}, pengeluaran ${v.expense}`}><rect x={x - barW - 1} y={top + plotH - h1} width={barW} height={Math.max(1, h1)} rx="2" fill={GREEN} opacity={hover === i ? 1 : .82}/><rect x={x + 1} y={top + plotH - h2} width={barW} height={Math.max(1, h2)} rx="2" fill={RED} opacity={hover === i ? 1 : .82}/><rect x={left + i * slot} y={top} width={slot} height={plotH + 20} fill="transparent"/><text x={x} y={height - 8} textAnchor="middle" fontSize={days > 25 ? '7' : '9'} fill={hover === i ? '#0f172a' : '#94a3b8'}>{v.day % 5 === 0 || v.day === 1 || v.day === days ? v.day : ''}</text></g>; })}
    </svg></div>
    <p className="mt-1 text-[10px] text-slate-400">Sentuh atau arahkan kursor ke batang untuk melihat nominal harian.</p>
  </Card>;
}

function AnnualProfitLineChart({ transactions, currency, selectedYear, onYearChange }: { transactions: CashflowTransaction[]; currency: 'IDR' | 'USD' | 'SGD' | 'MYR'; selectedYear: number; onYearChange: (year: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const months = useMemo(() => Array.from({ length: 12 }, (_, month) => {
    const rows = transactions.filter(t => { const date = t.transaction_date.slice(0, 10); return Number(date.slice(0, 4)) === selectedYear && Number(date.slice(5, 7)) === month + 1; });
    const income = rows.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0); const expense = rows.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
    return { month, income, expense, net: income - expense };
  }), [transactions, selectedYear]);
  const min = Math.min(0, ...months.map(m => m.net)); const max = Math.max(0, ...months.map(m => m.net)); const range = Math.max(1, max - min);
  const w = 720; const h = 245; const pad = { l: 20, r: 20, t: 22, b: 35 }; const plotW = w - pad.l - pad.r; const plotH = h - pad.t - pad.b;
  const x = (i: number) => pad.l + (i / 11) * plotW; const y = (v: number) => pad.t + ((max - v) / range) * plotH;
  const points = months.map(m => `${x(m.month)},${y(m.net)}`).join(' '); const area = `${x(0)},${y(0)} ${points} ${x(11)},${y(0)}`;
  const active = hover === null ? null : months[hover];
  return <Card>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold">Laba bersih tahunan</h2><p className="mt-1 text-xs text-slate-500">Pemasukan dikurangi pengeluaran per bulan</p></div><select value={selectedYear} onChange={e => onYearChange(Number(e.target.value))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">{Array.from(new Set([selectedYear, new Date().getFullYear(), ...transactions.map(t => Number(t.transaction_date.slice(0, 4)))])).sort((a, b) => b - a).map(year => <option key={year} value={year}>{year}</option>)}</select></div>
    {active && <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-xs"><b>{new Date(selectedYear, active.month).toLocaleDateString('id-ID', { month: 'long' })}</b><span className={`ml-3 font-bold ${active.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{money(active.net, currency)}</span></div>}
    <div className="w-full overflow-x-auto"><svg viewBox={`0 0 ${w} ${h}`} className="min-w-[560px] w-full" role="img" aria-label="Grafik garis laba bersih tahunan">
      <defs><linearGradient id="profitArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={COPPER} stopOpacity=".28"/><stop offset="100%" stopColor={COPPER} stopOpacity=".02"/></linearGradient></defs>
      {[0, .5, 1].map((f, i) => <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + plotH * f} y2={pad.t + plotH * f} stroke="#e2e8f0" strokeDasharray="3 4"/>)}
      <polygon points={area} fill="url(#profitArea)"/><polyline points={points} fill="none" stroke={COPPER} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {months.map((m, i) => <g key={m.month} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} tabIndex={0} role="button" aria-label={`${new Date(selectedYear, i).toLocaleDateString('id-ID', { month: 'long' })}: laba bersih ${m.net}`}><circle cx={x(i)} cy={y(m.net)} r={hover === i ? 6 : 4} fill={NAVY} stroke="white" strokeWidth="2"/><circle cx={x(i)} cy={y(m.net)} r="13" fill="transparent"/><text x={x(i)} y={h - 9} textAnchor="middle" fontSize="10" fill="#64748b">{new Date(selectedYear, i).toLocaleDateString('id-ID', { month: 'short' })}</text></g>)}
      <line x1={pad.l} x2={w - pad.r} y1={y(0)} y2={y(0)} stroke="#94a3b8" strokeWidth="1"/>
    </svg></div>
    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400"><span>Terendah: {money(Math.min(...months.map(m => m.net)), currency)}</span><span>Tertinggi: {money(Math.max(...months.map(m => m.net)), currency)}</span></div>
  </Card>;
}

export default function DashboardView({ onNavigate }: { onNavigate: (key: 'customers' | 'orders' | 'schedule' | 'cashbook') => void }) {
  const { customers, measurements, orders, cashflow, config, updateOrder } = useWorkshop();
  const today = localDate(); const now = new Date();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [annualYear, setAnnualYear] = useState(now.getFullYear());
  const activeOrders = orders.filter(o => o.status === 'Received' || o.status === 'In Progress');
  const todayPoints = activeOrders.filter(o => o.deadline_date === today).reduce((sum, o) => sum + o.total_workload_points, 0);
  const capacity = Math.max(1, config.daily_workload_capacity || 20);
  const statusCards = STATUS.map(status => ({ status, orders: orders.filter(o => o.status === status), count: orders.filter(o => o.status === status).length, nominal: orders.filter(o => o.status === status).reduce((sum, o) => sum + o.total_amount, 0) }));
  const deadlines = [...activeOrders].sort((a, b) => a.deadline_date.localeCompare(b.deadline_date));
  const todayTransactions = cashflow.filter(t => t.transaction_date.slice(0, 10) === today);
  const todayIncome = todayTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  const currentMonthTransactions = cashflow.filter(t => { const d = t.transaction_date.slice(0, 10); return d.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`); });
  const filteredStatus = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter);
  const countdown = (deadline: string) => { const days = Math.round((new Date(`${deadline}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86400000); if (days < 0) return { label: `OVERDUE (${Math.abs(days)} hari)`, style: 'bg-red-100 text-red-700' }; if (days === 0) return { label: 'Hari Ini', style: 'bg-amber-100 text-amber-800' }; if (days === 1) return { label: 'Besok', style: 'bg-amber-100 text-amber-800' }; return { label: `${days} hari lagi`, style: 'bg-slate-100 text-slate-600' }; };
  const capacityPercent = Math.round(todayPoints / capacity * 100);
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <button onClick={() => onNavigate('customers')} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Total pelanggan</span><Users className="text-blue-600" size={20}/></div><div className="mt-2 text-3xl font-black">{customers.length}</div><p className="mt-1 text-xs text-slate-400">{measurements.length} profil ukuran tersimpan</p></button>
      <button onClick={() => onNavigate('schedule')} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-orange-200"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Beban kerja hari ini</span><CalendarClock className="text-copper" size={20}/></div><div className="mt-2 text-3xl font-black">{todayPoints}<span className="ml-1 text-sm font-semibold text-slate-400">/ {capacity} pts</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${capacityPercent > 100 ? 'bg-red-500' : capacityPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, capacityPercent)}%` }}/></div><p className="mt-1 text-[10px] text-slate-400">{capacityPercent}% kapasitas deadline hari ini</p></button>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Kas hari ini</span><Wallet className="text-emerald-600" size={20}/></div><div className="mt-2 text-xl font-black">{money(todayIncome - todayExpense, config.currency)}</div><p className="mt-1 text-xs text-slate-400">Masuk {money(todayIncome, config.currency)} · Keluar {money(todayExpense, config.currency)}</p></div>
    </div>

    <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
      {statusCards.map(({ status, count, nominal }) => <button key={status} onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)} className={`rounded-2xl border p-4 text-left shadow-sm transition ${statusFilter === status ? 'border-copper ring-2 ring-orange-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}><div className="flex items-center justify-between gap-2"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span><Package size={17} className="text-slate-400"/></div><p className="mt-3 text-2xl font-black">{count}</p><p className="mt-1 text-[11px] text-slate-500">{money(nominal, config.currency)}</p></button>)}
    </div>
    {statusFilter !== 'All' && <Card><div className="flex items-center justify-between"><h3 className="font-bold">Order: {STATUS_LABEL[statusFilter]}</h3><button onClick={() => setStatusFilter('All')} className="text-xs font-bold text-copper">Tampilkan semua</button></div><div className="mt-3 space-y-2">{filteredStatus.length ? filteredStatus.map(o => <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">{o.customer_name_snapshot} · {o.id}</span><span>{money(o.total_amount, config.currency)}</span></div>) : <p className="text-sm text-slate-400">Belum ada order pada status ini.</p>}</div></Card>}

    <div className="grid gap-5 xl:grid-cols-2"><ServiceMixDonut orders={orders} currency={config.currency}/><Card><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">Deadline & peringatan</h2><p className="mt-1 text-xs text-slate-500">Order aktif diurutkan dari deadline terdekat</p></div><button onClick={() => onNavigate('orders')} className="text-xs font-bold text-copper">Semua order →</button></div>
      <div className="space-y-3">{deadlines.length ? deadlines.slice(0, 7).map(order => { const badge = countdown(order.deadline_date); return <div key={order.id} className="rounded-xl border border-slate-100 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold">{order.customer_name_snapshot}</p><p className="mt-0.5 text-[11px] text-slate-400">{order.id} · {order.items.map(i => i.item_name).join(', ')}</p><p className="mt-1 text-[11px] text-slate-500">Deadline {dateLabel(order.deadline_date)} · {order.total_workload_points} poin</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${badge.style}`}>{badge.label}</span></div><div className="mt-2 flex items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${STATUS_STYLE[order.status]}`}>{STATUS_LABEL[order.status]}</span><select aria-label={`Ubah status ${order.id}`} value={order.status} onChange={e => updateOrder(order.id, { status: e.target.value as OrderStatus })} className="max-w-[155px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold"><option value="Received">Diterima</option><option value="In Progress">Dalam Proses</option><option value="Completed">Selesai</option><option value="Picked Up">Diambil</option></select></div></div>; }) : <p className="py-8 text-center text-sm text-slate-400">Tidak ada antrean aktif.</p>}</div>
    </Card></div>

    <div className="grid gap-5 xl:grid-cols-2"><DailyCashflowChart transactions={currentMonthTransactions} currency={config.currency} year={now.getFullYear()} month={now.getMonth()}/><AnnualProfitLineChart transactions={cashflow} currency={config.currency} selectedYear={annualYear} onYearChange={setAnnualYear}/></div>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500"><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600"/> Data dashboard diperbarui langsung dari penyimpanan workshop.</span><span>{orders.length} order · {cashflow.length} transaksi kas</span></div>
  </div>;
}
