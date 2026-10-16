// src/components/reservaCupo/admin/ModalCampanaWhatsAppAdmin.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Security as SecurityIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Close as CloseIcon,
  Timer as TimerIcon,
  AutoAwesome as AutoAwesomeIcon,
  Coffee as CoffeeIcon,
  Fingerprint as FingerprintIcon,
} from '@mui/icons-material';
import { BalanceCupoGrado, EstadoCampanaWhatsApp } from '@/services/reservaCupoService';

interface ModalCampanaWhatsAppAdminProps {
  open: boolean;
  grados: BalanceCupoGrado[];
  totalPendientesColegio: number;
  estadoCampana: EstadoCampanaWhatsApp | null;
  isProcesando: boolean;
  onClose: () => void;
  onIniciarCampana: (params: {
    grado_destino_id?: number | 'todos';
    delay_min_seg?: number;
    delay_max_seg?: number;
  }) => Promise<void>;
  onDetenerCampana: () => Promise<void>;
}

export const ModalCampanaWhatsAppAdmin: React.FC<ModalCampanaWhatsAppAdminProps> = ({
  open,
  grados,
  totalPendientesColegio,
  estadoCampana,
  isProcesando,
  onClose,
  onIniciarCampana,
  onDetenerCampana,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [alcanceSeleccionado, setAlcanceSeleccionado] = useState<string>('todos');
  const [cadencia, setCadencia] = useState<'segura' | 'moderada'>('segura');

  const brand = '#10b981';
  const brandDim = alpha(brand, 0.12);
  const brandBorder = alpha(brand, 0.25);
  const bgModal = isDark ? '#0b1320' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  // Calcular cantidad estimada según el alcance seleccionado
  const gradoSeleccionado = alcanceSeleccionado !== 'todos'
    ? grados.find((g) => g.grado_destino_id === parseInt(alcanceSeleccionado, 10))
    : null;

  const cantidadObjetivo = gradoSeleccionado
    ? gradoSeleccionado.total_restantes
    : totalPendientesColegio;

  const isActivo = Boolean(estadoCampana?.activo);

  const handleIniciar = async () => {
    const minSeg = cadencia === 'segura' ? 8 : 6;
    const maxSeg = cadencia === 'segura' ? 16 : 11;
    await onIniciarCampana({
      grado_destino_id: alcanceSeleccionado === 'todos' ? 'todos' : parseInt(alcanceSeleccionado, 10),
      delay_min_seg: minSeg,
      delay_max_seg: maxSeg,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isActivo ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? '0 32px 64px rgba(0,0,0,0.85)'
            : '0 32px 64px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── HEADER ── */}
      <DialogTitle
        sx={{
          background: brandDim,
          borderBottom: `1px solid ${borderField}`,
          px: 3,
          py: 2.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: brand,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                Campaña Masiva Anti-Baneo
              </Typography>
              <Chip
                size="small"
                label="Evolution Go"
                sx={{
                  bgcolor: alpha(brand, 0.2),
                  color: brand,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Recordatorio masivo de continuidad y reserva de cupo sin riesgo de spam
            </Typography>
          </Box>
        </Box>

        {!isActivo && (
          <Box
            onClick={onClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${borderField}`,
              color: 'text.secondary',
              '&:hover': { color: brand, borderColor: brand },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        )}
      </DialogTitle>

      {/* ── BODY ── */}
      <DialogContent sx={{ p: 3 }}>
        {/* PANEL DE PROGRESO SI LA CAMPAÑA ESTÁ ACTIVA */}
        {isActivo && estadoCampana ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert
              severity="info"
              icon={<CircularProgress size={18} sx={{ color: '#10b981' }} />}
              sx={{
                bgcolor: alpha(brand, 0.1),
                color: isDark ? '#a7f3d0' : '#065f46',
                border: `1px solid ${alpha(brand, 0.3)}`,
                borderRadius: '12px',
                fontWeight: 600,
              }}
            >
              Campaña en curso: Los mensajes se están despachando en segundo plano de manera secuencial y segura.
            </Alert>

            {/* Barra de progreso */}
            <Box
              sx={{
                p: 2.2,
                borderRadius: '14px',
                background: bgField,
                border: `1px solid ${borderField}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={800}>
                  Progreso Global: {estadoCampana.porcentaje}%
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ color: brand }}>
                  {estadoCampana.enviados} de {estadoCampana.total} completados
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={estadoCampana.porcentaje}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: alpha(brand, 0.15),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: brand,
                    borderRadius: 5,
                  },
                }}
              />

              <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Enviados exitosos
                  </Typography>
                  <Typography variant="body1" fontWeight={800} sx={{ color: '#10b981' }}>
                    {estadoCampana.enviados}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    En cola segura
                  </Typography>
                  <Typography variant="body1" fontWeight={800} sx={{ color: '#f59e0b' }}>
                    {estadoCampana.en_cola}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Fallidos / Sin celular
                  </Typography>
                  <Typography variant="body1" fontWeight={800} sx={{ color: '#ef4444' }}>
                    {estadoCampana.fallidos}
                  </Typography>
                </Grid>
              </Grid>

              {estadoCampana.estudiante_actual && (
                <Box
                  sx={{
                    mt: 1.8,
                    p: 1.2,
                    borderRadius: '9px',
                    bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#f8fafc',
                    border: `1px solid ${borderField}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CircularProgress size={14} sx={{ color: brand }} />
                  <Typography variant="caption" color="text.secondary">
                    Enviando actualmente a: <strong>{estadoCampana.estudiante_actual}</strong> (pausa humana activa)
                  </Typography>
                </Box>
              )}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
              ℹ️ Puede cerrar esta ventana con tranquilidad. La cola continuará ejecutándose de forma autónoma en el servidor sin interrumpirse.
            </Typography>
          </Box>
        ) : (
          /* CONFIGURACIÓN ANTES DE INICIAR */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            {/* Selección de Alcance */}
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'text.secondary' }}>Alcance de la campaña</InputLabel>
              <Select
                value={alcanceSeleccionado}
                label="Alcance de la campaña"
                onChange={(e) => setAlcanceSeleccionado(e.target.value)}
                sx={{
                  borderRadius: '12px',
                  background: bgField,
                  '& fieldset': { borderColor: borderField },
                  '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
                  '&.Mui-focused fieldset': { borderColor: brand },
                }}
              >
                <MenuItem value="todos">
                  🏫 <strong>Todo el Colegio</strong> ({totalPendientesColegio} pendientes estimados)
                </MenuItem>
                {grados.map((g) => (
                  <MenuItem key={g.grado_destino_id} value={String(g.grado_destino_id)}>
                    {g.grado_nombre} — ({g.total_restantes} pendientes)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Selector de Cadencia Anti-Baneo */}
            <Box
              sx={{
                p: 1.8,
                borderRadius: '14px',
                background: bgField,
                border: `1px solid ${borderField}`,
              }}
            >
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                Velocidad de Envío y Seguridad
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Box
                    onClick={() => setCadencia('segura')}
                    sx={{
                      p: 1.4,
                      borderRadius: '11px',
                      cursor: 'pointer',
                      border: `1.5px solid ${cadencia === 'segura' ? brand : borderField}`,
                      bgcolor: cadencia === 'segura' ? alpha(brand, 0.12) : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: cadencia === 'segura' ? brand : 'text.primary' }}>
                      🛡️ Ultra Segura (Recomendada)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3, fontSize: '0.7rem' }}>
                      Pausas de 8 a 16s + descansos de 40s cada 8 mensajes. Cero sospecha de bot.
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Box
                    onClick={() => setCadencia('moderada')}
                    sx={{
                      p: 1.4,
                      borderRadius: '11px',
                      cursor: 'pointer',
                      border: `1.5px solid ${cadencia === 'moderada' ? brand : borderField}`,
                      bgcolor: cadencia === 'moderada' ? alpha(brand, 0.12) : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: cadencia === 'moderada' ? brand : 'text.primary' }}>
                      ⚡ Moderada
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3, fontSize: '0.7rem' }}>
                      Pausas de 6 a 11s + descansos de 30s. Para lotes de menos de 30 tutores.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Protocolos de Seguridad Activos */}
            <Box
              sx={{
                p: 1.8,
                borderRadius: '14px',
                bgcolor: isDark ? 'rgba(16,185,129,0.06)' : '#f0fdf4',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                <SecurityIcon sx={{ fontSize: 18, color: '#10b981' }} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#10b981' }}>
                  Protocolos Anti-Baneo de Meta Implementados:
                </Typography>
              </Box>

              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: 'text.secondary' }}>
                    <TimerIcon sx={{ fontSize: 14, color: brand }} />
                    <strong>Jitter Humano:</strong> Pausa aleatoria irregular
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: 'text.secondary' }}>
                    <AutoAwesomeIcon sx={{ fontSize: 14, color: brand }} />
                    <strong>Spintax:</strong> Saludos y textos variados
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: 'text.secondary' }}>
                    <CoffeeIcon sx={{ fontSize: 14, color: brand }} />
                    <strong>Micro-descansos:</strong> Pausa tras 8 envíos
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: 'text.secondary' }}>
                    <FingerprintIcon sx={{ fontSize: 14, color: brand }} />
                    <strong>Hash Único:</strong> Token de ref por mensaje
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
              Se notificará a los tutores recordándoles que cuentan con su cupo asegurado e indicando que ingresen a{' '}
              <strong>validar/confirmar o anular/liberar su cupo</strong> para el ciclo escolar 2027.
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* ── FOOTER DE ACCIONES ── */}
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderField}` }}>
        {isActivo ? (
          <>
            <Button
              onClick={onClose}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              Minimizar Ventana
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={onDetenerCampana}
              disabled={isProcesando}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
              }}
            >
              Detener Campaña
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onClose}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={isProcesando ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleIniciar}
              disabled={isProcesando || cantidadObjetivo === 0}
              sx={{
                borderRadius: '11px',
                fontWeight: 800,
                textTransform: 'none',
                px: 3,
                bgcolor: '#10b981',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                '&:hover': { bgcolor: '#059669', boxShadow: '0 6px 18px rgba(16,185,129,0.4)' },
              }}
            >
              {isProcesando ? 'Iniciando...' : `Iniciar Campaña (${cantidadObjetivo} tutores)`}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ModalCampanaWhatsAppAdmin;
