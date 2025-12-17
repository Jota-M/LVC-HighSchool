'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme,
  alpha,
  keyframes,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as DescriptionIcon,
  FormatListBulleted as ListIcon,
  BarChart as BarChartIcon,
  School as SchoolIcon,
  HowToReg as HowToRegIcon,
} from '@mui/icons-material';
import { ModalGenerarReporte } from '@/components/reportes/ModalGenerarReporte';
import { useRouter } from 'next/navigation';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

type TipoReporte = 
  | 'paralelo' 
  | 'estadistico_matricula' 
  | 'preinscripcion_listado' 
  | 'preinscripcion_estadistico';

export const Reportes: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';

  const [modalOpen, setModalOpen] = useState(false);
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('paralelo');

  const handleOpenModal = (tipo: TipoReporte) => {
    setTipoReporte(tipo);
    setModalOpen(true);
  };

  // ==========================================
  // 📚 REPORTES DE MATRÍCULAS
  // ==========================================
  const reportesMatricula = [
    {
      id: 'paralelo',
      titulo: 'Reporte por Paralelo',
      descripcion: 'Lista completa de estudiantes de un paralelo específico con datos personales, tutores y estadísticas del grupo.',
      icon: GroupIcon,
      color: isDark ? '#facc15' : '#0288d1',
      accion: () => handleOpenModal('paralelo'),
    },
    {
      id: 'individual',
      titulo: 'Ficha Individual',
      descripcion: 'Reporte completo de un estudiante con historial académico, datos de tutores y registro de matrículas.',
      icon: PersonIcon,
      color: isDark ? '#22c55e' : '#2e7d32',
      accion: () => router.push('/dashboard/estudiantes'),
      badge: 'Desde tabla',
    },
    {
      id: 'estadistico_matricula',
      titulo: 'Estadísticas de Matrículas',
      descripcion: 'Análisis comparativo entre paralelos con estadísticas detalladas por nivel, turno y capacidad.',
      icon: TrendingUpIcon,
      color: isDark ? '#f59e0b' : '#ed6c02',
      accion: () => handleOpenModal('estadistico_matricula'),
    },
  ];

  // ==========================================
  // 📝 REPORTES DE PRE-INSCRIPCIONES
  // ==========================================
  const reportesPreInscripcion = [
    {
      id: 'preinscripcion_individual',
      titulo: 'Ficha de Pre-inscripción',
      descripcion: 'Detalle completo de una solicitud de pre-inscripción con datos del estudiante, tutor y documentos.',
      icon: DescriptionIcon,
      color: isDark ? '#a855f7' : '#7c3aed',
      accion: () => router.push('/dashboard/preinscripciones'),
      badge: 'Desde tabla',
    },
    {
      id: 'preinscripcion_listado',
      titulo: 'Listado de Pre-inscripciones',
      descripcion: 'Reporte filtrado de todas las solicitudes con opciones por estado, fecha y estadísticas generales.',
      icon: ListIcon,
      color: isDark ? '#ec4899' : '#db2777',
      accion: () => handleOpenModal('preinscripcion_listado'),
    },
    {
      id: 'preinscripcion_estadistico',
      titulo: 'Estadísticas de Pre-inscripciones',
      descripcion: 'Análisis completo con distribución por estado, género, grado solicitado y estado de documentación.',
      icon: BarChartIcon,
      color: isDark ? '#06b6d4' : '#0891b2',
      accion: () => handleOpenModal('preinscripcion_estadistico'),
    },
  ];

  // Renderizar card de reporte
  const renderReporteCard = (reporte: typeof reportesMatricula[0]) => {
    const Icon = reporte.icon;
    return (
      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={reporte.id}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            backgroundColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(reporte.color, 0.2)}`,
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'visible',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: isDark
                ? `0 12px 40px ${alpha(reporte.color, 0.3)}`
                : `0 12px 40px ${alpha(reporte.color, 0.2)}`,
              borderColor: reporte.color,
            },
          }}
        >
          {/* Badge opcional */}
          {reporte.badge && (
            <Box
              sx={{
                position: 'absolute',
                top: -12,
                right: 16,
                bgcolor: reporte.color,
                color: isDark ? '#000' : '#fff',
                px: 2,
                py: 0.5,
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: `0 4px 12px ${alpha(reporte.color, 0.4)}`,
              }}
            >
              {reporte.badge}
            </Box>
          )}

          <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '20px',
                bgcolor: alpha(reporte.color, 0.1),
                mb: 2,
              }}
            >
              <Icon sx={{ fontSize: 48, color: reporte.color }} />
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                background: `linear-gradient(135deg, ${reporte.color} 0%, ${alpha(reporte.color, 0.7)} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {reporte.titulo}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {reporte.descripcion}
            </Typography>
          </CardContent>

          <CardActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={reporte.accion}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                background: `linear-gradient(135deg, ${reporte.color} 0%, ${alpha(reporte.color, 0.8)} 100%)`,
                color: isDark ? '#000' : '#fff',
                '&:hover': {
                  background: reporte.color,
                  transform: 'scale(1.05)',
                },
              }}
            >
              Generar Reporte
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* ==========================================
            HEADER PRINCIPAL
            ========================================== */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <AssessmentIcon
              sx={{
                color: isDark ? '#facc15' : '#0288d1',
                fontSize: 40,
                animation: `${bounce} 1.5s infinite`,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                fontWeight: 800,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Centro de Reportes
            </Typography>
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontWeight: 500, fontSize: '1.1rem' }}
          >
            Genera reportes detallados en PDF o Excel para matrículas y
            pre-inscripciones.
          </Typography>
        </Box>

        {/* ==========================================
            SECCIÓN: REPORTES DE MATRÍCULAS
            ========================================== */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <SchoolIcon
              sx={{
                fontSize: 32,
                color: isDark ? '#facc15' : '#0288d1',
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: isDark ? '#facc15' : '#0288d1',
              }}
            >
              Reportes de Matrículas
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {reportesMatricula.map(renderReporteCard)}
          </Grid>
        </Box>

        <Divider
          sx={{
            my: 6,
            borderColor: alpha(theme.palette.divider, 0.1),
          }}
        />

        {/* ==========================================
            SECCIÓN: REPORTES DE PRE-INSCRIPCIONES
            ========================================== */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <HowToRegIcon
              sx={{
                fontSize: 32,
                color: isDark ? '#a855f7' : '#7c3aed',
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: isDark ? '#a855f7' : '#7c3aed',
              }}
            >
              Reportes de Pre-inscripciones
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {reportesPreInscripcion.map(renderReporteCard)}
          </Grid>
        </Box>

        {/* ==========================================
            INFO ADICIONAL: FORMATOS
            ========================================== */}
        <Box
          sx={{
            mt: 6,
            p: 4,
            borderRadius: '20px',
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#facc15', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
              : `linear-gradient(135deg, ${alpha('#0288d1', 0.1)} 0%, ${alpha('#01579b', 0.05)} 100%)`,
            border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <PdfIcon sx={{ fontSize: 32, color: '#dc2626' }} />
            <ExcelIcon sx={{ fontSize: 32, color: '#107C41' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Formatos Disponibles
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                <PdfIcon sx={{ color: '#dc2626', mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    PDF (Portable Document Format)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ideal para impresión, visualización oficial y compartir
                    documentos que no requieren edición.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                <ExcelIcon sx={{ color: '#107C41', mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    Excel (XLSX)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Perfecto para análisis de datos, filtrado avanzado,
                    generación de gráficos y procesamiento en hojas de cálculo.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* ==========================================
          MODAL DE GENERACIÓN
          ========================================== */}
      <ModalGenerarReporte
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tipo={tipoReporte}
      />
    </Box>
  );
};

export default Reportes;