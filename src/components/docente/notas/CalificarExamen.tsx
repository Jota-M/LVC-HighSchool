'use client';
// components/docente/notas/CalificarExamen.tsx

import React, { useState } from 'react';
import {
  Box, Typography, Paper, Chip, Avatar, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, IconButton, CircularProgress,
  Divider, Tooltip, Alert, alpha, useTheme
} from '@mui/material';
import {
  AssignmentTurnedIn as DoneIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  AttachFile as FileIcon,
  OpenInNew as OpenIcon,
  Close as CloseIcon,
  Grade as GradeIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useIntentosDocente, useDetalleIntentoDocente } from '@/hooks/useExamen';
import type { EstudianteIntentoItem, DetallePreguntaRespuesta } from '@/types/examenTypes';

interface CalificarExamenProps {
  evaluacionId: number;
  puntajeMaximo: number;
}

const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

export const CalificarExamen: React.FC<CalificarExamenProps> = ({ evaluacionId, puntajeMaximo }) => {
  const { isDark, gold, gradBg } = usePalette();
  const { intentos, isLoading, refrescar } = useIntentosDocente(evaluacionId);

  const [intentoSeleccionadoId, setIntentoSeleccionadoId] = useState<number | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendientes' | 'completos'>('todos');

  const {
    detalle,
    isLoading: cargandoDetalle,
    calificando,
    calificarRespuesta,
    refrescar: refrescarDetalle,
  } = useDetalleIntentoDocente(intentoSeleccionadoId);

  // Estados temporales de puntuación por respuesta dentro del modal
  const [calificacionesLocales, setCalificacionesLocales] = useState<Record<number, { puntos: number; feedback: string }>>({});

  const handleAbrirIntento = (intentoId: number) => {
    setIntentoSeleccionadoId(intentoId);
    setCalificacionesLocales({});
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setIntentoSeleccionadoId(null);
    refrescar();
  };

  const handleGuardarPuntosRespuesta = async (p: DetallePreguntaRespuesta) => {
    if (!p.respuesta_id) return;
    const datos = calificacionesLocales[p.respuesta_id] || {
      puntos: p.puntaje_obtenido ?? 0,
      feedback: p.retroalimentacion || '',
    };

    const ok = await calificarRespuesta(p.respuesta_id, Number(datos.puntos), datos.feedback);
    if (ok) {
      refrescarDetalle();
      refrescar();
    }
  };

  // Filtrado de intentos
  const intentosFiltrados = intentos.filter(item => {
    const cumpleTexto = (
      item.estudiante_nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.estudiante_apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.estudiante_codigo.toLowerCase().includes(busqueda.toLowerCase())
    );
    if (!cumpleTexto) return false;

    if (filtroEstado === 'pendientes') {
      return item.estado_intento === 'entregado' && !item.calificado_completo;
    }
    if (filtroEstado === 'completos') {
      return item.calificado_completo;
    }
    return true;
  });

  const totalPendientesRevision = intentos.filter(i => i.respuestas_pendientes_calificar > 0).length;

  return (
    <Box sx={{ mt: 2 }}>
      {/* ── Barra de filtros y contadores ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`Todos (${intentos.length})`}
            clickable
            color={filtroEstado === 'todos' ? 'primary' : 'default'}
            onClick={() => setFiltroEstado('todos')}
            size="small"
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label={`Pendientes de revisión (${totalPendientesRevision})`}
            clickable
            color={filtroEstado === 'pendientes' ? 'warning' : 'default'}
            onClick={() => setFiltroEstado('pendientes')}
            size="small"
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label={`Calificados completos (${intentos.filter(i => i.calificado_completo).length})`}
            clickable
            color={filtroEstado === 'completos' ? 'success' : 'default'}
            onClick={() => setFiltroEstado('completos')}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <TextField
          size="small"
          placeholder="Buscar estudiante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ width: 220, '& input': { fontSize: 13, py: 0.6 } }}
        />
      </Box>

      {/* ── Lista de estudiantes / intentos ── */}
      {isLoading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress size={28} sx={{ color: gold }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Cargando intentos de los estudiantes...
          </Typography>
        </Box>
      ) : intentosFiltrados.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa' }}>
          <Typography variant="body2" color="text.secondary">
            No se encontraron intentos para los filtros seleccionados.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {intentosFiltrados.map((item) => {
            const tieneIntento = Boolean(item.intento_id);
            const estaEntregado = item.estado_intento === 'entregado' || item.estado_intento === 'expirado';

            return (
              <Paper
                key={item.matricula_id}
                sx={{
                  p: 2, borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                  transition: 'background-color 0.15s',
                  '&:hover': { bgcolor: isDark ? alpha('#fff', 0.04) : '#f8fafc' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    src={item.estudiante_foto || undefined}
                    sx={{ width: 40, height: 40, bgcolor: alpha(gold, 0.2), color: gold, fontWeight: 700 }}
                  >
                    {item.estudiante_nombres.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {item.estudiante_apellidos} {item.estudiante_nombres}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Código: {item.estudiante_codigo}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Estado del intento */}
                  {!tieneIntento || item.estado_intento === 'sin_iniciar' ? (
                    <Chip label="Sin iniciar" size="small" sx={{ fontSize: 11, fontWeight: 600 }} />
                  ) : item.estado_intento === 'en_progreso' ? (
                    <Chip label="En progreso" size="small" color="info" sx={{ fontSize: 11, fontWeight: 600 }} />
                  ) : item.respuestas_pendientes_calificar > 0 ? (
                    <Chip
                      icon={<PendingIcon sx={{ fontSize: '14px !important' }} />}
                      label={`${item.respuestas_pendientes_calificar} por calificar`}
                      size="small"
                      color="warning"
                      sx={{ fontSize: 11, fontWeight: 700 }}
                    />
                  ) : (
                    <Chip
                      icon={<CorrectIcon sx={{ fontSize: '14px !important' }} />}
                      label="Calificado"
                      size="small"
                      color="success"
                      sx={{ fontSize: 11, fontWeight: 700 }}
                    />
                  )}

                  {/* Puntaje */}
                  {item.puntaje_obtenido !== null && item.puntaje_obtenido !== undefined ? (
                    <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: gold }}>
                        {item.puntaje_obtenido} pts
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                        de {puntajeMaximo}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                      <Typography variant="caption" color="text.disabled">
                        Sin nota
                      </Typography>
                    </Box>
                  )}

                  {/* Botón de acción */}
                  <Button
                    variant={item.respuestas_pendientes_calificar > 0 ? 'contained' : 'outlined'}
                    size="small"
                    disabled={!tieneIntento || !estaEntregado}
                    onClick={() => item.intento_id && handleAbrirIntento(item.intento_id)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: 12,
                      ...(item.respuestas_pendientes_calificar > 0
                        ? {
                            bgcolor: '#f59e0b',
                            color: '#000',
                            '&:hover': { bgcolor: '#d97706' },
                          }
                        : {
                            borderColor: isDark ? alpha(gold, 0.5) : alpha(gold, 0.5),
                            color: gold,
                            bgcolor: isDark ? alpha(gold, 0.08) : alpha(gold, 0.04),
                            '&:hover': {
                              borderColor: gold,
                              bgcolor: alpha(gold, 0.16),
                            },
                          }),
                      '&.Mui-disabled': {
                        borderColor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1),
                        color: isDark ? alpha('#fff', 0.25) : alpha('#000', 0.25),
                      }
                    }}
                  >
                    {item.respuestas_pendientes_calificar > 0 ? 'Calificar' : 'Ver Respuestas'}
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* ── MODAL DE CALIFICACIÓN Y REVISIÓN DE INTENTO ── */}
      <Dialog open={modalAbierto} onClose={handleCerrarModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Revisión de Examen Virtual
            </Typography>
            {detalle && (
              <Typography variant="caption" color="text.secondary">
                Estudiante: <strong>{detalle.estudiante_apellidos} {detalle.estudiante_nombres}</strong> ({detalle.estudiante_codigo})
              </Typography>
            )}
          </Box>

          <IconButton size="small" onClick={handleCerrarModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {cargandoDetalle || !detalle ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={28} sx={{ color: gold }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Cargando respuestas del estudiante...
              </Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Resumen del intento */}
              <Paper sx={{
                p: 2, borderRadius: '10px',
                bgcolor: isDark ? alpha('#fff', 0.03) : '#f8fafc',
                border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
              }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Puntaje total acumulado
                  </Typography>
                  <Typography variant="h5" fontWeight={900} sx={{ color: gold }}>
                    {detalle.puntaje_obtenido ?? 0} / {detalle.evaluacion_puntaje_maximo} pts
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={detalle.calificado_completo ? '✓ Calificación Completa' : '⏳ Pendiente de Calificación Manual'}
                    color={detalle.calificado_completo ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    label={`Estado: ${detalle.estado}`}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              </Paper>

              {/* Lista de preguntas y respuestas */}
              <Stack spacing={2.5}>
                {detalle.preguntas.map((p, idx) => {
                  const esObjetiva = p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso';
                  const datosLocales = calificacionesLocales[p.respuesta_id || 0] || {
                    puntos: p.puntaje_obtenido ?? 0,
                    feedback: p.retroalimentacion || '',
                  };

                  return (
                    <Paper key={p.pregunta_id} sx={{
                      p: 2.5, borderRadius: '12px',
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                    }}>
                      {/* Header de la pregunta */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={800} sx={{ color: gold }}>
                            Pregunta #{idx + 1}
                          </Typography>
                          <Chip
                            label={p.tipo.replace('_', ' ')}
                            size="small"
                            sx={{ fontSize: 10, height: 20, textTransform: 'capitalize' }}
                          />
                        </Box>

                        <Chip
                          label={`${p.puntaje_obtenido ?? 0} / ${p.puntos_maximos} pts`}
                          size="small"
                          color={p.es_correcta ? 'success' : (p.puntaje_obtenido != null && p.puntaje_obtenido > 0) ? 'primary' : 'default'}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>

                      {/* Enunciado */}
                      <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                        {p.pregunta}
                      </Typography>

                      {/* Render para preguntas objetivas */}
                      {esObjetiva ? (
                        <Box sx={{ pl: 1, mb: 1 }}>
                          <Stack spacing={0.8}>
                            {(p.opciones || []).map((op, oIdx) => {
                              const fueSeleccionada = p.respuesta_opcion === oIdx;
                              const esLaCorrecta = p.respuesta_correcta === oIdx;

                              let bg = 'transparent';
                              let icon = null;
                              if (fueSeleccionada && esLaCorrecta) {
                                bg = alpha('#16a34a', 0.12);
                                icon = <CorrectIcon sx={{ fontSize: 16, color: '#16a34a' }} />;
                              } else if (fueSeleccionada && !esLaCorrecta) {
                                bg = alpha('#dc2626', 0.12);
                                icon = <IncorrectIcon sx={{ fontSize: 16, color: '#dc2626' }} />;
                              } else if (esLaCorrecta) {
                                bg = alpha('#16a34a', 0.06);
                                icon = <CorrectIcon sx={{ fontSize: 16, color: '#16a34a' }} />;
                              }

                              return (
                                <Box key={oIdx} sx={{
                                  display: 'flex', alignItems: 'center', gap: 1,
                                  p: 1, borderRadius: '8px', bgcolor: bg,
                                }}>
                                  {icon || <Box sx={{ width: 16 }} />}
                                  <Typography variant="body2" sx={{
                                    fontWeight: fueSeleccionada ? 700 : 400,
                                    color: fueSeleccionada ? 'text.primary' : 'text.secondary',
                                  }}>
                                    {op} {fueSeleccionada ? '(Respuesta del alumno)' : ''}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Stack>
                        </Box>
                      ) : (
                        /* Render para preguntas subjetivas (desarrollo / respuesta corta) */
                        <Box sx={{ mt: 1.5 }}>
                          {/* Respuesta escrita del estudiante */}
                          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Respuesta del estudiante:
                          </Typography>
                          <Paper sx={{
                            p: 1.5, borderRadius: '8px', mb: 2,
                            bgcolor: isDark ? alpha('#fff', 0.03) : '#f8fafc',
                            border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                          }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                              {p.respuesta_texto || <em style={{ color: '#9ca3af' }}>El estudiante no escribió texto</em>}
                            </Typography>
                          </Paper>

                          {/* Archivo adjunto si existe */}
                          {p.archivo_url && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Archivo adjunto del estudiante:
                              </Typography>
                              <Button
                                component="a"
                                href={p.archivo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outlined"
                                size="small"
                                startIcon={<FileIcon />}
                                endIcon={<OpenIcon sx={{ fontSize: 15 }} />}
                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                              >
                                Ver archivo adjunto en nueva pestaña
                              </Button>
                            </Box>
                          )}

                          {/* Guía de respuesta esperada */}
                          {p.respuesta_esperada && (
                            <Alert severity="info" sx={{ borderRadius: '8px', py: 0.5, mb: 2, fontSize: 12 }}>
                              <strong>Guía de corrección:</strong> {p.respuesta_esperada}
                            </Alert>
                          )}

                          {/* Formulario de calificación manual para el docente */}
                          <Box sx={{
                            p: 2, borderRadius: '8px',
                            bgcolor: alpha(gold, 0.06),
                            border: `1px solid ${alpha(gold, 0.2)}`,
                          }}>
                            <Typography variant="caption" fontWeight={800} sx={{ color: gold, display: 'block', mb: 1.5 }}>
                              CALIFICACIÓN DEL DOCENTE
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
                              <TextField
                                label="Puntaje"
                                type="number"
                                size="small"
                                inputProps={{ min: 0, max: p.puntos_maximos, step: 0.5 }}
                                value={datosLocales.puntos}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setCalificacionesLocales(prev => ({
                                    ...prev,
                                    [p.respuesta_id || 0]: { ...datosLocales, puntos: val },
                                  }));
                                }}
                                helperText={`Máx: ${p.puntos_maximos} pts`}
                                sx={{ width: 120 }}
                              />

                              <TextField
                                fullWidth
                                size="small"
                                label="Retroalimentación / Comentario"
                                placeholder="Escribe observaciones para el estudiante..."
                                value={datosLocales.feedback}
                                onChange={(e) => {
                                  setCalificacionesLocales(prev => ({
                                    ...prev,
                                    [p.respuesta_id || 0]: { ...datosLocales, feedback: e.target.value },
                                  }));
                                }}
                              />

                              <Button
                                variant="contained"
                                size="small"
                                startIcon={calificando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                disabled={calificando}
                                onClick={() => handleGuardarPuntosRespuesta(p)}
                                sx={{
                                  background: gradBg, borderRadius: '8px',
                                  textTransform: 'none', fontWeight: 700,
                                  whiteSpace: 'nowrap', mt: '4px !important',
                                }}
                              >
                                Asignar Nota
                              </Button>
                            </Stack>
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCerrarModal} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalificarExamen;
