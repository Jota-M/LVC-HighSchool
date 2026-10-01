// components/migracion/FichaEstudianteIndividual.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person,
  Payment,
  Receipt,
  Description,
  School,
  CheckCircle,
  Add,
  Edit,
  Layers,
  Code
} from '@mui/icons-material';
import {
  EstudianteMatrizItem,
  CuotaMatrizItem
} from '@/services/migracionPagosService';
import { ModalRegistroPagoHistorico } from './ModalRegistroPagoHistorico';
import { ModalGestionBeca } from './ModalGestionBeca';
import { ModalCargaLoteEstudiante } from './ModalCargaLoteEstudiante';
import { ModalImportarJson } from './ModalImportarJson';

interface Props {
  estudiante: EstudianteMatrizItem;
  montoBaseDefault?: number;
  onRefresh: () => void;
}

export const FichaEstudianteIndividual: React.FC<Props> = ({
  estudiante,
  montoBaseDefault = 330,
  onRefresh
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalBecaOpen, setModalBecaOpen] = useState(false);
  const [modalLoteOpen, setModalLoteOpen] = useState(false);
  const [modalJsonOpen, setModalJsonOpen] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<CuotaMatrizItem | null>(null);

  const handleAbrirPago = (cuota: CuotaMatrizItem) => {
    setCuotaSeleccionada(cuota);
    setModalPagoOpen(true);
  };

  const totalPagado = estudiante.cuotas.reduce((acc, c) => {
    if (c.estado === 'pagado') {
      const sum = c.pagos?.reduce((s, p) => s + Number(p.monto_pagado || 0), 0) || c.monto_final;
      return acc + Number(sum);
    }
    return acc;
  }, 0);

  const totalCuotasPagadas = estudiante.cuotas.filter(c => c.estado === 'pagado').length;
  const totalCuotasExoneradas = estudiante.cuotas.filter(c => c.estado === 'cancelado' || (c.monto_beca > 0 && c.monto_final === 0)).length;

  return (
    <Card sx={{
      borderRadius: '20px',
      border: '1px solid',
      borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
      background: isDark
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Encabezado del Estudiante */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 54,
              height: 54,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#3b82f6', 0.2) : alpha('#0288d1', 0.1),
              color: isDark ? '#60a5fa' : '#0288d1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Person sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                {estudiante.nombre_completo}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  CI: <strong>{estudiante.ci || 'Sin CI'}</strong>
                </Typography>
                <Chip
                  label={estudiante.estado_matricula === 'activo' ? 'Matrícula Activa' : estudiante.estado_matricula}
                  size="small"
                  color={estudiante.estado_matricula === 'activo' ? 'success' : 'default'}
                  sx={{ height: 22, fontSize: '0.75rem' }}
                />
                {estudiante.es_becado && (
                  <Chip
                    label={`Becado (${estudiante.porcentaje_beca || 100}%) - ${estudiante.tipo_beca || 'General'}`}
                    size="small"
                    color="secondary"
                    sx={{ height: 22, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Acciones del Estudiante */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<School />}
              onClick={() => setModalBecaOpen(true)}
            >
              Gestionar Beca
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Code />}
              onClick={() => setModalJsonOpen(true)}
              sx={{
                fontWeight: 700,
                borderWidth: '1.5px',
                '&:hover': { borderWidth: '1.5px' }
              }}
            >
              {'{ }'} Insertar JSON
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<Layers />}
              onClick={() => setModalLoteOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              ⚡ Cargar Lote / Año Completo
            </Button>
          </Box>
        </Box>

        {/* Resumen de cobros */}
        <Box sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Cuotas Pagadas</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {totalCuotasPagadas} / 10
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Cuotas Exoneradas</Typography>
            <Typography variant="h6" fontWeight={700} color="secondary.main">
              {totalCuotasExoneradas}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Cuotas Pendientes</Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main">
              {10 - totalCuotasPagadas - totalCuotasExoneradas}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Total Pagado Histórico</Typography>
            <Typography variant="h6" fontWeight={800} color="primary.main">
              Bs {totalPagado.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Grilla de las 10 Cuotas */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Planilla Anual de Cuotas (Febrero - Noviembre):
        </Typography>

        <Grid container spacing={2}>
          {estudiante.cuotas.map((c) => {
            const esPagado = c.estado === 'pagado';
            const esCancelado = c.estado === 'cancelado' || (c.monto_beca > 0 && c.monto_final === 0);
            const pago = c.pagos && c.pagos.length > 0 ? c.pagos[0] : null;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={c.numero_cuota}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: '12px',
                    borderColor: esPagado
                      ? (isDark ? alpha('#10b981', 0.5) : alpha('#10b981', 0.4))
                      : esCancelado
                      ? (isDark ? alpha('#8b5cf6', 0.5) : alpha('#7c3aed', 0.4))
                      : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)),
                    bgcolor: esPagado
                      ? (isDark ? alpha('#10b981', 0.1) : alpha('#10b981', 0.05))
                      : esCancelado
                      ? (isDark ? alpha('#8b5cf6', 0.1) : alpha('#7c3aed', 0.05))
                      : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {c.numero_cuota}. {c.mes.toUpperCase()}
                      </Typography>
                      {esPagado ? (
                        <Chip label="PAGADO" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
                      ) : esCancelado ? (
                        <Chip label="BECA" size="small" color="secondary" sx={{ height: 20, fontSize: '0.65rem' }} />
                      ) : (
                        <Chip label="PENDIENTE" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                      )}
                    </Box>

                    {esPagado && pago ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight={800} color="success.main">
                          Bs {pago.monto_pagado || c.monto_final}
                        </Typography>
                        {pago.numero_factura && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            📄 Factura: <strong>{pago.numero_factura}</strong>
                          </Typography>
                        )}
                        {pago.numero_comprobante && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            🧾 Recibo: <strong>{pago.numero_comprobante}</strong>
                          </Typography>
                        )}
                        {pago.fecha_pago && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            📅 {pago.fecha_pago.substring(0, 10)} ({pago.metodo_pago})
                          </Typography>
                        )}
                        {pago.observaciones && (
                          <Typography variant="caption" display="block" color="text.disabled" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                            "{pago.observaciones}"
                          </Typography>
                        )}
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          fullWidth
                          startIcon={<Edit />}
                          onClick={() => handleAbrirPago(c)}
                          sx={{ mt: 1, textTransform: 'none' }}
                        >
                          Editar Pago
                        </Button>
                      </Box>
                    ) : esCancelado ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight={700} color="secondary.main">
                          Exonerado por Beca
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Monto final: Bs 0
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          color="secondary"
                          fullWidth
                          startIcon={<Edit />}
                          onClick={() => handleAbrirPago(c)}
                          sx={{ mt: 1, textTransform: 'none' }}
                        >
                          Ajustar Cuota
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                          Bs {c.monto_final || montoBaseDefault}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Sin cobro registrado
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={<Add />}
                          onClick={() => handleAbrirPago(c)}
                          sx={{ mt: 1, textTransform: 'none' }}
                        >
                          Registrar
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>

      {/* Modales */}
      <ModalRegistroPagoHistorico
        open={modalPagoOpen}
        onClose={() => setModalPagoOpen(false)}
        onSuccess={onRefresh}
        estudiante={estudiante}
        cuota={cuotaSeleccionada}
      />

      <ModalGestionBeca
        open={modalBecaOpen}
        onClose={() => setModalBecaOpen(false)}
        onSuccess={onRefresh}
        estudiante={estudiante}
      />

      <ModalCargaLoteEstudiante
        open={modalLoteOpen}
        onClose={() => setModalLoteOpen(false)}
        onSuccess={onRefresh}
        estudiante={estudiante}
        montoBaseDefault={montoBaseDefault}
      />

      <ModalImportarJson
        open={modalJsonOpen}
        onClose={() => setModalJsonOpen(false)}
        onSuccess={onRefresh}
        estudiante={estudiante}
      />
    </Card>
  );
};
