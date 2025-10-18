'use client';
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Box } from "@mui/material";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      display="flex"
      height="100vh" // evita corte vertical en móviles
      minHeight="100vh"
      overflow="hidden"
    >
      <Sidebar />
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        minHeight="100vh"
      >
        <Topbar />
        <Box
          flex={1}
          overflow="auto" // scroll si el contenido es más alto que la pantalla
          sx={{ p: { xs: 2, md: 4 } }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
