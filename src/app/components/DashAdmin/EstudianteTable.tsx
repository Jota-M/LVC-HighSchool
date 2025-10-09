import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Typography
} from '@mui/material';
import { tokens } from '@/app/dashboard/theme';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface Student {
  name: string;
  email: string;
  career: string;     // Carrera o grado
  status: string;     // Activo/Inactivo
  average: number;    // Promedio
  lastAccess: string;
  color: string;      // color para el chip de carrera
}

interface EstudianteTableProps {
  users: Student[];
}

const EstudianteTable: React.FC<EstudianteTableProps> = ({ users }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  // Función para mostrar color del chip según promedio
  const averageColor = (avg: number) => {
    if (avg >= 90) return colors.greenAccent[600];
    if (avg >= 75) return colors.greenAccent[600];
    return colors.redAccent[600];
  };

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[400] }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: colors.grey[100] }}>Estudiante</TableCell>
            <TableCell sx={{ color: colors.grey[100] }}>Carrera</TableCell>
            <TableCell sx={{ color: colors.grey[100] }}>Estado</TableCell>
            <TableCell sx={{ color: colors.grey[100] }}>Promedio</TableCell>
            <TableCell sx={{ color: colors.grey[100] }}>Último acceso</TableCell>
            <TableCell align="center" sx={{ color: colors.grey[100] }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((student, index) => (
            <TableRow key={index} hover>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: colors.blueAccent[500], color: 'white', mr: 2 }}>
                    {getInitials(student.name)}
                  </Avatar>
                  <Box>
                    <Typography color={colors.grey[100]} fontWeight="bold">
                      {student.name}
                    </Typography>
                    <Typography color={colors.grey[300]} variant="body2">
                      {student.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={student.career}
                  sx={{
                    bgcolor: colors[student.color as keyof typeof colors][600],
                    color: colors.grey[100],
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={student.status}
                  sx={{
                    bgcolor:
                      student.status.toLowerCase() === 'activo'
                        ? colors.greenAccent[600]
                        : colors.redAccent[600],
                    color: colors.grey[100],
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={student.average.toFixed(2)}
                  sx={{
                    bgcolor: averageColor(student.average),
                    color: colors.grey[900],
                    fontWeight: 600,
                    minWidth: 48,
                    textAlign: 'center',
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography color={colors.grey[200]}>{student.lastAccess}</Typography>
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
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ color: colors.grey[300] }}>
                No se encontraron estudiantes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EstudianteTable;
