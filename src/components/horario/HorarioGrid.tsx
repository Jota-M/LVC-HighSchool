// components/horario/HorarioGrid.tsx
'use client';
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Tooltip, IconButton,
  Chip, alpha, useTheme, CircularProgress,
  ButtonBase, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, FormGroup, FormControlLabel,
  Checkbox, Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  MeetingRoom as AulaIcon,
  Coffee as RecresoIcon,
  EditNote as DraftIcon,
  Lock as LockIcon,
  ContentCopy as CopyIcon,
  CleaningServices as EraserIcon,
  AutoFixHigh as PaintIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DIAS_SEMANA, BloqueHorario, HorarioDetalle, HorarioEstado, GradoMateria } from '@/types/horariotypes';
import { CeldaModal } from './CeldaModal';
import { QuickPalette } from './QuickPalette';
import { useGradoMaterias, useAsignaciones, useHorarioCeldas } from '@/hooks/useHorario';

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
  const readonly = estado === 'archivado';
  const accentColor = isDark ? '#facc15' : '#0288d1';

  // Modal target para edición detallada
  const [modalTarget, setModalTarget] = useState<CeldaTarget | null>(null);

  // Paleta de asignación rápida (Modo Pincel)
  const [selectedMateria, setSelectedMateria] = useState<GradoMateria | 'eraser' | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isPaintMode, setIsPaintMode] = useState<boolean>(true);

  // Modal de clonación de día
  const [cloneModalOrigin, setCloneModalOrigin] = useState<number | null>(null);
  const [cloneDestinos, setCloneDestinos] = useState<number[]>([]);

  // Datos auxiliares y mutaciones
  const { gradoMaterias } = useGradoMaterias(gradoId);
  const { asignaciones } = useAsignaciones(paraleloId, periodoId);
  const { agregar, actualizar, eliminar, clonarDia, isBusy } = useHorarioCeldas(horarioId);

  // Fondos y bordes
  const gridBg = 'transparent';
  const headerBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const timeBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const recreoBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  const celdaMap = useMemo(() => {
    const map: Record<string, HorarioDetalle> = {};
    celdas.forEach((c) => { map[`${c.dia_semana}-${c.bloque_horario_id}`] = c; });
    return map;
  }, [celdas]);

  // Manejo del clic en celda
  const handleCellClick = async (dia: number, bloque: BloqueHorario) => {
    if (bloque.es_recreo || readonly) return;
    const existing = celdaMap[`${dia}-${bloque.id}`];

    // Modo Pincel activo con herramienta seleccionada
    if (isPaintMode && selectedMateria) {
      if (selectedMateria === 'eraser') {
        if (existing) {
          await eliminar(existing.id);
        }
        return;
      }

      const gm = selectedMateria as GradoMateria;
      const docenteTitular =
        asignaciones.find((a) => a.grado_materia_id === gm.id && a.es_titular) ||
        asignaciones.find((a) => a.grado_materia_id === gm.id);

      const colorFinal = selectedColor || gm.materia_color || undefined;

      const payload = {
        grado_materia_id: gm.id,
        asignacion_docente_id: docenteTitular?.id ?? null,
        color: colorFinal,
      };

      if (existing) {
        await actualizar({ detId: existing.id, payload });
      } else {
        await agregar({
          dia_semana: dia,
          bloque_horario_id: bloque.id,
          ...payload,
        });
      }
      return;
    }

    // Modo Detallado: abrir modal
    setModalTarget({
      dia_semana: dia,
      bloque_horario_id: bloque.id,
      bloque_nombre: bloque.nombre,
      hora_inicio: bloque.hora_inicio,
      hora_fin: bloque.hora_fin,
      existing,
    });
  };

  // Abrir modal de clonación
  const handleOpenClone = (dia: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCloneModalOrigin(dia);
    // Por defecto seleccionar los otros días activos
    setCloneDestinos(diasActivos.filter((d) => d !== dia));
  };

  const handleConfirmClone = async () => {
    if (!cloneModalOrigin || cloneDestinos.length === 0) return;
    await clonarDia({
      dia_origen: cloneModalOrigin,
      dias_destino: cloneDestinos,
      sobrescribir: true,
    });
    setCloneModalOrigin(null);
  };

  const handleToggleDestino = (dia: number) => {
    setCloneDestinos((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
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
      {/* ── Paleta de Asignación Rápida ── */}
      {!readonly && (
        <QuickPalette
          gradoMaterias={gradoMaterias}
          asignaciones={asignaciones}
          celdas={celdas}
          selectedMateria={selectedMateria}
          onSelectMateria={(m) => {
            setSelectedMateria(m);
            if (m && m !== 'eraser') {
              setSelectedColor(m.materia_color || null);
            } else {
              setSelectedColor(null);
            }
          }}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          isPaintMode={isPaintMode}
          onTogglePaintMode={setIsPaintMode}
          readonly={readonly}
        />
      )}

      {/* ── Banner de estado ── */}
      {estado === 'borrador' && (
        <Box sx={{
          mb: 2, px: 2, py: 1.2, borderRadius: 2,
          bgcolor: isDark ? 'rgba(250,204,21,0.07)' : 'rgba(2,136,209,0.07)',
          border: `1px solid ${isDark ? 'rgba(250,204,21,0.18)' : 'rgba(2,136,209,0.18)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isPaintMode && selectedMateria ? (
              <PaintIcon sx={{ fontSize: 16, color: accentColor }} />
            ) : (
              <DraftIcon sx={{ fontSize: 16, color: accentColor }} />
            )}
            <Typography variant="caption" sx={{ color: accentColor, fontWeight: 600 }}>
              {isPaintMode && selectedMateria
                ? selectedMateria === 'eraser'
                  ? 'Modo Borrador — Haz clic en celdas para borrarlas al instante'
                  : `Pintando con "${(selectedMateria as GradoMateria).materia_nombre}" — Toca cualquier celda para asignarla de inmediato`
                : 'Modo edición — Selecciona una materia arriba para pintar con 1-clic o toca una celda para ver opciones'}
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            💡 Tip: Usa el botón 📋 en la cabecera de cada día para clonar su horario a otros días
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
            {diasActivos.map((dia, idx) => {
              const celdasEnEsteDia = celdas.filter((c) => c.dia_semana === dia).length;
              return (
                <Box
                  key={dia}
                  sx={{
                    px: 1.5, py: 1, textAlign: 'center',
                    bgcolor: headerBg,
                    borderRight: idx < diasActivos.length - 1 ? `0.5px solid ${borderColor}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: accentColor, fontSize: '0.78rem', letterSpacing: 0.3 }}
                  >
                    {DIAS_SEMANA[dia]}
                  </Typography>

                  {!readonly && celdasEnEsteDia > 0 && (
                    <Tooltip title={`Copiar horario de ${DIAS_SEMANA[dia]} a otros días`}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenClone(dia, e)}
                        sx={{
                          p: 0.3,
                          color: 'text.secondary',
                          '&:hover': { color: accentColor, bgcolor: alpha(accentColor, 0.1) },
                        }}
                      >
                        <CopyIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              );
            })}
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
                        selectedMateria={isPaintMode ? selectedMateria : null}
                        selectedColor={selectedColor}
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

      {/* ── Modal de celda detallado ── */}
      <CeldaModal
        open={!!modalTarget}
        onClose={() => setModalTarget(null)}
        target={modalTarget}
        horarioId={horarioId}
        gradoId={gradoId}
        paraleloId={paraleloId}
        periodoId={periodoId}
        bloques={bloques}
        diasActivos={diasActivos}
        readonly={readonly}
      />

      {/* ── Modal de Clonación de Día ── */}
      <Dialog
        open={!!cloneModalOrigin}
        onClose={() => setCloneModalOrigin(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: isDark ? '#0f172a' : '#fff',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CopyIcon sx={{ color: accentColor, fontSize: 20 }} />
            <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
              Copiar horario de {cloneModalOrigin ? DIAS_SEMANA[cloneModalOrigin] : ''}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setCloneModalOrigin(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona los días en los que deseas replicar todas las clases configuradas en{' '}
            <strong>{cloneModalOrigin ? DIAS_SEMANA[cloneModalOrigin] : ''}</strong>:
          </Typography>

          <FormGroup>
            {diasActivos
              .filter((d) => d !== cloneModalOrigin)
              .map((dia) => (
                <FormControlLabel
                  key={dia}
                  control={
                    <Checkbox
                      checked={cloneDestinos.includes(dia)}
                      onChange={() => handleToggleDestino(dia)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      {DIAS_SEMANA[dia]}
                    </Typography>
                  }
                />
              ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setCloneModalOrigin(null)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmClone}
            variant="contained"
            size="small"
            disabled={cloneDestinos.length === 0 || isBusy}
            startIcon={<CopyIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: accentColor,
              color: isDark ? '#000' : '#fff',
              '&:hover': { bgcolor: isDark ? '#f59e0b' : '#01579b' },
            }}
          >
            Copiar a {cloneDestinos.length} día(s)
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// =============================================
// Sub: celda individual con soporte de hover ghost
// =============================================
interface CeldaGridItemProps {
  celda?: HorarioDetalle;
  readonly: boolean;
  accentColor: string;
  isDark: boolean;
  borderColor: string;
  isLastCol: boolean;
  selectedMateria: GradoMateria | 'eraser' | null;
  selectedColor: string | null;
  onClick: () => void;
}

const CeldaGridItem: React.FC<CeldaGridItemProps> = ({
  celda, readonly, accentColor, isDark, borderColor, isLastCol, selectedMateria, selectedColor, onClick,
}) => {
  const cellColor = celda?.color || celda?.materia_color || accentColor;
  const borderRight = isLastCol ? 'none' : `0.5px solid ${borderColor}`;
  const nombreMostrar = celda?.etiqueta_personalizada || celda?.materia_nombre || '';

  const isPaintingSubject = selectedMateria && selectedMateria !== 'eraser';
  const isPaintingEraser = selectedMateria === 'eraser';
  const paintColor = selectedColor || (isPaintingSubject ? (selectedMateria as GradoMateria).materia_color || accentColor : '');
  const paintName = isPaintingSubject ? (selectedMateria as GradoMateria).materia_nombre : '';

  /* ── Celda vacía ── */
  if (!celda) {
    return (
      <ButtonBase
        onClick={onClick}
        disabled={readonly}
        sx={{
          minHeight: 68,
          borderRight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: readonly ? 'default' : isPaintingSubject ? 'crosshair' : 'pointer',
          position: 'relative',
          transition: 'all 0.12s',
          '&:hover': {
            bgcolor: readonly
              ? 'transparent'
              : isPaintingSubject
                ? alpha(paintColor, 0.15)
                : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            '& .add-icon': { opacity: 1, transform: 'scale(1.15)' },
            '& .paint-ghost': { opacity: 1 },
          },
        }}
      >
        {!readonly && (
          <>
            <AddIcon
              className="add-icon"
              sx={{
                fontSize: 16, color: 'text.disabled', opacity: 0.25,
                transition: 'all 0.15s ease',
              }}
            />

            {/* Ghost preview when hovering in paint mode */}
            {isPaintingSubject && (
              <Box
                className="paint-ghost"
                sx={{
                  position: 'absolute',
                  inset: 5,
                  borderRadius: '6px',
                  bgcolor: alpha(paintColor, 0.4),
                  border: `1.5px dashed ${paintColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.12s ease',
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ color: '#fff', fontSize: '0.62rem', px: 0.5, textAlign: 'center' }}>
                  + {paintName}
                </Typography>
              </Box>
            )}
          </>
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
          <Typography variant="caption" fontWeight={700} display="block">
            {celda.etiqueta_personalizada ? `🏷️ ${celda.etiqueta_personalizada}` : celda.materia_nombre}
          </Typography>
          {celda.etiqueta_personalizada && (
            <Typography variant="caption" display="block" sx={{ opacity: 0.85, fontStyle: 'italic' }}>
              Materia oficial: {celda.materia_nombre}
            </Typography>
          )}
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
          {isPaintingEraser && (
            <Typography variant="caption" color="error.light" sx={{ display: 'block', mt: 0.5, fontWeight: 700 }}>
              Clic para borrar esta clase
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
          cursor: isPaintingEraser ? 'not-allowed' : isPaintingSubject ? 'crosshair' : 'pointer',
          p: 0, overflow: 'hidden',
          position: 'relative',
          transition: 'filter 0.15s',
          '&:hover': {
            filter: 'brightness(1.06)',
            '& .eraser-overlay': { opacity: 1 },
          },
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
          {/* Nombre materia / etiqueta */}
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
            {nombreMostrar}
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

        {/* Overlay cuando el borrador pasa por encima */}
        {isPaintingEraser && (
          <Box
            className="eraser-overlay"
            sx={{
              position: 'absolute',
              inset: 5,
              borderRadius: '6px',
              bgcolor: 'rgba(239, 68, 68, 0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.15s ease',
            }}
          >
            <EraserIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
        )}
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