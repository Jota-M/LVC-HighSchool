// components/reservaCupo/ModalAgregarHermanoRegular.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import reservaCupoService from '@/services/reservaCupoService';
import { ValidarEstudianteResponse } from '@/types/reservaCupoTypes';

interface ModalAgregarHermanoRegularProps {
  open: boolean;
  onClose: () => void;
  reservaPrincipal: any;
  onHermanoRegularConfirmado: (nuevaReserva: any) => void;
}

export const ModalAgregarHermanoRegular: React.FC<ModalAgregarHermanoRegularProps> = ({
  open,
  onClose,
  reservaPrincipal,
  onHermanoRegularConfirmado,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [ciInput, setCiInput] = useState('');
  const [isBuscando, setIsBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [estudianteEncontrado, setEstudianteEncontrado] = useState<ValidarEstudianteResponse['data'] | null>(null);
  const [confirmaContinuidad, setConfirmaContinuidad] = useState(true);
  const [isConfirmando, setIsConfirmando] = useState(false);

  // ── Tokens visuales idénticos a ModalEstudianteNoEncontrado ──
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const accentGreen = '#10b981';

  const handleReset = () => {
    setCiInput('');
    setErrorBusqueda(null);
    setEstudianteEncontrado(null);
    setConfirmaContinuidad(true);
    setIsBuscando(false);
    setIsConfirmando(false);
  };

  const handleCerrar = () => {
    handleReset();
    onClose();
  };

  const handleBuscar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ciLimpio = ciInput.trim();
    if (!ciLimpio) {
      setErrorBusqueda('Por favor ingresa el CI del estudiante regular.');
      return;
    }

    if (reservaPrincipal && reservaPrincipal.estudiante_ci === ciLimpio) {
      setErrorBusqueda('Este CI corresponde al estudiante que ya tienes consultado en pantalla.');
      return;
    }

    setIsBuscando(true);
    setErrorBusqueda(null);
    setEstudianteEncontrado(null);

    try {
      const data = await reservaCupoService.validarEstudiantePorCI(ciLimpio);

      if (data.ya_reservado && data.reserva) {
        setErrorBusqueda(
          `El estudiante ${data.reserva.estudiante_nombre_completo || 'seleccionado'} ya cuenta con una reserva registrada (Código: ${data.reserva.codigo_reserva}).`
        );
        return;
      }

      if (!data.estudiante || !data.proyeccion_siguiente) {
        setErrorBusqueda('No se encontraron datos curriculares vigentes para este estudiante regular.');
        return;
      }

      setEstudianteEncontrado(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'No se encontró el estudiante regular.';
      setErrorBusqueda(msg);
    } finally {
      setIsBuscando(false);
    }
  };

  const handleConfirmar = async () => {
    if (!estudianteEncontrado || !reservaPrincipal) return;
    setIsConfirmando(true);
    setErrorBusqueda(null);

    try {
      const periodoDestinoId =
        estudianteEncontrado.proyeccion_siguiente?.periodo_id ||
        reservaPrincipal.periodo_academico_id;

      const turnoDestinoId =
        estudianteEncontrado.gestion_actual?.turno_id ||
        estudianteEncontrado.proyeccion_siguiente?.turno_sugerido_id ||
        1;

      const payload = {
        periodo_academico_id: periodoDestinoId,
        estudiantes: [
          {
            estudiante_id: estudianteEncontrado.estudiante!.id,
            grado_actual_id: estudianteEncontrado.gestion_actual?.grado_id || null,
            grado_destino_id: estudianteEncontrado.proyeccion_siguiente!.grado_id,
            turno_destino_id: turnoDestinoId,
            continua: confirmaContinuidad,
            confirma_continuidad: confirmaContinuidad,
            motivo_no_continua: !confirmaContinuidad ? 'Declaración voluntaria de no continuidad' : undefined,
          },
        ],
        hermanos: [],
        tutor_nombre: reservaPrincipal.tutor_nombre,
        tutor_ci: reservaPrincipal.tutor_ci,
        tutor_parentesco: reservaPrincipal.tutor_parentesco,
        tutor_telefono: reservaPrincipal.tutor_telefono,
        observaciones: `Hermano regular agregado a la reserva familiar de ${reservaPrincipal.estudiante_nombre_completo || reservaPrincipal.estudiante_nombres}`,
      };

      const resultado = await reservaCupoService.confirmarReserva(payload);
      const nuevaReserva = resultado?.reservas?.[0] || resultado?.reserva_principal;

      if (nuevaReserva) {
        handleReset();
        onClose();
        onHermanoRegularConfirmado(nuevaReserva);
      } else {
        throw new Error('No se obtuvo el comprobante de la nueva reserva.');
      }
    } catch (err: any) {
      console.error('Error al confirmar hermano regular:', err);
      setErrorBusqueda(err.response?.data?.message || err.message || 'Error al confirmar cupo.');
    } finally {
      setIsConfirmando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
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
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
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
              Núcleo Familiar · Estudiante Regular
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '9px',
                  flexShrink: 0,
                  background: alpha(brand, 0.15),
                  border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon sx={{ color: brand, fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, color: 'text.primary' }}>
                Añadir Hermano Regular
              </Typography>
            </Box>
          </Box>

          <Box
            onClick={handleCerrar}
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
              transition: 'all 0.15s',
              flexShrink: 0,
              '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        <Box sx={{ height: 3, borderRadius: 2, background: brand, width: '100%' }} />
      </Box>

      {/* ── BODY ── */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Ingresa el Carnet de Identidad del otro hijo/a que ya estudia en el colegio para asociar su reserva al mismo tutor y familia.
        </Typography>

        {/* Formulario de Búsqueda de CI */}
        <Box component="form" onSubmit={handleBuscar} sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Número de Carnet de Identidad (CI)..."
            value={ciInput}
            onChange={(e) => setCiInput(e.target.value)}
            disabled={isBuscando || isConfirmando}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: bgField,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isBuscando || !ciInput.trim() || isConfirmando}
            startIcon={isBuscando ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            sx={{
              borderRadius: '12px',
              px: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              background: brand,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(brand, 0.4)}`,
              '&:hover': { background: isDark ? '#eab308' : '#01579b' },
            }}
          >
            {isBuscando ? 'Buscando...' : 'Buscar'}
          </Button>
        </Box>

        {errorBusqueda && (
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '12px' }}>
            {errorBusqueda}
          </Alert>
        )}

        {/* Tarjeta del Estudiante Regular Encontrado */}
        {estudianteEncontrado?.estudiante && (
          <Box
            sx={{
              p: 2,
              borderRadius: '14px',
              bgcolor: alpha(brand, 0.06),
              border: `1.5px solid ${alpha(brand, 0.3)}`,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <BadgeIcon sx={{ color: brand, fontSize: 22 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                    {estudianteEncontrado.estudiante.nombre_completo}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    CI: <strong style={{ color: isDark ? '#fff' : '#000' }}>{estudianteEncontrado.estudiante.ci}</strong> · Cód: {estudianteEncontrado.estudiante.codigo}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label="Regular Activo"
                size="small"
                sx={{
                  bgcolor: alpha(accentGreen, 0.15),
                  color: accentGreen,
                  border: `1px solid ${alpha(accentGreen, 0.3)}`,
                  fontWeight: 800,
                  fontSize: '0.7rem',
                }}
              />
            </Box>

            <Box
              sx={{
                p: 1.2,
                borderRadius: '10px',
                bgcolor: bgField,
                border: `1px solid ${borderField}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Curso Destino Gestión 2027:
              </Typography>
              <Typography variant="body2" fontWeight={800} sx={{ color: brand }}>
                {estudianteEncontrado.proyeccion_siguiente?.grado_nombre} (Turno {estudianteEncontrado.gestion_actual?.turno_nombre || 'Mañana'})
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={confirmaContinuidad}
                  onChange={(e) => setConfirmaContinuidad(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary' }}>
                  {confirmaContinuidad
                    ? 'Confirmo la continuidad escolar de este estudiante'
                    : 'Declaro que NO continuará en la gestión'}
                </Typography>
              }
            />
          </Box>
        )}
      </DialogContent>

      {/* ── FOOTER ── */}
      <Box
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderTop: `1px solid ${borderField}`,
        }}
      >
        <Button
          onClick={handleCerrar}
          disabled={isConfirmando}
          sx={{
            borderRadius: '10px',
            color: 'text.secondary',
            px: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancelar
        </Button>

        <Box sx={{ flex: 1 }} />

        {estudianteEncontrado && (
          <Button
            variant="contained"
            onClick={handleConfirmar}
            disabled={isConfirmando}
            startIcon={isConfirmando ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon sx={{ fontSize: 17 }} />}
            sx={{
              borderRadius: '10px',
              px: 2.8,
              py: 0.85,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              background: brand,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
              '&:hover': {
                background: isDark ? '#eab308' : '#01579b',
              },
            }}
          >
            {isConfirmando ? 'Confirmando...' : 'Confirmar Reserva de Cupo'}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default ModalAgregarHermanoRegular;
