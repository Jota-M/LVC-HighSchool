// components/horario/HorarioReadonlyGrid.tsx
'use client';
import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Tooltip, Chip, alpha, useTheme,
  CircularProgress, Paper, ButtonBase, Dialog,
  DialogTitle, DialogContent, DialogActions, Button,
  IconButton, Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  MeetingRoom as AulaIcon,
  Coffee as RecresoIcon,
  Close as CloseIcon,
  Schedule as HoraIcon,
  MenuBook as MateriaIcon,
} from '@mui/icons-material';
import { DIAS_SEMANA, DIAS_SEMANA_CORTO, HorarioDetalle } from '@/types/horariotypes';

// Bloque reconstruido desde las celdas (sin turno_id, sin activo)
export interface BloqueReconstruido {
  id: number;
  nombre: string;
  numero: number;
  hora_inicio: string;
  hora_fin: string;
  es_recreo: boolean;
}

interface Props {
  celdas: HorarioDetalle[];
  bloques: BloqueReconstruido[];
  diasActivos?: number[];
  isLoading?: boolean;
  /** Modo compacto para móvil */
  compact?: boolean;
  /** Ocultar columna de docente (para vista de docente, que ya lo sabe) */
  ocultarDocente?: boolean;
  /** Título de la sección encima del grid */
  titulo?: string;
}

const DEFAULT_DIAS = [1, 2, 3, 4, 5];

export const HorarioReadonlyGrid: React.FC<Props> = ({
  celdas,
  bloques,
  diasActivos = DEFAULT_DIAS,
  isLoading,
  compact = false,
  ocultarDocente = false,
  titulo,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const [detalleCelda, setDetalleCelda] = useState<HorarioDetalle | null>(null);

  const COL_WIDTH = compact ? 110 : 140;
  const ROW_HEIGHT = compact ? 68 : 80;
  const RECREO_HEIGHT = 34;
  const HORA_COL = compact ? 72 : 86;

  // Índice rápido celdas
  const celdaMap = useMemo(() => {
    const map: Record<string, HorarioDetalle> = {};
    celdas.forEach((c) => { map[`${c.dia_semana}-${c.bloque_horario_id}`] = c; });
    return map;
  }, [celdas]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
        <CircularProgress sx={{ color: accentColor }} />
        <Typography variant="body2" color="text.secondary">Cargando horario...</Typography>
      </Box>
    );
  }

  if (bloques.length === 0 && celdas.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <HoraIcon sx={{ fontSize: 56, opacity: 0.15, mb: 2, display: 'block', mx: 'auto' }} />
        <Typography variant="h6" color="text.secondary" fontWeight={600}>
          Sin horario disponible
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
          No hay clases asignadas para este período
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {titulo && (
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: accentColor }}>
          {titulo}
        </Typography>
      )}

      {/* Grid con scroll horizontal en mobile */}
      <Box sx={{ overflowX: 'auto', pb: 1, mx: { xs: -1, sm: 0 } }}>
        <Box sx={{ minWidth: HORA_COL + COL_WIDTH * diasActivos.length + 24, px: { xs: 1, sm: 0 } }}>

          {/* ── Header de días ── */}
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Box sx={{ width: HORA_COL, flexShrink: 0 }} />
            {diasActivos.map((dia) => {
              const tieneCeldas = celdas.some((c) => c.dia_semana === dia);
              return (
                <Box
                  key={dia}
                  sx={{
                    width: COL_WIDTH, flexShrink: 0, textAlign: 'center',
                    px: 1, py: 1, borderRadius: 2, mx: 0.5,
                    background: tieneCeldas
                      ? isDark
                        ? 'linear-gradient(135deg,#facc1530,#f59e0b18)'
                        : 'linear-gradient(135deg,#0288d128,#01579b14)'
                      : isDark ? '#ffffff08' : '#f9fafb',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ color: tieneCeldas ? accentColor : 'text.disabled', fontSize: compact ? '0.75rem' : '0.85rem' }}
                  >
                    {compact ? DIAS_SEMANA_CORTO[dia] : DIAS_SEMANA[dia]}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* ── Filas de bloques ── */}
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
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: compact ? '0.62rem' : '0.7rem', color: 'text.primary', lineHeight: 1.3 }}>
                    {bloque.hora_inicio.slice(0, 5)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: compact ? '0.58rem' : '0.65rem', color: 'text.secondary', lineHeight: 1.3 }}>
                    {bloque.hora_fin.slice(0, 5)}
                  </Typography>
                  {!isRecreo && !compact && (
                    <Typography variant="caption" sx={{ fontSize: '0.58rem', color: 'text.disabled', mt: 0.3 }}>
                      {bloque.nombre}
                    </Typography>
                  )}
                </Box>

                {/* RECREO */}
                {isRecreo ? (
                  <Box
                    sx={{
                      flex: 1, height: RECREO_HEIGHT, mx: 0.5,
                      borderRadius: 2,
                      bgcolor: isDark ? '#ffffff07' : '#f3f4f6',
                      border: `1px dashed ${isDark ? '#ffffff18' : '#d1d5db'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                    }}
                  >
                    <RecresoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
                      {bloque.nombre} · {bloque.hora_inicio.slice(0, 5)}–{bloque.hora_fin.slice(0, 5)}
                    </Typography>
                  </Box>
                ) : (
                  /* Celdas normales */
                  diasActivos.map((dia) => {
                    const celda = celdaMap[`${dia}-${bloque.id}`];
                    return (
                      <CeldaReadonly
                        key={dia}
                        celda={celda}
                        height={height}
                        width={COL_WIDTH}
                        compact={compact}
                        ocultarDocente={ocultarDocente}
                        accentColor={accentColor}
                        isDark={isDark}
                        onClick={() => celda && setDetalleCelda(celda)}
                      />
                    );
                  })
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Leyenda de materias ── */}
      {celdas.length > 0 && (
        <LeyendaMaterias celdas={celdas} isDark={isDark} />
      )}

      {/* ── Modal de detalle de celda ── */}
      <DetalleCeldaModal
        celda={detalleCelda}
        onClose={() => setDetalleCelda(null)}
        accentColor={accentColor}
        isDark={isDark}
        ocultarDocente={ocultarDocente}
      />
    </>
  );
};

// =============================================
// Sub: celda readonly
// =============================================
interface CeldaReadonlyProps {
  celda?: HorarioDetalle;
  height: number;
  width: number;
  compact: boolean;
  ocultarDocente: boolean;
  accentColor: string;
  isDark: boolean;
  onClick: () => void;
}

const CeldaReadonly: React.FC<CeldaReadonlyProps> = ({
  celda, height, width, compact, ocultarDocente, accentColor, isDark, onClick,
}) => {
  if (!celda) {
    return (
      <Box
        sx={{
          width, height, mx: 0.5, borderRadius: 2, flexShrink: 0,
          border: `1.5px dashed ${isDark ? '#ffffff0f' : '#e5e7eb'}`,
          bgcolor: isDark ? '#ffffff04' : 'transparent',
        }}
      />
    );
  }

  const cellColor = celda.color || celda.materia_color || accentColor;

  return (
    <Tooltip
      title="Toca para ver detalles"
      placement="top"
      arrow
      disableHoverListener={false}
    >
      <ButtonBase
        onClick={onClick}
        sx={{
          width, height, mx: 0.5, borderRadius: 2, flexShrink: 0,
          background: `linear-gradient(145deg, ${cellColor}e0, ${cellColor}80)`,
          border: `2px solid ${cellColor}bb`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'space-between',
          p: compact ? 0.8 : 1,
          textAlign: 'left', overflow: 'hidden',
          transition: 'all 0.18s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: `0 6px 20px ${cellColor}50`,
            filter: 'brightness(1.08)',
          },
          '&:active': { transform: 'scale(0.98)' },
        }}
      >
        {/* Nombre materia */}
        <Typography
          variant="caption"
          fontWeight={800}
          sx={{
            color: '#fff',
            fontSize: compact ? '0.62rem' : '0.68rem',
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 1px 3px #0006',
            width: '100%',
          }}
        >
          {celda.materia_nombre}
        </Typography>

        {/* Info inferior */}
        <Box sx={{ width: '100%' }}>
          {!ocultarDocente && celda.docente_apellidos && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.2 }}>
              <PersonIcon sx={{ fontSize: compact ? 9 : 10, color: '#ffffffcc' }} />
              <Typography variant="caption" sx={{ color: '#ffffffcc', fontSize: compact ? '0.56rem' : '0.6rem', lineHeight: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                {celda.docente_apellidos}
              </Typography>
            </Box>
          )}
          {celda.aula && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <AulaIcon sx={{ fontSize: compact ? 9 : 10, color: '#ffffffaa' }} />
              <Typography variant="caption" sx={{ color: '#ffffffaa', fontSize: compact ? '0.54rem' : '0.58rem', lineHeight: 1 }}>
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
// Sub: leyenda de materias
// =============================================
interface LeyendaProps { celdas: HorarioDetalle[]; isDark: boolean; }

const LeyendaMaterias: React.FC<LeyendaProps> = ({ celdas, isDark }) => {
  const materias = [
    ...new Map(
      celdas.map((c) => [c.materia_id, { nombre: c.materia_nombre, color: c.materia_color }])
    ).values(),
  ];

  return (
    <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${isDark ? '#ffffff12' : '#e5e7eb'}` }}>
      <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: 'block', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.62rem' }}>
        Materias
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
        {materias.map((m) => (
          <Box key={m.nombre} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: m.color || '#6366f1', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary' }}>
              {m.nombre}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// =============================================
// Sub: modal detalle de celda (al hacer tap)
// =============================================
interface DetalleCeldaModalProps {
  celda: HorarioDetalle | null;
  onClose: () => void;
  accentColor: string;
  isDark: boolean;
  ocultarDocente: boolean;
}

const DetalleCeldaModal: React.FC<DetalleCeldaModalProps> = ({ celda, onClose, accentColor, isDark, ocultarDocente }) => {
  if (!celda) return null;
  const cellColor = celda.color || celda.materia_color || accentColor;

  return (
    <Dialog
      open={!!celda}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header con color de materia */}
      <Box sx={{ background: `linear-gradient(135deg, ${cellColor}ee, ${cellColor}88)`, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', textShadow: '0 1px 3px #0005', lineHeight: 1.2 }}>
              {celda.materia_nombre}
            </Typography>
            <Typography variant="caption" sx={{ color: '#ffffffcc' }}>
              {DIAS_SEMANA[celda.dia_semana]} · {celda.hora_inicio?.slice(0, 5)} – {celda.hora_fin?.slice(0, 5)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          {/* Bloque */}
          <InfoRow
            icon={<HoraIcon sx={{ fontSize: 18, color: accentColor }} />}
            label="Bloque"
            value={`${celda.bloque_nombre} (${celda.hora_inicio?.slice(0, 5)} – ${celda.hora_fin?.slice(0, 5)})`}
          />

          <Divider />

          {/* Docente */}
          {!ocultarDocente && (
            <InfoRow
              icon={<PersonIcon sx={{ fontSize: 18, color: accentColor }} />}
              label="Docente"
              value={
                celda.docente_apellidos
                  ? `${celda.docente_apellidos}, ${celda.docente_nombres}`
                  : 'Sin asignar'
              }
            />
          )}

          {/* Aula */}
          {celda.aula && (
            <InfoRow
              icon={<AulaIcon sx={{ fontSize: 18, color: accentColor }} />}
              label="Aula"
              value={celda.aula}
            />
          )}

          {/* Observaciones */}
          {celda.observaciones && (
            <>
              <Divider />
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? alpha(accentColor, 0.08) : alpha(accentColor, 0.05), border: `1px solid ${alpha(accentColor, 0.15)}` }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                  Observaciones
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {celda.observaciones}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{ borderRadius: 2, bgcolor: cellColor, color: '#fff', fontWeight: 700, '&:hover': { bgcolor: cellColor, filter: 'brightness(0.9)' } }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Sub-sub: fila de info del modal
interface InfoRowProps { icon: React.ReactNode; label: string; value: string; }
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
    <Box sx={{ mt: 0.2, flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>{value}</Typography>
    </Box>
  </Box>
);