// pages/ConfiguracionPage.tsx
"use client";
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  useTheme,
  Fade,
  keyframes,
  alpha,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Devices as DevicesIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import PerfilTab from '@/components/configuracion/PerfilTab';
import PasswordTab from '@/components/configuracion/PasswordTab';
import SesionesTab from '@/components/configuracion/SesionesTab';
import ActividadTab from '@/components/configuracion/ActividadTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export default function ConfiguracionPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              mb: 1
            }}>
              <SettingsIcon
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
                  animation: 'fadeIn 1s ease-out',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                Configuración
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                fontWeight: 500,
                letterSpacing: 0.3,
                ml: { xs: 0, sm: 7 },
                animation: 'fadeInText 1.2s ease-out',
                '@keyframes fadeInText': {
                  from: { opacity: 0, transform: 'translateY(5px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              Administra tu perfil, seguridad y preferencias del sistema.
            </Typography>
          </Box>
        </Fade>

        {/* Tabs Container */}
        <Fade in timeout={700}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              background: isDark 
                ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.03) 0%, rgba(245, 158, 11, 0.03) 100%)'
                : 'linear-gradient(135deg, rgba(2, 136, 209, 0.03) 0%, rgba(1, 87, 155, 0.03) 100%)',
            }}
          >
            {/* Tabs Header */}
            <Box
              sx={{
                overflow: 'hidden',
                borderRadius: '12px 12px 0 0',
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                p: { xs: 0.5, md: 1 },
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  minHeight: { xs: 40, md: 52 },
                  '& .MuiTabs-scrollButtons': {
                    color: isDark ? '#000' : '#fff',
                    '&.Mui-disabled': { opacity: 0.3 },
                  },
                  '& .MuiTab-root': {
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: { xs: 40, md: 52 },
                    fontSize: { xs: '0.8rem', md: '1rem' },
                    px: { xs: 2, md: 3 },
                    color: isDark ? alpha('#000', 0.7) : alpha('#fff', 0.7),
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: isDark ? '#000' : '#fff',
                      backgroundColor: isDark 
                        ? alpha('#000', 0.05) 
                        : alpha('#fff', 0.1),
                    },
                  },
                  '& .Mui-selected': {
                    color: isDark ? '#000' : '#fff',
                    fontWeight: 700,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: isDark ? '#000' : '#fff',
                    height: { xs: 3, md: 4 },
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab
                  icon={<PersonIcon sx={{ fontSize: { xs: 18, md: 24 } }} />}
                  iconPosition="start"
                  label="Perfil"
                />
                <Tab
                  icon={<LockIcon sx={{ fontSize: { xs: 18, md: 24 } }} />}
                  iconPosition="start"
                  label="Contraseña"
                />
                <Tab
                  icon={<DevicesIcon sx={{ fontSize: { xs: 18, md: 24 } }} />}
                  iconPosition="start"
                  label="Sesiones"
                />
                <Tab
                  icon={<TimelineIcon sx={{ fontSize: { xs: 18, md: 24 } }} />}
                  iconPosition="start"
                  label="Actividad"
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <TabPanel value={activeTab} index={0}>
                <Fade in timeout={500}>
                  <Box>
                    <PerfilTab />
                  </Box>
                </Fade>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Fade in timeout={500}>
                  <Box>
                    <PasswordTab />
                  </Box>
                </Fade>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Fade in timeout={500}>
                  <Box>
                    <SesionesTab />
                  </Box>
                </Fade>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <Fade in timeout={500}>
                  <Box>
                    <ActividadTab />
                  </Box>
                </Fade>
              </TabPanel>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}