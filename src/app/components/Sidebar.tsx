// components/ModernSidebar.tsx - Actualizado con autenticación
'use client';

import { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  Chip,
  Tooltip,
  alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import Link from 'next/link';

// Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';

import { useAuth } from '../../context/AuthContext';

// ==================== ANIMACIONES ====================
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

// ==================== INTERFACES ====================
interface ItemProps {
  title: string;
  to: string;
  icon: React.ReactNode;
  selected: string;
  setSelected: (title: string) => void;
  isCollapsed: boolean;
  badge?: number;
}

interface SectionProps {
  label: string;
  items: any[];
  selected: string;
  setSelected: (title: string) => void;
  isCollapsed: boolean;
  userRoles: string[];
  userPermissions: string[];
}

// ==================== COMPONENTE MENU ITEM ====================
const MenuItem = ({
  title,
  to,
  icon,
  selected,
  setSelected,
  isCollapsed,
  badge,
}: ItemProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isActive = selected === title;

  const handleClick = () => {
    setSelected(title);
  };

  const content = (
    <Link href={to} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
      <ListItemButton
        onClick={handleClick}
        sx={{
          minHeight: 48,
          px: 2.5,
          mb: 0.5,
          borderRadius: 2,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: isActive
            ? isDark
              ? alpha('#0288d1', 0.15)
              : alpha('#0288d1', 0.1)
            : 'transparent',
          '&:hover': {
            backgroundColor: isDark ? alpha('#0288d1', 0.12) : alpha('#0288d1', 0.08),
            transform: 'translateX(4px)',
            '& .MuiListItemIcon-root': {
              transform: 'scale(1.1) rotate(5deg)',
            },
          },
          '&::before': isActive
            ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 4,
                height: '70%',
                borderRadius: '0 4px 4px 0',
                background: 'linear-gradient(180deg, #0288d1, #01579b)',
                animation: `${pulse} 2s ease-in-out infinite`,
              }
            : {},
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isCollapsed ? 'auto' : 2,
            justifyContent: 'center',
            color: isActive ? '#0288d1' : isDark ? '#b0bec5' : '#607d8b',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {icon}
        </ListItemIcon>

        {!isCollapsed && (
          <>
            <ListItemText
              primary={title}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#0288d1' : 'inherit',
              }}
            />
            {badge && badge > 0 && (
              <Chip
                label={badge}
                size="small"
                sx={{
                  height: 20,
                  minWidth: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#f44336',
                  color: '#fff',
                  animation: `${pulse} 2s ease-in-out infinite`,
                }}
              />
            )}
          </>
        )}
      </ListItemButton>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip title={title} placement="right" arrow>
        {content}
      </Tooltip>
    );
  }

  return content;
};

// ==================== COMPONENTE SECCION ====================
const MenuSection = ({
  label,
  items,
  selected,
  setSelected,
  isCollapsed,
  userRoles,
  userPermissions,
}: SectionProps) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Filtrar items según roles del usuario
  const filteredItems = items.filter((item) => {
    // Si el item requiere roles específicos
    if (item.roles && item.roles.length > 0) {
      return item.roles.some((role: string) => userRoles.includes(role));
    }
    // Si el item requiere permisos específicos
    if (item.permissions && item.permissions.length > 0) {
      return item.permissions.some((perm: string) => userPermissions.includes(perm));
    }
    // Si no requiere nada específico, mostrar
    return true;
  });

  if (filteredItems.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {!isCollapsed && (
        <ListItemButton
          onClick={() => setOpen(!open)}
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 2,
            mb: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: 1,
              color: isDark ? '#78909c' : '#90a4ae',
              flex: 1,
            }}
          >
            {label}
          </Typography>
          {open ? (
            <ExpandLessIcon sx={{ fontSize: 18, color: isDark ? '#78909c' : '#90a4ae' }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18, color: isDark ? '#78909c' : '#90a4ae' }} />
          )}
        </ListItemButton>
      )}

      <Collapse in={open || isCollapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {filteredItems.map((item, index) => (
            <Box
              key={item.title}
              sx={{
                animation: `${fadeIn} 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              <MenuItem
                title={item.title}
                to={item.to}
                icon={item.icon}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
                badge={item.badge}
              />
            </Box>
          ))}
        </List>
      </Collapse>

      {!isCollapsed && (
        <Divider
          sx={{
            mt: 1.5,
            mb: 0.5,
            borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
          }}
        />
      )}
    </Box>
  );
};

// ==================== SECCIONES DEL MENU ====================
const sections = [
  // 🏠 SECCIÓN PRINCIPAL
  {
    label: 'Principal',
    items: [
      {
        title: 'Dashboard',
        to: '/dashboard',
        icon: <HomeOutlinedIcon />,
        roles: ['admin', 'super_admin', 'docente', 'secretaria'],
      },
    ],
  },

  // 👥 GESTIÓN DE PERSONAS
  {
    label: 'Gestión de Personas',
    items: [
      {
        title: 'Usuarios',
        to: '/dashboard/users',
        icon: <PeopleOutlinedIcon />,
        roles: ['admin', 'super_admin'],
        permissions: ['usuarios.leer'],
      },
      {
        title: 'Docentes',
        to: '/dashboard/docentes',
        icon: <SupervisorAccountOutlinedIcon />,
        roles: ['admin', 'super_admin', 'secretaria'],
        permissions: ['docentes.leer'],
      },
      {
        title: 'Estudiantes',
        to: '/dashboard/estudiantes',
        icon: <SchoolOutlinedIcon />,
        roles: ['admin', 'super_admin', 'docente', 'secretaria'],
        permissions: ['estudiantes.leer'],
      },
      {
        title: 'Preinscripciones',
        to: '/dashboard/preinscripciones',
        icon: <AppRegistrationIcon />,
        roles: ['admin', 'super_admin', 'secretaria'],
        badge: 12,
      },
    ],
  },

  // 📚 ESTRUCTURA ACADÉMICA
  {
    label: 'Estructura Académica',
    items: [
      {
        title: 'Periodos',
        to: '/dashboard/periodos',
        icon: <CalendarTodayOutlinedIcon />,
        roles: ['admin', 'super_admin'],
      },
      {
        title: 'Niveles y Grados',
        to: '/dashboard/niveles-grados',
        icon: <SchoolOutlinedIcon />,
        roles: ['admin', 'super_admin'],
      },
      {
        title: 'Paralelos',
        to: '/dashboard/paralelos',
        icon: <ClassOutlinedIcon />,
        roles: ['admin', 'super_admin'],
      },
      {
        title: 'Materias',
        to: '/dashboard/materias',
        icon: <ClassOutlinedIcon />,
        roles: ['admin', 'super_admin', 'docente'],
      },
    ],
  },

  // 📋 GESTIÓN ACADÉMICA
  {
    label: 'Gestión Académica',
    items: [
      {
        title: 'Asignaciones',
        to: '/dashboard/asignaciones',
        icon: <ContactsOutlinedIcon />,
        roles: ['admin', 'super_admin', 'docente'],
      },
      {
        title: 'Horarios',
        to: '/dashboard/horarios',
        icon: <CalendarTodayOutlinedIcon />,
        roles: ['admin', 'super_admin', 'docente'],
      },
    ],
  },

  // 📊 REPORTES Y CONFIGURACIÓN
  {
    label: 'Sistema',
    items: [
      {
        title: 'Reportes',
        to: '/dashboard/reportes',
        icon: <AssessmentOutlinedIcon />,
        roles: ['admin', 'super_admin'],
      },
      {
        title: 'Configuración',
        to: '/dashboard/configuracion',
        icon: <SettingsOutlinedIcon />,
        roles: ['admin', 'super_admin'],
      },
    ],
  },

  // 👨‍👩‍👧 PORTAL PADRES
  {
    label: 'Portal Padres',
    items: [
      {
        title: 'Inicio',
        to: '/dashboard/Padre/principal',
        icon: <HomeOutlinedIcon />,
        roles: ['padre'],
      },
      {
        title: 'Calificaciones',
        to: '/dashboard/Padre/calificaciones',
        icon: <GradeOutlinedIcon />,
        roles: ['padre'],
      },
      {
        title: 'Asistencia',
        to: '/dashboard/Padre/asistencia',
        icon: <EventAvailableOutlinedIcon />,
        roles: ['padre'],
      },
      {
        title: 'Horario',
        to: '/dashboard/Padre/horario',
        icon: <CalendarTodayOutlinedIcon />,
        roles: ['padre'],
      },
      {
        title: 'Alertas',
        to: '/dashboard/Padre/alertas',
        icon: <NotificationsActiveOutlinedIcon />,
        roles: ['padre'],
        badge: 2,
      },
    ],
  },

  // 👨‍🏫 PORTAL PROFESORES
  {
    label: 'Portal Profesores',
    items: [
      {
        title: 'Inicio',
        to: '/dashboard/profesor/home',
        icon: <HomeOutlinedIcon />,
        roles: ['profesor'],
      },
      {
        title: 'Mis Clases',
        to: '/dashboard/profesor/clases',
        icon: <ClassOutlinedIcon />,
        roles: ['profesor'],
      },
      {
        title: 'Calificaciones',
        to: '/dashboard/profesor/notas',
        icon: <GradeOutlinedIcon />,
        roles: ['profesor'],
      },
      {
        title: 'Asistencia',
        to: '/dashboard/profesor/asistencia',
        icon: <EventAvailableOutlinedIcon />,
        roles: ['profesor'],
      },
    ],
  },
];

// ==================== COMPONENTE PRINCIPAL ====================
const ModernSidebar = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState('Dashboard');
  const [hoverLogo, setHoverLogo] = useState(false);

  const { user, loading } = useAuth();

  // Obtener roles y permisos del usuario
  const userRoles = user?.roles?.map((r) => r.nombre) || [];
  const userPermissions = user?.permisos?.map((p) => p.nombre) || [];

  // Obtener el nombre del rol principal para mostrar
  const rolePrincipal = user?.roles?.[0]?.descripcion || 'Usuario';

  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography>Cargando menú...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: isCollapsed ? 80 : 280,
        backgroundColor: isDark ? '#1a1f2e' : '#ffffff',
        borderRight: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isDark
          ? '4px 0 24px rgba(0,0,0,0.3)'
          : '4px 0 24px rgba(0,0,0,0.08)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #0288d1, #01579b, #0288d1)',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 3s linear infinite`,
        },
      }}
    >
      {/* HEADER CON LOGO */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          position: 'relative',
        }}
      >
        {!isCollapsed && (
          <Box
            onMouseEnter={() => setHoverLogo(true)}
            onMouseLeave={() => setHoverLogo(false)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: 1,
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              transform: hoverLogo ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease',
                transform: hoverLogo ? 'rotate(-5deg)' : 'rotate(0deg)',
              }}
            >
              <img src="/logo.png" alt="School Icon" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: isDark
                    ? 'linear-gradient(90deg, #ffd700, #ffed4e)'
                    : 'linear-gradient(90deg, #0288d1, #01579b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: 0.5,
                }}
              >
                U.E. L.V.C.
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? 'white' : '#90a4ae',
                  fontSize: '0.7rem',
                }}
              >
                Plataforma Educativa
              </Typography>
            </Box>
          </Box>
        )}

        <Tooltip title={isCollapsed ? 'Expandir' : 'Contraer'} placement="right">
          <IconButton
            onClick={() => setIsCollapsed(!isCollapsed)}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(180deg)',
                backgroundColor: isDark
                  ? alpha('#0288d1', 0.15)
                  : alpha('#0288d1', 0.1),
              },
            }}
          >
            <MenuOutlinedIcon sx={{ color: '#0288d1' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* PERFIL DE USUARIO */}
      {!isCollapsed && (
        <Box
          sx={{
            p: 2.5,
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: isDark
                  ? alpha('#0288d1', 0.08)
                  : alpha('#0288d1', 0.05),
                transform: 'translateY(-2px)',
                boxShadow: isDark
                  ? '0 4px 12px rgba(2,136,209,0.15)'
                  : '0 4px 12px rgba(2,136,209,0.1)',
              },
            }}
          >
            <Avatar
              src="/perfil.jpg"
              sx={{
                width: 48,
                height: 48,
                border: '2px solid #0288d1',
                boxShadow: '0 2px 8px rgba(2,136,209,0.2)',
              }}
            />
            <Box flex={1} sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: isDark ? '#fff' : '#263238',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.username}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? '#78909c' : '#90a4ae',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {rolePrincipal}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: user?.activo ? '#4caf50' : '#f44336',
                boxShadow: `0 0 0 2px ${
                  user?.activo ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'
                }`,
                animation: user?.activo ? `${pulse} 2s ease-in-out infinite` : 'none',
              }}
            />
          </Box>
        </Box>
      )}

      {isCollapsed && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={`${user?.username} - ${rolePrincipal}`} placement="right">
            <Avatar
              src="/perfil.jpg"
              sx={{
                width: 44,
                height: 44,
                border: '2px solid #0288d1',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            />
          </Tooltip>
        </Box>
      )}

      {/* NAVEGACIÓN */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 1.5,
          py: 2,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
            borderRadius: 3,
            '&:hover': {
              backgroundColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
            },
          },
        }}
      >
        {sections.map((section) => (
          <MenuSection
            key={section.label}
            label={section.label}
            items={section.items}
            selected={selected}
            setSelected={setSelected}
            isCollapsed={isCollapsed}
            userRoles={userRoles}
            userPermissions={userPermissions}
          />
        ))}
      </Box>

      {/* FOOTER */}
      {!isCollapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: isDark ? '#546e7a' : '#78909c',
              textAlign: 'center',
              display: 'block',
              fontSize: '0.7rem',
            }}
          >
            © 2024 U.E. LVC
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isDark ? '#455a64' : '#90a4ae',
              textAlign: 'center',
              display: 'block',
              fontSize: '0.65rem',
            }}
          >
            Versión 2.1.0
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ModernSidebar;