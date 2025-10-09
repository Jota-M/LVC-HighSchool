"use client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./dashboard/theme";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, colorMode] = useMode();

  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </ColorModeContext.Provider>
      </body>
    </html>
  );
}
