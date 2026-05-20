'use client';
// components/prediccion/TabRecursosIA.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Autocomplete, TextField, Avatar,
  CircularProgress, Chip, Button, Divider,
  alpha, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Fade,
} from '@mui/material';
import { keyframes } from '@mui/system';

import AutoAwesomeRoundedIcon  from '@mui/icons-material/AutoAwesomeRounded';
import MenuBookRoundedIcon     from '@mui/icons-material/MenuBookRounded';
import SearchRoundedIcon       from '@mui/icons-material/SearchRounded';
import AddRoundedIcon          from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon       from '@mui/icons-material/DeleteRounded';
import CheckCircleRoundedIcon  from '@mui/icons-material/CheckCircleRounded';
import StarRoundedIcon         from '@mui/icons-material/StarRounded';
import OpenInNewRoundedIcon    from '@mui/icons-material/OpenInNewRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import LinkRoundedIcon         from '@mui/icons-material/LinkRounded';

import { EstudianteClase } from '@/types/prediccionTypes';
import { usePrediccionClase, usePrediccionEstudiante } from '@/hooks/usePrediccion';
import { materialAcademicoService } from '@/services/materialService';
import { MaterialAcademico } from '@/types/materialTypes';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

// ── Animaciones ───────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Tipos locales ─────────────────────────────────────────────
interface MaterialAsignado {
  id:                    number;
  material_id:           number;
  titulo:                string;
  descripcion?:          string | null;
  tipo_nombre:           string;
  tipo_codigo:           string;
  tipo_icono:            string;
  tipo_color:            string;
  url_archivo?:          string | null;
  url_externa?:          string | null;
  es_enlace_externo:     boolean;
  origen:                'gemini' | 'manual';
  mensaje_docente?:      string | null;
  visto_por_estudiante:  boolean;
  fecha_vista?:          string | null;
  created_at:            string;
}

// ── Helpers ───────────────────────────────────────────────────
function getInitials(nombre: string) {
  return nombre.split(',')[0].trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function buildSearchUrl(rec: { url?: string | null; search_query?: string | null; tipo?: string }): string | null {
  if (rec.url) return rec.url;
  if (!rec.search_query) return null;
  const q = encodeURIComponent(rec.search_query);
  // Videos → YouTube, resto → Google
  if (rec.tipo?.toUpperCase() === 'VIDEO') {
    return `https://www.youtube.com/results?search_query=${q}`;
  }
  return `https://www.google.com/search?q=${q}`;
}

function getIconEmoji(codigo?: string): string {
  if (!codigo) return '📄';
  const t = codigo.toUpperCase();
  if (t === 'PDF')   return '📕';
  if (t === 'VIDEO') return '🎬';
  if (t === 'PPT')   return '📊';
  if (t === 'DOC')   return '📝';
  if (t === 'LINK')  return '🔗';
  if (t === 'IMG')   return '🖼️';
  if (t === 'AUDIO') return '🎵';
  return '📄';
}

// ── Card de material asignado ─────────────────────────────────
const MaterialAsignadoCard: React.FC<{
  m:        MaterialAsignado;
  isDark:   boolean;
  accent:   string;
  onQuitar: (id: number) => void;
  quitando: number | null;
}> = ({ m, isDark, accent, onQuitar, quitando }) => {
  const urlVer = m.url_externa || m.url_archivo;

  return (
    <Box sx={{
      p:            1.5,
      borderRadius: '12px',
      border:       `1.5px solid ${m.origen === 'gemini' ? alpha('#f59e0b', 0.35) : alpha(accent, 0.25)}`,
      bgcolor:      m.origen === 'gemini'
        ? isDark ? alpha('#f59e0b', 0.05) : alpha('#fef9c3', 0.5)
        : isDark ? alpha(accent, 0.04) : alpha(accent, 0.03),
      display:      'flex',
      gap:          1.2,
      animation:    `${fadeUp} 0.2s ease-out`,
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
        bgcolor: alpha(m.tipo_color || accent, 0.12),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem',
      }}>
        {getIconEmoji(m.tipo_codigo)}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3, flexWrap: 'wrap' }}>
          <Typography variant="caption" fontWeight={700} noWrap sx={{ flex: 1, fontSize: 11 }}>
            {m.titulo}
          </Typography>
          {m.origen === 'gemini' && (
            <Chip size="small"
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '9px !important', color: '#f59e0b !important' }} />}
              label="Gemini"
              sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b' }}
            />
          )}
          {m.visto_por_estudiante && (
            <Chip size="small"
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '9px !important', color: '#16a34a !important' }} />}
              label="Visto"
              sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha('#16a34a', 0.1), color: '#16a34a' }}
            />
          )}
        </Box>

        {m.mensaje_docente && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontStyle: 'italic', display: 'block', mb: 0.3 }}>
            "{m.mensaje_docente}"
          </Typography>
        )}

        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
          Asignado {new Date(m.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
          {m.visto_por_estudiante && m.fecha_vista && ` · Visto ${new Date(m.fecha_vista).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}`}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, flexShrink: 0 }}>
        {urlVer && (
          <Tooltip title="Ver material">
            <IconButton size="small" href={urlVer} target="_blank" sx={{ p: 0.4, color: accent }}>
              <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Quitar asignación">
          <IconButton
            size="small"
            onClick={() => onQuitar(m.id)}
            disabled={quitando === m.id}
            sx={{ p: 0.4, color: 'text.disabled', '&:hover': { color: '#dc2626' } }}
          >
            {quitando === m.id
              ? <CircularProgress size={12} />
              : <DeleteRoundedIcon sx={{ fontSize: 14 }} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// ── Card de resultado de búsqueda ─────────────────────────────
const MaterialBusquedaCard: React.FC<{
  m:          MaterialAcademico;
  isDark:     boolean;
  accent:     string;
  yaAsignado: boolean;
  onAsignar:  (m: MaterialAcademico) => void;
  asignando:  number | null;
}> = ({ m, isDark, accent, yaAsignado, onAsignar, asignando }) => (
  <Box sx={{
    p:            1.5,
    borderRadius: '12px',
    border:       `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
    bgcolor:      yaAsignado ? alpha(accent, 0.04) : isDark ? alpha('#fff', 0.02) : '#fff',
    display:      'flex',
    gap:          1.2,
    alignItems:   'flex-start',
    opacity:      yaAsignado ? 0.7 : 1,
  }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
      bgcolor: alpha(m.tipo_material_color || accent, 0.12),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.9rem',
    }}>
      {m.tipo_material_icono || '📄'}
    </Box>

    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
        <Typography variant="caption" fontWeight={700} noWrap sx={{ flex: 1, fontSize: 11 }}>
          {m.titulo}
        </Typography>
        {m.es_destacado && <StarRoundedIcon sx={{ fontSize: 13, color: '#f59e0b', flexShrink: 0 }} />}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block' }}>
        {m.tipo_material_nombre} · {m.total_vistas} vistas
      </Typography>
      {m.descripcion && (
        <Typography variant="caption" color="text.disabled" sx={{
          fontSize: 10,
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {m.descripcion}
        </Typography>
      )}
    </Box>

    <Button
      size="small"
      variant={yaAsignado ? 'outlined' : 'contained'}
      disabled={yaAsignado || asignando === m.id}
      onClick={() => !yaAsignado && onAsignar(m)}
      startIcon={
        yaAsignado
          ? <CheckCircleRoundedIcon sx={{ fontSize: '12px !important' }} />
          : asignando === m.id
            ? <CircularProgress size={12} color="inherit" />
            : <AddRoundedIcon sx={{ fontSize: '12px !important' }} />
      }
      sx={{
        fontSize: '0.65rem', py: 0.4, px: 1, borderRadius: '8px',
        fontWeight: 700, flexShrink: 0, minWidth: 0,
        ...(yaAsignado
          ? { borderColor: alpha('#16a34a', 0.4), color: '#16a34a' }
          : { bgcolor: accent, color: isDark ? '#000' : '#fff', '&:hover': { bgcolor: alpha(accent, 0.85) } }),
      }}
    >
      {yaAsignado ? 'Asignado' : 'Asignar'}
    </Button>
  </Box>
);

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
interface TabRecursosIAProps {
  asignacionId: number;
  periodoId:    number;
  paraleloId:   number;
  accent:       string;
  isDark:       boolean;
}

const TabRecursosIA: React.FC<TabRecursosIAProps> = ({
  asignacionId, periodoId, paraleloId, accent, isDark,
}) => {
  const { estudiantes, analizar: cargarClase }                          = usePrediccionClase();
  const { analisis, predecir, limpiar, isLoading: analizando }          = usePrediccionEstudiante();

  const [seleccionado, setSeleccionado] = useState<EstudianteClase | null>(null);
  const [asignados, setAsignados]       = useState<MaterialAsignado[]>([]);
  const [loadingAsig, setLoadingAsig]   = useState(false);
  const [quitando, setQuitando]         = useState<number | null>(null);
  const [asignando, setAsignando]       = useState<number | null>(null);

  // Búsqueda manual
  const [busqueda, setBusqueda]   = useState('');
  const [resultados, setResultados] = useState<MaterialAcademico[]>([]);
  const [buscando, setBuscando]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dialog asignación con mensaje
  const [dlgMensaje, setDlgMensaje]               = useState(false);
  const [materialPendiente, setMaterialPendiente] = useState<MaterialAcademico | null>(null);
  const [mensajeDocente, setMensajeDocente]       = useState('');

  // Cargar lista de estudiantes
  useEffect(() => {
    if (estudiantes.length === 0) {
      cargarClase(
        { asignacion_docente_id: asignacionId, periodo_evaluacion_id: periodoId, paralelo_id: paraleloId },
        { incluirGemini: false },
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seleccionar estudiante
  const handleSeleccionar = useCallback(async (est: EstudianteClase | null) => {
    setSeleccionado(est);
    limpiar();
    setAsignados([]);
    setBusqueda('');
    setResultados([]);

    if (!est) return;

    predecir({
      matricula_id:          est.matricula_id,
      asignacion_docente_id: asignacionId,
      periodo_evaluacion_id: periodoId,
    }, { incluirGemini: true, silencioso: true });

    setLoadingAsig(true);
    try {
      const res = await api.get(
        `/prediccion/materiales-asignados/${est.matricula_id}?asignacion_docente_id=${asignacionId}`
      );
      setAsignados(res.data.data.materiales);
    } catch {
      setAsignados([]);
    } finally {
      setLoadingAsig(false);
    }
  }, [asignacionId, periodoId, limpiar, predecir]);

  // Búsqueda con debounce
  useEffect(() => {
    if (!busqueda.trim() || busqueda.length < 2) { setResultados([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await materialAcademicoService.buscar(busqueda, asignacionId);
        setResultados(res.data.materiales.slice(0, 8));
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 400);
  }, [busqueda, asignacionId]);

  // Asignar todos los sugeridos del repositorio
  const asignarDesdeGemini = useCallback(async () => {
    if (!seleccionado || !analisis?.recursos_sugeridos?.length) return;
    const idsReales = analisis.recursos_sugeridos
      .filter(r => r.material_id != null)
      .map(r => r.material_id!);
    if (!idsReales.length) {
      toast('Gemini no sugirió materiales del repositorio para este estudiante', { icon: 'ℹ️' });
      return;
    }
    try {
      await api.post('/prediccion/asignar-material', {
        material_ids:          idsReales,
        matricula_id:          seleccionado.matricula_id,
        asignacion_docente_id: asignacionId,
        origen:                'gemini',
      });
      toast.success(`${idsReales.length} material(es) asignados`);
      const res = await api.get(`/prediccion/materiales-asignados/${seleccionado.matricula_id}?asignacion_docente_id=${asignacionId}`);
      setAsignados(res.data.data.materiales);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al asignar materiales');
    }
  }, [seleccionado, analisis, asignacionId]);

  // Asignar un recurso individual del repositorio
  const asignarRecursoGemini = useCallback(async (materialId: number) => {
    if (!seleccionado) return;
    try {
      await api.post('/prediccion/asignar-material', {
        material_ids:          [materialId],
        matricula_id:          seleccionado.matricula_id,
        asignacion_docente_id: asignacionId,
        origen:                'gemini',
      });
      toast.success('Material asignado');
      const res = await api.get(`/prediccion/materiales-asignados/${seleccionado.matricula_id}?asignacion_docente_id=${asignacionId}`);
      setAsignados(res.data.data.materiales);
    } catch {
      toast.error('Error al asignar');
    }
  }, [seleccionado, asignacionId]);

  // Abrir dialog de asignación manual
  const handleIniciarAsignar = (m: MaterialAcademico) => {
    setMaterialPendiente(m);
    setMensajeDocente('');
    setDlgMensaje(true);
  };

  // Confirmar asignación manual
  const confirmarAsignar = useCallback(async () => {
    if (!materialPendiente || !seleccionado) return;
    setAsignando(materialPendiente.id);
    try {
      await api.post('/prediccion/asignar-material', {
        material_ids:          [materialPendiente.id],
        matricula_id:          seleccionado.matricula_id,
        asignacion_docente_id: asignacionId,
        origen:                'manual',
        mensaje_docente:       mensajeDocente.trim() || null,
      });
      toast.success(`"${materialPendiente.titulo}" asignado`);
      const res = await api.get(`/prediccion/materiales-asignados/${seleccionado.matricula_id}?asignacion_docente_id=${asignacionId}`);
      setAsignados(res.data.data.materiales);
      setDlgMensaje(false);
      setMaterialPendiente(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al asignar material');
    } finally {
      setAsignando(null);
    }
  }, [materialPendiente, seleccionado, asignacionId, mensajeDocente]);

  // Quitar asignación
  const handleQuitar = useCallback(async (id: number) => {
    setQuitando(id);
    try {
      await api.delete(`/prediccion/asignar-material/${id}`);
      setAsignados(prev => prev.filter(m => m.id !== id));
      toast.success('Asignación eliminada');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al quitar asignación');
    } finally {
      setQuitando(null);
    }
  }, []);

  // ── Datos derivados ───────────────────────────────────────
  const idsAsignados = new Set(asignados.map(a => a.material_id));

  // Recursos del repositorio (con material_id real)
  const recursosSugeridos = analisis?.recursos_sugeridos?.filter(r => r.material_id != null) ?? [];
  // Recursos externos sugeridos por Gemini (sin material_id)
  const recursosExternos  = analisis?.recursos_sugeridos?.filter(r => r.material_id == null) ?? [];

  const todosSugeridosAsignados =
    recursosSugeridos.length > 0 &&
    recursosSugeridos.every(r => idsAsignados.has(r.material_id!));

  return (
    <Box>

      {/* ── Selector de estudiante ── */}
      <Autocomplete
        options={estudiantes}
        getOptionLabel={e => e.nombre_completo}
        value={seleccionado}
        onChange={(_, val) => handleSeleccionar(val)}
        loading={estudiantes.length === 0}
        renderOption={(props, option) => {
          const nc = { bajo: '#16a34a', medio: '#d97706', alto: '#ea580c', critico: '#dc2626' }[option.nivel_riesgo] ?? '#6b7280';
          return (
            <Box component="li" {...props} sx={{ gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(nc, 0.15), color: nc, fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                {getInitials(option.nombre_completo)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={700}>{option.nombre_completo}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.nivel_riesgo} · {Math.round(option.probabilidad_reprobar * 100)}% riesgo
                </Typography>
              </Box>
            </Box>
          );
        }}
        renderInput={params => (
          <TextField
            {...params}
            label="Seleccioná un estudiante"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {estudiantes.length === 0 && <CircularProgress size={16} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{ mb: 3 }}
      />

      {/* ── Estado vacío ── */}
      {!seleccionado && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <PersonSearchRoundedIcon sx={{ fontSize: 56, opacity: 0.2, mb: 1 }} />
          <Typography variant="body2">Seleccioná un estudiante para gestionar sus recursos</Typography>
        </Box>
      )}

      {seleccionado && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, animation: `${fadeUp} 0.3s ease-out` }}>

          {/* ════ Columna izquierda ════ */}
          <Box>

            {/* ── Sugerencias del repositorio (Gemini) ── */}
            <Box sx={{
              p: 2, mb: 2, borderRadius: '14px',
              bgcolor: isDark ? alpha('#f59e0b', 0.06) : alpha('#fef9c3', 0.8),
              border: `1.5px solid ${alpha('#f59e0b', 0.3)}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <AutoAwesomeRoundedIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={800}>Sugerencias del repositorio</Typography>
                  {analizando && <CircularProgress size={12} sx={{ color: '#f59e0b' }} />}
                </Box>
                {recursosSugeridos.length > 0 && !todosSugeridosAsignados && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={asignarDesdeGemini}
                    startIcon={<AddRoundedIcon sx={{ fontSize: '12px !important' }} />}
                    sx={{
                      fontSize: '0.65rem', py: 0.3, px: 1, borderRadius: '8px', fontWeight: 700,
                      bgcolor: '#f59e0b', color: '#000', '&:hover': { bgcolor: alpha('#f59e0b', 0.85) },
                    }}
                  >
                    Asignar todos
                  </Button>
                )}
              </Box>

              {analizando && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  Analizando con IA…
                </Typography>
              )}

              {!analizando && recursosSugeridos.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  {analisis
                    ? 'Gemini no encontró materiales del repositorio para este estudiante.'
                    : 'El análisis se cargará automáticamente…'}
                </Typography>
              )}

              {!analizando && recursosSugeridos.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {recursosSugeridos.map((rec, i) => (
                    <Box key={i} sx={{
                      display: 'flex', gap: 1, p: 1.2, borderRadius: '10px',
                      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.8),
                      border: `1px solid ${alpha('#f59e0b', 0.15)}`,
                      alignItems: 'flex-start',
                    }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" fontWeight={700} display="block" sx={{ fontSize: 11 }}>
                          {rec.titulo}
                        </Typography>
                        {rec.tema_titulo && (
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                            📚 {rec.tema_titulo}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block' }}>
                          {rec.razon}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant={idsAsignados.has(rec.material_id!) ? 'outlined' : 'contained'}
                        disabled={idsAsignados.has(rec.material_id!)}
                        onClick={() => {
                          if (!idsAsignados.has(rec.material_id!)) {
                            asignarRecursoGemini(rec.material_id!);
                          }
                        }}
                        sx={{
                          fontSize: '0.6rem', py: 0.3, px: 0.8, borderRadius: '7px',
                          fontWeight: 700, flexShrink: 0, minWidth: 0,
                          ...(idsAsignados.has(rec.material_id!)
                            ? { borderColor: alpha('#16a34a', 0.4), color: '#16a34a' }
                            : { bgcolor: '#f59e0b', color: '#000' }),
                        }}
                      >
                        {idsAsignados.has(rec.material_id!) ? '✓' : 'Asignar'}
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* ── Recursos externos sugeridos por Gemini ── */}
            {!analizando && recursosExternos.length > 0 && (
              <Box sx={{
                p: 2, mb: 2, borderRadius: '14px',
                bgcolor: isDark ? alpha('#8b5cf6', 0.06) : alpha('#ede9fe', 0.6),
                border: `1.5px solid ${alpha('#8b5cf6', 0.3)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                  <LinkRoundedIcon sx={{ color: '#8b5cf6', fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={800}>Recursos externos recomendados</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    · No están en el repositorio
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {recursosExternos.map((rec, i) => (
                    <Box key={i} sx={{
                      display: 'flex', gap: 1, p: 1.2, borderRadius: '10px',
                      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.8),
                      border: `1px solid ${alpha('#8b5cf6', 0.15)}`,
                      alignItems: 'flex-start',
                    }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                          <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11, flex: 1 }}>
                            {rec.titulo}
                          </Typography>
                          <Chip
                            size="small"
                            label={rec.tipo}
                            sx={{
                              height: 16, fontSize: '0.55rem', fontWeight: 700, flexShrink: 0,
                              bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6',
                            }}
                          />
                        </Box>
                        {rec.tema_titulo && (
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                            📚 {rec.tema_titulo}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block' }}>
                          {rec.razon}
                        </Typography>
                      </Box>

                      {(() => {
  const searchUrl = buildSearchUrl(rec);
  return searchUrl ? (
    <Button
      size="small"
      variant="outlined"
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      startIcon={<OpenInNewRoundedIcon sx={{ fontSize: '11px !important' }} />}
      sx={{
        fontSize: '0.6rem', py: 0.3, px: 0.8, borderRadius: '7px',
        fontWeight: 700, flexShrink: 0, minWidth: 0,
        borderColor: alpha('#8b5cf6', 0.4), color: '#8b5cf6',
      }}
    >
      {rec.tipo?.toUpperCase() === 'VIDEO' ? 'Buscar en YouTube' : 'Buscar'}
    </Button>
  ) : null;
})()}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* ── Búsqueda manual ── */}
            <Box>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                BUSCAR EN EL REPOSITORIO
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar material por nombre…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {buscando
                        ? <CircularProgress size={14} />
                        : <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />}
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />

              {resultados.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {resultados.map(m => (
                    <MaterialBusquedaCard
                      key={m.id}
                      m={m}
                      isDark={isDark}
                      accent={accent}
                      yaAsignado={idsAsignados.has(m.id)}
                      onAsignar={handleIniciarAsignar}
                      asignando={asignando}
                    />
                  ))}
                </Box>
              )}

              {busqueda.length >= 2 && !buscando && resultados.length === 0 && (
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                  No se encontraron materiales con ese nombre en esta asignación.
                </Typography>
              )}
            </Box>
          </Box>

          {/* ════ Columna derecha: materiales asignados ════ */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" fontWeight={800} color="text.secondary">
                MATERIALES ASIGNADOS
              </Typography>
              <Chip
                size="small"
                label={`${asignados.length} total · ${asignados.filter(a => !a.visto_por_estudiante).length} sin ver`}
                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(accent, 0.1), color: accent }}
              />
            </Box>

            {loadingAsig && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress size={24} sx={{ color: accent }} />
              </Box>
            )}

            {!loadingAsig && asignados.length === 0 && (
              <Box sx={{
                textAlign: 'center', py: 5,
                borderRadius: '12px',
                border: `2px dashed ${alpha(accent, 0.2)}`,
              }}>
                <MenuBookRoundedIcon sx={{ fontSize: 36, color: alpha(accent, 0.3), mb: 1 }} />
                <Typography variant="caption" color="text.disabled" display="block">
                  Sin materiales asignados todavía.
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  Usá Gemini o buscá manualmente.
                </Typography>
              </Box>
            )}

            {!loadingAsig && asignados.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {asignados.filter(a => !a.visto_por_estudiante).map(m => (
                  <MaterialAsignadoCard
                    key={m.id} m={m} isDark={isDark} accent={accent}
                    onQuitar={handleQuitar} quitando={quitando}
                  />
                ))}

                {asignados.some(a => a.visto_por_estudiante) && (
                  <>
                    <Divider sx={{ my: 0.5 }}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>Vistos</Typography>
                    </Divider>
                    {asignados.filter(a => a.visto_por_estudiante).map(m => (
                      <MaterialAsignadoCard
                        key={m.id} m={m} isDark={isDark} accent={accent}
                        onQuitar={handleQuitar} quitando={quitando}
                      />
                    ))}
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ── Dialog: mensaje personalizado al asignar ── */}
      <Dialog
        open={dlgMensaje}
        onClose={() => setDlgMensaje(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '18px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
          Asignar material
          <Typography variant="caption" color="text.secondary" display="block">
            {materialPendiente?.titulo}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <TextField
            fullWidth multiline rows={2} size="small"
            label="Mensaje para el estudiante (opcional)"
            placeholder="Ej: Revisá este material antes del examen del viernes…"
            value={mensajeDocente}
            onChange={e => setMensajeDocente(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button
            onClick={() => setDlgMensaje(false)}
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarAsignar}
            variant="contained"
            disabled={asignando !== null}
            startIcon={asignando !== null ? <CircularProgress size={14} color="inherit" /> : <AddRoundedIcon />}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700,
              bgcolor: accent, color: isDark ? '#000' : '#fff',
            }}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TabRecursosIA;