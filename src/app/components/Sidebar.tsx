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
import NotificationAddOutlinedIcon from '@mui/icons-material/NotificationAddOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined';

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
  exact?: boolean;
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
  const accent = isDark ? '#f2b93d' : '#0288d1';
  const accentDeep = isDark ? '#b8860b' : '#01579b';

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
        backgroundColor: alpha(accent, isDark ? 0.12 : 0.05),
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: '100%',
          background: `linear-gradient(90deg, ${accent}, ${accentDeep}, ${accent})`,
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
  exact,
  icon,
  currentPath,
  isCollapsed,
  badge,
  onNavigate,
}: ItemProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const normalizedTo = to.endsWith('/') ? to.slice(0, -1) : to;
  const normalizedPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;

  const isActive = exact
    ? normalizedPath === normalizedTo
    : normalizedPath === normalizedTo ||
    normalizedPath.startsWith(normalizedTo + '/');


  const handleClick = () => {
    onNavigate();
  };

  // Color de acento: celeste en claro, dorado en oscuro
  const accent = isDark ? '#f2b93d' : '#0288d1';

  const content = (
    <Link href={to} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
      <ListItemButton
        onClick={handleClick}
        sx={{
          minHeight: 44,
          px: 2,
          mb: 0.25,
          borderRadius: 2.5,
          transition: 'background-color 0.15s ease, color 0.15s ease',
          position: 'relative',
          backgroundColor: isActive
            ? isDark
              ? alpha(accent, 0.16)
              : alpha(accent, 0.1)
            : 'transparent',
          '&:hover': {
            backgroundColor: isActive
              ? isDark
                ? alpha(accent, 0.2)
                : alpha(accent, 0.13)
              : isDark
                ? alpha('#ffffff', 0.04)
                : alpha('#000000', 0.03),
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isCollapsed ? 'auto' : 1.75,
            justifyContent: 'center',
            color: isActive
              ? accent
              : isDark ? '#8a94a3' : '#6b7280',
            '& svg': { fontSize: 20 },
            transition: 'color 0.15s ease',
          }}
        >
          {icon}
        </ListItemIcon>

        {!isCollapsed && (
          <>
            <ListItemText
              primary={title}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? isDark ? '#ffffff' : '#1a1a1a'
                  : isDark ? '#a7b0bd' : '#4b5563',
                letterSpacing: '0.01em',
              }}
            />
            {badge && badge > 0 && (
              <Chip
                label={badge}
                size="small"
                sx={{
                  height: 18,
                  minWidth: 18,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: accent,
                  color: isDark ? '#1a1a1a' : '#ffffff',
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
    <Box sx={{ mb: 2.5 }}>
      {!isCollapsed && (
        <ListItemButton
          onClick={() => setOpen(!open)}
          disableRipple
          sx={{
            px: 2,
            py: 0.25,
            borderRadius: 2,
            mb: 0.75,
            minHeight: 'auto',
            transition: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.08em',
              fontSize: '0.7rem',
              color: isDark ? '#6b7684' : '#9aa3af',
              flex: 1,
            }}
          >
            {label}
          </Typography>
          {open ? (
            <ExpandLessIcon sx={{ fontSize: 16, color: isDark ? '#6b7684' : '#9aa3af' }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 16, color: isDark ? '#6b7684' : '#9aa3af' }} />
          )}
        </ListItemButton>
      )}

      <Collapse in={open || isCollapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {filteredItems.map((item, index) => (
            <Box key={item.title}>
              <MenuItem
                title={item.title}
                to={item.to}
                icon={item.icon}
                exact={item.exact}
                currentPath={currentPath}
                isCollapsed={isCollapsed}
                badge={item.badge}
                onNavigate={onNavigate}
              />
            </Box>
          ))}
        </List>
      </Collapse>
    </Box>
  );
};

// ==================== SECCIONES DEL MENU ====================
const sections = [
  {
    label: 'Principal',
    items: [
      {
        title: 'Inicio',
        to: '/dashboard/admin',
        exact: true,
        icon: <HomeOutlinedIcon />,
        permissions: [],
        roles: ['super_admin']
      },
      {
        title: 'Inicio',
        to: '/dashboard/secretaria',
        icon: <HomeOutlinedIcon />,
        roles: ['secretaria']
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
        roles: ['super_admin']
      },
      {
        title: 'Docentes',
        to: '/dashboard/docentes',
        icon: <SupervisorAccountOutlinedIcon />,
        roles: ['super_admin', 'secretaria']
      },
      {
        title: 'Estudiantes',
        to: '/dashboard/estudiantes',
        icon: <SchoolOutlinedIcon />,
        roles: ['super_admin', 'secretaria'],
      },
      {
        title: 'Preinscripciones',
        to: '/dashboard/preinscripciones',
        icon: <AppRegistrationIcon />,
        roles: ['super_admin', 'secretaria'],
      },
      {
        title: 'Reserva de Cupos',
        to: '/dashboard/reserva-cupos',
        icon: <BookmarkAddedOutlinedIcon />,
        roles: ['super_admin', 'secretaria'],
      },
    ],
  },
  {
    label: 'Financiero',
    items: [
      {
        title: 'Balance General',
        to: '/dashboard/financiero',
        icon: <CalculateIcon />,
        roles: ['super_admin', 'secretaria']
      },
      {
        title: 'Ingresos',
        to: '/dashboard/ingresos',
        icon: <CalculateIcon />,
        roles: ['super_admin', 'secretaria']
      },
      {
        title: 'Egresos',
        to: '/dashboard/egresos',
        icon: <CalculateIcon />,
        roles: ['super_admin', 'secretaria']
      },
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
        icon: <AppRegistrationIcon />,
        roles: ['super_admin', 'secretaria'],
      },
      {
        title: 'Mensualidades',
        to: '/dashboard/pagos',
        icon: <CalculateIcon />,
        roles: ['super_admin', 'secretaria']
      },
      {
        title: 'Migración Mensualidades',
        to: '/dashboard/migracion-mensualidades',
        icon: <HistoryEduIcon />,
        roles: ['super_admin', 'secretaria']
      },
      {
        title: 'Asignaciones',
        to: '/dashboard/plan-estudio',
        icon: <ContactsOutlinedIcon />,
        roles: ['super_admin'],
      },
      {
        title: 'Horarios',
        to: '/dashboard/admin/horario',
        icon: <CalendarTodayOutlinedIcon />,
        roles: ['super_admin', 'secretaria'],
      },
      {
        title: 'Notas y Calificaciones',
        to: '/dashboard/admin/notas',
        icon: <GradeOutlinedIcon />,
        roles: ['super_admin', 'secretaria'],
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
        roles: ['super_admin', 'secretaria']
      },
      {
        title: 'Backups',
        to: '/dashboard/admin/backups',
        icon: <ClassOutlinedIcon />,
        roles: ['super_admin']
      },
      {
        title: 'Configuración',
        to: '/dashboard/configuracion',
        icon: <SettingsOutlinedIcon />,
        permissions: ['configuracion.leer'],
      },
      {
        title: 'Galería Institucional',
        to: '/dashboard/galeria',
        icon: <CollectionsBookmarkOutlinedIcon />,
        roles: ['super_admin', 'secretaria'],
      },
      {
        title: 'Notificaciones Institucionales',
        to: '/dashboard/notificaciones',
        icon: <NotificationAddOutlinedIcon />,
        roles: ['secretaria'],
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
        title: 'Tienda Online',
        to: '/dashboard/padre/productos',
        icon: <ShoppingCartOutlinedIcon />,
        roles: ['padre'],
      }
    ],

  },
  {
    label: 'Financiero',
    items: [
      {
        title: 'Mensualidades',
        to: '/dashboard/padre/financiero',
        icon: <CalculateIcon />,
        roles: ['padre'],
      },
      {
        title: "Transporte",
        to: '/dashboard/padre/transporte',
        icon: <LocalShippingOutlinedIcon />,
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
        title: 'Mis Estudiantes',
        to: '/dashboard/docente/estudiantes',
        icon: <PeopleOutlinedIcon />,
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
        title: 'Calificaciones',
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
        title: 'Actividades y Exámenes',
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
        icon: <CollectionsBookmarkOutlinedIcon />,
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
    items: [
      {
        title: 'Notificaciones',
        to: '/dashboard/notificacion',
        icon: <AppRegistrationIcon />
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
        background: isDark ? "#020518" : "ffffff",
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
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '2px',
            background: isDark
              ? 'linear-gradient(90deg, #f2b93d 0%, #ffe082 60%, transparent 100%)'
              : 'linear-gradient(90deg, #0288d1 0%, #26c6da 60%, transparent 100%)',
          },
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
            {/* Logo */}
            <Box
              sx={{
                width: 56,
                height: 56,
                flexShrink: 0,
                transition: 'transform 0.3s ease',
                transform: hoverLogo ? 'rotate(-5deg)' : 'rotate(0deg)',
              }}
            >
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>

            {/* Textos */}
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Rajdhani", sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isDark ? '#ffffff' : '#263238',
                  lineHeight: 1.2,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Unidad Educativa
              </Typography>

              <Typography
                sx={{
                  fontFamily: '"Rajdhani", sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isDark ? '#f2b93d' : '#0288d1',
                  lineHeight: 1.2,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Particular
              </Typography>

              <Box sx={{ height: '1px', width: '14px', background: '#f9a825', opacity: isDark ? 0.6 : 0.9 }} />

              <Typography
                sx={{
                  fontFamily: '"Rajdhani", sans-serif',
                  fontSize: '9px',
                  fontWeight: 500,
                  color: isDark ? 'rgba(255,215,0,0.7)' : 'rgba(180,130,0,0.85)',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                La Voz de Cristo
              </Typography>

              <Box sx={{ height: '1px', width: '14px', background: '#f9a825', opacity: isDark ? 0.6 : 0.9 }} />
            </Box>
          </Box>
        )}

        {/* Botón colapsar/cerrar */}
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
                backgroundColor: isDark ? alpha('#f2b93d', 0.15) : alpha('#0288d1', 0.1),
              },
            }}
          >
            {isMobile
              ? <CloseIcon sx={{ color: isDark ? '#f2b93d' : '#0288d1' }} />
              : <MenuOutlinedIcon sx={{ color: isDark ? '#f2b93d' : '#0288d1' }} />
            }
          </IconButton>
        </Tooltip>


      </Box>

      {isCollapsed && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={`${user?.username} - ${rolePrincipal}`} placement="right">
            <Box
              sx={{
                width: 44,
                height: 44,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            >
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
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
          pt: 2.5,
          pb: 2,
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
            borderRadius: 3,
          },
        }}
      >
        {sections.map((section, idx) => (
          <MenuSection
            key={`${section.label}-${idx}`}
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
            borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
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
            top: -10,
            left: -10,
            zIndex: 1100,
            p: 1,
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              width: 57,
              height: 57,
              border: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
              boxShadow: isDark
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                backgroundColor: isDark ? '#212d3d' : '#f5f5f5',
              },
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MenuOutlinedIcon sx={{ color: isDark ? '#f2b93d' : '#0288d1', fontSize: 24 }} />
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
              background: isDark ? "#020518" : "ffffff",
              borderRight: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
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
            borderRight: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            transition: 'width 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isDark
              ? '4px 0 24px rgba(0,0,0,0.3)'
              : '4px 0 24px rgba(0,0,0,0.08)',
          }}
        >
          {sidebarContent}
        </Box>
      )}
    </>
  );
};

export default ModernSidebar;