import React from 'react';
import {
  Box,
  Pagination,
  Select,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Stack,
  alpha,
  useTheme
} from '@mui/material';

interface PeriodoPaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const PeriodoPagination: React.FC<PeriodoPaginationProps> = ({
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange
}) => {
  const theme = useTheme();

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        p: 3,
        borderTop: `1px solid ${theme.palette.divider}`,
        background: alpha(theme.palette.background.default, 0.5)
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Registros</InputLabel>
          <Select
            value={limit}
            label="Registros"
            onChange={(e) => onLimitChange(Number(e.target.value))}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value={5}>5 por página</MenuItem>
            <MenuItem value={10}>10 por página</MenuItem>
            <MenuItem value={25}>25 por página</MenuItem>
            <MenuItem value={50}>50 por página</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary">
          Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de <strong>{total}</strong> registros
        </Typography>
      </Stack>

      <Pagination 
        count={totalPages} 
        page={page}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        size="large"
        showFirstButton
        showLastButton
        sx={{
          '& .MuiPaginationItem-root': {
            borderRadius: 2,
            fontWeight: 600,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
            }
          },
          '& .Mui-selected': {
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            fontWeight: 700,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            }
          }
        }}
      />
    </Box>
  );
};