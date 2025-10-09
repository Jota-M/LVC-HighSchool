import React from 'react';
import { Grid, Typography, useTheme, Box } from '@mui/material';
import Title from './Title';
import Paragrafth from './Paragrafth';
import Pilars from './Pilars';
import VerseSection from './Verse';
import Pils from './Pils';

function About() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#222222';      

  return (
    <>
    <Box
      id="Nosotros"
      sx={{
        color: textColor,
        py: { xs: 8, md: 10 },
        px: { xs: 2, sm: 4, md: 8 },
        transition: 'background-color 0.4s ease, color 0.4s ease',
      }}
    >
      <Grid container spacing={6} justifyContent="center" alignItems="center">
        <Grid size={{ xs: 12, md: 6, lg: 5 }} sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: { xs: 'center', md: 'left' },
        }}>
          <Title text="Nuestro propósito" />
          <Typography
            variant="h3"
            sx={{
              color: '#01579b',
              fontWeight: 'bold',
              fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
              lineHeight: 1.3,
              mb: 2,
            }}
          >
            Una educación con{' '}
            <Box component="span" sx={{ color: '#facc15' }}>
              propósito eterno
            </Box>
          </Typography>
          <Paragrafth
            text="En el corazón de nuestra institución late un compromiso inquebrantable con la excelencia educativa y la formación integral de nuestros estudiantes. Nos dedicamos a cultivar no solo mentes brillantes, sino también corazones compasivos y espíritus resilientes."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 5 }} sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src="https://scontent.flpb2-2.fna.fbcdn.net/v/t39.30808-6/533706081_122156281088591421_6566465671246212824_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=okgSYtDzTtMQ7kNvwElOVsl&_nc_oc=AdlVbDKBicy6xkX3ksXL5p7jWPVMC66cEtuPPuExMPYwzxFEtg8zOAQaaSF0fU_VgY8QUJitJk3y8F1VRB7QGO15&_nc_zt=23&_nc_ht=scontent.flpb2-2.fna&_nc_gid=xQhXkHEaSXNuqNBKomaHCQ&oh=00_AfbBLIppCVR-B1CJSYVGuzsmqxHwdtL8oe-dPWDUtOF3_w&oe=68E1ADE9"
            alt="Estudiantes"
            sx={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 4,
              boxShadow: isDark
                ? '0px 10px 20px rgba(0, 0, 0, 0.7)'
                : '0px 10px 20px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.3s ease',
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ my: 6, borderTop: '1px solid', borderColor: isDark ? '#333' : '#ccc' }} />
       <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.6rem' },
            mb: 2,
            transition: 'color 0.4s ease',
            color: '#FFE05C' 
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
    <VerseSection/>  
    </Box>
    
    </>
  );
}


export default About;
