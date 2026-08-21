import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'PassGen — локальный генератор паролей', description: 'Криптографически безопасный генератор паролей и парольных фраз. Всё локально.', generator: 'PassGen' }
export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#f7f8fa', userScalable: false }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var data=localStorage.getItem('passgen-settings');var theme=data&&JSON.parse(data).theme;if(theme==='dark'||theme==='system')document.documentElement.dataset.theme=theme}catch(e){}})()` }} /></head><body>{children}</body></html>
}
