import React, { useState, useEffect, JSX } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  alpha,
  useTheme,
  Zoom,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedUserIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  School as SchoolIcon,
  SupervisorAccount as SupervisorAccountIcon,
  FamilyRestroom as FamilyRestroomIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import usuariosService from '@/services/usuariosService';

interface Stats {
  total: number;
  activos: number;
  inactivos: number;
  verificados: number;
  porRol: {
    [key: string]: number;
  };
}

const StatCard = ({ title, value, subtitle, color, icon, trend }: any) => {
  const theme = useTheme();
  
  return (
    <Zoom in timeout={600}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderRadius: 4,
          border: `2px solid ${color}30`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${color}40`,
            border: `2px solid ${color}60`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color}, transparent)`,
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
            {trend && (
              <Chip 
                label={trend} 
                size="small" 
                icon={trend.startsWith('+') ? <TrendingUpIcon /> : <TrendingDownIcon />}
                sx={{ 
                  bgcolor: trend.startsWith('+') ? '#4caf5020' : '#f4433620',
                  color: trend.startsWith('+') ? '#4caf50' : '#f44336',
                  fontWeight: 700,
                }} 
              />
            )}
          </Box>
          <Typography variant="h3" fontWeight="bold" color={color} mb={1}>
            {value}
          </Typography>
          <Typography variant="body1" fontWeight={600} color="text.primary" mb={0.5}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );
};

export const UsuariosStats: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    activos: 0,
    inactivos: 0,
    verificados: 0,
    porRol: {},
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await usuariosService.listar({ limit: 1000 });
      const usuarios = response.data.usuarios;

      const porRol: { [key: string]: number } = {};
      usuarios.forEach(usuario => {
        usuario.roles?.forEach(rol => {
          porRol[rol.nombre] = (porRol[rol.nombre] || 0) + 1;
        });
      });

      setStats({
        total: usuarios.length,
        activos: usuarios.filter(u => u.activo).length,
        inactivos: usuarios.filter(u => !u.activo).length,
        verificados: usuarios.filter(u => u.verificado).length,
        porRol,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress 
          size={60}
          sx={{
            color: isDark ? '#facc15' : '#0288d1',
          }}
        />
      </Box>
    );
  }

  const porcentajeActivos = stats.total > 0 ? ((stats.activos / stats.total) * 100).toFixed(1) : '0';
  const porcentajeVerificados = stats.total > 0 ? ((stats.verificados / stats.total) * 100).toFixed(1) : '0';

  return (
    <Box>
      {/* Estadísticas Generales */}
      <Typography 
        variant="h5" 
        fontWeight={700} 
        sx={{ 
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Estadísticas Generales
      </Typography>
      
      <Grid container spacing={3} mb={5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Usuarios"
            value={stats.total}
            subtitle="Registrados en el sistema"
            color={isDark ? '#facc15' : '#0288d1'}
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            trend="+12%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Usuarios Activos"
            value={stats.activos}
            subtitle={`${porcentajeActivos}% del total`}
            color="#4caf50"
            icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            trend="+8%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Inactivos"
            value={stats.inactivos}
            subtitle="Sin acceso al sistema"
            color="#f44336"
            icon={<CancelIcon sx={{ fontSize: 32 }} />}
            trend="-5%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Verificados"
            value={stats.verificados}
            subtitle={`${porcentajeVerificados}% del total`}
            color="#9c27b0"
            icon={<VerifiedUserIcon sx={{ fontSize: 32 }} />}
            trend="+15%"
          />
        </Grid>
      </Grid>

      {/* Estadísticas por Rol */}
      <Typography 
        variant="h5" 
        fontWeight={700} 
        sx={{ 
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Distribución por Roles
      </Typography>

      <Grid container spacing={3}>
        {Object.entries(stats.porRol).map(([rol, cantidad]) => {
          const rolConfig: { [key: string]: { color: string; icon: JSX.Element } } = {
            'super admin': { color: '#9c27b0', icon: <SupervisorAccountIcon sx={{ fontSize: 32 }} /> },
            'admin': { color: '#2196f3', icon: <AdminPanelSettingsIcon sx={{ fontSize: 32 }} /> },
            'docente': { color: '#4caf50', icon: <SchoolIcon sx={{ fontSize: 32 }} /> },
            'estudiante': { color: '#ff9800', icon: <PeopleIcon sx={{ fontSize: 32 }} /> },
            'padre': { color: '#f44336', icon: <FamilyRestroomIcon sx={{ fontSize: 32 }} /> },
          };

          const config = rolConfig[rol.toLowerCase()] || { 
            color: '#757575', 
            icon: <PeopleIcon sx={{ fontSize: 32 }} /> 
          };
          const porcentaje = stats.total > 0 ? ((cantidad / stats.total) * 100).toFixed(1) : '0';

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={rol}>
              <StatCard
                title={rol.charAt(0).toUpperCase() + rol.slice(1)}
                value={cantidad}
                subtitle={`${porcentaje}% del total de usuarios`}
                color={config.color}
                icon={config.icon}
                trend={null}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Resumen Visual */}
      <Box sx={{ mt: 5 }}>
        <Card
          sx={{
            borderRadius: 4,
            background: isDark
              ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(2, 136, 209, 0.1) 0%, rgba(1, 87, 155, 0.05) 100%)',
            border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 32px ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Resumen del Sistema
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              El sistema cuenta con <strong>{stats.total} usuarios registrados</strong>, de los cuales{' '}
              <strong>{stats.activos} están activos</strong> ({porcentajeActivos}%) y pueden acceder a la plataforma.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>{stats.verificados} usuarios han verificado</strong> su cuenta ({porcentajeVerificados}%), 
              lo que garantiza la autenticidad de sus perfiles.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UsuariosStats;