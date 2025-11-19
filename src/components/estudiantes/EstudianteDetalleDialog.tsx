// components/estudiantes/EstudianteDetalleDialog.tsx
'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  IconButton,
  Avatar,
  useTheme,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import NotesIcon from '@mui/icons-material/Notes';
import { Estudiante } from '../../services/estudiantesService';

interface Props {
  open: boolean;
  onClose: () => void;
  estudiante: Estudiante | null;
}

export default function EstudianteDetalleDialog({ open, onClose, estudiante }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!estudiante) return null;

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
      <Box sx={{ color: 'primary.main', mt: 0.5 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value || 'No especificado'}
        </Typography>
      </Box>
    </Box>
  );

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: isDark ? '#1a1f2e' : '#fff',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Detalles del Estudiante
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Encabezado con foto y datos principales */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            background: isDark
              ? 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)'
              : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: isDark ? '#30363d' : '#90caf9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={estudiante.foto_url || '/default-avatar.png'}
              alt={estudiante.nombres}
              sx={{
                width: 100,
                height: 100,
                border: '4px solid #0288d1',
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {estudiante.nombres} {estudiante.apellidos}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip
                  label={estudiante.genero}
                  size="small"
                  color={estudiante.genero === 'Masculino' ? 'primary' : 'secondary'}
                />
                <Chip
                  label={estudiante.activo ? 'Activo' : 'Inactivo'}
                  size="small"
                  color={estudiante.activo ? 'success' : 'error'}
                />
                <Chip
                  label={`${calcularEdad(estudiante.fecha_nacimiento)} años`}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Documento: {estudiante.tipo_documento} - {estudiante.documento_identidad}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" />
              Información Personal
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              icon={<CakeIcon fontSize="small" />}
              label="Fecha de Nacimiento"
              value={new Date(estudiante.fecha_nacimiento).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              icon={<BadgeIcon fontSize="small" />}
              label="Tipo de Documento"
              value={estudiante.tipo_documento}
            />
          </Grid>

          {/* Contacto */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <PhoneIcon fontSize="small" />
              Información de Contacto
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              icon={<PhoneIcon fontSize="small" />}
              label="Teléfono"
              value={estudiante.telefono || 'No especificado'}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              icon={<EmailIcon fontSize="small" />}
              label="Email"
              value={estudiante.email || 'No especificado'}
            />
          </Grid>

          <Grid item xs={12}>
            <InfoItem
              icon={<HomeIcon fontSize="small" />}
              label="Dirección"
              value={estudiante.direccion || 'No especificada'}
            />
          </Grid>

          {/* Datos del Padre */}
          {(estudiante.nombre_padre || estudiante.telefono_padre || estudiante.email_padre) && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <FamilyRestroomIcon fontSize="small" />
                  Información del Padre
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <InfoItem
                  icon={<PersonIcon fontSize="small" />}
                  label="Nombre"
                  value={estudiante.nombre_padre || 'No especificado'}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <InfoItem
                  icon={<PhoneIcon fontSize="small" />}
                  label="Teléfono"
                  value={estudiante.telefono_padre || 'No especificado'}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <InfoItem
                  icon={<EmailIcon fontSize="small" />}
                  label="Email"
                  value={estudiante.email_padre || 'No especificado'}
                />
              </Grid>
            </>
          )}

          {/* Datos de la Madre */}
          {(estudiante.nombre_madre || estudiante.telefono_madre || estudiante.email_madre) && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <FamilyRestroomIcon fontSize="small" />
                  Información de la Madre
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <InfoItem
                  icon={<PersonIcon fontSize="small" />}
                  label="Nombre"
                  value={estudiante.nombre_madre || 'No especificado'}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <InfoItem
                  icon={<PhoneIcon fontSize="small" />}
                  label="Teléfono"
                  value={estudiante.telefono_madre || 'No especificado'}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <InfoItem
                  icon={<EmailIcon fontSize="small" />}
                  label="Email"
                  value={estudiante.email_madre || 'No especificado'}
                />
              </Grid>
            </>
          )}

          {/* Contacto de Emergencia */}
          {(estudiante.contacto_emergencia || estudiante.telefono_emergencia) && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <ContactEmergencyIcon fontSize="small" />
                  Contacto de Emergencia
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoItem
                  icon={<PersonIcon fontSize="small" />}
                  label="Nombre"
                  value={estudiante.contacto_emergencia || 'No especificado'}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoItem
                  icon={<PhoneIcon fontSize="small" />}
                  label="Teléfono"
                  value={estudiante.telefono_emergencia || 'No especificado'}
                />
              </Grid>
            </>
          )}

          {/* Observaciones */}
          {estudiante.observaciones && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <NotesIcon fontSize="small" />
                  Observaciones
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: isDark ? '#0d1117' : '#f5f5f5',
                    border: '1px solid',
                    borderColor: isDark ? '#30363d' : '#e0e0e0',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {estudiante.observaciones}
                  </Typography>
                </Paper>
              </Grid>
            </>
          )}

          {/* Metadatos */}
          <Grid item xs={12}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: '1px solid',
                borderColor: isDark ? '#30363d' : '#e0e0e0',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Creado: {new Date(estudiante.created_at).toLocaleString('es-ES')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ background: 'linear-gradient(90deg, #0288d1, #01579b)' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}