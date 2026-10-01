'use client';
// app/dashboard/docente/asistencia/page.tsx
// Estilo unificado con Temario, Calificaciones y Notas

import React, { useState, useMemo } from 'react';
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
  EventAvailable as EventAvailableIcon,
  ChevronRight as ChevronRightIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  CheckCircleRounded as CheckCircleRoundedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  CalendarToday as CalendarTodayIcon,
  Today as TodayIcon,
  GroupsRounded as GroupsRoundedIcon,
  FactCheckRounded as FactCheckIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  WarningAmberRounded as WarningAmberIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMisAsignaciones } from '@/hooks/useAsistencia';
import { AsignacionDocente } from '@/services/asistenciaService';
import { sortCursos, sortGrados } from '@/utils/cursoUtils';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

// ─── Selector de fecha ────────────────────────────────────────────────────────
const SelectorFecha: React.FC<{
  fecha: string;
  onChange: (f: string) => void;
  accentColor: string;
  isDark: boolean;
}> = ({ fecha, onChange, accentColor, isDark }) => {
  const d = new Date();
  const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const esHoy = fecha === hoy;

  const fechaDisplay = new Date(fecha + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        p: 1.5,
        px: 2,
        borderRadius: '16px',
        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      }}
    >
      <CalendarTodayIcon sx={{ color: accentColor, fontSize: 18 }} />
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{
          flex: 1,
          textTransform: 'capitalize',
          color: 'text.primary',
          fontSize: '0.82rem',
        }}
      >
        {fechaDisplay}
      </Typography>
      {esHoy && (
        <Chip
          label="HOY"
          size="small"
          icon={<TodayIcon sx={{ fontSize: '12px !important' }} />}
          sx={{
            height: 22,
            fontSize: '0.65rem',
            fontWeight: 800,
            bgcolor: alpha(accentColor, 0.12),
            color: accentColor,
            border: `1px solid ${alpha(accentColor, 0.25)}`,
            '& .MuiChip-icon': { color: accentColor },
          }}
        />
      )}
      <TextField
        type="date"
        size="small"
        value={fecha}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ max: hoy }}
        sx={{
          width: 145,
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            fontSize: 12,
            fontWeight: 600,
            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
          },
        }}
      />
    </Box>
  );
};

// ─── Card de Asistencia (Mismo formato compacto Temario / Calificaciones) ──────
interface AsistenciaCardProps {
  asignacion: AsignacionDocente;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onView: (asig: AsignacionDocente) => void;
}

const AsistenciaCard: React.FC<AsistenciaCardProps> = ({
  asignacion,
  accentColor,
  gradBg,
  isDark,
  onView,
}) => {
  const completada = asignacion.asistencia_completa;
  const porcentaje = asignacion.total_estudiantes
    ? Math.round((asignacion.total_marcados / asignacion.total_estudiantes) * 100)
    : 0;

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '18px',
          border: `1px solid ${completada ? alpha('#10b981', 0.35) : alpha(isDark ? '#fff' : '#000', 0.08)}`,
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
        onClick={() => onView(asignacion)}
      >
        {/* Badge de Paralelo arriba a la izquierda */}
        <Chip
          label={`Paralelo "${asignacion.paralelo_nombre}"`}
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

        {/* Chip de Estado arriba a la derecha */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
          {completada ? (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: '#16a34a !important' }} />}
              label="Lista pasada"
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
          ) : asignacion.tiene_clase_hoy === false ? (
            <Tooltip title={asignacion.dias_texto ? `Días asignados: ${asignacion.dias_texto}` : 'Sin horario hoy'}>
              <Chip
                icon={<CalendarMonthIcon sx={{ fontSize: '12px !important', color: '#d97706 !important' }} />}
                label="Sin clase hoy"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 22,
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                  color: '#d97706',
                  border: `1px solid ${alpha('#f59e0b', 0.25)}`,
                }}
              />
            </Tooltip>
          ) : (
            <Chip
              icon={<RadioButtonUncheckedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
              label="Pendiente"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: isDark ? alpha(accentColor, 0.12) : alpha(accentColor, 0.08),
                color: accentColor,
                border: `1px solid ${alpha(accentColor, 0.25)}`,
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
                asignacion.nivel_nombre ? (
                  <Tooltip title={`Nivel: ${asignacion.nivel_nombre}`}>
                    <Chip
                      icon={<SchoolIcon sx={{ fontSize: 11 }} />}
                      label={asignacion.nivel_nombre}
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
                  bgcolor: completada ? '#10b981' : asignacion.tiene_clase_hoy === false ? (isDark ? '#374151' : '#9ca3af') : accentColor,
                  color: isDark ? '#000' : '#fff',
                  border: `3px solid ${alpha(completada ? '#10b981' : asignacion.tiene_clase_hoy === false ? '#9ca3af' : accentColor, 0.2)}`,
                  boxShadow: `0 6px 14px ${alpha(completada ? '#10b981' : asignacion.tiene_clase_hoy === false ? '#9ca3af' : accentColor, 0.25)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <EventAvailableIcon sx={{ fontSize: 36, color: '#fff' }} />
              </Avatar>
            </Badge>
          </Box>

          {/* Nombre de la Materia */}
          <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.3 }}>
            {asignacion.materia_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.78rem' }}>
            {asignacion.grado_nombre}
          </Typography>

          {/* Horario Escolar / Turno */}
          <Box sx={{ my: 0.6, display: 'flex', justifyContent: 'center', gap: 0.6, flexWrap: 'wrap' }}>
            {asignacion.tiene_clase_hoy ? (
              <>
                <Chip
                  icon={<AccessTimeIcon sx={{ fontSize: '12px !important', color: `${accentColor} !important` }} />}
                  label={asignacion.horarios_dia || (asignacion.turno_nombre ? `Turno: ${asignacion.turno_nombre}` : 'En horario')}
                  size="small"
                  sx={{
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: '0.66rem',
                    height: 22,
                    backgroundColor: alpha(accentColor, 0.12),
                    color: accentColor,
                    border: `1px solid ${alpha(accentColor, 0.25)}`,
                  }}
                />
                {asignacion.aula_dia && (
                  <Chip
                    label={`Aula ${asignacion.aula_dia}`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.63rem',
                      height: 22,
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                    }}
                  />
                )}
              </>
            ) : (
              <Tooltip title={asignacion.dias_texto ? `Días asignados: ${asignacion.dias_texto}` : 'Sin horario registrado'}>
                <Chip
                  icon={<CalendarMonthIcon sx={{ fontSize: '12px !important', color: 'text.secondary !important' }} />}
                  label={asignacion.dias_texto ? `Días: ${asignacion.dias_texto}` : (asignacion.turno_nombre ? `Turno ${asignacion.turno_nombre}` : 'No programada')}
                  size="small"
                  sx={{
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    fontSize: '0.64rem',
                    height: 22,
                    backgroundColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                    color: 'text.secondary',
                  }}
                />
              </Tooltip>
            )}
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
                borderColor: asignacion.tiene_clase_hoy === false && !completada
                  ? alpha(isDark ? '#fff' : '#000', 0.2)
                  : alpha(accentColor, 0.35),
                color: asignacion.tiene_clase_hoy === false && !completada
                  ? 'text.secondary'
                  : accentColor,
                transition: 'all 0.2s ease',
              }}
            >
              {completada ? 'Ver Asistencia' : asignacion.tiene_clase_hoy === false ? 'Ver Materia' : 'Pasar Lista'}
            </Button>
          </Box>

          {/* Información adicional y progreso */}
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
                {asignacion.total_estudiantes ?? 0}
              </Typography>
            </Box>

            {/* Marcados */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <FactCheckIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Marcados:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {asignacion.total_marcados} / {asignacion.total_estudiantes}
              </Typography>
            </Box>

            {/* Mini Desglose P, A, T, J */}
            <Box sx={{ display: 'flex', gap: 0.5, pt: 0.3, pb: 0.3 }}>
              {[
                { label: 'P', val: asignacion.presentes ?? 0, color: '#10b981', desc: 'Presentes' },
                { label: 'A', val: asignacion.ausentes ?? 0, color: '#ef4444', desc: 'Ausentes' },
                { label: 'T', val: asignacion.tardanzas ?? 0, color: '#f59e0b', desc: 'Tardanzas' },
                { label: 'J', val: asignacion.justificados ?? 0, color: '#3b82f6', desc: 'Justificados' },
              ].map(({ label, val, color, desc }) => (
                <Tooltip key={label} title={`${desc}: ${val}`}>
                  <Box
                    sx={{
                      flex: 1,
                      textAlign: 'center',
                      py: 0.4,
                      px: 0.2,
                      borderRadius: '7px',
                      bgcolor: alpha(color, isDark ? 0.12 : 0.08),
                      border: `1px solid ${alpha(color, 0.25)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.58rem', fontWeight: 700, display: 'block' }}>
                      {label}
                    </Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.68rem', color: color }}>
                      {val}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>

            {/* Progreso del día */}
            <Box sx={{ pt: 0.3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                  Progreso del día
                </Typography>
                <Typography variant="caption" fontWeight={800} sx={{ color: completada ? '#10b981' : accentColor, fontSize: '0.7rem' }}>
                  {porcentaje}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={porcentaje}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  '& .MuiLinearProgress-bar': {
                    background: completada ? 'linear-gradient(90deg, #10b981, #34d399)' : gradBg,
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

// ─── Fila de Asistencia (Vista Lista/Tabla) ───────────────────────────────────
interface AsistenciaRowProps {
  asignacion: AsignacionDocente;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onView: (asig: AsignacionDocente) => void;
}

const AsistenciaRow: React.FC<AsistenciaRowProps> = ({
  asignacion,
  accentColor,
  gradBg,
  isDark,
  onView,
}) => {
  const completada = asignacion.asistencia_completa;
  const porcentaje = asignacion.total_estudiantes
    ? Math.round((asignacion.total_marcados / asignacion.total_estudiantes) * 100)
    : 0;

  return (
    <Fade in timeout={250}>
      <Card
        onClick={() => onView(asignacion)}
        sx={{
          borderRadius: '14px',
          border: `1px solid ${completada ? alpha('#10b981', 0.35) : alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          p: 1.6,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateX(4px)',
            borderColor: accentColor,
            boxShadow: `0 4px 16px ${alpha(accentColor, 0.12)}`,
          },
        }}
      >
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: completada ? '#10b981' : accentColor,
            color: '#fff',
            boxShadow: `0 3px 8px ${alpha(accentColor, 0.3)}`,
            flexShrink: 0,
          }}
        >
          <EventAvailableIcon sx={{ fontSize: 22 }} />
        </Avatar>

        <Box sx={{ minWidth: 160, flex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap>
              {asignacion.materia_nombre}
            </Typography>
            <Chip
              label={`Par. ${asignacion.paralelo_nombre}`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.62rem',
                height: 19,
                bgcolor: alpha(accentColor, 0.1),
                color: accentColor,
              }}
            />
            {asignacion.tiene_clase_hoy ? (
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: '11px !important', color: `${accentColor} !important` }} />}
                label={asignacion.horarios_dia || 'En horario hoy'}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  height: 19,
                  bgcolor: alpha(accentColor, 0.12),
                  color: accentColor,
                }}
              />
            ) : (
              <Tooltip title={asignacion.dias_texto ? `Días asignados: ${asignacion.dias_texto}` : 'Sin clase hoy'}>
                <Chip
                  label={asignacion.dias_texto ? `Días: ${asignacion.dias_texto}` : 'Sin clase hoy'}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.6rem',
                    height: 19,
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                    color: 'text.secondary',
                  }}
                />
              </Tooltip>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {asignacion.grado_nombre} · {asignacion.turno_nombre}
            {asignacion.aula_dia ? ` · Aula ${asignacion.aula_dia}` : ''}
          </Typography>
        </Box>

        {/* Desglose P, A, T, J compacto */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.6, flex: 1.5, justifyContent: 'center' }}>
          {[
            { label: 'P', val: asignacion.presentes ?? 0, color: '#10b981' },
            { label: 'A', val: asignacion.ausentes ?? 0, color: '#ef4444' },
            { label: 'T', val: asignacion.tardanzas ?? 0, color: '#f59e0b' },
            { label: 'J', val: asignacion.justificados ?? 0, color: '#3b82f6' },
          ].map(({ label, val, color }) => (
            <Box
              key={label}
              sx={{
                px: 1,
                py: 0.3,
                borderRadius: '6px',
                bgcolor: alpha(color, 0.1),
                border: `1px solid ${alpha(color, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
              }}
            >
              <Typography variant="caption" fontWeight={800} sx={{ color, fontSize: '0.68rem' }}>
                {val}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.58rem', fontWeight: 700 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Estudiantes & Marcados */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 100, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
            Marcados
          </Typography>
          <Typography variant="body2" fontWeight={800}>
            {asignacion.total_marcados} / {asignacion.total_estudiantes}
          </Typography>
        </Box>

        {/* Progreso */}
        <Box sx={{ width: { xs: 80, sm: 120 }, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
              Progreso
            </Typography>
            <Typography variant="caption" fontWeight={800} sx={{ color: completada ? '#10b981' : accentColor, fontSize: '0.65rem' }}>
              {porcentaje}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={porcentaje}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              '& .MuiLinearProgress-bar': {
                background: completada ? 'linear-gradient(90deg, #10b981, #34d399)' : gradBg,
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Estado y botón */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexShrink: 0 }}>
          {completada ? (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: '#16a34a !important' }} />}
              label="Lista pasada"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                bgcolor: alpha('#16a34a', 0.12),
                color: '#16a34a',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          ) : asignacion.tiene_clase_hoy === false ? (
            <Chip
              label="Sin clase hoy"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                bgcolor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
                color: '#d97706',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          ) : (
            <Chip
              label="Pendiente"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                bgcolor: alpha(accentColor, 0.12),
                color: accentColor,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          )}
          <Button
            size="small"
            variant="outlined"
            endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.72rem',
              py: 0.3,
              px: 1.2,
              borderColor: asignacion.tiene_clase_hoy === false && !completada
                ? alpha(isDark ? '#fff' : '#000', 0.2)
                : alpha(accentColor, 0.3),
              color: asignacion.tiene_clase_hoy === false && !completada
                ? 'text.secondary'
                : accentColor,
            }}
          >
            {completada ? 'Ver' : asignacion.tiene_clase_hoy === false ? 'Ver' : 'Pasar'}
          </Button>
        </Box>
      </Card>
    </Fade>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function DocenteAsistenciaPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { user } = useAuth();

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;

  const { asignaciones, totalConClaseHoy, fecha, isLoading, sinAsignaciones, cambiarFecha } = useMisAsignaciones();

  // Estados locales de filtrado y visualización
  const [filtroTipo, setFiltroTipo] = useState<'del_dia' | 'todas'>('del_dia');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'completada' | 'pendiente'>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleIr = (a: AsignacionDocente) => {
    const tabParam = a.tiene_clase_hoy === false && !a.asistencia_completa ? '&tab=resumen' : '';
    router.push(`/dashboard/docente/asistencia/${a.asignacion_id}?fecha=${fecha}${tabParam}`);
  };

  // Grados disponibles (ordenados naturalmente: 1ro, 2do, 3ro...)
  const gradosDisponibles = useMemo(() => {
    const setG = new Set<string>();
    asignaciones.forEach((a) => {
      if (a.grado_nombre) setG.add(a.grado_nombre);
    });
    return sortGrados(Array.from(setG));
  }, [asignaciones]);

  // Resumen métricas
  const materiasDelDia = useMemo(() =>
    asignaciones.filter((a) => a.tiene_clase_hoy !== false), [asignaciones]);
  const totalMateriasDelDia = materiasDelDia.length;
  const pasadasDelDia = useMemo(() =>
    materiasDelDia.filter((a) => a.asistencia_completa).length, [materiasDelDia]);
  const pendientesDelDia = totalMateriasDelDia - pasadasDelDia;

  const totalMaterias = asignaciones.length;
  const totalPasadas = useMemo(() =>
    asignaciones.filter((a) => a.asistencia_completa).length, [asignaciones]);
  const totalPendientes = totalMaterias - totalPasadas;

  // Asignaciones filtradas (ordenadas por cursos: 1ro, 2do, 3ro...)
  const asignacionesFiltradas = useMemo(() => {
    const filtradas = asignaciones.filter((a) => {
      const matchTipo =
        filtroTipo === 'todas' || a.tiene_clase_hoy !== false;
      const matchGrado = !gradoFilter || a.grado_nombre === gradoFilter;
      const matchSearch =
        !searchTerm ||
        a.materia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.grado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.paralelo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.materia_codigo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado =
        estadoFilter === 'todos' ||
        (estadoFilter === 'completada' && a.asistencia_completa) ||
        (estadoFilter === 'pendiente' && !a.asistencia_completa);
      return matchTipo && matchGrado && matchSearch && matchEstado;
    });

    return sortCursos(filtradas);
  }, [asignaciones, filtroTipo, gradoFilter, searchTerm, estadoFilter]);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* ══ HEADER ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                mb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    background: gradBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 14px ${alpha(accentColor, 0.35)}`,
                    animation: `${bounce} 2s ease-in-out infinite`,
                  }}
                >
                  <EventAvailableIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '1.9rem', md: '2.2rem' },
                      fontWeight: 900,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.2,
                    }}
                  >
                    Control de Asistencia
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.2 }}>
                    Hola, <strong>{user?.username}</strong> — asistencias sincronizadas con el horario escolar oficial.
                  </Typography>
                </Box>
              </Box>

              {/* Selector de Fecha */}
              <Box sx={{ minWidth: { xs: '100%', sm: 320 } }}>
                <SelectorFecha
                  fecha={fecha}
                  onChange={cambiarFecha}
                  accentColor={accentColor}
                  isDark={isDark}
                />
              </Box>
            </Box>

            {/* ══ SELECTOR DE VISTA: CLASES DEL DÍA vs TODAS ══ */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mt: 2, mb: 1 }}>
              <ToggleButtonGroup
                value={filtroTipo}
                exclusive
                onChange={(_, val) => { if (val) setFiltroTipo(val); }}
                size="small"
                sx={{
                  borderRadius: '12px',
                  bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                  p: 0.3,
                  '& .MuiToggleButton-root': {
                    borderRadius: '10px !important',
                    border: 'none',
                    px: 1.8,
                    py: 0.6,
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    textTransform: 'none',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      background: gradBg,
                      color: isDark ? '#000' : '#fff',
                      boxShadow: `0 2px 8px ${alpha(accentColor, 0.3)}`,
                    },
                  },
                }}
              >
                <ToggleButton value="del_dia">
                  📅 Clases del día ({totalMateriasDelDia})
                </ToggleButton>
                <ToggleButton value="todas">
                  📚 Todas mis materias ({totalMaterias})
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Chips de estado correspondientes al filtro activo */}
              {!isLoading && totalMaterias > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: { sm: 1 } }}>
                  <Chip
                    icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: '#16a34a !important' }} />}
                    label={filtroTipo === 'del_dia' ? `Pasadas hoy: ${pasadasDelDia}` : `Pasadas: ${totalPasadas}`}
                    size="small"
                    onClick={() => setEstadoFilter(estadoFilter === 'completada' ? 'todos' : 'completada')}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      bgcolor: estadoFilter === 'completada' ? '#16a34a' : alpha('#16a34a', 0.1),
                      color: estadoFilter === 'completada' ? '#fff' : '#16a34a',
                      border: `1px solid ${alpha('#16a34a', 0.25)}`,
                      '&:hover': { opacity: 0.9 },
                    }}
                  />
                  <Chip
                    icon={<RadioButtonUncheckedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
                    label={filtroTipo === 'del_dia' ? `Pendientes hoy: ${pendientesDelDia}` : `Pendientes: ${totalPendientes}`}
                    size="small"
                    onClick={() => setEstadoFilter(estadoFilter === 'pendiente' ? 'todos' : 'pendiente')}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      bgcolor: estadoFilter === 'pendiente' ? accentColor : alpha(accentColor, 0.1),
                      color: estadoFilter === 'pendiente' ? (isDark ? '#000' : '#fff') : accentColor,
                      border: `1px solid ${alpha(accentColor, 0.25)}`,
                      '&:hover': { opacity: 0.9 },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* ══ BARRA DE FILTROS & VISTA ══ */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                mt: 1.5,
                borderRadius: '16px',
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              }}
            >
              {/* BUSCADOR */}
              <TextField
                placeholder="Buscar materia, grado, paralelo o turno..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 280px' },
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
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
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
                <ToggleButton value="table" aria-label="vista de lista">
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

        {/* ══ SIN ASIGNACIONES ══ */}
        {sinAsignaciones && !isLoading && (
          <Alert severity="info" sx={{ borderRadius: '16px', py: 2 }}>
            No tenés asignaciones activas para este período académico. Contactá a secretaría o administración.
          </Alert>
        )}

        {/* ══ AVISO: SIN CLASES PROGRAMADAS PARA ESTA FECHA ══ */}
        {!sinAsignaciones && !isLoading && filtroTipo === 'del_dia' && totalMateriasDelDia === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
              borderRadius: '18px',
              border: `1.5px dashed ${alpha(isDark ? '#fff' : '#000', 0.15)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
              mb: 3,
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 48, color: accentColor, opacity: 0.7, mb: 1.5 }} />
            <Typography variant="h6" fontWeight={800} gutterBottom>
              No tienes clases programadas en esta fecha
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 540, mx: 'auto', mb: 2.5 }}>
              Según el horario escolar oficial publicado, hoy no tienes períodos de clase asignados. Puedes cambiar la fecha seleccionada arriba o revisar todas tus materias.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setFiltroTipo('todas')}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                textTransform: 'none',
                borderColor: alpha(accentColor, 0.4),
                color: accentColor,
                px: 3,
              }}
            >
              Ver todas mis materias ({totalMaterias})
            </Button>
          </Box>
        )}

        {/* ══ SIN RESULTADOS POR FILTRO ══ */}
        {!sinAsignaciones && !isLoading && asignacionesFiltradas.length === 0 && !(filtroTipo === 'del_dia' && totalMateriasDelDia === 0) && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              No se encontraron materias con los filtros seleccionados.
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Prueba cambiando entre "Clases del día" y "Todas mis materias" o limpiando el buscador.
            </Typography>
          </Box>
        )}

        {/* ══ VISTA DE TARJETAS (Mismo grid y tamaño minmax(260px, 1fr) que Temario / Calificaciones) ══ */}
        {!isLoading && asignacionesFiltradas.length > 0 && viewMode === 'cards' && (
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
            {asignacionesFiltradas.map((asig) => (
              <AsistenciaCard
                key={asig.asignacion_id}
                asignacion={asig}
                accentColor={accentColor}
                gradBg={gradBg}
                isDark={isDark}
                onView={handleIr}
              />
            ))}
          </Box>
        )}

        {/* ══ VISTA DE TABLA / LISTA ══ */}
        {!isLoading && asignacionesFiltradas.length > 0 && viewMode === 'table' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {asignacionesFiltradas.map((asig) => (
              <AsistenciaRow
                key={asig.asignacion_id}
                asignacion={asig}
                accentColor={accentColor}
                gradBg={gradBg}
                isDark={isDark}
                onView={handleIr}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}