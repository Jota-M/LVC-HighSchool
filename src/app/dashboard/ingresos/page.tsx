// pages/Ingresos.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  useTheme,
  Fade,
  keyframes,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Receipt as ReceiptIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import DashboardIngresos from '@/components/ingresos/DashboardIngresos';
import GestionTiposIngreso from '@/components/ingresos/GestionTiposIngreso';
import RegistroIngresos from '@/components/ingresos/Registroingresos';

import ConfiguracionIngresos from '@/components/ingresos/Configuracioningresos';
import ReportesIngresos from '@/components/ingresos/Reportesingresos';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
};

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const Ingresos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MoneyIcon
                    sx={{
                      color: isDark ? '#facc15' : '#f59e0b',
                      fontSize: 36,
                      animation: `${bounce} 1.5s infinite`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'fadeIn 1s ease-out',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(-10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    Gestión de Ingresos
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0.3,
                    animation: 'fadeInText 1.2s ease-out',
                    '@keyframes fadeInText': {
                      from: { opacity: 0, transform: 'translateY(5px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  Administra todos los ingresos financieros del colegio.
                </Typography>
              </Box>
            </Box>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '16px',
                p: 1,
                backdropFilter: 'blur(20px)',
                '& .MuiTab-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: isDark ? '#000' : '#fff',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                },
                '& .Mui-selected': {
                  color: isDark ? '#fff' : '#fff',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#fff' : '#fff',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
              <Tab icon={<CategoryIcon />} iconPosition="start" label="Tipos de Ingreso" />
              <Tab icon={<ReceiptIcon />} iconPosition="start" label="Registro de Ingresos" />
              <Tab icon={<ReportIcon />} iconPosition="start" label="Reportes" />
              <Tab icon={<SettingsIcon />} iconPosition="start" label="Configuración" />
            </Tabs>
          </Box>
        </Fade>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Dashboard de Ingresos
              </Typography>
              <Typography color="text.secondary">
                Estadísticas y resumen financiero general
              </Typography>
              <DashboardIngresos />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={700}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Tipos de Ingreso
              </Typography>
              <Typography color="text.secondary">
                Gestiona las categorías y tipos de ingresos
              </Typography>
              <GestionTiposIngreso />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Fade in timeout={700}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Registro de Ingresos
              </Typography>
              <Typography color="text.secondary">
                Registra y administra todos los ingresos del colegio
              </Typography>
              <RegistroIngresos />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Fade in timeout={700}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Reportes Financieros
              </Typography>
              <Typography color="text.secondary">
                Análisis y reportes detallados de ingresos
              </Typography>
              <ReportesIngresos />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Fade in timeout={700}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Configuración
              </Typography>
              <Typography color="text.secondary">
                Ajustes y preferencias del módulo de ingresos
              </Typography>
              <ConfiguracionIngresos />
            </Box>
          </Fade>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Ingresos;