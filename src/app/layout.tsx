"use client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from '../context/AuthContext';
import { useState } from 'react';
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
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </body>
    </html>
  );
}
