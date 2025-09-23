"use client";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Box } from "@mui/material";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex" height="100vh" >
      <Sidebar/>
      <Box flex={1} display="flex" flexDirection="column">
        <Topbar />
        <Box p={4} flex={1} overflow="auto">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
