'use client';

import React from 'react';
import { Box, Chip, Typography, alpha, Stack } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { parsePostgrados, TIPOS_POSTGRADO, TipoPostgrado } from '@/types/docenteTypes';

interface PostgradosDisplayProps {
  value?: string | null;
  emptyText?: string;
  dense?: boolean;
}

export const PostgradosDisplay: React.FC<PostgradosDisplayProps> = ({
  value,
  emptyText = 'Sin postgrados registrados',
  dense = false
}) => {
  const items = parsePostgrados(value);

  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        {emptyText}
      </Typography>
    );
  }

  const getTipoMeta = (tipoVal: TipoPostgrado) => {
    return TIPOS_POSTGRADO.find(t => t.value === tipoVal) || {
      label: tipoVal,
      color: '#4b5563',
      bg: '#f3f4f6'
    };
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: dense ? 0.75 : 1, py: 0.5 }}>
      {items.map((item, idx) => {
        const meta = getTipoMeta(item.tipo);
        return (
          <Chip
            key={idx}
            size={dense ? 'small' : 'medium'}
            icon={<SchoolIcon style={{ color: meta.color, fontSize: dense ? 16 : 18 }} />}
            label={
              <span>
                <strong style={{ color: meta.color, textTransform: 'capitalize' }}>[{meta.label}]</strong> {item.nombre}
              </span>
            }
            sx={{
              bgcolor: meta.bg,
              color: '#1f2937',
              fontWeight: 500,
              fontSize: dense ? '0.75rem' : '0.82rem',
              py: dense ? 1.5 : 2,
              px: 0.5,
              borderRadius: '8px',
              border: `1px solid ${alpha(meta.color, 0.25)}`
            }}
          />
        );
      })}
    </Box>
  );
};

export default PostgradosDisplay;
