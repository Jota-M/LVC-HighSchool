// 'use client';
// // app/dashboard/admin/backups/page.tsx

// import React, { useState, useCallback } from 'react';
// import {
//   Box, Container, Typography, Chip, Fade, LinearProgress,
//   Stack, CircularProgress, Tooltip, useTheme, alpha,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
//   DialogActions, IconButton, Collapse,
// } from '@mui/material';
// import { keyframes } from '@mui/system';

// import StorageRoundedIcon         from '@mui/icons-material/StorageRounded';
// import AddRoundedIcon             from '@mui/icons-material/AddRounded';
// import RefreshRoundedIcon         from '@mui/icons-material/RefreshRounded';
// import DownloadRoundedIcon        from '@mui/icons-material/DownloadRounded';
// import RestoreRoundedIcon         from '@mui/icons-material/RestoreRounded';
// import DeleteRoundedIcon          from '@mui/icons-material/DeleteRounded';
// import CheckCircleRoundedIcon     from '@mui/icons-material/CheckCircleRounded';
// import WarningAmberRoundedIcon    from '@mui/icons-material/WarningAmberRounded';
// import CloudRoundedIcon           from '@mui/icons-material/CloudRounded';
// import HardwareRoundedIcon        from '@mui/icons-material/HardwareRounded';
// import AccessTimeRoundedIcon      from '@mui/icons-material/AccessTimeRounded';
// import SaveRoundedIcon            from '@mui/icons-material/SaveRounded';
// import ShieldRoundedIcon          from '@mui/icons-material/ShieldRounded';
// import PersonRoundedIcon          from '@mui/icons-material/PersonRounded';
// import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
// import KeyboardArrowUpRoundedIcon  from '@mui/icons-material/KeyboardArrowUpRounded';
// import InfoOutlinedIcon           from '@mui/icons-material/InfoOutlined';

// import { useBackups }              from '@/hooks/useBackup';
// import { Backup, BACKUP_STATUS_CONFIG } from '@/types/backupTypes';

// // ── Animaciones ──────────────────────────────────────────────────────────────
// const floatIcon = keyframes`
//   0%, 100% { transform: translateY(0) rotate(-2deg); }
//   50%       { transform: translateY(-6px) rotate(2deg); }
// `;
// const fadeUp = keyframes`
//   from { opacity: 0; transform: translateY(10px); }
//   to   { opacity: 1; transform: translateY(0); }
// `;
// const spin = keyframes`
//   to { transform: rotate(360deg); }
// `;
// const pulse = keyframes`
//   0%, 100% { opacity: 1; }
//   50%       { opacity: 0.5; }
// `;

// // ── Helpers ───────────────────────────────────────────────────────────────────
// function formatDate(iso: string | null | undefined): string {
//   if (!iso) return '—';
//   return new Intl.DateTimeFormat('es-BO', {
//     day:    '2-digit',
//     month:  'short',
//     year:   'numeric',
//     hour:   '2-digit',
//     minute: '2-digit',
//   }).format(new Date(iso));
// }

// function formatDateShort(iso: string | null | undefined): string {
//   if (!iso) return '—';
//   return new Intl.DateTimeFormat('es-BO', {
//     day: '2-digit', month: 'short', year: 'numeric',
//   }).format(new Date(iso));
// }

// // ── Stat Card ─────────────────────────────────────────────────────────────────
// const StatCard: React.FC<{
//   icon:   React.ReactElement<{ sx?: any }>;
//   label:  string;
//   value:  React.ReactNode;
//   color:  string;
//   isDark: boolean;
//   delay?: number;
//   sub?:   string;
// }> = ({ icon, label, value, color, isDark, delay = 0, sub }) => (
//   <Box sx={{
//     flex: '1 1 160px',
//     p: 2.5,
//     borderRadius: '16px',
//     border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
//     bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
//     boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
//     animation: `${fadeUp} 0.35s ease-out ${delay}s both`,
//   }}>
//     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
//       <Box sx={{
//         width: 34, height: 34, borderRadius: '10px',
//         bgcolor: alpha(color, 0.12),
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//       }}>
//         {React.cloneElement(icon, { sx: { fontSize: 17, color } })}
//       </Box>
//       <Typography variant="caption" fontWeight={700}
//         sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.6 }}>
//         {label}
//       </Typography>
//     </Box>
//     <Box>
//       <Typography variant="h5" fontWeight={800} sx={{ color, lineHeight: 1 }}>
//         {value}
//       </Typography>
//       {sub && (
//         <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, mt: 0.4, display: 'block' }}>
//           {sub}
//         </Typography>
//       )}
//     </Box>
//   </Box>
// );

// // ── Badge de estado ───────────────────────────────────────────────────────────
// const StatusBadge: React.FC<{ status: Backup['status'] }> = ({ status }) => {
//   const cfg = BACKUP_STATUS_CONFIG.find(c => c.value === status);
//   if (!cfg) return null;
//   return (
//     <Chip
//       size="small"
//       label={cfg.label}
//       icon={status === 'completado'
//         ? <CheckCircleRoundedIcon />
//         : status === 'en_progreso'
//         ? <CircularProgress size={10} sx={{ color: cfg.color + ' !important', animation: `${pulse} 1s infinite` }} />
//         : <WarningAmberRoundedIcon />
//       }
//       sx={{
//         fontSize: 11, height: 22,
//         bgcolor: alpha(cfg.color, 0.1),
//         color: cfg.color, fontWeight: 700,
//         '& .MuiChip-icon': { fontSize: 12, color: `${cfg.color} !important` },
//       }}
//     />
//   );
// };

// // ── Fila expandible con detalle ───────────────────────────────────────────────
// const BackupRow: React.FC<{
//   backup:        Backup;
//   index:         number;
//   accentColor:   string;
//   isDark:        boolean;
//   isSubmitting:  boolean;
//   onDescargar:   (key: string) => void;
//   onRestore:     (b: Backup) => void;
//   onDelete:      (b: Backup) => void;
// }> = ({ backup, index, accentColor, isDark, isSubmitting, onDescargar, onRestore, onDelete }) => {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <TableRow
//         sx={{
//           animation: `${fadeUp} 0.3s ease-out ${index * 0.05}s both`,
//           '&:hover': { bgcolor: isDark ? alpha('#fff', 0.025) : alpha(accentColor, 0.025) },
//           transition: 'background 0.15s',
//           cursor: 'pointer',
//         }}
//         onClick={() => setOpen(o => !o)}
//       >
//         {/* Expandir */}
//         <TableCell sx={{ width: 40, pr: 0 }}>
//           <IconButton size="small" sx={{ color: 'text.disabled' }}>
//             {open
//               ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 16 }} />
//               : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />
//             }
//           </IconButton>
//         </TableCell>

//         {/* Archivo */}
//         <TableCell>
//           <Typography variant="body2" fontWeight={700}
//             sx={{ fontFamily: 'monospace', fontSize: 12, color: accentColor }}>
//             {backup.filename}
//           </Typography>
//           {backup.ultima_restauracion_at && (
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
//               <RestoreRoundedIcon sx={{ fontSize: 10, color: '#d97706' }} />
//               <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600, fontSize: 10 }}>
//                 Restaurado {formatDateShort(backup.ultima_restauracion_at)}
//               </Typography>
//             </Box>
//           )}
//         </TableCell>

//         {/* BD */}
//         <TableCell>
//           <Chip
//             size="small"
//             label={backup.database_name}
//             icon={<StorageRoundedIcon />}
//             sx={{
//               fontSize: 11, height: 22, fontFamily: 'monospace',
//               bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
//               '& .MuiChip-icon': { fontSize: 12 },
//             }}
//           />
//         </TableCell>

//         {/* Fecha */}
//         <TableCell>
//           <Typography variant="caption"
//             sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
//             {formatDate(backup.created_at)}
//           </Typography>
//         </TableCell>

//         {/* Tamaño */}
//         <TableCell>
//           <Typography variant="caption" fontWeight={700}
//             sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.primary' }}>
//             {backup.size_formatted}
//           </Typography>
//         </TableCell>

//         {/* Estado */}
//         <TableCell onClick={e => e.stopPropagation()}>
//           <StatusBadge status={backup.status} />
//         </TableCell>

//         {/* Acciones */}
//         <TableCell onClick={e => e.stopPropagation()}>
//           <Stack direction="row" spacing={0.8}>
//             <Tooltip title="Descargar .sql desde Cloudinary">
//               <span>
//                 <IconButton
//                   size="small"
//                   disabled={backup.status !== 'completado' || isSubmitting}
//                   onClick={() => onDescargar(backup.backup_key)}
//                   sx={{
//                     border: `1.5px solid ${alpha(accentColor, 0.3)}`,
//                     borderRadius: '8px', color: accentColor,
//                     '&:hover': { bgcolor: alpha(accentColor, 0.1) },
//                     '&.Mui-disabled': { opacity: 0.35 },
//                   }}
//                 >
//                   <DownloadRoundedIcon sx={{ fontSize: 16 }} />
//                 </IconButton>
//               </span>
//             </Tooltip>

//             <Tooltip title="Restaurar base de datos desde este backup">
//               <span>
//                 <IconButton
//                   size="small"
//                   disabled={backup.status !== 'completado' || isSubmitting}
//                   onClick={() => onRestore(backup)}
//                   sx={{
//                     border: `1.5px solid ${alpha('#d97706', 0.3)}`,
//                     borderRadius: '8px', color: '#d97706',
//                     '&:hover': { bgcolor: alpha('#d97706', 0.1) },
//                     '&.Mui-disabled': { opacity: 0.35 },
//                   }}
//                 >
//                   <RestoreRoundedIcon sx={{ fontSize: 16 }} />
//                 </IconButton>
//               </span>
//             </Tooltip>

//             <Tooltip title="Eliminar de Cloudinary">
//               <span>
//                 <IconButton
//                   size="small"
//                   disabled={isSubmitting}
//                   onClick={() => onDelete(backup)}
//                   sx={{
//                     border: `1.5px solid ${alpha('#dc2626', 0.3)}`,
//                     borderRadius: '8px', color: '#dc2626',
//                     '&:hover': { bgcolor: alpha('#dc2626', 0.1) },
//                     '&.Mui-disabled': { opacity: 0.35 },
//                   }}
//                 >
//                   <DeleteRoundedIcon sx={{ fontSize: 16 }} />
//                 </IconButton>
//               </span>
//             </Tooltip>
//           </Stack>
//         </TableCell>
//       </TableRow>

//       {/* Fila de detalle expandible */}
//       <TableRow>
//         <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
//           <Collapse in={open} timeout={220}>
//             <Box sx={{
//               mx: 2, my: 1.5, p: 2,
//               borderRadius: '12px',
//               bgcolor: isDark ? alpha('#fff', 0.02) : alpha(accentColor, 0.03),
//               border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha(accentColor, 0.15)}`,
//             }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
//                 <InfoOutlinedIcon sx={{ fontSize: 13, color: accentColor }} />
//                 <Typography variant="caption" fontWeight={800}
//                   sx={{ fontSize: 11, color: accentColor, letterSpacing: 0.5 }}>
//                   DETALLE DEL BACKUP
//                 </Typography>
//               </Box>

//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//                 {/* Backup key */}
//                 <Box>
//                   <Typography variant="caption" color="text.disabled"
//                     sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
//                     Backup Key
//                   </Typography>
//                   <Typography variant="caption"
//                     sx={{ fontFamily: 'monospace', fontSize: 11, color: accentColor }}>
//                     {backup.backup_key}
//                   </Typography>
//                 </Box>

//                 {/* Cloudinary */}
//                 <Box>
//                   <Typography variant="caption" color="text.disabled"
//                     sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
//                     Almacenamiento
//                   </Typography>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
//                     <CloudRoundedIcon sx={{ fontSize: 12, color: '#2563eb' }} />
//                     <Typography variant="caption" sx={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>
//                       Cloudinary
//                     </Typography>
//                   </Box>
//                 </Box>

//                 {/* Creado por */}
//                 <Box>
//                   <Typography variant="caption" color="text.disabled"
//                     sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
//                     Generado por
//                   </Typography>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
//                     <PersonRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
//                     <Typography variant="caption" sx={{ fontSize: 11, fontFamily: 'monospace' }}>
//                       {backup.creado_por_username ?? `usuario #${backup.creado_por}`}
//                     </Typography>
//                   </Box>
//                 </Box>

//                 {/* Restaurado por */}
//                 {backup.ultima_restauracion_at && (
//                   <Box>
//                     <Typography variant="caption" color="text.disabled"
//                       sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
//                       Última restauración
//                     </Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
//                       <RestoreRoundedIcon sx={{ fontSize: 12, color: '#d97706' }} />
//                       <Typography variant="caption" sx={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>
//                         {formatDate(backup.ultima_restauracion_at)}
//                         {backup.restaurado_por_username && ` · ${backup.restaurado_por_username}`}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 )}

//                 {/* Tamaño exacto */}
//                 <Box>
//                   <Typography variant="caption" color="text.disabled"
//                     sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>
//                     Tamaño exacto
//                   </Typography>
//                   <Typography variant="caption" sx={{ fontSize: 11, fontFamily: 'monospace' }}>
//                     {backup.size_bytes.toLocaleString()} bytes
//                   </Typography>
//                 </Box>
//               </Box>
//             </Box>
//           </Collapse>
//         </TableCell>
//       </TableRow>
//     </>
//   );
// };

// // ── Modal de confirmación ─────────────────────────────────────────────────────
// interface ConfirmDialogProps {
//   open:         boolean;
//   title:        string;
//   description:  React.ReactNode;
//   confirmLabel: string;
//   confirmColor: 'error' | 'warning';
//   loading:      boolean;
//   onConfirm:    () => void;
//   onClose:      () => void;
// }

// const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
//   open, title, description, confirmLabel, confirmColor, loading, onConfirm, onClose,
// }) => {
//   const theme  = useTheme();
//   const isDark = theme.palette.mode === 'dark';
//   const color  = confirmColor === 'error' ? '#dc2626' : '#d97706';

//   return (
//     <Dialog
//       open={open}
//       onClose={loading ? undefined : onClose}
//       PaperProps={{
//         sx: {
//           borderRadius: '20px',
//           border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
//           bgcolor: isDark ? '#1a1f2e' : '#fff',
//           maxWidth: 440, width: '100%',
//         },
//       }}
//     >
//       <DialogTitle sx={{ pb: 0.5 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
//           <Box sx={{
//             width: 42, height: 42, borderRadius: '50%',
//             bgcolor: alpha(color, 0.12),
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//           }}>
//             {confirmColor === 'error'
//               ? <DeleteRoundedIcon sx={{ fontSize: 20, color }} />
//               : <WarningAmberRoundedIcon sx={{ fontSize: 20, color }} />
//             }
//           </Box>
//           <Typography fontWeight={800} sx={{ fontSize: 17 }}>{title}</Typography>
//         </Box>
//       </DialogTitle>

//       <DialogContent>
//         <DialogContentText component="div"
//           sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.7, mt: 0.5 }}>
//           {description}
//         </DialogContentText>
//       </DialogContent>

//       <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
//         <Button onClick={onClose} disabled={loading} variant="outlined"
//           sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
//           Cancelar
//         </Button>
//         <Button
//           onClick={onConfirm}
//           disabled={loading}
//           variant="contained"
//           sx={{
//             borderRadius: '10px', textTransform: 'none', fontWeight: 700,
//             bgcolor: color, '&:hover': { bgcolor: alpha(color, 0.85) }, minWidth: 120,
//           }}
//         >
//           {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : confirmLabel}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// // ── Página principal ──────────────────────────────────────────────────────────
// export default function BackupsPage() {
//   const theme  = useTheme();
//   const isDark = theme.palette.mode === 'dark';

//   const accentColor = isDark ? '#00e5a0' : '#0057d9';
//   const gradBg      = `linear-gradient(135deg, ${accentColor} 0%, ${isDark ? '#00b4d8' : '#0096c7'} 100%)`;

//   const {
//     backups, stats, isLoading, isGenerating, isSubmitting,
//     generar, descargar, restaurar, eliminar, refrescar,
//   } = useBackups();

//   const [confirmRestore, setConfirmRestore] = useState<Backup | null>(null);
//   const [confirmDelete,  setConfirmDelete]  = useState<Backup | null>(null);

//   const handleRestore = useCallback(async () => {
//     if (!confirmRestore) return;
//     const ok = await restaurar(confirmRestore.backup_key);
//     if (ok) setConfirmRestore(null);
//   }, [confirmRestore, restaurar]);

//   const handleDelete = useCallback(async () => {
//     if (!confirmDelete) return;
//     const ok = await eliminar(confirmDelete.backup_key);
//     if (ok) setConfirmDelete(null);
//   }, [confirmDelete, eliminar]);

//   // ─────────────────────────────────────────────────────────────────────────────
//   return (
//     <Box sx={{ minHeight: '100vh', py: 4 }}>
//       <Container maxWidth="lg">

//         {/* ══ HEADER ══ */}
//         <Fade in timeout={400}>
//           <Box sx={{ mb: 4 }}>
//             <Box sx={{
//               display: 'flex', alignItems: 'center',
//               justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
//             }}>
//               {/* Título */}
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                 <StorageRoundedIcon sx={{
//                   color: accentColor, fontSize: 36,
//                   animation: `${floatIcon} 2.5s ease-in-out infinite`,
//                 }} />
//                 <Box>
//                   <Typography variant="h1" sx={{
//                     fontSize: { xs: '1.5rem', sm: '2rem' },
//                     fontWeight: 800,
//                     background: gradBg,
//                     WebkitBackgroundClip: 'text',
//                     WebkitTextFillColor: 'transparent',
//                     lineHeight: 1.2,
//                   }}>
//                     Gestión de Backups
//                   </Typography>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
//                     <Chip
//                       size="small"
//                       icon={<CloudRoundedIcon />}
//                       label="Cloudinary · PostgreSQL"
//                       sx={{
//                         fontSize: 10, height: 20, fontWeight: 700,
//                         background: gradBg, color: isDark ? '#000' : '#fff',
//                         '& .MuiChip-icon': { color: isDark ? '#000 !important' : '#fff !important', fontSize: 11 },
//                       }}
//                     />
//                     <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
//                       Respaldos automáticos de la base de datos
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Box>

//               {/* Acciones */}
//               <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
//                 <Tooltip title="Actualizar lista">
//                   <IconButton
//                     onClick={refrescar}
//                     disabled={isLoading}
//                     sx={{
//                       border: `1.5px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
//                       borderRadius: '10px',
//                     }}
//                   >
//                     <RefreshRoundedIcon sx={{
//                       fontSize: 20,
//                       animation: isLoading ? `${spin} 1s linear infinite` : 'none',
//                     }} />
//                   </IconButton>
//                 </Tooltip>

//                 <Button
//                   variant="contained"
//                   startIcon={isGenerating
//                     ? <CircularProgress size={15} sx={{ color: '#fff' }} />
//                     : <AddRoundedIcon />
//                   }
//                   onClick={generar}
//                   disabled={isGenerating}
//                   sx={{
//                     borderRadius: '12px', textTransform: 'none', fontWeight: 700,
//                     background: gradBg, px: 2.5, py: 1.1,
//                     '&:hover': { opacity: 0.88, background: gradBg },
//                     '&.Mui-disabled': { opacity: 0.5 },
//                   }}
//                 >
//                   {isGenerating ? 'Generando...' : 'Nuevo Backup'}
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         </Fade>

//         {/* ══ STATS ══ */}
//         <Fade in timeout={450}>
//           <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
//             <StatCard
//               icon={<SaveRoundedIcon />}
//               label="Total backups"
//               value={stats.total}
//               color={accentColor}
//               isDark={isDark}
//               delay={0}
//               sub="registros en BD"
//             />
//             <StatCard
//               icon={<ShieldRoundedIcon />}
//               label="Completados"
//               value={stats.disponibles}
//               color="#16a34a"
//               isDark={isDark}
//               delay={0.05}
//               sub="listos para restaurar"
//             />
//             <StatCard
//               icon={<AccessTimeRoundedIcon />}
//               label="Último backup"
//               value={
//                 <Typography fontWeight={700} sx={{ fontSize: 13, color: 'text.primary', mt: 0.3 }}>
//                   {stats.ultimoBackup ? formatDate(stats.ultimoBackup) : '—'}
//                 </Typography>
//               }
//               color="#2563eb"
//               isDark={isDark}
//               delay={0.1}
//             />
//             <StatCard
//               icon={<HardwareRoundedIcon />}
//               label="Espacio en Cloudinary"
//               value={
//                 <Typography fontWeight={700} sx={{ fontSize: 20, color: accentColor }}>
//                   {stats.espacioFormateado}
//                 </Typography>
//               }
//               color={accentColor}
//               isDark={isDark}
//               delay={0.15}
//               sub="total acumulado"
//             />
//           </Box>
//         </Fade>

//         {/* ══ TABLA ══ */}
//         <Fade in timeout={500}>
//           <Box sx={{ animation: `${fadeUp} 0.3s ease-out 0.2s both` }}>
//             <TableContainer
//               component={Paper}
//               elevation={0}
//               sx={{
//                 borderRadius: '16px',
//                 border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
//                 bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
//                 overflow: 'hidden',
//               }}
//             >
//               {/* Cabecera de la tabla */}
//               <Box sx={{
//                 px: 3, py: 2,
//                 borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.8),
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <StorageRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
//                   <Typography variant="subtitle2" fontWeight={800}>Historial de Backups</Typography>
//                   {backups.length > 0 && (
//                     <Chip
//                       label={`${backups.length} registros`}
//                       size="small"
//                       sx={{
//                         fontSize: 10, height: 19,
//                         bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700,
//                       }}
//                     />
//                   )}
//                 </Box>
//                 <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
//                   Clic en una fila para ver el detalle
//                 </Typography>
//               </Box>

//               {isLoading && <LinearProgress sx={{ height: 2 }} />}

//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     {['', 'Archivo', 'Base de datos', 'Generado', 'Tamaño', 'Estado', 'Acciones'].map((col, i) => (
//                       <TableCell key={i} sx={{
//                         fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
//                         letterSpacing: 0.8, color: 'text.disabled', py: 1.5,
//                         bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
//                       }}>
//                         {col}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {/* Empty state */}
//                   {!isLoading && backups.length === 0 && (
//                     <TableRow>
//                       <TableCell colSpan={7} sx={{ textAlign: 'center', py: 10 }}>
//                         <StorageRoundedIcon sx={{
//                           fontSize: 52, color: alpha(accentColor, 0.15),
//                           mb: 2, display: 'block', mx: 'auto',
//                         }} />
//                         <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
//                           No hay backups disponibles
//                         </Typography>
//                         <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2 }}>
//                           Generá el primero con el botón "Nuevo Backup"
//                         </Typography>
//                         <Button
//                           variant="outlined"
//                           startIcon={<AddRoundedIcon />}
//                           onClick={generar}
//                           disabled={isGenerating}
//                           sx={{
//                             borderRadius: '10px', textTransform: 'none', fontWeight: 600,
//                             borderColor: accentColor, color: accentColor,
//                             '&:hover': { bgcolor: alpha(accentColor, 0.08) },
//                           }}
//                         >
//                           Generar primer backup
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   )}

//                   {/* Rows */}
//                   {backups.map((backup, index) => (
//                     <BackupRow
//                       key={backup.backup_key}
//                       backup={backup}
//                       index={index}
//                       accentColor={accentColor}
//                       isDark={isDark}
//                       isSubmitting={isSubmitting}
//                       onDescargar={descargar}
//                       onRestore={setConfirmRestore}
//                       onDelete={setConfirmDelete}
//                     />
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>
//         </Fade>

//       </Container>

//       {/* ══ MODAL RESTAURAR ══ */}
//       <ConfirmDialog
//         open={!!confirmRestore}
//         title="¿Restaurar base de datos?"
//         description={
//           <Box>
//             <Typography sx={{ mb: 1.5, fontSize: 14, color: 'text.secondary', lineHeight: 1.7 }}>
//               Esta acción es <strong>irreversible</strong>. Se eliminarán <strong>todos los datos actuales</strong> y
//               se reemplazarán por el contenido del backup:
//             </Typography>
//             <Box sx={{
//               p: 1.5, borderRadius: '10px',
//               bgcolor: alpha('#d97706', 0.07),
//               border: `1px solid ${alpha('#d97706', 0.25)}`,
//             }}>
//               <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#d97706', fontWeight: 700, wordBreak: 'break-all' }}>
//                 {confirmRestore?.filename}
//               </Typography>
//               <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
//                 Generado: {formatDate(confirmRestore?.created_at)}
//               </Typography>
//             </Box>
//           </Box>
//         }
//         confirmLabel="Sí, restaurar"
//         confirmColor="warning"
//         loading={isSubmitting}
//         onConfirm={handleRestore}
//         onClose={() => !isSubmitting && setConfirmRestore(null)}
//       />

//       {/* ══ MODAL ELIMINAR ══ */}
//       <ConfirmDialog
//         open={!!confirmDelete}
//         title="¿Eliminar backup?"
//         description={
//           <Box>
//             <Typography sx={{ mb: 1.5, fontSize: 14, color: 'text.secondary', lineHeight: 1.7 }}>
//               Se eliminará el archivo de <strong>Cloudinary</strong> permanentemente.
//               El registro quedará en la base de datos para auditoría.
//             </Typography>
//             <Box sx={{
//               p: 1.5, borderRadius: '10px',
//               bgcolor: alpha('#dc2626', 0.06),
//               border: `1px solid ${alpha('#dc2626', 0.2)}`,
//             }}>
//               <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#dc2626', fontWeight: 700, wordBreak: 'break-all' }}>
//                 {confirmDelete?.filename}
//               </Typography>
//               <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
//                 {confirmDelete?.size_formatted} · {formatDate(confirmDelete?.created_at)}
//               </Typography>
//             </Box>
//           </Box>
//         }
//         confirmLabel="Eliminar"
//         confirmColor="error"
//         loading={isSubmitting}
//         onConfirm={handleDelete}
//         onClose={() => !isSubmitting && setConfirmDelete(null)}
//       />
//     </Box>
//   );
// }

'use client';
import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Chip, Fade, LinearProgress,
  Stack, CircularProgress, Tooltip, useTheme, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, IconButton, Collapse, Grid, Card, CardContent, Avatar,
  Divider, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { keyframes } from '@mui/system';

import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CloudRoundedIcon from '@mui/icons-material/CloudRounded';
import HardwareRoundedIcon from '@mui/icons-material/HardwareRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';

import { useBackups } from '@/hooks/useBackup';
import { Backup, BACKUP_STATUS_CONFIG } from '@/types/backupTypes';

// ── Paleta dinámica ───────────────────────────────────────────────────────────
function usePalette() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = isDark ? '#facc15' : '#0288d1';
  const secondary = isDark ? '#f59e0b' : '#01579b';
  const gradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const textOnPrimary = isDark ? '#000' : '#fff';
  return { isDark, primary, secondary, gradient, textOnPrimary };
}

// ── Animaciones ───────────────────────────────────────────────────────────────
const floatIcon = keyframes`
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%       { transform: translateY(-6px) rotate(2deg); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.5; }`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
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
  icon: React.ReactElement<{ sx?: any }>;
  label: string;
  value: React.ReactNode;
  color: string;
  delay?: number;
  sub?: string;
}> = ({ icon, label, value, color, delay = 0, sub }) => {
  const { isDark } = usePalette();
  return (
    <Card sx={{
      flex: '1 1 160px',
      background: `linear-gradient(135deg, ${alpha(color, 0.1)}, ${alpha(color, 0.04)})`,
      border: `1px solid ${alpha(color, 0.25)}`,
      borderRadius: 3,
      animation: `${fadeUp} 0.35s ease-out ${delay}s both`,
      transition: 'all .2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 24px ${alpha(color, 0.2)}` },
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: alpha(color, 0.15), color, width: 44, height: 44, borderRadius: 2 }}>
            {React.cloneElement(icon, { sx: { fontSize: 22, color } })}
          </Avatar>
          <Box>
            <Typography variant="caption" fontWeight={700}
              sx={{ fontSize: 10, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color, lineHeight: 1.1 }}>
              {value}
            </Typography>
            {sub && <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{sub}</Typography>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ── Badge de estado ───────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: Backup['status'] }> = ({ status }) => {
  const cfg = BACKUP_STATUS_CONFIG.find(c => c.value === status);
  if (!cfg) return null;
  return (
    <Chip size="small" label={cfg.label}
      icon={status === 'completado'
        ? <CheckCircleRoundedIcon />
        : status === 'en_progreso'
          ? <CircularProgress size={10} sx={{ color: `${cfg.color} !important`, animation: `${pulse} 1s infinite` }} />
          : <WarningAmberRoundedIcon />
      }
      sx={{
        fontSize: 11, height: 22,
        bgcolor: alpha(cfg.color, 0.1), color: cfg.color, fontWeight: 700,
        '& .MuiChip-icon': { fontSize: 12, color: `${cfg.color} !important` },
      }}
    />
  );
};

// ── Backup Card (vista cards) ─────────────────────────────────────────────────
// ── Backup Card (vista cards) ─────────────────────────────────────────────────
const BackupCard: React.FC<{
  backup: Backup;
  index: number;
  isSubmitting: boolean;
  onDescargar: (key: string) => void;
  onRestore: (b: Backup) => void;
  onDelete: (b: Backup) => void;
}> = ({ backup, index, isSubmitting, onDescargar, onRestore, onDelete }) => {
  const { primary, secondary, gradient, textOnPrimary, isDark } = usePalette();
  const [expanded, setExpanded] = useState(false);
  const cfg = BACKUP_STATUS_CONFIG.find(c => c.value === backup.status);
  const statusColor = cfg?.color || primary;
  const restoreColor = '#2563eb'; // azul, contraste con la paleta dorada/ámbar

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '20px',
          border: `1px solid ${alpha(primary, 0.12)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'visible',
          animation: `${fadeUp} 0.4s ease-out ${index * 0.07}s both`,
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 24px ${alpha(primary, 0.2)}`,
            borderColor: primary,
          },
        }}
      >
        {/* Badge de estado */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
          <StatusBadge status={backup.status} />
        </Box>

        <CardContent sx={{ p: 3, textAlign: 'center', pt: 5 }}>
          {/* Avatar */}
          <Avatar
            sx={{
              width: 72,
              height: 72,
              margin: '0 auto 12px',
              bgcolor: alpha(primary, 0.12),
              color: primary,
              border: `4px solid ${alpha(primary, 0.18)}`,
            }}
          >
            <StorageRoundedIcon sx={{ fontSize: 32 }} />
          </Avatar>

          {/* Nombre del archivo */}
          <Typography
            variant="body2"
            fontWeight={800}
            sx={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: primary,
              wordBreak: 'break-all',
              lineHeight: 1.4,
              mb: 0.5,
            }}
          >
            {backup.filename}
          </Typography>

          {backup.ultima_restauracion_at && (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.4} mb={1}>
              <RestoreRoundedIcon sx={{ fontSize: 11, color: restoreColor }} />
              <Typography variant="caption" sx={{ color: restoreColor, fontWeight: 600, fontSize: 10 }}>
                Restaurado {formatDateShort(backup.ultima_restauracion_at)}
              </Typography>
            </Stack>
          )}

          {/* Chip de base de datos */}
          <Chip
            icon={<StorageRoundedIcon sx={{ fontSize: 14 }} />}
            label={backup.database_name}
            size="small"
            sx={{
              mt: 1,
              mb: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: 11,
              bgcolor: alpha('#64748b', 0.12),
              color: 'text.secondary',
              '& .MuiChip-icon': { color: 'text.secondary !important' },
            }}
          />

          {/* Botones de acción directos */}
          <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
            <Tooltip title="Descargar .sql">
              <span>
                <IconButton
                  size="small"
                  disabled={backup.status !== 'completado' || isSubmitting}
                  onClick={() => onDescargar(backup.backup_key)}
                  sx={{
                    bgcolor: alpha(primary, 0.1),
                    color: primary,
                    '&:hover': { background: gradient, color: textOnPrimary },
                    '&.Mui-disabled': { opacity: 0.35 },
                  }}
                >
                  <DownloadRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Restaurar base de datos">
              <span>
                <IconButton
                  size="small"
                  disabled={backup.status !== 'completado' || isSubmitting}
                  onClick={() => onRestore(backup)}
                  sx={{
                    bgcolor: alpha(restoreColor, 0.1),
                    color: restoreColor,
                    '&:hover': { bgcolor: restoreColor, color: '#fff' },
                    '&.Mui-disabled': { opacity: 0.35 },
                  }}
                >
                  <RestoreRoundedIcon fontSize="small" />
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
                    bgcolor: alpha('#dc2626', 0.1),
                    color: '#dc2626',
                    '&:hover': { bgcolor: '#dc2626', color: '#fff' },
                    '&.Mui-disabled': { opacity: 0.35 },
                  }}
                >
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {/* Info adicional */}
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${alpha(primary, 0.1)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.2,
              textAlign: 'left',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTimeRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                  {formatDate(backup.created_at)}
                </Typography>
              </Stack>
              <Typography variant="caption" fontWeight={800} sx={{ fontFamily: 'monospace', fontSize: 13, color: secondary }}>
                {backup.size_formatted}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                {backup.creado_por_username ?? `usuario #${backup.creado_por}`}
              </Typography>
            </Stack>

            {backup.ultima_restauracion_at && backup.restaurado_por_username && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <RestoreRoundedIcon sx={{ fontSize: 16, color: restoreColor }} />
                <Typography variant="caption" sx={{ fontSize: 11, color: restoreColor, fontWeight: 600 }}>
                  {backup.restaurado_por_username}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Detalle expandible */}
          <Box sx={{ mt: 1.5 }}>
            <Button
              size="small"
              onClick={() => setExpanded(e => !e)}
              endIcon={expanded ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 14 }} /> : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14 }} />}
              sx={{
                fontSize: 10, color: primary, textTransform: 'none', fontWeight: 700, p: 0, minWidth: 0,
                '&:hover': { bgcolor: 'transparent', opacity: 0.8 },
              }}
            >
              {expanded ? 'Ocultar detalle' : 'Ver detalle'}
            </Button>
            <Collapse in={expanded} timeout={200}>
              <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: alpha(primary, 0.04), border: `1px solid ${alpha(primary, 0.12)}`, textAlign: 'left' }}>
                <Stack spacing={0.8}>
                  <Box>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Backup Key
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 10, color: primary, display: 'block', wordBreak: 'break-all' }}>
                      {backup.backup_key}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CloudRoundedIcon sx={{ fontSize: 11, color: '#2563eb' }} />
                    <Typography variant="caption" sx={{ fontSize: 10, color: '#2563eb', fontWeight: 600 }}>Cloudinary</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontFamily: 'monospace' }}>
                    {backup.size_bytes.toLocaleString()} bytes
                  </Typography>
                </Stack>
              </Box>
            </Collapse>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ── Backup Row (vista tabla) ──────────────────────────────────────────────────
const BackupRow: React.FC<{
  backup: Backup; index: number; isSubmitting: boolean;
  onDescargar: (key: string) => void; onRestore: (b: Backup) => void; onDelete: (b: Backup) => void;
}> = ({ backup, index, isSubmitting, onDescargar, onRestore, onDelete }) => {
  const { primary, gradient, textOnPrimary, isDark } = usePalette();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow onClick={() => setOpen(o => !o)} sx={{
        animation: `${fadeUp} 0.3s ease-out ${index * 0.05}s both`,
        '&:hover': { bgcolor: alpha(primary, 0.04) },
        transition: 'background 0.15s', cursor: 'pointer',
      }}>
        <TableCell sx={{ width: 40, pr: 0 }}>
          <IconButton size="small" sx={{ color: primary }}>
            {open ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 16 }} /> : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', fontSize: 12, color: primary }}>
            {backup.filename}
          </Typography>
          {backup.ultima_restauracion_at && (
            <Stack direction="row" alignItems="center" spacing={0.4} mt={0.3}>
              <RestoreRoundedIcon sx={{ fontSize: 10, color: '#d97706' }} />
              <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600, fontSize: 10 }}>
                Restaurado {formatDateShort(backup.ultima_restauracion_at)}
              </Typography>
            </Stack>
          )}
        </TableCell>
        <TableCell>
          <Chip size="small" label={backup.database_name} icon={<StorageRoundedIcon />}
            sx={{
              fontSize: 11, height: 22, fontFamily: 'monospace',
              bgcolor: alpha(primary, 0.1), color: primary,
              '& .MuiChip-icon': { fontSize: 12, color: `${primary} !important` }
            }} />
        </TableCell>
        <TableCell>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {formatDate(backup.created_at)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace', fontSize: 12, color: primary }}>
            {backup.size_formatted}
          </Typography>
        </TableCell>
        <TableCell onClick={e => e.stopPropagation()}>
          <StatusBadge status={backup.status} />
        </TableCell>
        <TableCell onClick={e => e.stopPropagation()}>
          <Stack direction="row" spacing={0.8}>
            <Tooltip title="Descargar .sql">
              <span>
                <IconButton size="small" disabled={backup.status !== 'completado' || isSubmitting}
                  onClick={() => onDescargar(backup.backup_key)}
                  sx={{
                    bgcolor: alpha(primary, 0.1), color: primary, borderRadius: 1.5,
                    '&:hover': { background: gradient, color: textOnPrimary },
                    '&.Mui-disabled': { opacity: 0.35 }
                  }}>
                  <DownloadRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Restaurar">
              <span>
                <IconButton size="small" disabled={backup.status !== 'completado' || isSubmitting}
                  onClick={() => onRestore(backup)}
                  sx={{
                    bgcolor: alpha('#d97706', 0.1), color: '#d97706', borderRadius: 1.5,
                    '&:hover': { bgcolor: '#d97706', color: '#fff' },
                    '&.Mui-disabled': { opacity: 0.35 }
                  }}>
                  <RestoreRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Eliminar">
              <span>
                <IconButton size="small" disabled={isSubmitting}
                  onClick={() => onDelete(backup)}
                  sx={{
                    bgcolor: alpha('#dc2626', 0.1), color: '#dc2626', borderRadius: 1.5,
                    '&:hover': { bgcolor: '#dc2626', color: '#fff' },
                    '&.Mui-disabled': { opacity: 0.35 }
                  }}>
                  <DeleteRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Detalle expandible */}
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
          <Collapse in={open} timeout={220}>
            <Box sx={{
              mx: 2, my: 1.5, p: 2, borderRadius: 2,
              bgcolor: alpha(primary, 0.03), border: `1px solid ${alpha(primary, 0.12)}`
            }}>
              <Stack direction="row" alignItems="center" spacing={0.8} mb={1.5}>
                <InfoOutlinedIcon sx={{ fontSize: 13, color: primary }} />
                <Typography variant="caption" fontWeight={800} sx={{ fontSize: 11, color: primary, letterSpacing: 0.5 }}>
                  DETALLE DEL BACKUP
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>Backup Key</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, color: primary }}>{backup.backup_key}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>Almacenamiento</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.4}>
                    <CloudRoundedIcon sx={{ fontSize: 12, color: '#2563eb' }} />
                    <Typography variant="caption" sx={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>Cloudinary</Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>Generado por</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.4}>
                    <PersonRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ fontSize: 11, fontFamily: 'monospace' }}>
                      {backup.creado_por_username ?? `usuario #${backup.creado_por}`}
                    </Typography>
                  </Stack>
                </Box>
                {backup.ultima_restauracion_at && (
                  <Box>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>Última restauración</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.4}>
                      <RestoreRoundedIcon sx={{ fontSize: 12, color: '#d97706' }} />
                      <Typography variant="caption" sx={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>
                        {formatDate(backup.ultima_restauracion_at)}
                        {backup.restaurado_por_username && ` · ${backup.restaurado_por_username}`}
                      </Typography>
                    </Stack>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>Tamaño exacto</Typography>
                  <Typography variant="caption" sx={{ fontSize: 11, fontFamily: 'monospace' }}>{backup.size_bytes.toLocaleString()} bytes</Typography>
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
  open: boolean; title: string; description: React.ReactNode;
  confirmLabel: string; confirmColor: 'error' | 'warning';
  loading: boolean; onConfirm: () => void; onClose: () => void;
}
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, description, confirmLabel, confirmColor, loading, onConfirm, onClose,
}) => {
  const { primary, gradient, textOnPrimary, isDark } = usePalette();
  const color = confirmColor === 'error' ? '#dc2626' : '#d97706';

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose}
      PaperProps={{ sx: { borderRadius: 4, border: `1px solid ${alpha(primary, 0.2)}`, maxWidth: 440, width: '100%' } }}>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`, width: 42, height: 42, borderRadius: 2 }}>
            {confirmColor === 'error'
              ? <DeleteRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
              : <WarningAmberRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />}
          </Avatar>
          <Typography fontWeight={800} sx={{ fontSize: 17 }}>{title}</Typography>
        </Stack>
      </DialogTitle>
      <Divider sx={{ borderColor: alpha(primary, 0.15) }} />
      <DialogContent>
        <DialogContentText component="div" sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.7, mt: 0.5 }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined"
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 600,
            borderColor: alpha(primary, 0.4), color: primary,
            '&:hover': { borderColor: primary, bgcolor: alpha(primary, 0.06) }
          }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={loading} variant="contained"
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 700,
            bgcolor: color, '&:hover': { bgcolor: alpha(color, 0.85) }, minWidth: 120
          }}>
          {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
export default function BackupsPage() {
  const { isDark, primary, secondary, gradient, textOnPrimary } = usePalette();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { backups, stats, isLoading, isGenerating, isSubmitting, generar, descargar, restaurar, eliminar, refrescar } = useBackups();
  const [confirmRestore, setConfirmRestore] = useState<Backup | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Backup | null>(null);

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

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* ── Header ── */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex', alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 },
            }}>
              {/* Título */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <StorageRoundedIcon sx={{
                  color: primary, fontSize: { xs: 22, md: 38 },
                  animation: `${floatIcon} 2.5s ease-in-out infinite`,
                }} />
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, fontWeight: 800,
                    background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    Gestión de Backups
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mt={0.3}>
                    <Chip size="small" icon={<CloudRoundedIcon />} label="Cloudinary · PostgreSQL"
                      sx={{
                        fontSize: 10, height: 20, fontWeight: 700,
                        background: gradient, color: textOnPrimary,
                        '& .MuiChip-icon': { color: `${textOnPrimary} !important`, fontSize: 11 }
                      }} />
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                      Respaldos automáticos de la base de datos
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              {/* Controles */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                {/* Toggle view */}
                <ToggleButtonGroup value={viewMode} exclusive
                  onChange={(_, v) => v && setViewMode(v)} size="small"
                  sx={{
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                    borderRadius: '12px',
                    '& .MuiToggleButton-root': {
                      border: 'none', borderRadius: '10px', px: 2, py: 1,
                      fontWeight: 600, textTransform: 'none',
                      fontSize: { xs: '0.5rem', md: '0.85rem' },
                      '&.Mui-selected': {
                        background: gradient, color: textOnPrimary,
                        '&:hover': { background: gradient, filter: 'brightness(1.08)' }
                      },
                    },
                  }}>
                  <ToggleButton value="cards">
                    <ViewModuleIcon sx={{ mr: 0.5, fontSize: { xs: 12, md: 18 } }} /> Cards
                  </ToggleButton>
                  <ToggleButton value="table">
                    <TableRowsIcon sx={{ mr: 0.5, fontSize: { xs: 12, md: 18 } }} /> Tabla
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Refresh */}
                <Tooltip title="Actualizar lista">
                  <IconButton onClick={refrescar} disabled={isLoading}
                    sx={{
                      border: `1.5px solid ${alpha(primary, 0.3)}`, borderRadius: '10px', color: primary,
                      '&:hover': { bgcolor: alpha(primary, 0.08) }
                    }}>
                    <RefreshRoundedIcon sx={{ fontSize: 20, animation: isLoading ? `${spin} 1s linear infinite` : 'none' }} />
                  </IconButton>
                </Tooltip>

                {/* Nuevo backup */}
                <Button variant="contained" startIcon={isGenerating
                  ? <CircularProgress size={15} sx={{ color: textOnPrimary }} />
                  : <AddRoundedIcon />}
                  onClick={generar} disabled={isGenerating}
                  sx={{
                    borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                    background: gradient, color: textOnPrimary, px: 2.5, py: 1.1,
                    fontSize: { xs: '0.7rem', md: '0.95rem' },
                    '&:hover': { filter: 'brightness(1.08)', transform: 'translateY(-2px)' },
                    '&.Mui-disabled': { opacity: 0.5 }, transition: 'all .2s',
                  }}>
                  {isGenerating ? 'Generando...' : 'Nuevo Backup'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>

        {/* ── Stats ── */}
        <Fade in timeout={450}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            <StatCard icon={<SaveRoundedIcon />} label="Total backups" value={stats.total} color={primary} delay={0} sub="registros en BD" />
            <StatCard icon={<ShieldRoundedIcon />} label="Completados" value={stats.disponibles} color="#16a34a" delay={0.05} sub="listos para restaurar" />
            <StatCard icon={<AccessTimeRoundedIcon />} label="Último backup"
              value={<Typography fontWeight={700} sx={{ fontSize: 12, color: 'text.primary', mt: 0.3 }}>{stats.ultimoBackup ? formatDate(stats.ultimoBackup) : '—'}</Typography>}
              color="#2563eb" delay={0.1} />
            <StatCard icon={<HardwareRoundedIcon />} label="Espacio en Cloudinary"
              value={<Typography fontWeight={700} sx={{ fontSize: 18, color: secondary }}>{stats.espacioFormateado}</Typography>}
              color={secondary} delay={0.15} sub="total acumulado" />
          </Box>
        </Fade>

        {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 2, bgcolor: alpha(primary, 0.1), '& .MuiLinearProgress-bar': { background: gradient } }} />}

        {/* ── Vista Cards ── */}
        {viewMode === 'cards' && (
          <Fade in timeout={500}>
            <Box>
              {!isLoading && backups.length === 0 ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: `2px dashed ${alpha(primary, 0.3)}`, bgcolor: alpha(primary, 0.03) }}>
                  <StorageRoundedIcon sx={{ fontSize: 64, color: primary, opacity: 0.4, mb: 2, display: 'block', mx: 'auto' }} />
                  <Typography variant="h6" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>No hay backups disponibles</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2 }}>
                    Generá el primero con el botón "Nuevo Backup"
                  </Typography>
                  <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={generar} disabled={isGenerating}
                    sx={{
                      borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                      borderColor: primary, color: primary, '&:hover': { bgcolor: alpha(primary, 0.08) }
                    }}>
                    Generar primer backup
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {backups.map((backup, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={backup.backup_key}>
                      <BackupCard backup={backup} index={index} isSubmitting={isSubmitting}
                        onDescargar={descargar} onRestore={setConfirmRestore} onDelete={setConfirmDelete} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Fade>
        )}

        {/* ── Vista Tabla ── */}
        {viewMode === 'table' && (
          <Fade in timeout={500}>
            <Box>
              <TableContainer component={Paper} elevation={0} sx={{
                borderRadius: 3, border: `1px solid ${alpha(primary, 0.2)}`, overflow: 'hidden',
              }}>
                {/* Header tabla */}
                <Box sx={{
                  px: 3, py: 2, borderBottom: `1px solid ${alpha(primary, 0.12)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: `linear-gradient(135deg, ${alpha(primary, 0.06)}, transparent)`
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <StorageRoundedIcon sx={{ fontSize: 16, color: primary }} />
                    <Typography variant="subtitle2" fontWeight={800}>Historial de Backups</Typography>
                    {backups.length > 0 && (
                      <Chip label={`${backups.length} registros`} size="small"
                        sx={{ fontSize: 10, height: 19, bgcolor: alpha(primary, 0.1), color: primary, fontWeight: 700 }} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                    Clic en una fila para ver el detalle
                  </Typography>
                </Box>

                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(primary, 0.04) }}>
                      {['', 'Archivo', 'Base de datos', 'Generado', 'Tamaño', 'Estado', 'Acciones'].map((col, i) => (
                        <TableCell key={i} sx={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: 0.8, color: primary, py: 1.5
                        }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!isLoading && backups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                          <StorageRoundedIcon sx={{ fontSize: 52, color: alpha(primary, 0.2), mb: 2, display: 'block', mx: 'auto' }} />
                          <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
                            No hay backups disponibles
                          </Typography>
                          <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={generar} disabled={isGenerating}
                            sx={{
                              borderRadius: '10px', textTransform: 'none', fontWeight: 600, mt: 1,
                              borderColor: primary, color: primary, '&:hover': { bgcolor: alpha(primary, 0.08) }
                            }}>
                            Generar primer backup
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                    {backups.map((backup, index) => (
                      <BackupRow key={backup.backup_key} backup={backup} index={index}
                        isSubmitting={isSubmitting} onDescargar={descargar}
                        onRestore={setConfirmRestore} onDelete={setConfirmDelete} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Fade>
        )}

      </Container>

      {/* ── Modal Restaurar ── */}
      <ConfirmDialog open={!!confirmRestore} title="¿Restaurar base de datos?"
        description={
          <Box>
            <Typography sx={{ mb: 1.5, fontSize: 14, color: 'text.secondary', lineHeight: 1.7 }}>
              Esta acción es <strong>irreversible</strong>. Se eliminarán <strong>todos los datos actuales</strong> y
              se reemplazarán por el contenido del backup:
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#d97706', 0.07), border: `1px solid ${alpha('#d97706', 0.25)}` }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#d97706', fontWeight: 700, wordBreak: 'break-all' }}>
                {confirmRestore?.filename}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                Generado: {formatDate(confirmRestore?.created_at)}
              </Typography>
            </Box>
          </Box>
        }
        confirmLabel="Sí, restaurar" confirmColor="warning" loading={isSubmitting}
        onConfirm={handleRestore} onClose={() => !isSubmitting && setConfirmRestore(null)}
      />

      {/* ── Modal Eliminar ── */}
      <ConfirmDialog open={!!confirmDelete} title="¿Eliminar backup?"
        description={
          <Box>
            <Typography sx={{ mb: 1.5, fontSize: 14, color: 'text.secondary', lineHeight: 1.7 }}>
              Se eliminará el archivo de <strong>Cloudinary</strong> permanentemente.
              El registro quedará en la base de datos para auditoría.
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#dc2626', 0.06), border: `1px solid ${alpha('#dc2626', 0.2)}` }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#dc2626', fontWeight: 700, wordBreak: 'break-all' }}>
                {confirmDelete?.filename}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                {confirmDelete?.size_formatted} · {formatDate(confirmDelete?.created_at)}
              </Typography>
            </Box>
          </Box>
        }
        confirmLabel="Eliminar" confirmColor="error" loading={isSubmitting}
        onConfirm={handleDelete} onClose={() => !isSubmitting && setConfirmDelete(null)}
      />
    </Box>
  );
}