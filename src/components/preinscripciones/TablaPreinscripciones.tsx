// src/components/preinscripciones/TablaPreinscripciones.tsx
'use client';

import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Preinscripcion } from '@/types/preinscripcionTypes';
import { useRouter } from 'next/navigation';

interface TablaPreinscripcionesProps {
  preinscripciones: Preinscripcion[];
  onRevisar: (id: number) => void;
  onEliminar: (id: number) => void;
  onPromover?: (id: number) => void;
}

const getEstadoConfig = (estado: string) => {
  const configs: Record<string, { label: string; color: string; bg: string }> = {
    iniciada: { label: 'Iniciada', color: '#757575', bg: 'rgba(117,117,117,0.12)' },
    datos_completos: { label: 'Datos Completos', color: '#2196f3', bg: 'rgba(33,150,243,0.12)' },
    documentos_pendientes: { label: 'Docs Pendientes', color: '#ff9800', bg: 'rgba(255,152,0,0.12)' },
    en_revision: { label: 'En Revisión', color: '#9c27b0', bg: 'rgba(156,39,176,0.12)' },
    documentos_aprobados: { label: 'Docs Aprobados', color: '#00bcd4', bg: 'rgba(0,188,212,0.12)' },
    aprobada: { label: 'Aprobada', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    rechazada: { label: 'Rechazada', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    convertida: { label: 'Convertida', color: '#8bc34a', bg: 'rgba(139,195,74,0.12)' },
    en_espera: { label: 'En Espera', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  };
  return configs[estado?.toLowerCase()] || configs.iniciada;
};

const getInitials = (nombre: string) => {
  if (!nombre) return '?';
  const parts = nombre.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return nombre.substring(0, 2).toUpperCase();
};

export const TablaPreinscripciones: React.FC<TablaPreinscripcionesProps> = ({
  preinscripciones,
  onRevisar,
  onEliminar,
  onPromover,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const accent = isDark ? '#facc15' : '#0288d1';

  const handleOpenWhatsApp = (telefono?: string, estudiante?: string) => {
    if (!telefono) return;
    const cleanNum = telefono.replace(/\D/g, '');
    const num = cleanNum.startsWith('591') ? cleanNum : `591${cleanNum}`;
    const msg = encodeURIComponent(
      `Estimado padre/tutor de ${estudiante || 'el postulante'}, nos comunicamos desde la Unidad Educativa Privada La Voz de Cristo respecto a su solicitud de preinscripción.`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: '18px',
        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        overflow: 'hidden',
      }}
    >
      <Table sx={{ minWidth: 750 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.02) }}>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Código / Postulante</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Grado & Turno</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Tutor & Contacto</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Cupo</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Fecha</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, py: 2 }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {preinscripciones.map((p) => {
            const st = getEstadoConfig(p.estado);
            const initials = getInitials(p.estudiante_nombre || '');
            const esEnEspera = p.estado?.toLowerCase() === 'en_espera';
            const puedeConvertir = p.estado?.toLowerCase() === 'aprobada' && p.tiene_cupo_asignado;

            return (
              <TableRow
                key={p.id}
                hover
                sx={{
                  transition: 'background-color 0.2s ease',
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                {/* Estudiante & Código */}
                <TableCell sx={{ py: 1.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={p.estudiante_foto || undefined}
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: alpha(accent, 0.15),
                        color: accent,
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        border: `1px solid ${alpha(accent, 0.3)}`,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        {p.estudiante_nombre}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: accent, fontWeight: 700 }}>
                          {p.codigo_inscripcion || `PRE-${p.id}`}
                        </Typography>
                        {p.estudiante_ci && (
                          <Typography variant="caption" color="text.secondary">
                            • CI: {p.estudiante_ci}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>

                {/* Grado & Turno */}
                <TableCell sx={{ py: 1.8 }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {p.grado_nombre || p.grado_solicitado?.replace(/_/g, ' ') || 'Sin especificar'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Turno: {p.turno_nombre || 'No asignado'}
                  </Typography>
                </TableCell>

                {/* Tutor & Teléfono */}
                <TableCell sx={{ py: 1.8 }}>
                  <Typography variant="body2" color="text.primary" fontWeight={500}>
                    {p.tutor_nombre || 'Sin tutor asignado'}
                  </Typography>
                  {p.tutor_telefono ? (
                    <Box
                      component="span"
                      onClick={() => handleOpenWhatsApp(p.tutor_telefono, p.estudiante_nombre)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        color: '#25D366',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        mt: 0.3,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      <WhatsAppIcon sx={{ fontSize: 15 }} />
                      {p.tutor_telefono}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Sin teléfono
                    </Typography>
                  )}
                </TableCell>

                {/* Estado */}
                <TableCell sx={{ py: 1.8 }}>
                  <Chip
                    size="small"
                    label={st.label}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      color: st.color,
                      bgcolor: st.bg,
                      border: `1px solid ${alpha(st.color, 0.3)}`,
                    }}
                  />
                </TableCell>

                {/* Cupo */}
                <TableCell sx={{ py: 1.8 }}>
                  {p.tiene_cupo_asignado ? (
                    <Chip
                      size="small"
                      icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
                      label="Asignado"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: alpha('#10b981', 0.1),
                        color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.3)',
                      }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      icon={<HourglassEmptyIcon sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
                      label={esEnEspera ? 'En Espera' : 'Sin Cupo'}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: alpha('#f59e0b', 0.1),
                        color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.3)',
                      }}
                    />
                  )}
                </TableCell>

                {/* Fecha y Hora de Registro */}
                <TableCell sx={{ py: 1.8 }}>
                  {p.created_at ? (
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.primary" display="block">
                        {new Date(p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem' }}>
                        {new Date(p.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">—</Typography>
                  )}
                </TableCell>

                {/* Acciones */}
                <TableCell align="center" sx={{ py: 1.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
                    {esEnEspera && onPromover && (
                      <Tooltip title="Promover de lista de espera a cupo directo">
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<HowToRegIcon sx={{ fontSize: 16 }} />}
                          onClick={() => onPromover(p.id)}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 0.4,
                            px: 1.2,
                            fontSize: '0.75rem',
                          }}
                        >
                          Promover
                        </Button>
                      </Tooltip>
                    )}

                    {puedeConvertir && (
                      <Tooltip title="Matricular como Estudiante Oficial">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/dashboard/preinscripciones/convertir/${p.id}`)}
                          sx={{
                            border: '1px solid rgba(139,195,74,0.4)',
                            color: '#8bc34a',
                            borderRadius: '10px',
                            '&:hover': { bgcolor: '#8bc34a', color: '#fff' },
                          }}
                        >
                          <PersonAddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Ver expediente y revisar">
                      <IconButton
                        size="small"
                        onClick={() => onRevisar(p.id)}
                        sx={{
                          border: `1px solid ${alpha(accent, 0.4)}`,
                          color: accent,
                          borderRadius: '10px',
                          '&:hover': { bgcolor: accent, color: isDark ? '#000' : '#fff' },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar registro">
                      <IconButton
                        size="small"
                        onClick={() => onEliminar(p.id)}
                        sx={{
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#ef4444',
                          borderRadius: '10px',
                          '&:hover': { bgcolor: '#ef4444', color: '#fff' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
