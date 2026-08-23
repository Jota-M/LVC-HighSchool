'use client';
// app/dashboard/padre/seguimiento/page.tsx
// Seguimiento Pedagógico — restyled con el mismo header/paleta que financiero/page.tsx
// (ícono animado + título degradado, sin contenedor, botón refresh estilo pill)

import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Avatar,
  useTheme, alpha, IconButton, Tooltip, Skeleton,
} from '@mui/material';
import { keyframes } from '@mui/system';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ErrorIcon from '@mui/icons-material/Error';

import { useAuth } from '@/context/AuthContext';
import { useHijosDelPadre } from '@/hooks/usePadreAsistencia';
import {
  useObservacionesHijo,
} from '@/hooks/useSeguimientoPadre';

import ObservacionCardPadre from '@/components/padre/seguimiento/ObservacionCardPadre';
import { ObservacionHijo } from '@/types/seguimientoPadreTypes';
import { NivelRelevancia } from '@/types/seguimientoPedagogicoTypes';

// ─────────────────────────────────────
// Animaciones
// ─────────────────────────────────────

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Paleta — misma lógica dual que financiero/page.tsx ────────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = isDark ? '#facc15' : '#0288d1';
  const primaryEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${primary} 0%, ${primaryEnd} 100%)`;
  return { isDark, primary, primaryEnd, gradBg };
};

// ─────────────────────────────────────
// Tipos y helpers
// ─────────────────────────────────────

type FiltroNivel = NivelRelevancia | 'todos' | 'no_leidos';

const FILTROS: { value: FiltroNivel; label: string }[] = [
  { value: 'todos', label: 'Todas' },
  { value: 'no_leidos', label: 'Sin leer' },
  { value: 'urgente', label: 'Urgentes' },
  { value: 'requiere_atencion', label: 'Atención' },
  { value: 'informativo', label: 'Informativo' },
];

const filtrarObs = (obs: ObservacionHijo[], filtro: FiltroNivel) => {
  if (filtro === 'todos') return obs;
  if (filtro === 'no_leidos') return obs.filter(o => !o.ya_leido);
  return obs.filter(o => o.nivel_relevancia === filtro);
};

// ─────────────────────────────────────
// SELECTOR DE HIJO (mismo patrón visual que SelectorHijo de financiero)
// ─────────────────────────────────────

const SelectorHijo: React.FC<{
  hijos: any[];
  hijoActivo: any;
  onSeleccionar: (hijo: any) => void;
  isLoading: boolean;
  isDark: boolean;
  primary: string;
  gradBg: string;
}> = ({ hijos, hijoActivo, onSeleccionar, isLoading, isDark, primary, gradBg }) => {
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
              display: 'flex',
              alignItems: 'center',
              gap: 1.5, p: 1.5,
              borderRadius: 3, cursor: 'pointer',
              border: `2px solid ${activo ? primary : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08))}`,
              background: activo
                ? (isDark ? alpha(primary, 0.15) : alpha(primary, 0.06))
                : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                border: `2px solid ${primary}`,
                background: isDark ? alpha(primary, 0.1) : alpha(primary, 0.04),
              },
            }}
          >
            <Avatar
              src={hijo.foto_url ?? undefined}
              sx={{
                width: 36, height: 36, fontSize: 14, fontWeight: 800,
                background: activo ? gradBg : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)),
                color: activo ? (isDark ? '#000' : '#fff') : undefined,
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
  matriculaId: number;
  padreFamiliaId: number;
  nombreHijo: string;
  isDark: boolean;
  primary: string;
  gradBg: string;
}> = ({ matriculaId, padreFamiliaId, nombreHijo, isDark, primary, gradBg }) => {
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
      {/* Alerta urgente — se mantiene en rojo semántico (no es color de marca) */}
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
              f.value === 'todos' ? conteos.total :
                f.value === 'no_leidos' ? conteos.no_leidas :
                  f.value === 'urgente' ? conteos.urgentes :
                    f.value === 'requiere_atencion' ? conteos.requieren_atencion :
                      conteos.informativos;

            if (count === 0 && f.value !== 'todos') return null;

            const activo = filtro === f.value;
            // "todos" y "no_leidos" usan el color de marca; el resto mantiene su semántica (urgente=rojo, etc.)
            const colorMap: Record<string, string> = {
              todos: isDark ? alpha(primary, 0.2) : alpha(primary, 0.1),
              no_leidos: isDark ? alpha(primary, 0.2) : alpha(primary, 0.1),
              urgente: '#fee2e2',
              requiere_atencion: '#fef3c7',
              informativo: '#dbeafe',
            };
            const textMap: Record<string, string> = {
              todos: 'text.primary',
              no_leidos: primary,
              urgente: '#dc2626',
              requiere_atencion: '#d97706',
              informativo: '#1d4ed8',
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
                  bgcolor: activo ? colorMap[f.value] : 'transparent',
                  color: activo ? textMap[f.value] : 'text.secondary',
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
  const { isDark, primary, gradBg } = usePalette();
  const { user } = useAuth();

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

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER — mismo patrón que financiero/page.tsx: sin contenedor ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PsychologyRoundedIcon
                    sx={{ color: primary, fontSize: 36, animation: `${bounce} 1.5s infinite` }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'fadeIn 1s ease-out',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(-10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    Seguimiento Pedagógico
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0.3,
                    animation: 'fadeInText 1.2s ease-out',
                    '@keyframes fadeInText': {
                      from: { opacity: 0, transform: 'translateY(5px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  {user?.username ? (
                    <>Hola, <strong>{user.username}</strong> — </>
                  ) : null}
                  {hijoActivo
                    ? <>observaciones de <strong>{hijoActivo.nombres} {hijoActivo.apellidos}</strong></>
                    : 'Cargando datos...'}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <Tooltip title="Actualizar">
                  <IconButton
                    onClick={refrescarHijos}
                    size="small"
                    disabled={loadingHijos}
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                      borderRadius: '10px',
                      '&:hover': { bgcolor: isDark ? alpha(primary, 0.15) : alpha(primary, 0.08), transform: 'rotate(180deg)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    <RefreshRoundedIcon sx={{ fontSize: 16, color: primary }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Chips de info del hijo activo */}
            {hijoActivo && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
        </Fade>

        {/* ══ SELECTOR DE HIJO (solo si hay más de uno) ══ */}
        <SelectorHijo
          hijos={hijos}
          hijoActivo={hijoActivo}
          onSeleccionar={handleSeleccionarHijo}
          isLoading={loadingHijos}
          isDark={isDark}
          primary={primary}
          gradBg={gradBg}
        />

        {/* ══ PANEL DE OBSERVACIONES ══ */}
        <Fade in timeout={700}>
          <Box sx={{ animation: `${fadeSlideUp} 0.5s ease-out 0.15s both`, pb: 6 }}>
            {hijoActivo ? (
              <Fade in timeout={300} key={hijoActivo.estudiante_id}>
                <Box>
                  <PanelObservaciones
                    matriculaId={hijoActivo.matricula_id}
                    padreFamiliaId={hijoActivo.padre_familia_id}
                    nombreHijo={hijoActivo.nombres}
                    isDark={isDark}
                    primary={primary}
                    gradBg={gradBg}
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
        </Fade>

      </Container>
    </Box>
  );
}