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
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Cancel as CancelIcon,
  SwapHoriz as TransferIcon,
  EmojiEvents as BecaIcon,
  PictureAsPdf as PdfIcon,
  RemoveRedEye as PreviewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { MatriculaResponse } from '@/types/matriculacionTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
}

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

  // =============================================
  // 📄 DESCARGAR PDF
  // =============================================
  const handleDownloadPDF = async (matricula: MatriculaResponse) => {
    try {
      setDownloadingPdf(matricula.id);
      handleMenuClose();

      enqueueSnackbar('Generando PDF...', { variant: 'info' });

      await matriculacionService.descargarPDF(matricula.id);

      enqueueSnackbar('PDF descargado exitosamente', { 
        variant: 'success',
        autoHideDuration: 3000,
      });
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error al descargar el PDF',
        { variant: 'error' }
      );
    } finally {
      setDownloadingPdf(null);
    }
  };

  // =============================================
  // 👁️ VER PREVIEW PDF
  // =============================================
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
      case 'activo':
        return 'success';
      case 'retirado':
        return 'error';
      case 'trasladado':
        return 'warning';
      case 'graduado':
        return 'info';
      case 'suspendido':
        return 'default';
      case 'congelado':
        return 'default';
      default:
        return 'default';
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
              // Skeleton loading
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
                  {/* N° Matrícula */}
                  <TableCell>
                    <Chip
                      label={matricula.numero_matricula}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    />
                  </TableCell>

                  {/* Estudiante */}
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

                  {/* Grado/Paralelo */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {matricula.grado_nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Paralelo: {matricula.paralelo_nombre}
                      {matricula.aula && ` - ${matricula.aula}`}
                    </Typography>
                  </TableCell>

                  {/* Turno */}
                  <TableCell>
                    <Chip
                      label={matricula.turno_nombre}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Estado */}
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

                  {/* Beca */}
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

                  {/* Fecha */}
                  <TableCell>
                    <Typography variant="body2">
                      {matricula.fecha_matricula ? 
                        format(new Date(matricula.fecha_matricula), 'dd MMM yyyy') 
                        : '-'
                      }
                    </Typography>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {/* Botón Ver */}
                      <Tooltip title="Ver detalles">
                        <Button
                          variant="outlined"
                          color='secondary'
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

                      {/* Botón PDF con loading */}
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

                      {/* Menú de más opciones */}
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