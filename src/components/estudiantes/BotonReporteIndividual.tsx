import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import useReportes  from '@/hooks/useReportes';
import { Estudiante } from '@/types/estudianteTypes';

interface BotonReporteIndividualProps {
  estudiante: Estudiante;
}

export const BotonReporteIndividual: React.FC<BotonReporteIndividualProps> = ({
  estudiante,
}) => {
  const { generarReporteEstudiante, isGenerating } = useReportes();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Evitar que se active el onClick de la card
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGenerarReporte = (formato: 'pdf' | 'excel') => {
    generarReporteEstudiante({
      estudiante_id: estudiante.id,
      formato,
    });
    handleClose();
  };

  return (
    <>
      <Tooltip title="Generar Reporte">
        <IconButton
          onClick={handleClick}
          disabled={isGenerating}
          color="primary"
          size="small"
        >
          {isGenerating ? <CircularProgress size={20} /> : <ReportIcon />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()} // Evitar propagación
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 160,
          },
        }}
      >
        <MenuItem onClick={() => handleGenerarReporte('pdf')}>
          <ListItemIcon>
            <PdfIcon color="error" fontSize="small" />
          </ListItemIcon>
          <ListItemText>Descargar PDF</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleGenerarReporte('excel')}>
          <ListItemIcon>
            <ExcelIcon sx={{ color: '#107C41' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText>Descargar Excel</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
