// pages/CursosVacacionales/Certificados.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  Fade,
  keyframes,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  CardMembership as CertificadoIcon,
  Assessment as AssessmentIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCertificadosVacacionales } from '@/hooks/useCertificadosVacacionales';
import { CertificadosTable } from '@/components/cursosVacacionales/CertificadosTable';
import { InscripcionVacacional } from '@/types/cursoVacacionalTypes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
};

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const Certificados: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  // Hook de certificados
  const {
    inscripciones,
    paginacion,
    isLoading,
    filters,
    actualizarFiltros,
    descargarCertificado,
    previsualizarCertificado,
    isGenerating,
  } = useCertificadosVacacionales();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    router.push('/dashboard/CursosVacacionales');
  };

  const handleView = (inscripcion: InscripcionVacacional) => {
    router.push(`/dashboard/CursosVacacionales/inscripciones/${inscripcion.id}`);
  };

  const handleSearch = (search: string) => {
    actualizarFiltros({ search, page: 1 });
  };

  const handlePageChange = (page: number) => {
    actualizarFiltros({ page });
  };

  const handleRowsPerPageChange = (limit: number) => {
    actualizarFiltros({ limit, page: 1 });
  };

  const handleFilterChange = (periodo_vacacional_id?: number) => {
    actualizarFiltros({
      periodo_vacacional_id,
      page: 1,
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
              <Box>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  sx={{
                    mb: 2,
                    color: isDark ? '#facc15' : '#0288d1',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                    },
                  }}
                >
                  Volver al Dashboard
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CertificadoIcon
                    sx={{
                      color: isDark ? '#facc15' : '#0288d1',
                      fontSize: 36,
                      animation: `${bounce} 1.5s infinite`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'fadeIn 1s ease-out',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(-10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    Certificados
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0.3,
                    animation: 'fadeInText 1.2s ease-out',
                    '@keyframes fadeInText': {
                      from: { opacity: 0, transform: 'translateY(5px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  Genera y descarga certificados de cursos vacacionales completados.
                </Typography>
              </Box>
            </Box>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                borderRadius: '16px',
                p: 1,
                backdropFilter: 'blur(20px)',
                '& .MuiTab-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: isDark ? '#000' : '#fff',
                },
                '& .Mui-selected': {
                  color: isDark ? '#fff' : '#fff',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#fff' : '#fff',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<ListIcon />} iconPosition="start" label="Cursos Completados" />
              <Tab icon={<AssessmentIcon />} iconPosition="start" label="Reportes" />
            </Tabs>
          </Box>
        </Fade>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}>
            <Box>
              <CertificadosTable
                inscripciones={inscripciones}
                isLoading={isLoading}
                page={filters.page || 1}
                rowsPerPage={filters.limit || 10}
                totalItems={paginacion?.total || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onSearch={handleSearch}
                onView={handleView}
                onDescargarCertificado={descargarCertificado}
                onPrevisualizarCertificado={previsualizarCertificado}
                onFilterChange={handleFilterChange}
                isGenerating={isGenerating}
              />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={700}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
              }}
            >
              <AssessmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Reportes de Certificados
              </Typography>
              <Typography color="text.secondary">
                Sección de reportes en desarrollo...
              </Typography>
            </Box>
          </Fade>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Certificados;