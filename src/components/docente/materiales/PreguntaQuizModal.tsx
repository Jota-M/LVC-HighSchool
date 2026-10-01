'use client';
// components/docente/materiales/PreguntaQuizModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, Box, Typography, TextField, Radio, IconButton,
  alpha, Tooltip, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  HelpOutline as HelpIcon,
  EditNote as EditNoteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { QuizPreguntaCompleta, GuardarPreguntaQuizDTO } from '@/types/materialTypes';

interface PreguntaQuizModalProps {
  open: boolean;
  onClose: () => void;
  preguntaEditar: QuizPreguntaCompleta | null;
  onGuardar: (data: GuardarPreguntaQuizDTO) => Promise<boolean>;
  accent: string;
  isDark: boolean;
}

export const PreguntaQuizModal: React.FC<PreguntaQuizModalProps> = ({
  open, onClose, preguntaEditar, onGuardar, accent, isDark
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

  const [pregunta, setPregunta] = useState('');
  const [opciones, setOpciones] = useState<string[]>(['', '', '', '']);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(0);
  const [explicacion, setExplicacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esEdicion = !!preguntaEditar;

  useEffect(() => {
    if (preguntaEditar) {
      setPregunta(preguntaEditar.pregunta || '');
      setOpciones(preguntaEditar.opciones?.length >= 2 ? [...preguntaEditar.opciones] : ['', '', '', '']);
      setRespuestaCorrecta(preguntaEditar.respuesta_correcta ?? 0);
      setExplicacion(preguntaEditar.explicacion || '');
    } else {
      setPregunta('');
      setOpciones(['', '', '', '']);
      setRespuestaCorrecta(0);
      setExplicacion('');
    }
    setError(null);
  }, [preguntaEditar, open]);

  const handleCambiarOpcion = (idx: number, valor: string) => {
    setOpciones(prev => {
      const copy = [...prev];
      copy[idx] = valor;
      return copy;
    });
  };

  const handleAgregarOpcion = () => {
    if (opciones.length >= 6) return;
    setOpciones(prev => [...prev, '']);
  };

  const handleEliminarOpcion = (idx: number) => {
    if (opciones.length <= 2) return;
    setOpciones(prev => prev.filter((_, i) => i !== idx));
    if (respuestaCorrecta === idx) {
      setRespuestaCorrecta(0);
    } else if (respuestaCorrecta > idx) {
      setRespuestaCorrecta(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!pregunta.trim() || pregunta.trim().length < 3) {
      setError('Por favor ingresa un enunciado de al menos 3 caracteres.');
      return;
    }

    const opcionesLimpias = opciones.map(o => o.trim());
    if (opcionesLimpias.some(o => !o)) {
      setError('Ninguna de las opciones de respuesta puede estar vacía.');
      return;
    }

    if (opcionesLimpias.length < 2) {
      setError('Debes incluir al menos 2 opciones de respuesta.');
      return;
    }

    if (respuestaCorrecta < 0 || respuestaCorrecta >= opcionesLimpias.length) {
      setError('Debes marcar cuál es la opción correcta.');
      return;
    }

    setGuardando(true);
    try {
      const ok = await onGuardar({
        pregunta: pregunta.trim(),
        opciones: opcionesLimpias,
        respuesta_correcta: respuestaCorrecta,
        explicacion: explicacion.trim() || null,
      });
      if (ok) onClose();
    } finally {
      setGuardando(false);
    }
  };

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
              BANCO DE PREGUNTAS · CUESTIONARIO
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
                {esEdicion ? <EditNoteIcon sx={{ color: brand, fontSize: 22 }} /> : <AddIcon sx={{ color: brand, fontSize: 22 }} />}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1, color: 'text.primary' }}>
                {esEdicion ? 'Editar Pregunta del Quiz' : 'Añadir Nueva Pregunta'}
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
        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '0.8rem' }}>
            {error}
          </Alert>
        )}

        {/* Enunciado */}
        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 0.75 }}>
            Pregunta / Enunciado *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Ej: ¿Cuál es la función principal de los cloroplastos en la célula vegetal?"
            value={pregunta}
            onChange={e => setPregunta(e.target.value)}
            sx={fieldSx}
          />
        </Box>

        {/* Opciones de respuesta */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Opciones de respuesta *
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Marca con el botón circular cuál es la respuesta correcta para la corrección automática.
              </Typography>
            </Box>
            {opciones.length < 6 && (
              <Button
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                onClick={handleAgregarOpcion}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: brand,
                  border: `1px dashed ${alpha(brand, 0.35)}`,
                  '&:hover': { bgcolor: alpha(brand, 0.08) },
                }}
              >
                Agregar opción
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {opciones.map((opcion, idx) => {
              const esCorrecta = respuestaCorrecta === idx;
              return (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 0.75,
                    pl: 1,
                    borderRadius: '12px',
                    border: `1px solid ${esCorrecta ? alpha('#16a34a', 0.4) : borderField}`,
                    bgcolor: esCorrecta ? alpha('#16a34a', 0.06) : bgField,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Tooltip title={esCorrecta ? 'Opción correcta' : 'Marcar como opción correcta'}>
                    <Radio
                      checked={esCorrecta}
                      onChange={() => setRespuestaCorrecta(idx)}
                      value={idx}
                      color="success"
                      size="small"
                    />
                  </Tooltip>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
                    value={opcion}
                    onChange={e => handleCambiarOpcion(idx, e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        background: 'transparent',
                        fontSize: '0.84rem',
                      },
                    }}
                  />
                  <Tooltip title={opciones.length <= 2 ? 'Mínimo 2 opciones requeridas' : 'Eliminar opción'}>
                    <span>
                      <IconButton
                        size="small"
                        disabled={opciones.length <= 2}
                        onClick={() => handleEliminarOpcion(idx)}
                        sx={{ color: 'text.disabled', '&:hover': { color: '#dc2626' } }}
                      >
                        <DeleteIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Explicación pedagógica */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.6 }}>
            <HelpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
              Explicación pedagógica (Opcional)
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Explica brevemente por qué es la respuesta correcta para retroalimentar al alumno..."
            value={explicacion}
            onChange={e => setExplicacion(e.target.value)}
            sx={fieldSx}
          />
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
          {guardando ? 'Guardando…' : esEdicion ? 'Actualizar pregunta' : 'Añadir pregunta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreguntaQuizModal;
