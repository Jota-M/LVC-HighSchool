'use client';
// components/docente/inicial/CursoDocenteInicial.tsx
// Panel de Temario para Nivel Inicial — misma estructura visual que CursoDocente
// pero gestiona Campos de Saberes + Indicadores de Logro en lugar de Unidades/Temas.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, IconButton, Button, TextField,
  alpha, Dialog, DialogContent, DialogActions,
  Skeleton, Tooltip, List, ListItemButton, ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  DeleteForeverRounded as DeleteForeverIcon,
  SaveRounded as SaveIcon,
  MenuBookRounded as MenuBookIcon,
  SchoolRounded as SchoolIcon,
  RecordVoiceOverRounded as VoiceIcon,
  PsychologyRounded as BrainIcon,
  DirectionsRunRounded as MotorIcon,
  FavoriteRounded as HeartIcon,
  CloseRounded as CloseIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { inicialService } from '@/services/inicialService';
import { IndicadorLogro } from '@/types/inicialTypes';
import { AsignacionDocente } from '@/services/asistenciaService';

// ── Constantes de Campos de Saberes ──────────────────────────────────────────
const CAMPOS_ICONOS: Record<string, React.ReactElement> = {
  'INI-COM': <VoiceIcon sx={{ fontSize: 18 }} />,
  'INI-CON': <BrainIcon sx={{ fontSize: 18 }} />,
  'INI-BIO': <MotorIcon sx={{ fontSize: 18 }} />,
  'INI-SOC': <HeartIcon sx={{ fontSize: 18 }} />,
};

const CAMPOS_COLORES: Record<string, string> = {
  'INI-COM': '#6366F1',
  'INI-CON': '#0ea5e9',
  'INI-BIO': '#22c55e',
  'INI-SOC': '#f59e0b',
};

const CAMPOS_ORDEN = ['INI-COM', 'INI-CON', 'INI-BIO', 'INI-SOC'];

interface Campo {
  codigo: string;
  nombre: string;
  gmId: number;
  indicadores: IndicadorLogro[];
}

interface CursoDocenteInicialProps {
  asignacion: AsignacionDocente;
  accent: string;
  accentDark: string;
  isDark: boolean;
}

// ─── Sub-componente: ítem de indicador ───────────────────────────────────────
interface IndicadorItemProps {
  indicador: IndicadorLogro;
  accentCampo: string;
  isDark: boolean;
  onEditar: (ind: IndicadorLogro) => void;
  onEliminar: (ind: IndicadorLogro) => void;
}

const IndicadorItem: React.FC<IndicadorItemProps> = ({
  indicador, accentCampo, isDark, onEditar, onEliminar,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      p: 2,
      borderRadius: '14px',
      border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.07)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: alpha(accentCampo, 0.35),
        bgcolor: isDark ? alpha(accentCampo, 0.06) : alpha(accentCampo, 0.04),
        '& .ind-actions': { opacity: 1 },
      },
    }}
  >
    <Box
      sx={{
        minWidth: 28, height: 28, borderRadius: '8px',
        bgcolor: alpha(accentCampo, 0.12),
        border: `1px solid ${alpha(accentCampo, 0.25)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, mt: 0.2,
      }}
    >
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: accentCampo }}>
        {indicador.orden}
      </Typography>
    </Box>

    <Typography sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5, color: 'text.primary' }}>
      {indicador.descripcion}
    </Typography>

    <Box className="ind-actions" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
      <Tooltip title="Editar indicador">
        <IconButton size="small" onClick={() => onEditar(indicador)}
          sx={{ borderRadius: '8px', color: accentCampo, '&:hover': { bgcolor: alpha(accentCampo, 0.12) } }}>
          <EditIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar indicador">
        <IconButton size="small" onClick={() => onEliminar(indicador)}
          sx={{ borderRadius: '8px', color: 'error.main', '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }}>
          <DeleteIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const CursoDocenteInicial: React.FC<CursoDocenteInicialProps> = ({
  asignacion, accent, accentDark, isDark,
}) => {
  const brand = accent;
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R, background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  const [campos, setCampos] = useState<Campo[]>([]);
  const [campoActivoIdx, setCampoActivoIdx] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [dlgInd, setDlgInd] = useState(false);
  const [indEdit, setIndEdit] = useState<IndicadorLogro | null>(null);
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [dlgEliminar, setDlgEliminar] = useState<IndicadorLogro | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarIndicadores = useCallback(async () => {
    setLoading(true);
    try {
      const indicadores = await inicialService.getIndicadores({ gradoId: asignacion.grado_id });
      const map = new Map<string, Campo>();
      for (const ind of indicadores) {
        const cod = ind.campo_codigo || 'CAMPO';
        if (!map.has(cod)) {
          map.set(cod, { codigo: cod, nombre: ind.campo_nombre || 'Campo de Desarrollo', gmId: ind.grado_materia_id, indicadores: [] });
        }
        map.get(cod)!.indicadores.push(ind);
      }
      const ordenados: Campo[] = CAMPOS_ORDEN.filter((c) => map.has(c)).map((c) => map.get(c)!);
      for (const [cod, campo] of map.entries()) {
        if (!CAMPOS_ORDEN.includes(cod)) ordenados.push(campo);
      }
      ordenados.forEach((c) => { c.indicadores.sort((a, b) => a.orden - b.orden); });
      setCampos(ordenados);
    } catch (err: any) {
      toast.error('Error al cargar indicadores de logro');
    } finally {
      setLoading(false);
    }
  }, [asignacion.grado_id]);

  useEffect(() => { cargarIndicadores(); }, [cargarIndicadores]);

  const campoActual = campos[campoActivoIdx] ?? null;
  const accentCampo = CAMPOS_COLORES[campoActual?.codigo ?? ''] ?? brand;

  const abrirNuevoIndicador = () => {
    if (!campoActual) return;
    setIndEdit(null); setFormDesc(''); setDlgInd(true);
  };

  const abrirEditarIndicador = (ind: IndicadorLogro) => {
    setIndEdit(ind); setFormDesc(ind.descripcion); setDlgInd(true);
  };

  const guardarIndicador = async () => {
    if (!formDesc.trim() || !campoActual) return;
    setSubmitting(true);
    try {
      if (indEdit) {
        await inicialService.actualizarIndicador(indEdit.id, { descripcion: formDesc.trim() });
        toast.success('Indicador actualizado');
      } else {
        const siguienteOrden = campoActual.indicadores.length > 0
          ? Math.max(...campoActual.indicadores.map((i) => i.orden)) + 1 : 1;
        await inicialService.crearIndicador({ grado_materia_id: campoActual.gmId, descripcion: formDesc.trim(), orden: siguienteOrden });
        toast.success('Indicador creado');
      }
      setDlgInd(false);
      await cargarIndicadores();
    } catch (err) { toast.error('Error al guardar el indicador'); }
    finally { setSubmitting(false); }
  };

  const confirmarEliminar = async () => {
    if (!dlgEliminar) return;
    setEliminando(true);
    try {
      await inicialService.eliminarIndicador(dlgEliminar.id);
      toast.success('Indicador eliminado');
      setDlgEliminar(null);
      await cargarIndicadores();
    } catch (err) { toast.error('Error al eliminar el indicador'); }
    finally { setEliminando(false); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: { xs: 'stretch', md: 'flex-start' } }}>
      {/* BARRA LATERAL: CAMPOS DE SABERES */}
      <Box sx={{
        width: { xs: '100%', md: 340 }, flexShrink: 0, borderRadius: '18px',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
        overflow: 'hidden', position: { xs: 'static', md: 'sticky' }, top: 24,
      }}>
        {/* Header lateral */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 2,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          bgcolor: isDark ? alpha(brand, 0.06) : alpha(brand, 0.03),
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '9px',
              bgcolor: alpha(brand, 0.12), border: `1px solid ${alpha(brand, 0.25)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MenuBookIcon sx={{ fontSize: 17, color: brand }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
                Campos de Saberes
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontWeight: 600 }}>
                {campos.length} {campos.length === 1 ? 'campo' : 'campos'} curriculares
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Lista de campos */}
        {loading ? (
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: '12px' }} />)}
          </Box>
        ) : campos.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 40, color: alpha(brand, 0.3), mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
              No hay campos de saberes disponibles.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              Contacta con administración para configurar los campos curriculares.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ p: 1.2 }}>
            {campos.map((campo, idx) => {
              const isActive = idx === campoActivoIdx;
              const colorCampo = CAMPOS_COLORES[campo.codigo] ?? brand;
              const iconoCampo = CAMPOS_ICONOS[campo.codigo] ?? <MenuBookIcon sx={{ fontSize: 18 }} />;
              return (
                <ListItemButton key={campo.codigo} selected={isActive} onClick={() => setCampoActivoIdx(idx)}
                  sx={{
                    borderRadius: '12px', mb: 0.5, px: 1.5, py: 1.2, transition: 'all 0.2s',
                    '&.Mui-selected': {
                      bgcolor: alpha(colorCampo, isDark ? 0.2 : 0.1),
                      border: `1px solid ${alpha(colorCampo, 0.3)}`,
                      '&:hover': { bgcolor: alpha(colorCampo, isDark ? 0.25 : 0.12) },
                    },
                    '&:hover': { bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) },
                  }}
                >
                  <Box sx={{
                    width: 30, height: 30, borderRadius: '8px',
                    bgcolor: isActive ? alpha(colorCampo, 0.2) : alpha(colorCampo, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, mr: 1.5, color: colorCampo,
                    border: isActive ? `1px solid ${alpha(colorCampo, 0.4)}` : 'none',
                  }}>
                    {iconoCampo}
                  </Box>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: isActive ? 800 : 600, color: isActive ? colorCampo : 'text.primary', lineHeight: 1.2 }}>
                        {campo.nombre}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontWeight: 500 }}>
                        {campo.indicadores.length} indicador{campo.indicadores.length !== 1 ? 'es' : ''}
                      </Typography>
                    }
                  />
                  <Chip label={campo.codigo} size="small" sx={{
                    height: 18, fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700,
                    bgcolor: isActive ? alpha(colorCampo, 0.2) : alpha(colorCampo, 0.1),
                    color: colorCampo, border: `1px solid ${alpha(colorCampo, 0.25)}`,
                  }} />
                </ListItemButton>
              );
            })}
          </List>
        )}

        {/* Footer informativo */}
        <Box sx={{
          px: 2.5, py: 1.5,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          bgcolor: isDark ? alpha('#fff', 0.01) : alpha('#000', 0.01),
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <InfoIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.66rem', color: 'text.disabled', fontWeight: 600 }}>
              Nivel Inicial — Evaluacion Cualitativa
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* AREA PRINCIPAL: INDICADORES DEL CAMPO ACTIVO */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: '18px' }} />
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: '14px' }} />)}
          </Box>
        ) : !campoActual ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 2, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary" fontWeight={700}>Sin campos configurados</Typography>
            <Typography variant="body2" color="text.disabled">Contacta administracion para activar los campos curriculares de Inicial.</Typography>
          </Box>
        ) : (
          <>
            {/* Header del campo activo */}
            <Box sx={{
              borderRadius: '18px', border: `1px solid ${alpha(accentCampo, 0.25)}`,
              bgcolor: isDark ? alpha(accentCampo, 0.07) : alpha(accentCampo, 0.04),
              p: { xs: 2, sm: 2.5 }, mb: 2.5,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 46, height: 46, borderRadius: '13px',
                  bgcolor: alpha(accentCampo, 0.15), border: `2px solid ${alpha(accentCampo, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: accentCampo, flexShrink: 0,
                }}>
                  {CAMPOS_ICONOS[campoActual.codigo] ?? <MenuBookIcon />}
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'text.primary', lineHeight: 1.2 }}>
                      {campoActual.nombre}
                    </Typography>
                    <Chip label={campoActual.codigo} size="small" sx={{
                      height: 20, fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 800,
                      bgcolor: alpha(accentCampo, 0.15), color: accentCampo, border: `1px solid ${alpha(accentCampo, 0.3)}`,
                    }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.3, fontWeight: 500 }}>
                    {campoActual.indicadores.length > 0
                      ? `${campoActual.indicadores.length} indicador${campoActual.indicadores.length !== 1 ? 'es' : ''} de logro definido${campoActual.indicadores.length !== 1 ? 's' : ''}`
                      : 'Sin indicadores aun — agrega el primero'}
                  </Typography>
                </Box>
              </Box>
              <Button size="small" startIcon={<AddIcon sx={{ fontSize: 15 }} />} onClick={abrirNuevoIndicador}
                sx={{
                  borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', py: 0.7, px: 1.8,
                  background: `linear-gradient(135deg, ${accentCampo}, ${accentCampo})`,
                  color: '#fff', boxShadow: `0 2px 8px ${alpha(accentCampo, 0.35)}`,
                  '&:hover': { opacity: 0.88 }, flexShrink: 0,
                }}>
                Agregar Indicador
              </Button>
            </Box>

            {/* Lista de indicadores */}
            {campoActual.indicadores.length === 0 ? (
              <Box sx={{
                borderRadius: '18px', border: `1px dashed ${alpha(accentCampo, 0.3)}`,
                bgcolor: isDark ? alpha(accentCampo, 0.03) : alpha(accentCampo, 0.02),
                p: { xs: 4, sm: 6 }, textAlign: 'center',
              }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: '16px',
                  bgcolor: alpha(accentCampo, 0.1), border: `2px solid ${alpha(accentCampo, 0.2)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: accentCampo, mx: 'auto', mb: 2,
                }}>
                  {CAMPOS_ICONOS[campoActual.codigo] ?? <MenuBookIcon sx={{ fontSize: 28 }} />}
                </Box>
                <Typography variant="body1" fontWeight={700} color="text.secondary" gutterBottom>Sin indicadores de logro</Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 2.5, maxWidth: 360, mx: 'auto' }}>
                  Agrega los criterios de evaluacion que usaras para observar el desarrollo de los ninos en este campo.
                </Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={abrirNuevoIndicador}
                  sx={{
                    borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                    borderColor: alpha(accentCampo, 0.4), color: accentCampo,
                    '&:hover': { borderColor: accentCampo, bgcolor: alpha(accentCampo, 0.08) },
                  }}>
                  Crear primer indicador
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {campoActual.indicadores.map((ind) => (
                  <IndicadorItem key={ind.id} indicador={ind} accentCampo={accentCampo} isDark={isDark}
                    onEditar={abrirEditarIndicador} onEliminar={(i) => setDlgEliminar(i)} />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* DIALOG: CREAR / EDITAR INDICADOR */}
      <Dialog open={dlgInd} onClose={() => !submitting && setDlgInd(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: {
          borderRadius: '20px', bgcolor: isDark ? '#0d1117' : '#fff',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        }}}>
        <Box sx={{
          px: 3, py: 2.5,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              bgcolor: alpha(accentCampo, 0.15), border: `1px solid ${alpha(accentCampo, 0.3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentCampo,
            }}>
              {indEdit ? <EditIcon sx={{ fontSize: 18 }} /> : <AddIcon sx={{ fontSize: 18 }} />}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.1 }}>
                {indEdit ? 'Editar Indicador' : 'Nuevo Indicador de Logro'}
              </Typography>
              {campoActual && (
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, mt: 0.2 }}>
                  {campoActual.nombre}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={() => !submitting && setDlgInd(false)}
            sx={{ borderRadius: '8px', color: 'text.secondary' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <TextField
            label="Descripcion del indicador"
            placeholder="Ej: El nino/a identifica y nombra colores primarios..."
            value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
            multiline minRows={3} maxRows={7} fullWidth autoFocus sx={fieldSx}
            inputProps={{ maxLength: 500 }}
            helperText={`${formDesc.length}/500 caracteres`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`, gap: 1 }}>
          <Button variant="text" onClick={() => !submitting && setDlgInd(false)} disabled={submitting}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardarIndicador} disabled={!formDesc.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2.5,
              background: `linear-gradient(135deg, ${accentCampo}, ${accentCampo})`,
              color: '#fff', boxShadow: `0 2px 8px ${alpha(accentCampo, 0.35)}`,
              '&:hover': { opacity: 0.9 }, '&:disabled': { opacity: 0.5 },
            }}>
            {submitting ? 'Guardando...' : (indEdit ? 'Actualizar' : 'Crear Indicador')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: CONFIRMAR ELIMINACION */}
      <Dialog open={!!dlgEliminar} onClose={() => !eliminando && setDlgEliminar(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: {
          borderRadius: '20px', bgcolor: isDark ? '#0d1117' : '#fff',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#ef4444', 0.15)}`,
        }}}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              bgcolor: alpha('#ef4444', 0.12), border: `1px solid ${alpha('#ef4444', 0.3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444',
            }}>
              <DeleteForeverIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Eliminar indicador?</Typography>
          </Box>
        </Box>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Estas a punto de eliminar el siguiente indicador de logro:
          </Typography>
          {dlgEliminar && (
            <Box sx={{
              p: 1.5, borderRadius: '10px',
              bgcolor: isDark ? alpha('#ef4444', 0.07) : alpha('#ef4444', 0.04),
              border: `1px solid ${alpha('#ef4444', 0.2)}`,
            }}>
              <Typography variant="body2" fontWeight={600} sx={{ fontStyle: 'italic' }}>
                "{dlgEliminar.descripcion}"
              </Typography>
            </Box>
          )}
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1.5, fontWeight: 600 }}>
            Esta accion eliminara tambien los registros de cotejo asociados y no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`, gap: 1 }}>
          <Button variant="text" onClick={() => !eliminando && setDlgEliminar(null)} disabled={eliminando}
            startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={confirmarEliminar} disabled={eliminando}
            startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : <DeleteForeverIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2.5,
              bgcolor: '#ef4444', color: '#fff', '&:hover': { bgcolor: '#dc2626' }, '&:disabled': { opacity: 0.5 },
            }}>
            {eliminando ? 'Eliminando...' : 'Si, eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CursoDocenteInicial;
