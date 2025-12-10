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

interface CredencialesModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    estudiante: {
      id: number;
      codigo: string;
      nombres: string;
      apellidos: string;
    };
    credenciales_estudiante?: {
      username: string;
      password: string;
      debe_cambiar_password: boolean;
    };
    credenciales_tutores?: Array<{
      nombre_completo: string;
      username: string;
      password: string;
      email: string;
    }>;
  };
}

export const CredencialesModal: React.FC<CredencialesModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const printRef = useRef<HTMLDivElement>(null);

  const isDark = theme.palette.mode === 'dark';

  const handlePrint: any = useReactToPrint({
  content: () => printRef.current,
  documentTitle: `Credenciales_${data.estudiante.codigo}`,
});


  const copiarTexto = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    enqueueSnackbar(`${label} copiado al portapapeles`, { variant: 'success' });
  };

  const copiarTodasLasCredenciales = () => {
    let texto = '🔐 CREDENCIALES DE ACCESO\n\n';
    texto += `📚 Estudiante: ${data.estudiante.nombres} ${data.estudiante.apellidos}\n`;
    texto += `📋 Código: ${data.estudiante.codigo}\n\n`;

    if (data.credenciales_estudiante) {
      texto += '👤 CREDENCIALES DEL ESTUDIANTE:\n';
      texto += `Usuario: ${data.credenciales_estudiante.username}\n`;
      texto += `Contraseña: ${data.credenciales_estudiante.password}\n`;
      texto += `⚠️ Debe cambiar contraseña en el primer inicio de sesión\n\n`;
    }

    if (data.credenciales_tutores && data.credenciales_tutores.length > 0) {
      texto += '👨‍👩‍👧 CREDENCIALES DE TUTORES:\n\n';
      data.credenciales_tutores.forEach((tutor, index) => {
        texto += `${index + 1}. ${tutor.nombre_completo}\n`;
        texto += `   Usuario: ${tutor.username}\n`;
        texto += `   Contraseña: ${tutor.password}\n`;
        texto += `   Email: ${tutor.email}\n\n`;
      });
    }

    texto += '⚠️ IMPORTANTE: Guarde estas credenciales de forma segura.';

    navigator.clipboard.writeText(texto);
    enqueueSnackbar('Todas las credenciales copiadas', { variant: 'success' });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)' 
          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
        color: isDark ? '#000' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 3,
      }}>
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
        {/* Información del estudiante */}
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
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon /> Estudiante Registrado
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Nombre:</strong> {data.estudiante.nombres} {data.estudiante.apellidos}
          </Typography>
          <Typography variant="body1">
            <strong>Código:</strong> {data.estudiante.codigo}
          </Typography>
        </Paper>

        {/* Alert de seguridad */}
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          <strong>⚠️ Importante:</strong> Guarde estas credenciales de forma segura. Las contraseñas deben ser cambiadas en el primer inicio de sesión.
        </Alert>

        {/* Credenciales del estudiante */}
        {data.credenciales_estudiante && (
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <KeyIcon /> Credenciales del Estudiante
              </Typography>
              <Chip label="Usuario creado" color="success" size="small" />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Usuario
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: isDark ? '#facc15' : '#0288d1',
                    }}
                  >
                    {data.credenciales_estudiante.username}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => copiarTexto(data.credenciales_estudiante!.username, 'Usuario')}
                    sx={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.2)' }
                    }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Contraseña Temporal
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: '#ef4444',
                    }}
                  >
                    {data.credenciales_estudiante.password}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => copiarTexto(data.credenciales_estudiante!.password, 'Contraseña')}
                    sx={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                    }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

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
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon /> Credenciales de Tutores
            </Typography>

            {data.credenciales_tutores.map((tutor, index) => (
              <Box key={index}>
                {index > 0 && <Divider sx={{ my: 3 }} />}
                
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {index + 1}. {tutor.nombre_completo}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Usuario
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                      >
                        {tutor.username}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => copiarTexto(tutor.username, 'Usuario')}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box>
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
                      <IconButton 
                        size="small" 
                        onClick={() => copiarTexto(tutor.password, 'Contraseña')}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {tutor.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
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