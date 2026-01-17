// components/pagos/ReportesPagos.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { ReporteMorosos } from './ReporteMorosos';
import { ReporteIngresos } from './ReporteIngresos';
import { EstadoCuentaEstudiantes } from './EstadoCuentaEstudiantes';

type TipoReporte = 'morosos' | 'ingresos' | 'estado_cuenta';

export const ReportesPagos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('estado_cuenta');

  return (
    <Box>
      {/* Selector de Reporte */}
      <Card
        sx={{
          borderRadius: '20px',
          background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <ToggleButtonGroup
            value={tipoReporte}
            exclusive
            onChange={(_, newValue) => newValue && setTipoReporte(newValue)}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                py: 2,
                border: 'none',
                '&.Mui-selected': {
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                  '&:hover': {
                    background: isDark
                      ? 'linear-gradient(135deg, #f59e0b 0%, #facc15 100%)'
                      : 'linear-gradient(135deg, #01579b 0%, #0288d1 100%)',
                  },
                },
              },
            }}
          >
            <ToggleButton value="estado_cuenta">
              <ReceiptIcon sx={{ mr: 1 }} />
              Estado de Cuenta
            </ToggleButton>
            <ToggleButton value="morosos">
              <WarningIcon sx={{ mr: 1 }} />
              Morosos
            </ToggleButton>
            <ToggleButton value="ingresos">
              <TrendingUpIcon sx={{ mr: 1 }} />
              Ingresos
            </ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {/* Contenido del Reporte */}
      {tipoReporte === 'estado_cuenta' && <EstadoCuentaEstudiantes />}
      {tipoReporte === 'morosos' && <ReporteMorosos />}
      {tipoReporte === 'ingresos' && <ReporteIngresos />}
    </Box>
  );
};