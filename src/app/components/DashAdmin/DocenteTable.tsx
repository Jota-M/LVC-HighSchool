"use client";
import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/app/dashboard/theme";
import { keyframes } from "@mui/system";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StarIcon from "@mui/icons-material/Star";

interface Teacher {
  name: string;
  email: string;
  role?: string;
  status: string;
  lastAccess: string;
  department?: string;
  students?: number;
  courses?: number;
}

interface DocenteTableProps {
  users: Teacher[];
}

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(102, 126, 234, 0.5), 0 0 10px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 0 30px rgba(102, 126, 234, 0.5); }
`;

export default function DocenteTable({ users }: DocenteTableProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeacher(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTeacher(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarGradient = (index: number) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.primary[400],
        borderRadius: "24px",
        overflow: "hidden",
        border: `2px solid ${colors.primary[300]}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
                  : "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                borderBottom: `2px solid ${colors.primary[300]}`,
              }}
            >
              <TableCell sx={{ py: 2.5 }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={800} 
                  sx={{ 
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontSize: "0.75rem",
                  }}
                >
                  Docente
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5, fontSize: "0.75rem" }}>
                  Departamento
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ py: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5, fontSize: "0.75rem" }}>
                  Cursos
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ py: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5, fontSize: "0.75rem" }}>
                  Estudiantes
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5, fontSize: "0.75rem" }}>
                  Estado
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5, fontSize: "0.75rem" }}>
                  Último Acceso
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ py: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5, fontSize: "0.75rem" }}>
                  Acciones
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((teacher, index) => (
              <TableRow
                key={index}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
                sx={{
                  animation: `${slideIn} 0.5s ease-out ${index * 0.1}s both`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderBottom: `1px solid ${colors.primary[300]}`,
                  "&:hover": {
                    backgroundColor: theme.palette.mode === "dark" 
                      ? "rgba(102, 126, 234, 0.05)" 
                      : "rgba(102, 126, 234, 0.02)",
                    transform: "scale(1.01)",
                    boxShadow: `inset 4px 0 0 ${colors.blueAccent[500]}`,
                  },
                }}
              >
                {/* Docente con Avatar */}
                <TableCell sx={{ py: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        sx={{
                          background: getAvatarGradient(index),
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          width: 50,
                          height: 50,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          transition: "all 0.3s ease",
                          animation: hoveredRow === index ? `${glow} 2s ease-in-out infinite` : "none",
                          transform: hoveredRow === index ? "scale(1.1) rotate(5deg)" : "scale(1)",
                        }}
                      >
                        {getInitials(teacher.name)}
                      </Avatar>
                      {teacher.students && teacher.students > 50 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -5,
                            right: -5,
                            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                            borderRadius: "50%",
                            p: 0.5,
                            display: "flex",
                            boxShadow: "0 2px 8px rgba(245, 87, 108, 0.5)",
                          }}
                        >
                          <StarIcon sx={{ fontSize: 14, color: "#fff" }} />
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={700} mb={0.5}>
                        {teacher.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EmailIcon sx={{ fontSize: 14, color: colors.blueAccent[500] }} />
                        <Typography variant="caption" color="text.secondary">
                          {teacher.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>

                {/* Departamento */}
                <TableCell sx={{ py: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        p: 0.8,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 18, color: "#fff" }} />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {teacher.department || "Sin asignar"}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Cursos */}
                <TableCell align="center" sx={{ py: 2.5 }}>
                  <Chip
                    label={`${teacher.courses || 0} cursos`}
                    size="small"
                    sx={{
                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: "12px",
                      px: 1,
                      boxShadow: "0 4px 12px rgba(79, 172, 254, 0.4)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: "0 6px 20px rgba(79, 172, 254, 0.6)",
                      },
                    }}
                  />
                </TableCell>

                {/* Estudiantes */}
                <TableCell align="center" sx={{ py: 2.5 }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <Box
                      sx={{
                        background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                        p: 0.8,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <GroupIcon sx={{ fontSize: 18, color: "#fff" }} />
                    </Box>
                    <Typography variant="body1" fontWeight={700}>
                      {teacher.students || 0}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Estado */}
                <TableCell sx={{ py: 2.5 }}>
                  <Chip
                    label={teacher.status}
                    size="small"
                    sx={{
                      background: teacher.status === "Activo"
                        ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                        : "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: "12px",
                      px: 1.5,
                      boxShadow: teacher.status === "Activo"
                        ? "0 4px 12px rgba(56, 239, 125, 0.4)"
                        : "0 4px 12px rgba(238, 9, 121, 0.4)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                </TableCell>

                {/* Último Acceso */}
                <TableCell sx={{ py: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon sx={{ fontSize: 18, color: colors.blueAccent[500] }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {teacher.lastAccess}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Acciones */}
                <TableCell align="right" sx={{ py: 2.5 }}>
                  <Tooltip title="Más opciones" TransitionComponent={Fade}>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, index)}
                      sx={{
                        background: theme.palette.mode === "dark"
                          ? "rgba(102, 126, 234, 0.1)"
                          : "rgba(102, 126, 234, 0.05)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          transform: "rotate(90deg)",
                          "& svg": {
                            color: "#fff",
                          },
                        },
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menú de Acciones mejorado */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            mt: 1,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: `1px solid ${colors.primary[300]}`,
            overflow: "hidden",
          },
        }}
      >
        <MenuItem 
          onClick={handleMenuClose}
          sx={{
            py: 1.5,
            px: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              paddingLeft: 3,
            },
          }}
        >
          <VisibilityIcon sx={{ mr: 1.5, fontSize: 20, color: colors.blueAccent[500] }} />
          <Typography fontWeight={600}>Ver perfil</Typography>
        </MenuItem>
        <MenuItem 
          onClick={handleMenuClose}
          sx={{
            py: 1.5,
            px: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              background: "linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)",
              paddingLeft: 3,
            },
          }}
        >
          <EditIcon sx={{ mr: 1.5, fontSize: 20, color: colors.greenAccent[500] }} />
          <Typography fontWeight={600}>Editar</Typography>
        </MenuItem>
        <MenuItem 
          onClick={handleMenuClose}
          sx={{
            py: 1.5,
            px: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              background: "linear-gradient(135deg, rgba(238, 9, 121, 0.1) 0%, rgba(255, 106, 0, 0.1) 100%)",
              paddingLeft: 3,
            },
          }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: 20, color: colors.redAccent[500] }} />
          <Typography fontWeight={600} color={colors.redAccent[500]}>
            Eliminar
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}