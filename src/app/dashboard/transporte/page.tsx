// pages/Transporte.tsx
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
  DirectionsBus as BusIcon,
  Dashboard as DashboardIcon,
  Route as RouteIcon,
  AssignmentInd as AssignmentIcon,
  Payment as PaymentIcon,
  Assessment as ReportIcon,
  Dashboard,
  Payment,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { DashboardTransporte } from '@/components/transporte/DashboardTransporte';
import GestionRutas from '@/components/transporte/GestionRutas';
import { GestionParadas } from '@/components/transporte/GestionParadas';
import { GestionAsignaciones } from '@/components/transporte/GestionAsignaciones';
import { GestionPagosTransporte } from '@/components/transporte/GestionPagosTransporte';
import ReportesTransporte from '@/components/transporte/Reportestransporte';
import { PagosTransporte } from '@/components/transporte/PagosTransporte';

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

export const Transporte: React.FC = () => {
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
                  <BusIcon
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
                    Gestión de Transporte
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
                  Administra rutas, paradas, asignaciones y pagos del servicio de transporte escolar.
                </Typography>
              </Box>
            </Box>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ background: isDark ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '16px', p: 1, backdropFilter: 'blur(20px)', '& .MuiTab-root': { borderRadius: '12px', textTransform: 'none', fontWeight: 600, minHeight: 48, color: isDark ? '#000' : '#fff', fontSize: { xs: '0.75rem', md: '0.875rem' }, }, '& .Mui-selected': { color: isDark ? '#fff' : '#fff', }, '& .MuiTabs-indicator': { backgroundColor: isDark ? '#fff' : '#fff', height: 3, borderRadius: '3px 3px 0 0', }, }} >
              <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
              <Tab icon={<Payment />} iconPosition="start" label="Pago de Transporte" />
              <Tab icon={<RouteIcon />} iconPosition="start" label="Rutas" />
              <Tab icon={<PlaceIcon />} iconPosition="start" label="Paradas" />
              <Tab icon={<AssignmentIcon />} iconPosition="start" label="Asignaciones" />
              <Tab icon={<ReportIcon />} iconPosition="start" label="Reportes" />
            </Tabs>
          </Box>
        </Fade>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Dashboard de Transporte
              </Typography>
              <Typography color="text.secondary">
                Estadísticas y resumen general del servicio de transporte
              </Typography>
              <DashboardTransporte />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={700}>
            <Box>
              <PagosTransporte/>
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Fade in timeout={700}>
            <Box>
              <GestionRutas />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Fade in timeout={700}>
            <Box>
              <GestionParadas />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Fade in timeout={700}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Asignaciones de Estudiantes
              </Typography>
              <Typography color="text.secondary">
                Gestiona las asignaciones de estudiantes a rutas de transporte
              </Typography>
              <GestionAsignaciones />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <Fade in timeout={700}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Reportes de Transporte
              </Typography>
              <Typography color="text.secondary">
                Genera reportes e informes del servicio de transporte
              </Typography>
              <ReportesTransporte />
            </Box>
          </Fade>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Transporte;