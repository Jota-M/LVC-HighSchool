import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { title } from 'process';
import Box from "@mui/material/Box";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CardActionArea } from '@mui/material';

interface MediaCardProps {
  title: string;
  paragraph: string;
  imageurl: string;
  init: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}
export default function MediaCard({ title, paragraph, imageurl, init, paragraph1, paragraph2, paragraph3 }: MediaCardProps) {
  return (
    <>  
    <Card sx={{ width: { xs: "90%", sm: "90%", md: "100%", lg: "85%" } }}>
      <CardActionArea>
        <CardMedia
          sx={{ height: { xs: 150, sm: 180, md: 200, lg: 200 } }}
          image={imageurl}
          title={title}
        />
        <CardContent>
        <Typography gutterBottom variant="caption" component="div" sx={{fontWeight: 'bold', color: '#01579b'}}>
                {init}
            </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography gutterBottom variant="h6" component="div" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {title}
            </Typography>
            <CallMadeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
        </Box>
        <Typography gutterBottom variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
          {paragraph}
        </Typography>

        <Box>
            {[paragraph1, paragraph2, paragraph3].map((text, index) => (
        <Box key={index} display="flex" alignItems="center" mb={0.5}>
          <CheckCircleIcon sx={{fontSize: '1rem', color: '#01579b', marginRight: '4px'}} />
          <Typography variant="body2" sx={{ fontSize: '0.6rem', color: 'text.secondary'}}>
            {text}
          </Typography>
        </Box>
      ))}
    </Box>
      </CardContent>
      </CardActionArea>
    </Card>
    </>
  );
}