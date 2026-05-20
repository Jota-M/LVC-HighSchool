'use client';
// components/notificaciones/SelectorFiltrosAudiencia.tsx
//
// Selects en cascada: Nivel → Grado → Paralelo + Periodo independiente.
// Usa MUI Popover (portal) para el dropdown, así nunca queda cortado
// por el overflow:hidden del card padre.

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, alpha, useTheme, CircularProgress,
  Popover, Stack,
} from '@mui/material';
import { keyframes } from '@mui/system';

import SchoolRoundedIcon           from '@mui/icons-material/SchoolRounded';
import ClassRoundedIcon            from '@mui/icons-material/ClassRounded';
import GroupsRoundedIcon           from '@mui/icons-material/GroupsRounded';
import CalendarMonthRoundedIcon    from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon      from '@mui/icons-material/CheckCircleRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import FilterAltRoundedIcon        from '@mui/icons-material/FilterAltRounded';
import InfoOutlinedIcon            from '@mui/icons-material/InfoOutlined';
import CloseRoundedIcon            from '@mui/icons-material/CloseRounded';

import { useAcademicos } from '@/hooks/useAcademicos';
import { Grado, Paralelo, NivelAcademico, PeriodoAcademico } from '@/services/academicos';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Tipos exportados ─────────────────────────────────────────────────────────
export interface FiltrosAudiencia {
  nivel_academico_id?:   number;
  grado_id?:             number;
  paralelo_id?:          number;
  periodo_academico_id?: number;
  // Labels para el resumen visual
  _nivel_nombre?:    string;
  _grado_nombre?:    string;
  _paralelo_nombre?: string;
  _periodo_nombre?:  string;
}

// ─── SelectVisual — usa Popover para evitar clipping ─────────────────────────
interface SelectVisualProps<T> {
  label:       string;
  icon:        React.ReactNode;
  items:       T[];
  value:       number | undefined;
  onSelect:    (item: T | null) => void;
  getLabel:    (item: T) => string;
  getId:       (item: T) => number;
  placeholder: string;
  accentColor: string;
  isDark:      boolean;
  disabled?:   boolean;
  loading?:    boolean;
  sublabel?:   (item: T) => string;
}

function SelectVisual<T>({
  label, icon, items, value, onSelect, getLabel, getId,
  placeholder, accentColor, isDark, disabled, loading, sublabel,
}: SelectVisualProps<T>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open     = Boolean(anchorEl);
  const selected = items.find(i => getId(i) === value) ?? null;

  const handleOpen  = (e: React.MouseEvent<HTMLElement>) => {
    if (!disabled) setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      {/* Trigger */}
      <Box
        onClick={handleOpen}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.2,
          px: 1.5, py: 1.2, borderRadius: '12px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: `1.5px solid ${selected ? accentColor : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          bgcolor: selected
            ? alpha(accentColor, isDark ? 0.12 : 0.06)
            : isDark ? alpha('#fff', 0.02) : '#fff',
          opacity: disabled ? 0.45 : 1,
          transition: 'all .15s',
          '&:hover': !disabled ? { borderColor: accentColor } : {},
        }}
      >
        <Box sx={{ color: selected ? accentColor : 'text.disabled', display: 'flex', flexShrink: 0 }}>
          {loading
            ? <CircularProgress size={16} sx={{ color: accentColor }} />
            : icon}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{
            fontSize: 10, fontWeight: 700, color: 'text.disabled',
            textTransform: 'uppercase', letterSpacing: 0.4, display: 'block',
          }}>
            {label}
          </Typography>
          <Typography variant="caption" fontWeight={selected ? 700 : 400}
            sx={{ fontSize: 12.5, color: selected ? accentColor : 'text.secondary' }} noWrap>
            {selected ? getLabel(selected) : placeholder}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
          {selected && (
            <Box
              component="span"
              onClick={e => { e.stopPropagation(); onSelect(null); handleClose(); }}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, borderRadius: '50%',
                bgcolor: alpha(accentColor, 0.12), color: accentColor,
                '&:hover': { bgcolor: alpha(accentColor, 0.22) },
                transition: 'bg .1s',
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 12 }} />
            </Box>
          )}
          <KeyboardArrowDownRoundedIcon sx={{
            fontSize: 16, color: 'text.disabled',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s',
          }} />
        </Box>
      </Box>

      {/* Dropdown via Popover — renderiza en portal, nunca se corta */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disablePortal={false}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: '14px',
            border: `1.5px solid ${alpha(accentColor, 0.25)}`,
            bgcolor: isDark ? '#1e1e2e' : '#fff',
            boxShadow: `0 8px 28px ${alpha(accentColor, 0.18)}`,
            minWidth: anchorEl?.offsetWidth ?? 200,
            maxHeight: 260,
            overflow: 'hidden auto',
            p: 0.5,
          },
        }}
      >
        {/* Sin filtro */}
        <Box onClick={() => { onSelect(null); handleClose(); }} sx={{
          px: 1.8, py: 0.9, cursor: 'pointer', borderRadius: '8px',
          fontSize: 12, color: 'text.disabled', fontStyle: 'italic',
          '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04) },
        }}>
          Sin filtro
        </Box>

        {items.length === 0 && !loading && (
          <Box sx={{ px: 1.8, py: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.disabled">Sin opciones</Typography>
          </Box>
        )}

        {items.map((item, i) => {
          const isSel = getId(item) === value;
          return (
            <Box key={getId(item)} onClick={() => { onSelect(item); handleClose(); }} sx={{
              display: 'flex', alignItems: 'center', gap: 1.2,
              px: 1.8, py: 0.9, cursor: 'pointer', borderRadius: '8px',
              bgcolor: isSel ? alpha(accentColor, isDark ? 0.15 : 0.07) : 'transparent',
              animation: `${fadeIn} 0.12s ease-out ${i * 0.025}s both`,
              '&:hover': {
                bgcolor: isSel
                  ? alpha(accentColor, 0.15)
                  : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
              },
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" fontWeight={isSel ? 700 : 500}
                  sx={{ fontSize: 13, color: isSel ? accentColor : 'text.primary', display: 'block' }}>
                  {getLabel(item)}
                </Typography>
                {sublabel && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {sublabel(item)}
                  </Typography>
                )}
              </Box>
              {isSel && <CheckCircleRoundedIcon sx={{ fontSize: 14, color: accentColor, flexShrink: 0 }} />}
            </Box>
          );
        })}
      </Popover>
    </>
  );
}

// ─── Resumen del filtro activo ─────────────────────────────────────────────────
const ResumenFiltro: React.FC<{
  filtros:    FiltrosAudiencia;
  audiencia:  string;
  accentColor: string;
  isDark:     boolean;
}> = ({ filtros, audiencia, accentColor, isDark }) => {
  const hayFiltro = !!(
    filtros.nivel_academico_id || filtros.grado_id ||
    filtros.paralelo_id        || filtros.periodo_academico_id
  );
  if (!hayFiltro) return null;

  const partes: string[] = [];
  if (filtros._nivel_nombre)    partes.push(filtros._nivel_nombre);
  if (filtros._grado_nombre)    partes.push(filtros._grado_nombre);
  if (filtros._paralelo_nombre) partes.push(`Paralelo "${filtros._paralelo_nombre}"`);
  if (filtros._periodo_nombre)  partes.push(filtros._periodo_nombre);

  const audienciaLabel: Record<string, string> = {
    todos:              'docentes, padres y estudiantes',
    docentes:           'docentes',
    padres:             'padres',
    estudiantes:        'estudiantes',
    padres_estudiantes: 'padres y estudiantes',
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'flex-start', gap: 1,
      p: 1.3, borderRadius: '10px',
      bgcolor: alpha(accentColor, isDark ? 0.1 : 0.06),
      border: `1px solid ${alpha(accentColor, 0.2)}`,
      animation: `${fadeIn} 0.2s ease-out`,
    }}>
      <InfoOutlinedIcon sx={{ fontSize: 14, color: accentColor, flexShrink: 0, mt: '1px' }} />
      <Box>
        <Typography variant="caption" fontWeight={700}
          sx={{ color: accentColor, display: 'block', fontSize: 11 }}>
          Se enviará a los {audienciaLabel[audiencia] ?? audiencia} de:
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
          {partes.join(' · ')}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
interface Props {
  value:       FiltrosAudiencia;
  onChange:    (filtros: FiltrosAudiencia) => void;
  accentColor: string;
  audiencia:   string;
}

export const SelectorFiltrosAudiencia: React.FC<Props> = ({
  value, onChange, accentColor, audiencia,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const {
    niveles, grados, paralelos, periodos,
    loadingNiveles, loadingGrados, loadingParalelos, loadingPeriodos,
    cargarNiveles, cargarGrados, cargarParalelos, cargarPeriodos,
  } = useAcademicos({
    autoLoad:         false,
    loadNiveles:      true,
    loadGrados:       true,
    loadParalelos:    true,
    loadPeriodos:     true,
    loadTurnos:       false,
    loadMaterias:     false,
    loadGradoMaterias: false,
  });

  useEffect(() => {
    cargarNiveles();
    cargarPeriodos();
  }, []);

  useEffect(() => {
    if (value.nivel_academico_id) cargarGrados(value.nivel_academico_id);
  }, [value.nivel_academico_id]);

  useEffect(() => {
    if (value.grado_id) cargarParalelos({ grado_id: value.grado_id });
  }, [value.grado_id]);

  const handleNivel = (item: NivelAcademico | null) =>
    onChange({
      ...value,
      nivel_academico_id: item?.id,
      _nivel_nombre:      item?.nombre,
      grado_id:           undefined,
      _grado_nombre:      undefined,
      paralelo_id:        undefined,
      _paralelo_nombre:   undefined,
    });

  const handleGrado = (item: Grado | null) =>
    onChange({
      ...value,
      grado_id:          item?.id,
      _grado_nombre:     item?.nombre,
      paralelo_id:       undefined,
      _paralelo_nombre:  undefined,
    });

  const handleParalelo = (item: Paralelo | null) =>
    onChange({ ...value, paralelo_id: item?.id, _paralelo_nombre: item?.nombre });

  const handlePeriodo = (item: PeriodoAcademico | null) =>
    onChange({ ...value, periodo_academico_id: item?.id, _periodo_nombre: item?.nombre });

  const gradosFiltrados   = value.nivel_academico_id
    ? grados.filter(g => g.nivel_academico_id === value.nivel_academico_id)
    : grados;
  const paralelosFiltrados = value.grado_id
    ? paralelos.filter(p => p.grado_id === value.grado_id)
    : paralelos;

  return (
    <Stack spacing={1.5}>

      {/* Cabecera */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
        <FilterAltRoundedIcon sx={{ fontSize: 14, color: accentColor }} />
        <Typography variant="caption" fontWeight={800}
          sx={{ color: accentColor, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Filtrar por curso
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, ml: 0.5 }}>
          · sin selección = toda la audiencia
        </Typography>
      </Box>

      {/* Selects 2×2 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>

        <SelectVisual<NivelAcademico>
          label="Nivel"
          icon={<SchoolRoundedIcon sx={{ fontSize: 16 }} />}
          items={niveles}
          value={value.nivel_academico_id}
          onSelect={handleNivel}
          getLabel={n => n.nombre}
          getId={n => n.id}
          placeholder="Todos los niveles"
          accentColor={accentColor}
          isDark={isDark}
          loading={loadingNiveles}
          sublabel={n => n.codigo ?? ''}
        />

        <SelectVisual<Grado>
          label="Grado"
          icon={<ClassRoundedIcon sx={{ fontSize: 16 }} />}
          items={gradosFiltrados}
          value={value.grado_id}
          onSelect={handleGrado}
          getLabel={g => g.nombre}
          getId={g => g.id}
          placeholder={value.nivel_academico_id ? 'Todos los grados' : 'Elegí un nivel primero'}
          accentColor={accentColor}
          isDark={isDark}
          disabled={!value.nivel_academico_id}
          loading={loadingGrados}
        />

        <SelectVisual<Paralelo>
          label="Paralelo"
          icon={<GroupsRoundedIcon sx={{ fontSize: 16 }} />}
          items={paralelosFiltrados}
          value={value.paralelo_id}
          onSelect={handleParalelo}
          getLabel={p => `"${p.nombre}"${p.turno_nombre ? ` — ${p.turno_nombre}` : ''}`}
          getId={p => p.id}
          placeholder={value.grado_id ? 'Todos los paralelos' : 'Elegí un grado primero'}
          accentColor={accentColor}
          isDark={isDark}
          disabled={!value.grado_id}
          loading={loadingParalelos}
          sublabel={p => p.aula ? `Aula ${p.aula}` : ''}
        />

        <SelectVisual<PeriodoAcademico>
          label="Periodo académico"
          icon={<CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />}
          items={periodos}
          value={value.periodo_academico_id}
          onSelect={handlePeriodo}
          getLabel={p => p.nombre}
          getId={p => p.id}
          placeholder="Periodo actual"
          accentColor={accentColor}
          isDark={isDark}
          loading={loadingPeriodos}
          sublabel={p => p.activo ? '✓ Activo' : ''}
        />
      </Box>

      {/* Resumen */}
      <ResumenFiltro
        filtros={value}
        audiencia={audiencia}
        accentColor={accentColor}
        isDark={isDark}
      />
    </Stack>
  );
};

export default SelectorFiltrosAudiencia;