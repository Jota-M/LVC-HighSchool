"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { ColorModeContext, useMode } from "./dashboard/theme";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, colorMode] = useMode();
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}