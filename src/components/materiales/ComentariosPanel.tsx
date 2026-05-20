'use client';
// components/materiales/detalle/ComentariosPanel.tsx

import React, { useState } from 'react';
import {
  Box, Typography, TextField, IconButton, Avatar, Chip,
  Button, alpha, CircularProgress, Collapse,
} from '@mui/material';
import {
  Send as SendIcon,
  HelpOutline as DudaIcon,
  CheckCircle as ResolvedIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useComentariosMaterial } from '@/hooks/useMaterial';
import { ComentarioMaterial } from '@/types/materialTypes';
import { useAuth } from '@/context/AuthContext';

interface ComentariosPanelProps {
  materialId: number;
  esDocente:  boolean;
  accent:     string;
  isDark:     boolean;
}

export const ComentariosPanel: React.FC<ComentariosPanelProps> = ({
  materialId, esDocente, accent, isDark,
}) => {
  const { user } = useAuth();
  const {
    comentarios, isLoading, isSubmitting,
    crear, actualizar, resolver, eliminar,
  } = useComentariosMaterial(materialId);

  const [texto, setTexto]           = useState('');
  const [esDuda, setEsDuda]         = useState(false);
  const [respondiendo, setRespondiendo] = useState<number | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEdicion, setTextoEdicion] = useState('');

  const enviar = async () => {
    if (!texto.trim()) return;
    const ok = await crear({ contenido: texto.trim(), es_duda: esDuda });
    if (ok) { setTexto(''); setEsDuda(false); }
  };

  const enviarRespuesta = async (padreId: number) => {
    if (!textoRespuesta.trim()) return;
    const ok = await crear({ contenido: textoRespuesta.trim(), comentario_padre_id: padreId });
    if (ok) { setRespondiendo(null); setTextoRespuesta(''); }
  };

  const guardarEdicion = async (id: number) => {
    if (!textoEdicion.trim()) return;
    const ok = await actualizar(id, textoEdicion.trim());
    if (ok) { setEditandoId(null); setTextoEdicion(''); }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
          Comentarios y dudas
        </Typography>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: '4px',
            bgcolor: alpha(accent, 0.1),
            color: accent,
            fontSize: '0.65rem',
            fontWeight: 700,
          }}
        >
          {comentarios.length}
        </Box>
      </Box>

      {/* Caja de nuevo comentario */}
      <Box
        sx={{
          p: 2,
          borderRadius: '10px',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          mb: 4,
        }}
      >
        <TextField
          fullWidth multiline maxRows={4} size="small"
          placeholder={esDuda ? '¿Qué duda tienes sobre este material?' : 'Escribe un comentario…'}
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) enviar(); }}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '0.85rem',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size="small"
            startIcon={<DudaIcon sx={{ fontSize: 14 }} />}
            onClick={() => setEsDuda(d => !d)}
            sx={{
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.72rem',
              color: esDuda ? accent : 'text.secondary',
              bgcolor: esDuda ? alpha(accent, 0.08) : 'transparent',
              '&:hover': { bgcolor: alpha(accent, 0.06) },
            }}
          >
            {esDuda ? 'Marcado como duda ✓' : 'Marcar como duda'}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
              Ctrl+Enter
            </Typography>
            <IconButton
              size="small"
              disabled={!texto.trim() || isSubmitting}
              onClick={enviar}
              sx={{
                width: 30,
                height: 30,
                borderRadius: '7px',
                bgcolor: accent,
                color: isDark ? '#000' : '#fff',
                '&:hover': { bgcolor: accentDark(accent, isDark) },
                '&.Mui-disabled': { bgcolor: alpha(accent, 0.25) },
              }}
            >
              {isSubmitting
                ? <CircularProgress size={12} color="inherit" />
                : <SendIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Lista de comentarios */}
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={22} sx={{ color: accent }} />
        </Box>
      ) : comentarios.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            borderRadius: '10px',
            border: `1px dashed ${alpha(accent, 0.15)}`,
          }}
        >
          <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.82rem' }}>
            Sé el primero en comentar o hacer una pregunta.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {comentarios.map(c => (
            <ComentarioItem
              key={c.id}
              comentario={c}
              currentUserId={user?.id}
              esDocente={esDocente}
              accent={accent}
              isDark={isDark}
              editandoId={editandoId}
              textoEdicion={textoEdicion}
              respondiendo={respondiendo}
              textoRespuesta={textoRespuesta}
              isSubmitting={isSubmitting}
              onIniciarEdicion={(c) => { setEditandoId(c.id); setTextoEdicion(c.contenido); }}
              onGuardarEdicion={guardarEdicion}
              onCancelarEdicion={() => setEditandoId(null)}
              onTextoEdicion={setTextoEdicion}
              onResponder={() => { setRespondiendo(c.id); setTextoRespuesta(''); }}
              onCancelarRespuesta={() => setRespondiendo(null)}
              onTextoRespuesta={setTextoRespuesta}
              onEnviarRespuesta={() => enviarRespuesta(c.id)}
              onResolver={() => resolver(c.id)}
              onEliminar={() => eliminar(c.id)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Helper para accentDark
const accentDark = (accent: string, isDark: boolean) =>
  isDark ? '#f59e0b' : '#01579b';

// ── Item individual ───────────────────────────────────────────────────────────

interface ComentarioItemProps {
  comentario:          ComentarioMaterial;
  currentUserId?:      number;
  esDocente:           boolean;
  accent:              string;
  isDark:              boolean;
  editandoId:          number | null;
  textoEdicion:        string;
  respondiendo:        number | null;
  textoRespuesta:      string;
  isSubmitting:        boolean;
  onIniciarEdicion:    (c: ComentarioMaterial) => void;
  onGuardarEdicion:    (id: number) => void;
  onCancelarEdicion:   () => void;
  onTextoEdicion:      (t: string) => void;
  onResponder:         () => void;
  onCancelarRespuesta: () => void;
  onTextoRespuesta:    (t: string) => void;
  onEnviarRespuesta:   () => void;
  onResolver:          () => void;
  onEliminar:          () => void;
}

const ComentarioItem: React.FC<ComentarioItemProps> = ({
  comentario, currentUserId, esDocente, accent, isDark,
  editandoId, textoEdicion, respondiendo, textoRespuesta, isSubmitting,
  onIniciarEdicion, onGuardarEdicion, onCancelarEdicion, onTextoEdicion,
  onResponder, onCancelarRespuesta, onTextoRespuesta, onEnviarRespuesta,
  onResolver, onEliminar,
}) => {
  const esMio   = comentario.usuario_id === currentUserId;
  const inicial = (comentario.autor_nombres?.[0] ?? '?').toUpperCase();

  const borderColor = comentario.es_duda
    ? (comentario.es_resuelto ? alpha('#16a34a', 0.25) : alpha('#f59e0b', 0.3))
    : (isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07));

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          borderRadius: '10px',
          border: `1px solid ${borderColor}`,
          bgcolor: comentario.es_duda
            ? (comentario.es_resuelto ? alpha('#16a34a', 0.03) : alpha('#f59e0b', 0.03))
            : (isDark ? alpha('#fff', 0.02) : 'transparent'),
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
          <Avatar
            sx={{
              width: 26,
              height: 26,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: esMio ? alpha(accent, 0.15) : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
              color: esMio ? accent : 'text.secondary',
            }}
          >
            {inicial}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>
                {comentario.autor_nombres} {comentario.autor_apellidos}
              </Typography>
              {esMio && (
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.1,
                    borderRadius: '3px',
                    bgcolor: alpha(accent, 0.1),
                    color: accent,
                    fontSize: '0.55rem',
                    fontWeight: 700,
                  }}
                >
                  TÚ
                </Box>
              )}
              {comentario.es_duda && (
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.1,
                    borderRadius: '3px',
                    bgcolor: comentario.es_resuelto ? alpha('#16a34a', 0.1) : alpha('#f59e0b', 0.1),
                    color: comentario.es_resuelto ? '#16a34a' : '#d97706',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                  }}
                >
                  {comentario.es_resuelto ? '✓ RESUELTA' : 'DUDA'}
                </Box>
              )}
            </Box>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
              {new Date(comentario.created_at).toLocaleDateString('es-ES', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
              {comentario.editado && ' · editado'}
            </Typography>
          </Box>

          {/* Acciones propias */}
          {esMio && (
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              <IconButton
                size="small"
                onClick={() => onIniciarEdicion(comentario)}
                sx={{ p: 0.4, opacity: 0.5, '&:hover': { opacity: 1 } }}
              >
                <EditIcon sx={{ fontSize: 13 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onEliminar}
                sx={{ p: 0.4, opacity: 0.4, color: 'error.main', '&:hover': { opacity: 1 } }}
              >
                <DeleteIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Contenido editable o normal */}
        {editandoId === comentario.id ? (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth multiline maxRows={3} size="small"
              value={textoEdicion}
              onChange={e => onTextoEdicion(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '7px', fontSize: '0.82rem' } }}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => onGuardarEdicion(comentario.id)}
                sx={{ bgcolor: accent, color: isDark ? '#000' : '#fff', width: 26, height: 26, borderRadius: '6px' }}
              >
                <CheckIcon sx={{ fontSize: 13 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onCancelarEdicion}
                sx={{ bgcolor: alpha('#000', 0.06), width: 26, height: 26, borderRadius: '6px' }}
              >
                <CloseIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Typography sx={{ fontSize: '0.83rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
            {comentario.contenido}
          </Typography>
        )}

        {/* Acciones */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1.25 }}>
          <Button
            size="small"
            startIcon={<ReplyIcon sx={{ fontSize: 12 }} />}
            onClick={onResponder}
            sx={{
              borderRadius: '5px', textTransform: 'none', fontWeight: 600, fontSize: '0.7rem',
              color: 'text.disabled', minWidth: 0,
              '&:hover': { bgcolor: alpha(accent, 0.06), color: accent },
            }}
          >
            Responder
          </Button>

          {esDocente && comentario.es_duda && !comentario.es_resuelto && (
            <Button
              size="small"
              startIcon={<ResolvedIcon sx={{ fontSize: 12, color: '#16a34a' }} />}
              onClick={onResolver}
              sx={{
                borderRadius: '5px', textTransform: 'none', fontWeight: 600,
                fontSize: '0.7rem', color: '#16a34a', minWidth: 0,
                '&:hover': { bgcolor: alpha('#16a34a', 0.06) },
              }}
            >
              Marcar resuelta
            </Button>
          )}
        </Box>

        {/* Box de respuesta inline */}
        <Collapse in={respondiendo === comentario.id}>
          <Box sx={{ mt: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth size="small"
              placeholder="Escribe tu respuesta…"
              value={textoRespuesta}
              onChange={e => onTextoRespuesta(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '7px', fontSize: '0.82rem' } }}
              autoFocus
            />
            <IconButton
              size="small"
              onClick={onCancelarRespuesta}
              sx={{ bgcolor: alpha('#000', 0.05), width: 30, height: 30, borderRadius: '7px' }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton
              size="small"
              disabled={!textoRespuesta.trim() || isSubmitting}
              onClick={onEnviarRespuesta}
              sx={{
                bgcolor: accent, color: isDark ? '#000' : '#fff',
                width: 30, height: 30, borderRadius: '7px',
                '&.Mui-disabled': { bgcolor: alpha(accent, 0.25) },
              }}
            >
              <SendIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Collapse>
      </Box>

      {/* Respuestas anidadas */}
      {(comentario.respuestas ?? []).length > 0 && (
        <Box
          sx={{
            ml: 3.5,
            mt: 0.75,
            pl: 1.5,
            borderLeft: `2px solid ${alpha(accent, 0.15)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          {(comentario.respuestas ?? []).map(r => (
            <Box
              key={r.id}
              sx={{
                p: 1.5,
                borderRadius: '8px',
                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Avatar
                  sx={{
                    width: 20, height: 20, fontSize: '0.58rem', fontWeight: 700,
                    bgcolor: alpha(accent, 0.1), color: accent,
                  }}
                >
                  {(r.autor_nombres?.[0] ?? '?').toUpperCase()}
                </Avatar>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>{r.autor_nombres}</Typography>
                <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled', ml: 'auto' }}>
                  {new Date(r.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', pl: '28px', lineHeight: 1.55, color: 'text.secondary' }}>
                {r.contenido}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ComentariosPanel;