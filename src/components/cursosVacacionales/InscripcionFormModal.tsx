// components/cursosVacacionales/InscripcionFormModal.tsx
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
  useTheme,
  Typography,
  Divider,
  Alert,
  Box,
} from '@mui/material';
import { useInscripcionesVacacionales, useCursosVacacionales } from '@/hooks/useCursosVacacionales';
import { FormInscripcionPublica } from '@/types/cursoVacacionalTypes';

interface InscripcionFormModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormErrors {
  curso_vacacional_id?: string;
  nombres?: string;
  apellido_paterno?: string;
  fecha_nacimiento?: string;
  nombre_tutor?: string;
  telefono_tutor?: string;
  monto_pagado?: string;
}

export const InscripcionFormModal: React.FC<InscripcionFormModalProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { inscribir, isInscribiendo } = useInscripcionesVacacionales();
  const { cursos } = useCursosVacacionales({ activo: true, con_cupos: true });

  // Estados del formulario - Datos del Estudiante
  const [cursoVacacionalId, setCursoVacacionalId] = useState<number | ''>('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [ci, setCi] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'femenino' | 'otro' | ''>('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  // Estados del formulario - Datos del Tutor
  const [nombreTutor, setNombreTutor] = useState('');
  const [telefonoTutor, setTelefonoTutor] = useState('');
  const [emailTutor, setEmailTutor] = useState('');
  const [parentescoTutor, setParentescoTutor] = useState('');

  // Estados del formulario - Datos de Pago
  const [montoPagado, setMontoPagado] = useState<number | ''>('');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any>(null);

  // Actualizar curso seleccionado y costo
  useEffect(() => {
    if (cursoVacacionalId) {
      const curso = cursos.find((c) => c.id === cursoVacacionalId);
      setCursoSeleccionado(curso);
      if (curso) {
        setMontoPagado(curso.costo);
      }
    } else {
      setCursoSeleccionado(null);
      setMontoPagado('');
    }
  }, [cursoVacacionalId, cursos]);

  // Resetear formulario
  useEffect(() => {
    if (open) {
      // Resetear todos los campos
      setCursoVacacionalId('');
      setNombres('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      setFechaNacimiento('');
      setCi('');
      setGenero('');
      setTelefono('');
      setEmail('');
      setNombreTutor('');
      setTelefonoTutor('');
      setEmailTutor('');
      setParentescoTutor('');
      setMontoPagado('');
      setNumeroComprobante('');
      setFechaPago(new Date().toISOString().split('T')[0]);
      setObservaciones('');
      setErrors({});
      setCursoSeleccionado(null);
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!cursoVacacionalId) {
      newErrors.curso_vacacional_id = 'Debe seleccionar un curso';
    }

    if (!nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
    }

    if (!apellidoPaterno.trim()) {
      newErrors.apellido_paterno = 'El apellido paterno es requerido';
    }

    if (!fechaNacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    }

    if (!nombreTutor.trim()) {
      newErrors.nombre_tutor = 'El nombre del tutor es requerido';
    }

    if (!telefonoTutor.trim()) {
      newErrors.telefono_tutor = 'El teléfono del tutor es requerido';
    }

    if (!montoPagado || montoPagado <= 0) {
      newErrors.monto_pagado = 'El monto pagado debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const inscripcionData: FormInscripcionPublica = {
      curso_vacacional_id: cursoVacacionalId as number,
      nombres: nombres.trim(),
      apellido_paterno: apellidoPaterno.trim(),
      apellido_materno: apellidoMaterno.trim() || undefined,
      fecha_nacimiento: fechaNacimiento,
      ci: ci.trim() || undefined,
      genero: genero || undefined,
      telefono: telefono.trim() || undefined,
      email: email.trim() || undefined,
      nombre_tutor: nombreTutor.trim(),
      telefono_tutor: telefonoTutor.trim(),
      email_tutor: emailTutor.trim() || undefined,
      parentesco_tutor: parentescoTutor.trim() || undefined,
      monto_pagado: montoPagado as number,
      numero_comprobante: numeroComprobante.trim() || undefined,
      fecha_pago: fechaPago,
      observaciones: observaciones.trim() || undefined,
    };

    inscribir(inscripcionData);
    onClose();
  };

  const handleClose = () => {
    if (!isInscribiendo) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
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
        Nueva Inscripción
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Selección de Curso */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Curso
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                select
                label="Curso Vacacional"
                fullWidth
                value={cursoVacacionalId}
                onChange={(e) => setCursoVacacionalId(e.target.value ? parseInt(e.target.value) : '')}
                error={!!errors.curso_vacacional_id}
                helperText={errors.curso_vacacional_id || 'Solo se muestran cursos activos con cupos disponibles'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="">Seleccionar curso</MenuItem>
                {cursos.map((curso) => (
                  <MenuItem key={curso.id} value={curso.id}>
                    {curso.nombre} - {curso.cupos_disponibles} cupos disponibles (Bs. {curso.costo})
                  </MenuItem>
                ))}
              </TextField>

              {cursoSeleccionado && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {cursoSeleccionado.nombre}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Cupos: {cursoSeleccionado.cupos_ocupados} / {cursoSeleccionado.cupos_totales}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Costo: Bs. {cursoSeleccionado.costo}
                  </Typography>
                </Alert>
              )}
            </Grid>

            {/* Datos del Estudiante */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Datos del Estudiante
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                label="Nombres"
                fullWidth
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                error={!!errors.nombres}
                helperText={errors.nombres}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                label="Apellido Paterno"
                fullWidth
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                error={!!errors.apellido_paterno}
                helperText={errors.apellido_paterno}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                label="Apellido Materno (Opcional)"
                fullWidth
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                type="date"
                label="Fecha de Nacimiento"
                fullWidth
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                error={!!errors.fecha_nacimiento}
                helperText={errors.fecha_nacimiento}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                label="CI (Opcional)"
                fullWidth
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                select
                label="Género (Opcional)"
                fullWidth
                value={genero}
                onChange={(e) => setGenero(e.target.value as any)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                <MenuItem value="">No especificar</MenuItem>
                <MenuItem value="masculino">Masculino</MenuItem>
                <MenuItem value="femenino">Femenino</MenuItem>
                <MenuItem value="otro">Otro</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                label="Teléfono (Opcional)"
                fullWidth
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                label="Email (Opcional)"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* Datos del Tutor */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Datos del Tutor
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                label="Nombre del Tutor"
                fullWidth
                value={nombreTutor}
                onChange={(e) => setNombreTutor(e.target.value)}
                error={!!errors.nombre_tutor}
                helperText={errors.nombre_tutor}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                label="Teléfono del Tutor"
                fullWidth
                value={telefonoTutor}
                onChange={(e) => setTelefonoTutor(e.target.value)}
                error={!!errors.telefono_tutor}
                helperText={errors.telefono_tutor}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                label="Email del Tutor (Opcional)"
                type="email"
                fullWidth
                value={emailTutor}
                onChange={(e) => setEmailTutor(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                label="Parentesco (Opcional)"
                fullWidth
                value={parentescoTutor}
                onChange={(e) => setParentescoTutor(e.target.value)}
                placeholder="Ej: Padre, Madre, Tío..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* Datos de Pago */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600, color: isDark ? '#facc15' : '#0288d1' }}>
                Información de Pago
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                type="number"
                label="Monto Pagado (Bs.)"
                fullWidth
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value ? parseFloat(e.target.value) : '')}
                error={!!errors.monto_pagado}
                helperText={errors.monto_pagado}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                label="Número de Comprobante (Opcional)"
                fullWidth
                value={numeroComprobante}
                onChange={(e) => setNumeroComprobante(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                type="date"
                label="Fecha de Pago"
                fullWidth
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                label="Observaciones (Opcional)"
                fullWidth
                multiline
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre la inscripción..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={isInscribiendo}
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
            disabled={isInscribiendo}
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
            {isInscribiendo ? 'Inscribiendo...' : 'Inscribir'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};