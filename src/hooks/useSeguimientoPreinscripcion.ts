import { useState } from 'react';
import preinscripcionService from '@/services/preinscripcionService';
import { PreInscripcionDetalle } from '@/types/preinscripcionTypes';

export const useSeguimientoPreinscripcion = () => {
  const [preinscripcion, setPreinscripcion] = useState<PreInscripcionDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const buscarPorCodigo = async (codigo: string) => {
    if (!codigo.trim()) {
      setError('Ingresa un código de preinscripción');
      return;
    }

    setLoading(true);
    setError('');
    setPreinscripcion(null);

    try {
      const data = await preinscripcionService.buscarPorCodigo(codigo.toUpperCase());
      setPreinscripcion(data);
    } catch (err: any) {
      setError(err.message || 'No se encontró la preinscripción');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Siempre retornar el mismo tipo
  const actualizarEstudiante = async (
    datosEstudiante: any
  ): Promise<{ success: boolean; error?: string }> => {
    if (!preinscripcion) {
      return { success: false, error: 'No hay una preinscripción cargada' };
    }

    setGuardando(true);
    try {
      await preinscripcionService.actualizarDatosEstudiante(
        preinscripcion.id,
        datosEstudiante
      );

      const actualizada = await preinscripcionService.obtenerPorId(preinscripcion.id);
      setPreinscripcion(actualizada);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message ?? 'Error desconocido',
      };
    } finally {
      setGuardando(false);
    }
  };

  const actualizarTutor = async (
    datosTutor: any
  ): Promise<{ success: boolean; error?: string }> => {
    if (!preinscripcion) {
      return { success: false, error: 'No hay una preinscripción cargada' };
    }

    setGuardando(true);
    try {
      await preinscripcionService.actualizarDatosTutor(preinscripcion.id, datosTutor);

      const actualizada = await preinscripcionService.obtenerPorId(preinscripcion.id);
      setPreinscripcion(actualizada);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message ?? 'Error desconocido',
      };
    } finally {
      setGuardando(false);
    }
  };

  const resubirDocumento = async (
    tipoDocumento: string,
    archivo: File
  ): Promise<{ success: boolean; error?: string }> => {
    if (!preinscripcion) {
      return { success: false, error: 'No hay una preinscripción cargada' };
    }

    setGuardando(true);
    try {
      await preinscripcionService.resubirDocumento(preinscripcion.id, tipoDocumento, archivo);

      const actualizada = await preinscripcionService.obtenerPorId(preinscripcion.id);
      setPreinscripcion(actualizada);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message ?? 'Error desconocido',
      };
    } finally {
      setGuardando(false);
    }
  };

  const recargar = async () => {
    if (!preinscripcion) return;
    setLoading(true);
    try {
      const actualizada = await preinscripcionService.obtenerPorId(preinscripcion.id);
      setPreinscripcion(actualizada);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    preinscripcion,
    loading,
    error,
    guardando,
    buscarPorCodigo,
    actualizarEstudiante,
    actualizarTutor,
    resubirDocumento,
    recargar,
  };
};
