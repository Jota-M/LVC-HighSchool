// app/dashboard/financiero/page.tsx
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
    AccountBalanceWallet as WalletIcon,
    Assessment as ReportIcon,
} from '@mui/icons-material';

import BalanceGeneral from '@/components/financiero/BalanceGeneral';
import ReportesFinancieros from '@/components/financiero/ReportesFinancieros';

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

export const Financiero: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [activeTab, setActiveTab] = useState(0);

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
                            <WalletIcon
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
                                }}
                            >
                                Gestión Financiera
                            </Typography>
                        </Box>

                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3, mb: 3 }}>
                            Balance general del colegio: ingresos, egresos y utilidad neta.
                        </Typography>

                        {/* Tabs */}
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                background: isDark
                                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                borderRadius: '16px',
                                p: 1,
                                backdropFilter: 'blur(20px)',
                                width: 'fit-content',
                                '& .MuiTab-root': {
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    minHeight: 48,
                                    color: isDark ? '#000' : '#fff',
                                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                                },
                                '& .Mui-selected': { color: '#fff' },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#fff',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                },
                            }}
                        >
                            <Tab icon={<WalletIcon />} iconPosition="start" label="Balance General" />
                            <Tab icon={<ReportIcon />} iconPosition="start" label="Reportes" />
                        </Tabs>
                    </Box>
                </Fade>

                {/* Tab Panels */}
                <TabPanel value={activeTab} index={0}>
                    <Fade in timeout={700}>
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Balance General
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 1 }}>
                                Ingresos, egresos y utilidad neta del período
                            </Typography>
                            <BalanceGeneral />
                        </Box>
                    </Fade>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <Fade in timeout={700}>
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Reportes Financieros
                            </Typography>
                            <Typography color="text.secondary">
                                Análisis y reportes detallados
                            </Typography>
                            <ReportesFinancieros />
                        </Box>
                    </Fade>
                </TabPanel>
            </Container>
        </Box>
    );
};

export default Financiero;