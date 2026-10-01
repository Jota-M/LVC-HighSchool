// components/migracion/ModalGestionBeca.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  Chip,
  IconButton,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  School,
  Close,
  CheckCircle,
  WarningAmber,
  AutoAwesome,
  ClearAll
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import migracionPagosService, {
  EstudianteMatrizItem
} from '@/services/migracionPagosService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estudiante: EstudianteMatrizItem | null;
}

const MESES = [
  'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'
];

export const ModalGestionBeca: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  estudiante
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [esBecado, setEsBecado] = useState(false);
  const [porcentajeBeca, setPorcentajeBeca] = useState<number>(100);
  const [tipoBeca, setTipoBeca] = useState('Beca Completa (carga histórica)');
  const [cuotasExoneradas, setCuotasExoneradas] = useState<number[]>([]);

  useEffect(() => {
    if (!open || !estudiante) return;

    setEsBecado(!!estudiante.es_becado);
    setPorcentajeBeca(estudiante.porcentaje_beca ? Number(estudiante.porcentaje_beca) : 100);
    setTipoBeca(estudiante.tipo_beca || 'Beca Completa (carga histórica)');

    // Cuotas que ya están en estado cancelado (exoneradas)
    const exoneradasActivas = estudiante.cuotas
      .filter(c => c.estado === 'cancelado' || (c.monto_beca > 0 && c.monto_final === 0))
      .map(c => c.numero_cuota);

    setCuotasExoneradas(exoneradasActivas);
  }, [open, estudiante]);

  const toggleCuota = (numeroCuota: number) => {
    setCuotasExoneradas(prev =>
      prev.includes(numeroCuota)
        ? prev.filter(c => c !== numeroCuota)
        : [...prev, numeroCuota]
    );
  };

  const seleccionarRango = (desdeCuota: number) => {
    if (!estudiante) return;
    const nuevas = [];
    for (let i = desdeCuota; i <= 10; i++) {
      // No seleccionar las que ya tienen pago registrado
      const cuotaData = estudiante.cuotas.find(c => c.numero_cuota === i);
      if (cuotaData && cuotaData.estado === 'pagado') {
        continue;
      }
      nuevas.push(i);
    }
    setCuotasExoneradas(nuevas);
  };

  const handleSubmit = async () => {
    if (!estudiante) return;

    setLoading(true);
    try {
      await migracionPagosService.configurarBeca({
        matricula_id: estudiante.matricula_id,
        es_becado: esBecado,
        porcentaje_beca: esBecado ? Number(porcentajeBeca) : 0,
        tipo_beca: esBecado ? tipoBeca.trim() : '',
        cuotas_exoneradas: esBecado ? cuotasExoneradas : []
      });

      enqueueSnackbar(
        esBecado
          ? `Beca configurada para ${estudiante.nombre_completo} (${cuotasExoneradas.length} cuotas exoneradas)`
          : `Beca removida para ${estudiante.nombre_completo}`,
        { variant: 'success' }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al configurar beca:', err);
      enqueueSnackbar(err.response?.data?.message || 'Error al actualizar configuración de beca', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!estudiante) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: isDark ? alpha('#8b5cf6', 0.2) : alpha('#7c3aed', 0.1),
              color: isDark ? '#a78bfa' : '#7c3aed'
            }}>
              <School />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Gestión de Beca y Exoneración
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {estudiante.nombre_completo} (CI: {estudiante.ci || 'Sin CI'})
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={esBecado}
                onChange={(e) => setEsBecado(e.target.checked)}
                color="secondary"
              />
            }
            label={
              <Typography variant="subtitle1" fontWeight={700}>
                Estudiante Becado / Exonerado
              </Typography>
            }
          />
        </Box>

        {esBecado && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="% de Beca"
                  value={porcentajeBeca}
                  onChange={(e) => setPorcentajeBeca(Number(e.target.value))}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tipo / Motivo de Beca"
                  placeholder="Ej. Beca de excelencia, convenio pastoral, etc."
                  value={tipoBeca}
                  onChange={(e) => setTipoBeca(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Atajos rápidos */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Atajos:
              </Typography>
              <Chip
                label="Todo el año (1-10)"
                size="small"
                onClick={() => seleccionarRango(1)}
                icon={<AutoAwesome fontSize="small" />}
                clickable
                variant="outlined"
              />
              <Chip
                label="Desde Marzo (2-10)"
                size="small"
                onClick={() => seleccionarRango(2)}
                clickable
                variant="outlined"
              />
              <Chip
                label="Desde Abril (3-10)"
                size="small"
                onClick={() => seleccionarRango(3)}
                clickable
                variant="outlined"
              />
              <Chip
                label="Desde Mayo (4-10)"
                size="small"
                onClick={() => seleccionarRango(4)}
                clickable
                variant="outlined"
              />
              <Chip
                label="Limpiar selección"
                size="small"
                onClick={() => setCuotasExoneradas([])}
                icon={<ClearAll fontSize="small" />}
                clickable
                color="default"
              />
            </Box>

            {/* Selección de cuotas */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
              Selecciona las cuotas a exonerar (Monto final = 0 Bs):
            </Typography>

            <Grid container spacing={1}>
              {estudiante.cuotas.map((c) => {
                const yaPagada = c.estado === 'pagado' || (c.pagos && c.pagos.length > 0);
                const isSelected = cuotasExoneradas.includes(c.numero_cuota);

                return (
                  <Grid size={{ xs: 6, sm: 4 }} key={c.numero_cuota}>
                    <Box
                      onClick={() => !yaPagada && toggleCuota(c.numero_cuota)}
                      sx={{
                        p: 1,
                        border: '1px solid',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: yaPagada ? 'not-allowed' : 'pointer',
                        opacity: yaPagada ? 0.6 : 1,
                        borderColor: isSelected
                          ? 'secondary.main'
                          : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                        bgcolor: isSelected
                          ? (isDark ? alpha('#8b5cf6', 0.15) : alpha('#7c3aed', 0.08))
                          : 'transparent'
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {c.numero_cuota}. {c.mes}
                        </Typography>
                        {yaPagada ? (
                          <Typography variant="caption" color="success.main" fontWeight={600}>
                            Pagada (Bs {c.monto_final})
                          </Typography>
                        ) : isSelected ? (
                          <Typography variant="caption" color="secondary.main" fontWeight={600}>
                            Exonerada
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Bs {c.monto_original}
                          </Typography>
                        )}
                      </Box>
                      <Checkbox
                        size="small"
                        color="secondary"
                        checked={isSelected}
                        disabled={yaPagada}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            <Alert severity="info" icon={<WarningAmber fontSize="inherit" />} sx={{ mt: 1 }}>
              Las cuotas exoneradas se marcarán con estado <strong>cancelado</strong> y saldo a pagar 0 Bs. Las cuotas que ya tengan un pago real no se alterarán.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<CheckCircle />}
        >
          {loading ? 'Guardando...' : 'Guardar Beca'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
