// components/prediccion/prediccionShared.tsx
import React from 'react';
import { Box, Typography, Chip, LinearProgress, alpha } from '@mui/material';
import { keyframes } from '@mui/system';
import { NIVELES_RIESGO, CLASIFICACIONES } from '@/types/prediccionTypes';

// ── Animaciones ───────────────────────────────────────────────
export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
export const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.85; }
`;

// ── Helpers ───────────────────────────────────────────────────
export const getNivel = (v: string) => NIVELES_RIESGO.find(n => n.value === v) ?? NIVELES_RIESGO[0];
export const getClasif = (v: string) => CLASIFICACIONES.find(c => c.value === v) ?? CLASIFICACIONES[0];

export function getInitials(nombre: string) {
    return nombre.split(',')[0].trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── NivelChip ─────────────────────────────────────────────────
export const NivelChip: React.FC<{ nivel: string; size?: 'small' | 'medium' }> = ({ nivel, size = 'small' }) => {
    const cfg = getNivel(nivel);
    return (
        <Chip size={size} label={cfg.label} sx={{
            bgcolor: cfg.bgColor, color: cfg.color, fontWeight: 700,
            border: `1px solid ${cfg.borderColor}`, fontSize: size === 'small' ? 10 : 12,
        }} />
    );
};

// ── ProbBar ───────────────────────────────────────────────────
export const ProbBar: React.FC<{ prob: number; isDark: boolean }> = ({ prob, isDark }) => {
    const pct = Math.round(prob * 100);
    const color = pct >= 75 ? '#dc2626' : pct >= 50 ? '#ea580c' : pct >= 25 ? '#d97706' : '#16a34a';
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Prob. reprobar</Typography>
                <Typography variant="caption" fontWeight={800} sx={{ color, fontSize: 10 }}>{pct}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={pct} sx={{
                height: 6, borderRadius: 4,
                bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07),
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
            }} />
        </Box>
    );
};