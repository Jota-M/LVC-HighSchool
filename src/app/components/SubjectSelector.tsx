// components/SubjectSelector.tsx
import { Box, Typography, Button, Select, MenuItem, Chip } from "@mui/material";

export const SubjectSelector = () => {
  return (
    <Box p={2} border="1px solid" borderRadius={2}>
      <Typography variant="h6">Configuración de Horarios</Typography>

      <Box mt={2}>
        <Typography>Lunes</Typography>
        <Box display="flex" gap={1} mt={1}>
          {["8:00-9:00", "9:00-10:00", "10:00-11:00"].map((slot, index) => (
            <Chip key={index} label={slot} color="primary" variant="outlined" />
          ))}
        </Box>

        <Typography mt={2}>Martes</Typography>
        <Box display="flex" gap={1} mt={1}>
          {["8:00-9:00", "9:00-10:00", "10:00-11:00"].map((slot, index) => (
            <Chip key={index} label={slot} color="secondary" variant="outlined" />
          ))}
        </Box>
      </Box>

      <Box display="flex" gap={2} mt={3}>
        <Button variant="outlined" color="inherit">Cancelar</Button>
        <Button variant="contained" color="primary">Confirmar Asignación</Button>
      </Box>
    </Box>
  );
};
