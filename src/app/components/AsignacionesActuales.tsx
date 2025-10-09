// components/AsignacionesActuales.tsx
import { Box, Typography, Avatar, Chip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const AsignacionesActuales = () => {
  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>Asignaciones Actuales</Typography>

      <Box display="flex" gap={2} alignItems="center" p={2} border="1px solid" borderRadius={2}>
        <Avatar>MG</Avatar>
        <Box>
          <Typography variant="subtitle1">María González</Typography>
          <Typography variant="body2" color="text.secondary">Docente de Matemáticas</Typography>
          <Box mt={1}>
            <Chip label="Matemáticas - 1A" sx={{ mr: 1 }} />
            <Chip label="Matemáticas - 1B" />
          </Box>
        </Box>
        <Box ml="auto">
          <IconButton><EditIcon /></IconButton>
          <IconButton><DeleteIcon /></IconButton>
        </Box>
      </Box>
    </Box>
  );
};
