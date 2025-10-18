import * as React from 'react';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CardActionArea,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { keyframes } from '@mui/system';

interface MediaCardProps {
  title: string;
  paragraph: string;
  imageurl: string;
  init: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  link: string;
}

// Animación para aparecer los items
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

export default function MediaCard({
  title,
  paragraph,
  imageurl,
  init,
  paragraph1,
  paragraph2,
  paragraph3,
  link,
}: MediaCardProps) {
  return (
    <Card
      sx={{
        width: { xs: "90%", sm: "90%", md: "100%", lg: "100%" },
        borderRadius: 3,
        boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-10px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
        },
      }}
    >
      <CardActionArea href={link}>
        {/* Imagen con efecto hover */}
        <CardMedia
          sx={{
            height: { xs: 150, sm: 180, md: 200, lg: 220 },
            transition: "transform 0.5s",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
          image={imageurl}
          title={title}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="caption"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: '#01579b',
              animation: `${fadeIn} 0.6s ease forwards`,
            }}
          >
            {init}
          </Typography>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ animation: `${fadeIn} 0.8s ease forwards` }}
          >
            <Typography
              gutterBottom
              variant="h6"
              component="div"
              sx={{ fontSize: '1.3rem', fontWeight: 'bold' }}
            >
              {title}
            </Typography>
            <CallMadeIcon
              sx={{
                fontSize: '1.2rem',
                color: 'text.secondary',
                transition: "transform 0.3s",
                "&:hover": { transform: "rotate(20deg)" },
              }}
            />
          </Box>

          <Typography
            gutterBottom
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.85rem',
              animation: `${fadeIn} 1s ease forwards`,
            }}
          >
            {paragraph}
          </Typography>

          <Box sx={{ mt: 1 }}>
            {[paragraph1, paragraph2, paragraph3].map((text, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                mb={0.5}
                sx={{
                  animation: `${fadeIn} ${1 + index * 0.2}s ease forwards`,
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: '1rem',
                    color: '#01579b',
                    marginRight: '6px',
                    transition: "transform 0.3s",
                    "&:hover": { transform: "scale(1.2)" },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                >
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
