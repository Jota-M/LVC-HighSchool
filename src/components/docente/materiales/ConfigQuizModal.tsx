'use client';
// components/docente/materiales/ConfigQuizModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, Box, Typography, Switch,
  TextField, MenuItem, alpha,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Event as EventIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Replay as ReplayIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { TemaQuizConfig, ConfigQuizDTO } from '@/types/materialTypes';

interface ConfigQuizModalProps {
  open: boolean;
  onClose: () => void;
  config: TemaQuizConfig | null;
  onGuardar: (data: Partial<ConfigQuizDTO>) => Promise<boolean>;
  accent: string;
  isDark: boolean;
}

export const ConfigQuizModal: React.FC<ConfigQuizModalProps> = ({
  open, onClose, config, onGuardar, accent, isDark
}) => {
  const brand = accent;
  const brandDark = isDark ? '#f59e0b' : '#01579b';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101d' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': {
        borderColor: borderField,
        borderRadius: R,
      },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': {
        borderColor: brand,
        borderWidth: '1.5px',
        borderRadius: R,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`,
        borderRadius: R,
      },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  const [activo, setActivo] = useState(true);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [limiteIntentos, setLimiteIntentos] = useState<number | ''>(1);
  const [guardando, setGuardando] = useState(false);

  // Formatear fechas ISO para input datetime-local: YYYY-MM-DDTHH:mm
  const formatForInput = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (config) {
      setActivo(config.activo !== false);
      setFechaInicio(formatForInput(config.fecha_inicio));
      setFechaFin(formatForInput(config.fecha_fin));
      setLimiteIntentos(config.limite_intentos !== undefined && config.limite_intentos !== null ? config.limite_intentos : 1);
    } else {
      setActivo(true);
      setFechaInicio('');
      setFechaFin('');
      setLimiteIntentos(1);
    }
  }, [config, open]);

  const handleSubmit = async () => {
    setGuardando(true);
    try {
      const data: Partial<ConfigQuizDTO> = {
        activo,
        limite_intentos: limiteIntentos === '' ? null : Number(limiteIntentos),
        fecha_inicio: fechaInicio ? new Date(fechaInicio).toISOString() : null,
        fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : null,
      };
      const ok = await onGuardar(data);
      if (ok) onClose();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        }
      }}
    >
      {/* ── HEADER estilo NuevoHorarioModal ── */}
      <Box sx={{
        px: 3, pt: 2.5, pb: 2,
        borderBottom: `1px solid ${borderField}`,
        background: brandDim,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: alpha(brand, 0.8),
                mb: 0.4,
              }}
            >
              EVALUACIÓN DEL TEMA · PARÁMETROS
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                  background: alpha(brand, 0.15),
                  border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <SettingsIcon sx={{ color: brand, fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1, color: 'text.primary' }}>
                Configuración del Quiz
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
              '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
        {/* Switch Estado del Quiz */}
        <Box sx={{
          p: 2, borderRadius: '14px',
          bgcolor: activo ? alpha('#16a34a', 0.07) : alpha('#dc2626', 0.07),
          border: `1px solid ${activo ? alpha('#16a34a', 0.25) : alpha('#dc2626', 0.25)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {activo ? (
              <LockOpenIcon sx={{ color: '#16a34a', fontSize: 24 }} />
            ) : (
              <LockIcon sx={{ color: '#dc2626', fontSize: 24 }} />
            )}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: activo ? '#16a34a' : '#dc2626' }}>
                {activo ? 'Quiz Abierto (Disponible)' : 'Quiz Cerrado (Bloqueado)'}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                {activo
                  ? 'Los estudiantes matriculados pueden responder el quiz.'
                  : 'Ningún estudiante podrá responder el quiz mientras esté cerrado.'}
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={activo}
            onChange={e => setActivo(e.target.checked)}
            color={activo ? 'success' : 'default'}
          />
        </Box>

        {/* Límite de intentos */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <ReplayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
              Límite de intentos por estudiante
            </Typography>
          </Box>
          <TextField
            select
            fullWidth
            size="small"
            value={limiteIntentos}
            onChange={e => setLimiteIntentos(e.target.value === '' ? '' : Number(e.target.value))}
            sx={fieldSx}
          >
            <MenuItem value={1}>1 intento (Recomendado)</MenuItem>
            <MenuItem value={2}>2 intentos</MenuItem>
            <MenuItem value={3}>3 intentos</MenuItem>
            <MenuItem value={5}>5 intentos</MenuItem>
            <MenuItem value={''}>Ilimitado (sin restricción de intentos)</MenuItem>
          </TextField>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.6, display: 'block', fontSize: '0.72rem' }}>
            Si se define 1 intento, una vez que el alumno envíe sus respuestas no podrá volver a reintentar.
          </Typography>
        </Box>

        {/* Fechas de inicio y fin */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EventIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
              Plazo de disponibilidad (Opcional)
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Fecha y hora de inicio"
              type="datetime-local"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              sx={fieldSx}
            />
            <TextField
              label="Fecha y hora límite"
              type="datetime-local"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              sx={fieldSx}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.6, display: 'block', fontSize: '0.72rem' }}>
            Dejar en blanco si no deseas restringir por horario o fecha límite.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderField}`, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={guardando}
          variant="outlined"
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={guardando}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
            color: isDark ? '#000' : '#fff',
            boxShadow: `0 4px 14px ${alpha(brand, 0.3)}`,
            px: 2.5,
          }}
        >
          {guardando ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigQuizModal;
