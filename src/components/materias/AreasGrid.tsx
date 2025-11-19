import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { AreaConocimiento } from '../../services/materias';

interface AreasGridProps {
  areas: AreaConocimiento[];
  onEdit: (area: AreaConocimiento) => void;
  onDelete: (id: number) => void;
  onSelectArea?: (areaId: number) => void;
}

export const AreasGrid: React.FC<AreasGridProps> = ({
  areas,
  onEdit,
  onDelete,
  onSelectArea
}) => {
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      {areas.map((area, index) => (
        <Grid size={{xs:12, sm:6, md:4, lg:3}} key={area.id}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              border: `2px solid ${alpha(area.color || theme.palette.primary.main, 0.3)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: onSelectArea ? 'pointer' : 'default',
              animation: `fadeIn 0.5s ease ${index * 0.1}s both`,
              '@keyframes fadeIn': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)'
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.03)',
                boxShadow: `0 12px 24px ${alpha(area.color || theme.palette.primary.main, 0.3)}`,
                borderColor: area.color,
              }
            }}
            onClick={() => onSelectArea && onSelectArea(area.id)}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: area.color,
                    boxShadow: `0 4px 8px ${alpha(area.color || theme.palette.primary.main, 0.4)}`
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Editar área">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(area);
                      }}
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: theme.palette.warning.main,
                          color: 'white',
                          transform: 'rotate(15deg) scale(1.2)',
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar área">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(area.id);
                      }}
                      sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: theme.palette.error.main,
                          color: 'white',
                          transform: 'scale(1.2)',
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                {area.nombre}
              </Typography>

              {area.descripcion && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {area.descripcion}
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Chip
                  icon={<MenuBookIcon />}
                  label={`${area.total_materias || 0} materias`}
                  size="small"
                  sx={{
                    bgcolor: alpha(area.color || theme.palette.primary.main, 0.15),
                    color: area.color,
                    fontWeight: 600
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Orden: {area.orden}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};