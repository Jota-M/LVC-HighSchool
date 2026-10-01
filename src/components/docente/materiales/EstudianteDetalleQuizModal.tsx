'use client';
// components/docente/materiales/EstudianteDetalleQuizModal.tsx

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Avatar, Chip, alpha, Divider,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  LightbulbOutlined as TipIcon
} from '@mui/icons-material';
import type { EstudianteQuizItem, QuizPreguntaCompleta } from '@/types/materialTypes';

interface EstudianteDetalleQuizModalProps {
  open: boolean;
  onClose: () => void;
  estudiante: EstudianteQuizItem | null;
  preguntasDocente: QuizPreguntaCompleta[];
  accent: string;
  isDark: boolean;
}

export const EstudianteDetalleQuizModal: React.FC<EstudianteDetalleQuizModalProps> = ({
  open, onClose, estudiante, preguntasDocente, accent, isDark
}) => {
  if (!estudiante) return null;

  const tieneRespuestas = Array.isArray(estudiante.ultimas_respuestas) && estudiante.ultimas_respuestas.length > 0;
  const puntaje = estudiante.ultimo_puntaje ?? estudiante.mejor_puntaje ?? 0;
  const esAprobado = puntaje >= 51;
  const puntajeColor = puntaje >= 70 ? '#16a34a' : puntaje >= 51 ? '#d97706' : '#dc2626';

  // Mapa de preguntas para complementar textos
  const preguntasMap = new Map(preguntasDocente.map(p => [p.id, p]));

  const brand = accent;
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101d' : '#ffffff';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? '0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)'
            : '0 32px 64px rgba(0,0,0,0.18)',
          maxHeight: '90vh'
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Avatar
              src={estudiante.estudiante_foto || undefined}
              sx={{
                width: 44, height: 44,
                bgcolor: alpha(accent, 0.15),
                color: accent,
                fontWeight: 700,
                fontSize: '1rem',
                border: `2px solid ${alpha(puntajeColor, 0.4)}`
              }}
            >
              {estudiante.estudiante_nombres?.[0] || 'E'}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha(brand, 0.8),
                  mb: 0.3,
                }}
              >
                RESULTADOS DEL ESTUDIANTE · CUESTIONARIO
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1, color: 'text.primary' }}>
                {estudiante.estudiante_apellidos}, {estudiante.estudiante_nombres}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                RUDE/Código: {estudiante.estudiante_codigo || 'S/C'} · Matrícula: {estudiante.numero_matricula}
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

      {/* Resumen del intento */}
      <Box sx={{
        mx: 3, mb: 2, p: 2, borderRadius: '12px',
        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
        border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            px: 1.5, py: 0.75, borderRadius: '8px',
            bgcolor: alpha(puntajeColor, 0.12),
            color: puntajeColor,
            fontWeight: 900,
            fontSize: '1.25rem',
            lineHeight: 1
          }}>
            {puntaje}%
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: puntajeColor }}>
              {esAprobado ? 'Aprobado' : 'Reprobado'} · {estudiante.correctas ?? 0} de {estudiante.total_preguntas ?? 0} aciertos
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
              {estudiante.total_intentos} intento{estudiante.total_intentos !== 1 ? 's' : ''} realizado{estudiante.total_intentos !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        {estudiante.ultimo_intento_fecha && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
            <ScheduleIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.75rem' }}>
              {new Date(estudiante.ultimo_intento_fecha).toLocaleString('es-ES', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ opacity: isDark ? 0.1 : 0.06 }} />

      <DialogContent sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!tieneRespuestas ? (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              No hay un desglose detallado de respuestas para este intento.
            </Typography>
          </Box>
        ) : (
          estudiante.ultimas_respuestas!.map((r, idx) => {
            const preguntaInfo = preguntasMap.get(r.quiz_id);
            const opciones = preguntaInfo?.opciones || [];
            const textoPregunta = preguntaInfo?.pregunta || `Pregunta #${idx + 1}`;
            const esCorrecta = r.es_correcta;

            return (
              <Box
                key={idx}
                sx={{
                  p: 2, borderRadius: '12px',
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                  border: `1px solid ${isDark
                    ? esCorrecta ? alpha('#16a34a', 0.3) : alpha('#dc2626', 0.3)
                    : esCorrecta ? alpha('#16a34a', 0.25) : alpha('#dc2626', 0.25)}`,
                }}
              >
                {/* Header de la pregunta */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{
                      width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                      bgcolor: esCorrecta ? alpha('#16a34a', 0.12) : alpha('#dc2626', 0.12),
                      color: esCorrecta ? '#16a34a' : '#dc2626',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 800, mt: 0.2
                    }}>
                      {idx + 1}
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.35 }}>
                      {textoPregunta}
                    </Typography>
                  </Box>

                  <Chip
                    icon={esCorrecta ? <CheckCircleIcon sx={{ fontSize: '13px !important' }} /> : <CancelIcon sx={{ fontSize: '13px !important' }} />}
                    label={esCorrecta ? 'Correcta' : 'Incorrecta'}
                    size="small"
                    sx={{
                      height: 22, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px',
                      bgcolor: esCorrecta ? alpha('#16a34a', 0.1) : alpha('#dc2626', 0.1),
                      color: esCorrecta ? '#16a34a' : '#dc2626'
                    }}
                  />
                </Box>

                {/* Opciones */}
                {opciones.length > 0 && (
                  <Box sx={{ pl: 3.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {opciones.map((op, opIdx) => {
                      const seleccionada = opIdx === r.respuesta_dada;
                      const esLaCorrecta = opIdx === r.respuesta_correcta || (preguntaInfo && opIdx === preguntaInfo.respuesta_correcta);

                      let borderColor = 'transparent';
                      let bgColor = 'transparent';
                      let textColor = 'text.secondary';
                      let icon = null;

                      if (seleccionada && esCorrecta) {
                        borderColor = '#16a34a';
                        bgColor = alpha('#16a34a', 0.1);
                        textColor = '#16a34a';
                        icon = <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />;
                      } else if (seleccionada && !esCorrecta) {
                        borderColor = '#dc2626';
                        bgColor = alpha('#dc2626', 0.1);
                        textColor = '#dc2626';
                        icon = <CancelIcon sx={{ fontSize: 16, color: '#dc2626' }} />;
                      } else if (esLaCorrecta && !esCorrecta) {
                        borderColor = alpha('#16a34a', 0.5);
                        bgColor = alpha('#16a34a', 0.05);
                        textColor = '#16a34a';
                        icon = <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />;
                      }

                      return (
                        <Box
                          key={opIdx}
                          sx={{
                            px: 1.5, py: 0.75, borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            bgcolor: bgColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: '0.78rem',
                            fontWeight: seleccionada || esLaCorrecta ? 600 : 400,
                            color: textColor
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {icon || <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid currentColor', opacity: 0.3 }} />}
                            <Typography sx={{ fontSize: '0.78rem' }}>{op}</Typography>
                          </Box>
                          {seleccionada && (
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, fontStyle: 'italic', ml: 1 }}>
                              (Respuesta del estudiante)
                            </Typography>
                          )}
                          {!seleccionada && esLaCorrecta && !esCorrecta && (
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, fontStyle: 'italic', ml: 1 }}>
                              (Respuesta correcta)
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Explicación pedagógica */}
                {(r.explicacion || preguntaInfo?.explicacion) && (
                  <Box sx={{
                    mt: 1.25, ml: 3.5, p: 1, borderRadius: '8px',
                    bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                    borderLeft: `3px solid ${alpha(accent, 0.5)}`,
                    display: 'flex', alignItems: 'flex-start', gap: 0.75
                  }}>
                    <TipIcon sx={{ fontSize: 15, color: accent, mt: 0.2 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1.4 }}>
                      {r.explicacion || preguntaInfo?.explicacion}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })
        )}
      </DialogContent>

      <Divider sx={{ opacity: isDark ? 0.1 : 0.06 }} />

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EstudianteDetalleQuizModal;
