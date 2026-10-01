'use client';
// app/dashboard/estudiante/examenes/[id]/page.tsx

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Fade,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  ArrowBackRounded as BackIcon,
  AssignmentRounded as AssignmentIcon,
} from '@mui/icons-material';
import { usePerfilEstudiante } from '@/hooks/useEstudiante';
import { TomarExamen } from '@/components/estudiante/examenes/TomarExamen';

// ─── Animaciones (mismo patrón que el resto de los módulos) ──────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const gradBg = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';
  return { isDark, accentColor, gradBg };
};

export default function ExamenEstudiantePage() {
  const params = useParams();
  const router = useRouter();
  const { isDark, accentColor, gradBg } = usePalette();
  const evaluacionId = Number(params?.id);

  const { perfil, isLoading: cargandoPerfil } = usePerfilEstudiante();
  const matriculaId = perfil?.matricula_id ?? null;

  // ══ ESTADO: CARGANDO PERFIL ══
  if (cargandoPerfil) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={36} sx={{ color: accentColor }} />
      </Box>
    );
  }

  // ══ ESTADO: ID DE EVALUACIÓN NO VÁLIDO ══
  if (!evaluacionId || isNaN(evaluacionId)) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ borderRadius: '16px', py: 2 }}>
            Identificador de evaluación no válido. Regresa a tus evaluaciones e inténtalo nuevamente.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <TomarExamen evaluacionId={evaluacionId} matriculaId={matriculaId} />
      </Container>
    </Box>
  );
}