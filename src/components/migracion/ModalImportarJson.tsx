// components/migracion/ModalImportarJson.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Code,
  Close,
  CheckCircle,
  ErrorOutline,
  AutoAwesome,
  ContentPaste,
  FormatAlignLeft,
  School,
  Person,
  Receipt,
  WarningAmber
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import migracionPagosService, {
  EstudianteMatrizItem
} from '@/services/migracionPagosService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estudiante?: EstudianteMatrizItem | null;
  paraleloId?: number;
  cursoNombre?: string;
  periodoId?: number;
}

const TEMPLATE_ESTUDIANTE = `{
  "pagos": [
    { "numero_cuota": 1, "mes_correspondiente": "Febrero", "monto": 330, "metodo_pago": "efectivo", "numero_comprobante": "1001", "fecha_pago": "2026-02-10" },
    { "numero_cuota": 2, "mes_correspondiente": "Marzo", "monto": 330, "metodo_pago": "efectivo", "numero_comprobante": "1002", "fecha_pago": "2026-03-10" }
  ]
}`;

const TEMPLATE_ESTUDIANTE_BECA = `{
  "beca": {
    "es_becado": true,
    "porcentaje_beca": 100,
    "tipo_beca": "becado completo",
    "cuotas_exoneradas": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  "pagos": []
}`;

const TEMPLATE_CURSO = `[
  {
    "ci": "12345678",
    "nombre": "PEREZ LOPEZ JUAN",
    "pagos": [
      { "numero_cuota": 1, "monto": 330, "numero_comprobante": "101", "fecha_pago": "2026-02-10" }
    ]
  }
]`;

const MESES_NOMBRES = ['Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];

function aplanarPagosParaPreview(pagosRaw: any[]) {
  const result: any[] = [];
  if (!Array.isArray(pagosRaw)) return result;

  for (const p of pagosRaw) {
    if (!p) continue;
    if (p.cuotas_cubiertas && Array.isArray(p.cuotas_cubiertas) && p.cuotas_cubiertas.length > 0) {
      const cant = p.cuotas_cubiertas.length;
      let montoUnitario = 330;
      if (p.monto_por_cuota !== undefined) {
        montoUnitario = Number(p.monto_por_cuota);
      } else if (p.monto_total !== undefined) {
        montoUnitario = Math.round((Number(p.monto_total) / cant) * 100) / 100;
      } else if (p.monto !== undefined) {
        montoUnitario = Number(p.monto);
      }

      for (const c of p.cuotas_cubiertas) {
        const num = Number(c);
        result.push({
          numero_cuota: num,
          mes_correspondiente: MESES_NOMBRES[num - 1] || `Cuota ${num}`,
          monto: montoUnitario,
          metodo_pago: p.metodo_pago || 'efectivo',
          numero_comprobante: p.numero_comprobante,
          numero_factura: p.numero_factura,
          entrego_factura: p.entrego_factura || !!p.numero_factura,
          fecha_pago: p.fecha_pago,
          observaciones: p.nota || p.observaciones || (p.tipo === 'pago_anual' ? 'Pago anual' : 'Pago múltiple')
        });
      }
    } else {
      let num = p.numero_cuota || p.cuota;
      if (!num && p.mes_correspondiente) {
        const idx = MESES_NOMBRES.findIndex(m => m.toLowerCase() === String(p.mes_correspondiente).toLowerCase().trim());
        if (idx !== -1) num = idx + 1;
      }

      result.push({
        numero_cuota: num,
        mes_correspondiente: p.mes_correspondiente || (num ? MESES_NOMBRES[num - 1] : ''),
        monto: Number(p.monto !== undefined ? p.monto : (p.monto_pagado !== undefined ? p.monto_pagado : 330)),
        metodo_pago: p.metodo_pago || 'efectivo',
        numero_comprobante: p.numero_comprobante,
        numero_factura: p.numero_factura,
        entrego_factura: p.entrego_factura || !!p.numero_factura,
        fecha_pago: p.fecha_pago,
        observaciones: p.nota || p.observaciones
      });
    }
  }
  return result;
}

export const ModalImportarJson: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  estudiante,
  paraleloId,
  cursoNombre,
  periodoId
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);

  const isCursoMode = !estudiante && !!paraleloId;

  useEffect(() => {
    if (open) {
      setJsonText('');
    }
  }, [open]);

  // Análisis y validación en tiempo real del JSON
  const parsedData = useMemo(() => {
    if (!jsonText.trim()) {
      return { isValid: false, error: null, data: null, summary: null };
    }

    try {
      let data = JSON.parse(jsonText);

      // Si es modo estudiante
      if (!isCursoMode) {
        if (Array.isArray(data) && data.length === 1 && typeof data[0] === 'object' && (data[0].pagos || data[0].beca)) {
          data = data[0];
        }

        let rawPagos = [];
        let beca = null;

        if (Array.isArray(data)) {
          rawPagos = data;
        } else if (typeof data === 'object' && data !== null) {
          if (Array.isArray(data.pagos)) rawPagos = data.pagos;
          if (data.beca) beca = data.beca;
        }

        const pagos = aplanarPagosParaPreview(rawPagos);
        const totalMonto = pagos.reduce((acc, p) => acc + Number(p.monto || 330), 0);

        return {
          isValid: true,
          error: null,
          data,
          summary: {
            tipo: 'estudiante',
            totalPagos: pagos.length,
            totalMonto,
            pagos,
            beca
          }
        };
      } else {
        // Modo curso
        const listaEstudiantes = Array.isArray(data) ? data : (data.estudiantes || []);
        let totalPagos = 0;
        let totalBecas = 0;

        for (const est of listaEstudiantes) {
          const pagosAplanados = aplanarPagosParaPreview(est.pagos || []);
          totalPagos += pagosAplanados.length;
          if (est.beca && est.beca.es_becado) totalBecas++;
        }

        return {
          isValid: true,
          error: null,
          data,
          summary: {
            tipo: 'curso',
            totalEstudiantes: listaEstudiantes.length,
            totalPagos,
            totalBecas,
            estudiantes: listaEstudiantes
          }
        };
      }
    } catch (err: any) {
      return {
        isValid: false,
        error: err.message,
        data: null,
        summary: null
      };
    }
  }, [jsonText, isCursoMode]);

  // Formatear/Pretty Print
  const handleFormat = () => {
    try {
      const obj = JSON.parse(jsonText);
      setJsonText(JSON.stringify(obj, null, 2));
    } catch {
      enqueueSnackbar('No se puede dar formato: el JSON tiene errores de sintaxis', { variant: 'warning' });
    }
  };

  // Pegar del portapapeles
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setJsonText(text);
        enqueueSnackbar('Contenido pegado del portapapeles', { variant: 'info' });
      }
    } catch {
      enqueueSnackbar('Permiso denegado para acceder al portapapeles. Usa Ctrl+V', { variant: 'warning' });
    }
  };

  // Enviar e importar
  const handleSubmit = async () => {
    if (!parsedData.isValid || !parsedData.data) {
      enqueueSnackbar('Ingresa un JSON válido antes de continuar', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (!isCursoMode && estudiante) {
        const res = await migracionPagosService.importarJsonEstudiante(
          estudiante.matricula_id,
          parsedData.data
        );
        enqueueSnackbar(res.message || 'JSON importado exitosamente', { variant: 'success' });
        onSuccess();
        onClose();
      } else if (paraleloId) {
        const res = await migracionPagosService.importarJsonCurso(
          paraleloId,
          parsedData.data,
          periodoId
        );
        enqueueSnackbar(res.message || 'Curso importado exitosamente', { variant: 'success' });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error al importar JSON:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error al procesar el JSON en el servidor', {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.3)',
          bgcolor: isDark ? '#111827' : '#ffffff',
          backgroundImage: 'none'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          background: isDark
            ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: isDark ? alpha('#6366f1', 0.2) : alpha('#4f46e5', 0.1),
              color: isDark ? '#818cf8' : '#4f46e5',
              display: 'flex'
            }}
          >
            <Code />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
              {isCursoMode ? 'Importar JSON para el Curso' : 'Importar JSON del Estudiante'}
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              {isCursoMode
                ? `Curso: ${cursoNombre || 'Seleccionado'}`
                : `${estudiante?.nombre_completo || 'Estudiante'} • CI: ${estudiante?.ci || 'S/N'}`}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} disabled={loading} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Banner informativo y atajos de plantilla */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: isDark ? '#cbd5e1' : '#334155' }}>
              📋 Plantillas rápidas:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {!isCursoMode ? (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoAwesome fontSize="small" />}
                    onClick={() => setJsonText(TEMPLATE_ESTUDIANTE)}
                    sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                  >
                    Plantilla Pagos
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<School fontSize="small" />}
                    onClick={() => setJsonText(TEMPLATE_ESTUDIANTE_BECA)}
                    sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                  >
                    Plantilla Beca 100%
                  </Button>
                </>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesome fontSize="small" />}
                  onClick={() => setJsonText(TEMPLATE_CURSO)}
                  sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                >
                  Plantilla Curso
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="info"
                startIcon={<ContentPaste fontSize="small" />}
                onClick={handlePasteClipboard}
                sx={{ textTransform: 'none', fontSize: '0.78rem' }}
              >
                Pegar de Portapapeles
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Textarea del JSON */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Pega el contenido JSON aquí:
            </Typography>
            {jsonText && (
              <Button
                size="small"
                startIcon={<FormatAlignLeft fontSize="small" />}
                onClick={handleFormat}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Auto-Formatear
              </Button>
            )}
          </Box>

          <TextField
            multiline
            rows={9}
            fullWidth
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={
              isCursoMode
                ? '[\n  {\n    "ci": "12345678",\n    "pagos": [{ "numero_cuota": 1, "monto": 330, "numero_comprobante": "101" }]\n  }\n]'
                : '{\n  "pagos": [\n    { "numero_cuota": 1, "monto": 330, "numero_comprobante": "1001", "fecha_pago": "2026-02-10" }\n  ]\n}'
            }
            error={!!parsedData.error}
            helperText={parsedData.error ? `Error de sintaxis: ${parsedData.error}` : undefined}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.85rem',
                bgcolor: isDark ? '#090d16' : '#f8fafc',
                borderRadius: 2
              }
            }}
          />
        </Box>

        {/* Preview en tiempo real */}
        {parsedData.isValid && parsedData.summary && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: isDark ? alpha('#10b981', 0.08) : alpha('#10b981', 0.05),
              border: '1px solid',
              borderColor: isDark ? alpha('#10b981', 0.25) : alpha('#10b981', 0.2),
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: isDark ? '#34d399' : '#059669' }}>
                  JSON Válido — Vista Previa Detectada
                </Typography>
              </Box>

              {!isCursoMode ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${parsedData.summary.totalPagos} Pagos detectados`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Total: Bs. ${parsedData.summary.totalMonto}`}
                    size="small"
                    color="success"
                    sx={{ fontWeight: 700 }}
                  />
                  {parsedData.summary.beca && (
                    <Chip
                      label={`Beca: ${parsedData.summary.beca.porcentaje_beca || 100}%`}
                      size="small"
                      color="secondary"
                    />
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${parsedData.summary.totalEstudiantes} Estudiantes`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`${parsedData.summary.totalPagos} Pagos en total`}
                    size="small"
                    color="success"
                  />
                  {parsedData.summary.totalBecas > 0 && (
                    <Chip
                      label={`${parsedData.summary.totalBecas} Becas`}
                      size="small"
                      color="secondary"
                    />
                  )}
                </Box>
              )}
            </Box>

            {/* Tabla resumen de pagos si es modo individual */}
            {!isCursoMode && parsedData.summary.pagos && parsedData.summary.pagos.length > 0 && (
              <TableContainer component={Paper} sx={{ maxHeight: 180, bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, py: 0.5 }}>Cuota</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.5 }}>Monto</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.5 }}>Método</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.5 }}>Nro. Comp / Factura</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.5 }}>Fecha Pago</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedData.summary.pagos.map((p: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ py: 0.5 }}>
                          <Chip
                            label={`Cuota ${p.numero_cuota || p.cuota || idx + 1}`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.72rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5, fontWeight: 600 }}>
                          Bs. {p.monto !== undefined ? p.monto : (p.monto_pagado || 330)}
                        </TableCell>
                        <TableCell sx={{ py: 0.5, textTransform: 'capitalize' }}>
                          {p.metodo_pago || 'efectivo'}
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          {p.numero_comprobante || p.numero_factura || '—'}
                        </TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: '0.8rem' }}>
                          {p.fecha_pago || 'Auto (día 10)'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, px: 3, justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={loading} color="inherit" sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!parsedData.isValid || loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
          sx={{
            bgcolor: '#4f46e5',
            '&:hover': { bgcolor: '#4338ca' },
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderRadius: 2
          }}
        >
          {loading
            ? 'Importando...'
            : isCursoMode
            ? `🚀 Importar ${parsedData.summary?.totalPagos || 0} Pagos del Curso`
            : `🚀 Enviar e Importar JSON`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalImportarJson;
