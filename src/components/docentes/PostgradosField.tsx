'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  WorkspacePremium as CertificateIcon
} from '@mui/icons-material';
import {
  PostgradoItem,
  TipoPostgrado,
  TIPOS_POSTGRADO,
  parsePostgrados,
  formatPostgrados
} from '@/types/docenteTypes';

interface PostgradosFieldProps {
  value?: string | null;
  onChange: (newValue: string) => void;
  onNivelAutoUpdate?: (nivelSugerido: string) => void;
}

export const PostgradosField: React.FC<PostgradosFieldProps> = ({
  value,
  onChange,
  onNivelAutoUpdate
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<PostgradoItem[]>(() => parsePostgrados(value));
  const [tipo, setTipo] = useState<TipoPostgrado>('diplomado');
  const [nombre, setNombre] = useState('');

  // Sincronizar si cambia externamente
  useEffect(() => {
    const parsed = parsePostgrados(value);
    setItems(parsed);
  }, [value]);

  const handleAdd = () => {
    if (!nombre.trim()) return;

    const newItem: PostgradoItem = {
      tipo,
      nombre: nombre.trim()
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    setNombre('');
    const serialized = formatPostgrados(newItems);
    onChange(serialized);

    // Sugerir nivel de formación si aplica
    if (onNivelAutoUpdate) {
      if (newItems.some(i => i.tipo === 'doctorado')) {
        onNivelAutoUpdate('doctorado');
      } else if (newItems.some(i => i.tipo === 'maestria')) {
        onNivelAutoUpdate('maestria');
      } else if (newItems.some(i => i.tipo === 'diplomado' || i.tipo === 'especialidad')) {
        onNivelAutoUpdate('diplomado');
      }
    }
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, idx) => idx !== index);
    setItems(newItems);
    const serialized = formatPostgrados(newItems);
    onChange(serialized);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const getTipoMeta = (tipoVal: TipoPostgrado) => {
    return TIPOS_POSTGRADO.find(t => t.value === tipoVal) || {
      label: tipoVal,
      color: '#4b5563',
      bg: '#f3f4f6'
    };
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CertificateIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
        Postgrados y Especializaciones ({items.length})
      </Typography>

      {/* Formulario de Adición Rápida */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: '12px',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderColor: alpha(theme.palette.primary.main, 0.15),
          mb: 1.5
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
            <InputLabel>Nivel / Tipo</InputLabel>
            <Select
              value={tipo}
              label="Nivel / Tipo"
              onChange={(e) => setTipo(e.target.value as TipoPostgrado)}
            >
              {TIPOS_POSTGRADO.map(t => (
                <MenuItem key={t.value} value={t.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.color }} />
                    {t.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            fullWidth
            label="Nombre del Diplomado / Maestría"
            placeholder="Ej: Educación Superior y TIC"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <Button
            variant="contained"
            size="medium"
            onClick={handleAdd}
            disabled={!nombre.trim()}
            startIcon={<AddIcon />}
            sx={{ minWidth: { xs: '100%', sm: 120 }, height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            Agregar
          </Button>
        </Stack>
      </Paper>

      {/* Lista de Chips de Postgrados */}
      {items.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 0.5 }}>
          {items.map((item, idx) => {
            const meta = getTipoMeta(item.tipo);
            return (
              <Chip
                key={idx}
                icon={<SchoolIcon style={{ color: meta.color, fontSize: 18 }} />}
                label={
                  <span>
                    <strong style={{ color: meta.color, textTransform: 'capitalize' }}>[{meta.label}]</strong> {item.nombre}
                  </span>
                }
                onDelete={() => handleRemove(idx)}
                sx={{
                  bgcolor: meta.bg,
                  color: '#1f2937',
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  py: 2,
                  px: 0.5,
                  borderRadius: '10px',
                  border: `1px solid ${alpha(meta.color, 0.3)}`,
                  '& .MuiChip-deleteIcon': {
                    color: meta.color,
                    '&:hover': {
                      color: '#ef4444'
                    }
                  }
                }}
              />
            );
          })}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', px: 1 }}>
          No se han registrado diplomados, maestrías ni postgrados aún.
        </Typography>
      )}
    </Box>
  );
};

export default PostgradosField;
