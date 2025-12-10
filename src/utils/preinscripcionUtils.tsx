// src/app/dashboard/preinscripciones/utils/preinscripcion.utils.tsx

import React from 'react';
import { EstadoConfig, EstadoPreinscripcion, GradoSolicitado } from '../types/preinscripcioonTypes';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SchoolIcon from '@mui/icons-material/School';

/**
 * Obtiene la configuración visual de un estado
 */
export const getEstadoConfig = (estado?: EstadoPreinscripcion): EstadoConfig => {
  const configs: Record<string, EstadoConfig> = {
    'iniciada': { 
      label: 'Iniciada', 
      color: '#9e9e9e', 
      bgcolor: '#f5f5f5', 
      icon: <HourglassEmptyIcon /> 
    },
    'datos_completos': { 
      label: 'Datos Completos', 
      color: '#2196f3', 
      bgcolor: '#e3f2fd', 
      icon: <CheckCircleIcon /> 
    },
    'documentos_pendientes': { 
      label: 'Docs Pendientes', 
      color: '#ff9800', 
      bgcolor: '#fff3e0', 
      icon: <HourglassEmptyIcon /> 
    },
    'en_revision': { 
      label: 'En Revisión', 
      color: '#0288d1', 
      bgcolor: '#b3e5fc', 
      icon: <VisibilityIcon /> 
    },
    'documentos_aprobados': { 
      label: 'Docs Aprobados', 
      color: '#388e3c', 
      bgcolor: '#c8e6c9', 
      icon: <CheckCircleIcon /> 
    },
    'aprobada': { 
      label: 'Aprobada', 
      color: '#2e7d32', 
      bgcolor: '#c8e6c9', 
      icon: <CheckCircleIcon /> 
    },
    'rechazada': { 
      label: 'Rechazada', 
      color: '#d32f2f', 
      bgcolor: '#ffcdd2', 
      icon: <CancelIcon /> 
    },
    'convertida': { 
      label: 'Convertida', 
      color: '#7b1fa2', 
      bgcolor: '#e1bee7', 
      icon: <SchoolIcon /> 
    },
  };
  
  return configs[estado?.toLowerCase() || ''] || { 
    label: 'Desconocido', 
    color: '#757575', 
    bgcolor: '#e0e0e0', 
    icon: <HourglassEmptyIcon /> 
  };
};

/**
 * Obtiene el label formateado de un grado
 */
export const getGradoLabel = (grado?: GradoSolicitado | string): string => {
  const grados: Record<string, string> = {
    'TERCERO DE PRIMARIA': '3° Primaria',
    'PRIMERO_SEC': '1° Secundaria',
    'SEGUNDO_SEC': '2° Secundaria',
    'TERCERO_SEC': '3° Secundaria',
    'CUARTO_SEC': '4° Secundaria',
    'QUINTO_SEC': '5° Secundaria',
    'SEXTO_SEC': '6° Secundaria',
  };
  return grados[grado || ''] || grado || '';
};

/**
 * Obtiene las iniciales de un nombre completo
 */
export const getIniciales = (nombreCompleto: string): string => {
  return nombreCompleto
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NN';
};

/**
 * Formatea una fecha a formato legible
 */
export const formatearFecha = (fecha: string): string => {
  if (!fecha) return 'Sin fecha';
  
  try {
    return new Date(fecha).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha a formato relativo (hace X días)
 */
export const formatearFechaRelativa = (fecha: string): string => {
  if (!fecha) return 'Sin fecha';
  
  try {
    const ahora = new Date();
    const fechaDate = new Date(fecha);
    const diffMs = ahora.getTime() - fechaDate.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
    if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
    return `Hace ${Math.floor(diffDias / 365)} años`;
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Valida un CI boliviano
 */
export const validarCI = (ci: string): boolean => {
  // Formato básico: 7-10 dígitos seguidos opcionalmente de una extensión
  const regex = /^\d{7,10}(-[A-Z0-9]{1,3})?$/;
  return regex.test(ci);
};

/**
 * Valida un número de teléfono boliviano
 */
export const validarTelefono = (telefono: string): boolean => {
  // Formato: 8 dígitos (celular) o 7 dígitos (fijo)
  const regex = /^[67]\d{7}$|^\d{7}$/;
  return regex.test(telefono.replace(/\s|-/g, ''));
};

/**
 * Lista de estados disponibles para filtros
 */
export const ESTADOS_DISPONIBLES = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'iniciada', label: 'Iniciada' },
  { value: 'datos_completos', label: 'Datos Completos' },
  { value: 'documentos_pendientes', label: 'Documentos Pendientes' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'documentos_aprobados', label: 'Documentos Aprobados' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'rechazada', label: 'Rechazada' },
  { value: 'convertida', label: 'Convertida' },
];

/**
 * Lista de grados disponibles para filtros
 */
export const GRADOS_DISPONIBLES = [
  { value: 'todos', label: 'Todos los grados' },
  { value: 'TERCERO DE PRIMARIA', label: '3° Primaria' },
  { value: 'PRIMERO_SEC', label: '1° Secundaria' },
  { value: 'SEGUNDO_SEC', label: '2° Secundaria' },
  { value: 'TERCERO_SEC', label: '3° Secundaria' },
  { value: 'CUARTO_SEC', label: '4° Secundaria' },
  { value: 'QUINTO_SEC', label: '5° Secundaria' },
  { value: 'SEXTO_SEC', label: '6° Secundaria' },
];