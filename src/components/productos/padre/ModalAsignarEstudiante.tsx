'use client';
// components/productos/ModalAsignarEstudiante.tsx
// Modal para asignar el pedido a un hijo (o dejarlo como compra general).
// Mismo lenguaje visual que NuevoHorarioModal: header con kicker + icono,
// footer con borde superior, tokens brand/brandDim/brandBorder/bgField.

import React from 'react';
import {
    Dialog, DialogContent, Typography, Button,
    RadioGroup, FormControlLabel, Radio, Box, Avatar, CircularProgress,
    useTheme, alpha,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Ajustá este tipo si '@/hooks/usePadreProductos' ya exporta uno equivalente
// (p. ej. HijoConProductos) — lo dejamos local para no asumir un export que no existe.
interface HijoParaAsignar {
    estudiante_id: number;
    nombres: string;
    apellidos: string;
    foto_url?: string;
    grado?: string;
    paralelo?: string;
    matricula_id?: number | string | null;
}

interface ModalAsignarEstudianteProps {
    open: boolean;
    onClose: () => void;
    hijos: HijoParaAsignar[];
    estudianteSeleccionado: number | 'general';
    onCambiarSeleccion: (valor: number | 'general') => void;
    onConfirmar: () => void;
    creandoPedido: boolean;
}

export const ModalAsignarEstudiante: React.FC<ModalAsignarEstudianteProps> = ({
    open,
    onClose,
    hijos,
    estudianteSeleccionado,
    onCambiarSeleccion,
    onConfirmar,
    creandoPedido,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // ── tokens (mismos que NuevoHorarioModal) ──────────────────────────
    const brand = isDark ? '#facc15' : '#0288d1';
    const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
    const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
    const bgModal = isDark ? '#09101dff' : '#ffffff';
    const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
    const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
    const R = '14px';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px !important',
                    overflow: 'hidden',
                    background: bgModal,
                    border: `1.5px solid ${brandBorder}`,
                    boxShadow: isDark
                        ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
                        : `0 32px 64px rgba(0,0,0,0.18)`,
                },
            }}
        >
            {/* ── HEADER ── */}
            <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: alpha(brand, 0.7),
                                mb: 0.4,
                            }}
                        >
                            Checkout · Tienda escolar
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Box
                                sx={{
                                    width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                                    background: alpha(brand, 0.15),
                                    border: `1px solid ${alpha(brand, 0.3)}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <PersonRoundedIcon sx={{ color: brand, fontSize: 18 }} />
                            </Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.15, color: 'text.primary' }}>
                                ¿Para quién es<br />este pedido?
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        onClick={onClose}
                        sx={{
                            width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${borderField}`,
                            color: 'text.secondary',
                            transition: 'all 0.15s',
                            flexShrink: 0,
                            '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </Box>
                </Box>
            </Box>

            {/* ── BODY ── */}
            <DialogContent sx={{ px: 3, py: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Podés asignar este pedido a uno de tus hijos, o dejarlo como compra general.
                </Typography>

                <RadioGroup
                    value={String(estudianteSeleccionado)}
                    onChange={(e) => {
                        const val = e.target.value;
                        onCambiarSeleccion(val === 'general' ? 'general' : Number(val));
                    }}
                >
                    {/* Opción: compra general */}
                    <FormControlLabel
                        value="general"
                        control={<Radio sx={{ color: alpha(brand, 0.4), '&.Mui-checked': { color: brand } }} />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, width: '100%' }}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(brand, 0.15) }}>
                                    <ShoppingCartRoundedIcon sx={{ fontSize: 18, color: brand }} />
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={700}>Compra general</Typography>
                                    <Typography variant="caption" color="text.secondary">Sin asignar a ningún hijo</Typography>
                                </Box>
                                {estudianteSeleccionado === 'general' && (
                                    <CheckCircleOutlineIcon sx={{ color: brand, fontSize: 20 }} />
                                )}
                            </Box>
                        }
                        sx={{
                            borderRadius: R,
                            border: `1px solid ${estudianteSeleccionado === 'general' ? alpha(brand, 0.4) : borderField}`,
                            background: estudianteSeleccionado === 'general' ? brandDim : bgField,
                            mx: 0, mb: 1, px: 1.25, py: 0.25,
                            width: '100%',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: alpha(brand, 0.35) },
                        }}
                    />

                    {/* Hijos con matrícula */}
                    {hijos.map(hijo => {
                        const initials = `${hijo.nombres.charAt(0)}${hijo.apellidos.charAt(0)}`.toUpperCase();
                        const selected = estudianteSeleccionado === hijo.estudiante_id;
                        return (
                            <FormControlLabel
                                key={hijo.estudiante_id}
                                value={String(hijo.estudiante_id)}
                                control={<Radio sx={{ color: alpha(brand, 0.4), '&.Mui-checked': { color: brand } }} />}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, width: '100%' }}>
                                        <Avatar
                                            src={hijo.foto_url}
                                            sx={{ width: 36, height: 36, bgcolor: alpha(brand, 0.2), fontWeight: 900, fontSize: 14 }}
                                        >
                                            {!hijo.foto_url && initials}
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={700} noWrap>
                                                {hijo.nombres} {hijo.apellidos}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {hijo.grado && hijo.paralelo ? `${hijo.grado} "${hijo.paralelo}"` : 'Matrícula activa'}
                                            </Typography>
                                        </Box>
                                        {selected && (
                                            <CheckCircleOutlineIcon sx={{ color: brand, fontSize: 20 }} />
                                        )}
                                    </Box>
                                }
                                sx={{
                                    borderRadius: R,
                                    border: `1px solid ${selected ? alpha(brand, 0.4) : borderField}`,
                                    background: selected ? brandDim : bgField,
                                    mx: 0, mb: 1, px: 1.25, py: 0.25,
                                    width: '100%',
                                    transition: 'all 0.15s',
                                    '&:hover': { borderColor: alpha(brand, 0.35) },
                                }}
                            />
                        );
                    })}
                </RadioGroup>
            </DialogContent>

            {/* ── FOOTER ── */}
            <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
                <Box sx={{ flex: 1 }} />
                <Button
                    onClick={onClose}
                    sx={{
                        borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600,
                        '&:hover': { background: 'rgba(255,255,255,0.05)' },
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    disabled={creandoPedido}
                    onClick={onConfirmar}
                    startIcon={creandoPedido ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />}
                    sx={{
                        borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
                        background: brand, color: isDark ? '#000' : '#fff',
                        boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
                        '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
                        '&.Mui-disabled': { opacity: 0.4, background: brand, color: isDark ? '#000' : '#fff' },
                    }}
                >
                    {creandoPedido ? 'Creando...' : 'Confirmar pedido'}
                </Button>
            </Box>
        </Dialog>
    );
};

export default ModalAsignarEstudiante;