import { AgilizaProvider } from '@/context/AgilizaContext';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <AgilizaProvider>
          {children}
        </AgilizaProvider>
      </body>
    </html>
  );
}