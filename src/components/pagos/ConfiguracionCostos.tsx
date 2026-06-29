// components/pagos/ConfiguracionCostos.tsx - SISTEMA 10 MESES
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  InputAdornment,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney,
  CheckCircle,
  Cancel,
  Info,
  LocalOffer,
  CalendarMonth,
  PriceChange,
} from '@mui/icons-material';
import pagosService from '@/services/pagos';
import academicosService, { PeriodoAcademico, NivelAcademico } from '@/services/academicos';
import { CostoMensualidad } from '@/types/pagos';
import { AjusteCostoModal } from './AjusteCostoModal';

export const ConfiguracionCostos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [costos, setCostos] = useState<CostoMensualidad[]>([]);
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoAcademico | null>(null);
  const [nivelesAcademicos, setNivelesAcademicos] = useState<NivelAcademico[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [costoEditando, setCostoEditando] = useState<CostoMensualidad | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ajusteModalOpen, setAjusteModalOpen] = useState(false);
  const [costoParaAjuste, setCostoParaAjuste] = useState<CostoMensualidad | null>(null);

  const [formData, setFormData] = useState({
    periodo_academico_id: 0,
    nivel_academico_id: 0,
    monto_base: '',
    descuento_pago_completo: '10.00', // 🔧 CAMBIO: 10% por defecto
    observaciones: '',
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);

      const periodoResponse = await academicosService.obtenerPeriodoActivo();
      const periodo = periodoResponse.data.periodo;
      setPeriodoActivo(periodo);

      const nivelesResponse = await academicosService.listarNiveles({ activo: true });
      setNivelesAcademicos(nivelesResponse.data.niveles || []);

      await cargarCostos();
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
      setError('Error al cargar la información inicial');
    } finally {
      setLoadingData(false);
    }
  };

  const cargarCostos = async () => {
    try {
      setLoading(true);
      const response = await pagosService.listarCostos();
      setCostos(response.data.costos);
    } catch (err) {
      console.error('Error al cargar costos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoCosto = () => {
    if (!periodoActivo) {
      setError('No hay un período académico activo');
      return;
    }

    setCostoEditando(null);
    setFormData({
      periodo_academico_id: periodoActivo.id,
      nivel_academico_id: nivelesAcademicos.length > 0 ? nivelesAcademicos[0].id : 0,
      monto_base: '',
      descuento_pago_completo: '10.00', // 🔧 CAMBIO: 10% por defecto
      observaciones: '',
    });
    setDialogOpen(true);
    setError(null);
  };

  const handleEditarCosto = (costo: CostoMensualidad) => {
    setCostoEditando(costo);
    setFormData({
      periodo_academico_id: costo.periodo_academico_id,
      nivel_academico_id: costo.nivel_academico_id,
      monto_base: costo.monto_base.toString(),
      descuento_pago_completo: costo.descuento_pago_completo.toString(),
      observaciones: costo.observaciones || '',
    });
    setDialogOpen(true);
    setError(null);
  };

  const handleGuardar = async () => {
    try {
      setError(null);

      if (!formData.monto_base || parseFloat(formData.monto_base) <= 0) {
        setError('El monto base debe ser mayor a 0');
        return;
      }

      if (!formData.nivel_academico_id || formData.nivel_academico_id === 0) {
        setError('Debe seleccionar un nivel académico');
        return;
      }

      const data = {
        periodo_academico_id: formData.periodo_academico_id,
        nivel_academico_id: formData.nivel_academico_id,
        monto_base: parseFloat(formData.monto_base),
        descuento_pago_completo: parseFloat(formData.descuento_pago_completo),
        observaciones: formData.observaciones || undefined,
      };

      if (costoEditando) {
        const response = await pagosService.actualizarCosto(costoEditando.id, data);
        setDialogOpen(false);
        await cargarCostos();

        if (data.monto_base !== costoEditando.monto_base) {
          setCostoParaAjuste(response.data.costo);
          setAjusteModalOpen(true);
        }
      } else {
        await pagosService.crearCosto(data);
        setDialogOpen(false);
        await cargarCostos();
      }

      setDialogOpen(false);
      cargarCostos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el costo');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de desactivar este costo?')) return;

    try {
      await pagosService.eliminarCosto(id);
      cargarCostos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el costo');
    }
  };

  // 🔧 CAMBIO: Calcular ejemplo con 10 meses
  const calcularEjemplo = () => {
    const monto = parseFloat(formData.monto_base);
    const descuento = parseFloat(formData.descuento_pago_completo);
    if (isNaN(monto) || monto <= 0) return null;

    const CANTIDAD_MESES = 10; // 🔧 10 meses
    const totalSinDescuento = monto * CANTIDAD_MESES;
    const montoDescuento = totalSinDescuento * (descuento / 100);
    const totalConDescuento = totalSinDescuento - montoDescuento;
    const mesesGratis = Math.round((montoDescuento / monto) * 10) / 10; // Redondear a 1 decimal

    return {
      totalSinDescuento,
      montoDescuento,
      totalConDescuento,
      mesesGratis,
      cantidadMeses: CANTIDAD_MESES,
    };
  };

  const ejemplo = calcularEjemplo();

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 🔧 NUEVO: Alert informativo sobre el sistema de 10 meses */}
      <Alert
        severity="info"
        icon={<Info />}
        sx={{
          mb: 3,
          borderRadius: '16px',
          background: alpha(isDark ? '#3b82f6' : '#3b82f6', 0.1),
          border: `1px solid ${alpha('#3b82f6', 0.3)}`,
        }}
      >
        <Typography variant="body2" fontWeight={600} gutterBottom>
          📚 Sistema de 10 Mensualidades
        </Typography>
        <Typography variant="caption" component="div">
          • <strong>10 meses</strong> de clase: Febrero a Noviembre
        </Typography>
        <Typography variant="caption" component="div">
          • <strong>10% de descuento</strong> en pago anual completo = 1 mes gratis
        </Typography>
        <Typography variant="caption" component="div">
          • Beneficio: Pagas 9 meses, obtienes 10 meses de educación
        </Typography>
      </Alert>

      <Card
        sx={{
          borderRadius: '20px',
          background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Configuración de Costos por Nivel
              </Typography>
              {periodoActivo && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Período Activo: <strong>{periodoActivo.nombre}</strong>
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNuevoCosto}
              disabled={!periodoActivo}
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
              Nuevo Costo
            </Button>
          </Box>

          {!periodoActivo && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
              No hay un período académico activo. Active un período para configurar costos.
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Período</TableCell>
                  <TableCell>Nivel</TableCell>
                  <TableCell align="right">Monto Mensual</TableCell>
                  <TableCell align="right">Descuento Anual</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Total pagando los 10 meses completos de una vez">
                      <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                        Total Anual
                        <Info fontSize="small" sx={{ fontSize: 16 }} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costos.map((costo) => {
                  // 🔧 CAMBIO: Cálculos con 10 meses
                  const MESES = 10;
                  const totalAnual = costo.monto_base * MESES;
                  const descuento = totalAnual * (costo.descuento_pago_completo / 100);
                  const totalConDescuento = totalAnual - descuento;
                  const mesesGratis = Math.round((descuento / costo.monto_base) * 10) / 10;

                  return (
                    <TableRow
                      key={costo.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.05),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {costo.periodo_nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{costo.nivel_nombre}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          Bs {(Number(costo.monto_base) || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          por mes
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Chip
                            label={`${costo.descuento_pago_completo}%`}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#10b981', 0.1),
                              color: '#10b981',
                              fontWeight: 700,
                              borderRadius: '8px',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            Bs {descuento.toFixed(2)} ahorro
                          </Typography>
                          <Typography variant="caption" color="success.main" display="block">
                            ≈ {mesesGratis.toFixed(1)} mes gratis
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="#10b981">
                          Bs {totalConDescuento.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {MESES} meses
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          (Feb - Nov)
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {costo.activo ? (
                          <Chip
                            icon={<CheckCircle />}
                            label="Activo"
                            size="small"
                            sx={{
                              backgroundColor: alpha('#10b981', 0.1),
                              color: '#10b981',
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<Cancel />}
                            label="Inactivo"
                            size="small"
                            sx={{
                              backgroundColor: alpha('#6b7280', 0.1),
                              color: '#6b7280',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditarCosto(costo)}
                          sx={{ color: isDark ? '#facc15' : '#0288d1' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEliminar(costo.id)}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <Tooltip title="Aplicar a alumnos existentes">
                          <IconButton
                            size="small"
                            onClick={() => { setCostoParaAjuste(costo); setAjusteModalOpen(true); }}
                            sx={{ color: '#10b981' }}
                          >
                            <PriceChange fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {costos.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <LocalOffer sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay costos configurados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crea tu primera configuración de costo para comenzar a generar mensualidades
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: isDark ? '#09101dff' : '#ffffff',
            border: `1.5px solid ${isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)'}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)'
              : '0 32px 64px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* ── HEADER ── */}
        <Box
          sx={{
            px: 3, pt: 2.5, pb: 2,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
            background: isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: alpha(isDark ? '#facc15' : '#0288d1', 0.7),
                mb: 0.4,
              }}>
                {costoEditando ? 'Editando configuración' : 'Nueva configuración'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  background: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                  border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AttachMoney sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                    {costoEditando ? 'Editar Costo' : 'Nuevo Costo'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: alpha(theme.palette.text.primary, 0.45), mt: 0.2 }}>
                    Sistema de 10 mensualidades (Feb - Nov)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              onClick={() => setDialogOpen(false)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
                color: 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': {
                  background: alpha(isDark ? '#facc15' : '#0288d1', 0.12),
                  borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.4),
                  color: isDark ? '#facc15' : '#0288d1',
                },
              }}
            >
              <Cancel sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* ── BODY ── */}
        <DialogContent sx={{ px: 3, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Período */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Período Académico"
                value={periodoActivo?.nombre || 'Sin período activo'}
                disabled
                helperText="Período académico activo"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)', borderRadius: '14px' },
                  },
                }}
              />
            </Grid>

            {/* Nivel */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                disabled={costoEditando !== null}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)', borderRadius: '14px' },
                    '&:hover fieldset': { borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: isDark ? '#facc15' : '#0288d1', borderWidth: '1.5px' },
                    '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(isDark ? '#facc15' : '#0288d1', 0.12)}` },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: isDark ? '#facc15' : '#0288d1' },
                }}
              >
                <InputLabel>Nivel Académico</InputLabel>
                <Select
                  value={formData.nivel_academico_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nivel_academico_id: Number(e.target.value) }))}
                  label="Nivel Académico"
                >
                  <MenuItem value={0} disabled>Seleccione un nivel</MenuItem>
                  {nivelesAcademicos.map((nivel) => (
                    <MenuItem key={nivel.id} value={nivel.id}>{nivel.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {costoEditando && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  El nivel académico no puede modificarse al editar
                </Typography>
              )}
            </Grid>

            {/* Monto */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Monto Mensual"
                type="number"
                value={formData.monto_base}
                onChange={(e) => setFormData((prev) => ({ ...prev, monto_base: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.secondary">Bs</Typography></InputAdornment>,
                }}
                inputProps={{ step: '0.01', min: '0' }}
                helperText="Costo por cada mes (10 meses)"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)', borderRadius: '14px' },
                    '&:hover fieldset': { borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: isDark ? '#facc15' : '#0288d1', borderWidth: '1.5px' },
                    '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(isDark ? '#facc15' : '#0288d1', 0.12)}` },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: isDark ? '#facc15' : '#0288d1' },
                }}
              />
            </Grid>

            {/* Descuento */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Descuento Pago Anual (%)"
                type="number"
                value={formData.descuento_pago_completo}
                onChange={(e) => setFormData((prev) => ({ ...prev, descuento_pago_completo: e.target.value }))}
                inputProps={{ step: '0.01', min: '0', max: '100' }}
                helperText="10% = 1 mes gratis (recomendado)"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)', borderRadius: '14px' },
                    '&:hover fieldset': { borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: isDark ? '#facc15' : '#0288d1', borderWidth: '1.5px' },
                    '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(isDark ? '#facc15' : '#0288d1', 0.12)}` },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: isDark ? '#facc15' : '#0288d1' },
                }}
              />
            </Grid>

            {/* Observaciones */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={3}
                value={formData.observaciones}
                onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Ej: Incluye materiales, seguro escolar, etc."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)', borderRadius: '14px' },
                    '&:hover fieldset': { borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: isDark ? '#facc15' : '#0288d1', borderWidth: '1.5px' },
                    '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(isDark ? '#facc15' : '#0288d1', 0.12)}` },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: isDark ? '#facc15' : '#0288d1' },
                }}
              />
            </Grid>

            {/* Simulación */}
            {ejemplo && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{
                  p: 3, borderRadius: '16px',
                  background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#059669', 0.05)} 100%)`,
                  border: `2px solid ${alpha('#10b981', 0.3)}`,
                }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarMonth sx={{ color: '#10b981' }} />
                    <Typography variant="body2" fontWeight={700} color="#10b981">
                      Simulación de Pago Anual Completo
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {[
                      {
                        label: 'Monto por Mes',
                        value: `Bs ${parseFloat(formData.monto_base || '0').toFixed(2)}`,
                        bg: alpha('#fff', isDark ? 0.05 : 0.5),
                      },
                      {
                        label: `${ejemplo.cantidadMeses} Meses sin Desc.`,
                        value: `Bs ${ejemplo.totalSinDescuento.toFixed(2)}`,
                        bg: alpha('#fff', isDark ? 0.05 : 0.5),
                      },
                      {
                        label: 'Descuento',
                        value: `- Bs ${ejemplo.montoDescuento.toFixed(2)}`,
                        sub: `≈ ${ejemplo.mesesGratis.toFixed(1)} mes gratis`,
                        valueColor: '#ef4444',
                        subColor: 'success.main',
                        bg: alpha('#ef4444', 0.1),
                      },
                      {
                        label: 'Total a Pagar',
                        value: `Bs ${ejemplo.totalConDescuento.toFixed(2)}`,
                        valueColor: '#10b981',
                        valueVariant: 'h5' as const,
                        bg: alpha('#10b981', 0.2),
                      },
                    ].map(({ label, value, sub, valueColor, subColor, bg, valueVariant }) => (
                      <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ p: 2, borderRadius: '12px', background: bg, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {label}
                          </Typography>
                          <Typography variant={valueVariant ?? 'h6'} fontWeight={700} color={valueColor}>
                            {value}
                          </Typography>
                          {sub && (
                            <Typography variant="caption" color={subColor}>{sub}</Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Alert severity="success" sx={{ mt: 2, borderRadius: '12px' }}>
                    <Typography variant="caption">
                      <strong>Beneficio para padres:</strong> Pagando los 10 meses completos de una vez,
                      ahorran Bs {ejemplo.montoDescuento.toFixed(2)} (equivalente a {ejemplo.mesesGratis.toFixed(1)} mes de estudio)
                    </Typography>
                  </Alert>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        {/* ── FOOTER ── */}
        <Box sx={{
          px: 3, pb: 3, pt: 2,
          display: 'flex', alignItems: 'center', gap: 1,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
        }}>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              borderRadius: '10px', color: 'text.secondary', px: 2,
              textTransform: 'none', fontWeight: 600,
              '&:hover': { background: 'rgba(255,255,255,0.05)' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            variant="contained"
            disabled={!formData.monto_base || parseFloat(formData.monto_base) <= 0}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
              background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
              color: '#fff',
              boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
              '&:hover': { boxShadow: '0 6px 20px rgba(16,185,129,0.5)' },
              '&.Mui-disabled': { opacity: 0.4, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' },
            }}
          >
            Guardar Configuración
          </Button>
        </Box>
      </Dialog>
      {costoParaAjuste && (
        <AjusteCostoModal
          open={ajusteModalOpen}
          onClose={() => setAjusteModalOpen(false)}
          periodoAcademicoId={costoParaAjuste.periodo_academico_id}
          periodoNombre={costoParaAjuste.periodo_nombre ?? ''}
          nivelAcademicoId={costoParaAjuste.nivel_academico_id}
          nivelNombre={costoParaAjuste.nivel_nombre ?? ''}
          montoBaseActual={costoParaAjuste.monto_base}
          onAplicado={cargarCostos}
        />
      )}
    </Box>
  );
};