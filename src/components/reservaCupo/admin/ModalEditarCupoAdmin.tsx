// client/src/components/reservaCupo/admin/ModalEditarCupoAdmin.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  IconButton,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  EditNoteRounded as EditNoteIcon,
  SchoolRounded as SchoolIcon,
  PersonRounded as PersonIcon,
  FamilyRestroomRounded as FamilyIcon,
  CheckCircleRounded as CheckCircleIcon,
  SaveRounded as SaveIcon,
  ScheduleRounded as ScheduleIcon,
  BadgeRounded as BadgeIcon,
  ContactPhoneRounded as ContactPhoneIcon,
  EventRounded as EventIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { reservaCupoService } from '@/services/reservaCupoService';
import { ReservaCupoData, ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
import { getInitials, usePalette } from './common';

interface ModalEditarCupoAdminProps {
  open: boolean;
  onClose: () => void;
  tipo: 'regular' | 'hermano';
  item: ReservaCupoData | ReservaCupoHermanoData | null;
  gradosList: any[];
  turnosList: any[];
  onSuccess: () => void;
}

export const ModalEditarCupoAdmin: React.FC<ModalEditarCupoAdminProps> = ({
  open,
  onClose,
  tipo,
  item,
  gradosList,
  turnosList,
  onSuccess,
}) => {
  const { theme, isDark, gold: accentColor } = usePalette();

  const [isGuardando, setIsGuardando] = useState(false);

  // Campos para Hermano Postulante
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [ci, setCi] = useState('');
  const [genero, setGenero] = useState<'M' | 'F'>('M');
  const [fechaNacimiento, setFechaNacimiento] = useState('');

  // Campos para Curso y Turno
  const [gradoId, setGradoId] = useState<number | ''>('');
  const [turnoId, setTurnoId] = useState<number | ''>('');
  const [estado, setEstado] = useState<string>('confirmada');

  // Campos del Tutor
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorCi, setTutorCi] = useState('');
  const [tutorParentesco, setTutorParentesco] = useState('Padre');
  const [tutorTelefono, setTutorTelefono] = useState('');

  // Observaciones
  const [observaciones, setObservaciones] = useState('');

  // Inicializar formulario al abrir o cambiar de item
  useEffect(() => {
    if (!item || !open) return;

    if (tipo === 'hermano') {
      const h = item as ReservaCupoHermanoData;
      setNombres(h.nombres || '');
      setApellidoPaterno(h.apellido_paterno || '');
      setApellidoMaterno(h.apellido_materno || '');
      setCi(h.ci || '');
      setGenero((h.genero as 'M' | 'F') || 'M');
      if (h.fecha_nacimiento) {
        setFechaNacimiento(h.fecha_nacimiento.slice(0, 10));
      } else {
        setFechaNacimiento('');
      }
      setGradoId(h.grado_solicitado_id || '');
      setTurnoId(h.turno_solicitado_id || '');
      setEstado(h.estado || 'confirmada');
      setTutorNombre(h.tutor_nombre || '');
      setTutorCi(h.tutor_ci || '');
      setTutorParentesco(h.tutor_parentesco || 'Padre');
      setTutorTelefono(h.tutor_telefono || '');
      setObservaciones(h.observaciones || '');
    } else {
      const r = item as ReservaCupoData;
      setNombres(r.estudiante_nombres || '');
      setApellidoPaterno(r.estudiante_apellido_paterno || '');
      setApellidoMaterno(r.estudiante_apellido_materno || '');
      setCi(r.estudiante_ci || '');
      setGradoId(r.grado_destino_id || '');
      setTurnoId(r.turno_destino_id || '');
      setEstado(r.estado || 'confirmada');
      setTutorNombre(r.tutor_nombre || '');
      setTutorCi(r.tutor_ci || '');
      setTutorParentesco(r.tutor_parentesco || 'Padre');
      setTutorTelefono(r.tutor_telefono || '');
      setObservaciones(r.observaciones || '');
    }
  }, [item, open, tipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!gradoId) {
      toast.error('Debe seleccionar el curso/grado.');
      return;
    }
    if (!turnoId) {
      toast.error('Debe seleccionar el turno.');
      return;
    }

    setIsGuardando(true);
    const toastId = toast.loading('Guardando cambios en el cupo...');

    try {
      if (tipo === 'hermano') {
        const payload = {
          nombres: nombres.trim(),
          apellido_paterno: apellidoPaterno.trim(),
          apellido_materno: apellidoMaterno.trim() || undefined,
          ci: ci.trim() || undefined,
          genero,
          fecha_nacimiento: fechaNacimiento || undefined,
          grado_solicitado_id: Number(gradoId),
          turno_solicitado_id: Number(turnoId),
          tutor_nombre: tutorNombre.trim(),
          tutor_ci: tutorCi.trim() || undefined,
          tutor_parentesco: tutorParentesco.trim(),
          tutor_telefono: tutorTelefono.trim(),
          observaciones: observaciones.trim() || undefined,
          estado,
        };

        const resp = await reservaCupoService.actualizarHermanoAdmin(item.id, payload);
        if (resp?.success) {
          toast.success(resp.message || 'Cupo de hermano actualizado exitosamente', { id: toastId });
          onSuccess();
          onClose();
        } else {
          toast.error(resp?.message || 'Error al actualizar cupo', { id: toastId });
        }
      } else {
        const payload = {
          grado_destino_id: Number(gradoId),
          turno_destino_id: Number(turnoId),
          tutor_nombre: tutorNombre.trim(),
          tutor_ci: tutorCi.trim() || undefined,
          tutor_parentesco: tutorParentesco.trim(),
          tutor_telefono: tutorTelefono.trim(),
          observaciones: observaciones.trim() || undefined,
          estado,
          estudiante_nombres: nombres.trim(),
          estudiante_apellido_paterno: apellidoPaterno.trim(),
          estudiante_apellido_materno: apellidoMaterno.trim() || undefined,
          estudiante_ci: ci.trim() || undefined,
        };

        const resp = await reservaCupoService.actualizarReservaAdmin(item.id, payload);
        if (resp?.success) {
          toast.success(resp.message || 'Reserva regular actualizada exitosamente', { id: toastId });
          onSuccess();
          onClose();
        } else {
          toast.error(resp?.message || 'Error al actualizar reserva', { id: toastId });
        }
      }
    } catch (error: any) {
      console.error('Error al guardar cambios de cupo:', error);
      const msg = error.response?.data?.message || error.message || 'Error al guardar cambios';
      toast.error(msg, { id: toastId });
    } finally {
      setIsGuardando(false);
    }
  };

  if (!item) return null;

  const codigo = tipo === 'hermano'
    ? (item as ReservaCupoHermanoData).codigo_reserva
    : (item as ReservaCupoData).codigo_reserva;

  const esHermano = tipo === 'hermano';
  const hermanoItem = esHermano ? (item as ReservaCupoHermanoData) : null;
  const regularItem = !esHermano ? (item as ReservaCupoData) : null;

  return (
    <Dialog
      open={open}
      onClose={isGuardando ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          bgcolor: isDark ? '#0f172a' : '#ffffff',
          backgroundImage: 'none',
          boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.8)' : '0 20px 50px rgba(0,0,0,0.15)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
          overflow: 'hidden',
        },
      }}
    >
      {/* HEADER INSTITUCIONAL */}
      <DialogTitle
        sx={{
          p: 2.5,
          background: esHermano
            ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              width: 44,
              height: 44,
            }}
          >
            <EditNoteIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {esHermano ? 'Editar Cupo de Hermano Postulante' : 'Editar Reserva de Cupo Regular'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Código de Reserva: <strong>{codigo}</strong> · Gestión Académica 2027
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          disabled={isGuardando}
          sx={{
            color: '#ffffff',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* FORMULARIO COMPLETO */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack spacing={2.5}>
            {/* HERMANO REGULAR VINCULADO (Solo si es hermano postulante) */}
            {esHermano && hermanoItem && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.8,
                  borderRadius: '14px',
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#f8fafc',
                  border: `1px dashed ${isDark ? '#475569' : '#cbd5e1'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <FamilyIcon sx={{ color: '#8b5cf6', fontSize: 28 }} />
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
                      Hermano Regular Vinculado (Respaldo Institucional):
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                      {hermanoItem.regular_nombre_completo || 'Estudiante Regular'}
                    </Typography>
                  </Box>
                </Box>
                {hermanoItem.regular_codigo && (
                  <Chip
                    size="small"
                    label={`Cód: ${hermanoItem.regular_codigo}`}
                    sx={{ fontWeight: 800, bgcolor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe', color: '#7c3aed' }}
                  />
                )}
              </Paper>
            )}

            {/* SECCIÓN 1: DATOS DEL ESTUDIANTE / POSTULANTE */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <PersonIcon sx={{ color: esHermano ? '#6366f1' : '#0288d1', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  {esHermano ? '1. Datos del Hermano Postulante' : '1. Datos del Estudiante'}
                </Typography>
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    required
                    label="Nombres"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    required
                    label="Apellido Paterno"
                    value={apellidoPaterno}
                    onChange={(e) => setApellidoPaterno(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Apellido Materno"
                    value={apellidoMaterno}
                    onChange={(e) => setApellidoMaterno(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cédula de Identidad (CI)"
                    value={ci}
                    onChange={(e) => setCi(e.target.value)}
                    placeholder="Ej. 15714441"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {esHermano && (
                  <>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Género</InputLabel>
                        <Select
                          value={genero}
                          label="Género"
                          onChange={(e) => setGenero(e.target.value as 'M' | 'F')}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="M">Masculino (Varón)</MenuItem>
                          <MenuItem value="F">Femenino (Mujer)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Fecha de Nacimiento"
                        value={fechaNacimiento}
                        onChange={(e) => setFechaNacimiento(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                  </>
                )}

                {!esHermano && regularItem?.estudiante_codigo && (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      disabled
                      label="Código Institucional"
                      value={regularItem.estudiante_codigo}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />

            {/* SECCIÓN 2: ASIGNACIÓN ACADÉMICA (CURSO Y TURNO PARA 2027) */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <SchoolIcon sx={{ color: esHermano ? '#6366f1' : '#0288d1', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  2. Asignación Académica y Cupo (Gestión 2027)
                </Typography>
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>{esHermano ? 'Curso / Grado Solicitado' : 'Curso / Grado Destino 2027'}</InputLabel>
                    <Select
                      value={gradoId}
                      label={esHermano ? 'Curso / Grado Solicitado' : 'Curso / Grado Destino 2027'}
                      onChange={(e) => setGradoId(Number(e.target.value))}
                      sx={{ borderRadius: '12px' }}
                    >
                      {gradosList.map((g) => (
                        <MenuItem key={g.id} value={g.id}>
                          {g.nombre} {g.nivel_academico_nombre ? `(${g.nivel_academico_nombre})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 3.5 }}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Turno</InputLabel>
                    <Select
                      value={turnoId}
                      label="Turno"
                      onChange={(e) => setTurnoId(Number(e.target.value))}
                      sx={{ borderRadius: '12px' }}
                    >
                      {turnosList.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 3.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado del Cupo</InputLabel>
                    <Select
                      value={estado}
                      label="Estado del Cupo"
                      onChange={(e) => setEstado(e.target.value)}
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value="confirmada">✅ Cupo Confirmado</MenuItem>
                      {esHermano ? (
                        <MenuItem value="en_espera">⏳ Lista de Espera</MenuItem>
                      ) : (
                        <>
                          <MenuItem value="no_continua">❌ No Continúa</MenuItem>
                          <MenuItem value="anulada">🚫 Anulada</MenuItem>
                        </>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />

            {/* SECCIÓN 3: DATOS DEL TUTOR / APODERADO */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <ContactPhoneIcon sx={{ color: esHermano ? '#6366f1' : '#0288d1', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  3. Datos del Tutor / Responsable
                </Typography>
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    required
                    label="Nombre Completo del Tutor"
                    value={tutorNombre}
                    onChange={(e) => setTutorNombre(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="CI del Tutor"
                    value={tutorCi}
                    onChange={(e) => setTutorCi(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Parentesco</InputLabel>
                    <Select
                      value={tutorParentesco}
                      label="Parentesco"
                      onChange={(e) => setTutorParentesco(e.target.value)}
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value="Padre">Padre</MenuItem>
                      <MenuItem value="Madre">Madre</MenuItem>
                      <MenuItem value="Tutor Legal">Tutor Legal</MenuItem>
                      <MenuItem value="Abuelo/a">Abuelo/a</MenuItem>
                      <MenuItem value="Tío/a">Tío/a</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 2.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    required
                    label="Teléfono / WhatsApp"
                    value={tutorTelefono}
                    onChange={(e) => setTutorTelefono(e.target.value)}
                    placeholder="Ej. 72428020"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* SECCIÓN 4: OBSERVACIONES */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 0.8 }}>
                Observaciones Administrativas (Opcional):
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Cambio de curso autorizado por Dirección. Corrección ortográfica del apellido."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>

            {/* BOTONES DE ACCIÓN */}
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', pt: 1 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={isGuardando}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isGuardando || !nombres || !apellidoPaterno || !tutorNombre || !gradoId || !turnoId}
                startIcon={isGuardando ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 800,
                  px: 3.5,
                  background: esHermano
                    ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  boxShadow: esHermano
                    ? '0 4px 15px rgba(79, 70, 229, 0.35)'
                    : '0 4px 15px rgba(2, 136, 209, 0.3)',
                }}
              >
                {isGuardando ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditarCupoAdmin;

