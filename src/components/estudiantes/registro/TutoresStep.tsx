// components/estudiantes/registro/TutoresStep.tsx
import React, { useState } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Person as PersonIcon } from '@mui/icons-material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { registroCompletoService } from '@/services/estudiantesService';
import { CIScanner } from '@/components/shared/CIScanner';
import { CIData } from '@/services/ocrService';

interface Tutor {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  fecha_nacimiento: Dayjs | null;
  telefono: string;
  celular: string;
  email: string;
  direccion: string;
  ocupacion: string;
  parentesco: string;
  estado_civil: string;
  es_tutor_principal: boolean;
  vive_con_estudiante: boolean;
  autorizado_recoger: boolean;
  puede_autorizar_salidas: boolean;
  recibe_notificaciones: boolean;
  prioridad_contacto: number;
  observaciones: string;
  es_existente?: boolean;
}

interface TutoresStepProps {
  tutores: Tutor[];
  onChange: (tutores: Tutor[]) => void;
  tutorExistenteNombre?: string;
}

const parentescoOptions = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'abuelo', label: 'Abuelo/a' },
  { value: 'tio', label: 'Tío/a' },
  { value: 'tutor_legal', label: 'Tutor Legal' },
  { value: 'otro', label: 'Otro' },
];

const estadosCiviles = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
  { value: 'union_libre', label: 'Unión Libre' },
];

export const TutoresStep: React.FC<TutoresStepProps> = ({ tutores, onChange, tutorExistenteNombre }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [buscandoCI, setBuscandoCI] = useState<Record<number, boolean>>({});
  const [estadoCI, setEstadoCI] = useState<Record<number, { encontrado: boolean; mensaje: string }>>({});

  const handleTutorChange = (index: number, field: keyof Tutor, value: any) => {
    const newTutores = [...tutores];
    newTutores[index] = {
      ...newTutores[index],
      [field]: value,
      ...(field === 'ci' ? { es_existente: false } : {}),
    };
    onChange(newTutores);
    if (field === 'ci') {
      setEstadoCI((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const buscarTutorPorCI = async (index: number) => {
    const ci = tutores[index]?.ci?.trim();
    if (!ci || ci.length < 4 || buscandoCI[index]) return;

    setBuscandoCI((prev) => ({ ...prev, [index]: true }));
    try {
      const resultado = await registroCompletoService.buscarPadrePorCI(ci);
      const padre = resultado.data?.padre;
      if (!resultado.success || !padre) return;

      const nuevos = [...tutores];
      nuevos[index] = {
        ...nuevos[index],
        nombres: padre.nombres,
        apellido_paterno: padre.apellido_paterno,
        apellido_materno: padre.apellido_materno || '',
        telefono: padre.telefono || '',
        celular: padre.celular || '',
        email: padre.email || '',
        direccion: padre.direccion || '',
        ocupacion: padre.ocupacion || '',
        es_existente: true,
      };
      onChange(nuevos);
      setEstadoCI((prev) => ({
        ...prev,
        [index]: { encontrado: true, mensaje: `Tutor existente: ${padre.nombres} ${padre.apellido_paterno}. Sus datos se reutilizarán.` },
      }));
    } catch {
      setEstadoCI((prev) => ({
        ...prev,
        [index]: { encontrado: false, mensaje: 'CI nuevo: complete los datos para crear al tutor.' },
      }));
    } finally {
      setBuscandoCI((prev) => ({ ...prev, [index]: false }));
    }
  };

  const agregarTutor = () => {
    onChange([
      ...tutores,
      {
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        fecha_nacimiento: null,
        telefono: '',
        celular: '',
        email: '',
        direccion: '',
        ocupacion: '',
        parentesco: '',
        estado_civil: '',
        es_tutor_principal: false,
        vive_con_estudiante: true,
        autorizado_recoger: true,
        puede_autorizar_salidas: true,
        recibe_notificaciones: true,
        prioridad_contacto: tutores.length + 1,
        observaciones: '',
      },
    ]);
  };

  const eliminarTutor = (index: number) => {
    if (tutores.length > 1) {
      onChange(tutores.filter((_, i) => i !== index));
    }
  };

  const fieldStyle = {
    width: '100%',
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontWeight: 500,
      fontSize: '0.95rem',
      '&.Mui-focused': {
        color: isDark ? '#facc15' : '#0288d1',
      },
    },
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      transition: '0.2s ease',
      border: '1px solid transparent',
      '&:hover': {
        borderColor: isDark ? '#facc15' : '#0288d1',
      },
      '&.Mui-focused': {
        borderColor: isDark ? '#facc15' : '#0288d1',
        boxShadow: `0 0 0 2px ${isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.25)'}`,
      },
    },
    '& .MuiInputBase-input': {
      color: isDark ? '#fff' : '#000',
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 4,
            p: 2,
            borderRadius: 3,
            background: isDark ? 'rgba(250, 204, 21, 0.08)' : 'rgba(2, 136, 209, 0.08)',
            transition: '0.3s ease',
          }}
        >
          <PersonIcon
            sx={{
              fontSize: 38,
              color: isDark ? '#facc15' : '#0288d1',
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))',
            }}
          />
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: isDark ? '#facc15' : '#0288d1',
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            Información de Padre de Familia/Tutores
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={agregarTutor}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
          }}
        >
          Agregar Tutor
        </Button>
      </Box>

      {tutorExistenteNombre && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {tutorExistenteNombre} ya quedará relacionado con el estudiante. Agrega otro tutor solo si corresponde.
        </Alert>
      )}

      {tutores.map((tutor, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '16px',
            border: '2px solid',
            borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
            position: 'relative',
          }}
        >
          {tutores.length > 1 && (
            <IconButton
              onClick={() => eliminarTutor(index)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#ef4444',
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}

          <Typography variant="h6" fontWeight={700} mb={2}>
            Tutor #{index + 1}
          </Typography>

          {/* Scanner de Cédula del Tutor */}
          <CIScanner
            label="Escanear Cédula del Tutor"
            onDatosExtraidos={(datos: CIData) => {
              const nuevos = [...tutores];
              const updates: Partial<Tutor> = {
                ci: datos.ci || tutores[index].ci,
                nombres: datos.nombres || tutores[index].nombres,
                apellido_paterno: datos.apellido_paterno || tutores[index].apellido_paterno,
                apellido_materno: datos.apellido_materno || tutores[index].apellido_materno,
                direccion: datos.direccion || tutores[index].direccion,
                ocupacion: datos.ocupacion || tutores[index].ocupacion,
                estado_civil: datos.estado_civil || tutores[index].estado_civil,
              };
              if (datos.fecha_nacimiento) {
                const parsed = dayjs(datos.fecha_nacimiento, 'DD/MM/YYYY', true);
                if (parsed.isValid()) updates.fecha_nacimiento = parsed;
              }
              nuevos[index] = { ...nuevos[index], ...updates };
              onChange(nuevos);
            }}
          />

          <Grid container spacing={2}>
            <Grid size={{xs:12, md:6}} >
              <TextField
                fullWidth
                label="Nombres"
                value={tutor.nombres}
                onChange={(e) => handleTutorChange(index, 'nombres', e.target.value)}
                sx={fieldStyle}
                required
              />
            </Grid>
            <Grid size={{xs:12, md:3}} >
              <TextField
                fullWidth
                label="Apellido Paterno"
                value={tutor.apellido_paterno}
                onChange={(e) => handleTutorChange(index, 'apellido_paterno', e.target.value)}
                sx={fieldStyle}
                required
              />
            </Grid>
            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                label="Apellido Materno"
                value={tutor.apellido_materno}
                onChange={(e) => handleTutorChange(index, 'apellido_materno', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                size="small"
                label="CI"
                value={tutor.ci}
                onChange={(e) => handleTutorChange(index, 'ci', e.target.value)}
                onBlur={() => buscarTutorPorCI(index)}
                sx={fieldStyle}
                required
                helperText={buscandoCI[index] ? 'Buscando tutor...' : 'Al salir del campo, se buscará automáticamente'}
                slotProps={{
                  input: {
                    endAdornment: buscandoCI[index] ? <CircularProgress size={18} /> : undefined,
                  },
                }}
              />
            </Grid>
            {estadoCI[index] && (
              <Grid size={{ xs: 12 }}>
                <Alert severity={estadoCI[index].encontrado ? 'success' : 'info'}>
                  {estadoCI[index].mensaje}
                </Alert>
              </Grid>
            )}
            <Grid size={{xs:12, md:3}}>
              <DatePicker
                format="DD/MM/YYYY"
                label="Fecha de Nacimiento"
                value={tutor.fecha_nacimiento}
                onChange={(date) => handleTutorChange(index, 'fecha_nacimiento', date)}
                sx={fieldStyle}
                slotProps={{ textField: { fullWidth: true} }}
              />
            </Grid>
            <Grid size={{xs:12, md:3}}>
              <TextField
                select
                fullWidth
                label="Parentesco"
                value={tutor.parentesco}
                onChange={(e) => handleTutorChange(index, 'parentesco', e.target.value)}
                sx={fieldStyle}
              >
                {parentescoOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                label="Teléfono"
                value={tutor.telefono}
                onChange={(e) => handleTutorChange(index, 'telefono', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                label="Celular"
                value={tutor.celular}
                onChange={(e) => handleTutorChange(index, 'celular', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={tutor.email}
                onChange={(e) => handleTutorChange(index, 'email', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="Ocupación"
                value={tutor.ocupacion}
                onChange={(e) => handleTutorChange(index, 'ocupacion', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:4}}>
              <TextField
                select
                fullWidth
                label="Estado Civil"
                value={tutor.estado_civil}
                onChange={(e) => handleTutorChange(index, 'estado_civil', e.target.value)}
                sx={fieldStyle}
              >
                {estadosCiviles.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{xs:12, md:8}}>
              <TextField
                fullWidth
                label="Dirección"
                value={tutor.direccion}
                onChange={(e) => handleTutorChange(index, 'direccion', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                type="number"
                label="Prioridad de Contacto"
                value={tutor.prioridad_contacto}
                onChange={(e) =>
                  handleTutorChange(index, 'prioridad_contacto', parseInt(e.target.value) || 1)
                }
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:9}}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Observaciones"
                value={tutor.observaciones}
                onChange={(e) => handleTutorChange(index, 'observaciones', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};
