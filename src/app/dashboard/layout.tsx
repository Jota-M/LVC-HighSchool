'use client';
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Box } from "@mui/material";
import { useAuthGuard } from '../../hooks/useAuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuthGuard();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Cargando...
      </Box>
    );
  }

  return (
    <Box display="flex" height="100vh" minHeight="100vh" overflow="hidden">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column" minHeight="100vh">
        <Topbar />
        <Box flex={1} overflow="auto" sx={{ p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
