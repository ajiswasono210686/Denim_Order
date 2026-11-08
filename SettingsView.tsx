'use client';
import { useRef, useState } from 'react';
import { useWorkshop } from '@/context/WorkshopContext';
import type { AppConfig, WorkshopStore } from '@/types/workshop';
import { Save, Upload, Download, CloudUpload, CloudDownload, Code2, ImagePlus, CheckCircle2, AlertTriangle, Copy, RefreshCw } from 'lucide-react';

const SCRIPT_CODE = `const SHEET_NAME = 'WorkshopBackup';
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.getRange(1,1,1,2).setValues([['updated_at','database_json']]); }
  return sh;
}
function doGet() {
  const sh = sheet_();
  const raw = sh.getLastRow() >= 2 ? sh.getRange(2,2).getValue() : '';
  const data = raw ? JSON.parse(raw) : null;
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (!payload || !Array.isArray(payload.customers) || !Array.isArray(payload.orders)) throw new Error('Invalid workshop database payload');
    const sh = sheet_();
    sh.getRange(2,1,1,2).setValues([[new Date(), JSON.stringify(payload)]]);
    return ContentService.createTextOutput(JSON.stringify({ok:true,updated_at:new Date().toISOString()})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}`;

function isWorkshopStore(v: unknown): v is WorkshopStore {
  if (!v || typeof v !== 'object') return false;
  const x = v as Record<string, unknown>;
  const c = x.config as Record<string, unknown> | undefined;
  return Array.isArray(x.customers) && Array.isArray(x.measurements) && Array.isArray(x.orders) &&
    Array.isArray(x.cashflow) && !!c && typeof c.workshop_name === 'string' &&
    ['IDR','USD','SGD','MYR'].includes(String(c.currency)) &&
    ['cm','inch'].includes(String(c.measurement_unit)) &&
    ['Thermal_58mm','Thermal_80mm','A5','A4'].includes(String(c.receipt_format));
}

export default function SettingsView() {
  const { config, updateConfig, customers, measurements, orders, cashflow, restoreStore } = useWorkshop();
  const [draft,setDraft] = useState<AppConfig>(config);
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  const [showCode,setShowCode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const store: WorkshopStore = { customers, measurements, orders, cashflow, config: draft };
  const set = <K extends keyof AppConfig,>(key:K,value:AppConfig[K]) => setDraft(d=>({...d,[key]:value}));
  const save = () => { updateConfig(draft); setMessage('Pengaturan berhasil disimpan.'); };
  const uploadLogo = (file?:File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage('File logo harus berupa gambar.'); return; }
    if (file.size > 2*1024*1024) { setMessage('Ukuran logo maksimal 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => set('logo_url_or_base64',String(reader.result || ''));
    reader.onerror = () => setMessage('Gagal membaca file logo.');
    reader.readAsDataURL(file);
  };
  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify(store,null,2)],{type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url;
    a.download=`denim-workshop-backup-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    a.click(); URL.revokeObjectURL(url);
    setMessage('File backup JSON berhasil disiapkan.');
  };
  const restoreBackup = async (file?:File) => {
    if (!file) return;
    try {
      const parsed:unknown = JSON.parse(await file.text());
      if (!isWorkshopStore(parsed)) throw new Error('Struktur JSON tidak cocok atau data wajib tidak lengkap.');
      if (!window.confirm(`Pulihkan database dari backup? ${parsed.customers.length} pelanggan, ${parsed.orders.length} pesanan. Data lokal saat ini akan diganti.`)) return;
      restoreStore(parsed);
      setDraft(parsed.config);
      setMessage('Database berhasil dipulihkan. Muat ulang halaman jika tampilan belum diperbarui.');
    } catch(e) { setMessage(e instanceof Error ? e.message : 'File backup tidak valid.'); }
    finally { if(fileRef.current) fileRef.current.value=''; }
  };
  const cloudSync = async (direction:'push'|'pull') => {
    const url = draft.google_script_url.trim();
    if (!url) { setMessage('Masukkan Google Apps Script Web App URL terlebih dahulu.'); return; }
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(url)) { setMessage('URL harus berupa Google Apps Script Web App URL yang berakhiran /exec.'); return; }
    setBusy(true); setMessage('');
    try {
      if (direction==='push') {
        const payload:WorkshopStore = {...store,config:{...draft,google_script_url:url}};
        const response = await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'});
        if (!response.ok) throw new Error(`Server merespons ${response.status}.`);
        const result = await response.json();
        if (result?.ok === false) throw new Error(result.error || 'Cloud menolak data.');
        const stamp = new Date().toISOString(); updateConfig({google_script_url:url,last_sync_at:stamp}); set('last_sync_at',stamp);
        setMessage('Push berhasil. Database lokal sudah dikirim ke Google Sheets.');
      } else {
        const response = await fetch(url,{method:'GET',redirect:'follow',cache:'no-store'});
        if (!response.ok) throw new Error(`Server merespons ${response.status}.`);
        const remote:unknown = await response.json();
        if (!isWorkshopStore(remote)) throw new Error('Database cloud kosong atau formatnya tidak valid.');
        restoreStore(remote); const stamp = new Date().toISOString(); updateConfig({google_script_url:url,last_sync_at:stamp}); setDraft({...remote.config,google_script_url:url,last_sync_at:stamp});
        setMessage('Pull berhasil. Data cloud sudah menggantikan database lokal.');
      }
    } catch(e) {
      setMessage(`Sinkronisasi gagal: ${e instanceof Error?e.message:'Periksa URL dan izin deployment Apps Script.'} Jika muncul CORS, gunakan deployment Apps Script yang dapat diakses siapa saja dan uji endpoint dari browser.`);
    } finally { setBusy(false); }
  };
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(SCRIPT_CODE); setMessage('Code.gs berhasil disalin.'); }
    catch { setMessage('Clipboard tidak tersedia. Pilih dan salin kode secara manual.'); }
  };
  const input = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-copper';
  const label = 'block text-xs font-semibold text-slate-500';
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">Pengaturan workshop</h2><p className="text-sm text-slate-500">Identitas, preferensi, sinkronisasi, dan keamanan database.</p></div><button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-copper px-4 py-3 text-sm font-bold text-white hover:bg-copperHover"><Save size={16}/> Simpan Pengaturan</button></div>
    {message && <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0"/><span>{message}</span></div>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><h3 className="font-black">Identitas workshop</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={label}>Nama workshop<input className={input} value={draft.workshop_name} onChange={e=>set('workshop_name',e.target.value)}/></label>
        <label className={label}>Tagline<input className={input} value={draft.workshop_tagline} onChange={e=>set('workshop_tagline',e.target.value)}/></label>
        <label className={label}>Nomor telepon<input className={input} value={draft.workshop_phone} onChange={e=>set('workshop_phone',e.target.value)}/></label>
        <label className={label}>Alamat<textarea className={input} rows={2} value={draft.workshop_address} onChange={e=>set('workshop_address',e.target.value)}/></label>
        <label className={`${label} sm:col-span-2`}>Catatan footer struk<textarea className={input} rows={2} value={draft.receipt_footer_note} onChange={e=>set('receipt_footer_note',e.target.value)}/></label>
        <div className="sm:col-span-2"><p className={label}>Logo workshop (PNG/JPG, maks. 2 MB)</p><div className="mt-2 flex flex-wrap items-center gap-4">{draft.logo_url_or_base64 && <img src={draft.logo_url_or_base64} alt="Logo workshop" className="h-20 w-20 rounded-xl border border-slate-200 object-contain p-2"/>}<label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-700"><ImagePlus size={17}/> Upload Logo<input type="file" accept="image/*" className="hidden" onChange={e=>uploadLogo(e.target.files?.[0])}/></label>{draft.logo_url_or_base64&&<button onClick={()=>set('logo_url_or_base64','')} className="text-xs font-bold text-red-600">Hapus logo</button>}</div></div>
      </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><h3 className="font-black">Preferensi operasional</h3><div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className={label}>Mata uang<select className={input} value={draft.currency} onChange={e=>set('currency',e.target.value as AppConfig['currency'])}>{['IDR','USD','SGD','MYR'].map(v=><option key={v}>{v}</option>)}</select></label>
      <label className={label}>Satuan ukuran<select className={input} value={draft.measurement_unit} onChange={e=>set('measurement_unit',e.target.value as AppConfig['measurement_unit'])}><option value="cm">Centimeter (cm)</option><option value="inch">Inch</option></select></label>
      <label className={label}>Kapasitas kerja harian (poin)<input type="number" min="1" className={input} value={draft.daily_workload_capacity} onChange={e=>set('daily_workload_capacity',Math.max(1,Number(e.target.value)||1))}/></label>
      <label className={label}>Format cetak struk<select className={input} value={draft.receipt_format} onChange={e=>set('receipt_format',e.target.value as AppConfig['receipt_format'])}><option value="Thermal_58mm">Thermal 58 mm</option><option value="Thermal_80mm">Thermal 80 mm</option><option value="A5">A5 Invoice</option><option value="A4">A4 Invoice</option></select></label>
      <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="text-sm font-bold">Auto-settle saat order selesai</p><p className="text-xs text-slate-500">Otomatis catat sisa tagihan sebagai pelunasan ketika status Completed/Picked Up.</p></div><button role="switch" aria-checked={draft.auto_settle_on_completed} onClick={()=>set('auto_settle_on_completed',!draft.auto_settle_on_completed)} className={`relative h-7 w-12 rounded-full transition ${draft.auto_settle_on_completed?'bg-emerald-500':'bg-slate-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${draft.auto_settle_on_completed?'left-6':'left-1'}`}/></button></div>
    </div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-black">Google Sheets Cloud Sync</h3><p className="text-sm text-slate-500">Push database lokal ke Google Sheets atau pull data cloud ke perangkat ini.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Apps Script</span></div>
      <label className={`${label} mt-4`}>Google Apps Script Web App URL<input className={input} placeholder="https://script.google.com/macros/s/.../exec" value={draft.google_script_url} onChange={e=>set('google_script_url',e.target.value)}/></label>
      <div className="mt-3 flex flex-wrap gap-2"><button disabled={busy} onClick={()=>cloudSync('push')} className="inline-flex items-center gap-2 rounded-xl bg-copper px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><CloudUpload size={16}/> {busy?'Memproses…':'Sync to Cloud (Push)'}</button><button disabled={busy} onClick={()=>cloudSync('pull')} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><CloudDownload size={16}/> Sync from Cloud (Pull)</button><button onClick={()=>setShowCode(v=>!v)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"><Code2 size={16}/> {showCode?'Tutup':'Lihat'} Code.gs</button></div>
      <p className="mt-3 text-xs text-slate-500">Terakhir sinkron: {config.last_sync_at ? new Date(config.last_sync_at).toLocaleString('id-ID') : 'Belum pernah'}. Deploy Apps Script sebagai Web App dengan akses yang sesuai sebelum sinkronisasi.</p>
      {showCode&&<div className="mt-4 rounded-xl bg-slate-950 p-3 text-white"><div className="mb-2 flex items-center justify-between"><b className="text-sm">Code.gs — Google Sheets JSON API</b><button onClick={copyCode} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold"><Copy size={14}/> Salin kode</button></div><pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-relaxed">{SCRIPT_CODE}</pre><p className="mt-3 text-xs text-slate-300">Buka Google Sheets → Extensions → Apps Script, tempel kode, Save, lalu Deploy → New deployment → Web app. Execute as: Me; Who has access: Anyone.</p></div>}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><h3 className="font-black">Backup & restore database</h3><p className="mt-1 text-sm text-slate-500">Backup mencakup pelanggan, profil ukuran, pesanan, transaksi kas, dan konfigurasi.</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={downloadBackup} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"><Download size={16}/> Download Backup (.json)</button><button onClick={()=>fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700"><Upload size={16}/> Restore Database (.json)</button><input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={e=>restoreBackup(e.target.files?.[0])}/></div><div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle size={16} className="shrink-0"/> Restore akan mengganti seluruh data lokal pada browser ini. Unduh backup terbaru sebelum melakukan restore.</div></section>
  </div>;
}
