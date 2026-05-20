// components/transporte/PagosTransporte.tsx
'use client';
import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  useTheme,
  alpha,
  Autocomplete,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  Checkbox,
  Avatar,
  Collapse,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Search,
  Payment,
  CheckCircle,
  Warning,
  CalendarMonth,
  Add,
  ExpandMore,
  ExpandLess,
  PersonAdd,
  Calculate,
  AutoAwesome,
  Close,
  DirectionsBus,
} from '@mui/icons-material';
import { useEstudiantes } from '@/hooks/useEstudiantes';
import { useTransporte } from '@/hooks/useTransporte';
import type { Estudiante } from '@/types/estudianteTypes';
import type { PagoTransporte } from '@/types/transporte';
import { ModalPagoTransporteMultiple } from './Modalpagotransportemultiple';
import { ModalPagoTransporteDistribuido } from './Modalpagotransportedistribuido';
import { useSnackbar } from 'notistack';
import api from '@/lib/api';

interface EstudianteConDatosTransporte extends Estudiante {
  asignacion_id: number | null;
  ruta_nombre: string | null;
  pagos_transporte: PagoTransporte[];
  loadingPagos: boolean;
}

const MESES_COLORES = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f97316', '#84cc16', '#06b6d4', '#6366f1'
];

// Función auxiliar para formatear meses correctamente
const formatearMes = (fecha: string | Date | undefined | null) => {
  // Validar que fecha existe
  if (!fecha) {
    console.warn('⚠️ fecha es undefined o null:', fecha);
    return 'Sin fecha';
  }

  try {
    // Convertir a objeto Date
    const date = new Date(fecha);
    
    // Verificar que es una fecha válida
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Fecha inválida:', fecha);
      return 'Fecha inválida';
    }
    
    // Array de meses en español
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    
    return `${mes} ${año}`;
  } catch (error) {
    console.error('❌ Error al formatear fecha:', error, 'Fecha recibida:', fecha);
    return String(fecha);
  }
};

export const PagosTransporte: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  // Estados
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<EstudianteConDatosTransporte[]>([]);
  const [pagosSeleccionados, setPagosSeleccionados] = useState<Set<number>>(new Set());
  const [pagoMultipleOpen, setPagoMultipleOpen] = useState(false);
  const [pagoDistribuidoOpen, setPagoDistribuidoOpen] = useState(false);
  const [estudianteParaDistribucion, setEstudianteParaDistribucion] = useState<EstudianteConDatosTransporte | null>(null);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [modoSeleccion, setModoSeleccion] = useState(false);

  // Hooks
  const { 
    estudiantes, 
    isLoading: loadingEstudiantes, 
    actualizarFiltros 
  } = useEstudiantes();

  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  // Función para recargar pagos de un estudiante
  const recargarPagosEstudiante = useCallback(async (estudianteId: number) => {
    console.log('🔄 Recargando pagos de transporte para estudiante:', estudianteId);
    
    setEstudiantesSeleccionados(prev => 
      prev.map(e => e.id === estudianteId 
        ? { ...e, loadingPagos: true }
        : e
      )
    );

    try {
      // Buscar el estudiante en el estado actual
      const estudiante = estudiantesSeleccionados.find(e => e.id === estudianteId);
      if (!estudiante?.asignacion_id) {
        console.warn('⚠️ No se encontró asignación para el estudiante');
        setEstudiantesSeleccionados(prev => 
          prev.map(e => e.id === estudianteId 
            ? { ...e, loadingPagos: false }
            : e
          )
        );
        return;
      }

      // Obtener pagos de transporte por asignación específica
      console.log('📡 Obteniendo pagos para asignacion_id:', estudiante.asignacion_id);
      
      const { data: pagosData } = await api.get(
        `/api/pago-transporte`,
        {
          params: { 
            asignacion_transporte_id: estudiante.asignacion_id,  // ✅ NOMBRE CORRECTO
            _t: Date.now() 
          }
        }
      );
      
      const pagos = pagosData.data.pagos || [];

      console.log('✅ Pagos de transporte recargados para estudiante:', estudianteId);
      console.log('📊 Cantidad de pagos:', pagos.length);
      console.log('📅 Detalle de pagos:', pagos.map((p: any) => ({
        id: p.id,
        mes: p.mes_correspondiente,
        estado: p.estado,
        monto: p.monto_final
      })));

      setEstudiantesSeleccionados(prev => 
        prev.map(e => e.id === estudianteId 
          ? { ...e, pagos_transporte: pagos, loadingPagos: false }
          : e
        )
      );

    } catch (error) {
      console.error('❌ Error al recargar pagos:', error);
      enqueueSnackbar('Error al actualizar los pagos de transporte', { variant: 'error' });
      
      setEstudiantesSeleccionados(prev => 
        prev.map(e => e.id === estudianteId 
          ? { ...e, loadingPagos: false }
          : e
        )
      );
    }
  }, [estudiantesSeleccionados, enqueueSnackbar]);

  // Buscar estudiante
  const handleBuscarEstudiante = useCallback((value: string) => {
    const searchValue = value.trim();
    if (searchValue.length >= 2) {
      actualizarFiltros({ 
        search: searchValue, 
        limit: 10,
        activo: true 
      });
    }
  }, [actualizarFiltros]);

  // Agregar estudiante
  const handleAgregarEstudiante = useCallback(async (estudiante: Estudiante) => {
    if (estudiantesSeleccionados.some(e => e.id === estudiante.id)) {
      enqueueSnackbar('Este estudiante ya está seleccionado', { variant: 'info' });
      return;
    }

    const nuevoEstudiante: EstudianteConDatosTransporte = {
      ...estudiante,
      asignacion_id: null,
      ruta_nombre: null,
      pagos_transporte: [],
      loadingPagos: true,
    };

    setEstudiantesSeleccionados(prev => [...prev, nuevoEstudiante]);

    try {
      console.log('🔍 Buscando asignación de transporte para estudiante:', estudiante.id);
      
      // Buscar asignación activa de transporte
      const { data: asignacionData } = await api.get('/api/asignacion-transporte', {
        params: {
          estudiante_id: estudiante.id,
          estado: 'activo'
        }
      });

      const asignacion = asignacionData.data?.asignaciones?.[0];

      if (!asignacion) {
        enqueueSnackbar(
          `⚠️ ${estudiante.nombres} no tiene asignación de transporte activa`,
          { 
            variant: 'warning',
            autoHideDuration: 5000
          }
        );
        setEstudiantesSeleccionados(prev => 
          prev.map(e => e.id === estudiante.id 
            ? { ...e, loadingPagos: false }
            : e
          )
        );
        return;
      }

      console.log('✅ Asignación encontrada:', asignacion.id);
      console.log('🚌 Ruta:', asignacion.ruta_nombre);

      // Obtener pagos de transporte para esta asignación específica
      const { data: pagosData } = await api.get(
        `/api/pago-transporte`,
        {
          params: { 
            asignacion_transporte_id: asignacion.id,  // ✅ NOMBRE CORRECTO
            _t: Date.now() 
          }
        }
      );
      
      const pagos = pagosData.data.pagos || [];

      console.log('📅 Pagos de transporte cargados para estudiante:', estudiante.id);
      console.log('📊 Total de pagos:', pagos.length);
      console.log('🔍 Detalle:', pagos.map((p: any) => ({
        id: p.id,
        mes: p.mes_correspondiente,
        monto: p.monto_final,
        estado: p.estado
      })));

      setEstudiantesSeleccionados(prev => 
        prev.map(e => e.id === estudiante.id 
          ? { 
              ...e, 
              asignacion_id: asignacion.id,
              ruta_nombre: asignacion.ruta_nombre,
              pagos_transporte: pagos, 
              loadingPagos: false 
            }
          : e
        )
      );

      setExpandidos(prev => new Set([...prev, estudiante.id]));

    } catch (error: any) {
      console.error('❌ Error al cargar datos:', error);
      enqueueSnackbar('Error al cargar los datos del estudiante', { variant: 'error' });
      
      setEstudiantesSeleccionados(prev => 
        prev.map(e => e.id === estudiante.id 
          ? { ...e, loadingPagos: false }
          : e
        )
      );
    }
  }, [estudiantesSeleccionados, enqueueSnackbar]);

  // Eliminar estudiante
  const handleEliminarEstudiante = useCallback((estudianteId: number) => {
    setEstudiantesSeleccionados(prev => prev.filter(e => e.id !== estudianteId));
    
    setPagosSeleccionados(prev => {
      const newSet = new Set(prev);
      const estudiante = estudiantesSeleccionados.find(e => e.id === estudianteId);
      estudiante?.pagos_transporte.forEach(p => newSet.delete(p.id));
      return newSet;
    });
  }, [estudiantesSeleccionados]);

  // Toggle pago
  const handleTogglePago = useCallback((pagoId: number) => {
    setPagosSeleccionados(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pagoId)) {
        newSet.delete(pagoId);
      } else {
        newSet.add(pagoId);
      }
      return newSet;
    });
  }, []);

  // Toggle todos los pagos del estudiante
  const handleToggleTodosEstudiante = useCallback((estudiante: EstudianteConDatosTransporte) => {
    const pagosPendientes = estudiante.pagos_transporte.filter(
      p => p.estado === 'pendiente' || p.estado === 'vencido'
    );
    
    const todosSeleccionados = pagosPendientes.every(p => 
      pagosSeleccionados.has(p.id)
    );

    setPagosSeleccionados(prev => {
      const newSet = new Set(prev);
      if (todosSeleccionados) {
        pagosPendientes.forEach(p => newSet.delete(p.id));
      } else {
        pagosPendientes.forEach(p => newSet.add(p.id));
      }
      return newSet;
    });
  }, [pagosSeleccionados]);

  // Toggle expandir
  const handleToggleExpandir = useCallback((estudianteId: number) => {
    setExpandidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(estudianteId)) {
        newSet.delete(estudianteId);
      } else {
        newSet.add(estudianteId);
      }
      return newSet;
    });
  }, []);

  // Abrir pago distribuido
  const handleAbrirPagoDistribuido = useCallback((estudiante: EstudianteConDatosTransporte) => {
    if (!estudiante.asignacion_id) {
      enqueueSnackbar('El estudiante no tiene asignación de transporte activa', { variant: 'warning' });
      return;
    }

    const pendientes = estudiante.pagos_transporte.filter(
      p => p.estado === 'pendiente' || p.estado === 'vencido' || p.estado === 'pagado_parcial'
    );

    if (pendientes.length === 0) {
      enqueueSnackbar('No hay pagos pendientes', { variant: 'info' });
      return;
    }

    setEstudianteParaDistribucion(estudiante);
    setPagoDistribuidoOpen(true);
  }, [enqueueSnackbar]);

  // Calcular total seleccionado
  const totalSeleccionado = React.useMemo(() => {
    let total = 0;
    estudiantesSeleccionados.forEach(est => {
      est.pagos_transporte.forEach(pago => {
        if (pagosSeleccionados.has(pago.id)) {
          const saldo = parseFloat(pago.monto_final.toString()) || 0;
          total += saldo;
        }
      });
    });
    return total;
  }, [estudiantesSeleccionados, pagosSeleccionados]);

  // Abrir pago múltiple
  const handleAbrirPagoMultiple = useCallback(() => {
    if (pagosSeleccionados.size === 0) {
      enqueueSnackbar('Seleccione al menos un pago', { variant: 'warning' });
      return;
    }
    setPagoMultipleOpen(true);
  }, [pagosSeleccionados, enqueueSnackbar]);

  // Success callbacks
  const handlePagoSuccess = useCallback(async () => {
    console.log('✅ Pago múltiple exitoso - Recargando datos');
    setPagoMultipleOpen(false);
    setPagosSeleccionados(new Set());
    
    const promesas = estudiantesSeleccionados.map(est => 
      recargarPagosEstudiante(est.id)
    );
    
    await Promise.all(promesas);
    enqueueSnackbar('Pagos actualizados correctamente', { variant: 'success' });
  }, [estudiantesSeleccionados, recargarPagosEstudiante, enqueueSnackbar]);

  const handlePagoDistribuidoSuccess = useCallback(async () => {
    console.log('✅ Pago distribuido exitoso - Recargando datos');
    setPagoDistribuidoOpen(false);
    
    if (estudianteParaDistribucion) {
      await recargarPagosEstudiante(estudianteParaDistribucion.id);
      enqueueSnackbar('Pago distribuido registrado', { variant: 'success' });
    }
    
    setEstudianteParaDistribucion(null);
  }, [estudianteParaDistribucion, recargarPagosEstudiante, enqueueSnackbar]);

  // Limpiar pagos seleccionados cuando cambie la lista de estudiantes
  React.useEffect(() => {
    console.log('📋 Lista de estudiantes actualizada, limpiando selección');
    setPagosSeleccionados(new Set());
  }, [estudiantesSeleccionados.length]);

  // Render card de pago
  const renderPagoCard = (
    pago: PagoTransporte, 
    estudiante: EstudianteConDatosTransporte,
    index: number
  ) => {
    // Debug: Ver estructura del pago
    if (index === 0) {
      console.log('🔍 Estructura COMPLETA del pago recibido:', JSON.stringify(pago, null, 2));
      console.log('🔍 Campos disponibles:', Object.keys(pago));
      console.log('📅 mes_correspondiente RAW:', (pago as any).mes_correspondiente);
      console.log('📅 Tipo de mes_correspondiente:', typeof (pago as any).mes_correspondiente);
      console.log('📅 Resultado de formatearMes:', formatearMes((pago as any).mes_correspondiente));
    }
    
    const isSeleccionado = pagosSeleccionados.has(pago.id);
    const isPagado = pago.estado === 'pagado';
    const isVencido = pago.estado === 'vencido';
    const montoFinal = parseFloat(pago.monto_final.toString());
    const saldoPendiente = parseFloat(pago.monto_final.toString());
    const color = MESES_COLORES[index % MESES_COLORES.length];

    return (
      <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={pago.id}>
        <Card
          onClick={() => {
            if (!isPagado && modoSeleccion) {
              handleTogglePago(pago.id);
            }
          }}
          sx={{
            borderRadius: '16px',
            cursor: isPagado ? 'default' : modoSeleccion ? 'pointer' : 'default',
            border: `3px solid ${
              isSeleccionado 
                ? color
                : isPagado 
                  ? alpha('#10b981', 0.3)
                  : alpha(color, 0.2)
            }`,
            background: isPagado
              ? alpha('#10b981', 0.05)
              : isSeleccionado
                ? alpha(color, 0.1)
                : 'transparent',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isSeleccionado ? 'scale(1.02)' : 'scale(1)',
            boxShadow: isSeleccionado 
              ? `0 8px 24px ${alpha(color, 0.3)}`
              : 'none',
            '&:hover': !isPagado && modoSeleccion ? {
              transform: 'scale(1.05)',
              boxShadow: `0 12px 32px ${alpha(color, 0.4)}`,
            } : {},
            position: 'relative',
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: alpha(color, 0.8),
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Pago {index + 1}
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    textTransform: 'capitalize',
                    color: isPagado ? '#10b981' : color,
                  }}
                >
                  {formatearMes((pago as any).mes_correspondiente)}
                </Typography>
              </Box>

              {modoSeleccion && !isPagado && (
                <Checkbox
                  checked={isSeleccionado}
                  sx={{
                    color: alpha(color, 0.5),
                    '&.Mui-checked': { color },
                  }}
                />
              )}

              {isPagado && (
                <CheckCircle sx={{ color: '#10b981', fontSize: 28 }} />
              )}

              {isVencido && !isPagado && (
                <Warning sx={{ color: '#ef4444', fontSize: 28 }} />
              )}
            </Box>

            <Box 
              sx={{
                my: 2,
                p: 1.5,
                borderRadius: '12px',
                background: alpha(isPagado ? '#10b981' : color, 0.1),
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {isPagado ? 'Pagado' : 'Saldo Pendiente'}
              </Typography>
              <Typography variant="h5" fontWeight={700} color={isPagado ? '#10b981' : color}>
                Bs {(isPagado ? montoFinal : saldoPendiente).toFixed(2)}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <CalendarMonth fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary">
                {new Date(pago.fecha_vencimiento).toLocaleDateString('es-BO')}
              </Typography>
            </Box>

            {isVencido && !isPagado && (
              <Chip
                label="VENCIDO"
                size="small"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: 12,
                  background: '#ef4444',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 10,
                }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Header con buscador */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '20px',
          background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(yellowColor, 0.2)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{xs: 12, md: 6}}>
              <Autocomplete
                options={estudiantes}
                getOptionLabel={(option) =>
                  `${option.codigo} - ${option.nombres} ${option.apellido_paterno}`
                }
                loading={loadingEstudiantes}
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleAgregarEstudiante(newValue);
                  }
                }}
                onInputChange={(_, newValue) => {
                  handleBuscarEstudiante(newValue);
                }}
                filterOptions={(x) => x}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar Estudiante"
                    placeholder="Código o nombre..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: (
                        <>
                          {loadingEstudiantes ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: yellowColor, color: '#000' }}>
                          {option.nombres.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {option.nombres} {option.apellido_paterno}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.codigo}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                }}
              />
            </Grid>

            <Grid size={{xs: 12, md: 6}}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  color='secondary'
                  variant={modoSeleccion ? 'contained' : 'outlined'}
                  onClick={() => setModoSeleccion(!modoSeleccion)}
                  sx={{ borderRadius: '12px', textTransform: 'none' }}
                >
                  {modoSeleccion ? 'Salir de Selección' : 'Modo Selección'}
                </Button>

                {pagosSeleccionados.size > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<Payment />}
                    onClick={handleAbrirPagoMultiple}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                      color: '#000',
                    }}
                  >
                    Pagar Seleccionados (Bs {totalSeleccionado.toFixed(2)})
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>

          {estudiantesSeleccionados.length > 0 && (
            <Box mt={2} display="flex" gap={1} flexWrap="wrap">
              {estudiantesSeleccionados.map(est => (
                <Chip
                  key={est.id}
                  avatar={<Avatar>{est.nombres.charAt(0)}</Avatar>}
                  label={`${est.nombres} ${est.apellido_paterno}`}
                  onDelete={() => handleEliminarEstudiante(est.id)}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Resumen flotante */}
      {pagosSeleccionados.size > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            minWidth: 300,
          }}
        >
          <Card
            sx={{
              borderRadius: '20px',
              background: isDark 
                ? alpha('#000', 0.95)
                : alpha('#fff', 0.95),
              backdropFilter: 'blur(20px)',
              border: `2px solid ${yellowColor}`,
              boxShadow: `0 12px 48px ${alpha(yellowColor, 0.4)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Resumen de Selección
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Pagos:</Typography>
                <Typography fontWeight={700}>{pagosSeleccionados.size}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="text.secondary">Total:</Typography>
                <Typography variant="h5" fontWeight={700} color={yellowColor}>
                  Bs {totalSeleccionado.toFixed(2)}
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Payment />}
                onClick={handleAbrirPagoMultiple}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                  color: '#000',
                }}
              >
                Proceder al Pago
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Lista de estudiantes */}
      {estudiantesSeleccionados.length === 0 ? (
        <Box textAlign="center" py={12}>
          <PersonAdd sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} color="text.secondary" gutterBottom>
            No hay estudiantes seleccionados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usa el buscador para agregar estudiantes y ver sus pagos de transporte
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {estudiantesSeleccionados.map(estudiante => {
            const isExpandido = expandidos.has(estudiante.id);
            const pagosPendientes = estudiante.pagos_transporte.filter(
              p => p.estado === 'pendiente' || p.estado === 'vencido'
            );
            const todosSeleccionados = pagosPendientes.every(p => 
              pagosSeleccionados.has(p.id)
            );

            return (
              <Card
                key={estudiante.id}
                sx={{
                  borderRadius: '20px',
                  background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(yellowColor, 0.2)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header del estudiante */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56,
                          bgcolor: yellowColor,
                          color: '#000',
                          fontSize: 24,
                          fontWeight: 700,
                        }}
                      >
                        {estudiante.nombres.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {estudiante.nombres} {estudiante.apellido_paterno}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="caption" color="text.secondary">
                            {estudiante.codigo}
                          </Typography>
                          {estudiante.ruta_nombre && (
                            <>
                              <Typography variant="caption" color="text.secondary">•</Typography>
                              <DirectionsBus sx={{ fontSize: 14, color: yellowColor }} />
                              <Typography variant="caption" color="text.secondary">
                                {estudiante.ruta_nombre}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {estudiante.pagos_transporte.length > 0 && !modoSeleccion && (
                        <Tooltip title="Pago con monto personalizado">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Calculate />}
                            onClick={() => handleAbrirPagoDistribuido(estudiante)}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 600,
                              borderColor: yellowColor,
                              color: yellowColor,
                            }}
                          >
                            Pago Distribuido
                          </Button>
                        </Tooltip>
                      )}

                      {estudiante.pagos_transporte.length > 0 && modoSeleccion && (
                        <Tooltip title={todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}>
                          <IconButton
                            onClick={() => handleToggleTodosEstudiante(estudiante)}
                            sx={{ color: yellowColor }}
                          >
                            {todosSeleccionados ? <CheckCircle /> : <Add />}
                          </IconButton>
                        </Tooltip>
                      )}

                      <IconButton
                        onClick={() => handleToggleExpandir(estudiante.id)}
                        sx={{ color: yellowColor }}
                      >
                        {isExpandido ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Contenido expandible */}
                  <Collapse in={isExpandido}>
                    {estudiante.loadingPagos ? (
                      <Box textAlign="center" py={4}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" color="text.secondary" mt={2}>
                          Cargando pagos de transporte...
                        </Typography>
                      </Box>
                    ) : estudiante.pagos_transporte.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: '12px' }}>
                        <Typography variant="body2" fontWeight={600}>
                          Este estudiante no tiene pagos de transporte generados
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Los pagos se generan automáticamente al crear la asignación de transporte
                        </Typography>
                      </Alert>
                    ) : (
                      <>
                        {/* Progress bar */}
                        <Box mb={3}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="caption" color="text.secondary">
                              Progreso de Pagos
                            </Typography>
                            <Typography variant="caption" fontWeight={600}>
                              {estudiante.pagos_transporte.filter(p => p.estado === 'pagado').length} / {estudiante.pagos_transporte.length}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              (estudiante.pagos_transporte.filter(p => p.estado === 'pagado').length / 
                               estudiante.pagos_transporte.length) * 100
                            }
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha(yellowColor, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${yellowColor} 0%, #d97706 100%)`,
                              }
                            }}
                          />
                        </Box>

                        {/* Grid de pagos */}
                        <Grid container spacing={2}>
                          {estudiante.pagos_transporte.map((pago, index) => 
                            renderPagoCard(pago, estudiante, index)
                          )}
                        </Grid>
                      </>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Modales */}
      {pagoMultipleOpen && (
        <ModalPagoTransporteMultiple
          open={pagoMultipleOpen}
          onClose={() => setPagoMultipleOpen(false)}
          pagosSeleccionados={Array.from(pagosSeleccionados)}
          estudiantes={estudiantesSeleccionados}
          onSuccess={handlePagoSuccess}
        />
      )}

      {pagoDistribuidoOpen && estudianteParaDistribucion && (
        <ModalPagoTransporteDistribuido
          open={pagoDistribuidoOpen}
          onClose={() => {
            setPagoDistribuidoOpen(false);
            setEstudianteParaDistribucion(null);
          }}
          asignacionId={estudianteParaDistribucion.asignacion_id!}
          estudianteNombre={`${estudianteParaDistribucion.nombres} ${estudianteParaDistribucion.apellido_paterno}`}
          pagosPendientes={estudianteParaDistribucion.pagos_transporte.filter(
            p => p.estado === 'pendiente' || p.estado === 'vencido' || p.estado === 'pagado_parcial'
          )}
          onSuccess={handlePagoDistribuidoSuccess}
        />
      )}
    </Box>
  );
};

export default PagosTransporte;