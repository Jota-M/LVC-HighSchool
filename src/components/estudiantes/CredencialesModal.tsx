// components/estudiantes/CredencialesModal.tsx
import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Divider,
  Alert,
  Chip,
  useTheme,
  Grid,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  VpnKey as KeyIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useReactToPrint } from 'react-to-print';
import { RegistroCompletoResponse } from '@/types/estudianteTypes';

interface CredencialesModalProps {
  open: boolean;
  onClose: () => void;
  data: RegistroCompletoResponse['data'];
}

export const CredencialesModal: React.FC<CredencialesModalProps> = ({ open, onClose, data }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const printRef = useRef<HTMLDivElement>(null);

  const isDark = theme.palette.mode === 'dark';
  const esMultiple = data.modo === 'multiple';

  const handlePrint: any = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Credenciales_${data.estudiantes.map((e) => e.codigo).join('_')}`,
  });

  const copiarTexto = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    enqueueSnackbar(`${label} copiado al portapapeles`, { variant: 'success' });
  };

  const copiarTodasLasCredenciales = () => {
    let texto = '🔐 CREDENCIALES DE ACCESO\n\n';
    texto += `📅 Modo de Registro: ${data.modo.toUpperCase()}\n\n`;

    // Estudiantes
    texto += `📚 ESTUDIANTE${esMultiple ? 'S' : ''} REGISTRADO${esMultiple ? 'S' : ''}:\n\n`;
    data.estudiantes.forEach((est, index) => {
      texto += `${esMultiple ? `${index + 1}. ` : ''}${est.nombres} ${est.apellidos}\n`;
      texto += `   Código: ${est.codigo}\n`;
      if (data.credenciales_estudiantes && data.credenciales_estudiantes[index]) {
        texto += `   Usuario: ${data.credenciales_estudiantes[index].username}\n`;
        texto += `   Contraseña: ${data.credenciales_estudiantes[index].password}\n`;
      }
      texto += '\n';
    });

    // Tutores
    if (data.credenciales_tutores && data.credenciales_tutores.length > 0) {
      texto += '👨‍👩‍👧 CREDENCIALES DE TUTORES:\n\n';
      data.credenciales_tutores.forEach((tutor, index) => {
        texto += `${index + 1}. ${tutor.nombre_completo}\n`;
        texto += `   Usuario: ${tutor.username}\n`;
        texto += `   Contraseña: ${tutor.password}\n`;
        texto += `   Email: ${tutor.email}\n\n`;
      });
    }

    texto += '⚠️ IMPORTANTE: Guarde estas credenciales de forma segura.\n';
    texto += 'Las contraseñas deben ser cambiadas en el primer inicio de sesión.';

    navigator.clipboard.writeText(texto);
    enqueueSnackbar('Todas las credenciales copiadas', { variant: 'success' });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
          color: isDark ? '#000' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CheckIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>
            ¡Registro Exitoso!
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: isDark ? '#000' : '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 4, pb: 3 }} ref={printRef}>
        {/* Información general */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
            border: '2px solid',
            borderColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
            borderRadius: '16px',
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            📋 Resumen del Registro
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Modo de Registro
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {data.modo.toUpperCase()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Estudiantes Registrados
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {data.estudiantes.length}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Tutores
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {data.tutores.length}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Alert de seguridad */}
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          <strong>⚠️ Importante:</strong> Guarde estas credenciales de forma segura. Las contraseñas deben ser
          cambiadas en el primer inicio de sesión.
        </Alert>

        {/* Estudiantes registrados */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.05)',
            border: '2px solid',
            borderColor: '#10b981',
            borderRadius: '16px',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <PersonIcon /> Estudiante{esMultiple ? 's' : ''} Registrado{esMultiple ? 's' : ''} (
            {data.estudiantes.length})
          </Typography>

          {data.estudiantes.map((estudiante, index) => (
            <Box
              key={estudiante.id}
              sx={{
                mb: index < data.estudiantes.length - 1 ? 3 : 0,
                pb: index < data.estudiantes.length - 1 ? 3 : 0,
                borderBottom: index < data.estudiantes.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              {esMultiple && (
                <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
                  Estudiante #{index + 1}
                </Typography>
              )}

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Nombre Completo
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {estudiante.nombres} {estudiante.apellidos}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Código
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {estudiante.codigo}
                  </Typography>
                </Grid>
              </Grid>

              {/* Credenciales del estudiante */}
              {data.credenciales_estudiantes && data.credenciales_estudiantes[index] && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid #10b981',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <KeyIcon sx={{ fontSize: 20, color: '#10b981' }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Credenciales de Acceso
                    </Typography>
                    <Chip label="Usuario creado" color="success" size="small" />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Usuario
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          {data.credenciales_estudiantes[index].username}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            copiarTexto(data.credenciales_estudiantes![index].username, 'Usuario')
                          }
                          sx={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
                          }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Contraseña Temporal
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: '#ef4444',
                          }}
                        >
                          {data.credenciales_estudiantes[index].password}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            copiarTexto(data.credenciales_estudiantes![index].password, 'Contraseña')
                          }
                          sx={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
                          }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                        {data.credenciales_estudiantes[index].email}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          ))}
        </Paper>

        {/* Credenciales de tutores */}
        {data.credenciales_tutores && data.credenciales_tutores.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)',
              border: '2px solid',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PeopleIcon /> Credenciales de Tutores ({data.credenciales_tutores.length})
            </Typography>

            {data.credenciales_tutores.map((tutor, index) => (
              <Box key={index}>
                {index > 0 && <Divider sx={{ my: 3 }} />}

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {index + 1}. {tutor.nombre_completo}
                </Typography>

                <Grid container spacing={2} sx={{ pl: 2 }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Usuario
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {tutor.username}
                      </Typography>
                      <IconButton size="small" onClick={() => copiarTexto(tutor.username, 'Usuario')}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Contraseña
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#ef4444' }}
                      >
                        {tutor.password}
                      </Typography>
                      <IconButton size="small" onClick={() => copiarTexto(tutor.password, 'Contraseña')}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                      {tutor.email}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Paper>
        )}

        {/* Matrículas creadas */}
        {data.matriculas && data.matriculas.length > 0 && (
          <Alert
            severity="success"
            icon={<CheckIcon />}
            sx={{
              mt: 3,
              borderRadius: '12px',
              border: '2px solid #10b981',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              ✓ {data.matriculas.length} matrícula{data.matriculas.length > 1 ? 's' : ''} creada
              {data.matriculas.length > 1 ? 's' : ''} exitosamente
            </Typography>
          </Alert>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CopyIcon />}
          onClick={copiarTodasLasCredenciales}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Copiar Todo
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Imprimir
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            color: isDark ? '#000' : '#fff',
            px: 4,
          }}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CredencialesModal;