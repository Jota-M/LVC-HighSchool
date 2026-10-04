// components/reservaCupo/ReciboReservaCard.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  useTheme,
  alpha,
  Grid,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  WhatsApp as WhatsAppIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  CancelOutlined as CancelIcon,
  WarningAmber as WarningAmberIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { ReservaCupoData, ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
import reservaCupoService from '@/services/reservaCupoService';

interface ReciboReservaCardProps {
  reservas: (ReservaCupoData | ReservaCupoHermanoData)[];
  onNuevaReserva?: () => void;
}

export const ReciboReservaCard: React.FC<ReciboReservaCardProps> = ({
  reservas,
  onNuevaReserva
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reciboRef = useRef<HTMLDivElement>(null);

  const [listaReservas, setListaReservas] = useState<(ReservaCupoData | ReservaCupoHermanoData)[]>(reservas);
  const [tabIndex, setTabIndex] = useState(0);

  // Estados para diálogo de solicitud de anulación
  const [openAnulacionDialog, setOpenAnulacionDialog] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [ciEstudianteConfirmacion, setCiEstudianteConfirmacion] = useState('');
  const [isSubmittingAnulacion, setIsSubmittingAnulacion] = useState(false);
  const [errorAnulacion, setErrorAnulacion] = useState<string | null>(null);
  const [exitoAnulacionMsg, setExitoAnulacionMsg] = useState<string | null>(null);

  useEffect(() => {
    setListaReservas(reservas);
  }, [reservas]);

  if (!listaReservas || listaReservas.length === 0) return null;

  const reserva: any = listaReservas[tabIndex] || listaReservas[0];

  const esHermano = Boolean(
    reserva.hermano_regular_id ||
    reserva.codigo_reserva?.startsWith('HER-') ||
    reserva.codigo_reserva?.startsWith('ESP-')
  );
  const esEspera = esHermano && (reserva.estado === 'en_espera' || reserva.codigo_reserva?.startsWith('ESP-'));
  const esNoContinua = reserva.estado === 'no_continua';
  const esSolicitudAnulacion = reserva.estado === 'solicitud_anulacion';
  const esAnulada = reserva.estado === 'anulada' || reserva.estado === 'cancelada';
  const esConfirmada = reserva.estado === 'confirmada';

  const estudianteNombreCompleto = reserva.estudiante_nombre_completo ||
    [reserva.nombres, reserva.apellido_paterno, reserva.apellido_materno].filter(Boolean).join(' ');

  const estudianteCI = reserva.estudiante_ci || reserva.ci || 'S/N';
  const gradoDestino = reserva.grado_destino_nombre || reserva.grado_solicitado_nombre || reserva.grado_nombre || 'N/A';
  const nivelDestino = reserva.nivel_destino_nombre || reserva.nivel_solicitado_nombre || reserva.nivel_nombre || 'N/A';
  const turnoDestino = reserva.turno_destino_nombre || reserva.turno_solicitado_nombre || reserva.turno_nombre || 'Mañana';
  const fechaEmision = reserva.fecha_reserva_formateada ||
    (reserva.created_at ? new Date(reserva.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('es-BO'));

  // Tokens de diseño idénticos a PreInscripción
  const brandPrimary = isDark ? '#facc15' : '#0288d1';
  const brandDeep = isDark ? '#f59e0b' : '#01579b';
  const brandTextContained = isDark ? '#000000' : '#ffffff';
  const brandGradient = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #01579b 0%, #0288d1 100%)';
  const brandGradientHover = isDark
    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    : 'linear-gradient(135deg, #014377 0%, #0277bd 100%)';

  const darkBlue = '#01579b';
  const goldBorder = '#f59e0b';
  const accentGreen = '#10b981';
  const accentRed = '#ef4444';
  const accentAmber = '#f59e0b';

  const handleDescargarPDF = () => {
    reservaCupoService.descargarPDF(reserva.codigo_reserva);
  };

  const handleImprimir = () => {
    const url = reservaCupoService.getReciboPDFUrl(reserva.codigo_reserva, true);
    window.open(url, '_blank');
  };

  const handleWhatsApp = () => {
    const tel = (reserva.tutor_telefono || '').replace(/\D/g, '');
    const numWhatsapp = tel.startsWith('591') ? tel : `591${tel}`;
    const tipoDoc = esNoContinua
      ? 'Constancia de No Continuidad'
      : esEspera
        ? `Constancia de Lista de Espera (Puesto #${reserva.posicion_espera || 1})`
        : esHermano
          ? 'Reserva de Cupo (Hermano - Prioridad Familiar)'
          : 'Reserva de Cupo';
    const texto = encodeURIComponent(
      `¡Hola! Compartimos el comprobante oficial de ${tipoDoc} en la U.E.P. La Voz de Cristo:\n\n` +
      `🎓 *Estudiante / Postulante:* ${estudianteNombreCompleto}\n` +
      `📌 *CI:* ${estudianteCI}\n` +
      `🏫 *Gestión:* ${reserva.periodo_nombre || '2027'}\n` +
      `📚 *Grado:* ${gradoDestino}\n` +
      `📋 *Estado:* ${esNoContinua ? 'No continuará en la gestión' : esEspera ? `Lista de Espera Puesto #${reserva.posicion_espera || 1}` : 'Cupo asegurado'}\n` +
      `👤 *Registrado por:* ${reserva.tutor_nombre} (${reserva.tutor_parentesco})\n` +
      `🔖 *Nº Recibo:* ${reserva.codigo_recibo || reserva.codigo_reserva}\n` +
      `🎫 *Código:* ${reserva.codigo_reserva}\n\n` +
      `Conserve este comprobante para sus registros personales.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${numWhatsapp}&text=${texto}`, '_blank');
  };

  const handleAbrirAnulacion = () => {
    setMotivoAnulacion('');
    setCiEstudianteConfirmacion('');
    setErrorAnulacion(null);
    setOpenAnulacionDialog(true);
  };

  const handleConfirmarSolicitudAnulacion = async () => {
    if (!ciEstudianteConfirmacion.trim()) {
      setErrorAnulacion('Debe ingresar el Carnet de Identidad (CI) del estudiante');
      return;
    }
    if (!motivoAnulacion.trim()) {
      setErrorAnulacion('Debe ingresar el motivo de la anulación');
      return;
    }

    setIsSubmittingAnulacion(true);
    setErrorAnulacion(null);

    try {
      const res = await reservaCupoService.solicitarAnulacion({
        codigo: reserva.codigo_reserva,
        motivo: motivoAnulacion.trim(),
        estudiante_ci: ciEstudianteConfirmacion.trim(),
        ci: ciEstudianteConfirmacion.trim()
      });

      const updated = res.data;

      // Actualizar lista local
      setListaReservas(prev =>
        prev.map(r => (r.id === updated.id ? { ...r, ...updated, estado: 'solicitud_anulacion' } : r))
      );

      setExitoAnulacionMsg(res.message || '¡Solicitud de anulación enviada con éxito! Será revisada y procesada por Dirección / Secretaría.');
      setOpenAnulacionDialog(false);
    } catch (err: any) {
      console.error('Error al solicitar anulación:', err);
      setErrorAnulacion(err.response?.data?.message || err.message || 'Error al procesar la solicitud de anulación');
    } finally {
      setIsSubmittingAnulacion(false);
    }
  };

  const qrDataText = encodeURIComponent(
    `LVC-${esNoContinua ? 'NOC' : 'RES'}:${reserva.codigo_reserva}|EST:${reserva.estudiante_ci}|ESTADO:${reserva.estado}|TUTOR:${reserva.tutor_nombre}|GESTION:${reserva.periodo_nombre}`
  );
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${qrDataText}`;

  return (
    <Box sx={{ width: '100%', maxWidth: 820, mx: 'auto', my: 2 }}>
      {/* Mensaje de éxito al enviar solicitud de anulación */}
      {exitoAnulacionMsg && (
        <Alert
          severity="warning"
          onClose={() => setExitoAnulacionMsg(null)}
          sx={{ mb: 2.5, borderRadius: '16px', fontWeight: 600 }}
        >
          {exitoAnulacionMsg}
        </Alert>
      )}

      {/* Alerta contextual según estado */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: '18px',
          bgcolor: esNoContinua
            ? isDark ? alpha(accentRed, 0.15) : '#fef2f2'
            : esSolicitudAnulacion
              ? isDark ? alpha(accentAmber, 0.15) : '#fffbeb'
              : esAnulada
                ? isDark ? alpha(accentRed, 0.15) : '#fef2f2'
                : esEspera
                  ? isDark ? alpha(accentAmber, 0.15) : '#fffbeb'
                  : isDark ? alpha(accentGreen, 0.15) : '#f0fdf4',
          border: `1.5px solid ${esNoContinua || esAnulada ? accentRed : esSolicitudAnulacion || esEspera ? accentAmber : accentGreen
            }`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: `0 8px 25px ${esNoContinua || esAnulada
            ? 'rgba(239, 68, 68, 0.15)'
            : esSolicitudAnulacion || esEspera
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(16, 185, 129, 0.15)'
            }`
        }}
      >
        {esNoContinua ? (
          <CancelIcon sx={{ color: accentRed, fontSize: 40 }} />
        ) : esSolicitudAnulacion ? (
          <WarningAmberIcon sx={{ color: accentAmber, fontSize: 40 }} />
        ) : esAnulada ? (
          <CancelIcon sx={{ color: accentRed, fontSize: 40 }} />
        ) : esEspera ? (
          <WarningAmberIcon sx={{ color: accentAmber, fontSize: 40 }} />
        ) : (
          <CheckCircleIcon sx={{ color: accentGreen, fontSize: 40 }} />
        )}

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={800}
            color={
              esNoContinua || esAnulada
                ? isDark ? '#f87171' : '#b91c1c'
                : esSolicitudAnulacion || esEspera
                  ? isDark ? '#fbbf24' : '#b45309'
                  : isDark ? '#34d399' : '#047857'
            }
          >
            {esNoContinua
              ? 'Constancia Oficial de No Continuidad Registrada'
              : esSolicitudAnulacion
                ? 'Solicitud de Anulación de Reserva en Trámite'
                : esAnulada
                  ? 'Esta Reserva de Cupo se Encuentra Anulada'
                  : esEspera
                    ? `Prioridad Familiar: Solicitud en Lista de Espera (Puesto #${reserva.posicion_espera || 1})`
                    : esHermano
                      ? '¡Cupo Confirmado para Hermano/a (Prioridad Familiar)!'
                      : listaReservas.length > 1
                        ? `¡Reserva Confirmada para ${listaReservas.length} Estudiantes!`
                        : '¡Reserva de Cupo Registrada Exitosamente!'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {esNoContinua
              ? 'Se registró formalmente la decisión voluntaria de no renovar el cupo escolar para la Gestión 2027. Puede descargar su comprobante oficial a continuación.'
              : esSolicitudAnulacion
                ? 'Su solicitud de anulación fue recibida y se encuentra en proceso de revisión por Dirección / Secretaría.'
                : esAnulada
                  ? 'La reserva para este estudiante fue anulada formalmente. Para cualquier restitución o reactivación presencial, comuníquese con Secretaría.'
                  : esEspera
                    ? `Se ha registrado al postulante en la lista de espera con prioridad familiar. Al cumplirse el plazo de confirmación de regulares, los cupos no ratificados se adjudicarán siguiendo estrictamente este orden.`
                    : esHermano
                      ? `El cupo para el hermano/a ha sido asegurado con éxito gracias a la vacancia disponible. Conserve el recibo para el periodo de formalización de matrícula.`
                      : 'El cupo para la Gestión 2027 ha sido asegurado. A continuación tiene el Recibo Oficial emitido para su constancia.'}
          </Typography>
        </Box>
      </Box>

      {/* Selector de pestañas si son múltiples estudiantes */}
      {listaReservas.length > 1 && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#f1f5f9',
            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
            p: 0.8
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                minHeight: 46,
                borderRadius: '12px',
                px: 2.5,
                color: 'text.secondary'
              },
              '& .Mui-selected': {
                background: brandGradient,
                color: `${brandTextContained} !important`
              }
            }}
          >
            {listaReservas.map((r: any, idx) => {
              const isHer = Boolean(r.hermano_regular_id || r.codigo_reserva?.startsWith('HER-') || r.codigo_reserva?.startsWith('ESP-'));
              const isWait = isHer && (r.estado === 'en_espera' || r.codigo_reserva?.startsWith('ESP-'));
              const nombreCorto = (r.estudiante_nombres || r.nombres || '').split(' ')[0] || `Alumno ${idx + 1}`;
              const gNombre = r.grado_destino_nombre || r.grado_nombre || '';

              return (
                <Tab
                  key={r.id || idx}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      <span>
                        {isHer ? `⭐ ${nombreCorto}` : nombreCorto} {gNombre ? `(${gNombre})` : ''}
                      </span>
                      {r.estado === 'no_continua' && (
                        <Chip label="No continúa" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#ef4444', color: '#fff' }} />
                      )}
                      {isWait && (
                        <Chip label={`Espera #${r.posicion_espera || 1}`} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#f59e0b', color: '#fff' }} />
                      )}
                      {isHer && !isWait && (
                        <Chip label="Hermano" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#10b981', color: '#fff' }} />
                      )}
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Paper>
      )}

      {/* DOCUMENTO RECIBO (Simulación idéntica al PDF de media hoja) */}
      <Paper
        ref={reciboRef}
        elevation={4}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: '24px',
          bgcolor: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#f8fafc' : '#1e293b',
          border: `1px solid ${esNoContinua || esAnulada
            ? isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5'
            : esEspera
              ? isDark ? alpha(accentAmber, 0.4) : '#fcd34d'
              : isDark ? alpha(brandPrimary, 0.3) : '#cbd5e1'
            }`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 25px rgba(250, 204, 21, 0.05)'
            : '0 20px 60px rgba(1, 87, 155, 0.12)',
          fontFamily: 'Roboto, sans-serif'
        }}
      >
        {/* Franjas decorativas superiores */}
        <Box
          sx={{
            height: 6,
            bgcolor: esNoContinua || esAnulada ? '#b91c1c' : esEspera ? '#d97706' : isDark ? '#facc15' : darkBlue,
            mx: -4,
            mt: -4
          }}
        />
        <Box
          sx={{
            height: 3,
            bgcolor: esNoContinua || esAnulada ? '#fca5a5' : esEspera ? '#fbbf24' : isDark ? '#f59e0b' : goldBorder,
            mx: -4,
            mb: 2.5
          }}
        />

        {/* Header con Logo y Recibo */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Logo U.E.P. La Voz de Cristo"
              sx={{ width: 52, height: 52, objectFit: 'contain' }}
              onError={(e: any) => {
                e.target.style.display = 'none';
              }}
            />
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ color: isDark ? '#facc15' : '#01579b', lineHeight: 1.1, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                U.E.P. LA VOZ DE CRISTO
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}>
                Educación Cristiana Integral · Inicial - Primaria - Secundaria
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Potosí - Bolivia
              </Typography>
            </Box>
          </Box>

          {/* Caja con Código de Recibo */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: esNoContinua || esAnulada
                ? isDark ? alpha('#b91c1c', 0.15) : '#fef2f2'
                : esEspera
                  ? isDark ? alpha('#f59e0b', 0.15) : '#fffbeb'
                  : isDark ? alpha(brandPrimary, 0.12) : '#f8fafc',
              border: `1.5px solid ${esNoContinua || esAnulada ? '#b91c1c' : esEspera ? '#f59e0b' : brandPrimary}`,
              textAlign: 'center',
              minWidth: { xs: '100%', sm: 220 }
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: esNoContinua || esAnulada ? '#b91c1c' : esEspera ? '#d97706' : brandPrimary,
                fontWeight: 800,
                letterSpacing: 0.5,
                display: 'block'
              }}
            >
              {esNoContinua
                ? 'CONSTANCIA DE NO CONTINUIDAD'
                : esAnulada
                  ? 'RESERVA ANULADA'
                  : esEspera
                    ? 'SOLICITUD EN LISTA DE ESPERA'
                    : esHermano
                      ? 'RECIBO DE CUPO - HERMANO'
                      : 'RECIBO DE RESERVA DE CUPO'}
            </Typography>
            <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#dc2626', letterSpacing: 1 }}>
              {reserva.codigo_recibo || reserva.codigo_reserva}
            </Typography>
          </Box>
        </Box>

        {/* Barra de metadatos */}
        <Box
          sx={{
            py: 1,
            px: 2,
            mb: 2.5,
            bgcolor: isDark ? alpha('#334155', 0.5) : '#f1f5f9',
            borderRadius: '10px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <strong>FECHA DE EMISIÓN:</strong> {fechaEmision} hrs.
          </Typography>
          <Typography variant="caption" sx={{ color: isDark ? '#facc15' : '#01579b', fontWeight: 800 }}>
            <strong>CÓDIGO:</strong> {reserva.codigo_reserva}
          </Typography>
          <Chip
            size="small"
            label={
              esNoContinua
                ? 'NO CONTINUARÁ'
                : esSolicitudAnulacion
                  ? 'SOLICITUD ANULACIÓN'
                  : esAnulada
                    ? 'ANULADA'
                    : esEspera
                      ? `ESPERA - PUESTO #${reserva.posicion_espera || 1}`
                      : esHermano
                        ? 'CONFIRMADO (HERMANO)'
                        : 'CONFIRMADO'
            }
            sx={{
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 800,
              bgcolor: esNoContinua || esAnulada
                ? '#ef4444'
                : esSolicitudAnulacion || esEspera
                  ? '#f59e0b'
                  : '#10b981',
              color: '#ffffff'
            }}
          />
        </Box>

        {/* 1. INFORMACIÓN DEL ESTUDIANTE O HERMANO */}
        <Box sx={{ mb: 2.5 }}>
          <Box
            sx={{
              bgcolor: esNoContinua || esAnulada ? '#b91c1c' : esEspera ? '#d97706' : darkBlue,
              color: '#ffffff',
              px: 2,
              py: 0.6,
              borderRadius: '8px 8px 0 0'
            }}
          >
            <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
              {esHermano
                ? '1. INFORMACIÓN DEL NUEVO ESTUDIANTE (HERMANO - PRIORIDAD FAMILIAR)'
                : '1. INFORMACIÓN DEL ESTUDIANTE REGULAR'}
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0 0 8px 8px' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Nombre Completo:
                </Typography>
                <Typography variant="body1" fontWeight={800}>
                  {estudianteNombreCompleto}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {esHermano ? 'Modalidad:' : 'Código Estudiante:'}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {esHermano ? 'Hermano Nuevo' : (reserva.estudiante_codigo || 'N/A')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Carnet de Identidad (CI):
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {estudianteCI}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {esHermano ? 'Hermano del Estudiante Regular:' : 'Grado Actual:'}
                </Typography>
                <Typography variant="body2" fontWeight={600} color={esHermano ? (isDark ? '#facc15' : '#01579b') : 'text.secondary'}>
                  {esHermano
                    ? `${reserva.regular_nombres || ''} ${reserva.regular_apellidos || ''} ${reserva.regular_codigo ? `(Cód: ${reserva.regular_codigo}${reserva.regular_grado_actual ? ` - ${reserva.regular_grado_actual}` : ''})` : ''}`.trim() || 'Estudiante Regular Registrado'
                    : (reserva.grado_actual_nombre || 'N/A')}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* 2. DETALLE DE CUPO O DECLARACIÓN DE NO CONTINUIDAD */}
        <Box sx={{ mb: 2.5 }}>
          <Box
            sx={{
              bgcolor: esNoContinua || esAnulada ? '#b91c1c' : esEspera ? '#d97706' : darkBlue,
              color: '#ffffff',
              px: 2,
              py: 0.6,
              borderRadius: '8px 8px 0 0'
            }}
          >
            <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
              {esNoContinua
                ? `2. DECLARACIÓN DE NO CONTINUIDAD (${reserva.periodo_nombre || 'GESTIÓN 2027'})`
                : esHermano
                  ? `2. DETALLE DE LA PLAZA SOLICITADA (${reserva.periodo_nombre || 'GESTIÓN 2027'})`
                  : `2. DETALLE DEL CUPO RESERVADO (${reserva.periodo_nombre || 'GESTIÓN 2027'})`}
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0 0 8px 8px' }}>
            <Grid container spacing={2}>
              {esNoContinua ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Decisión Oficial Registrada:
                    </Typography>
                    <Chip
                      label="NO CONTINUARÁ EN LA INSTITUCIÓN"
                      sx={{
                        bgcolor: '#ef4444',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        mt: 0.5
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Grado Proyectado (Liberado):
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {gradoDestino} ({nivelDestino})
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Motivo de No Continuidad:
                    </Typography>
                    <Typography variant="body2" fontStyle="italic" color={isDark ? '#fca5a5' : '#b91c1c'}>
                      {reserva.motivo_no_continua || reserva.observaciones || 'Declaración voluntaria registrada por el tutor.'}
                    </Typography>
                  </Grid>
                </>
              ) : esHermano ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Gestión Académica Destino:
                    </Typography>
                    <Typography variant="body1" fontWeight={800} sx={{ color: isDark ? '#facc15' : '#01579b' }}>
                      {reserva.periodo_nombre || 'Gestión 2027'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Nivel Académico:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {nivelDestino}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Grado Solicitado:
                    </Typography>
                    <Chip
                      icon={<SchoolIcon fontSize="small" sx={{ color: '#fff !important' }} />}
                      label={gradoDestino}
                      sx={{
                        bgcolor: esEspera ? '#f59e0b' : '#10b981',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        py: 1.8,
                        px: 1,
                        borderRadius: '8px'
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Turno Solicitado:
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {turnoDestino}
                    </Typography>
                  </Grid>

                  {/* Estado de cupo del hermano */}
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: '12px',
                        bgcolor: esEspera
                          ? (isDark ? alpha('#f59e0b', 0.12) : '#fffbeb')
                          : (isDark ? alpha('#10b981', 0.12) : '#f0fdf4'),
                        border: `1px solid ${esEspera ? (isDark ? alpha('#f59e0b', 0.3) : '#fde68a') : (isDark ? alpha('#10b981', 0.3) : '#bbf7d0')}`
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Chip
                          size="small"
                          label={esEspera ? `LISTA DE ESPERA · PUESTO #${reserva.posicion_espera || 1}` : 'CUPO DIRECTO CONFIRMADO'}
                          sx={{
                            bgcolor: esEspera ? '#f59e0b' : '#10b981',
                            color: '#fff',
                            fontWeight: 800
                          }}
                        />
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          Prioridad Familiar Aplicada
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {esEspera
                          ? `El hermano/a tiene asignado el puesto #${reserva.posicion_espera || 1} en lista de espera prioritaria. Al vencer el plazo de reserva de estudiantes regulares, los cupos vacantes se asignarán de manera automática y correlativa.`
                          : 'Plaza escolar reservada exitosamente gracias a la disponibilidad vacante en el curso y el beneficio de hermano de estudiante regular.'}
                      </Typography>
                    </Box>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Gestión Académica Destino:
                    </Typography>
                    <Typography variant="body1" fontWeight={800} sx={{ color: isDark ? '#facc15' : '#01579b' }}>
                      {reserva.periodo_nombre}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Nivel Académico:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {nivelDestino}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Grado al que Pasa:
                    </Typography>
                    <Chip
                      icon={<SchoolIcon fontSize="small" sx={{ color: '#fff !important' }} />}
                      label={gradoDestino}
                      sx={{
                        bgcolor: '#10b981',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        py: 1.8,
                        px: 1,
                        borderRadius: '8px'
                      }}
                    />
                  </Grid>
                  {reserva.observaciones && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Observaciones:
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontStyle="italic">
                        {reserva.observaciones}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {/* Si hay motivo de anulación o solicitud */}
              {(reserva.motivo_anulacion || esSolicitudAnulacion || esAnulada) && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity={esAnulada ? 'error' : 'warning'} sx={{ borderRadius: '10px', py: 0.5 }}>
                    <Typography variant="caption" fontWeight={700}>
                      {esAnulada ? 'Motivo de anulación: ' : 'Motivo solicitud de anulación: '}
                    </Typography>
                    <Typography variant="caption">
                      {reserva.motivo_anulacion || 'Sin motivo detallado'}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>

        {/* 3. DATOS DE QUIEN REALIZÓ EL TRÁMITE */}
        <Box sx={{ mb: 2.5 }}>
          <Box
            sx={{
              bgcolor: esNoContinua || esAnulada ? '#b91c1c' : darkBlue,
              color: '#ffffff',
              px: 2,
              py: 0.6,
              borderRadius: '8px 8px 0 0'
            }}
          >
            <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
              3. DATOS DE LA PERSONA QUE REALIZA EL TRÁMITE
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0 0 8px 8px' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Nombre del Tutor / Familiar:
                </Typography>
                <Typography variant="body1" fontWeight={800}>
                  {reserva.tutor_nombre}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Parentesco:
                </Typography>
                <Chip
                  size="small"
                  label={reserva.tutor_parentesco}
                  sx={{
                    bgcolor: alpha(brandPrimary, 0.15),
                    color: brandPrimary,
                    fontWeight: 800,
                    borderRadius: '6px'
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Carnet (CI):
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {reserva.tutor_ci}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Número de Celular / WhatsApp:
                </Typography>
                <Typography variant="body1" fontWeight={800} color="#10b981">
                  📱 {reserva.tutor_telefono}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* 4. CÓDIGO QR Y NOTA OFICIAL */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
            p: 2,
            mb: 1,
            bgcolor: esNoContinua || esAnulada
              ? isDark ? alpha('#991b1b', 0.15) : '#fef2f2'
              : isDark ? alpha('#854d0e', 0.15) : '#fefce8',
            border: `1.5px solid ${esNoContinua || esAnulada ? '#fca5a5' : '#fde047'}`,
            borderRadius: '16px'
          }}
        >
          <Box
            component="img"
            src={qrImgUrl}
            alt="Código QR Oficial"
            sx={{ width: 85, height: 85, borderRadius: '8px', border: '1px solid #e2e8f0', bgcolor: '#fff', p: 0.5 }}
          />
          <Box
            sx={{
              flex: 1,
              fontSize: '0.75rem',
              color: esNoContinua || esAnulada ? (isDark ? '#fca5a5' : '#7f1d1d') : isDark ? '#fef08a' : '#713f12'
            }}
          >
            <Typography
              variant="caption"
              fontWeight={900}
              color={esNoContinua || esAnulada ? '#991b1b' : '#854d0e'}
              display="block"
              sx={{ mb: 0.5, fontSize: '0.8rem' }}
            >
              {esNoContinua
                ? 'CONSTANCIA OFICIAL DE NO RENOVACIÓN DE CUPO'
                : esAnulada
                  ? 'RESERVA DE CUPO ANULADA'
                  : esEspera
                    ? 'SOLICITUD EN LISTA DE ESPERA - PRIORIDAD FAMILIAR'
                    : esHermano
                      ? 'CONSTANCIA DE CUPO - PRIORIDAD FAMILIAR (HERMANOS)'
                      : 'CONSTANCIA OFICIAL DE RESERVA DE CUPO'}
            </Typography>

            {esNoContinua ? (
              <>
                <Typography variant="caption" display="block">
                  • Este comprobante certifica la declaración voluntaria del tutor de NO renovar cupo para la <strong>{reserva.periodo_nombre}</strong>.
                </Typography>
                <Typography variant="caption" display="block">
                  • El cupo del estudiante queda oficialmente liberado para ser asignado por el establecimiento educativo.
                </Typography>
                <Typography variant="caption" display="block">
                  • En caso de cambio de decisión, la reincorporación requerirá trámite presencial en Secretaría sujeto a disponibilidad.
                </Typography>
                <Typography variant="caption" display="block">
                  • Para verificar autenticidad, escanee el código QR con cualquier dispositivo móvil.
                </Typography>
              </>
            ) : esAnulada ? (
              <>
                <Typography variant="caption" display="block">
                  • La reserva de cupo para este estudiante fue anulada formalmente en Dirección / Secretaría.
                </Typography>
                <Typography variant="caption" display="block">
                  • Motivo: {reserva.motivo_anulacion || 'Anulación solicitada por el tutor/administración'}.
                </Typography>
                <Typography variant="caption" display="block">
                  • Para restituir o reactivar el cupo, debe apersonarse presencialmente a la institución.
                </Typography>
              </>
            ) : esHermano ? (
              <>
                <Typography variant="caption" display="block">
                  • Este documento certifica la solicitud de plaza escolar con Prioridad Familiar para la <strong>{reserva.periodo_nombre || 'Gestión 2027'}</strong>.
                </Typography>
                <Typography variant="caption" display="block">
                  • {esEspera
                    ? `El postulante se encuentra en el PUESTO #${reserva.posicion_espera || 1} de la Lista de Espera Prioritaria. Al concluir el plazo de reserva de regulares, los cupos no ratificados serán adjudicados siguiendo este orden.`
                    : 'Cuenta con cupo asegurado para el ciclo escolar entrante gracias a la vacancia disponible y el beneficio familiar.'}
                </Typography>
                <Typography variant="caption" display="block">
                  • Presente este comprobante en Secretaría durante el periodo de matrícula para la presentación de requisitos básicos.
                </Typography>
                <Typography variant="caption" display="block">
                  • Para verificar autenticidad, escanee el código QR con cualquier dispositivo móvil.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="caption" display="block">
                  • Este recibo certifica la reserva oficial del cupo escolar para la <strong>{reserva.periodo_nombre}</strong>.
                </Typography>
                <Typography variant="caption" display="block">
                  • Como estudiante regular, su cupo queda asegurado para el ciclo escolar entrante.
                </Typography>
                <Typography variant="caption" display="block">
                  • Conserve este documento digital o impreso para la formalización de la matrícula en Secretaría.
                </Typography>
                <Typography variant="caption" display="block">
                  • Para verificar autenticidad, escanee el código QR con cualquier dispositivo móvil.
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* BOTONES DE ACCIÓN */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mt: 3.5, justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<DownloadIcon />}
          onClick={handleDescargarPDF}
          sx={{
            background: esNoContinua ? 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)' : brandGradient,
            color: '#ffffff !important',
            borderRadius: '12px',
            fontWeight: 800,
            textTransform: 'none',
            px: 3.5,
            py: 1.4,
            boxShadow: isDark
              ? '0 8px 25px rgba(250, 204, 21, 0.4)'
              : '0 8px 25px rgba(1, 87, 155, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: esNoContinua ? 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)' : brandGradientHover,
              transform: 'translateY(-2px)'
            }
          }}
        >
          {esNoContinua ? 'Descargar Constancia en PDF' : 'Descargar Recibo en PDF'}
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<PrintIcon />}
          onClick={handleImprimir}
          sx={{
            border: `2px solid ${brandPrimary}`,
            color: isDark ? '#facc15' : '#01579b',
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            px: 3,
            py: 1.4,
            '&:hover': {
              border: `2px solid ${brandDeep}`,
              background: alpha(brandPrimary, 0.12),
              transform: 'translateY(-2px)'
            }
          }}
        >
          Ver / Imprimir
        </Button>

        {/* Botón para solicitar anulación cuando la reserva de estudiante regular esté confirmada */}
        {esConfirmada && !esHermano && (
          <Button
            variant="outlined"
            size="large"
            color="error"
            startIcon={<CancelIcon />}
            onClick={handleAbrirAnulacion}
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              py: 1.4,
              borderColor: alpha('#ef4444', 0.5),
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: alpha('#ef4444', 0.1)
              }
            }}
          >
            Solicitar Anulación
          </Button>
        )}

        {onNuevaReserva && (
          <Button
            variant="text"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={onNuevaReserva}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              color: brandPrimary,
              '&:hover': {
                bgcolor: alpha(brandPrimary, 0.1)
              }
            }}
          >
            Nueva Consulta
          </Button>
        )}
      </Stack>

      {/* ── DIÁLOGO PARA SOLICITAR ANULACIÓN DE RESERVA (ESTILO RESERVA-CUPO) ── */}
      <Dialog
        open={openAnulacionDialog}
        onClose={() => !isSubmittingAnulacion && setOpenAnulacionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: isDark ? '#09101d' : '#ffffff',
            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
            boxShadow: isDark
              ? '0 24px 64px rgba(0,0,0,0.7)'
              : '0 24px 64px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }
        }}
      >
        {/* ── HEADER ── */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '13px',
                  bgcolor: alpha('#f59e0b', 0.12),
                  border: `1px solid ${alpha('#f59e0b', 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                  flexShrink: 0,
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#f59e0b',
                  }}
                >
                  Trámite de Baja · Gestión 2027
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.2, color: 'text.primary' }}>
                  Solicitud de Anulación de Reserva
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => !isSubmittingAnulacion && setOpenAnulacionDialog(false)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: 'text.secondary',
                transition: 'all 0.15s',
                flexShrink: 0,
                '&:hover': {
                  background: alpha('#ef4444', 0.12),
                  borderColor: alpha('#ef4444', 0.4),
                  color: '#ef4444',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* Barra superior de acento con gradiente */}
          <Box
            sx={{
              height: 3,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
              width: '100%',
            }}
          />
        </Box>

        {/* ── BODY ── */}
        <DialogContent sx={{ px: 3, py: 2 }}>
          {/* Tarjeta del Estudiante seleccionado */}
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={reserva.estudiante_foto_url || undefined}
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: isDark ? '#facc15' : '#0288d1',
                  color: isDark ? '#000' : '#fff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                }}
              >
                {!reserva.estudiante_foto_url && (reserva.estudiante_nombres?.[0] || 'E')}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                  {reserva.estudiante_nombre_completo}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                  CI: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{reserva.estudiante_ci}</strong> · Cód: {reserva.estudiante_codigo}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={reserva.grado_destino_nombre}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.7rem',
                bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                color: isDark ? '#facc15' : '#0288d1',
                border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
              }}
            />
          </Box>

          <Alert
            severity="warning"
            sx={{
              mb: 2.5,
              borderRadius: '14px',
              bgcolor: alpha('#f59e0b', 0.1),
              border: `1px solid ${alpha('#f59e0b', 0.25)}`,
              color: isDark ? '#fbbf24' : '#b45309',
              '& .MuiAlert-icon': { color: '#f59e0b' },
            }}
          >
            Está solicitando la liberación formal del cupo escolar para la Gestión 2027.
            Esta solicitud pasará a revisión de Secretaría y Dirección para formalizar la baja.
          </Alert>

          {errorAnulacion && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {errorAnulacion}
            </Alert>
          )}

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Carnet de Identidad (CI) del Estudiante *
              </Typography>
              <TextField
                placeholder="Ingrese el número de CI del estudiante para anular..."
                fullWidth
                size="small"
                value={ciEstudianteConfirmacion}
                onChange={(e) => setCiEstudianteConfirmacion(e.target.value)}
                helperText="Ingrese únicamente el Carnet de Identidad (CI) del estudiante para validar la anulación"
                disabled={isSubmittingAnulacion}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Motivo de la Anulación *
              </Typography>
              <TextField
                placeholder="Ej. Cambio de colegio, mudanza de domicilio a otra ciudad, decisión familiar..."
                fullWidth
                multiline
                rows={3}
                required
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                disabled={isSubmittingAnulacion}
                helperText="Explique la razón oficial para justificar la anulación y liberar el cupo"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>

        {/* ── FOOTER ── */}
        <Box
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
          }}
        >
          <Button
            variant="text"
            color="inherit"
            onClick={() => setOpenAnulacionDialog(false)}
            disabled={isSubmittingAnulacion}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
            }}
          >
            Cancelar
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            variant="contained"
            onClick={handleConfirmarSolicitudAnulacion}
            disabled={isSubmittingAnulacion || !motivoAnulacion.trim()}
            startIcon={isSubmittingAnulacion ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {isSubmittingAnulacion ? 'Enviando Solicitud...' : 'Enviar Solicitud de Anulación'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ReciboReservaCard;
