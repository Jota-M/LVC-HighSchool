'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import BlockIcon from '@mui/icons-material/Block';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <BlockIcon sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Acceso No Autorizado
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        No tienes permisos para acceder a esta página.
      </Typography>
      <Button
        variant="contained"
        onClick={() => router.push('/dashboard')}
        sx={{
          background: 'linear-gradient(90deg, #0288d1, #01579b)',
          px: 4,
          py: 1.5,
        }}
      >
        Volver al Dashboard
      </Button>
    </Box>
  );
}