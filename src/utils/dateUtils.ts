/**
 * Utilidades para manejo seguro de fechas.
 * Resuelve problemas de desfase horario UTC (-4 Bolivia) y evita cadenas "Invalid Date".
 */

export function parseDateSafe(val?: string | Date | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Si ya contiene separador de tiempo
    if (trimmed.includes('T') || trimmed.includes(' ')) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) return d;

      // Si fue concatenado incorrectamente con 'T12:00:00' a un ISO existente
      const firstPart = trimmed.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(firstPart)) {
        const [y, m, dNum] = firstPart.split('-').map(Number);
        return new Date(y, m - 1, dNum, 12, 0, 0);
      }
    }

    // Si es solo YYYY-MM-DD, instanciar a mediodía local para evitar que UTC reste un día
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, dNum] = trimmed.split('-').map(Number);
      return new Date(y, m - 1, dNum, 12, 0, 0);
    }

    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Formatea una fecha de forma segura al español de Bolivia ('es-BO').
 * Retorna el valor `fallback` en lugar de "Invalid Date".
 */
export function formatDate(
  val?: string | Date | null,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  },
  fallback = '—'
): string {
  const d = parseDateSafe(val);
  if (!d) return fallback;
  try {
    return d.toLocaleDateString('es-BO', options);
  } catch {
    return fallback;
  }
}

/**
 * Formato corto: "19 jun 2026"
 */
export function formatDateShort(val?: string | Date | null, fallback = '—'): string {
  return formatDate(val, { day: '2-digit', month: 'short', year: 'numeric' }, fallback);
}

/**
 * Formato solo día y mes: "19 jun"
 */
export function formatDateDayMonth(val?: string | Date | null, fallback = '—'): string {
  return formatDate(val, { day: '2-digit', month: 'short' }, fallback);
}

/**
 * Formato largo: "viernes, 19 de junio de 2026"
 */
export function formatDateLong(val?: string | Date | null, fallback = '—'): string {
  return formatDate(
    val,
    { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
    fallback
  );
}
