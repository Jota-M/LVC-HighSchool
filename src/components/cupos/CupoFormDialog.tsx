// src/components/cupos/CupoFormDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import api from '@/lib/api';
import { useCupos } from '@/hooks/useCupos';

interface CupoFormDialogProps {
  open: boolean;
  cupo: any | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const CupoFormDialog: React.FC<CupoFormDialogProps> = ({
  open,
  cupo,
  onClose,
  onSuccess,
}) => {
  const { createCupo, updateCupo } = useCupos();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para opciones
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    periodo_academico_id: '',
    grado_id: '',
    turno_id: '',
    cupos_totales: '',
    activo: true,
    observaciones: '',
  });

  const [errors, setErrors] = useState<any>({});

  // =============================================
  // CARGAR OPCIONES
  // =============================================
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [periodosRes, gradosRes, turnosRes] = await Promise.all([
          api.get('/public/academicos/periodo-activo'),
          api.get('/public/academicos/grados'),
          api.get('/public/academicos/turnos'),
        ]);

        const periodo = periodosRes.data.data?.periodo;
        setPeriodos(periodo ? [periodo] : []);
        setGrados(gradosRes.data.data?.grados || []);
        setTurnos(turnosRes.data.data?.turnos || []);
        
        // Si hay periodo activo, seleccionarlo por defecto
        if (periodo && !cupo) {
          setFormData(prev => ({ ...prev, periodo_academico_id: periodo.id }));
        }
      } catch (error) {
        console.error('Error al cargar opciones:', error);
      }
    };

    if (open) {
      loadOptions();
    }
  }, [open, cupo]);

  // =============================================
  // INICIALIZAR FORMULARIO
  // =============================================
  useEffect(() => {
    if (cupo) {
      setFormData({
        periodo_academico_id: cupo.periodo_academico_id || '',
        grado_id: cupo.grado_id || '',
        turno_id: cupo.turno_id || '',
        cupos_totales: cupo.cupos_totales || '',
        activo: cupo.activo ?? true,
        observaciones: cupo.observaciones || '',
      });
    } else {
      setFormData({
        periodo_academico_id: '',
        grado_id: '',
        turno_id: '',
        cupos_totales: '',
        activo: true,
        observaciones: '',
      });
    }
    setErrors({});
    setError(null);
  }, [cupo, open]);

  // =============================================
  // VALIDAR FORMULARIO
  // =============================================
  const validate = () => {
    const newErrors: any = {};

    if (!formData.periodo_academico_id) {
      newErrors.periodo_academico_id = 'Seleccione un periodo académico';
    }
    if (!formData.grado_id) {
      newErrors.grado_id = 'Seleccione un grado';
    }
    if (!formData.turno_id) {
      newErrors.turno_id = 'Seleccione un turno';
    }
    if (!formData.cupos_totales || parseInt(formData.cupos_totales) < 1) {
      newErrors.cupos_totales = 'Ingrese cupos totales (mínimo 1)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================================
  // ENVIAR FORMULARIO
  // =============================================
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const data = {
        periodo_academico_id: parseInt(formData.periodo_academico_id),
        grado_id: parseInt(formData.grado_id),
        turno_id: parseInt(formData.turno_id),
        cupos_totales: parseInt(formData.cupos_totales),
        activo: formData.activo,
        observaciones: formData.observaciones || undefined,
      };

      if (cupo) {
        // Actualizar
        await updateCupo(cupo.id, {
          cupos_totales: data.cupos_totales,
          activo: data.activo,
          observaciones: data.observaciones,
        });
        onSuccess('Cupo actualizado correctamente');
      } else {
        // Crear
        await createCupo(data);
        onSuccess('Cupo creado correctamente');
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el cupo');
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // HANDLERS
  // =============================================
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4 }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            {cupo ? 'Editar Cupo' : 'Crear Nuevo Cupo'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* PERIODO ACADÉMICO */}
          <FormControl fullWidth error={!!errors.periodo_academico_id} disabled={!!cupo}>
            <InputLabel>Periodo Académico *</InputLabel>
            <Select
              value={formData.periodo_academico_id}
              onChange={(e) => handleChange('periodo_academico_id', e.target.value)}
              label="Periodo Académico *"
            >
              {periodos.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombre} ({p.activo ? 'Activo' : 'Inactivo'})
                </MenuItem>
              ))}
            </Select>
            {errors.periodo_academico_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.periodo_academico_id}
              </Typography>
            )}
          </FormControl>

          {/* GRADO */}
          <FormControl fullWidth error={!!errors.grado_id} disabled={!!cupo}>
            <InputLabel>Grado *</InputLabel>
            <Select
              value={formData.grado_id}
              onChange={(e) => handleChange('grado_id', e.target.value)}
              label="Grado *"
            >
              {grados.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.nivel_nombre} - {g.nombre}
                </MenuItem>
              ))}
            </Select>
            {errors.grado_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.grado_id}
              </Typography>
            )}
          </FormControl>

          {/* TURNO */}
          <FormControl fullWidth error={!!errors.turno_id} disabled={!!cupo}>
            <InputLabel>Turno *</InputLabel>
            <Select
              value={formData.turno_id}
              onChange={(e) => handleChange('turno_id', e.target.value)}
              label="Turno *"
            >
              {turnos.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.nombre} ({t.hora_inicio} - {t.hora_fin})
                </MenuItem>
              ))}
            </Select>
            {errors.turno_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.turno_id}
              </Typography>
            )}
          </FormControl>

          {/* CUPOS TOTALES */}
          <TextField
            fullWidth
            type="number"
            label="Cupos Totales *"
            value={formData.cupos_totales}
            onChange={(e) => handleChange('cupos_totales', e.target.value)}
            error={!!errors.cupos_totales}
            helperText={errors.cupos_totales || 'Cantidad máxima de estudiantes'}
            inputProps={{ min: 1, max: 100 }}
          />

          {/* ACTIVO */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.activo}
                onChange={(e) => handleChange('activo', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Cupo Activo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Los cupos inactivos no estarán disponibles para preinscripciones
                </Typography>
              </Box>
            }
          />

          {/* OBSERVACIONES */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            placeholder="Notas adicionales sobre este cupo..."
          />

          {/* INFO ADICIONAL AL EDITAR */}
          {cupo && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Información actual:
              </Typography>
              <Typography variant="caption" display="block">
                • Cupos ocupados: {cupo.cupos_ocupados}
              </Typography>
              <Typography variant="caption" display="block">
                • Cupos disponibles: {cupo.cupos_disponibles}
              </Typography>
              {cupo.cupos_ocupados > 0 && (
                <Typography variant="caption" display="block" color="warning.main" sx={{ mt: 1 }}>
                  ⚠️ No puede reducir los cupos por debajo de {cupo.cupos_ocupados}
                </Typography>
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{ 
            borderRadius: 2,
            minWidth: 120,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {loading ? 'Guardando...' : cupo ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};