import React from 'react';
import { Typography } from '@mui/material';

function Title({ text }: { text: string }) {
  return (
    <div>
      <Typography
        variant="h1"
        sx={{
          color: '#3f51b5',
          fontSize: { xs: '0.75rem', sm: '1rem', md: '1.75rem', lg: '2rem' },
          lineHeight: 1.2,
          fontWeight: 'bold',
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        {text}
      </Typography>
    </div>
  );
}

export default Title;
