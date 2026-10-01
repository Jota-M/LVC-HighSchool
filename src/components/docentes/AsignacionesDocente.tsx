// components/docentes/AsignacionesDocente.tsx
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Paper,
  Divider,
  Stack,
  Fade,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Tooltip,
  ButtonBase,
  Checkbox,
  Snackbar,
  Pagination,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  ToggleButtonGroup,
  ToggleButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  SwapHoriz as SwapIcon,
  CalendarMonth as CalendarIcon,
  ToggleOn as ToggleOnIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useAsignacionesDocente } from '@/hooks/useAsignacionesDocente';
import asignacionDocenteService from '@/services/asignacionDocenteService';
import docenteService from '@/services/docenteService';
import { toast } from 'react-hot-toast';
import {
  CrearAsignacionDTO,
  ActualizarAsignacionDTO,
  GradoMateria,
  Paralelo,
  PeriodoAcademico,
  AsignacionDocente as AsignacionDocenteType,
} from '@/types/asignacionDocenteTypes';
import { Docente } from '@/types/docenteTypes';

// ──────────────────────────────────────────────
// Tab panel interno (solo para el dialog edición)
// ──────────────────────────────────────────────
interface EditTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const EditTabPanel: React.FC<EditTabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export const AsignacionesDocente: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Estado general ──
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingModalData, setIsLoadingModalData] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [editTab, setEditTab] = useState(0);

  // ── Modos de vista ──
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'por_grado' | 'por_docente'>('cards');

  // ── Feedback Snackbar ──
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ── Catálogos ligeros para filtros principales ──
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [docentesSimple, setDocentesSimple] = useState<Docente[]>([]);
  const [gradosParaFiltro, setGradosParaFiltro] = useState<{ id: number; nombre: string }[]>([]);

  // ── Catálogos pesados para modal de creación (carga bajo demanda) ──
  const [modalDataCargada, setModalDataCargada] = useState(false);
  const [gradoMaterias, setGradoMaterias] = useState<GradoMateria[]>([]);
  const [todosLosParalelos, setTodosLosParalelos] = useState<Paralelo[]>([]);
  const [todasAsignacionesPeriodo, setTodasAsignacionesPeriodo] = useState<AsignacionDocenteType[]>([]);

  // ── Estados de selección en modal de creación ──
  const [modoAsignacion, setModoAsignacion] = useState<'por_materia' | 'por_curso'>('por_materia');
  const [docenteIdSeleccionado, setDocenteIdSeleccionado] = useState<number | 0>(0);
  const [materiaIdSeleccionada, setMateriaIdSeleccionada] = useState<number | ''>('');
  const [gradoIdSeleccionado, setGradoIdSeleccionado] = useState<number | ''>('');
  const [materiasSeleccionadasIds, setMateriasSeleccionadasIds] = useState<number[]>([]);
  const [paralelosSeleccionadosIds, setParalelosSeleccionadosIds] = useState<number[]>([]);
  const [targetsSeleccionadosKeys, setTargetsSeleccionadosKeys] = useState<string[]>([]);
  const [esTitular, setEsTitular] = useState<boolean>(true);
  const [fechaInicio, setFechaInicio] = useState<string>(new Date().toISOString().split('T')[0]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<number | ''>('');

  // Helper para deduplicar paralelos por (grado_id, nombre, turno_nombre)
  const deduplicarParalelos = (lista: Paralelo[]): Paralelo[] => {
    const map = new Map<string, Paralelo>();
    lista.forEach(p => {
      const key = `${p.grado_id}-${p.nombre.trim().toUpperCase()}-${(p.turno_nombre || '').trim().toUpperCase()}`;
      if (!map.has(key)) {
        map.set(key, p);
      } else {
        const existing = map.get(key)!;
        if (p.id > existing.id) {
          map.set(key, p);
        }
      }
    });
    return Array.from(map.values());
  };

  // ── Edición ──
  const [asignacionEditando, setAsignacionEditando] = useState<AsignacionDocenteType | null>(null);
  const [datosEdicion, setDatosEdicion] = useState<ActualizarAsignacionDTO>({
    es_titular: true,
    fecha_inicio: '',
    fecha_fin: '',
    activo: true,
  });
  const [nuevoDocenteId, setNuevoDocenteId] = useState<number>(0);

  // ── Filtros y Búsqueda reactiva ──
  const [searchLocal, setSearchLocal] = useState('');
  const [filtroGradoLocal, setFiltroGradoLocal] = useState<number | ''>('');
  const [filtroDocenteLocal, setFiltroDocenteLocal] = useState<number | ''>('');

  // ── Hook principal (control de paginación y llamadas al servidor) ──
  const {
    asignaciones,
    paginacion,
    isLoading,
    isUpdating,
    actualizarFiltros,
    crear,
    asignarMasivo,
    actualizar,
    cambiarDocente,
    eliminar,
  } = useAsignacionesDocente(
    { limit: 12, activo: true },
    { enabled: periodoSeleccionado !== null }
  );

  // ──────────────────────────────────────────────
  // Carga inicial optimizada (solo periodos y filtros ligeros)
  // ──────────────────────────────────────────────
  useEffect(() => {
    cargarInicial();
  }, []);

  const cargarInicial = async () => {
    setIsLoadingInitial(true);
    try {
      // 1. Obtener periodos y docentes con query ultraligera (simple=true)
      const [periodosData, docentesData] = await Promise.all([
        asignacionDocenteService.datosAcademicos.obtenerPeriodos(true),
        docenteService.listar({ activo: true, limit: 500, simple: true }),
      ]);

      setPeriodos(periodosData);
      setDocentesSimple(docentesData.data?.docentes || []);

      const periodoActivo = periodosData.find((p: PeriodoAcademico) => p.activo) || periodosData[0];
      if (periodoActivo) {
        setPeriodoSeleccionado(periodoActivo.id);
        actualizarFiltros({
          periodo_academico_id: periodoActivo.id,
          page: 1,
          limit: 12,
          activo: true,
        });
      }
    } catch (error) {
      console.error('Error al inicializar asignaciones:', error);
      toast.error('Error al cargar datos iniciales');
    } finally {
      setIsLoadingInitial(false);
    }
  };

  // Cargar lista de grados única para el desplegable de filtro cuando esté disponible
  const cargarGradosParaFiltro = useCallback(async () => {
    try {
      const gm = await asignacionDocenteService.datosAcademicos.obtenerGradoMaterias();
      const map = new Map<number, string>();
      gm.forEach(item => {
        if (!map.has(item.grado_id)) {
          map.set(item.grado_id, `${item.nivel_nombre ? item.nivel_nombre + ' - ' : ''}${item.grado_nombre}`);
        }
      });
      setGradosParaFiltro(Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre })));
    } catch (err) {
      console.warn('No se pudieron cargar grados para filtro:', err);
    }
  }, []);

  useEffect(() => {
    cargarGradosParaFiltro();
  }, [cargarGradosParaFiltro]);

  // ──────────────────────────────────────────────
  // Debounce de búsqueda en vivo
  // ──────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      actualizarFiltros({
        search: searchLocal.trim() || undefined,
        page: 1,
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchLocal, actualizarFiltros]);

  // Manejar cambio de Periodo
  const handlePeriodoChange = (nuevoPeriodoId: number) => {
    setPeriodoSeleccionado(nuevoPeriodoId);
    setModalDataCargada(false); // Forzar recarga de mapa de ocupación en modal si cambia el periodo
    actualizarFiltros({
      periodo_academico_id: nuevoPeriodoId,
      page: 1,
    });
  };

  // Manejar cambio de Grado en filtro
  const handleGradoFiltroChange = (nuevoGradoId: number | '') => {
    setFiltroGradoLocal(nuevoGradoId);
    actualizarFiltros({
      grado_id: nuevoGradoId === '' ? undefined : Number(nuevoGradoId),
      page: 1,
    });
  };

  // Manejar cambio de Docente en filtro
  const handleDocenteFiltroChange = (nuevoDocenteId: number | '') => {
    setFiltroDocenteLocal(nuevoDocenteId);
    actualizarFiltros({
      docente_id: nuevoDocenteId === '' ? undefined : Number(nuevoDocenteId),
      page: 1,
    });
  };

  // Manejar cambio de página
  const handlePageChange = (nuevaPagina: number) => {
    actualizarFiltros({ page: nuevaPagina });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // ──────────────────────────────────────────────
  // Carga bajo demanda para el modal "+ Asignar Docente"
  // ──────────────────────────────────────────────
  const asegurarDatosModal = async (periodoId: number) => {
    if (modalDataCargada) return;
    setIsLoadingModalData(true);
    try {
      const periodo = periodos.find(p => p.id === periodoId);
      const anio = periodo ? (periodo.anio || new Date(periodo.fecha_inicio).getFullYear()) : undefined;

      const [gmData, paralelosData, asignacionesData] = await Promise.all([
        asignacionDocenteService.datosAcademicos.obtenerGradoMaterias(),
        asignacionDocenteService.datosAcademicos.obtenerTodosLosParalelos(anio),
        asignacionDocenteService.listar({
          periodo_academico_id: periodoId,
          limit: 2000,
          activo: true,
        }),
      ]);

      setGradoMaterias(gmData);
      setTodosLosParalelos(deduplicarParalelos(paralelosData));
      setTodasAsignacionesPeriodo(asignacionesData.data?.asignaciones || []);
      setModalDataCargada(true);
    } catch (error) {
      console.error('Error cargando datos del modal:', error);
      toast.error('Error al preparar datos de asignación');
    } finally {
      setIsLoadingModalData(false);
    }
  };

  const handleOpenDialog = async () => {
    if (!periodoSeleccionado) {
      toast.error('Selecciona un periodo académico primero');
      return;
    }
    setDocenteIdSeleccionado(0);
    setMateriaIdSeleccionada('');
    setGradoIdSeleccionado('');
    setTurnoSeleccionado('');
    setMateriasSeleccionadasIds([]);
    setParalelosSeleccionadosIds([]);
    setTargetsSeleccionadosKeys([]);
    setEsTitular(true);
    setFechaInicio(new Date().toISOString().split('T')[0]);

    setDialogOpen(true);
    await asegurarDatosModal(periodoSeleccionado);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDocenteIdSeleccionado(0);
    setMateriaIdSeleccionada('');
    setGradoIdSeleccionado('');
    setTurnoSeleccionado('');
    setMateriasSeleccionadasIds([]);
    setParalelosSeleccionadosIds([]);
    setTargetsSeleccionadosKeys([]);
  };

  // ──────────────────────────────────────────────
  // Catálogos derivados para el modal
  // ──────────────────────────────────────────────
  const materiasUnicasModal = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; codigo?: string; color?: string; area_nombre?: string; gradosCount: number }>();
    gradoMaterias.forEach(gm => {
      if (!map.has(gm.materia_id)) {
        map.set(gm.materia_id, {
          id: gm.materia_id,
          nombre: gm.materia_nombre,
          codigo: gm.materia_codigo,
          color: gm.materia_color,
          area_nombre: gm.area_nombre,
          gradosCount: 1,
        });
      } else {
        map.get(gm.materia_id)!.gradosCount++;
      }
    });
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [gradoMaterias]);

  const gradosUnicosModal = useMemo(() => {
    const map = new Map<number, { grado_id: number; grado_nombre: string; nivel_nombre: string }>();
    gradoMaterias.forEach(gm => {
      if (!map.has(gm.grado_id)) {
        map.set(gm.grado_id, {
          grado_id: gm.grado_id,
          grado_nombre: gm.grado_nombre,
          nivel_nombre: gm.nivel_nombre || '',
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.grado_nombre.localeCompare(b.grado_nombre));
  }, [gradoMaterias]);

  const materiasDelGradoModal = useMemo(() => {
    if (!gradoIdSeleccionado) return [];
    return gradoMaterias.filter(gm => gm.grado_id === Number(gradoIdSeleccionado));
  }, [gradoMaterias, gradoIdSeleccionado]);

  const gradosDeEstaMateriaModal = useMemo(() => {
    if (!materiaIdSeleccionada) return [];
    return gradoMaterias.filter(gm => gm.materia_id === Number(materiaIdSeleccionada));
  }, [gradoMaterias, materiaIdSeleccionada]);

  const turnosDisponiblesModal = useMemo(() => {
    const map = new Map<string, { id: number; nombre: string; ids: number[] }>();
    todosLosParalelos.forEach(p => {
      if (p.turno_id && p.turno_nombre) {
        const key = p.turno_nombre.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, { id: p.turno_id, nombre: p.turno_nombre.trim(), ids: [p.turno_id] });
        } else {
          const entry = map.get(key)!;
          if (!entry.ids.includes(p.turno_id)) {
            entry.ids.push(p.turno_id);
          }
        }
      }
    });
    return Array.from(map.values());
  }, [todosLosParalelos]);

  const paralelosFiltradosModal = useMemo(() => {
    if (!gradoIdSeleccionado) return [];
    let list = todosLosParalelos.filter(p => p.grado_id === Number(gradoIdSeleccionado));
    if (turnoSeleccionado) {
      const selectedTurnoObj = turnosDisponiblesModal.find(t => t.id === Number(turnoSeleccionado) || t.ids.includes(Number(turnoSeleccionado)));
      if (selectedTurnoObj) {
        list = list.filter(p => p.turno_id && selectedTurnoObj.ids.includes(p.turno_id));
      } else {
        list = list.filter(p => p.turno_id === Number(turnoSeleccionado));
      }
    }
    return list;
  }, [todosLosParalelos, gradoIdSeleccionado, turnoSeleccionado, turnosDisponiblesModal]);

  const getAsignacionExistente = (gmId: number, paraleloId: number) => {
    return todasAsignacionesPeriodo.find(
      a => a.grado_materia_id === gmId && a.paralelo_id === paraleloId && a.activo
    );
  };

  // ──────────────────────────────────────────────
  // Agrupaciones para vistas secundarias
  // ──────────────────────────────────────────────
  const asignacionesPorGrado = useMemo(() => {
    const map = new Map<number, { grado_id: number; grado_nombre: string; nivel_nombre: string; asignaciones: AsignacionDocenteType[] }>();
    asignaciones.forEach(a => {
      const gId = a.grado_id ?? 0;
      if (!map.has(gId)) {
        map.set(gId, {
          grado_id: gId,
          grado_nombre: a.grado_nombre || 'Sin Grado',
          nivel_nombre: a.nivel_nombre || '',
          asignaciones: [a],
        });
      } else {
        map.get(gId)!.asignaciones.push(a);
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.grado_nombre || '').localeCompare(b.grado_nombre || ''));
  }, [asignaciones]);

  const asignacionesPorDocente = useMemo(() => {
    const map = new Map<number, { docente_id: number; nombres: string; apellidos: string; codigo?: string; especialidad?: string; asignaciones: AsignacionDocenteType[] }>();
    asignaciones.forEach(a => {
      const docId = a.docente_id ?? 0;
      if (!map.has(docId)) {
        map.set(docId, {
          docente_id: docId,
          nombres: a.docente_nombres || '',
          apellidos: a.docente_apellidos || '',
          codigo: a.docente_codigo,
          especialidad: a.docente_especialidad || a.especialidad,
          asignaciones: [a],
        });
      } else {
        map.get(docId)!.asignaciones.push(a);
      }
    });
    return Array.from(map.values()).sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`));
  }, [asignaciones]);

  // ──────────────────────────────────────────────
  // Handlers — Crear Asignación
  // ──────────────────────────────────────────────
  const handleToggleTarget = (key: string) => {
    setTargetsSeleccionadosKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllTargetsDisponibles = () => {
    const allDisponibles: string[] = [];
    gradosDeEstaMateriaModal.forEach(gm => {
      const parals = todosLosParalelos.filter(p => p.grado_id === gm.grado_id && (!turnoSeleccionado || p.turno_id === Number(turnoSeleccionado)));
      parals.forEach(p => {
        if (!getAsignacionExistente(gm.id, p.id)) {
          allDisponibles.push(`${gm.id}-${p.id}`);
        }
      });
    });

    if (targetsSeleccionadosKeys.length === allDisponibles.length && allDisponibles.length > 0) {
      setTargetsSeleccionadosKeys([]);
    } else {
      setTargetsSeleccionadosKeys(allDisponibles);
    }
  };

  const handleToggleMateria = (gmId: number) => {
    setMateriasSeleccionadasIds(prev =>
      prev.includes(gmId) ? prev.filter(id => id !== gmId) : [...prev, gmId]
    );
  };

  const handleSelectAllMaterias = () => {
    if (materiasSeleccionadasIds.length === materiasDelGradoModal.length) {
      setMateriasSeleccionadasIds([]);
    } else {
      setMateriasSeleccionadasIds(materiasDelGradoModal.map(gm => gm.id));
    }
  };

  const handleToggleParalelo = (paraleloId: number) => {
    setParalelosSeleccionadosIds(prev =>
      prev.includes(paraleloId) ? prev.filter(id => id !== paraleloId) : [...prev, paraleloId]
    );
  };

  const handleSelectAllParalelos = () => {
    if (paralelosSeleccionadosIds.length === paralelosFiltradosModal.length) {
      setParalelosSeleccionadosIds([]);
    } else {
      setParalelosSeleccionadosIds(paralelosFiltradosModal.map(p => p.id));
    }
  };

  const handleCrearAsignacion = async () => {
    if (!docenteIdSeleccionado) { toast.error('Selecciona un docente'); return; }

    const asignacionesAEnviar: CrearAsignacionDTO[] = [];

    if (modoAsignacion === 'por_materia') {
      if (!materiaIdSeleccionada) { toast.error('Selecciona una materia'); return; }
      if (targetsSeleccionadosKeys.length === 0) { toast.error('Selecciona al menos un curso o paralelo'); return; }

      targetsSeleccionadosKeys.forEach(key => {
        const [gmId, pId] = key.split('-').map(Number);
        if (!getAsignacionExistente(gmId, pId)) {
          asignacionesAEnviar.push({
            docente_id: docenteIdSeleccionado,
            grado_materia_id: gmId,
            paralelo_id: pId,
            periodo_academico_id: periodoSeleccionado!,
            es_titular: esTitular,
            fecha_inicio: fechaInicio,
          });
        }
      });
    } else {
      if (!gradoIdSeleccionado) { toast.error('Selecciona un grado / curso'); return; }
      if (materiasSeleccionadasIds.length === 0) { toast.error('Selecciona al menos una materia'); return; }
      if (paralelosSeleccionadosIds.length === 0) { toast.error('Selecciona al menos un paralelo'); return; }

      for (const gmId of materiasSeleccionadasIds) {
        for (const pId of paralelosSeleccionadosIds) {
          if (!getAsignacionExistente(gmId, pId)) {
            asignacionesAEnviar.push({
              docente_id: docenteIdSeleccionado,
              grado_materia_id: gmId,
              paralelo_id: pId,
              periodo_academico_id: periodoSeleccionado!,
              es_titular: esTitular,
              fecha_inicio: fechaInicio,
            });
          }
        }
      }
    }

    if (asignacionesAEnviar.length === 0) {
      toast.error('Todos los cursos seleccionados ya tienen docente asignado para esta materia');
      return;
    }

    if (asignacionesAEnviar.length === 1) {
      const success = await crear(asignacionesAEnviar[0]);
      if (success) {
        setModalDataCargada(false);
        handleCloseDialog();
        showSnackbar('¡Asignación creada exitosamente!', 'success');
      }
    } else {
      const res = await asignarMasivo({
        asignaciones: asignacionesAEnviar,
        periodo_academico_id: periodoSeleccionado!,
      });
      if (res.success) {
        setModalDataCargada(false);
        handleCloseDialog();
        showSnackbar(`¡${res.resultados?.exitosas || asignacionesAEnviar.length} asignaciones creadas exitosamente!`, 'success');
      }
    }
  };

  // ──────────────────────────────────────────────
  // Handlers — Edición y Reasignación
  // ──────────────────────────────────────────────
  const formatFechaParaInput = (fecha?: string | null): string => {
    if (!fecha) return '';
    const str = String(fecha).trim();
    const match = str.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
    return '';
  };

  const handleOpenEditDialog = (asignacion: AsignacionDocenteType) => {
    setAsignacionEditando(asignacion);
    setDatosEdicion({
      es_titular: asignacion.es_titular,
      fecha_inicio: formatFechaParaInput(asignacion.fecha_inicio),
      fecha_fin: formatFechaParaInput(asignacion.fecha_fin),
      activo: asignacion.activo,
    });
    setNuevoDocenteId(asignacion.docente_id);
    setEditTab(0);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setAsignacionEditando(null);
    setNuevoDocenteId(0);
  };

  const handleGuardarEdicion = async () => {
    if (!asignacionEditando) return;

    const payload: ActualizarAsignacionDTO = {};
    if (datosEdicion.es_titular !== asignacionEditando.es_titular) payload.es_titular = datosEdicion.es_titular;
    if (datosEdicion.activo !== asignacionEditando.activo) payload.activo = datosEdicion.activo;
    
    const origFechaInicio = formatFechaParaInput(asignacionEditando.fecha_inicio);
    const origFechaFin = formatFechaParaInput(asignacionEditando.fecha_fin);

    if ((datosEdicion.fecha_inicio ?? '') !== origFechaInicio) {
      payload.fecha_inicio = datosEdicion.fecha_inicio || undefined;
    }
    if ((datosEdicion.fecha_fin ?? '') !== origFechaFin) {
      payload.fecha_fin = datosEdicion.fecha_fin || undefined;
    }

    const success = await actualizar(asignacionEditando.id, payload);
    if (success) {
      handleCloseEditDialog();
      showSnackbar('¡Asignación actualizada exitosamente!', 'success');
    }
  };

  const handleCambiarDocente = async () => {
    if (!asignacionEditando) return;
    if (!nuevoDocenteId || nuevoDocenteId === asignacionEditando.docente_id) {
      toast.error('Selecciona un docente diferente');
      return;
    }
    const success = await cambiarDocente(asignacionEditando.id, { nuevo_docente_id: nuevoDocenteId });
    if (success) {
      handleCloseEditDialog();
      showSnackbar('¡Docente reasignado exitosamente!', 'success');
    }
  };

  // ──────────────────────────────────────────────
  // Helpers visuales / tokens de diseño
  // ──────────────────────────────────────────────
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const brand = accentColor;
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`, borderRadius: R },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    '& .MuiSelect-select': { borderRadius: `${R} !important` },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
  };

  const primaryBtn = {
    borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none' as const,
    background: brand, color: isDark ? '#000' : '#fff',
    boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
    '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
    '&.Mui-disabled': { opacity: 0.3, background: brand, color: isDark ? '#000' : '#fff' },
  };

  const cancelBtn = {
    borderRadius: '10px', color: 'text.secondary', px: 2,
    textTransform: 'none' as const, fontWeight: 600,
    '&:hover': { background: 'rgba(255,255,255,0.05)' },
  };

  const gradientBtn = {
    background: isDark
      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
    color: isDark ? '#000' : '#fff',
    fontWeight: 600,
    textTransform: 'none' as const,
    borderRadius: '12px',
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <Box>
      {/* ── Filtros y Barra de Control (Idéntico estilo a Estudiantes) ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '20px',
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#facc15', 0.08)} 0%, ${alpha('#f59e0b', 0.03)} 100%)`
            : `linear-gradient(135deg, ${alpha('#0288d1', 0.08)} 0%, ${alpha('#01579b', 0.03)} 100%)`,
          border: `1px solid ${alpha(accentColor, 0.2)}`,
        }}
      >
        <Stack spacing={2}>
          {/* Fila superior: Periodo, Buscador, Filtros y Botón Crear */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              {/* Periodo Académico */}
              <TextField
                select
                label="Periodo"
                value={periodoSeleccionado || ''}
                onChange={(e) => handlePeriodoChange(parseInt(e.target.value))}
                sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                disabled={isLoadingInitial}
                size="small"
              >
                {periodos.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {p.nombre}
                      {p.activo && (
                        <Chip label="Activo" size="small" color="success"
                          sx={{ height: 18, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {/* Buscador en vivo (server-side con debounce) */}
              <TextField
                size="small"
                placeholder="Buscar por materia, docente, código o curso..."
                value={searchLocal}
                onChange={(e) => setSearchLocal(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                }}
                sx={{ minWidth: 260, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />

              {/* Filtro por Grado */}
              <TextField
                select
                size="small"
                label="Filtrar Grado"
                value={filtroGradoLocal}
                onChange={(e) => handleGradoFiltroChange(e.target.value === '' ? '' : Number(e.target.value))}
                sx={{ minWidth: 170, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                <MenuItem value=""><em>Todos los grados</em></MenuItem>
                {gradosParaFiltro.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.nombre}
                  </MenuItem>
                ))}
              </TextField>

              {/* Filtro por Docente */}
              <TextField
                select
                size="small"
                label="Filtrar Docente"
                value={filtroDocenteLocal}
                onChange={(e) => handleDocenteFiltroChange(e.target.value === '' ? '' : Number(e.target.value))}
                sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                <MenuItem value=""><em>Todos los docentes</em></MenuItem>
                {docentesSimple.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nombres} {d.apellidos}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Botón Nueva Asignación */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              disabled={!periodoSeleccionado}
              size="medium"
              sx={{
                ...gradientBtn, px: 2.5, py: 1,
                boxShadow: `0 4px 12px ${alpha(accentColor, 0.3)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 16px ${alpha(accentColor, 0.4)}`,
                },
              }}
            >
              + Asignar Docente
            </Button>
          </Box>

          {/* Fila inferior: Toggle de Vistas (Tarjetas | Tabla | Por Curso | Por Docente) y Contador */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${borderField}`, pt: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                Vista:
              </Typography>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  borderRadius: '12px',
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: '10px',
                    px: 1.8,
                    py: 0.6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      bgcolor: accentColor,
                      color: isDark ? '#000' : '#fff',
                      '&:hover': {
                        bgcolor: isDark ? '#f59e0b' : '#01579b',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="cards">
                  <ViewModuleIcon sx={{ mr: 0.8, fontSize: 18 }} />
                  Tarjetas
                </ToggleButton>
                <ToggleButton value="table">
                  <TableRowsIcon sx={{ mr: 0.8, fontSize: 18 }} />
                  Tabla
                </ToggleButton>
                <ToggleButton value="por_grado">
                  <SchoolIcon sx={{ mr: 0.8, fontSize: 18 }} />
                  Por Curso
                </ToggleButton>
                <ToggleButton value="por_docente">
                  <PersonIcon sx={{ mr: 0.8, fontSize: 18 }} />
                  Por Docente
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {isLoading ? 'Cargando...' : `${paginacion.total} asignación(es) registrada(s)`}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* ── CONTENIDO PRINCIPAL SEGÚN MODO DE VISTA ── */}
      {isLoadingInitial || (isLoading && asignaciones.length === 0) ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
          <CircularProgress size={50} thickness={4} sx={{ color: accentColor }} />
          <Typography variant="body2" color="text.secondary">Cargando asignaciones...</Typography>
        </Box>
      ) : paginacion.total === 0 ? (
        <Fade in>
          <Paper elevation={0} sx={{
            p: 8, borderRadius: '20px', textAlign: 'center',
            background: isDark ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
            border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
          }}>
            <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No se encontraron asignaciones</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {periodoSeleccionado
                ? 'No hay asignaciones registradas con los filtros o término de búsqueda ingresado.'
                : 'Selecciona un periodo académico para ver las asignaciones.'}
            </Typography>
            {periodoSeleccionado && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}
                sx={{ ...gradientBtn, px: 4, py: 1.5 }}>
                Crear Asignación
              </Button>
            )}
          </Paper>
        </Fade>
      ) : viewMode === 'table' ? (
        /* ═════════════════════════════════════════════════
           VISTA 1: TABLA PAGINADA (IDÉNTICA A ESTUDIANTES)
        ═════════════════════════════════════════════════ */
        <Fade in timeout={300}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '18px',
              overflow: 'hidden',
              border: `1px solid ${borderField}`,
              background: isDark ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: isDark ? alpha(accentColor, 0.12) : alpha(accentColor, 0.06) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Materia</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Docente</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Curso / Grado</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Paralelo</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Turno</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Tipo</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {asignaciones.map((asig) => {
                    const color = asig.materia_color || accentColor;
                    return (
                      <TableRow
                        key={asig.id}
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: isDark ? alpha(color, 0.06) : alpha(color, 0.04),
                          },
                        }}
                      >
                        {/* Materia */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: color, flexShrink: 0 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {asig.materia_nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {asig.materia_codigo || ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Docente */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: alpha(accentColor, 0.2), color: accentColor, fontWeight: 700 }}>
                              {asig.docente_nombres?.charAt(0)}{asig.docente_apellidos?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {asig.docente_nombres} {asig.docente_apellidos}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {asig.docente_codigo || ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Curso / Grado */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {asig.grado_nombre}
                          </Typography>
                          {asig.nivel_nombre && (
                            <Typography variant="caption" color="text.secondary">
                              {asig.nivel_nombre}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Paralelo */}
                        <TableCell>
                          <Chip
                            label={`Paralelo ${asig.paralelo_nombre}`}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                          />
                        </TableCell>

                        {/* Turno */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {asig.turno_nombre || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Tipo (Titular / Auxiliar) */}
                        <TableCell>
                          {asig.es_titular ? (
                            <Chip label="Titular" size="small" sx={{ bgcolor: alpha('#10b981', 0.15), color: '#10b981', fontWeight: 700, height: 22, fontSize: '0.68rem' }} />
                          ) : (
                            <Chip label="Auxiliar" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.68rem' }} />
                          )}
                        </TableCell>

                        {/* Acciones */}
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => handleOpenEditDialog(asig)} sx={{ color: accentColor }}>
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton size="small" onClick={() => { if (window.confirm('¿Deseas eliminar esta asignación?')) eliminar(asig.id); }} sx={{ color: '#ef4444' }}>
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Fade>
      ) : viewMode === 'cards' ? (
        /* ═════════════════════════════════════════════════
           VISTA 2: TARJETAS PAGINADAS (IDÉNTICAS A ESTUDIANTES)
        ═════════════════════════════════════════════════ */
        <Fade in timeout={300}>
          <Grid container spacing={2.5}>
            {asignaciones.map((asig) => {
              const color = asig.materia_color || accentColor;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asig.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '18px',
                      border: `1.5px solid ${alpha(color, 0.25)}`,
                      background: isDark
                        ? `linear-gradient(135deg, ${alpha(color, 0.10)} 0%, ${alpha(color, 0.03)} 100%)`
                        : `linear-gradient(135deg, ${alpha(color, 0.07)} 0%, #ffffff 100%)`,
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 2.2,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 10px 24px ${alpha(color, 0.25)}`,
                        borderColor: color,
                      },
                    }}
                  >
                    {/* Header: Materia + Botones Editar/Eliminar */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Box>
                          <Typography variant="body1" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: '0.95rem' }}>
                            {asig.materia_nombre}
                          </Typography>
                          {asig.materia_codigo && (
                            <Typography variant="caption" color="text.secondary">
                              {asig.materia_codigo}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.3 }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(asig)} sx={{ p: 0.6, color: accentColor }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => { if (window.confirm('¿Eliminar asignación?')) eliminar(asig.id); }} sx={{ p: 0.6, color: '#ef4444' }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Curso y Paralelo */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.8, color: 'text.primary' }}>
                        {asig.nivel_nombre ? `${asig.nivel_nombre} — ` : ''}{asig.grado_nombre}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                        <Chip
                          label={`Paralelo ${asig.paralelo_nombre}`}
                          size="small"
                          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
                        />
                        {asig.turno_nombre && (
                          <Chip
                            label={`⏰ ${asig.turno_nombre}`}
                            size="small"
                            sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                          />
                        )}
                        {asig.horas_semanales && (
                          <Chip
                            label={`${asig.horas_semanales} hrs/sem`}
                            size="small"
                            sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Footer: Docente asignado + Badge Titular */}
                    <Box sx={{ pt: 1.5, borderTop: `1px solid ${borderField}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.72rem', bgcolor: alpha('#10b981', 0.2), color: '#10b981', fontWeight: 700 }}>
                          {asig.docente_nombres?.charAt(0)}{asig.docente_apellidos?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" fontWeight={700} sx={{ display: 'block', lineHeight: 1.2 }}>
                            {asig.docente_nombres} {asig.docente_apellidos}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {asig.docente_codigo}
                          </Typography>
                        </Box>
                      </Box>

                      {asig.es_titular && (
                        <Chip
                          label="Titular"
                          size="small"
                          sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha('#10b981', 0.15), color: '#10b981' }}
                        />
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Fade>
      ) : viewMode === 'por_grado' ? (
        /* ═════════════════════════════════════════════════
           VISTA 3: AGRUPADO POR CURSO / GRADO (ACORDEONES)
        ═════════════════════════════════════════════════ */
        <Stack spacing={2}>
          {asignacionesPorGrado.map((grupo) => (
            <Accordion
              key={grupo.grado_id}
              defaultExpanded
              sx={{
                borderRadius: '16px !important',
                border: `1.5px solid ${borderField}`,
                background: isDark ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.background.paper, 0.8),
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(accentColor, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SchoolIcon sx={{ color: accentColor, fontSize: 18 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {grupo.nivel_nombre ? `${grupo.nivel_nombre} — ` : ''}{grupo.grado_nombre}
                    </Typography>
                  </Box>
                  <Chip label={`${grupo.asignaciones.length} asignaciones`} size="small" sx={{ fontWeight: 700 }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  {grupo.asignaciones.map((asig) => {
                    const color = asig.materia_color || accentColor;
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={asig.id}>
                        <Card sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${alpha(color, 0.3)}`, bgcolor: isDark ? alpha(color, 0.05) : alpha(color, 0.03) }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" fontWeight={800}>{asig.materia_nombre}</Typography>
                            <Box sx={{ display: 'flex', gap: 0.3 }}>
                              <IconButton size="small" onClick={() => handleOpenEditDialog(asig)} sx={{ p: 0.4, color: accentColor }}>
                                <EditIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => { if (window.confirm('¿Eliminar asignación?')) eliminar(asig.id); }} sx={{ p: 0.4, color: '#ef4444' }}>
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Paralelo {asig.paralelo_nombre} · {asig.turno_nombre || ''}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.62rem', bgcolor: alpha(accentColor, 0.2), color: accentColor }}>
                              {asig.docente_nombres?.charAt(0)}
                            </Avatar>
                            <Typography variant="caption" fontWeight={700}>
                              {asig.docente_nombres} {asig.docente_apellidos}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      ) : (
        /* ═════════════════════════════════════════════════
           VISTA 4: AGRUPADO POR DOCENTE (ACORDEONES)
        ═════════════════════════════════════════════════ */
        <Stack spacing={2}>
          {asignacionesPorDocente.map((doc) => (
            <Accordion
              key={doc.docente_id}
              defaultExpanded
              sx={{
                borderRadius: '16px !important',
                border: `1.5px solid ${borderField}`,
                background: isDark ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.background.paper, 0.8),
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', bgcolor: alpha(accentColor, 0.2), color: accentColor, fontWeight: 800 }}>
                      {doc.nombres ? doc.nombres.charAt(0) : 'D'}{doc.apellidos ? doc.apellidos.charAt(0) : ''}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                        {doc.nombres} {doc.apellidos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.codigo}{doc.especialidad && ` · ${doc.especialidad}`}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label={`${doc.asignaciones.length} materias`} size="small" sx={{ fontWeight: 700 }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  {doc.asignaciones.map((asig) => {
                    const color = asig.materia_color || accentColor;
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={asig.id}>
                        <Card sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${alpha(color, 0.3)}`, bgcolor: isDark ? alpha(color, 0.05) : alpha(color, 0.03) }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={800}>{asig.materia_nombre}</Typography>
                            <Box sx={{ display: 'flex', gap: 0.3 }}>
                              <IconButton size="small" onClick={() => handleOpenEditDialog(asig)} sx={{ p: 0.4, color: accentColor }}>
                                <EditIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => { if (window.confirm('¿Eliminar asignación?')) eliminar(asig.id); }} sx={{ p: 0.4, color: '#ef4444' }}>
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ display: 'block' }}>
                            {asig.grado_nombre} · Paralelo {asig.paralelo_nombre}
                          </Typography>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {/* ── PAGINACIÓN COMPLETA (EXACTAMENTE IGUAL A ESTUDIANTES) ── */}
      {paginacion.totalPages > 1 && (
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Mostrando {(paginacion.page - 1) * paginacion.limit + 1} - {Math.min(paginacion.page * paginacion.limit, paginacion.total)} de {paginacion.total} asignaciones
          </Typography>
          <Pagination
            count={paginacion.totalPages}
            page={paginacion.page}
            onChange={(_, value) => handlePageChange(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '12px',
                fontWeight: 600,
              },
              '& .Mui-selected': {
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                color: isDark ? '#000' : '#fff',
              },
            }}
          />
        </Box>
      )}

      {/* ════════════════════════════════════════
          DIALOG — ASIGNACIÓN RÁPIDA / MULTI-MATERIA
      ════════════════════════════════════════ */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
              : `0 32px 64px rgba(0,0,0,0.18)`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.4 }}>
                Asignación de Docente a Materias
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '9px', flexShrink: 0, background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AddIcon sx={{ color: brand, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Asignar docente a materias y cursos
                </Typography>
              </Box>
            </Box>
            <Box onClick={handleCloseDialog} sx={{ width: 32, height: 32, borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`, color: 'text.secondary', transition: 'all 0.15s', '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* Selector de Modo */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              size="small"
              onClick={() => { setModoAsignacion('por_materia'); setTargetsSeleccionadosKeys([]); }}
              variant={modoAsignacion === 'por_materia' ? 'contained' : 'outlined'}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                bgcolor: modoAsignacion === 'por_materia' ? brand : 'transparent',
                color: modoAsignacion === 'por_materia' ? (isDark ? '#000' : '#fff') : 'text.primary',
                borderColor: modoAsignacion === 'por_materia' ? brand : borderField,
                '&:hover': { bgcolor: modoAsignacion === 'por_materia' ? brand : alpha(brand, 0.1) },
              }}
            >
              📖 Por Materia (Múltiples Cursos)
            </Button>
            <Button
              size="small"
              onClick={() => { setModoAsignacion('por_curso'); setMateriasSeleccionadasIds([]); setParalelosSeleccionadosIds([]); }}
              variant={modoAsignacion === 'por_curso' ? 'contained' : 'outlined'}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                bgcolor: modoAsignacion === 'por_curso' ? brand : 'transparent',
                color: modoAsignacion === 'por_curso' ? (isDark ? '#000' : '#fff') : 'text.primary',
                borderColor: modoAsignacion === 'por_curso' ? brand : borderField,
                '&:hover': { bgcolor: modoAsignacion === 'por_curso' ? brand : alpha(brand, 0.1) },
              }}
            >
              🏫 Por Curso (Múltiples Materias)
            </Button>
          </Box>
        </Box>

        {/* Body */}
        <DialogContent sx={{ px: 3, py: 3, maxHeight: '70vh', overflowY: 'auto' }}>
          {isLoadingModalData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
              <CircularProgress size={40} sx={{ color: brand }} />
              <Typography variant="body2" color="text.secondary">Preparando materias y paralelos...</Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {/* 1. Docente */}
              <TextField fullWidth select required label="1. Docente"
                value={docenteIdSeleccionado}
                onChange={(e) => setDocenteIdSeleccionado(parseInt(e.target.value) || 0)}
                sx={fieldSx}
              >
                <MenuItem value={0} disabled><em>Selecciona un docente</em></MenuItem>
                {docentesSimple.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: alpha(brand, 0.2), color: brand, fontWeight: 700 }}>
                        {d.nombres.charAt(0)}{d.apellidos?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.nombres} {d.apellidos}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {d.codigo}{d.especialidad && ` • ${d.especialidad}`}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {/* ── MODO A: POR MATERIA (MÚLTIPLES CURSOS / GRADOS) ── */}
              {modoAsignacion === 'por_materia' && (
                <>
                  <TextField fullWidth select required label="2. Materia a Asignar"
                    value={materiaIdSeleccionada}
                    onChange={(e) => {
                      setMateriaIdSeleccionada(parseInt(e.target.value) || '');
                      setTargetsSeleccionadosKeys([]);
                    }}
                    sx={fieldSx}
                  >
                    <MenuItem value="" disabled><em>Selecciona una materia</em></MenuItem>
                    {materiasUnicasModal.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, width: '100%', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: m.color || brand, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.nombre}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {m.gradosCount} {m.gradosCount === 1 ? 'grado' : 'grados'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  {materiaIdSeleccionada && gradosDeEstaMateriaModal.length > 0 && (
                    <Box sx={{ p: 2, borderRadius: R, border: `1px solid ${borderField}`, background: bgField }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="text.primary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          3. Cursos y Paralelos ({targetsSeleccionadosKeys.length} seleccionados)
                        </Typography>

                        <Button
                          size="small"
                          onClick={handleSelectAllTargetsDisponibles}
                          variant="outlined"
                          sx={{
                            borderRadius: '8px', fontSize: '0.7rem', py: 0.2, px: 1, textTransform: 'none', fontWeight: 700,
                            borderColor: alpha(brand, 0.4), color: brand,
                          }}
                        >
                          ✓ Seleccionar todos los disponibles
                        </Button>
                      </Box>

                      {turnosDisponiblesModal.length > 1 && (
                        <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5, flexWrap: 'wrap' }}>
                          <Chip
                            label="Todos los turnos"
                            size="small"
                            onClick={() => setTurnoSeleccionado('')}
                            variant={turnoSeleccionado === '' ? 'filled' : 'outlined'}
                            sx={{
                              fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                              bgcolor: turnoSeleccionado === '' ? alpha(brand, 0.2) : 'transparent',
                              color: turnoSeleccionado === '' ? brand : 'text.secondary',
                              borderColor: turnoSeleccionado === '' ? brand : borderField,
                            }}
                          />
                          {turnosDisponiblesModal.map(t => (
                            <Chip
                              key={t.nombre}
                              label={`⏰ ${t.nombre}`}
                              size="small"
                              onClick={() => setTurnoSeleccionado(t.id)}
                              variant={turnoSeleccionado === t.id ? 'filled' : 'outlined'}
                              sx={{
                                fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                                bgcolor: turnoSeleccionado === t.id ? alpha(brand, 0.2) : 'transparent',
                                color: turnoSeleccionado === t.id ? brand : 'text.secondary',
                                borderColor: turnoSeleccionado === t.id ? brand : borderField,
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      <Stack spacing={1.5}>
                        {gradosDeEstaMateriaModal.map((gm) => {
                          const selectedTurnoObj = turnoSeleccionado ? turnosDisponiblesModal.find(t => t.id === Number(turnoSeleccionado) || t.ids.includes(Number(turnoSeleccionado))) : null;
                          const parals = todosLosParalelos.filter(p =>
                            p.grado_id === gm.grado_id &&
                            (!selectedTurnoObj || (p.turno_id && selectedTurnoObj.ids.includes(p.turno_id)))
                          );
                          const colorMateria = gm.materia_color || brand;

                          return (
                            <Box
                              key={gm.id}
                              sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                border: `1px solid ${borderField}`,
                                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                                  {gm.nivel_nombre ? `${gm.nivel_nombre} — ` : ''}{gm.grado_nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {gm.horas_semanales ? `${gm.horas_semanales} hrs/semana` : ''}
                                </Typography>
                              </Box>

                              {parals.length === 0 ? (
                                <Typography variant="caption" color="text.secondary">No hay paralelos registrados para este curso.</Typography>
                              ) : (
                                <Grid container spacing={1}>
                                  {parals.map((p) => {
                                    const targetKey = `${gm.id}-${p.id}`;
                                    const isSelected = targetsSeleccionadosKeys.includes(targetKey);
                                    const asignacionExistente = getAsignacionExistente(gm.id, p.id);
                                    const isOcupado = Boolean(asignacionExistente);

                                    return (
                                      <Grid size={{ xs: 12, sm: 6 }} key={p.id}>
                                        <Tooltip title={isOcupado ? `Ya asignado a: Prof. ${asignacionExistente?.docente_nombres} ${asignacionExistente?.docente_apellidos}` : ''}>
                                          <ButtonBase
                                            onClick={() => !isOcupado && handleToggleTarget(targetKey)}
                                            disabled={isOcupado}
                                            sx={{
                                              width: '100%',
                                              p: 1,
                                              borderRadius: '8px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              textAlign: 'left',
                                              border: `1.5px solid ${isOcupado ? 'rgba(239,68,68,0.3)' : isSelected ? colorMateria : borderField}`,
                                              bgcolor: isOcupado
                                                ? (isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)')
                                                : isSelected
                                                  ? alpha(colorMateria, 0.14)
                                                  : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                                              boxShadow: isSelected ? `0 0 8px ${alpha(colorMateria, 0.3)}` : 'none',
                                              opacity: isOcupado ? 0.65 : 1,
                                              cursor: isOcupado ? 'not-allowed' : 'pointer',
                                              transition: 'all 0.15s ease',
                                              '&:hover': {
                                                bgcolor: !isOcupado ? alpha(colorMateria, 0.1) : undefined,
                                              },
                                            }}
                                          >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                                                Paralelo {p.nombre}
                                              </Typography>
                                              {p.turno_nombre && (
                                                <Chip
                                                  size="small"
                                                  label={`⏰ ${p.turno_nombre}`}
                                                  sx={{ height: 16, fontSize: '0.58rem', fontWeight: 600 }}
                                                />
                                              )}
                                            </Box>

                                            {isOcupado ? (
                                              <Chip
                                                size="small"
                                                label={`⚠️ ${asignacionExistente?.docente_apellidos || 'Asignado'}`}
                                                sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha('#ef4444', 0.15), color: '#ef4444' }}
                                              />
                                            ) : (
                                              <Checkbox
                                                size="small"
                                                checked={isSelected}
                                                sx={{ p: 0, color: alpha(colorMateria, 0.6), '&.Mui-checked': { color: colorMateria } }}
                                              />
                                            )}
                                          </ButtonBase>
                                        </Tooltip>
                                      </Grid>
                                    );
                                  })}
                                </Grid>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </>
              )}

              {/* ── MODO B: POR CURSO (MÚLTIPLES MATERIAS) ── */}
              {modoAsignacion === 'por_curso' && (
                <>
                  <TextField fullWidth select required label="2. Grado / Curso"
                    value={gradoIdSeleccionado}
                    onChange={(e) => {
                      setGradoIdSeleccionado(parseInt(e.target.value) || '');
                      setTurnoSeleccionado('');
                      setMateriasSeleccionadasIds([]);
                      setParalelosSeleccionadosIds([]);
                    }}
                    sx={fieldSx}
                  >
                    <MenuItem value="" disabled><em>Selecciona el grado</em></MenuItem>
                    {gradosUnicosModal.map((g) => (
                      <MenuItem key={g.grado_id} value={g.grado_id}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {g.nivel_nombre ? `${g.nivel_nombre} — ` : ''}{g.grado_nombre}
                        </Typography>
                      </MenuItem>
                    ))}
                  </TextField>

                  {gradoIdSeleccionado && materiasDelGradoModal.length > 0 && (
                    <Box sx={{ p: 2, borderRadius: R, border: `1px solid ${borderField}`, background: bgField }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="text.primary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          3. Materias a Asignar ({materiasSeleccionadasIds.length}/{materiasDelGradoModal.length})
                        </Typography>
                        <Button
                          size="small"
                          onClick={handleSelectAllMaterias}
                          variant="outlined"
                          sx={{ borderRadius: '8px', fontSize: '0.7rem', py: 0.2, px: 1, textTransform: 'none', fontWeight: 700, borderColor: alpha(brand, 0.4), color: brand }}
                        >
                          {materiasSeleccionadasIds.length === materiasDelGradoModal.length ? 'Deseleccionar todas' : '✓ Seleccionar todas'}
                        </Button>
                      </Box>

                      <Grid container spacing={1}>
                        {materiasDelGradoModal.map((gm) => {
                          const isChecked = materiasSeleccionadasIds.includes(gm.id);
                          const color = gm.materia_color || brand;
                          return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={gm.id}>
                              <ButtonBase
                                onClick={() => handleToggleMateria(gm.id)}
                                sx={{
                                  width: '100%',
                                  p: 1.2,
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  textAlign: 'left',
                                  border: `1.5px solid ${isChecked ? color : borderField}`,
                                  bgcolor: isChecked ? alpha(color, 0.14) : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                  boxShadow: isChecked ? `0 0 10px ${alpha(color, 0.25)}` : 'none',
                                  transition: 'all 0.15s ease',
                                  '&:hover': { bgcolor: alpha(color, 0.1), borderColor: color },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                                  <Box sx={{ overflow: 'hidden' }}>
                                    <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2, fontSize: '0.82rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {gm.materia_nombre}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                      {gm.materia_codigo}{gm.horas_semanales ? ` • ${gm.horas_semanales}h/sem` : ''}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Checkbox
                                  size="small"
                                  checked={isChecked}
                                  sx={{ p: 0.2, color: alpha(color, 0.6), '&.Mui-checked': { color: color } }}
                                />
                              </ButtonBase>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}

                  {gradoIdSeleccionado && (
                    <Box sx={{ p: 2, borderRadius: R, border: `1px solid ${borderField}`, background: bgField }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="text.primary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          4. Paralelos ({paralelosSeleccionadosIds.length}/{paralelosFiltradosModal.length})
                        </Typography>
                        {paralelosFiltradosModal.length > 0 && (
                          <Button
                            size="small"
                            onClick={handleSelectAllParalelos}
                            variant="outlined"
                            sx={{ borderRadius: '8px', fontSize: '0.7rem', py: 0.2, px: 1, textTransform: 'none', fontWeight: 700, borderColor: alpha(brand, 0.4), color: brand }}
                          >
                            {paralelosSeleccionadosIds.length === paralelosFiltradosModal.length ? 'Deseleccionar todos' : '✓ Seleccionar todos'}
                          </Button>
                        )}
                      </Box>

                      {turnosDisponiblesModal.length > 1 && (
                        <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5, flexWrap: 'wrap' }}>
                          <Chip
                            label="Todos los turnos"
                            size="small"
                            onClick={() => setTurnoSeleccionado('')}
                            variant={turnoSeleccionado === '' ? 'filled' : 'outlined'}
                            sx={{
                              fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                              bgcolor: turnoSeleccionado === '' ? alpha(brand, 0.2) : 'transparent',
                              color: turnoSeleccionado === '' ? brand : 'text.secondary',
                              borderColor: turnoSeleccionado === '' ? brand : borderField,
                            }}
                          />
                          {turnosDisponiblesModal.map(t => (
                            <Chip
                              key={t.nombre}
                              label={`⏰ ${t.nombre}`}
                              size="small"
                              onClick={() => setTurnoSeleccionado(t.id)}
                              variant={turnoSeleccionado === t.id ? 'filled' : 'outlined'}
                              sx={{
                                fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                                bgcolor: turnoSeleccionado === t.id ? alpha(brand, 0.2) : 'transparent',
                                color: turnoSeleccionado === t.id ? brand : 'text.secondary',
                                borderColor: turnoSeleccionado === t.id ? brand : borderField,
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      <Grid container spacing={1}>
                        {paralelosFiltradosModal.map((p) => {
                          const isChecked = paralelosSeleccionadosIds.includes(p.id);
                          return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                              <ButtonBase
                                onClick={() => handleToggleParalelo(p.id)}
                                sx={{
                                  width: '100%',
                                  p: 1.2,
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  textAlign: 'left',
                                  border: `1.5px solid ${isChecked ? brand : borderField}`,
                                  bgcolor: isChecked ? alpha(brand, 0.14) : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                  boxShadow: isChecked ? `0 0 10px ${alpha(brand, 0.25)}` : 'none',
                                  transition: 'all 0.15s ease',
                                  '&:hover': { bgcolor: alpha(brand, 0.08), borderColor: brand },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                                    Paralelo {p.nombre}
                                  </Typography>
                                  {p.turno_nombre && (
                                    <Chip
                                      size="small"
                                      label={`⏰ ${p.turno_nombre}`}
                                      sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                                    />
                                  )}
                                </Box>

                                <Checkbox
                                  size="small"
                                  checked={isChecked}
                                  sx={{ p: 0.2, color: alpha(brand, 0.6), '&.Mui-checked': { color: brand } }}
                                />
                              </ButtonBase>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                </>
              )}

              {/* Fechas y Titular */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth type="date" label="Fecha de Inicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 1.5, height: '100%', borderRadius: R, backgroundColor: alpha(brand, 0.05), border: `1px solid ${alpha(brand, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>Docente Titular</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>Responsable principal</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      {[{ v: true, label: 'Sí', c: '#10b981' }, { v: false, label: 'No', c: '#ef4444' }].map(({ v, label, c }) => (
                        <Button key={label} variant={esTitular === v ? 'contained' : 'outlined'} size="small"
                          onClick={() => setEsTitular(v)}
                          sx={{ borderRadius: '8px', minWidth: 50, py: 0.3, fontSize: '0.75rem', fontWeight: 700, ...(esTitular === v && { background: `linear-gradient(135deg, ${c} 0%, ${c}cc 100%)` }) }}>
                          {label}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Resumen en Vivo */}
              {((modoAsignacion === 'por_materia' && targetsSeleccionadosKeys.length > 0) ||
                (modoAsignacion === 'por_curso' && materiasSeleccionadasIds.length > 0 && paralelosSeleccionadosIds.length > 0)) && (
                <Box sx={{
                  p: 1.8,
                  borderRadius: R,
                  bgcolor: alpha(brand, 0.08),
                  border: `1.5px dashed ${alpha(brand, 0.35)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}>
                  <Box>
                    <Typography variant="body2" fontWeight={800} color={brand}>
                      ⚡ Resumen de Asignación
                    </Typography>
                    <Typography variant="caption" color="text.primary">
                      {modoAsignacion === 'por_materia'
                        ? `Se asignará la materia a ${targetsSeleccionadosKeys.length} curso(s)/paralelo(s) disponibles`
                        : `Se crearán ${materiasSeleccionadasIds.length * paralelosSeleccionadosIds.length} asignaciones`}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      modoAsignacion === 'por_materia'
                        ? `${targetsSeleccionadosKeys.length} asignaciones`
                        : `${materiasSeleccionadasIds.length * paralelosSeleccionadosIds.length} asignaciones`
                    }
                    sx={{ fontWeight: 800, bgcolor: brand, color: isDark ? '#000' : '#fff' }}
                  />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        {/* Footer */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleCloseDialog} sx={cancelBtn}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCrearAsignacion}
            disabled={
              isLoadingModalData ||
              !docenteIdSeleccionado ||
              (modoAsignacion === 'por_materia' && targetsSeleccionadosKeys.length === 0) ||
              (modoAsignacion === 'por_curso' && (materiasSeleccionadasIds.length === 0 || paralelosSeleccionadosIds.length === 0))
            }
            sx={primaryBtn}
          >
            {modoAsignacion === 'por_materia'
              ? targetsSeleccionadosKeys.length > 1
                ? `Asignar ${targetsSeleccionadosKeys.length} cursos`
                : 'Asignar materia'
              : (materiasSeleccionadasIds.length * paralelosSeleccionadosIds.length > 1)
                ? `Asignar ${materiasSeleccionadasIds.length * paralelosSeleccionadosIds.length} asignaciones`
                : 'Crear asignación'}
          </Button>
        </Box>
      </Dialog>

      {/* ════════════════════════════════════════
          DIALOG — EDITAR ASIGNACIÓN
      ════════════════════════════════════════ */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
              : `0 32px 64px rgba(0,0,0,0.18)`,
          },
        }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.4 }}>
                {asignacionEditando
                  ? `${asignacionEditando.materia_nombre} · ${asignacionEditando.nivel_nombre || ''} ${asignacionEditando.grado_nombre} P.${asignacionEditando.paralelo_nombre}`
                  : 'Editar asignación'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '9px', flexShrink: 0, background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EditIcon sx={{ color: brand, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Editar asignación
                </Typography>
              </Box>
            </Box>
            <Box onClick={handleCloseEditDialog} sx={{ width: 32, height: 32, borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`, color: 'text.secondary', transition: 'all 0.15s', '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        <Tabs
          value={editTab}
          onChange={(_, v) => setEditTab(v)}
          sx={{
            px: 3,
            borderBottom: `1px solid ${borderField}`,
            '& .MuiTabs-indicator': { backgroundColor: brand, height: 2 },
            '& .Mui-selected': { color: `${brand} !important` },
            '& .MuiTab-root': { color: 'text.secondary', textTransform: 'none', fontWeight: 600, minHeight: 48 },
          }}
        >
          <Tab icon={<ToggleOnIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Datos generales" />
          <Tab icon={<SwapIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Cambiar docente" />
        </Tabs>

        <DialogContent sx={{ px: 3, py: 3 }}>
          {/* Tab 0: datos generales */}
          <EditTabPanel value={editTab} index={0}>
            <Stack spacing={2.5}>
              <Box sx={{ p: 2.5, borderRadius: R, backgroundColor: alpha(brand, 0.05), border: `1px solid ${alpha(brand, 0.2)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Docente titular</Typography>
                    <Typography variant="caption" color="text.secondary">Responsable principal de la materia</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[{ v: true, label: 'Sí', c: '#10b981' }, { v: false, label: 'No', c: '#ef4444' }].map(({ v, label, c }) => (
                      <Button key={label} variant={datosEdicion.es_titular === v ? 'contained' : 'outlined'} size="small"
                        onClick={() => setDatosEdicion(p => ({ ...p, es_titular: v }))}
                        sx={{ borderRadius: '8px', minWidth: 60, ...(datosEdicion.es_titular === v && { background: `linear-gradient(135deg, ${c} 0%, ${c}cc 100%)` }) }}>
                        {label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 2.5, borderRadius: R, backgroundColor: alpha(datosEdicion.activo ? '#10b981' : '#ef4444', 0.06), border: `1px solid ${alpha(datosEdicion.activo ? '#10b981' : '#ef4444', 0.25)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Estado de la asignación</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {datosEdicion.activo ? 'La asignación está activa y visible' : 'La asignación está desactivada'}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={datosEdicion.activo ?? true}
                        onChange={(e) => setDatosEdicion(p => ({ ...p, activo: e.target.checked }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' },
                        }}
                      />
                    }
                    label={<Chip label={datosEdicion.activo ? 'Activa' : 'Inactiva'} size="small" color={datosEdicion.activo ? 'success' : 'default'} sx={{ fontWeight: 600 }} />}
                    labelPlacement="start"
                    sx={{ mr: 0 }}
                  />
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth type="date" label="Fecha de inicio"
                    value={datosEdicion.fecha_inicio || ''}
                    onChange={(e) => setDatosEdicion(p => ({ ...p, fecha_inicio: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth type="date" label="Fecha de fin (opcional)"
                    value={datosEdicion.fecha_fin || ''}
                    onChange={(e) => setDatosEdicion(p => ({ ...p, fecha_fin: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
                    sx={fieldSx}
                    helperText="Déjalo vacío si no tiene fecha límite"
                  />
                </Grid>
              </Grid>
            </Stack>
          </EditTabPanel>

          {/* Tab 1: cambiar docente */}
          <EditTabPanel value={editTab} index={1}>
            <Stack spacing={2.5}>
              <Box sx={{ p: 2.5, borderRadius: R, backgroundColor: alpha('#10b981', 0.07), border: `1px solid ${alpha('#10b981', 0.25)}` }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  Docente actual
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {asignacionEditando?.docente_nombres} {asignacionEditando?.docente_apellidos}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {asignacionEditando?.especialidad ?? 'Sin especialidad registrada'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Divider sx={{ flex: 1 }} />
                <SwapIcon sx={{ color: 'text.secondary' }} />
                <Divider sx={{ flex: 1 }} />
              </Box>

              <TextField
                fullWidth select label="Nuevo docente"
                value={nuevoDocenteId}
                onChange={(e) => setNuevoDocenteId(parseInt(e.target.value))}
                sx={fieldSx}
                helperText="Selecciona el docente que tomará esta asignación"
              >
                <MenuItem value={0} disabled><em>Selecciona el nuevo docente</em></MenuItem>
                {docentesSimple
                  .filter(d => d.id !== asignacionEditando?.docente_id)
                  .map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.nombres} {d.apellidos}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {d.codigo}{d.especialidad && ` • ${d.especialidad}`}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </TextField>

              <Alert severity="info" sx={{ borderRadius: R, background: alpha(brand, 0.08), color: brand, border: `1px solid ${alpha(brand, 0.2)}`, '& .MuiAlert-icon': { color: brand } }}>
                Al cambiar el docente se registrará el reemplazo en el historial. La asignación continuará con los mismos datos de materia y paralelo.
              </Alert>
            </Stack>
          </EditTabPanel>
        </DialogContent>

        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleCloseEditDialog} sx={cancelBtn}>Cancelar</Button>

          {editTab === 0 ? (
            <Button
              onClick={handleGuardarEdicion}
              variant="contained"
              disabled={isUpdating}
              startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={primaryBtn}
            >
              {isUpdating ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          ) : (
            <Button
              onClick={handleCambiarDocente}
              variant="contained"
              disabled={isUpdating || !nuevoDocenteId || nuevoDocenteId === asignacionEditando?.docente_id}
              startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : <SwapIcon />}
              sx={primaryBtn}
            >
              {isUpdating ? 'Cambiando...' : 'Confirmar cambio'}
            </Button>
          )}
        </Box>
      </Dialog>

      {/* Notificación Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            alignItems: 'center',
            bgcolor: snackbar.severity === 'success' ? '#10b981' : undefined,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AsignacionesDocente;