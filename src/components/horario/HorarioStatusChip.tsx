// components/horario/HorarioStatusChip.tsx
'use client';
import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  EditNote as BorradorIcon,
  CheckCircle as PublicadoIcon,
  Archive as ArchivadoIcon,
} from '@mui/icons-material';
import { ESTADO_CONFIG, HorarioEstado } from '@/types/horariotypes';

interface Props extends Omit<ChipProps, 'color'> {
  estado: HorarioEstado;
}

const ICONS: Record<HorarioEstado, React.ReactElement> = {
  borrador:  <BorradorIcon  sx={{ fontSize: 14 }} />,
  publicado: <PublicadoIcon sx={{ fontSize: 14 }} />,
  archivado: <ArchivadoIcon sx={{ fontSize: 14 }} />,
};

export const HorarioStatusChip: React.FC<Props> = ({ estado, sx, ...props }) => {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <Chip
      size="small"
      icon={ICONS[estado]}
      label={cfg.label}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '0.7rem',
        border: `1px solid ${cfg.color}30`,
        '& .MuiChip-icon': { color: cfg.color, ml: '6px' },
        ...sx,
      }}
      {...props}
    />
  );
};