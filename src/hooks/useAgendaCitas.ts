// client/src/hooks/useAgendaCitas.ts
import { useState, useEffect, useCallback } from 'react';
import preinscripcionService from '@/services/preinscripcionService';
import { reservaCupoService } from '@/services/reservaCupoService';
import { CitaOcupada, extraerInfoCitaDeTexto, registrarUltimaCitaAgendada } from '@/utils/agendaUtils';

export function useAgendaCitas(idActual?: string | number | null) {
  const [citasOcupadas, setCitasOcupadas] = useState<CitaOcupada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [siguientePostulanteId, setSiguientePostulanteId] = useState<number | null>(null);
  const [totalPendientes, setTotalPendientes] = useState(0);

  const cargarCitas = useCallback(async () => {
    try {
      setCargando(true);
      const citas: CitaOcupada[] = [];

      // 1. Cargar preinscripciones con entrevistas programadas o en proceso
      try {
        const respPre = await preinscripcionService.listarPreinscripciones({
          limit: 250,
        });
        const lista = respPre?.data?.preinscripciones || respPre?.preinscripciones || (Array.isArray(respPre) ? respPre : []);

        for (const p of lista) {
          const obs = p.observaciones || '';
          const info = extraerInfoCitaDeTexto(obs);
          if (info.fechaISO && info.hora) {
            citas.push({
              id: p.id,
              estudianteNombre: p.estudiante_nombre || (p.estudiante ? `${p.estudiante.nombres} ${p.estudiante.apellido_paterno}` : `Postulante #${p.id}`),
              codigo: p.codigo_inscripcion,
              fechaISO: info.fechaISO,
              hora: info.hora,
              timestamp: info.timestamp,
              tipo: 'preinscripcion',
            });
          }
        }

        // 2. Determinar el siguiente postulante pendiente en la lista de revisión
        if (idActual) {
          const currIdNum = Number(idActual);
          const pendientes = lista.filter((p: any) =>
            ['iniciada', 'datos_completos', 'en_revision', 'entrevista_pendiente', 'documentos_aprobados'].includes(p.estado)
          );
          setTotalPendientes(pendientes.length);

          const idxActual = pendientes.findIndex((p: any) => Number(p.id) === currIdNum);
          if (idxActual !== -1 && idxActual + 1 < pendientes.length) {
            setSiguientePostulanteId(Number(pendientes[idxActual + 1].id));
          } else if (pendientes.length > 0 && Number(pendientes[0].id) !== currIdNum) {
            setSiguientePostulanteId(Number(pendientes[0].id));
          } else {
            setSiguientePostulanteId(null);
          }
        }
      } catch (errPre) {
        console.warn('No se pudieron cargar citas de preinscripciones:', errPre);
      }

      // 3. Cargar citas de hermanos (reserva de cupos)
      try {
        const hermanosData = await reservaCupoService.listarHermanosAdmin({ limit: 250 });
        const hermanosList = hermanosData?.hermanos || (Array.isArray(hermanosData) ? hermanosData : []);

        for (const h of hermanosList) {
          if (h.fecha_entrevista || h.fecha_entrevista_iso) {
            const fechaDirecta = h.fecha_entrevista_iso || h.fecha_entrevista;
            const info = extraerInfoCitaDeTexto(null, fechaDirecta);
            if (info.fechaISO && info.hora) {
              citas.push({
                id: `hermano-${h.id}`,
                estudianteNombre: `${h.nombres} ${h.apellido_paterno}`,
                codigo: h.codigo_reserva,
                fechaISO: info.fechaISO,
                hora: info.hora,
                timestamp: info.timestamp,
                tipo: 'hermano',
              });
            }
          }
        }
      } catch (errHer) {
        console.warn('No se pudieron cargar citas de hermanos:', errHer);
      }

      // Ordenar citas cronológicamente
      citas.sort((a, b) => a.timestamp - b.timestamp);
      setCitasOcupadas(citas);
    } catch (err) {
      console.error('Error general al cargar agenda de citas:', err);
    } finally {
      setCargando(false);
    }
  }, [idActual]);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  const registrarCita = useCallback((fechaTexto: string, horaTexto: string, estudiante: string, codigo?: string) => {
    const info = extraerInfoCitaDeTexto(`${fechaTexto} a horas ${horaTexto}`);
    if (info.fechaISO && info.hora) {
      registrarUltimaCitaAgendada({
        fecha: fechaTexto,
        fechaISO: info.fechaISO,
        hora: horaTexto,
        estudiante,
        codigo,
        timestamp: info.timestamp,
      });
    }
  }, []);

  return {
    citasOcupadas,
    cargando,
    recargarCitas: cargarCitas,
    siguientePostulanteId,
    totalPendientes,
    registrarCita,
  };
}
