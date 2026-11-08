import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./context/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { denim: '#111a26', slatework: '#1e293b', copper: '#d97736', copperHover: '#b45309' }, boxShadow: { soft: '0 12px 35px rgba(15,23,42,.06)' } } }, plugins: [] };
export default config;
