'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Badge,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Alert,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  ChevronRight as ChevronRightIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  CheckCircleRounded as CheckCircleRoundedIcon,
  FactCheckRounded as FactCheckIcon,
  AssignmentTurnedInRounded as AssignmentTurnedInIcon,
  EditNoteRounded as EditNoteRoundedIcon,
  GradeRounded as GradeRoundedIcon,
  ChildCareRounded as ChildCareRoundedIcon,
  AutoAwesomeRounded as AutoAwesomeRoundedIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMisMateriasNotas } from '@/hooks/useNotas';
import { MateriaDocenteNotas, PeriodoEvaluacion } from '@/types/notasTypes';
import { periodosEvaluacionService } from '@/services/notasService';
import { sortCursos, sortGrados } from '@/utils/cursoUtils';
import { toast } from 'react-hot-toast';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

// Helper: extraer conteo seguro de calificaciones
function getCalificacionesCount(m: MateriaDocenteNotas): number {
  return Number(
    m.calificaciones_registradas ??
    m.total_calificaciones ??
    (m as any).calificaciones ??
    0
  );
}

// Helper: cálculo del porcentaje de progreso de calificaciones
function calcularProgreso(m: MateriaDocenteNotas): number {
  const totalEstudiantes = Number(m.total_estudiantes || 0);
  const totalEvaluaciones = Number(m.total_evaluaciones || 0);
  const totalEsperadas = totalEstudiantes * totalEvaluaciones;
  if (totalEsperadas === 0 || totalEvaluaciones === 0) {
    return 0;
  }
  const califs = getCalificacionesCount(m);
  return Math.min(100, Math.round((califs / totalEsperadas) * 100));
}

// ─── Card de Calificación/Materia (Mismo estilo visual que TemarioCard) ─────────
interface CalificacionCardProps {
  materia: MateriaDocenteNotas;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onView: (m: MateriaDocenteNotas) => void;
}

const CalificacionCard: React.FC<CalificacionCardProps> = ({
  materia,
  accentColor,
  gradBg,
  isDark,
  onView,
}) => {
  const pct = calcularProgreso(materia);
  const completo = pct === 100 && materia.total_evaluaciones > 0;
  const califs = getCalificacionesCount(materia);
  const totalEsperadas = (materia.total_estudiantes || 0) * (materia.total_evaluaciones || 0);
  const esInicial =
    materia.modalidad_evaluacion === 'cualitativa' ||
    materia.nivel_nombre?.toLowerCase().includes('inicial');

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '18px',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 10px 22px ${alpha(accentColor, 0.18)}`,
            borderColor: accentColor,
            '& .btn-gestionar': {
              backgroundColor: alpha(accentColor, 0.15),
              borderColor: accentColor,
              transform: 'translateX(2px)',
            },
          },
        }}
        onClick={() => onView(materia)}
      >
        {/* Badge de Paralelo arriba a la izquierda */}
        <Chip
          label={`Paralelo "${materia.paralelo_nombre}"`}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1,
            fontWeight: 700,
            fontSize: '0.68rem',
            height: 22,
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.12)',
            color: accentColor,
            border: `1px solid ${alpha(accentColor, 0.25)}`,
          }}
        />

        {/* Chip de Titular / Estado arriba a la derecha */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', gap: 0.6 }}>
          {completo && (
            <Tooltip title="Todas las calificaciones ingresadas">
              <Chip
                icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: '#16a34a !important' }} />}
                label="Completado"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 22,
                  backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.1)',
                  color: '#16a34a',
                  border: `1px solid ${alpha('#16a34a', 0.25)}`,
                }}
              />
            </Tooltip>
          )}
          {materia.es_titular && (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
              label="Titular"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                color: accentColor,
                border: `1px solid ${alpha(accentColor, 0.2)}`,
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 2.2, pt: 4.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Avatar mediano centrado con badge de nivel */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                materia.nivel_nombre ? (
                  <Tooltip title={`Nivel: ${materia.nivel_nombre}`}>
                    <Chip
                      icon={<SchoolIcon sx={{ fontSize: 11 }} />}
                      label={materia.nivel_nombre}
                      size="small"
                      sx={{
                        height: 20,
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        bgcolor: accentColor,
                        color: isDark ? '#000' : '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        '& .MuiChip-icon': { ml: 0.4, color: isDark ? '#000' : '#fff' },
                      }}
                    />
                  </Tooltip>
                ) : null
              }
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  margin: '0 auto',
                  bgcolor: accentColor,
                  color: isDark ? '#000' : '#fff',
                  border: `3px solid ${alpha(accentColor, 0.2)}`,
                  boxShadow: `0 6px 14px ${alpha(accentColor, 0.25)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {esInicial ? (
                  <ChildCareRoundedIcon sx={{ fontSize: 36 }} />
                ) : (
                  <GradeRoundedIcon sx={{ fontSize: 36 }} />
                )}
              </Avatar>
            </Badge>
          </Box>

          {/* Nombre de la Materia */}
          <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.3 }}>
            {materia.materia_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.78rem' }}>
            {materia.grado_nombre}
          </Typography>

          {/* Chip de Código o Turno */}
          <Box sx={{ my: 0.8 }}>
            <Chip
              label={materia.materia_codigo ? `Código: ${materia.materia_codigo}` : (materia.turno_nombre || 'Turno Regular')}
              size="small"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                color: accentColor,
              }}
            />
          </Box>

          {/* Botón de acción directo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <Button
              className="btn-gestionar"
              size="small"
              variant="outlined"
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                px: 1.8,
                py: 0.4,
                borderColor: alpha(accentColor, 0.35),
                color: accentColor,
                transition: 'all 0.2s ease',
              }}
            >
              {esInicial ? 'Evaluar Cotejo e Informes' : 'Ingresar Calificaciones'}
            </Button>
          </Box>

          {/* Información adicional y progreso del trimestre */}
          <Box
            sx={{
              mt: 'auto',
              pt: 1.5,
              borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
              textAlign: 'left',
            }}
          >
            {/* Estudiantes */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Estudiantes:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {materia.total_estudiantes ?? 0}
              </Typography>
            </Box>

            {esInicial ? (
              <Box
                sx={{
                  py: 1,
                  px: 1.2,
                  borderRadius: '10px',
                  bgcolor: alpha(accentColor, 0.08),
                  border: `1px solid ${alpha(accentColor, 0.2)}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: accentColor, fontWeight: 800, fontSize: '0.72rem', display: 'block' }}>
                  Modalidad Cualitativa Oficial
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.66rem' }}>
                  Listas de cotejo (ED, DA, DO, DP) e informes
                </Typography>
              </Box>
            ) : (
              <>
                {/* Evaluaciones */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <FactCheckIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    Evaluaciones:
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                    {materia.total_evaluaciones ?? 0}
                  </Typography>
                </Box>

                {/* Calificaciones */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <AssignmentTurnedInIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    Calificaciones:
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                    {califs}
                    {totalEsperadas > 0 ? ` / ${totalEsperadas}` : ''}
                  </Typography>
                </Box>

                {/* Mini Desglose por dimensiones bolivianas */}
                <Box sx={{ display: 'flex', gap: 0.5, pt: 0.3, pb: 0.3 }}>
                  {[
                    { label: 'SER', val: materia.evaluaciones_ser ?? 0 },
                    { label: 'SAB', val: materia.evaluaciones_saber ?? 0 },
                    { label: 'HAC', val: materia.evaluaciones_hacer ?? 0 },
                    { label: 'AUT', val: materia.evaluaciones_auto ?? 0 },
                  ].map(({ label, val }) => (
                    <Tooltip key={label} title={`${label}: ${val} evaluaciones creadas`}>
                      <Box
                        sx={{
                          flex: 1,
                          textAlign: 'center',
                          py: 0.4,
                          px: 0.2,
                          borderRadius: '7px',
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.05)}`,
                        }}
                      >
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.58rem', fontWeight: 700, display: 'block' }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.68rem', color: val > 0 ? accentColor : 'text.disabled' }}>
                          {val}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </>
            )}

            {/* Progreso de notas */}
            <Box sx={{ pt: 0.3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                  Progreso de notas
                </Typography>
                <Typography variant="caption" fontWeight={800} sx={{ color: accentColor, fontSize: '0.7rem' }}>
                  {pct}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  '& .MuiLinearProgress-bar': {
                    background: gradBg,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ─── Fila de Calificación/Materia (Vista Lista/Tabla) ──────────────────────────
interface CalificacionRowProps {
  materia: MateriaDocenteNotas;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onView: (m: MateriaDocenteNotas) => void;
}

const CalificacionRow: React.FC<CalificacionRowProps> = ({
  materia,
  accentColor,
  gradBg,
  isDark,
  onView,
}) => {
  const pct = calcularProgreso(materia);
  const califs = getCalificacionesCount(materia);
  const esInicial =
    materia.modalidad_evaluacion === 'cualitativa' ||
    materia.nivel_nombre?.toLowerCase().includes('inicial');

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: '16px',
        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateX(4px)',
          borderColor: accentColor,
          boxShadow: `0 4px 16px ${alpha(accentColor, 0.15)}`,
        },
      }}
      onClick={() => onView(materia)}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          bgcolor: alpha(accentColor, 0.15),
          color: accentColor,
          fontWeight: 800,
        }}
      >
        {esInicial ? <ChildCareRoundedIcon fontSize="small" /> : <GradeRoundedIcon fontSize="small" />}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" fontWeight={800} noWrap>
            {materia.materia_nombre}
          </Typography>
          <Chip
            size="small"
            label={`Paralelo "${materia.paralelo_nombre}"`}
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
              color: accentColor,
            }}
          />
          {materia.es_titular && (
            <Chip
              size="small"
              label="Titular"
              sx={{
                height: 20,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: alpha(accentColor, 0.12),
                color: accentColor,
              }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
          {materia.grado_nombre} {materia.nivel_nombre ? `· ${materia.nivel_nombre}` : ''}
          {materia.total_estudiantes ? ` · ${materia.total_estudiantes} estudiantes` : ''}
          {` · ${materia.total_evaluaciones ?? 0} evaluaciones`}
          {` · ${califs} calificaciones`}
          {` · Progreso: ${pct}%`}
        </Typography>
      </Box>

      <Box sx={{ width: 100, display: { xs: 'none', md: 'block' } }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 5,
            borderRadius: 3,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            '& .MuiLinearProgress-bar': { background: gradBg, borderRadius: 3 },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: accentColor }}>
          {esInicial ? 'Evaluar cotejo' : 'Ingresar notas'}
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 18, color: accentColor }} />
      </Box>
    </Card>
  );
};

// ─── Card de Centralizador e Informe Consolidado de Inicial ─────────────────────
interface CentralizadorInicialCardProps {
  paralelo: {
    paralelo_id: number;
    paralelo_nombre: string;
    grado_nombre: string;
    nivel_nombre: string;
    turno_nombre?: string;
    total_estudiantes: number;
  };
  accentColor: string;
  isDark: boolean;
  onView: (paraleloId: number) => void;
}

const CentralizadorInicialCard: React.FC<CentralizadorInicialCardProps> = ({
  paralelo,
  accentColor,
  isDark,
  onView,
}) => {
  return (
    <Fade in timeout={350}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '18px',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 10px 22px ${alpha(accentColor, 0.18)}`,
            borderColor: accentColor,
            '& .btn-gestionar-centralizador': {
              backgroundColor: alpha(accentColor, 0.15),
              borderColor: accentColor,
              transform: 'translateX(2px)',
            },
          },
        }}
        onClick={() => onView(paralelo.paralelo_id)}
      >
        {/* Badge de Paralelo arriba a la izquierda */}
        <Chip
          label={`Paralelo "${paralelo.paralelo_nombre}"`}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1,
            fontWeight: 700,
            fontSize: '0.68rem',
            height: 22,
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.12)',
            color: accentColor,
            border: `1px solid ${alpha(accentColor, 0.25)}`,
          }}
        />

        {/* Chip de Centralizador arriba a la derecha */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', gap: 0.6 }}>
          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
            label="Centralizador"
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 22,
              backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
              color: accentColor,
              border: `1px solid ${alpha(accentColor, 0.2)}`,
            }}
          />
        </Box>

        <CardContent sx={{ p: 2.2, pt: 4.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Avatar mediano centrado con badge de nivel */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title={`Nivel: ${paralelo.nivel_nombre || 'Inicial'}`}>
                  <Chip
                    icon={<SchoolIcon sx={{ fontSize: 11 }} />}
                    label={paralelo.nivel_nombre || 'Inicial'}
                    size="small"
                    sx={{
                      height: 20,
                      fontWeight: 700,
                      fontSize: '0.6rem',
                      bgcolor: accentColor,
                      color: isDark ? '#000' : '#fff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      '& .MuiChip-icon': { ml: 0.4, color: isDark ? '#000' : '#fff' },
                    }}
                  />
                </Tooltip>
              }
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  margin: '0 auto',
                  bgcolor: accentColor,
                  color: isDark ? '#000' : '#fff',
                  border: `3px solid ${alpha(accentColor, 0.2)}`,
                  boxShadow: `0 6px 14px ${alpha(accentColor, 0.25)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AssignmentTurnedInIcon sx={{ fontSize: 36 }} />
              </Avatar>
            </Badge>
          </Box>

          {/* Nombre y Grado */}
          <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.3 }}>
            Informe Cualitativo Consolidado
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.78rem' }}>
            {paralelo.grado_nombre}
          </Typography>

          {/* Chip de Trimestres y Campos */}
          <Box sx={{ my: 0.8 }}>
            <Chip
              label={paralelo.turno_nombre || 'Turno Regular'}
              size="small"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                color: accentColor,
              }}
            />
          </Box>

          {/* Botón de acción directo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <Button
              className="btn-gestionar-centralizador"
              size="small"
              variant="outlined"
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                px: 1.8,
                py: 0.4,
                borderColor: alpha(accentColor, 0.35),
                color: accentColor,
                transition: 'all 0.2s ease',
              }}
            >
              Ver Centralizador y Libreta
            </Button>
          </Box>

          {/* Información adicional */}
          <Box
            sx={{
              mt: 'auto',
              pt: 1.5,
              borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
              textAlign: 'left',
            }}
          >
            {/* Estudiantes */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Estudiantes:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {paralelo.total_estudiantes}
              </Typography>
            </Box>

            {/* Trimestres */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <CalendarIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Trimestres:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                3
              </Typography>
            </Box>

            {/* Campos integrados */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <FactCheckIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Campos integrados:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                4
              </Typography>
            </Box>

            <Box
              sx={{
                py: 1,
                px: 1.2,
                borderRadius: '10px',
                bgcolor: alpha(accentColor, 0.08),
                border: `1px solid ${alpha(accentColor, 0.2)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: accentColor, fontWeight: 800, fontSize: '0.72rem', display: 'block' }}>
                Promoción Automática y Libreta SEP
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.66rem' }}>
                Sintetiza los 4 campos y genera el informe final oficial
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ─── Fila de Centralizador Inicial (Vista Tabla) ──────────────────────────────────
const CentralizadorInicialRow: React.FC<{
  paralelo: any;
  accentColor: string;
  isDark: boolean;
  onView: (paraleloId: number) => void;
}> = ({ paralelo, accentColor, isDark, onView }) => {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: '16px',
        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateX(4px)',
          borderColor: accentColor,
          boxShadow: `0 4px 16px ${alpha(accentColor, 0.15)}`,
        },
      }}
      onClick={() => onView(paralelo.paralelo_id)}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          bgcolor: alpha(accentColor, 0.15),
          color: accentColor,
          fontWeight: 800,
        }}
      >
        <AssignmentTurnedInIcon fontSize="small" />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" fontWeight={800} noWrap>
            Informe Cualitativo Consolidado y Libreta Anual
          </Typography>
          <Chip
            size="small"
            label={`Paralelo "${paralelo.paralelo_nombre}"`}
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
              color: accentColor,
            }}
          />
          <Chip
            size="small"
            label="Centralizador"
            sx={{
              height: 20,
              fontSize: '0.62rem',
              fontWeight: 700,
              bgcolor: alpha(accentColor, 0.12),
              color: accentColor,
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
          {paralelo.grado_nombre} {paralelo.nivel_nombre ? `· ${paralelo.nivel_nombre}` : ''}
          {` · ${paralelo.total_estudiantes} estudiantes`}
          {' · 3 trimestres · 4 campos integrados'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: accentColor }}>
          Ver centralizador
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 18, color: accentColor }} />
      </Box>
    </Card>
  );
};

// ─── PÁGINA PRINCIPAL DE CALIFICACIONES ────────────────────────────────────────
export default function CalificacionesIndexPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { user } = useAuth();

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const gradBg = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';

  const { materias, isLoading, sinMaterias, refrescar } = useMisMateriasNotas();

  // Estados de vista y filtros
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState('');
  const [selectedTrimestreId, setSelectedTrimestreId] = useState<number | null>(null);
  const userInteractedTrimestre = useRef(false);

  // Períodos de evaluación oficiales (para leer fechas inicio/fin y detectar trimestre en curso)
  const [periodos, setPeriodos] = useState<PeriodoEvaluacion[]>([]);

  useEffect(() => {
    periodosEvaluacionService
      .listar(undefined, true)
      .then((res) => setPeriodos(res.data.periodos || []))
      .catch(() => { });
  }, []);

  // Trimestres únicos presentes en las materias del docente
  const trimestresDisponibles = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; orden: number; esActual: boolean }>();
    const hoy = new Date().toISOString().slice(0, 10);

    materias.forEach((m) => {
      if (m.periodo_evaluacion_id && !map.has(m.periodo_evaluacion_id)) {
        const periodoInfo = periodos.find((p) => p.id === m.periodo_evaluacion_id);
        const inicio = periodoInfo?.fecha_inicio?.slice(0, 10) || '';
        const fin = periodoInfo?.fecha_fin?.slice(0, 10) || '';
        const dentroDeRango = Boolean(inicio && fin && hoy >= inicio && hoy <= fin);

        map.set(m.periodo_evaluacion_id, {
          id: m.periodo_evaluacion_id,
          nombre: m.trimestre_nombre || periodoInfo?.nombre || `Trimestre ${m.trimestre_orden || ''}`,
          orden: m.trimestre_orden ?? periodoInfo?.orden ?? m.periodo_evaluacion_id,
          esActual: dentroDeRango,
        });
      }
    });

    const list = Array.from(map.values()).sort((a, b) => a.orden - b.orden);

    // Solo evaluar fallback de esActual si los periodos ya están cargados
    if (periodos.length > 0 && list.length > 0) {
      const algunoEsActual = list.some((t) => t.esActual);
      if (!algunoEsActual) {
        const ultimo = list[list.length - 1];
        const periodoUltimo = periodos.find((p) => p.id === ultimo.id);
        const finUltimo = periodoUltimo?.fecha_fin?.slice(0, 10) || '';
        if (finUltimo && hoy >= finUltimo) {
          ultimo.esActual = true;
        } else {
          list[0].esActual = true;
        }
      }
    }

    return list;
  }, [materias, periodos]);

  // Selección automática del trimestre activo:
  // Al entrar, selecciona siempre el trimestre activo (esActual). Si el usuario no ha hecho clic voluntariamente
  // en otro trimestre, se mantiene sincronizado con el trimestre activo en curso.
  useEffect(() => {
    if (trimestresDisponibles.length === 0) return;

    const actual = trimestresDisponibles.find((t) => t.esActual);
    if (!userInteractedTrimestre.current) {
      if (actual) {
        setSelectedTrimestreId(actual.id);
      } else if (selectedTrimestreId === null) {
        setSelectedTrimestreId(trimestresDisponibles[0].id);
      }
    }
  }, [trimestresDisponibles]);

  // Filtrar materias por el trimestre seleccionado
  const materiasDelTrimestre = useMemo(() => {
    if (!selectedTrimestreId) return materias;
    return materias.filter((m) => m.periodo_evaluacion_id === selectedTrimestreId);
  }, [materias, selectedTrimestreId]);

  // Grados disponibles para el filtro (ordenados naturalmente: 1ro, 2do, 3ro...)
  const gradosDisponibles = useMemo(() => {
    const set = new Set(materiasDelTrimestre.map((m) => m.grado_nombre).filter(Boolean));
    return sortGrados(Array.from(set) as string[]);
  }, [materiasDelTrimestre]);

  // Filtrado final por búsqueda y grado, ordenado por cursos (1ro, 2do, 3ro...)
  const materiasFiltradas = useMemo(() => {
    const filtradas = materiasDelTrimestre.filter((m) => {
      const matchesSearch =
        !searchTerm.trim() ||
        m.materia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.grado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.paralelo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nivel_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.materia_codigo && m.materia_codigo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGrado = !gradoFilter || m.grado_nombre === gradoFilter;

      return matchesSearch && matchesGrado;
    });

    return sortCursos(filtradas);
  }, [materiasDelTrimestre, searchTerm, gradoFilter]);

  // Paralelos de Inicial únicos presentes en las materias filtradas
  const paralelosInicial = useMemo(() => {
    const map = new Map<number, {
      paralelo_id: number;
      paralelo_nombre: string;
      grado_nombre: string;
      nivel_nombre: string;
      turno_nombre?: string;
      total_estudiantes: number;
    }>();

    materiasFiltradas.forEach((m) => {
      const esInicial =
        m.modalidad_evaluacion === 'cualitativa' ||
        m.nivel_nombre?.toLowerCase().includes('inicial');

      if (esInicial && m.paralelo_id && !map.has(m.paralelo_id)) {
        map.set(m.paralelo_id, {
          paralelo_id: m.paralelo_id,
          paralelo_nombre: m.paralelo_nombre,
          grado_nombre: m.grado_nombre,
          nivel_nombre: m.nivel_nombre,
          turno_nombre: m.turno_nombre,
          total_estudiantes: Number(m.total_estudiantes || 0),
        });
      }
    });

    return Array.from(map.values());
  }, [materiasFiltradas]);

  const handleView = (m: MateriaDocenteNotas) => {
    router.push(`/dashboard/docente/calificaciones/${m.asignacion_id}-${m.periodo_evaluacion_id}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* ══ HEADER (Mismo estilo que Tareas / Temario) ══ */}
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
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EditNoteRoundedIcon
                    sx={{
                      color: accentColor,
                      fontSize: { xs: 34, md: 40 },
                      animation: `${bounce} 2s infinite ease-in-out`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Gestión de Calificaciones
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                  Hola, <strong>{user?.username}</strong> — visualiza el avance e ingresa las notas de tus estudiantes por trimestre en cuestión.
                </Typography>
              </Box>

              {/* DERECHA: Botón de refrescar */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    userInteractedTrimestre.current = false;
                    refrescar();
                    toast.success('Materias actualizadas');
                  }}
                  sx={{
                    borderRadius: '12px',
                    borderColor: alpha(accentColor, 0.4),
                    color: accentColor,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': {
                      borderColor: accentColor,
                      backgroundColor: alpha(accentColor, 0.1),
                    },
                  }}
                >
                  Actualizar
                </Button>
              </Box>
            </Box>

            {/* ══ SELECTOR DE TRIMESTRE EN CUESTIÓN (Chips idénticos a Tareas) ══ */}
            {trimestresDisponibles.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '16px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
                  mb: 3,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 1 }}>
                  <CalendarIcon sx={{ fontSize: 18, color: accentColor }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
                    Trimestre en cuestión:
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {trimestresDisponibles.map((trim) => {
                    const isSelected = selectedTrimestreId === trim.id;
                    return (
                      <Chip
                        key={trim.id}
                        clickable
                        onClick={() => {
                          userInteractedTrimestre.current = true;
                          setSelectedTrimestreId(trim.id);
                        }}
                        icon={
                          trim.esActual ? (
                            <CheckCircleRoundedIcon
                              sx={{
                                fontSize: '15px !important',
                                color: isSelected
                                  ? isDark
                                    ? '#000 !important'
                                    : '#fff !important'
                                  : '#16a34a !important',
                              }}
                            />
                          ) : undefined
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <span>{trim.nombre}</span>
                            {trim.esActual && (
                              <Box
                                component="span"
                                sx={{
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  px: 0.7,
                                  py: 0.1,
                                  borderRadius: '6px',
                                  bgcolor: isSelected
                                    ? isDark
                                      ? 'rgba(0,0,0,0.2)'
                                      : 'rgba(255,255,255,0.3)'
                                    : alpha('#16a34a', 0.2),
                                  color: isSelected ? 'inherit' : '#16a34a',
                                }}
                              >
                                Activo
                              </Box>
                            )}
                          </Box>
                        }
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          height: 36,
                          px: 1,
                          borderRadius: '10px',
                          transition: 'all 0.2s',
                          background: isSelected ? gradBg : isDark ? alpha('#fff', 0.05) : '#fff',
                          color: isSelected ? (isDark ? '#000' : '#fff') : 'text.primary',
                          border: isSelected
                            ? 'none'
                            : `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                          boxShadow: isSelected ? `0 4px 12px ${alpha(accentColor, 0.35)}` : 'none',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            borderColor: accentColor,
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ══ BARRA DE FILTROS & VISTA ══ */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              }}
            >
              {/* BUSCADOR */}
              <TextField
                placeholder="Buscar por materia, grado, paralelo o código..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 300px' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* FILTRO POR GRADO */}
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                <InputLabel>Filtrar por Grado</InputLabel>
                <Select
                  value={gradoFilter}
                  label="Filtrar por Grado"
                  onChange={(e) => setGradoFilter(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Todos los grados</MenuItem>
                  {gradosDisponibles.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* TOGGLE VISTA: CARDS O TABLA */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, val) => {
                  if (val) setViewMode(val);
                }}
                size="small"
                sx={{
                  borderRadius: '12px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& .MuiToggleButton-root': {
                    borderRadius: '10px !important',
                    border: 'none',
                    px: 1.5,
                    py: 0.8,
                    '&.Mui-selected': {
                      background: gradBg,
                      color: isDark ? '#000' : '#fff',
                    },
                  },
                }}
              >
                <ToggleButton value="cards" aria-label="vista de tarjetas">
                  <Tooltip title="Vista de tarjetas">
                    <ViewModuleIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="table" aria-label="vista de tabla">
                  <Tooltip title="Vista de lista">
                    <TableRowsIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Fade>

        {/* ══ LOADING ══ */}
        {isLoading && (
          <Box sx={{ width: '100%', py: 4 }}>
            <LinearProgress sx={{ borderRadius: 4, height: 6 }} />
          </Box>
        )}

        {/* ══ ESTADO: SIN MATERIAS REGISTRADAS ══ */}
        {sinMaterias && !isLoading && (
          <Alert severity="info" sx={{ borderRadius: '16px', py: 2 }}>
            No se encontraron asignaciones docentes activas en este período. Si consideras que se trata de un error, por favor comunícate con la administración.
          </Alert>
        )}

        {/* ══ ESTADO: SIN RESULTADOS POR FILTRO ══ */}
        {!sinMaterias && !isLoading && materiasFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              No se encontraron materias para este filtro o trimestre.
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Prueba cambiando el trimestre seleccionado o limpiando los filtros de búsqueda.
            </Typography>
          </Box>
        )}

        {/* ══ CONTENIDO: VISTA DE TARJETAS ══ */}
        {!isLoading && materiasFiltradas.length > 0 && viewMode === 'cards' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(260px, 1fr))',
                md: 'repeat(auto-fill, minmax(270px, 1fr))',
                lg: 'repeat(auto-fill, minmax(280px, 1fr))',
                xl: 'repeat(4, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {materiasFiltradas.map((materia) => (
              <CalificacionCard
                key={`${materia.asignacion_id}-${materia.periodo_evaluacion_id}`}
                materia={materia}
                accentColor={accentColor}
                gradBg={gradBg}
                isDark={isDark}
                onView={handleView}
              />
            ))}

            {/* Tarjeta Consolidada de Nivel Inicial (Centralizador e Informe Oficial SEP) */}
            {paralelosInicial.map((paralelo) => (
              <CentralizadorInicialCard
                key={`centralizador-${paralelo.paralelo_id}`}
                paralelo={paralelo}
                accentColor={accentColor}
                isDark={isDark}
                onView={(pId) => router.push(`/dashboard/docente/calificaciones/informe-inicial/${pId}`)}
              />
            ))}
          </Box>
        )}

        {/* ══ CONTENIDO: VISTA DE TABLA / LISTA ══ */}
        {!isLoading && materiasFiltradas.length > 0 && viewMode === 'table' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {materiasFiltradas.map((materia) => (
              <CalificacionRow
                key={`${materia.asignacion_id}-${materia.periodo_evaluacion_id}`}
                materia={materia}
                accentColor={accentColor}
                gradBg={gradBg}
                isDark={isDark}
                onView={handleView}
              />
            ))}

            {/* Fila Consolidada de Nivel Inicial (Centralizador) */}
            {paralelosInicial.map((paralelo) => (
              <CentralizadorInicialRow
                key={`centralizador-row-${paralelo.paralelo_id}`}
                paralelo={paralelo}
                accentColor={accentColor}
                isDark={isDark}
                onView={(pId) => router.push(`/dashboard/docente/calificaciones/informe-inicial/${pId}`)}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}