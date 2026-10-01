'use client';
// app/dashboard/estudiante/notas/page.tsx
// Rediseñado con diseño institucional idéntico al apartado de Calificaciones del Padre
// (Boletín trimestral detallado por dimensiones + Consolidado general anual de 3 trimestres)

import React, { useCallback, useState, useEffect } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Skeleton,
  useTheme, alpha, IconButton, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import AutoAwesomeMosaicRoundedIcon from '@mui/icons-material/AutoAwesomeMosaicRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';

import BoletinNotas from '@/components/padre/notas/BoletinNotas';
import BoletinGeneralAnual from '@/components/padre/notas/BoletinGeneralAnual';
import BoletinCualitativoInicial from '@/components/padre/notas/BoletinCualitativoInicial';
import { usePerfilEstudiante } from '@/hooks/useEstudiante';
import { useBoletinNotas, useBoletinAnualPadre } from '@/hooks/usePadreNotas';
import estudianteService from '@/services/estudianteService';
import type { PeriodoEvaluacion } from '@/types/padreNotasTypes';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Paleta dual institucional ──────────────────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = isDark ? '#facc15' : '#0288d1';
  const primaryEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${primary} 0%, ${primaryEnd} 100%)`;
  return { isDark, primary, primaryEnd, gradBg };
};

// ──────────────────────────────────────────────
// SELECTOR DE TRIMESTRE / GENERAL
// ──────────────────────────────────────────────
const SelectorTrimestre: React.FC<{
  periodos: PeriodoEvaluacion[];
  tabActivo: number | 'anual';
  onChange: (tab: number | 'anual') => void;
  isLoading: boolean;
  isDark: boolean;
  primary: string;
  gradBg: string;
}> = ({ periodos, tabActivo, onChange, isLoading, isDark, primary, gradBg }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant="rounded" width={130} height={34} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  const periodosOrdenados = [...periodos].sort((a, b) => a.orden - b.orden);

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {periodosOrdenados.map(p => {
        const activo = tabActivo === p.id;
        return (
          <Chip
            key={p.id}
            label={p.nombre}
            onClick={() => onChange(p.id)}
            sx={{
              height: 34,
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2.5,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ...(activo
                ? { background: gradBg, color: isDark ? '#000' : '#fff', boxShadow: `0 4px 12px ${alpha(primary, 0.35)}`, border: 'none' }
                : { bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04), color: 'text.secondary', border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`, '&:hover': { bgcolor: alpha(primary, isDark ? 0.15 : 0.08), color: primary } }),
            }}
          />
        );
      })}

      {/* Tab adicional: Resumen General / 3 Trimestres */}
      <Chip
        icon={<AutoAwesomeMosaicRoundedIcon sx={{ fontSize: '16px !important', color: tabActivo === 'anual' ? (isDark ? '#000 !important' : '#fff !important') : primary }} />}
        label="General (3 Trimestres)"
        onClick={() => onChange('anual')}
        sx={{
          height: 34,
          fontWeight: 800,
          fontSize: 13,
          borderRadius: 2.5,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          ...(tabActivo === 'anual'
            ? { background: gradBg, color: isDark ? '#000' : '#fff', boxShadow: `0 4px 12px ${alpha(primary, 0.35)}`, border: 'none' }
            : { bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04), color: 'text.secondary', border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`, '&:hover': { bgcolor: alpha(primary, isDark ? 0.15 : 0.08), color: primary } }),
        }}
      />
    </Box>
  );
};

// ──────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ──────────────────────────────────────────────
export default function EstudianteNotasPage() {
  const { isDark, primary, gradBg } = usePalette();
  const { perfil, isLoading: loadingPerfil } = usePerfilEstudiante();

  const [periodos, setPeriodos] = useState<PeriodoEvaluacion[]>([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [tabActivo, setTabActivo] = useState<number | 'anual'>('anual');

  // Cargar períodos de evaluación del estudiante
  useEffect(() => {
    setLoadingPeriodos(true);
    estudianteService.getPeriodosEvaluacion()
      .then(res => {
        const raw = res.data.periodos || [];
        const mapped: PeriodoEvaluacion[] = raw.map(p => ({
          id: p.id,
          nombre: p.nombre,
          orden: p.orden ?? p.id,
          fecha_inicio: p.fecha_inicio,
          fecha_fin: p.fecha_fin,
          activo: true,
          periodo_academico_id: 0,
        }));
        setPeriodos(mapped);
      })
      .catch(() => {})
      .finally(() => setLoadingPeriodos(false));
  }, []);

  const matriculaId = perfil?.matricula_id ?? null;
  const periodoIdSeleccionado = tabActivo === 'anual' ? null : tabActivo;

  // Trimestre individual
  const {
    boletin, isLoading: loadingBoletin,
    aprobadas, reprobadas, sinNota, promedio,
    refrescar: refrescarBoletin,
  } = useBoletinNotas(matriculaId, periodoIdSeleccionado);

  // Resumen general / anual (3 trimestres)
  const {
    materiasAnuales,
    isLoading: loadingAnual,
    promedioGeneralAnual,
    aprobadas: aprobadasAnual,
    reprobadas: reprobadasAnual,
    sinNota: sinNotaAnual,
    refrescar: refrescarAnual,
  } = useBoletinAnualPadre(matriculaId, periodos);

  const handleCambioTab = useCallback((tab: number | 'anual') => {
    setTabActivo(tab);
  }, []);

  const handleRefrescar = useCallback(() => {
    if (tabActivo === 'anual') {
      refrescarAnual();
    } else {
      refrescarBoletin();
    }
  }, [tabActivo, refrescarAnual, refrescarBoletin]);

  const promedioAMostrar = tabActivo === 'anual' ? promedioGeneralAnual : promedio;
  const textoPromedioHeader = tabActivo === 'anual' ? 'Promedio Anual' : 'Promedio';
  const esInicial = (perfil?.nivel_academico ?? (perfil as any)?.nivel_nombre ?? '').toLowerCase().includes('inicial');

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
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
                  <SchoolRoundedIcon
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
                    }}
                  >
                    Notas y Boletín
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0.3,
                    mt: 0.5,
                  }}
                >
                  {perfil
                    ? <>{perfil.nombres} {perfil.apellidos} · <strong>{perfil.grado_nombre} "{perfil.paralelo_nombre}"</strong></>
                    : 'Cargando datos del estudiante...'}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                {esInicial ? (
                  <Chip
                    icon={<ChildCareRoundedIcon sx={{ fontSize: '16px !important' }} />}
                    label="Educación Inicial: Evaluación Cualitativa"
                    size="small"
                    sx={{
                      height: 28, fontWeight: 800, fontSize: 12,
                      bgcolor: isDark ? alpha(primary, 0.15) : alpha(primary, 0.1),
                      color: primary,
                      border: `1px solid ${alpha(primary, 0.3)}`,
                      borderRadius: 2,
                      '& .MuiChip-icon': { color: primary },
                    }}
                  />
                ) : promedioAMostrar != null && (
                  <Chip
                    icon={<BarChartRoundedIcon sx={{ fontSize: '16px !important' }} />}
                    label={`${textoPromedioHeader}: ${promedioAMostrar}`}
                    size="small"
                    sx={{
                      height: 28, fontWeight: 800, fontSize: 12,
                      bgcolor: isDark ? alpha(primary, 0.15) : alpha(primary, 0.1),
                      color: primary,
                      border: `1px solid ${alpha(primary, 0.3)}`,
                      borderRadius: 2,
                      '& .MuiChip-icon': { color: primary },
                    }}
                  />
                )}
                <Tooltip title="Actualizar">
                  <IconButton
                    onClick={handleRefrescar}
                    size="small"
                    disabled={loadingBoletin || loadingAnual}
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

            {/* Selector de trimestre / general */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Vista por Trimestre
              </Typography>
              <SelectorTrimestre
                periodos={periodos}
                tabActivo={tabActivo}
                onChange={handleCambioTab}
                isLoading={loadingPeriodos}
                isDark={isDark}
                primary={primary}
                gradBg={gradBg}
              />
            </Box>
          </Box>
        </Fade>

        {/* ── CONTENIDO: BOLETÍN TRIMESTRAL, GENERAL O INICIAL CUALITATIVO ── */}
        <Fade in timeout={500} key={String(tabActivo)}>
          <Box sx={{ animation: `${fadeSlideUp} 0.5s ease-out 0.15s both`, pb: 6 }}>
            {esInicial && matriculaId ? (
              <BoletinCualitativoInicial
                matriculaId={matriculaId}
                periodoId={tabActivo === 'anual' ? (periodos[0]?.id || 1) : tabActivo}
                periodoNombre={periodos.find(p => p.id === (tabActivo === 'anual' ? (periodos[0]?.id || 1) : tabActivo))?.nombre || 'Primer Trimestre'}
                estudianteNombre={perfil ? `${perfil.nombres} ${perfil.apellidos}`.trim() : 'Estudiante'}
                gradoNombre={perfil?.grado_nombre || 'Educación Inicial'}
              />
            ) : tabActivo === 'anual' ? (
              <BoletinGeneralAnual
                materiasAnuales={materiasAnuales}
                periodos={periodos}
                isLoading={loadingAnual || loadingPerfil}
                promedioGeneral={promedioGeneralAnual}
                aprobadas={aprobadasAnual}
                reprobadas={reprobadasAnual}
                sinNota={sinNotaAnual}
              />
            ) : (
              <BoletinNotas
                boletin={boletin}
                isLoading={loadingBoletin || loadingPerfil}
                aprobadas={aprobadas}
                reprobadas={reprobadas}
                sinNota={sinNota}
                promedio={promedio}
                matriculaId={matriculaId}
                periodoEvaluacionId={periodoIdSeleccionado}
              />
            )}
          </Box>
        </Fade>

      </Container>
    </Box>
  );
}