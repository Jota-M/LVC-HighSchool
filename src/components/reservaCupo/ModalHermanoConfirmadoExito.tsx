// components/reservaCupo/ModalHermanoConfirmadoExito.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  FamilyRestroom as FamilyIcon,
  Badge as BadgeIcon,
  ContentCopy as CopyIcon,
  EventAvailable as EventAvailableIcon,
  HelpOutline as HelpOutlineIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import reservaCupoService from '@/services/reservaCupoService';

interface ModalHermanoConfirmadoExitoProps {
  open: boolean;
  onClose: () => void;
  hermano: any;
  onVerComprobante?: () => void;
}

export const ModalHermanoConfirmadoExito: React.FC<ModalHermanoConfirmadoExitoProps> = ({
  open,
  onClose,
  hermano,
  onVerComprobante,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!hermano) return null;

  // Determinar si es hermano nuevo o hermano regular
  const esHermanoNuevo = Boolean(
    hermano.hermano_regular_id ||
    hermano.codigo_reserva?.startsWith('HER-') ||
    hermano.codigo_reserva?.startsWith('ESP-')
  );

  const esEspera = esHermanoNuevo && (hermano.estado === 'en_espera' || hermano.codigo_reserva?.startsWith('ESP-'));
  const esConfirmada = hermano.estado === 'confirmada';

  // ── Tokens visuales idénticos a ModalEstudianteNoEncontrado y NuevoHorarioModal ──
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

  const accentGreen = '#10b981';
  const accentAmber = '#f59e0b';

  const estadoColor = esEspera ? accentAmber : accentGreen;

  const nombreCompleto =
    hermano.estudiante_nombre_completo ||
    hermano.nombre_completo ||
    [hermano.nombres, hermano.apellido_paterno, hermano.apellido_materno].filter(Boolean).join(' ');

  const ciEstudiante = hermano.estudiante_ci || hermano.ci || 'S/N';
  const codigoReserva = hermano.codigo_reserva || hermano.codigo_recibo || 'RES-2027';

  const gradoDestino =
    hermano.grado_destino_nombre ||
    hermano.grado_solicitado_nombre ||
    hermano.grado_nombre ||
    'Grado Asignado';

  const turnoDestino =
    hermano.turno_destino_nombre ||
    hermano.turno_solicitado_nombre ||
    hermano.turno_nombre ||
    'Mañana';

  const hermanoRegularNombre =
    hermano.regular_nombre_completo ||
    hermano.hermano_regular_nombre ||
    null;

  const handleDescargar = () => {
    if (hermano.codigo_reserva) {
      reservaCupoService.descargarPDF(hermano.codigo_reserva);
    }
  };

  const handleCopiarCodigo = () => {
    if (codigoReserva && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(codigoReserva);
    }
  };

  // Configuración contextual según tipo de hermano
  const kicker = esHermanoNuevo
    ? esEspera
      ? 'Prioridad Familiar · Lista de Espera 2027'
      : 'Prioridad Familiar · Hermano Nuevo 2027'
    : 'Continuidad Confirmada · Hermano Regular 2027';

  const title = esHermanoNuevo
    ? esEspera
      ? 'Postulación en Lista de Espera'
      : '¡Hermano Nuevo Registrado con Éxito!'
    : '¡Cupo Confirmado para Hermano Regular!';

  const chipLabel = esEspera
    ? `Lista de Espera #${hermano.posicion_espera || 1}`
    : 'Cupo Asegurado';

  const explanation = esHermanoNuevo
    ? esEspera
      ? `La solicitud para ${nombreCompleto} ha quedado registrada con Prioridad Familiar en lista de espera (Puesto N.º ${hermano.posicion_espera || 1}). Se le notificará si se liberan cupos al vencer el plazo de confirmación.`
      : `El cupo escolar para ${nombreCompleto} ha sido asegurado con éxito en la Gestión 2027 gracias al beneficio de Prioridad Familiar por ser hermano de un estudiante del colegio.`
    : `El cupo escolar para el hermano regular ${nombreCompleto} ha sido ratificado con éxito para la Gestión 2027 con los datos del tutor de la familia.`;

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
        },
      }}
    >
      {/* ── HEADER (ESTILO MODALESTUDIANTENOENCONTRADO / NUEVOHORARIOMODAL) ── */}
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
              {kicker}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '9px',
                  flexShrink: 0,
                  background: alpha(estadoColor, 0.15),
                  border: `1px solid ${alpha(estadoColor, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {esEspera ? (
                  <AccessTimeIcon sx={{ color: estadoColor, fontSize: 18 }} />
                ) : (
                  <CheckCircleIcon sx={{ color: estadoColor, fontSize: 18 }} />
                )}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, color: 'text.primary' }}>
                {title}
              </Typography>
            </Box>
          </Box>

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
              transition: 'all 0.15s',
              flexShrink: 0,
              '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Barra superior de acento con gradiente de estado */}
        <Box
          sx={{
            height: 3,
            borderRadius: 2,
            background: esEspera
              ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
              : 'linear-gradient(90deg, #10b981, #facc15)',
            width: '100%',
          }}
        />
      </Box>

      {/* ── BODY (ESTILO MODALESTUDIANTENOENCONTRADO) ── */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {/* Banner del Estudiante / Postulante */}
        <Box
          sx={{
            p: 1.75,
            borderRadius: '12px',
            background: alpha(estadoColor, 0.08),
            border: `1px solid ${alpha(estadoColor, 0.25)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <BadgeIcon sx={{ color: estadoColor, fontSize: 22, flexShrink: 0 }} />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: alpha(estadoColor, 0.85),
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                }}
              >
                {esHermanoNuevo ? 'Hermano Postulante' : 'Hermano Regular'}
              </Typography>
              <Typography
                variant="body1"
                fontWeight={800}
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                {nombreCompleto}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                CI: <strong style={{ color: isDark ? '#fff' : '#000' }}>{ciEstudiante}</strong>
              </Typography>
            </Box>
          </Box>

          <Chip
            label={chipLabel}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 800,
              bgcolor: alpha(estadoColor, isDark ? 0.18 : 0.12),
              color: estadoColor,
              border: `1px solid ${alpha(estadoColor, 0.35)}`,
            }}
          />
        </Box>

        {/* Mensaje explicativo */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.55 }}>
          {explanation}
        </Typography>

        {/* Cajas resumen con estilo de Tips */}
        <Typography
          sx={{
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            mb: 1.2,
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
          }}
        >
          <HelpOutlineIcon sx={{ fontSize: 14, color: brand }} />
          Detalles de la Reserva
        </Typography>

        <Stack spacing={1.2}>
          {/* Item 1: Código de Reserva */}
          <Box
            sx={{
              p: 1.4,
              borderRadius: '12px',
              background: bgField,
              border: `1px solid ${borderField}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.25,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '7px',
                  background: alpha(brand, 0.15),
                  color: brand,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                1
              </Box>
              <Box>
                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', display: 'block', fontSize: '0.8rem' }}>
                  Código Oficial de Reserva
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    color: brand,
                    letterSpacing: '0.04em',
                  }}
                >
                  {codigoReserva}
                </Typography>
              </Box>
            </Box>

            <Button
              size="small"
              onClick={handleCopiarCodigo}
              startIcon={<CopyIcon sx={{ fontSize: 13 }} />}
              sx={{
                fontSize: '0.7rem',
                textTransform: 'none',
                fontWeight: 700,
                color: 'text.secondary',
                px: 1.2,
                py: 0.4,
                borderRadius: '8px',
                '&:hover': { color: brand, bgcolor: brandDim },
              }}
            >
              Copiar
            </Button>
          </Box>

          {/* Item 2: Grado y Turno */}
          <Box
            sx={{
              p: 1.4,
              borderRadius: '12px',
              background: bgField,
              border: `1px solid ${borderField}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '7px',
                background: alpha(accentGreen, 0.15),
                color: accentGreen,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 800,
                flexShrink: 0,
                mt: 0.1,
              }}
            >
              2
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', display: 'block', fontSize: '0.8rem' }}>
                Grado y Turno Asignado para 2027
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.4 }}>
                {gradoDestino} · Turno <strong>{turnoDestino}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Item 3: Respaldo / Familia */}
          <Box
            sx={{
              p: 1.4,
              borderRadius: '12px',
              background: bgField,
              border: `1px solid ${borderField}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '7px',
                background: alpha(accentAmber, 0.15),
                color: accentAmber,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 800,
                flexShrink: 0,
                mt: 0.1,
              }}
            >
              3
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', display: 'block', fontSize: '0.8rem' }}>
                {esHermanoNuevo ? 'Hermano Regular de Respaldo' : 'Vínculo Familiar'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.4 }}>
                {hermanoRegularNombre
                  ? `Respaldado por su hermano/a regular: ${hermanoRegularNombre}.`
                  : `Inscrito y vinculado bajo el mismo núcleo familiar del tutor registrado.`}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      {/* ── FOOTER (ESTILO MODALESTUDIANTENOENCONTRADO / NUEVOHORARIOMODAL) ── */}
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
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            color: 'text.secondary',
            px: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { background: 'rgba(255,255,255,0.05)' },
          }}
        >
          Cerrar
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button
          variant="outlined"
          onClick={handleDescargar}
          startIcon={<DownloadIcon sx={{ fontSize: 17 }} />}
          sx={{
            borderRadius: '10px',
            color: brand,
            borderColor: alpha(brand, 0.4),
            px: 2,
            py: 0.85,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            '&:hover': {
              borderColor: brand,
              background: alpha(brand, 0.08),
            },
          }}
        >
          Descargar PDF
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            onClose();
            if (onVerComprobante) onVerComprobante();
          }}
          autoFocus
          startIcon={<VisibilityIcon sx={{ fontSize: 17 }} />}
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
              boxShadow: `0 6px 20px ${alpha(brand, 0.5)}`,
            },
          }}
        >
          Ver Comprobante
        </Button>
      </Box>
    </Dialog>
  );
};

export default ModalHermanoConfirmadoExito;
