// components/transporte/RutasTable.tsx
'use client';
import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Place as PlaceIcon,
  DirectionsBus as BusIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  EventSeat as SeatIcon,
} from '@mui/icons-material';
import type { RutaTransporte } from '@/types/transporte';
import transporteService from '@/services/transporte';

interface RutasTableProps {
  rutas: RutaTransporte[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onView: (ruta: RutaTransporte) => void;
  onEdit: (ruta: RutaTransporte) => void;
  onDelete: (ruta: RutaTransporte) => void;
}

export const RutasTable: React.FC<RutasTableProps> = ({
  rutas,
  loading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  const getOcupacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return '#ef4444';
    if (porcentaje >= 70) return '#f59e0b';
    return '#10b981';
  };

  const getInitials = (codigo: string) => {
    return codigo.substring(0, 2).toUpperCase();
  };

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: yellowColor,
            color: isDark ? '#000' : '#fff',
            fontSize: '0.875rem',
            fontWeight: 900,
            border: `2px solid ${alpha(yellowColor, 0.3)}`,
          }}
        >
          <BusIcon sx={{ fontSize: 20 }} />
        </Avatar>
      ),
    },
    {
      field: 'codigo',
      headerName: 'Código',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 900,
            fontSize: '0.7rem',
            backgroundColor: alpha(yellowColor, 0.15),
            color: yellowColor,
            border: `1px solid ${alpha(yellowColor, 0.3)}`,
          }}
        />
      ),
    },
    {
      field: 'nombre',
      headerName: 'Ruta',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ overflow: 'hidden', width: '100%' }}>
          <Typography 
            variant="body2" 
            fontWeight={800} 
            sx={{ 
              mb: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {params.value}
          </Typography>
          {params.row.descripcion && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {params.row.descripcion}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'zona_cobertura',
      headerName: 'Zona',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, overflow: 'hidden' }}>
          <PlaceIcon sx={{ fontSize: 16, color: yellowColor, flexShrink: 0 }} />
          <Typography 
            variant="body2" 
            fontWeight={600}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {params.value || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'horarios',
      headerName: 'Horarios',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {params.row.horario_ida && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 12, color: '#10b981', flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                {params.row.horario_ida}
              </Typography>
            </Box>
          )}
          {params.row.horario_retorno && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 12, color: '#ef4444', flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                {params.row.horario_retorno}
              </Typography>
            </Box>
          )}
          {!params.row.horario_ida && !params.row.horario_retorno && (
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'ocupacion',
      headerName: 'Ocupación',
      width: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const porcentaje = params.row.porcentaje_ocupacion || 0;
        const color = getOcupacionColor(porcentaje);
        
        return (
          <Box sx={{ width: '100%', px: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={porcentaje}
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(color, 0.1),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: color,
                    borderRadius: 4,
                    boxShadow: `0 0 6px ${alpha(color, 0.4)}`,
                  },
                }}
              />
              <Typography
                variant="caption"
                fontWeight={900}
                color={color}
                sx={{ minWidth: 35, textAlign: 'right', fontSize: '0.7rem' }}
              >
                {Number(porcentaje).toFixed(0)}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
              {params.row.cupos_ocupados}/{params.row.capacidad_maxima}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'conductor_responsable',
      headerName: 'Conductor',
      width: 160,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          );
        }
        
        return (
          <Box sx={{ overflow: 'hidden', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              <PersonIcon sx={{ fontSize: 14, color: '#3b82f6', flexShrink: 0 }} />
              <Typography 
                variant="body2" 
                fontWeight={700}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '0.8rem',
                }}
              >
                {params.value}
              </Typography>
            </Box>
            {params.row.telefono_conductor && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 12, color: 'text.secondary', flexShrink: 0 }} />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    fontSize: '0.7rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {params.row.telefono_conductor}
                </Typography>
              </Box>
            )}
          </Box>
        );
      },
    },
    // {
    //   field: 'costo_mensual',
    //   headerName: 'Costo',
    //   width: 100,
    //   align: 'right',
    //   headerAlign: 'right',
    //   renderCell: (params: GridRenderCellParams) => (
    //     <Typography variant="body2" fontWeight={900} color={yellowColor} sx={{ fontSize: '0.8rem' }}>
    //       {transporteService.formatearMonto(params.value)}
    //     </Typography>
    //   ),
    // },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Activa' : 'Inactiva'}
          size="small"
          color={params.value ? 'success' : 'error'}
          sx={{
            fontWeight: 800,
            fontSize: '0.65rem',
            height: 24,
            boxShadow: `0 2px 8px ${alpha(params.value ? '#10b981' : '#ef4444', 0.25)}`,
          }}
        />
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const puedeEliminar = !params.row.estudiantes_asignados || params.row.estudiantes_asignados === 0;
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <Tooltip title="Ver" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(params.row);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: alpha('#3b82f6', 0.1),
                  '&:hover': {
                    backgroundColor: alpha('#3b82f6', 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ViewIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(params.row);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: alpha(yellowColor, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(yellowColor, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <EditIcon sx={{ fontSize: 16, color: yellowColor }} />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={puedeEliminar ? 'Eliminar' : 'Tiene estudiantes'}
              arrow
            >
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(params.row);
                  }}
                  disabled={!puedeEliminar}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: alpha('#ef4444', puedeEliminar ? 0.1 : 0.05),
                    '&:hover': puedeEliminar ? {
                      backgroundColor: alpha('#ef4444', 0.2),
                      transform: 'scale(1.1)',
                    } : {},
                    '&.Mui-disabled': {
                      backgroundColor: alpha('#ef4444', 0.05),
                      opacity: 0.4,
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16, color: puedeEliminar ? '#ef4444' : 'text.disabled' }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Paper
      sx={{
        height: 650,
        borderRadius: '24px',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 24px ${alpha(yellowColor, 0.1)}`,
      }}
    >
      <DataGrid
        rows={rutas}
        columns={columns}
        loading={loading}
        pagination
        paginationMode="server"
        rowCount={totalItems}
        disableRowSelectionOnClick
        paginationModel={{ page: page - 1, pageSize: rowsPerPage }}
        onPaginationModelChange={(model) => {
          onPageChange(model.page + 1);
          if (model.pageSize !== rowsPerPage) {
            onRowsPerPageChange(model.pageSize);
          }
        }}
        pageSizeOptions={[10, 25, 50]}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderColor: alpha(theme.palette.divider, 0.08),
            py: 2,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: isDark 
              ? alpha(yellowColor, 0.08) 
              : alpha(yellowColor, 0.05),
            borderColor: alpha(theme.palette.divider, 0.08),
            fontWeight: 800,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 800,
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: isDark 
                ? alpha(yellowColor, 0.05) 
                : alpha(yellowColor, 0.03),
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderColor: alpha(theme.palette.divider, 0.08),
            backgroundColor: isDark 
              ? alpha('#fff', 0.02) 
              : alpha('#000', 0.01),
          },
        }}
        onRowClick={(params) => onView(params.row)}
      />
    </Paper>
  );
};

export default RutasTable;