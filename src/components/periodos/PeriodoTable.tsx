import React from 'react';
import {
  Card, Box, Typography, Chip, IconButton, Tooltip, Stack, Badge,
  alpha, useTheme, Skeleton, Grid, Divider, Avatar, Fade, Paper,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockIcon from '@mui/icons-material/Lock';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { PeriodoAcademico } from '../../services/periodos';
import periodosService from '../../services/periodos';

// ─── Paleta dinámica ──────────────────────────────────────────────────────────
function usePalette() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = isDark ? '#facc15' : '#0288d1';
  const secondary = isDark ? '#f59e0b' : '#01579b';
  const gradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const textOnPrimary = isDark ? '#000' : '#fff';
  return { isDark, primary, secondary, gradient, textOnPrimary, theme };
}

interface PeriodoTableProps {
  periodos: PeriodoAcademico[];
  loading: boolean;
  onEdit: (periodo: PeriodoAcademico) => void;
  onDelete: (id: number) => void;
  onToggleActivo: (id: number, activo: boolean) => void;
  onCerrar?: (id: number) => void;
  viewMode?: 'table' | 'cards';
}

// ─── Card individual ──────────────────────────────────────────────────────────
const PeriodoCard: React.FC<{
  periodo: PeriodoAcademico;
  onEdit: (periodo: PeriodoAcademico) => void;
  onDelete: (id: number) => void;
  onToggleActivo: (id: number, activo: boolean) => void;
  onCerrar?: (id: number) => void;
  index: number;
}> = ({ periodo, onEdit, onDelete, onToggleActivo, onCerrar, index }) => {
  const { primary, secondary, gradient, textOnPrimary, theme, isDark } = usePalette();

  const daysRemaining = periodosService.calcularDiasRestantes(periodo.fecha_fin);
  const formatDate = (d: string) => periodosService.formatearFecha(d, 'corto');

  // Color del avatar/icono según estado
  const headerGradient = periodo.activo
    ? gradient
    : periodo.cerrado
      ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
      : `linear-gradient(135deg, ${theme.palette.grey[500]}, ${theme.palette.grey[700]})`;

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '20px',
          border: periodo.activo
            ? `2px solid ${primary}`
            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          animation: `slideIn 0.5s ease ${index * 0.08}s both`,
          '@keyframes slideIn': {
            from: { opacity: 0, transform: 'translateY(30px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          background: periodo.activo
            ? `linear-gradient(135deg, ${alpha(primary, 0.06)}, transparent)`
            : undefined,
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 24px ${alpha(primary, 0.25)}`,
            borderColor: primary,
          },
          ...(periodo.cerrado && { opacity: 0.75 }),
        }}
      >
        {/* Badge de estado */}
        <Chip
          label={periodo.activo ? 'ACTIVO' : periodo.cerrado ? 'Cerrado' : 'Inactivo'}
          size="small"
          color={periodo.activo ? 'success' : periodo.cerrado ? 'error' : 'default'}
          icon={periodo.cerrado ? <LockIcon sx={{ fontSize: 14 }} /> : undefined}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1,
            fontWeight: 700,
            fontSize: '0.7rem',
            ...(periodo.activo && {
              animation: 'blink 2s ease-in-out infinite',
              '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
            }),
          }}
        />

        <Box sx={{ p: 3, pt: 6, flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
          {/* Avatar */}
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto 12px',
              borderRadius: 3,
              background: headerGradient,
              boxShadow: `0 8px 16px ${alpha(primary, 0.3)}`,
            }}
          >
            {periodo.cerrado
              ? <LockIcon sx={{ color: '#fff', fontSize: 32 }} />
              : <CalendarMonthIcon sx={{ color: periodo.activo ? textOnPrimary : '#fff', fontSize: 32 }} />
            }
          </Avatar>

          {/* Nombre y código */}
          <Typography variant="h6" fontWeight={800} gutterBottom>
            {periodo.nombre}
          </Typography>
          <Chip
            label={periodo.codigo}
            size="small"
            sx={{
              mb: 0.5,
              fontFamily: 'monospace',
              fontWeight: 700,
              backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
              color: primary,
            }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
            ID: #{periodo.id}
          </Typography>

          <Divider sx={{ my: 1, borderColor: alpha(primary, 0.1) }} />

          {/* Fechas */}
          <Stack spacing={0.75} sx={{ my: 1.5, textAlign: 'left' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>📅 Inicio:</Typography>
              <Typography variant="caption" fontWeight={600}>{formatDate(periodo.fecha_inicio)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>🏁 Fin:</Typography>
              <Typography variant="caption" fontWeight={600}>{formatDate(periodo.fecha_fin)}</Typography>
            </Box>
            {periodo.activo && (
              <Chip
                label={`${daysRemaining} días restantes`} size="small"
                color={daysRemaining < 30 ? 'warning' : 'info'}
                icon={daysRemaining < 30 ? <WarningAmberIcon /> : <AccessTimeIcon />}
                sx={{ alignSelf: 'flex-start', mt: 0.5 }}
              />
            )}
          </Stack>

          {/* Permisos */}
          <Box sx={{ mb: 1.5, textAlign: 'left' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 700, letterSpacing: 0.5 }}>
              PERMISOS
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Tooltip title={periodo.permite_inscripciones ? 'Inscripciones habilitadas' : 'Inscripciones deshabilitadas'}>
                <Chip label="Inscripciones" size="small"
                  color={periodo.permite_inscripciones ? 'success' : 'default'}
                  variant={periodo.permite_inscripciones ? 'filled' : 'outlined'}
                  icon={periodo.permite_inscripciones ? <CheckCircleIcon /> : <CancelIcon />} />
              </Tooltip>
              <Tooltip title={periodo.permite_calificaciones ? 'Calificaciones habilitadas' : 'Calificaciones deshabilitadas'}>
                <Chip label="Calificaciones" size="small"
                  color={periodo.permite_calificaciones ? 'info' : 'default'}
                  variant={periodo.permite_calificaciones ? 'filled' : 'outlined'}
                  icon={periodo.permite_calificaciones ? <CheckCircleIcon /> : <CancelIcon />} />
              </Tooltip>
            </Stack>
          </Box>

          {/* Toggle activo */}
          <Box sx={{ mb: 2, mt: 'auto' }}>
            <Tooltip title={periodo.activo ? 'Desactivar periodo' : 'Activar periodo'}>
              <Chip
                icon={periodo.activo ? <CheckCircleIcon /> : <CancelIcon />}
                label={periodo.activo ? 'Activo' : 'Inactivo'}
                color={periodo.activo ? 'success' : 'default'}
                onClick={() => !periodo.cerrado && onToggleActivo(periodo.id, !periodo.activo)}
                disabled={periodo.cerrado} clickable={!periodo.cerrado}
                sx={{
                  fontWeight: 'bold', cursor: periodo.cerrado ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease', '&:hover:not(:disabled)': { transform: 'scale(1.05)' }
                }}
              />
            </Tooltip>
          </Box>

          {/* Acciones */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="Editar periodo">
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onEdit(periodo); }}
                  disabled={periodo.cerrado}
                  sx={{
                    backgroundColor: alpha(primary, 0.1),
                    color: primary,
                    '&:hover:not(:disabled)': {
                      backgroundColor: alpha(primary, 0.2),
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            {onCerrar && !periodo.cerrado && (
              <Tooltip title="Cerrar periodo">
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onCerrar(periodo.id); }}
                    disabled={periodo.activo}
                    sx={{
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      '&:hover:not(:disabled)': {
                        backgroundColor: theme.palette.warning.main, color: 'white',
                      },
                    }}
                  >
                    <LockIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <Tooltip title="Eliminar periodo">
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onDelete(periodo.id); }}
                  disabled={periodo.activo || periodo.cerrado}
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    '&:hover:not(:disabled)': {
                      backgroundColor: theme.palette.error.main, color: 'white',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Card>
    </Fade>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export const PeriodoTable: React.FC<PeriodoTableProps> = ({
  periodos, loading, onEdit, onDelete, onToggleActivo, onCerrar, viewMode = 'cards'
}) => {
  const { primary, secondary, gradient, textOnPrimary, theme, isDark } = usePalette();

  const formatDate = (d: string) => periodosService.formatearFecha(d, 'corto');
  const getDays = (f: string) => periodosService.calcularDiasRestantes(f);

  // Columnas DataGrid
  const columns: GridColDef[] = [
    {
      field: 'nombre',
      headerName: 'Periodo Académico',
      flex: 1,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams<PeriodoAcademico>) => {
        const periodo = params.row;
        const headerGradient = periodo.activo
          ? gradient
          : periodo.cerrado
            ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
            : `linear-gradient(135deg, ${theme.palette.grey[500]}, ${theme.palette.grey[700]})`;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 40, height: 40, borderRadius: 2,
                background: headerGradient,
              }}
            >
              {periodo.cerrado
                ? <LockIcon sx={{ color: '#fff', fontSize: 20 }} />
                : <CalendarMonthIcon sx={{ color: periodo.activo ? textOnPrimary : '#fff', fontSize: 20 }} />
              }
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700}>
                {periodo.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: #{periodo.id}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'codigo',
      headerName: 'Código',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, borderColor: alpha(primary, 0.4), color: primary }}
        />
      ),
    },
    {
      field: 'fechas',
      headerName: 'Fechas',
      width: 200,
      sortable: false,
      valueGetter: (value: any, row: PeriodoAcademico) => row.fecha_inicio,
      renderCell: (params: GridRenderCellParams<PeriodoAcademico>) => {
        const periodo = params.row;
        return (
          <Stack spacing={0.5} sx={{ py: 0.5 }}>
            <Typography variant="caption">📅 {formatDate(periodo.fecha_inicio)}</Typography>
            <Typography variant="caption">🏁 {formatDate(periodo.fecha_fin)}</Typography>
            {periodo.activo && (
              <Chip label={`${getDays(periodo.fecha_fin)} días`} size="small"
                color={getDays(periodo.fecha_fin) < 30 ? 'warning' : 'info'}
                icon={getDays(periodo.fecha_fin) < 30 ? <WarningAmberIcon /> : <AccessTimeIcon />}
                sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
          </Stack>
        );
      },
    },
    {
      field: 'permisos',
      headerName: 'Permisos',
      width: 160,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (value: any, row: PeriodoAcademico) => row.permite_inscripciones,
      renderCell: (params: GridRenderCellParams<PeriodoAcademico>) => {
        const periodo = params.row;
        return (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Chip label="Inscr." size="small"
              color={periodo.permite_inscripciones ? 'success' : 'default'}
              variant={periodo.permite_inscripciones ? 'filled' : 'outlined'} />
            <Chip label="Calif." size="small"
              color={periodo.permite_calificaciones ? 'info' : 'default'}
              variant={periodo.permite_calificaciones ? 'filled' : 'outlined'} />
          </Stack>
        );
      },
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams<PeriodoAcademico>) => {
        const periodo = params.row;
        return (
          <Stack spacing={0.5} alignItems="center">
            <Chip
              icon={periodo.activo ? <CheckCircleIcon /> : <CancelIcon />}
              label={periodo.activo ? 'Activo' : 'Inactivo'}
              color={periodo.activo ? 'success' : 'default'}
              size="small"
              onClick={() => !periodo.cerrado && onToggleActivo(periodo.id, !periodo.activo)}
              disabled={periodo.cerrado}
              sx={{
                fontWeight: 'bold', cursor: periodo.cerrado ? 'not-allowed' : 'pointer',
                '&:hover:not(:disabled)': { transform: 'scale(1.1)' }
              }}
            />
            {periodo.cerrado && <Chip icon={<LockIcon />} label="Cerrado" size="small" color="error" variant="outlined" />}
          </Stack>
        );
      },
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 140,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<PeriodoAcademico>) => {
        const periodo = params.row;
        return (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Tooltip title="Editar">
              <span>
                <IconButton size="small" onClick={() => onEdit(periodo)} disabled={periodo.cerrado}
                  sx={{
                    bgcolor: alpha(primary, 0.1), color: primary,
                    '&:hover:not(:disabled)': { background: gradient, color: textOnPrimary }
                  }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {onCerrar && !periodo.cerrado && (
              <Tooltip title="Cerrar">
                <span>
                  <IconButton size="small" onClick={() => onCerrar(periodo.id)} disabled={periodo.activo}
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      '&:hover:not(:disabled)': { bgcolor: theme.palette.warning.main, color: 'white' }
                    }}>
                    <LockIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip title="Eliminar">
              <span>
                <IconButton size="small" onClick={() => onDelete(periodo.id)} disabled={periodo.activo || periodo.cerrado}
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    '&:hover:not(:disabled)': { bgcolor: theme.palette.error.main, color: 'white' }
                  }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map(i => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Skeleton variant="rounded" height={420} sx={{ borderRadius: '20px' }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  // ── Estado vacío ──
  if (periodos.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        flexDirection: 'column',
        gap: 2
      }}>
        <CalendarMonthIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
        <Typography variant="h6" color="text.secondary">
          No hay periodos académicos registrados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crea tu primer periodo para comenzar
        </Typography>
      </Box>
    );
  }

  // ── Vista Tabla ──
  if (viewMode === 'table') {
    return (
      <Paper
        sx={{
          height: 600,
          borderRadius: '20px',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <DataGrid
          rows={periodos}
          columns={columns}
          getRowHeight={() => 'auto'}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
              py: 1,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDark
                ? 'rgba(250, 204, 21, 0.1)'
                : 'rgba(2, 136, 209, 0.05)',
              borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
              fontWeight: 700,
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: isDark
                  ? 'rgba(250, 204, 21, 0.05)'
                  : 'rgba(2, 136, 209, 0.05)',
              },
            },
          }}
        />
      </Paper>
    );
  }

  // ── Vista Cards ──
  return (
    <Grid container spacing={3}>
      {periodos.map((periodo, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={periodo.id}>
          <PeriodoCard periodo={periodo} onEdit={onEdit} onDelete={onDelete}
            onToggleActivo={onToggleActivo} onCerrar={onCerrar} index={index} />
        </Grid>
      ))}
    </Grid>
  );
};