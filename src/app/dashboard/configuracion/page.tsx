// pages/ConfiguracionPage.tsx
"use client";
import { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Person, Lock, Devices, Timeline } from '@mui/icons-material';
import PerfilTab from '@/components/configuracion/PerfilTab';
import PasswordTab from '@/components/configuracion/PasswordTab';
import SesionesTab from '@/components/configuracion/SesionesTab';
import ActividadTab from '@/components/configuracion/ActividadTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConfiguracionPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Configuración
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra tu perfil, seguridad y preferencias
        </Typography>
      </Box>

      <Paper elevation={1}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Person />} iconPosition="start" label="Perfil" />
          <Tab icon={<Lock />} iconPosition="start" label="Contraseña" />
          <Tab icon={<Devices />} iconPosition="start" label="Sesiones" />
          <Tab icon={<Timeline />} iconPosition="start" label="Actividad" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <PerfilTab />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <PasswordTab />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SesionesTab />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <ActividadTab />
        </TabPanel>
      </Paper>
    </Container>
  );
}