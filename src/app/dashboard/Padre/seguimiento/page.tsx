'use client';
// app/dashboard/padre/seguimiento/page.tsx

import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Avatar,
  useTheme, alpha, IconButton, Tooltip, Skeleton,
} from '@mui/material';
import { keyframes } from '@mui/system';
import PsychologyIcon  from '@mui/icons-material/Psychology';
import RefreshIcon     from '@mui/icons-material/Refresh';
import ErrorIcon       from '@mui/icons-material/Error';

import { useAuth }           from '@/context/AuthContext';
import { useHijosDelPadre }  from '@/hooks/usePadreAsistencia';
import {
  useObservacionesHijo,
} from '@/hooks/useSeguimientoPadre';

import TarjetasHijos        from '@/components/padre/seguimiento/TarjetasHijos';
import ObservacionCardPadre from '@/components/padre/seguimiento/ObservacionCardPadre';
import { ObservacionHijo }  from '@/types/seguimientoPadreTypes';
import { NivelRelevancia }  from '@/types/seguimientoPedagogicoTypes';

// ─────────────────────────────────────
// Animaciones
// ─────────────────────────────────────

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;

// ─────────────────────────────────────
// Tipos y helpers
// ─────────────────────────────────────

type FiltroNivel = NivelRelevancia | 'todos' | 'no_leidos';

const FILTROS: { value: FiltroNivel; label: string }[] = [
  { value: 'todos',             label: 'Todas'       },
  { value: 'no_leidos',         label: 'Sin leer'    },
  { value: 'urgente',           label: 'Urgentes'    },
  { value: 'requiere_atencion', label: 'Atención'    },
  { value: 'informativo',       label: 'Informativo' },
];

const filtrarObs = (obs: ObservacionHijo[], filtro: FiltroNivel) => {
  if (filtro === 'todos')     return obs;
  if (filtro === 'no_leidos') return obs.filter(o => !o.ya_leido);
  return obs.filter(o => o.nivel_relevancia === filtro);
};

// ─────────────────────────────────────
// SELECTOR DE HIJO (igual que en asistencia)
// ─────────────────────────────────────

const SelectorHijo: React.FC<{
  hijos:       any[];
  hijoActivo:  any;
  onSeleccionar:(hijo: any) => void;
  isLoading:   boolean;
}> = ({ hijos, hijoActivo, onSeleccionar, isLoading }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[1, 2].map(i => (
          <Skeleton key={i} variant="rounded" width={180} height={60} sx={{ borderRadius: 3 }} />
        ))}
      </Box>
    );
  }

  // Si solo hay un hijo no mostramos el selector
  if (hijos.length <= 1) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      {hijos.map(hijo => {
        const activo = hijo.estudiante_id === hijoActivo?.estudiante_id;
        return (
          <Box
            key={hijo.estudiante_id}
            onClick={() => onSeleccionar(hijo)}
            sx={{
              display:    'flex',
              alignItems: 'center',
              gap: 1.5, p: 1.5,
              borderRadius: 3, cursor: 'pointer',
              border: `2px solid ${activo
                ? (isDark ? '#a78bfa' : '#8b5cf6')
                : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08))}`,
              background: activo
                ? isDark ? alpha('#8b5cf6', 0.15) : alpha('#8b5cf6', 0.06)
                : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                border:     `2px solid ${isDark ? '#a78bfa' : '#8b5cf6'}`,
                background: isDark ? alpha('#8b5cf6', 0.1) : alpha('#8b5cf6', 0.04),
              },
            }}
          >
            <Avatar
              src={hijo.foto_url ?? undefined}
              sx={{
                width: 36, height: 36, fontSize: 14, fontWeight: 800,
                bgcolor: activo
                  ? isDark ? '#7c3aed' : '#8b5cf6'
                  : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
              }}
            >
              {hijo.nombres.charAt(0)}{hijo.apellidos.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                {hijo.nombres.split(' ')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {hijo.grado_nombre} "{hijo.paralelo_nombre}"
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ─────────────────────────────────────
// PANEL de observaciones del hijo activo
// ─────────────────────────────────────

const PanelObservaciones: React.FC<{
  matriculaId:     number;
  padreFamiliaId:  number;
  nombreHijo:      string;
}> = ({ matriculaId, padreFamiliaId, nombreHijo }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [filtro, setFiltro] = useState<FiltroNivel>('todos');

  const {
    observaciones,
    isLoading,
    isAcusando,
    conteos,
    acusarRecibo,
  } = useObservacionesHijo(matriculaId, padreFamiliaId);

  const filtradas = filtrarObs(observaciones, filtro);

  if (isLoading) {
    return (
      <Box sx={{ mt: 3 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={140}
            sx={{ borderRadius: '16px', mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {/* Alerta urgente */}
      {conteos.urgentes > 0 && (
        <Fade in>
          <Box sx={{
            display: 'flex', alignItems: 'flex-start', gap: 1.5,
            p: 2, borderRadius: '14px', mb: 3,
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#dc2626', 0.2)}, ${alpha('#dc2626', 0.1)})`
              : `linear-gradient(135deg, #fee2e2, #fff1f2)`,
            border: `1px solid ${alpha('#dc2626', 0.3)}`,
          }}>
            <ErrorIcon sx={{ color: '#dc2626', mt: 0.25, flexShrink: 0 }} />
            <Box>
              <Typography variant="body2" fontWeight={800} sx={{ color: '#dc2626', mb: 0.25 }}>
                Requiere tu atención
              </Typography>
              <Typography variant="body2" color="text.primary">
                {nombreHijo} tiene{' '}
                <strong>{conteos.urgentes}</strong>{' '}
                observación{conteos.urgentes > 1 ? 'es urgentes' : ' urgente'}.
                Revisala y confirmá la lectura.
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Sin observaciones */}
      {conteos.total === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            Todo en orden
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={0.5}>
            No hay observaciones registradas para {nombreHijo} en este período.
          </Typography>
        </Box>
      )}

      {/* Filtros */}
      {conteos.total > 0 && (
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 3 }}>
          {FILTROS.map(f => {
            const count =
              f.value === 'todos'             ? conteos.total :
              f.value === 'no_leidos'         ? conteos.no_leidas :
              f.value === 'urgente'           ? conteos.urgentes :
              f.value === 'requiere_atencion' ? conteos.requieren_atencion :
                                                conteos.informativos;

            if (count === 0 && f.value !== 'todos') return null;

            const activo = filtro === f.value;
            const colorMap: Record<string, string> = {
              todos:            isDark ? alpha('#fff', 0.12) : alpha('#000', 0.08),
              no_leidos:        alpha('#8b5cf6', 0.15),
              urgente:          '#fee2e2',
              requiere_atencion:'#fef3c7',
              informativo:      '#dbeafe',
            };
            const textMap: Record<string, string> = {
              todos:            'text.primary',
              no_leidos:        '#8b5cf6',
              urgente:          '#dc2626',
              requiere_atencion:'#d97706',
              informativo:      '#1d4ed8',
            };

            return (
              <Chip
                key={f.value}
                clickable
                size="small"
                label={`${f.label}${count > 0 ? ` (${count})` : ''}`}
                onClick={() => setFiltro(f.value)}
                sx={{
                  fontWeight: 700, fontSize: '0.75rem', height: 28,
                  transition: 'all 0.2s',
                  bgcolor:     activo ? colorMap[f.value] : 'transparent',
                  color:       activo ? textMap[f.value] : 'text.secondary',
                  border: '1px solid',
                  borderColor: activo
                    ? textMap[f.value]
                    : isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1),
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Lista */}
      {filtradas.length === 0 && conteos.total > 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          No hay observaciones con este filtro.
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filtradas.map((obs, i) => (
          <ObservacionCardPadre
            key={obs.id}
            obs={obs}
            onAcusar={acusarRecibo}
            isAcusando={isAcusando}
            index={i}
          />
        ))}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────

export default function PadreSeguimientoPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();

  // ── Igual que asistencia/notas: useHijosDelPadre resuelve todo ──
  const {
    hijos,
    hijoActivo,
    setHijoActivo,
    isLoading: loadingHijos,
    refrescar: refrescarHijos,
  } = useHijosDelPadre();

  const handleSeleccionarHijo = useCallback((hijo: any) => {
    setHijoActivo(hijo);
  }, [setHijoActivo]);

  // Conteos globales para los chips del header
  // (los traemos desde el hijo activo cuando ya cargaron sus observaciones)

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(circle at top right, rgba(139,92,246,0.04), transparent 60%)'
        : 'radial-gradient(circle at top right, rgba(139,92,246,0.02), transparent 60%)',
    }}>
      <Container maxWidth="xl" disableGutters>

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4, pt: 3 }}>
            <Box sx={{
              p: 3.5, borderRadius: 4,
              background: isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                : '#fff',
              border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Shimmer decorativo */}
              <Box sx={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.03 : 0.08)}, transparent)`,
                backgroundSize: '1000px 100%',
                animation: `${shimmer} 4s linear infinite`,
                pointerEvents: 'none',
              }} />

              <Box sx={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', flexWrap: 'wrap',
                gap: 2, position: 'relative', zIndex: 1,
              }}>
                {/* Título */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    boxShadow: isDark
                      ? '0 6px 20px rgba(251,191,36,0.4)'
                      : '0 6px 20px rgba(139,92,246,0.4)',
                  }}>
                    <PsychologyIcon sx={{ fontSize: 30, color: '#fff' }} />
                  </Box>

                  <Box>
                    <Typography variant="h4" fontWeight={900} sx={{
                      background: isDark
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor:  'transparent',
                      letterSpacing: -0.5, lineHeight: 1.2,
                    }}>
                      Seguimiento Pedagógico
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.25 }}>
                      {user?.username && <>Hola, <strong>{user.username}</strong> · </>}
                      {hijoActivo
                        ? <>Observaciones de{' '}
                            <Box component="span" sx={{ color: isDark ? '#fbbf24' : '#8b5cf6', fontWeight: 800 }}>
                              {hijoActivo.nombres} {hijoActivo.apellidos}
                            </Box>
                          </>
                        : 'Cargando datos...'
                      }
                    </Typography>
                  </Box>
                </Box>

                {/* Botón refrescar */}
                <Tooltip title="Actualizar datos">
                  <IconButton
                    onClick={refrescarHijos}
                    size="small"
                    disabled={loadingHijos}
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                      border:  `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor:   isDark ? alpha('#fbbf24', 0.15) : alpha('#8b5cf6', 0.08),
                        transform: 'rotate(180deg)',
                      },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 18, color: isDark ? '#fbbf24' : '#8b5cf6' }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Chips de info del hijo activo */}
              {hijoActivo && (
                <Box sx={{
                  mt: 2.5, pt: 2.5,
                  borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                  display: 'flex', gap: 1.5, flexWrap: 'wrap',
                  position: 'relative', zIndex: 1,
                }}>
                  {[
                    hijoActivo.nivel_nombre,
                    `${hijoActivo.grado_nombre} "${hijoActivo.paralelo_nombre}"`,
                    hijoActivo.turno_nombre,
                    hijoActivo.periodo_nombre,
                  ].filter(Boolean).map((label, i) => (
                    <Chip
                      key={i} label={label} size="small"
                      sx={{
                        height: 24, fontSize: 11, fontWeight: 700, borderRadius: 1.5,
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Fade>

        {/* ══ SELECTOR DE HIJO (solo si hay más de uno) ══ */}
        <SelectorHijo
          hijos={hijos}
          hijoActivo={hijoActivo}
          onSeleccionar={handleSeleccionarHijo}
          isLoading={loadingHijos}
        />

        {/* ══ PANEL DE OBSERVACIONES ══ */}
        <Box sx={{ animation: `${fadeSlideUp} 0.5s ease-out 0.15s both`, pb: 6 }}>
          {hijoActivo ? (
            <Fade in timeout={300} key={hijoActivo.estudiante_id}>
              <Box>
                <PanelObservaciones
                  matriculaId={hijoActivo.matricula_id}
                  padreFamiliaId={hijoActivo.padre_familia_id}
                  nombreHijo={hijoActivo.nombres}
                />
              </Box>
            </Fade>
          ) : (
            !loadingHijos && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary" fontWeight={600}>
                  No se encontró información de tus hijos.
                </Typography>
              </Box>
            )
          )}
        </Box>

      </Container>
    </Box>
  );
}