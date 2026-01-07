// components/cursosVacacionales/inscripcion/EditarInscripcionModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Alert,
  Stack,
  Grid,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person,
  FamilyRestroom,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useInscripcionesVacacionales } from '@/hooks/useCursosVacacionales';
import { InscripcionVacacional } from '@/types/cursoVacacionalTypes';

interface EditarInscripcionModalProps {
  open: boolean;
  onClose: () => void;
  inscripcion: InscripcionVacacional | null;
}

export default function EditarInscripcionModal({
  open,
  onClose,
  inscripcion,
}: EditarInscripcionModalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { actualizar, isUpdating } = useInscripcionesVacacionales();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    ci: '',
    genero: 'masculino',
    telefono: '',
    email: '',
    nombre_tutor: '',
    telefono_tutor: '',
    email_tutor: '',
    parentesco_tutor: 'padre',
    observaciones: '',
  });

  // Cargar datos cuando cambia la inscripción
  useEffect(() => {
    if (inscripcion) {
      setFormData({
        nombres: inscripcion.nombres || '',
        apellido_paterno: inscripcion.apellido_paterno || '',
        apellido_materno: inscripcion.apellido_materno || '',
        fecha_nacimiento: inscripcion.fecha_nacimiento ? inscripcion.fecha_nacimiento.split('T')[0] : '',
        ci: inscripcion.ci || '',
        genero: inscripcion.genero || 'masculino',
        telefono: inscripcion.telefono || '',
        email: inscripcion.email || '',
        nombre_tutor: inscripcion.nombre_tutor || '',
        telefono_tutor: inscripcion.telefono_tutor || '',
        email_tutor: inscripcion.email_tutor || '',
        parentesco_tutor: inscripcion.parentesco_tutor || 'padre',
        observaciones: inscripcion.observaciones || '',
      });
      setErrors({});
    }
  }, [inscripcion]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
    }
    if (!formData.apellido_paterno.trim()) {
      newErrors.apellido_paterno = 'El apellido paterno es requerido';
    }
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    }
    if (!formData.nombre_tutor.trim()) {
      newErrors.nombre_tutor = 'El nombre del tutor es requerido';
    }
    if (!formData.telefono_tutor.trim()) {
      newErrors.telefono_tutor = 'El teléfono del tutor es requerido';
    } else if (formData.telefono_tutor.length < 7) {
      newErrors.telefono_tutor = 'El teléfono debe tener al menos 7 dígitos';
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!inscripcion || !validate()) return;

    try {
      // ✅ CORRECCIÓN: Pasar como un objeto con id y data
      await actualizar({
        id: inscripcion.id,
        data: {
          nombres: formData.nombres,
          apellido_paterno: formData.apellido_paterno,
          apellido_materno: formData.apellido_materno || undefined,
          fecha_nacimiento: formData.fecha_nacimiento,
          ci: formData.ci || undefined,
          genero: formData.genero as any,
          telefono: formData.telefono || undefined,
          email: formData.email || undefined,
          nombre_tutor: formData.nombre_tutor,
          telefono_tutor: formData.telefono_tutor,
          email_tutor: formData.email_tutor || undefined,
          parentesco_tutor: formData.parentesco_tutor || undefined,
          observaciones: formData.observaciones || undefined,
        }
      });
      onClose();
    } catch (error) {
      console.error('Error al actualizar inscripción:', error);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      transition: 'all 0.3s',
      backgroundColor: isDark ? alpha('#facc15', 0.03) : alpha('#facc15', 0.02),
      '&:hover': {
        backgroundColor: isDark ? alpha('#facc15', 0.06) : alpha('#facc15', 0.04),
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: isDark ? '#facc15' : '#f59e0b',
        },
      },
      '&.Mui-focused': {
        backgroundColor: isDark ? alpha('#facc15', 0.08) : alpha('#facc15', 0.05),
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
          borderColor: isDark ? '#facc15' : '#f59e0b',
        },
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: isDark ? '#facc15' : '#f59e0b',
    },
  };

  if (!inscripcion) return null;

  // Verificar si la inscripción puede ser editada
  const puedeEditar = !['completado', 'rechazado'].includes(inscripcion.estado);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          maxHeight: '90vh',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 232, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: isDark ? `1px solid ${alpha('#facc15', 0.2)}` : `1px solid ${alpha('#f59e0b', 0.1)}`,
          boxShadow: isDark
            ? `0 24px 48px ${alpha('#000', 0.4)}, 0 0 0 1px ${alpha('#facc15', 0.1)}`
            : `0 24px 48px ${alpha('#f59e0b', 0.15)}, 0 0 0 1px ${alpha('#f59e0b', 0.05)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isDark
            ? `2px solid ${alpha('#facc15', 0.2)}`
            : `2px solid ${alpha('#f59e0b', 0.15)}`,
          pb: 2.5,
          pt: 3,
          px: 3,
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#facc15', 0.08)} 0%, ${alpha('#f59e0b', 0.08)} 100%)`
            : `linear-gradient(135deg, ${alpha('#facc15', 0.05)} 0%, ${alpha('#fef3c7', 1)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: isDark
                ? `0 8px 16px ${alpha('#facc15', 0.3)}`
                : `0 8px 16px ${alpha('#f59e0b', 0.3)}`,
            }}
          >
            <EditIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #fef3c7 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              Editar Inscripción
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? alpha('#facc15', 0.7) : alpha('#f59e0b', 0.8),
                fontWeight: 600,
              }}
            >
              {inscripcion.codigo_inscripcion}
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={handleClose}
          size="small"
          disabled={isUpdating}
          sx={{
            color: isDark ? '#facc15' : '#f59e0b',
            '&:hover': {
              backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#f59e0b', 0.1),
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, px: 4 }}>
        {!puedeEditar && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Esta inscripción está en estado "{inscripcion.estado}" y no puede ser editada.
            </Typography>
          </Alert>
        )}

        {/* SECCIÓN: Datos del Curso (Solo lectura) */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: isDark ? '#facc15' : '#f59e0b',
            }}
          >
            📚 Curso Inscrito
          </Typography>
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {inscripcion.curso_nombre}
            </Typography>
            {inscripcion.curso_codigo && (
              <Typography variant="caption" color="text.secondary">
                Código: {inscripcion.curso_codigo}
              </Typography>
            )}
          </Alert>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* SECCIÓN: Datos del Estudiante */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            }}
          >
            <Person sx={{ fontSize: 24 }} />
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #fef3c7 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Datos del Estudiante
          </Typography>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{xs:12, sm:6}} >
            <TextField
              label="Nombres *"
              fullWidth
              value={formData.nombres}
              onChange={(e) => handleChange('nombres', e.target.value)}
              error={!!errors.nombres}
              helperText={errors.nombres}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Apellido Paterno *"
              fullWidth
              value={formData.apellido_paterno}
              onChange={(e) => handleChange('apellido_paterno', e.target.value)}
              error={!!errors.apellido_paterno}
              helperText={errors.apellido_paterno}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Apellido Materno"
              fullWidth
              value={formData.apellido_materno}
              onChange={(e) => handleChange('apellido_materno', e.target.value)}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Fecha de Nacimiento *"
              type="date"
              fullWidth
              value={formData.fecha_nacimiento}
              onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
              error={!!errors.fecha_nacimiento}
              helperText={errors.fecha_nacimiento}
              disabled={!puedeEditar || isUpdating}
              InputLabelProps={{ shrink: true }}
              sx={textFieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="CI"
              fullWidth
              value={formData.ci}
              onChange={(e) => handleChange('ci', e.target.value)}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Género"
              fullWidth
              select
              value={formData.genero}
              onChange={(e) => handleChange('genero', e.target.value)}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
              SelectProps={{ native: true }}
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </TextField>
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Teléfono"
              fullWidth
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* SECCIÓN: Datos del Tutor */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: isDark
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            }}
          >
            <FamilyRestroom sx={{ fontSize: 24 }} />
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: isDark
                ? 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Datos del Tutor/Responsable
          </Typography>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Nombre Completo del Tutor *"
              fullWidth
              value={formData.nombre_tutor}
              onChange={(e) => handleChange('nombre_tutor', e.target.value)}
              error={!!errors.nombre_tutor}
              helperText={errors.nombre_tutor}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Parentesco"
              fullWidth
              select
              value={formData.parentesco_tutor}
              onChange={(e) => handleChange('parentesco_tutor', e.target.value)}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
              SelectProps={{ native: true }}
            >
              <option value="padre">Padre</option>
              <option value="madre">Madre</option>
              <option value="tutor">Tutor Legal</option>
              <option value="abuelo">Abuelo/a</option>
              <option value="tio">Tío/a</option>
              <option value="hermano">Hermano/a Mayor</option>
              <option value="otro">Otro</option>
            </TextField>
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Teléfono del Tutor *"
              fullWidth
              value={formData.telefono_tutor}
              onChange={(e) => handleChange('telefono_tutor', e.target.value)}
              error={!!errors.telefono_tutor}
              helperText={errors.telefono_tutor}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="C.I. del Tutor"
              fullWidth
              value={formData.email_tutor}
              onChange={(e) => handleChange('email_tutor', e.target.value)}
              error={!!errors.email_tutor}
              helperText={errors.email_tutor}
              disabled={!puedeEditar || isUpdating}
              sx={textFieldStyle}
            />
          </Grid>

          <Grid size={{xs:12}}>
            <TextField
              label="Observaciones"
              fullWidth
              multiline
              rows={3}
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              disabled={!puedeEditar || isUpdating}
              placeholder="Notas adicionales sobre la inscripción..."
              sx={textFieldStyle}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: isDark
            ? `2px solid ${alpha('#facc15', 0.2)}`
            : `2px solid ${alpha('#f59e0b', 0.15)}`,
          background: isDark ? alpha('#facc15', 0.03) : alpha('#fef3c7', 0.3),
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isUpdating}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
            },
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!puedeEditar || isUpdating}
          startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            py: 1.2,
            borderRadius: 3,
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: isDark ? '#000' : '#fff',
            boxShadow: isDark
              ? `0 8px 16px ${alpha('#facc15', 0.3)}`
              : `0 8px 16px ${alpha('#f59e0b', 0.3)}`,
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #fef3c7 0%, #facc15 100%)'
                : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              transform: 'translateY(-2px)',
              boxShadow: isDark
                ? `0 12px 24px ${alpha('#facc15', 0.4)}`
                : `0 12px 24px ${alpha('#f59e0b', 0.4)}`,
            },
            '&:disabled': {
              background: isDark ? alpha('#facc15', 0.3) : alpha('#f59e0b', 0.3),
            },
            transition: 'all 0.3s',
          }}
        >
          {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}