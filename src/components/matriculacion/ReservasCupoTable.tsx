// components/matriculacion/ReservasCupoTable.tsx
'use client';
import React, { useState, useEffect } from 'react';
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
  Chip,
  Button,
  Typography,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip,
  Stack,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  WhatsApp as WhatsAppIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '@/lib/api';
import reservaCupoService from '@/services/reservaCupoService';
import { ReservaCupoData } from '@/types/reservaCupoTypes';

export const ReservasCupoTable: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [reservas, setReservas] = useState<ReservaCupoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  const cargarReservas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reserva-cupo/admin/listado', {
        params: {
          search: search.trim() || undefined,
          page: page + 1,
          limit: rowsPerPage
        }
      });
      if (data.success && data.data) {
        setReservas(data.data.reservas || []);
        setTotalItems(data.data.paginacion?.total || 0);
      }
    } catch (err) {
      console.error('Error al cargar reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, [page, rowsPerPage, search]);

  const handleDescargarPDF = (codigo: string) => {
    reservaCupoService.descargarPDF(codigo);
  };

  const handleWhatsApp = (r: ReservaCupoData) => {
    const tel = r.tutor_telefono.replace(/\D/g, '');
    const numWhatsapp = tel.startsWith('591') ? tel : `591${tel}`;
    const texto = encodeURIComponent(
      `Hola ${r.tutor_nombre}, le saludamos de la U.E.P. La Voz de Cristo respecto a la Reserva de Cupo de ${r.estudiante_nombre_completo} para la Gestión 2027 (Código: ${r.codigo_reserva}).`
    );
    window.open(`https://api.whatsapp.com/send?phone=${numWhatsapp}&text=${texto}`, '_blank');
  };

  return (
    <Box>
      {/* Barra de Filtros */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar por estudiante, CI, tutor o código..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }
          }}
        />

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={cargarReservas}
          disabled={loading}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Actualizar Listado
        </Button>
      </Box>

      {/* Tabla de Reservas */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${isDark ? alpha('#ffffff', 0.1) : '#e2e8f0'}`,
          bgcolor: isDark ? '#111827' : '#ffffff'
        }}
      >
        <Table sx={{ minWidth: 700 }} size="small">
          <TableHead sx={{ bgcolor: isDark ? '#1f2937' : '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Código / Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estudiante Regular</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Grado Destino (2027)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Turno</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Persona que Reservó</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contacto</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={90} /></TableCell>
                  <TableCell><Skeleton width={140} /></TableCell>
                  <TableCell><Skeleton width={110} /></TableCell>
                  <TableCell><Skeleton width={70} /></TableCell>
                  <TableCell><Skeleton width={130} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                </TableRow>
              ))
            ) : reservas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron reservas registradas para los filtros aplicados.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reservas.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#2563eb' }}>
                      {r.codigo_reserva}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {r.fecha_reserva_formateada}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {r.estudiante_nombre_completo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CI: {r.estudiante_ci}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={<SchoolIcon fontSize="small" sx={{ fontSize: '14px !important' }} />}
                      label={r.grado_destino_nombre}
                      size="small"
                      sx={{
                        bgcolor: alpha('#16a34a', 0.12),
                        color: '#16a34a',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    />
                    {r.grado_actual_nombre && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        De: {r.grado_actual_nombre}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {r.turno_destino_nombre}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {r.tutor_nombre}
                    </Typography>
                    <Chip
                      label={r.tutor_parentesco}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="#059669">
                      {r.tutor_telefono}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Descargar Recibo en PDF">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDescargarPDF(r.codigo_reserva)}
                        >
                          <PdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Contactar por WhatsApp">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleWhatsApp(r)}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas:"
          rowsPerPageOptions={[10, 15, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
};

export default ReservasCupoTable;
