import React from 'react'
import { Typography } from '@mui/material'
import { useTheme } from '@mui/material';

interface ParagraphProps {
  text: string;
  alignText?: 'left' | 'right' | 'center' | 'justify'; 
}

function Paragrafth({ text, alignText = 'center' }: ParagraphProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Typography
      variant="body1"
      sx={{
        textAlign: alignText,
        color: isDark ? '#B8E5FF' : 'text.secondary',
        width: { lg: '100%' },
        fontSize: { xs: '0.9rem', sm: '0.9rem', md: '1rem', lg: '1rem' },
        marginTop: 2,
        lineHeight: 1.8,
      }}
    >
      {text}
    </Typography>
  );
}

export default Paragrafth;
