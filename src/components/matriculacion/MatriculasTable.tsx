// components/matriculacion/MatriculasTable.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Button,
  Typography,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Card,
  Grid,
  Stack,
  Divider,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  EmojiEvents as BecaIcon,
  PictureAsPdf as PdfIcon,
  RemoveRedEye as PreviewIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { MatriculaResponse } from '@/types/matriculacionTypes';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import matriculacionService from '@/services/matriculacionService';

interface Props {
  matriculas: MatriculaResponse[];
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearch: (search: string) => void;
  onView: (matriculaId: number) => void;
  viewMode?: 'cards' | 'table';
}

// =============================================
// 🎴 COMPONENTE DE CARD INDIVIDUAL
// =============================================
const MatriculaCard: React.FC<{
  matricula: MatriculaResponse;
  onView: (id: number) => void;
  onDownloadPDF: (matricula: MatriculaResponse) => void;
  onPreviewPDF: (matricula: MatriculaResponse) => void;
  downloadingPdf: number | null;
  index: number;
}> = ({ matricula, onView, onDownloadPDF, onPreviewPDF, downloadingPdf, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'retirado': return 'error';
      case 'trasladado': return 'warning';
      case 'graduado': return 'info';
      default: return 'default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      activo: 'Activo',
      retirado: 'Retirado',
      trasladado: 'Trasladado',
      graduado: 'Graduado',
      suspendido: 'Suspendido',
      congelado: 'Congelado',
    };
    return labels[estado] || estado;
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        transition: 'all 0.3s ease',
        animation: `slideIn 0.5s ease ${index * 0.1}s both`,
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            <Avatar
              src={matricula.estudiante_foto || undefined}
              alt={matricula.estudiante_nombres}
              sx={{
                width: { xs: 48, md: 56 },
                height: { xs: 48, md: 56 },
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {matricula.estudiante_nombres.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {matricula.estudiante_nombres}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {matricula.estudiante_apellido_paterno}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ flexShrink: 0 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Info Principal */}
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              N° MATRÍCULA
            </Typography>
            <Chip
              label={matricula.numero_matricula}
              size="small"
              variant="outlined"
              sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', md: '0.75rem' } }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              CÓDIGO
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {matricula.estudiante_codigo}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              <SchoolIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              GRADO Y PARALELO
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', md: '0.85rem' } }}>
              {matricula.grado_nombre} - {matricula.paralelo_nombre}
            </Typography>
            {matricula.aula && (
              <Typography variant="caption" color="text.secondary">
                Aula: {matricula.aula}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              TURNO
            </Typography>
            <Chip label={matricula.turno_nombre} size="small" variant="outlined" />
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              ESTADO
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Chip
                label={getEstadoLabel(matricula.estado)}
                size="small"
                color={getEstadoColor(matricula.estado)}
                sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}
              />
              {matricula.es_repitente && (
                <Chip label="Repite" size="small" color="warning" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }} />
              )}
            </Box>
          </Box>

          {matricula.es_becado && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                <BecaIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle', color: 'gold' }} />
                BECA
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'gold' }}>
                {matricula.porcentaje_beca}%
              </Typography>
            </Box>
          )}

          {matricula.fecha_matricula && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                <CalendarIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                FECHA
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {format(new Date(matricula.fecha_matricula), 'dd/MM/yyyy')}
              </Typography>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Acciones */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<ViewIcon />}
            onClick={() => onView(matricula.id)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', md: '0.875rem' },
            }}
          >
            Ver
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            size="small"
            startIcon={
              downloadingPdf === matricula.id ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PdfIcon />
              )
            }
            onClick={() => onDownloadPDF(matricula)}
            disabled={downloadingPdf === matricula.id}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', md: '0.875rem' },
            }}
          >
            {downloadingPdf === matricula.id ? 'Generando...' : 'PDF'}
          </Button>
        </Box>
      </Box>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { borderRadius: '12px', mt: 1, minWidth: 200 },
        }}
      >
        <MenuItem onClick={() => { onPreviewPDF(matricula); setAnchorEl(null); }}>
          <ListItemIcon>
            <PreviewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver PDF en navegador</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDownloadPDF(matricula); setAnchorEl(null); }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Descargar PDF</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

// =============================================
// 📊 COMPONENTE PRINCIPAL
// =============================================
export const MatriculasTable: React.FC<Props> = ({
  matriculas,
  isLoading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onView,
  viewMode = 'table',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMatricula, setSelectedMatricula] = useState<MatriculaResponse | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, matricula: MatriculaResponse) => {
    setAnchorEl(event.currentTarget);
    setSelectedMatricula(matricula);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMatricula(null);
  };

  const handleDownloadPDF = async (matricula: MatriculaResponse) => {
    try {
      setDownloadingPdf(matricula.id);
      handleMenuClose();

      enqueueSnackbar('Generando PDF...', { variant: 'info' });
      await matriculacionService.descargarPDF(matricula.id);
      enqueueSnackbar('PDF descargado exitosamente', { variant: 'success', autoHideDuration: 3000 });
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error al descargar el PDF', { variant: 'error' });
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handlePreviewPDF = async (matricula: MatriculaResponse) => {
    try {
      handleMenuClose();
      matriculacionService.verPDFPreview(matricula.id);
    } catch (error: any) {
      console.error('Error al abrir PDF:', error);
      enqueueSnackbar('Error al abrir el PDF', { variant: 'error' });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'retirado': return 'error';
      case 'trasladado': return 'warning';
      case 'graduado': return 'info';
      default: return 'default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      activo: 'Activo',
      retirado: 'Retirado',
      trasladado: 'Trasladado',
      graduado: 'Graduado',
      suspendido: 'Suspendido',
      congelado: 'Congelado',
    };
    return labels[estado] || estado;
  };

  // =============================================
  // 🎴 VISTA DE CARDS
  // =============================================
  if (viewMode === 'cards') {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Matrículas Actuales
            </Typography>
            <Chip
              label={`${totalItems} matrícula${totalItems !== 1 ? 's' : ''}`}
              color="primary"
              sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.75rem' } }}
            />
          </Box>
          <TextField
            fullWidth
            placeholder="Buscar por estudiante, código o número de matrícula..."
            value={searchValue}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              },
            }}
          />
        </Box>

        {/* Cards Grid */}
        <Box sx={{ p: 3 }}>
          {isLoading ? (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid size={{xs:12, sm:6, md:4}} key={index}>
                  <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
          ) : matriculas.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No hay matrículas registradas en este periodo
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {matriculas.map((matricula, index) => (
                <Grid size={{xs:12, sm:6, md:4}} key={matricula.id}>
                  <MatriculaCard
                    matricula={matricula}
                    onView={onView}
                    onDownloadPDF={handleDownloadPDF}
                    onPreviewPDF={handlePreviewPDF}
                    downloadingPdf={downloadingPdf}
                    index={index}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={totalItems}
          page={page - 1}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          }}
        />
      </Paper>
    );
  }

  // =============================================
  // 📊 VISTA DE TABLA (código original simplificado)
  // =============================================
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '20px',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        overflow: 'hidden',
      }}
    >
      {/* Header con búsqueda */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Matrículas Actuales
          </Typography>
          <Chip
            label={`${totalItems} matrícula${totalItems !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <TextField
          fullWidth
          placeholder="Buscar por estudiante, código o número de matrícula..."
          value={searchValue}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            },
          }}
        />
      </Box>

      {/* Tabla */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <TableCell sx={{ fontWeight: 700 }}>N° Matrícula</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estudiante</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Grado/Paralelo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Turno</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Beca</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton width="60%" />
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : matriculas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay matrículas registradas en este periodo
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              matriculas.map((matricula) => (
                <TableRow
                  key={matricula.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={matricula.numero_matricula}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={matricula.estudiante_foto || undefined}
                        alt={matricula.estudiante_nombres}
                        sx={{ width: 40, height: 40 }}
                      >
                        {matricula.estudiante_nombres.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {matricula.estudiante_nombres} {matricula.estudiante_apellido_paterno}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {matricula.estudiante_codigo}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {matricula.grado_nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Paralelo: {matricula.paralelo_nombre}
                      {matricula.aula && ` - ${matricula.aula}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={matricula.turno_nombre}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getEstadoLabel(matricula.estado)}
                      size="small"
                      color={getEstadoColor(matricula.estado)}
                      sx={{ fontWeight: 600 }}
                    />
                    {matricula.es_repitente && (
                      <Chip
                        label="Repite"
                        size="small"
                        color="warning"
                        sx={{ ml: 0.5, fontSize: '0.7rem' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {matricula.es_becado ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BecaIcon sx={{ fontSize: 16, color: 'gold' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {matricula.porcentaje_beca}%
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sin beca
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {matricula.fecha_matricula
                        ? format(new Date(matricula.fecha_matricula), 'dd MMM yyyy')
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Ver detalles">
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => onView(matricula.id)}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Ver
                        </Button>
                      </Tooltip>
                      <Tooltip title="Descargar certificado de matrícula">
                        <span>
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            startIcon={
                              downloadingPdf === matricula.id ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <PdfIcon />
                              )
                            }
                            onClick={() => handleDownloadPDF(matricula)}
                            disabled={downloadingPdf === matricula.id}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 600,
                              minWidth: '90px',
                            }}
                          >
                            {downloadingPdf === matricula.id ? 'Generando...' : 'PDF'}
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title="Más opciones">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, matricula)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component="div"
        count={totalItems}
        page={page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      />

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => selectedMatricula && handlePreviewPDF(selectedMatricula)}>
          <ListItemIcon>
            <PreviewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver PDF en navegador</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => selectedMatricula && handleDownloadPDF(selectedMatricula)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Descargar PDF</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};