import React from 'react';
import { Grid, Typography, useTheme, Box } from '@mui/material';
import Paragrafth from './Paragrafth';
import Pils from './Pils';

function Pilars() {
  const theme = useTheme();
  return (
    <Box
      component="section"
    >
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.6rem' },
            mb: 2,
            transition: 'color 0.4s ease',
          }}
        >
          Nuestros Pilares
        </Typography>
        <Paragrafth        
          text="Los valores que fundamentan nuestra propuesta educativa y forman el carácter de nuestros estudiantes."
        />
      </Box>

      <Grid container spacing={1} justifyContent="center">
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 2.5 }} offset={{ xs: 2, sm: 0, md: 0, lg: 1 }}>
        <Pils image='/Pils-1.jpg' title='Fe' description='La fe es un pilar fundamental en nuestra institución, fomentando la espiritualidad y el respeto por las creencias de cada individuo.'/>
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 2.5 }} offset={{ xs: 2, sm: 0, md: 0 }}>
        <Pils image='/Pils-2.jpg' title='Respeto' description='El respeto es un pilar fundamental en nuestra institución, fomentando la convivencia y el entendimiento entre todos.'/>
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 2.5 }} offset={{ xs: 2, sm: 0, md: 0 }}>
        <Pils image='/Pils-3.jpg' title='Responsabilidad' description='La responsabilidad es un pilar fundamental en nuestra institución, fomentando la autonomía y el compromiso con el aprendizaje.'/>
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 2.5 }} offset={{ xs: 2, sm: 0, md: 0 }}>
        <Pils image='/Pils-4.jpg' title='Disciplina' description='La disciplina es un pilar fundamental en nuestra institución, fomentando la responsabilidad y el respeto por las normas.'/>
      </Grid>
      </Grid>
    </Box>
  );
}


export default Pilars;
