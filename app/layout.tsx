import type { Metadata } from 'next';
import './globals.css';
import { WorkshopProvider } from '@/context/WorkshopContext';
export const metadata: Metadata = {title:'Denim Workshop Management System',description:'Modular management workspace for denim and tailoring workshops.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body><WorkshopProvider>{children}</WorkshopProvider></body></html>;}
