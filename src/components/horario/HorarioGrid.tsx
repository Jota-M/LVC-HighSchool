// components/horario/HorarioGrid.tsx
'use client';
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Tooltip, IconButton,
  Chip, alpha, useTheme, CircularProgress,
  ButtonBase,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  MeetingRoom as AulaIcon,
  Coffee as RecresoIcon,
} from '@mui/icons-material';
import { DIAS_SEMANA, BloqueHorario, HorarioDetalle, HorarioEstado } from '@/types/horariotypes';
import { CeldaModal } from './CeldaModal';

interface CeldaTarget {
  dia_semana: number;
  bloque_horario_id: number;
  bloque_nombre: string;
  hora_inicio: string;
  hora_fin: string;
  existing?: HorarioDetalle;
}

interface Props {
  horarioId: number;
  gradoId: number;
  paraleloId: number;
  periodoId: number;
  turnoId: number;
  bloques: BloqueHorario[];
  celdas: HorarioDetalle[];
  estado: HorarioEstado;
  isLoading?: boolean;
  diasActivos?: number[];
}

// Días que muestra la grilla — por defecto L-V, configurable
const DEFAULT_DIAS = [1, 2, 3, 4, 5];

export const HorarioGrid: React.FC<Props> = ({
  horarioId, gradoId, paraleloId, periodoId,
  bloques, celdas, estado, isLoading,
  diasActivos = DEFAULT_DIAS,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [modalTarget, setModalTarget] = useState<CeldaTarget | null>(null);
  const readonly = estado === 'archivado';

  const accentColor = isDark ? '#facc15' : '#0288d1';

  // Índice rápido: [dia][bloque] → HorarioDetalle
  const celdaMap = useMemo(() => {
    const map: Record<string, HorarioDetalle> = {};
    celdas.forEach((c) => { map[`${c.dia_semana}-${c.bloque_horario_id}`] = c; });
    return map;
  }, [celdas]);

  const handleCellClick = (dia: number, bloque: BloqueHorario) => {
    if (bloque.es_recreo) return;
    const existing = celdaMap[`${dia}-${bloque.id}`];
    setModalTarget({
      dia_semana: dia,
      bloque_horario_id: bloque.id,
      bloque_nombre: bloque.nombre,
      hora_inicio: bloque.hora_inicio,
      hora_fin: bloque.hora_fin,
      existing,
    });
  };

  const COL_WIDTH = 140;
  const ROW_HEIGHT = 80;
  const RECREO_HEIGHT = 40;
  const HORA_COL = 90;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: accentColor }} />
      </Box>
    );
  }

  return (
    <>
      {/* Leyenda de estado */}
      {estado === 'borrador' && (
        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), border: '1px solid #f59e0b40', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="warning.main" fontWeight={600}>
            📝 Modo borrador — Haz clic en cualquier celda para asignar o editar clases. Publica el horario cuando esté listo.
          </Typography>
        </Box>
      )}
      {estado === 'archivado' && (
        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: alpha('#6b7280', 0.1), border: '1px dashed #6b728050' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            🔒 Horario archivado — Solo lectura
          </Typography>
        </Box>
      )}

      {/* Grid container con scroll horizontal en mobile */}
      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Box sx={{ minWidth: HORA_COL + COL_WIDTH * diasActivos.length + 16, position: 'relative' }}>

          {/* Header de días */}
          <Box sx={{ display: 'flex', mb: 1 }}>
            {/* Columna hora */}
            <Box sx={{ width: HORA_COL, flexShrink: 0 }} />
            {diasActivos.map((dia) => (
              <Box
                key={dia}
                sx={{
                  width: COL_WIDTH, flexShrink: 0, textAlign: 'center',
                  px: 1, py: 1,
                  borderRadius: 2,
                  mx: 0.5,
                  background: isDark
                    ? 'linear-gradient(135deg,#facc1522,#f59e0b11)'
                    : 'linear-gradient(135deg,#0288d122,#01579b11)',
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: accentColor }}>
                  {DIAS_SEMANA[dia]}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Filas de bloques */}
          {bloques.map((bloque) => {
            const isRecreo = bloque.es_recreo;
            const height = isRecreo ? RECREO_HEIGHT : ROW_HEIGHT;

            return (
              <Box key={bloque.id} sx={{ display: 'flex', mb: 0.5, alignItems: 'stretch' }}>
                {/* Columna hora */}
                <Box
                  sx={{
                    width: HORA_COL, flexShrink: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-end', justifyContent: 'center',
                    pr: 1.5, height,
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ fontSize: '0.7rem' }}>
                    {bloque.hora_inicio.slice(0, 5)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {bloque.hora_fin.slice(0, 5)}
                  </Typography>
                  {!isRecreo && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', mt: 0.3 }}>
                      {bloque.nombre}
                    </Typography>
                  )}
                </Box>

                {/* RECREO: celda que abarca todos los días */}
                {isRecreo ? (
                  <Box
                    sx={{
                      flex: 1, height: RECREO_HEIGHT, mx: 0.5,
                      borderRadius: 2, bgcolor: isDark ? '#ffffff0a' : '#f3f4f6',
                      border: `1px dashed ${isDark ? '#ffffff20' : '#d1d5db'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                    }}
                  >
                    <RecresoIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled" fontWeight={600}>
                      {bloque.nombre} · {bloque.hora_inicio.slice(0, 5)} – {bloque.hora_fin.slice(0, 5)}
                    </Typography>
                  </Box>
                ) : (
                  /* Celdas normales: una por día */
                  diasActivos.map((dia) => {
                    const celda = celdaMap[`${dia}-${bloque.id}`];
                    return (
                      <CeldaGridItem
                        key={dia}
                        celda={celda}
                        height={height}
                        width={COL_WIDTH}
                        readonly={readonly}
                        accentColor={accentColor}
                        isDark={isDark}
                        onClick={() => handleCellClick(dia, bloque)}
                      />
                    );
                  })
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Estadísticas de completitud */}
      <GridStats celdas={celdas} bloques={bloques} diasActivos={diasActivos} />

      {/* Modal de celda */}
      <CeldaModal
        open={!!modalTarget}
        onClose={() => setModalTarget(null)}
        target={modalTarget}
        horarioId={horarioId}
        gradoId={gradoId}
        paraleloId={paraleloId}
        periodoId={periodoId}
        readonly={readonly}
      />
    </>
  );
};

// =============================================
// Sub-componente: celda individual
// =============================================
interface CeldaGridItemProps {
  celda?: HorarioDetalle;
  height: number;
  width: number;
  readonly: boolean;
  accentColor: string;
  isDark: boolean;
  onClick: () => void;
}

const CeldaGridItem: React.FC<CeldaGridItemProps> = ({
  celda, height, width, readonly, accentColor, isDark, onClick,
}) => {
  const cellColor = celda?.color || celda?.materia_color || accentColor;

  if (!celda) {
    return (
      <ButtonBase
        onClick={readonly ? undefined : onClick}
        sx={{
          width, height, mx: 0.5, borderRadius: 2, flexShrink: 0,
          border: `2px dashed ${isDark ? '#ffffff15' : '#e5e7eb'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: readonly ? 'default' : 'pointer',
          transition: 'all 0.15s',
          '&:hover': readonly ? {} : {
            borderColor: accentColor,
            bgcolor: alpha(accentColor, 0.06),
            '& .add-icon': { opacity: 1 },
          },
        }}
      >
        {!readonly && (
          <AddIcon
            className="add-icon"
            sx={{ fontSize: 20, color: accentColor, opacity: 0.3, transition: 'opacity 0.15s' }}
          />
        )}
      </ButtonBase>
    );
  }

  // Celda con contenido
  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="caption" fontWeight={700}>{celda.materia_nombre}</Typography>
          {celda.docente_apellidos && (
            <Typography variant="caption" display="block">
              Prof. {celda.docente_apellidos}
            </Typography>
          )}
          {celda.aula && <Typography variant="caption" display="block">Aula: {celda.aula}</Typography>}
          {celda.observaciones && (
            <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', mt: 0.5 }}>
              {celda.observaciones}
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <ButtonBase
        onClick={onClick}
        sx={{
          width, height, mx: 0.5, borderRadius: 2, flexShrink: 0,
          background: `linear-gradient(135deg, ${cellColor}dd, ${cellColor}88)`,
          border: `2px solid ${cellColor}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'space-between',
          p: 1, cursor: 'pointer', textAlign: 'left',
          overflow: 'hidden',
          transition: 'all 0.15s',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${cellColor}44`,
            filter: 'brightness(1.05)',
          },
        }}
      >
        {/* Materia */}
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: '#fff', lineHeight: 1.2, fontSize: '0.7rem',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            textShadow: '0 1px 2px #0004',
          }}
        >
          {celda.materia_nombre}
        </Typography>

        {/* Docente y Aula */}
        <Box sx={{ width: '100%' }}>
          {celda.docente_apellidos && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <PersonIcon sx={{ fontSize: 10, color: '#ffffffcc' }} />
              <Typography variant="caption" sx={{ color: '#ffffffcc', fontSize: '0.62rem', lineHeight: 1 }}>
                {celda.docente_apellidos}
              </Typography>
            </Box>
          )}
          {celda.aula && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2 }}>
              <AulaIcon sx={{ fontSize: 10, color: '#ffffffaa' }} />
              <Typography variant="caption" sx={{ color: '#ffffffaa', fontSize: '0.6rem', lineHeight: 1 }}>
                {celda.aula}
              </Typography>
            </Box>
          )}
        </Box>
      </ButtonBase>
    </Tooltip>
  );
};

// =============================================
// Sub-componente: estadísticas de completitud
// =============================================
interface GridStatsProps {
  celdas: HorarioDetalle[];
  bloques: BloqueHorario[];
  diasActivos: number[];
}

const GridStats: React.FC<GridStatsProps> = ({ celdas, bloques, diasActivos }) => {
  const bloquesClase = bloques.filter((b) => !b.es_recreo);
  const totalSlots = bloquesClase.length * diasActivos.length;
  const asignadas = celdas.length;
  const porcentaje = totalSlots > 0 ? Math.round((asignadas / totalSlots) * 100) : 0;
  const sinDocente = celdas.filter((c) => !c.asignacion_docente_id).length;

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
      <Chip
        size="small"
        label={`${asignadas}/${totalSlots} celdas (${porcentaje}%)`}
        color={porcentaje === 100 ? 'success' : 'default'}
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
      {sinDocente > 0 && (
        <Chip
          size="small"
          label={`${sinDocente} sin docente`}
          color="warning"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      )}
      {porcentaje === 100 && sinDocente === 0 && (
        <Chip size="small" label="✅ Horario completo" color="success" sx={{ fontWeight: 700 }} />
      )}
    </Box>
  );
};

// Export con nombre correcto
export { GridStats };