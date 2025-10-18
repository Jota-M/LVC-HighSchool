import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

interface PilsProps {
  image: string;
  title: string;
  description: string;
}

export default function Pils({ image, title, description }: PilsProps) {
  return (
    <Card
      sx={{
        
        borderRadius: 3,
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
        },
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      <Box
        sx={{
          height: { xs: 180, sm: 150, md: 180, lg: 180 },
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
      </Box>

      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontWeight: 'bold', color: '#FFD54F' }} // Amarillo igual al título principal
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', px: 1, lineHeight: 1.4 }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
