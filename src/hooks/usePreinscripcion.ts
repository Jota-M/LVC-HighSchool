// hooks/usePreinscripcion.ts
'use client';
import { useState, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import type {
  PreEstudianteForm,
  PreTutorForm,
  PreRelacionForm,
  PreinscripcionCreadaItem,
} from '@/types/preinscripcionTypes';
import { preinscripcionService } from '@/services/preinscripcionService';
import { is1raSeccionOGradoRestringido } from '@/components/preinscripcion/EstudianteStep';

export const estadoInicialEstudiante = (): PreEstudianteForm => ({
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  ci: '',
  rude: '',
  fecha_nacimiento: null,
  lugar_nacimiento: '',
  genero: '',
  direccion: '',
  zona: '',
  ciudad: '',
  telefono: '',
  email: '',
  contacto_emergencia: '',
  tiene_discapacidad: false,
  tipo_discapacidad: '',
  institucion_procedencia: '',
  ultimo_grado_cursado: '',
  grado_solicitado: '',
  repite_grado: false,
  turno_solicitado: '',
  grado_id: null,
  turno_id: null,
  periodo_academico_id: null,
});

export const estadoInicialTutor = (esPrincipal = true): PreTutorForm => ({
  otro_parentesco: '',
  tipo_representante: 'Padre o Tutor',
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  ci: '',
  fecha_nacimiento: null,
  genero: '',
  parentesco: 'padre',
  telefono: '',
  celular: '',
  email: '',
  direccion: '',
  zona: '',
  ocupacion: '',
  lugar_trabajo: '',
  telefono_trabajo: '',
  estado_civil: '',
  nivel_educacion: '',
  vive_con_estudiante: true,
  es_tutor_principal: esPrincipal,
});

export function usePreinscripcion() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Múltiples estudiantes y tutores
  const [estudiantes, setEstudiantes] = useState<PreEstudianteForm[]>([estadoInicialEstudiante()]);
  const [tutores, setTutores] = useState<PreTutorForm[]>([estadoInicialTutor(true)]);
  
  // Relaciones familiares: clave `${estudianteIndex}:${tutorIndex}`
  // Inicialmente vinculamos el primer estudiante con el primer tutor
  const [relaciones, setRelaciones] = useState<Record<string, boolean>>({ '0:0': true });
  // Mapa de estudianteIndex -> tutorIndex principal (permite que un mismo tutor sea principal de 2 o más hijos)
  const [principales, setPrincipales] = useState<Record<number, number>>({ 0: 0 });

  // Resultado de preinscripciones creadas
  const [resultadoCreadas, setResultadoCreadas] = useState<PreinscripcionCreadaItem[]>([]);

  // =============================================
  // GESTIÓN DE ESTUDIANTES
  // =============================================
  const agregarEstudiante = useCallback(() => {
    if (estudiantes.length >= 6) {
      alert('Máximo 6 estudiantes por solicitud familiar');
      return;
    }
    const nuevoIndex = estudiantes.length;
    setEstudiantes((prev) => [...prev, estadoInicialEstudiante()]);

    // Por defecto vincular con todos los tutores existentes
    setRelaciones((prev) => {
      const actualizadas = { ...prev };
      tutores.forEach((_, tIdx) => {
        actualizadas[`${nuevoIndex}:${tIdx}`] = true;
      });
      return actualizadas;
    });

    // Por defecto asignar el tutor 0 como principal del nuevo estudiante
    setPrincipales((prev) => ({
      ...prev,
      [nuevoIndex]: 0,
    }));
  }, [estudiantes.length, tutores]);

  const eliminarEstudiante = useCallback((index: number) => {
    if (estudiantes.length <= 1) {
      alert('Debe registrar al menos un estudiante');
      return;
    }
    setEstudiantes((prev) => prev.filter((_, i) => i !== index));

    // Reindexar relaciones
    setRelaciones((prev) => {
      const actualizadas: Record<string, boolean> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const [eIdx, tIdx] = key.split(':').map(Number);
        if (eIdx === index) return;
        const newEIdx = eIdx > index ? eIdx - 1 : eIdx;
        actualizadas[`${newEIdx}:${tIdx}`] = val;
      });
      return actualizadas;
    });

    // Reindexar principales
    setPrincipales((prev) => {
      const next: Record<number, number> = {};
      Object.entries(prev).forEach(([eStr, tIdx]) => {
        const eIdx = Number(eStr);
        if (eIdx === index) return;
        const newEIdx = eIdx > index ? eIdx - 1 : eIdx;
        next[newEIdx] = tIdx;
      });
      return next;
    });
  }, [estudiantes.length]);

  const updateEstudiante = useCallback((index: number, field: string, value: any) => {
    setEstudiantes((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
    // Limpiar error del campo
    setErrores((prev) => {
      const copy = { ...prev };
      delete copy[`estudiante_${index}_${field}`];
      return copy;
    });
  }, []);

  // =============================================
  // GESTIÓN DE TUTORES
  // =============================================
  const agregarTutor = useCallback(() => {
    if (tutores.length >= 4) {
      alert('Máximo 4 tutores por solicitud');
      return;
    }
    const nuevoTutorIdx = tutores.length;
    setTutores((prev) => [...prev, estadoInicialTutor(false)]);

    // Asociar con todos los estudiantes por defecto
    setRelaciones((prev) => {
      const actualizadas = { ...prev };
      estudiantes.forEach((_, eIdx) => {
        actualizadas[`${eIdx}:${nuevoTutorIdx}`] = true;
      });
      return actualizadas;
    });
  }, [tutores.length, estudiantes]);

  const eliminarTutor = useCallback((index: number) => {
    if (tutores.length <= 1) {
      alert('Debe haber al menos un tutor registrado');
      return;
    }
    setTutores((prev) => prev.filter((_, i) => i !== index));

    // Reindexar relaciones
    setRelaciones((prev) => {
      const actualizadas: Record<string, boolean> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const [eIdx, tIdx] = key.split(':').map(Number);
        if (tIdx === index) return;
        const newTIdx = tIdx > index ? tIdx - 1 : tIdx;
        actualizadas[`${eIdx}:${newTIdx}`] = val;
      });
      return actualizadas;
    });

    // Reindexar principales
    setPrincipales((prev) => {
      const next: Record<number, number> = {};
      Object.entries(prev).forEach(([eStr, tIdx]) => {
        const eIdx = Number(eStr);
        if (tIdx === index) {
          next[eIdx] = 0; // Reasignar al primer tutor
        } else if (tIdx > index) {
          next[eIdx] = tIdx - 1;
        } else {
          next[eIdx] = tIdx;
        }
      });
      return next;
    });
  }, [tutores.length]);

  const updateTutor = useCallback((index: number, field: string, value: any) => {
    setTutores((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
    // Limpiar error del campo
    setErrores((prev) => {
      const copy = { ...prev };
      delete copy[`tutor_${index}_${field}`];
      return copy;
    });
  }, []);

  // =============================================
  // RELACIONES FAMILIARES
  // =============================================
  const cambiarRelacion = useCallback((key: string, seleccionada: boolean) => {
    setRelaciones((prev) => ({
      ...prev,
      [key]: seleccionada,
    }));
    const [eIdx, tIdx] = key.split(':').map(Number);
    if (!seleccionada && principales[eIdx] === tIdx) {
      setPrincipales((prev) => {
        const next = { ...prev };
        const otroTutor = tutores.findIndex((_, otherTIdx) => otherTIdx !== tIdx && relaciones[`${eIdx}:${otherTIdx}`]);
        if (otroTutor !== -1) {
          next[eIdx] = otroTutor;
        }
        return next;
      });
    }
  }, [principales, tutores, relaciones]);

  const cambiarPrincipal = useCallback((estudianteIndex: number, tutorIndex: number) => {
    setPrincipales((prev) => ({
      ...prev,
      [estudianteIndex]: tutorIndex,
    }));
  }, []);

  // =============================================
  // VALIDACIONES
  // =============================================
  const validarPaso = useCallback((paso: number): boolean => {
    const errs: Record<string, string> = {};
    setMensajeError(null);

    if (paso === 0) {
      // Validar cada estudiante
      estudiantes.forEach((est, idx) => {
        if (!est.nombres.trim()) errs[`estudiante_${idx}_nombres`] = 'Nombres requeridos';
        if (!est.apellido_paterno.trim()) errs[`estudiante_${idx}_apellido_paterno`] = 'Apellido paterno requerido';
        if (!est.fecha_nacimiento) errs[`estudiante_${idx}_fecha_nacimiento`] = 'Fecha de nacimiento requerida';
        if (!est.genero) errs[`estudiante_${idx}_genero`] = 'Seleccione género';
        if (!est.grado_id) {
          errs[`estudiante_${idx}_grado`] = 'Seleccione el grado a postular';
        } else if (
          est.grado_solicitado &&
          is1raSeccionOGradoRestringido({ nombre: est.grado_solicitado })
        ) {
          errs[`estudiante_${idx}_grado`] =
            'Las admisiones para 1ra Sección se realizarán directamente al inicio de gestión';
        }
        if (!est.turno_id) errs[`estudiante_${idx}_turno`] = 'Seleccione el turno preferido';
        if (est.tiene_discapacidad && !est.tipo_discapacidad?.trim()) {
          errs[`estudiante_${idx}_tipo_discapacidad`] = 'Especifique el tipo de discapacidad';
        }
      });

      if (Object.keys(errs).length > 0) {
        setErrores(errs);
        setMensajeError('Por favor complete todos los campos obligatorios de los estudiantes.');
        return false;
      }
    }

    if (paso === 1) {
      // Validar cada tutor
      tutores.forEach((tut, idx) => {
        if (!tut.nombres.trim()) errs[`tutor_${idx}_nombres`] = 'Nombres requeridos';
        if (!tut.apellido_paterno.trim()) errs[`tutor_${idx}_apellido_paterno`] = 'Apellido paterno requerido';
        if (!tut.ci.trim()) errs[`tutor_${idx}_ci`] = 'Cédula de identidad requerida';
        if (!tut.telefono.trim() && !tut.celular.trim()) errs[`tutor_${idx}_telefono`] = 'Teléfono requerido';
      });

      // Validar que cada estudiante tenga al menos un tutor asignado
      const relacionesActivas = Object.entries(relaciones).filter(([, marc]) => marc);
      const algunEstudianteSinTutor = estudiantes.some((_, eIdx) =>
        !relacionesActivas.some(([k]) => k.startsWith(`${eIdx}:`))
      );

      if (algunEstudianteSinTutor) {
        setMensajeError('Cada estudiante debe tener al menos un tutor o responsable asignado.');
        return false;
      }

      if (Object.keys(errs).length > 0) {
        setErrores(errs);
        setMensajeError('Por favor complete todos los datos requeridos de los tutores.');
        return false;
      }
    }

    setErrores({});
    return true;
  }, [estudiantes, tutores, relaciones]);

  // =============================================
  // NAVEGACIÓN
  // =============================================
  const handleNext = () => {
    if (validarPaso(activeStep)) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =============================================
  // SUBMIT (JSON limpio a /preinscripcion/multiple)
  // =============================================
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setMensajeError(null);

      // Mapear relaciones seleccionadas
      const relacionesPayload: PreRelacionForm[] = Object.entries(relaciones)
        .filter(([, marc]) => marc)
        .map(([key]) => {
          const [eIdx, tIdx] = key.split(':').map(Number);
          return {
            estudiante_index: eIdx,
            tutor_index: tIdx,
            parentesco: tutores[tIdx]?.parentesco || 'padre',
            es_tutor_principal: principales[eIdx] === tIdx,
          };
        });

      // Preparar payload JSON limpio
      const payload = {
        periodo_academico_id: estudiantes[0]?.periodo_academico_id || undefined,
        estudiantes: estudiantes.map((e) => ({
          ...e,
          fecha_nacimiento: e.fecha_nacimiento ? e.fecha_nacimiento.format('YYYY-MM-DD') : '',
        })),
        tutores: tutores.map((t) => ({
          ...t,
          direccion: t.zona ? `${t.direccion || ''}${t.direccion ? ' - ' : ''}Zona: ${t.zona}`.trim() : (t.direccion || ''),
          fecha_nacimiento: t.fecha_nacimiento ? t.fecha_nacimiento.format('YYYY-MM-DD') : null,
        })),
        relaciones: relacionesPayload,
      };

      const res = await preinscripcionService.crearMultiple(payload);

      setResultadoCreadas(res?.data?.preinscripciones || []);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('❌ Error al enviar preinscripción múltiple:', error);
      setMensajeError(error.message || 'Error al enviar la solicitud de preinscripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const limpiarFormulario = () => {
    if (confirm('¿Está seguro de que desea reiniciar el formulario?')) {
      setEstudiantes([estadoInicialEstudiante()]);
      setTutores([estadoInicialTutor(true)]);
      setRelaciones({ '0:0': true });
      setPrincipales({ 0: 0 });
      setActiveStep(0);
      setErrores({});
      setMensajeError(null);
      setIsSuccess(false);
      setResultadoCreadas([]);
    }
  };

  return {
    activeStep,
    isSubmitting,
    isSuccess,
    errores,
    mensajeError,
    estudiantes,
    tutores,
    relaciones,
    principales,
    principal: principales[0] !== undefined ? `0:${principales[0]}` : null,
    resultadoCreadas,
    setEstudiantes,
    setTutores,
    agregarEstudiante,
    eliminarEstudiante,
    updateEstudiante,
    agregarTutor,
    eliminarTutor,
    updateTutor,
    cambiarRelacion,
    cambiarPrincipal,
    handleNext,
    handleBack,
    handleSubmit,
    limpiarFormulario,
  };
}