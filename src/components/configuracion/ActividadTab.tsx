// components/configuracion/ActividadTab.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Typography,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import configuracionService, { Actividad } from '@/services/configuracionService';

export default function ActividadTab() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const currentOffset = loadMore ? offset : 0;
      const data = await configuracionService.obtenerActividad(limit, currentOffset);

      if (loadMore) {
        setActividades((prev) => [...prev, ...data.actividades]);
      } else {
        setActividades(data.actividades);
      }

      setTotal(data.total);

      if (loadMore) {
        setOffset(currentOffset + limit);
      } else {
        setOffset(limit);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar actividad');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCargarMas = () => {
    cargarActividades(true);
  };

  const getResultadoChip = (resultado: string) => {
    switch (resultado) {
      case 'exitoso':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Exitoso"
            color="success"
            size="small"
          />
        );
      case 'fallido':
        return (
          <Chip
            icon={<CancelIcon />}
            label="Fallido"
            color="error"
            size="small"
          />
        );
      case 'pendiente':
        return (
          <Chip
            icon={<WarningIcon />}
            label="Pendiente"
            color="warning"
            size="small"
          />
        );
      default:
        return <Chip label={resultado} size="small" variant="outlined" />;
    }
  };

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case 'exitoso':
        return <CheckCircleIcon color="success" />;
      case 'fallido':
        return <CancelIcon color="error" />;
      case 'pendiente':
        return <WarningIcon color="warning" />;
      default:
        return null;
    }
  };

  const getAccionLabel = (accion: string) => {
    const labels: Record<string, string> = {
      login: 'Inicio de sesión',
      logout: 'Cierre de sesión',
      crear: 'Creación',
      actualizar: 'Actualización',
      eliminar: 'Eliminación',
      cambiar_password: 'Cambio de contraseña',
      actualizar_perfil: 'Actualización de perfil',
      cerrar_sesion: 'Cierre de sesión',
      cerrar_todas_sesiones: 'Cierre de todas las sesiones',
      registro_completo: 'Registro completo',
    };
    return labels[accion] || accion;
  };

  const getModuloLabel = (modulo: string) => {
    const labels: Record<string, string> = {
      auth: 'Autenticación',
      configuracion: 'Configuración',
      estudiante: 'Estudiantes',
      docente: 'Docentes',
      matricula: 'Matrículas',
      usuario: 'Usuarios',
    };
    return labels[modulo] || modulo;
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;

    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && actividades.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Actividad Reciente"
        subheader="Historial de tus últimas acciones en el sistema"
      />
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
        
        {actividades.length === 0 ? (
          <Alert severity="info">No tienes actividad registrada aún</Alert>
        ) : (
          <>
            <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 1 }}>
              <Stack spacing={2}>
                {actividades.map((actividad) => (
                  <Box
                    key={actividad.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      {/* Icono de resultado */}
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor:
                            actividad.resultado === 'exitoso'
                              ? 'success.lighter'
                              : actividad.resultado === 'fallido'
                              ? 'error.lighter'
                              : 'warning.lighter',
                        }}
                      >
                        {getResultadoIcon(actividad.resultado)}
                      </Box>

                      {/* Información de la actividad */}
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {getAccionLabel(actividad.accion)}
                          </Typography>
                          <ChevronRightIcon fontSize="small" color="disabled" />
                          <Typography variant="body2" color="text.secondary">
                            {getModuloLabel(actividad.modulo)}
                          </Typography>
                        </Box>

                        {actividad.mensaje && (
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            {actividad.mensaje}
                          </Typography>
                        )}

                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {formatFecha(actividad.created_at)}
                            </Typography>
                          </Box>
                          {actividad.ip_address && (
                            <Typography variant="caption" color="text.secondary">
                              IP: {actividad.ip_address}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Badge de resultado */}
                      <Box>{getResultadoChip(actividad.resultado)}</Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Botón cargar más */}
            {actividades.length < total && (
              <Box mt={3} textAlign="center">
                <Button
                  variant="outlined"
                  onClick={handleCargarMas}
                  disabled={loadingMore}
                  startIcon={loadingMore && <CircularProgress size={20} />}
                >
                  Cargar más ({actividades.length} de {total})
                </Button>
              </Box>
            )}

            {/* Info total */}
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Mostrando {actividades.length} de {total} actividades
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}