// components/pagos/RegistroPagos.tsx - VERSIÓN CON PAGO ANUAL
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
} from '@mui/icons-material';
import { useEstudiantes } from '@/hooks/useEstudiantes';
import { useAcademicos } from '@/hooks/useAcademicos'; 
import type { Estudiante } from '@/types/estudianteTypes';
import type { Mensualidad } from '@/types/pagos';
import { ModalPagoMultiple } from './ModalPagoMultiple';
import { ModalPagoDistribuido } from './ModalPagoDistribuido';
import { ModalPagoAnual } from './PagoAnualDialog';
import { useSnackbar } from 'notistack';
import api from '@/lib/api';
import type { EstudianteConMensualidades } from '@/types/pagos';

interface DatosMatricula {
  id: number;
  numero_matricula: string;
  estudiante_id: number;
  estudiante_nombres: string;
  estudiante_apellido_paterno: string;
  estudiante_codigo: string;
  grado_nombre: string;
  paralelo_nombre: string;
  turno_nombre: string;
  nivel_id: number;
  periodo_academico_id: number;
  es_becado: boolean;
  porcentaje_beca: string;
  estado: string;
}

interface EstudianteConDatos extends Estudiante {
  matricula: DatosMatricula | null;
  mensualidades: Mensualidad[];
  loadingMensualidades: boolean;
}

const MESES_COLORES = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f97316', '#84cc16', '#06b6d4', '#6366f1', '#d946ef'
];

export const RegistroPagos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const { 
    periodoActivo, 
    loading: loadingPeriodo 
  } = useAcademicos({
    autoLoad: true,
    loadPeriodos: true,
    loadTurnos: false,
    loadNiveles: false,
    loadGrados: false,
    loadParalelos: false,
    loadMaterias: false,
    loadGradoMaterias: false
  });

  // Estados
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<EstudianteConDatos[]>([]);
  const [mensualidadesSeleccionadas, setMensualidadesSeleccionadas] = useState<Set<number>>(new Set());
  const [pagoMultipleOpen, setPagoMultipleOpen] = useState(false);
  const [pagoDistribuidoOpen, setPagoDistribuidoOpen] = useState(false);
  const [estudianteParaDistribucion, setEstudianteParaDistribucion] = useState<EstudianteConDatos | null>(null);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [modalGenerarOpen, setModalGenerarOpen] = useState(false);
  const [estudianteParaGenerar, setEstudianteParaGenerar] = useState<EstudianteConDatos | null>(null);
  const [loadingGenerar, setLoadingGenerar] = useState(false);
  
  // 🆕 Estados para Pago Anual
  const [pagoAnualOpen, setPagoAnualOpen] = useState(false);
  const [estudianteParaPagoAnual, setEstudianteParaPagoAnual] = useState<EstudianteConDatos | null>(null);

  // Hooks
  const { 
    estudiantes, 
    isLoading: loadingEstudiantes, 
    actualizarFiltros 
  } = useEstudiantes();

  // Función para recargar mensualidades de un estudiante específico
  const recargarMensualidadesEstudiante = useCallback(async (estudianteId: number) => {
    console.log('🔄 Recargando mensualidades para estudiante:', estudianteId);
    
    setEstudiantesSeleccionados(prev => 
      prev.map(e => e.id === estudianteId 
        ? { ...e, loadingMensualidades: true }
        : e
      )
    );

    try {
      const estudiante = estudiantesSeleccionados.find(e => e.id === estudianteId);
      if (!estudiante?.matricula) {
        console.warn('⚠️ No se encontró matrícula para el estudiante');
        return;
      }

      const { data: mensualidadesData } = await api.get(
        `/api/mensualidad/matricula/${estudiante.matricula.id}`,
        {
          params: { _t: Date.now() }
        }
      );
      
      const mensualidades = mensualidadesData.data.mensualidades || [];

      console.log('✅ Mensualidades recargadas:', mensualidades.length);

      setEstudiantesSeleccionados(prev => 
        prev.map(e => e.id === estudianteId 
          ? { ...e, mensualidades, loadingMensualidades: false }
          : e
        )
      );

    } catch (error) {
      console.error('❌ Error al recargar mensualidades:', error);
      enqueueSnackbar('Error al actualizar las mensualidades', { variant: 'error' });
      
      setEstudiantesSeleccionados(prev => 
        prev.map(e => e.id === estudianteId 
          ? { ...e, loadingMensualidades: false }
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

  // Agregar estudiante con validación de período
  const handleAgregarEstudiante = useCallback(async (estudiante: Estudiante) => {
    if (!periodoActivo) {
      enqueueSnackbar('⚠️ No hay un período académico activo. Por favor, activa un período en Configuración.', { 
        variant: 'error',
        autoHideDuration: 5000
      });
      return;
    }

    if (estudiantesSeleccionados.some(e => e.id === estudiante.id)) {
      enqueueSnackbar('Este estudiante ya está seleccionado', { variant: 'info' });
      return;
    }

    const nuevoEstudiante: EstudianteConDatos = {
      ...estudiante,
      matricula: null,
      mensualidades: [],
      loadingMensualidades: true,
    };

    setEstudiantesSeleccionados(prev => [...prev, nuevoEstudiante]);

    try {
      console.log('🔍 Buscando matrícula para estudiante:', estudiante.id, 'en período:', periodoActivo.id);
      
      const { data } = await api.get('/matricula', {
        params: {
          estudiante_id: estudiante.id,
          periodo_academico_id: periodoActivo.id,
          estado: 'activo'
        }
      });

      console.log('📋 Matrículas encontradas:', data.data?.matriculas?.length || 0);

      let matricula = null;
      if (data.data?.matriculas?.[0]) {
        const { data: detalleData } = await api.get(`/matricula/${data.data.matriculas[0].id}`);
        matricula = detalleData.data.matricula;
        
        console.log('✅ Matrícula cargada:', {
          id: matricula.id,
          periodo_id: matricula.periodo_academico_id,
          grado: matricula.grado_nombre
        });
      }

      if (!matricula) {
        enqueueSnackbar(
          `⚠️ ${estudiante.nombres} no tiene matrícula activa en el período ${periodoActivo.nombre}`,
          { 
            variant: 'warning',
            autoHideDuration: 5000
          }
        );
        setEstudiantesSeleccionados(prev => 
          prev.map(e => e.id === estudiante.id 
            ? { ...e, loadingMensualidades: false }
            : e
          )
        );
        return;
      }

      const { data: mensualidadesData } = await api.get(
        `/api/mensualidad/matricula/${matricula.id}`,
        {
          params: { _t: Date.now() }
        }
      );
      const mensualidades = mensualidadesData.data.mensualidades || [];

      console.log('📅 Mensualidades cargadas:', mensualidades.length);

      setEstudiantesSeleccionados(prev => 
        prev.map(e => e.id === estudiante.id 
          ? { ...e, matricula, mensualidades, loadingMensualidades: false }
          : e
        )
      );

      setExpandidos(prev => new Set([...prev, estudiante.id]));

    } catch (error: any) {
      console.error('❌ Error al cargar datos:', error);
      console.error('📋 Response:', error.response?.data);
      
      enqueueSnackbar('Error al cargar los datos del estudiante', { variant: 'error' });
      
      setEstudiantesSeleccionados(prev => 
        prev.map(e => e.id === estudiante.id 
          ? { ...e, loadingMensualidades: false }
          : e
        )
      );
    }
  }, [estudiantesSeleccionados, enqueueSnackbar, periodoActivo]);

  // Eliminar estudiante
  const handleEliminarEstudiante = useCallback((estudianteId: number) => {
    setEstudiantesSeleccionados(prev => prev.filter(e => e.id !== estudianteId));
    
    setMensualidadesSeleccionadas(prev => {
      const newSet = new Set(prev);
      const estudiante = estudiantesSeleccionados.find(e => e.id === estudianteId);
      estudiante?.mensualidades.forEach(m => newSet.delete(m.id));
      return newSet;
    });
  }, [estudiantesSeleccionados]);

  // Toggle mensualidad
  const handleToggleMensualidad = useCallback((mensualidadId: number) => {
    setMensualidadesSeleccionadas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mensualidadId)) {
        newSet.delete(mensualidadId);
      } else {
        newSet.add(mensualidadId);
      }
      return newSet;
    });
  }, []);

  // Toggle todas del estudiante
  const handleToggleTodasEstudiante = useCallback((estudiante: EstudianteConDatos) => {
    const mensualidadesPendientes = estudiante.mensualidades.filter(
      m => m.estado === 'pendiente' || m.estado === 'vencido'
    );
    
    const todasSeleccionadas = mensualidadesPendientes.every(m => 
      mensualidadesSeleccionadas.has(m.id)
    );

    setMensualidadesSeleccionadas(prev => {
      const newSet = new Set(prev);
      if (todasSeleccionadas) {
        mensualidadesPendientes.forEach(m => newSet.delete(m.id));
      } else {
        mensualidadesPendientes.forEach(m => newSet.add(m.id));
      }
      return newSet;
    });
  }, [mensualidadesSeleccionadas]);

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
  const handleAbrirPagoDistribuido = useCallback((estudiante: EstudianteConDatos) => {
    if (!estudiante.matricula) {
      enqueueSnackbar('El estudiante no tiene matrícula activa', { variant: 'warning' });
      return;
    }

    const pendientes = estudiante.mensualidades.filter(
      m => m.estado === 'pendiente' || m.estado === 'vencido' || m.estado === 'pagado_parcial'
    );

    if (pendientes.length === 0) {
      enqueueSnackbar('No hay mensualidades pendientes', { variant: 'info' });
      return;
    }

    setEstudianteParaDistribucion(estudiante);
    setPagoDistribuidoOpen(true);
  }, [enqueueSnackbar]);

  // 🆕 Abrir pago anual
  const handleAbrirPagoAnual = useCallback((estudiante: EstudianteConDatos) => {
    if (!estudiante.matricula) {
      enqueueSnackbar('El estudiante no tiene matrícula activa', { variant: 'warning' });
      return;
    }

    const pendientes = estudiante.mensualidades.filter(
      m => m.estado === 'pendiente' || m.estado === 'vencido'
    );

    if (pendientes.length < 10) {
      enqueueSnackbar(
        `⚠️ Se necesitan 10 mensualidades pendientes para pago anual. Actualmente hay ${pendientes.length} disponibles.`,
        { variant: 'warning', autoHideDuration: 5000 }
      );
      return;
    }

    setEstudianteParaPagoAnual(estudiante);
    setPagoAnualOpen(true);
  }, [enqueueSnackbar]);

  // Abrir modal para generar mensualidades
  const handleAbrirModalGenerar = useCallback((estudiante: EstudianteConDatos) => {
    if (!estudiante.matricula) {
      enqueueSnackbar('El estudiante no tiene matrícula activa', { variant: 'warning' });
      return;
    }
    setEstudianteParaGenerar(estudiante);
    setModalGenerarOpen(true);
  }, [enqueueSnackbar]);

  // Generar mensualidades
  const handleGenerarMensualidades = useCallback(async () => {
    if (!estudianteParaGenerar?.matricula) {
      enqueueSnackbar('No hay datos de matrícula disponibles', { variant: 'error' });
      return;
    }

    const matricula = estudianteParaGenerar.matricula;

    if (!matricula.nivel_id) {
      enqueueSnackbar('❌ Error: La matrícula no tiene nivel académico asignado', { 
        variant: 'error' 
      });
      return;
    }

    if (!matricula.periodo_academico_id) {
      enqueueSnackbar('❌ Error: La matrícula no tiene período académico asignado', { 
        variant: 'error' 
      });
      return;
    }

    setLoadingGenerar(true);

    try {
      const porcentajeBeca = matricula.es_becado 
        ? parseFloat(matricula.porcentaje_beca || '0')
        : 0;

      console.log('📤 Generando mensualidades con:', {
        matricula_id: matricula.id,
        periodo_academico_id: matricula.periodo_academico_id,
        nivel_academico_id: matricula.nivel_id,
        porcentaje_beca: porcentajeBeca
      });

      const { data } = await api.post('/api/mensualidad/generar', {
        matricula_id: matricula.id,
        periodo_academico_id: matricula.periodo_academico_id,
        nivel_academico_id: matricula.nivel_id,
        porcentaje_beca: porcentajeBeca
      });

      enqueueSnackbar(
        `✅ 10 mensualidades generadas exitosamente para ${estudianteParaGenerar.nombres}`,
        { variant: 'success' }
      );

      await recargarMensualidadesEstudiante(estudianteParaGenerar.id);

      setModalGenerarOpen(false);
      setEstudianteParaGenerar(null);

    } catch (error: any) {
      console.error('❌ Error al generar mensualidades:', error);
      console.error('📋 Response:', error.response?.data);
      
      let errorMsg = 'Error al generar mensualidades';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
        
        if (errorMsg.includes('configuración de costo')) {
          errorMsg = '⚠️ No existe configuración de costo para este nivel y período.\n\n' +
                    'Por favor, ve a Configuración → Costos de Mensualidad y crea la configuración necesaria.';
        } else if (errorMsg.includes('Ya existen mensualidades')) {
          errorMsg = '⚠️ Este estudiante ya tiene mensualidades generadas.';
        }
      }
      
      enqueueSnackbar(errorMsg, { 
        variant: 'error',
        autoHideDuration: 6000 
      });
    } finally {
      setLoadingGenerar(false);
    }
  }, [estudianteParaGenerar, enqueueSnackbar, recargarMensualidadesEstudiante]);

  // Calcular total seleccionado
  const totalSeleccionado = React.useMemo(() => {
    let total = 0;
    estudiantesSeleccionados.forEach(est => {
      est.mensualidades.forEach(mens => {
        if (mensualidadesSeleccionadas.has(mens.id)) {
          const saldo = parseFloat((mens.saldo_pendiente ?? mens.monto_final).toString()) || 0;
          total += saldo;
        }
      });
    });
    return total;
  }, [estudiantesSeleccionados, mensualidadesSeleccionadas]);

  // Preparar datos para modal de pago múltiple
  const datosParaPagoMultiple = React.useMemo((): EstudianteConMensualidades[] => {
    return estudiantesSeleccionados
      .filter(est => est.matricula)
      .map(est => ({
        estudiante_id: est.id,
        estudiante_codigo: est.codigo,
        nombres: est.nombres,
        apellidos: `${est.apellido_paterno} ${est.apellido_materno || ''}`.trim(),
        grado: est.matricula?.grado_nombre || '',
        paralelo: est.matricula?.paralelo_nombre || '',
        matricula_id: est.matricula!.id,
        mensualidades: est.mensualidades
          .filter(m => mensualidadesSeleccionadas.has(m.id))
          .map(m => ({
            mensualidad_id: m.id,
            numero_cuota: m.numero_cuota,
            mes_correspondiente: m.mes_correspondiente,
            fecha_vencimiento: m.fecha_vencimiento,
            monto_final: parseFloat(m.monto_final.toString()),
            saldo_pendiente: parseFloat((m.saldo_pendiente ?? m.monto_final).toString()),
            total_pagado: parseFloat((m.total_pagado ?? 0).toString()),
            estado: m.estado,
          }))
      }))
      .filter(est => est.mensualidades.length > 0);
  }, [estudiantesSeleccionados, mensualidadesSeleccionadas]);

  // Abrir pago múltiple
  const handleAbrirPagoMultiple = useCallback(() => {
    if (mensualidadesSeleccionadas.size === 0) {
      enqueueSnackbar('Seleccione al menos una mensualidad', { variant: 'warning' });
      return;
    }
    setPagoMultipleOpen(true);
  }, [mensualidadesSeleccionadas, enqueueSnackbar]);

  // Success callback para pago múltiple
  const handlePagoSuccess = useCallback(async () => {
    console.log('✅ Pago múltiple exitoso - Recargando datos');
    setPagoMultipleOpen(false);
    setMensualidadesSeleccionadas(new Set());
    
    const promesas = estudiantesSeleccionados.map(est => 
      recargarMensualidadesEstudiante(est.id)
    );
    
    await Promise.all(promesas);
    
    enqueueSnackbar('Mensualidades actualizadas correctamente', { variant: 'success' });
  }, [estudiantesSeleccionados, recargarMensualidadesEstudiante, enqueueSnackbar]);

  // Success callback para pago distribuido
  const handlePagoDistribuidoSuccess = useCallback(async () => {
    console.log('✅ Pago distribuido exitoso - Recargando datos');
    setPagoDistribuidoOpen(false);
    
    if (estudianteParaDistribucion) {
      await recargarMensualidadesEstudiante(estudianteParaDistribucion.id);
      enqueueSnackbar('Pago distribuido registrado y mensualidades actualizadas', { variant: 'success' });
    }
    
    setEstudianteParaDistribucion(null);
  }, [estudianteParaDistribucion, recargarMensualidadesEstudiante, enqueueSnackbar]);

  // 🆕 Success callback para pago anual
  const handlePagoAnualSuccess = useCallback(async () => {
    console.log('✅ Pago anual exitoso - Recargando datos');
    setPagoAnualOpen(false);
    
    if (estudianteParaPagoAnual) {
      await recargarMensualidadesEstudiante(estudianteParaPagoAnual.id);
      enqueueSnackbar('Pago anual registrado y mensualidades actualizadas', { variant: 'success' });
    }
    
    setEstudianteParaPagoAnual(null);
  }, [estudianteParaPagoAnual, recargarMensualidadesEstudiante, enqueueSnackbar]);

  // Render card de mensualidad
  const renderMensualidadCard = (
    mensualidad: Mensualidad, 
    estudiante: EstudianteConDatos,
    index: number
  ) => {
    const isSeleccionada = mensualidadesSeleccionadas.has(mensualidad.id);
    const isPagada = mensualidad.estado === 'pagado';
    const isVencida = mensualidad.estado === 'vencido';
    const montoFinal = parseFloat(mensualidad.monto_final.toString());
    const saldoPendiente = parseFloat((mensualidad.saldo_pendiente ?? mensualidad.monto_final).toString());
    const color = MESES_COLORES[index % MESES_COLORES.length];

    return (
      <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={mensualidad.id}>
        <Card
          onClick={() => {
            if (!isPagada && modoSeleccion) {
              handleToggleMensualidad(mensualidad.id);
            }
          }}
          sx={{
            borderRadius: '16px',
            cursor: isPagada ? 'default' : modoSeleccion ? 'pointer' : 'default',
            border: `3px solid ${
              isSeleccionada 
                ? color
                : isPagada 
                  ? alpha('#10b981', 0.3)
                  : alpha(color, 0.2)
            }`,
            background: isPagada
              ? alpha('#10b981', 0.05)
              : isSeleccionada
                ? alpha(color, 0.1)
                : 'transparent',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isSeleccionada ? 'scale(1.02)' : 'scale(1)',
            boxShadow: isSeleccionada 
              ? `0 8px 24px ${alpha(color, 0.3)}`
              : 'none',
            '&:hover': !isPagada && modoSeleccion ? {
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
                  Cuota {mensualidad.numero_cuota}
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    textTransform: 'capitalize',
                    color: isPagada ? '#10b981' : color,
                  }}
                >
                  {mensualidad.mes_correspondiente}
                </Typography>
              </Box>

              {modoSeleccion && !isPagada && (
                <Checkbox
                  checked={isSeleccionada}
                  sx={{
                    color: alpha(color, 0.5),
                    '&.Mui-checked': { color },
                  }}
                />
              )}

              {isPagada && (
                <CheckCircle sx={{ color: '#10b981', fontSize: 28 }} />
              )}

              {isVencida && !isPagada && (
                <Warning sx={{ color: '#ef4444', fontSize: 28 }} />
              )}
            </Box>

            <Box 
              sx={{
                my: 2,
                p: 1.5,
                borderRadius: '12px',
                background: alpha(isPagada ? '#10b981' : color, 0.1),
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {isPagada ? 'Pagado' : 'Saldo Pendiente'}
              </Typography>
              <Typography variant="h5" fontWeight={700} color={isPagada ? '#10b981' : color}>
                Bs {(isPagada ? montoFinal : saldoPendiente).toFixed(2)}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <CalendarMonth fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary">
                {new Date(mensualidad.fecha_vencimiento).toLocaleDateString('es-BO')}
              </Typography>
            </Box>

            {isVencida && !isPagada && (
              <Chip
                label="VENCIDA"
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

  if (loadingPeriodo) {
    return (
      <Box textAlign="center" py={12}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" mt={3}>
          Cargando período académico activo...
        </Typography>
      </Box>
    );
  }

  if (!periodoActivo) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: '16px',
          maxWidth: 600,
          mx: 'auto',
          mt: 4
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ⚠️ No hay período académico activo
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          No se puede registrar pagos sin un período académico activo.
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          Por favor, ve a <strong>Configuración → Períodos Académicos</strong> y activa un período.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header con buscador */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '20px',
          background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
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
                        <Avatar sx={{ bgcolor: isDark ? '#facc15' : '#0288d1' }}>
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

                {mensualidadesSeleccionadas.size > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<Payment />}
                    onClick={handleAbrirPagoMultiple}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                    }}
                  >
                    Pagar Seleccionadas (Bs {totalSeleccionado.toFixed(2)})
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
      {mensualidadesSeleccionadas.size > 0 && (
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
              border: `2px solid ${isDark ? '#facc15' : '#0288d1'}`,
              boxShadow: `0 12px 48px ${alpha(isDark ? '#facc15' : '#0288d1', 0.4)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Resumen de Selección
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Mensualidades:</Typography>
                <Typography fontWeight={700}>{mensualidadesSeleccionadas.size}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="text.secondary">Total:</Typography>
                <Typography variant="h5" fontWeight={700} color={isDark ? '#facc15' : '#0288d1'}>
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
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                }}
              >
                Proceder al Pago
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Lista de estudiantes y sus mensualidades */}
      {estudiantesSeleccionados.length === 0 ? (
        <Box textAlign="center" py={12}>
          <PersonAdd sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} color="text.secondary" gutterBottom>
            No hay estudiantes seleccionados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usa el buscador para agregar estudiantes y ver sus mensualidades
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {estudiantesSeleccionados.map(estudiante => {
            const isExpandido = expandidos.has(estudiante.id);
            const mensualidadesPendientes = estudiante.mensualidades.filter(
              m => m.estado === 'pendiente' || m.estado === 'vencido'
            );
            const todasSeleccionadas = mensualidadesPendientes.every(m => 
              mensualidadesSeleccionadas.has(m.id)
            );

            return (
              <Card
                key={estudiante.id}
                sx={{
                  borderRadius: '20px',
                  background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
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
                          bgcolor: isDark ? '#facc15' : '#0288d1',
                          color: isDark ? '#000' : '#fff',
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
                        <Typography variant="caption" color="text.secondary">
                          {estudiante.codigo}
                          {estudiante.matricula && ` • ${estudiante.matricula.grado_nombre} ${estudiante.matricula.paralelo_nombre}`}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {estudiante.mensualidades.length > 0 && !modoSeleccion && (
                        <>
                          <Tooltip title="Pago Anual Completo - 10% descuento (1 mes gratis)">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AutoAwesome />}
                              onClick={() => handleAbrirPagoAnual(estudiante)}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                },
                              }}
                            >
                              Pago Anual
                            </Button>
                          </Tooltip>

                          <Tooltip title="Pago con monto personalizado y distribución automática">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Calculate />}
                              onClick={() => handleAbrirPagoDistribuido(estudiante)}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: isDark ? '#facc15' : '#0288d1',
                                color: isDark ? '#facc15' : '#0288d1',
                                '&:hover': {
                                  borderColor: isDark ? '#f59e0b' : '#01579b',
                                  background: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                                },
                              }}
                            >
                              Pago Distribuido
                            </Button>
                          </Tooltip>
                        </>
                      )}

                      {estudiante.mensualidades.length > 0 && modoSeleccion && (
                        <Tooltip title={todasSeleccionadas ? 'Deseleccionar todas' : 'Seleccionar todas'}>
                          <IconButton
                            onClick={() => handleToggleTodasEstudiante(estudiante)}
                            sx={{
                              color: isDark ? '#facc15' : '#0288d1',
                            }}
                          >
                            {todasSeleccionadas ? <CheckCircle /> : <Add />}
                          </IconButton>
                        </Tooltip>
                      )}

                      <IconButton
                        onClick={() => handleToggleExpandir(estudiante.id)}
                        sx={{
                          color: isDark ? '#facc15' : '#0288d1',
                        }}
                      >
                        {isExpandido ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Contenido expandible */}
                  <Collapse in={isExpandido}>
                    {estudiante.loadingMensualidades ? (
                      <Box textAlign="center" py={4}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" color="text.secondary" mt={2}>
                          Cargando mensualidades...
                        </Typography>
                      </Box>
                    ) : estudiante.mensualidades.length === 0 ? (
                      <Alert 
                        severity="info" 
                        sx={{ borderRadius: '12px' }}
                        action={
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AutoAwesome />}
                            onClick={() => handleAbrirModalGenerar(estudiante)}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 600,
                              background: isDark
                                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                              color: isDark ? '#000' : '#fff',
                            }}
                          >
                            Generar Mensualidades
                          </Button>
                        }
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Este estudiante no tiene mensualidades generadas
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Genera las 10 mensualidades del año escolar para poder registrar pagos
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
                              {estudiante.mensualidades.filter(m => m.estado === 'pagado').length} / {estudiante.mensualidades.length}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              (estudiante.mensualidades.filter(m => m.estado === 'pagado').length / 
                               estudiante.mensualidades.length) * 100
                            }
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: isDark
                                  ? 'linear-gradient(90deg, #facc15 0%, #f59e0b 100%)'
                                  : 'linear-gradient(90deg, #0288d1 0%, #01579b 100%)',
                              }
                            }}
                          />
                        </Box>

                        {/* Grid de mensualidades */}
                        <Grid container spacing={2}>
                          {estudiante.mensualidades.map((mensualidad, index) => 
                            renderMensualidadCard(mensualidad, estudiante, index)
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

      {/* Modal de Pago Múltiple */}
      {pagoMultipleOpen && (
        <ModalPagoMultiple
          open={pagoMultipleOpen}
          onClose={() => setPagoMultipleOpen(false)}
          estudiantes={datosParaPagoMultiple}
          onSuccess={handlePagoSuccess}
        />
      )}

      {/* Modal de Pago Distribuido */}
      {pagoDistribuidoOpen && estudianteParaDistribucion && (
        <ModalPagoDistribuido
          open={pagoDistribuidoOpen}
          onClose={() => {
            setPagoDistribuidoOpen(false);
            setEstudianteParaDistribucion(null);
          }}
          matriculaId={estudianteParaDistribucion.matricula!.id}
          estudianteNombre={`${estudianteParaDistribucion.nombres} ${estudianteParaDistribucion.apellido_paterno}`}
          mensualidadesPendientes={estudianteParaDistribucion.mensualidades.filter(
            m => m.estado === 'pendiente' || m.estado === 'vencido' || m.estado === 'pagado_parcial'
          )}
          onSuccess={handlePagoDistribuidoSuccess}
        />
      )}

      {/* 🆕 Modal de Pago Anual */}
      {pagoAnualOpen && estudianteParaPagoAnual && (
        <ModalPagoAnual
          open={pagoAnualOpen}
          onClose={() => {
            setPagoAnualOpen(false);
            setEstudianteParaPagoAnual(null);
          }}
          matriculaId={estudianteParaPagoAnual.matricula!.id}
          estudianteNombre={`${estudianteParaPagoAnual.nombres} ${estudianteParaPagoAnual.apellido_paterno}`}
          estudianteCodigo={estudianteParaPagoAnual.codigo}
          mensualidades={estudianteParaPagoAnual.mensualidades}
          onSuccess={handlePagoAnualSuccess}
        />
      )}

      {/* Modal para Generar Mensualidades */}
      <Dialog
        open={modalGenerarOpen}
        onClose={() => !loadingGenerar && setModalGenerarOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: isDark ? alpha('#000', 0.95) : alpha('#fff', 0.98),
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesome sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Generar Mensualidades
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sistema de 10 meses
                </Typography>
              </Box>
            </Box>
            {!loadingGenerar && (
              <IconButton onClick={() => setModalGenerarOpen(false)} size="small">
                <Close />
              </IconButton>
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Información del estudiante */}
            <Card
              sx={{
                borderRadius: '16px',
                background: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: isDark ? '#facc15' : '#0288d1',
                      color: isDark ? '#000' : '#fff',
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {estudianteParaGenerar?.nombres.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={700}>
                      {estudianteParaGenerar?.nombres} {estudianteParaGenerar?.apellido_paterno}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {estudianteParaGenerar?.codigo}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Matrícula ID:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      #{estudianteParaGenerar?.matricula?.id}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Grado:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {estudianteParaGenerar?.matricula?.grado_nombre}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Paralelo:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {estudianteParaGenerar?.matricula?.paralelo_nombre}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Nivel ID:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {estudianteParaGenerar?.matricula?.nivel_id}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Período ID:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {estudianteParaGenerar?.matricula?.periodo_academico_id}
                    </Typography>
                  </Box>
                  {estudianteParaGenerar?.matricula?.es_becado && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Beca:
                      </Typography>
                      <Chip
                        label={`${estudianteParaGenerar.matricula.porcentaje_beca}% de descuento`}
                        size="small"
                        color="success"
                        sx={{ borderRadius: '8px', fontWeight: 600 }}
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Información del sistema */}
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                📅 Se generarán 10 mensualidades
              </Typography>
              <Typography variant="caption" component="div">
                • Meses: Febrero a Noviembre
              </Typography>
              <Typography variant="caption" component="div">
                • Descuento pago anual: 10% (1 mes gratis)
              </Typography>
              <Typography variant="caption" component="div">
                • Fechas de vencimiento automáticas
              </Typography>
            </Alert>

            {/* Advertencia sobre configuración */}
            <Alert severity="warning" sx={{ borderRadius: '12px' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                ⚠️ Requisitos Importantes
              </Typography>
              <Typography variant="caption" component="div">
                • Debe existir una <strong>configuración de costo</strong> para el nivel y período académico
              </Typography>
              <Typography variant="caption" component="div">
                • Esta acción solo se puede realizar <strong>una vez</strong> por estudiante
              </Typography>
              <Typography variant="caption" component="div">
                • Si hay error, verifica que exista el costo en <strong>Configuración → Costos de Mensualidad</strong>
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setModalGenerarOpen(false)}
            disabled={loadingGenerar}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            Cancelar
          </Button>

          <Box flex={1} />

          <Button
            onClick={handleGenerarMensualidades}
            variant="contained"
            disabled={loadingGenerar}
            startIcon={loadingGenerar ? <CircularProgress size={20} /> : <AutoAwesome />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
            }}
          >
            {loadingGenerar ? 'Generando...' : 'Generar 10 Mensualidades'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};