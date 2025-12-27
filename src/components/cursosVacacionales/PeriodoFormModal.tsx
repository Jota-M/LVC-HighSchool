// components/cursosVacacionales/PeriodoFormModal.tsx
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
  MenuItem,
  FormControlLabel,
  Switch,
  useTheme,
  Typography,
  Divider,
} from '@mui/material';
import { usePeriodosVacacionales } from '@/hooks/useCursosVacacionales';
import { PeriodoVacacional, PeriodoVacacionalCreate } from '@/types/cursoVacacionalTypes';

interface PeriodoFormModalProps {
  open: boolean;
  onClose: () => void;
  periodo: PeriodoVacacional | null;
}

interface FormErrors {
  nombre?: string;
  tipo?: string;
  anio?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_inicio_inscripciones?: string;
  fecha_fin_inscripciones?: string;
}

export const PeriodoFormModal: React.FC<PeriodoFormModalProps> = ({
  open,
  onClose,
  periodo,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { crear, actualizar, isCreating, isUpdating } = usePeriodosVacacionales();

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState<'verano' | 'invierno'>('verano');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [fechaInicioInscripciones, setFechaInicioInscripciones] = useState('');
  const [fechaFinInscripciones, setFechaFinInscripciones] = useState('');
  const [activo, setActivo] = useState(true);
  const [permiteInscripciones, setPermiteInscripciones] = useState(true);
  const [descripcion, setDescripcion] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Resetear formulario cuando cambia el periodo o se abre/cierra
  useEffect(() => {
    if (open) {
      if (periodo) {
        setNombre(periodo.nombre);
        setCodigo(periodo.codigo || '');
        setTipo(periodo.tipo);
        setAnio(periodo.anio);
        setFechaInicio(periodo.fecha_inicio.split('T')[0]);
        setFechaFin(periodo.fecha_fin.split('T')[0]);
        setFechaInicioInscripciones(periodo.fecha_inicio_inscripciones.split('T')[0]);
        setFechaFinInscripciones(periodo.fecha_fin_inscripciones.split('T')[0]);
        setActivo(periodo.activo);
        setPermiteInscripciones(periodo.permite_inscripciones);
        setDescripcion(periodo.descripcion || '');
      } else {
        // Resetear a valores por defecto
        setNombre('');
        setCodigo('');
        setTipo('verano');
        setAnio(new Date().getFullYear());
        setFechaInicio('');
        setFechaFin('');
        setFechaInicioInscripciones('');
        setFechaFinInscripciones('');
        setActivo(true);
        setPermiteInscripciones(true);
        setDescripcion('');
      }
      setErrors({});
    }
  }, [periodo, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!tipo) {
      newErrors.tipo = 'El tipo es requerido';
    }

    if (!anio || anio < 2020 || anio > 2100) {
      newErrors.anio = 'El año debe estar entre 2020 y 2100';
    }

    if (!fechaInicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!fechaFin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (!fechaInicioInscripciones) {
      newErrors.fecha_inicio_inscripciones = 'La fecha de inicio de inscripciones es requerida';
    }

    if (!fechaFinInscripciones) {
      newErrors.fecha_fin_inscripciones = 'La fecha de fin de inscripciones es requerida';
    }

    // Validar que fecha_fin sea posterior a fecha_inicio
    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
      newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    // Validar que fecha_fin_inscripciones sea posterior a fecha_inicio_inscripciones
    if (fechaInicioInscripciones && fechaFinInscripciones && fechaFinInscripciones < fechaInicioInscripciones) {
      newErrors.fecha_fin_inscripciones = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const periodoData: PeriodoVacacionalCreate = {
      nombre: nombre.trim(),
      codigo: codigo.trim() || undefined,
      tipo,
      anio,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      fecha_inicio_inscripciones: fechaInicioInscripciones,
      fecha_fin_inscripciones: fechaFinInscripciones,
      activo,
      permite_inscripciones: permiteInscripciones,
      descripcion: descripcion.trim() || undefined,
    };

    if (periodo) {
      actualizar({ id: periodo.id, data: periodoData });
    } else {
      crear(periodoData);
    }

    onClose();
  };

  const handleClose = () => {
    if (!isCreating && !isUpdating) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
        {periodo ? 'Editar Periodo Vacacional' : 'Nuevo Periodo Vacacional'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Información Básica */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Información Básica
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{xs:12, md:8}}>
              <TextField
                label="Nombre del Periodo"
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                error={!!errors.nombre}
                helperText={errors.nombre}
                placeholder="Ej: Vacaciones de Verano 2025"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                label="Código (Opcional)"
                fullWidth
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej: VER-2025"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                select
                label="Tipo de Periodo"
                fullWidth
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'verano' | 'invierno')}
                error={!!errors.tipo}
                helperText={errors.tipo}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="verano">Verano</MenuItem>
                <MenuItem value="invierno">Invierno</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                type="number"
                label="Año"
                fullWidth
                value={anio}
                onChange={(e) => setAnio(parseInt(e.target.value))}
                error={!!errors.anio}
                helperText={errors.anio}
                inputProps={{ min: 2020, max: 2100 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* Fechas del Periodo */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Fechas del Periodo
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                type="date"
                label="Fecha de Inicio del Curso"
                fullWidth
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                error={!!errors.fecha_inicio}
                helperText={errors.fecha_inicio}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                type="date"
                label="Fecha de Fin del Curso"
                fullWidth
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                error={!!errors.fecha_fin}
                helperText={errors.fecha_fin}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* Fechas de Inscripción */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Periodo de Inscripciones
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                type="date"
                label="Inicio de Inscripciones"
                fullWidth
                value={fechaInicioInscripciones}
                onChange={(e) => setFechaInicioInscripciones(e.target.value)}
                error={!!errors.fecha_inicio_inscripciones}
                helperText={errors.fecha_inicio_inscripciones}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                type="date"
                label="Fin de Inscripciones"
                fullWidth
                value={fechaFinInscripciones}
                onChange={(e) => setFechaFinInscripciones(e.target.value)}
                error={!!errors.fecha_fin_inscripciones}
                helperText={errors.fecha_fin_inscripciones}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* Descripción */}
            <Grid size={{xs:12}}>
              <TextField
                label="Descripción (Opcional)"
                fullWidth
                multiline
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del periodo vacacional..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* Estados */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Configuración
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    color="primary"
                  />
                }
                label="Periodo Activo"
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={permiteInscripciones}
                    onChange={(e) => setPermiteInscripciones(e.target.checked)}
                    color="primary"
                  />
                }
                label="Permite Inscripciones"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={isCreating || isUpdating}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isCreating || isUpdating}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              color: isDark ? '#000' : '#fff',
            }}
          >
            {isCreating || isUpdating
              ? periodo
                ? 'Actualizando...'
                : 'Creando...'
              : periodo
              ? 'Actualizar'
              : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};