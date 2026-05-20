// components/ingresos/ConfiguracionIngresos.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';

export const ConfiguracionIngresos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [config, setConfig] = useState({
    // General
    requiere_verificacion: true,
    permite_edicion: false,
    dias_para_editar: 7,
    
    // Facturación
    genera_factura_automatica: false,
    nit_empresa: '',
    razon_social: '',
    
    // Notificaciones
    notifica_ingreso_registrado: true,
    notifica_ingreso_verificado: false,
    email_notificaciones: '',
    
    // Reportes
    incluir_anulados_en_reportes: false,
    formato_exportacion: 'pdf',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'dias_para_editar' ? parseInt(value) || 0 : value,
    }));
  };

  const handleGuardar = () => {
    alert('Configuración guardada exitosamente');
  };

  const handleReset = () => {
    if (confirm('¿Está seguro de restablecer la configuración por defecto?')) {
      // Restablecer valores
      alert('Configuración restablecida');
    }
  };

  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  return (
    <Box>
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(yellowColor, 0.1)} 0%, ${alpha(yellowColor, 0.02)} 100%)`,
          border: `1px solid ${alpha(yellowColor, 0.2)}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SettingsIcon sx={{ color: yellowColor, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Configuración del Módulo
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ResetIcon />}
                onClick={handleReset}
                sx={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                Restablecer
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleGuardar}
                sx={{
                  background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                  color: '#000',
                  fontWeight: 600,
                }}
              >
                Guardar Cambios
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Configuración General */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Configuración General
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.requiere_verificacion}
                      onChange={handleChange}
                      name="requiere_verificacion"
                      color="primary"
                    />
                  }
                  label="Requiere verificación de ingresos"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                  Los ingresos deben ser verificados antes de centralizarse
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.permite_edicion}
                      onChange={handleChange}
                      name="permite_edicion"
                      color="primary"
                    />
                  }
                  label="Permite edición de ingresos"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                  Los ingresos pueden ser editados dentro del período permitido
                </Typography>
              </Box>

              {config.permite_edicion && (
                <Box sx={{ mb: 3, ml: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Días permitidos para editar"
                    name="dias_para_editar"
                    type="number"
                    value={config.dias_para_editar}
                    onChange={handleChange}
                    helperText="Número de días desde el registro"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Facturación */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Facturación
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.genera_factura_automatica}
                      onChange={handleChange}
                      name="genera_factura_automatica"
                      color="primary"
                    />
                  }
                  label="Generar facturas automáticamente"
                />
              </Box>

              {config.genera_factura_automatica && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="NIT de la Empresa"
                      name="nit_empresa"
                      value={config.nit_empresa}
                      onChange={handleChange}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Razón Social"
                      name="razon_social"
                      value={config.razon_social}
                      onChange={handleChange}
                    />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notificaciones */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Notificaciones
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notifica_ingreso_registrado}
                      onChange={handleChange}
                      name="notifica_ingreso_registrado"
                      color="primary"
                    />
                  }
                  label="Notificar cuando se registra un ingreso"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notifica_ingreso_verificado}
                      onChange={handleChange}
                      name="notifica_ingreso_verificado"
                      color="primary"
                    />
                  }
                  label="Notificar cuando se verifica un ingreso"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email para notificaciones"
                  name="email_notificaciones"
                  type="email"
                  value={config.email_notificaciones}
                  onChange={handleChange}
                  helperText="Email donde se enviarán las notificaciones"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Reportes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Reportes
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.incluir_anulados_en_reportes}
                      onChange={handleChange}
                      name="incluir_anulados_en_reportes"
                      color="primary"
                    />
                  }
                  label="Incluir ingresos anulados en reportes"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Formato de exportación por defecto"
                  name="formato_exportacion"
                  value={config.formato_exportacion}
                  onChange={handleChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </TextField>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Información del Sistema */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Información del Sistema
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Versión del Módulo:</strong> 1.0.0
                </Typography>
                <Typography variant="body2">
                  <strong>Última Actualización:</strong> {new Date().toLocaleDateString('es-BO')}
                </Typography>
              </Alert>

              <Alert severity="warning">
                <Typography variant="body2">
                  Los cambios en la configuración afectarán el comportamiento del módulo de ingresos.
                  Asegúrese de entender cada opción antes de modificarla.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConfiguracionIngresos;