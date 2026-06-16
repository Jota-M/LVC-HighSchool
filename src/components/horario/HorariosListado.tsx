// components/horario/HorariosListado.tsx
'use client';
import React, { useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  CardActions, Chip, FormControl, InputLabel, Select,
  MenuItem, TextField, InputAdornment, Skeleton,
  Tooltip, IconButton, alpha, useTheme, Alert,
  Menu, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Archive as ArchiveIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  GridView as GridIcon,
  CheckCircle as OkIcon,
  ViewQuilt as TotalIcon,
  EditNote as DraftIcon,
  WbSunny as TurnoIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useHorarios, useGestionHorarios } from '@/hooks/useHorario';
import { HorarioStatusChip } from './HorarioStatusChip';
import { NuevoHorarioModal } from './NuevoHorarioModal';
import { Horario, HorarioEstado, ESTADO_CONFIG } from '@/types/horariotypes';

interface Props {
  periodoIdDefault?: number;
  periodos?: Array<{ id: number; nombre: string; activo: boolean }>;
  nivelesAcademicos?: Array<{ id: number; nombre: string }>;
  grados?: Array<{ id: number; nombre: string; nivel_academico_id: number }>;
}

export const HorariosListado: React.FC<Props> = ({
  periodoIdDefault,
  periodos = [],
  nivelesAcademicos = [],
  grados = [],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const accentColor = isDark ? '#facc15' : '#0288d1';

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; horario: Horario } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { horarios, isLoading, filters, actualizarFiltros } = useHorarios({
    periodo_academico_id: periodoIdDefault,
  });
  const { cambiarEstado, eliminar, isCambiandoEstado, isEliminando } = useGestionHorarios();

  const gradosFiltrados = grados.filter(
    (g) => !filters.nivel_academico_id || g.nivel_academico_id === filters.nivel_academico_id
  );

  // Filtro local por texto
  const horariosFiltrados = horarios.filter((h) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      h.grado_nombre.toLowerCase().includes(q) ||
      h.paralelo_nombre.toLowerCase().includes(q) ||
      h.nivel_nombre.toLowerCase().includes(q) ||
      (h.nombre ?? '').toLowerCase().includes(q)
    );
  });

  const handleCreado = (id: number) => {
    setModalOpen(false);
    router.push(`/dashboard/admin/horario/${id}`);
  };

  const handleMenuAction = async (action: 'publicar' | 'borrador' | 'archivar' | 'eliminar' | 'editar') => {
    const h = menuAnchor?.horario;
    setMenuAnchor(null);
    if (!h) return;
    if (action === 'editar') { router.push(`/dashboard/admin/horario/${h.id}`); return; }
    if (action === 'eliminar') { setConfirmDelete(h.id); return; }
    const estados: Record<string, HorarioEstado> = { publicar: 'publicado', borrador: 'borrador', archivar: 'archivado' };
    await cambiarEstado({ id: h.id, estado: estados[action] });
  };

  const handleEliminar = async () => {
    if (!confirmDelete) return;
    await eliminar(confirmDelete);
    setConfirmDelete(null);
  };

  // Estadísticas rápidas
  const stats = {
    total: horarios.length,
    borradores: horarios.filter((h) => h.estado === 'borrador').length,
    publicados: horarios.filter((h) => h.estado === 'publicado').length,
    archivados: horarios.filter((h) => h.estado === 'archivado').length,
  };

  return (
    <>
      {/* Stats row - estilo dashboard: badge icono + número grande + barra de progreso */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: stats.total, color: accentColor, icon: <TotalIcon />, max: stats.total || 1 },
          { label: 'Borradores', value: stats.borradores, color: ESTADO_CONFIG.borrador.color, icon: <DraftIcon />, max: stats.total || 1 },
          { label: 'Publicados', value: stats.publicados, color: ESTADO_CONFIG.publicado.color, icon: <OkIcon />, max: stats.total || 1 },
          { label: 'Archivados', value: stats.archivados, color: ESTADO_CONFIG.archivado.color, icon: <ArchiveIcon />, max: stats.total || 1 },
        ].map((s) => {
          const pct = s.max > 0 ? Math.round((s.value / s.max) * 100) : 0;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
              <Box
                sx={{
                  p: 2.5, borderRadius: 3,
                  bgcolor: isDark ? alpha('#ffffff', 0.03) : '#fff',
                  border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.06)}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44, height: 44, borderRadius: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(s.color, isDark ? 0.18 : 0.1),
                      color: s.color, fontSize: 22,
                    }}
                  >
                    {s.icon}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>
                  {s.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {s.label}
                </Typography>
                <Box sx={{ height: 4, borderRadius: 2, bgcolor: alpha(s.color, 0.15), overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: s.color, borderRadius: 2, transition: 'width 0.4s ease' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {s.value} de {stats.total} · {pct}%
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Filters bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar por grado, paralelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220, flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={filters.periodo_academico_id ?? ''}
            onChange={(e) => actualizarFiltros({ periodo_academico_id: e.target.value as number || undefined })}
            label="Período"
          >
            <MenuItem value=""><em>Todos</em></MenuItem>
            {periodos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre}{p.activo && ' ★'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filters.estado ?? ''}
            onChange={(e) => actualizarFiltros({ estado: (e.target.value as HorarioEstado) || undefined })}
            label="Estado"
          >
            <MenuItem value=""><em>Todos</em></MenuItem>
            {(['borrador', 'publicado', 'archivado'] as HorarioEstado[]).map((e) => (
              <MenuItem key={e} value={e}>{ESTADO_CONFIG[e].label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Nivel</InputLabel>
          <Select
            value={filters.nivel_academico_id ?? ''}
            onChange={(e) => actualizarFiltros({ nivel_academico_id: e.target.value as number || undefined, grado_id: undefined })}
            label="Nivel"
          >
            <MenuItem value=""><em>Todos</em></MenuItem>
            {nivelesAcademicos.map((n) => (
              <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ borderRadius: 2, bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700, flexShrink: 0 }}
        >
          Nuevo Horario
        </Button>
      </Box>

      {/* Delete confirmation */}
      {confirmDelete && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" color="inherit" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button size="small" color="error" variant="contained" onClick={handleEliminar} disabled={isEliminando}>
                {isEliminando ? '...' : 'Eliminar'}
              </Button>
            </Box>
          }
        >
          ¿Eliminar este horario? Esta acción es irreversible.
        </Alert>
      )}

      {/* Cards grid */}
      {isLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : horariosFiltrados.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <SchoolIcon sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No hay horarios</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            {horarios.length > 0 ? 'Ajusta los filtros para ver resultados' : 'Crea el primer horario para comenzar'}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}
            sx={{ borderRadius: 2, bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700 }}>
            Crear Horario
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {horariosFiltrados.map((horario) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={horario.id}>
              <HorarioCard
                horario={horario}
                accentColor={accentColor}
                isDark={isDark}
                onEdit={() => router.push(`/dashboard/admin/horario/${horario.id}`)}
                onMenuOpen={(el) => setMenuAnchor({ el, horario })}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem onClick={() => handleMenuAction('editar')}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar grilla</ListItemText>
        </MenuItem>

        {menuAnchor?.horario.estado !== 'publicado' && (
          <MenuItem onClick={() => handleMenuAction('publicar')} disabled={isCambiandoEstado}>
            <ListItemIcon><PublishIcon fontSize="small" sx={{ color: ESTADO_CONFIG.publicado.color }} /></ListItemIcon>
            <ListItemText>Publicar</ListItemText>
          </MenuItem>
        )}

        {menuAnchor?.horario.estado === 'publicado' && [
          <MenuItem
            key="borrador"
            onClick={() => handleMenuAction('borrador')}
            disabled={isCambiandoEstado}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: ESTADO_CONFIG.borrador.color }} />
            </ListItemIcon>
            <ListItemText>Pasar a Borrador</ListItemText>
          </MenuItem>,

          <MenuItem
            key="archivar"
            onClick={() => handleMenuAction('archivar')}
            disabled={isCambiandoEstado}
          >
            <ListItemIcon>
              <ArchiveIcon fontSize="small" sx={{ color: ESTADO_CONFIG.archivado.color }} />
            </ListItemIcon>
            <ListItemText>Archivar</ListItemText>
          </MenuItem>
        ]}

        <Divider />

        <MenuItem onClick={() => handleMenuAction('eliminar')} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* Modal nuevo horario */}
      <NuevoHorarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreado={handleCreado}
      />
    </>
  );
};

// =============================================
// Sub-componente: Tarjeta de horario - Variante 3
// Header sólido de color + anillo de progreso circular
// =============================================
interface HorarioCardProps {
  horario: Horario;
  accentColor: string;
  isDark: boolean;
  onEdit: () => void;
  onMenuOpen: (el: HTMLElement) => void;
}

const HorarioCard: React.FC<HorarioCardProps> = ({ horario, accentColor, isDark, onEdit, onMenuOpen }) => {
  const completitud = horario.total_celdas > 0 ? Math.min(100, Math.round((horario.total_celdas / 30) * 100)) : 0;

  // Color del header según estado
  const estadoColor = ESTADO_CONFIG[horario.estado]?.color ?? accentColor;

  // Geometría del anillo de progreso
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (completitud / 100) * circumference;

  return (
    <Card
      sx={{
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: `1px solid ${alpha(estadoColor, 0.15)}`,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: `0 8px 24px ${alpha(estadoColor, 0.18)}`, transform: 'translateY(-2px)' },
      }}
    >
      {/* Barra de acento superior, fina */}
      <Box sx={{ height: 4, bgcolor: estadoColor }} />

      <CardContent sx={{ flex: 1, p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: alpha(estadoColor, isDark ? 0.18 : 0.1),
                color: estadoColor, fontSize: 22,
              }}
            >
              <SchoolIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{ fontSize: '0.95rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {horario.grado_nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Paralelo {horario.paralelo_nombre} · {horario.periodo_codigo}
              </Typography>
            </Box>
          </Box>
          <HorarioStatusChip estado={horario.estado} />
        </Box>
        {/* Info chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
          <Chip size="small" label={horario.nivel_nombre} sx={{ fontSize: '0.65rem', bgcolor: alpha(accentColor, 0.08), color: accentColor, fontWeight: 600 }} />
          <Chip size="small" icon={<TimeIcon sx={{ fontSize: 12 }} />} label={horario.turno_nombre} sx={{ fontSize: '0.65rem' }} />
        </Box>

        {/* Anillo de progreso + texto */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="22" cy="22" r={radius} fill="none" stroke={alpha(accentColor, 0.12)} strokeWidth="4" />
              <circle
                cx="22" cy="22" r={radius} fill="none"
                stroke={accentColor} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {horario.total_celdas} celdas completadas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completitud de la grilla
            </Typography>
          </Box>
        </Box>

        {horario.publicado_por_username && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
            Publicado por {horario.publicado_por_username}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1, pt: 0 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<GridIcon />}
          onClick={onEdit}
          sx={{ borderRadius: 2, bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700, flex: 1 }}
        >
          Editar Grilla
        </Button>
        <IconButton
          size="small"
          onClick={(e) => onMenuOpen(e.currentTarget)}
          sx={{ border: `1px solid ${alpha(accentColor, 0.2)}`, borderRadius: 1.5 }}
        >
          <MoreIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};