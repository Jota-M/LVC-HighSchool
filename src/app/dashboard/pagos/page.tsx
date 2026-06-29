'use client';
// pages/Pagos.tsx

import React, { useState } from 'react';
import {
  Box, Container, Typography, Tabs, Tab, useTheme, Fade, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  Dashboard as DashboardIcon,
  Payment as PaymentIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  AttachMoney as MoneyIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';
import { DashboardPagos } from '@/components/pagos/DashboardPagos';
import { RegistroPagos } from '@/components/pagos/RegistroPagos';
import { ReportesPagos } from '@/components/pagos/ReportesPagos';
import { ConfiguracionCostos } from '@/components/pagos/ConfiguracionCostos';
import { GestionFacturas } from '@/components/pagos/GestionFacturas';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
  </div>
);

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const Pagos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            {/* Título */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 },
              mb: 3,
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MoneyIcon sx={{
                    color: isDark ? '#facc15' : '#0288d1',
                    fontSize: 36,
                    animation: `${bounce} 1.5s infinite`,
                  }} />
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Gestión de Pagos
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
                  Administra pagos, mensualidades y reportes financieros del colegio.
                </Typography>
              </Box>
            </Box>

            {/* Tabs — ahora con 5 pestañas */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                borderRadius: '16px',
                p: 1,
                '& .MuiTab-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: isDark ? '#000' : '#fff',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                },
                '& .Mui-selected': { color: isDark ? '#000' : '#fff' },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#000' : '#fff',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
              <Tab icon={<PaymentIcon />} iconPosition="start" label="Registro de Pagos" />
              <Tab icon={<ReportIcon />} iconPosition="start" label="Reportes" />
              <Tab icon={<SettingsIcon />} iconPosition="start" label="Configuración" />
              {/* ✅ Nueva pestaña */}
              <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Facturas" />
            </Tabs>
          </Box>
        </Fade>

        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}><Box><DashboardPagos /></Box></Fade>
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={700}><Box><RegistroPagos /></Box></Fade>
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Fade in timeout={700}><Box><ReportesPagos /></Box></Fade>
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <Fade in timeout={700}><Box><ConfiguracionCostos /></Box></Fade>
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <Fade in timeout={700}><Box><GestionFacturas /></Box></Fade>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Pagos;