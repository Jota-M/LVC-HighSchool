'use client';
import { useState } from 'react';
import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Box, IconButton, Typography, useTheme, Divider } from '@mui/material';
import Link from 'next/link';
import 'react-pro-sidebar/dist/css/styles.css';
import { tokens } from '../dashboard/theme';
import { useAuthGuard } from '../hooks/useAuthGuard';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

interface ItemProps {
  title: string;
  to: string;
  icon: React.ReactNode;
  selected: string;
  setSelected: (title: string) => void;
}

const Item = ({ title, to, icon, selected, setSelected }: ItemProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Link href={to} className="w-full">
        <Typography fontSize="0.95rem" fontWeight={500}>
          {title}
        </Typography>
      </Link>
    </MenuItem>
  );
};

const sections = [
  {
    label: 'Administración',
    items: [
      { title: 'Dashboard', to: '/dashboard', icon: <HomeOutlinedIcon />, roles: ['admin', 'user'] },
      { title: 'Users', to: '/dashboard/users', icon: <PeopleOutlinedIcon />, roles: ['admin'] },
      { title: 'Docentes', to: '/dashboard/docentes', icon: <ReceiptOutlinedIcon />, roles: ['admin'] },
      { title: 'Estudiantes', to: '/dashboard/estudiantes', icon: <PersonOutlinedIcon />, roles: ['admin', 'user'] },
    ],
  },
  {
    label: 'Académica',
    items: [
      { title: 'Asignaciones', to: '/dashboard/asignaciones', icon: <ContactsOutlinedIcon />, roles: ['admin', 'user'] },
      { title: 'Materias', to: '/dashboard/materias', icon: <HelpOutlineOutlinedIcon />, roles: ['admin', 'user'] },
      { title: 'Horarios y Paralelos', to: '/calendar', icon: <CalendarTodayOutlinedIcon />, roles: ['admin', 'user'] },
      
    ],
  },
  {
    label: 'Configuracion',
    items: [
      { title: 'Configuración', to: '/pie', icon: <PieChartOutlineOutlinedIcon />, roles: ['admin'] },
      { title: 'Reportes', to: '/line', icon: <TimelineOutlinedIcon />, roles: ['admin'] },
    ],
  },
  {
    label: 'Padre de Familia/Tutor',
    items: [
      { title: 'Panel Principal', to: '/dashboard/Padre/principal', icon: <HomeOutlinedIcon />, roles: ['admin', 'user'] },
      { title: 'Calificaciones', to: '/dashboard/Padre/calificaciones', icon: <PeopleOutlinedIcon />, roles: ['admin'] },
      { title: 'Asistencia', to: '/dashboard/Padre/asistencia', icon: <ReceiptOutlinedIcon />, roles: ['admin'] },
      { title: 'Horario', to: '/dashboard/Padre/horario', icon: <PersonOutlinedIcon />, roles: ['admin', 'user'] },
      { title: 'Alertas', to: '/dashboard/Padre/alertas', icon: <TimelineOutlinedIcon />, roles: ['admin', 'user'] },
    ],
  },
  {
    label: 'Profesor',
    items: [
      { title: 'Home  ', to: '/dashboard/profesor/home', icon: <HomeOutlinedIcon />, roles: ['admin', 'user'] },
      { title: 'Notas y Calificaciones', to: '/dashboard/profesor/notas', icon: <PeopleOutlinedIcon />, roles: ['admin'] },
      { title: 'Asistencia', to: '/dashboard/profesor/asistencia', icon: <ReceiptOutlinedIcon />, roles: ['admin'] },
      { title: 'Clases', to: '/dashboard/profesor/clases', icon: <PersonOutlinedIcon />, roles: ['admin', 'user'] },
    ],
  },
  
];

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState('Dashboard');
  const { loading, role } = useAuthGuard();

  if (loading) {
    return <p className="text-white p-8">Cargando menú...</p>;
  }

  return (
    <Box
      sx={{
        height: '100vh',
        
        '& .pro-sidebar-inner': {
          background: `${colors.primary[400]} !important`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        '& .pro-menu': {
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.grey[700]} transparent`,
        },
        '& .pro-menu::-webkit-scrollbar': {
          width: '6px',
        },
        '& .pro-menu::-webkit-scrollbar-thumb': {
          backgroundColor: colors.grey[700],
          borderRadius: '4px',
        },
        '& .pro-icon-wrapper': { backgroundColor: 'transparent !important' },
        '& .pro-inner-item': { padding: '5px 35px 5px 20px !important' },
        '& .pro-inner-item:hover': { color: '#868dfb !important' },
        '& .pro-menu-item.active': { color: '#6870fa !important' },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO Y TOGGLE */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{ margin: '10px 0 20px 0', color: colors.grey[100] }}
          >
            {!isCollapsed && (
              <Box display="flex" justifyContent="space-between" alignItems="center" ml="15px">
                <Typography variant="h3" color={colors.grey[100]}>
                  U.E. LVC
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* PERFIL */}
          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={`/perfil.jpg`}
                  style={{ cursor: 'pointer', borderRadius: '50%' }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: '10px 0 0 0' }}
                >
                  Oswaldo
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Director Administrativo
                </Typography>
              </Box>
            </Box>
          )}

          {/* MENÚ AGRUPADO POR ÁREAS */}
          <Box paddingLeft={isCollapsed ? undefined : '10%'}>
            {sections.map((section, i) => (
              <Box key={i} mb={2}>
                {!isCollapsed && (
                  <Typography
                    variant="subtitle2"
                    color={colors.grey[300]}
                    sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1, ml: 1 }}
                  >
                    {section.label}
                  </Typography>
                )}
                {section.items
                  .filter((item) => role && item.roles.includes(role))
                  .map((item) => (
                    <Item
                      key={item.title}
                      title={item.title}
                      to={item.to}
                      icon={item.icon}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  ))}
                {i !== sections.length - 1 && <Divider sx={{ my: 1, bgcolor: colors.grey[700] }} />}
              </Box>
            ))}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
