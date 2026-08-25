// components/horario/HorarioReadonlyGrid.tsx
'use client';
import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Tooltip, Chip, alpha, useTheme, useMediaQuery,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const [detalleCelda, setDetalleCelda] = useState<HorarioDetalle | null>(null);

  // Columnas fluidas: ocupan todo el ancho disponible, con un piso mínimo legible
  const MIN_COL = compact ? 108 : 138;
  const ROW_HEIGHT = compact ? 72 : 96;
  const RECREO_HEIGHT = 38;
  const HORA_COL = compact ? 72 : 92;
  const GAP = 10;

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

      {isMobile ? (
        <HorarioAgendaMobile
          celdas={celdas}
          bloques={bloques}
          diasActivos={diasActivos}
          celdaMap={celdaMap}
          accentColor={accentColor}
          isDark={isDark}
          ocultarDocente={ocultarDocente}
          onCeldaClick={setDetalleCelda}
        />
      ) : (
        /* ── Grid de escritorio: columnas fluidas, ocupan todo el ancho ── */
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `${HORA_COL}px repeat(${diasActivos.length}, minmax(${MIN_COL}px, 1fr))`,
              gap: `${GAP}px`,
              minWidth: HORA_COL + (MIN_COL + GAP) * diasActivos.length,
              width: '100%',
            }}
          >
            {/* Esquina vacía */}
            <Box />

            {/* Header de días */}
            {diasActivos.map((dia) => {
              const tieneCeldas = celdas.some((c) => c.dia_semana === dia);
              return (
                <Box
                  key={`h-${dia}`}
                  sx={{
                    textAlign: 'center',
                    px: 1, py: 1.2, borderRadius: 2,
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

            {/* Filas de bloques */}
            {bloques.map((bloque) => {
              const isRecreo = bloque.es_recreo;
              const height = isRecreo ? RECREO_HEIGHT : ROW_HEIGHT;

              return (
                <React.Fragment key={bloque.id}>
                  {/* Columna hora */}
                  <Box
                    sx={{
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

                  {isRecreo ? (
                    <Box
                      sx={{
                        gridColumn: `span ${diasActivos.length}`,
                        height: RECREO_HEIGHT,
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
                    diasActivos.map((dia) => {
                      const celda = celdaMap[`${dia}-${bloque.id}`];
                      return (
                        <CeldaReadonly
                          key={dia}
                          celda={celda}
                          height={height}
                          compact={compact}
                          ocultarDocente={ocultarDocente}
                          accentColor={accentColor}
                          isDark={isDark}
                          onClick={() => celda && setDetalleCelda(celda)}
                        />
                      );
                    })
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        </Box>
      )}

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
// Sub: celda readonly (escritorio — ancho fluido, 100% de su columna)
// =============================================
interface CeldaReadonlyProps {
  celda?: HorarioDetalle;
  height: number;
  compact: boolean;
  ocultarDocente: boolean;
  accentColor: string;
  isDark: boolean;
  onClick: () => void;
}

const CeldaReadonly: React.FC<CeldaReadonlyProps> = ({
  celda, height, compact, ocultarDocente, accentColor, isDark, onClick,
}) => {
  if (!celda) {
    return (
      <Box
        sx={{
          width: '100%', height, borderRadius: 2,
          border: `1.5px dashed ${isDark ? '#ffffff0f' : '#e5e7eb'}`,
          bgcolor: isDark ? '#ffffff04' : 'transparent',
        }}
      />
    );
  }

  const cellColor = celda.color || celda.materia_color || accentColor;

  return (
    <Tooltip title="Toca para ver detalles" placement="top" arrow>
      <ButtonBase
        onClick={onClick}
        sx={{
          width: '100%', height, borderRadius: 2,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(cellColor, 0.22)}, ${alpha(cellColor, 0.07)})`
            : `linear-gradient(135deg, ${alpha(cellColor, 0.16)}, ${alpha(cellColor, 0.05)})`,
          border: `1px solid ${alpha(cellColor, 0.55)}`,
          borderLeft: `5px solid ${cellColor}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'space-between',
          p: compact ? 0.9 : 1.2,
          textAlign: 'left', overflow: 'hidden',
          transition: 'all 0.18s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.015)',
            borderColor: cellColor,
            boxShadow: `0 6px 18px ${alpha(cellColor, 0.32)}`,
            background: isDark
              ? `linear-gradient(135deg, ${alpha(cellColor, 0.3)}, ${alpha(cellColor, 0.1)})`
              : `linear-gradient(135deg, ${alpha(cellColor, 0.22)}, ${alpha(cellColor, 0.08)})`,
          },
          '&:active': { transform: 'scale(0.98)' },
        }}
      >
        <Typography
          variant="caption"
          fontWeight={800}
          sx={{
            color: cellColor,
            fontSize: compact ? '0.66rem' : '0.75rem',
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {celda.materia_nombre}
        </Typography>

        <Box sx={{ width: '100%' }}>
          {!ocultarDocente && celda.docente_apellidos && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 0.2 }}>
              <PersonIcon sx={{ fontSize: compact ? 10 : 12, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: compact ? '0.6rem' : '0.66rem', lineHeight: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                {celda.docente_apellidos}
              </Typography>
            </Box>
          )}
          {celda.aula && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <AulaIcon sx={{ fontSize: compact ? 10 : 12, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: compact ? '0.58rem' : '0.64rem', lineHeight: 1 }}>
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
// Sub: agenda mobile — selector de día + cards apiladas de ancho completo
// =============================================
interface HorarioAgendaMobileProps {
  celdas: HorarioDetalle[];
  bloques: BloqueReconstruido[];
  diasActivos: number[];
  celdaMap: Record<string, HorarioDetalle>;
  accentColor: string;
  isDark: boolean;
  ocultarDocente: boolean;
  onCeldaClick: (celda: HorarioDetalle) => void;
}

const HorarioAgendaMobile: React.FC<HorarioAgendaMobileProps> = ({
  celdas, bloques, diasActivos, celdaMap, accentColor, isDark, ocultarDocente, onCeldaClick,
}) => {
  const primerDiaConClases = diasActivos.find((d) => celdas.some((c) => c.dia_semana === d)) ?? diasActivos[0];
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(primerDiaConClases);

  // Si cambia el modo L-V / L-S y el día ya no está activo, reubicar
  useEffect(() => {
    if (!diasActivos.includes(diaSeleccionado)) {
      setDiaSeleccionado(diasActivos[0]);
    }
  }, [diasActivos, diaSeleccionado]);

  return (
    <Box>
      {/* Selector de día */}
      <Box
        sx={{
          display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2,
          '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none',
        }}
      >
        {diasActivos.map((dia) => {
          const activo = dia === diaSeleccionado;
          const tieneCeldas = celdas.some((c) => c.dia_semana === dia);
          return (
            <ButtonBase
              key={dia}
              onClick={() => setDiaSeleccionado(dia)}
              sx={{
                px: 2, py: 1, borderRadius: 2.5, flexShrink: 0,
                fontWeight: 700, fontSize: '0.78rem',
                bgcolor: activo ? accentColor : (isDark ? '#ffffff08' : '#f3f4f6'),
                color: activo ? (isDark ? '#000' : '#fff') : (tieneCeldas ? 'text.primary' : 'text.disabled'),
                border: `1px solid ${activo ? accentColor : alpha(accentColor, 0.15)}`,
                transition: 'all 0.15s',
              }}
            >
              {DIAS_SEMANA[dia]}
            </ButtonBase>
          );
        })}
      </Box>

      {/* Lista de bloques del día seleccionado */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {bloques.map((bloque) => {
          if (bloque.es_recreo) {
            return (
              <Box
                key={bloque.id}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                  py: 1, borderRadius: 2,
                  border: `1px dashed ${isDark ? '#ffffff18' : '#d1d5db'}`,
                  bgcolor: isDark ? '#ffffff07' : '#f3f4f6',
                }}
              >
                <RecresoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                  {bloque.nombre} · {bloque.hora_inicio.slice(0, 5)}–{bloque.hora_fin.slice(0, 5)}
                </Typography>
              </Box>
            );
          }

          const celda = celdaMap[`${diaSeleccionado}-${bloque.id}`];

          if (!celda) {
            return (
              <Box
                key={bloque.id}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
                  border: `1.5px dashed ${isDark ? '#ffffff0f' : '#e5e7eb'}`,
                }}
              >
                <Box sx={{ width: 54, flexShrink: 0 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.68rem', display: 'block' }}>
                    {bloque.hora_inicio.slice(0, 5)}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', display: 'block' }}>
                    {bloque.hora_fin.slice(0, 5)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  Sin clase asignada
                </Typography>
              </Box>
            );
          }

          const cellColor = celda.color || celda.materia_color || accentColor;

          return (
            <ButtonBase
              key={bloque.id}
              onClick={() => onCeldaClick(celda)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
                width: '100%', textAlign: 'left',
                background: isDark
                  ? `linear-gradient(135deg, ${alpha(cellColor, 0.22)}, ${alpha(cellColor, 0.07)})`
                  : `linear-gradient(135deg, ${alpha(cellColor, 0.16)}, ${alpha(cellColor, 0.05)})`,
                border: `1px solid ${alpha(cellColor, 0.55)}`,
                borderLeft: `5px solid ${cellColor}`,
                transition: 'all 0.15s',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box sx={{ width: 54, flexShrink: 0 }}>
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.72rem', display: 'block' }}>
                  {bloque.hora_inicio.slice(0, 5)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', display: 'block' }}>
                  {bloque.hora_fin.slice(0, 5)}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={800} sx={{ color: cellColor, lineHeight: 1.25 }}>
                  {celda.materia_nombre}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mt: 0.4 }}>
                  {!ocultarDocente && celda.docente_apellidos && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <PersonIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                        {celda.docente_apellidos}
                      </Typography>
                    </Box>
                  )}
                  {celda.aula && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <AulaIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                        {celda.aula}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

// =============================================
// Sub: leyenda de materias
// =============================================
interface LeyendaProps { celdas: HorarioDetalle[]; isDark: boolean; }

const LeyendaMaterias: React.FC<LeyendaProps> = ({ celdas, isDark }) => {
  // CORRECCIÓN: materia_color llega vacío ("") del backend — el color real
  // que se pinta en cada celda sale de celda.color (hd.color). Usamos la
  // misma resolución acá para que la leyenda coincida con la grilla.
  const materias = [
    ...new Map(
      celdas.map((c) => [c.materia_id, { nombre: c.materia_nombre, color: c.color || c.materia_color }])
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