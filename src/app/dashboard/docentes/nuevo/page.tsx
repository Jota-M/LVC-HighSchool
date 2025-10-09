"use client";
import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Snackbar,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '@/app/dashboard/theme';
import MenuItem from '@mui/material/MenuItem';
import MuiAlert from '@mui/material/Alert';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Page() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    motherLastName: '',
    idNumber: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    gender: '',
    title: '',
    experience: '',
    subject: '',
    level: '',
    username: '',
    temporaryPassword: '',
    confirmPassword: '',
    institution: '',
    graduationYear: '',
    accountStatus: true,
  });

  const currencies = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' }
  ];

  const currencies2 = [
    { value: 'Licenciatura', label: 'Licenciatura' },
    { value: 'Maestría', label: 'Maestría' },
    { value: 'Doctorado', label: 'Doctorado' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Respuesta del backend:", data);
      setSnackbarMessage("Docente creado con éxito");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setSnackbarMessage("Error al crear docente");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const fieldStyle = {
    '& .MuiInputBase-root': {
      backgroundColor: colors.primary[400],
      borderRadius: 2,
      transition: 'all 0.3s ease',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.grey[500],
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.success.main,
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.success.main,
    },
    '& .MuiInputLabel-root': {
      color: colors.grey[100],
    },
    '&:hover .MuiInputLabel-root': {
      color: theme.palette.success.main,
    },
    '& .Mui-focused .MuiInputLabel-root': {
      color: theme.palette.success.main,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.success.main,
    },
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              backgroundColor: colors.primary[400],
              borderRadius: '12px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              padding: 4,
              width: '100%',
            }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Crear Nuevo Docente
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Registro de información profesional y personal
            </Typography>

            <Box component="form" sx={{ width: '100%' }} onSubmit={handleSubmit}>
              {/* Sección: Personal */}
              <Box display="flex" alignItems="center" mb={1}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  Información Personal
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Nombres"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Apellido Paterno"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Apellido Materno"
                    name="motherLastName"
                    value={formData.motherLastName}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Cédula de ID"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    select
                    label="Sexo"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    sx={{ ...fieldStyle, width: '100%' }}
                  >
                    {currencies.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyle}
                  />
                </Grid>

                {/* Sección: Académica */}
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center" mb={1} mt={3}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      Información Académica
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Título Profesional"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 } }>
                  <TextField
                    select
                    label="Nivel de estudios"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    sx={{ ...fieldStyle, width: '100%' }}
                  >
                    {currencies2.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Año de egreso"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Institución de estudio"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.accountStatus}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            accountStatus: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Estado de Cuenta"
                  />
                </Grid>
              </Grid>

              <Box mt={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  type="submit"
                  startIcon={<PersonAddIcon />}
                  sx={{
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    paddingY: 1.5,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    transition: '0.3s',
                    '&:hover': {
                      backgroundColor: theme.palette.success.dark,
                    },
                  }}
                >
                  Crear Docente
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar de feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
}
