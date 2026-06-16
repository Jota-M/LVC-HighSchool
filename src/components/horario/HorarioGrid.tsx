// components/horario/HorarioGrid.tsx
'use client';
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Tooltip, IconButton,
  Chip, alpha, useTheme, CircularProgress,
  ButtonBase,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  MeetingRoom as AulaIcon,
  Coffee as RecresoIcon,
  EditNote as DraftIcon,
  Lock as LockIcon,
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

  // Fondo del contenedor principal — transparente, hereda del Paper padre (#11131f)
  const gridBg = 'transparent';
  // Fondo del header de días
  const headerBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  // Borde de la tabla
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  // Fondo columna de hora
  const timeBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  // Fondo recreo
  const recreoBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  const celdaMap = useMemo(() => {
    const map: Record<string, HorarioDetalle> = {};
    celdas.forEach((c) => { map[`${c.dia_semana}-${c.bloque_horario_id}`] = c; });
    return map;
  }, [celdas]);

  const handleCellClick = (dia: number, bloque: BloqueHorario) => {
    if (bloque.es_recreo || readonly) return;
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: accentColor }} />
      </Box>
    );
  }

  return (
    <>
      {/* ── Banner de estado ── */}
      {estado === 'borrador' && (
        <Box sx={{
          mb: 2, px: 2, py: 1.2, borderRadius: 2,
          bgcolor: isDark ? 'rgba(250,204,21,0.07)' : 'rgba(2,136,209,0.07)',
          border: `1px solid ${isDark ? 'rgba(250,204,21,0.18)' : 'rgba(2,136,209,0.18)'}`,
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <DraftIcon sx={{ fontSize: 15, color: accentColor }} />
          <Typography variant="caption" sx={{ color: accentColor, fontWeight: 600 }}>
            Modo borrador — Haz clic en cualquier celda para asignar o editar clases
          </Typography>
        </Box>
      )}
      {estado === 'archivado' && (
        <Box sx={{
          mb: 2, px: 2, py: 1.2, borderRadius: 2,
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <LockIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Horario archivado — Solo lectura
          </Typography>
        </Box>
      )}

      {/* ── Grid principal ── */}
      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Box
          sx={{
            minWidth: 90 + 148 * diasActivos.length,
            border: `0.5px solid ${borderColor}`,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: gridBg,
          }}
        >
          {/* ── Header de días ── */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `90px repeat(${diasActivos.length}, 1fr)`,
            borderBottom: `0.5px solid ${borderColor}`,
          }}>
            {/* Celda vacía esquina */}
            <Box sx={{ bgcolor: timeBg, borderRight: `0.5px solid ${borderColor}` }} />
            {diasActivos.map((dia, idx) => (
              <Box
                key={dia}
                sx={{
                  px: 2, py: 1.2, textAlign: 'center',
                  bgcolor: headerBg,
                  borderRight: idx < diasActivos.length - 1 ? `0.5px solid ${borderColor}` : 'none',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ color: accentColor, fontSize: '0.78rem', letterSpacing: 0.3 }}
                >
                  {DIAS_SEMANA[dia]}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* ── Filas de bloques ── */}
          {bloques.map((bloque, bloqueIdx) => {
            const isRecreo = bloque.es_recreo;
            const isLast = bloqueIdx === bloques.length - 1;

            return (
              <Box
                key={bloque.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: isRecreo
                    ? `90px 1fr`
                    : `90px repeat(${diasActivos.length}, 1fr)`,
                  borderBottom: isLast ? 'none' : `0.5px solid ${borderColor}`,
                }}
              >
                {/* Columna hora */}
                <Box
                  sx={{
                    bgcolor: timeBg,
                    borderRight: `0.5px solid ${borderColor}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-end', justifyContent: 'center',
                    px: 1.5, py: 1,
                    minHeight: isRecreo ? 32 : 68,
                  }}
                >
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.68rem', color: 'text.primary', lineHeight: 1.4 }}>
                    {bloque.hora_inicio.slice(0, 5)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.secondary', lineHeight: 1.4 }}>
                    {bloque.hora_fin.slice(0, 5)}
                  </Typography>
                  {!isRecreo && (
                    <Typography variant="caption" sx={{ fontSize: '0.58rem', color: 'text.disabled', mt: 0.3, lineHeight: 1.2, textAlign: 'right' }}>
                      {bloque.nombre}
                    </Typography>
                  )}
                </Box>

                {/* RECREO */}
                {isRecreo ? (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                    bgcolor: recreoBg,
                    minHeight: 32,
                    borderLeft: 'none',
                  }}>
                    <RecresoIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
                      {bloque.nombre} · {bloque.hora_inicio.slice(0, 5)} – {bloque.hora_fin.slice(0, 5)}
                    </Typography>
                  </Box>
                ) : (
                  /* Celdas normales */
                  diasActivos.map((dia, idx) => {
                    const celda = celdaMap[`${dia}-${bloque.id}`];
                    return (
                      <CeldaGridItem
                        key={dia}
                        celda={celda}
                        readonly={readonly}
                        accentColor={accentColor}
                        isDark={isDark}
                        borderColor={borderColor}
                        isLastCol={idx === diasActivos.length - 1}
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

      {/* ── Stats de completitud ── */}
      <GridStats celdas={celdas} bloques={bloques} diasActivos={diasActivos} accentColor={accentColor} />

      {/* ── Modal de celda ── */}
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
// Sub: celda individual
// =============================================
interface CeldaGridItemProps {
  celda?: HorarioDetalle;
  readonly: boolean;
  accentColor: string;
  isDark: boolean;
  borderColor: string;
  isLastCol: boolean;
  onClick: () => void;
}

const CeldaGridItem: React.FC<CeldaGridItemProps> = ({
  celda, readonly, accentColor, isDark, borderColor, isLastCol, onClick,
}) => {
  const cellColor = celda?.color || celda?.materia_color || accentColor;
  const borderRight = isLastCol ? 'none' : `0.5px solid ${borderColor}`;

  /* ── Celda vacía ── */
  if (!celda) {
    return (
      <ButtonBase
        onClick={readonly ? undefined : onClick}
        sx={{
          minHeight: 68,
          borderRight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: readonly ? 'default' : 'pointer',
          bgcolor: 'transparent',
          transition: 'background 0.15s',
          '&:hover': readonly ? {} : {
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(19, 20, 73, 0.03)',
            '& .add-icon': { opacity: 0.6 },
          },
        }}
      >
        {!readonly && (
          <AddIcon
            className="add-icon"
            sx={{ fontSize: 18, color: accentColor, opacity: 0.2, transition: 'opacity 0.15s' }}
          />
        )}
      </ButtonBase>
    );
  }

  /* ── Celda con contenido ── */
  return (
    <Tooltip
      arrow
      placement="top"
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" fontWeight={700} display="block">{celda.materia_nombre}</Typography>
          {celda.docente_apellidos && (
            <Typography variant="caption" display="block" sx={{ opacity: 0.85 }}>
              Prof. {celda.docente_apellidos}
            </Typography>
          )}
          {celda.aula && (
            <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
              Aula: {celda.aula}
            </Typography>
          )}
          {celda.observaciones && (
            <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', opacity: 0.7, mt: 0.3 }}>
              {celda.observaciones}
            </Typography>
          )}
        </Box>
      }
    >
      <ButtonBase
        onClick={onClick}
        sx={{
          minHeight: 68,
          borderRight,
          display: 'flex', flexDirection: 'column',
          alignItems: 'stretch', justifyContent: 'stretch',
          cursor: 'pointer', p: 0, overflow: 'hidden',
          transition: 'filter 0.15s',
          '&:hover': { filter: 'brightness(1.06)' },
        }}
      >
        {/* Pill de color con contenido */}
        <Box
          sx={{
            flex: 1,
            m: '5px',
            borderRadius: '6px',
            background: cellColor,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
            p: '6px 8px',
            overflow: 'hidden',
          }}
        >
          {/* Nombre materia */}
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              color: '#fff',
              fontSize: '0.68rem',
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: '0 1px 2px rgba(0,0,0,0.25)',
            }}
          >
            {celda.materia_nombre}
          </Typography>

          {/* Info inferior */}
          <Box>
            {celda.docente_apellidos && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
                <PersonIcon sx={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', flexShrink: 0 }} />
                <Typography variant="caption" sx={{
                  color: 'rgba(255,255,255,0.75)', fontSize: '0.59rem',
                  lineHeight: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                }}>
                  {celda.docente_apellidos}
                </Typography>
              </Box>
            )}
            {celda.aula && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2 }}>
                <AulaIcon sx={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.57rem', lineHeight: 1 }}>
                  {celda.aula}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </ButtonBase>
    </Tooltip>
  );
};

// =============================================
// Sub: estadísticas de completitud
// =============================================
interface GridStatsProps {
  celdas: HorarioDetalle[];
  bloques: BloqueHorario[];
  diasActivos: number[];
  accentColor: string;
}

const GridStats: React.FC<GridStatsProps> = ({ celdas, bloques, diasActivos, accentColor }) => {
  const bloquesClase = bloques.filter((b) => !b.es_recreo);
  const totalSlots = bloquesClase.length * diasActivos.length;
  const asignadas = celdas.length;
  const porcentaje = totalSlots > 0 ? Math.round((asignadas / totalSlots) * 100) : 0;
  const sinDocente = celdas.filter((c) => !c.asignacion_docente_id).length;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip
        size="small"
        label={`${asignadas} / ${totalSlots} celdas · ${porcentaje}%`}
        variant="outlined"
        sx={{
          fontWeight: 600, fontSize: '0.7rem',
          borderColor: porcentaje === 100 ? '#10b981' : accentColor,
          color: porcentaje === 100 ? '#10b981' : accentColor,
        }}
      />
      {sinDocente > 0 && (
        <Chip
          size="small"
          label={`${sinDocente} sin docente`}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.7rem', borderColor: '#f59e0b', color: '#f59e0b' }}
        />
      )}
      {porcentaje === 100 && sinDocente === 0 && (
        <Chip
          size="small"
          label="Horario completo"
          sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: alpha('#10b981', 0.12), color: '#10b981', border: '1px solid #10b98130' }}
        />
      )}
    </Box>
  );
};

export { GridStats };