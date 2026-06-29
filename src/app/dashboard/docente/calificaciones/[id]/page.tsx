// 'use client';
// // app/dashboard/docente/calificaciones/[id]/page.tsx

// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import {
//   Box, Container, Typography, Chip, Tabs, Tab, Snackbar, Alert,
//   Fade, LinearProgress, Stack, CircularProgress, Tooltip, Divider,
//   Collapse, useTheme, alpha,
// } from '@mui/material';
// import { keyframes } from '@mui/system';
// import EditNoteRoundedIcon         from '@mui/icons-material/EditNoteRounded';
// import ArrowBackRoundedIcon        from '@mui/icons-material/ArrowBackRounded';
// import CheckCircleRoundedIcon      from '@mui/icons-material/CheckCircleRounded';
// import AssignmentRoundedIcon       from '@mui/icons-material/AssignmentRounded';
// import ImageRoundedIcon            from '@mui/icons-material/ImageRounded';
// import PictureAsPdfRoundedIcon     from '@mui/icons-material/PictureAsPdfRounded';
// import HourglassEmptyRoundedIcon   from '@mui/icons-material/HourglassEmptyRounded';
// import EditRoundedIcon             from '@mui/icons-material/EditRounded';
// import KeyboardArrowUpRoundedIcon  from '@mui/icons-material/KeyboardArrowUpRounded';
// import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
// import CalendarTodayRoundedIcon    from '@mui/icons-material/CalendarTodayRounded';
// import ScoreRoundedIcon            from '@mui/icons-material/ScoreRounded';
// import InfoOutlinedIcon            from '@mui/icons-material/InfoOutlined';
// import DescriptionOutlinedIcon     from '@mui/icons-material/DescriptionOutlined';
// import MenuBookRoundedIcon         from '@mui/icons-material/MenuBookRounded';
// import AccessTimeRoundedIcon       from '@mui/icons-material/AccessTimeRounded';
// import OpenInNewRoundedIcon        from '@mui/icons-material/OpenInNewRounded';
// import CheckRoundedIcon            from '@mui/icons-material/CheckRounded';

// import { useParams, useRouter } from 'next/navigation';
// import {
//   useMisMateriasNotas,
//   useEvaluaciones,
//   useIngresarNotas,
//   useResumenDimensiones,
// } from '@/hooks/useNotas';
// import {
//   MateriaDocenteNotas,
//   Evaluacion,
//   DIMENSIONES_CONFIG,
//   DIMENSIONES_ORDEN,
//   CodigoDimension,
//   TIPOS_EVALUACION,
//   CriterioRubrica,
// } from '@/types/notasTypes';
// import { calificacionesService, rubricaService } from '@/services/notasService';
// import { IngresarNotas, ResumenDimensiones } from '@/components/docente/notas/IngresarNotas';

// // ── Animaciones ────────────────────────────────────────────────────────────────
// const floatIcon = keyframes`
//   0%, 100% { transform: translateY(0) rotate(-2deg); }
//   50%       { transform: translateY(-5px) rotate(2deg); }
// `;
// const fadeUp = keyframes`
//   from { opacity: 0; transform: translateY(10px); }
//   to   { opacity: 1; transform: translateY(0); }
// `;
// const cardAppear = keyframes`
//   from { opacity: 0; transform: translateY(6px); }
//   to   { opacity: 1; transform: translateY(0); }
// `;

// // ── Tipo enriquecido ───────────────────────────────────────────────────────────
// interface EvaluacionConProgreso extends Evaluacion {
//   con_nota:      number;
//   total_alumnos: number;
//   ausentes:      number;
// }

// // ── Helper fetch progreso ──────────────────────────────────────────────────────
// async function enriquecerConProgreso(
//   evaluaciones: Evaluacion[],
//   fallbackTotal: number,
// ): Promise<EvaluacionConProgreso[]> {
//   const results = await Promise.allSettled(
//     evaluaciones.map(ev =>
//       calificacionesService.listarPorEvaluacion(ev.id).then(res => ({
//         con_nota:      res.data.con_nota,
//         total_alumnos: res.data.total,
//         ausentes:      res.data.calificaciones.filter(c => c.esta_ausente).length,
//       }))
//     )
//   );
//   return evaluaciones.map((ev, i) => {
//     const r = results[i];
//     return r.status === 'fulfilled'
//       ? { ...ev, ...r.value }
//       : { ...ev, con_nota: 0, total_alumnos: fallbackTotal, ausentes: 0 };
//   });
// }

// // ── Panel de detalle de evaluación ────────────────────────────────────────────
// const DetalleEvaluacion: React.FC<{
//   ev:       EvaluacionConProgreso;
//   dimColor: string;
//   isDark:   boolean;
// }> = ({ ev, dimColor, isDark }) => {
//   const [criterios, setCriterios]       = useState<CriterioRubrica[]>([]);
//   const [loadingRubrica, setLoadingRubrica] = useState(false);
//   const fetchedRef = useRef(false);

//   // Cargar rúbrica solo una vez al montar
//   useEffect(() => {
//     if (fetchedRef.current) return;
//     fetchedRef.current = true;
//     setLoadingRubrica(true);
//     rubricaService.listar(ev.id)
//       .then(res => setCriterios(res.data.criterios))
//       .catch(() => {})
//       .finally(() => setLoadingRubrica(false));
//   }, [ev.id]);

//   const rowSx = {
//     display: 'flex', gap: 1.5, alignItems: 'flex-start', py: 1.2,
//     borderBottom: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
//   };
//   const labelSx = {
//     minWidth: 130, flexShrink: 0,
//     fontSize: 11, fontWeight: 700, color: 'text.disabled',
//     display: 'flex', alignItems: 'center', gap: 0.6, pt: '1px',
//   };
//   const valueSx = { fontSize: 13, color: 'text.primary', lineHeight: 1.55 };

//   const tipo         = TIPOS_EVALUACION.find(t => t.value === ev.tipo);
//   const fechaLimite  = ev.fecha_limite
//     ? new Date(ev.fecha_limite).toLocaleString('es-BO', {
//         day: '2-digit', month: 'short', year: 'numeric',
//         hour: '2-digit', minute: '2-digit',
//       })
//     : null;

//   return (
//     <Box>
//       {/* ── Info básica ── */}
//       <Box sx={{ mb: 2 }}>
//         {tipo && (
//           <Box sx={rowSx}>
//             <Typography sx={labelSx}>
//               <InfoOutlinedIcon sx={{ fontSize: 13 }} /> Tipo
//             </Typography>
//             <Chip label={`${tipo.icon} ${tipo.label}`} size="small"
//               sx={{ fontSize: 11, height: 22, bgcolor: isDark ? alpha('#fff', 0.08) : '#f3f4f6' }} />
//           </Box>
//         )}

//         <Box sx={rowSx}>
//           <Typography sx={labelSx}>
//             <ScoreRoundedIcon sx={{ fontSize: 13 }} /> Puntaje máximo
//           </Typography>
//           <Typography sx={{ ...valueSx, fontWeight: 700, color: dimColor }}>
//             {ev.puntaje_maximo} puntos
//           </Typography>
//         </Box>

//         {ev.peso_en_dimension != null && (
//           <Box sx={rowSx}>
//             <Typography sx={labelSx}>
//               <ScoreRoundedIcon sx={{ fontSize: 13 }} /> Peso en dimensión
//             </Typography>
//             <Typography sx={valueSx}>{ev.peso_en_dimension}</Typography>
//           </Box>
//         )}

//         {ev.fecha && (
//           <Box sx={rowSx}>
//             <Typography sx={labelSx}>
//               <CalendarTodayRoundedIcon sx={{ fontSize: 13 }} /> Fecha
//             </Typography>
//             <Typography sx={valueSx}>{ev.fecha.slice(0, 10)}</Typography>
//           </Box>
//         )}

//         {fechaLimite && (
//           <Box sx={rowSx}>
//             <Typography sx={labelSx}>
//               <AccessTimeRoundedIcon sx={{ fontSize: 13 }} /> Fecha límite
//             </Typography>
//             <Typography sx={{ ...valueSx, color: '#f59e0b', fontWeight: 600 }}>
//               {fechaLimite}
//             </Typography>
//           </Box>
//         )}

//         <Box sx={{ ...rowSx, borderBottom: 'none' }}>
//           <Typography sx={labelSx}>
//             <InfoOutlinedIcon sx={{ fontSize: 13 }} /> Visible a padres
//           </Typography>
//           <Chip
//             label={ev.visible_para_padres ? '✓ Publicada' : '✗ No publicada'}
//             size="small"
//             sx={{
//               fontSize: 10, height: 20,
//               bgcolor: ev.visible_para_padres ? alpha('#16a34a', 0.14) : isDark ? alpha('#fff', 0.07) : '#f3f4f6',
//               color: ev.visible_para_padres ? '#16a34a' : 'text.secondary',
//               fontWeight: 700,
//             }}
//           />
//         </Box>
//       </Box>

//       {/* ── Descripción ── */}
//       {ev.descripcion && (
//         <Box sx={{ mb: 2 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
//             <DescriptionOutlinedIcon sx={{ fontSize: 14, color: dimColor }} />
//             <Typography variant="caption" fontWeight={800} sx={{ color: dimColor, fontSize: 11 }}>
//               DESCRIPCIÓN
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{
//             p: 1.5, borderRadius: '10px',
//             bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
//             border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
//             lineHeight: 1.7, fontSize: 13,
//           }}>
//             {ev.descripcion}
//           </Typography>
//         </Box>
//       )}

//       {/* ── Instrucciones ── */}
//       {ev.instrucciones && (
//         <Box sx={{ mb: 2 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
//             <MenuBookRoundedIcon sx={{ fontSize: 14, color: dimColor }} />
//             <Typography variant="caption" fontWeight={800} sx={{ color: dimColor, fontSize: 11 }}>
//               INSTRUCCIONES
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{
//             p: 1.5, borderRadius: '10px',
//             bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
//             border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
//             lineHeight: 1.7, fontSize: 13, whiteSpace: 'pre-line',
//           }}>
//             {ev.instrucciones}
//           </Typography>
//         </Box>
//       )}

//       {/* ── Adjuntos ── */}
//       {(ev.foto_url || ev.pdf_url) && (
//         <Box sx={{ mb: 2 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
//             <ImageRoundedIcon sx={{ fontSize: 14, color: dimColor }} />
//             <Typography variant="caption" fontWeight={800} sx={{ color: dimColor, fontSize: 11 }}>
//               ADJUNTOS
//             </Typography>
//           </Box>
//           <Stack spacing={1.2}>
//             {ev.foto_url && (
//               <Box>
//                 <Typography variant="caption" color="text.secondary"
//                   sx={{ mb: 0.8, display: 'block', fontWeight: 600 }}>
//                   Imagen del enunciado
//                 </Typography>
//                 <Box
//                   component="img"
//                   src={ev.foto_url}
//                   alt="Foto del enunciado"
//                   sx={{
//                     width: '100%', maxHeight: 320, objectFit: 'contain',
//                     borderRadius: '10px',
//                     border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
//                     bgcolor: isDark ? alpha('#000', 0.3) : '#f8f9fa',
//                   }}
//                 />
//               </Box>
//             )}
//             {ev.pdf_url && (
//               <Box
//                 component="a"
//                 href={ev.pdf_url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 sx={{
//                   display: 'flex', alignItems: 'center', gap: 1.5,
//                   p: 1.5, borderRadius: '10px', textDecoration: 'none',
//                   bgcolor: alpha('#dc2626', 0.06),
//                   border: `1.5px solid ${alpha('#dc2626', 0.2)}`,
//                   transition: 'opacity 0.15s',
//                   '&:hover': { opacity: 0.8 },
//                 }}
//               >
//                 <PictureAsPdfRoundedIcon sx={{ color: '#dc2626', fontSize: 26 }} />
//                 <Box sx={{ flex: 1 }}>
//                   <Typography variant="body2" fontWeight={700} sx={{ color: '#dc2626' }}>
//                     {ev.pdf_nombre ?? 'Instrucciones.pdf'}
//                   </Typography>
//                   <Typography variant="caption" color="text.disabled">Abrir PDF</Typography>
//                 </Box>
//                 <OpenInNewRoundedIcon sx={{ fontSize: 15, color: '#dc2626' }} />
//               </Box>
//             )}
//           </Stack>
//         </Box>
//       )}

//       {/* ── Rúbrica ── */}
//       {loadingRubrica ? (
//         <Box sx={{ py: 2, textAlign: 'center' }}>
//           <CircularProgress size={18} sx={{ color: dimColor }} />
//           <Typography variant="caption" color="text.secondary"
//             sx={{ display: 'block', mt: 0.8, fontSize: 10 }}>
//             Cargando rúbrica...
//           </Typography>
//         </Box>
//       ) : criterios.length > 0 && (
//         <Box>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
//             <CheckRoundedIcon sx={{ fontSize: 14, color: dimColor }} />
//             <Typography variant="caption" fontWeight={800} sx={{ color: dimColor, fontSize: 11 }}>
//               RÚBRICA DE EVALUACIÓN
//             </Typography>
//             <Chip
//               label={`${criterios.reduce((s, c) => s + c.puntos_posibles, 0)} pts totales`}
//               size="small"
//               sx={{ fontSize: 9, height: 17, bgcolor: alpha(dimColor, 0.12), color: dimColor, fontWeight: 700 }}
//             />
//           </Box>
//           <Stack spacing={0.8}>
//             {criterios.map((c, i) => (
//               <Box key={i} sx={{
//                 display: 'flex', alignItems: 'flex-start', gap: 1.5,
//                 p: 1.2, borderRadius: '10px',
//                 bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
//                 border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
//               }}>
//                 <Box sx={{
//                   minWidth: 22, height: 22, borderRadius: '6px', flexShrink: 0,
//                   bgcolor: alpha(dimColor, 0.15),
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 }}>
//                   <Typography variant="caption" fontWeight={900}
//                     sx={{ fontSize: 10, color: dimColor, lineHeight: 1 }}>
//                     {i + 1}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ flex: 1, minWidth: 0 }}>
//                   <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12 }}>
//                     {c.criterio}
//                   </Typography>
//                   {c.descripcion && (
//                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
//                       {c.descripcion}
//                     </Typography>
//                   )}
//                 </Box>
//                 <Chip
//                   label={`${c.puntos_posibles} pts`}
//                   size="small"
//                   sx={{
//                     flexShrink: 0, fontSize: 10, height: 20,
//                     bgcolor: alpha(dimColor, 0.12), color: dimColor, fontWeight: 700,
//                   }}
//                 />
//               </Box>
//             ))}
//           </Stack>
//         </Box>
//       )}

//       {/* Si no hay nada que mostrar en detalle */}
//       {!ev.descripcion && !ev.instrucciones && !ev.foto_url && !ev.pdf_url && criterios.length === 0 && !loadingRubrica && (
//         <Typography variant="caption" color="text.disabled"
//           sx={{ display: 'block', textAlign: 'center', py: 2 }}>
//           Esta evaluación no tiene descripción, adjuntos ni rúbrica.
//         </Typography>
//       )}
//     </Box>
//   );
// };

// // ── Botón inline reutilizable ─────────────────────────────────────────────────
// const InlineBtn: React.FC<{
//   label: string; isOpen: boolean; color: string; isDark: boolean;
//   icon?: React.ReactNode; onClick: (e: React.MouseEvent) => void;
//   variant?: 'outlined' | 'filled';
// }> = ({ label, isOpen, color, isDark, icon, onClick, variant = 'outlined' }) => (
//   <Box
//     component="span"
//     onClick={onClick}
//     sx={{
//       display: 'inline-flex', alignItems: 'center', gap: 0.6,
//       px: 1.4, py: 0.65,
//       borderRadius: '10px',
//       border: `1.5px solid ${variant === 'filled' || isOpen ? color : alpha(color, 0.4)}`,
//       bgcolor: variant === 'filled' || isOpen ? color : 'transparent',
//       color: variant === 'filled' || isOpen ? (isDark ? '#000' : '#fff') : color,
//       fontWeight: 700, fontSize: 12,
//       cursor: 'pointer',
//       transition: 'all 0.18s',
//       userSelect: 'none',
//       '&:hover': {
//         bgcolor: variant === 'filled' || isOpen ? alpha(color, 0.85) : alpha(color, 0.1),
//       },
//     }}
//   >
//     {icon}
//     {label}
//     {isOpen
//       ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 14 }} />
//       : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14 }} />
//     }
//   </Box>
// );

// // ── Card de evaluación con dos paneles expandibles ────────────────────────────
// const EvaluacionCardExpand: React.FC<{
//   ev:             EvaluacionConProgreso;
//   index:          number;
//   dimColor:       string;
//   dimBgColor:     string;
//   isDark:         boolean;
//   // Panel de calificación
//   isCalOpen:      boolean;
//   lista:          ReturnType<typeof useIngresarNotas>['lista'];
//   notas:          ReturnType<typeof useIngresarNotas>['notas'];
//   isLoadingNotas: boolean;
//   isSaving:       boolean;
//   porcentajeCompletado: number;
//   onToggleCal:    () => void;
//   onSetNota:      ReturnType<typeof useIngresarNotas>['setNota'];
//   onMarcarAusente: ReturnType<typeof useIngresarNotas>['marcarAusente'];
//   onGuardar:      () => void;
// }> = ({
//   ev, index, dimColor, dimBgColor, isDark,
//   isCalOpen, lista, notas, isLoadingNotas, isSaving, porcentajeCompletado,
//   onToggleCal, onSetNota, onMarcarAusente, onGuardar,
// }) => {
//   const [isDetOpen, setIsDetOpen] = useState(false);

//   const tipo     = TIPOS_EVALUACION.find(t => t.value === ev.tipo);
//   const pct      = ev.total_alumnos > 0
//     ? Math.round((ev.con_nota / ev.total_alumnos) * 100) : 0;
//   const completa = pct === 100;
//   const barraGrad = completa
//     ? 'linear-gradient(90deg, #16a34a, #22c55e)'
//     : `linear-gradient(90deg, ${dimColor}, ${alpha(dimColor, 0.55)})`;

//   const anyOpen    = isCalOpen || isDetOpen;
//   const borderColor = anyOpen ? dimColor : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08);

//   return (
//     <Box
//       sx={{
//         borderRadius: '16px',
//         border: `1.5px solid ${borderColor}`,
//         overflow: 'hidden',
//         animation: `${cardAppear} 0.3s ease-out ${index * 0.07}s both`,
//         transition: 'border-color 0.2s, box-shadow 0.2s',
//         boxShadow: anyOpen
//           ? `0 0 0 3px ${alpha(dimColor, 0.1)}, 0 8px 24px ${alpha(dimColor, 0.14)}`
//           : isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
//       }}
//     >
//       {/* ── Cabecera siempre visible ── */}
//       <Box sx={{
//         p: 2.5,
//         bgcolor: anyOpen
//           ? isDark ? alpha(dimColor, 0.09) : alpha(dimBgColor, 0.4)
//           : isDark ? alpha('#fff', 0.02) : '#fff',
//         transition: 'background 0.2s',
//       }}>
//         {/* Fila 1: ícono + nombre + botones */}
//         <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
//           <Box sx={{
//             width: 40, height: 40, borderRadius: '11px', flexShrink: 0,
//             bgcolor: anyOpen ? alpha(dimColor, 0.18) : isDark ? alpha('#fff', 0.05) : alpha(dimColor, 0.07),
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             border: `1.5px solid ${anyOpen ? alpha(dimColor, 0.35) : 'transparent'}`,
//             transition: 'all 0.2s',
//           }}>
//             <AssignmentRoundedIcon sx={{
//               fontSize: 19,
//               color: anyOpen ? dimColor : isDark ? alpha('#fff', 0.35) : alpha(dimColor, 0.65),
//             }} />
//           </Box>

//           <Box sx={{ flex: 1, minWidth: 0 }}>
//             <Typography variant="subtitle2" fontWeight={800} noWrap
//               sx={{ color: anyOpen ? dimColor : 'text.primary', fontSize: 14, lineHeight: 1.3 }}>
//               {ev.nombre}
//             </Typography>

//             {/* Metadata */}
//             <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', alignItems: 'center', mt: 0.5 }}>
//               {tipo && (
//                 <Chip label={`${tipo.icon} ${tipo.label}`} size="small"
//                   sx={{ fontSize: 10, height: 19, bgcolor: isDark ? alpha('#fff', 0.07) : '#f3f4f6' }} />
//               )}
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
//                 <ScoreRoundedIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
//                 <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: 11 }}>
//                   {ev.puntaje_maximo} pts
//                 </Typography>
//               </Box>
//               {ev.peso_en_dimension != null && (
//                 <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
//                   · peso {ev.peso_en_dimension}
//                 </Typography>
//               )}
//               {ev.fecha && (
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
//                   <CalendarTodayRoundedIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
//                   <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
//                     {ev.fecha.slice(0, 10)}
//                   </Typography>
//                 </Box>
//               )}
//               {ev.foto_url && (
//                 <Tooltip title="Tiene imagen">
//                   <ImageRoundedIcon sx={{ fontSize: 13, color: isDark ? '#facc15' : '#0288d1' }} />
//                 </Tooltip>
//               )}
//               {ev.pdf_url && (
//                 <Tooltip title="Tiene PDF">
//                   <PictureAsPdfRoundedIcon sx={{ fontSize: 13, color: '#dc2626' }} />
//                 </Tooltip>
//               )}
//             </Box>
//           </Box>

//           {/* Botones de acción */}
//           <Box sx={{ display: 'flex', gap: 0.8, flexShrink: 0, alignItems: 'center' }}>
//             {completa && (
//               <Tooltip title="Todas las notas ingresadas">
//                 <CheckCircleRoundedIcon sx={{ fontSize: 17, color: '#16a34a' }} />
//               </Tooltip>
//             )}

//             {/* Ver detalle */}
//             <InlineBtn
//               label={isDetOpen ? 'Ocultar' : 'Ver detalle'}
//               isOpen={isDetOpen}
//               color={isDark ? alpha('#fff', 0.6) : '#64748b'}
//               isDark={isDark}
//               icon={<InfoOutlinedIcon sx={{ fontSize: 13 }} />}
//               onClick={e => { e.stopPropagation(); setIsDetOpen(o => !o); }}
//               variant="outlined"
//             />

//             {/* Calificar */}
//             <InlineBtn
//               label={isCalOpen ? 'Cerrar' : 'Calificar'}
//               isOpen={isCalOpen}
//               color={dimColor}
//               isDark={isDark}
//               icon={<EditRoundedIcon sx={{ fontSize: 13 }} />}
//               onClick={e => { e.stopPropagation(); onToggleCal(); }}
//               variant="filled"
//             />
//           </Box>
//         </Box>

//         {/* Barra de progreso */}
//         <Box>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
//             <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 600 }}>
//               {ev.con_nota}/{ev.total_alumnos} notas ingresadas
//               {ev.ausentes > 0 && ` · ${ev.ausentes} ausentes`}
//             </Typography>
//             <Typography variant="caption" fontWeight={800}
//               sx={{ fontSize: 10, color: completa ? '#16a34a' : dimColor }}>
//               {pct}%
//             </Typography>
//           </Box>
//           <Box sx={{
//             height: 5, borderRadius: 3,
//             bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07),
//             overflow: 'hidden',
//           }}>
//             <Box sx={{
//               height: '100%', borderRadius: 3, width: `${pct}%`,
//               background: barraGrad,
//               transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
//             }} />
//           </Box>
//           {completa && (
//             <Typography variant="caption"
//               sx={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.6, fontSize: 10 }}>
//               <CheckCircleRoundedIcon sx={{ fontSize: 11 }} /> ¡Todas las notas ingresadas!
//             </Typography>
//           )}
//         </Box>
//       </Box>

//       {/* ── PANEL DETALLE ── */}
//       <Collapse in={isDetOpen} timeout={260}>
//         <Box sx={{
//           borderTop: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha(dimColor, 0.15)}`,
//           bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
//         }}>
//           <Box sx={{
//             px: 2, py: 1.2,
//             borderBottom: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
//             display: 'flex', alignItems: 'center', gap: 0.8,
//           }}>
//             <InfoOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
//             <Typography variant="caption" fontWeight={800}
//               sx={{ fontSize: 10, color: 'text.secondary', letterSpacing: 0.5 }}>
//               DETALLE DE LA EVALUACIÓN
//             </Typography>
//           </Box>
//           <Box sx={{ p: 2 }}>
//             <DetalleEvaluacion ev={ev} dimColor={dimColor} isDark={isDark} />
//           </Box>
//         </Box>
//       </Collapse>

//       {/* Separador entre paneles si ambos abiertos */}
//       {isDetOpen && isCalOpen && (
//         <Divider sx={{ borderColor: alpha(dimColor, 0.2) }} />
//       )}

//       {/* ── PANEL CALIFICACIÓN ── */}
//       <Collapse in={isCalOpen} timeout={280}>
//         <Box sx={{
//           borderTop: `1.5px solid ${alpha(dimColor, 0.25)}`,
//           bgcolor: isDark ? alpha(dimColor, 0.04) : alpha(dimBgColor, 0.15),
//         }}>
//           <Box sx={{
//             px: 2.5, py: 1.5,
//             borderBottom: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha(dimColor, 0.12)}`,
//             display: 'flex', alignItems: 'center', gap: 1,
//           }}>
//             <EditRoundedIcon sx={{ fontSize: 14, color: dimColor }} />
//             <Typography variant="caption" fontWeight={800}
//               sx={{ color: dimColor, fontSize: 11, letterSpacing: 0.4 }}>
//               CALIFICANDO — {ev.nombre}
//             </Typography>
//           </Box>
//           <Box sx={{ p: 2 }}>
//             <IngresarNotas
//               lista={lista}
//               notas={notas}
//               evaluacion={ev}
//               isLoading={isLoadingNotas}
//               isSaving={isSaving}
//               porcentajeCompletado={porcentajeCompletado}
//               onSetNota={onSetNota}
//               onMarcarAusente={onMarcarAusente}
//               onGuardar={onGuardar}
//             />
//           </Box>
//         </Box>
//       </Collapse>
//     </Box>
//   );
// };


// // ── Página principal ───────────────────────────────────────────────────────────
// export default function CalificacionesDetailPage() {
//   const theme  = useTheme();
//   const isDark = theme.palette.mode === 'dark';
//   const router = useRouter();
//   const params = useParams();

//   const gold    = isDark ? '#facc15' : '#0288d1';
//   const goldEnd = isDark ? '#f59e0b' : '#01579b';
//   const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

//   const [asignacionId, periodoId] = String(params.id ?? '').split('-').map(Number);

//   // ── Datos base ──────────────────────────────────────────────────────────────
//   const { materias, isLoading: loadingMaterias } = useMisMateriasNotas();
//   const seleccionada: MateriaDocenteNotas | undefined = materias.find(
//     m => m.asignacion_id === asignacionId && m.periodo_evaluacion_id === periodoId
//   );

//   // ── Tab de dimensión ────────────────────────────────────────────────────────
//   const [dimTab, setDimTab] = useState(0);
//   const dimensionActiva: CodigoDimension = DIMENSIONES_ORDEN[dimTab];

//   // ── Evaluaciones (array estable, no porDimension) ──────────────────────────
//   const {
//     evaluaciones, isLoading: loadingEv, refrescar: refrescarEvaluaciones,
//   } = useEvaluaciones({
//     asignacion_docente_id: asignacionId,
//     periodo_evaluacion_id: periodoId,
//   });

//   // ── Progreso de notas ───────────────────────────────────────────────────────
//   const [evConProgreso, setEvConProgreso] = useState<Record<string, EvaluacionConProgreso[]>>({});
//   const [loadingProgreso, setLoadingProgreso] = useState(false);
//   const progresoRunning = useRef(false);

//   const cargarProgreso = useCallback(async (evList: Evaluacion[]) => {
//     if (progresoRunning.current) return;
//     if (evList.length === 0) { setEvConProgreso({}); return; }
//     progresoRunning.current = true;
//     setLoadingProgreso(true);
//     try {
//       const enriquecidas = await enriquecerConProgreso(
//         evList, seleccionada?.total_estudiantes ?? 0
//       );
//       const grouped: Record<string, EvaluacionConProgreso[]> = {};
//       enriquecidas.forEach(ev => {
//         const cod = ev.dimension_codigo ?? 'SIN';
//         if (!grouped[cod]) grouped[cod] = [];
//         grouped[cod].push(ev);
//       });
//       setEvConProgreso(grouped);
//     } finally {
//       setLoadingProgreso(false);
//       progresoRunning.current = false;
//     }
//   }, [seleccionada?.total_estudiantes]);

//   useEffect(() => {
//     cargarProgreso(evaluaciones);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [evaluaciones]);

//   // ── Evaluación de calificación abierta ─────────────────────────────────────
//   const [openCalId, setOpenCalId] = useState<number | null>(null);

//   // ── Hook de ingreso de notas ────────────────────────────────────────────────
//   const {
//     lista, notas, isLoading: loadingNotas, isSaving, porcentajeCompletado,
//     cargarLista, setNota, marcarAusente, guardarNotas, limpiar: limpiarNotas,
//   } = useIngresarNotas();

//   // ── Resumen ─────────────────────────────────────────────────────────────────
//   const {
//     notas: notasDimension, isLoading: loadingResumen, cargar: cargarResumen,
//   } = useResumenDimensiones();

//   const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });

//   // ── Toggle calificación ────────────────────────────────────────────────────
//   const handleToggleCal = useCallback(async (ev: EvaluacionConProgreso) => {
//     if (openCalId === ev.id) {
//       setOpenCalId(null); limpiarNotas(); return;
//     }
//     setOpenCalId(ev.id);
//     limpiarNotas();
//     await cargarLista(ev);
//   }, [openCalId, cargarLista, limpiarNotas]);

//   // ── Guardar notas ──────────────────────────────────────────────────────────
//   const handleGuardar = useCallback(async (evActiva: EvaluacionConProgreso) => {
//     if (!seleccionada) return;
//     const ok = await guardarNotas(seleccionada.grado_materia_id);
//     if (!ok) return;
//     setSnack({ open: true, msg: '✅ Notas guardadas correctamente' });
//     if (lista.length > 0 && seleccionada.periodo_evaluacion_id)
//       await cargarResumen(lista[0].matricula_id, seleccionada.grado_materia_id, seleccionada.periodo_evaluacion_id);
//     try {
//       const res = await calificacionesService.listarPorEvaluacion(evActiva.id);
//       const ausentes = res.data.calificaciones.filter(c => c.esta_ausente).length;
//       setEvConProgreso(prev => {
//         const cod = evActiva.dimension_codigo ?? 'SIN';
//         return {
//           ...prev,
//           [cod]: (prev[cod] ?? []).map(e =>
//             e.id === evActiva.id
//               ? { ...e, con_nota: res.data.con_nota, total_alumnos: res.data.total, ausentes }
//               : e
//           ),
//         };
//       });
//     } catch { /* silencioso */ }
//   }, [seleccionada, guardarNotas, lista, cargarResumen]);

//   // ── Cambio de tab ──────────────────────────────────────────────────────────
//   const handleDimTabChange = (_: React.SyntheticEvent, v: number) => {
//     setDimTab(v); setOpenCalId(null); limpiarNotas();
//   };

//   // Redirigir si materia inválida
//   useEffect(() => {
//     if (!loadingMaterias && materias.length > 0 && !seleccionada)
//       router.replace('/dashboard/docente/calificaciones');
//   }, [loadingMaterias, materias, seleccionada, router]);

//   if (loadingMaterias || !seleccionada) {
//     return (
//       <Box sx={{ minHeight: '100vh', py: 4 }}>
//         <Container maxWidth="xl">
//           <LinearProgress sx={{ borderRadius: 4, height: 4 }} />
//         </Container>
//       </Box>
//     );
//   }

//   const evDimActiva = evConProgreso[dimensionActiva] ?? [];
//   const cfg         = DIMENSIONES_CONFIG[dimensionActiva];

//   return (
//     <Box sx={{ minHeight: '100vh', py: 4 }}>
//       <Container maxWidth="lg">

//         {/* ══ HEADER ══ */}
//         <Fade in timeout={400}>
//           <Box sx={{ mb: 3 }}>
//             <Box
//               onClick={() => router.push('/dashboard/docente/calificaciones')}
//               sx={{
//                 display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
//                 cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
//                 '&:hover': { color: gold }, transition: 'color 0.15s',
//               }}
//             >
//               <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
//               Volver a mis materias
//             </Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//               <EditNoteRoundedIcon sx={{
//                 color: gold, fontSize: 34,
//                 animation: `${floatIcon} 2s ease-in-out infinite`,
//               }} />
//               <Box>
//                 <Typography variant="h1" sx={{
//                   fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
//                   fontWeight: 800, background: gradBg,
//                   WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2,
//                 }}>
//                   {seleccionada.materia_nombre}
//                 </Typography>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4, flexWrap: 'wrap' }}>
//                   <Chip label={seleccionada.trimestre_nombre ?? 'Sin trimestre'} size="small"
//                     sx={{ background: gradBg, color: isDark ? '#000' : '#fff', fontWeight: 700, fontSize: 11 }} />
//                   <Typography variant="caption" color="text.secondary" fontWeight={600}>
//                     {seleccionada.grado_nombre} "{seleccionada.paralelo_nombre}" · {seleccionada.turno_nombre}
//                     · {seleccionada.total_estudiantes} estudiantes
//                   </Typography>
//                 </Box>
//               </Box>
//             </Box>
//           </Box>
//         </Fade>

//         {/* ══ TABS ══ */}
//         <Fade in timeout={450}>
//           <Box sx={{ mb: 3 }}>
//             <Tabs value={dimTab} onChange={handleDimTabChange}
//               sx={{
//                 background: gradBg, borderRadius: '16px', p: 1,
//                 '& .MuiTab-root': {
//                   borderRadius: '12px', textTransform: 'none', fontWeight: 600, minHeight: 48,
//                   color: isDark ? alpha('#000', 0.7) : alpha('#fff', 0.8),
//                   '&:hover': { color: isDark ? '#000' : '#fff' },
//                 },
//                 '& .Mui-selected': { color: `${isDark ? '#000' : '#fff'} !important` },
//                 '& .MuiTabs-indicator': {
//                   backgroundColor: isDark ? '#000' : '#fff', height: 3, borderRadius: '3px 3px 0 0',
//                 },
//               }}
//             >
//               {DIMENSIONES_ORDEN.map(k => {
//                 const c   = DIMENSIONES_CONFIG[k];
//                 const evs = evConProgreso[k] ?? [];
//                 const count = evs.length;
//                 const todas = count > 0 && evs.every(e => e.total_alumnos > 0 && e.con_nota >= e.total_alumnos);
//                 return (
//                   <Tab key={k} label={
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <span>{c.label}</span>
//                       <Box sx={{
//                         fontSize: 10, fontWeight: 700,
//                         bgcolor: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.25),
//                         color: isDark ? '#000' : '#fff',
//                         borderRadius: '8px', px: 0.8, py: 0.2, lineHeight: 1.4,
//                       }}>{c.porcentaje}%</Box>
//                       {count > 0 && (
//                         <Box sx={{
//                           fontSize: 9, fontWeight: 800,
//                           bgcolor: todas ? alpha('#16a34a', 0.4) : isDark ? alpha('#000', 0.35) : alpha('#fff', 0.35),
//                           color: todas ? '#fff' : isDark ? '#000' : '#fff',
//                           borderRadius: '6px', px: 0.7, py: 0.1, lineHeight: 1.4,
//                           minWidth: 16, textAlign: 'center',
//                           display: 'flex', alignItems: 'center', gap: 0.3,
//                         }}>
//                           {todas && <CheckCircleRoundedIcon sx={{ fontSize: '9px !important' }} />}
//                           {count}
//                         </Box>
//                       )}
//                     </Box>
//                   } />
//                 );
//               })}
//             </Tabs>
//           </Box>
//         </Fade>

//         {/* ══ CONTENIDO ══ */}
//         <Fade in timeout={500} key={dimensionActiva}>
//           <Box sx={{ animation: `${fadeUp} 0.28s ease-out` }}>

//             {/* Sub-encabezado dimensión */}
//             <Box sx={{
//               display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//               mb: 2, px: 0.5,
//             }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
//                 <Box sx={{
//                   width: 10, height: 10, borderRadius: '50%', bgcolor: cfg.color,
//                   boxShadow: `0 0 8px ${alpha(cfg.color, 0.6)}`,
//                 }} />
//                 <Typography variant="body1" fontWeight={800} sx={{ color: cfg.color }}>
//                   {cfg.label}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
//                   {cfg.descripcion} · {cfg.porcentaje}% de la nota final
//                 </Typography>
//               </Box>
//               <Box onClick={() => refrescarEvaluaciones()}
//                 sx={{
//                   fontSize: 12, fontWeight: 600, color: 'text.disabled', cursor: 'pointer',
//                   display: 'flex', alignItems: 'center', gap: 0.4,
//                   '&:hover': { color: cfg.color }, transition: 'color 0.15s',
//                 }}>
//                 ↺ Refrescar
//               </Box>
//             </Box>

//             {/* Loading */}
//             {(loadingEv || loadingProgreso) ? (
//               <Box sx={{ py: 6, textAlign: 'center' }}>
//                 <CircularProgress size={28} sx={{ color: cfg.color }} />
//                 <Typography variant="caption" color="text.secondary"
//                   sx={{ display: 'block', mt: 1.5 }}>Cargando evaluaciones...</Typography>
//               </Box>

//             ) : evDimActiva.length === 0 ? (
//               <Box sx={{
//                 textAlign: 'center', py: 8, borderRadius: '16px',
//                 border: `2px dashed ${alpha(cfg.color, 0.3)}`,
//                 bgcolor: isDark ? alpha(cfg.color, 0.03) : alpha(cfg.bgColor, 0.3),
//               }}>
//                 <HourglassEmptyRoundedIcon sx={{ fontSize: 40, color: alpha(cfg.color, 0.35), mb: 1 }} />
//                 <Typography variant="body1" sx={{ color: cfg.color, fontWeight: 700, mb: 0.5 }}>
//                   Sin evaluaciones en {cfg.label}
//                 </Typography>
//                 <Typography variant="body2" color="text.disabled">
//                   Creá evaluaciones desde el módulo de{' '}
//                   <Box component="span"
//                     onClick={() => router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}`)}
//                     sx={{ fontWeight: 700, cursor: 'pointer', color: cfg.color, textDecoration: 'underline' }}>
//                     Notas
//                   </Box>
//                 </Typography>
//               </Box>

//             ) : (
//               <Stack spacing={2}>
//                 {evDimActiva.map((ev, i) => (
//                   <EvaluacionCardExpand
//                     key={ev.id}
//                     ev={ev} index={i}
//                     dimColor={cfg.color} dimBgColor={cfg.bgColor}
//                     isDark={isDark}
//                     isCalOpen={openCalId === ev.id}
//                     lista={lista} notas={notas}
//                     isLoadingNotas={loadingNotas}
//                     isSaving={isSaving}
//                     porcentajeCompletado={porcentajeCompletado}
//                     onToggleCal={() => handleToggleCal(ev)}
//                     onSetNota={setNota}
//                     onMarcarAusente={marcarAusente}
//                     onGuardar={() => handleGuardar(ev)}
//                   />
//                 ))}
//               </Stack>
//             )}

//             {/* Resumen al fondo */}
//             {(notasDimension.length > 0 || loadingResumen) && (
//               <Box sx={{
//                 mt: 4, borderRadius: '16px',
//                 border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
//                 overflow: 'hidden',
//                 bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
//                 boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
//               }}>
//                 <Box sx={{
//                   px: 2.5, py: 2,
//                   borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
//                   display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                   bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#f8f9fa', 0.8),
//                 }}>
//                   <Box>
//                     <Typography variant="subtitle1" fontWeight={800}>Resumen del Trimestre</Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       Nota por dimensión · {seleccionada.trimestre_nombre}
//                     </Typography>
//                   </Box>
//                   {seleccionada.aprobados > 0 && (
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                       <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
//                       <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
//                         {seleccionada.aprobados} aprobados
//                       </Typography>
//                     </Box>
//                   )}
//                 </Box>
//                 <Box sx={{ p: 2.5 }}>
//                   <ResumenDimensiones notas={notasDimension} isLoading={loadingResumen} />
//                 </Box>
//               </Box>
//             )}
//           </Box>
//         </Fade>

//       </Container>

//       <Snackbar open={snack.open} autoHideDuration={3500}
//         onClose={() => setSnack(s => ({ ...s, open: false }))}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
//         <Alert severity="success" onClose={() => setSnack(s => ({ ...s, open: false }))}
//           sx={{
//             borderRadius: 2, fontWeight: 600, bgcolor: '#16a34a', color: '#fff',
//             '& .MuiAlert-icon': { color: '#fff' },
//             '& .MuiAlert-action .MuiIconButton-root': { color: '#fff' },
//           }}>
//           {snack.msg}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }
'use client';
// app/dashboard/docente/calificaciones/[id]/page.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Chip, Tabs, Tab, Snackbar, Alert,
  Fade, LinearProgress, CircularProgress, Collapse, useTheme, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import EditNoteRoundedIcon        from '@mui/icons-material/EditNoteRounded';
import ArrowBackRoundedIcon       from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon     from '@mui/icons-material/CheckCircleRounded';
import InfoOutlinedIcon           from '@mui/icons-material/InfoOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon   from '@mui/icons-material/KeyboardArrowUpRounded';

import { useParams, useRouter } from 'next/navigation';
import {
  useMisMateriasNotas,
  useEvaluaciones,
  useResumenDimensiones,
} from '@/hooks/useNotas';
import {
  MateriaDocenteNotas,
  Evaluacion,
  DIMENSIONES_CONFIG,
  DIMENSIONES_ORDEN,
  CodigoDimension,
  CalificacionEstudiante,
  RegistroCalificacionItem,
} from '@/types/notasTypes';
import { calificacionesService, notasCalculoService } from '@/services/notasService';
import { ResumenDimensiones } from '@/components/docente/notas/IngresarNotas';
import { GradeGrid } from '@/components/docente/notas/GradeGrid';
import { EvaluacionConProgreso } from '@/components/docente/notas/GradeGridTypes';
import { toast } from 'react-hot-toast';

// ── Animaciones ────────────────────────────────────────────────────────────────
const floatIcon = keyframes`
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%       { transform: translateY(-5px) rotate(2deg); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Enriquecer evaluaciones con progreso de notas ─────────────────────────────
async function enriquecerConProgreso(
  evaluaciones: Evaluacion[],
  fallbackTotal: number,
): Promise<EvaluacionConProgreso[]> {
  const results = await Promise.allSettled(
    evaluaciones.map(ev =>
      calificacionesService.listarPorEvaluacion(ev.id).then(res => ({
        con_nota:      res.data.con_nota,
        total_alumnos: res.data.total,
        ausentes:      res.data.calificaciones.filter((c: any) => c.esta_ausente).length,
      }))
    )
  );
  return evaluaciones.map((ev, i) => {
    const r = results[i];
    return r.status === 'fulfilled'
      ? { ...ev, ...r.value }
      : { ...ev, con_nota: 0, total_alumnos: fallbackTotal, ausentes: 0 };
  });
}

// ── Tipo de mapa de notas para la grilla ──────────────────────────────────────
// clave: `${evaluacion_id}_${matricula_id}`
type NotasGrid = Record<string, RegistroCalificacionItem & { evaluacion_id: number }>;

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function CalificacionesDetailPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const params = useParams();

  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  const [asignacionId, periodoId] = String(params.id ?? '').split('-').map(Number);

  // ── Datos base ──────────────────────────────────────────────────────────────
  const { materias, isLoading: loadingMaterias } = useMisMateriasNotas();
  const seleccionada: MateriaDocenteNotas | undefined = materias.find(
    m => m.asignacion_id === asignacionId && m.periodo_evaluacion_id === periodoId
  );

  // ── Tab de dimensión ────────────────────────────────────────────────────────
  const [dimTab, setDimTab] = useState(0);
  const dimensionActiva: CodigoDimension = DIMENSIONES_ORDEN[dimTab];

  // ── Evaluaciones ────────────────────────────────────────────────────────────
  const {
    evaluaciones, isLoading: loadingEv, refrescar: refrescarEvaluaciones,
  } = useEvaluaciones({
    asignacion_docente_id: asignacionId,
    periodo_evaluacion_id: periodoId,
  });

  // ── Evaluaciones con progreso (agrupadas por dimensión) ────────────────────
  const [evConProgreso, setEvConProgreso] = useState<Record<string, EvaluacionConProgreso[]>>({});
  const [loadingProgreso, setLoadingProgreso] = useState(false);
  const progresoRunning = useRef(false);

  const cargarProgreso = useCallback(async (evList: Evaluacion[]) => {
    if (progresoRunning.current) return;
    if (evList.length === 0) { setEvConProgreso({}); return; }
    progresoRunning.current = true;
    setLoadingProgreso(true);
    try {
      const enriquecidas = await enriquecerConProgreso(
        evList, seleccionada?.total_estudiantes ?? 0
      );
      const grouped: Record<string, EvaluacionConProgreso[]> = {};
      enriquecidas.forEach(ev => {
        const cod = ev.dimension_codigo ?? 'SIN';
        if (!grouped[cod]) grouped[cod] = [];
        grouped[cod].push(ev);
      });
      setEvConProgreso(grouped);
    } finally {
      setLoadingProgreso(false);
      progresoRunning.current = false;
    }
  }, [seleccionada?.total_estudiantes]);

  useEffect(() => {
    cargarProgreso(evaluaciones);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluaciones]);

  // ── Lista de estudiantes (compartida para toda la dimensión) ───────────────
  // Se carga una sola vez al cambiar de dimensión o cuando evaluaciones estén listas
  const [lista, setLista] = useState<CalificacionEstudiante[]>([]);
  const [loadingLista, setLoadingLista] = useState(false);
  const listaLoadedFor = useRef<number | null>(null); // id de la 1ra evaluación cargada

  const cargarLista = useCallback(async (primeraEvId: number) => {
    if (listaLoadedFor.current === primeraEvId) return;
    listaLoadedFor.current = primeraEvId;
    setLoadingLista(true);
    try {
      const res = await calificacionesService.listarPorEvaluacion(primeraEvId);
      // Tomamos la lista de estudiantes de esta respuesta (es igual para todas)
      setLista(res.data.calificaciones);
    } catch {
      setLista([]);
    } finally {
      setLoadingLista(false);
    }
  }, []);

  // ── Mapa de notas para la grilla ───────────────────────────────────────────
  // Se carga al cambiar de dimensión, prepobleando con las notas existentes
  const [notasGrid, setNotasGrid] = useState<NotasGrid>({});
  const [loadingNotasGrid, setLoadingNotasGrid] = useState(false);

  const cargarNotasGrid = useCallback(async (evs: EvaluacionConProgreso[]) => {
    if (evs.length === 0) { setNotasGrid({}); return; }
    setLoadingNotasGrid(true);
    try {
      const results = await Promise.allSettled(
        evs.map(ev => calificacionesService.listarPorEvaluacion(ev.id))
      );
      const nuevo: NotasGrid = {};
      results.forEach((r, i) => {
        if (r.status !== 'fulfilled') return;
        const ev = evs[i];
        r.value.data.calificaciones.forEach((c: CalificacionEstudiante) => {
          if (c.puntaje_obtenido !== null && c.puntaje_obtenido !== undefined) {
            const key = `${ev.id}_${c.matricula_id}`;
            nuevo[key] = {
              evaluacion_id:    ev.id,
              matricula_id:     c.matricula_id,
              puntaje_obtenido: c.puntaje_obtenido,
              esta_ausente:     c.esta_ausente ?? false,
              observacion:      c.observacion,
            };
          } else if (c.esta_ausente) {
            const key = `${ev.id}_${c.matricula_id}`;
            nuevo[key] = {
              evaluacion_id:    ev.id,
              matricula_id:     c.matricula_id,
              puntaje_obtenido: 0,
              esta_ausente:     true,
            };
          }
        });
      });
      setNotasGrid(nuevo);
      // También cargamos lista de estudiantes con la primera evaluación
      if (evs.length > 0) await cargarLista(evs[0].id);
    } finally {
      setLoadingNotasGrid(false);
    }
  }, [cargarLista]);

  // Recargar cuando cambia la dimensión activa y ya tenemos evaluaciones con progreso
  const prevDimRef = useRef<string | null>(null);
  useEffect(() => {
    const evsDim = evConProgreso[dimensionActiva] ?? [];
    if (evsDim.length > 0 && prevDimRef.current !== dimensionActiva) {
      prevDimRef.current = dimensionActiva;
      listaLoadedFor.current = null;
      cargarNotasGrid(evsDim);
    }
  }, [evConProgreso, dimensionActiva, cargarNotasGrid]);

  // ── Callbacks de edición ───────────────────────────────────────────────────
  const handleSetNota = useCallback((
    evaluacion_id: number,
    matricula_id: number,
    datos: Partial<RegistroCalificacionItem>,
  ) => {
    const key = `${evaluacion_id}_${matricula_id}`;
    setNotasGrid(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { evaluacion_id, matricula_id, puntaje_obtenido: 0 }),
        evaluacion_id,
        ...datos,
      } as NotasGrid[string],
    }));
  }, []);

  const handleMarcarAusente = useCallback((
    evaluacion_id: number,
    matricula_id: number,
    ausente: boolean,
  ) => {
    const key = `${evaluacion_id}_${matricula_id}`;
    setNotasGrid(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { evaluacion_id, matricula_id }),
        evaluacion_id,
        matricula_id,
        puntaje_obtenido: ausente ? 0 : (prev[key]?.puntaje_obtenido ?? 0),
        esta_ausente: ausente,
      } as NotasGrid[string],
    }));
  }, []);

  // ── Guardar TODAS las notas modificadas de la dimensión ───────────────────
  const [isSaving, setIsSaving] = useState(false);

  const handleGuardar = useCallback(async () => {
    if (!seleccionada) return;
    const evsDim = evConProgreso[dimensionActiva] ?? [];
    if (evsDim.length === 0) return;

    setIsSaving(true);
    try {
      // Agrupar notas por evaluación
      const porEv: Record<number, RegistroCalificacionItem[]> = {};
      Object.values(notasGrid).forEach(n => {
        if (!porEv[n.evaluacion_id]) porEv[n.evaluacion_id] = [];
        const valido = n.esta_ausente === true || (
          typeof n.puntaje_obtenido === 'number' &&
          !isNaN(n.puntaje_obtenido) && n.puntaje_obtenido >= 0
        );
        if (valido) {
          porEv[n.evaluacion_id].push({
            matricula_id:     n.matricula_id,
            puntaje_obtenido: n.esta_ausente ? 0 : Number(n.puntaje_obtenido),
            esta_ausente:     n.esta_ausente ?? false,
            observacion:      n.observacion,
          });
        }
      });

      // Guardar evaluación por evaluación
      let totalGuardadas = 0;
      await Promise.allSettled(
        evsDim.map(async ev => {
          const registros = porEv[ev.id];
          if (!registros || registros.length === 0) return;
          await calificacionesService.registrarMasivo({
            evaluacion_id: ev.id,
            registros,
          });
          totalGuardadas += registros.length;
        })
      );

      // Recalcular notas finales para todos los estudiantes
      const matriculaIds = [...new Set(Object.values(notasGrid).map(n => n.matricula_id))];
      await Promise.allSettled(
        matriculaIds.map(mid =>
          notasCalculoService.calcular(mid, seleccionada.grado_materia_id, periodoId)
        )
      );

      toast.success(`✅ ${totalGuardadas} notas guardadas`);

      // Recargar progreso
      await cargarProgreso(evaluaciones);
      await cargarNotasGrid(evsDim);

    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar notas');
    } finally {
      setIsSaving(false);
    }
  }, [seleccionada, evConProgreso, dimensionActiva, notasGrid, periodoId, evaluaciones, cargarProgreso, cargarNotasGrid]);

  // ── Resumen ─────────────────────────────────────────────────────────────────
  const {
    notas: notasDimension, isLoading: loadingResumen,
  } = useResumenDimensiones();

  // ── Panel de resumen (collapsible) ─────────────────────────────────────────
  const [resumenOpen, setResumenOpen] = useState(false);

  // ── Cambio de tab ──────────────────────────────────────────────────────────
  const handleDimTabChange = (_: React.SyntheticEvent, v: number) => {
    setDimTab(v);
    prevDimRef.current = null;
    listaLoadedFor.current = null;
  };

  // Redirigir si materia inválida
  useEffect(() => {
    if (!loadingMaterias && materias.length > 0 && !seleccionada)
      router.replace('/dashboard/docente/calificaciones');
  }, [loadingMaterias, materias, seleccionada, router]);

  if (loadingMaterias || !seleccionada) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <LinearProgress sx={{ borderRadius: 4, height: 4 }} />
        </Container>
      </Box>
    );
  }

  const evDimActiva = evConProgreso[dimensionActiva] ?? [];
  const cfg         = DIMENSIONES_CONFIG[dimensionActiva];

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 3 }}>
            <Box
              onClick={() => router.push('/dashboard/docente/calificaciones')}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                '&:hover': { color: gold }, transition: 'color 0.15s',
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Volver a mis materias
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EditNoteRoundedIcon sx={{
                color: gold, fontSize: 34,
                animation: `${floatIcon} 2s ease-in-out infinite`,
              }} />
              <Box>
                <Typography variant="h1" sx={{
                  fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                  fontWeight: 800, background: gradBg,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2,
                }}>
                  {seleccionada.materia_nombre}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4, flexWrap: 'wrap' }}>
                  <Chip label={seleccionada.trimestre_nombre ?? 'Sin trimestre'} size="small"
                    sx={{ background: gradBg, color: isDark ? '#000' : '#fff', fontWeight: 700, fontSize: 11 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {seleccionada.grado_nombre} "{seleccionada.paralelo_nombre}" · {seleccionada.turno_nombre}
                    · {seleccionada.total_estudiantes} estudiantes
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ══ TABS DE DIMENSIÓN ══ */}
        <Fade in timeout={450}>
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={dimTab}
              onChange={handleDimTabChange}
              sx={{
                background: gradBg, borderRadius: '16px', p: 1,
                '& .MuiTab-root': {
                  borderRadius: '12px', textTransform: 'none', fontWeight: 600, minHeight: 48,
                  color: isDark ? alpha('#000', 0.7) : alpha('#fff', 0.8),
                  '&:hover': { color: isDark ? '#000' : '#fff' },
                },
                '& .Mui-selected': { color: `${isDark ? '#000' : '#fff'} !important` },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#000' : '#fff', height: 3, borderRadius: '3px 3px 0 0',
                },
              }}
            >
              {DIMENSIONES_ORDEN.map(k => {
                const c    = DIMENSIONES_CONFIG[k];
                const evs  = evConProgreso[k] ?? [];
                const count = evs.length;
                const todas = count > 0 && evs.every(e => e.total_alumnos > 0 && e.con_nota >= e.total_alumnos);
                return (
                  <Tab key={k} label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{c.label}</span>
                      <Box sx={{
                        fontSize: 10, fontWeight: 700,
                        bgcolor: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.25),
                        color: isDark ? '#000' : '#fff',
                        borderRadius: '8px', px: 0.8, py: 0.2, lineHeight: 1.4,
                      }}>{c.porcentaje}%</Box>
                      {count > 0 && (
                        <Box sx={{
                          fontSize: 9, fontWeight: 800,
                          bgcolor: todas ? alpha('#16a34a', 0.4) : isDark ? alpha('#000', 0.35) : alpha('#fff', 0.35),
                          color: todas ? '#fff' : isDark ? '#000' : '#fff',
                          borderRadius: '6px', px: 0.7, py: 0.1, lineHeight: 1.4,
                          minWidth: 16, textAlign: 'center',
                          display: 'flex', alignItems: 'center', gap: 0.3,
                        }}>
                          {todas && <CheckCircleRoundedIcon sx={{ fontSize: '9px !important' }} />}
                          {count}
                        </Box>
                      )}
                    </Box>
                  } />
                );
              })}
            </Tabs>
          </Box>
        </Fade>

        {/* ══ CONTENIDO ══ */}
        <Fade in timeout={500} key={dimensionActiva}>
          <Box sx={{ animation: `${fadeUp} 0.28s ease-out` }}>

            {/* Sub-encabezado dimensión */}
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              mb: 2, px: 0.5,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%', bgcolor: cfg.color,
                  boxShadow: `0 0 8px ${alpha(cfg.color, 0.6)}`,
                }} />
                <Typography variant="body1" fontWeight={800} sx={{ color: cfg.color }}>
                  {cfg.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {cfg.descripcion} · {cfg.porcentaje}% de la nota final
                </Typography>
              </Box>
              <Box
                onClick={() => refrescarEvaluaciones()}
                sx={{
                  fontSize: 12, fontWeight: 600, color: 'text.disabled', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 0.4,
                  '&:hover': { color: cfg.color }, transition: 'color 0.15s',
                }}
              >
                ↺ Refrescar
              </Box>
            </Box>

            {/* Loading evaluaciones/progreso */}
            {(loadingEv || loadingProgreso) ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={28} sx={{ color: cfg.color }} />
                <Typography variant="caption" color="text.secondary"
                  sx={{ display: 'block', mt: 1.5 }}>Cargando evaluaciones...</Typography>
              </Box>
            ) : (
              /* ══ GRILLA ══ */
              <GradeGrid
                dimensionCodigo={dimensionActiva}
                lista={lista}
                evaluaciones={evDimActiva}
                notas={notasGrid}
                isLoadingLista={loadingLista || loadingNotasGrid}
                isSaving={isSaving}
                onSetNota={handleSetNota}
                onMarcarAusente={handleMarcarAusente}
                onGuardar={handleGuardar}
              />
            )}

            {/* ── Resumen collapsible ── */}
            {(notasDimension.length > 0 || loadingResumen) && (
              <Box sx={{
                mt: 4, borderRadius: '16px',
                border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                overflow: 'hidden',
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
              }}>
                <Box
                  onClick={() => setResumenOpen(o => !o)}
                  sx={{
                    px: 2.5, py: 2, cursor: 'pointer',
                    borderBottom: resumenOpen
                      ? `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`
                      : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#f8f9fa', 0.8),
                    '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : '#f3f4f6' },
                    transition: 'background 0.15s',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>Resumen del Trimestre</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Nota por dimensión · {seleccionada.trimestre_nombre}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {seleccionada.aprobados > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                          {seleccionada.aprobados} aprobados
                        </Typography>
                      </Box>
                    )}
                    {resumenOpen
                      ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                      : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />}
                  </Box>
                </Box>
                <Collapse in={resumenOpen}>
                  <Box sx={{ p: 2.5 }}>
                    <ResumenDimensiones notas={notasDimension} isLoading={loadingResumen} />
                  </Box>
                </Collapse>
              </Box>
            )}
          </Box>
        </Fade>

      </Container>
    </Box>
  );
}