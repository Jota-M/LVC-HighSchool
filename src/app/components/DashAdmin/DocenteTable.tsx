// components/UserTable.tsx
import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Chip, IconButton, Typography } from '@mui/material';
import { tokens } from '@/app/dashboard/theme';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface User {
  name: string;
  email: string;
  role: string;
  status: string;
  lastAccess: string;
  color: string;
}

interface UserTableProps {
  users: User[];
}

const DocenteTable: React.FC<UserTableProps> = ({ users }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('');

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[400] }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: colors.grey[100] }}>Usuario</TableCell>
            <TableCell sx={{ color: colors.grey[100] }}>Rol</TableCell>
            <TableCell sx={{ color: colors.grey[100] }}>Estado</TableCell>
            <TableCell sx={{ color: colors.grey[100] }}>Último acceso</TableCell>
            <TableCell align="center" sx={{ color: colors.grey[100] }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={index}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: colors.blueAccent[500], color: 'white', mr: 2 }}>
                    {getInitials(user.name)}
                  </Avatar>
                  <Box>
                    <Typography color={colors.grey[100]} fontWeight="bold">{user.name}</Typography>
                    <Typography color={colors.grey[300]} variant="body2">{user.email}</Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={user.role} sx={{ bgcolor: colors[user.color as keyof typeof colors][600], color: colors.grey[100], fontWeight: 600 }} />
              </TableCell>
              <TableCell>
                <Chip label={user.status} sx={{ bgcolor: colors.greenAccent[600], color: colors.grey[100], fontWeight: 600 }} />
              </TableCell>
              <TableCell>
                <Typography color={colors.grey[200]}>{user.lastAccess}</Typography>
              </TableCell>
              <TableCell align="center">
                <IconButton><EditIcon sx={{ color: colors.grey[100] }} /></IconButton>
                <IconButton><MoreVertIcon sx={{ color: colors.grey[100] }} /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default DocenteTable