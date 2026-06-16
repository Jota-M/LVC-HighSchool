'use client';
// app/dashboard/docente/prediccion/[id]/page.tsx

import React, { useState } from 'react';
import {
  Box, Container, Typography, Fade, Alert, useTheme, alpha, IconButton,
} from '@mui/material';

import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import TabClase from '@/components/prediccion/TabClase';
import TabEstudiante from '@/components/prediccion/TabEstudiante';
import TabSimulacion from '@/components/prediccion/TabSimulacion';
import TabRecursosIA from '@/components/prediccion/TabRecursosIA';

export default function PrediccionDetallePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(0);

  const accent = isDark ? '#facc15' : '#0284c7';
  const accentEnd = isDark ? '#f59e0b' : '#0369a1';
  const gradBg = `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`;

  const asignacionId = parseInt(params.id as string);
  const paraleloId = parseInt(searchParams.get('paralelo') ?? '');
  const periodoId = parseInt(searchParams.get('periodo') ?? '');

  if (isNaN(asignacionId) || isNaN(paraleloId) || isNaN(periodoId)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '14px' }}>
          Parámetros inválidos. Volvé al listado de predicciones.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Fade in timeout={300}>
          <Box sx={{
            mb: 4, p: 3, borderRadius: '24px', position: 'relative', overflow: 'hidden',
            border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
            background: isDark
              ? `linear-gradient(135deg, ${alpha(accent, 0.1)} 0%, ${alpha('#000', 0.2)} 100%)`
              : `linear-gradient(135deg, ${alpha(accent, 0.06)} 0%, #fff 100%)`,
          }}>
            <Box sx={{
              position: 'absolute', right: -60, top: -60, width: 220, height: 220,
              borderRadius: '50%', background: gradBg, opacity: isDark ? 0.12 : 0.08,
              filter: 'blur(10px)',
            }} />
            <Box sx={{
              position: 'absolute', right: 80, bottom: -80, width: 140, height: 140,
              borderRadius: '50%', background: gradBg, opacity: isDark ? 0.08 : 0.05,
              filter: 'blur(10px)',
            }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <IconButton size="small" onClick={() => router.back()}
                  sx={{
                    border: `1.5px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1)}`,
                    borderRadius: '10px', mt: 0.5,
                    bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                  }}>
                  <ArrowBackRoundedIcon fontSize="small" />
                </IconButton>

                <Box sx={{
                  width: 56, height: 56, borderRadius: '16px',
                  background: gradBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 24px ${alpha(accent, 0.35)}`,
                  flexShrink: 0,
                }}>
                  <PsychologyRoundedIcon sx={{ color: '#fff', fontSize: 30 }} />
                </Box>

                <Box>
                  <Typography variant="h4" fontWeight={800} sx={{
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}>
                    Predicción de Rendimiento
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Análisis predictivo con IA para anticipar el desempeño académico
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { label: `Asignación #${asignacionId}` },
                  { label: `Período #${periodoId}` },
                  { label: `Paralelo #${paraleloId}` },
                ].map(({ label }) => (
                  <Box key={label} sx={{
                    px: 1.8, py: 0.8, borderRadius: '10px',
                    border: `1px solid ${alpha(accent, 0.25)}`,
                    bgcolor: alpha(accent, isDark ? 0.08 : 0.06),
                  }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: accent, fontSize: 12 }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Tabs */}
        <Box sx={{
          display: 'flex', gap: 0.5, mb: 3, p: 0.6, borderRadius: '18px',
          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
          border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
          width: 'fit-content', flexWrap: 'wrap',
        }}>
          {[
            { icon: GroupsRoundedIcon, label: 'Clase' },
            { icon: PersonRoundedIcon, label: 'Estudiante' },
            { icon: ScienceRoundedIcon, label: 'Simulación' },
            // { icon: AutoAwesomeRoundedIcon, label: 'Recursos IA' },
          ].map(({ icon: Icon, label }, i) => {
            const active = tab === i;
            return (
              <Box key={label} onClick={() => setTab(i)} sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2.2, py: 1.1, borderRadius: '14px', cursor: 'pointer',
                fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                background: active ? gradBg : 'transparent',
                color: active ? '#fff' : 'text.secondary',
                boxShadow: active ? `0 6px 16px ${alpha(accent, 0.3)}` : 'none',
                '&:hover': active ? {} : {
                  bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                  color: 'text.primary',
                },
              }}>
                <Icon sx={{ fontSize: 18 }} />
                {label}
              </Box>
            );
          })}
        </Box>

        {tab === 0 && (
          <TabClase asignacionId={asignacionId} periodoId={periodoId} paraleloId={paraleloId} accent={accent} isDark={isDark} />
        )}
        {tab === 1 && (
          <TabEstudiante asignacionId={asignacionId} periodoId={periodoId} paraleloId={paraleloId} accent={accent} isDark={isDark} />
        )}
        {tab === 2 && (
          <TabSimulacion asignacionId={asignacionId} periodoId={periodoId} paraleloId={paraleloId} accent={accent} isDark={isDark} />
        )}
        {/* {tab === 3 && (
          <TabRecursosIA asignacionId={asignacionId} periodoId={periodoId} paraleloId={paraleloId} accent={accent} isDark={isDark} />
        )} */}

      </Container>
    </Box>
  );
}