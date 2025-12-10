// components/estudiantes/registro/MatriculaStep.tsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { MatriculaSelectors } from '@/components/estudiantes/MatriculaSelectors';
import { MatriculaCreate } from '@/types/estudianteTypes';

interface MatriculaStepProps {
  incluirMatricula: boolean;
  matricula: MatriculaCreate;
  onToggleIncluir: (incluir: boolean) => void;
  onChange: (data: Partial<MatriculaCreate>) => void;
}

export const MatriculaStep: React.FC<MatriculaStepProps> = ({
  incluirMatricula,
  matricula,
  onToggleIncluir,
  onChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <SchoolIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
        <Typography variant="h5" fontWeight={700}>
          Matrícula (Opcional)
        </Typography>
      </Box>

      <MatriculaSelectors
        value={matricula}
        onChange={onChange}
        incluirMatricula={incluirMatricula}
        onToggleIncluir={onToggleIncluir}
      />
    </Box>
  );
};