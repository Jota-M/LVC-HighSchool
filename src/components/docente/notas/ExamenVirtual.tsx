'use client';
// components/docente/notas/ExamenVirtual.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Chip, IconButton,
  Switch, FormControlLabel, Paper, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Stack,
  Radio, alpha, useTheme, Divider
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  AddCircleOutline as AddIcon,
  DeleteOutline as DeleteIcon,
  Save as SaveIcon,
  AccessTime as TimeIcon,
  Settings as SettingsIcon,
  UploadFile as FileIcon,
  HelpOutline as QuestionIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  CheckCircleOutline as CorrectIcon,
  CancelOutlined as IncorrectIcon,
} from '@mui/icons-material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useRouter } from 'next/navigation';
import { useExamenDocente } from '@/hooks/useExamen';
import type { PreguntaExamen, TipoPreguntaExamen, ConfigurarExamenDTO } from '@/types/examenTypes';
import type { Evaluacion } from '@/types/notasTypes';

interface ExamenVirtualProps {
  evaluacion: Evaluacion;
  onActualizada?: () => void;
}

const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

export const ExamenVirtual: React.FC<ExamenVirtualProps> = ({ evaluacion, onActualizada }) => {
  const router = useRouter();
  const { isDark, gold, gradBg } = usePalette();
  const evaluacionId = evaluacion.id;

  const {
    preguntas,
    setPreguntas,
    config,
    isLoading,
    generando,
    guardando,
    publicando,
    generarConIA,
    guardarPreguntas,
    activarVirtual,
    refrescar,
  } = useExamenDocente(evaluacionId);

  // Helper para formatear fechas ISO o locales para input datetime-local
  const formatForInput = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const s = String(dateStr).trim();
      if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s)) {
        return s.replace(' ', 'T').slice(0, 16);
      }
      const d = new Date(s);
      if (isNaN(d.getTime())) return '';
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/La_Paz',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(d);
      const map: Record<string, string> = {};
      for (const p of parts) map[p.type] = p.value;
      const hr = map.hour === '24' ? '00' : map.hour;
      return `${map.year}-${map.month}-${map.day}T${hr}:${map.minute}`;
    } catch {
      return '';
    }
  };

  // Estados de configuración de tiempos
  const [configOpen, setConfigOpen] = useState(false);
  const [duracionMinutos, setDuracionMinutos] = useState<number>(evaluacion.duracion_minutos || 60);
  const [fechaInicio, setFechaInicio] = useState<string>(formatForInput(evaluacion.fecha_hora_inicio));
  const [fechaFin, setFechaFin] = useState<string>(formatForInput(evaluacion.fecha_hora_fin));
  const [intentosPermitidos, setIntentosPermitidos] = useState<number>(evaluacion.intentos_permitidos || 1);
  const [ordenAleatorio, setOrdenAleatorio] = useState<boolean>(evaluacion.orden_aleatorio || false);

  // Modal IA
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [cantOpMult, setCantOpMult] = useState(5);
  const [cantVF, setCantVF] = useState(2);
  const [cantDesarrollo, setCantDesarrollo] = useState(1);
  const [contenidoExtra, setContenidoExtra] = useState('');

  // Sincronizar estados locales cuando cambie config
  useEffect(() => {
    if (config) {
      if (config.duracion_minutos) setDuracionMinutos(config.duracion_minutos);
      if (config.fecha_hora_inicio) setFechaInicio(formatForInput(config.fecha_hora_inicio));
      if (config.fecha_hora_fin) setFechaFin(formatForInput(config.fecha_hora_fin));
      if (config.intentos_permitidos) setIntentosPermitidos(config.intentos_permitidos);
      if (config.orden_aleatorio !== undefined) setOrdenAleatorio(config.orden_aleatorio);
    }
  }, [config]);

  // Cálculos de puntos
  const puntajeTotalPreguntas = preguntas.reduce((sum, p) => sum + (Number(p.puntos) || 0), 0);
  const puntajeMaximoEval = Number(evaluacion.puntaje_maximo) || 100;
  const puntosCoinciden = Math.abs(puntajeTotalPreguntas - puntajeMaximoEval) < 0.01;

  // Manejo de preguntas
  const handleAgregarPregunta = (tipo: TipoPreguntaExamen = 'opcion_multiple') => {
    const nueva: PreguntaExamen = {
      id: -Date.now(),
      tipo,
      pregunta: '',
      opciones: tipo === 'opcion_multiple'
        ? ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4']
        : tipo === 'verdadero_falso'
          ? ['Verdadero', 'Falso']
          : [],
      respuesta_correcta: (tipo === 'opcion_multiple' || tipo === 'verdadero_falso') ? 0 : null,
      respuesta_esperada: tipo === 'desarrollo' || tipo === 'respuesta_corta' ? '' : null,
      puntos: 5,
      requiere_archivo: false,
      orden: preguntas.length + 1,
    };
    setPreguntas(prev => [...prev, nueva]);
  };

  const handleEliminarPregunta = (index: number) => {
    setPreguntas(prev => prev.filter((_, i) => i !== index).map((p, idx) => ({ ...p, orden: idx + 1 })));
  };

  const handleMoverPregunta = (index: number, direccion: 'arriba' | 'abajo') => {
    const destino = direccion === 'arriba' ? index - 1 : index + 1;
    if (destino < 0 || destino >= preguntas.length) return;
    const copia = [...preguntas];
    const temp = copia[index];
    copia[index] = copia[destino];
    copia[destino] = temp;
    setPreguntas(copia.map((p, idx) => ({ ...p, orden: idx + 1 })));
  };

  const handleCambiarPregunta = (index: number, campo: keyof PreguntaExamen, valor: any) => {
    setPreguntas(prev => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const handleCambiarOpcion = (pIndex: number, oIndex: number, valor: string) => {
    setPreguntas(prev => {
      const copia = [...prev];
      const ops = [...(copia[pIndex].opciones || [])];
      ops[oIndex] = valor;
      copia[pIndex] = { ...copia[pIndex], opciones: ops };
      return copia;
    });
  };

  const handleGuardarConfiguracion = async () => {
    const dto: ConfigurarExamenDTO = {
      duracion_minutos: duracionMinutos,
      fecha_hora_inicio: fechaInicio ? fechaInicio : null,
      fecha_hora_fin: fechaFin ? fechaFin : null,
      intentos_permitidos: intentosPermitidos,
      orden_aleatorio: ordenAleatorio,
    };
    const ok = await activarVirtual(dto);
    if (ok) {
      setConfigOpen(false);
      if (onActualizada) onActualizada();
    }
  };

  const handleEjecutarGeneracionIA = async () => {
    const resultado = await generarConIA({
      cantidadOpcionMultiple: cantOpMult,
      cantidadVerdaderoFalso: cantVF,
      cantidadDesarrollo: cantDesarrollo,
      contenidoPersonalizado: contenidoExtra.trim() || undefined,
    });
    if (resultado && resultado.length > 0) {
      setPreguntas(resultado);
      setModalIAOpen(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* ── Banner de Configuración Virtual ── */}
      <Paper sx={{
        p: 2.5, mb: 3, borderRadius: '14px',
        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: '10px',
              bgcolor: alpha(gold, 0.15), display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: gold,
            }}>
              <QuestionIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={800}>
                  Examen Virtual
                </Typography>
                <Chip
                  label={evaluacion.modalidad === 'virtual' ? 'Virtual Activo' : 'Presencial'}
                  size="small"
                  color={evaluacion.modalidad === 'virtual' ? 'success' : 'default'}
                  sx={{ fontSize: 11, fontWeight: 700, height: 22 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {preguntas.length} preguntas configuradas • Duración: {duracionMinutos} min • Límite: {intentosPermitidos} intento(s)
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                router.push(`/dashboard/docente/notas/${evaluacion.asignacion_docente_id}-${evaluacion.periodo_evaluacion_id}/nueva?evaluacionId=${evaluacion.id}`);
              }}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                borderColor: isDark ? alpha('#fff', 0.25) : alpha('#000', 0.25),
                color: isDark ? '#fff' : 'text.primary',
                '&:hover': {
                  borderColor: gold,
                  bgcolor: alpha(gold, 0.08),
                  color: gold,
                }
              }}
            >
              Editar práctica completa
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<SettingsIcon />}
              onClick={() => setConfigOpen(true)}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Parámetros de Tiempo
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setModalIAOpen(true)}
              sx={{
                background: gradBg, borderRadius: '8px',
                textTransform: 'none', fontWeight: 700,
                boxShadow: 'none', '&:hover': { opacity: 0.9 },
              }}
            >
              Generar con IA
            </Button>
          </Stack>
        </Box>

        {/* Alerta de Ponderación de Puntos */}
        <Box sx={{ mt: 2 }}>
          {!puntosCoinciden ? (
            <Alert severity="warning" sx={{ borderRadius: '8px', py: 0.5, fontSize: 13 }}>
              La suma de puntos de las preguntas (<strong>{puntajeTotalPreguntas} pts</strong>) no coincide con el puntaje máximo de la evaluación (<strong>{puntajeMaximoEval} pts</strong>). Puedes ajustar los puntos de cada pregunta antes de guardar.
            </Alert>
          ) : (
            <Alert severity="success" sx={{ borderRadius: '8px', py: 0.5, fontSize: 13 }}>
              Puntos calibrados: La suma de preguntas coincide exactamente con los <strong>{puntajeMaximoEval} puntos</strong> de la evaluación.
            </Alert>
          )}
        </Box>
      </Paper>

      {/* ── Barra de Acciones del Banco de Preguntas ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.05rem' }}>
          Banco de Preguntas ({preguntas.length})
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleAgregarPregunta('opcion_multiple')}
            sx={{ textTransform: 'none', fontWeight: 600, color: gold }}
          >
            Agregar Pregunta
          </Button>

          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            disabled={guardando || preguntas.length === 0}
            onClick={() => guardarPreguntas(preguntas)}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
          >
            {guardando ? 'Guardando...' : 'Guardar Preguntas'}
          </Button>
        </Stack>
      </Box>

      {/* ── Lista Editable de Preguntas ── */}
      {isLoading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress size={28} sx={{ color: gold }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Cargando preguntas del examen...
          </Typography>
        </Box>
      ) : preguntas.length === 0 ? (
        <Paper sx={{
          py: 6, px: 2, textAlign: 'center', borderRadius: '12px',
          bgcolor: isDark ? alpha('#fff', 0.01) : '#fafafa',
          border: `1px dashed ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
        }}>
          <QuestionIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" fontWeight={700} color="text.secondary">
            Aún no hay preguntas para este examen
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2, maxWidth: 420, mx: 'auto' }}>
            Puedes redactar tus preguntas manualmente o hacer clic en &quot;Generar con IA&quot; para que Gemini analice el tema y elabore el borrador por ti.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setModalIAOpen(true)}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            Generar borrador con IA
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {preguntas.map((p, idx) => (
            <Paper key={p.id || idx} sx={{
              p: 2.5, borderRadius: '12px',
              border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              position: 'relative',
            }}>
              {/* Header de la Pregunta */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: gold }}>
                    Pregunta #{idx + 1}
                  </Typography>

                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                      value={p.tipo}
                      onChange={(e) => {
                        const nuevoTipo = e.target.value as TipoPreguntaExamen;
                        handleCambiarPregunta(idx, 'tipo', nuevoTipo);
                        if (nuevoTipo === 'opcion_multiple' && (!p.opciones || p.opciones.length < 2)) {
                          handleCambiarPregunta(idx, 'opciones', ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4']);
                          handleCambiarPregunta(idx, 'respuesta_correcta', 0);
                        } else if (nuevoTipo === 'verdadero_falso') {
                          handleCambiarPregunta(idx, 'opciones', ['Verdadero', 'Falso']);
                          handleCambiarPregunta(idx, 'respuesta_correcta', 0);
                        }
                      }}
                      sx={{ fontSize: 12, height: 30, borderRadius: '6px' }}
                    >
                      <MenuItem value="opcion_multiple">Opción Múltiple</MenuItem>
                      <MenuItem value="verdadero_falso">Verdadero / Falso</MenuItem>
                      <MenuItem value="respuesta_corta">Respuesta Corta</MenuItem>
                      <MenuItem value="desarrollo">Desarrollo / Ensayo</MenuItem>
                    </Select>
                  </FormControl>

                  {p.generado_por_ia && (
                    <Chip
                      icon={<AutoAwesomeIcon sx={{ fontSize: '13px !important' }} />}
                      label="Generado por IA"
                      size="small"
                      sx={{ height: 22, fontSize: 10, bgcolor: alpha(gold, 0.12), color: gold, fontWeight: 700 }}
                    />
                  )}
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="Puntos"
                    type="number"
                    size="small"
                    value={p.puntos}
                    onChange={(e) => handleCambiarPregunta(idx, 'puntos', parseFloat(e.target.value) || 0)}
                    sx={{ width: 85, '& input': { fontSize: 13, py: 0.6 } }}
                  />

                  <Tooltip title="Mover arriba">
                    <span>
                      <IconButton size="small" disabled={idx === 0} onClick={() => handleMoverPregunta(idx, 'arriba')}>
                        <UpIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Mover abajo">
                    <span>
                      <IconButton size="small" disabled={idx === preguntas.length - 1} onClick={() => handleMoverPregunta(idx, 'abajo')}>
                        <DownIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Eliminar pregunta">
                    <IconButton size="small" color="error" onClick={() => handleEliminarPregunta(idx)}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Enunciado de la Pregunta */}
              <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder="Escribe aquí el enunciado de la pregunta..."
                value={p.pregunta}
                onChange={(e) => handleCambiarPregunta(idx, 'pregunta', e.target.value)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 14 } }}
              />

              {/* Opciones para Opción Múltiple y V/F */}
              {(p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') && (
                <Box sx={{ pl: 1, mb: 1.5 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Opciones (marca el círculo de la respuesta correcta):
                  </Typography>

                  <Stack spacing={1}>
                    {(p.opciones || []).map((op, oIdx) => (
                      <Box key={oIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Radio
                          checked={p.respuesta_correcta === oIdx}
                          onChange={() => handleCambiarPregunta(idx, 'respuesta_correcta', oIdx)}
                          sx={{ color: p.respuesta_correcta === oIdx ? '#16a34a' : 'text.disabled', p: 0.5 }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          disabled={p.tipo === 'verdadero_falso'}
                          value={op}
                          onChange={(e) => handleCambiarOpcion(idx, oIdx, e.target.value)}
                          sx={{ '& input': { fontSize: 13, py: 0.8 } }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Guía para preguntas de desarrollo / respuesta corta */}
              {(p.tipo === 'desarrollo' || p.tipo === 'respuesta_corta') && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Guía de corrección (Respuesta esperada)"
                    placeholder="Describe los puntos clave que debe contener la respuesta para facilitar la calificación..."
                    value={p.respuesta_esperada || ''}
                    onChange={(e) => handleCambiarPregunta(idx, 'respuesta_esperada', e.target.value)}
                    sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
                  />

                  {p.tipo === 'desarrollo' && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(p.requiere_archivo)}
                          onChange={(e) => handleCambiarPregunta(idx, 'requiere_archivo', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FileIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" fontWeight={600}>
                            Requiere que el estudiante suba un archivo (PDF o Imagen)
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                </Box>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      {/* ── MODAL DE PARÁMETROS DE TIEMPO ── */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Configurar Parámetros del Examen Virtual
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Duración (en minutos)"
              type="number"
              fullWidth
              value={duracionMinutos}
              onChange={(e) => setDuracionMinutos(Math.max(1, parseInt(e.target.value) || 1))}
              helperText="Tiempo que tendrá el estudiante una vez que presione 'Iniciar Examen'"
            />

            <TextField
              label="Fecha y hora de habilitación (Inicio)"
              type="datetime-local"
              fullWidth
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Antes de esta hora, el examen estará bloqueado"
            />

            <TextField
              label="Fecha y hora límite de entrega (Cierre)"
              type="datetime-local"
              fullWidth
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Pasada esta hora, no se aceptarán nuevos intentos"
            />

            <TextField
              label="Intentos permitidos"
              type="number"
              fullWidth
              value={intentosPermitidos}
              onChange={(e) => setIntentosPermitidos(Math.max(1, parseInt(e.target.value) || 1))}
              helperText="Cantidad máxima de veces que el alumno puede rendir el examen (habitualmente 1)"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={ordenAleatorio}
                  onChange={(e) => setOrdenAleatorio(e.target.checked)}
                  color="primary"
                />
              }
              label="Barajar preguntas de forma aleatoria para cada estudiante"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfigOpen(false)} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarConfiguracion}
            disabled={publicando}
            sx={{ background: gradBg, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
          >
            {publicando ? 'Guardando...' : 'Guardar Parámetros'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL GENERADOR IA ── */}
      <Dialog open={modalIAOpen} onClose={() => setModalIAOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
          <AutoAwesomeIcon sx={{ color: gold }} />
          Generar Examen con Gemini IA
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            La inteligencia artificial analizará el contenido educativo de la unidad/tema vinculado a esta evaluación para formular preguntas pedagógicamente rigurosas.
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              <TextField
                label="Opción Múltiple"
                type="number"
                size="small"
                value={cantOpMult}
                onChange={(e) => setCantOpMult(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <TextField
                label="Verdadero/Falso"
                type="number"
                size="small"
                value={cantVF}
                onChange={(e) => setCantVF(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <TextField
                label="Desarrollo"
                type="number"
                size="small"
                value={cantDesarrollo}
                onChange={(e) => setCantDesarrollo(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </Box>

            <TextField
              label="Contenido o Enfoque Adicional (Opcional)"
              multiline
              minRows={3}
              placeholder="Si deseas enfocar el examen en subtemas específicos, pega aquí texto complementario o directrices..."
              value={contenidoExtra}
              onChange={(e) => setContenidoExtra(e.target.value)}
              helperText="Si se deja en blanco, se utilizará el contenido oficial del tema curricular."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalIAOpen(false)} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleEjecutarGeneracionIA}
            disabled={generando}
            startIcon={generando ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{ background: gradBg, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
          >
            {generando ? 'Generando borrador...' : 'Generar Preguntas'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamenVirtual;
