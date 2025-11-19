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
  Badge,
  alpha,
  useTheme,
  Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockIcon from '@mui/icons-material/Lock';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { PeriodoAcademico } from '../../services/periodos';
import periodosService from '../../services/periodos';

interface PeriodoTableProps {
  periodos: PeriodoAcademico[];
  loading: boolean;
  onEdit: (periodo: PeriodoAcademico) => void;
  onDelete: (id: number) => void;
  onToggleActivo: (id: number, activo: boolean) => void;
  onCerrar?: (id: number) => void;
}

export const PeriodoTable: React.FC<PeriodoTableProps> = ({
  periodos,
  loading,
  onEdit,
  onDelete,
  onToggleActivo,
  onCerrar
}) => {
  const theme = useTheme();

  const getDaysRemaining = (fecha_fin: string) => {
    return periodosService.calcularDiasRestantes(fecha_fin);
  };

  const formatDate = (dateString: string) => {
    return periodosService.formatearFecha(dateString, 'corto');
  };

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
          <EventNoteIcon />
          Historial de Periodos
          <Chip 
            label={`${periodos.length} registros`} 
            size="small" 
            color="primary" 
            sx={{ ml: 1 }}
          />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Visualiza y gestiona todos los periodos académicos
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
              <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Periodo Académico</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Fechas</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Permisos</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {periodos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CalendarMonthIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                    <Typography variant="h6" color="text.secondary">
                      No hay periodos académicos registrados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Crea tu primer periodo para comenzar
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              periodos.map((periodo, index) => (
                <TableRow 
                  key={periodo.id}
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
                  {/* Nombre */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {periodo.activo && (
                        <Badge 
                          badgeContent="ACTIVO" 
                          color="success"
                          sx={{
                            '& .MuiBadge-badge': {
                              animation: 'blink 2s ease-in-out infinite',
                              '@keyframes blink': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.6 }
                              }
                            }
                          }}
                        >
                          <CalendarMonthIcon color="primary" />
                        </Badge>
                      )}
                      {!periodo.activo && periodo.cerrado && (
                        <Tooltip title="Periodo cerrado">
                          <LockIcon color="disabled" />
                        </Tooltip>
                      )}
                      {!periodo.activo && !periodo.cerrado && (
                        <CalendarMonthIcon color="disabled" />
                      )}
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {periodo.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: #{periodo.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Código */}
                  <TableCell>
                    <Chip 
                      label={periodo.codigo} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  {/* Fechas */}
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        📅 {formatDate(periodo.fecha_inicio)}
                      </Typography>
                      <Typography variant="body2">
                        🏁 {formatDate(periodo.fecha_fin)}
                      </Typography>
                      {periodo.activo && (
                        <Chip 
                          label={`${getDaysRemaining(periodo.fecha_fin)} días restantes`}
                          size="small"
                          color={getDaysRemaining(periodo.fecha_fin) < 30 ? 'warning' : 'info'}
                          icon={getDaysRemaining(periodo.fecha_fin) < 30 ? <WarningAmberIcon /> : <AccessTimeIcon />}
                        />
                      )}
                    </Stack>
                  </TableCell>

                  {/* Permisos */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title={periodo.permite_inscripciones ? "Inscripciones habilitadas" : "Inscripciones deshabilitadas"}>
                        <Chip 
                          label="Inscr."
                          size="small"
                          color={periodo.permite_inscripciones ? "success" : "default"}
                          variant={periodo.permite_inscripciones ? "filled" : "outlined"}
                        />
                      </Tooltip>
                      <Tooltip title={periodo.permite_calificaciones ? "Calificaciones habilitadas" : "Calificaciones deshabilitadas"}>
                        <Chip 
                          label="Calif."
                          size="small"
                          color={periodo.permite_calificaciones ? "info" : "default"}
                          variant={periodo.permite_calificaciones ? "filled" : "outlined"}
                        />
                      </Tooltip>
                    </Stack>
                  </TableCell>

                  {/* Estado */}
                  <TableCell align="center">
                    <Stack direction="column" spacing={0.5} alignItems="center">
                      <Tooltip title={periodo.activo ? "Desactivar periodo" : "Activar periodo"}>
                        <Chip
                          icon={periodo.activo ? <CheckCircleIcon /> : <CancelIcon />}
                          label={periodo.activo ? 'Activo' : 'Inactivo'}
                          color={periodo.activo ? 'success' : 'default'}
                          onClick={() => !periodo.cerrado && onToggleActivo(periodo.id, !periodo.activo)}
                          disabled={periodo.cerrado}
                          sx={{
                            cursor: periodo.cerrado ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            '&:hover:not(:disabled)': {
                              transform: 'scale(1.15)',
                              boxShadow: 3,
                            }
                          }}
                        />
                      </Tooltip>
                      {periodo.cerrado && (
                        <Chip 
                          icon={<LockIcon />}
                          label="Cerrado" 
                          size="small" 
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Editar periodo">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(periodo)}
                          disabled={periodo.cerrado}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover:not(:disabled)': {
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              transform: 'rotate(15deg) scale(1.2)',
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {onCerrar && !periodo.cerrado && (
                        <Tooltip title="Cerrar periodo">
                          <IconButton
                            size="small"
                            onClick={() => onCerrar(periodo.id)}
                            disabled={periodo.activo}
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover:not(:disabled)': {
                                bgcolor: theme.palette.warning.main,
                                color: 'white',
                                transform: 'scale(1.2)',
                              }
                            }}
                          >
                            <LockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Eliminar periodo">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(periodo.id)}
                          disabled={periodo.activo || periodo.cerrado}
                          sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover:not(:disabled)': {
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