// components/financiero/BalanceGeneral.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    useTheme,
    alpha,
    CircularProgress,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AccountBalanceWallet as WalletIcon,
    CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useIngresos } from '@/hooks/Useingresos';
import { useEgresos } from '@/hooks/useEgresos';
import ingresosService from '@/services/ingresos';
import egresosService from '@/services/egresos';
import { keyframes } from '@mui/system';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

type Periodo = 'mes' | 'anio';

interface BalanceCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    delay?: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ title, value, icon, color, subtitle, delay = 0 }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Card
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: isDark
                    ? `linear-gradient(135deg, ${alpha(color, 0.22)} 0%, ${alpha(color, 0.05)} 100%)`
                    : `linear-gradient(135deg, ${alpha(color, 0.16)} 0%, ${alpha(color, 0.03)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(color, 0.3)}`,
                borderRadius: '24px',
                animation: `${fadeInUp} 0.6s ease-out ${delay}s both`,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    right: -30,
                    top: -30,
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(color, 0.2)} 0%, transparent 70%)`,
                    filter: 'blur(35px)',
                    animation: `${float} 6s ease-in-out infinite`,
                    pointerEvents: 'none',
                }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: 1.2,
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                        }}
                    >
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                            boxShadow: `0 8px 24px ${alpha(color, 0.4)}`,
                            color: '#fff',
                            '& svg': { fontSize: 28 },
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 900,
                        background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.75rem', sm: '2.25rem' },
                        mb: subtitle ? 0.5 : 0,
                    }}
                >
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export const BalanceGeneral: React.FC = () => {
    const theme = useTheme();
    const [periodo, setPeriodo] = useState<Periodo>('mes');

    const {
        estadisticas: estadisticasIngresos,
        loadingReportes: loadingIngresos,
        cargarEstadisticas: cargarEstadisticasIngresos,
    } = useIngresos();

    const {
        estadisticas: estadisticasEgresos,
        loadingReportes: loadingEgresos,
        cargarEstadisticas: cargarEstadisticasEgresos,
    } = useEgresos();

    const greenColor = '#10b981';
    const redColor = '#ef4444';
    const blueColor = '#3b82f6';

    useEffect(() => {
        cargarDatos();
    }, [periodo]);

    const cargarDatos = async () => {
        const filtros = {
            fecha_desde: ingresosService.obtenerFechaInicioPeriodo(periodo),
            fecha_hasta: ingresosService.obtenerFechaFinPeriodo(periodo),
        };

        await Promise.all([
            cargarEstadisticasIngresos(filtros),
            cargarEstadisticasEgresos(filtros),
        ]);
    };

    const loading = loadingIngresos || loadingEgresos;
    const totalIngresos = estadisticasIngresos?.monto_total || 0;
    const totalEgresos = estadisticasEgresos?.monto_total || 0;
    const utilidadNeta = totalIngresos - totalEgresos;
    const esPositivo = utilidadNeta >= 0;
    const margenPorcentaje = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 400, gap: 2 }}>
                <CircularProgress size={48} thickness={4} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Calculando balance...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <ToggleButtonGroup
                    value={periodo}
                    exclusive
                    onChange={(_, val) => val && setPeriodo(val)}
                    size="small"
                    sx={{
                        '& .MuiToggleButton-root': {
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2.5,
                        },
                    }}
                >
                    <ToggleButton value="mes">
                        <CalendarIcon sx={{ fontSize: 18, mr: 0.75 }} />
                        Este mes
                    </ToggleButton>
                    <ToggleButton value="anio">
                        <CalendarIcon sx={{ fontSize: 18, mr: 0.75 }} />
                        Este año
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <BalanceCard
                        title="Ingresos"
                        value={ingresosService.formatearMonto(totalIngresos)}
                        icon={<TrendingUpIcon />}
                        color={greenColor}
                        subtitle={`${estadisticasIngresos?.total_ingresos || 0} transacciones`}
                        delay={0}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <BalanceCard
                        title="Egresos"
                        value={egresosService.formatearMonto(totalEgresos)}
                        icon={<TrendingDownIcon />}
                        color={redColor}
                        subtitle={`${estadisticasEgresos?.total_egresos || 0} transacciones`}
                        delay={0.1}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                    <BalanceCard
                        title="Utilidad Neta"
                        value={ingresosService.formatearMonto(utilidadNeta)}
                        icon={<WalletIcon />}
                        color={esPositivo ? greenColor : redColor}
                        subtitle={
                            totalIngresos > 0
                                ? `Margen: ${margenPorcentaje.toFixed(1)}% · ${esPositivo ? 'Positivo' : 'Negativo'}`
                                : 'Sin ingresos registrados aún'
                        }
                        delay={0.2}
                    />
                </Grid>
            </Grid>

            {/* Comparación visual simple */}
            <Card
                sx={{
                    borderRadius: '24px',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    p: 3,
                    animation: `${fadeInUp} 0.6s ease-out 0.3s both`,
                }}
            >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    Ingresos vs. Egresos
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography variant="body2" fontWeight={600}>Ingresos</Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ color: greenColor }}>
                                {ingresosService.formatearMonto(totalIngresos)}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                height: 14,
                                borderRadius: '8px',
                                backgroundColor: alpha(greenColor, 0.12),
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    height: '100%',
                                    width: totalIngresos + totalEgresos > 0
                                        ? `${(totalIngresos / (totalIngresos + totalEgresos)) * 100}%`
                                        : '0%',
                                    borderRadius: '8px',
                                    background: `linear-gradient(90deg, ${greenColor} 0%, ${alpha(greenColor, 0.7)} 100%)`,
                                    transition: 'width 0.6s ease',
                                }}
                            />
                        </Box>
                    </Box>

                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography variant="body2" fontWeight={600}>Egresos</Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ color: redColor }}>
                                {egresosService.formatearMonto(totalEgresos)}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                height: 14,
                                borderRadius: '8px',
                                backgroundColor: alpha(redColor, 0.12),
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    height: '100%',
                                    width: totalIngresos + totalEgresos > 0
                                        ? `${(totalEgresos / (totalIngresos + totalEgresos)) * 100}%`
                                        : '0%',
                                    borderRadius: '8px',
                                    background: `linear-gradient(90deg, ${redColor} 0%, ${alpha(redColor, 0.7)} 100%)`,
                                    transition: 'width 0.6s ease',
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};

export default BalanceGeneral;