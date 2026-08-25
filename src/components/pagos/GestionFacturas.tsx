'use client';
// components/pagos/GestionFacturas.tsx
// Admin: ver solicitudes de factura y subir la factura al padre

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Box, Typography, useTheme, alpha, Chip, Skeleton,
    IconButton, Tooltip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Fade, CircularProgress, Badge,
} from '@mui/material';
import { keyframes } from '@mui/system';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import api from '@/lib/api';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface SolicitudFactura {
    id: number;
    pago_mensualidad_id: number;
    pago_mensualidad_ids?: number[];
    transaccion_id?: string;
    estado: 'pendiente' | 'completada';
    factura_url?: string;
    fecha_solicitud: string;
    fecha_subida?: string;
    observaciones?: string;
    codigo_pago: string;
    monto_pagado: number;
    mes_correspondiente: string;
    numero_cuota: number;
    estudiante_nombres: string;
    estudiante_apellidos: string;
    grado: string;
    paralelo: string;
    solicitado_por_username: string;
    monto_total?: number;
    cantidad_cuotas?: number;
    meses_cubiertos?: string[];
    codigos_pago?: string[];
}

// ─── Paleta coherente con el dashboard ───────────────────────────────────────
const usePalette = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#0288d1';
    const goldEnd = isDark ? '#f59e0b' : '#01579b';
    const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
    return { isDark, gold, goldEnd, gradBg };
};

// ─── Modal para subir factura ─────────────────────────────────────────────────
const ModalSubirFactura: React.FC<{
    solicitud: SolicitudFactura | null;
    open: boolean;
    onClose: () => void;
    onExito: () => void;
}> = ({ solicitud, open, onClose, onExito }) => {
    const { isDark, gold, gradBg } = usePalette();
    const [archivo, setArchivo] = useState<File | null>(null);
    const [observaciones, setObs] = useState('');
    const [subiendo, setSubiendo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset al abrir
    useEffect(() => {
        if (open) { setArchivo(null); setObs(''); setError(null); }
    }, [open]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) validarYSetArchivo(f);
    };

    const validarYSetArchivo = (f: File) => {
        const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!tiposPermitidos.includes(f.type)) {
            setError('Solo se aceptan PDF, JPG, PNG o WEBP');
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            setError('El archivo no puede superar 10 MB');
            return;
        }
        setError(null);
        setArchivo(f);
    };

    const handleSubir = async () => {
        if (!archivo || !solicitud) return;
        setSubiendo(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('factura', archivo);
            if (observaciones) formData.append('observaciones', observaciones);

            await api.post(
                `/solicitudes-factura/${solicitud.id}/subir-factura`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            onExito();
            onClose();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Error al subir la factura');
        } finally {
            setSubiendo(false);
        }
    };

    if (!solicitud) return null;

    const tamanoMB = archivo ? (archivo.size / 1024 / 1024).toFixed(2) : null;

    return (
        <Dialog
            open={open}
            onClose={!subiendo ? onClose : undefined}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    bgcolor: isDark ? '#1a1d2e' : '#fff',
                    border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                    backgroundImage: 'none',
                },
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '12px',
                            background: gradBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <UploadFileRoundedIcon sx={{ fontSize: 20, color: isDark ? '#000' : '#fff' }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800}>
                                Subir Factura
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                {solicitud.estudiante_nombres} {solicitud.estudiante_apellidos} · {(solicitud.cantidad_cuotas || 1) > 1
                                    ? `${solicitud.cantidad_cuotas} cuotas (${(solicitud.meses_cubiertos || []).join(', ')})`
                                    : solicitud.mes_correspondiente}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={onClose} disabled={subiendo}
                        sx={{ borderRadius: '10px', bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04) }}>
                        <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 1 }}>
                {/* Info del pago */}
                <Box sx={{
                    p: 2, borderRadius: '14px', mb: 2.5,
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                    border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1,
                }}>
                    {[
                        [
                            (solicitud.cantidad_cuotas || 1) > 1 ? 'Referencia / Pago' : 'Código',
                            solicitud.transaccion_id
                                ? `${solicitud.transaccion_id.slice(0, 14)}...`
                                : solicitud.codigo_pago
                        ],
                        [
                            (solicitud.cantidad_cuotas || 1) > 1 ? 'Monto Total' : 'Monto',
                            `Bs ${parseFloat(String(solicitud.monto_total || solicitud.monto_pagado)).toFixed(2)}`
                        ],
                        [
                            (solicitud.cantidad_cuotas || 1) > 1 ? `Meses (${solicitud.cantidad_cuotas} cuotas)` : 'Mes',
                            (solicitud.cantidad_cuotas || 1) > 1 && solicitud.meses_cubiertos?.length
                                ? solicitud.meses_cubiertos.join(', ')
                                : solicitud.mes_correspondiente
                        ],
                        ['Grado', `${solicitud.grado} "${solicitud.paralelo}"`],
                    ].map(([label, val]) => (
                        <Box key={label}>
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 700 }}>
                                {label}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                                {val}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Drop zone */}
                <Box
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    sx={{
                        border: `2px dashed ${dragOver ? gold : archivo ? '#10b981' : isDark ? alpha('#fff', 0.15) : alpha('#000', 0.12)}`,
                        borderRadius: '16px',
                        p: 3, mb: 2,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                        cursor: 'pointer',
                        bgcolor: dragOver
                            ? alpha(gold, 0.06)
                            : archivo
                                ? isDark ? alpha('#10b981', 0.06) : alpha('#10b981', 0.04)
                                : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: gold,
                            bgcolor: alpha(gold, 0.04),
                        },
                    }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={e => { const f = e.target.files?.[0]; if (f) validarYSetArchivo(f); }}
                    />
                    {archivo ? (
                        <>
                            <InsertDriveFileRoundedIcon sx={{ fontSize: 36, color: '#10b981' }} />
                            <Typography variant="body2" fontWeight={700} sx={{ color: '#10b981' }}>
                                {archivo.name}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                {tamanoMB} MB · Click para cambiar
                            </Typography>
                        </>
                    ) : (
                        <>
                            <CloudUploadRoundedIcon sx={{ fontSize: 36, color: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.2) }} />
                            <Typography variant="body2" fontWeight={700} color="text.secondary">
                                Arrastrá o hacé click para seleccionar
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                PDF, JPG, PNG o WEBP · Máx 10 MB
                            </Typography>
                        </>
                    )}
                </Box>

                {/* Observaciones opcionales */}
                <TextField
                    label="Observaciones (opcional)"
                    value={observaciones}
                    onChange={e => setObs(e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    placeholder="Número de factura, nota al padre..."
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': { borderColor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12) },
                            '&:hover fieldset': { borderColor: gold },
                            '&.Mui-focused fieldset': { borderColor: gold },
                        },
                    }}
                />

                {/* Error */}
                {error && (
                    <Typography variant="caption" sx={{ color: '#ef4444', mt: 1, display: 'block', fontWeight: 600 }}>
                        ⚠ {error}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={subiendo}
                    sx={{
                        borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                        color: 'text.secondary',
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubir}
                    disabled={!archivo || subiendo}
                    variant="contained"
                    startIcon={subiendo ? <CircularProgress size={14} color="inherit" /> : <UploadFileRoundedIcon />}
                    sx={{
                        borderRadius: '12px', textTransform: 'none', fontWeight: 800,
                        background: gradBg,
                        color: isDark ? '#000' : '#fff',
                        boxShadow: `0 4px 14px ${alpha(gold, 0.35)}`,
                        '&:hover': { opacity: 0.88 },
                        '&:disabled': { opacity: 0.5 },
                    }}
                >
                    {subiendo ? 'Subiendo...' : 'Subir Factura'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ─── Fila de la tabla ─────────────────────────────────────────────────────────
const FilaSolicitud: React.FC<{
    s: SolicitudFactura;
    index: number;
    isDark: boolean;
    gold: string;
    onSubir: (s: SolicitudFactura) => void;
}> = ({ s, index, isDark, gold, onSubir }) => {
    const esPendiente = s.estado === 'pendiente';
    const cellSx = {
        py: 1.75,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
    };

    return (
        <TableRow
            sx={{
                animation: `${slideIn} 0.3s ease-out ${index * 0.04}s both`,
                bgcolor: esPendiente
                    ? isDark ? alpha('#f59e0b', 0.04) : alpha('#f59e0b', 0.02)
                    : 'transparent',
                '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01) },
                transition: 'background 0.15s',
            }}
        >
            {/* Estudiante */}
            <TableCell sx={cellSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{
                        width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                        background: `linear-gradient(135deg, ${gold}, ${isDark ? '#f59e0b' : '#01579b'})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 900,
                        color: isDark ? '#000' : '#fff',
                    }}>
                        {s.estudiante_nombres.charAt(0)}{s.estudiante_apellidos.charAt(0)}
                    </Box>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                            {s.estudiante_nombres} {s.estudiante_apellidos}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                            {s.grado} "{s.paralelo}"
                        </Typography>
                    </Box>
                </Box>
            </TableCell>

            {/* Pago */}
            <TableCell sx={cellSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                        {(s.cantidad_cuotas || 1) > 1 && s.meses_cubiertos?.length
                            ? s.meses_cubiertos.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
                            : s.mes_correspondiente.charAt(0).toUpperCase() + s.mes_correspondiente.slice(1)}
                    </Typography>
                    {(s.cantidad_cuotas || 1) > 1 && (
                        <Chip
                            label={`${s.cantidad_cuotas} cuotas`}
                            size="small"
                            sx={{
                                height: 18,
                                fontSize: 9,
                                fontWeight: 800,
                                bgcolor: isDark ? alpha(gold, 0.18) : alpha(gold, 0.12),
                                color: isDark ? gold : '#0288d1',
                                borderRadius: 1,
                            }}
                        />
                    )}
                </Box>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontFamily: 'monospace', display: 'block' }}>
                    {s.transaccion_id ? `${s.transaccion_id.slice(0, 15)}...` : s.codigo_pago}
                </Typography>
            </TableCell>

            {/* Monto */}
            <TableCell sx={cellSx}>
                <Typography variant="body2" fontWeight={900} sx={{ color: '#10b981', fontSize: 14 }}>
                    Bs {parseFloat(String(s.monto_total || s.monto_pagado)).toFixed(2)}
                </Typography>
                {(s.cantidad_cuotas || 1) > 1 && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, display: 'block', fontWeight: 600 }}>
                        Total lote
                    </Typography>
                )}
            </TableCell>

            {/* Fecha solicitud */}
            <TableCell sx={cellSx}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: 12 }}>
                    {new Date(s.fecha_solicitud).toLocaleDateString('es-BO', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    })}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: 'block' }}>
                    {new Date(s.fecha_solicitud).toLocaleTimeString('es-BO', {
                        hour: '2-digit', minute: '2-digit',
                    })}
                </Typography>
            </TableCell>

            {/* Estado */}
            <TableCell sx={cellSx}>
                <Chip
                    label={esPendiente ? 'Pendiente' : 'Completada'}
                    size="small"
                    icon={esPendiente
                        ? <AccessTimeRoundedIcon sx={{ fontSize: 12 }} />
                        : <CheckCircleRoundedIcon sx={{ fontSize: 12 }} />}
                    sx={{
                        height: 24, fontSize: 11, fontWeight: 800,
                        bgcolor: esPendiente
                            ? isDark ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.1)
                            : isDark ? alpha('#10b981', 0.15) : alpha('#10b981', 0.1),
                        color: esPendiente ? '#f59e0b' : '#10b981',
                        borderRadius: 1.5,
                        '& .MuiChip-icon': {
                            color: esPendiente ? '#f59e0b' : '#10b981',
                            ml: 0.5,
                        },
                    }}
                />
            </TableCell>

            {/* Acción */}
            <TableCell sx={cellSx}>
                {esPendiente ? (
                    <Tooltip title="Subir factura">
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => onSubir(s)}
                            startIcon={<UploadFileRoundedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: 12,
                                py: 0.5,
                                px: 1.5,
                                background: `linear-gradient(135deg, ${gold}, ${isDark ? '#f59e0b' : '#01579b'})`,
                                color: isDark ? '#000' : '#fff',
                                boxShadow: `0 2px 8px ${alpha(gold, 0.3)}`,
                                '&:hover': { opacity: 0.88 },
                            }}
                        >
                            Subir
                        </Button>
                    </Tooltip>
                ) : (
                    <Tooltip title="Descargar factura">
                        <IconButton
                            size="small"
                            onClick={() => window.open(s.factura_url, '_blank')}
                            sx={{
                                bgcolor: isDark ? alpha('#10b981', 0.12) : alpha('#10b981', 0.08),
                                borderRadius: '10px',
                                '&:hover': {
                                    bgcolor: isDark ? alpha('#10b981', 0.22) : alpha('#10b981', 0.15),
                                },
                            }}
                        >
                            <DownloadRoundedIcon sx={{ fontSize: 16, color: '#10b981' }} />
                        </IconButton>
                    </Tooltip>
                )}
            </TableCell>
        </TableRow>
    );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export const GestionFacturas: React.FC = () => {
    const { isDark, gold, gradBg } = usePalette();

    const [solicitudes, setSolicitudes] = useState<SolicitudFactura[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'completada'>('todos');
    const [modalSolicitud, setModalSolicitud] = useState<SolicitudFactura | null>(null);

    const cargar = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = filtroEstado !== 'todos' ? `?estado=${filtroEstado}` : '';
            const { data } = await api.get(`/solicitudes-factura${params}`);
            if (data.success) setSolicitudes(data.data.solicitudes);
        } catch (e) {
            console.error('[GestionFacturas] Error al cargar:', e);
        } finally {
            setIsLoading(false);
        }
    }, [filtroEstado]);

    useEffect(() => { cargar(); }, [cargar]);

    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    const completadas = solicitudes.filter(s => s.estado === 'completada').length;
    const filtradas = filtroEstado === 'todos'
        ? solicitudes
        : solicitudes.filter(s => s.estado === filtroEstado);

    return (
        <Box sx={{ animation: `${fadeUp} 0.4s ease-out both` }}>

            {/* ── Header ── */}
            <Box sx={{
                p: { xs: 2, sm: 3 }, borderRadius: '20px', mb: 3,
                bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
                border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 2,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 46, height: 46, borderRadius: '14px',
                        background: gradBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 16px ${alpha(gold, 0.35)}`,
                    }}>
                        <ReceiptLongRoundedIcon sx={{ fontSize: 22, color: isDark ? '#000' : '#fff' }} />
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" fontWeight={900}>
                                Solicitudes de Factura
                            </Typography>
                            {pendientes > 0 && (
                                <Badge badgeContent={pendientes} color="warning"
                                    sx={{ '& .MuiBadge-badge': { fontSize: 10, fontWeight: 800 } }} />
                            )}
                        </Box>
                        <Typography variant="caption" color="text.disabled" fontWeight={600}>
                            {pendientes} pendiente{pendientes !== 1 ? 's' : ''} · {completadas} completada{completadas !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>

                {/* Filtros + Refresh */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {(['todos', 'pendiente', 'completada'] as const).map(f => (
                        <Chip
                            key={f}
                            label={f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Pendientes' : 'Completadas'}
                            onClick={() => setFiltroEstado(f)}
                            sx={{
                                height: 28, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                bgcolor: filtroEstado === f
                                    ? isDark ? alpha(gold, 0.2) : alpha(gold, 0.12)
                                    : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                                color: filtroEstado === f
                                    ? isDark ? gold : '#0288d1'
                                    : 'text.secondary',
                                border: `1px solid ${filtroEstado === f ? alpha(gold, 0.4) : 'transparent'}`,
                                borderRadius: 2,
                                '&:hover': { bgcolor: isDark ? alpha(gold, 0.12) : alpha(gold, 0.08) },
                            }}
                        />
                    ))}

                    <Tooltip title="Actualizar">
                        <IconButton
                            onClick={cargar}
                            size="small"
                            sx={{
                                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                                borderRadius: '10px',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.08),
                                    transform: 'rotate(180deg)',
                                },
                            }}
                        >
                            <RefreshRoundedIcon sx={{ fontSize: 16, color: isDark ? gold : '#0288d1' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* ── Tabla ── */}
            <Box sx={{
                borderRadius: '20px',
                bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
                border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.05)',
                overflow: 'hidden',
            }}>

                {/* Loading */}
                {isLoading && (
                    <Box sx={{ p: 3 }}>
                        {[1, 2, 3].map(i => (
                            <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                <Skeleton variant="circular" width={34} height={34} />
                                <Skeleton variant="rounded" height={20} sx={{ flex: 1, borderRadius: 2 }} />
                                <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 2 }} />
                                <Skeleton variant="rounded" width={60} height={28} sx={{ borderRadius: '10px' }} />
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Vacío */}
                {!isLoading && filtradas.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <SchoolRoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.3), mb: 1.5 }} />
                        <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
                            {filtroEstado === 'pendiente'
                                ? 'No hay solicitudes pendientes'
                                : filtroEstado === 'completada'
                                    ? 'No hay solicitudes completadas'
                                    : 'No hay solicitudes de factura'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            Las solicitudes de los padres aparecerán aquí
                        </Typography>
                    </Box>
                )}

                {/* Tabla */}
                {!isLoading && filtradas.length > 0 && (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{
                                        '& th': {
                                            fontWeight: 800, fontSize: 11,
                                            color: 'text.disabled',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.8),
                                            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                                            py: 1.25,
                                        },
                                    }}>
                                        <TableCell>Estudiante</TableCell>
                                        <TableCell>Pago</TableCell>
                                        <TableCell>Monto</TableCell>
                                        <TableCell>Solicitado</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Acción</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtradas.map((s, i) => (
                                        <FilaSolicitud
                                            key={s.id}
                                            s={s}
                                            index={i}
                                            isDark={isDark}
                                            gold={gold}
                                            onSubir={setModalSolicitud}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Footer */}
                        <Box sx={{
                            px: 3, py: 1.5,
                            borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                            bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.5),
                        }}>
                            <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 11 }}>
                                {filtradas.length} solicitud{filtradas.length !== 1 ? 'es' : ''} encontrada{filtradas.length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>

            {/* ── Modal subir factura ── */}
            <ModalSubirFactura
                solicitud={modalSolicitud}
                open={!!modalSolicitud}
                onClose={() => setModalSolicitud(null)}
                onExito={cargar}
            />
        </Box>
    );
};