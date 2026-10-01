'use client';
// components/estudiante/asistencia/CalendarioAsistencia.tsx
// Calendario de asistencia estudiantil con diseño unificado

import React, { useState, useMemo } from 'react';
import {
  Box, Typography, alpha, useTheme, IconButton,
  Chip, Paper, Tooltip, Fade, Skeleton,
} from '@mui/material';
import {
  ChevronLeftRounded as PrevIcon,
  ChevronRightRounded as NextIcon,
  CheckCircleRounded as PresenteIcon,
  CancelRounded as AusenteIcon,
  AssignmentTurnedInRounded as JustificadoIcon,
  AccessTimeRounded as TardanzaIcon,
} from '@mui/icons-material';
import { SinDatos } from './SinDatos';

interface CalendarioAsistenciaProps {
  detalle: any[];
  isLoading: boolean;
  accent: string;
  isDark: boolean;
}

export const CalendarioAsistencia: React.FC<CalendarioAsistenciaProps> = ({
  detalle,
  isLoading,
  accent,
  isDark,
}) => {
  const [mesActual, setMesActual] = useState(new Date());

  // Datos del calendario
  const calendarioData = useMemo(() => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();

    // Primer y último día del mes
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);

    // Días a mostrar (incluyendo días del mes anterior y siguiente)
    const diasSemana = primerDia.getDay(); // 0 = domingo
    const totalDias = ultimoDia.getDate();

    const dias: Array<{
      fecha: Date;
      esDelMes: boolean;
      asistencias: any[];
      estado: 'presente' | 'ausente' | 'mixto' | 'sin-datos';
    }> = [];

    // Días del mes anterior
    const ultimoDiaMesAnterior = new Date(year, month, 0).getDate();
    for (let i = diasSemana - 1; i >= 0; i--) {
      dias.push({
        fecha: new Date(year, month - 1, ultimoDiaMesAnterior - i),
        esDelMes: false,
        asistencias: [],
        estado: 'sin-datos',
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= totalDias; dia++) {
      const fecha = new Date(year, month, dia);
      const fechaStr = fecha.toISOString().split('T')[0];

      const asistenciasDia = detalle.filter(d =>
        d.fecha?.split('T')[0] === fechaStr
      );

      let estado: 'presente' | 'ausente' | 'mixto' | 'sin-datos' = 'sin-datos';

      if (asistenciasDia.length > 0) {
        const presentes = asistenciasDia.filter(a => a.estado === 'presente').length;
        const ausentes = asistenciasDia.filter(a => a.estado === 'ausente').length;

        if (presentes === asistenciasDia.length) estado = 'presente';
        else if (ausentes === asistenciasDia.length) estado = 'ausente';
        else estado = 'mixto';
      }

      dias.push({
        fecha,
        esDelMes: true,
        asistencias: asistenciasDia,
        estado,
      });
    }

    // Días del mes siguiente
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 días
    for (let dia = 1; dia <= diasRestantes; dia++) {
      dias.push({
        fecha: new Date(year, month + 1, dia),
        esDelMes: false,
        asistencias: [],
        estado: 'sin-datos',
      });
    }

    return dias;
  }, [mesActual, detalle]);

  const mesNombre = mesActual.toLocaleDateString('es-BO', {
    month: 'long',
    year: 'numeric',
  });

  const handleMesAnterior = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1));
  };

  const handleMesSiguiente = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1));
  };

  const handleHoy = () => {
    setMesActual(new Date());
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: '18px' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Barra de control de mes */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '16px',
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={800} sx={{ textTransform: 'capitalize', letterSpacing: -0.3 }}>
            {mesNombre}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label="Hoy"
              onClick={handleHoy}
              size="small"
              clickable
              sx={{
                borderRadius: '8px',
                bgcolor: alpha(accent, 0.15),
                color: accent,
                fontWeight: 800,
                fontSize: '0.75rem',
                border: `1px solid ${alpha(accent, 0.3)}`,
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(accent, 0.25) },
              }}
            />

            <IconButton onClick={handleMesAnterior} size="small" sx={{ borderRadius: '10px' }}>
              <PrevIcon />
            </IconButton>

            <IconButton onClick={handleMesSiguiente} size="small" sx={{ borderRadius: '10px' }}>
              <NextIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Leyenda de colores */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 2, flexWrap: 'wrap', px: 0.5 }}>
        <LeyendaItem color="#10b981" label="Todas presentes" isDark={isDark} />
        <LeyendaItem color="#ef4444" label="Inasistencias" isDark={isDark} />
        <LeyendaItem color="#f59e0b" label="Mixto o atrasos" isDark={isDark} />
        <LeyendaItem color={isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15)} label="Sin clases" isDark={isDark} />
      </Box>

      {/* Grid del calendario */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
          border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          borderRadius: '18px',
          p: { xs: 1.5, sm: 2.5 },
          overflow: 'hidden',
        }}
      >
        {/* Días de la semana */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          mb: 1.5,
        }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
            <Typography
              key={dia}
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              align="center"
              sx={{ textTransform: 'uppercase', fontSize: '0.72rem' }}
            >
              {dia}
            </Typography>
          ))}
        </Box>

        {/* Días del mes */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
        }}>
          {calendarioData.map((dia, idx) => (
            <DiaCelda
              key={idx}
              dia={dia}
              isDark={isDark}
              accent={accent}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

// ── Componente de celda de día ────────────────────────────
const DiaCelda: React.FC<{
  dia: {
    fecha: Date;
    esDelMes: boolean;
    asistencias: any[];
    estado: 'presente' | 'ausente' | 'mixto' | 'sin-datos';
  };
  isDark: boolean;
  accent: string;
}> = ({ dia, isDark, accent }) => {
  const esHoy = dia.fecha.toDateString() === new Date().toDateString();

  const bgColor =
    dia.estado === 'presente' ? alpha('#10b981', isDark ? 0.16 : 0.1) :
    dia.estado === 'ausente' ? alpha('#ef4444', isDark ? 0.16 : 0.1) :
    dia.estado === 'mixto' ? alpha('#f59e0b', isDark ? 0.16 : 0.1) :
    'transparent';

  const borderColor =
    dia.estado === 'presente' ? alpha('#10b981', 0.35) :
    dia.estado === 'ausente' ? alpha('#ef4444', 0.35) :
    dia.estado === 'mixto' ? alpha('#f59e0b', 0.35) :
    isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06);

  const tooltipContent = dia.asistencias.length > 0 ? (
    <Box>
      <Typography variant="caption" fontWeight={800} sx={{ mb: 0.5, display: 'block' }}>
        {dia.fecha.toLocaleDateString('es-BO', { day: 'numeric', month: 'long' })}
      </Typography>
      {dia.asistencias.map((a, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.4 }}>
          {a.estado === 'presente' && <PresenteIcon sx={{ fontSize: 13, color: '#10b981' }} />}
          {a.estado === 'ausente' && <AusenteIcon sx={{ fontSize: 13, color: '#ef4444' }} />}
          {a.estado === 'justificado' && <JustificadoIcon sx={{ fontSize: 13, color: '#8b5cf6' }} />}
          {a.estado === 'tardanza' && <TardanzaIcon sx={{ fontSize: 13, color: '#f59e0b' }} />}
          <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>
            {a.materia_nombre}
          </Typography>
        </Box>
      ))}
    </Box>
  ) : null;

  return (
    <Tooltip title={tooltipContent || ''} arrow placement="top">
      <Box
        sx={{
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '11px',
          border: `1.5px solid ${esHoy ? accent : borderColor}`,
          bgcolor: bgColor,
          opacity: dia.esDelMes ? 1 : 0.35,
          cursor: dia.asistencias.length > 0 ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          position: 'relative',
          '&:hover': dia.asistencias.length > 0 ? {
            transform: 'scale(1.06)',
            zIndex: 10,
            boxShadow: `0 4px 14px ${alpha(borderColor, 0.4)}`,
          } : {},
        }}
      >
        <Typography
          variant="body2"
          fontWeight={esHoy ? 900 : dia.esDelMes ? 700 : 500}
          sx={{
            color: esHoy ? accent : dia.esDelMes ? 'text.primary' : 'text.disabled',
            fontSize: '0.85rem',
          }}
        >
          {dia.fecha.getDate()}
        </Typography>

        {dia.asistencias.length > 0 && (
          <Box sx={{
            display: 'flex',
            gap: 0.3,
            mt: 0.3,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {dia.asistencias.slice(0, 3).map((a, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  bgcolor: a.estado === 'presente' ? '#10b981' :
                           a.estado === 'ausente' ? '#ef4444' :
                           a.estado === 'justificado' ? '#8b5cf6' :
                           '#f59e0b',
                }}
              />
            ))}
          </Box>
        )}

        {esHoy && (
          <Box
            sx={{
              position: 'absolute',
              top: 3,
              right: 3,
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: accent,
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
};

// ── Componente de leyenda ──────────────────────────────────
const LeyendaItem: React.FC<{ color: string; label: string; isDark: boolean }> = ({
  color,
  label,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: color,
        border: `1px solid ${alpha(color, 0.5)}`,
      }}
    />
    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.74rem' }}>
      {label}
    </Typography>
  </Box>
);

export default CalendarioAsistencia;