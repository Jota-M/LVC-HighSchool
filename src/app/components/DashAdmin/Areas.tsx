'use client'
import { Box, Typography, Grid, Accordion, AccordionSummary, AccordionDetails, useTheme, Card, CardContent } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { tokens } from '../../dashboard/theme';

const areas = [
  {
    nombre: 'Humanístico',
    materias: [
      'Lengua Materna (Castellano)',
      'Lengua Originaria',
      'Lengua Extranjera (Inglés)',
      'Comunicación',
      'Ética y valores',
      'Filosofía',
    ],
    caracteristica: 'Formación de pensamiento crítico, identidad cultural, expresión oral y escrita.',
  },
  {
    nombre: 'Científico – Natural',
    materias: ['Matemáticas', 'Física', 'Química', 'Biología', 'Geografía'],
    caracteristica: 'Desarrollo lógico, comprensión del entorno físico-biológico y habilidades científicas.',
  },
  {
    nombre: 'Social y Ciudadana',
    materias: ['Historia', 'Ciencias Sociales', 'Educación para la Ciudadanía', 'Economía comunitaria'],
    caracteristica: 'Formación para la participación ciudadana y conciencia histórica.',
  },
  {
    nombre: 'Técnico – Tecnológica',
    materias: ['Tecnología general (1° a 3° año)', 'Tecnología especializada (4° a 6° año)'],
    caracteristica: 'Preparación técnica vinculada al entorno productivo y tecnológico local o regional.',
  },
  {
    nombre: 'Artístico – Cultural',
    materias: ['Educación Artística (Música, Artes plásticas, Teatro, Danza)', 'Patrimonio cultural'],
    caracteristica: 'Estimula la creatividad, valoración del arte y fortalecimiento de la identidad cultural.',
  },
  {
    nombre: 'Educación Física y Deportes',
    materias: ['Educación Física', 'Actividades deportivas', 'Educación para la salud'],
    caracteristica: 'Desarrollo psicomotor, hábitos saludables, trabajo en equipo.',
  },
  {
    nombre: 'Productivo – Comunitario',
    materias: ['Proyectos socio-productivos integrados', 'Talleres productivos'],
    caracteristica: 'Vincula el aprendizaje con la realidad comunitaria y la autosuficiencia a través de proyectos.',
  },
  {
    nombre: 'Espiritual y Cosmovisión',
    materias: ['Cosmovisiones de los pueblos originarios', 'Saberes ancestrales'],
    caracteristica: 'Integra valores espirituales y conocimientos tradicionales como parte de la formación integral.',
  },
]

export default function CaracteristicasAreas() {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  return (
    <Box m="20px">
      <Typography variant="h3" fontWeight="bold" mb={3} color={colors.greenAccent[400]}>
        Características de las Áreas de Formación
      </Typography>

      <Grid container spacing={2}>
        {areas.map((area, index) => (
          <Grid size={{xs:12, md:6}}  key={index}>
            <Accordion sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], borderRadius: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.greenAccent[400] }} />}>
                <Typography variant="h6" fontWeight="bold">
                  {area.nombre}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Materias:
                </Typography>
                <ul style={{ marginLeft: '20px' }}>
                  {area.materias.map((m, i) => (
                    <li key={i}>
                      <Typography variant="body2">{m}</Typography>
                    </li>
                  ))}
                </ul>
                <Typography variant="subtitle1" fontWeight="bold" mt={1}>
                  Características:
                </Typography>
                <Typography variant="body2">{area.caracteristica}</Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
