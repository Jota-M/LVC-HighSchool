// components/preinscripcion/revision/DocumentoCard.tsx
'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

interface DocumentoCardProps {
  nombre: string;
  archivo: string;
  disponible: boolean;
  icon: string;
  onVer: () => void;
  onAprobar?: () => void;
  onRechazar?: () => void;
}

export default function DocumentoCard({
  nombre,
  archivo,
  disponible,
  icon,
  onVer,
  onAprobar,
  onRechazar,
}: DocumentoCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        bgcolor: isDark
          ? alpha(theme.palette.background.paper, 0.6)
          : disponible
          ? '#ffffff'
          : alpha('#ef4444', 0.03),
        border: `1px solid ${
          disponible
            ? alpha(accent, 0.18)
            : alpha('#ef4444', 0.25)
        }`,
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: disponible ? accent : alpha('#ef4444', 0.4),
          transform: 'translateY(-2px)',
          boxShadow: disponible
            ? `0 8px 20px ${alpha(accent, 0.12)}`
            : '0 8px 20px rgba(239, 68, 68, 0.1)',
        },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '12px',
              bgcolor: disponible
                ? alpha(accent, 0.12)
                : alpha('#ef4444', 0.12),
              border: `1px solid ${disponible ? alpha(accent, 0.3) : alpha('#ef4444', 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            {icon}
          </Box>

          <Box flex={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }} color="text.primary">
              {nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {archivo}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {disponible ? (
            <>
              <Chip
                label="Adjunto"
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  bgcolor: alpha('#10b981', 0.15),
                  color: '#10b981',
                  border: `1px solid ${alpha('#10b981', 0.3)}`,
                }}
              />

              <Tooltip title="Visualizar documento">
                <IconButton
                  onClick={onVer}
                  sx={{
                    borderRadius: '10px',
                    border: `1px solid ${alpha(accent, 0.3)}`,
                    color: accent,
                    backgroundColor: alpha(accent, 0.08),
                    '&:hover': {
                      backgroundColor: alpha(accent, 0.2),
                      borderColor: accent,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {onAprobar && (
                <Tooltip title="Aprobar documento">
                  <IconButton
                    onClick={onAprobar}
                    sx={{
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onRechazar && (
                <Tooltip title="Observar documento">
                  <IconButton
                    onClick={onRechazar}
                    sx={{
                      borderRadius: '10px',
                      border: `1px solid ${alpha('#ef4444', 0.3)}`,
                      color: '#ef4444',
                      backgroundColor: alpha('#ef4444', 0.08),
                      '&:hover': {
                        backgroundColor: alpha('#ef4444', 0.18),
                        borderColor: '#ef4444',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          ) : (
            <Chip
              label="Faltante"
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '8px',
                bgcolor: alpha('#ef4444', 0.15),
                color: '#ef4444',
                border: `1px solid ${alpha('#ef4444', 0.3)}`,
              }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}