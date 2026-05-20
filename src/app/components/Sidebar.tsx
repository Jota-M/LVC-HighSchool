// components/ModernSidebar.tsx - Con navegación mejorada, barra de progreso y drawer mobile
'use client';

import { useState, useEffect } from 'react';
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
  Drawer,
  useMediaQuery,
} from '@mui/material';
import { keyframes } from '@mui/system';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Icons
import CalculateIcon from '@mui/icons-material/Calculate';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
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
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';

import { useAuth } from '../../context/AuthContext';
import { title } from 'process';

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

const progressAnimation = keyframes`
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
`;

// ==================== INTERFACES ====================
interface ItemProps {
  title: string;
  to: string;
  icon: React.ReactNode;
  currentPath: string;
  isCollapsed: boolean;
  badge?: number;
  onNavigate: () => void;
}

interface SectionProps {
  label: string;
  items: any[];
  currentPath: string;
  isCollapsed: boolean;
  userRoles: string[];
  userPermissions: string[];
  onNavigate: () => void;
}

// ==================== BARRA DE PROGRESO GLOBAL ====================
const TopProgressBar = ({ isLoading }: { isLoading: boolean }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: 3,
        backgroundColor: isDark ? alpha('#0288d1', 0.1) : alpha('#0288d1', 0.05),
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: '100%',
          background: 'linear-gradient(90deg, #0288d1, #01579b, #0288d1)',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 1.5s linear infinite, ${progressAnimation} 2s ease-in-out`,
        }}
      />
    </Box>
  );
};

// ==================== COMPONENTE MENU ITEM ====================
const MenuItem = ({
  title,
  to,
  icon,
  currentPath,
  isCollapsed,
  badge,
  onNavigate,
}: ItemProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isActive = currentPath === to;

  const handleClick = () => {
    onNavigate();
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
  currentPath,
  isCollapsed,
  userRoles,
  userPermissions,
  onNavigate,
}: SectionProps) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const filteredItems = items.filter((item) => {
    if (item.permissions && item.permissions.length > 0) {
      return item.permissions.some((perm: string) => userPermissions.includes(perm));
    }
    
    if (item.roles && item.roles.length > 0) {
      return item.roles.some((role: string) => userRoles.includes(role));
    }
    
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
                currentPath={currentPath}
                isCollapsed={isCollapsed}
                badge={item.badge}
                onNavigate={onNavigate}
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
  {
    label: 'Principal',
    items: [
      {
        title: 'Dashboard',
        to: '/dashboard/',
        icon: <HomeOutlinedIcon />,
        permissions: [],
        roles :['super_admin']
      },
    ],
  },
  {
    label: 'Gestión de Personas',
    items: [
      {
        title: 'Usuarios',
        to: '/dashboard/users',
        icon: <PeopleOutlinedIcon />,
        roles :['super_admin']
      },
      {
        title: 'Docentes',
        to: '/dashboard/docentes',
        icon: <SupervisorAccountOutlinedIcon />,
        roles :['super_admin']
      },
      {
        title: 'Estudiantes',
        to: '/dashboard/estudiantes',
        icon: <SchoolOutlinedIcon />,
        // permissions: ['estudiantes.leer'],
        roles: ['super_admin'],
      },
      {
        title: 'Preinscripciones',
        to: '/dashboard/preinscripciones',
        icon: <AppRegistrationIcon />,
        // permissions: ['estudiantes.leer'], 
        badge: 12,
        roles: ['super_admin'],
      },
      {
        title: 'Cursos Vacacionales',
        to: '/dashboard/CursosVacacionales',
        icon: <ContactsOutlinedIcon />,
        roles: ['super_admin'],
      }
    ],
  },
  {
    label: 'Estructura Académica',
    items: [
      {
        title: 'Periodos',
        to: '/dashboard/periodos',
        icon: <CalendarTodayOutlinedIcon />,
        roles: ['super_admin'],
      },
      {
        title: 'Periodos de evaluacion',
        to: '/dashboard/admin/periodoevaluacion',
        icon: <CalendarTodayOutlinedIcon />,
        roles: ['super_admin'],
      },
      {
        title: 'Niveles y Grados',
        to: '/dashboard/niveles-grados',
        icon: <SchoolOutlinedIcon />,
        roles: ['super_admin'],
      },
      {
        title: 'Paralelos',
        to: '/dashboard/paralelos',
        icon: <ClassOutlinedIcon />,
        roles: ['super_admin'],
      },
      {
        title: 'Materias',
        to: '/dashboard/materias',
        icon: <ClassOutlinedIcon />,
        roles: ['super_admin'],
        
      },
    ],
  },
  {
    label: 'Gestión Académica',
    items: [
      {
        title: 'Matriculas',
        to: '/dashboard/matriculacion',
        permissions: ['matriculacion.leer'],
        icon: <AppRegistrationIcon />,
      },
      {
        title: 'Mensualidades',
        to: '/dashboard/pagos',
        icon: <CalculateIcon />,
        // permissions: ['materias.leer'],
        roles: ['super_admin'],
      },
      {
        title: 'Transporte',
        to: '/dashboard/transporte',
        icon: <LocalShippingOutlinedIcon />,
        roles: ['super_admin'],
      },
      {
        title: 'Asignaciones',
        to: '/dashboard/plan-estudio',
        icon: <ContactsOutlinedIcon />,
        roles: ['super_admin'],
      },
      {
        title: 'Horarios',
        to: '/dashboard/horario',
        icon: <CalendarTodayOutlinedIcon />,
        // permissions: ['horarios.leer'],
        roles: ['super_admin'],
      },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        title: 'Reportes',
        to: '/dashboard/reportes',
        icon: <AssessmentOutlinedIcon />,
        permissions: ['reportes.leer'],
      },
      {
        title: 'Backups',
        to : '/dashboard/admin/backups',
        icon: <ClassOutlinedIcon/>,
        roles:['super_admin']
      },
      {
        title: 'Configuración',
        to: '/dashboard/configuracion',
        icon: <SettingsOutlinedIcon />,
        permissions: ['configuracion.leer'],
      },
    ],
  },
  {
    label: 'Portal Padres',
    items: [
      {
        title: 'Inicio',
        to: '/dashboard/padre/home',
        icon: <HomeOutlinedIcon />,
        roles: ['padre'],
      },
      {
        title: 'Horario',
        to: '/dashboard/padre/horario',
        icon: <CalendarTodayOutlinedIcon />,
        roles: ['padre'],
      },
      
      {
        title: 'Tareas',
        to: '/dashboard/padre/tareas',
        icon: <AssessmentOutlinedIcon />,
        roles: ['padre'],
      },
      {
        title: 'Asistencia',
        to: '/dashboard/padre/asistencia',
        icon: <EventAvailableOutlinedIcon />,
        roles: ['padre'],
      },
      {
        title: 'Calificaciones',
        to: '/dashboard/padre/calificaciones',
        icon: <GradeOutlinedIcon />,
        roles: ['padre'],
      },
      {
        title: 'Seguimiento Pedagógico',
        to: '/dashboard/padre/seguimiento',
        icon: <SchoolOutlinedIcon />,
        roles: ['padre'], 
      },
      
      {
        title: 'Alertas',
        to: '/dashboard/padre/alertas',
        icon: <NotificationsActiveOutlinedIcon />,
        roles: ['padre'],
        badge: 2,
      },
    ],
    
  },
  {
    label: 'Financiero',
    items:[
      {
        title: 'Estado de pagos',
        to: '/dashboard/padre/financiero',
        icon: <CalculateIcon />,
        roles: ['padre'],
      },
      {
        title: 'Pagar Mensualidad',
        to: '/dashboard/padre/financiero/pagar',
        icon: <PaymentIcon />,
        roles: ['padre'],
      },
      {
        title: 'Historial de Pagos',
        to: '/dashboard/padre/financiero/historial',
        icon: <HistoryEduIcon />,
        roles: ['padre'],
      }
    ]
  },
  {
    label: 'Portal Docentes', 
    items: [
      {
        title: 'Inicio',
        to: '/dashboard/docente/home', 
        icon: <HomeOutlinedIcon />,
        roles: ['docente'], 
      },
      {
        title: 'Mis Clases',
        to: '/dashboard/docente/horario', 
        icon: <ClassOutlinedIcon />,
        roles: ['docente'], 
      },
      {
        title: 'Temario',
        to: '/dashboard/docente/temario',
        icon: <MenuBookIcon />,
        roles: ['docente'],
      },
      {
        title: 'Tareas',
        to: '/dashboard/docente/notas', 
        icon: <AssessmentOutlinedIcon />,
        roles: ['docente'], 
      },
      {
        title: 'Notas', 
        to: '/dashboard/docente/calificaciones',
        icon: <GradeOutlinedIcon />,
        roles: ['docente'],
      },
      {
        title: 'Asistencia',
        to: '/dashboard/docente/asistencia', 
        icon: <EventAvailableOutlinedIcon />,
        roles: ['docente'],
      },
      {
      title: 'Materiales',
      to: '/dashboard/docente/materiales',
      icon: <MenuBookIcon />,
      roles: ['docente'],
    },
    {
      title: 'Modelo Predictivo',
      to: '/dashboard/docente/prediccion',
      icon: <CalculateIcon />,
      roles: ['docente'],
    },
    {
      title: 'Seguimiento Pedagógico',
      to: '/dashboard/docente/seguimiento',
      icon: <SchoolOutlinedIcon />,
      roles: ['docente'],
    },
    {
      title: 'Reportes',
      to: '/dashboard/docente/reportes',
      icon: <AssessmentOutlinedIcon />,
      roles: ['docente'],
    }
    ],
  },
  {
    label: 'Portal Estudiantes',
    items: [
      {
        title: 'Inicio',
        to: '/dashboard/estudiante/home',
        icon: <HomeOutlinedIcon />,
        roles: ['estudiante'],
      },
      {
        title: 'Mi Horario',
        to: '/dashboard/estudiante/horario',
        icon: <CalendarTodayOutlinedIcon />,
        roles: ['estudiante'],
      },
      {
        title: 'Tareas',
        to: '/dashboard/estudiante/tareas',
        icon: <AssessmentOutlinedIcon />,
        roles: ['estudiante'],
      },
      {
        title: 'Asistencia',
        to: '/dashboard/estudiante/asistencia',
        icon: <EventAvailableOutlinedIcon />,
        roles: ['estudiante'],
      },
      {
        title: 'Mis Materias',
        to: '/dashboard/estudiante/materias',
        icon: <MenuBookIcon />,
        roles: ['estudiante'],
      },
      {
        title: 'Materiales',
        to: '/dashboard/estudiante/materiales',
        icon: <MenuBookIcon />,
        roles: ['estudiante'],
      },
      {
        title: 'Calificaciones',
        to: '/dashboard/estudiante/notas',
        icon: <GradeOutlinedIcon />,
        roles: ['estudiante'],
      },      
    ]
  },
  {
    label: 'Notificaciones',
    items:[
      {
        title: 'Notificaciones',
        to: '/dashboard/notificaciones',
        icon: <AppRegistrationIcon/>
      }
    ]
  }
];

// ==================== CONTENIDO DEL SIDEBAR ====================
const SidebarContent = ({
  isCollapsed,
  isMobile,
  hoverLogo,
  setHoverLogo,
  setIsCollapsed,
  user,
  rolePrincipal,
  pathname,
  userRoles,
  userPermissions,
  handleNavigation,
  isDark,
  onClose,
}: any) => {
  return (
    <Box
      sx={{
        background: isDark? "#020518": "ffffff",
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
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

        <Tooltip title={isMobile ? 'Cerrar' : isCollapsed ? 'Expandir' : 'Contraer'} placement="right">
          <IconButton
            onClick={() => {
              if (isMobile && onClose) {
                onClose();
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
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
            {isMobile ? <CloseIcon sx={{ color: '#0288d1' }} /> : <MenuOutlinedIcon sx={{ color: '#0288d1' }} />}
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
            currentPath={pathname || '/dashboard'}
            isCollapsed={isCollapsed}
            userRoles={userRoles}
            userPermissions={userPermissions}
            onNavigate={() => {
              handleNavigation();
              if (isMobile && onClose) {
                onClose();
              }
            }}
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
            © 2026 U.E. LVC
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

// ==================== COMPONENTE PRINCIPAL ====================
const ModernSidebar = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverLogo, setHoverLogo] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const { user, loading } = useAuth();
  const pathname = usePathname();

  const userRoles = user?.roles?.map((r) => r.nombre) || [];
  const userPermissions = user?.permisos?.map((p) => p.nombre) || [];
  const rolePrincipal = user?.roles?.[0]?.descripcion || 'Usuario';

  // Manejar la navegación
  const handleNavigation = () => {
    setIsNavigating(true);
  };

  // Detectar cuando la página se ha cargado completamente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleComplete = () => {
      setIsNavigating(false);
    };

    if (document.readyState === 'complete') {
      handleComplete();
    } else {
      window.addEventListener('load', handleComplete);
      return () => window.removeEventListener('load', handleComplete);
    }
  }, []);
//   console.log('🎨 SIDEBAR - userRoles:', userRoles);
// console.log('🎨 SIDEBAR - userPermissions:', userPermissions);
// console.log('🎨 SIDEBAR - loadin g:', loading);
// console.log('🎨 SIDEBAR - user:', user);

  if (loading) {
  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Typography>Cargando menú...</Typography>
    </Box>
  );
}

// Sin usuario → ProtectedRoute ya redirige, no renderizar nada
if (!user) {
  return null;
}

  const sidebarContent = (
    <SidebarContent
      isCollapsed={isMobile ? false : isCollapsed}
      isMobile={isMobile}
      hoverLogo={hoverLogo}
      setHoverLogo={setHoverLogo}
      setIsCollapsed={setIsCollapsed}
      user={user}
      rolePrincipal={rolePrincipal}
      pathname={pathname}
      userRoles={userRoles}
      userPermissions={userPermissions}
      handleNavigation={handleNavigation}
      isDark={isDark}
      onClose={() => setMobileOpen(false)}
    />
  );

  return (
    <>
      {/* BARRA DE PROGRESO SUPERIOR */}
      <TopProgressBar isLoading={isNavigating} />

      {/* BOTÓN PARA MOBILE - INTEGRADO DEBAJO DEL TOPBAR */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: -10, // Debajo del topbar
            left: -10, // alineado al borde izquierdo
            zIndex: 1100,
            p: 1,    // padding del contenedor
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              width: 57,         // tamaño cuadrado
              height: 57,        // tamaño cuadrado
              border: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
              boxShadow: isDark
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                backgroundColor: isDark ? '#212d3d' : '#f5f5f5',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
              borderRadius: 2,   // bordes ligeramente redondeados
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MenuOutlinedIcon sx={{ color: '#0288d1', fontSize: 24 }} />
          </IconButton>
        </Box>
      )}


      {/* DRAWER PARA MOBILE */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              background: isDark? "#020518": "ffffff",
              borderRight: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
              boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
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
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        /* SIDEBAR NORMAL PARA DESKTOP */
        <Box
          sx={{
            height: '100vh',
            width: isCollapsed ? 80 : 280,
            backgroundColor: isDark ? '#1a2332' : '#ffffff',
            borderRight: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
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
          {sidebarContent}
        </Box>
      )}
    </>
  );
};

export default ModernSidebar;
