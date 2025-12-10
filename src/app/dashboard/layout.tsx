'use client';

import ModernSidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Box, useTheme, } from "@mui/material";
import ProtectedRoute from '../../components/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    
    <ProtectedRoute>
      <Box display="flex" height="100vh" minHeight="100vh" overflow="hidden">
        <ModernSidebar />
        <Box flex={1} display="flex" flexDirection="column" minHeight="100vh">
          <Topbar />
          <Box flex={1} overflow="auto" sx={{ p: { xs: 2, md: 4 } , background: isDark? "#020518": "ffffff"}}>
            {children} 
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}