'use client';
// components/docente/notas/GradeGrid.tsx
//
// Vista tipo planilla Excel en desktop / tarjetas por estudiante en mobile:
//   Filas    = estudiantes
//   Columnas = evaluaciones de la dimensión activa
//   Edición  = inline por celda, Tab/Enter para navegar (desktop)
//
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Avatar, Chip, Tooltip, CircularProgress,
  useTheme, useMediaQuery, alpha, Menu, MenuItem,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import KeyboardTabRoundedIcon from '@mui/icons-material/KeyboardTabRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import { toast } from 'react-hot-toast';

import {
  CalificacionEstudiante,
  RegistroCalificacionItem,
  DIMENSIONES_CONFIG,
  CodigoDimension,
} from '@/types/notasTypes';
import { EvaluacionConProgreso } from './GradeGridTypes';
import CalificarExamen from './CalificarExamen';
import router from 'next/router';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function iniciales(apellidos: string, nombres: string) {
  return `${(apellidos ?? '')[0] ?? ''}${(nombres ?? '')[0] ?? ''}`.toUpperCase();
}

function colorNota(puntaje: number, maximo: number) {
  const pct = maximo > 0 ? (puntaje / maximo) * 100 : 0;
  if (pct >= 51) return '#10b981';
  return '#ef4444';
}

function estadoChip(pct: number | null) {
  if (pct === null) return { color: 'text.disabled' as const, bg: null as string | null };
  if (pct >= 51) return { color: '#10b981', bg: alpha('#10b981', 0.12) };
  return { color: '#ef4444', bg: alpha('#ef4444', 0.12) };
}

// ─── Helpers para Autoevaluación (Escala directa de 1 a 5 pts) ───────────────

export const NIVELES_AUTOEVALUACION = [
  { valor: 5, label: '5', titulo: '5 pts — Excelente (100%)', color: '#10b981', bg: '#d1fae5' },
  { valor: 4, label: '4', titulo: '4 pts — Muy Bueno (80%)', color: '#3b82f6', bg: '#dbeafe' },
  { valor: 3, label: '3', titulo: '3 pts — Aceptable (60%)', color: '#f59e0b', bg: '#fef3c7' },
  { valor: 2, label: '2', titulo: '2 pts — En desarrollo (40%)', color: '#f97316', bg: '#ffedd5' },
  { valor: 1, label: '1', titulo: '1 pt — Insuficiente (20%)', color: '#ef4444', bg: '#fee2e2' },
];

/**
 * Convierte el valor guardado en BD al valor visual en escala de 5.
 * Si en BD puntaje_maximo es 100 y tiene 100 -> devuelve 5.
 * Si en BD puntaje_maximo es 5 y tiene 5 -> devuelve 5.
 */
export function valorDbAEscala5(puntajeDb: number | null | undefined, maximo: number): number | '' {
  if (puntajeDb === null || puntajeDb === undefined || isNaN(puntajeDb)) return '';
  if (maximo <= 5) return Math.round(Number(puntajeDb) * 10) / 10;
  const val5 = (Number(puntajeDb) / maximo) * 5;
  return Math.round(val5 * 10) / 10;
}

/**
 * Convierte el valor de escala 5 (ej: 5, 4.5) al valor que la BD espera según su puntaje_maximo.
 * Si maximo es 100, 5 -> 100, 4.5 -> 90. Si maximo es 5, 5 -> 5.
 */
export function escala5AValorDb(val5: number, maximo: number): number {
  if (maximo <= 5) return Math.round(val5 * 10) / 10;
  const valDb = (val5 / 5) * maximo;
  return Math.round(valDb * 10) / 10;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface GradeGridProps {
  dimensionCodigo: CodigoDimension;
  lista: CalificacionEstudiante[];
  evaluaciones: EvaluacionConProgreso[];
  notas: Record<string, RegistroCalificacionItem & { evaluacion_id: number }>;
  isLoadingLista: boolean;
  isSaving: boolean;
  onSetNota: (
    evaluacion_id: number,
    matricula_id: number,
    datos: Partial<RegistroCalificacionItem>,
  ) => void;
  onMarcarAusente: (
    evaluacion_id: number,
    matricula_id: number,
    ausente: boolean,
  ) => void;
  onGuardar: () => void;
}

const COL_WIDTH_EVALUACION = 110;

// ─── Celda editable (desktop) ─────────────────────────────────────────────────

const CeldaNota: React.FC<{
  evaluacionId: number;
  matriculaId: number;
  maximo: number;
  nota?: RegistroCalificacionItem & { evaluacion_id: number };
  isDark: boolean;
  brandAccent: string;
  cellId: string;
  onSetNota: GradeGridProps['onSetNota'];
  onMarcarAusente: GradeGridProps['onMarcarAusente'];
  onTabNext: (current: string) => void;
  onRevisarPractica?: (evaluacionId: number, matriculaId: number) => void;
}> = ({
  evaluacionId, matriculaId, maximo, nota, isDark, brandAccent,
  cellId, onSetNota, onMarcarAusente, onTabNext, onRevisarPractica,
}) => {
    const ausente = nota?.esta_ausente ?? false;
    const sinCalificar = nota?.sin_calificar ?? false;
    const puntaje = ausente ? 0 : (sinCalificar ? '' : (nota?.puntaje_obtenido ?? ''));
    const tieneNota = nota !== undefined && !sinCalificar;

    const color = tieneNota && !ausente && typeof puntaje === 'number'
      ? colorNota(Number(puntaje), Number(maximo))
      : undefined;

    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      onSetNota(evaluacionId, matriculaId, {
        matricula_id: matriculaId,
        puntaje_obtenido: isNaN(val) ? 0 : Math.min(Math.max(val, 0), Number(maximo)),
        esta_ausente: false,
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onTabNext(cellId);
      }
    };

    return (
      <Box sx={{ position: 'relative', width: COL_WIDTH_EVALUACION, height: 38, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {ausente ? (
          <Box
            onClick={() => onMarcarAusente(evaluacionId, matriculaId, false)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              width: '100%',
              height: '100%',
              borderRadius: '10px',
              bgcolor: alpha('#ef4444', isDark ? 0.15 : 0.1),
              border: `1.5px solid ${alpha('#ef4444', 0.4)}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': {
                bgcolor: alpha('#ef4444', 0.2),
              },
            }}
          >
            <PersonOffRoundedIcon sx={{ fontSize: 13, color: '#ef4444' }} />
            <Typography sx={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>
              Ausente
            </Typography>
          </Box>
        ) : (
          <input
            ref={inputRef}
            data-cell={cellId}
            type="number"
            min={0}
            max={maximo}
            step={0.5}
            value={puntaje}
            placeholder="—"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              height: 38,
              borderRadius: 10,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: tieneNota ? 700 : 400,
              fontFamily: 'inherit',
              border: tieneNota
                ? `1.5px solid ${alpha(color ?? brandAccent, isDark ? 0.45 : 0.4)}`
                : `1px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
              background: tieneNota
                ? alpha(color ?? brandAccent, isDark ? 0.14 : 0.08)
                : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              color: tieneNota ? color : isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
              outline: 'none',
              cursor: 'text',
              transition: 'all 0.15s ease',
            }}
            onFocus={e => {
              e.currentTarget.style.background = alpha(brandAccent, isDark ? 0.16 : 0.1);
              e.currentTarget.style.borderColor = brandAccent;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${alpha(brandAccent, 0.3)}`;
            }}
            onBlur={e => {
              e.currentTarget.style.background = tieneNota
                ? alpha(color ?? brandAccent, isDark ? 0.14 : 0.08)
                : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
              e.currentTarget.style.borderColor = tieneNota
                ? alpha(color ?? brandAccent, isDark ? 0.45 : 0.4)
                : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)');
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        )}

        {/* Botón flotante para marcar/desmarcar ausente */}
        <Tooltip title={ausente ? 'Quitar ausente' : 'Marcar ausente'} placement="top">
          <Box
            onClick={e => { e.stopPropagation(); onMarcarAusente(evaluacionId, matriculaId, !ausente); }}
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 18,
              height: 18,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: ausente ? '#ef4444' : (isDark ? '#1e293b' : '#e2e8f0'),
              color: ausente ? '#fff' : 'text.secondary',
              border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              opacity: ausente ? 1 : 0,
              cursor: 'pointer',
              transition: 'all 0.15s',
              zIndex: 2,
              '.fila-estudiante:hover &': { opacity: 1 },
              '&:hover': {
                transform: 'scale(1.15)',
                bgcolor: '#ef4444',
                color: '#fff',
              },
            }}
          >
            <PersonOffRoundedIcon sx={{ fontSize: 10 }} />
          </Box>
        </Tooltip>
      </Box>
    );
  };

// ─── Celda Autoevaluación (Escala 1 a 5 pts con botones rápidos) ─────────────

const CeldaAutoevaluacion: React.FC<{
  evaluacionId: number;
  matriculaId: number;
  maximo: number;
  nota?: RegistroCalificacionItem & { evaluacion_id: number };
  isDark: boolean;
  brandAccent: string;
  cellId: string;
  onSetNota: GradeGridProps['onSetNota'];
  onMarcarAusente: GradeGridProps['onMarcarAusente'];
  onTabNext: (current: string) => void;
}> = ({
  evaluacionId, matriculaId, maximo, nota, isDark, brandAccent,
  cellId, onSetNota, onMarcarAusente, onTabNext,
}) => {
    const ausente = nota?.esta_ausente ?? false;
    const rawPuntaje = nota?.puntaje_obtenido;
    const tieneNota = nota !== undefined && !ausente && rawPuntaje !== undefined && rawPuntaje !== null;
    const val5 = tieneNota ? valorDbAEscala5(Number(rawPuntaje), maximo) : '';

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSelectScore = (puntos5: number) => {
      const valDb = escala5AValorDb(puntos5, maximo);
      onSetNota(evaluacionId, matriculaId, {
        matricula_id: matriculaId,
        puntaje_obtenido: valDb,
        esta_ausente: false,
      });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '') {
        onSetNota(evaluacionId, matriculaId, {
          matricula_id: matriculaId,
          puntaje_obtenido: 0,
          esta_ausente: false,
        });
        return;
      }
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        const clamped = Math.min(Math.max(num, 0), 5);
        const valDb = escala5AValorDb(clamped, maximo);
        onSetNota(evaluacionId, matriculaId, {
          matricula_id: matriculaId,
          puntaje_obtenido: valDb,
          esta_ausente: false,
        });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onTabNext(cellId);
      }
    };

    const colorNivel = tieneNota && typeof val5 === 'number'
      ? colorNota(val5 * 20, 100)
      : brandAccent;

    return (
      <Box sx={{
        position: 'relative',
        width: 200,
        height: 38,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.6,
      }}>
        {ausente ? (
          <Box
            onClick={() => onMarcarAusente(evaluacionId, matriculaId, false)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.6,
              height: 32,
              width: '100%',
              maxWidth: 130,
              borderRadius: '8px',
              bgcolor: alpha('#ef4444', isDark ? 0.15 : 0.1),
              border: `1.5px solid ${alpha('#ef4444', 0.4)}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': { bgcolor: alpha('#ef4444', 0.2) },
            }}
          >
            <PersonOffRoundedIcon sx={{ fontSize: 13, color: '#ef4444' }} />
            <Typography sx={{ fontSize: 11.5, color: '#ef4444', fontWeight: 700 }}>
              Ausente
            </Typography>
          </Box>
        ) : (
          <>
            {/* Barra segmentada horizontal de 1 a 5 */}
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              p: '2px',
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}>
              {[1, 2, 3, 4, 5].map(pts => {
                const isExact = tieneNota && Number(val5) === pts;
                const isClose = tieneNota && Math.abs(Number(val5) - pts) < 0.25;
                const isSelected = isExact || isClose;
                const nivelConfig = NIVELES_AUTOEVALUACION.find(n => n.valor === pts);
                const btnColor = nivelConfig?.color || brandAccent;

                return (
                  <Tooltip key={pts} title={nivelConfig?.titulo || `${pts} pts`} placement="top" arrow>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => handleSelectScore(pts)}
                      sx={{
                        width: 25,
                        height: 25,
                        borderRadius: '6px',
                        border: 'none',
                        bgcolor: isSelected ? btnColor : 'transparent',
                        color: isSelected
                          ? '#ffffff'
                          : isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
                        fontSize: 12,
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isSelected ? `0 2px 6px ${alpha(btnColor, 0.45)}` : 'none',
                        transform: isSelected ? 'scale(1.05)' : 'none',
                        '&:hover': {
                          bgcolor: isSelected ? btnColor : alpha(btnColor, 0.15),
                          color: isSelected ? '#ffffff' : btnColor,
                        },
                      }}
                    >
                      {pts}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>

            {/* Input manual compacto en la misma fila */}
            <Tooltip title="Ajuste manual (0 a 5 pts)" placement="top" arrow>
              <input
                ref={inputRef}
                data-cell={cellId}
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={val5}
                placeholder="—"
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                style={{
                  width: 44,
                  height: 29,
                  borderRadius: 7,
                  textAlign: 'center',
                  fontSize: 12.5,
                  fontWeight: tieneNota ? 700 : 500,
                  fontFamily: 'inherit',
                  border: tieneNota
                    ? `1.5px solid ${alpha(colorNivel, isDark ? 0.45 : 0.4)}`
                    : `1px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                  background: tieneNota
                    ? alpha(colorNivel, isDark ? 0.15 : 0.08)
                    : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  color: tieneNota ? colorNivel : isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                  outline: 'none',
                  cursor: 'text',
                  transition: 'all 0.15s ease',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = brandAccent;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${alpha(brandAccent, 0.25)}`;
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = tieneNota
                    ? alpha(colorNivel, isDark ? 0.45 : 0.4)
                    : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)');
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </Tooltip>

            {/* Indicador con la reflexión del estudiante */}
            {nota?.observacion && (
              <Tooltip
                title={
                  <Box sx={{ p: 0.5, maxWidth: 280 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 11, mb: 0.5, color: '#c084fc' }}>
                      Reflexión del estudiante:
                    </Typography>
                    <Typography sx={{ fontSize: 11, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                      {nota.observacion}
                    </Typography>
                  </Box>
                }
                placement="top"
                arrow
              >
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: '50%',
                  bgcolor: alpha('#8b5cf6', isDark ? 0.25 : 0.15),
                  color: isDark ? '#c084fc' : '#7c3aed',
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: alpha('#8b5cf6', 0.35), transform: 'scale(1.1)' }
                }}>
                  <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 12 }} />
                </Box>
              </Tooltip>
            )}
          </>
        )}

        {/* Botón flotante para marcar/desmarcar ausente */}
        <Tooltip title={ausente ? 'Quitar ausente' : 'Marcar ausente'} placement="top">
          <Box
            onClick={e => { e.stopPropagation(); onMarcarAusente(evaluacionId, matriculaId, !ausente); }}
            sx={{
              position: 'absolute',
              top: -5,
              right: -4,
              width: 17,
              height: 17,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: ausente ? '#ef4444' : (isDark ? '#1e293b' : '#e2e8f0'),
              color: ausente ? '#fff' : 'text.secondary',
              border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              opacity: ausente ? 1 : 0,
              cursor: 'pointer',
              transition: 'all 0.15s',
              zIndex: 2,
              '.fila-estudiante:hover &': { opacity: 1 },
              '&:hover': {
                transform: 'scale(1.15)',
                bgcolor: '#ef4444',
                color: '#fff',
              },
            }}
          >
            <PersonOffRoundedIcon sx={{ fontSize: 9 }} />
          </Box>
        </Tooltip>
      </Box>
    );
  };

// ─── Fila editable (mobile, tarjeta de estudiante) ───────────────────────────

const FilaNotaMobile: React.FC<{
  ev: EvaluacionConProgreso;
  matriculaId: number;
  nota?: RegistroCalificacionItem & { evaluacion_id: number };
  isDark: boolean;
  brandAccent: string;
  isAUT?: boolean;
  onSetNota: GradeGridProps['onSetNota'];
  onMarcarAusente: GradeGridProps['onMarcarAusente'];
}> = ({ ev, matriculaId, nota, isDark, brandAccent, isAUT, onSetNota, onMarcarAusente }) => {
  const ausente = nota?.esta_ausente ?? false;
  const rawPuntaje = nota?.puntaje_obtenido;
  const tieneNota = nota !== undefined;
  const maximo = Number(ev.puntaje_maximo);

  if (isAUT) {
    const val5 = tieneNota && !ausente && rawPuntaje !== undefined && rawPuntaje !== null
      ? valorDbAEscala5(Number(rawPuntaje), maximo)
      : '';

    const handleSelectScore = (puntos5: number) => {
      const valDb = escala5AValorDb(puntos5, maximo);
      onSetNota(ev.id, matriculaId, {
        matricula_id: matriculaId,
        puntaje_obtenido: valDb,
        esta_ausente: false,
      });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '') {
        onSetNota(ev.id, matriculaId, {
          matricula_id: matriculaId,
          puntaje_obtenido: 0,
          esta_ausente: false,
        });
        return;
      }
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        const clamped = Math.min(Math.max(num, 0), 5);
        const valDb = escala5AValorDb(clamped, maximo);
        onSetNota(ev.id, matriculaId, {
          matricula_id: matriculaId,
          puntaje_obtenido: valDb,
          esta_ausente: false,
        });
      }
    };

    return (
      <Box sx={{
        py: 1.2, px: 0.5,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        '&:last-of-type': { borderBottom: 'none' },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{
            fontSize: 13, fontWeight: 700,
            color: isDark ? '#f1f5f9' : '#0f172a',
          }}>
            {ev.nombre}
          </Typography>
          <Chip
            size="small"
            label="/ 5 pts (5% ponderado)"
            sx={{
              fontSize: 10.5, fontWeight: 700,
              bgcolor: alpha(brandAccent, 0.12),
              color: brandAccent,
              height: 20,
            }}
          />
        </Box>

        {ausente ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1.2, py: 0.6, borderRadius: '10px',
              bgcolor: alpha('#ef4444', 0.12),
              border: `1px solid ${alpha('#ef4444', 0.3)}`,
              flex: 1,
            }}>
              <PersonOffRoundedIcon sx={{ fontSize: 13, color: '#ef4444' }} />
              <Typography sx={{ fontSize: 12, color: '#ef4444', fontWeight: 700 }}>Ausente</Typography>
            </Box>
            <Box
              onClick={() => onMarcarAusente(ev.id, matriculaId, false)}
              sx={{
                px: 1.5, py: 0.6, borderRadius: '8px', cursor: 'pointer',
                bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                fontSize: 12, fontWeight: 600,
              }}
            >
              Quitar
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            {/* Botones rápidos 1 al 5 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              {[1, 2, 3, 4, 5].map(pts => {
                const isSelected = val5 !== '' && Math.round(Number(val5)) === pts;
                const nivelConfig = NIVELES_AUTOEVALUACION.find(n => n.valor === pts);
                const btnColor = nivelConfig?.color || brandAccent;

                return (
                  <Box
                    key={pts}
                    component="button"
                    type="button"
                    onClick={() => handleSelectScore(pts)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      border: isSelected
                        ? `1.5px solid ${btnColor}`
                        : `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
                      bgcolor: isSelected
                        ? btnColor
                        : isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                      color: isSelected
                        ? '#ffffff'
                        : isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.8)',
                      fontSize: 13,
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 2px 6px ${alpha(btnColor, 0.4)}` : 'none',
                    }}
                  >
                    {pts}
                  </Box>
                );
              })}
            </Box>

            {/* Input manual y botón ausente */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <input
                type="number"
                min={0}
                max={5}
                step={0.5}
                value={val5}
                placeholder="—"
                onChange={handleInputChange}
                style={{
                  width: 52,
                  height: 32,
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  border: val5 !== ''
                    ? `1.5px solid ${alpha(brandAccent, 0.4)}`
                    : `1px dashed ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)'}`,
                  background: val5 !== '' ? alpha(brandAccent, isDark ? 0.14 : 0.08) : 'transparent',
                  color: isDark ? '#fff' : '#000',
                  outline: 'none',
                }}
              />
              <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>/ 5</Typography>
              <Box
                onClick={() => onMarcarAusente(ev.id, matriculaId, true)}
                sx={{
                  width: 32, height: 32, borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'text.secondary',
                  bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
                  border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                  cursor: 'pointer',
                }}
              >
                <PersonOffRoundedIcon sx={{ fontSize: 13 }} />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  const puntaje = ausente ? 0 : (nota?.puntaje_obtenido ?? '');
  const color = tieneNota && !ausente && typeof puntaje === 'number'
    ? colorNota(Number(puntaje), Number(ev.puntaje_maximo))
    : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSetNota(ev.id, matriculaId, {
      matricula_id: matriculaId,
      puntaje_obtenido: isNaN(val) ? 0 : Math.min(Math.max(val, 0), Number(ev.puntaje_maximo)),
      esta_ausente: false,
    });
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.2,
      py: 1.2, px: 0.5,
      borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
      '&:last-of-type': { borderBottom: 'none' },
    }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
          color: isDark ? '#f1f5f9' : '#0f172a',
        }}>
          {ev.nombre}
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>
          /{ev.puntaje_maximo} pts
        </Typography>
        {nota?.entrega_archivo_url && (
          <Box
            component="button"
            type="button"
            onClick={() => {
              router.push(`/dashboard/docente/calificaciones/${ev.asignacion_docente_id}-${ev.periodo_evaluacion_id}/practica/${ev.id}?matricula=${matriculaId}`);
            }}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.4,
              mt: 0.4,
              px: 0.8,
              py: 0.3,
              borderRadius: '6px',
              bgcolor: alpha('#2563eb', isDark ? 0.2 : 0.1),
              color: isDark ? '#60a5fa' : '#2563eb',
              border: `1px solid ${alpha('#2563eb', 0.25)}`,
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#2563eb',
                color: '#fff',
              }
            }}
          >
            <AttachFileRoundedIcon sx={{ fontSize: 12 }} />
            {nota.entrega_archivo_nombre ? `Revisar: ${nota.entrega_archivo_nombre}` : 'Revisar entrega'}
          </Box>
        )}
      </Box>

      {ausente ? (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          px: 1.2, py: 0.6, borderRadius: '10px',
          bgcolor: alpha('#ef4444', 0.12),
          border: `1px solid ${alpha('#ef4444', 0.3)}`,
        }}>
          <PersonOffRoundedIcon sx={{ fontSize: 13, color: '#ef4444' }} />
          <Typography sx={{ fontSize: 12, color: '#ef4444', fontWeight: 700 }}>Ausente</Typography>
        </Box>
      ) : (
        <input
          type="number"
          min={0}
          max={ev.puntaje_maximo}
          step={0.5}
          value={puntaje}
          placeholder="—"
          onChange={handleChange}
          style={{
            width: 68,
            height: 40,
            borderRadius: 10,
            border: tieneNota
              ? `1.5px solid ${alpha(color ?? brandAccent, 0.45)}`
              : `1px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
            background: tieneNota ? alpha(color ?? brandAccent, isDark ? 0.14 : 0.08) : 'transparent',
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: tieneNota ? color : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      )}

      <Box
        onClick={() => onMarcarAusente(ev.id, matriculaId, !ausente)}
        sx={{
          width: 36, height: 36, borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: ausente ? '#ef4444' : 'text.secondary',
          bgcolor: ausente ? alpha('#ef4444', 0.12) : (isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)),
          border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
          flexShrink: 0,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: alpha('#ef4444', 0.15),
            color: '#ef4444',
          },
        }}
      >
        <PersonOffRoundedIcon sx={{ fontSize: 15 }} />
      </Box>
    </Box>
  );
};

// ─── GradeGrid ────────────────────────────────────────────────────────────────

export const GradeGrid: React.FC<GradeGridProps> = ({
  dimensionCodigo,
  lista,
  evaluaciones,
  notas,
  isLoadingLista,
  isSaving,
  onSetNota,
  onMarcarAusente,
  onGuardar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const cfg = DIMENSIONES_CONFIG[dimensionCodigo];
  const dimColor = cfg.color;
  const isAUT = dimensionCodigo === 'AUT';

  const router = useRouter();
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const brandAccent = accentColor;
  const saveGradient = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';

  const evaluacionesVirtuales = useMemo(() => {
    return evaluaciones.filter(ev => ev.modalidad === 'virtual');
  }, [evaluaciones]);
  const hayEvaluacionesVirtuales = evaluacionesVirtuales.length > 0;

  const practicasDigitales = useMemo(() => {
    return evaluaciones.filter(ev => ev.permite_entrega_archivo);
  }, [evaluaciones]);
  const hayPracticasDigitales = practicasDigitales.length > 0;

  const [anchorElVirtual, setAnchorElVirtual] = useState<null | HTMLElement>(null);
  const [anchorElDigital, setAnchorElDigital] = useState<null | HTMLElement>(null);

  // --- Navegación con Tab/Enter -----------------------------------------------
  const tableRef = useRef<HTMLTableElement>(null);

  const handleTabNext = useCallback((current: string) => {
    if (!tableRef.current) return;
    const cells = Array.from(
      tableRef.current.querySelectorAll<HTMLInputElement>('input[data-cell]')
    );
    const idx = cells.findIndex(c => c.dataset.cell === current);
    if (idx !== -1 && idx < cells.length - 1) {
      cells[idx + 1].focus();
    }
  }, []);

  // --- Contadores globales ----------------------------------------------------
  const totalCeldas = lista.length * evaluaciones.length;
  const celdas_notas = Object.values(notas).filter(n => !n.esta_ausente).length;
  const celdas_ausentes = Object.values(notas).filter(n => n.esta_ausente).length;
  const totalRegistradas = celdas_notas + celdas_ausentes;
  const pctGlobal = totalCeldas > 0
    ? Math.round((totalRegistradas / totalCeldas) * 100) : 0;
  const todo_completo = pctGlobal === 100;

  // --- Total por estudiante (ponderado según Ley 070) -------------------------
  const calcularTotal = useCallback((matriculaId: number) => {
    let sumaPonderada = 0;
    let sumaPesos = 0;
    let contadas = 0;
    let suma = 0;
    let maxi = 0;

    evaluaciones.forEach(ev => {
      const key = `${ev.id}_${matriculaId}`;
      const nota = notas[key];
      if (nota !== undefined) {
        const peso = Number(ev.peso_en_dimension || 1);
        const max = Number(ev.puntaje_maximo || 100);
        const obtenido = nota.esta_ausente ? 0 : Number(nota.puntaje_obtenido ?? 0);
        const normalizada = max > 0 ? (obtenido / max) * 100 : 0;
        sumaPonderada += normalizada * peso;
        sumaPesos += peso;
        suma += obtenido;
        maxi += max;
        contadas++;
      }
    });

    const pctTotal = sumaPesos > 0 ? Math.round((sumaPonderada / sumaPesos) * 10) / 10 : null;
    return { suma, maxi, pctTotal, contadas };
  }, [evaluaciones, notas]);

  const borderCell = `1px solid ${isDark ? alpha(accentColor, 0.12) : alpha(accentColor, 0.14)}`;
  const thBase: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    fontSize: 12,
    borderRight: borderCell,
    borderBottom: `2px solid ${alpha(accentColor, 0.2)}`,
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
    background: isDark ? alpha('#facc15', 0.06) : alpha('#0288d1', 0.05),
  };

  // --- Estados vacíos ---------------------------------------------------------
  if (isLoadingLista) return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <CircularProgress size={32} sx={{ color: dimColor }} />
      <Typography variant="caption" color="text.secondary"
        sx={{ display: 'block', mt: 1.5, fontSize: 12 }}>
        Cargando estudiantes...
      </Typography>
    </Box>
  );

  if (evaluaciones.length === 0) return (
    <Box sx={{
      textAlign: 'center', py: 8, borderRadius: '16px',
      border: `2px dashed ${alpha(dimColor, 0.3)}`,
      bgcolor: isDark ? alpha(dimColor, 0.04) : alpha(cfg.bgColor, 0.3),
    }}>
      <HourglassEmptyRoundedIcon sx={{ fontSize: 44, color: alpha(dimColor, 0.4), mb: 1 }} />
      <Typography variant="body1" sx={{ color: dimColor, fontWeight: 700, fontSize: 15 }}>
        Sin evaluaciones en {cfg.label}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        No hay actividades evaluativas creadas para esta dimensión en el período actual.
      </Typography>
    </Box>
  );

  if (lista.length === 0) return (
    <Box sx={{
      textAlign: 'center', py: 8, borderRadius: '16px',
      border: `2px dashed ${alpha(dimColor, 0.3)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
    }}>
      <Typography variant="body2" color="text.secondary">
        No se encontraron estudiantes matriculados en este curso.
      </Typography>
    </Box>
  );

  // ── Barra superior: Card de acción & progreso ─────────────────────────────
  const barraSuperior = (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2.5,
      p: { xs: 1.8, sm: 2.2 },
      borderRadius: 3,
      border: `1px solid ${alpha(accentColor, 0.2)}`,
      background: isDark
        ? `linear-gradient(135deg, ${alpha('#facc15', 0.08)} 0%, ${alpha('#f59e0b', 0.02)} 100%)`
        : `linear-gradient(135deg, ${alpha('#0288d1', 0.07)} 0%, ${alpha('#01579b', 0.02)} 100%)`,
      boxShadow: isDark
        ? `0 4px 20px rgba(0,0,0,0.25), 0 0 1px ${alpha(accentColor, 0.2)}`
        : `0 2px 14px rgba(2,136,209,0.06)`,
      gap: 2,
      flexWrap: 'wrap',
    }}>
      {/* Progreso */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 200 }}>
        <Box sx={{ flex: 1, minWidth: 140 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                Progreso de notas:
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, fontWeight: 500 }}>
                {totalRegistradas}/{totalCeldas} registradas
                {celdas_ausentes > 0 && ` (${celdas_ausentes} ausentes)`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              {todo_completo && (
                <CheckCircleRoundedIcon sx={{ color: '#10b981', fontSize: 14 }} />
              )}
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{
                  fontSize: 12,
                  color: todo_completo ? '#10b981' : dimColor,
                }}
              >
                {pctGlobal}%
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            height: 7,
            borderRadius: 4,
            bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
            overflow: 'hidden',
          }}>
            <Box sx={{
              height: '100%',
              borderRadius: 4,
              width: `${pctGlobal}%`,
              background: todo_completo
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : `linear-gradient(90deg, ${dimColor}, ${alpha(dimColor, 0.7)})`,
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </Box>
        </Box>
      </Box>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap' }}>
        {/* Botón Llenado Rápido Autoevaluación */}
        {isAUT && evaluaciones.length > 0 && (
          <Box
            component="button"
            type="button"
            onClick={() => {
              const ev = evaluaciones[0];
              if (!ev) return;
              lista.forEach(est => {
                const valDb = escala5AValorDb(5, Number(ev.puntaje_maximo));
                onSetNota(ev.id, est.matricula_id, {
                  matricula_id: est.matricula_id,
                  puntaje_obtenido: valDb,
                  esta_ausente: false,
                });
              });
              toast.success('Se asignó 5 pts (100%) a todos los estudiantes');
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8,
              px: 2.2,
              py: 1.1,
              width: { xs: '100%', sm: 'auto' },
              borderRadius: '12px',
              border: `1.5px solid ${alpha('#8b5cf6', 0.4)}`,
              background: isDark ? alpha('#8b5cf6', 0.16) : alpha('#8b5cf6', 0.1),
              color: isDark ? '#c084fc' : '#7c3aed',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
              '&:hover': {
                background: isDark ? alpha('#8b5cf6', 0.26) : alpha('#8b5cf6', 0.18),
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
              },
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} />
            Asignar 5 pts a todos
          </Box>
        )}

        {/* Botón Monitoreo Examen Virtual */}
        {hayEvaluacionesVirtuales && (
          <>
            <Box
              component="button"
              type="button"
              onClick={(e) => {
                if (evaluacionesVirtuales.length === 1) {
                  const evVirtual = evaluacionesVirtuales[0];
                  router.push(`/dashboard/docente/calificaciones/${evVirtual.asignacion_docente_id}-${evVirtual.periodo_evaluacion_id}/examen/${evVirtual.id}`);
                } else {
                  setAnchorElVirtual(e.currentTarget);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.8,
                px: 2.2,
                py: 1.1,
                width: { xs: '100%', sm: 'auto' },
                borderRadius: '12px',
                border: `1.5px solid ${alpha('#10b981', 0.45)}`,
                background: isDark ? alpha('#10b981', 0.16) : alpha('#10b981', 0.1),
                color: isDark ? '#34d399' : '#059669',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: 0,
                '&:hover': {
                  background: isDark ? alpha('#10b981', 0.26) : alpha('#10b981', 0.18),
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                },
              }}
            >
              <ComputerRoundedIcon sx={{ fontSize: 18 }} />
              Monitorear Examen Virtual
              {evaluacionesVirtuales.length > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, ml: 0.4 }}>
                  <Chip
                    label={evaluacionesVirtuales.length}
                    size="small"
                    sx={{
                      height: 18,
                      minWidth: 18,
                      fontSize: 11,
                      fontWeight: 800,
                      bgcolor: alpha('#10b981', isDark ? 0.35 : 0.2),
                      color: isDark ? '#6ee7b7' : '#047857',
                      borderRadius: '6px',
                      pointerEvents: 'none',
                    }}
                  />
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
              )}
            </Box>

            <Menu
              anchorEl={anchorElVirtual}
              open={Boolean(anchorElVirtual)}
              onClose={() => setAnchorElVirtual(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 280,
                  maxWidth: 360,
                  borderRadius: '16px',
                  bgcolor: isDark ? '#0d1726' : '#ffffff',
                  border: `1.5px solid ${alpha('#10b981', 0.35)}`,
                  boxShadow: isDark
                    ? '0 16px 36px rgba(0,0,0,0.65)'
                    : '0 16px 36px rgba(16,185,129,0.18)',
                  p: 0.8,
                },
              }}
            >
              <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`, mb: 0.5 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Seleccionar Examen Virtual ({evaluacionesVirtuales.length})
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  Elige qué examen deseas monitorear y calificar:
                </Typography>
              </Box>
              {evaluacionesVirtuales.map((ev) => {
                const pct = ev.total_alumnos > 0 ? Math.round((ev.con_nota / ev.total_alumnos) * 100) : 0;
                return (
                  <MenuItem
                    key={ev.id}
                    onClick={() => {
                      setAnchorElVirtual(null);
                      router.push(`/dashboard/docente/calificaciones/${ev.asignacion_docente_id}-${ev.periodo_evaluacion_id}/examen/${ev.id}`);
                    }}
                    sx={{
                      borderRadius: '10px',
                      my: 0.3,
                      py: 1.1,
                      px: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: alpha('#10b981', isDark ? 0.18 : 0.1),
                        transform: 'translateX(3px)',
                      },
                    }}
                  >
                    <Box sx={{
                      width: 34, height: 34, borderRadius: '8px',
                      bgcolor: alpha('#10b981', 0.15),
                      border: `1px solid ${alpha('#10b981', 0.3)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <ComputerRoundedIcon sx={{ fontSize: 18, color: '#10b981' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }} noWrap>
                        {ev.nombre}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.2 }}>
                        /{ev.puntaje_maximo} pts {ev.duracion_minutos ? `· ${ev.duracion_minutos} min` : ''}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`${pct}%`}
                      sx={{
                        fontSize: 10,
                        fontWeight: 800,
                        height: 20,
                        bgcolor: pct === 100 ? alpha('#10b981', 0.2) : alpha('#f59e0b', 0.2),
                        color: pct === 100 ? '#10b981' : '#f59e0b',
                      }}
                    />
                    <ArrowForwardIosRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        )}

        {/* Botón Revisar Prácticas Digitales */}
        {hayPracticasDigitales && (
          <>
            <Box
              component="button"
              type="button"
              onClick={(e) => {
                if (practicasDigitales.length === 1) {
                  const evDigital = practicasDigitales[0];
                  router.push(`/dashboard/docente/calificaciones/${evDigital.asignacion_docente_id}-${evDigital.periodo_evaluacion_id}/practica/${evDigital.id}`);
                } else {
                  setAnchorElDigital(e.currentTarget);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.8,
                px: 2.2,
                py: 1.1,
                width: { xs: '100%', sm: 'auto' },
                borderRadius: '12px',
                border: `1.5px solid ${alpha('#3b82f6', 0.45)}`,
                background: isDark ? alpha('#3b82f6', 0.16) : alpha('#3b82f6', 0.1),
                color: isDark ? '#60a5fa' : '#2563eb',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: 0,
                '&:hover': {
                  background: isDark ? alpha('#3b82f6', 0.26) : alpha('#3b82f6', 0.18),
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                },
              }}
            >
              <CloudUploadRoundedIcon sx={{ fontSize: 18 }} />
              Revisar Prácticas Digitales
              {practicasDigitales.length > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, ml: 0.4 }}>
                  <Chip
                    label={practicasDigitales.length}
                    size="small"
                    sx={{
                      height: 18,
                      minWidth: 18,
                      fontSize: 11,
                      fontWeight: 800,
                      bgcolor: alpha('#3b82f6', isDark ? 0.35 : 0.2),
                      color: isDark ? '#93c5fd' : '#1d4ed8',
                      borderRadius: '6px',
                      pointerEvents: 'none',
                    }}
                  />
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
              )}
            </Box>

            <Menu
              anchorEl={anchorElDigital}
              open={Boolean(anchorElDigital)}
              onClose={() => setAnchorElDigital(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 280,
                  maxWidth: 360,
                  borderRadius: '16px',
                  bgcolor: isDark ? '#0d1726' : '#ffffff',
                  border: `1.5px solid ${alpha('#3b82f6', 0.35)}`,
                  boxShadow: isDark
                    ? '0 16px 36px rgba(0,0,0,0.65)'
                    : '0 16px 36px rgba(59,130,246,0.18)',
                  p: 0.8,
                },
              }}
            >
              <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`, mb: 0.5 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Seleccionar Práctica Digital ({practicasDigitales.length})
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  Elige qué práctica deseas revisar y calificar:
                </Typography>
              </Box>
              {practicasDigitales.map((ev) => {
                const pct = ev.total_alumnos > 0 ? Math.round((ev.con_nota / ev.total_alumnos) * 100) : 0;
                return (
                  <MenuItem
                    key={ev.id}
                    onClick={() => {
                      setAnchorElDigital(null);
                      router.push(`/dashboard/docente/calificaciones/${ev.asignacion_docente_id}-${ev.periodo_evaluacion_id}/practica/${ev.id}`);
                    }}
                    sx={{
                      borderRadius: '10px',
                      my: 0.3,
                      py: 1.1,
                      px: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: alpha('#3b82f6', isDark ? 0.18 : 0.1),
                        transform: 'translateX(3px)',
                      },
                    }}
                  >
                    <Box sx={{
                      width: 34, height: 34, borderRadius: '8px',
                      bgcolor: alpha('#3b82f6', 0.15),
                      border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <CloudUploadRoundedIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }} noWrap>
                        {ev.nombre}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.2 }}>
                        /{ev.puntaje_maximo} pts
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`${pct}%`}
                      sx={{
                        fontSize: 10,
                        fontWeight: 800,
                        height: 20,
                        bgcolor: pct === 100 ? alpha('#3b82f6', 0.2) : alpha('#f59e0b', 0.2),
                        color: pct === 100 ? '#3b82f6' : '#f59e0b',
                      }}
                    />
                    <ArrowForwardIosRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        )}

        {/* Botón Guardar */}
        <Box
          component="button"
          onClick={onGuardar}
          disabled={isSaving || totalRegistradas === 0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            px: 2.8,
            py: 1.1,
            width: { xs: '100%', sm: 'auto' },
            borderRadius: '12px',
            border: 'none',
            background: totalRegistradas > 0 ? saveGradient : (isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)),
            color: totalRegistradas > 0 ? '#ffffff' : 'text.disabled',
            fontWeight: 700,
            fontSize: 13.5,
            cursor: isSaving || totalRegistradas === 0 ? 'default' : 'pointer',
            boxShadow: totalRegistradas > 0 ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
            '&:hover': {
              opacity: isSaving ? 1 : 0.92,
              transform: isSaving || totalRegistradas === 0 ? 'none' : 'translateY(-1px)',
              boxShadow: totalRegistradas > 0 ? '0 6px 18px rgba(16, 185, 129, 0.45)' : 'none',
            },
          }}
        >
          {isSaving ? (
            <CircularProgress size={16} sx={{ color: '#fff' }} />
          ) : (
            <SaveRoundedIcon sx={{ fontSize: 18 }} />
          )}
          {isSaving ? 'Guardando...' : `Guardar (${totalRegistradas})`}
        </Box>
      </Box>
    </Box>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE: tarjetas por estudiante
  // ══════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <Box>
        {barraSuperior}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {lista.map((est, estIdx) => {
            const { suma, maxi, contadas } = calcularTotal(est.matricula_id);
            const pctTotal = maxi > 0 ? Math.round((suma / maxi) * 100) : null;
            const estado = estadoChip(contadas > 0 ? pctTotal : null);

            return (
              <Box key={est.matricula_id} sx={{
                borderRadius: '14px',
                border: `1px solid ${alpha(accentColor, 0.2)}`,
                overflow: 'hidden',
                background: isDark
                  ? `linear-gradient(135deg, ${alpha('#facc15', 0.05)} 0%, rgba(20, 26, 38, 0.85) 100%)`
                  : `linear-gradient(135deg, ${alpha('#0288d1', 0.04)} 0%, #ffffff 100%)`,
                boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.03)',
              }}>
                {/* Header de la tarjeta */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.2,
                  p: 1.5,
                  borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8fafc', 0.9),
                }}>
                  <Typography sx={{ minWidth: 16, fontSize: 11, fontWeight: 700, color: 'text.secondary' }}>
                    {estIdx + 1}
                  </Typography>
                  <Avatar
                    src={est.estudiante_foto ?? undefined}
                    sx={{
                      width: 34, height: 34,
                      fontSize: 12, fontWeight: 700,
                      background: `linear-gradient(135deg, ${dimColor}, ${alpha(dimColor, 0.7)})`,
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    {iniciales(est.estudiante_apellidos, est.estudiante_nombres)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{
                      fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}>
                      {est.estudiante_apellidos}, {est.estudiante_nombres}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {est.estudiante_codigo}
                    </Typography>
                  </Box>
                  {contadas > 0 && pctTotal !== null ? (() => {
                    const notaPonderada = Math.round(((pctTotal * cfg.porcentaje) / 100) * 10) / 10;
                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.2 }}>
                        <Chip
                          label={`${notaPonderada} / ${cfg.porcentaje} pts`}
                          size="small"
                          sx={{
                            fontSize: 12, height: 26, fontWeight: 800,
                            bgcolor: isAUT ? alpha('#8b5cf6', 0.14) : (estado.bg ?? undefined),
                            color: isAUT ? '#8b5cf6' : estado.color,
                            border: `1px solid ${isAUT ? '#8b5cf6' : estado.color}`,
                            flexShrink: 0,
                          }}
                        />

                      </Box>
                    );
                  })() : (
                    <Typography sx={{ fontSize: 11, color: 'text.disabled', flexShrink: 0 }}>—</Typography>
                  )}
                </Box>

                {/* Evaluaciones */}
                <Box sx={{ px: 1.5, py: 0.5 }}>
                  {evaluaciones.map(ev => (
                    <FilaNotaMobile
                      key={ev.id}
                      ev={ev}
                      matriculaId={est.matricula_id}
                      nota={notas[`${ev.id}_${est.matricula_id}`]}
                      isDark={isDark}
                      brandAccent={brandAccent}
                      isAUT={isAUT}
                      onSetNota={onSetNota}
                      onMarcarAusente={onMarcarAusente}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Leyenda */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
          {[
            { label: 'Aprobado ≥51%', color: '#10b981' },
            { label: 'Reprobado <51%', color: '#ef4444' },
          ].map(l => (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
              <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>{l.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DESKTOP / TABLET: Estilo Asistencia (Tarjetas interactivas por estudiante)
  // ══════════════════════════════════════════════════════════════════════════
  const colWidth = isAUT ? 200 : COL_WIDTH_EVALUACION;
  const minWidthTabla = Math.max(700, 280 + evaluaciones.length * (colWidth + 12) + 110);

  return (
    <Box>
      {barraSuperior}

      <Box ref={tableRef} sx={{ overflowX: 'auto', pb: 1 }}>
        <Box sx={{ minWidth: minWidthTabla }}>
          {/* ══ Encabezado de Columnas (Estilo Asistencia) ══ */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 1.5,
              mb: 1.5,
              borderRadius: '10px',
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04)}`,
            }}
          >
            <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ width: 24, textAlign: 'center' }}>
              #
            </Typography>
            <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ flex: 1, textTransform: 'uppercase' }}>
              ESTUDIANTE
            </Typography>

            {/* Columnas de Evaluaciones */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {evaluaciones.map(ev => {
                const pct = ev.total_alumnos > 0
                  ? Math.round((ev.con_nota / ev.total_alumnos) * 100) : 0;
                return (
                  <Box
                    key={ev.id}
                    sx={{
                      width: colWidth,
                      textAlign: 'center',
                      p: 0.5,
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.4,
                    }}
                  >
                    <Tooltip title={ev.nombre} placement="top">
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        sx={{
                          color: 'text.primary',
                          fontSize: 11,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.25,
                          height: 28,
                          maxWidth: colWidth,
                          textAlign: 'center',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                          cursor: 'default',
                        }}
                      >
                        {ev.nombre}
                      </Typography>
                    </Tooltip>

                    <Box
                      sx={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        px: 0.8,
                        py: 0.2,
                        borderRadius: '5px',
                        bgcolor: alpha(dimColor, isDark ? 0.15 : 0.1),
                        color: dimColor,
                        display: 'inline-block',
                      }}
                    >
                      {isAUT ? '/ 5 pts · 5%' : `/${ev.puntaje_maximo} pts`}
                    </Box>

                    {/* Botón de acceso a revisión de práctica digital */}
                    {ev.permite_entrega_archivo && (
                      <Tooltip title="Ir al apartado para revisar fotos y calificar práctica" placement="top">
                        <Box
                          component="button"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/docente/calificaciones/${ev.asignacion_docente_id}-${ev.periodo_evaluacion_id}/practica/${ev.id}`);
                          }}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.4,
                            px: 0.8,
                            py: 0.25,
                            borderRadius: '6px',
                            border: `1.5px solid ${alpha('#3b82f6', 0.55)}`,
                            bgcolor: isDark ? alpha('#3b82f6', 0.25) : alpha('#3b82f6', 0.14),
                            color: isDark ? '#60a5fa' : '#2563eb',
                            fontSize: 9.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: '#2563eb',
                              color: '#ffffff',
                              transform: 'scale(1.05)',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
                            }
                          }}
                        >
                          <CloudUploadRoundedIcon sx={{ fontSize: 11 }} />
                          Revisar Tarea
                        </Box>
                      </Tooltip>
                    )}

                    {/* Botón de acceso a monitoreo de examen virtual */}
                    {ev.modalidad === 'virtual' && (
                      <Tooltip title="Ir a revisar y calificar examen virtual" placement="top">
                        <Box
                          component="button"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/docente/calificaciones/${ev.asignacion_docente_id}-${ev.periodo_evaluacion_id}/examen/${ev.id}`);
                          }}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.4,
                            px: 0.8,
                            py: 0.2,
                            borderRadius: '5px',
                            border: `1px solid ${alpha('#10b981', 0.45)}`,
                            bgcolor: isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.12),
                            color: isDark ? '#34d399' : '#059669',
                            fontSize: 9,
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: '#10b981',
                              color: '#ffffff',
                              transform: 'scale(1.05)',
                            }
                          }}
                        >
                          <ComputerRoundedIcon sx={{ fontSize: 11 }} />
                          Examen
                        </Box>
                      </Tooltip>
                    )}

                    {/* Barra de progreso de calificación */}
                    <Box
                      sx={{
                        width: '85%',
                        height: 3,
                        borderRadius: 1.5,
                        bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          borderRadius: 1.5,
                          width: `${pct}%`,
                          bgcolor: pct === 100 ? '#10b981' : dimColor,
                          transition: 'width 0.3s',
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 8.5,
                        color: pct === 100 ? '#10b981' : 'text.disabled',
                        fontWeight: pct === 100 ? 700 : 500,
                        lineHeight: 1,
                      }}
                    >
                      {pct}% calificado
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Typography
              variant="caption"
              fontWeight={800}
              color="text.disabled"
              sx={{ width: 100, textAlign: 'center', textTransform: 'uppercase' }}
            >
              TOTAL ({cfg.porcentaje} PTS)
            </Typography>
          </Box>

          {/* ══ Filas de Estudiantes (Tarjetas tipo Asistencia) ══ */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
            {lista.map((est, estIdx) => {
              const { suma, maxi, contadas } = calcularTotal(est.matricula_id);
              const pctTotal = maxi > 0 ? Math.round((suma / maxi) * 100) : null;
              const estado = estadoChip(contadas > 0 ? pctTotal : null);

              return (
                <Box
                  key={est.matricula_id}
                  className="fila-estudiante"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '12px',
                    border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
                    bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      borderColor: alpha(accentColor, 0.35),
                      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 14px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  {/* Bloque 1: # + Avatar + Nombre */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color="text.disabled"
                      sx={{ minWidth: 22, textAlign: 'center', flexShrink: 0 }}
                    >
                      {estIdx + 1}
                    </Typography>
                    <Avatar
                      src={est.estudiante_foto ?? undefined}
                      sx={{
                        width: 36,
                        height: 36,
                        fontSize: 12,
                        fontWeight: 800,
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${dimColor}, ${alpha(dimColor, 0.7)})`,
                        border: `2px solid ${alpha(dimColor, 0.3)}`,
                        color: '#fff',
                      }}
                    >
                      {iniciales(est.estudiante_apellidos, est.estudiante_nombres)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={800} noWrap sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                        {est.estudiante_apellidos}, {est.estudiante_nombres}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {est.estudiante_codigo || `Mat: #${est.matricula_id}`}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Bloque 2: Evaluaciones */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                    {evaluaciones.map((ev, evIdx) => (
                      isAUT ? (
                        <CeldaAutoevaluacion
                          key={ev.id}
                          evaluacionId={ev.id}
                          matriculaId={est.matricula_id}
                          maximo={Number(ev.puntaje_maximo)}
                          nota={notas[`${ev.id}_${est.matricula_id}`]}
                          isDark={isDark}
                          brandAccent={dimColor}
                          cellId={`${evIdx}_${estIdx}`}
                          onSetNota={onSetNota}
                          onMarcarAusente={onMarcarAusente}
                          onTabNext={handleTabNext}
                        />
                      ) : (
                        <CeldaNota
                          key={ev.id}
                          evaluacionId={ev.id}
                          matriculaId={est.matricula_id}
                          maximo={Number(ev.puntaje_maximo)}
                          nota={notas[`${ev.id}_${est.matricula_id}`]}
                          isDark={isDark}
                          brandAccent={dimColor}
                          cellId={`${evIdx}_${estIdx}`}
                          onSetNota={onSetNota}
                          onMarcarAusente={onMarcarAusente}
                          onTabNext={handleTabNext}
                          onRevisarPractica={(evId, matId) => {
                            router.push(`/dashboard/docente/calificaciones/${ev.asignacion_docente_id}-${ev.periodo_evaluacion_id}/practica/${evId}?matricula=${matId}`);
                          }}
                        />
                      )
                    ))}
                  </Box>

                  {/* Bloque 3: Total Ponderado (Sin porcentaje debajo) */}
                  <Box sx={{ width: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {contadas > 0 && pctTotal !== null ? (() => {
                      const notaPonderada = Math.round(((pctTotal * cfg.porcentaje) / 100) * 10) / 10;
                      return (
                        <Tooltip
                          title={`Nota obtenida: ${notaPonderada} de ${cfg.porcentaje} pts`}
                          placement="top"
                          arrow
                        >
                          <Chip
                            label={`${notaPonderada} / ${cfg.porcentaje} pts`}
                            size="small"
                            sx={{
                              fontSize: 12,
                              height: 28,
                              fontWeight: 800,
                              bgcolor: isAUT ? alpha('#8b5cf6', 0.14) : (estado.bg ?? undefined),
                              color: isAUT ? '#8b5cf6' : estado.color,
                              border: `1.5px solid ${alpha(isAUT ? '#8b5cf6' : estado.color, 0.45)}`,
                              borderRadius: '9px',
                              cursor: 'default',
                            }}
                          />
                        </Tooltip>
                      );
                    })() : (
                      <Typography sx={{ fontSize: 13, color: 'text.disabled', fontWeight: 600 }}>—</Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* ══ Promedio de Curso (Card Footer Estilo Asistencia) ══ */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1.5,
              borderRadius: '12px',
              border: `1.5px solid ${alpha(accentColor, isDark ? 0.2 : 0.15)}`,
              bgcolor: isDark ? alpha(accentColor, 0.04) : alpha(accentColor, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, pl: 0.5 }}>
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{
                  color: isDark ? '#f8fafc' : '#0f172a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 11.5,
                }}
              >
                Promedio de curso
              </Typography>
            </Box>

            {/* Promedios por columna de evaluación */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
              {evaluaciones.map(ev => {
                const vals = lista
                  .map(est => notas[`${ev.id}_${est.matricula_id}`])
                  .filter(n => n && !n.esta_ausente && n.puntaje_obtenido !== null && n.puntaje_obtenido !== undefined)
                  .map(n => Number(n!.puntaje_obtenido));
                const prom = vals.length > 0
                  ? (vals.reduce((s, v) => s + v, 0) / vals.length)
                  : null;

                const promVal = prom !== null
                  ? (isAUT ? valorDbAEscala5(prom, Number(ev.puntaje_maximo)) : prom)
                  : null;

                const promTexto = promVal !== null
                  ? (typeof promVal === 'number' ? (isAUT ? `${promVal.toFixed(1)} / 5` : promVal.toFixed(1)) : '—')
                  : '—';

                return (
                  <Box
                    key={ev.id}
                    sx={{
                      width: colWidth,
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: prom !== null ? dimColor : 'text.disabled',
                      }}
                    >
                      {promTexto}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Total Promedio */}
            <Box sx={{ width: 100, textAlign: 'center', flexShrink: 0 }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>
                Prom.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};
