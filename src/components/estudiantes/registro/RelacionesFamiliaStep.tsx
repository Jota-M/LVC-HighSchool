import React from 'react';
import { Alert, Box, Checkbox, FormControlLabel, Paper, Radio, Typography } from '@mui/material';

interface Persona {
  nombres: string;
  apellido_paterno: string;
}

interface RelacionesFamiliaStepProps {
  estudiantes: Persona[];
  tutores: Persona[];
  relaciones: Record<string, boolean>;
  principal: string | null;
  onRelacionChange: (key: string, value: boolean) => void;
  onPrincipalChange: (key: string) => void;
}

const nombre = (persona: Persona) => `${persona.nombres || 'Sin nombre'} ${persona.apellido_paterno || ''}`.trim();

export function RelacionesFamiliaStep({
  estudiantes,
  tutores,
  relaciones,
  principal,
  onRelacionChange,
  onPrincipalChange,
}: RelacionesFamiliaStepProps) {
  if (!estudiantes.length || !tutores.length) {
    return <Alert severity="info">Agrega al menos un estudiante y un tutor para definir las relaciones.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>Relaciones familiares</Typography>
      <Typography color="text.secondary" mb={3}>
        Marca qué tutor corresponde a cada estudiante y selecciona un tutor principal por estudiante.
      </Typography>
      {estudiantes.map((estudiante, estudianteIndex) => (
        <Paper key={estudianteIndex} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography fontWeight={700} mb={1}>{nombre(estudiante)}</Typography>
          {tutores.map((tutor, tutorIndex) => {
            const key = `${estudianteIndex}:${tutorIndex}`;
            const seleccionado = Boolean(relaciones[key]);
            return (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={<Checkbox checked={seleccionado} onChange={(event) => onRelacionChange(key, event.target.checked)} />}
                  label={nombre(tutor)}
                />
                {seleccionado && (
                  <FormControlLabel
                    control={<Radio checked={principal === key} onChange={() => onPrincipalChange(key)} />}
                    label="Tutor principal"
                  />
                )}
              </Box>
            );
          })}
        </Paper>
      ))}
    </Box>
  );
}
