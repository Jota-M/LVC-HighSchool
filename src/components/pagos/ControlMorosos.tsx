// components/pagos/ControlMorosos.tsx - CENTRO DE GESTIÓN Y COBRANZA ACTIVA
'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  InputAdornment,
} from '@mui/material';
import {
  Warning as WarningIcon,
  WhatsApp as WhatsAppIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  PointOfSale as PointOfSaleIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  FamilyRestroom,
  TrendingUp,
} from '@mui/icons-material';
import { usePagos } from '@/hooks/usePagos';
import { useAcademicos } from '@/hooks/useAcademicos';
import { EstudianteMoroso, FormatoReporte } from '@/types/pagos';
import { useSnackbar } from 'notistack';
import api from '@/lib/api';

interface EstudianteAgrupadoMoroso {
  estudiante_id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  grado: string;
  paralelo: string;
  grado_id: number;
  paralelo_id: number;
  tutor_id?: number;
  tutor_nombre?: string;
  tutor_celular?: string;
  tutor_telefono?: string;
  tutor_ci?: string;
  tutor_parentesco?: string;
  cuotasVencidas: Array<{
    numero_cuota: number;
    mes_correspondiente: string;
    fecha_vencimiento: string;
    saldo_pendiente: number;
    dias_mora: number;
  }>;
  deudaTotal: number;
  maxDiasMora: number;
}

interface ControlMorososProps {
  onIrACobrar?: (estudianteId: number) => void;
}

export const ControlMorosos: React.FC<ControlMorososProps> = ({ onIrACobrar }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const {
    morosos,
    loadingReportes,
    loadingExportacionReportes,
    cargarMorosos,
    exportarMorosos,
  } = usePagos({});

  const {
    periodoActivo,
    grados,
    paralelos,
  } = useAcademicos({
    autoLoad: true,
    loadPeriodos: true,
    loadTurnos: false,
    loadNiveles: false,
    loadGrados: true,
    loadParalelos: true,
    loadMaterias: false,
    loadGradoMaterias: false,
  });

  // Filtros
  const [diasMoraMinimo, setDiasMoraMinimo] = useState<number>(1);
  const [gradoId, setGradoId] = useState<number | ''>('');
  const [paraleloId, setParaleloId] = useState<number | ''>('');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modal de WhatsApp
  const [modalOpen, setModalOpen] = useState(false);
  const [morosoSeleccionado, setMorosoSeleccionado] = useState<EstudianteAgrupadoMoroso | null>(null);
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState('');
  const [mensajeWhatsApp, setMensajeWhatsApp] = useState('');
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);

  const paralelosFiltrados = gradoId
    ? paralelos.filter((p) => p.grado_id === gradoId)
    : paralelos;

  // Cargar lista de morosos
  useEffect(() => {
    if (!periodoActivo) return;

    cargarMorosos({
      periodo_academico_id: periodoActivo.id,
      dias_mora_minimo: diasMoraMinimo,
      grado_id: gradoId || undefined,
      paralelo_id: paraleloId || undefined,
    });
  }, [periodoActivo, gradoId, paraleloId, diasMoraMinimo, cargarMorosos]);

  // Agrupar filas individuales por estudiante
  const estudiantesAgrupados: EstudianteAgrupadoMoroso[] = useMemo(() => {
    const mapa = new Map<number, EstudianteAgrupadoMoroso>();

    morosos.forEach((m: EstudianteMoroso) => {
      const saldo = parseFloat((m.saldo_pendiente ?? m.monto_final).toString());
      const dias = Number(m.dias_mora) || 0;

      if (!mapa.has(m.estudiante_id)) {
        mapa.set(m.estudiante_id, {
          estudiante_id: m.estudiante_id,
          codigo: m.codigo,
          nombres: m.nombres,
          apellidos: m.apellidos,
          grado: m.grado,
          paralelo: m.paralelo,
          grado_id: m.grado_id || 0,
          paralelo_id: m.paralelo_id || 0,
          tutor_id: m.tutor_id,
          tutor_nombre: m.tutor_nombre,
          tutor_celular: m.tutor_celular,
          tutor_telefono: m.tutor_telefono,
          tutor_ci: m.tutor_ci,
          tutor_parentesco: m.tutor_parentesco,
          cuotasVencidas: [],
          deudaTotal: 0,
          maxDiasMora: 0,
        });
      }

      const item = mapa.get(m.estudiante_id)!;
      item.cuotasVencidas.push({
        numero_cuota: m.numero_cuota,
        mes_correspondiente: m.mes_correspondiente,
        fecha_vencimiento: m.fecha_vencimiento,
        saldo_pendiente: saldo,
        dias_mora: dias,
      });
      item.deudaTotal += saldo;
      if (dias > item.maxDiasMora) item.maxDiasMora = dias;
    });

    return Array.from(mapa.values());
  }, [morosos]);

  // Filtrado por buscador
  const estudiantesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return estudiantesAgrupados;
    const q = busqueda.toLowerCase().trim();
    return estudiantesAgrupados.filter(
      (e) =>
        e.nombres.toLowerCase().includes(q) ||
        e.apellidos.toLowerCase().includes(q) ||
        e.codigo.toLowerCase().includes(q) ||
        (e.tutor_nombre && e.tutor_nombre.toLowerCase().includes(q)) ||
        (e.tutor_ci && e.tutor_ci.includes(q))
    );
  }, [estudiantesAgrupados, busqueda]);

  // Cálculos estadísticos
  const deudaTotalGeneral = useMemo(() => {
    return estudiantesAgrupados.reduce((sum, e) => sum + e.deudaTotal, 0);
  }, [estudiantesAgrupados]);

  const maxDiasGeneral = useMemo(() => {
    return estudiantesAgrupados.reduce((max, e) => Math.max(max, e.maxDiasMora), 0);
  }, [estudiantesAgrupados]);

  const getDiasMoraColor = (dias: number) => {
    if (dias <= 15) return '#f59e0b';
    if (dias <= 45) return '#f97316';
    if (dias <= 90) return '#ef4444';
    return '#b91c1c';
  };

  // Abrir modal de WhatsApp con mensaje personalizado para el tutor
  const handleAbrirWhatsAppModal = (est: EstudianteAgrupadoMoroso) => {
    setMorosoSeleccionado(est);
    const tel = est.tutor_celular || est.tutor_telefono || '';
    setTelefonoWhatsApp(tel);

    const tutor = est.tutor_nombre || 'Señor(a) Padre/Madre de Familia';
    const cuotasTxt = est.cuotasVencidas
      .map((c) => `• Cuota ${c.numero_cuota} (${c.mes_correspondiente}): Bs ${c.saldo_pendiente.toFixed(2)}`)
      .join('\n');

    const mensajeDefault =
      `🏛️ *U.E.P. LA VOZ DE CRISTO*\n` +
      `📢 *RECORDATORIO DE MENSUALIDADES*\n\n` +
      `Estimado(a) *${tutor}*:\n` +
      `Esperamos que se encuentre bien. Le hacemos llegar un atento recordatorio sobre las mensualidades escolares pendientes correspondientes a su hijo(a) *${est.nombres} ${est.apellidos}* (${est.grado} "${est.paralelo}"):\n\n` +
      `${cuotasTxt}\n\n` +
      `💰 *Total Adeudado:* Bs ${est.deudaTotal.toFixed(2)}\n\n` +
      `Le invitamos cordialmente a regularizar sus cuotas en secretaría de caja o mediante transferencia/pago QR.\n\n` +
      `_Si ya realizó este pago en las últimas horas, por favor desestime este mensaje y envíenos su comprobante._\n` +
      `¡Agradecemos su atención y compromiso con la educación de su hijo(a)!`;

    setMensajeWhatsApp(mensajeDefault);
    setModalOpen(true);
  };

  // Enviar por WhatsApp Web
  const handleEnviarWhatsAppWeb = () => {
    const tel = (telefonoWhatsApp || '').replace(/\D/g, '');
    const numWhatsapp = tel ? (tel.startsWith('591') ? tel : `591${tel}`) : '';
    const texto = encodeURIComponent(mensajeWhatsApp);

    const url = numWhatsapp
      ? `https://api.whatsapp.com/send?phone=${numWhatsapp}&text=${texto}`
      : `https://api.whatsapp.com/send?text=${texto}`;

    window.open(url, '_blank');
    setModalOpen(false);
  };

  // Enviar por Bot (Evolution API)
  const handleEnviarBotWhatsApp = async () => {
    const tel = (telefonoWhatsApp || '').replace(/\D/g, '');
    if (!tel) {
      enqueueSnackbar('Ingrese un número de celular o WhatsApp válido', { variant: 'warning' });
      return;
    }
    const numWhatsapp = tel.startsWith('591') ? tel : `591${tel}`;

    setEnviandoWhatsApp(true);
    try {
      const response = await api.post('/api/reportes-pagos/notificar-whatsapp', {
        telefono: numWhatsapp,
        mensaje: mensajeWhatsApp,
      });

      if (response.data?.success) {
        enqueueSnackbar('Recordatorio de WhatsApp enviado exitosamente vía Bot', { variant: 'success' });
        setModalOpen(false);
      } else {
        throw new Error(response.data?.message || 'Error al enviar');
      }
    } catch (err: any) {
      console.warn('Bot API falló, sugiriendo WhatsApp Web:', err);
      enqueueSnackbar(err.response?.data?.message || 'El servicio del bot no respondió. Abriendo WhatsApp Web...', { variant: 'info' });
      handleEnviarWhatsAppWeb();
    } finally {
      setEnviandoWhatsApp(false);
    }
  };

  // Exportar PDF / Excel
  const handleExportar = async (formato: FormatoReporte) => {
    if (!periodoActivo) {
      enqueueSnackbar('No hay período activo para exportar', { variant: 'warning' });
      return;
    }
    try {
      await exportarMorosos({
        periodo_academico_id: periodoActivo.id,
        formato,
        dias_mora_minimo: diasMoraMinimo,
        grado_id: gradoId || undefined,
        paralelo_id: paraleloId || undefined,
      });
      enqueueSnackbar(`Reporte de morosos en ${formato.toUpperCase()} descargado`, { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error al descargar reporte', { variant: 'error' });
    }
  };

  return (
    <Box>
      {/* Tarjetas Superiores de Métricas */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.04) : '#fff',
              border: `1px solid ${alpha('#ef4444', 0.25)}`,
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '12px',
                  background: alpha('#ef4444', 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}
              >
                <WarningIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                  Alumnos en Mora
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#ef4444">
                  {estudiantesAgrupados.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {morosos.length} cuotas acumuladas
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.04) : '#fff',
              border: `1px solid ${alpha('#ef4444', 0.25)}`,
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)',
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                Deuda Total por Cobrar
              </Typography>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mt: 0.5,
                }}
              >
                Bs {deudaTotalGeneral.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                En {periodoActivo?.nombre || 'gestión activa'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.04) : '#fff',
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                Mora Máxima
              </Typography>
              <Typography variant="h4" fontWeight={800} color={getDiasMoraColor(maxDiasGeneral)}>
                {maxDiasGeneral} <span style={{ fontSize: '1rem', fontWeight: 600 }}>días</span>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mayor retraso registrado
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.04) : '#fff',
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                Exportar Reporte
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  disabled={loadingExportacionReportes || estudiantesAgrupados.length === 0}
                  onClick={() => handleExportar('pdf')}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: '#ef4444',
                    borderColor: alpha('#ef4444', 0.4),
                    bgcolor: alpha('#ef4444', 0.06),
                    '&:hover': { bgcolor: alpha('#ef4444', 0.15), borderColor: '#ef4444' }
                  }}
                >
                  PDF
                </Button>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  disabled={loadingExportacionReportes || estudiantesAgrupados.length === 0}
                  onClick={() => handleExportar('excel')}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: '#10b981',
                    borderColor: alpha('#10b981', 0.4),
                    bgcolor: alpha('#10b981', 0.06),
                    '&:hover': { bgcolor: alpha('#10b981', 0.15), borderColor: '#10b981' }
                  }}
                >
                  Excel
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenedor Principal: Filtros y Tabla */}
      <Card
        sx={{
          borderRadius: '20px',
          background: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.95),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Barra de Filtros */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Gestión Activa de Deudores
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contacta directamente a los tutores con aviso de cobranza y detalle de cuotas
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Buscador */}
              <TextField
                size="small"
                placeholder="Buscar alumno, código o tutor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />

              {/* Filtro Grado */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="filtro-grado-label">Grado</InputLabel>
                <Select
                  labelId="filtro-grado-label"
                  value={gradoId}
                  label="Grado"
                  onChange={(e) => {
                    setGradoId(e.target.value as number | '');
                    setParaleloId('');
                  }}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value=""><em>Todos los cursos</em></MenuItem>
                  {grados.map((g) => (
                    <MenuItem key={g.id} value={g.id}>{g.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filtro Paralelo */}
              <FormControl size="small" sx={{ minWidth: 120 }} disabled={!gradoId}>
                <InputLabel id="filtro-paralelo-label">Paralelo</InputLabel>
                <Select
                  labelId="filtro-paralelo-label"
                  value={paraleloId}
                  label="Paralelo"
                  onChange={(e) => setParaleloId(e.target.value as number | '')}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {paralelosFiltrados.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filtro Días Mínimos de Mora */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="filtro-dias-label">Mora mínima</InputLabel>
                <Select
                  labelId="filtro-dias-label"
                  value={diasMoraMinimo}
                  label="Mora mínima"
                  onChange={(e) => setDiasMoraMinimo(Number(e.target.value))}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value={1}>Desde 1 día</MenuItem>
                  <MenuItem value={15}>Más de 15 días</MenuItem>
                  <MenuItem value={30}>Más de 1 mes (30d)</MenuItem>
                  <MenuItem value={60}>Más de 2 meses (60d)</MenuItem>
                  <MenuItem value={90}>Casos críticos (90d+)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Estado de carga */}
          {loadingReportes ? (
            <Box textAlign="center" py={8}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" mt={2}>
                Consultando estudiantes con cuotas vencidas...
              </Typography>
            </Box>
          ) : estudiantesFiltrados.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: alpha('#10b981', 0.12),
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <TrendingUp sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                ¡Excelente! No hay morosos en este criterio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Todos los estudiantes del filtro se encuentran al día con sus mensualidades
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ borderRadius: '14px', border: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}>
              <Table size="medium">
                <TableHead sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Estudiante</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Curso</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tutor / Contacto</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Cuotas Vencidas</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Deuda Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Mora Máxima</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones de Cobranza</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estudiantesFiltrados.map((est) => (
                    <TableRow
                      key={est.estudiante_id}
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                        },
                      }}
                    >
                      {/* Estudiante */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={800}>
                          {est.apellidos}, {est.nombres}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Código: {est.codigo}
                        </Typography>
                      </TableCell>

                      {/* Curso */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${est.grado} "${est.paralelo}"`}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            bgcolor: isDark ? alpha('#0288d1', 0.15) : alpha('#0288d1', 0.08),
                            color: isDark ? '#93c5fd' : '#0288d1',
                          }}
                        />
                      </TableCell>

                      {/* Tutor / Contacto */}
                      <TableCell>
                        {est.tutor_nombre ? (
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {est.tutor_nombre}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5} mt={0.2}>
                              <Typography variant="caption" color="text.secondary">
                                {est.tutor_parentesco ? `${est.tutor_parentesco} • ` : ''}
                              </Typography>
                              <Chip
                                size="small"
                                icon={<PhoneIcon sx={{ fontSize: '13px !important' }} />}
                                label={est.tutor_celular || est.tutor_telefono || 'Sin celular'}
                                sx={{
                                  height: 20,
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  bgcolor: est.tutor_celular ? alpha('#10b981', 0.12) : alpha('#ef4444', 0.1),
                                  color: est.tutor_celular ? (isDark ? '#34d399' : '#059669') : '#ef4444',
                                }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary" fontStyle="italic">
                            Sin tutor vinculado
                          </Typography>
                        )}
                      </TableCell>

                      {/* Cuotas Vencidas */}
                      <TableCell>
                        <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                          {est.cuotasVencidas.map((c) => (
                            <Chip
                              key={c.numero_cuota}
                              size="small"
                              label={`${c.mes_correspondiente} (Bs ${c.saldo_pendiente.toFixed(0)})`}
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: alpha('#ef4444', 0.12),
                                color: isDark ? '#fca5a5' : '#b91c1c',
                                border: `1px solid ${alpha('#ef4444', 0.3)}`,
                              }}
                            />
                          ))}
                        </Stack>
                      </TableCell>

                      {/* Deuda Total */}
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={900} color="#ef4444">
                          Bs {est.deudaTotal.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {est.cuotasVencidas.length} {est.cuotasVencidas.length === 1 ? 'cuota' : 'cuotas'}
                        </Typography>
                      </TableCell>

                      {/* Días de Mora */}
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${est.maxDiasMora} días`}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            bgcolor: alpha(getDiasMoraColor(est.maxDiasMora), 0.12),
                            color: getDiasMoraColor(est.maxDiasMora),
                            border: `1px solid ${alpha(getDiasMoraColor(est.maxDiasMora), 0.35)}`,
                          }}
                        />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Enviar recordatorio de mora por WhatsApp">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<WhatsAppIcon />}
                              onClick={() => handleAbrirWhatsAppModal(est)}
                              sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1.4,
                                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                color: '#fff',
                                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #1ea952 0%, #0d6e62 100%)',
                                },
                              }}
                            >
                              Avisar
                            </Button>
                          </Tooltip>

                          {onIrACobrar && (
                            <Tooltip title="Cobrar cuotas directamente en Terminal de Caja">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<PointOfSaleIcon />}
                                onClick={() => onIrACobrar(est.estudiante_id)}
                                sx={{
                                  borderRadius: '10px',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1.2,
                                  color: isDark ? '#facc15' : '#0288d1',
                                  borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.4),
                                  bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.08),
                                  '&:hover': {
                                    bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.18),
                                    borderColor: isDark ? '#facc15' : '#0288d1',
                                  },
                                }}
                              >
                                Cobrar
                              </Button>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal para Enviar Recordatorio de WhatsApp */}
      <Dialog
        open={modalOpen}
        onClose={() => !enviandoWhatsApp && setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '22px',
            background: isDark ? alpha('#0f172a', 0.98) : alpha('#fff', 0.98),
            backdropFilter: 'blur(20px)',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <WhatsAppIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Enviar Recordatorio de Deuda
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Notificación oficial vía WhatsApp
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setModalOpen(false)} size="small" disabled={enviandoWhatsApp}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            {morosoSeleccionado && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  background: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                  border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  Estudiante: <strong>{morosoSeleccionado.nombres} {morosoSeleccionado.apellidos}</strong> ({morosoSeleccionado.grado} "{morosoSeleccionado.paralelo}")
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Tutor: <strong>{morosoSeleccionado.tutor_nombre || 'Sin tutor asignado'}</strong> {morosoSeleccionado.tutor_parentesco ? `(${morosoSeleccionado.tutor_parentesco})` : ''}
                </Typography>
                <Typography variant="caption" color="error.main" fontWeight={700} display="block" mt={0.5}>
                  Deuda: Bs {morosoSeleccionado.deudaTotal.toFixed(2)} ({morosoSeleccionado.cuotasVencidas.length} mensualidades vencidas)
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
              helperText="El mensaje se dirigirá a este número de contacto"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              size="small"
              label="Mensaje del Recordatorio (Editable)"
              value={mensajeWhatsApp}
              onChange={(e) => setMensajeWhatsApp(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                },
              }}
            />

            <Alert severity="info" sx={{ borderRadius: '12px', py: 0.5 }}>
              <Typography variant="caption">
                Puedes enviar el aviso mediante el bot automático del colegio o abrirlo directamente en tu WhatsApp Web.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={enviandoWhatsApp}
            onClick={handleEnviarBotWhatsApp}
            startIcon={enviandoWhatsApp ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              py: 1.2,
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #1ea952 0%, #0d6e62 100%)',
              },
            }}
          >
            {enviandoWhatsApp ? 'Enviando Aviso...' : 'Enviar Mensaje Directo (Bot WhatsApp)'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            disabled={enviandoWhatsApp}
            onClick={handleEnviarWhatsAppWeb}
            startIcon={<WhatsAppIcon />}
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
              },
            }}
          >
            Abrir en WhatsApp Web
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ControlMorosos;
