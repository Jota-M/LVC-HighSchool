'use client';

import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  useTheme,
  Grid,
  Card,
  CardContent,
} from '@mui/material';

import { tokens } from '@/app/dashboard/theme';

import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const stats = [
  {
    title: 'Total Usuarios',
    value: 1247,
    subtitle: '+12 esta semana',
    icon: <PeopleAltIcon />,
    color: 'blueAccent',
  },
  {
    title: 'Usuarios Activos',
    value: 1189,
    subtitle: '95.3% del total',
    icon: <PersonOutlineIcon />,
    color: 'greenAccent',
  },
  {
    title: 'Pendientes',
    value: 23,
    subtitle: 'Requieren aprobación',
    icon: <AccessTimeIcon />,
    color: 'yellow', // custom color in-line
  },
  {
    title: 'Inactivos',
    value: 35,
    subtitle: '2.8% del total',
    icon: <RemoveCircleOutlineIcon />,
    color: 'redAccent',
  },
];

const users = [
  {
    name: 'María González',
    email: 'maria.gonzalez@escuela.edu',
    role: 'Docente',
    status: 'Activo',
    lastAccess: 'Hace 2 horas',
    color: 'greenAccent',
  },
  {
    name: 'Juan Pérez',
    email: 'juan.perez@estudiante.edu',
    role: 'Estudiante',
    status: 'Activo',
    lastAccess: 'Hace 1 día',
    color: 'blueAccent',
  },
  {
    name: 'Ana Silva',
    email: 'ana.silva@secretaria.edu',
    role: 'Secretaría',
    status: 'Activo',
    lastAccess: 'Hace 3 horas',
    color: 'redAccent',
  },
];

const getInitials = (name: string) => {
  const names = name.split(' ');
  return names.map((n) => n[0]).join('');
};

export default function UserDashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Typography variant="h4" mb={3}>
        Gestión de Usuarios
      </Typography>

      {/* === Cards === */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => {
          const cardColor =
            stat.color === 'yellow'
              ? '#facc15' // Amarillo personalizado para pendientes
              : colors[stat.color as keyof typeof colors][500];

          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  backgroundColor: colors.primary[400],
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: cardColor,
                    color: '#fff',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="subtitle2" color={colors.grey[300]}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color={colors.grey[100]}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color={colors.grey[300]}>
                    {stat.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* === Tabla de Usuarios === */}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: colors.primary[400],
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: colors.grey[100] }}>Usuario</TableCell>
              <TableCell sx={{ color: colors.grey[100] }}>Rol</TableCell>
              <TableCell sx={{ color: colors.grey[100] }}>Estado</TableCell>
              <TableCell sx={{ color: colors.grey[100] }}>Último acceso</TableCell>
              <TableCell align="center" sx={{ color: colors.grey[100] }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: colors.blueAccent[500],
                        color: 'white',
                        mr: 2,
                      }}
                    >
                      {getInitials(user.name)}
                    </Avatar>
                    <Box>
                      <Typography color={colors.grey[100]} fontWeight="bold">
                        {user.name}
                      </Typography>
                      <Typography color={colors.grey[300]} variant="body2">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={user.role}
                    sx={{
                      bgcolor: colors[user.color as keyof typeof colors][600],
                      color: colors.grey[100],
                      fontWeight: 600,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={user.status}
                    sx={{
                      bgcolor: colors.greenAccent[600],
                      color: colors.grey[100],
                      fontWeight: 600,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Typography color={colors.grey[200]}>{user.lastAccess}</Typography>
                </TableCell>

                <TableCell align="center">
                  <IconButton>
                    <EditIcon sx={{ color: colors.grey[100] }} />
                  </IconButton>
                  <IconButton>
                    <MoreVertIcon sx={{ color: colors.grey[100] }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* === Botón "Nuevo Usuario" === */}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: colors.blueAccent[500],
            color: 'white',
            '&:hover': {
              backgroundColor: colors.blueAccent[600],
            },
          }}
        >
          + Nuevo Usuario
        </Button>
      </Box>
    </Box>
  );
}
