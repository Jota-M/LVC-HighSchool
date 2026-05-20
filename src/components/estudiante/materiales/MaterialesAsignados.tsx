'use client';
// components/estudiante/materiales/MaterialesAsignados.tsx
//
// Sección dentro de EstudianteMateriales que muestra
// los materiales que el docente asignó desde el panel de predicción IA.
// v2.0 — soporta materiales internos (repositorio) y externos (Gemini/web)

import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Chip, Button, alpha, useTheme,
  CircularProgress, Alert, Divider,
  Badge, Fade,
} from '@mui/material';
import { keyframes } from '@mui/system';

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MenuBookRoundedIcon    from '@mui/icons-material/MenuBookRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import OpenInNewRoundedIcon   from '@mui/icons-material/OpenInNewRounded';
import StarRoundedIcon        from '@mui/icons-material/StarRounded';
import SchoolRoundedIcon      from '@mui/icons-material/SchoolRounded';
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded';

import { estudianteService } from '@/services/estudianteService';
import { toast } from 'react-hot-toast';

// ── Animaciones ───────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.15); }
`;

// ── Tipos ─────────────────────────────────────────────────────
interface MaterialAsignadoEstudiante {
  id:                      number;
  material_id:             number | null;       // null para recursos externos
  codigo_material:         string | null;
  titulo:                  string | null;        // null para externos
  titulo_final:            string;              // NUEVO: siempre tiene valor (COALESCE backend)
  descripcion?:            string | null;
  tipo_nombre:             string | null;
  tipo_codigo:             string | null;
  tipo_icono:              string | null;
  tipo_color:              string | null;
  url_archivo?:            string | null;
  url_externa?:            string | null;
  url_final:               string | null;       // NUEVO: url unificada
  es_enlace_externo:       boolean;
  es_destacado:            boolean;
  origen:                  'gemini' | 'manual' | 'automatico' | 'web_search';
  tipo_recurso:            'interno' | 'externo'; // NUEVO
  url_recurso_externo?:    string | null;       // NUEVO
  titulo_recurso_externo?: string | null;       // NUEVO
  origen_externo?:         string | null;       // NUEVO: 'youtube'|'khan_academy'|'web'
  mensaje_docente?:        string | null;
  visto_por_estudiante:    boolean;
  fecha_vista?:            string | null;
  materia_nombre:          string;
  materia_codigo:          string;
  docente_nombres:         string;
  docente_apellido:        string;
  asignacion_docente_id:   number;
  created_at:              string;
}

// ── Hook ──────────────────────────────────────────────────────
export function useMaterialesAsignados() {
  const [materiales, setMateriales] = useState<MaterialAsignadoEstudiante[]>([]);
  const [total, setTotal]           = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [marcando, setMarcando]     = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await estudianteService.getMaterialesAsignados();
      setMateriales(res.data.materiales);
      setTotal(res.data.total);
      setPendientes(res.data.pendientes);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar materiales asignados');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const marcarVisto = useCallback(async (id: number) => {
    setMarcando(id);
    try {
      await estudianteService.marcarMaterialVisto(id);
      setMateriales(prev => prev.map(m =>
        m.id === id ? { ...m, visto_por_estudiante: true, fecha_vista: new Date().toISOString() } : m
      ));
      setPendientes(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Error al marcar como visto');
    } finally {
      setMarcando(null);
    }
  }, []);

  return { materiales, total, pendientes, isLoading, error, marcando, cargar, marcarVisto };
}

// ── Helpers ───────────────────────────────────────────────────
function getIconEmoji(codigo?: string): string {
  const t = (codigo ?? '').toUpperCase();
  if (t === 'PDF')   return '📕';
  if (t === 'VIDEO') return '🎬';
  if (t === 'PPT')   return '📊';
  if (t === 'DOC')   return '📝';
  if (t === 'LINK')  return '🔗';
  if (t === 'IMG')   return '🖼️';
  if (t === 'AUDIO') return '🎵';
  return '📄';
}

function getIconoExterno(origenExterno?: string | null): string {
  if (origenExterno === 'youtube')      return '🎬';
  if (origenExterno === 'khan_academy') return '📐';
  return '🔗';
}

function esOrigenIA(origen: string): boolean {
  return origen === 'gemini' || origen === 'web_search' || origen === 'automatico';
}

// ── Card de material asignado ─────────────────────────────────
const MaterialCard: React.FC<{
  m:        MaterialAsignadoEstudiante;
  accent:   string;
  isDark:   boolean;
  onMarcar: (id: number) => void;
  marcando: number | null;
  index:    number;
}> = ({ m, accent, isDark, onMarcar, marcando, index }) => {
  const esNuevo = !m.visto_por_estudiante;
  const esIA    = esOrigenIA(m.origen);

  // Título siempre disponible
  const titulo = m.titulo_final ?? m.titulo ?? m.titulo_recurso_externo ?? 'Recurso externo';

  // Color de borde/fondo según estado y origen
  const borderColor = esNuevo
    ? esIA ? alpha('#f59e0b', 0.45) : alpha(accent, 0.45)
    : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07);

  const bgColor = esNuevo
    ? esIA
      ? isDark ? alpha('#f59e0b', 0.07) : alpha('#fef9c3', 0.6)
      : isDark ? alpha(accent, 0.06)    : alpha(accent, 0.04)
    : isDark ? alpha('#fff', 0.02) : '#fff';

  return (
    <Box sx={{
      p:            2,
      borderRadius: '16px',
      border:       `1.5px solid ${borderColor}`,
      bgcolor:      bgColor,
      transition:   'transform 0.15s, box-shadow 0.15s',
      animation:    `${fadeUp} 0.3s ease-out ${index * 0.05}s both`,
      '&:hover': {
        transform:  'translateY(-2px)',
        boxShadow:  `0 6px 20px ${alpha(esNuevo ? accent : '#6b7280', 0.15)}`,
      },
    }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>

        {/* Icono con badge de "nuevo" */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            bgcolor: alpha(m.tipo_color || accent, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
          }}>
            {m.tipo_recurso === 'externo'
              ? getIconoExterno(m.origen_externo)
              : getIconEmoji(m.tipo_codigo ?? undefined)
            }
          </Box>
          {esNuevo && (
            <Box sx={{
              position: 'absolute', top: -4, right: -4,
              width: 12, height: 12, borderRadius: '50%',
              bgcolor: esIA ? '#f59e0b' : accent,
              animation: `${pulse} 2s ease-in-out infinite`,
              border: `2px solid ${isDark ? '#1e1e2e' : '#fff'}`,
            }} />
          )}
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Badges */}
          <Box sx={{ display: 'flex', gap: 0.6, mb: 0.5, flexWrap: 'wrap' }}>
            {esIA && (
              <Chip
                size="small"
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '9px !important', color: '#f59e0b !important' }} />}
                label="Sugerido por IA"
                sx={{
                  height: 18, fontSize: '0.6rem', fontWeight: 700,
                  bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b',
                }}
              />
            )}
            {/* Badge de origen externo */}
            {m.tipo_recurso === 'externo' && m.origen_externo && (
              <Chip
                size="small"
                label={
                  m.origen_externo === 'khan_academy' ? 'Khan Academy'
                  : m.origen_externo === 'youtube'    ? 'YouTube'
                  : 'Web'
                }
                sx={{
                  height: 18, fontSize: '0.6rem', fontWeight: 600,
                  bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6',
                }}
              />
            )}
            <Chip
              size="small"
              label={m.materia_nombre}
              sx={{
                height: 18, fontSize: '0.6rem', fontWeight: 600,
                bgcolor: alpha(accent, 0.1), color: accent,
              }}
            />
            {m.es_destacado && (
              <StarRoundedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
            )}
          </Box>

          {/* Título */}
          <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3, mb: 0.4 }}>
            {titulo}
          </Typography>

          {/* Mensaje del docente */}
          {m.mensaje_docente && (
            <Box sx={{
              display: 'flex', gap: 0.5, alignItems: 'flex-start', mb: 0.6,
              p: 0.8, borderRadius: '8px',
              bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8fafc', 1),
            }}>
              <SchoolRoundedIcon sx={{ fontSize: 13, color: accent, mt: 0.1, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontSize: 11, lineHeight: 1.5, fontStyle: 'italic' }}>
                {m.mensaje_docente}
              </Typography>
            </Box>
          )}

          {/* Meta */}
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
            {m.docente_nombres} {m.docente_apellido} ·{' '}
            {new Date(m.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
            {m.visto_por_estudiante && m.fecha_vista && (
              <> · Visto {new Date(m.fecha_vista).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}</>
            )}
          </Typography>
        </Box>
      </Box>

      {/* Botones */}
      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
        {esNuevo && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onMarcar(m.id)}
            disabled={marcando === m.id}
            startIcon={
              marcando === m.id
                ? <CircularProgress size={12} />
                : <CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />
            }
            sx={{
              fontSize: '0.7rem', py: 0.4, px: 1.2,
              borderRadius: '8px', fontWeight: 600,
              borderColor: alpha(accent, 0.4), color: accent,
            }}
          >
            Marcar como visto
          </Button>
        )}

        {/* ── Botón principal: externo → abre URL directo (violeta)
                               interno con url → abre/descarga (accent)
                               interno sin url → va al repositorio       ── */}
        {m.tipo_recurso === 'externo' ? (
          <Button
            size="small"
            variant="contained"
            href={m.url_final ?? m.url_recurso_externo ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewRoundedIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              fontSize: '0.7rem', py: 0.4, px: 1.2,
              borderRadius: '8px', fontWeight: 700,
              bgcolor: '#8b5cf6', color: '#fff',
              '&:hover': { bgcolor: alpha('#8b5cf6', 0.85) },
            }}
          >
            Abrir recurso
          </Button>
        ) : m.url_final ? (
          <Button
            size="small"
            variant="contained"
            href={m.url_final}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewRoundedIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              fontSize: '0.7rem', py: 0.4, px: 1.2,
              borderRadius: '8px', fontWeight: 700,
              bgcolor: accent, color: isDark ? '#000' : '#fff',
              '&:hover': { bgcolor: alpha(accent, 0.85) },
            }}
          >
            {m.es_enlace_externo ? 'Abrir' : 'Ver'}
          </Button>
        ) : (
          <Button
            size="small"
            variant="outlined"
            href={`/dashboard/estudiante/materiales/${m.material_id}`}
            startIcon={<MenuBookRoundedIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              fontSize: '0.7rem', py: 0.4, px: 1.2,
              borderRadius: '8px', fontWeight: 600,
              borderColor: alpha(accent, 0.4), color: accent,
            }}
          >
            Ver en repositorio
          </Button>
        )}
      </Box>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
interface MaterialesAsignadosProps {
  accent:     string;
  accentDark: string;
  isDark:     boolean;
}

export const MaterialesAsignados: React.FC<MaterialesAsignadosProps> = ({
  accent, accentDark, isDark,
}) => {
  const { materiales, total, pendientes, isLoading, error, marcando, cargar, marcarVisto } =
    useMaterialesAsignados();

  const [cargado, setCargado] = useState(false);

  const handleCargar = async () => {
    await cargar();
    setCargado(true);
  };

  // Agrupar por materia
  const porMateria = materiales.reduce<Record<string, MaterialAsignadoEstudiante[]>>(
    (acc, m) => {
      const key = m.materia_nombre;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    },
    {}
  );

  // ── Estado inicial: botón para cargar ────────────────────────
  if (!cargado && !isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: '20px', mx: 'auto', mb: 2,
          background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 24px ${alpha(accent, 0.3)}`,
        }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 34, color: isDark ? '#000' : '#fff' }} />
        </Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Materiales asignados por tu docente
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
          Tu docente puede asignarte materiales personalizados basados en tu rendimiento,
          sugeridos por inteligencia artificial.
        </Typography>
        <Button
          variant="contained"
          onClick={handleCargar}
          sx={{
            background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
            borderRadius: '12px', fontWeight: 700, px: 4,
            color: isDark ? '#000' : '#fff',
          }}
        >
          Ver materiales
        </Button>
      </Box>
    );
  }

  // ── Cargando ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress sx={{ color: accent }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Cargando materiales…
        </Typography>
      </Box>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error) {
    return <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>;
  }

  // ── Sin materiales ───────────────────────────────────────────
  if (cargado && total === 0) {
    return (
      <Box sx={{
        textAlign: 'center', py: 8,
        borderRadius: '16px',
        border: `2px dashed ${alpha(accent, 0.2)}`,
      }}>
        <MenuBookRoundedIcon sx={{ fontSize: 48, color: alpha(accent, 0.3), mb: 1.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Sin materiales asignados
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Cuando tu docente te asigne materiales personalizados aparecerán aquí.
        </Typography>
      </Box>
    );
  }

  // ── Lista ────────────────────────────────────────────────────
  return (
    <Box>
      {/* Header con resumen */}
      {cargado && (
        <Fade in timeout={300}>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            mb: 3, flexWrap: 'wrap', gap: 1,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                p: 1, borderRadius: '10px',
                background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
              }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: isDark ? '#000' : '#fff' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  Materiales de tu docente
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {total} material{total !== 1 ? 'es' : ''} asignado{total !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>

            {pendientes > 0 && (
              <Chip
                size="small"
                icon={<NewReleasesRoundedIcon sx={{ fontSize: '14px !important' }} />}
                label={`${pendientes} sin leer`}
                sx={{
                  bgcolor: alpha(accent, 0.12), color: accent,
                  fontWeight: 700, fontSize: '0.72rem',
                  animation: `${pulse} 3s ease-in-out infinite`,
                }}
              />
            )}
          </Box>
        </Fade>
      )}

      {/* Lista agrupada por materia */}
      {Object.entries(porMateria).map(([materia, items], mi) => (
        <Box
          key={materia}
          sx={{ mb: 3, animation: `${fadeUp} 0.35s ease-out ${mi * 0.08}s both` }}
        >
          {/* Cabecera de materia */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
            <SchoolRoundedIcon sx={{ fontSize: 16, color: accent }} />
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{ color: accent, letterSpacing: 0.5 }}
            >
              {materia.toUpperCase()}
            </Typography>
            <Chip
              size="small"
              label={items.length}
              sx={{
                height: 16, fontSize: '0.58rem', fontWeight: 700,
                bgcolor: alpha(accent, 0.1), color: accent,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>

            {/* Sin ver primero */}
            {items
              .filter(i => !i.visto_por_estudiante)
              .map((m, idx) => (
                <MaterialCard
                  key={m.id}
                  m={m}
                  accent={accent}
                  isDark={isDark}
                  onMarcar={marcarVisto}
                  marcando={marcando}
                  index={idx}
                />
              ))
            }

            {/* Separador vistos */}
            {items.some(i => i.visto_por_estudiante) && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    Vistos
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                {/* Vistos después */}
                {items
                  .filter(i => i.visto_por_estudiante)
                  .map((m, idx) => (
                    <MaterialCard
                      key={m.id}
                      m={m}
                      accent={accent}
                      isDark={isDark}
                      onMarcar={marcarVisto}
                      marcando={marcando}
                      index={idx}
                    />
                  ))
                }
              </>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default MaterialesAsignados;