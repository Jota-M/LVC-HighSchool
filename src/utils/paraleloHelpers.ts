// utils/paraleloHelpers.ts

/**
 * Obtiene un color basado en el orden del nivel académico
 */
export const getNivelColor = (orden: number): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9'];
  return colors[orden % colors.length] || '#95E1D3';
};

/**
 * Obtiene un icono emoji basado en el orden del nivel académico
 */
export const getNivelIcon = (orden: number): string => {
  const icons = ['🎨', '📚', '🔬', '🎓', '🏆', '🌟'];
  return icons[orden % icons.length] || '📖';
};

/**
 * Obtiene el color del turno basado en su nombre
 */
export const getTurnoColor = (turnoNombre: string): string => {
  if (!turnoNombre) return '#9E9E9E';
  const nombre = turnoNombre.toLowerCase();
  if (nombre.includes('mañana')) return '#FFD93D';
  if (nombre.includes('tarde')) return '#FF9A3C';
  if (nombre.includes('noche')) return '#6C5CE7';
  return '#9E9E9E';
};

/**
 * Obtiene el icono emoji del turno basado en su nombre
 */
export const getTurnoIcon = (turnoNombre: string): string => {
  if (!turnoNombre) return '⏰';
  const nombre = turnoNombre.toLowerCase();
  if (nombre.includes('mañana')) return '☀️';
  if (nombre.includes('tarde')) return '🌤️';
  if (nombre.includes('noche')) return '🌙';
  return '⏰';
};

/**
 * Letras disponibles para los paralelos
 */
export const letrasParalelos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Calcula el porcentaje de capacidad ocupada
 */
export const calcularPorcentajeCapacidad = (total: number, capacidad: number): number => {
  if (capacidad === 0) return 0;
  return (total / capacidad) * 100;
};

/**
 * Verifica si un paralelo está lleno (90% o más de capacidad)
 */
export const isParaleloLleno = (total: number, capacidad: number): boolean => {
  return calcularPorcentajeCapacidad(total, capacidad) >= 90;
};

/**
 * Formatea una hora en formato HH:MM
 */
export const formatearHora = (hora: string): string => {
  if (!hora) return '';
  return hora.slice(0, 5);
};