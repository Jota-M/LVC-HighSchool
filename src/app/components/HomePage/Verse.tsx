import { Box, Typography, useTheme } from '@mui/material';

const VerseSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const backgroundColor = isDark ? '#181B33' : '#EEEFF7';
  const textColor = isDark ? '#f5f5f5' : '#212121';
  const accentColor = isDark ? '#d4af37' : '#8e793e'; 

  return (
    <Box
      sx={{
        mt:{xs:3, md:6},
        py: { xs: 10, md: 14 },
        backgroundColor,
        textAlign: 'center',
        transition: 'background-color 0.4s ease, color 0.4s ease',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontFamily: `'Playfair Display', serif`,
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' },
          color: textColor,
          maxWidth: '1000px',
          mx: 'auto',
          lineHeight: 1.4,
          transition: 'color 0.4s ease',
        }}
      >
        “Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él.”
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          mt: 4,
          fontWeight: 500,
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontSize: '1rem',
          transition: 'color 0.4s ease',
        }}
      >
        — Proverbios 22:6 —
      </Typography>
    </Box>
  );
};

export default VerseSection;
