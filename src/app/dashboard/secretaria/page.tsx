'use client';
import React, { useState } from 'react';
import {
    Box,
    Container,
    useTheme,
    CircularProgress,
    Alert,
    IconButton,
    Typography,
    Chip,
    alpha,
    Divider,
    keyframes,
} from '@mui/material';
import {
    School as SchoolIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    Refresh as RefreshIcon,
    CalendarToday as CalendarIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Paid as PaidIcon,
    EventAvailable as EventAvailableIcon,
    CardGiftcard as GiftIcon,
    ArrowForwardIos as ArrowIcon,
    WbSunny as SunIcon,
    NightsStay as MoonIcon,
    CloudQueue as CloudIcon,
} from '@mui/icons-material';
import { useDashboard } from '@/hooks/useDashboard';
import { usePagos } from '@/hooks/usePagos';

// ─── animations ──────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ─── helpers ──────────────────────────────────────────────────────────────────

const useAccent = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    return {
        isDark,
        accent: isDark ? '#facc15' : '#0288d1',
        gradient: isDark
            ? 'linear-gradient(135deg, #facc15, #f59e0b)'
            : 'linear-gradient(135deg, #0288d1, #01579b)',
    };
};

// ─── Fila de métrica grande (estilo lista editorial) ───────────────────────────

const MetricRow: React.FC<{
    index: string;
    label: string;
    value: number;
    sub: string;
    icon: React.ElementType;
    color: string;
    trend: number;
    delay: number;
}> = ({ index, label, value, sub, icon: Icon, color, trend, delay }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const up = trend >= 0;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 2, md: 3 },
                py: { xs: 2, md: 2.5 },
                animation: `${fadeIn} 0.4s ease both`,
                animationDelay: `${delay}ms`,
                transition: 'background 0.2s',
                px: { xs: 1, md: 2 },
                borderRadius: '14px',
                '&:hover': {
                    bgcolor: isDark ? alpha(color, 0.06) : alpha(color, 0.04),
                },
            }}
        >
            <Typography
                sx={{
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    fontWeight: 800,
                    color: alpha(color, 0.5),
                    minWidth: { xs: 28, md: 36 },
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {index}
            </Typography>

            <Box
                sx={{
                    width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 },
                    borderRadius: '50%',
                    bgcolor: alpha(color, isDark ? 0.16 : 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ color, fontSize: { xs: 20, md: 24 } }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" noWrap>
                    {label}
                </Typography>
                <Typography
                    sx={{
                        fontSize: { xs: '1.6rem', md: '2.25rem' },
                        fontWeight: 800, lineHeight: 1.1,
                        color: isDark ? '#fff' : '#0f172a',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {value.toLocaleString()}
                </Typography>
            </Box>

            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                    {up
                        ? <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                        : <TrendingDownIcon sx={{ fontSize: 16, color: '#f59e0b' }} />}
                    <Typography variant="body2" fontWeight={700} sx={{ color: up ? '#10b981' : '#f59e0b' }}>
                        {Math.abs(trend)}%
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.disabled">
                    {sub}
                </Typography>
            </Box>

            <ArrowIcon sx={{ fontSize: 14, color: 'text.disabled', display: { xs: 'none', md: 'block' } }} />
        </Box>
    );
};

// ─── Panel lateral (info de pagos / sistema) ───────────────────────────────────

const InfoPanelRow: React.FC<{
    label: string;
    value: string | number;
    color: string;
    icon: React.ElementType;
}> = ({ label, value, color, icon: Icon }) => (
    <Box
        sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            py: 1.5,
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
                sx={{
                    width: 32, height: 32, borderRadius: '8px',
                    bgcolor: alpha(color, 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <Icon sx={{ color, fontSize: 16 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {label}
            </Typography>
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ color, fontVariantNumeric: 'tabular-nums' }}>
            {value}
        </Typography>
    </Box>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
    const { isDark, accent, gradient } = useAccent();
    const [refreshing, setRefreshing] = useState(false);
    const { data, loading, error, refetch, stats } = useDashboard();
    const { infoSistema } = usePagos();

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setTimeout(() => setRefreshing(false), 800);
    };

    const hora = new Date().getHours();
    const greeting = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
    const GreetIcon = hora < 12 ? SunIcon : hora < 19 ? CloudIcon : MoonIcon;

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh" gap={2}>
                <CircularProgress sx={{ color: accent }} size={44} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Cargando datos...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ borderRadius: '14px' }}
                    action={<IconButton size="small" onClick={handleRefresh}><RefreshIcon /></IconButton>}>
                    {error}
                </Alert>
            </Container>
        );
    }

    const cantidadMeses = infoSistema?.cantidad_meses ?? 10;
    const mesesGratis = infoSistema?.meses_gratis ?? 1;
    const totalMensualidades = stats.matriculasActivas * cantidadMeses;
    const mensualidadesCobrables = stats.matriculasActivas * (cantidadMeses - mesesGratis);

    const metrics = [
        { label: 'Estudiantes registrados', value: stats.totalEstudiantes, sub: `${stats.estudiantesActivos} activos`, icon: SchoolIcon, color: accent, trend: 12.5 },
        { label: 'Docentes', value: stats.totalDocentes, sub: `${stats.docentesActivos} activos`, icon: PersonIcon, color: '#a78bfa', trend: 5.2 },
        { label: 'Mensualidades generadas', value: totalMensualidades, sub: `${mensualidadesCobrables} cobrables`, icon: PaidIcon, color: '#34d399', trend: 8.7 },
        { label: 'Matrículas activas', value: stats.matriculasActivas, sub: `periodo ${data?.periodo?.nombre || 'actual'}`, icon: AssignmentIcon, color: '#fb923c', trend: -2.3 },
    ];

    const distribucion: { grado: string; cantidad: number }[] = data?.estudiantes?.distribucion_por_grado || [];
    const totalDist = distribucion.reduce((s, d) => s + d.cantidad, 0) || 1;
    const distColors = [accent, '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#38bdf8'];

    return (
        <Box sx={{ minHeight: '100vh', py: { xs: 2.5, md: 4 } }}>
            <Container maxWidth="xl">

                {/* ── HEADER minimalista, tipo "masthead" ── */}
                <Box
                    sx={{
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 2, mb: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GreetIcon sx={{ color: accent, fontSize: 22 }} />
                        <Typography variant="h5" fontWeight={800}>
                            {greeting}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {data?.periodo && (
                            <Chip
                                icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                                label={data.periodo.nombre}
                                size="small"
                                variant="outlined"
                                sx={{
                                    height: 30, borderColor: alpha(accent, 0.3),
                                    color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem',
                                    '& .MuiChip-icon': { color: accent },
                                }}
                            />
                        )}
                        <IconButton
                            onClick={handleRefresh} disabled={refreshing} size="small"
                            sx={{
                                width: 32, height: 32,
                                color: accent,
                            }}
                        >
                            <RefreshIcon
                                sx={{
                                    fontSize: 18,
                                    animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
                                    '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                                }}
                            />
                        </IconButton>
                    </Box>
                </Box>
                <Typography
                    sx={{
                        fontSize: { xs: '2rem', md: '3rem' },
                        fontWeight: 800, lineHeight: 1.05, mb: 0.5,
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Panel de Administración
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Resumen general del sistema escolar
                </Typography>

                <Divider sx={{ mb: 1 }} />

                {/* ── LAYOUT: lista de métricas + panel lateral ── */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: '2.1fr 1fr' },
                        gap: { xs: 3, lg: 4 },
                        alignItems: 'start',
                    }}
                >
                    {/* Columna izquierda: lista editorial de métricas */}
                    <Box>
                        {metrics.map((m, i) => (
                            <React.Fragment key={m.label}>
                                <MetricRow
                                    index={String(i + 1).padStart(2, '0')}
                                    label={m.label}
                                    value={m.value}
                                    sub={m.sub}
                                    icon={m.icon}
                                    color={m.color}
                                    trend={m.trend}
                                    delay={i * 60}
                                />
                                {i < metrics.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                            </React.Fragment>
                        ))}
                    </Box>

                    {/* Columna derecha: panel apilado */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                        {/* Distribución por grado */}
                        <Box
                            sx={{
                                borderRadius: '18px', p: '1.25rem 1.5rem',
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                                Distribución por grado
                            </Typography>
                            {distribucion.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                    {distribucion.slice(0, 6).map((item, i) => {
                                        const pct = Math.round((item.cantidad / totalDist) * 100);
                                        const c = distColors[i % distColors.length];
                                        return (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c, flexShrink: 0 }} />
                                                <Typography variant="caption" sx={{ flex: 1 }} noWrap>
                                                    {item.grado}
                                                </Typography>
                                                <Typography variant="caption" fontWeight={700} sx={{ color: c }}>
                                                    {item.cantidad}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" sx={{ minWidth: 32, textAlign: 'right' }}>
                                                    {pct}%
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.disabled" textAlign="center" py={2}>
                                    Sin datos disponibles
                                </Typography>
                            )}
                        </Box>

                        {/* Sistema de mensualidades */}
                        <Box
                            sx={{
                                borderRadius: '18px', p: '1.25rem 1.5rem',
                                bgcolor: alpha(accent, isDark ? 0.08 : 0.05),
                                border: `1px solid ${alpha(accent, 0.2)}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <EventAvailableIcon sx={{ color: accent, fontSize: 18 }} />
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Sistema de mensualidades
                                </Typography>
                            </Box>

                            <InfoPanelRow
                                label="Meses del periodo"
                                value={cantidadMeses}
                                color={accent}
                                icon={CalendarIcon}
                            />
                            <Divider sx={{ opacity: 0.4 }} />
                            <InfoPanelRow
                                label="Descuento pago completo"
                                value={`${infoSistema?.descuento_pago_completo ?? 10}%`}
                                color="#34d399"
                                icon={PaidIcon}
                            />
                            <Divider sx={{ opacity: 0.4 }} />
                            <InfoPanelRow
                                label="Meses gratis"
                                value={mesesGratis}
                                color="#fb923c"
                                icon={GiftIcon}
                            />

                            {infoSistema && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 1.5, fontStyle: 'italic' }}
                                >
                                    {infoSistema.beneficio} · {infoSistema.primer_mes} a {infoSistema.ultimo_mes}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Dashboard;