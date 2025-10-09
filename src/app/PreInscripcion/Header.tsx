import React from "react";
import Navbar from "./Navbar";
import {
  Grid,
  Typography,
  Button,
  Box,
  Paper,
  useTheme,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import ArchiveIcon from "@mui/icons-material/Archive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import CheckIcon from "@mui/icons-material/Check";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SendTimeExtensionIcon from "@mui/icons-material/SendTimeExtension";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";

import CardIns from "../components/CardIns";
import Requisitos from "../components/Requisitos";
import IconPre from "../components/IconPre";

function Header() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark'

  return (
    <Grid
      container
      id="Header"
      sx={{
        width: "100%",
        bgcolor: "background.default",
        color: "text.primary",
        pt: { xs: 10, md: 15, lg: 12 },
      }}
    >
      <Navbar />

      {/* Hero */}
      <Grid
        size={{ xs: 12 }}
        sx={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 6,
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: theme.shadows[3],
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "1.8rem", md: "2.5rem" },
            fontWeight: "bold",
            color: "#01579b",
          }}
        >
          ¡Asegura el futuro de tus hijos!
        </Typography>

        <Typography
          variant="body1"
          sx={{
            maxWidth: 600,
            color: "text.secondary",
          }}
        >
          Preinscripciones abiertas para el año lectivo 2024-2025. Completa el
          proceso de forma digital y obtén tu cupo en minutos.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            href="/PreInscripcion/registro"
            sx={{ fontWeight: "bold" }}
          >
            Iniciar Preinscripción
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<PriorityHighIcon />}
            href="#requisito"
          >
            Ver Requisitos
          </Button>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 3, md: 6 },
            flexWrap: "wrap",
            justifyContent: "center",
            mt: 4,
          }}
        >
          {[
            { label: "Estudiantes Matriculados", value: "1200+" },
            { label: "Tasa de aprobación", value: "98%" },
            { label: "Años de experiencia", value: "25" },
          ].map((stat, i) => (
            <Box key={i} sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="secondary" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          sx={{ mt: 3, fontWeight: "bold" }}
          color="success"
          href="/PreInscripcion/regular"
        >
          Estudiante Regular
        </Button>
      </Grid>

      {/* Proceso */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center", py: 6, px: 2 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Proceso de Preinscripción
        </Typography>
        <Typography
          variant="body2"
          sx={{ maxWidth: 600, mx: "auto", color: "text.secondary", mt: 1 }}
        >
          Sigue estos simples pasos para completar la preinscripción de tu hijo
          de manera rápida y segura
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 3,
            mt: 3,
          }}
        >
          <CardIns
            color="#01579b"
            backgroundcolor="#bbdefb"
            icon={<LooksOneIcon />}
            icon2={<PersonAddIcon />}
            title="Datos del estudiante"
            paragraph="Completa la información personal, académica y médica del estudiante"
          />
          <CardIns
            color="#ffcc80" 
            backgroundcolor="#fff9c4"
            icon={<LooksTwoIcon color="primary" />}
            icon2={<ArchiveIcon color="info" />}
            title="Documentos"
            paragraph="Sube los documentos requeridos: cédula, certificado de notas, certificado médico"
          />
          <CardIns
            color="#00e676"
            backgroundcolor="#b9f6ca"
            icon={<Looks3Icon color="primary" />}
            icon2={<CheckCircleIcon color="success" />}
            title="Confirmación"
            paragraph="Recibe la confirmación inmediata y el seguimiento del estado de tu solicitud"
          />
        </Box>
      </Grid>

      {/* Requisitos */}
      <Grid size={{ xs: 12, lg:10 }} offset={{lg:1}}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
            sx={{color: isDark ? 'grey.300' : 'text.secondary',}}
          >
            Requisitos de inscripción
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: "text.secondary", mb: 4 }}
          >
            Asegúrate de tener toda la documentación necesaria antes de comenzar
          </Typography>

          <Grid id="requisito"container spacing={4} justifyContent="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight="bold">
                <IconPre
                  backgroundcolor="#5CC3FF"
                  icon={<PersonAddIcon />}
                  color={theme.palette.primary.main}
                />
                Documentos del estudiante
              </Typography>
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="Cédula de identidad"
              />
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="Certificado de promoción"
              />
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="Certificado médico"
              />
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="2 fotos carnet"
              />
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="Libreta de calificaciones"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight="bold">
                <IconPre
                  backgroundcolor={theme.palette.warning.light}
                  icon={<FamilyRestroomIcon />}
                  color={theme.palette.warning.main}
                />
                Documentos del representante
              </Typography>
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="Cédula de identidad"
              />
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="Certificado de trabajo o RUC"
              />
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="Certificado de votación"
              />
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="Planilla de servicios básicos"
              />
              <Requisitos
                icon={<CheckIcon color="success" />}
                text="2 referencias personales"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }} >
              <Typography variant="h6" fontWeight="bold">
                <IconPre
                  backgroundcolor={theme.palette.success.light}
                  icon={<FamilyRestroomIcon />}
                  color={theme.palette.success.main}
                />
                Información adicional
              </Typography>
              <Requisitos
                icon={<AccessTimeIcon color="info" />}
                text="Revisión: 3-5 días hábiles"
              />
              <Requisitos
                icon={<AttachMoneyIcon color="error" />}
                text="Costo: $50.00"
              />
              <Requisitos
                icon={<CalendarMonthIcon color="primary" />}
                text="Fecha límite: 30 marzo 2024"
              />
              <Requisitos
                icon={<SendTimeExtensionIcon color="secondary" />}
                text="Cupos limitados"
              />
              <Requisitos
                icon={<LocalPhoneIcon color="success" />}
                text="Soporte: (02) 234-5678"
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Header;
