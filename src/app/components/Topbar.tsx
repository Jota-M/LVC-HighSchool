'use client';

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  alpha,
  useTheme,
} from '@mui/material';
import { useState, useContext } from 'react';
import { ColorModeContext, tokens } from '../dashboard/theme';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';

export default function DashboardTopBar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colorMode = useContext(ColorModeContext);
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: isDark ? "#020518" : "#ffffff",
borderBottom: `1px solid ${isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15)}`,

      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Título de la página */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: isDark ? '#fff' : '#263238',
          }}
        >
        </Typography>

        {/* Acciones de la derecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notificaciones */}
          <IconButton
            sx={{
              color: isDark ? '#b0bec5' : '#607d8b',
              '&:hover': {
                backgroundColor: isDark
                  ? alpha('#0288d1', 0.1)
                  : alpha('#0288d1', 0.05),
              },
            }}
          >
            <NotificationsOutlinedIcon />
          </IconButton>

          {/* Configuración */}
          <IconButton
            sx={{
              color: isDark ? '#b0bec5' : '#607d8b',
              '&:hover': {
                backgroundColor: isDark
                  ? alpha('#0288d1', 0.1)
                  : alpha('#0288d1', 0.05),
              },
            }}
          >
            <SettingsOutlinedIcon />
          </IconButton>

          {/* Modo oscuro/claro */}
          <IconButton 
            onClick={colorMode.toggleColorMode}
            sx={{ 
              color: isDark ? alpha('#ffffff', 0.8) : '#6b7280',
              '&:hover': { 
                bgcolor: isDark ? alpha('#ffffff', 0.08) : '#f3f4f6',
                color: isDark ? '#ffffff' : '#111827',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {isDark ? (
              <LightModeOutlinedIcon fontSize="small" />
            ) : (
              <DarkModeOutlinedIcon fontSize="small" />
            )}
          </IconButton>

          {/* Avatar con menú */}
          <IconButton
            onClick={handleMenu}
            sx={{
              p: 0,
              ml: 1,
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Avatar
              src="/perfil.jpg"
              sx={{
                width: 40,
                height: 40,
                border: '2px solid #0288d1',
              }}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              mt: 1,
              '& .MuiPaper-root': {
                minWidth: 200,
                boxShadow: isDark
                  ? '0 8px 24px rgba(0,0,0,0.4)'
                  : '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={700}>
                {user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {user?.roles?.map((role) => (
                  <Typography
                    key={role.id}
                    variant="caption"
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      mr: 0.5,
                      borderRadius: 1,
                      backgroundColor: alpha('#0288d1', 0.1),
                      color: '#0288d1',
                      fontWeight: 600,
                    }}
                  >
                    {role.nombre}
                  </Typography>
                ))}
              </Box>
            </Box>

            <Divider />

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Mi Perfil
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Configuración
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Typography color="error">Cerrar Sesión</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}