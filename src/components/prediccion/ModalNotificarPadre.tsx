// components/prediccion/ModalNotificarPadre.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, Box, Typography, Button, Checkbox,
    Divider, Chip, CircularProgress, alpha,
} from '@mui/material';

import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { useNotificarPadre } from '@/hooks/usePrediccion';
import { CandidatoNotificacionPadre } from '@/types/prediccionTypes';

type EstadoEnvio = 'pendiente' | 'enviando' | 'enviado' | 'error';

interface CandidatoUI extends CandidatoNotificacionPadre {
    nombre_completo: string; // acá ya es obligatorio — lo arma el caller
}

interface ModalNotificarPadreProps {
    open: boolean;
    onClose: () => void;
    candidatos: CandidatoUI[];
    asignacionId?: number;
    accent: string;
    isDark: boolean;
    onNotificado?: () => void; // se llama cuando al menos uno se notificó con éxito
}

const ModalNotificarPadre: React.FC<ModalNotificarPadreProps> = ({
    open, onClose, candidatos, asignacionId, accent, isDark, onNotificado,
}) => {
    const { notificar } = useNotificarPadre();
    const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
    const [estados, setEstados] = useState<Record<number, EstadoEnvio>>({});
    const [enviandoTodo, setEnviandoTodo] = useState(false);

    const esMultiple = candidatos.length > 1;

    // Reset al abrir con nuevos candidatos
    useEffect(() => {
        if (open) {
            setSeleccionados(new Set(candidatos.map(c => c.matricula_id)));
            setEstados({});
        }
    }, [open, candidatos]);

    const toggleSeleccion = (matriculaId: number) => {
        setSeleccionados(prev => {
            const next = new Set(prev);
            if (next.has(matriculaId)) next.delete(matriculaId);
            else next.add(matriculaId);
            return next;
        });
    };

    const handleConfirmar = async () => {
        const pendientes = candidatos.filter(c => seleccionados.has(c.matricula_id));
        if (pendientes.length === 0) return;

        setEnviandoTodo(true);
        let huboExito = false;

        for (const c of pendientes) {
            setEstados(prev => ({ ...prev, [c.matricula_id]: 'enviando' }));
            const res = await notificar({
                matricula_id: c.matricula_id,
                materia_nombre: c.materia_nombre,
                nota_estimada: c.nota_estimada,
                asistencia_pct: c.asistencia_pct,
                recomendaciones: c.recomendaciones,
                asignacion_docente_id: asignacionId,
            });
            setEstados(prev => ({ ...prev, [c.matricula_id]: res ? 'enviado' : 'error' }));
            if (res) huboExito = true;
        }

        setEnviandoTodo(false);
        if (huboExito) onNotificado?.();
    };

    const todoEnviado = candidatos.length > 0
        && candidatos.every(c => estados[c.matricula_id] === 'enviado');

    return (
        <Dialog
            open={open}
            onClose={enviandoTodo ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: '22px', overflow: 'hidden' } }}
        >
            {/* Header */}
            <Box sx={{
                px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5,
                background: `linear-gradient(135deg, ${alpha('#dc2626', 0.16)} 0%, ${alpha('#dc2626', 0.04)} 100%)`,
                borderBottom: `1px solid ${alpha('#dc2626', 0.15)}`,
            }}>
                <Box sx={{
                    width: 42, height: 42, borderRadius: '13px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha('#dc2626', 0.18),
                }}>
                    <CampaignRoundedIcon sx={{ color: '#dc2626', fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={800}>
                        Notificar al padre/madre
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {esMultiple
                            ? `${candidatos.length} estudiante(s) en riesgo crítico`
                            : 'Riesgo crítico detectado'}
                    </Typography>
                </Box>
                {!enviandoTodo && (
                    <Button onClick={onClose} sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}>
                        <CloseRoundedIcon fontSize="small" />
                    </Button>
                )}
            </Box>

            <DialogContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                    Esta notificación se envía por WhatsApp directamente al padre/madre del
                    estudiante. Revisá la lista antes de confirmar — esta acción no se puede deshacer.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 1 }}>
                    {candidatos.map(c => {
                        const estado = estados[c.matricula_id] ?? 'pendiente';
                        const checked = seleccionados.has(c.matricula_id);
                        return (
                            <Box key={c.matricula_id} sx={{
                                display: 'flex', alignItems: 'center', gap: 1.2,
                                p: 1.5, borderRadius: '14px',
                                border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
                                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                                opacity: estado === 'enviando' ? 0.7 : 1,
                            }}>
                                {esMultiple && (
                                    <Checkbox
                                        checked={checked}
                                        disabled={enviandoTodo || estado === 'enviado'}
                                        onChange={() => toggleSeleccion(c.matricula_id)}
                                        sx={{ p: 0.5 }}
                                    />
                                )}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={700} noWrap>
                                        {c.nombre_completo}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {c.materia_nombre} · nota est. {c.nota_estimada.toFixed(1)} · asistencia {c.asistencia_pct.toFixed(0)}%
                                    </Typography>
                                </Box>
                                {estado === 'enviando' && <CircularProgress size={18} />}
                                {estado === 'enviado' && <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 20 }} />}
                                {estado === 'error' && <ErrorRoundedIcon sx={{ color: '#dc2626', fontSize: 20 }} />}
                                {estado === 'pendiente' && !esMultiple && (
                                    <Chip size="small" label="Crítico"
                                        sx={{ bgcolor: alpha('#dc2626', 0.12), color: '#dc2626', fontWeight: 700, fontSize: 10, height: 22 }} />
                                )}
                            </Box>
                        );
                    })}
                </Box>

                {candidatos.some(c => c.recomendaciones?.length > 0) && (
                    <Box sx={{ mt: 1, mb: 1 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <WarningAmberRoundedIcon sx={{ fontSize: 13 }} /> El mensaje incluye las recomendaciones generadas por IA.
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                    <Button
                        onClick={onClose}
                        disabled={enviandoTodo}
                        sx={{ borderRadius: '12px', fontWeight: 700, px: 2.5, color: 'text.secondary' }}
                    >
                        {todoEnviado ? 'Cerrar' : 'Cancelar'}
                    </Button>
                    {!todoEnviado && (
                        <Button
                            variant="contained"
                            onClick={handleConfirmar}
                            disabled={enviandoTodo || seleccionados.size === 0}
                            startIcon={enviandoTodo ? <CircularProgress size={16} color="inherit" /> : <CampaignRoundedIcon />}
                            sx={{
                                borderRadius: '12px', fontWeight: 700, px: 3,
                                bgcolor: '#dc2626',
                                '&:hover': { bgcolor: '#b91c1c' },
                            }}
                        >
                            {enviandoTodo
                                ? 'Enviando…'
                                : esMultiple
                                    ? `Notificar a ${seleccionados.size} padre(s)`
                                    : 'Notificar al padre'}
                        </Button>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ModalNotificarPadre;