'use client';
import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';

interface CardInsProps {
  icon: React.JSX.Element;
  icon2: React.JSX.Element;
  title: string;
  paragraph: string;
  color: string;
  backgroundcolor: string;
}

function CardIns({ icon, icon2, title, paragraph, color, backgroundcolor }: CardInsProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;
  const accentColor = theme.palette.secondary.main;
  const iconBg = isDarkMode ? theme.palette.background.paper : theme.palette.grey[100];
  const borderColor = isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300];

  return (
    <Card
      sx={{
        maxWidth: { xs: 250, sm: 400, md: 250 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        margin: 1,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      {React.cloneElement(icon, {
        sx: {
          fontSize: 70,
          color: {color},
          margin: 1,
          marginTop: 4,
        },
      })}

      {React.cloneElement(icon2, {
        sx: {
          backgroundColor: iconBg,
          fontSize: 40,
          color: {color},
          backgroundcolor: {backgroundcolor},
          border: `1px solid ${borderColor}`,
          borderRadius: '1rem',
          padding: 1,
          marginBottom: 1,
        },
      })}

      <CardContent>
        <Typography
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '1.2rem' },
            fontWeight: 'bold',
            color: theme.palette.text.primary,
          }}
          gutterBottom
          variant="h5"
          component="div"
        >
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {paragraph}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default CardIns;
