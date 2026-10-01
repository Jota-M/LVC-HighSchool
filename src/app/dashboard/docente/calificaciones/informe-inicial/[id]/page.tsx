'use client';
// app/dashboard/docente/calificaciones/informe-inicial/[id]/page.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Chip, Skeleton,
  Fade, alpha, useTheme, Tooltip, IconButton, Button,
  TextField, InputAdornment, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, LinearProgress, Stack,
  Grid,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  ArrowBackRounded as ArrowBackRoundedIcon,
  Search as SearchIcon,
  Refresh as RefreshRoundedIcon,
  AutoAwesomeRounded as AutoAwesomeRoundedIcon,
  DownloadRounded as DownloadRoundedIcon,
  CheckCircleRounded as CheckCircleRoundedIcon,
  SchoolRounded as SchoolRoundedIcon,
  EditNoteRounded as EditNoteRoundedIcon,
  SaveRounded as SaveRoundedIcon,
  SendRounded as SendRoundedIcon,
  CloseRounded as CloseRoundedIcon,
  PeopleRounded as PeopleRoundedIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { inicialService } from '@/services/inicialService';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PeriodoInforme {
  periodo_id: number;
  periodo_nombre: string;
  periodo_orden: number;
  informe_id: number | null;
  texto: string | null;
  estado: 'pendiente' | 'borrador' | 'publicado';
  generado_por_ia: boolean;
  updated_at: string | null;
}

interface EstudianteCentralizador {
  matricula_id: number;
  codigo_rude: string | null;
  estudiante_id: number;
  nombres: string;
  apellidos: string;
  genero: string | null;
  foto_url: string | null;
  paralelo_id: number;
  paralelo_nombre: string;
  grado_id: number;
  grado_nombre: string;
  periodos_informe: PeriodoInforme[];
}

const NOMBRES_TRIMESTRE = ['Primer Trimestre', 'Segundo Trimestre', 'Tercer Trimestre'];

// Periodo vacío para cuando el backend aún no devuelve el trimestre
const periodoVacio = (orden: number): PeriodoInforme => ({
  periodo_id: orden,
  periodo_nombre: NOMBRES_TRIMESTRE[orden - 1] ?? `Trimestre ${orden}`,
  periodo_orden: orden,
  informe_id: null,
  texto: null,
  estado: 'pendiente',
  generado_por_ia: false,
  updated_at: null,
});

// ─── Celda de trimestre (Publicado / Borrador / Generar) ──────────────────────
interface CeldaTrimestreProps {
  periodo: PeriodoInforme;
  accentColor: string;
  onOpen: () => void;
}

const CeldaTrimestre: React.FC<CeldaTrimestreProps> = ({ periodo, accentColor, onOpen }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      {periodo.estado === 'publicado' ? (
        <Tooltip title={periodo.texto ? `"${periodo.texto.slice(0, 160)}..."` : 'Informe publicado'}>
          <Chip
            size="small"
            icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
            label="Publicado"
            color="success"
            onClick={onOpen}
            sx={{ cursor: 'pointer', fontWeight: 700, height: 24, fontSize: 11 }}
          />
        </Tooltip>
      ) : periodo.estado === 'borrador' ? (
        <Tooltip title={periodo.texto ? `Borrador: "${periodo.texto.slice(0, 160)}..."` : 'Borrador guardado'}>
          <Chip
            size="small"
            label="Borrador"
            color="warning"
            onClick={onOpen}
            sx={{ cursor: 'pointer', fontWeight: 700, height: 24, fontSize: 11 }}
          />
        </Tooltip>
      ) : (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />}
          onClick={onOpen}
          sx={{
            textTransform: 'none',
            borderRadius: '10px',
            fontSize: 11,
            py: 0.3,
            fontWeight: 700,
            borderColor: alpha(accentColor, 0.35),
            color: accentColor,
            '&:hover': {
              borderColor: accentColor,
              backgroundColor: alpha(accentColor, 0.1),
            },
          }}
        >
          Generar informe
        </Button>
      )}
    </Box>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function CentralizadorInformesInicialPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const params = useParams();
  const paraleloId = Number(params?.id);

  // Paleta unificada con el resto de niveles
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentEnd} 100%)`;
  const onAccent = isDark ? '#000' : '#fff';
  const borderSoft = alpha(isDark ? '#fff' : '#000', 0.08);
  const cardBg = isDark ? alpha('#fff', 0.02) : '#fff';

  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState<EstudianteCentralizador[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [descargandoMatriculaId, setDescargandoMatriculaId] = useState<number | null>(null);

  // Estado del modal de redacción / generación de informe
  const [modalOpen, setModalOpen] = useState(false);
  const [esModalFinal, setEsModalFinal] = useState(false);
  const [estudianteActivo, setEstudianteActivo] = useState<EstudianteCentralizador | null>(null);
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoInforme | null>(null);
  const [textoInforme, setTextoInforme] = useState('');
  const [generandoIA, setGenerandoIA] = useState(false);
  const [guardandoInforme, setGuardandoInforme] = useState(false);
  const [resumenCotejo, setResumenCotejo] = useState<any[]>([]);
  const [loadingCotejo, setLoadingCotejo] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!paraleloId) return;
    setLoading(true);
    try {
      const data = await inicialService.getCentralizadorInformes(paraleloId);
      setEstudiantes(data || []);
    } catch (err: any) {
      toast.error('Error al cargar centralizador de informes');
    } finally {
      setLoading(false);
    }
  }, [paraleloId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cursoInfo = useMemo(() => {
    if (!estudiantes.length) return null;
    const first = estudiantes[0];
    return {
      grado_nombre: first.grado_nombre,
      paralelo_nombre: first.paralelo_nombre,
    };
  }, [estudiantes]);

  const estudiantesFiltrados = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return estudiantes;
    return estudiantes.filter(e =>
      e.nombres.toLowerCase().includes(q) ||
      e.apellidos.toLowerCase().includes(q) ||
      (e.codigo_rude && e.codigo_rude.toLowerCase().includes(q))
    );
  }, [estudiantes, searchTerm]);

  // Abrir modal para redactar informe
  const handleAbrirModal = async (
    est: EstudianteCentralizador,
    per: PeriodoInforme,
    esFinal: boolean = false
  ) => {
    setEstudianteActivo(est);
    setPeriodoActivo(per);
    setEsModalFinal(esFinal);
    setTextoInforme(per.texto || '');
    setModalOpen(true);

    // Cargar los cotejos de los 4 campos para mostrarle a la maestra qué evaluó
    setLoadingCotejo(true);
    try {
      const cots = await inicialService.getCotejoEstudiante(est.matricula_id, per.periodo_id);
      setResumenCotejo(cots || []);
    } catch (e) {
      setResumenCotejo([]);
    } finally {
      setLoadingCotejo(false);
    }
  };

  const handleGenerarIA = async () => {
    if (!estudianteActivo || !periodoActivo) return;
    setGenerandoIA(true);
    try {
      const res = await inicialService.generarInformeIA(
        estudianteActivo.matricula_id,
        periodoActivo.periodo_id,
        { esFinal: esModalFinal }
      );
      if (res?.texto) {
        setTextoInforme(res.texto);
        toast.success(
          esModalFinal
            ? 'Informe final consolidado generado combinando los 4 campos'
            : 'Informe redactado por IA integrando los 4 campos'
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al generar con IA');
    } finally {
      setGenerandoIA(false);
    }
  };

  const handleGuardarInforme = async (estado: 'borrador' | 'publicado') => {
    if (!estudianteActivo || !periodoActivo) return;
    if (!textoInforme.trim()) {
      toast.error('El informe no puede estar vacío');
      return;
    }

    setGuardandoInforme(true);
    try {
      await inicialService.guardarInforme(
        estudianteActivo.matricula_id,
        periodoActivo.periodo_id,
        {
          texto: textoInforme.trim(),
          estado,
          generado_por_ia: Boolean(periodoActivo.generado_por_ia),
        }
      );
      toast.success(estado === 'publicado' ? 'Informe publicado oficialmente' : 'Borrador guardado');
      setModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar informe');
    } finally {
      setGuardandoInforme(false);
    }
  };

  const handleDescargarPDF = async (matriculaId: number, periodoId: number, alumnoNombre: string) => {
    try {
      setDescargandoMatriculaId(matriculaId);
      const blob = await inicialService.descargarBoletinPDF(matriculaId, periodoId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Libreta_Inicial_${alumnoNombre.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Libreta descargada exitosamente');
    } catch (err) {
      toast.error('Error al generar la libreta PDF');
    } finally {
      setDescargandoMatriculaId(null);
    }
  };

  const headCellSx = { fontWeight: 800, fontSize: 12, color: 'text.secondary' };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER (mismo estilo que Calificaciones / Tareas / Temario) ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              onClick={() => router.push('/dashboard/docente/calificaciones')}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                '&:hover': { color: accentColor }, transition: 'color 0.15s',
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Volver a mis materias
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
              }}
            >
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EditNoteRoundedIcon
                    sx={{
                      color: accentColor,
                      fontSize: { xs: 34, md: 40 },
                      animation: `${bounce} 2s infinite ease-in-out`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Informe Cualitativo Consolidado
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.8 }}>
                  <Chip
                    size="small"
                    label={cursoInfo ? `${cursoInfo.grado_nombre} "${cursoInfo.paralelo_nombre}"` : 'Educación Inicial'}
                    sx={{
                      background: gradBg,
                      color: onAccent,
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  />
                  <Chip
                    size="small"
                    label="Evaluación Cualitativa (SEP)"
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                      color: accentColor,
                      border: `1px solid ${alpha(accentColor, 0.2)}`,
                    }}
                  />
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.8, fontWeight: 500 }}>
                  Centraliza los 3 trimestres integrando los 4 campos de desarrollo para la libreta escolar.
                </Typography>
              </Box>

              {/* DERECHA: Botón de refrescar */}
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => {
                  cargarDatos();
                  toast.success('Datos actualizados');
                }}
                sx={{
                  borderRadius: '12px',
                  borderColor: alpha(accentColor, 0.4),
                  color: accentColor,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2,
                  '&:hover': {
                    borderColor: accentColor,
                    backgroundColor: alpha(accentColor, 0.1),
                  },
                }}
              >
                Actualizar
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* ══ STAT CARDS ══ */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: '18px', border: `1px solid ${borderSoft}`, bgcolor: cardBg }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    Total estudiantes
                  </Typography>
                  <PeopleRoundedIcon sx={{ color: accentColor, fontSize: 22 }} />
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                  {estudiantes.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inscritos en el paralelo
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {[1, 2, 3].map(tNum => {
            const listT = estudiantes.flatMap(e => e.periodos_informe.filter(p => p.periodo_orden === tNum));
            const pub = listT.filter(p => p.estado === 'publicado').length;
            const total = estudiantes.length;
            const pct = total > 0 ? Math.round((pub / total) * 100) : 0;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tNum}>
                <Card sx={{ borderRadius: '18px', border: `1px solid ${borderSoft}`, bgcolor: cardBg }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        {tNum}° Trimestre
                      </Typography>
                      <Chip
                        size="small"
                        label={`${pct}%`}
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 800,
                          bgcolor: alpha(accentColor, 0.15),
                          color: accentColor,
                        }}
                      />
                    </Box>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                      {pub}/{total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Informes oficiales publicados
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        mt: 1.5,
                        height: 5,
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                        '& .MuiLinearProgress-bar': { background: gradBg, borderRadius: 3 },
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* ══ BARRA DE BÚSQUEDA ══ */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            p: 2,
            mb: 3,
            borderRadius: '16px',
            bgcolor: cardBg,
            border: `1px solid ${borderSoft}`,
          }}
        >
          <TextField
            placeholder="Buscar por nombre, apellido o RUDE..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 300px' },
              maxWidth: 480,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* ══ TABLA CENTRALIZADORA ══ */}
        <Card
          sx={{
            borderRadius: '18px',
            border: `1px solid ${borderSoft}`,
            bgcolor: cardBg,
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
                  <TableCell sx={headCellSx}>ESTUDIANTE</TableCell>
                  <TableCell align="center" sx={headCellSx}>1ER TRIMESTRE</TableCell>
                  <TableCell align="center" sx={headCellSx}>2DO TRIMESTRE</TableCell>
                  <TableCell align="center" sx={headCellSx}>3ER TRIMESTRE</TableCell>
                  <TableCell align="center" sx={headCellSx}>INFORME FINAL / PROMOCIÓN</TableCell>
                  <TableCell align="center" sx={headCellSx}>LIBRETA OFICIAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton height={45} /></TableCell>
                    </TableRow>
                  ))
                ) : estudiantesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No se encontraron estudiantes en este paralelo.
                    </TableCell>
                  </TableRow>
                ) : (
                  estudiantesFiltrados.map((est) => {
                    const p1 = est.periodos_informe.find(p => p.periodo_orden === 1) || periodoVacio(1);
                    const p2 = est.periodos_informe.find(p => p.periodo_orden === 2) || periodoVacio(2);
                    const p3 = est.periodos_informe.find(p => p.periodo_orden === 3) || periodoVacio(3);

                    return (
                      <TableRow
                        key={est.matricula_id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          transition: 'background-color 0.15s',
                        }}
                      >
                        {/* Estudiante */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={est.foto_url || undefined}
                              sx={{
                                width: 38,
                                height: 38,
                                bgcolor: alpha(accentColor, 0.15),
                                color: accentColor,
                                fontWeight: 800,
                                fontSize: 13,
                              }}
                            >
                              {est.nombres.charAt(0)}{est.apellidos.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                                {est.apellidos}, {est.nombres}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                RUDE: {est.codigo_rude || 'S/N'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Trimestres */}
                        <TableCell align="center">
                          <CeldaTrimestre periodo={p1} accentColor={accentColor} onOpen={() => handleAbrirModal(est, p1, false)} />
                        </TableCell>
                        <TableCell align="center">
                          <CeldaTrimestre periodo={p2} accentColor={accentColor} onOpen={() => handleAbrirModal(est, p2, false)} />
                        </TableCell>
                        <TableCell align="center">
                          <CeldaTrimestre periodo={p3} accentColor={accentColor} onOpen={() => handleAbrirModal(est, p3, false)} />
                        </TableCell>

                        {/* Informe final / promoción */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6 }}>
                            <Chip
                              size="small"
                              icon={<SchoolRoundedIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
                              label="Promovido(a)"
                              sx={{
                                height: 22,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.1)',
                                color: '#16a34a',
                                border: `1px solid ${alpha('#16a34a', 0.25)}`,
                              }}
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />}
                              onClick={() => handleAbrirModal(est, p3, true)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '10px',
                                fontSize: 11,
                                fontWeight: 700,
                                py: 0.3,
                                px: 1.4,
                                borderColor: alpha(accentColor, 0.35),
                                color: accentColor,
                                '&:hover': {
                                  borderColor: accentColor,
                                  backgroundColor: alpha(accentColor, 0.1),
                                },
                              }}
                            >
                              Generar informe final
                            </Button>
                            <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                              Combina 4 campos y 3 trimestres
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Libreta PDF */}
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadRoundedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => handleDescargarPDF(est.matricula_id, p1.periodo_id, `${est.apellidos}_${est.nombres}`)}
                            disabled={descargandoMatriculaId === est.matricula_id}
                            sx={{
                              borderRadius: '10px',
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'none',
                              color: accentColor,
                              borderColor: alpha(accentColor, 0.35),
                              '&:hover': {
                                bgcolor: alpha(accentColor, 0.1),
                                borderColor: accentColor,
                              },
                            }}
                          >
                            {descargandoMatriculaId === est.matricula_id ? 'Generando...' : 'Libreta PDF'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* ══ MODAL DE REDACCIÓN Y GENERACIÓN CON IA ══ */}
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '18px',
              background: isDark ? '#1e1e2d' : '#fff',
              border: `1px solid ${borderSoft}`,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AutoAwesomeRoundedIcon sx={{ color: accentColor, fontSize: 24 }} />
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {esModalFinal
                    ? 'Informe Anual Consolidado y Certificación de Promoción'
                    : 'Informe Cualitativo de Desarrollo Integral'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {estudianteActivo ? `${estudianteActivo.apellidos}, ${estudianteActivo.nombres}` : ''} ·{' '}
                  {esModalFinal ? 'Evaluación Final Anual (Consolidado de 4 Campos)' : periodoActivo?.periodo_nombre}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setModalOpen(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2.5}>
              {/* Resumen de los 4 campos */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: alpha(accentColor, 0.08),
                  border: `1px solid ${alpha(accentColor, 0.2)}`,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{ color: accentColor, display: 'block', mb: 1 }}
                >
                  Base de observación: 4 campos de desarrollo (SEP)
                </Typography>
                {loadingCotejo ? (
                  <Skeleton height={35} />
                ) : resumenCotejo.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No se han registrado cotejos para este periodo aún. Puedes redactar el informe manualmente o registrar cotejos previamente.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Array.from(new Set(resumenCotejo.map(c => c.campo_nombre))).map(cName => {
                      const items = resumenCotejo.filter(c => c.campo_nombre === cName);
                      const evaluados = items.filter(c => c.nivel_codigo).length;
                      return (
                        <Chip
                          key={cName}
                          size="small"
                          label={`${cName}: ${evaluados}/${items.length} evaluados`}
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor: isDark ? alpha('#fff', 0.05) : '#fff',
                            border: `1px solid ${alpha(accentColor, 0.2)}`,
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              </Paper>

              {/* Botón de generación con IA */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeRoundedIcon />}
                  onClick={handleGenerarIA}
                  disabled={generandoIA}
                  sx={{
                    background: gradBg,
                    color: onAccent,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '12px',
                    px: 2.5,
                    boxShadow: `0 4px 12px ${alpha(accentColor, 0.35)}`,
                    '&:hover': { background: gradBg, filter: 'brightness(0.95)' },
                    '&.Mui-disabled': { opacity: 0.6, color: onAccent },
                  }}
                >
                  {generandoIA
                    ? 'Sintetizando los 4 campos con IA...'
                    : esModalFinal
                      ? 'Generar informe final consolidado con IA'
                      : 'Generar informe integrado con IA'}
                </Button>
              </Box>

              {/* Editor del texto */}
              <TextField
                multiline
                rows={6}
                fullWidth
                label={
                  esModalFinal
                    ? 'Texto narrativo oficial del informe anual consolidado (promoción SEP)'
                    : 'Texto narrativo oficial del informe cualitativo trimestral'
                }
                placeholder="Redacta o edita el informe descriptivo del desarrollo integral del estudiante..."
                value={textoInforme}
                onChange={(e) => setTextoInforme(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    lineHeight: 1.6,
                  },
                }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1, borderTop: `1px solid ${borderSoft}` }}>
            <Button
              onClick={() => setModalOpen(false)}
              sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
            >
              Cancelar
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveRoundedIcon />}
              onClick={() => handleGuardarInforme('borrador')}
              disabled={guardandoInforme}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                borderColor: alpha(accentColor, 0.35),
                color: accentColor,
                '&:hover': {
                  borderColor: accentColor,
                  backgroundColor: alpha(accentColor, 0.1),
                },
              }}
            >
              Guardar borrador
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<SendRoundedIcon />}
              onClick={() => handleGuardarInforme('publicado')}
              disabled={guardandoInforme}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
            >
              Publicar oficialmente
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}