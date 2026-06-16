// components/estudiantes/TutoresTab.tsx
'use client';
import React, { useState } from 'react';
import {
  Box, Grid, Paper, Typography, Chip, IconButton,
  Button, Avatar, Tooltip, Dialog, DialogContent,
  DialogActions, CircularProgress, useTheme, Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Star as StarIcon,
  Home as HomeIcon,
  Notifications as NotifIcon,
  DirectionsWalk as WalkIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { TutorFormDialog } from './TutorFormDialog';
import { TutorConRelacion, PadreFamiliaUpdate, RelacionTutorUpdate, AsignarTutorPayload } from '@/services/tutoresService';
import { TutorCreate } from '@/types/estudianteTypes';
import { useTutores } from '@/hooks/useTutores';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TutoresTabProps {
  tutores: TutorConRelacion[];
  estudianteId: number;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const TutoresTab: React.FC<TutoresTabProps> = ({ tutores, estudianteId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const {
    agregarTutorNuevo,
    asignarTutorExistente,
    editarTutor,
    removerTutor,
    buscarTutorPorCI,
    isAgregando,
    isAsignando,
    isEditando,
    isRemoviendo,
  } = useTutores(estudianteId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<TutorConRelacion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TutorConRelacion | null>(null);

  const handleOpenCreate = () => {
    setEditingTutor(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (tutor: TutorConRelacion) => {
    setEditingTutor(tutor);
    setFormOpen(true);
  };

  const handleSubmitNuevo = async (datosTutor: TutorCreate, datosRelacion: any) => {
    await agregarTutorNuevo({ datosTutor, datosRelacion });
  };

  const handleSubmitEditar = async (datosTutor: PadreFamiliaUpdate, datosRelacion: RelacionTutorUpdate) => {
    if (!editingTutor) return;
    // relacion_id = et.id (requiere fix en getTutores, ver tutoresService.ts)
    // id = pf.id (padre_familia)
    await editarTutor({
      padreId: editingTutor.id,
      relacionId: (editingTutor as any).relacion_id ?? editingTutor.id,
      datosTutor,
      datosRelacion,
    });
  };

  const handleAsignarExistente = async (padreId: number, datosRelacion: AsignarTutorPayload) => {
    await asignarTutorExistente({ ...datosRelacion, padre_familia_id: padreId });
  };

  const handleRemover = async () => {
    if (!deleteConfirm) return;
    await removerTutor((deleteConfirm as any).relacion_id ?? deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const isMutating = isAgregando || isAsignando || isEditando;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Tutores / Apoderados</Typography>
          <Typography variant="caption" color="text.secondary">
            {tutores.length} tutor{tutores.length !== 1 ? 'es' : ''} registrado{tutores.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenCreate}
          sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: '12px', px: 2.5,
            bgcolor: accent, color: isDark ? '#000' : '#fff', boxShadow: 'none',
            '&:hover': { bgcolor: isDark ? '#e5b800' : '#0277bd', boxShadow: 'none' },
          }}
        >
          Agregar tutor
        </Button>
      </Box>

      {/* Lista */}
      {tutores.length === 0 ? (
        <EmptyState onAdd={handleOpenCreate} isDark={isDark} accent={accent} />
      ) : (
        <Grid container spacing={3}>
          {tutores.map((tutor, index) => (
            <Grid size={{xs:12, md:6}} key={(tutor as any).relacion_id ?? tutor.id ?? index}>
              <TutorCard
                tutor={tutor}
                isDark={isDark}
                accent={accent}
                onEdit={() => handleOpenEdit(tutor)}
                onDelete={() => setDeleteConfirm(tutor)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal crear/editar */}
      <TutorFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mode={editingTutor ? 'edit' : 'create'}
        tutorActual={editingTutor ?? undefined}
        onSubmitNuevo={handleSubmitNuevo}
        onSubmitEditar={handleSubmitEditar}
        onBuscarCI={buscarTutorPorCI}
        onAsignarExistente={handleAsignarExistente}
      />

      {/* Confirm remover */}
      <RemoverDialog
        tutor={deleteConfirm}
        loading={isRemoviendo}
        isDark={isDark}
        onConfirm={handleRemover}
        onCancel={() => setDeleteConfirm(null)}
      />
    </Box>
  );
};

// ─── TutorCard ────────────────────────────────────────────────────────────────

const TutorCard: React.FC<{
  tutor: TutorConRelacion;
  isDark: boolean;
  accent: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ tutor, isDark, accent, onEdit, onDelete }) => {
  const initials = `${tutor.nombres?.charAt(0) ?? ''}${tutor.apellido_paterno?.charAt(0) ?? ''}`;
  const fullName = [tutor.nombres, tutor.apellido_paterno, tutor.apellido_materno]
    .filter(Boolean).join(' ');

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3, borderRadius: '20px', position: 'relative',
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: tutor.es_tutor_principal
          ? `2px solid ${isDark ? 'rgba(250,204,21,0.4)' : 'rgba(2,136,209,0.35)'}`
          : '2px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
      }}
    >
      {/* Acciones */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
        <Tooltip title="Editar tutor">
          <IconButton size="small" onClick={onEdit}
            sx={{
              bgcolor: isDark ? 'rgba(250,204,21,0.1)' : 'rgba(2,136,209,0.1)', color: accent,
              '&:hover': { bgcolor: isDark ? 'rgba(250,204,21,0.2)' : 'rgba(2,136,209,0.2)' },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remover del estudiante">
          <IconButton size="small" onClick={onDelete}
            sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Avatar + nombre */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, pr: 8 }}>
        <Avatar
          sx={{
            width: 52, height: 52, fontWeight: 700, fontSize: '1.1rem',
            bgcolor: tutor.es_tutor_principal ? accent : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            color: tutor.es_tutor_principal ? (isDark ? '#000' : '#fff') : 'text.secondary',
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {fullName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
            {tutor.es_tutor_principal && (
              <Chip
                icon={<StarIcon sx={{ fontSize: '11px !important' }} />}
                label="Principal" size="small"
                sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700,
                  bgcolor: isDark ? 'rgba(250,204,21,0.15)' : 'rgba(2,136,209,0.15)', color: accent,
                  '& .MuiChip-icon': { color: accent },
                }}
              />
            )}
            {tutor.parentesco && (
              <Chip label={tutor.parentesco.charAt(0).toUpperCase() + tutor.parentesco.slice(1)}
                size="small"
                sx={{ height: 20, fontSize: '0.62rem', fontWeight: 600,
                  bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 2, opacity: 0.4 }} />

      {/* Info de contacto */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2 }}>
        <InfoRow icon={<BadgeIcon sx={{ fontSize: 15 }} />} label="CI" value={tutor.ci} />
        <InfoRow
          icon={<PhoneIcon sx={{ fontSize: 15 }} />}
          label="Teléfono / Celular"
          value={[tutor.telefono, tutor.celular].filter(Boolean).join(' / ') || undefined}
        />
        {tutor.email && (
          <InfoRow icon={<EmailIcon sx={{ fontSize: 15 }} />} label="Email" value={tutor.email} />
        )}
        {tutor.ocupacion && (
          <InfoRow icon={<BadgeIcon sx={{ fontSize: 15 }} />} label="Ocupación" value={tutor.ocupacion} />
        )}
      </Box>

      {/* Permisos como iconos pequeños */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {tutor.vive_con_estudiante && (
          <PermisoBadge icon={<HomeIcon sx={{ fontSize: 13 }} />} label="Vive con" isDark={isDark} />
        )}
        {tutor.autorizado_recoger && (
          <PermisoBadge icon={<WalkIcon sx={{ fontSize: 13 }} />} label="Puede recoger" isDark={isDark} />
        )}
        {tutor.recibe_notificaciones && (
          <PermisoBadge icon={<NotifIcon sx={{ fontSize: 13 }} />} label="Notificaciones" isDark={isDark} />
        )}
      </Box>
    </Paper>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center', minWidth: 18 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value || 'No especificado'}</Typography>
    </Box>
  </Box>
);

const PermisoBadge: React.FC<{ icon: React.ReactNode; label: string; isDark: boolean }> = ({ icon, label, isDark }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.3,
      borderRadius: '6px', bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    }}
  >
    <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>{label}</Typography>
  </Box>
);

const EmptyState: React.FC<{ onAdd: () => void; isDark: boolean; accent: string }> = ({ onAdd, isDark, accent }) => (
  <Box sx={{
    textAlign: 'center', py: 8, px: 4, borderRadius: '20px',
    border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  }}>
    <PersonAddIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Sin tutores registrados</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Este estudiante no tiene tutores asignados aún.
    </Typography>
    <Button variant="contained" startIcon={<PersonAddIcon />} onClick={onAdd}
      sx={{
        textTransform: 'none', fontWeight: 700, borderRadius: '12px', px: 3,
        bgcolor: accent, color: isDark ? '#000' : '#fff', boxShadow: 'none',
        '&:hover': { bgcolor: isDark ? '#e5b800' : '#0277bd', boxShadow: 'none' },
      }}
    >
      Agregar primer tutor
    </Button>
  </Box>
);

const RemoverDialog: React.FC<{
  tutor: TutorConRelacion | null; loading: boolean; isDark: boolean;
  onConfirm: () => void; onCancel: () => void;
}> = ({ tutor, loading, isDark, onConfirm, onCancel }) => (
  <Dialog open={!!tutor} onClose={onCancel}
    PaperProps={{ sx: { borderRadius: '20px', bgcolor: isDark ? '#0f172a' : '#fff', backgroundImage: 'none', maxWidth: 400 } }}
  >
    <DialogContent sx={{ pt: 4, pb: 2, textAlign: 'center' }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(239,68,68,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
      }}>
        <WarningIcon sx={{ color: '#ef4444', fontSize: 28 }} />
      </Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>¿Remover tutor?</Typography>
      <Typography variant="body2" color="text.secondary">
        Se removerá a <strong>{tutor?.nombres} {tutor?.apellido_paterno}</strong> como tutor de este estudiante.
        Sus datos personales no se eliminarán del sistema.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3, gap: 1, justifyContent: 'center' }}>
      <Button onClick={onCancel} disabled={loading}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', px: 3, color: 'text.secondary' }}
      >
        Cancelar
      </Button>
      <Button onClick={onConfirm} disabled={loading} variant="contained"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
      >
        {loading ? 'Removiendo...' : 'Remover'}
      </Button>
    </DialogActions>
  </Dialog>
);