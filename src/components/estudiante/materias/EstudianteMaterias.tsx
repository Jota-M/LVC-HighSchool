'use client';
// components/estudiante/materias/EstudianteMaterias.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box, Typography, alpha, useTheme, keyframes,
  Fade, Skeleton, Paper, Chip, Grid, LinearProgress,
  Avatar, Stack, Divider, IconButton, Tooltip,
  TextField, InputAdornment, Collapse, Badge,
  Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, CircularProgress,
} from '@mui/material';
import {
  School       as SchoolIcon,
  ArrowBack    as BackIcon,
  Search       as SearchIcon,
  Refresh      as RefreshIcon,
  Person       as PersonIcon,
  MenuBook     as LibroIcon,
  Assignment   as TareaIcon,
  BarChart     as NotaIcon,
  CheckCircle  as CheckIcon,
  RadioButtonUnchecked as PendienteIcon,
  PlayCircle   as EnProgresoIcon,
  Replay       as RevisandoIcon,
  ExpandMore   as ExpandMoreIcon,
  ExpandLess   as CollapseIcon,
  AccessTime   as TiempoIcon,
  Star         as DestacadoIcon,
  Download     as DescargaIcon,
  OpenInNew    as LinkIcon,
  Visibility   as VerIcon,
  CalendarMonth as AsistenciaIcon,
  TrendingUp   as TrendIcon,
  FilterList   as FilterIcon,
  GridView     as GridIcon,
  ViewList     as ListIcon,
  HourglassEmpty as SinNotaIcon,
  CancelRounded as ReprobadoIcon,
  CheckCircleRounded as AprobadoIcon,
} from '@mui/icons-material';

import {
  useMisMaterias,
  useTemarioEstudiante,
  useMaterialesEstudiante,
  useNotasPorMateriaEstudiante,
  useProgresoEstudiante,
} from '@/hooks/useEstudiante';
import type {
  MateriaResumen, TemarioItem, MaterialEstudiante,
} from '@/types/estudiante';

// ─────────────────────────────────────────────────────────────
// ANIMACIONES
// ─────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
`;
const slideLeft = keyframes`
  from { opacity:0; transform:translateX(24px); }
  to   { opacity:1; transform:translateX(0); }
`;
const fillBar = keyframes`
  from { transform:scaleX(0); }
  to   { transform:scaleX(1); }
`;
const float = keyframes`
  0%,100% { transform:translateY(0) rotate(-2deg); }
  50%      { transform:translateY(-5px) rotate(2deg); }
`;
const shimmer = keyframes`
  0%   { background-position:-1000px 0; }
  100% { background-position: 1000px 0; }
`;

// ─────────────────────────────────────────────────────────────
// HELPERS / CONSTANTES
// ─────────────────────────────────────────────────────────────
const PALETTE = [
  '#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6',
  '#06B6D4','#F97316','#EC4899','#3B82F6','#14B8A6',
];
const getColor = (str: string, override?: string | null) => {
  if (override) return override;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const ESTADO_PROGRESO = {
  no_iniciado: { label:'Sin iniciar',  icon:<PendienteIcon   sx={{fontSize:14}}/>, color:'#6B7280' },
  en_progreso:  { label:'En progreso', icon:<EnProgresoIcon  sx={{fontSize:14}}/>, color:'#3B82F6' },
  completado:   { label:'Completado',  icon:<CheckIcon       sx={{fontSize:14}}/>, color:'#10B981' },
  revisando:    { label:'Revisando',   icon:<RevisandoIcon   sx={{fontSize:14}}/>, color:'#F59E0B' },
};

const round1 = (n?: number | null) => n != null ? Math.round(n * 10) / 10 : null;
const fmtBytes = (b?: number | null) => {
  if (!b) return null;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

type TabDetalle = 'temario' | 'materiales' | 'notas';

// ─────────────────────────────────────────────────────────────
// BARRA DE PROGRESO MINI
// ─────────────────────────────────────────────────────────────
const BarraPct: React.FC<{
  value: number; color: string; height?: number; delay?: number;
}> = ({ value, color, height = 6, delay = 0 }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{
      height, borderRadius:3, overflow:'hidden',
      bgcolor: isDark ? alpha('#fff', .06) : alpha('#000', .06),
    }}>
      <Box sx={{
        height:'100%', width:`${Math.min(100, value)}%`,
        borderRadius:3, bgcolor:color,
        transformOrigin:'left',
        animation:`${fillBar} .7s cubic-bezier(.4,0,.2,1) ${delay}s both`,
      }} />
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// ── LISTA DE MATERIAS (vista principal) ───────────────────────
// ─────────────────────────────────────────────────────────────

interface ListaMateriasProps {
  onSelect: (m: MateriaResumen) => void;
}

const ListaMaterias: React.FC<ListaMateriasProps> = ({ onSelect }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [busqueda, setBusqueda] = useState('');
  const [gridMode, setGridMode] = useState(true);
  const [filtroPeriodo, setFiltroPeriodo] = useState<number | undefined>();

  const { materias, isLoading, refrescar } = useMisMaterias(filtroPeriodo);

  // Períodos únicos
  const periodos = useMemo(() => {
    const m = new Map<number, string>();
    for (const mat of materias)
      if (mat.periodo_evaluacion_id && mat.trimestre_nombre)
        m.set(mat.periodo_evaluacion_id, mat.trimestre_nombre);
    return Array.from(m.entries()).map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.id - b.id);
  }, [materias]);

  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return materias;
    const q = busqueda.toLowerCase();
    return materias.filter(m =>
      m.materia_nombre.toLowerCase().includes(q) ||
      m.docente_apellidos.toLowerCase().includes(q) ||
      (m.area_conocimiento ?? '').toLowerCase().includes(q)
    );
  }, [materias, busqueda]);

  // Stats globales
  const stats = useMemo(() => ({
    total:     materias.length,
    aprobadas: materias.filter(m => m.aprobado === true).length,
    riesgo:    materias.filter(m => m.aprobado === false).length,
    progreso:  materias.length
      ? Math.round(materias.reduce((a, m) => a + m.progreso_promedio, 0) / materias.length)
      : 0,
  }), [materias]);

  const accent = isDark ? '#818CF8' : '#6366F1';
  const gradient = `linear-gradient(135deg,${accent} 0%,${alpha(accent,.6)} 100%)`;

  return (
    <Box sx={{ pb:6 }}>
      {/* ── Header ── */}
      <Fade in timeout={300}>
        <Box sx={{
          p:3.5, mb:4, borderRadius:4,
          background: isDark
            ? 'linear-gradient(145deg,rgba(255,255,255,.06) 0%,rgba(255,255,255,.02) 100%)'
            : '#fff',
          border:`1px solid ${isDark ? alpha('#fff',.08) : alpha('#000',.05)}`,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,.3)' : '0 8px 32px rgba(0,0,0,.06)',
          position:'relative', overflow:'hidden',
        }}>
          <Box sx={{ position:'absolute', inset:0, background:`linear-gradient(90deg,transparent,${alpha('#fff',isDark?.03:.08)},transparent)`, backgroundSize:'1000px 100%', animation:`${shimmer} 4s linear infinite`, pointerEvents:'none' }} />

          <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:2, position:'relative', zIndex:1 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
              <Box sx={{
                width:56, height:56, borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center',
                background:gradient, boxShadow:`0 6px 20px ${alpha(accent,.4)}`,
                animation:`${float} 3s ease-in-out infinite`,
              }}>
                <SchoolIcon sx={{ fontSize:30, color:'#fff' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ background:gradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:-.5, lineHeight:1.2 }}>
                  Mis Materias
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt:.25 }}>
                  {materias.length} materias activas este período
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
              {/* Toggle grid/list */}
              <Box sx={{ display:'flex', p:.5, borderRadius:2, bgcolor: isDark ? alpha('#fff',.05) : alpha('#000',.04), border:`1px solid ${isDark ? alpha('#fff',.08) : alpha('#000',.07)}` }}>
                {[
                  { key:true,  icon:<GridIcon sx={{fontSize:18}}/> },
                  { key:false, icon:<ListIcon sx={{fontSize:18}}/> },
                ].map(({ key, icon }) => (
                  <Box key={String(key)} onClick={() => setGridMode(key)}
                    sx={{ p:.5, borderRadius:1.5, cursor:'pointer', transition:'all .2s',
                      bgcolor:  gridMode === key ? accent : 'transparent',
                      color:    gridMode === key ? '#fff'  : 'text.secondary',
                      '&:hover':{ bgcolor: gridMode === key ? accent : alpha(accent,.1) },
                    }}
                  >{icon}</Box>
                ))}
              </Box>
              <Tooltip title="Actualizar">
                <IconButton onClick={refrescar} size="small" disabled={isLoading}
                  sx={{ bgcolor: isDark ? alpha('#fff',.06) : alpha('#000',.04), border:`1px solid ${isDark ? alpha('#fff',.08) : alpha('#000',.06)}`, borderRadius:2, transition:'all .3s', '&:hover':{ bgcolor: alpha(accent,.12), transform:'rotate(180deg)' } }}>
                  <RefreshIcon sx={{ fontSize:18, color:accent }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Stats rápidas */}
          {!isLoading && materias.length > 0 && (
            <Box sx={{ display:'flex', gap:2, mt:2.5, pt:2.5, borderTop:`1px solid ${isDark ? alpha('#fff',.06) : alpha('#000',.05)}`, flexWrap:'wrap', position:'relative', zIndex:1 }}>
              {[
                { label:'Total',     value:stats.total,    color:accent },
                { label:'Aprobadas', value:stats.aprobadas,color:'#10B981' },
                { label:'En riesgo', value:stats.riesgo,   color:'#EF4444' },
                { label:'Progreso',  value:`${stats.progreso}%`, color:'#F59E0B' },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign:'center', minWidth:60 }}>
                  <Typography variant="h5" fontWeight={900} sx={{ color:s.color, lineHeight:1 }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.disabled" fontWeight={600}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Fade>

      {/* ── Filtros ── */}
      <Box sx={{ display:'flex', gap:1.5, mb:3, flexWrap:'wrap', alignItems:'center' }}>
        <TextField
          size="small"
          placeholder="Buscar materia, docente o área…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          sx={{ flex:1, minWidth:220,
            '& .MuiOutlinedInput-root':{ borderRadius:2.5, bgcolor: isDark ? alpha('#fff',.04) : alpha('#000',.03) }
          }}
          InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{fontSize:18,color:'text.disabled'}}/></InputAdornment> }}
        />
        {periodos.map(p => (
          <Chip key={p.id} label={p.nombre} onClick={() => setFiltroPeriodo(prev => prev === p.id ? undefined : p.id)}
            sx={{ fontWeight:600, cursor:'pointer',
              bgcolor: filtroPeriodo === p.id ? accent : 'transparent',
              color:   filtroPeriodo === p.id ? '#fff' : 'text.secondary',
              border:`1px solid ${alpha(accent,.3)}`,
              '&:hover':{ bgcolor: filtroPeriodo === p.id ? accent : alpha(accent,.1) },
            }} />
        ))}
      </Box>

      {/* ── Grid/List de materias ── */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({length:6}).map((_,i) => (
            <Grid key={i} size={{ xs:12, sm: gridMode ? 6 : 12, md: gridMode ? 4 : 12 }}>
              <Skeleton variant="rounded" height={gridMode ? 220 : 90} sx={{ borderRadius:3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filtradas.length === 0 ? (
        <Paper elevation={0} sx={{ p:8, textAlign:'center', borderRadius:4, bgcolor:alpha(accent,.05), border:`2px dashed ${alpha(accent,.2)}` }}>
          <SearchIcon sx={{fontSize:48,color:alpha(accent,.3),mb:1}}/>
          <Typography color="text.secondary">No se encontraron materias</Typography>
        </Paper>
      ) : gridMode ? (
        <Fade in>
          <Grid container spacing={2}>
            {filtradas.map((m, i) => (
              <Grid key={m.grado_materia_id} size={{ xs:12, sm:6, md:4 }}>
                <MateriaCard materia={m} index={i} isDark={isDark} onClick={() => onSelect(m)} />
              </Grid>
            ))}
          </Grid>
        </Fade>
      ) : (
        <Fade in>
          <Stack spacing={1.5}>
            {filtradas.map((m, i) => (
              <MateriaRow key={m.grado_materia_id} materia={m} index={i} isDark={isDark} onClick={() => onSelect(m)} />
            ))}
          </Stack>
        </Fade>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// CARD DE MATERIA (vista grilla)
// ─────────────────────────────────────────────────────────────
const MateriaCard: React.FC<{
  materia: MateriaResumen; index: number; isDark: boolean; onClick: () => void;
}> = ({ materia, index, isDark, onClick }) => {
  const color = getColor(materia.materia_nombre, materia.materia_color);
  const gradient = `linear-gradient(135deg,${color},${alpha(color,.65)})`;
  const pctAsistencia = materia.asistencias_total > 0
    ? Math.round((materia.asistencias_presentes / materia.asistencias_total) * 100) : null;
  const pctTemas = materia.total_temas > 0
    ? Math.round((materia.temas_completados / materia.total_temas) * 100) : 0;

  const notaColor = materia.nota_final == null ? '#6B7280'
    : materia.nota_final >= 70 ? '#10B981'
    : materia.nota_final >= 51 ? '#F59E0B' : '#EF4444';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius:3, overflow:'hidden', cursor:'pointer',
        border:`1px solid ${isDark ? alpha('#fff',.07) : alpha('#000',.07)}`,
        bgcolor: isDark ? alpha('#fff',.02) : '#fff',
        animation:`${fadeUp} .4s ease-out ${index * .05}s both`,
        transition:'all .25s cubic-bezier(.4,0,.2,1)',
        '&:hover':{ transform:'translateY(-5px)', boxShadow:`0 14px 36px ${alpha(color,.22)}`, border:`1px solid ${alpha(color,.35)}` },
      }}
    >
      {/* Tira de color */}
      <Box sx={{ height:4, background:gradient }} />

      {/* Cabecera color */}
      <Box sx={{ p:2, pb:1.5, background: isDark ? alpha(color,.1) : alpha(color,.06) }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Box sx={{ flex:1, mr:1 }}>
            <Typography variant="subtitle1" fontWeight={800} lineHeight={1.25} gutterBottom sx={{ color }}>
              {materia.materia_nombre}
            </Typography>
            {materia.area_conocimiento && (
              <Chip label={materia.area_conocimiento} size="small"
                sx={{ height:19, fontSize:'0.65rem', fontWeight:700, bgcolor:alpha(color,.15), color, border:`1px solid ${alpha(color,.25)}` }} />
            )}
          </Box>
          {/* Nota */}
          {materia.nota_final != null && (
            <Box sx={{ textAlign:'center', px:1.5, py:.75, borderRadius:2, bgcolor:alpha(notaColor,.12), border:`1px solid ${alpha(notaColor,.25)}`, flexShrink:0 }}>
              <Typography variant="h6" fontWeight={900} sx={{ color:notaColor, lineHeight:1 }}>
                {round1(materia.nota_final)}
              </Typography>
              <Typography variant="caption" sx={{ color:notaColor, fontSize:'0.6rem', fontWeight:700 }}>
                {materia.aprobado ? 'Aprobado' : 'Reprobado'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ p:2, pt:1.5 }}>
        {/* Docente */}
        <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:1.5 }}>
          <Avatar sx={{ width:24, height:24, bgcolor:alpha(color,.2), fontSize:'0.65rem', color }}>
            {materia.docente_nombres[0]}{materia.docente_apellidos[0]}
          </Avatar>
          <Typography variant="caption" color="text.secondary" noWrap>
            {materia.docente_nombres} {materia.docente_apellidos}
          </Typography>
        </Box>

        {/* Progreso temario */}
        <Box sx={{ mb:1.5 }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', mb:.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>Progreso temario</Typography>
            <Typography variant="caption" fontWeight={800} sx={{ color }}>
              {materia.temas_completados}/{materia.total_temas} temas
            </Typography>
          </Box>
          <BarraPct value={pctTemas} color={color} />
        </Box>

        {/* Stats fila */}
        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
          <Chip size="small"
            icon={<LibroIcon sx={{fontSize:'13px !important'}}/>}
            label={`${materia.total_materiales} materiales`}
            sx={{ height:22, fontSize:'0.7rem', bgcolor: isDark ? alpha('#fff',.05) : alpha('#000',.04) }}
          />
          {pctAsistencia != null && (
            <Chip size="small"
              icon={<AsistenciaIcon sx={{fontSize:'13px !important'}}/>}
              label={`${pctAsistencia}% asist.`}
              sx={{
                height:22, fontSize:'0.7rem',
                bgcolor: alpha(pctAsistencia >= 85 ? '#10B981' : pctAsistencia >= 70 ? '#F59E0B' : '#EF4444', .1),
                color:   pctAsistencia >= 85 ? '#10B981' : pctAsistencia >= 70 ? '#F59E0B' : '#EF4444',
              }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// FILA DE MATERIA (vista lista)
// ─────────────────────────────────────────────────────────────
const MateriaRow: React.FC<{
  materia: MateriaResumen; index: number; isDark: boolean; onClick: () => void;
}> = ({ materia, index, isDark, onClick }) => {
  const color = getColor(materia.materia_nombre, materia.materia_color);
  const pctTemas = materia.total_temas > 0
    ? Math.round((materia.temas_completados / materia.total_temas) * 100) : 0;
  const pctAsistencia = materia.asistencias_total > 0
    ? Math.round((materia.asistencias_presentes / materia.asistencias_total) * 100) : null;
  const notaColor = materia.nota_final == null ? '#6B7280'
    : materia.nota_final >= 70 ? '#10B981'
    : materia.nota_final >= 51 ? '#F59E0B' : '#EF4444';

  return (
    <Paper elevation={0} onClick={onClick} sx={{
      p:2, borderRadius:2.5, cursor:'pointer', display:'flex', alignItems:'center', gap:2,
      border:`1px solid ${isDark ? alpha('#fff',.06) : alpha('#000',.06)}`,
      bgcolor: isDark ? alpha('#fff',.02) : '#fff',
      animation:`${fadeUp} .35s ease-out ${index * .04}s both`,
      transition:'all .2s', borderLeft:`4px solid ${color}`,
      '&:hover':{ bgcolor: alpha(color,.05), boxShadow:`0 4px 16px ${alpha(color,.15)}`, transform:'translateX(3px)' },
    }}>
      <Box sx={{ flex:1, minWidth:0 }}>
        <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color }}>{materia.materia_nombre}</Typography>
        <Typography variant="caption" color="text.secondary">
          {materia.docente_nombres} {materia.docente_apellidos}
        </Typography>
      </Box>
      <Box sx={{ width:120, display:{ xs:'none', sm:'block' } }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', mb:.4 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize:'0.65rem' }}>Progreso</Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color, fontSize:'0.65rem' }}>{pctTemas}%</Typography>
        </Box>
        <BarraPct value={pctTemas} color={color} height={4} />
      </Box>
      {pctAsistencia != null && (
        <Chip size="small" label={`${pctAsistencia}%`}
          sx={{ height:22, fontSize:'0.7rem', fontWeight:700, flexShrink:0,
            bgcolor:alpha(pctAsistencia >= 85 ? '#10B981' : '#EF4444',.1),
            color: pctAsistencia >= 85 ? '#10B981' : '#EF4444',
            display:{ xs:'none', md:'flex' },
          }} />
      )}
      {materia.nota_final != null && (
        <Box sx={{ textAlign:'center', px:1.25, py:.5, borderRadius:1.5, bgcolor:alpha(notaColor,.1), flexShrink:0 }}>
          <Typography variant="caption" fontWeight={900} sx={{ color:notaColor }}>{round1(materia.nota_final)}</Typography>
        </Box>
      )}
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// ── VISTA DETALLE DE MATERIA ─────────────────────────────────
// ─────────────────────────────────────────────────────────────

const DetalleMateriaView: React.FC<{
  materia:  MateriaResumen;
  onVolver: () => void;
}> = ({ materia, onVolver }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color  = getColor(materia.materia_nombre, materia.materia_color);
  const gradient = `linear-gradient(135deg,${color},${alpha(color,.6)})`;

  const [tab, setTab] = useState<TabDetalle>('temario');

  const pctTemas = materia.total_temas > 0
    ? Math.round((materia.temas_completados / materia.total_temas) * 100) : 0;
  const pctAsistencia = materia.asistencias_total > 0
    ? Math.round((materia.asistencias_presentes / materia.asistencias_total) * 100) : null;

  const TABS: { key: TabDetalle; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key:'temario',    label:'Temario',    icon:<LibroIcon sx={{fontSize:16}}/> },
    { key:'materiales', label:'Materiales', icon:<TareaIcon sx={{fontSize:16}}/>, badge: materia.total_materiales },
    { key:'notas',      label:'Notas',      icon:<NotaIcon sx={{fontSize:16}}/> },
  ];

  return (
    <Box sx={{ pb:6, animation:`${slideLeft} .3s ease-out` }}>

      {/* ── Header detalle ── */}
      <Box sx={{
        p:3, mb:3, borderRadius:4,
        background: isDark ? alpha(color,.1) : alpha(color,.06),
        border:`1px solid ${alpha(color,.25)}`,
        position:'relative', overflow:'hidden',
      }}>
        <Box sx={{ position:'absolute', top:-30, right:-30, width:160, height:160, borderRadius:'50%', bgcolor:alpha(color,.08) }} />
        <Box sx={{ position:'absolute', bottom:-20, right:40,  width:80,  height:80,  borderRadius:'50%', bgcolor:alpha(color,.06) }} />

        <Box sx={{ display:'flex', alignItems:'flex-start', gap:2, position:'relative', zIndex:1 }}>
          <Tooltip title="Volver a materias">
            <IconButton onClick={onVolver} size="small" sx={{
              bgcolor: isDark ? alpha('#fff',.08) : alpha('#fff',.8),
              border:`1px solid ${alpha(color,.25)}`,
              borderRadius:2, flexShrink:0,
              '&:hover':{ bgcolor: alpha(color,.2), transform:'translateX(-2px)' },
              transition:'all .2s',
            }}>
              <BackIcon sx={{ fontSize:18, color }} />
            </IconButton>
          </Tooltip>

          <Box sx={{ flex:1, minWidth:0 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1, flexWrap:'wrap', mb:.5 }}>
              <Typography variant="h5" fontWeight={900} sx={{ color }}>
                {materia.materia_nombre}
              </Typography>
              {materia.materia_codigo && (
                <Chip label={materia.materia_codigo} size="small"
                  sx={{ height:20, fontSize:'0.65rem', fontWeight:700, bgcolor:alpha(color,.15), color }} />
              )}
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, flexWrap:'wrap' }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:.75 }}>
                <Avatar sx={{ width:22, height:22, bgcolor:alpha(color,.25), fontSize:'0.6rem', color }}>
                  {materia.docente_nombres[0]}{materia.docente_apellidos[0]}
                </Avatar>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Prof. {materia.docente_nombres} {materia.docente_apellidos}
                </Typography>
              </Box>
              {materia.area_conocimiento && (
                <Typography variant="caption" color="text.disabled">· {materia.area_conocimiento}</Typography>
              )}
              {materia.horas_semanales && (
                <Chip size="small" icon={<TiempoIcon sx={{fontSize:'12px !important'}}/>}
                  label={`${materia.horas_semanales}h/sem`}
                  sx={{ height:20, fontSize:'0.65rem', bgcolor:alpha(color,.1), color }} />
              )}
            </Box>
          </Box>

          {/* Nota final */}
          {materia.nota_final != null && (
            <Box sx={{ textAlign:'center', p:1.5, borderRadius:2.5, flexShrink:0,
              bgcolor: alpha(materia.aprobado ? '#10B981' : '#EF4444', isDark ? .2 : .1),
              border:`1px solid ${alpha(materia.aprobado ? '#10B981' : '#EF4444', .3)}`,
            }}>
              <Typography variant="h5" fontWeight={900} sx={{ color: materia.aprobado ? '#10B981' : '#EF4444', lineHeight:1 }}>
                {round1(materia.nota_final)}
              </Typography>
              <Typography variant="caption" sx={{ color: materia.aprobado ? '#10B981' : '#EF4444', fontSize:'0.65rem', fontWeight:700 }}>
                {materia.aprobado ? 'Aprobado' : 'Reprobado'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Stats mini */}
        <Box sx={{ display:'flex', gap:2.5, mt:2.5, pt:2, borderTop:`1px solid ${alpha(color,.15)}`, flexWrap:'wrap', position:'relative', zIndex:1 }}>
          <Box>
            <Typography variant="h6" fontWeight={900} sx={{ color, lineHeight:1 }}>{pctTemas}%</Typography>
            <Typography variant="caption" color="text.disabled">Progreso</Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={900} sx={{ color:'#3B82F6', lineHeight:1 }}>{materia.total_materiales}</Typography>
            <Typography variant="caption" color="text.disabled">Materiales</Typography>
          </Box>
          {pctAsistencia != null && (
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ color: pctAsistencia >= 80 ? '#10B981' : '#EF4444', lineHeight:1 }}>{pctAsistencia}%</Typography>
              <Typography variant="caption" color="text.disabled">Asistencia</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="h6" fontWeight={900} sx={{ color:'#F59E0B', lineHeight:1 }}>
              {materia.temas_completados}/{materia.total_temas}
            </Typography>
            <Typography variant="caption" color="text.disabled">Temas</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{
        display:'flex', gap:.75, mb:3, p:.5,
        bgcolor: isDark ? alpha('#fff',.03) : alpha('#000',.03),
        borderRadius:3, border:`1px solid ${isDark ? alpha('#fff',.05) : alpha('#000',.05)}`,
      }}>
        {TABS.map(t => (
          <Box key={t.key} onClick={() => setTab(t.key)}
            sx={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center',
              gap:.75, px:2, py:1.25, borderRadius:2.5, cursor:'pointer',
              transition:'all .2s cubic-bezier(.4,0,.2,1)',
              bgcolor: tab === t.key ? color : 'transparent',
              color:   tab === t.key ? '#fff' : 'text.secondary',
              fontWeight: tab === t.key ? 700 : 500,
              '&:hover':{ bgcolor: tab === t.key ? color : alpha(color,.08) },
            }}
          >
            {t.icon}
            <Typography variant="body2" fontWeight="inherit" sx={{ display:{ xs:'none', sm:'block' } }}>{t.label}</Typography>
            {t.badge != null && t.badge > 0 && (
              <Box sx={{ width:18, height:18, borderRadius:'50%', bgcolor: tab === t.key ? alpha('#fff',.25) : alpha(color,.15), display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Typography sx={{ fontSize:'0.65rem', fontWeight:900, color: tab === t.key ? '#fff' : color }}>{t.badge}</Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* ── Contenido de tab ── */}
      <Fade in key={tab} timeout={250}>
        <Box>
          {tab === 'temario'    && <TabTemario    materia={materia} color={color} isDark={isDark} />}
          {tab === 'materiales' && <TabMateriales materia={materia} color={color} isDark={isDark} />}
          {tab === 'notas'      && <TabNotas      materia={materia} color={color} isDark={isDark} />}
        </Box>
      </Fade>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// TAB: TEMARIO
// ─────────────────────────────────────────────────────────────
const TabTemario: React.FC<{
  materia: MateriaResumen; color: string; isDark: boolean;
}> = ({ materia, color, isDark }) => {
  const { porUnidad, isLoading, totalTemas, completados, porcentajeGeneral } =
    useTemarioEstudiante(materia.grado_materia_id);

  const [unidadAbierta, setUnidadAbierta] = useState<number | null>(null);

  // Abrir la primera unidad con temas en progreso
  useEffect(() => {
    if (!isLoading && porUnidad.length > 0 && unidadAbierta === null) {
      const enProg = porUnidad.find(u => u.temas.some(t => t.estado_progreso === 'en_progreso'));
      setUnidadAbierta(enProg?.unidad.unidad_id ?? porUnidad[0]?.unidad.unidad_id ?? null);
    }
  }, [isLoading, porUnidad]);

  if (isLoading) return (
    <Stack spacing={1.5}>
      {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius:2.5 }} />)}
    </Stack>
  );

  if (porUnidad.length === 0) return (
    <Paper elevation={0} sx={{ p:6, textAlign:'center', borderRadius:3, bgcolor:alpha(color,.05), border:`2px dashed ${alpha(color,.2)}` }}>
      <LibroIcon sx={{fontSize:48,color:alpha(color,.3),mb:1}}/>
      <Typography color="text.secondary">No hay temario disponible aún</Typography>
    </Paper>
  );

  return (
    <Box>
      {/* Barra progreso global */}
      <Paper elevation={0} sx={{ p:2.5, mb:3, borderRadius:3, border:`1px solid ${alpha(color,.2)}`, bgcolor: isDark ? alpha(color,.08) : alpha(color,.05) }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', mb:.75 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color }}>Progreso global de la materia</Typography>
          <Typography variant="body2" fontWeight={900} sx={{ color }}>{completados}/{totalTemas} temas · {porcentajeGeneral}%</Typography>
        </Box>
        <BarraPct value={porcentajeGeneral} color={color} height={8} />
      </Paper>

      {/* Unidades */}
      <Stack spacing={1.5}>
        {porUnidad.map((grupo, ui) => {
          const abierta = unidadAbierta === grupo.unidad.unidad_id;
          const temasCompletos = grupo.temas.filter(t => t.estado_progreso === 'completado').length;
          const pctUnidad = grupo.temas.length > 0
            ? Math.round((temasCompletos / grupo.temas.length) * 100) : 0;

          return (
            <Paper key={grupo.unidad.unidad_id} elevation={0} sx={{
              borderRadius:3, overflow:'hidden',
              border:`1px solid ${abierta ? alpha(color,.3) : (isDark ? alpha('#fff',.06) : alpha('#000',.06))}`,
              bgcolor: isDark ? alpha('#fff',.02) : '#fff',
              animation:`${fadeUp} .35s ease-out ${ui * .06}s both`,
              transition:'border-color .2s',
            }}>
              {/* Cabecera unidad */}
              <Box
                onClick={() => setUnidadAbierta(prev => prev === grupo.unidad.unidad_id ? null : grupo.unidad.unidad_id)}
                sx={{
                  p:2, display:'flex', alignItems:'center', gap:2, cursor:'pointer',
                  bgcolor: abierta ? (isDark ? alpha(color,.12) : alpha(color,.07)) : 'transparent',
                  '&:hover':{ bgcolor: isDark ? alpha(color,.1) : alpha(color,.05) },
                  transition:'background .2s',
                }}
              >
                {/* Número de unidad */}
                <Box sx={{
                  width:36, height:36, borderRadius:2, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  bgcolor: abierta ? color : alpha(color,.15),
                  transition:'all .2s',
                }}>
                  <Typography variant="caption" fontWeight={900} sx={{ color: abierta ? '#fff' : color }}>
                    U{grupo.unidad.numero_unidad}
                  </Typography>
                </Box>

                <Box sx={{ flex:1, minWidth:0 }}>
                  <Typography variant="subtitle2" fontWeight={800} noWrap>
                    {grupo.unidad.unidad_titulo}
                  </Typography>
                  <Box sx={{ display:'flex', gap:1, alignItems:'center', mt:.3 }}>
                    <Typography variant="caption" color="text.disabled">
                      {grupo.temas.length} temas
                    </Typography>
                    <Box sx={{ flex:1, maxWidth:120 }}>
                      <BarraPct value={pctUnidad} color={color} height={4} />
                    </Box>
                    <Typography variant="caption" fontWeight={700} sx={{ color }}>{pctUnidad}%</Typography>
                  </Box>
                </Box>

                <Box sx={{ display:'flex', alignItems:'center', gap:.5 }}>
                  <Chip size="small" label={`${temasCompletos}/${grupo.temas.length}`}
                    sx={{ height:20, fontSize:'0.65rem', fontWeight:700, bgcolor:alpha(color,.12), color }} />
                  {abierta ? <CollapseIcon sx={{fontSize:18,color:'text.disabled'}}/> : <ExpandMoreIcon sx={{fontSize:18,color:'text.disabled'}}/>}
                </Box>
              </Box>

              {/* Temas */}
              <Collapse in={abierta}>
                <Divider sx={{ borderColor: isDark ? alpha('#fff',.05) : alpha('#000',.05) }} />
                <Box sx={{ p:1.5 }}>
                  <Stack spacing={.75}>
                    {grupo.temas.map((tema, ti) => (
                      <TemaItem key={tema.tema_id!} tema={tema} color={color} isDark={isDark} delay={ti * .03} />
                    ))}
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// ITEM DE TEMA
// ─────────────────────────────────────────────────────────────
const TemaItem: React.FC<{
  tema: TemarioItem; color: string; isDark: boolean; delay: number;
}> = ({ tema, color, isDark, delay }) => {
  const cfg = ESTADO_PROGRESO[tema.estado_progreso] ?? ESTADO_PROGRESO.no_iniciado;

  return (
    <Box sx={{
      display:'flex', alignItems:'center', gap:1.5, p:1.25, borderRadius:2,
      animation:`${fadeUp} .3s ease-out ${delay}s both`,
      bgcolor: isDark ? alpha('#fff',.02) : alpha('#000',.015),
      border:`1px solid ${tema.estado_progreso === 'completado' ? alpha(color,.2) : (isDark ? alpha('#fff',.04) : alpha('#000',.04))}`,
      transition:'all .2s', '&:hover':{ bgcolor: alpha(color,.05) },
    }}>
      {/* Indicador estado */}
      <Box sx={{ color: cfg.color, display:'flex', alignItems:'center', flexShrink:0 }}>
        {cfg.icon}
      </Box>

      <Box sx={{ flex:1, minWidth:0 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:.75, mb:.25 }}>
          <Typography variant="caption" fontWeight={700} noWrap sx={{ fontSize:'0.8rem' }}>
            {tema.numero_tema}. {tema.tema_titulo}
          </Typography>
          {!tema.es_obligatorio && (
            <Chip size="small" label="Optativo" sx={{ height:16, fontSize:'0.6rem', bgcolor:alpha('#F59E0B',.12), color:'#F59E0B' }} />
          )}
          {tema.nivel_dificultad && (
            <Chip size="small" label={tema.nivel_dificultad}
              sx={{ height:16, fontSize:'0.6rem', bgcolor:alpha('#8B5CF6',.1), color:'#8B5CF6' }} />
          )}
        </Box>
        {tema.estado_progreso !== 'no_iniciado' && (
          <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
            <Box sx={{ flex:1, maxWidth:100 }}>
              <BarraPct value={tema.porcentaje_avance} color={cfg.color} height={3} />
            </Box>
            <Typography variant="caption" sx={{ color:cfg.color, fontSize:'0.65rem', fontWeight:700 }}>
              {tema.porcentaje_avance}%
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display:'flex', alignItems:'center', gap:.75, flexShrink:0 }}>
        {tema.materiales_disponibles > 0 && (
          <Chip size="small" icon={<LibroIcon sx={{fontSize:'11px !important'}}/>}
            label={tema.materiales_disponibles}
            sx={{ height:20, fontSize:'0.65rem', bgcolor:alpha('#3B82F6',.1), color:'#3B82F6' }} />
        )}
        <Chip size="small" label={cfg.label}
          sx={{ height:20, fontSize:'0.65rem', fontWeight:700, bgcolor:alpha(cfg.color,.1), color:cfg.color }} />
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// TAB: MATERIALES
// ─────────────────────────────────────────────────────────────
const TabMateriales: React.FC<{
  materia: MateriaResumen; color: string; isDark: boolean;
}> = ({ materia, color, isDark }) => {
  const { materiales, paginacion, page, setPage, isLoading } =
    useMaterialesEstudiante(materia.asignacion_docente_id, { limit:20 });

  if (isLoading) return (
    <Stack spacing={1.5}>
      {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius:2.5 }} />)}
    </Stack>
  );

  if (materiales.length === 0) return (
    <Paper elevation={0} sx={{ p:6, textAlign:'center', borderRadius:3, bgcolor:alpha(color,.05), border:`2px dashed ${alpha(color,.2)}` }}>
      <TareaIcon sx={{fontSize:48,color:alpha(color,.3),mb:1}}/>
      <Typography color="text.secondary">No hay materiales publicados aún</Typography>
    </Paper>
  );

  return (
    <Box>
      {/* Resumen rápido */}
      <Box sx={{ display:'flex', gap:1.5, mb:2.5, flexWrap:'wrap' }}>
        <Chip label={`${paginacion.total} materiales`} size="small"
          sx={{ fontWeight:700, bgcolor:alpha(color,.1), color }} />
        <Chip label={`${materiales.filter(m => m.es_destacado).length} destacados`} size="small"
          sx={{ fontWeight:700, bgcolor:alpha('#F59E0B',.1), color:'#F59E0B' }} />
        <Chip label={`${materiales.filter(m => m.ya_accedido).length} vistos`} size="small"
          sx={{ fontWeight:700, bgcolor:alpha('#10B981',.1), color:'#10B981' }} />
      </Box>

      <Stack spacing={1.25}>
        {materiales.map((m, i) => (
          <MaterialItem key={m.id} material={m} color={color} isDark={isDark} delay={i * .03} />
        ))}
      </Stack>

      {/* Paginación simple */}
      {paginacion.totalPages > 1 && (
        <Box sx={{ display:'flex', justifyContent:'center', gap:1, mt:3 }}>
          <IconButton size="small" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <BackIcon sx={{fontSize:18}}/>
          </IconButton>
          <Chip label={`${page} / ${paginacion.totalPages}`} size="small" sx={{ bgcolor:alpha(color,.1), color }} />
          <IconButton size="small" disabled={page === paginacion.totalPages} onClick={() => setPage(p => p + 1)}>
            <BackIcon sx={{fontSize:18, transform:'rotate(180deg)'}}/>
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// ITEM DE MATERIAL
// ─────────────────────────────────────────────────────────────
const MaterialItem: React.FC<{
  material: MaterialEstudiante; color: string; isDark: boolean; delay: number;
}> = ({ material, color, isDark, delay }) => {
  const tipoColor  = material.tipo_material_color || color;
  const tamanoFmt  = fmtBytes(material.tamano_bytes);

  return (
    <Paper elevation={0} sx={{
      p:2, borderRadius:2.5, display:'flex', alignItems:'center', gap:1.75,
      border:`1px solid ${material.es_destacado ? alpha('#F59E0B',.3) : (isDark ? alpha('#fff',.06) : alpha('#000',.06))}`,
      bgcolor: material.es_destacado
        ? (isDark ? alpha('#F59E0B',.06) : alpha('#F59E0B',.03))
        : (isDark ? alpha('#fff',.02) : '#fff'),
      animation:`${fadeUp} .35s ease-out ${delay}s both`,
      transition:'all .2s', cursor:'pointer',
      '&:hover':{ bgcolor: alpha(color,.05), boxShadow:`0 3px 12px ${alpha(color,.12)}`, transform:'translateX(3px)' },
    }}>
      {/* Ícono tipo */}
      <Box sx={{
        width:40, height:40, borderRadius:2, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        bgcolor:alpha(tipoColor,.15), border:`1px solid ${alpha(tipoColor,.25)}`,
      }}>
        <Typography sx={{ fontSize:'1.1rem' }}>{material.tipo_material_icono || '📄'}</Typography>
      </Box>

      <Box sx={{ flex:1, minWidth:0 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:.75, mb:.25, flexWrap:'wrap' }}>
          <Typography variant="body2" fontWeight={700} noWrap>{material.titulo}</Typography>
          {material.es_destacado && <DestacadoIcon sx={{fontSize:14,color:'#F59E0B',flexShrink:0}}/>}
          {material.ya_accedido  && <CheckIcon     sx={{fontSize:13,color:'#10B981',flexShrink:0}}/>}
        </Box>
        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', alignItems:'center' }}>
          <Chip size="small" label={material.tipo_material_nombre}
            sx={{ height:18, fontSize:'0.62rem', fontWeight:700, bgcolor:alpha(tipoColor,.12), color:tipoColor }} />
          {tamanoFmt && <Typography variant="caption" color="text.disabled" sx={{fontSize:'0.65rem'}}>{tamanoFmt}</Typography>}
          {material.total_comentarios > 0 && (
            <Typography variant="caption" color="text.disabled" sx={{fontSize:'0.65rem'}}>
              💬 {material.total_comentarios}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Acciones */}
      <Box sx={{ display:'flex', gap:.5, flexShrink:0 }}>
        {material.es_enlace_externo
          ? <Tooltip title="Abrir enlace"><IconButton size="small" onClick={e => { e.stopPropagation(); window.open(material.url_externa!, '_blank'); }}>
              <LinkIcon sx={{fontSize:16,color}}/>
            </IconButton></Tooltip>
          : material.url_archivo
            ? <Tooltip title="Descargar"><IconButton size="small" onClick={e => { e.stopPropagation(); window.open(material.url_archivo!, '_blank'); }}>
                <DescargaIcon sx={{fontSize:16,color}}/>
              </IconButton></Tooltip>
            : null
        }
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// TAB: NOTAS (notas de ESTA materia)
// ─────────────────────────────────────────────────────────────
const TabNotas: React.FC<{
  materia: MateriaResumen; color: string; isDark: boolean;
}> = ({ materia, color, isDark }) => {
  // Necesitamos periodo_evaluacion_id — si la materia tiene uno lo usamos
  const periodoId = materia.periodo_evaluacion_id;

  const { notas, isLoading } = useNotasPorMateriaEstudiante(
    materia.grado_materia_id,
    periodoId ?? null
  );

  if (!periodoId) return (
    <Paper elevation={0} sx={{ p:6, textAlign:'center', borderRadius:3, bgcolor:alpha(color,.05), border:`2px dashed ${alpha(color,.2)}` }}>
      <SinNotaIcon sx={{fontSize:48,color:alpha(color,.3),mb:1}}/>
      <Typography color="text.secondary">Seleccioná un trimestre desde "Mis Materias" para ver las notas</Typography>
    </Paper>
  );

  if (isLoading) return (
    <Stack spacing={1.5}>
      {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius:2 }} />)}
    </Stack>
  );

  if (!notas) return (
    <Paper elevation={0} sx={{ p:6, textAlign:'center', borderRadius:3, bgcolor:alpha(color,.05), border:`2px dashed ${alpha(color,.2)}` }}>
      <SinNotaIcon sx={{fontSize:48,color:alpha(color,.3),mb:1}}/>
      <Typography color="text.secondary">No hay notas disponibles para este período</Typography>
    </Paper>
  );

  const DIMENSIONES: Record<string,{label:string;color:string;gradient:string}> = {
    SER:  {label:'Ser',  color:'#10B981',gradient:'linear-gradient(135deg,#10B981,#34D399)'},
    SAB:  {label:'Saber',color:'#3B82F6',gradient:'linear-gradient(135deg,#3B82F6,#60A5FA)'},
    HAC:  {label:'Hacer',color:'#F59E0B',gradient:'linear-gradient(135deg,#F59E0B,#FCD34D)'},
    AUTO: {label:'Auto', color:'#8B5CF6',gradient:'linear-gradient(135deg,#8B5CF6,#A78BFA)'},
  };

  return (
    <Box>
      {/* Nota final */}
      {notas.nota_final && (
        <Paper elevation={0} sx={{
          p:2.5, mb:3, borderRadius:3, display:'flex', alignItems:'center', gap:2,
          border:`1px solid ${alpha(color,.25)}`,
          background: isDark ? alpha(color,.1) : alpha(color,.06),
        }}>
          <Box sx={{
            width:64, height:64, borderRadius:2.5, flexShrink:0,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            background:`linear-gradient(135deg,${color},${alpha(color,.6)})`,
            boxShadow:`0 4px 14px ${alpha(color,.35)}`,
          }}>
            <Typography variant="h5" fontWeight={900} sx={{color:'#fff',lineHeight:1}}>
              {round1(notas.nota_final.nota_final)}
            </Typography>
            <Typography variant="caption" sx={{color:alpha('#fff',.8),fontSize:'0.6rem'}}>/100</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>Nota final del período</Typography>
            {notas.nota_final.aprobado != null && (
              <Chip size="small"
                icon={notas.nota_final.aprobado
                  ? <AprobadoIcon sx={{fontSize:'13px !important'}}/>
                  : <ReprobadoIcon sx={{fontSize:'13px !important'}}/>}
                label={notas.nota_final.aprobado ? 'Aprobado' : 'Reprobado'}
                sx={{
                  mt:.5, height:24, fontWeight:800,
                  bgcolor:alpha(notas.nota_final.aprobado ? '#10B981' : '#EF4444', isDark?.2:.12),
                  color:  notas.nota_final.aprobado ? '#10B981' : '#EF4444',
                  '& .MuiChip-icon':{ color: notas.nota_final.aprobado ? '#10B981' : '#EF4444' },
                }}
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Tarjetas por dimensión */}
      {notas.dimensiones.length > 0 && (
        <Box sx={{ display:'flex', gap:1.5, flexWrap:'wrap', mb:3 }}>
          {notas.dimensiones.map((dim, i) => {
            const cfg = DIMENSIONES[dim.dimension_codigo] ?? null;
            if (!cfg) return null;
            return (
              <Box key={dim.id} sx={{
                flex:'1 1 130px', minWidth:120, p:2, borderRadius:2.5,
                animation:`${fadeUp} .4s ease-out ${i * .08}s both`,
                background: isDark ? alpha(cfg.color,.1) : alpha(cfg.color,.06),
                border:`1px solid ${alpha(cfg.color,.2)}`,
              }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:1 }}>
                  <Box sx={{
                    width:36, height:36, borderRadius:2, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:cfg.gradient, boxShadow:`0 3px 10px ${alpha(cfg.color,.35)}`,
                  }}>
                    <Typography variant="subtitle2" fontWeight={900} sx={{color:'#fff',lineHeight:1}}>
                      {dim.nota_promedio != null ? round1(dim.nota_promedio) : '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={800} sx={{color:cfg.color,display:'block'}}>{cfg.label}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{fontSize:'0.65rem'}}>{dim.porcentaje_ponderacion}% · {dim.total_evaluaciones} eval.</Typography>
                  </Box>
                </Box>
                <BarraPct value={dim.nota_promedio ?? 0} color={cfg.color} height={5} delay={i * .08} />
              </Box>
            );
          })}
        </Box>
      )}

      {/* Tabla de evaluaciones */}
      {notas.evaluaciones.length > 0 ? (
        <TableContainer component={Paper} elevation={0} sx={{
          borderRadius:3,
          border:`1px solid ${isDark ? alpha('#fff',.07) : alpha('#000',.06)}`,
          background: isDark ? alpha('#fff',.02) : '#fafafa',
        }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th':{ fontWeight:800, fontSize:11, color:'text.secondary', py:1.25,
                bgcolor: isDark ? alpha('#fff',.03) : alpha('#000',.02),
                borderBottom:`1px solid ${isDark ? alpha('#fff',.07) : alpha('#000',.07)}` }}}>
                <TableCell>Evaluación</TableCell>
                <TableCell>Dimensión</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="center">Nota</TableCell>
                <TableCell align="center">%</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notas.evaluaciones.map((ev, i) => {
                const cfg = DIMENSIONES[ev.dimension_codigo] ?? null;
                return (
                  <TableRow key={ev.id} sx={{
                    animation:`${fadeUp} .3s ease-out ${i * .03}s both`,
                    '& td':{ fontSize:13, py:1.1, borderBottom:`1px solid ${isDark ? alpha('#fff',.04) : alpha('#000',.05)}` },
                    '&:last-child td':{ borderBottom:'none' },
                    '&:hover':{ bgcolor: isDark ? alpha('#fff',.02) : alpha('#000',.015) },
                  }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{fontSize:13}}>{ev.evaluacion_nombre}</Typography>
                      {ev.esta_ausente && <Chip size="small" label="Ausente" sx={{height:17,fontSize:9,fontWeight:700,mt:.25,bgcolor:alpha('#EF4444',.1),color:'#EF4444',borderRadius:1}}/>}
                    </TableCell>
                    <TableCell>
                      {cfg && <Chip size="small" label={cfg.label} sx={{height:20,fontSize:10,fontWeight:800,bgcolor:alpha(cfg.color,.12),color:cfg.color,borderRadius:1.5}}/>}
                    </TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary" sx={{fontSize:11}}>{ev.tipo ?? '—'}</Typography></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary" fontWeight={600} sx={{fontSize:11}}>{ev.fecha ? new Date(ev.fecha+'T12:00:00').toLocaleDateString('es-BO',{day:'numeric',month:'short'}) : '—'}</Typography></TableCell>
                    <TableCell align="center">
                      {ev.puntaje_obtenido != null ? (
                        <Box sx={{textAlign:'center'}}>
                          <Typography variant="body2" fontWeight={900} sx={{color:cfg?.color ?? color,fontSize:14,lineHeight:1}}>{ev.puntaje_obtenido}</Typography>
                          <Typography variant="caption" color="text.disabled" sx={{fontSize:10}}>/{ev.puntaje_maximo}</Typography>
                        </Box>
                      ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                    </TableCell>
                    <TableCell align="center">
                      {ev.nota_sobre_100 != null
                        ? <Chip size="small" label={`${ev.nota_sobre_100}%`} sx={{height:20,fontSize:10,fontWeight:800,bgcolor:alpha(cfg?.color ?? color,.12),color:cfg?.color ?? color,borderRadius:1.5}}/>
                        : <Typography variant="caption" color="text.disabled">—</Typography>
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{textAlign:'center',py:4}}>
          <Typography variant="body2" color="text.disabled" fontWeight={600}>No hay evaluaciones publicadas para este período</Typography>
        </Box>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE RAÍZ
// ─────────────────────────────────────────────────────────────
interface Props { user?: any }

export const EstudianteMaterias: React.FC<Props> = () => {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<MateriaResumen | null>(null);

  const handleSelect  = useCallback((m: MateriaResumen) => setMateriaSeleccionada(m), []);
  const handleVolver  = useCallback(() => setMateriaSeleccionada(null), []);

  return (
    <Box sx={{ pb:4 }}>
      {!materiaSeleccionada
        ? <ListaMaterias  onSelect={handleSelect} />
        : <DetalleMateriaView materia={materiaSeleccionada} onVolver={handleVolver} />
      }
    </Box>
  );
};

export default EstudianteMaterias;