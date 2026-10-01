'use client';
// app/dashboard/docente/materiales/[id]/page.tsx

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Skeleton, Fade, alpha, useTheme,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FolderSharedRoundedIcon from '@mui/icons-material/FolderSharedRounded';
import { useParams, useRouter } from 'next/navigation';
import { asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import { toast } from 'react-hot-toast';
import { MaterialesDocente } from '@/components/materiales/MaterialesDocente';
import TabRecursosIA from '@/components/prediccion/TabRecursosIA';

type VistaTab = 'materiales' | 'recursosIA';

const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

export default function MateriaMaterialesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold}, ${goldEnd})`;

  const router = useRouter();
  const params = useParams();
  const asignacionId = Number(params?.id);

  const [asignacion, setAsignacion] = useState<AsignacionDocente | null>(null);
  const [loading, setLoading] = useState(true);
  const [vistaActiva, setVistaActiva] = useState<VistaTab>('materiales');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const res = await asistenciaService.getMisAsignaciones();
        const found = res.data.asignaciones.find(
          (a: AsignacionDocente) => a.asignacion_id === asignacionId
        );
        if (!found) {
          router.replace('/dashboard/docente/materiales');
          return;
        }
        setAsignacion(found);
      } catch {
        toast.error('Error al cargar la materia');
        router.replace('/dashboard/docente/materiales');
      } finally {
        setLoading(false);
      }
    };
    if (asignacionId) cargar();
  }, [asignacionId, router]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 2.5, px: { xs: 1.5, sm: 2.5, md: 3 }, width: '100%' }}>
        <Skeleton variant="rounded" height={28} width={180} sx={{ borderRadius: '8px', mb: 2 }} />
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: '18px', mb: 3 }} />
        <Skeleton variant="rounded" height={450} sx={{ borderRadius: '18px' }} />
      </Box>
    );
  }

  if (!asignacion) return null;

  return (
    <Box sx={{ minHeight: '100vh', py: 2.5, px: { xs: 1.5, sm: 2.5, md: 3 }, width: '100%' }}>
      {/* ══ HEADER IDÉNTICO AL MÓDULO DE TEMARIO, TAREAS Y CALIFICACIONES (ANCHO COMPLETO) ══ */}
      <Fade in timeout={350}>
        <Box sx={{ mb: 3.5 }}>
          {/* Volver */}
          <Box
            onClick={() => router.push('/dashboard/docente/materiales')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              mb: 1.5,
              cursor: 'pointer',
              color: 'text.secondary',
              fontSize: 13,
              fontWeight: 600,
              '&:hover': { color: gold },
              transition: 'color 0.15s ease',
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
            Volver a mis materias
          </Box>

          {/* Título + Chips */}
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Box sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                bgcolor: alpha(gold, 0.12),
                border: `1.5px solid ${alpha(gold, 0.28)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 16px ${alpha(gold, 0.15)}`,
              }}>
                <FolderSharedRoundedIcon
                  sx={{
                    color: gold,
                    fontSize: 30,
                    animation: `${bounceIcon} 1.6s ease-in-out infinite`,
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: gold,
                  mb: 0.3,
                }}>
                  Biblioteca de Estudio · Recursos y Materiales
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.4rem', sm: '1.85rem', md: '2.2rem' },
                    fontWeight: 800,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.15,
                  }}
                >
                  {asignacion.materia_nombre}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.6, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${asignacion.grado_nombre} "${asignacion.paralelo_nombre}"`}
                    size="small"
                    sx={{
                      background: gradBg,
                      color: isDark ? '#000' : '#fff',
                      fontWeight: 700,
                      fontSize: 11,
                      height: 22,
                    }}
                  />
                  {asignacion.turno_nombre && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      · Turno {asignacion.turno_nombre}
                    </Typography>
                  )}
                  {asignacion.nivel_nombre && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      · {asignacion.nivel_nombre}
                    </Typography>
                  )}
                  {asignacion.total_estudiantes !== undefined && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      · {asignacion.total_estudiantes} estudiantes
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Selector de pestañas moderno (Segmented Control) */}
            <Box sx={{
              display: 'inline-flex',
              gap: 0.6,
              p: 0.6,
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
              borderRadius: '14px',
              border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.02)',
            }}>
              {[
                { key: 'materiales' as VistaTab, label: 'Materiales didácticos', icon: <AutoStoriesRoundedIcon sx={{ fontSize: 17 }} /> },
                { key: 'recursosIA' as VistaTab, label: 'Recursos asistidos por IA', icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} /> },
              ].map(tab => {
                const isActive = vistaActiva === tab.key;
                return (
                  <Box
                    key={tab.key}
                    onClick={() => setVistaActiva(tab.key)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      px: { xs: 1.5, sm: 2.2 },
                      py: 0.8,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      transition: 'all 0.18s ease',
                      color: isActive ? (isDark ? '#000' : '#fff') : 'text.secondary',
                      background: isActive ? gradBg : 'transparent',
                      boxShadow: isActive ? `0 4px 12px ${alpha(gold, 0.3)}` : 'none',
                      '&:hover': !isActive ? {
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                        color: 'text.primary',
                      } : {},
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* ── CUERPO PRINCIPAL ── */}
      <Fade in timeout={300} key={vistaActiva}>
        <Box>
          {vistaActiva === 'materiales' && (
            <MaterialesDocente
              asignacion={asignacion}
              accent={gold}
              accentDark={goldEnd}
              isDark={isDark}
            />
          )}
          {vistaActiva === 'recursosIA' && (
            <TabRecursosIA
              asignacionId={asignacion.asignacion_id}
              periodoId={asignacion.periodo_evaluacion_id}
              paraleloId={asignacion.paralelo_id}
              accent={gold}
              isDark={isDark}
            />
          )}
        </Box>
      </Fade>
    </Box>
  );
}