'use client';

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
  Avatar,
  Stack,
  alpha
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  VpnKey as KeyIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  WorkspacePremium as CertificateIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { useRouter } from 'next/navigation';
import PostgradosDisplay from './PostgradosDisplay';
import docentesService from '@/services/docentes';

export interface DocenteRegistradoData {
  docente: {
    id: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    ci: string;
    celular?: string | null;
    email?: string | null;
    titulo_profesional?: string | null;
    titulo_postgrado?: string | null;
    especialidad?: string | null;
    nivel_formacion?: string | null;
    foto_url?: string | null;
    cv_url?: string | null;
    usuario_id?: number | null;
  };
  credenciales?: {
    username: string;
    password?: string;
    debe_cambiar_password?: boolean;
  } | null;
}

interface CredencialesDocenteModalProps {
  open: boolean;
  onClose: () => void;
  data: DocenteRegistradoData | null;
}

export const CredencialesDocenteModal: React.FC<CredencialesDocenteModalProps> = ({
  open,
  onClose,
  data
}) => {
  const theme = useTheme();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const isDark = theme.palette.mode === 'dark';

  const docente = data?.docente;
  const credenciales = data?.credenciales;

  const handlePrint: any = useReactToPrint({
    contentRef: printRef,
    documentTitle: docente ? `Ficha_Docente_${docente.codigo}_${docente.nombres}_${docente.apellidos}` : 'Ficha_Docente',
  });

  if (!open || !docente) return null;

  const copiarTexto = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado al portapapeles`);
  };

  const copiarTodasLasCredenciales = () => {
    let texto = '🎓 CREDENCIALES DE ACCESO - DOCENTE\n';
    texto += 'U.E.P. La Voz de Cristo\n\n';
    texto += `👤 Docente: ${docente.nombres} ${docente.apellidos}\n`;
    texto += `📌 Código: ${docente.codigo}\n`;
    texto += `🪪 CI: ${docente.ci}\n`;
    if (docente.especialidad) texto += `📚 Especialidad: ${docente.especialidad}\n`;

    if (credenciales) {
      texto += '\n🔐 DATOS DE INICIO DE SESIÓN:\n';
      texto += `   Usuario: ${credenciales.username}\n`;
      if (credenciales.password) {
        texto += `   Contraseña: ${credenciales.password}\n`;
      }
      texto += `   Rol: Docente / Profesor\n`;
    }

    texto += '\n⚠️ Por seguridad, cambie su contraseña al ingresar por primera vez.';

    navigator.clipboard.writeText(texto);
    toast.success('Todas las credenciales fueron copiadas al portapapeles');
  };

  const handleGoToProfile = () => {
    onClose();
    router.push(`/dashboard/docentes/${docente.id}`);
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
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden'
        },
      }}
    >
      {/* Header Modal */}
      <DialogTitle
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)'
            : 'linear-gradient(135deg, #1e40af 0%, #312e81 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2.5,
          px: 3,
          borderBottom: '3px solid #fbbf24'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.25)'
            }}
          >
            <CheckIcon sx={{ fontSize: 28, color: '#4ade80' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              ¡Docente Registrado Exitosamente!
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Código institucional asignado: <strong>{docente.codigo}</strong>
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Contenido Imprimible y Visual */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box ref={printRef} sx={{ p: { xs: 1, sm: 2 } }}>
          {/* Cabecera para Impresión (Solo visible al imprimir) */}
          <Box sx={{ display: 'none', '@media print': { display: 'block', mb: 3, textAlign: 'center', borderBottom: '2px solid #1e40af', pb: 2 } }}>
            <Typography variant="h5" fontWeight={800} color="#1e3a8a">
              UNIDAD EDUCATIVA PARTICULAR &quot;LA VOZ DE CRISTO&quot;
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              FICHA INSTITUCIONAL DE REGISTRO DE DOCENTE Y CREDENCIALES
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Potosí - Bolivia | Fecha: {new Date().toLocaleDateString('es-BO')}
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {/* Tarjeta de Información General */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                bgcolor: isDark ? alpha('#1e293b', 0.5) : alpha('#f8fafc', 0.8)
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 'auto' }} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    src={docente.foto_url || undefined}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '16px',
                      bgcolor: '#1e40af',
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      border: '3px solid #fbbf24',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    {docente.nombres.charAt(0)}{docente.apellidos.charAt(0)}
                  </Avatar>
                </Grid>

                <Grid size={{ xs: 12, sm: true }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" fontWeight={800} color="text.primary">
                      {docente.nombres} {docente.apellidos}
                    </Typography>
                    <Chip
                      label={docente.codigo}
                      size="small"
                      sx={{
                        bgcolor: isDark ? '#1e3a8a' : '#dbeafe',
                        color: isDark ? '#bfdbfe' : '#1e40af',
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}
                    />
                  </Box>

                  <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Cédula de Identidad:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {docente.ci}
                      </Typography>
                    </Grid>

                    {docente.celular && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Celular / Teléfono:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {docente.celular}
                        </Typography>
                      </Grid>
                    )}

                    {docente.email && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Email Personal:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {docente.email}
                        </Typography>
                      </Grid>
                    )}

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Nivel de Formación:
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {docentesService.getNivelFormacionLabel(docente.nivel_formacion || undefined)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Formación y Postgrados */}
              {(docente.titulo_profesional || docente.titulo_postgrado || docente.especialidad) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ spaceY: 1 }}>
                    {docente.titulo_profesional && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                          Título Profesional:
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          🎓 {docente.titulo_profesional}
                        </Typography>
                      </Box>
                    )}

                    {docente.titulo_postgrado && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.5 }}>
                          Postgrados, Diplomados y Maestrías:
                        </Typography>
                        <PostgradosDisplay value={docente.titulo_postgrado} dense />
                      </Box>
                    )}

                    {docente.especialidad && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                          Especialidad:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {docente.especialidad}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Paper>

            {/* Tarjeta de Credenciales de Acceso (Si se crearon) */}
            {credenciales ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: isDark ? alpha('#065f46', 0.15) : alpha('#ecfdf5', 0.9),
                  border: '1.5px solid',
                  borderColor: isDark ? '#059669' : '#10b981',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        bgcolor: '#10b981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <KeyIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800} color={isDark ? '#34d399' : '#065f46'}>
                        Credenciales de Acceso al Sistema
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Para ingresar al portal institucional de calificaciones y asistencia
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label="Rol: Docente"
                    size="small"
                    sx={{
                      bgcolor: '#10b981',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>

                <Grid container spacing={2}>
                  {/* Username */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Nombre de Usuario (Username)
                        </Typography>
                        <Typography variant="body1" fontWeight={800} fontFamily="monospace" color="primary.main">
                          {credenciales.username}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => copiarTexto(credenciales.username, 'Usuario')}
                        title="Copiar usuario"
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>

                  {/* Password */}
                  {credenciales.password && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Contraseña Temporal
                          </Typography>
                          <Typography variant="body1" fontWeight={800} fontFamily="monospace" color="success.main">
                            {credenciales.password}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => copiarTexto(credenciales.password!, 'Contraseña')}
                          title="Copiar contraseña"
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Alert severity="info" sx={{ mt: 2, borderRadius: '10px', fontSize: '0.8rem' }}>
                  Por seguridad, el docente deberá cambiar su contraseña temporal tras su primer inicio de sesión.
                </Alert>
              </Paper>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: '14px' }}>
                Este docente fue registrado sin cuenta de usuario. Podrás crearle una cuenta posteriormente desde su perfil.
              </Alert>
            )}
          </Stack>
        </Box>
      </DialogContent>

      {/* Acciones del Modal */}
      <DialogActions
        sx={{
          p: 2.5,
          px: 3,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          justifyContent: 'space-between'
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Imprimir Ficha
          </Button>

          {credenciales && (
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={copiarTodasLasCredenciales}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              Copiar Credenciales
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<LaunchIcon />}
            onClick={handleGoToProfile}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#1e40af',
              '&:hover': { bgcolor: '#1e3a8a' }
            }}
          >
            Ver Perfil del Docente
          </Button>

          <Button
            variant="text"
            onClick={onClose}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Cerrar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CredencialesDocenteModal;
