'use client';
// components/estudiante/asistencia/CalendarioAsistencia.tsx

import React, { useState, useMemo } from 'react';
import {
  Box, Typography, alpha, useTheme, IconButton,
  Chip, Paper, Tooltip, Fade, Skeleton,
} from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  CheckCircle as PresenteIcon,
  Cancel as AusenteIcon,
  Warning as JustificadoIcon,
  HelpOutline as TardanzaIcon,
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

  const mesNombre = mesActual.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' });

  const handleMesAnterior = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1));
  };

  const handleMesSiguiente = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1));
  };

  const handleHoy = () => {
    setMesActual(new Date());
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: '14px' }} />
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: '14px' }} />
      </Box>
    );
  }

  if (!detalle || !detalle.length) {
    return (
      <SinDatos
        accent={accent}
        isDark={isDark}
        mensaje="No hay registros de asistencia para mostrar en el calendario."
      />
    );
  }

  return (
    <Box>
      {/* Header del calendario */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          borderRadius: '14px',
          p: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
            {mesNombre}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="Hoy"
              onClick={handleHoy}
              size="small"
              sx={{
                bgcolor: alpha(accent, 0.15),
                color: accent,
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(accent, 0.25) },
              }}
            />

            <IconButton onClick={handleMesAnterior} size="small">
              <PrevIcon />
            </IconButton>

            <IconButton onClick={handleMesSiguiente} size="small">
              <NextIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Leyenda */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <LeyendaItem color="#1D9E75" label="Todas presentes" isDark={isDark} />
        <LeyendaItem color="#D85A30" label="Alguna ausencia" isDark={isDark} />
        <LeyendaItem color="#BA7517" label="Mixto" isDark={isDark} />
        <LeyendaItem color={isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)} label="Sin clases" isDark={isDark} />
      </Box>

      {/* Grid del calendario */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          borderRadius: '14px',
          p: 2,
          overflow: 'hidden',
        }}
      >
        {/* Días de la semana */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          mb: 1,
        }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
            <Typography
              key={dia}
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              align="center"
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
    dia.estado === 'presente' ? alpha('#1D9E75', isDark ? 0.15 : 0.1) :
    dia.estado === 'ausente' ? alpha('#D85A30', isDark ? 0.15 : 0.1) :
    dia.estado === 'mixto' ? alpha('#BA7517', isDark ? 0.15 : 0.1) :
    'transparent';

  const borderColor =
    dia.estado === 'presente' ? alpha('#1D9E75', 0.3) :
    dia.estado === 'ausente' ? alpha('#D85A30', 0.3) :
    dia.estado === 'mixto' ? alpha('#BA7517', 0.3) :
    isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05);

  const tooltipContent = dia.asistencias.length > 0 ? (
    <Box>
      <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
        {dia.fecha.toLocaleDateString('es-BO', { day: 'numeric', month: 'long' })}
      </Typography>
      {dia.asistencias.map((a, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          {a.estado === 'presente' && <PresenteIcon sx={{ fontSize: 12, color: '#1D9E75' }} />}
          {a.estado === 'ausente' && <AusenteIcon sx={{ fontSize: 12, color: '#D85A30' }} />}
          {a.estado === 'justificado' && <JustificadoIcon sx={{ fontSize: 12, color: '#BA7517' }} />}
          {a.estado === 'tardanza' && <TardanzaIcon sx={{ fontSize: 12, color: '#7F77DD' }} />}
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
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
          borderRadius: 2,
          border: `1.5px solid ${esHoy ? accent : borderColor}`,
          bgcolor: bgColor,
          opacity: dia.esDelMes ? 1 : 0.4,
          cursor: dia.asistencias.length > 0 ? 'pointer' : 'default',
          transition: 'all 0.2s',
          position: 'relative',
          '&:hover': dia.asistencias.length > 0 ? {
            transform: 'scale(1.05)',
            zIndex: 10,
            boxShadow: `0 4px 12px ${alpha(borderColor, 0.3)}`,
          } : {},
        }}
      >
        <Typography
          variant="body2"
          fontWeight={esHoy ? 700 : dia.esDelMes ? 600 : 400}
          sx={{
            color: esHoy ? accent : dia.esDelMes ? 'text.primary' : 'text.disabled',
          }}
        >
          {dia.fecha.getDate()}
        </Typography>

        {dia.asistencias.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            gap: 0.25, 
            mt: 0.25,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {dia.asistencias.slice(0, 3).map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  bgcolor: dia.estado === 'presente' ? '#1D9E75' :
                           dia.estado === 'ausente' ? '#D85A30' :
                           '#BA7517',
                }}
              />
            ))}
          </Box>
        )}

        {esHoy && (
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
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
  isDark,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: 1,
        bgcolor: color,
        border: `1px solid ${alpha(color, 0.5)}`,
      }}
    />
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);