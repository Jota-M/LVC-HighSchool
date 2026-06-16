// app/dashboard/admin/horarios/[id]/page.tsx
'use client';
import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, Chip, Paper,
  Breadcrumbs, Link, Divider, Tooltip, IconButton,
  Menu, ListItemIcon, ListItemText, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Alert, Skeleton, alpha, useTheme, keyframes, Fade,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Archive as ArchiveIcon,
  Undo as UndoIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon,
  Check as CheckIcon,
  Warning as WarnIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useHorario, useGestionHorarios, useBloques } from '@/hooks/useHorario';
import { HorarioGrid } from '@/components/horario/HorarioGrid';
import { HorarioStatusChip } from '@/components/horario/HorarioStatusChip';
import { ESTADO_CONFIG, HorarioEstado } from '@/types/horariotypes';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export default function HorarioEditorPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const horarioId = Number(params?.id);

  const accentColor = isDark ? '#facc15' : '#0288d1';

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [editNombreOpen, setEditNombreOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ estado: HorarioEstado; label: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { horario, isLoading } = useHorario(horarioId);
  const { cambiarEstado, actualizar, eliminar, isCambiandoEstado, isActualizando, isEliminando } = useGestionHorarios();

  // Bloques del turno de este horario
  const { bloques } = useBloques(
    horario ? {
      turno_id: horario.turno_id,
      nivel_academico_id: horario.nivel_academico_id,
      activo: true,
      incluir_recreos: true,
    } : {}
  );

  const handlePublicar = async () => {
    if (!horario) return;
    setConfirmAction(null);
    await cambiarEstado({ id: horario.id, estado: 'publicado' });
  };

  const handleCambiarEstado = async (estado: HorarioEstado) => {
    if (!horario) return;
    setMenuAnchor(null);
    setConfirmAction(null);
    await cambiarEstado({ id: horario.id, estado });
  };

  const handleGuardarNombre = async () => {
    if (!horario) return;
    await actualizar({ id: horario.id, payload: { nombre } });
    setEditNombreOpen(false);
  };

  const handleEliminar = async () => {
    if (!horario) return;
    await eliminar(horario.id);
    router.push('/dashboard/admin/horario');
  };

  const openEditNombre = () => {
    setNombre(horario?.nombre ?? '');
    setEditNombreOpen(true);
    setMenuAnchor(null);
  };

  // ── ACCIONES DISPONIBLES según estado ──
  const acciones = horario ? {
    puedePublicar: horario.estado === 'borrador',
    puedeArchivar: horario.estado === 'publicado',
    puedeBorrador: horario.estado === 'publicado',
    puedeEliminar: horario.estado !== 'publicado',
    puedeEditar: horario.estado !== 'archivado',
  } : {};

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={120} sx={{ mb: 3, borderRadius: 3 }} />
        <Skeleton variant="rounded" height={500} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  if (!horario) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Horario no encontrado. <Link onClick={() => router.back()} sx={{ cursor: 'pointer' }}>Volver</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        <Fade in timeout={400}>
          <Box>
            {/* ── BREADCRUMBS ── */}
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link
                component="button"
                variant="body2"
                color="inherit"
                underline="hover"
                onClick={() => router.push('/dashboard/admin/horario')}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <CalendarIcon sx={{ fontSize: 16 }} /> Horarios
              </Link>
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                {horario.grado_nombre} — Paralelo {horario.paralelo_nombre}
              </Typography>
            </Breadcrumbs>

            {/* ── HEADER CARD ── */}
            <Paper
              sx={{
                borderRadius: 3, overflow: 'hidden', mb: 3,
                border: `1px solid ${alpha(accentColor, 0.2)}`,
                bgcolor: isDark ? '#11131f' : 'background.paper',
              }}
            >
              {/* Top accent */}
              <Box sx={{ height: 5, background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.3)})` }} />

              <Box sx={{ p: { xs: 1.5, md: 3 } }}>
                {/* Fila 1: navegación + estado + acciones */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 1, mb: 1.5, flexWrap: { xs: 'nowrap', md: 'wrap' },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    {/* Botón atrás: ícono en mobile, texto en desktop */}
                    <IconButton
                      onClick={() => router.push('/dashboard/admin/horario')}
                      size="small"
                      sx={{
                        display: { xs: 'inline-flex', md: 'none' },
                        border: `1px solid ${alpha(accentColor, 0.3)}`, borderRadius: 1.5,
                      }}
                    >
                      <BackIcon fontSize="small" />
                    </IconButton>
                    <Button
                      startIcon={<BackIcon />}
                      onClick={() => router.push('/dashboard/admin/horario')}
                      size="small"
                      sx={{ display: { xs: 'none', md: 'inline-flex' }, borderRadius: 2, minWidth: 0, px: 1.5 }}
                    >
                      Atrás
                    </Button>

                    <HorarioStatusChip estado={horario.estado} />

                    {horario.estado === 'borrador' && (
                      <Chip
                        label="En edición"
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.65rem',
                          animation: `${pulse} 2s infinite`,
                          bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700,
                          display: { xs: 'none', sm: 'inline-flex' },
                        }}
                      />
                    )}
                  </Box>

                  {/* Acciones */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                    {acciones.puedePublicar && (
                      <Button
                        variant="contained"
                        startIcon={<PublishIcon />}
                        onClick={() => setConfirmAction({ estado: 'publicado', label: 'publicar' })}
                        disabled={isCambiandoEstado}
                        size="small"
                        sx={{
                          borderRadius: 2, fontWeight: 700,
                          bgcolor: ESTADO_CONFIG.publicado.color,
                          '&:hover': { bgcolor: '#059669' },
                          px: { xs: 1.5, md: 2 },
                          '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } },
                        }}
                      >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                          Publicar
                        </Box>
                      </Button>
                    )}

                    <IconButton
                      onClick={(e) => setMenuAnchor(e.currentTarget)}
                      size="small"
                      sx={{ border: `1px solid ${alpha(accentColor, 0.3)}`, borderRadius: 1.5 }}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Fila 2: título */}
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ mb: 1, fontSize: { xs: '1.05rem', md: '1.5rem' }, lineHeight: 1.3 }}
                >
                  {horario.nombre ?? `${horario.grado_nombre} — Paralelo ${horario.paralelo_nombre}`}
                </Typography>

                {/* Fila 3: chips informativos — scroll horizontal en mobile */}
                <Box sx={{
                  display: 'flex', gap: 1,
                  flexWrap: { xs: 'nowrap', md: 'wrap' },
                  overflowX: { xs: 'auto', md: 'visible' },
                  pb: { xs: 0.5, md: 0 },
                  '&::-webkit-scrollbar': { height: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: alpha(accentColor, 0.2), borderRadius: 2 },
                }}>
                  {[
                    { icon: <SchoolIcon sx={{ fontSize: 14 }} />, label: horario.nivel_nombre },
                    { icon: <TimeIcon sx={{ fontSize: 14 }} />, label: horario.turno_nombre },
                    { icon: <CalendarIcon sx={{ fontSize: 14 }} />, label: `${horario.periodo_nombre} (${horario.periodo_codigo})` },
                    ...(horario.paralelo_aula ? [{ icon: null, label: `Aula: ${horario.paralelo_aula}` }] : []),
                  ].map((item, i) => (
                    <Chip
                      key={i}
                      size="small"
                      icon={item.icon ?? undefined}
                      label={item.label}
                      sx={{
                        fontSize: '0.7rem', flexShrink: 0,
                        bgcolor: alpha(accentColor, 0.07),
                        '& .MuiChip-icon': { color: accentColor },
                      }}
                    />
                  ))}
                </Box>

                {/* Observaciones */}
                {horario.observaciones && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2, py: 0.5 }}>
                    <Typography variant="caption">{horario.observaciones}</Typography>
                  </Alert>
                )}
              </Box>
            </Paper>

            {/* ── GRILLA INTERACTIVA ── */}
            <Paper sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, border: `1px solid ${alpha(accentColor, 0.12)}`, bgcolor: isDark ? '#11131f' : 'background.paper' }}>
              <HorarioGrid
                horarioId={horario.id}
                gradoId={horario.grado_id}
                paraleloId={horario.paralelo_id}
                periodoId={horario.periodo_academico_id}
                turnoId={horario.turno_id}
                bloques={bloques}
                celdas={horario.detalle ?? []}
                estado={horario.estado}
              />
            </Paper>
          </Box>
        </Fade>
      </Container>

      {/* ── CONTEXT MENU ── */}
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}
      >
        {/* Editar */}
        {acciones.puedeEditar && (
          <MenuItem onClick={openEditNombre}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar nombre</ListItemText>
          </MenuItem>
        )}

        <Divider />

        {/* Pasar a borrador */}
        {acciones.puedeBorrador && (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setConfirmAction({ estado: 'borrador', label: 'mover a borrador' });
            }}
            disabled={isCambiandoEstado}
          >
            <ListItemIcon>
              <UndoIcon fontSize="small" sx={{ color: ESTADO_CONFIG.borrador.color }} />
            </ListItemIcon>
            <ListItemText>Pasar a Borrador</ListItemText>
          </MenuItem>
        )}

        {/* Archivar */}
        {acciones.puedeArchivar && (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setConfirmAction({ estado: 'archivado', label: 'archivar' });
            }}
            disabled={isCambiandoEstado}
          >
            <ListItemIcon>
              <ArchiveIcon fontSize="small" sx={{ color: ESTADO_CONFIG.archivado.color }} />
            </ListItemIcon>
            <ListItemText>Archivar</ListItemText>
          </MenuItem>
        )}

        {/* 🔴 Eliminar (SIN Fragment) */}
        {acciones.puedeEliminar && <Divider />}

        {acciones.puedeEliminar && (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setConfirmDelete(true);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Eliminar Horario</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* ── MODAL: Confirmar cambio de estado ── */}
      <Dialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          {confirmAction?.estado === 'publicado'
            ? <><PublishIcon sx={{ color: ESTADO_CONFIG.publicado.color }} /> Publicar horario</>
            : confirmAction?.estado === 'archivado'
              ? <><ArchiveIcon sx={{ color: ESTADO_CONFIG.archivado.color }} /> Archivar horario</>
              : <><UndoIcon /> Mover a borrador</>
          }
        </DialogTitle>
        <DialogContent>
          {confirmAction?.estado === 'publicado' && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Al publicar, estudiantes, docentes y padres podrán ver este horario.
            </Alert>
          )}
          {confirmAction?.estado === 'archivado' && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Al archivar, el horario dejará de ser visible. No podrás editarlo después.
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary">
            ¿Confirmas que deseas <strong>{confirmAction?.label}</strong> el horario de{' '}
            <strong>{horario.grado_nombre} — Paralelo {horario.paralelo_nombre}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmAction(null)} color="inherit" sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={isCambiandoEstado}
            onClick={() => confirmAction && handleCambiarEstado(confirmAction.estado)}
            startIcon={<CheckIcon />}
            sx={{
              borderRadius: 2, fontWeight: 700,
              bgcolor: confirmAction?.estado ? ESTADO_CONFIG[confirmAction.estado].color : accentColor,
              color: '#fff',
            }}
          >
            {isCambiandoEstado ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL: Confirmar eliminar ── */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 380 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <WarnIcon /> Eliminar horario
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            Esta acción no se puede deshacer.
          </Alert>
          <Typography variant="body2">
            Se eliminará permanentemente el horario de <strong>{horario.grado_nombre} — Paralelo {horario.paralelo_nombre}</strong> y todas sus celdas.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmDelete(false)} color="inherit" sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleEliminar} disabled={isEliminando} sx={{ borderRadius: 2, fontWeight: 700 }}>
            {isEliminando ? 'Eliminando...' : 'Eliminar definitivamente'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL: Editar nombre ── */}
      <Dialog
        open={editNombreOpen}
        onClose={() => setEditNombreOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 400 } }}
      >
        <DialogTitle fontWeight={700}>Editar nombre del horario</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Horario 2025 — 3ro A Mañana"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setEditNombreOpen(false)} color="inherit" sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleGuardarNombre}
            disabled={isActualizando}
            sx={{ borderRadius: 2, bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700 }}
          >
            {isActualizando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}