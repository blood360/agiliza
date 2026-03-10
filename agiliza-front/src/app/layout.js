import { AgilizaProvider } from '@/context/AgilizaContext';
import { ToastProvider } from '@/context/ToastContext';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <AgilizaProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AgilizaProvider>
      </body>
    </html>
  );
}