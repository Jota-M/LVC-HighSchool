'use client';
// app/dashboard/admin/backups/page.tsx

import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Chip, Fade, LinearProgress,
  Stack, CircularProgress, Tooltip, useTheme, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, IconButton, Collapse,
} from '@mui/material';
import { keyframes } from '@mui/system';

import StorageRoundedIcon         from '@mui/icons-material/StorageRounded';
import AddRoundedIcon             from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon         from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon        from '@mui/icons-material/DownloadRounded';
import RestoreRoundedIcon         from '@mui/icons-material/RestoreRounded';
import DeleteRoundedIcon          from '@mui/icons-material/DeleteRounded';
import CheckCircleRoundedIcon     from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon    from '@mui/icons-material/WarningAmberRounded';
import CloudRoundedIcon           from '@mui/icons-material/CloudRounded';
import HardwareRoundedIcon        from '@mui/icons-material/HardwareRounded';
import AccessTimeRoundedIcon      from '@mui/icons-material/AccessTimeRounded';
import SaveRoundedIcon            from '@mui/icons-material/SaveRounded';
import ShieldRoundedIcon          from '@mui/icons-material/ShieldRounded';
import PersonRoundedIcon          from '@mui/icons-material/PersonRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon  from '@mui/icons-material/KeyboardArrowUpRounded';
import InfoOutlinedIcon           from '@mui/icons-material/InfoOutlined';

import { useBackups }              from '@/hooks/useBackup';
import { Backup, BACKUP_STATUS_CONFIG } from '@/types/backupTypes';

// ── Animaciones ──────────────────────────────────────────────────────────────
const floatIcon = keyframes`
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%       { transform: translateY(-6px) rotate(2deg); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-BO', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon:   React.ReactElement<{ sx?: any }>;
  label:  string;
  value:  React.ReactNode;
  color:  string;
  isDark: boolean;
  delay?: number;
  sub?:   string;
}> = ({ icon, label, value, color, isDark, delay = 0, sub }) => (
  <Box sx={{
    flex: '1 1 160px',
    p: 2.5,
    borderRadius: '16px',
    border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
    bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
    boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
    animation: `${fadeUp} 0.35s ease-out ${delay}s both`,
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{
        width: 34, height: 34, borderRadius: '10px',
        bgcolor: alpha(color, 0.12),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 17, color } })}
      </Box>
      <Typography variant="caption" fontWeight={700}
        sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </Typography>
    </Box>
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ color, lineHeight: 1 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, mt: 0.4, display: 'block' }}>
          {sub}
        </Typography>
      )}
    </Box>
  </Box>
);

// ── Badge de estado ───────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: Backup['status'] }> = ({ status }) => {
  const cfg = BACKUP_STATUS_CONFIG.find(c => c.value === status);
  if (!cfg) return null;
  return (
    <Chip
      size="small"
      label={cfg.label}
      icon={status === 'completado'
        ? <CheckCircleRoundedIcon />
        : status === 'en_progreso'
        ? <CircularProgress size={10} sx={{ color: cfg.color + ' !important', animation: `${pulse} 1s infinite` }} />
        : <WarningAmberRoundedIcon />
      }
      sx={{
        fontSize: 11, height: 22,
        bgcolor: alpha(cfg.color, 0.1),
        color: cfg.color, fontWeight: 700,
        '& .MuiChip-icon': { fontSize: 12, color: `${cfg.color} !important` },
      }}
    />
  );
};

// ── Fila expandible con detalle ───────────────────────────────────────────────
const BackupRow: React.FC<{
  backup:        Backup;
  index:         number;
  accentColor:   string;
  isDark:        boolean;
  isSubmitting:  boolean;
  onDescargar:   (key: string) => void;
  onRestore:     (b: Backup) => void;
  onDelete:      (b: Backup) => void;
}> = ({ backup, index, accentColor, isDark, isSubmitting, onDescargar, onRestore, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        sx={{
          animation: `${fadeUp} 0.3s ease-out ${index * 0.05}s both`,
          '&:hover': { bgcolor: isDark ? alpha('#fff', 0.025) : alpha(accentColor, 0.025) },
          transition: 'background 0.15s',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Expandir */}
        <TableCell sx={{ width: 40, pr: 0 }}>
          <IconButton size="small" sx={{ color: 'text.disabled' }}>
            {open
              ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 16 }} />
              : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />
            }
          </IconButton>
        </TableCell>

        {/* Archivo */}
        <TableCell>
          <Typography variant="body2" fontWeight={700}
            sx={{ fontFamily: 'monospace', fontSize: 12, color: accentColor }}>
            {backup.filename}
          </Typography>
          {backup.ultima_restauracion_at && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
              <RestoreRoundedIcon sx={{ fontSize: 10, color: '#d97706' }} />
              <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600, fontSize: 10 }}>
                Restaurado {formatDateShort(backup.ultima_restauracion_at)}
              </Typography>
            </Box>
          )}
        </TableCell>

        {/* BD */}
        <TableCell>
          <Chip
            size="small"
            label={backup.database_name}
            icon={<StorageRoundedIcon />}
            sx={{
              fontSize: 11, height: 22, fontFamily: 'monospace',
              bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
              '& .MuiChip-icon': { fontSize: 12 },
            }}
          />
        </TableCell>

        {/* Fecha */}
        <TableCell>
          <Typography variant="caption"
            sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {formatDate(backup.created_at)}
          </Typography>
        </TableCell>

        {/* Tamaño */}
        <TableCell>
          <Typography variant="caption" fontWeight={700}
            sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.primary' }}>
            {backup.size_formatted}
          </Typography>
        </TableCell>

        {/* Estado */}
        <TableCell onClick={e => e.stopPropagation()}>
          <StatusBadge status={backup.status} />
        </TableCell>

        {/* Acciones */}
        <TableCell onClick={e => e.stopPropagation()}>
          <Stack direction="row" spacing={0.8}>
            <Tooltip title="Descargar .sql desde Cloudinary">
              <span>
                <IconButton
                  size="small"
                  disabled={backup.status !== 'completado' || isSubmitting}
                  onClick={() => onDescargar(backup.backup_key)}
                  sx={{
                    border: `1.5px solid ${alpha(accentColor, 0.3)}`,
                    borderRadius: '8px', color: accentColor,
                    '&:hover': { bgcolor: alpha(accentColor, 0.1) },
                    '&.Mui-disabled': { opacity: 0.35 },
                  }}
                >
                  <DownloadRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Restaurar base de datos desde este backup">
              <span>
                <IconButton
                  size="small"
                  disabled={backup.status !== 'completado' || isSubmitting}
                  onClick={() => onRestore(backup)}
                  sx={{
                    border: `1.5px solid ${alpha('#d97706', 0.3)}`,
                    borderRadius: '8px', color: '#d97706',
                    '&:hover': { bgcolor: alpha('#d97706', 0.1) },
                    '&.Mui-disabled': { opacity: 0.35 },
                  }}
                >
                  <RestoreRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Eliminar de Cloudinary">
              <span>
                <IconButton
                  size="small"
                  disabled={isSubmitting}
                  onClick={() => onDelete(backup)}
                  sx={{
                    border: `1.5px solid ${alpha('#dc2626', 0.3)}`,
                    borderRadius: '8px', color: '#dc2626',
                    '&:hover': { bgcolor: alpha('#dc2626', 0.1) },
                    '&.Mui-disabled': { opacity: 0.35 },
                  }}
                >
                  <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Fila de detalle expandible */}
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
          <Collapse in={open} timeout={220}>
            <Box sx={{
              mx: 2, my: 1.5, p: 2,
              borderRadius: '12px',
              bgcolor: isDark ? alpha('#fff', 0.02) : alpha(accentColor, 0.03),
              border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha(accentColor, 0.15)}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 13, color: accentColor }} />
                <Typography variant="caption" fontWeight={800}
                  sx={{ fontSize: 11, color: accentColor, letterSpacing: 0.5 }}>
                  DETALLE DEL BACKUP
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Backup key */}
                <Box>
                  <Typography variant="caption" color="text.disabled"
                    sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
                    Backup Key
                  </Typography>
                  <Typography variant="caption"
                    sx={{ fontFamily: 'monospace', fontSize: 11, color: accentColor }}>
                    {backup.backup_key}
                  </Typography>
                </Box>

                {/* Cloudinary */}
                <Box>
                  <Typography variant="caption" color="text.disabled"
                    sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
                    Almacenamiento
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <CloudRoundedIcon sx={{ fontSize: 12, color: '#2563eb' }} />
                    <Typography variant="caption" sx={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>
                      Cloudinary
                    </Typography>
                  </Box>
                </Box>

                {/* Creado por */}
                <Box>
                  <Typography variant="caption" color="text.disabled"
                    sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
                    Generado por
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <PersonRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ fontSize: 11, fontFamily: 'monospace' }}>
                      {backup.creado_por_username ?? `usuario #${backup.creado_por}`}
                    </Typography>
                  </Box>
                </Box>

                {/* Restaurado por */}
                {backup.ultima_restauracion_at && (
                  <Box>
                    <Typography variant="caption" color="text.disabled"
                      sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
                      Última restauración
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <RestoreRoundedIcon sx={{ fontSize: 12, color: '#d97706' }} />
                      <Typography variant="caption" sx={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>
                        {formatDate(backup.ultima_restauracion_at)}
                        {backup.restaurado_por_username && ` · ${backup.restaurado_por_username}`}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Tamaño exacto */}
                <Box>
                  <Typography variant="caption" color="text.disabled"
                    sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
                    Tamaño exacto
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 11, fontFamily: 'monospace' }}>
                    {backup.size_bytes.toLocaleString()} bytes
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ── Modal de confirmación ─────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open:         boolean;
  title:        string;
  description:  React.ReactNode;
  confirmLabel: string;
  confirmColor: 'error' | 'warning';
  loading:      boolean;
  onConfirm:    () => void;
  onClose:      () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, description, confirmLabel, confirmColor, loading, onConfirm, onClose,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color  = confirmColor === 'error' ? '#dc2626' : '#d97706';

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          bgcolor: isDark ? '#1a1f2e' : '#fff',
          maxWidth: 440, width: '100%',
        },
      }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '50%',
            bgcolor: alpha(color, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {confirmColor === 'error'
              ? <DeleteRoundedIcon sx={{ fontSize: 20, color }} />
              : <WarningAmberRoundedIcon sx={{ fontSize: 20, color }} />
            }
          </Box>
          <Typography fontWeight={800} sx={{ fontSize: 17 }}>{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText component="div"
          sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.7, mt: 0.5 }}>
          {description}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined"
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            borderRadius: '10px', textTransform: 'none', fontWeight: 700,
            bgcolor: color, '&:hover': { bgcolor: alpha(color, 0.85) }, minWidth: 120,
          }}
        >
          {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
export default function BackupsPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accentColor = isDark ? '#00e5a0' : '#0057d9';
  const gradBg      = `linear-gradient(135deg, ${accentColor} 0%, ${isDark ? '#00b4d8' : '#0096c7'} 100%)`;

  const {
    backups, stats, isLoading, isGenerating, isSubmitting,
    generar, descargar, restaurar, eliminar, refrescar,
  } = useBackups();

  const [confirmRestore, setConfirmRestore] = useState<Backup | null>(null);
  const [confirmDelete,  setConfirmDelete]  = useState<Backup | null>(null);

  const handleRestore = useCallback(async () => {
    if (!confirmRestore) return;
    const ok = await restaurar(confirmRestore.backup_key);
    if (ok) setConfirmRestore(null);
  }, [confirmRestore, restaurar]);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return;
    const ok = await eliminar(confirmDelete.backup_key);
    if (ok) setConfirmDelete(null);
  }, [confirmDelete, eliminar]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
            }}>
              {/* Título */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <StorageRoundedIcon sx={{
                  color: accentColor, fontSize: 36,
                  animation: `${floatIcon} 2.5s ease-in-out infinite`,
                }} />
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 800,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                  }}>
                    Gestión de Backups
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                    <Chip
                      size="small"
                      icon={<CloudRoundedIcon />}
                      label="Cloudinary · PostgreSQL"
                      sx={{
                        fontSize: 10, height: 20, fontWeight: 700,
                        background: gradBg, color: isDark ? '#000' : '#fff',
                        '& .MuiChip-icon': { color: isDark ? '#000 !important' : '#fff !important', fontSize: 11 },
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                      Respaldos automáticos de la base de datos
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Acciones */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Tooltip title="Actualizar lista">
                  <IconButton
                    onClick={refrescar}
                    disabled={isLoading}
                    sx={{
                      border: `1.5px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                      borderRadius: '10px',
                    }}
                  >
                    <RefreshRoundedIcon sx={{
                      fontSize: 20,
                      animation: isLoading ? `${spin} 1s linear infinite` : 'none',
                    }} />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  startIcon={isGenerating
                    ? <CircularProgress size={15} sx={{ color: '#fff' }} />
                    : <AddRoundedIcon />
                  }
                  onClick={generar}
                  disabled={isGenerating}
                  sx={{
                    borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                    background: gradBg, px: 2.5, py: 1.1,
                    '&:hover': { opacity: 0.88, background: gradBg },
                    '&.Mui-disabled': { opacity: 0.5 },
                  }}
                >
                  {isGenerating ? 'Generando...' : 'Nuevo Backup'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ══ STATS ══ */}
        <Fade in timeout={450}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            <StatCard
              icon={<SaveRoundedIcon />}
              label="Total backups"
              value={stats.total}
              color={accentColor}
              isDark={isDark}
              delay={0}
              sub="registros en BD"
            />
            <StatCard
              icon={<ShieldRoundedIcon />}
              label="Completados"
              value={stats.disponibles}
              color="#16a34a"
              isDark={isDark}
              delay={0.05}
              sub="listos para restaurar"
            />
            <StatCard
              icon={<AccessTimeRoundedIcon />}
              label="Último backup"
              value={
                <Typography fontWeight={700} sx={{ fontSize: 13, color: 'text.primary', mt: 0.3 }}>
                  {stats.ultimoBackup ? formatDate(stats.ultimoBackup) : '—'}
                </Typography>
              }
              color="#2563eb"
              isDark={isDark}
              delay={0.1}
            />
            <StatCard
              icon={<HardwareRoundedIcon />}
              label="Espacio en Cloudinary"
              value={
                <Typography fontWeight={700} sx={{ fontSize: 20, color: accentColor }}>
                  {stats.espacioFormateado}
                </Typography>
              }
              color={accentColor}
              isDark={isDark}
              delay={0.15}
              sub="total acumulado"
            />
          </Box>
        </Fade>

        {/* ══ TABLA ══ */}
        <Fade in timeout={500}>
          <Box sx={{ animation: `${fadeUp} 0.3s ease-out 0.2s both` }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                overflow: 'hidden',
              }}
            >
              {/* Cabecera de la tabla */}
              <Box sx={{
                px: 3, py: 2,
                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.8),
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StorageRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  <Typography variant="subtitle2" fontWeight={800}>Historial de Backups</Typography>
                  {backups.length > 0 && (
                    <Chip
                      label={`${backups.length} registros`}
                      size="small"
                      sx={{
                        fontSize: 10, height: 19,
                        bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700,
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                  Clic en una fila para ver el detalle
                </Typography>
              </Box>

              {isLoading && <LinearProgress sx={{ height: 2 }} />}

              <Table>
                <TableHead>
                  <TableRow>
                    {['', 'Archivo', 'Base de datos', 'Generado', 'Tamaño', 'Estado', 'Acciones'].map((col, i) => (
                      <TableCell key={i} sx={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: 0.8, color: 'text.disabled', py: 1.5,
                        bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
                      }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {/* Empty state */}
                  {!isLoading && backups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 10 }}>
                        <StorageRoundedIcon sx={{
                          fontSize: 52, color: alpha(accentColor, 0.15),
                          mb: 2, display: 'block', mx: 'auto',
                        }} />
                        <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
                          No hay backups disponibles
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2 }}>
                          Generá el primero con el botón "Nuevo Backup"
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddRoundedIcon />}
                          onClick={generar}
                          disabled={isGenerating}
                          sx={{
                            borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                            borderColor: accentColor, color: accentColor,
                            '&:hover': { bgcolor: alpha(accentColor, 0.08) },
                          }}
                        >
                          Generar primer backup
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Rows */}
                  {backups.map((backup, index) => (
                    <BackupRow
                      key={backup.backup_key}
                      backup={backup}
                      index={index}
                      accentColor={accentColor}
                      isDark={isDark}
                      isSubmitting={isSubmitting}
                      onDescargar={descargar}
                      onRestore={setConfirmRestore}
                      onDelete={setConfirmDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Fade>

      </Container>

      {/* ══ MODAL RESTAURAR ══ */}
      <ConfirmDialog
        open={!!confirmRestore}
        title="¿Restaurar base de datos?"
        description={
          <Box>
            <Typography sx={{ mb: 1.5, fontSize: 14, color: 'text.secondary', lineHeight: 1.7 }}>
              Esta acción es <strong>irreversible</strong>. Se eliminarán <strong>todos los datos actuales</strong> y
              se reemplazarán por el contenido del backup:
            </Typography>
            <Box sx={{
              p: 1.5, borderRadius: '10px',
              bgcolor: alpha('#d97706', 0.07),
              border: `1px solid ${alpha('#d97706', 0.25)}`,
            }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#d97706', fontWeight: 700, wordBreak: 'break-all' }}>
                {confirmRestore?.filename}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                Generado: {formatDate(confirmRestore?.created_at)}
              </Typography>
            </Box>
          </Box>
        }
        confirmLabel="Sí, restaurar"
        confirmColor="warning"
        loading={isSubmitting}
        onConfirm={handleRestore}
        onClose={() => !isSubmitting && setConfirmRestore(null)}
      />

      {/* ══ MODAL ELIMINAR ══ */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="¿Eliminar backup?"
        description={
          <Box>
            <Typography sx={{ mb: 1.5, fontSize: 14, color: 'text.secondary', lineHeight: 1.7 }}>
              Se eliminará el archivo de <strong>Cloudinary</strong> permanentemente.
              El registro quedará en la base de datos para auditoría.
            </Typography>
            <Box sx={{
              p: 1.5, borderRadius: '10px',
              bgcolor: alpha('#dc2626', 0.06),
              border: `1px solid ${alpha('#dc2626', 0.2)}`,
            }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#dc2626', fontWeight: 700, wordBreak: 'break-all' }}>
                {confirmDelete?.filename}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                {confirmDelete?.size_formatted} · {formatDate(confirmDelete?.created_at)}
              </Typography>
            </Box>
          </Box>
        }
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isSubmitting}
        onConfirm={handleDelete}
        onClose={() => !isSubmitting && setConfirmDelete(null)}
      />
    </Box>
  );
}