import React from 'react';
import { Typography } from '@mui/material';

function Title({ text }:{ text: string }) {
  return (
    <div>
      <Typography variant="h1" sx={{ color: '#3f51b5', fontSize: { xs: '1.5rem', sm: '1.5rem', md: '2rem', lg: '1rem' }, lineHeight: 1.5, fontWeight: 'bold' }}>
        {text}
      </Typography>
    </div>
  )
}

export default Title
