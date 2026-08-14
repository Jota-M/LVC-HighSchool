// components/shared/CIScanner.tsx
'use client';
import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  DocumentScanner as ScannerIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { ocrService, CIData, OCRResult } from '@/services/ocrService';

export interface CIScannerProps {
  /** Callback con los datos extraídos cuando la lectura fue exitosa */
  onDatosExtraidos: (datos: CIData) => void;
  /** Texto del botón (por defecto "Escanear Cédula") */
  label?: string;
}

type Estado = 'idle' | 'loading' | 'success' | 'error';

export const CIScanner: React.FC<CIScannerProps> = ({
  onDatosExtraidos,
  label = 'Escanear Cédula',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const inputRef = useRef<HTMLInputElement>(null);

  const [estado, setEstado] = useState<Estado>('idle');
  const [mensaje, setMensaje] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [confianza, setConfianza] = useState<CIData['confianza'] | null>(null);
  const [fuente, setFuente] = useState<OCRResult['fuente'] | null>(null);

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentBg = isDark ? 'rgba(250, 204, 21, 0.08)' : 'rgba(2, 136, 209, 0.08)';
  const accentBorder = isDark ? 'rgba(250, 204, 21, 0.35)' : 'rgba(2, 136, 209, 0.35)';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mostrar preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setEstado('loading');
    setMensaje('');
    setConfianza(null);
    setFuente(null);

    try {
      const result = await ocrService.escanearCedula(file);

      if (!result.success || !result.datos) {
        setEstado('error');
        setMensaje(result.message || 'No se pudo leer la cédula. Intenta con una imagen más clara.');
        return;
      }

      setConfianza(result.datos.confianza);
      setFuente(result.fuente ?? null);
      onDatosExtraidos(result.datos);
      setEstado('success');
      const modo =
        result.fuente === 'gemini'
          ? 'Lectura con IA (usa tokens).'
          : 'Lectura local gratuita.';
      setMensaje(
        result.datos.confianza === 'baja'
          ? `${modo} Datos con baja confianza — verifica los campos.`
          : `${modo} Revisa y corrige si hace falta.`
      );
    } catch (error) {
      setEstado('error');
      if (axios.isAxiosError(error) && !error.response) {
        setMensaje('Error de conexión. Verifica que el servidor esté activo.');
      } else {
        setMensaje('No se pudo completar la lectura. Intenta otra foto.');
      }
    } finally {
      // Reset input para poder subir la misma imagen de nuevo si es necesario
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const reset = () => {
    setEstado('idle');
    setMensaje('');
    setPreview(null);
    setConfianza(null);
    setFuente(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const confianzaColor: Record<NonNullable<typeof confianza>, 'success' | 'warning' | 'error'> = {
    alta: 'success',
    media: 'warning',
    baja: 'error',
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: '16px',
        border: '1.5px dashed',
        borderColor:
          estado === 'success'
            ? 'success.main'
            : estado === 'error'
            ? 'error.main'
            : accentBorder,
        background:
          estado === 'success'
            ? isDark
              ? 'rgba(16, 185, 129, 0.08)'
              : 'rgba(16, 185, 129, 0.06)'
            : estado === 'error'
            ? isDark
              ? 'rgba(239, 68, 68, 0.08)'
              : 'rgba(239, 68, 68, 0.06)'
            : accentBg,
        transition: 'all 0.3s ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {/* Ícono */}
        <ScannerIcon
          sx={{
            fontSize: 28,
            color:
              estado === 'success'
                ? 'success.main'
                : estado === 'error'
                ? 'error.main'
                : accentColor,
            transition: 'color 0.3s',
          }}
        />

        {/* Texto */}
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ color: isDark ? '#fff' : '#1e293b' }}
          >
            Autocompletar desde Cédula de Identidad
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Sube foto del dorso (o frente+dorso). Los campos se completan con IA; revisa antes de guardar.
          </Typography>
        </Box>

        {/* Preview miniatura */}
        {preview && (
          <Tooltip title="Imagen subida">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid',
                borderColor: accentColor,
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview CI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          </Tooltip>
        )}

        {/* Botón principal */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {estado !== 'loading' && (
            <Button
              component="label"
              variant={estado === 'success' ? 'outlined' : 'contained'}
              size="small"
              startIcon={estado === 'success' ? <ImageIcon /> : <ScannerIcon />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                background:
                  estado === 'success'
                    ? 'transparent'
                    : `linear-gradient(135deg, ${accentColor} 0%, ${isDark ? '#eab308' : '#0277bd'} 100%)`,
                color: estado === 'success' ? accentColor : isDark ? '#000' : '#fff',
                borderColor: estado === 'success' ? accentColor : undefined,
                '&:hover': {
                  background:
                    estado === 'success'
                      ? accentBg
                      : `linear-gradient(135deg, ${isDark ? '#eab308' : '#0277bd'} 0%, ${accentColor} 100%)`,
                },
              }}
            >
              {estado === 'success' ? 'Volver a escanear' : label}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          )}

          {estado === 'loading' && (
            <Button
              variant="contained"
              size="small"
              disabled
              startIcon={<CircularProgress size={14} color="inherit" />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
              }}
            >
              Leyendo CI...
            </Button>
          )}

          {/* Botón reset */}
          {(estado === 'success' || estado === 'error') && (
            <Tooltip title="Cancelar">
              <Button
                variant="text"
                size="small"
                onClick={reset}
                sx={{ minWidth: 32, px: 1, borderRadius: '8px' }}
              >
                <CloseIcon fontSize="small" />
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Mensaje de resultado */}
      {mensaje && (
        <Alert
          severity={estado === 'success' ? (confianza === 'baja' ? 'warning' : 'success') : 'error'}
          icon={
            estado === 'success' ? (
              confianza === 'baja' ? (
                <WarningIcon fontSize="small" />
              ) : (
                <CheckIcon fontSize="small" />
              )
            ) : undefined
          }
          sx={{ mt: 1.5, borderRadius: '10px', py: 0.5 }}
          action={
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {fuente && (
                <Chip
                  label={fuente === 'local' ? 'OCR gratis' : 'Gemini'}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.65rem' }}
                />
              )}
              {confianza ? (
                <Chip
                  label={`Confianza: ${confianza}`}
                  size="small"
                  color={confianzaColor[confianza]}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ) : null}
            </Box>
          }
        >
          <Typography variant="caption">{mensaje}</Typography>
        </Alert>
      )}
    </Paper>
  );
};
