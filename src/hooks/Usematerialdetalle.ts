'use client';
// hooks/useMaterialDetalle.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { estudianteService, MaterialDetalleEstudiante } from '@/services/estudianteService';

export function useMaterialDetalle(material_id: number) {
  const [material, setMaterial]   = useState<MaterialDetalleEstudiante | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const accesoRegistrado = useRef(false);
  

  const cargar = useCallback(async () => {
    if (!material_id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await estudianteService.getMaterialDetalle(material_id);
      setMaterial(res.data.material);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al cargar el material');
    } finally {
      setIsLoading(false);
    }
  }, [material_id]);

  // Registrar visualización automáticamente al cargar
    const registrarVista = useCallback(async () => {
    if (accesoRegistrado.current || !material_id) return;
    accesoRegistrado.current = true; // marcar ANTES del await para evitar race condition
    try {
      await estudianteService.registrarAcceso(material_id, {
        tipo_accion: 'visualizacion',
        dispositivo: 'web',
      });
    } catch {
      accesoRegistrado.current = false; // revertir si falló
    }
  }, [material_id]); // ✅ ya no depende de accesoRegistrado
  
  const registrarDescarga = useCallback(async () => {
    try {
      await estudianteService.registrarAcceso(material_id, {
        tipo_accion: 'descarga',
        dispositivo: 'web',
      });
    } catch {
      // silencioso
    }
  }, [material_id]);

  const toggleFavorito = useCallback(async () => {
    if (!material) return;
    try {
      await estudianteService.toggleFavorito(material_id);
      setMaterial(prev => prev ? { ...prev, es_favorito: !prev.es_favorito } : prev);
    } catch (e: any) {
      console.error('Error al cambiar favorito:', e);
    }
  }, [material_id, material]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { if (material) registrarVista(); }, [material, registrarVista]);

  return { material, isLoading, error, toggleFavorito, registrarDescarga, recargar: cargar };
}

// ── Comentarios ───────────────────────────────────────────────

export interface Comentario {
  id:                  number;
  contenido:           string;
  es_duda:             boolean;
  es_resuelto:         boolean;
  editado:             boolean;
  created_at:          string;
  autor_username:      string;
  autor_nombres:       string;
  autor_apellidos:     string;
  comentario_padre_id: number | null;
  respuestas:          Comentario[];
  usuario_id:          number;
}

export function useComentariosMaterial(material_id: number) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [enviando, setEnviando]       = useState(false);
  const [soloDudas, setSoloDudas]     = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await estudianteService.getComentarios(material_id, soloDudas);
      setComentarios(res.data.comentarios || []);
    } catch {
      setComentarios([]);
    } finally {
      setIsLoading(false);
    }
  }, [material_id, soloDudas]);

  const crear = useCallback(async (
    contenido: string,
    opciones: { comentario_padre_id?: number; es_duda?: boolean } = {}
  ) => {
    setEnviando(true);
    try {
      await estudianteService.crearComentario(material_id, { contenido, ...opciones });
      await cargar();
      return true;
    } catch {
      return false;
    } finally {
      setEnviando(false);
    }
  }, [material_id, cargar]);

  useEffect(() => { cargar(); }, [cargar]);

  return { comentarios, isLoading, enviando, soloDudas, setSoloDudas, crear, recargar: cargar };
}