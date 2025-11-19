import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  alpha,
  useTheme,
  Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScienceIcon from '@mui/icons-material/Science';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Materia } from '../../services/materias';

interface MateriasTableProps {
  materias: Materia[];
  loading: boolean;
  onEdit: (materia: Materia) => void;
  onDelete: (id: number) => void;
}

export const MateriasTable: React.FC<MateriasTableProps> = ({
  materias,
  loading,
  onEdit,
  onDelete
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={60} sx={{ mb: 1 }} />
          ))}
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      borderRadius: 3,
      boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
      overflow: 'hidden',
    }}>
      <Box sx={{ 
        p: 3, 
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuBookIcon />
          Listado de Materias
          <Chip 
            label={`${materias.length} registros`} 
            size="small" 
            color="primary" 
            sx={{ ml: 1 }}
          />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Gestiona todas las materias del sistema educativo
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.primary.main, 0.08)
            }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Materia</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Área</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Horas/Créditos</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Tipo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                    <Typography variant="h6" color="text.secondary">
                      No hay materias registradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Crea tu primera materia para comenzar
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              materias.map((materia, index) => (
                <TableRow 
                  key={materia.id}
                  sx={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: `slideIn 0.5s ease ${index * 0.1}s both`,
                    '@keyframes slideIn': {
                      from: {
                        opacity: 0,
                        transform: 'translateX(-30px)'
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateX(0)'
                      }
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      transform: 'scale(1.01)',
                      boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
                    }
                  }}
                >
                  {/* Materia */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: materia.area_color || theme.palette.primary.main,
                        width: 40,
                        height: 40
                      }}>
                        <MenuBookIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {materia.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Código: {materia.codigo}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Área */}
                  <TableCell>
                    <Chip
                      label={materia.area_nombre}
                      size="small"
                      sx={{
                        bgcolor: alpha(materia.area_color || theme.palette.primary.main, 0.15),
                        color: materia.area_color,
                        fontWeight: 600,
                        borderLeft: `3px solid ${materia.area_color}`
                      }}
                    />
                  </TableCell>

                  {/* Horas/Créditos */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Horas semanales">
                        <Chip 
                          icon={<AccessTimeIcon />}
                          label={`${materia.horas_semanales || 0}h`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </Tooltip>
                      <Tooltip title="Créditos">
                        <Chip 
                          icon={<EmojiEventsIcon />}
                          label={materia.creditos || 0}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      </Tooltip>
                    </Stack>
                  </TableCell>

                  {/* Tipo */}
                  <TableCell align="center">
                    <Stack spacing={0.5} alignItems="center">
                      {materia.es_obligatoria && (
                        <Chip 
                          label="Obligatoria" 
                          size="small" 
                          color="error"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                      {!materia.es_obligatoria && (
                        <Chip 
                          label="Electiva" 
                          size="small" 
                          color="info"
                          variant="outlined"
                        />
                      )}
                      {materia.tiene_laboratorio && (
                        <Chip 
                          icon={<ScienceIcon />}
                          label="Lab" 
                          size="small" 
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </TableCell>

                  {/* Estado */}
                  <TableCell align="center">
                    <Chip
                      icon={materia.activo ? <CheckCircleIcon /> : <CancelIcon />}
                      label={materia.activo ? 'Activo' : 'Inactivo'}
                      color={materia.activo ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Editar materia">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(materia)}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              transform: 'rotate(15deg) scale(1.2)',
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar materia">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(materia.id)}
                          sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: theme.palette.error.main,
                              color: 'white',
                              transform: 'scale(1.2)',
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};