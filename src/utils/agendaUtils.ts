// client/src/utils/agendaUtils.ts
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

export interface ConfiguracionAgenda {
  duracionMinutos: number; // 20, 30, 40, 45, 60
  atencionTarde: boolean;
  horaInicioManana: string; // "08:30"
  horaFinManana: string;    // "12:30"
  horaInicioTarde: string;  // "14:30"
  horaFinTarde: string;     // "17:30"
  diasLaborales: number[];  // [1, 2, 3, 4, 5] -> Lun(1) a Vie(5)
}

export const CONFIG_AGENDA_DEFAULT: ConfiguracionAgenda = {
  duracionMinutos: 30,
  atencionTarde: true,
  horaInicioManana: '08:30',
  horaFinManana: '12:30',
  horaInicioTarde: '14:30',
  horaFinTarde: '17:30',
  diasLaborales: [1, 2, 3, 4, 5],
};

export interface CitaOcupada {
  id: string | number;
  estudianteNombre: string;
  codigo?: string;
  fechaISO: string; // YYYY-MM-DD
  hora: string;     // HH:mm (formato 24h)
  timestamp: number;
  tipo?: 'preinscripcion' | 'hermano';
}

export interface SlotHorario {
  hora: string;        // "08:30"
  horaFin: string;     // "09:00"
  turno: 'manana' | 'tarde';
  ocupado: boolean;
  ocupadoPor?: string;
  codigoOcupado?: string;
}

export interface UltimaCitaInfo {
  fecha: string;      // DD/MM/YYYY
  fechaISO: string;   // YYYY-MM-DD
  hora: string;       // HH:mm
  estudiante: string;
  codigo?: string;
  timestamp: number;
}

const STORAGE_KEY_ULTIMA_CITA = 'LVC_AGENDA_ULTIMA_CITA';
const STORAGE_KEY_CONFIG = 'LVC_AGENDA_CONFIG';

/**
 * Obtener configuración actual de la agenda desde localStorage o defaults
 */
export function obtenerConfiguracionAgenda(): ConfiguracionAgenda {
  if (typeof window === 'undefined') return CONFIG_AGENDA_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return CONFIG_AGENDA_DEFAULT;
    return { ...CONFIG_AGENDA_DEFAULT, ...JSON.parse(raw) };
  } catch {
    return CONFIG_AGENDA_DEFAULT;
  }
}

/**
 * Guardar configuración de la agenda en localStorage
 */
export function guardarConfiguracionAgenda(cfg: Partial<ConfiguracionAgenda>): ConfiguracionAgenda {
  const actual = obtenerConfiguracionAgenda();
  const nueva = { ...actual, ...cfg };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(nueva));
    } catch (e) {
      console.warn('No se pudo guardar la configuración de agenda:', e);
    }
  }
  return nueva;
}

/**
 * Extraer fecha y hora de una observación textual o de un campo fecha
 */
export function extraerInfoCitaDeTexto(obs?: string | null, fechaDirecta?: string | null): {
  fechaISO: string | null;
  fechaTexto: string | null;
  hora: string | null;
  timestamp: number;
} {
  // 1. Si viene como fecha ISO directa (ej. fecha_entrevista de hermanos)
  if (fechaDirecta) {
    const d = dayjs(fechaDirecta);
    if (d.isValid()) {
      return {
        fechaISO: d.format('YYYY-MM-DD'),
        fechaTexto: d.format('DD/MM/YYYY'),
        hora: d.format('HH:mm'),
        timestamp: d.valueOf(),
      };
    }
  }

  if (!obs) {
    return { fechaISO: null, fechaTexto: null, hora: null, timestamp: 0 };
  }

  // 2. Extraer fecha (DD/MM/YYYY o YYYY-MM-DD)
  let dia: number | null = null;
  let mes: number | null = null;
  let anio: number | null = null;

  const ddmmyyyy = obs.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (ddmmyyyy) {
    dia = parseInt(ddmmyyyy[1], 10);
    mes = parseInt(ddmmyyyy[2], 10);
    anio = parseInt(ddmmyyyy[3], 10);
  } else {
    const yyyymmdd = obs.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    if (yyyymmdd) {
      anio = parseInt(yyyymmdd[1], 10);
      mes = parseInt(yyyymmdd[2], 10);
      dia = parseInt(yyyymmdd[3], 10);
    }
  }

  // 3. Extraer hora (HH:mm)
  let horaNum: number | null = null;
  let minNum: number | null = null;
  const horaMatch = obs.match(/(?:horas\s*\*?|a\s+horas\s*\*?|\b)(\d{1,2}):(\d{2})(?:\s*(?:am|pm|AM|PM))?\b/i);
  if (horaMatch) {
    horaNum = parseInt(horaMatch[1], 10);
    minNum = parseInt(horaMatch[2], 10);
    const lower = horaMatch[0].toLowerCase();
    if (lower.includes('pm') && horaNum < 12) horaNum += 12;
    if (lower.includes('am') && horaNum === 12) horaNum = 0;
  }

  if (dia && mes && anio) {
    const horaFinal = horaNum !== null ? horaNum : 9;
    const minFinal = minNum !== null ? minNum : 0;
    const d = dayjs(`${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')} ${String(horaFinal).padStart(2, '0')}:${String(minFinal).padStart(2, '0')}`);
    
    if (d.isValid()) {
      return {
        fechaISO: d.format('YYYY-MM-DD'),
        fechaTexto: d.format('DD/MM/YYYY'),
        hora: d.format('HH:mm'),
        timestamp: d.valueOf(),
      };
    }
  }

  return { fechaISO: null, fechaTexto: null, hora: null, timestamp: 0 };
}

/**
 * Guarda la última cita agendada en localStorage para memoria entre expedientes
 */
export function registrarUltimaCitaAgendada(info: UltimaCitaInfo) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ULTIMA_CITA, JSON.stringify(info));
  } catch (e) {
    console.warn('Error al guardar última cita en localStorage:', e);
  }
}

/**
 * Recupera la última cita agendada de localStorage
 */
export function obtenerUltimaCitaAgendada(): UltimaCitaInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ULTIMA_CITA);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Genera todos los slots horarios (mañana y tarde) para un día específico
 * y los marca como libres u ocupados según la lista de citas ocupadas.
 */
export function generarSlotsDelDia(
  fecha: Dayjs,
  config: ConfiguracionAgenda,
  citasOcupadas: CitaOcupada[]
): SlotHorario[] {
  const slots: SlotHorario[] = [];
  const fechaStr = fecha.format('YYYY-MM-DD');
  const dur = config.duracionMinutos || 30;

  // Filtrar citas de ese día
  const citasDia = citasOcupadas.filter((c) => c.fechaISO === fechaStr);

  const crearSlotsRango = (horaInicio: string, horaFin: string, turno: 'manana' | 'tarde') => {
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);

    let actual = fecha.hour(hIni).minute(mIni).second(0);
    const limite = fecha.hour(hFin).minute(mFin).second(0);

    while (actual.isBefore(limite)) {
      const siguiente = actual.add(dur, 'minute');
      if (siguiente.isAfter(limite)) break;

      const horaActualStr = actual.format('HH:mm');
      const horaFinStr = siguiente.format('HH:mm');

      // Verificar si hay alguna cita en este slot
      // Se considera ocupado si coincide la hora o cae dentro del intervalo
      const cita = citasDia.find((c) => {
        if (!c.hora) return false;
        const [cH, cM] = c.hora.split(':').map(Number);
        const citaD = fecha.hour(cH).minute(cM).second(0);
        return (
          (citaD.isSameOrAfter(actual) && citaD.isBefore(siguiente)) ||
          c.hora === horaActualStr
        );
      });

      slots.push({
        hora: horaActualStr,
        horaFin: horaFinStr,
        turno,
        ocupado: Boolean(cita),
        ocupadoPor: cita?.estudianteNombre,
        codigoOcupado: cita?.codigo,
      });

      actual = siguiente;
    }
  };

  // 1. Slots Turno Mañana
  crearSlotsRango(config.horaInicioManana, config.horaFinManana, 'manana');

  // 2. Slots Turno Tarde (si está activo)
  if (config.atencionTarde) {
    crearSlotsRango(config.horaInicioTarde, config.horaFinTarde, 'tarde');
  }

  return slots;
}

/**
 * Calcula el siguiente día hábil (evita fines de semana según config)
 */
export function obtenerSiguienteDiaHabil(fecha: Dayjs, config: ConfiguracionAgenda): Dayjs {
  let siguiente = fecha.add(1, 'day');
  const diasValidos = config.diasLaborales || [1, 2, 3, 4, 5];
  
  // Buscar el próximo día válido (máx 14 días para evitar bucle)
  for (let i = 0; i < 14; i++) {
    const diaSemana = siguiente.day(); // 0: Dom, 1: Lun, ..., 6: Sab
    if (diasValidos.includes(diaSemana)) {
      return siguiente;
    }
    siguiente = siguiente.add(1, 'day');
  }
  return siguiente;
}

/**
 * Calcula de forma inteligente el siguiente turno libre disponible
 * teniendo en cuenta:
 * - Última cita guardada / última del sistema
 * - Intervalo configurado (+30 min)
 * - Citas ya ocupadas en el sistema (evita solapamientos)
 * - Horarios laborales y días hábiles
 */
export function calcularSiguienteTurnoLibre(
  citasOcupadas: CitaOcupada[],
  config: ConfiguracionAgenda,
  ultimaCitaParam?: UltimaCitaInfo | null
): Dayjs {
  const dur = config.duracionMinutos || 30;
  const ultimaCita = ultimaCitaParam || obtenerUltimaCitaAgendada();

  // Determinar punto de partida:
  let fechaInicio: Dayjs;
  let horaInicioStr: string;

  if (ultimaCita && ultimaCita.fechaISO && ultimaCita.hora) {
    // Si hay una última cita conocida, intentar el siguiente slot después de esa cita
    const [h, m] = ultimaCita.hora.split(':').map(Number);
    const d = dayjs(ultimaCita.fechaISO).hour(h).minute(m).second(0);
    
    // Probar el slot inmediatamente siguiente (+duración)
    const propuesta = d.add(dur, 'minute');
    fechaInicio = propuesta;
    horaInicioStr = propuesta.format('HH:mm');
  } else if (citasOcupadas.length > 0) {
    // Tomar la cita más tardía del sistema
    const ordenada = [...citasOcupadas].sort((a, b) => b.timestamp - a.timestamp);
    const masTardia = ordenada[0];
    const [h, m] = masTardia.hora.split(':').map(Number);
    const d = dayjs(masTardia.fechaISO).hour(h).minute(m).second(0);
    const propuesta = d.add(dur, 'minute');
    fechaInicio = propuesta;
    horaInicioStr = propuesta.format('HH:mm');
  } else {
    // Por defecto: mañana a primera hora (08:30)
    let manana = dayjs().add(1, 'day');
    const diasValidos = config.diasLaborales || [1, 2, 3, 4, 5];
    while (!diasValidos.includes(manana.day())) {
      manana = manana.add(1, 'day');
    }
    const [hIni, mIni] = config.horaInicioManana.split(':').map(Number);
    return manana.hour(hIni).minute(mIni).second(0);
  }

  // Ahora buscamos el primer slot LIBRE a partir de fechaInicio
  let diaActual = fechaInicio.startOf('day');
  const diasValidos = config.diasLaborales || [1, 2, 3, 4, 5];

  // Si la fecha calculada cae en fin de semana / no laboral, saltar al siguiente día hábil
  if (!diasValidos.includes(diaActual.day())) {
    diaActual = obtenerSiguienteDiaHabil(diaActual.subtract(1, 'day'), config);
  }

  // Exploramos hasta 30 días hábiles
  for (let dIdx = 0; dIdx < 30; dIdx++) {
    const slots = generarSlotsDelDia(diaActual, config, citasOcupadas);

    for (const slot of slots) {
      const [sH, sM] = slot.hora.split(':').map(Number);
      const slotDayjs = diaActual.hour(sH).minute(sM).second(0);

      // Si es el mismo día de inicio, solo considerar slots >= a la hora de propuesta
      if (diaActual.isSame(fechaInicio, 'day')) {
        const [iniH, iniM] = fechaInicio.format('HH:mm').split(':').map(Number);
        const inicioDayjs = diaActual.hour(iniH).minute(iniM).second(0);
        if (slotDayjs.isBefore(inicioDayjs)) {
          continue;
        }
      }

      // Si no es el día de inicio pero el slot es hoy en el pasado, ignorar
      if (slotDayjs.isBefore(dayjs())) {
        continue;
      }

      // ¡Encontramos el primer slot libre!
      if (!slot.ocupado) {
        return slotDayjs;
      }
    }

    // Si no hubo slot libre hoy, saltar al siguiente día hábil
    diaActual = obtenerSiguienteDiaHabil(diaActual, config);
  }

  // Fallback seguro: mañana a primera hora
  const [hIni, mIni] = config.horaInicioManana.split(':').map(Number);
  return dayjs().add(1, 'day').hour(hIni).minute(mIni).second(0);
}
