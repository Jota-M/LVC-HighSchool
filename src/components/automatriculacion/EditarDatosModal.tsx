// components/EditarDatosModal.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { EstudianteValidado } from '@/types/autoMatriculacionTypes';

interface EditarDatosModalProps {
  open: boolean;
  onClose: () => void;
  estudiante: EstudianteValidado;
  onGuardar: (datos: any) => void;
  isLoading?: boolean;
}

const EditarDatosModal: React.FC<EditarDatosModalProps> = ({
  open,
  onClose,
  estudiante,
  onGuardar,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    telefono: '',
    email: '',
    direccion: '',
    zona: '',
    ciudad: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (estudiante && open) {
      setFormData({
        telefono: estudiante.telefono || '',
        email: estudiante.email || '',
        direccion: estudiante.direccion || '',
        zona: estudiante.zona || '',
        ciudad: estudiante.ciudad || '',
        contacto_emergencia: estudiante.contacto_emergencia || '',
        telefono_emergencia: estudiante.telefono_emergencia || '',
      });
      setErrors({});
    }
  }, [estudiante, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar teléfonos (solo números y espacios/guiones)
    const phoneRegex = /^[\d\s\-+()]*$/;
    if (formData.telefono && !phoneRegex.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    if (formData.telefono_emergencia && !phoneRegex.test(formData.telefono_emergencia)) {
      newErrors.telefono_emergencia = 'Formato de teléfono inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Filtrar solo los campos que cambiaron
    const cambios: any = {};
    Object.keys(formData).forEach((key) => {
      const oldValue = estudiante[key as keyof EstudianteValidado] || '';
      const newValue = formData[key as keyof typeof formData];
      if (newValue !== oldValue) {
        cambios[key] = newValue || null;
      }
    });

    if (Object.keys(cambios).length === 0) {
      onClose();
      return;
    }

    onGuardar(cambios);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          <Typography variant="h6">Actualizar Mis Datos</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          Actualiza tu información de contacto antes de continuar con la matrícula
        </Alert>

        <Grid container spacing={2}>
          {/* Información Personal */}
          <Grid size={{xs:12}}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
              Información de Contacto
            </Typography>
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              error={!!errors.telefono}
              helperText={errors.telefono}
              disabled={isLoading}
              placeholder="Ej: 2-123456"
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
              placeholder="correo@ejemplo.com"
            />
          </Grid>

          {/* Dirección */}
          <Grid size={{xs:12}}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>
              Dirección
            </Typography>
          </Grid>

          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Dirección"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              disabled={isLoading}
              placeholder="Calle, número, etc."
              multiline
              rows={2}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Zona"
              value={formData.zona}
              onChange={(e) => handleChange('zona', e.target.value)}
              disabled={isLoading}
              placeholder="Ej: Zona Sur"
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Ciudad"
              value={formData.ciudad}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              disabled={isLoading}
              placeholder="Ej: La Paz"
            />
          </Grid>

          {/* Contacto de Emergencia */}
          <Grid size={{xs:12}}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>
              Contacto de Emergencia
            </Typography>
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Nombre del Contacto"
              value={formData.contacto_emergencia}
              onChange={(e) => handleChange('contacto_emergencia', e.target.value)}
              disabled={isLoading}
              placeholder="Nombre completo"
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Teléfono de Emergencia"
              value={formData.telefono_emergencia}
              onChange={(e) => handleChange('telefono_emergencia', e.target.value)}
              error={!!errors.telefono_emergencia}
              helperText={errors.telefono_emergencia}
              disabled={isLoading}
              placeholder="Ej: 7-1234567"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          startIcon={<CloseIcon />}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditarDatosModal;