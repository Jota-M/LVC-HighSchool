// components/ingresos/RegistroIngresos.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  LinearProgress,
  Switch,
  FormControlLabel,
  Alert,
  Avatar,
  useMediaQuery,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as VerifyIcon,
  Cancel as AnularIcon,
  AttachFile as AttachIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Money as MoneyIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useIngresos } from '@/hooks/Useingresos';
import ingresosService from '@/services/ingresos';
import type { Ingreso, CrearIngresoRequest } from '@/types/ingresos';

export const RegistroIngresos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    tipos,
    ingresos,
    loadingIngresos,
    loadingTipos,
    cargarTipos,
    cargarIngresos,
    crearIngreso,
    verificarIngreso,
    anularIngreso,
  } = useIngresos({
    autoLoad: true,
    loadTipos: true,
    loadIngresos: true,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalles, setOpenDetalles] = useState(false);
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState<Ingreso | null>(null);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtros, setFiltros] = useState({
    search: '',
    tipo_ingreso_id: '',
    metodo_pago: '',
    estado: '',
  });

  const [formData, setFormData] = useState<CrearIngresoRequest>({
    tipo_ingreso_id: 0,
    fecha_ingreso: new Date().toISOString().split('T')[0],
    periodo_academico_id: 1,
    estudiante_id: undefined,
    monto: 0,
    descuento: 0,
    recargo: 0,
    metodo_pago: 'efectivo',
    numero_comprobante: '',
    banco: '',
    numero_referencia: '',
    requiere_factura: false,
    numero_factura: '',
    nit_factura: '',
    razon_social_factura: '',
    observaciones: '',
  });

  const limpiarFormulario = () => {
    setFormData({
      tipo_ingreso_id: 0,
      fecha_ingreso: new Date().toISOString().split('T')[0],
      periodo_academico_id: 1,
      estudiante_id: undefined,
      monto: 0,
      descuento: 0,
      recargo: 0,
      metodo_pago: 'efectivo',
      numero_comprobante: '',
      banco: '',
      numero_referencia: '',
      requiere_factura: false,
      numero_factura: '',
      nit_factura: '',
      razon_social_factura: '',
      observaciones: '',
    });
    setComprobante(null);
  };

  const handleNuevoIngreso = () => {
    limpiarFormulario();
    setOpenDialog(true);
  };

  const handleVerDetalles = (ingreso: Ingreso) => {
    setIngresoSeleccionado(ingreso);
    setOpenDetalles(true);
  };

  const handleVerificar = async (ingreso: Ingreso) => {
    if (confirm(`¿Está seguro de verificar este ingreso?`)) {
      try {
        await verificarIngreso(ingreso.id);
        alert('Ingreso verificado exitosamente');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error al verificar el ingreso');
      }
    }
  };

  const handleAnular = async (ingreso: Ingreso) => {
    const motivo = prompt('Ingrese el motivo de anulación:');
    if (!motivo) return;

    if (confirm(`¿Está seguro de anular este ingreso?`)) {
      try {
        await anularIngreso(ingreso.id, motivo);
        alert('Ingreso anulado exitosamente');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error al anular el ingreso');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'tipo_ingreso_id' || name === 'estudiante_id' || 
              name === 'monto' || name === 'descuento' || name === 'recargo'
                ? parseFloat(value) || 0
                : value,
    }));
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprobante(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validaciones
      const validacionMonto = ingresosService.validarMonto(formData.monto);
      if (!validacionMonto.valido) {
        alert(validacionMonto.mensaje);
        return;
      }

      const validacionDescuento = ingresosService.validarDescuento(formData.descuento || 0, formData.monto);
      if (!validacionDescuento.valido) {
        alert(validacionDescuento.mensaje);
        return;
      }

      await crearIngreso(formData, comprobante || undefined);
      alert('Ingreso registrado exitosamente');
      setOpenDialog(false);
      limpiarFormulario();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar el ingreso');
    }
  };

  const handleFiltrar = () => {
    cargarIngresos({
      search: filtros.search,
      tipo_ingreso_id: filtros.tipo_ingreso_id ? parseInt(filtros.tipo_ingreso_id) : undefined,
      metodo_pago: filtros.metodo_pago as any || undefined,
      estado: filtros.estado as any || undefined,
    });
  };

  const yellowColor = isDark ? '#facc15' : '#f59e0b';
  const montoNeto = ingresosService.calcularMontoNeto(
    formData.monto, 
    formData.descuento, 
    formData.recargo
  );

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return <MoneyIcon sx={{ fontSize: 14 }} />;
      case 'transferencia': return <BankIcon sx={{ fontSize: 14 }} />;
      case 'qr': return <QrCodeIcon sx={{ fontSize: 14 }} />;
      case 'tarjeta': return <CardIcon sx={{ fontSize: 14 }} />;
      default: return <MoneyIcon sx={{ fontSize: 14 }} />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'verificado': return '#10b981';
      case 'registrado': return '#f59e0b';
      case 'anulado': return '#ef4444';
      default: return '#6b7280';
    }
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
          <ReceiptIcon sx={{ fontSize: 20 }} />
        </Avatar>
      ),
    },
    {
      field: 'codigo_ingreso',
      headerName: 'Código',
      width: 130,
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
      field: 'fecha_ingreso',
      headerName: 'Fecha',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
          {ingresosService.formatearFechaCorta(params.value)}
        </Typography>
      ),
    },
    {
      field: 'tipo_ingreso_nombre',
      headerName: 'Tipo de Ingreso',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: alpha(params.row.tipo_ingreso_color || yellowColor, 0.2),
            color: params.row.tipo_ingreso_color || yellowColor,
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'estudiante',
      headerName: 'Estudiante',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.row.estudiante_nombres) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              -
            </Typography>
          );
        }
        
        return (
          <Box sx={{ overflow: 'hidden', width: '100%' }}>
            <Typography 
              variant="body2" 
              fontWeight={700}
              sx={{
                fontSize: '0.8rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {ingresosService.obtenerNombreCompleto(
                params.row.estudiante_nombres,
                params.row.estudiante_apellido_paterno,
                params.row.estudiante_apellido_materno
              )}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'monto_neto',
      headerName: 'Monto',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={900} color={yellowColor} sx={{ fontSize: '0.9rem' }}>
            {ingresosService.formatearMonto(params.value)}
          </Typography>
          {(params.row.descuento > 0 || params.row.recargo > 0) && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Base: {ingresosService.formatearMonto(params.row.monto)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'metodo_pago',
      headerName: 'Método',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getMetodoPagoIcon(params.value)}
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
            {ingresosService.getMetodoPagoLabel(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const color = getEstadoColor(params.value);
        return (
          <Chip
            label={ingresosService.getEstadoIngresoLabel(params.value)}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.65rem',
              height: 24,
              backgroundColor: alpha(color, 0.15),
              color: color,
              border: `1px solid ${alpha(color, 0.3)}`,
              boxShadow: `0 2px 8px ${alpha(color, 0.25)}`,
            }}
          />
        );
      },
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Ver detalles" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleVerDetalles(params.row);
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
          {params.row.estado === 'registrado' && !params.row.anulado && (
            <Tooltip title="Verificar" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerificar(params.row);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: alpha('#10b981', 0.1),
                  '&:hover': {
                    backgroundColor: alpha('#10b981', 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <VerifyIcon sx={{ fontSize: 16, color: '#10b981' }} />
              </IconButton>
            </Tooltip>
          )}
          {!params.row.anulado && (
            <Tooltip title="Anular" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnular(params.row);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: alpha('#ef4444', 0.1),
                  '&:hover': {
                    backgroundColor: alpha('#ef4444', 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <AnularIcon sx={{ fontSize: 16, color: '#ef4444' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  // Vista de cards para mobile
  const MobileCardView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {loadingIngresos ? (
        <Box sx={{ p: 4 }}>
          <LinearProgress sx={{ '& .MuiLinearProgress-bar': { backgroundColor: yellowColor } }} />
        </Box>
      ) : ingresos.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No se encontraron ingresos
            </Typography>
          </CardContent>
        </Card>
      ) : (
        ingresos.map((ingreso) => (
          <Card
            key={ingreso.id}
            sx={{
              borderRadius: '16px',
              border: `1px solid ${alpha(yellowColor, 0.2)}`,
              boxShadow: `0 4px 12px ${alpha(yellowColor, 0.1)}`,
              '&:hover': {
                boxShadow: `0 8px 24px ${alpha(yellowColor, 0.2)}`,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s',
            }}
          >
            <CardContent>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: yellowColor,
                      color: isDark ? '#000' : '#fff',
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Chip
                      label={ingreso.codigo_ingreso}
                      size="small"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        fontSize: '0.7rem',
                        backgroundColor: alpha(yellowColor, 0.15),
                        color: yellowColor,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {ingresosService.formatearFechaCorta(ingreso.fecha_ingreso)}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={ingresosService.getEstadoIngresoLabel(ingreso.estado)}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    backgroundColor: alpha(getEstadoColor(ingreso.estado), 0.15),
                    color: getEstadoColor(ingreso.estado),
                  }}
                />
              </Box>

              {/* Tipo de ingreso */}
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={ingreso.tipo_ingreso_nombre}
                  size="small"
                  sx={{
                    backgroundColor: alpha(ingreso.tipo_ingreso_color || yellowColor, 0.2),
                    color: ingreso.tipo_ingreso_color || yellowColor,
                    fontWeight: 700,
                  }}
                />
              </Box>

              {/* Estudiante */}
              {ingreso.estudiante_nombres && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Estudiante
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {ingresosService.obtenerNombreCompleto(
                      ingreso.estudiante_nombres,
                      ingreso.estudiante_apellido_paterno,
                      ingreso.estudiante_apellido_materno
                    )}
                  </Typography>
                </Box>
              )}

              {/* Monto y método */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Monto
                  </Typography>
                  <Typography variant="h6" fontWeight={900} color={yellowColor}>
                    {ingresosService.formatearMonto(ingreso.monto_neto)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Método de pago
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                    {getMetodoPagoIcon(ingreso.metodo_pago)}
                    <Typography variant="body2" fontWeight={600}>
                      {ingresosService.getMetodoPagoLabel(ingreso.metodo_pago)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Acciones */}
              <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<ViewIcon />}
                  onClick={() => handleVerDetalles(ingreso)}
                  sx={{
                    borderColor: alpha('#3b82f6', 0.3),
                    color: '#3b82f6',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      backgroundColor: alpha('#3b82f6', 0.1),
                    },
                  }}
                >
                  Ver
                </Button>
                {ingreso.estado === 'registrado' && !ingreso.anulado && (
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<VerifyIcon />}
                    onClick={() => handleVerificar(ingreso)}
                    sx={{
                      borderColor: alpha('#10b981', 0.3),
                      color: '#10b981',
                      '&:hover': {
                        borderColor: '#10b981',
                        backgroundColor: alpha('#10b981', 0.1),
                      },
                    }}
                  >
                    Verificar
                  </Button>
                )}
                {!ingreso.anulado && (
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<AnularIcon />}
                    onClick={() => handleAnular(ingreso)}
                    sx={{
                      borderColor: alpha('#ef4444', 0.3),
                      color: '#ef4444',
                      '&:hover': {
                        borderColor: '#ef4444',
                        backgroundColor: alpha('#ef4444', 0.1),
                      },
                    }}
                  >
                    Anular
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

  return (
    <Box>
      {/* Header con filtros */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '24px',
          background: isDark
            ? `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(yellowColor, 0.1)} 0%, ${alpha(yellowColor, 0.02)} 100%)`,
          border: `1px solid ${alpha(yellowColor, 0.2)}`,
          boxShadow: `0 4px 12px ${alpha(yellowColor, 0.1)}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Registro de Ingresos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNuevoIngreso}
              sx={{
                background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                color: '#000',
                fontWeight: 600,
                borderRadius: '12px',
                px: 3,
                boxShadow: `0 4px 12px ${alpha(yellowColor, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(yellowColor, 0.4)}`,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s',
              }}
            >
              Nuevo Ingreso
            </Button>
          </Box>

          {/* Filtros */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Buscar"
                placeholder="Código, estudiante..."
                value={filtros.search}
                onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                select
                label="Tipo de Ingreso"
                value={filtros.tipo_ingreso_id}
                onChange={(e) => setFiltros({ ...filtros, tipo_ingreso_id: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {tipos.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                select
                label="Método de Pago"
                value={filtros.metodo_pago}
                onChange={(e) => setFiltros({ ...filtros, metodo_pago: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="transferencia">Transferencia</MenuItem>
                <MenuItem value="qr">QR</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                select
                label="Estado"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="registrado">Registrado</MenuItem>
                <MenuItem value="verificado">Verificado</MenuItem>
                <MenuItem value="anulado">Anulado</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleFiltrar}
                sx={{
                  background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                  color: '#000',
                  fontWeight: 600,
                  borderRadius: '12px',
                  height: '40px',
                  boxShadow: `0 2px 8px ${alpha(yellowColor, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(yellowColor, 0.4)}`,
                  },
                }}
              >
                Filtrar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla o Cards según el tamaño de pantalla */}
      <Fade in>
        <Box>
          {isMobile ? (
            <MobileCardView />
          ) : (
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
                rows={ingresos}
                columns={columns}
                loading={loadingIngresos}
                pagination
                paginationMode="client"
                disableRowSelectionOnClick
                paginationModel={{ page: page - 1, pageSize: rowsPerPage }}
                onPaginationModelChange={(model) => {
                  setPage(model.page + 1);
                  if (model.pageSize !== rowsPerPage) {
                    setRowsPerPage(model.pageSize);
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
                onRowClick={(params) => handleVerDetalles(params.row)}
              />
            </Paper>
          )}
        </Box>
      </Fade>

      {/* Dialog de creación */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          limpiarFormulario();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: `0 24px 48px ${alpha(yellowColor, 0.2)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
            color: '#000',
            fontWeight: 700,
            borderRadius: '24px 24px 0 0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon />
            Nuevo Ingreso
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tipo de Ingreso *"
                name="tipo_ingreso_id"
                value={formData.tipo_ingreso_id}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value={0}>Seleccione un tipo</MenuItem>
                {tipos.filter(t => t.activo).map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Ingreso"
                name="fecha_ingreso"
                type="date"
                value={formData.fecha_ingreso}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Estudiante"
                name="estudiante_id"
                type="number"
                value={formData.estudiante_id || ''}
                onChange={handleChange}
                helperText="Opcional - Solo si aplica"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monto (Bs) *"
                name="monto"
                type="number"
                value={formData.monto}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Descuento (Bs)"
                name="descuento"
                type="number"
                value={formData.descuento}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Recargo (Bs)"
                name="recargo"
                type="number"
                value={formData.recargo}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert 
                severity="info"
                sx={{
                  borderRadius: '12px',
                  backgroundColor: alpha('#3b82f6', 0.1),
                  border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  Monto Neto: {ingresosService.formatearMonto(montoNeto)}
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Método de Pago *"
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="transferencia">Transferencia Bancaria</MenuItem>
                <MenuItem value="qr">QR</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Comprobante"
                name="numero_comprobante"
                value={formData.numero_comprobante}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            {(formData.metodo_pago === 'transferencia' || formData.metodo_pago === 'qr') && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Banco"
                    name="banco"
                    value={formData.banco}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Referencia"
                    name="numero_referencia"
                    value={formData.numero_referencia}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AttachIcon />}
                sx={{
                  borderRadius: '12px',
                  borderColor: alpha(yellowColor, 0.3),
                  color: yellowColor,
                  height: '48px',
                  '&:hover': {
                    borderColor: yellowColor,
                    backgroundColor: alpha(yellowColor, 0.1),
                  },
                }}
              >
                {comprobante ? comprobante.name : 'Adjuntar Comprobante'}
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={handleArchivoChange}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requiere_factura}
                    onChange={handleChange}
                    name="requiere_factura"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: yellowColor,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: yellowColor,
                      },
                    }}
                  />
                }
                label="Requiere Factura"
              />
            </Grid>
            {formData.requiere_factura && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="NIT"
                    name="nit_factura"
                    value={formData.nit_factura}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Razón Social"
                    name="razon_social_factura"
                    value={formData.razon_social_factura}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setOpenDialog(false);
              limpiarFormulario();
            }}
            sx={{
              borderRadius: '12px',
              px: 3,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
              color: '#000',
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
              boxShadow: `0 4px 12px ${alpha(yellowColor, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(yellowColor, 0.4)}`,
              },
            }}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalles */}
      <Dialog
        open={openDetalles}
        onClose={() => setOpenDetalles(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: `0 24px 48px ${alpha(yellowColor, 0.2)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
            color: '#000',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '24px 24px 0 0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon />
            Detalles del Ingreso
          </Box>
          <IconButton size="small" onClick={() => setOpenDetalles(false)} sx={{ color: '#000' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {ingresoSeleccionado && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Código de Ingreso
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {ingresoSeleccionado.codigo_ingreso}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Tipo de Ingreso
                </Typography>
                <Typography variant="body1">
                  {ingresoSeleccionado.tipo_ingreso_nombre}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Fecha
                </Typography>
                <Typography variant="body2">
                  {ingresosService.formatearFecha(ingresoSeleccionado.fecha_ingreso)}
                </Typography>
              </Box>

              {ingresoSeleccionado.estudiante_nombres && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Estudiante
                  </Typography>
                  <Typography variant="body2">
                    {ingresosService.obtenerNombreCompleto(
                      ingresoSeleccionado.estudiante_nombres,
                      ingresoSeleccionado.estudiante_apellido_paterno,
                      ingresoSeleccionado.estudiante_apellido_materno
                    )}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Montos
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Monto: {ingresosService.formatearMonto(ingresoSeleccionado.monto)}
                  </Typography>
                  {ingresoSeleccionado.descuento > 0 && (
                    <Typography variant="body2" color="success.main">
                      Descuento: -{ingresosService.formatearMonto(ingresoSeleccionado.descuento)}
                    </Typography>
                  )}
                  {ingresoSeleccionado.recargo > 0 && (
                    <Typography variant="body2" color="error">
                      Recargo: +{ingresosService.formatearMonto(ingresoSeleccionado.recargo)}
                    </Typography>
                  )}
                  <Typography variant="h6" fontWeight={700} color={yellowColor}>
                    Total: {ingresosService.formatearMonto(ingresoSeleccionado.monto_neto)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Método de Pago
                </Typography>
                <Typography variant="body2">
                  {ingresosService.getMetodoPagoLabel(ingresoSeleccionado.metodo_pago)}
                </Typography>
              </Box>

              {ingresoSeleccionado.numero_comprobante && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Comprobante
                  </Typography>
                  <Typography variant="body2">
                    {ingresoSeleccionado.numero_comprobante}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Estado
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={ingresosService.getEstadoIngresoLabel(ingresoSeleccionado.estado)}
                    sx={{
                      fontWeight: 800,
                      backgroundColor: alpha(getEstadoColor(ingresoSeleccionado.estado), 0.15),
                      color: getEstadoColor(ingresoSeleccionado.estado),
                    }}
                  />
                </Box>
              </Box>

              {ingresoSeleccionado.verificado && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Verificado por
                  </Typography>
                  <Typography variant="body2">
                    {ingresoSeleccionado.verificado_por_username} - {ingresosService.formatearFecha(ingresoSeleccionado.fecha_verificacion || '')}
                  </Typography>
                </Box>
              )}

              {ingresoSeleccionado.anulado && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2,
                    borderRadius: '12px',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Ingreso Anulado
                  </Typography>
                  {ingresoSeleccionado.motivo_anulacion && (
                    <Typography variant="caption">
                      Motivo: {ingresoSeleccionado.motivo_anulacion}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDetalles(false)}
            sx={{
              borderRadius: '12px',
              px: 3,
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistroIngresos;