// app/dashboard/admin/horarios/page.tsx
'use client';
import React, { useState } from 'react';
import {
  Box, Container, Typography, Tabs, Tab,
  Fade, useTheme, keyframes,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as BloqueIcon,
  GridView as GridIcon,
} from '@mui/icons-material';
import { HorariosListado } from '@/components/horario/HorariosListado';
import { BloqueHorarioManager } from '@/components/horario/BloqueHorarioManager';

// Ajusta este hook según tu proyecto
import { useAcademicos } from '@/hooks/useAcademicos';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

interface TabPanelProps { children: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

export default function HorariosAdminPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  const accentColor = isDark ? '#facc15' : '#0288d1';

  // Datos académicos de tu hook existente
  const {
    periodos = [],
    periodoActivo,
     niveles: nivelesAcademicos = [],
    grados = [],
    turnos = [],
    loadingPeriodos,
  } = useAcademicos();

  const TABS = [
    { label: 'Horarios',         icon: <GridIcon  sx={{ fontSize: { xs: 16, md: 20 } }} /> },
    { label: 'Bloques Horarios', icon: <BloqueIcon sx={{ fontSize: { xs: 16, md: 20 } }} /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box>
            {/* ── HEADER ── */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <CalendarIcon
                  sx={{
                    color: accentColor,
                    fontSize: 36,
                    animation: `${bounce} 2s ease-in-out infinite`,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.4rem' },
                    fontWeight: 800,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Gestión de Horarios
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Crea, edita y publica los horarios semanales de cada paralelo
              </Typography>
            </Box>

            {/* ── TABS ── */}
            <Box
              sx={{
                borderRadius: '16px',
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                p: { xs: 0.5, md: 1 },
                mb: 0,
                display: 'inline-flex',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                  minHeight: { xs: 36, md: 44 },
                  '& .MuiTab-root': {
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: { xs: 36, md: 44 },
                    fontSize: { xs: '0.75rem', md: '0.9rem' },
                    px: { xs: 1.5, md: 3 },
                    color: isDark ? '#00000099' : '#ffffff99',
                    gap: 0.5,
                  },
                  '& .Mui-selected': { color: isDark ? '#000 !important' : '#fff !important' },
                  '& .MuiTabs-indicator': { bgcolor: isDark ? '#000' : '#fff', height: 3, borderRadius: '3px 3px 0 0' },
                }}
              >
                {TABS.map((tab, i) => (
                  <Tab
                    key={tab.label}
                    icon={tab.icon}
                    iconPosition="start"
                    label={tab.label}
                  />
                ))}
              </Tabs>
            </Box>

            {/* ── CONTENT ── */}
            <TabPanel value={activeTab} index={0}>
              <Fade in timeout={500}>
                <Box>
                  <HorariosListado
                    periodoIdDefault={periodoActivo?.id}
                    periodos={periodos}
                    nivelesAcademicos={nivelesAcademicos}
                    grados={grados}
                  />
                </Box>
              </Fade>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Fade in timeout={500}>
                <Box>
                  <BloqueHorarioManager turnos={turnos} nivelesAcademicos={nivelesAcademicos} />
                </Box>
              </Fade>
            </TabPanel>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}