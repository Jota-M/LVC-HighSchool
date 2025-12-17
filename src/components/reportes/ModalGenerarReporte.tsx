import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box,
  CircularProgress,
  Typography,
  Divider,
  alpha,
  useTheme,
  TextField,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as ReportIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useReportes } from '@/hooks/useReportes';
import { gestionAcademicaService } from '@/services/estudiantesService';
import { PeriodoAcademico, Paralelo, NivelAcademico } from '@/types/estudianteTypes';

type TipoReporte =
  | 'paralelo'
  | 'estadistico_matricula'
  | 'preinscripcion_listado'
  | 'preinscripcion_estadistico';

interface ModalGenerarReporteProps {
  open: boolean;
  onClose: () => void;
  tipo: TipoReporte;
}

export const ModalGenerarReporte: React.FC<ModalGenerarReporteProps> = ({
  open,
  onClose,
  tipo,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    generarReporteParalelo,
    generarReporteEstadistico,
    generarReportePreInscripcionListado,
    generarReportePreInscripcionEstadistico,
    isGenerating,
  } = useReportes();

  // Estados comunes
  const [formato, setFormato] = useState<'pdf' | 'excel'>('pdf');
  const [periodoId, setPeriodoId] = useState<number | ''>('');
  const [paraleloId, setParaleloId] = useState<number | ''>('');
  const [nivelId, setNivelId] = useState<number | ''>('');

  // Estados para pre-inscripciones
  const [estadoPreinscripcion, setEstadoPreinscripcion] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Datos cargados
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [paralelos, setParalelos] = useState<Paralelo[]>([]);
  const [niveles, setNiveles] = useState<NivelAcademico[]>([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [loadingParalelos, setLoadingParalelos] = useState(false);
  const [loadingNiveles, setLoadingNiveles] = useState(false);

  // ==========================================
  // EFECTOS DE CARGA
  // ==========================================

  // Cargar datos iniciales según el tipo
  useEffect(() => {
    if (open) {
      resetForm();
      if (esReporteMatricula()) {
        cargarPeriodos();
        cargarNiveles();
      } else {
        // Para pre-inscripciones, inicializar fechas del mes actual
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        
        setFechaInicio(primerDia.toISOString().split('T')[0]);
        setFechaFin(ultimoDia.toISOString().split('T')[0]);
      }
    }
  }, [open, tipo]);

  // Cargar paralelos cuando cambia el periodo
  useEffect(() => {
    if (periodoId && tipo === 'paralelo') {
      cargarParalelos();
    }
  }, [periodoId, tipo]);

  // ==========================================
  // FUNCIONES DE CARGA
  // ==========================================

  const cargarPeriodos = async () => {
    setLoadingPeriodos(true);
    try {
      const data = await gestionAcademicaService.obtenerPeriodos();
      setPeriodos(data);

      const periodoActivo = data.find((p) => p.activo);
      if (periodoActivo) {
        setPeriodoId(periodoActivo.id);
      }
    } catch (error) {
      console.error('Error al cargar periodos:', error);
    } finally {
      setLoadingPeriodos(false);
    }
  };

  const cargarParalelos = async () => {
    if (!periodoId) return;

    setLoadingParalelos(true);
    try {
      const periodo = periodos.find((p) => p.id === periodoId);
      if (periodo) {
        const data = await gestionAcademicaService.obtenerTodosLosParalelos(
          periodo.anio || new Date().getFullYear(),
          true
        );
        setParalelos(data);
      }
    } catch (error) {
      console.error('Error al cargar paralelos:', error);
    } finally {
      setLoadingParalelos(false);
    }
  };

  const cargarNiveles = async () => {
    setLoadingNiveles(true);
    try {
      const data = await gestionAcademicaService.obtenerNiveles();
      setNiveles(data);
    } catch (error) {
      console.error('Error al cargar niveles:', error);
    } finally {
      setLoadingNiveles(false);
    }
  };

  // ==========================================
  // UTILIDADES
  // ==========================================

  const esReporteMatricula = () =>
    tipo === 'paralelo' || tipo === 'estadistico_matricula';

  const esReportePreInscripcion = () =>
    tipo === 'preinscripcion_listado' || tipo === 'preinscripcion_estadistico';

  const resetForm = () => {
    setFormato('pdf');
    setPeriodoId('');
    setParaleloId('');
    setNivelId('');
    setEstadoPreinscripcion('');
    setFechaInicio('');
    setFechaFin('');
  };

  const getTitulo = () => {
    switch (tipo) {
      case 'paralelo':
        return 'Reporte de Paralelo';
      case 'estadistico_matricula':
        return 'Estadísticas de Matrículas';
      case 'preinscripcion_listado':
        return 'Listado de Pre-inscripciones';
      case 'preinscripcion_estadistico':
        return 'Estadísticas de Pre-inscripciones';
      default:
        return 'Generar Reporte';
    }
  };

  const getIconColor = () => {
    if (esReporteMatricula()) {
      return isDark ? '#facc15' : '#0288d1';
    } else {
      return isDark ? '#a855f7' : '#7c3aed';
    }
  };

  const puedeGenerar = () => {
    if (isGenerating) return false;

    switch (tipo) {
      case 'paralelo':
        return periodoId && paraleloId;
      case 'estadistico_matricula':
        return periodoId;
      case 'preinscripcion_listado':
      case 'preinscripcion_estadistico':
        return true; // Los filtros son opcionales
      default:
        return false;
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleGenerar = () => {
    switch (tipo) {
      case 'paralelo':
        if (!periodoId || !paraleloId) return;
        generarReporteParalelo({
          paralelo_id: Number(paraleloId),
          periodo_id: Number(periodoId),
          formato,
        });
        break;

      case 'estadistico_matricula':
        if (!periodoId) return;
        generarReporteEstadistico({
          periodo_id: Number(periodoId),
          nivel_id: nivelId ? Number(nivelId) : undefined,
          formato,
        });
        break;

      case 'preinscripcion_listado':
        generarReportePreInscripcionListado({
          estado: estadoPreinscripcion || undefined,
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
          formato,
        });
        break;

      case 'preinscripcion_estadistico':
        generarReportePreInscripcionEstadistico({
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
          formato,
        });
        break;
    }

    onClose();
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          backgroundColor: isDark
            ? 'rgba(15, 23, 42, 0.98)'
            : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(getIconColor(), 0.2)}`,
        },
      }}
    >
      {/* ========== HEADER ========== */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <ReportIcon sx={{ color: getIconColor(), fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {getTitulo()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Configura los parámetros y formato de descarga
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      {/* ========== CONTENIDO ========== */}
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* ==========================================
              CAMPOS PARA REPORTES DE MATRÍCULAS
              ========================================== */}
          {esReporteMatricula() && (
            <>
              {/* Selector de Periodo */}
              <FormControl fullWidth>
                <InputLabel>Periodo Académico *</InputLabel>
                <Select
                  value={periodoId}
                  onChange={(e) => setPeriodoId(e.target.value as number)}
                  disabled={loadingPeriodos || isGenerating}
                  label="Periodo Académico *"
                >
                  {periodos.map((periodo) => (
                    <MenuItem key={periodo.id} value={periodo.id}>
                      {periodo.nombre} {periodo.activo && '(Activo)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selector de Paralelo (solo para reporte de paralelo) */}
              {tipo === 'paralelo' && (
                <FormControl fullWidth>
                  <InputLabel>Paralelo *</InputLabel>
                  <Select
                    value={paraleloId}
                    onChange={(e) => setParaleloId(e.target.value as number)}
                    disabled={!periodoId || loadingParalelos || isGenerating}
                    label="Paralelo *"
                  >
                    {paralelos.map((paralelo) => (
                      <MenuItem key={paralelo.id} value={paralelo.id}>
                        {paralelo.nivel_nombre} - {paralelo.grado_nombre} "
                        {paralelo.nombre}" ({paralelo.turno_nombre})
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingParalelos && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                </FormControl>
              )}

              {/* Selector de Nivel (solo para estadístico) */}
              {tipo === 'estadistico_matricula' && (
                <FormControl fullWidth>
                  <InputLabel>Nivel Académico (Opcional)</InputLabel>
                  <Select
                    value={nivelId}
                    onChange={(e) => setNivelId(e.target.value as number | '')}
                    disabled={loadingNiveles || isGenerating}
                    label="Nivel Académico (Opcional)"
                  >
                    <MenuItem value="">
                      <em>Todos los niveles</em>
                    </MenuItem>
                    {niveles.map((nivel) => (
                      <MenuItem key={nivel.id} value={nivel.id}>
                        {nivel.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}

          {/* ==========================================
              CAMPOS PARA REPORTES DE PRE-INSCRIPCIONES
              ========================================== */}
          {esReportePreInscripcion() && (
            <>
              {/* Filtro de Estado (solo para listado) */}
              {tipo === 'preinscripcion_listado' && (
                <FormControl fullWidth>
                  <InputLabel>Estado (Opcional)</InputLabel>
                  <Select
                    value={estadoPreinscripcion}
                    onChange={(e) => setEstadoPreinscripcion(e.target.value)}
                    disabled={isGenerating}
                    label="Estado (Opcional)"
                    startAdornment={
                      <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }
                  >
                    <MenuItem value="">
                      <em>Todos los estados</em>
                    </MenuItem>
                    <MenuItem value="iniciada">Iniciada</MenuItem>
                    <MenuItem value="datos_completos">Datos Completos</MenuItem>
                    <MenuItem value="en_revision">En Revisión</MenuItem>
                    <MenuItem value="aprobada">Aprobada</MenuItem>
                    <MenuItem value="rechazada">Rechazada</MenuItem>
                    <MenuItem value="convertida">Convertida</MenuItem>
                  </Select>
                </FormControl>
              )}

              {/* Rango de fechas */}
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <CalendarIcon sx={{ fontSize: 18 }} />
                  Rango de Fechas (Opcional)
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Fecha Inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    disabled={isGenerating}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    label="Fecha Fin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    disabled={isGenerating}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: fechaInicio }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Deja vacío para incluir todas las fechas
                </Typography>
              </Box>
            </>
          )}

          {/* ==========================================
              SELECTOR DE FORMATO (COMÚN PARA TODOS)
              ========================================== */}
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: alpha(getIconColor(), 0.05),
              border: `1px solid ${alpha(getIconColor(), 0.1)}`,
            }}
          >
            <FormControl component="fieldset" fullWidth>
              <FormLabel
                component="legend"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  color: 'text.primary',
                }}
              >
                Formato de Descarga
              </FormLabel>
              <RadioGroup
                row
                value={formato}
                onChange={(e) => setFormato(e.target.value as 'pdf' | 'excel')}
                sx={{ gap: 2 }}
              >
                <FormControlLabel
                  value="pdf"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PdfIcon sx={{ color: '#dc2626', fontSize: 24 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          PDF
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ideal para impresión
                        </Typography>
                      </Box>
                    </Box>
                  }
                  disabled={isGenerating}
                  sx={{
                    flex: 1,
                    m: 0,
                    p: 1.5,
                    borderRadius: '12px',
                    border: `2px solid ${formato === 'pdf' ? '#dc2626' : 'transparent'}`,
                    backgroundColor:
                      formato === 'pdf' ? alpha('#dc2626', 0.05) : 'transparent',
                  }}
                />

                <FormControlLabel
                  value="excel"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ExcelIcon sx={{ color: '#107C41', fontSize: 24 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Excel
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Análisis de datos
                        </Typography>
                      </Box>
                    </Box>
                  }
                  disabled={isGenerating}
                  sx={{
                    flex: 1,
                    m: 0,
                    p: 1.5,
                    borderRadius: '12px',
                    border: `2px solid ${formato === 'excel' ? '#107C41' : 'transparent'}`,
                    backgroundColor:
                      formato === 'excel' ? alpha('#107C41', 0.05) : 'transparent',
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      {/* ========== ACCIONES ========== */}
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isGenerating}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          Cancelar
        </Button>

        <Button
          onClick={handleGenerar}
          variant="contained"
          disabled={!puedeGenerar()}
          startIcon={isGenerating ? <CircularProgress size={20} /> : <ReportIcon />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            background: `linear-gradient(135deg, ${getIconColor()} 0%, ${alpha(getIconColor(), 0.8)} 100%)`,
            color: isDark && esReporteMatricula() ? '#000' : '#fff',
            '&:disabled': {
              background: alpha(theme.palette.action.disabled, 0.1),
            },
          }}
        >
          {isGenerating ? 'Generando...' : 'Generar Reporte'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};