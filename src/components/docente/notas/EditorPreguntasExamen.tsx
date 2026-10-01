'use client';
// components/docente/notas/EditorPreguntasExamen.tsx

import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, Chip, IconButton,
  Paper, Tooltip, Dialog, DialogContent,
  Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Alert, Stack, Radio, alpha, useTheme,
  FormControlLabel, Checkbox,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  AddCircleOutline as AddIcon,
  DeleteOutline as DeleteIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  CheckCircleOutline as CorrectIcon,
  Balance as BalanceIcon,
  QuizOutlined as QuizIcon,
  BookmarkRounded as BookmarkIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { examenService } from '@/services/examenService';
import type { PreguntaExamen, TipoPreguntaExamen } from '@/types/examenTypes';
import { toast } from 'react-hot-toast';

interface EditorPreguntasExamenProps {
  preguntas: PreguntaExamen[];
  onChange: (preguntas: PreguntaExamen[]) => void;
  puntajeMaximo: number;
  temaId?: number;
  temaTituloDefault?: string;
  unidades?: Array<{
    id: number;
    titulo: string;
    numero: number;
    temas: Array<{
      tema_id: number;
      numero_tema: number;
      tema_titulo: string;
    }>;
  }>;
  onSelectTemaId?: (temaId: number | undefined) => void;
  isDark: boolean;
  accentColor?: string;
}

// Paleta fija por tipo de pregunta — se reutiliza en chips, botones "+" y
// la barrita de acento de cada card, así todo el módulo queda consistente.
const TIPO_COLORS: Record<TipoPreguntaExamen, string> = {
  opcion_multiple: '#3b82f6',
  verdadero_falso: '#10b981',
  desarrollo: '#f59e0b',
  respuesta_corta: '#ec4899',
};

const TIPO_LABELS: Record<TipoPreguntaExamen, string> = {
  opcion_multiple: 'Opción Múltiple',
  verdadero_falso: 'Verdadero / Falso',
  desarrollo: 'Desarrollo',
  respuesta_corta: 'Respuesta Corta',
};

export const EditorPreguntasExamen: React.FC<EditorPreguntasExamenProps> = ({
  preguntas,
  onChange,
  puntajeMaximo,
  temaId,
  temaTituloDefault = '',
  unidades,
  onSelectTemaId,
  isDark,
  accentColor = '#10b981',
}) => {
  const theme = useTheme();

  // Estados modal IA
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [temaTituloIA, setTemaTituloIA] = useState(temaTituloDefault || '');
  const [nivelDificultad, setNivelDificultad] = useState('medio');
  const [cantOpMult, setCantOpMult] = useState(5);
  const [cantVF, setCantVF] = useState(2);
  const [cantDesarrollo, setCantDesarrollo] = useState(1);
  const [contenidoExtra, setContenidoExtra] = useState('');
  const [modoManual, setModoManual] = useState(false);

  // Actualizar título por defecto cuando cambie la prop
  React.useEffect(() => {
    if (temaTituloDefault) {
      setTemaTituloIA(temaTituloDefault);
    }
  }, [temaTituloDefault]);

  // Cálculos de puntos
  const puntajeTotal = preguntas.reduce((sum, p) => sum + (Number(p.puntos) || 0), 0);
  const puntosCoinciden = Math.abs(puntajeTotal - puntajeMaximo) < 0.01;

  // Estilo reutilizable para los botones "outlined" de la barra superior:
  // antes heredaban el color por defecto de MUI (gris tenue) que se pierde
  // sobre fondo oscuro. Ahora cada uno usa el color de su tipo, con un
  // borde y fondo tenues que sí tienen contraste en dark y light.
  const outlinedAddButtonSx = (color: string) => ({
    borderRadius: '10px',
    textTransform: 'none' as const,
    fontWeight: 700,
    color: isDark ? alpha(color, 0.95) : color,
    borderColor: alpha(color, isDark ? 0.5 : 0.4),
    bgcolor: alpha(color, isDark ? 0.08 : 0.04),
    '&:hover': {
      borderColor: color,
      bgcolor: alpha(color, isDark ? 0.16 : 0.08),
    },
  });

  // ── Tokens del modal de IA (mismo lenguaje visual que NuevoHorarioModal) ──
  const brandIA = '#10b981'; // verde Gemini, coherente con el resto del módulo
  const bgModalIA = isDark ? '#09101dff' : '#ffffff';
  const bgFieldIA = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderFieldIA = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const brandDimIA = isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)';
  const brandBorderIA = isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.25)';
  const RIA = '14px';

  const fieldSxIA = {
    '& .MuiOutlinedInput-root': {
      borderRadius: RIA,
      background: bgFieldIA,
      fontSize: '0.975rem',
      minHeight: '48px',
      '& fieldset': {
        borderColor: borderFieldIA,
        borderRadius: RIA,
      },
      '&:hover fieldset': { borderColor: alpha(brandIA, 0.5) },
      '&.Mui-focused fieldset': {
        borderColor: brandIA,
        borderWidth: '1.5px',
        borderRadius: RIA,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(brandIA, 0.12)}`,
        borderRadius: RIA,
      },
    },
    '& .MuiInputLabel-root': {
      color: 'text.secondary',
      fontSize: '0.95rem',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: brandIA,
      fontWeight: 600,
    },
    '& .MuiSelect-select': {
      borderRadius: `${RIA} !important`,
      fontSize: '0.975rem',
      py: '12px !important',
    },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${RIA} !important` },
    '& .MuiFormHelperText-root': {
      fontSize: '0.825rem',
    },
  };

  // Acciones sobre preguntas
  const handleAgregarPregunta = (tipo: TipoPreguntaExamen = 'opcion_multiple') => {
    const nueva: PreguntaExamen = {
      id: -Date.now(),
      tipo,
      pregunta: '',
      opciones: tipo === 'opcion_multiple'
        ? ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4']
        : tipo === 'verdadero_falso'
          ? ['Verdadero', 'Falso']
          : null,
      respuesta_correcta: 0,
      respuesta_esperada: '',
      puntos: 1,
      requiere_archivo: false,
      orden: preguntas.length + 1,
      generado_por_ia: false,
    };
    onChange([...preguntas, nueva]);
  };

  const handleEliminarPregunta = (index: number) => {
    const act = preguntas.filter((_, i) => i !== index).map((p, i) => ({ ...p, orden: i + 1 }));
    onChange(act);
  };

  const handleMoverPregunta = (index: number, direccion: 'arriba' | 'abajo') => {
    const destino = direccion === 'arriba' ? index - 1 : index + 1;
    if (destino < 0 || destino >= preguntas.length) return;
    const nuevas = [...preguntas];
    const temp = nuevas[index];
    nuevas[index] = nuevas[destino];
    nuevas[destino] = temp;
    onChange(nuevas.map((p, i) => ({ ...p, orden: i + 1 })));
  };

  const handleActualizarCampo = (index: number, campo: keyof PreguntaExamen, valor: any) => {
    const nuevas = [...preguntas];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    onChange(nuevas);
  };

  const handleActualizarOpcion = (preguntaIndex: number, opcionIndex: number, texto: string) => {
    const nuevas = [...preguntas];
    const opciones = [...(nuevas[preguntaIndex].opciones || [])];
    opciones[opcionIndex] = texto;
    nuevas[preguntaIndex] = { ...nuevas[preguntaIndex], opciones };
    onChange(nuevas);
  };

  const handleAutoBalancear = () => {
    if (preguntas.length === 0) return;
    const puntosBase = Math.floor((puntajeMaximo / preguntas.length) * 10) / 10;
    let acumulado = 0;
    const actualizadas = preguntas.map((p, idx) => {
      let pts = puntosBase;
      if (idx === preguntas.length - 1) {
        pts = Math.round((puntajeMaximo - acumulado) * 10) / 10;
      } else {
        acumulado += pts;
      }
      return { ...p, puntos: Math.max(0.5, pts) };
    });
    onChange(actualizadas);
    toast.success('Puntos distribuidos equitativamente');
  };

  const handleEjecutarGeneracionIA = async () => {
    const tema = temaTituloIA.trim() || temaTituloDefault || 'Evaluación General';
    setGenerandoIA(true);
    try {
      const res = await examenService.generarIADirecto({
        tema_id: temaId,
        temaTitulo: tema,
        contenidoPersonalizado: contenidoExtra.trim() || undefined,
        cantidadOpcionMultiple: cantOpMult,
        cantidadVerdaderoFalso: cantVF,
        cantidadDesarrollo: cantDesarrollo,
      });

      if (res.data?.preguntas && res.data.preguntas.length > 0) {
        // Asignar puntos base
        const totalPreg = res.data.preguntas.length;
        const ptsPorPreg = Math.floor((puntajeMaximo / totalPreg) * 10) / 10;
        let acum = 0;
        const ajustadas = res.data.preguntas.map((p, idx) => {
          let pts = ptsPorPreg;
          if (idx === totalPreg - 1) pts = Math.round((puntajeMaximo - acum) * 10) / 10;
          else acum += pts;
          return { ...p, puntos: Math.max(0.5, pts) };
        });

        onChange(ajustadas);
        setModalIAOpen(false);
        toast.success(`¡Gemini generó ${totalPreg} preguntas exitosamente!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar preguntas con IA');
    } finally {
      setGenerandoIA(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ── Barra Superior de Acciones & IA ── */}
      <Paper sx={{
        p: 2.5, borderRadius: '14px',
        border: `1.5px solid ${alpha(accentColor, 0.3)}`,
        bgcolor: isDark ? alpha(accentColor, 0.05) : alpha(accentColor, 0.02),
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px',
              bgcolor: alpha(accentColor, 0.15), display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: accentColor,
            }}>
              <QuizIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
                Banco de Preguntas ({preguntas.length})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Configura los reactivos del examen o genera un set con Inteligencia Artificial
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setModalIAOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0ea975 0%, #047a5b 100%)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)',
                },
              }}
            >
              Generar con IA (Gemini)
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleAgregarPregunta('opcion_multiple')}
              sx={outlinedAddButtonSx(TIPO_COLORS.opcion_multiple)}
            >
              Opción Múltiple
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleAgregarPregunta('verdadero_falso')}
              sx={outlinedAddButtonSx(TIPO_COLORS.verdadero_falso)}
            >
              V / F
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleAgregarPregunta('desarrollo')}
              sx={outlinedAddButtonSx(TIPO_COLORS.desarrollo)}
            >
              Desarrollo
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleAgregarPregunta('respuesta_corta')}
              sx={outlinedAddButtonSx(TIPO_COLORS.respuesta_corta)}
            >
              Respuesta Corta
            </Button>
          </Stack>
        </Box>

        {/* ── Barra de Ponderación de Puntos ── */}
        <Box sx={{ mt: 2 }}>
          {preguntas.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: '10px', py: 0.5, fontSize: 13 }}>
              Aún no has agregado preguntas. Haz clic en <strong>Generar con IA</strong> o agrega una pregunta manualmente.
            </Alert>
          ) : !puntosCoinciden ? (
            <Alert
              severity="warning"
              action={
                <Button
                  color="warning"
                  size="small"
                  startIcon={<BalanceIcon />}
                  onClick={handleAutoBalancear}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                >
                  Auto-balancear
                </Button>
              }
              sx={{ borderRadius: '10px', py: 0.5, fontSize: 13 }}
            >
              Total acumulado: <strong>{puntajeTotal} pts</strong> (Puntaje meta de la evaluación: <strong>{puntajeMaximo} pts</strong>).
            </Alert>
          ) : (
            <Alert severity="success" sx={{ borderRadius: '10px', py: 0.5, fontSize: 13 }}>
              ✓ ¡Puntaje calibrado! La suma de las preguntas ({puntajeTotal} pts) coincide exactamente con el puntaje de la evaluación.
            </Alert>
          )}
        </Box>
      </Paper>

      {/* ── Lista de Preguntas ── */}
      <Stack spacing={2}>
        {preguntas.map((p, index) => {
          const colorTipo = TIPO_COLORS[p.tipo];
          return (
            <Paper
              key={p.id || index}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                p: 2.5,
                pl: 3,
                borderRadius: '14px',
                border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#ffffff',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  borderColor: alpha(colorTipo, isDark ? 0.45 : 0.35),
                  boxShadow: isDark
                    ? `0 4px 16px ${alpha('#000', 0.3)}`
                    : `0 4px 16px ${alpha('#000', 0.06)}`,
                },
                // Barrita de acento a la izquierda según el tipo de pregunta
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0, top: 0, bottom: 0,
                  width: 4,
                  bgcolor: colorTipo,
                },
              }}
            >
              {/* Header de la Pregunta */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: '8px',
                    bgcolor: alpha(colorTipo, 0.15), color: colorTipo,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 13,
                  }}>
                    {index + 1}
                  </Box>
                  <Chip
                    label={TIPO_LABELS[p.tipo]}
                    size="small"
                    sx={{
                      fontSize: 11, fontWeight: 700, height: 22,
                      bgcolor: alpha(colorTipo, 0.15),
                      color: colorTipo,
                    }}
                  />
                  {p.generado_por_ia && (
                    <Chip
                      icon={<AutoAwesomeIcon sx={{ fontSize: '12px !important' }} />}
                      label="IA"
                      size="small"
                      sx={{ fontSize: 10, height: 20, bgcolor: alpha('#8b5cf6', 0.15), color: '#8b5cf6', fontWeight: 700 }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TextField
                    label="Puntos"
                    type="number"
                    value={p.puntos}
                    onChange={e => handleActualizarCampo(index, 'puntos', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0.5, step: 0.5 }}
                    sx={{
                      width: 105, mr: 0.5,
                      '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.95rem', height: 44 },
                      '& .MuiInputLabel-root': { fontSize: '0.9rem' },
                    }}
                  />

                  <Tooltip title="Subir orden">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => handleMoverPregunta(index, 'arriba')}
                        sx={{
                          borderRadius: '8px', p: 0.8,
                          '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06) },
                        }}
                      >
                        <UpIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Bajar orden">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === preguntas.length - 1}
                        onClick={() => handleMoverPregunta(index, 'abajo')}
                        sx={{
                          borderRadius: '8px', p: 0.8,
                          '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06) },
                        }}
                      >
                        <DownIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Eliminar pregunta">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleEliminarPregunta(index)}
                      sx={{
                        borderRadius: '8px', p: 0.8,
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Enunciado */}
              <TextField
                label={`Enunciado de la pregunta ${index + 1} *`}
                multiline
                rows={2.5}
                fullWidth
                value={p.pregunta}
                onChange={e => handleActualizarCampo(index, 'pregunta', e.target.value)}
                placeholder="Escribe la consigna o pregunta clara para el estudiante..."
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.975rem', p: 1.5 },
                  '& .MuiInputLabel-root': { fontSize: '0.95rem' },
                }}
              />

              {/* Opciones según tipo */}
              {p.tipo === 'opcion_multiple' && p.opciones && (
                <Box sx={{ pl: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1.2, fontSize: '0.875rem' }}>
                    Opciones de respuesta (Marca el círculo de la opción CORRECTA):
                  </Typography>
                  <Stack spacing={1.2}>
                    {p.opciones.map((opcion, opcIdx) => (
                      <Box
                        key={opcIdx}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.2,
                          p: 0.8, borderRadius: '10px',
                          border: `1.5px solid ${p.respuesta_correcta === opcIdx
                            ? alpha('#10b981', 0.45)
                            : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                          bgcolor: p.respuesta_correcta === opcIdx
                            ? alpha('#10b981', isDark ? 0.08 : 0.04)
                            : 'transparent',
                        }}
                      >
                        <Radio
                          checked={p.respuesta_correcta === opcIdx}
                          onChange={() => handleActualizarCampo(index, 'respuesta_correcta', opcIdx)}
                          color="success"
                          size="medium"
                        />
                        <TextField
                          fullWidth
                          value={opcion}
                          onChange={e => handleActualizarOpcion(index, opcIdx, e.target.value)}
                          placeholder={`Opción ${opcIdx + 1}`}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px', fontSize: '0.95rem', minHeight: '44px',
                            },
                          }}
                        />
                        {p.respuesta_correcta === opcIdx && (
                          <CorrectIcon sx={{ fontSize: 20, color: '#10b981', flexShrink: 0, mr: 0.5 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {p.tipo === 'verdadero_falso' && (
                <Box sx={{ pl: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1.2, fontSize: '0.875rem' }}>
                    Respuesta correcta:
                  </Typography>
                  <Stack direction="row" spacing={3}>
                    <FormControlLabel
                      control={
                        <Radio
                          checked={p.respuesta_correcta === 0}
                          onChange={() => handleActualizarCampo(index, 'respuesta_correcta', 0)}
                          color="success"
                          size="medium"
                        />
                      }
                      label={<Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>Verdadero</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Radio
                          checked={p.respuesta_correcta === 1}
                          onChange={() => handleActualizarCampo(index, 'respuesta_correcta', 1)}
                          color="success"
                          size="medium"
                        />
                      }
                      label={<Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>Falso</Typography>}
                    />
                  </Stack>
                </Box>
              )}

              {p.tipo === 'desarrollo' && (
                <Box sx={{ pl: 0.5 }}>
                  <TextField
                    label="Respuesta esperada o guía de corrección (opcional, visible solo para el docente)"
                    multiline
                    rows={2.5}
                    fullWidth
                    value={p.respuesta_esperada || ''}
                    onChange={e => handleActualizarCampo(index, 'respuesta_esperada', e.target.value)}
                    placeholder="Aspectos clave que debe incluir la respuesta del alumno para obtener el puntaje completo..."
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.95rem', p: 1.5 },
                      '& .MuiInputLabel-root': { fontSize: '0.95rem' },
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(p.requiere_archivo)}
                        onChange={e => handleActualizarCampo(index, 'requiere_archivo', e.target.checked)}
                        size="medium"
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Permitir que el estudiante suba un archivo adjunto (foto de su hoja de cálculo o documento PDF)
                      </Typography>
                    }
                  />
                </Box>
              )}

              {p.tipo === 'respuesta_corta' && (
                <Box sx={{ pl: 0.5 }}>
                  <TextField
                    label="Respuesta correcta esperada"
                    fullWidth
                    value={p.respuesta_esperada || ''}
                    onChange={e => handleActualizarCampo(index, 'respuesta_esperada', e.target.value)}
                    placeholder="Ej: Mitocondria — se usa para comparar y autocorregir la respuesta del alumno"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.95rem', minHeight: '48px' },
                      '& .MuiInputLabel-root': { fontSize: '0.95rem' },
                    }}
                  />
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>

      {/* ── Modal de Generación con IA Gemini ── */}
      <Dialog
        open={modalIAOpen}
        onClose={() => !generandoIA && setModalIAOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: '650px !important',
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModalIA,
            border: `1.5px solid ${brandBorderIA}`,
            boxShadow: isDark
              ? `0 0 0 1px rgba(16,185,129,0.06), 0 32px 64px rgba(0,0,0,0.8)`
              : `0 32px 64px rgba(0,0,0,0.18)`,
          },
        }}
      >
        {/* ── HEADER ── */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderFieldIA}`, background: brandDimIA }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha(brandIA, 0.7),
                  mb: 0.4,
                }}
              >
                Generación asistida · Gemini
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                    background: alpha(brandIA, 0.15),
                    border: `1px solid ${alpha(brandIA, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <AutoAwesomeIcon sx={{ color: brandIA, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Generar preguntas con IA
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => !generandoIA && setModalIAOpen(false)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: generandoIA ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${borderFieldIA}`,
                color: 'text.secondary',
                opacity: generandoIA ? 0.4 : 1,
                transition: 'all 0.15s',
                '&:hover': generandoIA ? {} : { background: alpha(brandIA, 0.12), borderColor: alpha(brandIA, 0.4), color: brandIA },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* ── BODY ── */}
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack spacing={2.5}>
            {/* ── Si ya hay tema seleccionado ── */}
            {temaId ? (
              <Box sx={{
                p: 2, borderRadius: '12px',
                border: `1.5px solid ${alpha('#10b981', 0.25)}`,
                bgcolor: isDark ? alpha('#10b981', 0.05) : alpha('#10b981', 0.02),
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BookmarkIcon sx={{ fontSize: 18, color: '#10b981' }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#10b981', fontSize: 13 }}>
                    Tema curricular vinculado:
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={700} sx={{ pl: 0.5 }}>
                  {unidades?.flatMap(u => u.temas).find(t => t.tema_id === temaId)?.tema_titulo || temaTituloDefault || 'Tema seleccionado'}
                </Typography>
                <Box sx={{ pl: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: 11, lineHeight: 1.4 }}>
                    ✨ Gemini tomará automáticamente los contenidos, conceptos y explicaciones registradas en este tema para formular las preguntas. ¡No necesitas redactar nada más!
                  </Typography>
                </Box>
              </Box>
            ) : (!modoManual && unidades && unidades.length > 0) ? (
              /* ── Si NO hay tema seleccionado, permitir elegir del currículo directamente ── */
              <Box sx={{
                p: 2, borderRadius: '12px',
                border: `1.5px solid ${alpha('#10b981', 0.25)}`,
                bgcolor: isDark ? alpha('#10b981', 0.05) : alpha('#10b981', 0.02),
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BookmarkIcon sx={{ fontSize: 18, color: '#10b981' }} />
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#10b981', fontSize: 13 }}>
                      Vincular a un tema del plan curricular:
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => setModoManual(true)}
                    sx={{ fontSize: 12, textTransform: 'none', py: 0.2, px: 1, color: 'text.secondary' }}
                  >
                    Escribir tema manual
                  </Button>
                </Box>

                <FormControl fullWidth sx={fieldSxIA}>
                  <InputLabel>Selecciona el tema a evaluar</InputLabel>
                  <Select
                    value={temaId ?? ''}
                    label="Selecciona el tema a evaluar"
                    onChange={e => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      if (onSelectTemaId) onSelectTemaId(val);
                    }}
                  >
                    <MenuItem value=""><em>-- Seleccionar tema del currículo --</em></MenuItem>
                    {unidades.flatMap(u =>
                      u.temas.map(t => (
                        <MenuItem key={t.tema_id} value={t.tema_id}>
                          U{u.numero}: {u.titulo} → T{t.numero_tema}: {t.tema_titulo}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: 11.5 }}>
                  Al seleccionar un tema, Gemini usará su temario y contenido curricular automáticamente sin que tengas que escribirlo.
                </Typography>
              </Box>
            ) : (
              /* ── Modo manual o sin temario registrado ── */
              <Box>
                {unidades && unidades.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                    <Button
                      size="small"
                      onClick={() => setModoManual(false)}
                      sx={{ fontSize: 12, textTransform: 'none', py: 0.2, px: 1, color: '#10b981' }}
                    >
                      ← Elegir del temario de la materia
                    </Button>
                  </Box>
                )}
                <TextField
                  label="Tema o Contenido principal a evaluar *"
                  fullWidth
                  value={temaTituloIA}
                  onChange={e => setTemaTituloIA(e.target.value)}
                  placeholder="Ej: Ecuaciones de segundo grado, Leyes de Newton, etc."
                  sx={fieldSxIA}
                />
              </Box>
            )}

            <FormControl fullWidth sx={fieldSxIA}>
              <InputLabel>Nivel de dificultad pedagógica</InputLabel>
              <Select
                value={nivelDificultad}
                label="Nivel de dificultad pedagógica"
                onChange={e => setNivelDificultad(e.target.value)}
              >
                <MenuItem value="facil">Fácil (conceptos directos y definiciones)</MenuItem>
                <MenuItem value="medio">Medio (aplicación y análisis estándar)</MenuItem>
                <MenuItem value="dificil">Desafiante (razonamiento crítico y resolución compleja)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Opción Múltiple"
                type="number"
                value={cantOpMult}
                onChange={e => setCantOpMult(Math.max(0, parseInt(e.target.value) || 0))}
                inputProps={{ min: 0, max: 20 }}
                fullWidth
                sx={fieldSxIA}
              />
              <TextField
                label="Verdadero / Falso"
                type="number"
                value={cantVF}
                onChange={e => setCantVF(Math.max(0, parseInt(e.target.value) || 0))}
                inputProps={{ min: 0, max: 20 }}
                fullWidth
                sx={fieldSxIA}
              />
              <TextField
                label="Desarrollo"
                type="number"
                value={cantDesarrollo}
                onChange={e => setCantDesarrollo(Math.max(0, parseInt(e.target.value) || 0))}
                inputProps={{ min: 0, max: 10 }}
                fullWidth
                sx={fieldSxIA}
              />
            </Box>

            <TextField
              label="Indicaciones o énfasis adicional para Gemini (opcional)"
              multiline
              rows={2.5}
              fullWidth
              value={contenidoExtra}
              onChange={e => setContenidoExtra(e.target.value)}
              placeholder="Opcional: Si quieres que enfatice en alguna fórmula, autor o subtema específico..."
              helperText="Opcional. Si lo dejas vacío, Gemini utilizará todo el contenido registrado en el tema."
              sx={fieldSxIA}
            />
          </Stack>
        </DialogContent>

        {/* ── FOOTER ── */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderTop: `1px solid ${borderFieldIA}` }}>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => setModalIAOpen(false)}
            disabled={generandoIA}
            sx={{ borderRadius: '10px', color: 'text.secondary', px: 2.5, py: 1.2, textTransform: 'none', fontWeight: 600, fontSize: '0.925rem', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleEjecutarGeneracionIA}
            disabled={generandoIA || (!temaId && !temaTituloIA.trim() && !contenidoExtra.trim())}
            startIcon={generandoIA ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{
              borderRadius: '10px', px: 3.5, py: 1.3, fontWeight: 700, textTransform: 'none', fontSize: '0.975rem',
              background: brandIA, color: '#fff',
              boxShadow: `0 4px 16px ${alpha(brandIA, 0.4)}`,
              '&:hover': { background: '#0ea975', boxShadow: `0 6px 20px ${alpha(brandIA, 0.5)}` },
              '&.Mui-disabled': { opacity: 0.35, background: brandIA, color: '#fff' },
            }}
          >
            {generandoIA ? 'Generando con Gemini...' : 'Generar preguntas'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default EditorPreguntasExamen;