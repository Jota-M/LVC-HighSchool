'use client'

import React from 'react'
import Header from '../Navbar'
import {
  Grid,
  Typography,
  TextField,
  FormGroup,
  Button,
  Box,
  useTheme,
} from '@mui/material'
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import SearchSharpIcon from '@mui/icons-material/SearchSharp'
import RocketLaunchSharpIcon from '@mui/icons-material/RocketLaunchSharp'
import DataExplorationSharpIcon from '@mui/icons-material/DataExplorationSharp'
import InforRegular from '../../components/InforRegular'

function Page() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid
        container
        id="Header"
        className="relative w-full overflow-hidden pt-20"
        sx={{
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(135deg,#090B26, #000000)'
          : 'linear-gradient(135deg, #fdfcfb,#B9BED4)', 
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />
        <Grid
          size={{ xs: 12, md: 10, lg: 8 }}
          sx={{
            mx: 'auto',
            mt: 5,
            p: 4,
            borderRadius: 5,
            bgcolor: isDark ? '#111936' : 'rgba(255,255,255,0.9)',
            boxShadow: 6,
            textAlign: 'center',
            animation: 'fadeIn 1.5s ease-in-out',
          }}
        >
          <AccountCircleSharpIcon
            sx={{
              fontSize: 60,
              color: isDark ? '#90caf9' : '#00695c',
              mb: 2,
              transition: 'transform 0.4s ease',
              '&:hover': { transform: 'scale(1.1) rotate(5deg)' },
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.8rem', md: '2rem' },
              fontWeight: 'bold',
              background: 'linear-gradient(90deg,#42a5f5,#26c6da)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ¡Bienvenido de nuevo!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              mb: 4,
              fontSize: { xs: '0.8rem', md: '0.9rem' },
              color: isDark ? 'grey.300' : 'text.secondary',
            }}
          >
            Como estudiante regular de nuestra institución, el proceso de
            renovación es más simple y rápido.
          </Typography>

          {/* INFO CARDS */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 3,
              mt: 3,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': { transform: 'scale(1.05)', boxShadow: 4 },
              }}
            >
              <InforRegular icon={RocketLaunchSharpIcon} title="Proceso Acelerado" />
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': { transform: 'scale(1.05)', boxShadow: 4 },
              }}
            >
              <InforRegular icon={DataExplorationSharpIcon} title="Datos Preguardados" />
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': { transform: 'scale(1.05)', boxShadow: 4 },
              }}
            >
              <InforRegular icon={AccountCircleSharpIcon} title="Fácil de Usar" />
            </Box>
          </Box>
        </Grid>

        {/* FORMULARIO */}
        <Grid
          size={{ xs: 12, md: 9, lg: 8 }}
          sx={{
            mx: 'auto',
            mt: 3,
            p: 4,
            borderRadius: 5,
            bgcolor: isDark ? 'background.paper' : 'white',
            boxShadow: 6,
            animation: 'fadeUp 1.2s ease-in-out',
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 'bold', mb: 1, color: isDark ? 'white' : 'black' }}
          >
            Verificación de identidad
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              fontSize: 15,
              color: isDark ? 'grey.900' : 'text.secondary',
            }}
          >
            Ingresa tu información para localizar tu registro académico
          </Typography>
          <FormGroup sx={{display:'flex', flexDirection:'row', gap:"2em",margin:3}}>
            <TextField sx={{width:{ xs: '100%', sm: '80%', md: '45%', lg: '32%' }}} variant='outlined' label='Número de carnet' />
            <TextField sx={{width:{ xs: '100%', sm: '80%', md: '45%', lg: '31%' }}} variant='outlined' label='Apellido Paterno' />
            <DatePicker
              sx={{ width:{ xs: '100%', sm: '80%', md: '45%', lg: '31%' }}}
              label="Fecha de Nacimiento"
              slotProps={{ textField: {} }}
            />
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: isDark ? '#90caf9' : '#00695c',
                fontWeight: 'bold',
                py: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isDark ? '#64b5f6' : '#004d40',
                  transform: 'scale(1.05)',
                },
              }}
              startIcon={<SearchSharpIcon />}
            >
              Buscar mi registro
            </Button>
          </FormGroup>
        </Grid>
      </Grid>

      {/* Animaciones CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </LocalizationProvider>
  )
}

export default Page
