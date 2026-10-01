// components/reservaCupo/ReciboReservaCard.tsx
'use client';
import React, { useState, useRef } from 'react';
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
  Tab
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  WhatsApp as WhatsAppIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { ReservaCupoData } from '@/types/reservaCupoTypes';
import reservaCupoService from '@/services/reservaCupoService';

interface ReciboReservaCardProps {
  reservas: ReservaCupoData[];
  onNuevaReserva?: () => void;
}

export const ReciboReservaCard: React.FC<ReciboReservaCardProps> = ({
  reservas,
  onNuevaReserva
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reciboRef = useRef<HTMLDivElement>(null);

  const [tabIndex, setTabIndex] = useState(0);

  if (!reservas || reservas.length === 0) return null;

  const reserva = reservas[tabIndex] || reservas[0];

  // Tokens de diseño idénticos a PreInscripción
  // Modo oscuro: amarillo dorado (#facc15 / #f59e0b)
  // Modo claro: celeste azulado (#0288d1 / #01579b)
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

  const handleDescargarPDF = () => {
    reservaCupoService.descargarPDF(reserva.codigo_reserva);
  };

  const handleImprimir = () => {
    const url = reservaCupoService.getReciboPDFUrl(reserva.codigo_reserva, true);
    window.open(url, '_blank');
  };

  const handleWhatsApp = () => {
    const tel = reserva.tutor_telefono.replace(/\D/g, '');
    const numWhatsapp = tel.startsWith('591') ? tel : `591${tel}`;
    const texto = encodeURIComponent(
      `¡Hola! Confirmamos la Reserva de Cupo escolar en la U.E.P. La Voz de Cristo:\n\n` +
      `🎓 *Estudiante:* ${reserva.estudiante_nombre_completo}\n` +
      `📌 *CI Estudiante:* ${reserva.estudiante_ci}\n` +
      `🏫 *Gestión:* ${reserva.periodo_nombre}\n` +
      `📚 *Grado Reservado:* ${reserva.grado_destino_nombre}\n` +
      `⏰ *Turno:* ${reserva.turno_destino_nombre}\n` +
      `👤 *Registrado por:* ${reserva.tutor_nombre} (${reserva.tutor_parentesco})\n` +
      `🔖 *Nº Recibo:* ${reserva.codigo_recibo}\n` +
      `🎫 *Código de Reserva:* ${reserva.codigo_reserva}\n\n` +
      `Conserve este comprobante para la formalización de la matrícula.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${numWhatsapp}&text=${texto}`, '_blank');
  };

  const qrDataText = encodeURIComponent(
    `LVC-RESERVA:${reserva.codigo_reserva}|EST:${reserva.estudiante_ci}|GRADO:${reserva.grado_destino_nombre}|TURNO:${reserva.turno_destino_nombre}|TUTOR:${reserva.tutor_nombre}|GESTION:${reserva.periodo_nombre}`
  );
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${qrDataText}`;

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', my: 2 }}>
      {/* Alerta de confirmación superior con estilo de PreInscripción */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: '18px',
          bgcolor: isDark ? alpha(accentGreen, 0.15) : '#f0fdf4',
          border: `1.5px solid ${accentGreen}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
        }}
      >
        <CheckCircleIcon sx={{ color: accentGreen, fontSize: 40 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={800} color={isDark ? '#34d399' : '#047857'}>
            {reservas.length > 1
              ? `¡Reserva Confirmada para ${reservas.length} Estudiantes!`
              : '¡Reserva de Cupo Registrada Exitosamente!'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {reservas.length > 1
              ? 'Los cupos para la Gestión 2027 han sido asegurados. Puedes alternar de pestaña para ver y descargar el recibo de cada estudiante.'
              : 'El cupo para la Gestión 2027 ha sido asegurado. A continuación tiene el Recibo Oficial emitido para su constancia.'}
          </Typography>
        </Box>
      </Box>

      {/* Selector de pestañas si son múltiples estudiantes */}
      {reservas.length > 1 && (
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
            {reservas.map((r, idx) => (
              <Tab
                key={r.id || idx}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    <span>{r.estudiante_nombres.split(' ')[0]} ({r.grado_destino_nombre})</span>
                  </Box>
                }
              />
            ))}
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
          border: `1px solid ${isDark ? alpha(brandPrimary, 0.3) : '#cbd5e1'}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 25px rgba(250, 204, 21, 0.05)'
            : '0 20px 60px rgba(1, 87, 155, 0.12)',
          fontFamily: 'Roboto, sans-serif'
        }}
      >
        {/* Franjas decorativas superiores */}
        <Box sx={{ height: 6, bgcolor: isDark ? '#facc15' : darkBlue, mx: -4, mt: -4 }} />
        <Box sx={{ height: 3, bgcolor: isDark ? '#f59e0b' : goldBorder, mx: -4, mb: 2.5 }} />

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
              bgcolor: isDark ? alpha(brandPrimary, 0.12) : '#f8fafc',
              border: `1.5px solid ${brandPrimary}`,
              textAlign: 'center',
              minWidth: { xs: '100%', sm: 220 }
            }}
          >
            <Typography variant="caption" sx={{ color: brandPrimary, fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
              RECIBO DE RESERVA DE CUPO
            </Typography>
            <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#dc2626', letterSpacing: 1 }}>
              {reserva.codigo_recibo}
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
            fontSize: '0.8rem',
            gap: 1
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            <strong>FECHA DE EMISIÓN:</strong> {reserva.fecha_reserva_formateada} hrs.
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            <strong>CÓDIGO DE RESERVA:</strong> <span style={{ color: brandPrimary, fontWeight: 800 }}>{reserva.codigo_reserva}</span>
          </Typography>
          <Chip
            size="small"
            label="CONFIRMADO"
            sx={{
              bgcolor: '#10b981',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.7rem',
              height: 22,
              borderRadius: '6px'
            }}
          />
        </Box>

        {/* 1. INFORMACIÓN DEL ESTUDIANTE */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ bgcolor: darkBlue, color: '#ffffff', px: 2, py: 0.6, borderRadius: '8px 8px 0 0' }}>
            <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
              1. INFORMACIÓN DEL ESTUDIANTE REGULAR
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0 0 8px 8px' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Nombre Completo del Estudiante:
                </Typography>
                <Typography variant="body1" fontWeight={800}>
                  {reserva.estudiante_nombre_completo}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Carnet de Identidad (CI):
                </Typography>
                <Typography variant="body1" fontWeight={800} color={brandPrimary}>
                  {reserva.estudiante_ci}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Código de Matrícula:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {reserva.estudiante_codigo}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Grado Cursado Actualmente:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {reserva.grado_actual_nombre || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* 2. DETALLE DEL CUPO RESERVADO */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ bgcolor: darkBlue, color: '#ffffff', px: 2, py: 0.6, borderRadius: '8px 8px 0 0' }}>
            <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
              2. DETALLE DEL CUPO RESERVADO ({reserva.periodo_nombre})
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0 0 8px 8px' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Gestión Académica:
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color={brandPrimary}>
                  {reserva.periodo_nombre}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Nivel Académico:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {reserva.nivel_destino_nombre}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Grado al que Pasa:
                </Typography>
                <Chip
                  icon={<SchoolIcon fontSize="small" sx={{ color: '#fff !important' }} />}
                  label={reserva.grado_destino_nombre}
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
            </Grid>
          </Box>
        </Box>

        {/* 3. DATOS DE QUIEN REALIZÓ LA RESERVA */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ bgcolor: darkBlue, color: '#ffffff', px: 2, py: 0.6, borderRadius: '8px 8px 0 0' }}>
            <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
              3. DATOS DE LA PERSONA QUE REALIZA LA RESERVA
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
            mb: 3,
            bgcolor: isDark ? alpha('#854d0e', 0.15) : '#fefce8',
            border: '1.5px solid #fde047',
            borderRadius: '16px'
          }}
        >
          <Box
            component="img"
            src={qrImgUrl}
            alt="Código QR Oficial"
            sx={{ width: 85, height: 85, borderRadius: '8px', border: '1px solid #e2e8f0', bgcolor: '#fff', p: 0.5 }}
          />
          <Box sx={{ flex: 1, fontSize: '0.75rem', color: isDark ? '#fef08a' : '#713f12' }}>
            <Typography variant="caption" fontWeight={900} color="#854d0e" display="block" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
              CONSTANCIA OFICIAL DE RESERVA DE CUPO
            </Typography>
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
          </Box>
        </Box>
      </Paper>

      {/* BOTONES DE ACCIÓN ESTILO PREINSCRIPCIÓN */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mt: 3.5, justifyContent: 'center' }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<DownloadIcon />}
          onClick={handleDescargarPDF}
          sx={{
            background: brandGradient,
            color: `${brandTextContained} !important`,
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
              background: brandGradientHover,
              transform: 'translateY(-2px)'
            }
          }}
        >
          Descargar Recibo en PDF
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
            Nueva Reserva
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default ReciboReservaCard;
