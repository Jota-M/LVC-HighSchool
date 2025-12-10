// components/preinscripcion/revision/DocumentoCard.tsx
'use client';
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: 3,
        borderRadius: 3,
        backgroundColor: disponible
          ? theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : theme.palette.grey[50]
          : theme.palette.mode === 'dark'
          ? theme.palette.error.dark + '15'
          : theme.palette.error.light + '20',
        border: `2px solid ${
          disponible
            ? theme.palette.divider
            : theme.palette.error.main + '40'
        }`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: disponible ? 'translateX(8px)' : 'none',
          boxShadow: disponible
            ? theme.palette.mode === 'dark'
              ? '0 8px 20px rgba(0,0,0,0.5)'
              : '0 8px 20px rgba(0,0,0,0.1)'
            : 'none',
        },
      })}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <Box
            sx={(theme) => ({
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: disponible
                ? theme.palette.mode === 'dark'
                  ? theme.palette.success.main + '25'
                  : theme.palette.success.light + '30'
                : theme.palette.mode === 'dark'
                ? theme.palette.error.main + '25'
                : theme.palette.error.light + '30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            })}
          >
            {icon}
          </Box>

          <Box flex={1}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              {nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {archivo}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {disponible ? (
            <>
              <IconButton
                onClick={onVer}
                sx={(theme) => ({
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.info.main + '20'
                        : theme.palette.info.light + '30',
                    borderColor: theme.palette.info.main,
                    color: theme.palette.info.main,
                  },
                })}
              >
                <VisibilityIcon />
              </IconButton>

              {onAprobar && (
                <IconButton
                  onClick={onAprobar}
                  sx={(theme) => ({
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    color: '#fff',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                    },
                  })}
                >
                  <CheckCircleIcon />
                </IconButton>
              )}

              {onRechazar && (
                <IconButton
                  onClick={onRechazar}
                  sx={(theme) => ({
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? theme.palette.error.main + '20'
                          : theme.palette.error.light + '30',
                      borderColor: theme.palette.error.main,
                      color: theme.palette.error.main,
                    },
                  })}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </>
          ) : (
            <Chip
              label="Faltante"
              size="small"
              color="error"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}