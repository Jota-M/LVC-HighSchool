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
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Paper,
  Switch,
  FormControlLabel,
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
  FamilyRestroom,
  School,
  SelectAll,
  DeleteSweep,
  Badge,
  Phone,
  ReceiptLong,
  LocalAtm,
  QrCode2,
  AccountBalance,
  CreditCard,
  Print,
  CheckCircleOutline,
  RestartAlt,
  Delete,
  Payments,
  DoneAll,
  AssignmentTurnedIn,
  PointOfSale,
  Check,
  WhatsApp,
  Send,
} from '@mui/icons-material';
import { useEstudiantes } from '@/hooks/useEstudiantes';
import { useAcademicos } from '@/hooks/useAcademicos'; 
import { tutoresService, type PadreFamiliaBusqueda } from '@/services/tutoresService';
import pagosService from '@/services/pagos';
import type { Estudiante } from '@/types/estudianteTypes';
import type { Mensualidad } from '@/types/pagos';
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

const PERSONAS_QUE_RECIBEN = [
  { value: 'patricia', label: 'Patricia Ramírez Villca', ci: '5070770' },
  { value: 'oswaldo', label: 'Oswaldo Esteban Bohorquez Velasco', ci: '5071886' },
];

export interface ItemCobroDistribuido {
  mensualidad_id: number;
  numero_cuota: number;
  mes_correspondiente: string;
  fecha_vencimiento: string;
  estudiante_id: number;
  estudiante_nombre: string;
  saldo_original: number;
  monto_a_pagar: number;
  saldo_restante: number;
  es_completo: boolean;
  es_adelanto_parcial: boolean;
}

interface CobroExitoso {
  totalPagado: number;
  pagos: Array<{
    pago_id: number;
    codigo_pago: string;
    monto_pagado: number;
    estudiante: string;
    mes: string;
  }>;
  itemsDistribuidos: ItemCobroDistribuido[];
  nombreEntrega: string;
  ciEntrega: string;
  metodoPago: string;
  quienRecibe: string;
}

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
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [modalGenerarOpen, setModalGenerarOpen] = useState(false);
  const [estudianteParaGenerar, setEstudianteParaGenerar] = useState<EstudianteConDatos | null>(null);
  const [loadingGenerar, setLoadingGenerar] = useState(false);

  // 🆕 Estados para Buscador de Padres / Tutores
  const [tipoBusqueda, setTipoBusqueda] = useState<'padre' | 'estudiante'>('padre');
  const [padres, setPadres] = useState<PadreFamiliaBusqueda[]>([]);
  const [loadingPadres, setLoadingPadres] = useState(false);
  const [padreSeleccionado, setPadreSeleccionado] = useState<PadreFamiliaBusqueda | null>(null);
  const [loadingCargarHijos, setLoadingCargarHijos] = useState(false);

  // 🆕 Estados para Checkout / Terminal de Cobro Lateral
  const [formCobro, setFormCobro] = useState({
    metodo_pago: 'efectivo' as 'efectivo' | 'qr',
    monto_recibido: '',
    numero_referencia: '',
    banco_origen: '',
    nombre_entrega: '',
    ci_entrega: '',
    quien_recibe: 'patricia' as 'patricia' | 'oswaldo',
    entrego_factura: false,
    numero_factura: '',
    observaciones: '',
    fecha_pago: '',
  });
  const [loadingCobro, setLoadingCobro] = useState(false);
  const [cobroExitoso, setCobroExitoso] = useState<CobroExitoso | null>(null);
  const [modalWhatsAppOpen, setModalWhatsAppOpen] = useState(false);
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState('');
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);

  // 📢 Modal de Recordatorio de Deuda por WhatsApp
  const [modalRecordatorioOpen, setModalRecordatorioOpen] = useState(false);
  const [recordatorioTelefono, setRecordatorioTelefono] = useState('');
  const [recordatorioMensaje, setRecordatorioMensaje] = useState('');
  const [recordatorioTitulo, setRecordatorioTitulo] = useState('');
  const [enviandoRecordatorio, setEnviandoRecordatorio] = useState(false);

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

  // 🆕 Buscar padres/tutores
  const handleBuscarPadre = useCallback(async (value: string) => {
    const searchValue = value.trim();
    if (searchValue.length < 2) {
      setPadres([]);
      return;
    }

    setLoadingPadres(true);
    try {
      const data = await tutoresService.buscarPadres(searchValue, 12);
      setPadres(data?.tutores || []);
    } catch (error) {
      console.error('Error al buscar padres/tutores:', error);
    } finally {
      setLoadingPadres(false);
    }
  }, []);

  // Función auxiliar para cargar matrícula y mensualidades de un estudiante
  const cargarEstudianteConMatriculaYMensualidades = useCallback(async (estudiante: Estudiante): Promise<EstudianteConDatos | null> => {
    if (!periodoActivo) return null;

    try {
      console.log('🔍 Buscando matrícula para estudiante:', estudiante.id, 'en período:', periodoActivo.id);
      
      const { data } = await api.get('/matricula', {
        params: {
          estudiante_id: estudiante.id,
          periodo_academico_id: periodoActivo.id,
          estado: 'activo'
        }
      });

      let matricula = null;
      if (data.data?.matriculas?.[0]) {
        const { data: detalleData } = await api.get(`/matricula/${data.data.matriculas[0].id}`);
        matricula = detalleData.data.matricula;
      }

      if (!matricula) {
        enqueueSnackbar(
          `⚠️ ${estudiante.nombres} ${estudiante.apellido_paterno} no tiene matrícula activa en ${periodoActivo.nombre}`,
          { 
            variant: 'warning',
            autoHideDuration: 5000
          }
        );
        return {
          ...estudiante,
          matricula: null,
          mensualidades: [],
          loadingMensualidades: false
        };
      }

      const { data: mensualidadesData } = await api.get(
        `/api/mensualidad/matricula/${matricula.id}`,
        {
          params: { _t: Date.now() }
        }
      );
      const mensualidades = mensualidadesData.data?.mensualidades || [];

      return {
        ...estudiante,
        matricula,
        mensualidades,
        loadingMensualidades: false
      };
    } catch (error: any) {
      console.error('❌ Error al cargar datos del estudiante:', error);
      enqueueSnackbar(`Error al cargar datos de ${estudiante.nombres}`, { variant: 'error' });
      return {
        ...estudiante,
        matricula: null,
        mensualidades: [],
        loadingMensualidades: false
      };
    }
  }, [periodoActivo, enqueueSnackbar]);

  // Agregar estudiante individual con validación de período
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

    const resultado = await cargarEstudianteConMatriculaYMensualidades(estudiante);
    if (resultado) {
      setEstudiantesSeleccionados(prev =>
        prev.map(e => e.id === estudiante.id ? resultado : e)
      );
      if (resultado.matricula) {
        setExpandidos(prev => new Set([...prev, estudiante.id]));
      }
    }
  }, [periodoActivo, estudiantesSeleccionados, enqueueSnackbar, cargarEstudianteConMatriculaYMensualidades]);

  // 🆕 Seleccionar padre/tutor y traer a todos sus hijos automáticamente
  const handleSeleccionarPadre = useCallback(async (padre: PadreFamiliaBusqueda | null) => {
    if (!padre) {
      setPadreSeleccionado(null);
      return;
    }

    if (!periodoActivo) {
      enqueueSnackbar('⚠️ No hay un período académico activo. Por favor, activa un período en Configuración.', { 
        variant: 'error',
        autoHideDuration: 5000
      });
      return;
    }

    setPadreSeleccionado(padre);
    setLoadingCargarHijos(true);

    try {
      // 1. Obtener los hijos (estudiantes) del padre
      const hijos = await tutoresService.obtenerEstudiantesDePadre(padre.id);

      if (!hijos || hijos.length === 0) {
        enqueueSnackbar(
          `⚠️ ${padre.nombres} ${padre.apellido_paterno} no tiene estudiantes asignados en el sistema`,
          { variant: 'warning', autoHideDuration: 6000 }
        );
        setLoadingCargarHijos(false);
        return;
      }

      // Filtrar hijos que no estén ya en la lista
      const hijosNuevos = hijos.filter(h => !estudiantesSeleccionados.some(e => e.id === h.id));

      if (hijosNuevos.length === 0) {
        enqueueSnackbar('Todos los estudiantes de este tutor ya están en la lista', { variant: 'info' });
        setLoadingCargarHijos(false);
        return;
      }

      // Añadirlos en estado de carga preliminar
      const nuevosConPlaceholder: EstudianteConDatos[] = hijosNuevos.map(h => ({
        ...h,
        matricula: null,
        mensualidades: [],
        loadingMensualidades: true,
      }));

      setEstudiantesSeleccionados(prev => [...prev, ...nuevosConPlaceholder]);
      enqueueSnackbar(
        `Cargando ${hijosNuevos.length} hijo(s) de ${padre.nombres} ${padre.apellido_paterno}...`,
        { variant: 'info' }
      );

      // Cargar en paralelo datos de matrícula y mensualidades para cada hijo
      const resultados = await Promise.all(
        hijosNuevos.map(hijo => cargarEstudianteConMatriculaYMensualidades(hijo))
      );

      // Actualizar estudiantes en el estado
      setEstudiantesSeleccionados(prev =>
        prev.map(e => {
          const res = resultados.find(r => r && r.id === e.id);
          return res || e;
        })
      );

      // Expandir los que tienen matrícula
      const idsConMatricula = resultados.filter(r => r && r.matricula).map(r => r!.id);
      setExpandidos(prev => new Set([...prev, ...idsConMatricula]));

      const totalConMatricula = resultados.filter(r => r && r.matricula).length;
      enqueueSnackbar(
        `✅ Se cargaron ${totalConMatricula} estudiante(s) de ${padre.nombres} ${padre.apellido_paterno}`,
        { variant: 'success' }
      );

      // Prellenar datos de cobro/facturación
      setFormCobro(prev => ({
        ...prev,
        nombre_entrega: `${padre.nombres} ${padre.apellido_paterno} ${padre.apellido_materno || ''}`.trim(),
        ci_entrega: padre.ci || '',
      }));

    } catch (error: any) {
      console.error('❌ Error al cargar estudiantes del padre:', error);
      enqueueSnackbar('Error al obtener los estudiantes del tutor seleccionado', { variant: 'error' });
    } finally {
      setLoadingCargarHijos(false);
    }
  }, [periodoActivo, estudiantesSeleccionados, enqueueSnackbar, cargarEstudianteConMatriculaYMensualidades]);

  // 🆕 Seleccionar todas las mensualidades pendientes de todos los estudiantes cargados
  const handleSeleccionarTodasPendientes = useCallback(() => {
    const idsPendientes = new Set<number>();
    estudiantesSeleccionados.forEach(est => {
      est.mensualidades
        .filter(m => m.estado === 'pendiente' || m.estado === 'vencido' || m.estado === 'pagado_parcial')
        .forEach(m => idsPendientes.add(m.id));
    });
    setMensualidadesSeleccionadas(idsPendientes);
    if (idsPendientes.size > 0) {
      enqueueSnackbar(`${idsPendientes.size} mensualidades pendientes seleccionadas`, { variant: 'success' });
    } else {
      enqueueSnackbar('No hay mensualidades pendientes para seleccionar', { variant: 'info' });
    }
  }, [estudiantesSeleccionados, enqueueSnackbar]);

  // 🆕 Seleccionar solo las cuotas vencidas (por estado o por fecha límite cumplida)
  const handleSeleccionarSoloVencidas = useCallback(() => {
    const idsVencidas = new Set<number>();
    const hoy = new Date();
    estudiantesSeleccionados.forEach(est => {
      est.mensualidades
        .filter(m => {
          if (m.estado === 'pagado' || m.estado === 'anulado') return false;
          if (m.estado === 'vencido') return true;
          const fechaStr = m.fecha_vencimiento ? (m.fecha_vencimiento.includes('T') ? m.fecha_vencimiento : `${m.fecha_vencimiento}T23:59:59`) : null;
          return fechaStr ? new Date(fechaStr) < hoy : false;
        })
        .forEach(m => idsVencidas.add(m.id));
    });
    setMensualidadesSeleccionadas(idsVencidas);
    if (idsVencidas.size > 0) {
      enqueueSnackbar(`${idsVencidas.size} mensualidades vencidas seleccionadas`, { variant: 'warning' });
    } else {
      enqueueSnackbar('No hay mensualidades vencidas', { variant: 'info' });
    }
  }, [estudiantesSeleccionados, enqueueSnackbar]);

  // 🆕 Seleccionar cuotas de un estudiante hasta determinado mes
  const handleSeleccionarHastaMes = useCallback((estudiante: EstudianteConDatos, mensualidadTarget: Mensualidad) => {
    const targetCuota = mensualidadTarget.numero_cuota || 1;
    const cuotasAPagar = estudiante.mensualidades.filter(
      m => (m.estado === 'pendiente' || m.estado === 'vencido' || m.estado === 'pagado_parcial') &&
           (m.numero_cuota || 0) <= targetCuota
    );

    setMensualidadesSeleccionadas(prev => {
      const newSet = new Set(prev);
      cuotasAPagar.forEach(m => newSet.add(m.id));
      return newSet;
    });

    enqueueSnackbar(`Cuotas seleccionadas hasta ${mensualidadTarget.mes_correspondiente} para ${estudiante.nombres}`, { variant: 'info' });
  }, [enqueueSnackbar]);

  // 🆕 Seleccionar todas las cuotas del año para un estudiante
  const handleSeleccionarTodoAnioEstudiante = useCallback((estudiante: EstudianteConDatos) => {
    const pendientes = estudiante.mensualidades.filter(
      m => m.estado === 'pendiente' || m.estado === 'vencido' || m.estado === 'pagado_parcial'
    );

    setMensualidadesSeleccionadas(prev => {
      const newSet = new Set(prev);
      pendientes.forEach(m => newSet.add(m.id));
      return newSet;
    });

    enqueueSnackbar(`Todas las cuotas (${pendientes.length}) seleccionadas para ${estudiante.nombres}`, { variant: 'success' });
  }, [enqueueSnackbar]);

  // 🆕 Limpiar todos los estudiantes y selección
  const handleLimpiarTodo = useCallback(() => {
    setEstudiantesSeleccionados([]);
    setMensualidadesSeleccionadas(new Set());
    setPadreSeleccionado(null);
    setExpandidos(new Set());
    setCobroExitoso(null);
    setFormCobro({
      metodo_pago: 'efectivo',
      monto_recibido: '',
      numero_referencia: '',
      banco_origen: '',
      nombre_entrega: '',
      ci_entrega: '',
      quien_recibe: 'patricia',
      entrego_factura: false,
      numero_factura: '',
      observaciones: '',
      fecha_pago: '',
    });
    enqueueSnackbar('Lista de cobro limpiada', { variant: 'info' });
  }, [enqueueSnackbar]);

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

  // Lista agrupada de mensualidades seleccionadas por estudiante para el terminal lateral
  const resumenCuotasSeleccionadasPorEstudiante = React.useMemo(() => {
    return estudiantesSeleccionados
      .map(est => {
        const cuotas = est.mensualidades.filter(m => mensualidadesSeleccionadas.has(m.id));
        return {
          estudiante: est,
          cuotas,
          totalEstudiante: cuotas.reduce((acc, c) => acc + parseFloat((c.saldo_pendiente ?? c.monto_final).toString()), 0),
        };
      })
      .filter(item => item.cuotas.length > 0);
  }, [estudiantesSeleccionados, mensualidadesSeleccionadas]);

  // 🆕 Plan de distribución inteligente de fondos (cubre cuotas y aplica adelantos sucesivos sin vueltos)
  const planDistribucion = React.useMemo(() => {
    // 1. Obtener todas las cuotas no pagadas de los estudiantes seleccionados ordenadas cronológicamente
    const todasPendientes: { cuota: Mensualidad; estudiante: EstudianteConDatos }[] = [];
    
    estudiantesSeleccionados.forEach(est => {
      est.mensualidades
        .filter(m => m.estado !== 'pagado' && m.estado !== 'anulado')
        .forEach(m => {
          todasPendientes.push({ cuota: m, estudiante: est });
        });
    });

    // Ordenar cronológicamente por numero_cuota
    todasPendientes.sort((a, b) => (a.cuota.numero_cuota || 0) - (b.cuota.numero_cuota || 0));

    if (todasPendientes.length === 0) {
      return { items: [], totalDistribuido: 0, sobrante: 0, cuotasAfectadas: 0, sumaSeleccionadas: 0 };
    }

    // Cuotas marcadas manualmente por el usuario
    const cuotasPrioritarias: { cuota: Mensualidad; estudiante: EstudianteConDatos }[] = [];
    const cuotasSiguientes: { cuota: Mensualidad; estudiante: EstudianteConDatos }[] = [];

    todasPendientes.forEach(item => {
      if (mensualidadesSeleccionadas.has(item.cuota.id)) {
        cuotasPrioritarias.push(item);
      } else {
        cuotasSiguientes.push(item);
      }
    });

    // Suma exacta de lo seleccionado en pantalla
    const sumaSeleccionadas = cuotasPrioritarias.reduce(
      (sum, item) => sum + (parseFloat((item.cuota.saldo_pendiente ?? item.cuota.monto_final).toString()) || 0),
      0
    );

    // Monto ingresado en el input
    const montoInput = parseFloat(formCobro.monto_recibido);
    const tieneMontoPersonalizado = !isNaN(montoInput) && montoInput > 0;
    
    // Si el usuario especificó un monto, usamos ese; si no, el total de las cuotas seleccionadas
    const montoTotalDisponible = tieneMontoPersonalizado ? montoInput : sumaSeleccionadas;

    // Si no hay monto y no hay seleccionadas, nada que distribuir
    if (montoTotalDisponible <= 0) {
      return { items: [], totalDistribuido: 0, sobrante: 0, cuotasAfectadas: 0, sumaSeleccionadas: 0 };
    }

    // Si seleccionó cuotas específicas, la cola es: [prioritarias, y si sobra dinero pasa a las siguientes como adelanto]
    // Si no seleccionó ninguna cuota pero puso dinero, toma todas las pendientes en orden
    const cola = cuotasPrioritarias.length > 0 
      ? [...cuotasPrioritarias, ...cuotasSiguientes] 
      : todasPendientes;

    let restante = montoTotalDisponible;
    const items: ItemCobroDistribuido[] = [];

    for (const item of cola) {
      if (restante <= 0) break;

      const saldoOriginal = parseFloat((item.cuota.saldo_pendiente ?? item.cuota.monto_final).toString()) || 0;
      if (saldoOriginal <= 0) continue;

      const montoAPagar = Math.min(restante, saldoOriginal);
      const saldoRestante = Math.max(0, saldoOriginal - montoAPagar);
      const esCompleto = montoAPagar >= saldoOriginal;
      const esAdelantoParcial = montoAPagar > 0 && !esCompleto;

      if (montoAPagar > 0) {
        items.push({
          mensualidad_id: item.cuota.id,
          numero_cuota: item.cuota.numero_cuota,
          mes_correspondiente: item.cuota.mes_correspondiente,
          fecha_vencimiento: item.cuota.fecha_vencimiento,
          estudiante_id: item.estudiante.id,
          estudiante_nombre: `${item.estudiante.nombres} ${item.estudiante.apellido_paterno}`,
          saldo_original: saldoOriginal,
          monto_a_pagar: montoAPagar,
          saldo_restante: saldoRestante,
          es_completo: esCompleto,
          es_adelanto_parcial: esAdelantoParcial,
        });

        restante -= montoAPagar;
      }
    }

    const totalDistribuido = items.reduce((acc, it) => acc + it.monto_a_pagar, 0);

    return {
      items,
      totalDistribuido,
      sobrante: Math.max(0, restante),
      cuotasAfectadas: items.length,
      sumaSeleccionadas,
    };
  }, [estudiantesSeleccionados, mensualidadesSeleccionadas, formCobro.monto_recibido]);

  // 🆕 Función para descargar / abrir PDF de recibo
  const handleDescargarOImprimirRecibo = useCallback(async (
    pagoIds: number[],
    nombreEntrega: string,
    ciEntrega: string,
    quienRecibe: string
  ) => {
    try {
      const response = await api.post(
        '/api/pago-mensualidad/pdf-multiple',
        {
          pago_ids: pagoIds,
          nombre_entrega: nombreEntrega,
          ci_entrega: ciEntrega,
          quien_recibe: quienRecibe,
          preview: false,
        },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al generar PDF del recibo:', error);
      enqueueSnackbar('Error al abrir el PDF del recibo', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // 📲 Abrir modal de WhatsApp con datos prellenados
  const handleAbrirModalWhatsApp = useCallback(() => {
    const tel = padreSeleccionado?.celular || padreSeleccionado?.telefono || '';
    setTelefonoWhatsApp(tel);
    setModalWhatsAppOpen(true);
  }, [padreSeleccionado]);

  // 📲 Compartir por WhatsApp Web (siempre disponible sin requerir bot/API)
  const handleEnviarWhatsAppWeb = useCallback(() => {
    if (!cobroExitoso) return;
    const tel = (telefonoWhatsApp || '').replace(/\D/g, '');
    const numWhatsapp = tel ? (tel.startsWith('591') ? tel : `591${tel}`) : '';

    const detalleCuotas = cobroExitoso.itemsDistribuidos
      .map(it => `• *${it.mes_correspondiente}* (${it.estudiante_nombre}): Bs ${it.monto_a_pagar.toFixed(2)} ${it.es_adelanto_parcial ? '_(Adelanto parcial)_' : '_(100% Cubierta)_'}`)
      .join('\n');

    const codigos = cobroExitoso.pagos.map(p => p.codigo_pago).join(', ');

    const texto = encodeURIComponent(
      `🏛️ *U.E.P. LA VOZ DE CRISTO*\n` +
      `📄 *COMPROBANTE OFICIAL DE PAGO DE MENSUALIDADES*\n\n` +
      `👤 *A nombre de:* ${cobroExitoso.nombreEntrega} (CI: ${cobroExitoso.ciEntrega})\n` +
      `💰 *Monto Total:* Bs ${cobroExitoso.totalPagado.toFixed(2)}\n` +
      `💵 *Forma de Pago:* ${cobroExitoso.metodoPago === 'qr' ? 'Pago QR' : 'Efectivo'}\n` +
      `🔖 *Código(s) Comprobante:* ${codigos}\n\n` +
      `📋 *Detalle de cuotas cubiertas:*\n${detalleCuotas}\n\n` +
      `✅ _El pago se encuentra debidamente registrado en el sistema escolar._\n` +
      `Conserve este comprobante digital como constancia oficial de su pago.`
    );

    const url = numWhatsapp
      ? `https://api.whatsapp.com/send?phone=${numWhatsapp}&text=${texto}`
      : `https://api.whatsapp.com/send?text=${texto}`;

    window.open(url, '_blank');
    setModalWhatsAppOpen(false);
  }, [cobroExitoso, telefonoWhatsApp]);

  // 📲 Enviar archivo PDF adjunto directo vía Evolution API (con fallback a WhatsApp Web)
  const handleEnviarPDFWhatsAppDirecto = useCallback(async () => {
    if (!cobroExitoso) return;
    const tel = (telefonoWhatsApp || '').replace(/\D/g, '');
    if (!tel) {
      enqueueSnackbar('Ingrese un número de celular o WhatsApp de destino', { variant: 'warning' });
      return;
    }
    const numWhatsapp = tel.startsWith('591') ? tel : `591${tel}`;

    setEnviandoWhatsApp(true);
    try {
      const response = await api.post('/api/pago-mensualidad/enviar-whatsapp', {
        pago_ids: cobroExitoso.pagos.map(p => p.pago_id),
        telefono: numWhatsapp,
        nombre_entrega: cobroExitoso.nombreEntrega,
        ci_entrega: cobroExitoso.ciEntrega,
        quien_recibe: cobroExitoso.quienRecibe,
      });

      if (response.data?.success) {
        enqueueSnackbar(response.data.message || 'Comprobante PDF enviado por WhatsApp exitosamente', { variant: 'success' });
        setModalWhatsAppOpen(false);
      } else {
        throw new Error(response.data?.message || 'No se pudo enviar el PDF directo');
      }
    } catch (error: any) {
      console.warn('Error al enviar documento por API, sugiriendo WhatsApp Web:', error);
      enqueueSnackbar(error.response?.data?.message || 'Servicio de bot no disponible. Abriendo WhatsApp Web con el recibo...', { variant: 'info' });
      handleEnviarWhatsAppWeb();
    } finally {
      setEnviandoWhatsApp(false);
    }
  }, [cobroExitoso, telefonoWhatsApp, enqueueSnackbar, handleEnviarWhatsAppWeb]);

  // 📢 Abrir modal de recordatorio de deuda para un estudiante específico
  const handleAbrirRecordatorioEstudiante = useCallback((estudiante: EstudianteConDatos) => {
    const cuotasVencidasEst = estudiante.mensualidades.filter(m => {
      if (m.estado === 'pagado') return false;
      if (m.estado === 'vencido') return true;
      if (m.fecha_vencimiento) {
        const fechaVenc = new Date(m.fecha_vencimiento.includes('T') ? m.fecha_vencimiento : `${m.fecha_vencimiento}T23:59:59`);
        return fechaVenc < new Date();
      }
      return false;
    });

    if (cuotasVencidasEst.length === 0) {
      enqueueSnackbar('El estudiante no cuenta con cuotas vencidas', { variant: 'info' });
      return;
    }

    const tel = padreSeleccionado?.celular || padreSeleccionado?.telefono || '';
    setRecordatorioTelefono(tel);
    setRecordatorioTitulo(`Recordatorio: ${estudiante.nombres} ${estudiante.apellido_paterno}`);

    const tutor = padreSeleccionado 
      ? `${padreSeleccionado.nombres} ${padreSeleccionado.apellido_paterno}`
      : 'Señor(a) Padre/Madre de Familia';

    const deudaTotal = cuotasVencidasEst.reduce((sum, c) => sum + (parseFloat((c.saldo_pendiente ?? c.monto_final).toString()) || 0), 0);
    const cuotasTxt = cuotasVencidasEst
      .map(c => `• Cuota ${c.numero_cuota} (${c.mes_correspondiente}): Bs ${(parseFloat((c.saldo_pendiente ?? c.monto_final).toString()) || 0).toFixed(2)}`)
      .join('\n');

    const curso = estudiante.matricula ? `${estudiante.matricula.grado_nombre} "${estudiante.matricula.paralelo_nombre}"` : '';

    const mensajeDefault =
      `🏛️ *U.E.P. LA VOZ DE CRISTO*\n` +
      `📢 *RECORDATORIO DE MENSUALIDADES*\n\n` +
      `Estimado(a) *${tutor}*:\n` +
      `Esperamos que se encuentre bien. Le hacemos llegar un atento recordatorio sobre las mensualidades escolares pendientes correspondientes a su hijo(a) *${estudiante.nombres} ${estudiante.apellido_paterno}*${curso ? ` (${curso})` : ''}:\n\n` +
      `${cuotasTxt}\n\n` +
      `💰 *Total Adeudado:* Bs ${deudaTotal.toFixed(2)}\n\n` +
      `Le invitamos cordialmente a regularizar sus cuotas en secretaría de caja escolar.\n\n` +
      `_Si ya realizó este pago en las últimas horas, por favor desestime este mensaje y envíenos su comprobante._\n` +
      `¡Agradecemos su gentil atención y comprensión!`;

    setRecordatorioMensaje(mensajeDefault);
    setModalRecordatorioOpen(true);
  }, [padreSeleccionado, enqueueSnackbar]);

  // 📢 Abrir modal de recordatorio consolidado para todo el tutor (todos sus hijos cargados)
  const handleAbrirRecordatorioTutor = useCallback(() => {
    if (!padreSeleccionado) return;

    let totalDeuda = 0;
    const detallesHijos: string[] = [];

    estudiantesSeleccionados.forEach(est => {
      const vencidas = est.mensualidades.filter(m => {
        if (m.estado === 'pagado') return false;
        if (m.estado === 'vencido') return true;
        if (m.fecha_vencimiento) {
          const fechaVenc = new Date(m.fecha_vencimiento.includes('T') ? m.fecha_vencimiento : `${m.fecha_vencimiento}T23:59:59`);
          return fechaVenc < new Date();
        }
        return false;
      });

      if (vencidas.length > 0) {
        const subtotal = vencidas.reduce((sum, c) => sum + (parseFloat((c.saldo_pendiente ?? c.monto_final).toString()) || 0), 0);
        totalDeuda += subtotal;
        const mesesTxt = vencidas.map(c => `${c.mes_correspondiente} (Bs ${(parseFloat((c.saldo_pendiente ?? c.monto_final).toString()) || 0).toFixed(2)})`).join(', ');
        detallesHijos.push(`👤 *${est.nombres} ${est.apellido_paterno}*:\n   ${mesesTxt}`);
      }
    });

    if (detallesHijos.length === 0) {
      enqueueSnackbar('No se encontraron cuotas vencidas para este tutor', { variant: 'info' });
      return;
    }

    const tel = padreSeleccionado.celular || padreSeleccionado.telefono || '';
    setRecordatorioTelefono(tel);
    setRecordatorioTitulo(`Recordatorio General Tutor: ${padreSeleccionado.nombres} ${padreSeleccionado.apellido_paterno}`);

    const tutor = `${padreSeleccionado.nombres} ${padreSeleccionado.apellido_paterno}`;

    const mensajeDefault =
      `🏛️ *U.E.P. LA VOZ DE CRISTO*\n` +
      `📢 *RECORDATORIO DE MENSUALIDADES ESCOLARES*\n\n` +
      `Estimado(a) *${tutor}*:\n` +
      `Esperamos que se encuentre bien. Le enviamos un atento recordatorio respecto a las mensualidades pendientes de sus hijos:\n\n` +
      `${detallesHijos.join('\n\n')}\n\n` +
      `💰 *Total Consolidado Adeudado:* Bs ${totalDeuda.toFixed(2)}\n\n` +
      `Le solicitamos cordialmente aproximarse a Secretaría o comunicarse para regularizar su cuenta escolar.\n\n` +
      `_Si ya realizó su pago recientemente, desestime este aviso._\n` +
      `¡Muchas gracias por su puntualidad y confianza!`;

    setRecordatorioMensaje(mensajeDefault);
    setModalRecordatorioOpen(true);
  }, [padreSeleccionado, estudiantesSeleccionados, enqueueSnackbar]);

  // 📢 Enviar recordatorio vía WhatsApp Web
  const handleEnviarRecordatorioWeb = useCallback(() => {
    const tel = (recordatorioTelefono || '').replace(/\D/g, '');
    const numWhatsapp = tel ? (tel.startsWith('591') ? tel : `591${tel}`) : '';
    const texto = encodeURIComponent(recordatorioMensaje);

    const url = numWhatsapp
      ? `https://api.whatsapp.com/send?phone=${numWhatsapp}&text=${texto}`
      : `https://api.whatsapp.com/send?text=${texto}`;

    window.open(url, '_blank');
    setModalRecordatorioOpen(false);
  }, [recordatorioTelefono, recordatorioMensaje]);

  // 📢 Enviar recordatorio vía Bot de WhatsApp (con fallback)
  const handleEnviarRecordatorioBot = useCallback(async () => {
    const tel = (recordatorioTelefono || '').replace(/\D/g, '');
    if (!tel) {
      enqueueSnackbar('Ingrese un número de WhatsApp de destino', { variant: 'warning' });
      return;
    }
    const numWhatsapp = tel.startsWith('591') ? tel : `591${tel}`;

    setEnviandoRecordatorio(true);
    try {
      const response = await api.post('/api/reportes-pagos/notificar-whatsapp', {
        telefono: numWhatsapp,
        mensaje: recordatorioMensaje,
      });

      if (response.data?.success) {
        enqueueSnackbar('Recordatorio enviado exitosamente por WhatsApp', { variant: 'success' });
        setModalRecordatorioOpen(false);
      } else {
        throw new Error(response.data?.message || 'No se pudo enviar el mensaje');
      }
    } catch (error: any) {
      console.warn('Fallo bot WhatsApp, sugiriendo WhatsApp Web:', error);
      enqueueSnackbar('El bot no está disponible. Abriendo WhatsApp Web...', { variant: 'info' });
      handleEnviarRecordatorioWeb();
    } finally {
      setEnviandoRecordatorio(false);
    }
  }, [recordatorioTelefono, recordatorioMensaje, enqueueSnackbar, handleEnviarRecordatorioWeb]);

  // 🆕 Procesar cobro continuo desde el panel lateral (Punto de Venta) con distribución automática de adelantos
  const handleProcesarCobroTerminal = useCallback(async () => {
    if (planDistribucion.items.length === 0) {
      enqueueSnackbar('Seleccione cuotas o ingrese un monto a cobrar', { variant: 'warning' });
      return;
    }

    if (!formCobro.nombre_entrega.trim()) {
      enqueueSnackbar('Ingrese el nombre de la persona que entrega el pago', { variant: 'warning' });
      return;
    }

    if (!formCobro.ci_entrega.trim()) {
      enqueueSnackbar('Ingrese el CI de la persona que entrega el pago', { variant: 'warning' });
      return;
    }

    if (formCobro.metodo_pago === 'qr' && !formCobro.numero_referencia.trim()) {
      enqueueSnackbar('El número de referencia o transacción es requerido para pagos con QR', { variant: 'warning' });
      return;
    }

    setLoadingCobro(true);

    try {
      const mensualidadesArray = planDistribucion.items.map(it => ({
        mensualidad_id: it.mensualidad_id,
        monto_pagado: it.monto_a_pagar,
      }));

      const response = await pagosService.registrarPagoMultiple({
        mensualidades: mensualidadesArray,
        metodo_pago: formCobro.metodo_pago,
        numero_referencia: formCobro.numero_referencia || undefined,
        banco_origen: formCobro.banco_origen || undefined,
        entrego_factura: formCobro.entrego_factura,
        numero_factura: formCobro.entrego_factura && formCobro.numero_factura.trim() ? formCobro.numero_factura.trim() : undefined,
        observaciones: formCobro.observaciones || undefined,
        fecha_pago: formCobro.fecha_pago ? formCobro.fecha_pago : undefined,
      });

      const pagosRegistrados = response.data?.pagos || [];

      const cobroInfo: CobroExitoso = {
        totalPagado: planDistribucion.totalDistribuido,
        pagos: pagosRegistrados,
        itemsDistribuidos: planDistribucion.items,
        nombreEntrega: formCobro.nombre_entrega,
        ciEntrega: formCobro.ci_entrega,
        metodoPago: formCobro.metodo_pago,
        quienRecibe: formCobro.quien_recibe,
      };

      setCobroExitoso(cobroInfo);
      setMensualidadesSeleccionadas(new Set());
      setFormCobro(prev => ({
        ...prev,
        monto_recibido: '',
        numero_referencia: '',
        banco_origen: '',
        entrego_factura: false,
        numero_factura: '',
        observaciones: '',
        fecha_pago: '',
      }));

      // Recargar datos de estudiantes para reflejar cuotas pagadas
      const promesas = estudiantesSeleccionados.map(est => recargarMensualidadesEstudiante(est.id));
      await Promise.all(promesas);

      const completas = planDistribucion.items.filter(i => i.es_completo).length;
      const parciales = planDistribucion.items.filter(i => i.es_adelanto_parcial).length;
      let detalleMsg = `${completas} cuota(s) completa(s)`;
      if (parciales > 0) detalleMsg += ` y ${parciales} con adelanto`;

      enqueueSnackbar(`✅ Cobro de Bs ${planDistribucion.totalDistribuido.toFixed(2)} registrado (${detalleMsg})`, { variant: 'success' });

      // Generar y abrir el PDF del recibo automáticamente
      const pagoIds = pagosRegistrados.map(p => p.pago_id);
      if (pagoIds.length > 0) {
        await handleDescargarOImprimirRecibo(
          pagoIds,
          formCobro.nombre_entrega,
          formCobro.ci_entrega,
          formCobro.quien_recibe
        );
      }
    } catch (error: any) {
      console.error('Error al procesar el cobro:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error al procesar el cobro', { variant: 'error' });
    } finally {
      setLoadingCobro(false);
    }
  }, [
    planDistribucion,
    formCobro,
    estudiantesSeleccionados,
    recargarMensualidadesEstudiante,
    handleDescargarOImprimirRecibo,
    enqueueSnackbar,
  ]);

  // 🆕 Nueva atención rápida
  const handleNuevaAtencion = useCallback(() => {
    setCobroExitoso(null);
    setMensualidadesSeleccionadas(new Set());
    setFormCobro(prev => ({
      ...prev,
      monto_recibido: '',
      numero_referencia: '',
      banco_origen: '',
      entrego_factura: false,
      numero_factura: '',
      observaciones: '',
      fecha_pago: '',
    }));
  }, []);

  // Render card de mensualidad (interactiva y directa para punto de venta)
  const renderMensualidadCard = (
    mensualidad: Mensualidad, 
    estudiante: EstudianteConDatos,
    index: number
  ) => {
    const isSeleccionada = mensualidadesSeleccionadas.has(mensualidad.id);
    const isPagada = mensualidad.estado === 'pagado';
    const isParcial = mensualidad.estado === 'pagado_parcial' || (parseFloat((mensualidad.total_pagado ?? 0).toString()) > 0 && !isPagada);
    const fechaVencStr = mensualidad.fecha_vencimiento ? (mensualidad.fecha_vencimiento.includes('T') ? mensualidad.fecha_vencimiento : `${mensualidad.fecha_vencimiento}T23:59:59`) : null;
    const isVencida = !isPagada && (mensualidad.estado === 'vencido' || (fechaVencStr ? new Date(fechaVencStr) < new Date() : false));
    const montoFinal = parseFloat(mensualidad.monto_final.toString());
    const saldoPendiente = parseFloat((mensualidad.saldo_pendiente ?? mensualidad.monto_final).toString());
    const color = MESES_COLORES[((mensualidad.numero_cuota || (index + 1)) - 1) % MESES_COLORES.length];

    return (
      <Grid size={{xs: 12, sm: 6, md: 4, xl: 3}} key={mensualidad.id}>
        <Card
          onClick={() => {
            if (!isPagada) {
              handleToggleMensualidad(mensualidad.id);
            }
          }}
          sx={{
            borderRadius: '16px',
            cursor: isPagada ? 'default' : 'pointer',
            border: `2.5px solid ${
              isSeleccionada 
                ? color
                : isPagada 
                  ? alpha('#10b981', 0.4)
                  : alpha(color, 0.25)
            }`,
            background: isPagada
              ? (isDark ? alpha('#10b981', 0.08) : alpha('#10b981', 0.05))
              : isSeleccionada
                ? (isDark ? alpha(color, 0.18) : alpha(color, 0.12))
                : (isDark ? alpha('#fff', 0.02) : '#fff'),
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isSeleccionada ? 'translateY(-2px)' : 'none',
            boxShadow: isSeleccionada 
              ? `0 8px 20px ${alpha(color, 0.3)}`
              : (isPagada ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'),
            '&:hover': !isPagada ? {
              transform: 'translateY(-4px)',
              boxShadow: `0 10px 24px ${alpha(color, 0.35)}`,
              borderColor: color,
            } : {},
            position: 'relative',
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={0.5}>
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: alpha(color, 0.9),
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    fontSize: '0.7rem',
                  }}
                >
                  Cuota {mensualidad.numero_cuota}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={800}
                  sx={{ 
                    textTransform: 'capitalize',
                    color: isPagada ? '#10b981' : (isSeleccionada ? color : 'text.primary'),
                    lineHeight: 1.2,
                  }}
                >
                  {mensualidad.mes_correspondiente}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={0.5}>
                {!isPagada && (
                  <Tooltip title="Cobrar hasta este mes">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeleccionarHastaMes(estudiante, mensualidad);
                      }}
                      sx={{
                        p: 0.5,
                        color: alpha(color, 0.8),
                        '&:hover': { background: alpha(color, 0.15) }
                      }}
                    >
                      <DoneAll sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {!isPagada && (
                  <Checkbox
                    checked={isSeleccionada}
                    size="small"
                    sx={{
                      p: 0.5,
                      color: alpha(color, 0.5),
                      '&.Mui-checked': { color },
                    }}
                  />
                )}

                {isPagada && (
                  <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
                )}
              </Box>
            </Box>

            <Box 
              sx={{
                my: 1.5,
                p: 1.2,
                borderRadius: '10px',
                background: isPagada 
                  ? alpha('#10b981', 0.1) 
                  : (isParcial ? alpha('#f59e0b', 0.12) : alpha(color, 0.1)),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  {isPagada ? 'Pagado' : (isParcial ? 'Abonado parcial' : (isSeleccionada ? 'A Cobrar' : 'Pendiente'))}
                </Typography>
                {isParcial && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    Total: Bs {montoFinal.toFixed(0)}
                  </Typography>
                )}
              </Box>
              <Typography variant="h6" fontWeight={800} color={isPagada ? '#10b981' : (isParcial ? '#f59e0b' : color)}>
                Bs {(isPagada ? montoFinal : saldoPendiente).toFixed(2)}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarMonth sx={{ color: 'text.secondary', fontSize: 14 }} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(mensualidad.fecha_vencimiento).toLocaleDateString('es-BO')}
                </Typography>
              </Box>

              {isVencida && !isPagada && (
                <Chip
                  label="Vencida"
                  size="small"
                  color="error"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                />
              )}
            </Box>
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
    <Box sx={{ pb: 6 }}>
      <Grid container spacing={3} alignItems="flex-start">
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA (65-70%): Búsqueda, Familia y Cuotas    */}
        {/* ========================================================= */}
        <Grid size={{ xs: 12, lg: 7.5, xl: 8 }}>
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
              {/* Selector de modo de búsqueda */}
              <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <ToggleButtonGroup
                  value={tipoBusqueda}
                  exclusive
                  onChange={(_, val) => {
                    if (val) setTipoBusqueda(val);
                  }}
                  size="small"
                  sx={{
                    background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                    borderRadius: '14px',
                    p: '3px',
                    '& .MuiToggleButton-root': {
                      borderRadius: '11px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      px: 2,
                      py: 0.8,
                      border: 'none',
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        color: isDark ? '#000' : '#fff',
                        boxShadow: isDark
                          ? '0 4px 12px rgba(250, 204, 21, 0.3)'
                          : '0 4px 12px rgba(2, 136, 209, 0.3)',
                        '&:hover': {
                          background: isDark
                            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="padre">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FamilyRestroom fontSize="small" />
                      <span>Buscar por Padre / Tutor</span>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="estudiante">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School fontSize="small" />
                      <span>Buscar por Estudiante</span>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>

                {estudiantesSeleccionados.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      size="small"
                      startIcon={<SelectAll />}
                      onClick={handleSeleccionarTodasPendientes}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: isDark ? '#93c5fd' : '#0288d1',
                        border: `1px solid ${isDark ? 'rgba(147, 197, 253, 0.4)' : 'rgba(2, 136, 209, 0.4)'}`,
                        bgcolor: isDark ? 'rgba(2, 136, 209, 0.15)' : 'rgba(2, 136, 209, 0.08)',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(2, 136, 209, 0.28)' : 'rgba(2, 136, 209, 0.16)',
                          borderColor: isDark ? '#93c5fd' : '#0288d1',
                        }
                      }}
                    >
                      Todas Pendientes
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Warning />}
                      onClick={handleSeleccionarSoloVencidas}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: isDark ? '#fcd34d' : '#d97706',
                        border: `1px solid ${isDark ? 'rgba(252, 211, 77, 0.4)' : 'rgba(217, 119, 6, 0.4)'}`,
                        bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.16)',
                          borderColor: isDark ? '#fcd34d' : '#d97706',
                        }
                      }}
                    >
                      Solo Vencidas
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteSweep />}
                      onClick={handleLimpiarTodo}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: isDark ? '#f87171' : '#dc2626',
                        border: `1px solid ${isDark ? 'rgba(248, 113, 113, 0.4)' : 'rgba(220, 38, 38, 0.4)'}`,
                        bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(239, 68, 68, 0.28)' : 'rgba(239, 68, 68, 0.16)',
                          borderColor: isDark ? '#f87171' : '#dc2626',
                        }
                      }}
                    >
                      Limpiar
                    </Button>
                  </Stack>
                )}
              </Box>

              {/* Buscador Autocomplete */}
              {tipoBusqueda === 'padre' ? (
                /* 👨‍👩‍👧‍👦 Buscador de Padres / Tutores */
                <Autocomplete
                  options={padres}
                  getOptionLabel={(option) =>
                    `${option.ci ? `[CI: ${option.ci}] ` : ''}${option.nombres} ${option.apellido_paterno} ${option.apellido_materno || ''}`.trim()
                  }
                  loading={loadingPadres || loadingCargarHijos}
                  onChange={(_, newValue) => {
                    handleSeleccionarPadre(newValue);
                  }}
                  onInputChange={(_, newValue) => {
                    handleBuscarPadre(newValue);
                  }}
                  filterOptions={(x) => x}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar Padre / Tutor / Apoderado"
                      placeholder="Escribe CI, nombre, apellido o teléfono..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <Search sx={{ mr: 1, color: isDark ? '#facc15' : '#0288d1' }} />
                        ),
                        endAdornment: (
                          <>
                            {(loadingPadres || loadingCargarHijos) ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '14px',
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    const totalHijos = option.hijos?.length || option.total_estudiantes || 0;
                    return (
                      <Box component="li" key={key} {...otherProps} sx={{ py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Box display="flex" alignItems="center" gap={2} width="100%">
                          <Avatar sx={{ bgcolor: isDark ? '#facc15' : '#0288d1', color: isDark ? '#000' : '#fff' }}>
                            <FamilyRestroom fontSize="small" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <Typography variant="body1" fontWeight={700}>
                                {option.nombres} {option.apellido_paterno} {option.apellido_materno || ''}
                              </Typography>
                              {option.parentesco && (
                                <Chip
                                  size="small"
                                  label={option.parentesco}
                                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize' }}
                                />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              CI: {option.ci || 'S/N'} {option.celular ? `• Cel: ${option.celular}` : (option.telefono ? `• Tel: ${option.telefono}` : '')}
                            </Typography>
                            {option.hijos && option.hijos.length > 0 && (
                              <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                                {option.hijos.map((hijo) => (
                                  <Chip
                                    key={hijo.id}
                                    size="small"
                                    avatar={<Avatar sx={{ width: 16, height: 16, fontSize: '0.65rem' }}>{hijo.nombres.charAt(0)}</Avatar>}
                                    label={`${hijo.nombres} ${hijo.apellido_paterno}`}
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: '0.72rem' }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                          <Box textAlign="right" flexShrink={0}>
                            <Chip
                              size="small"
                              color={totalHijos > 0 ? "primary" : "default"}
                              label={`${totalHijos} hijo${totalHijos === 1 ? '' : 's'}`}
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    );
                  }}
                />
              ) : (
                /* 🎓 Buscador individual de Estudiantes */
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
                        startAdornment: <Search sx={{ mr: 1, color: isDark ? '#facc15' : '#0288d1' }} />,
                        endAdornment: (
                          <>
                            {loadingEstudiantes ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '14px',
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
              )}

              {/* Banner de Tutor Seleccionado */}
              {padreSeleccionado && (
                <Alert
                  icon={<FamilyRestroom fontSize="medium" />}
                  severity="info"
                  sx={{
                    mt: 2.5,
                    borderRadius: '14px',
                    background: isDark ? alpha('#0288d1', 0.15) : alpha('#0288d1', 0.08),
                    border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiAlert-message': { width: '100%' }
                  }}
                  action={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {estudiantesSeleccionados.some(est => est.mensualidades.some(m => m.estado !== 'pagado' && (m.estado === 'vencido' || (m.fecha_vencimiento && new Date(m.fecha_vencimiento.includes('T') ? m.fecha_vencimiento : `${m.fecha_vencimiento}T23:59:59`) < new Date())))) && (
                        <Tooltip title="Enviar recordatorio de cuotas vencidas al WhatsApp del tutor">
                          <Button
                            size="small"
                            startIcon={<WhatsApp />}
                            onClick={handleAbrirRecordatorioTutor}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              px: 1.5,
                              color: '#25D366',
                              border: '1px solid rgba(37, 211, 102, 0.4)',
                              bgcolor: 'rgba(37, 211, 102, 0.12)',
                              '&:hover': {
                                bgcolor: 'rgba(37, 211, 102, 0.22)',
                                borderColor: '#25D366',
                              }
                            }}
                          >
                            Aviso WhatsApp
                          </Button>
                        </Tooltip>
                      )}
                      <Button
                        size="small"
                        onClick={() => setPadreSeleccionado(null)}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          px: 1.5,
                          color: isDark ? '#facc15' : '#0288d1',
                          border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.5)}`,
                          bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.12),
                          '&:hover': {
                            bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.22),
                            borderColor: isDark ? '#facc15' : '#0288d1',
                          }
                        }}
                      >
                        Cambiar Tutor
                      </Button>
                    </Stack>
                  }
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Tutor: {padreSeleccionado.nombres} {padreSeleccionado.apellido_paterno} {padreSeleccionado.apellido_materno || ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CI: {padreSeleccionado.ci || 'S/N'} {padreSeleccionado.celular ? `• Cel: ${padreSeleccionado.celular}` : (padreSeleccionado.telefono ? `• Tel: ${padreSeleccionado.telefono}` : '')} {padreSeleccionado.parentesco ? `• ${padreSeleccionado.parentesco}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Alert>
              )}

              {/* Chips de estudiantes cargados */}
              {estudiantesSeleccionados.length > 0 && (
                <Box mt={2} display="flex" gap={1} flexWrap="wrap" alignItems="center">
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mr: 0.5 }}>
                    Estudiantes ({estudiantesSeleccionados.length}):
                  </Typography>
                  {estudiantesSeleccionados.map(est => (
                    <Chip
                      key={est.id}
                      avatar={<Avatar>{est.nombres.charAt(0)}</Avatar>}
                      label={`${est.nombres} ${est.apellido_paterno}${est.matricula ? ` (${est.matricula.grado_nombre || ''})` : ' (Sin Matrícula)'}`}
                      color={est.matricula ? 'default' : 'warning'}
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

          {/* Lista de estudiantes y sus mensualidades */}
          {estudiantesSeleccionados.length === 0 ? (
            <Card
              sx={{
                borderRadius: '20px',
                textAlign: 'center',
                py: 10,
                px: 3,
                background: isDark ? alpha('#fff', 0.03) : alpha('#fff', 0.8),
                border: `1px dashed ${alpha(theme.palette.divider, 0.4)}`,
              }}
            >
              <PersonAdd sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                No hay estudiantes seleccionados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto' }}>
                Usa el buscador superior para seleccionar un <strong>Padre de Familia</strong> (y traer a todos sus hijos) o busca a un <strong>Estudiante</strong> de forma individual.
              </Typography>
            </Card>
          ) : (
            <Stack spacing={3}>
              {estudiantesSeleccionados.map(estudiante => {
                const isExpandido = expandidos.has(estudiante.id);
                const cuotasPendientes = estudiante.mensualidades.filter(
                  m => m.estado === 'pendiente' || m.estado === 'vencido' || m.estado === 'pagado_parcial'
                );
                const cuotasVencidasEst = estudiante.mensualidades.filter(m => {
                  if (m.estado === 'pagado') return false;
                  if (m.estado === 'vencido') return true;
                  if (m.fecha_vencimiento) {
                    const fv = new Date(m.fecha_vencimiento.includes('T') ? m.fecha_vencimiento : `${m.fecha_vencimiento}T23:59:59`);
                    return fv < new Date();
                  }
                  return false;
                });
                const cuotasSeleccionadasEst = estudiante.mensualidades.filter(
                  m => mensualidadesSeleccionadas.has(m.id)
                );
                const todasSeleccionadas = cuotasPendientes.length > 0 && cuotasPendientes.every(m => 
                  mensualidadesSeleccionadas.has(m.id)
                );

                return (
                  <Card
                    key={estudiante.id}
                    sx={{
                      borderRadius: '20px',
                      background: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.95),
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', isExpandido ? 0.3 : 0.15)}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header del estudiante */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1.5}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar 
                            sx={{ 
                              width: 50, 
                              height: 50,
                              bgcolor: isDark ? '#facc15' : '#0288d1',
                              color: isDark ? '#000' : '#fff',
                              fontSize: 20,
                              fontWeight: 700,
                            }}
                          >
                            {estudiante.nombres.charAt(0)}
                          </Avatar>
                          <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="h6" fontWeight={800}>
                                {estudiante.nombres} {estudiante.apellido_paterno}
                              </Typography>
                              {cuotasSeleccionadasEst.length > 0 && (
                                <Chip
                                  size="small"
                                  color="success"
                                  label={`${cuotasSeleccionadasEst.length} cuotas a cobrar`}
                                  sx={{ fontWeight: 700, height: 22 }}
                                />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Código: {estudiante.codigo}
                              {estudiante.matricula && ` • ${estudiante.matricula.grado_nombre} "${estudiante.matricula.paralelo_nombre}"`}
                              {estudiante.matricula?.es_becado && ` • Beca ${estudiante.matricula.porcentaje_beca}%`}
                            </Typography>
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {estudiante.mensualidades.length > 0 && (
                            <>
                              <Tooltip title="Seleccionar todo el año escolar (10 cuotas)">
                                <Button
                                  size="small"
                                  startIcon={<AssignmentTurnedIn />}
                                  onClick={() => handleSeleccionarTodoAnioEstudiante(estudiante)}
                                  sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    color: isDark ? '#93c5fd' : '#0288d1',
                                    border: `1px solid ${isDark ? 'rgba(147, 197, 253, 0.4)' : 'rgba(2, 136, 209, 0.4)'}`,
                                    bgcolor: isDark ? 'rgba(2, 136, 209, 0.15)' : 'rgba(2, 136, 209, 0.08)',
                                    '&:hover': {
                                      bgcolor: isDark ? 'rgba(2, 136, 209, 0.28)' : 'rgba(2, 136, 209, 0.16)',
                                      borderColor: isDark ? '#93c5fd' : '#0288d1',
                                    }
                                  }}
                                >
                                  Todo el año
                                </Button>
                              </Tooltip>

                              <Tooltip title={todasSeleccionadas ? 'Deseleccionar todas' : 'Marcar todas pendientes'}>
                                <Button
                                  size="small"
                                  startIcon={<DoneAll />}
                                  onClick={() => handleToggleTodasEstudiante(estudiante)}
                                  sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    color: todasSeleccionadas
                                      ? (isDark ? '#f87171' : '#dc2626')
                                      : (isDark ? '#34d399' : '#059669'),
                                    border: `1px solid ${todasSeleccionadas
                                      ? (isDark ? 'rgba(248, 113, 113, 0.4)' : 'rgba(220, 38, 38, 0.4)')
                                      : (isDark ? 'rgba(52, 211, 153, 0.4)' : 'rgba(5, 150, 105, 0.4)')}`,
                                    bgcolor: todasSeleccionadas
                                      ? (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)')
                                      : (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)'),
                                    '&:hover': {
                                      bgcolor: todasSeleccionadas
                                        ? (isDark ? 'rgba(239, 68, 68, 0.28)' : 'rgba(239, 68, 68, 0.16)')
                                        : (isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.16)'),
                                    }
                                  }}
                                >
                                  {todasSeleccionadas ? 'Quitar todas' : 'Pendientes'}
                                </Button>
                              </Tooltip>

                              {cuotasVencidasEst.length > 0 && (
                                <Tooltip title={`Enviar aviso de ${cuotasVencidasEst.length} cuota(s) vencida(s) por WhatsApp`}>
                                  <Button
                                    size="small"
                                    startIcon={<WhatsApp />}
                                    onClick={() => handleAbrirRecordatorioEstudiante(estudiante)}
                                    sx={{
                                      borderRadius: '10px',
                                      textTransform: 'none',
                                      fontWeight: 700,
                                      fontSize: '0.8rem',
                                      color: '#25D366',
                                      border: '1px solid rgba(37, 211, 102, 0.4)',
                                      bgcolor: 'rgba(37, 211, 102, 0.12)',
                                      '&:hover': {
                                        bgcolor: 'rgba(37, 211, 102, 0.22)',
                                        borderColor: '#25D366',
                                      }
                                    }}
                                  >
                                    Aviso ({cuotasVencidasEst.length})
                                  </Button>
                                </Tooltip>
                              )}
                            </>
                          )}

                          <IconButton
                            onClick={() => handleToggleExpandir(estudiante.id)}
                            sx={{ color: isDark ? '#facc15' : '#0288d1' }}
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
                            sx={{ borderRadius: '12px', mt: 2 }}
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
                              Genera las 10 mensualidades del año escolar para poder cobrar
                            </Typography>
                          </Alert>
                        ) : (
                          <>
                            {/* Barra de progreso de pagos del estudiante */}
                            <Box my={2.5}>
                              <Box display="flex" justifyContent="space-between" mb={0.8}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  Progreso de Cuotas Pagadas
                                </Typography>
                                <Typography variant="caption" fontWeight={700}>
                                  {estudiante.mensualidades.filter(m => m.estado === 'pagado').length} de {estudiante.mensualidades.length} pagadas
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

                            {/* Grid interactivo de cuotas mensuales */}
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
        </Grid>

        {/* ========================================================= */}
        {/* COLUMNA DERECHA (30-35%): Terminal de Caja / Checkout POS */}
        {/* ========================================================= */}
        <Grid size={{ xs: 12, lg: 4.5, xl: 4 }} sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
          <Card
            sx={{
              borderRadius: '20px',
              background: isDark ? alpha('#09101d', 0.95) : alpha('#fff', 0.98),
              backdropFilter: 'blur(20px)',
              border: `2px solid ${alpha(
                isDark ? '#facc15' : '#0288d1',
                cobroExitoso ? 0.6 : (mensualidadesSeleccionadas.size > 0 ? 0.4 : 0.15)
              )}`,
              boxShadow: mensualidadesSeleccionadas.size > 0
                ? `0 12px 40px ${alpha(isDark ? '#facc15' : '#0288d1', 0.25)}`
                : '0 4px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            {/* Header del Terminal */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <PointOfSale sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                    Terminal de Cobro
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Caja y Emisión Inmediata de Recibo
                  </Typography>
                </Box>
              </Box>

              {mensualidadesSeleccionadas.size > 0 && (
                <Chip
                  color="primary"
                  size="small"
                  label={`${mensualidadesSeleccionadas.size} cuota${mensualidadesSeleccionadas.size === 1 ? '' : 's'}`}
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* CASO 1: Cobro recién realizado con éxito */}
              {cobroExitoso ? (
                <Box textAlign="center" py={2}>
                  <Box
                    sx={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      background: alpha('#10b981', 0.15),
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <CheckCircleOutline sx={{ fontSize: 44 }} />
                  </Box>

                  <Typography variant="h5" fontWeight={800} color="#10b981" gutterBottom>
                    ¡Cobro Realizado!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Se registraron {cobroExitoso.pagos.length} cuota(s) y se emitió el recibo.
                  </Typography>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 3,
                      borderRadius: '14px',
                      background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                      textAlign: 'left',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" color="text.secondary">Total Pagado:</Typography>
                      <Typography variant="subtitle1" fontWeight={800} color={isDark ? '#facc15' : '#0288d1'}>
                        Bs {cobroExitoso.totalPagado.toFixed(2)}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ my: 1 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.8}>
                        Distribución y adelantos aplicados:
                      </Typography>
                      {cobroExitoso.itemsDistribuidos?.map(it => (
                        <Box key={it.mensualidad_id} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Box>
                            <Typography variant="caption" fontWeight={700}>
                              • {it.mes_correspondiente} (Cuota {it.numero_cuota})
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color={it.es_completo ? 'success.main' : 'warning.main'} 
                              display="block" 
                              sx={{ fontSize: '0.68rem', fontWeight: 600 }}
                            >
                              {it.es_completo ? '✅ Cuota pagada al 100%' : `⏳ Adelanto aplicado (Resta Bs ${it.saldo_restante.toFixed(2)})`}
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={800}>
                            Bs {it.monto_a_pagar.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="caption" color="text.secondary" display="block">
                      Recibo a nombre de: <strong>{cobroExitoso.nombreEntrega}</strong> (CI: {cobroExitoso.ciEntrega})
                    </Typography>
                  </Paper>

                  <Stack spacing={1.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<Print />}
                      onClick={() => handleDescargarOImprimirRecibo(
                        cobroExitoso.pagos.map(p => p.pago_id),
                        cobroExitoso.nombreEntrega,
                        cobroExitoso.ciEntrega,
                        cobroExitoso.quienRecibe
                      )}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        py: 1.3,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        }
                      }}
                    >
                      Imprimir / Ver Recibo PDF
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<WhatsApp />}
                      onClick={handleAbrirModalWhatsApp}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        py: 1.3,
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1ea952 0%, #0d6e62 100%)',
                        }
                      }}
                    >
                      Enviar Recibo por WhatsApp
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RestartAlt />}
                      onClick={handleNuevaAtencion}
                      sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                    >
                      Nueva Atención
                    </Button>
                  </Stack>
                </Box>
              ) : (mensualidadesSeleccionadas.size === 0 && !formCobro.monto_recibido) ? (
                /* CASO 2: Sin cuotas seleccionadas (Terminal en reposo) */
                <Box textAlign="center" py={6}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: alpha(isDark ? '#facc15' : '#0288d1', 0.08),
                      color: isDark ? '#facc15' : '#0288d1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Payments sx={{ fontSize: 32 }} />
                  </Box>

                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Terminal en Espera
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto', mb: 3 }}>
                    Haz clic en los meses que deseas cobrar o escribe un monto abajo para distribuirlo en las cuotas pendientes.
                  </Typography>

                  {estudiantesSeleccionados.length > 0 && (
                    <Stack spacing={1.5}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Distribuir Monto / Adelanto (Bs)"
                        placeholder="Ej: 200"
                        value={formCobro.monto_recibido}
                        onChange={(e) => setFormCobro(prev => ({ ...prev, monto_recibido: e.target.value }))}
                        type="number"
                        helperText="Se cubrirán las mensualidades en orden cronológico."
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                        }}
                      />
                      <Button
                        fullWidth
                        size="small"
                        startIcon={<SelectAll />}
                        onClick={handleSeleccionarTodasPendientes}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          py: 0.8,
                          color: isDark ? '#93c5fd' : '#0288d1',
                          border: `1px solid ${isDark ? 'rgba(147, 197, 253, 0.4)' : 'rgba(2, 136, 209, 0.4)'}`,
                          bgcolor: isDark ? 'rgba(2, 136, 209, 0.15)' : 'rgba(2, 136, 209, 0.08)',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(2, 136, 209, 0.28)' : 'rgba(2, 136, 209, 0.16)',
                            borderColor: isDark ? '#93c5fd' : '#0288d1',
                          }
                        }}
                      >
                        Cobrar todas las pendientes
                      </Button>
                      <Button
                        fullWidth
                        size="small"
                        startIcon={<Warning />}
                        onClick={handleSeleccionarSoloVencidas}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          py: 0.8,
                          color: isDark ? '#fcd34d' : '#d97706',
                          border: `1px solid ${isDark ? 'rgba(252, 211, 77, 0.4)' : 'rgba(217, 119, 6, 0.4)'}`,
                          bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.16)',
                            borderColor: isDark ? '#fcd34d' : '#d97706',
                          }
                        }}
                      >
                        Cobrar solo vencidas
                      </Button>
                    </Stack>
                  )}
                </Box>
              ) : (
                /* CASO 3: Con cuotas seleccionadas o distribución activa */
                <Stack spacing={2.5}>
                  {/* Desglose de cuotas y distribución inteligente */}
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                        Distribución ({planDistribucion.items.length} cuotas aplicadas)
                      </Typography>
                      {formCobro.monto_recibido && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setFormCobro(prev => ({ ...prev, monto_recibido: '' }))}
                          sx={{ fontSize: '0.7rem', py: 0, textTransform: 'none' }}
                        >
                          Usar monto exacto
                        </Button>
                      )}
                    </Box>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        maxHeight: 220,
                        overflowY: 'auto',
                        background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                      }}
                    >
                      {planDistribucion.items.map((item) => (
                        <Box
                          key={item.mensualidad_id}
                          sx={{
                            p: 1.2,
                            mb: 1,
                            borderRadius: '10px',
                            background: item.es_completo 
                              ? (isDark ? alpha('#10b981', 0.12) : alpha('#10b981', 0.08))
                              : (isDark ? alpha('#f59e0b', 0.16) : alpha('#f59e0b', 0.1)),
                            border: `1.5px solid ${alpha(item.es_completo ? '#10b981' : '#f59e0b', 0.4)}`,
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2" fontWeight={800}>
                                {item.mes_correspondiente} (Cuota {item.numero_cuota})
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                👦 {item.estudiante_nombre}
                              </Typography>
                            </Box>

                            <Box textAlign="right">
                              <Typography 
                                variant="subtitle1" 
                                fontWeight={900} 
                                color={item.es_completo ? '#10b981' : '#f59e0b'}
                              >
                                Bs {item.monto_a_pagar.toFixed(2)}
                              </Typography>
                              <Chip
                                size="small"
                                label={item.es_completo ? '100% Cubierta' : `Adelanto (Resta Bs ${item.saldo_restante.toFixed(0)})`}
                                color={item.es_completo ? 'success' : 'warning'}
                                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      ))}

                      {planDistribucion.sobrante > 0 && (
                        <Alert severity="info" sx={{ mt: 1, py: 0.5, borderRadius: '8px' }}>
                          <Typography variant="caption">
                            💡 Cubre la totalidad de cuotas. Sobran Bs {planDistribucion.sobrante.toFixed(2)}.
                          </Typography>
                        </Alert>
                      )}
                    </Paper>
                  </Box>

                  {/* Total general a cobrar */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      background: isDark
                        ? alpha('#facc15', 0.12)
                        : alpha('#0288d1', 0.08),
                      border: `1.5px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.35)}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                        Total Aplicado a Cuotas
                      </Typography>
                      <Typography variant="h4" fontWeight={900} color={isDark ? '#facc15' : '#0288d1'}>
                        Bs {planDistribucion.totalDistribuido.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {planDistribucion.items.filter(i => i.es_completo).length} cuotas completas
                        {planDistribucion.items.some(i => i.es_adelanto_parcial) ? ', 1 con adelanto parcial' : ''}
                      </Typography>
                    </Box>
                    <Payments sx={{ fontSize: 36, color: isDark ? '#facc15' : '#0288d1', opacity: 0.8 }} />
                  </Box>

                  {/* Campo de Monto Entregado / Distribuido */}
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                        Monto Entregado / a Cobrar (Bs)
                      </Typography>
                      {formCobro.monto_recibido && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setFormCobro(prev => ({ ...prev, monto_recibido: '' }))}
                          sx={{ fontSize: '0.7rem', py: 0, textTransform: 'none' }}
                        >
                          Usar exacto
                        </Button>
                      )}
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={planDistribucion.sumaSeleccionadas > 0 ? `Exacto: ${planDistribucion.sumaSeleccionadas.toFixed(0)}` : 'Ej: 200'}
                      value={formCobro.monto_recibido}
                      onChange={(e) => setFormCobro(prev => ({ ...prev, monto_recibido: e.target.value }))}
                      type="number"
                      helperText="Si el padre entrega un monto mayor, se cubre la cuota y el excedente descuenta de la siguiente como adelanto."
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                      }}
                    />

                    {/* Botones de atajo rápido de montos */}
                    <Stack direction="row" spacing={0.8} mt={1} flexWrap="wrap" useFlexGap>
                      {planDistribucion.sumaSeleccionadas > 0 && (
                        <Button
                          size="small"
                          onClick={() => setFormCobro(prev => ({ ...prev, monto_recibido: '' }))}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            py: 0.4,
                            px: 1.2,
                            border: !formCobro.monto_recibido
                              ? 'none'
                              : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'}`,
                            background: !formCobro.monto_recibido
                              ? (isDark ? '#facc15' : '#0288d1')
                              : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'),
                            color: !formCobro.monto_recibido
                              ? '#000'
                              : (isDark ? '#f8fafc' : '#1e293b'),
                            '&:hover': {
                              background: !formCobro.monto_recibido
                                ? (isDark ? '#eab308' : '#0277bd')
                                : (isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)'),
                            }
                          }}
                        >
                          Exacto (Bs {planDistribucion.sumaSeleccionadas.toFixed(0)})
                        </Button>
                      )}
                      {[100, 200, 300, 500, 1000].map(m => {
                        const isSelected = formCobro.monto_recibido === m.toString();
                        return (
                          <Button
                            key={m}
                            size="small"
                            onClick={() => setFormCobro(prev => ({ ...prev, monto_recibido: m.toString() }))}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              py: 0.4,
                              px: 1.2,
                              border: isSelected
                                ? 'none'
                                : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'}`,
                              background: isSelected
                                ? (isDark ? '#facc15' : '#0288d1')
                                : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'),
                              color: isSelected
                                ? '#000'
                                : (isDark ? '#f8fafc' : '#1e293b'),
                              '&:hover': {
                                background: isSelected
                                  ? (isDark ? '#eab308' : '#0277bd')
                                  : (isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)'),
                              }
                            }}
                          >
                            Bs {m}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Box>

                  {/* Selector de Método de Pago (Solo Efectivo y QR) */}
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                      Forma de Pago
                    </Typography>
                    <ToggleButtonGroup
                      value={formCobro.metodo_pago}
                      exclusive
                      onChange={(_, val) => {
                        if (val) setFormCobro(prev => ({ ...prev, metodo_pago: val }));
                      }}
                      fullWidth
                      size="small"
                      sx={{
                        mt: 1,
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        borderRadius: '12px',
                        p: '3px',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                        '& .MuiToggleButton-root': {
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          py: 1,
                          border: 'none',
                          color: isDark ? '#cbd5e1' : '#475569',
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            background: isDark
                              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                            color: isDark ? '#000' : '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            '&:hover': {
                              background: isDark
                                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                            }
                          },
                          '&:hover': {
                            background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                            color: isDark ? '#fff' : '#000',
                          }
                        }
                      }}
                    >
                      <ToggleButton value="efectivo">💵 Efectivo</ToggleButton>
                      <ToggleButton value="qr">📱 Pago con QR</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {formCobro.metodo_pago === 'qr' && (
                    <Box sx={{ mt: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        label="N° de Referencia / Transacción QR"
                        placeholder="Ej: TRX-982341..."
                        value={formCobro.numero_referencia}
                        onChange={(e) => setFormCobro(prev => ({ ...prev, numero_referencia: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        helperText="Ingresa el número de transacción o comprobante emitido por el banco"
                      />
                    </Box>
                  )}

                  {/* Datos del Recibo / Comprobante */}
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Datos del Recibo
                    </Typography>

                    <Stack spacing={1.5} mt={1}>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        label="Entregado por / A nombre de:"
                        value={formCobro.nombre_entrega}
                        onChange={(e) => setFormCobro(prev => ({ ...prev, nombre_entrega: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        required
                        label="C.I. / NIT:"
                        value={formCobro.ci_entrega}
                        onChange={(e) => setFormCobro(prev => ({ ...prev, ci_entrega: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />

                      <TextField
                        fullWidth
                        select
                        size="small"
                        label="Recibido en caja por:"
                        value={formCobro.quien_recibe}
                        onChange={(e) => setFormCobro(prev => ({ ...prev, quien_recibe: e.target.value as any }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      >
                        {PERSONAS_QUE_RECIBEN.map(p => (
                          <MenuItem key={p.value} value={p.value}>
                            {p.label} (CI: {p.ci})
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Fecha de Pago (opcional para migración de fechas anteriores) */}
                      <Box>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="Fecha de Pago (Histórica / Opcional)"
                          value={formCobro.fecha_pago}
                          onChange={(e) => setFormCobro(prev => ({ ...prev, fecha_pago: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          helperText={
                            formCobro.fecha_pago
                              ? `Pago fechado al: ${formCobro.fecha_pago}`
                              : 'Vacío = toma la fecha actual de hoy automáticamente'
                          }
                          sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                          }}
                        />
                        {formCobro.fecha_pago && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setFormCobro(prev => ({ ...prev, fecha_pago: '' }))}
                            sx={{
                              mt: 0.5,
                              fontSize: '0.72rem',
                              textTransform: 'none',
                              color: isDark ? '#facc15' : '#0288d1',
                              p: 0,
                              fontWeight: 700
                            }}
                          >
                            Restablecer a fecha de hoy
                          </Button>
                        )}
                      </Box>

                      {/* Control de Facturación */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          background: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                          border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formCobro.entrego_factura}
                              onChange={(e) => setFormCobro(prev => ({ ...prev, entrego_factura: e.target.checked }))}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {formCobro.entrego_factura ? '🧾 Se emite Factura' : '📄 Solo Recibo Oficial'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formCobro.entrego_factura ? 'Se registrará como pago facturado' : 'Comprobante interno de caja'}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
                        />

                        {formCobro.entrego_factura && (
                          <TextField
                            fullWidth
                            size="small"
                            label="N° de Factura"
                            placeholder="Ej: 10452"
                            value={formCobro.numero_factura}
                            onChange={(e) => setFormCobro(prev => ({ ...prev, numero_factura: e.target.value }))}
                            sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </Box>

                  {/* Botón Principal de Cobro */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loadingCobro || planDistribucion.totalDistribuido === 0}
                    onClick={handleProcesarCobroTerminal}
                    startIcon={loadingCobro ? <CircularProgress size={22} color="inherit" /> : <Payment />}
                    sx={{
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      py: 1.5,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                      boxShadow: isDark
                        ? '0 6px 20px rgba(250, 204, 21, 0.4)'
                        : '0 6px 20px rgba(2, 136, 209, 0.4)',
                      '&:hover': {
                        background: isDark
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                          : 'linear-gradient(135deg, #01579b 0%, #004ba0 100%)',
                      },
                      '&.Mui-disabled': {
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                        color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    {loadingCobro ? 'Procesando Cobro...' : `Cobrar Bs ${planDistribucion.totalDistribuido.toFixed(2)} e Imprimir Recibo`}
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal para Generar Mensualidades (cuando un estudiante no tiene cuotas generadas) */}
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
                      Grado:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {estudianteParaGenerar?.matricula?.grado_nombre} "{estudianteParaGenerar?.matricula?.paralelo_nombre}"
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

            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                📅 Se generarán 10 mensualidades
              </Typography>
              <Typography variant="caption" component="div">
                • Meses: Febrero a Noviembre
              </Typography>
              <Typography variant="caption" component="div">
                • Fechas de vencimiento automáticas
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
            }}
          >
            {loadingGenerar ? 'Generando...' : 'Generar 10 Mensualidades'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Compartir Recibo por WhatsApp */}
      <Dialog
        open={modalWhatsAppOpen}
        onClose={() => !enviandoWhatsApp && setModalWhatsAppOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '22px',
            background: isDark ? alpha('#0f172a', 0.98) : alpha('#fff', 0.98),
            backdropFilter: 'blur(20px)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <WhatsApp fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Enviar por WhatsApp
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Comprobante oficial de pago
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setModalWhatsAppOpen(false)} size="small" disabled={enviandoWhatsApp}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            {cobroExitoso && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  background: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  A nombre de: <strong>{cobroExitoso.nombreEntrega}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Monto: <strong>Bs {cobroExitoso.totalPagado.toFixed(2)}</strong> ({cobroExitoso.itemsDistribuidos.length} cuotas)
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              size="small"
              label="Número de Celular / WhatsApp"
              placeholder="Ej: 71234567 o 59171234567"
              value={telefonoWhatsApp}
              onChange={(e) => setTelefonoWhatsApp(e.target.value)}
              helperText="El número al que se enviará el comprobante"
              InputProps={{
                startAdornment: (
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1, fontSize: '0.85rem' }}>
                    📱
                  </Box>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Alert severity="info" sx={{ borderRadius: '12px', py: 0.5 }}>
              <Typography variant="caption">
                Puedes enviar el documento PDF directo por el bot de WhatsApp o abrir WhatsApp Web directamente.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={enviandoWhatsApp}
            onClick={handleEnviarPDFWhatsAppDirecto}
            startIcon={enviandoWhatsApp ? <CircularProgress size={20} color="inherit" /> : <Send />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              py: 1.2,
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #1ea952 0%, #0d6e62 100%)',
              }
            }}
          >
            {enviandoWhatsApp ? 'Enviando PDF...' : 'Enviar PDF Adjunto (Bot)'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            disabled={enviandoWhatsApp}
            onClick={handleEnviarWhatsAppWeb}
            startIcon={<WhatsApp />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              py: 1,
              color: isDark ? '#34d399' : '#128C7E',
              borderColor: alpha('#25D366', 0.5),
              '&:hover': {
                bgcolor: alpha('#25D366', 0.08),
                borderColor: '#25D366',
              }
            }}
          >
            Abrir en WhatsApp Web
          </Button>
        </DialogActions>
      </Dialog>

      {/* 📢 Modal de Recordatorio de Deuda por WhatsApp */}
      <Dialog
        open={modalRecordatorioOpen}
        onClose={() => setModalRecordatorioOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${alpha('#25D366', 0.3)}`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: alpha('#25D366', 0.15), color: '#25D366' }}>
              <WhatsApp />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Recordatorio de Pago por WhatsApp
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {recordatorioTitulo}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setModalRecordatorioOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Número de Celular / WhatsApp del Tutor"
              placeholder="Ej: 71234567 o 59171234567"
              value={recordatorioTelefono}
              onChange={(e) => setRecordatorioTelefono(e.target.value)}
              helperText="Número de contacto para el envío del aviso"
              InputProps={{
                startAdornment: (
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1, fontSize: '0.85rem' }}>
                    📱
                  </Box>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Mensaje del Recordatorio"
              value={recordatorioMensaje}
              onChange={(e) => setRecordatorioMensaje(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem'
                }
              }}
            />

            <Alert severity="info" sx={{ borderRadius: '12px', py: 0.5 }}>
              <Typography variant="caption">
                Puedes enviar el recordatorio automático mediante el bot o abrir WhatsApp Web directamente.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={enviandoRecordatorio}
            onClick={handleEnviarRecordatorioBot}
            startIcon={enviandoRecordatorio ? <CircularProgress size={20} color="inherit" /> : <Send />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              py: 1.2,
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #1ea952 0%, #0d6e62 100%)',
              }
            }}
          >
            {enviandoRecordatorio ? 'Enviando Aviso...' : 'Enviar Recordatorio Automático (Bot)'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            disabled={enviandoRecordatorio}
            onClick={handleEnviarRecordatorioWeb}
            startIcon={<WhatsApp />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              py: 1,
              color: isDark ? '#34d399' : '#128C7E',
              borderColor: alpha('#25D366', 0.5),
              '&:hover': {
                bgcolor: alpha('#25D366', 0.08),
                borderColor: '#25D366',
              }
            }}
          >
            Abrir en WhatsApp Web
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};