// components/reservaCupo/ModalEstudianteNoEncontrado.tsx
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
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  SearchOff as SearchOffIcon,
  PersonOff as PersonOffIcon,
  Badge as BadgeIcon,
  Refresh as RefreshIcon,
  HowToReg as HowToRegIcon,
  School as SchoolIcon,
  WarningAmber as WarningAmberIcon,
  HelpOutline as HelpOutlineIcon,
  People as PeopleIcon,
  EventAvailable as EventAvailableIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export interface ModalEstudianteNoEncontradoProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  ci: string;
  errorTipo?: 'ESTUDIANTE_NO_ENCONTRADO' | 'NO_ES_REGULAR' | 'BACHILLER_EGRESADO' | 'CI_INVALIDO_FORMATO' | 'YA_EN_LISTA' | 'YA_RESERVADO' | string;
  errorMessage?: string;
  nombreEstudiante?: string;
}

interface TipItem {
  num: number;
  color: string;
  title: string;
  desc: React.ReactNode;
}

export const ModalEstudianteNoEncontrado: React.FC<ModalEstudianteNoEncontradoProps> = ({
  open,
  onClose,
  onRetry,
  ci,
  errorTipo = 'ESTUDIANTE_NO_ENCONTRADO',
  errorMessage,
  nombreEstudiante
}) => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';

  // ── tokens (mismo sistema visual que NuevoHorarioModal) ─────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

  // Configuración contextual según errorTipo
  const getModalConfig = (): {
    kicker: string;
    icon: React.ReactNode;
    title: string;
    chipLabel: string;
    chipColor: string;
    explanation: string;
    showPreinscripcion: boolean;
    tipsTitle: string;
    tips: TipItem[];
    primaryButtonText: string;
    primaryButtonIcon: React.ReactNode;
  } => {
    switch (errorTipo) {
      case 'YA_EN_LISTA':
        return {
          kicker: 'Estudiante Duplicado · Lista de Reserva Actual',
          icon: <PeopleIcon sx={{ color: brand, fontSize: 18 }} />,
          title: 'Estudiante ya agregado a la lista',
          chipLabel: 'Ya en lista',
          chipColor: brand,
          explanation: errorMessage || (nombreEstudiante
            ? `El estudiante "${nombreEstudiante}" con CI "${ci}" ya se encuentra agregado en tu lista de reserva de cupo.`
            : `El estudiante con CI "${ci}" ya está agregado en la lista actual de reserva de cupo.`),
          showPreinscripcion: false,
          tipsTitle: 'Información y sugerencias',
          tips: [
            {
              num: 1,
              color: brand,
              title: 'Revisa las tarjetas de estudiantes',
              desc: 'El alumno ya aparece registrado en la sección superior del formulario con su curso asignado.'
            },
            {
              num: 2,
              color: '#10b981',
              title: 'Confirmar o ajustar su continuidad',
              desc: 'Puedes activar o desactivar el interruptor "Continuará" directamente en su tarjeta.'
            },
            {
              num: 3,
              color: '#f59e0b',
              title: '¿Tienes otro hijo o familiar en el colegio?',
              desc: 'Ingresa el número de CI correspondiente al otro estudiante para incorporarlo a esta misma reserva familiar.'
            }
          ],
          primaryButtonText: 'Entendido / Continuar',
          primaryButtonIcon: <CheckIcon sx={{ fontSize: 17 }} />
        };

      case 'YA_RESERVADO':
        return {
          kicker: 'Reserva Previa · Gestión 2027',
          icon: <EventAvailableIcon sx={{ color: '#10b981', fontSize: 18 }} />,
          title: 'Estudiante con cupo ya reservado',
          chipLabel: 'Reserva confirmada',
          chipColor: '#10b981',
          explanation: errorMessage || (nombreEstudiante
            ? `El estudiante "${nombreEstudiante}" ya cuenta con una reserva de cupo confirmada para la Gestión 2027.`
            : `Este estudiante ya cuenta con una reserva de cupo confirmada para la Gestión 2027.`),
          showPreinscripcion: false,
          tipsTitle: 'Estado de la reserva',
          tips: [
            {
              num: 1,
              color: '#10b981',
              title: 'Plaza escolar asegurada',
              desc: 'No es necesario volver a reservar para este estudiante, su cupo ya fue formalmente asignado.'
            },
            {
              num: 2,
              color: brand,
              title: 'Comprobante y código oficial',
              desc: 'Puedes consultar o reimprimir el recibo oficial con el código de reserva generado.'
            }
          ],
          primaryButtonText: 'Aceptar',
          primaryButtonIcon: <CheckIcon sx={{ fontSize: 17 }} />
        };

      case 'CI_INVALIDO_FORMATO':
        return {
          kicker: 'Validación de Entrada · Cédula Inválida',
          icon: <WarningAmberIcon sx={{ color: isDark ? '#fbbf24' : '#d97706', fontSize: 18 }} />,
          title: 'Carnet de Identidad No Válido',
          chipLabel: 'Formato incorrecto',
          chipColor: isDark ? '#fbbf24' : '#d97706',
          explanation: errorMessage || 'El Carnet de Identidad debe contener al menos 4 dígitos numéricos y no incluir símbolos especiales.',
          showPreinscripcion: false,
          tipsTitle: 'Verificaciones sugeridas',
          tips: [
            {
              num: 1,
              color: isDark ? '#fbbf24' : '#d97706',
              title: 'Formato numérico requerido',
              desc: 'Ingresa el número de cédula (ej: 16721370 o con complemento ej: 16721370-1A).'
            },
            {
              num: 2,
              color: brand,
              title: 'Evita caracteres especiales',
              desc: 'No ingreses símbolos como arrobas, signos de puntuación o espacios dobles.'
            }
          ],
          primaryButtonText: 'Corregir Cédula',
          primaryButtonIcon: <RefreshIcon sx={{ fontSize: 17 }} />
        };

      case 'NO_ES_REGULAR':
        return {
          kicker: 'Historial Académico · Sin Matrícula Previa',
          icon: <SchoolIcon sx={{ color: '#3b82f6', fontSize: 18 }} />,
          title: 'Estudiante Sin Matrícula Regular',
          chipLabel: 'No regular',
          chipColor: '#3b82f6',
          explanation: errorMessage || 'El estudiante existe en el sistema pero no cuenta con matrícula regular previa en el colegio.',
          showPreinscripcion: true,
          tipsTitle: 'Opciones disponibles',
          tips: [
            {
              num: 1,
              color: '#3b82f6',
              title: 'Estudiantes regulares únicamente',
              desc: 'Este módulo es exclusivo para estudiantes que cursaron en la institución en la gestión anterior.'
            },
            {
              num: 2,
              color: '#10b981',
              title: 'Postulantes nuevos',
              desc: 'Si el estudiante ingresará por primera vez a la U.E.P. La Voz de Cristo, realiza su registro en Preinscripción.'
            }
          ],
          primaryButtonText: 'Corregir Cédula',
          primaryButtonIcon: <RefreshIcon sx={{ fontSize: 17 }} />
        };

      case 'BACHILLER_EGRESADO':
        return {
          kicker: 'Estado Académico · Bachillerato Concluido',
          icon: <SchoolIcon sx={{ color: '#10b981', fontSize: 18 }} />,
          title: 'Estudiante Bachiller Egresado',
          chipLabel: 'Egresado',
          chipColor: '#10b981',
          explanation: errorMessage || 'El estudiante ya culminó 6to de Secundaria, por lo que no requiere reserva de cupo escolar.',
          showPreinscripcion: false,
          tipsTitle: 'Detalle',
          tips: [
            {
              num: 1,
              color: '#10b981',
              title: 'Ciclo escolar completado',
              desc: 'El estudiante concluyó con éxito todos los niveles educativos regulares del colegio.'
            }
          ],
          primaryButtonText: 'Entendido',
          primaryButtonIcon: <CheckIcon sx={{ fontSize: 17 }} />
        };

      case 'ESTUDIANTE_NO_ENCONTRADO':
      default:
        return {
          kicker: 'Búsqueda de Estudiante · Reserva de Cupos 2027',
          icon: <PersonOffIcon sx={{ color: brand, fontSize: 18 }} />,
          title: 'Estudiante regular no encontrado',
          chipLabel: 'Sin coincidencia',
          chipColor: isDark ? '#f87171' : '#dc2626',
          explanation: errorMessage || `No se encontró ningún estudiante regular activo registrado con el CI "${ci || ''}" en la base de datos de la institución.`,
          showPreinscripcion: true,
          tipsTitle: 'Verificaciones sugeridas',
          tips: [
            {
              num: 1,
              color: brand,
              title: 'Comprueba posibles errores de digitación',
              desc: 'Verifica que no falten números o que no se hayan incluido espacios o caracteres innecesarios.'
            },
            {
              num: 2,
              color: '#10b981',
              title: '¿Es un alumno nuevo en la institución?',
              desc: 'La Reserva de Cupo es exclusiva para estudiantes regulares. Para alumnos de nuevo ingreso, debes acudir al módulo de Preinscripción.'
            },
            {
              num: 3,
              color: '#f59e0b',
              title: 'Casos especiales o reincorporaciones',
              desc: 'Si el estudiante perteneció a la institución pero no cursó en la última gestión regular, acude a Secretaría Administrativa.'
            }
          ],
          primaryButtonText: 'Corregir Cédula',
          primaryButtonIcon: <RefreshIcon sx={{ fontSize: 17 }} />
        };
    }
  };

  const config = getModalConfig();

  const handleIrAPreinscripcion = () => {
    onClose();
    router.push('/PreInscripcion');
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
        },
      }}
    >
      {/* ── HEADER (ESTILO NUEVOHORARIOMODAL) ── */}
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
              {config.kicker}
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
                {config.icon}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, color: 'text.primary' }}>
                {config.title}
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

        {/* Barra superior de acento */}
        <Box
          sx={{
            height: 3,
            borderRadius: 2,
            background: brand,
            transition: 'background 0.3s',
            width: '100%'
          }}
        />
      </Box>

      {/* ── BODY (ESTILO NUEVOHORARIOMODAL) ── */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {/* Banner CI Consultado */}
        <Box
          sx={{
            p: 1.75,
            borderRadius: '12px',
            background: alpha(brand, 0.08),
            border: `1px solid ${alpha(brand, 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <BadgeIcon sx={{ color: brand, fontSize: 22, flexShrink: 0 }} />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: alpha(brand, 0.85),
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block'
                }}
              >
                Cédula de Identidad Ingresada
              </Typography>
              <Typography
                variant="body1"
                fontWeight={800}
                sx={{
                  color: 'text.primary',
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px'
                }}
              >
                {ci || 'Sin valor'}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={config.chipLabel}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 800,
              bgcolor: alpha(config.chipColor, isDark ? 0.18 : 0.12),
              color: config.chipColor,
              border: `1px solid ${alpha(config.chipColor, 0.3)}`,
            }}
          />
        </Box>

        {/* Mensaje descriptivo */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.55 }}>
          {config.explanation}
        </Typography>

        {/* Verificaciones / Tips */}
        {config.tips.length > 0 && (
          <>
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
                gap: 0.6
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: 14, color: brand }} />
              {config.tipsTitle}
            </Typography>

            <Stack spacing={1.2}>
              {config.tips.map((tip) => (
                <Box
                  key={tip.num}
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
                      width: 22,
                      height: 22,
                      borderRadius: '6px',
                      background: alpha(tip.color, 0.15),
                      color: tip.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      mt: 0.1,
                    }}
                  >
                    {tip.num}
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', display: 'block', fontSize: '0.8rem' }}>
                      {tip.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.4 }}>
                      {tip.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </DialogContent>

      {/* ── FOOTER (ESTILO NUEVOHORARIOMODAL) ── */}
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

        {config.showPreinscripcion && (
          <Button
            variant="outlined"
            onClick={handleIrAPreinscripcion}
            startIcon={<HowToRegIcon sx={{ fontSize: 17 }} />}
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
            Ir a Preinscripción
          </Button>
        )}

        <Button
          variant="contained"
          onClick={onRetry}
          autoFocus
          startIcon={config.primaryButtonIcon}
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
          {config.primaryButtonText}
        </Button>
      </Box>
    </Dialog>
  );
};

export default ModalEstudianteNoEncontrado;
