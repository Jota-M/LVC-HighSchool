// components/cursosVacacionales/CursoFormModal.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  Box,
  IconButton,
  Avatar,
  alpha,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useCursosVacacionales, usePeriodosVacacionales } from '@/hooks/useCursosVacacionales';
import { CursoVacacional, FormCursoVacacional } from '@/types/cursoVacacionalTypes';

interface CursoFormModalProps {
  open: boolean;
  onClose: () => void;
  curso: CursoVacacional | null;
}

interface FormErrors {
  nombre?: string;
  periodo_vacacional_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  cupos_totales?: string;
  costo?: string;
  foto?: string;
}

const diasSemanaOpciones = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export const CursoFormModal: React.FC<CursoFormModalProps> = ({
  open,
  onClose,
  curso,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { crear, actualizar, isCreating, isUpdating } = useCursosVacacionales();
  const { periodos } = usePeriodosVacacionales({ activo: true });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del formulario
  const [periodoVacacionalId, setPeriodoVacacionalId] = useState<number | ''>('');
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [diasSemana, setDiasSemana] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [cuposTotales, setCuposTotales] = useState<number | ''>('');
  const [costo, setCosto] = useState<number | ''>('');
  const [aula, setAula] = useState('');
  const [requisitos, setRequisitos] = useState('');
  const [activo, setActivo] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  // ⬇️ NUEVOS ESTADOS PARA FOTO
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoActualUrl, setFotoActualUrl] = useState<string | null>(null);

  // Resetear formulario
  useEffect(() => {
    if (open) {
      if (curso) {
        setPeriodoVacacionalId(curso.periodo_vacacional_id);
        setNombre(curso.nombre);
        setCodigo(curso.codigo || '');
        setDescripcion(curso.descripcion || '');
        setFechaInicio(curso.fecha_inicio.split('T')[0]);
        setFechaFin(curso.fecha_fin.split('T')[0]);
        setDiasSemana(curso.dias_semana ? curso.dias_semana.split(',') : []);
        setHoraInicio(curso.hora_inicio || '');
        setHoraFin(curso.hora_fin || '');
        setCuposTotales(curso.cupos_totales);
        setCosto(curso.costo);
        setAula(curso.aula || '');
        setRequisitos(curso.requisitos || '');
        setActivo(curso.activo);
        
        // ⬇️ Cargar foto actual
        setFotoActualUrl(curso.foto_url || null);
        setFoto(null);
        setFotoPreview(null);
      } else {
        // Resetear a valores por defecto
        setPeriodoVacacionalId('');
        setNombre('');
        setCodigo('');
        setDescripcion('');
        setFechaInicio('');
        setFechaFin('');
        setDiasSemana([]);
        setHoraInicio('');
        setHoraFin('');
        setCuposTotales('');
        setCosto('');
        setAula('');
        setRequisitos('');
        setActivo(true);
        setFoto(null);
        setFotoPreview(null);
        setFotoActualUrl(null);
      }
      setErrors({});
    }
  }, [curso, open]);

  // ⬇️ MANEJAR SELECCIÓN DE FOTO
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, foto: 'Solo se permiten imágenes (jpg, png, gif, webp)' }));
      return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, foto: 'La imagen es muy grande (máximo 5MB)' }));
      return;
    }

    // Todo bien
    setErrors((prev) => ({ ...prev, foto: undefined }));
    setFoto(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ⬇️ ELIMINAR FOTO SELECCIONADA
  const handleRemoverFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!periodoVacacionalId) {
      newErrors.periodo_vacacional_id = 'Debe seleccionar un periodo';
    }

    if (!fechaInicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!fechaFin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
      newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (!cuposTotales || cuposTotales <= 0) {
      newErrors.cupos_totales = 'Los cupos deben ser mayor a 0';
    }

    if (!costo || costo <= 0) {
      newErrors.costo = 'El costo debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const cursoData: FormCursoVacacional = {
      periodo_vacacional_id: periodoVacacionalId as number,
      nombre: nombre.trim(),
      codigo: codigo.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      dias_semana: diasSemana.length > 0 ? diasSemana.join(',') : undefined,
      hora_inicio: horaInicio || undefined,
      hora_fin: horaFin || undefined,
      cupos_totales: cuposTotales as number,
      costo: costo as number,
      aula: aula.trim() || undefined,
      requisitos: requisitos.trim() || undefined,
      activo,
      foto: foto || undefined, // ⬅️ Agregar foto
    };

    if (curso) {
      actualizar({ id: curso.id, data: cursoData });
    } else {
      crear(cursoData);
    }

    onClose();
  };

  const handleClose = () => {
    if (!isCreating && !isUpdating) {
      onClose();
    }
  };

  const handleDiaToggle = (dia: string) => {
    setDiasSemana((prev) => {
      if (prev.includes(dia)) {
        return prev.filter((d) => d !== dia);
      } else {
        return [...prev, dia];
      }
    });
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
        {curso ? 'Editar Curso Vacacional' : 'Nuevo Curso Vacacional'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Información Básica */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Información Básica
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Periodo Vacacional"
                fullWidth
                value={periodoVacacionalId}
                onChange={(e) => setPeriodoVacacionalId(e.target.value ? parseInt(e.target.value) : '')}
                error={!!errors.periodo_vacacional_id}
                helperText={errors.periodo_vacacional_id}
                disabled={!!curso}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="">Seleccionar periodo</MenuItem>
                {periodos.map((periodo) => (
                  <MenuItem key={periodo.id} value={periodo.id}>
                    {periodo.nombre} - {periodo.tipo === 'verano' ? '☀️ Verano' : '❄️ Invierno'} {periodo.anio}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Nombre del Curso"
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                error={!!errors.nombre}
                helperText={errors.nombre}
                placeholder="Ej: Matemáticas Avanzadas"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Código (Opcional)"
                fullWidth
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej: MAT-ADV-01"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Descripción (Opcional)"
                fullWidth
                multiline
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del curso..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* ⬇️ SECCIÓN DE FOTO */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Foto del Curso (Opcional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Preview de foto actual (al editar) */}
                {curso && fotoActualUrl && !fotoPreview && (
                  <Box
                    sx={{
                      position: 'relative',
                      width: 120,
                      height: 120,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                    }}
                  >
                    <img
                      src={fotoActualUrl}
                      alt="Foto actual"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        p: 0.5,
                        textAlign: 'center',
                      }}
                    >
                      Foto actual
                    </Typography>
                  </Box>
                )}

                {/* Preview de nueva foto */}
                {fotoPreview && (
                  <Box
                    sx={{
                      position: 'relative',
                      width: 120,
                      height: 120,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `2px solid ${isDark ? '#facc15' : '#0288d1'}`,
                    }}
                  >
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleRemoverFoto}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: 'rgba(239, 68, 68, 1)',
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {/* Botón para subir foto */}
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFotoChange}
                    style={{ display: 'none' }}
                    id="foto-upload"
                  />
                  <label htmlFor="foto-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      fullWidth
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                        borderColor: isDark ? '#facc15' : '#0288d1',
                        color: isDark ? '#facc15' : '#0288d1',
                        '&:hover': {
                          borderColor: isDark ? '#f59e0b' : '#01579b',
                          bgcolor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                        },
                      }}
                    >
                      {fotoPreview ? 'Cambiar Foto' : curso && fotoActualUrl ? 'Cambiar Foto' : 'Subir Foto'}
                    </Button>
                  </label>
                  {errors.foto && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.foto}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Máximo 5MB. Formatos: JPG, PNG, GIF, WEBP
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Fechas y Horarios */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Fechas y Horarios
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="date"
                label="Fecha de Inicio"
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="date"
                label="Fecha de Fin"
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

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Días de la Semana (Opcional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {diasSemanaOpciones.map((dia) => (
                  <Chip
                    key={dia}
                    label={dia}
                    onClick={() => handleDiaToggle(dia)}
                    color={diasSemana.includes(dia) ? 'primary' : 'default'}
                    variant={diasSemana.includes(dia) ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="time"
                label="Hora de Inicio (Opcional)"
                fullWidth
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="time"
                label="Hora de Fin (Opcional)"
                fullWidth
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* Cupos y Costos */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Cupos y Costos
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="number"
                label="Cupos Totales"
                fullWidth
                value={cuposTotales}
                onChange={(e) => setCuposTotales(e.target.value ? parseInt(e.target.value) : '')}
                error={!!errors.cupos_totales}
                helperText={errors.cupos_totales}
                inputProps={{ min: 1 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="number"
                label="Costo (Bs.)"
                fullWidth
                value={costo}
                onChange={(e) => setCosto(e.target.value ? parseFloat(e.target.value) : '')}
                error={!!errors.costo}
                helperText={errors.costo}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* Información Adicional */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Información Adicional
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Aula (Opcional)"
                fullWidth
                value={aula}
                onChange={(e) => setAula(e.target.value)}
                placeholder="Ej: Aula 101"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Requisitos (Opcional)"
                fullWidth
                multiline
                rows={2}
                value={requisitos}
                onChange={(e) => setRequisitos(e.target.value)}
                placeholder="Requisitos previos para el curso..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* Estado */}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    color="primary"
                  />
                }
                label="Curso Activo"
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
              ? curso
                ? 'Actualizando...'
                : 'Creando...'
              : curso
              ? 'Actualizar'
              : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};