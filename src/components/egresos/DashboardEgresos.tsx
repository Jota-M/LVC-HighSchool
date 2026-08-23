// components/egresos/DashboardEgresos.tsx
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
    LinearProgress,
    Chip,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    Receipt as ReceiptIcon,
    Groups as GroupsIcon,
    AccountBalance as BankIcon,
    Assessment as AssessmentIcon,
    ShowChart as ChartIcon,
    InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useEgresos } from '@/hooks/useEgresos';
import egresosService from '@/services/egresos';
import { keyframes } from '@mui/system';
import type { CategoriaEgreso, MetodoPago } from '@/types/egresos';

// Animaciones (mismas que DashboardIngresos)
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    delay?: number;
    info?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, delay = 0, info }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [hovered, setHovered] = useState(false);

    return (
        <Card
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: isDark
                    ? `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.05)} 100%)`
                    : `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.03)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(color, isDark ? 0.3 : 0.2)}`,
                borderRadius: '24px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: `${fadeInUp} 0.6s ease-out ${delay}s both`,
                '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha(color, 0.3)}`,
                    borderColor: alpha(color, 0.5),
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.1)}, transparent)`,
                    animation: hovered ? `${shimmer} 2s infinite` : 'none',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    right: -20,
                    top: -20,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                    animation: `${float} 6s ease-in-out infinite`,
                    pointerEvents: 'none',
                }}
            />

            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1.2,
                                    background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    fontSize: '0.75rem',
                                }}
                            >
                                {title}
                            </Typography>
                            {info && (
                                <Tooltip title={info} arrow placement="top">
                                    <InfoIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.5 }} />
                                </Tooltip>
                            )}
                        </Box>

                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 900,
                                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                mb: 0.5,
                                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                                lineHeight: 1.2,
                                transition: 'all 0.3s ease',
                                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                            }}
                        >
                            {value}
                        </Typography>

                        {subtitle && (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                            boxShadow: `0 8px 24px ${alpha(color, 0.4)}`,
                            color: '#fff',
                            transition: 'all 0.3s ease',
                            transform: hovered ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                            '& svg': { fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' },
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

interface DetailCardProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    delay?: number;
    children: React.ReactNode;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, icon, color, delay = 0, children }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Card
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: isDark
                    ? `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.03)} 100%)`
                    : `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.02)} 100%)`,
                border: `1px solid ${alpha(color, 0.2)}`,
                borderRadius: '24px',
                backdropFilter: 'blur(20px)',
                animation: `${fadeInUp} 0.6s ease-out ${delay}s both`,
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                            color: '#fff',
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                        {title}
                    </Typography>
                </Box>
                {children}
            </CardContent>
        </Card>
    );
};

interface CategoryRowProps {
    categoria: CategoriaEgreso;
    monto: number;
    cantidad: number;
    porcentaje: number;
    color: string;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ categoria, monto, cantidad, porcentaje, color }) => {
    return (
        <Box sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.1rem' }}>{egresosService.getCategoriaIcon(categoria)}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {egresosService.getCategoriaEgresoLabel(categoria)}
                    </Typography>
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ color }}>
                    {egresosService.formatearMonto(monto)}
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={Math.min(porcentaje, 100)}
                sx={{
                    height: 8,
                    borderRadius: '8px',
                    backgroundColor: alpha(color, 0.15),
                    '& .MuiLinearProgress-bar': {
                        borderRadius: '8px',
                        background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                    },
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    {cantidad} {cantidad === 1 ? 'transacción' : 'transacciones'}
                </Typography>
                <Chip
                    label={`${porcentaje.toFixed(1)}%`}
                    size="small"
                    sx={{
                        backgroundColor: alpha(color, 0.15),
                        color,
                        fontWeight: 700,
                        fontSize: '0.688rem',
                        height: 22,
                        borderRadius: '8px',
                        border: `1px solid ${alpha(color, 0.3)}`,
                    }}
                />
            </Box>
        </Box>
    );
};

interface PaymentMethodRowProps {
    metodo: MetodoPago;
    monto: number;
    cantidad: number;
    color: string;
}

const PaymentMethodRow: React.FC<PaymentMethodRowProps> = ({ metodo, monto, cantidad, color }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <Box
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2.5,
                mb: 2,
                borderRadius: '16px',
                background: alpha(color, 0.08),
                border: `1px solid ${alpha(color, 0.15)}`,
                transition: 'all 0.3s ease',
                '&:hover': { background: alpha(color, 0.12), transform: 'translateX(4px)' },
                '&:last-child': { mb: 0 },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                        transition: 'all 0.3s ease',
                        transform: hovered ? 'rotate(-5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                    }}
                >
                    <BankIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: hovered ? color : 'text.primary' }}>
                        {egresosService.getMetodoPagoLabel(metodo)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {cantidad} {cantidad === 1 ? 'transacción' : 'transacciones'}
                    </Typography>
                </Box>
            </Box>
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                    background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                {egresosService.formatearMonto(monto)}
            </Typography>
        </Box>
    );
};

export const DashboardEgresos: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const {
        estadisticas,
        resumenCategorias,
        resumenMetodosPago,
        loadingReportes,
        cargarEstadisticas,
        cargarResumenCategorias,
        cargarResumenMetodosPago,
    } = useEgresos();

    const redColor = '#ef4444';
    const orangeColor = '#f97316';
    const purpleColor = '#8b5cf6';
    const blueColor = '#3b82f6';

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        const filtros = {
            fecha_desde: egresosService.obtenerFechaInicioPeriodo('mes'),
            fecha_hasta: egresosService.obtenerFechaFinPeriodo('mes'),
        };

        await Promise.all([
            cargarEstadisticas(filtros),
            cargarResumenCategorias(filtros),
            cargarResumenMetodosPago(filtros),
        ]);
    };

    if (loadingReportes) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 400, gap: 2 }}>
                <CircularProgress sx={{ color: redColor }} size={48} thickness={4} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Cargando estadísticas de egresos...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Egresos del Mes"
                        value={egresosService.formatearMonto(estadisticas?.monto_total || 0)}
                        subtitle="monto total gastado"
                        icon={<MoneyIcon />}
                        color={redColor}
                        delay={0}
                        info="Total de egresos del mes actual"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Transacciones"
                        value={estadisticas?.total_egresos || 0}
                        subtitle="operaciones realizadas"
                        icon={<ReceiptIcon />}
                        color={orangeColor}
                        delay={0.1}
                        info="Número total de egresos registrados"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Promedio"
                        value={egresosService.formatearMonto(estadisticas?.promedio_egreso || 0)}
                        subtitle="por transacción"
                        icon={<ChartIcon />}
                        color={blueColor}
                        delay={0.2}
                        info="Promedio de monto por cada egreso registrado"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Docentes Pagados"
                        value={estadisticas?.docentes_pagados || 0}
                        subtitle="con planilla registrada"
                        icon={<GroupsIcon />}
                        color={purpleColor}
                        delay={0.3}
                        info="Docentes distintos con al menos un egreso este mes"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <DetailCard title="Egresos por Categoría" icon={<AssessmentIcon />} color={redColor} delay={0.4}>
                        <Box>
                            {resumenCategorias.map((categoria, index) => {
                                const color = egresosService.getCategoriaColor(categoria.categoria as any) ?? '#9e9e9e';
                                const porcentaje = estadisticas?.monto_total
                                    ? (categoria.monto_neto / estadisticas.monto_total) * 100
                                    : 0;

                                return (
                                    <CategoryRow
                                        key={index}
                                        categoria={categoria.categoria}
                                        monto={categoria.monto_neto}
                                        cantidad={categoria.cantidad_transacciones}
                                        porcentaje={porcentaje}
                                        color={color}
                                    />
                                );
                            })}
                            {resumenCategorias.length === 0 && (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                    Sin egresos registrados este mes
                                </Typography>
                            )}
                        </Box>
                    </DetailCard>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <DetailCard title="Métodos de Pago" icon={<BankIcon />} color={orangeColor} delay={0.5}>
                        <Box>
                            {resumenMetodosPago.map((metodo, index) => (
                                <PaymentMethodRow
                                    key={index}
                                    metodo={metodo.metodo_pago}
                                    monto={metodo.total_monto}
                                    cantidad={metodo.cantidad_transacciones}
                                    color={redColor}
                                />
                            ))}
                            {resumenMetodosPago.length === 0 && (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                    Sin egresos registrados este mes
                                </Typography>
                            )}
                        </Box>
                    </DetailCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardEgresos;