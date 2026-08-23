// app/dashboard/egresos/page.tsx
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
    TrendingDown as TrendingDownIcon,
    Category as CategoryIcon,
    Receipt as ReceiptIcon,
    Assessment as ReportIcon,
} from '@mui/icons-material';

import DashboardEgresos from '@/components/egresos/DashboardEgresos';
import GestionTiposEgreso from '@/components/egresos/GestionTiposEgreso';
import RegistroEgresos from '@/components/egresos/RegistroEgresos';
import ReportesEgresos from '@/components/egresos/Reportesegresos';
// NOTA: Configuracionegresos.tsx (equivalente a Configuracioningresos.tsx)
// queda para la siguiente iteración.

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

export const Egresos: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [activeTab, setActiveTab] = useState(0);

    const redColor = '#ef4444';

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Fade in timeout={500}>
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <TrendingDownIcon
                                sx={{
                                    color: redColor,
                                    fontSize: 36,
                                    animation: `${bounce} 1.5s infinite`,
                                }}
                            />
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                                    fontWeight: 800,
                                    background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Gestión de Egresos
                            </Typography>
                        </Box>

                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3, mb: 3 }}>
                            Registra y administra los gastos del colegio: planillas, servicios, mantenimiento y más.
                        </Typography>

                        {/* Tabs */}
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`,
                                borderRadius: '16px',
                                p: 1,
                                backdropFilter: 'blur(20px)',
                                width: 'fit-content',
                                '& .MuiTab-root': {
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    minHeight: 48,
                                    color: '#fff',
                                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                                    opacity: 0.75,
                                },
                                '& .Mui-selected': { opacity: 1 },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#fff',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                },
                            }}
                        >
                            <Tab icon={<TrendingDownIcon />} iconPosition="start" label="Dashboard" />
                            <Tab icon={<CategoryIcon />} iconPosition="start" label="Tipos de Egreso" />
                            <Tab icon={<ReceiptIcon />} iconPosition="start" label="Registro de Egresos" />
                            <Tab icon={<ReportIcon />} iconPosition="start" label="Reportes" />
                        </Tabs>
                    </Box>
                </Fade>

                {/* Tab Panels */}
                <TabPanel value={activeTab} index={0}>
                    <Fade in timeout={700}>
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Dashboard de Egresos
                            </Typography>
                            <Typography color="text.secondary">
                                Estadísticas y resumen de egresos del mes
                            </Typography>
                            <DashboardEgresos />
                        </Box>
                    </Fade>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <Fade in timeout={700}>
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Tipos de Egreso
                            </Typography>
                            <Typography color="text.secondary">
                                Gestiona las categorías de egresos (planilla docente, servicios, mantenimiento, etc.)
                            </Typography>
                            <GestionTiposEgreso />
                        </Box>
                    </Fade>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    <Fade in timeout={700}>
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Registro de Egresos
                            </Typography>
                            <Typography color="text.secondary">
                                Registra y administra todos los egresos del colegio
                            </Typography>
                            <RegistroEgresos />
                        </Box>
                    </Fade>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                    <Fade in timeout={700}>
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Reportes de Egresos
                            </Typography>
                            <Typography color="text.secondary">
                                Análisis detallado de gastos por categoría, método de pago y evolución diaria
                            </Typography>
                            <ReportesEgresos />
                        </Box>
                    </Fade>
                </TabPanel>
            </Container>
        </Box>
    );
};

export default Egresos;