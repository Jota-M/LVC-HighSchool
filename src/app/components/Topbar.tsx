'use client';
// components/DashboardTopBar.tsx

import {
  AppBar, Toolbar, IconButton, Typography, Avatar, Box,
  Menu, MenuItem, Divider, ListItemIcon, alpha, useTheme,
  Tooltip, Chip, LinearProgress,
} from '@mui/material';
import { useState, useContext, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ColorModeContext } from '../dashboard/theme';
import LightModeOutlinedIcon  from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon   from '@mui/icons-material/DarkModeOutlined';
import SettingsOutlinedIcon   from '@mui/icons-material/SettingsOutlined';
import LogoutIcon             from '@mui/icons-material/Logout';
import PersonIcon             from '@mui/icons-material/Person';
import SearchIcon             from '@mui/icons-material/Search';
import HomeOutlinedIcon       from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon       from '@mui/icons-material/NavigateNext';
import { useAuth }            from '../../context/AuthContext';
import NotificacionCampana    from './NotificacionCampana';

// ── Iniciales ────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

// ── Breadcrumb desde pathname ────────────────────────────────────────
const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const labels: Record<string, string> = {
    dashboard    : 'Dashboard',
    reportes     : 'Reportes',
    usuarios     : 'Usuarios',
    users        : 'Users',
    ventas       : 'Ventas',
    config       : 'Configuración',
    perfil       : 'Mi Perfil',
    docentes     : 'Docentes',
    estudiantes  : 'Estudiantes',
    matriculacion: 'Matrículas',
    pagos        : 'Mensualidades',
    horario      : 'Horarios',
    periodos     : 'Periodos',
    paralelos    : 'Paralelos',
    materias     : 'Materias',
    padre        : 'Portal Padres',
    docente      : 'Portal Docentes',
    estudiante   : 'Portal Estudiantes',
    admin        : 'Admin',
    backups      : 'Backups',
    notificacion : 'Notificaciones',
  };
  return segments.map(s => labels[s] ?? s.charAt(0).toUpperCase() + s.slice(1));
};

export default function DashboardTopBar() {
  const theme      = useTheme();
  const isDark     = theme.palette.mode === 'dark';
  const colorMode  = useContext(ColorModeContext);
  const { user, logout } = useAuth();
  const pathname   = usePathname();

  const [anchorEl,   setAnchorEl]   = useState<null | HTMLElement>(null);
  const [loading,    setLoading]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  const breadcrumbs = getBreadcrumbs(pathname ?? '/');

  // ── Barra de progreso al navegar ─────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setProgress(0);
    const t1 = setTimeout(() => setProgress(60),  100);
    const t2 = setTimeout(() => setProgress(100), 500);
    const t3 = setTimeout(() => setLoading(false), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [pathname]);

  // ── Atajo Ctrl+K / ⌘K ────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(prev => !prev);
    }
    if (e.key === 'Escape') setSearchOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleMenu   = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose  = () => setAnchorEl(null);
  const handleLogout = async () => { handleClose(); await logout(); };

  const primerRol = user?.roles?.[0]?.nombre ?? null;

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background  : isDark ? '#020518' : '#ffffff',
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1)}`,
          position    : 'relative',
          overflow    : 'hidden',
        }}
      >
        {/* Barra de progreso */}
        {loading && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '2.5px', zIndex: 10, bgcolor: 'transparent',
              '& .MuiLinearProgress-bar': {
                background  : 'linear-gradient(90deg, #0288d1, #26c6da)',
                borderRadius: '0 2px 2px 0',
                transition  : 'transform 0.4s ease',
              },
            }}
          />
        )}

        <Toolbar sx={{ 
  justifyContent: 'space-between', 
  minHeight: '56px !important', 
  px: { xs: 1, md: 2 },
  pl: { xs: '64px', md: 2 },  // ← espacio para el botón hamburguesa en mobile
}}>

          {/* ── Breadcrumb desktop ── */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <HomeOutlinedIcon sx={{ fontSize: 16, color: isDark ? alpha('#fff', 0.35) : alpha('#000', 0.3) }} />
            {breadcrumbs.map((crumb, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
                <NavigateNextIcon sx={{ fontSize: 14, color: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.2), mx: 0.25 }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize  : 13,
                    fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                    color     : i === breadcrumbs.length - 1
                      ? (isDark ? '#ffffff' : '#263238')
                      : (isDark ? alpha('#fff', 0.4) : alpha('#000', 0.4)),
                  }}
                >
                  {crumb}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* ── Título mobile ── */}
          <Typography
            sx={{
              display   : { xs: 'block', md: 'none' },
              fontSize  : 14,
              fontWeight: 600,
              color     : isDark ? '#ffffff' : '#263238',
            }}
          >
            {breadcrumbs[breadcrumbs.length - 1] ?? 'Dashboard'}
          </Typography>

          {/* ── Derecha ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, md: 0.75 } }}>

            {/* Buscador — solo desktop */}
            <Box
              onClick={() => setSearchOpen(true)}
              sx={{
                display    : { xs: 'none', md: 'flex' },
                alignItems : 'center',
                gap        : 1,
                px         : 1.5,
                py         : 0.625,
                borderRadius: '8px',
                border     : `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                bgcolor    : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                cursor     : 'pointer',
                minWidth   : 160,
                transition : 'all 0.2s',
                '&:hover'  : {
                  bgcolor    : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05),
                  borderColor: alpha('#0288d1', 0.5),
                },
              }}
            >
              <SearchIcon sx={{ fontSize: 15, color: isDark ? alpha('#fff', 0.35) : alpha('#000', 0.3) }} />
              <Typography variant="caption" sx={{ flex: 1, color: isDark ? alpha('#fff', 0.35) : alpha('#000', 0.3), fontSize: 12 }}>
                Buscar...
              </Typography>
              <Box component="span" sx={{
                fontSize    : 10,
                fontFamily  : 'monospace',
                color       : isDark ? alpha('#fff', 0.25) : alpha('#000', 0.25),
                border      : `1px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
                borderRadius: '4px',
                px          : 0.75,
                py          : 0.25,
                lineHeight  : 1.6,
              }}>
                ⌘K
              </Box>
            </Box>

            {/* Ícono búsqueda — solo mobile */}
            <IconButton
              onClick={() => setSearchOpen(true)}
              size="small"
              sx={{
                display    : { xs: 'flex', md: 'none' },
                color      : isDark ? alpha('#fff', 0.5) : '#607d8b',
                borderRadius: '8px',
                '&:hover'  : { bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05) },
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>

            {/* Campana */}
            <NotificacionCampana />

            {/* Configuración — solo desktop */}
            <IconButton
              size="small"
              sx={{
                display    : { xs: 'none', md: 'flex' },
                color      : isDark ? alpha('#fff', 0.5) : '#607d8b',
                borderRadius: '8px',
                '&:hover'  : { bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05), color: isDark ? '#fff' : '#263238' },
              }}
            >
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>

            {/* Dark / Light */}
            <IconButton
              onClick={colorMode.toggleColorMode}
              size="small"
              sx={{
                color      : isDark ? alpha('#fff', 0.5) : '#607d8b',
                borderRadius: '8px',
                transition : 'all 0.2s ease',
                '&:hover'  : { bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05), color: isDark ? '#fff' : '#263238' },
              }}
            >
              {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>

            {/* Divider — solo desktop */}
            <Box sx={{
              display: { xs: 'none', md: 'block' },
              width: '1px', height: 20,
              bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
              mx: 0.25,
            }} />

            {/* Chip de rol — solo desktop */}
            {primerRol && (
              <Chip
                label={primerRol}
                size="small"
                sx={{
                  display    : { xs: 'none', md: 'flex' },
                  height     : 22,
                  fontSize   : 11,
                  fontWeight : 600,
                  bgcolor    : alpha('#0288d1', isDark ? 0.15 : 0.08),
                  color      : isDark ? '#29b6f6' : '#0277bd',
                  border     : `1px solid ${alpha('#0288d1', isDark ? 0.25 : 0.2)}`,
                  borderRadius: '20px',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}

            {/* Avatar */}
            <Tooltip title={user?.username ?? ''} arrow placement="bottom">
              <IconButton
                onClick={handleMenu}
                sx={{ p: 0, ml: 0.5, position: 'relative', '&:hover': { transform: 'scale(1.05)' }, transition: 'transform 0.2s' }}
              >
                <Avatar
                  sx={{
                    width     : 34,
                    height    : 34,
                    border    : '2px solid #0288d1',
                    bgcolor   : '#0288d1',
                    color     : '#fff',
                    fontWeight: 700,
                    fontSize  : 12,
                  }}
                >
                  {getInitials(user?.username ?? '')}
                </Avatar>
                {/* Punto online */}
                <Box
                  sx={{
                    position    : 'absolute',
                    bottom      : 1,
                    right       : 1,
                    width       : 8,
                    height      : 8,
                    borderRadius: '50%',
                    bgcolor     : '#66bb6a',
                    border      : `1.5px solid ${isDark ? '#020518' : '#ffffff'}`,
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: '0 0 0 0 rgba(102,187,106,0.5)' },
                      '50%'     : { boxShadow: '0 0 0 4px rgba(102,187,106,0)' },
                    },
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              </IconButton>
            </Tooltip>

            {/* Menú del avatar */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                mt: 1.5,
                '& .MuiPaper-root': {
                  minWidth    : 210,
                  boxShadow   : isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" fontWeight={700}>{user?.username}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                <Box sx={{ mt: 1 }}>
                  {user?.roles?.map((role: any) => (
                    <Typography key={role.id} variant="caption" sx={{
                      display     : 'inline-block',
                      px          : 1,
                      py          : 0.5,
                      mr          : 0.5,
                      borderRadius: 1,
                      bgcolor     : alpha('#0288d1', 0.1),
                      color       : '#0288d1',
                      fontWeight  : 600,
                    }}>
                      {role.nombre}
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Divider />

              <MenuItem onClick={handleClose}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                Mi Perfil
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
                Configuración
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                <Typography color="error">Cerrar Sesión</Typography>
              </MenuItem>
            </Menu>

          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Modal de búsqueda global ── */}
      {searchOpen && (
        <Box
          onClick={() => setSearchOpen(false)}
          sx={{
            position: 'fixed',
            inset   : 0,
            zIndex  : 1300,
            bgcolor : alpha('#000', 0.5),
            display : 'flex',
            alignItems    : 'flex-start',
            justifyContent: 'center',
            pt: { xs: '80px', md: '120px' },
            px: { xs: 2, md: 0 },
          }}
        >
          <Box
            onClick={e => e.stopPropagation()}
            sx={{
              width      : '100%',
              maxWidth   : 520,
              bgcolor    : isDark ? '#0d1117' : '#fff',
              borderRadius: '14px',
              border     : `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              boxShadow  : '0 24px 60px rgba(0,0,0,0.35)',
              overflow   : 'hidden',
            }}
          >
            <Box sx={{
              display    : 'flex',
              alignItems : 'center',
              px         : 2,
              py         : 1.5,
              borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            }}>
              <SearchIcon sx={{ color: isDark ? alpha('#fff', 0.4) : alpha('#000', 0.3), mr: 1.5 }} />
              <input
                autoFocus
                placeholder="Buscar páginas, usuarios, reportes..."
                style={{
                  flex      : 1,
                  border    : 'none',
                  outline   : 'none',
                  background: 'transparent',
                  fontSize  : 15,
                  color     : isDark ? '#fff' : '#111',
                  fontFamily: 'inherit',
                }}
              />
              <Box
                component="span"
                onClick={() => setSearchOpen(false)}
                sx={{
                  fontSize   : 11,
                  fontFamily : 'monospace',
                  cursor     : 'pointer',
                  color      : isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                  border     : `1px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
                  borderRadius: '4px',
                  px         : 0.75,
                  py         : 0.25,
                }}
              >
                ESC
              </Box>
            </Box>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="caption" sx={{ color: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3) }}>
                Escribí para buscar...
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}