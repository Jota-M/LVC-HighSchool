import "./globals.css";
<link
  href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&display=swap"
  rel="stylesheet"
/>
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
    <html lang="en" className="scroll-smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}