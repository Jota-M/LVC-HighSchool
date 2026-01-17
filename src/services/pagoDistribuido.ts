// services/pagoDistribuido.ts
/**
 * Servicio para calcular la distribución automática de pagos
 * entre múltiples mensualidades
 */

import type { Mensualidad } from '@/types/pagos';

export interface MensualidadParaDistribuir {
  mensualidad_id: number;
  numero_cuota: number;
  mes_correspondiente: string;
  saldo_pendiente: number;
  monto_final: number;
}

export interface ResultadoDistribucion {
  mensualidad_id: number;
  numero_cuota: number;
  mes_correspondiente: string;
  monto_a_pagar: number;
  saldo_pendiente_original: number;
  saldo_restante: number;
  porcentaje_pago: number;
  es_pago_completo: boolean;
  es_pago_parcial: boolean;
}

export interface DistribucionCompleta {
  mensualidades: ResultadoDistribucion[];
  monto_total_distribuido: number;
  monto_sobrante: number;
  mensualidades_completas: number;
  mensualidades_parciales: number;
  advertencias: string[];
}

class PagoDistribuidoService {
  /**
   * Distribuye un monto entre mensualidades de forma automática
   * Prioriza completar mensualidades en orden cronológico
   */
  distribuirMonto(
    montoTotal: number,
    mensualidades: MensualidadParaDistribuir[]
  ): DistribucionCompleta {
    // Validaciones
    if (montoTotal <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    if (mensualidades.length === 0) {
      throw new Error('Debe proporcionar al menos una mensualidad');
    }

    // Ordenar mensualidades por número de cuota
    const mensualidadesOrdenadas = [...mensualidades].sort(
      (a, b) => a.numero_cuota - b.numero_cuota
    );

    const resultados: ResultadoDistribucion[] = [];
    const advertencias: string[] = [];
    let montoRestante = montoTotal;
    let mensualidadesCompletas = 0;
    let mensualidadesParciales = 0;

    // Distribuir el monto
    for (const mensualidad of mensualidadesOrdenadas) {
      if (montoRestante <= 0) break;

      const saldoPendiente = mensualidad.saldo_pendiente;
      const montoAPagar = Math.min(montoRestante, saldoPendiente);
      const saldoRestante = saldoPendiente - montoAPagar;
      const porcentajePago = (montoAPagar / saldoPendiente) * 100;
      const esPagoCompleto = montoAPagar >= saldoPendiente;
      const esPagoParcial = montoAPagar > 0 && montoAPagar < saldoPendiente;

      if (esPagoCompleto) {
        mensualidadesCompletas++;
      } else if (esPagoParcial) {
        mensualidadesParciales++;
      }

      resultados.push({
        mensualidad_id: mensualidad.mensualidad_id,
        numero_cuota: mensualidad.numero_cuota,
        mes_correspondiente: mensualidad.mes_correspondiente,
        monto_a_pagar: montoAPagar,
        saldo_pendiente_original: saldoPendiente,
        saldo_restante: saldoRestante,
        porcentaje_pago: porcentajePago,
        es_pago_completo: esPagoCompleto,
        es_pago_parcial: esPagoParcial,
      });

      montoRestante -= montoAPagar;
    }

    // Generar advertencias
    if (montoRestante > 0.01) {
      advertencias.push(
        `Sobran Bs ${montoRestante.toFixed(2)} - No hay más mensualidades pendientes`
      );
    }

    if (mensualidadesParciales > 0) {
      advertencias.push(
        `Se realizarán ${mensualidadesParciales} pago(s) parcial(es)`
      );
    }

    const montoDistribuido = montoTotal - montoRestante;

    return {
      mensualidades: resultados.filter(r => r.monto_a_pagar > 0),
      monto_total_distribuido: montoDistribuido,
      monto_sobrante: montoRestante,
      mensualidades_completas: mensualidadesCompletas,
      mensualidades_parciales: mensualidadesParciales,
      advertencias,
    };
  }

  /**
   * Distribuye un monto permitiendo especificar mensualidades específicas
   */
  distribuirMontoPersonalizado(
    montoTotal: number,
    mensualidades: MensualidadParaDistribuir[],
    mensualidadesSeleccionadas: number[]
  ): DistribucionCompleta {
    const mensualidadesFiltradas = mensualidades.filter(m =>
      mensualidadesSeleccionadas.includes(m.mensualidad_id)
    );

    return this.distribuirMonto(montoTotal, mensualidadesFiltradas);
  }

  /**
   * Calcula cuántas mensualidades completas se pueden pagar con un monto
   */
  calcularMensualidadesCompletas(
    montoTotal: number,
    mensualidades: MensualidadParaDistribuir[]
  ): {
    cantidad: number;
    mensualidades: MensualidadParaDistribuir[];
    monto_usado: number;
    monto_restante: number;
  } {
    const ordenadas = [...mensualidades].sort(
      (a, b) => a.numero_cuota - b.numero_cuota
    );

    let montoRestante = montoTotal;
    const mensualidadesCompletas: MensualidadParaDistribuir[] = [];
    let montoUsado = 0;

    for (const mens of ordenadas) {
      if (montoRestante >= mens.saldo_pendiente) {
        mensualidadesCompletas.push(mens);
        montoRestante -= mens.saldo_pendiente;
        montoUsado += mens.saldo_pendiente;
      } else {
        break;
      }
    }

    return {
      cantidad: mensualidadesCompletas.length,
      mensualidades: mensualidadesCompletas,
      monto_usado: montoUsado,
      monto_restante: montoRestante,
    };
  }

  /**
   * Valida si la distribución es válida
   */
  validarDistribucion(distribucion: DistribucionCompleta): {
    valida: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    // Validar que no haya montos negativos
    const tieneNegativos = distribucion.mensualidades.some(
      m => m.monto_a_pagar < 0 || m.saldo_restante < 0
    );

    if (tieneNegativos) {
      errores.push('Existen montos negativos en la distribución');
    }

    // Validar que el monto distribuido sea correcto
    const sumaMontosDistribuidos = distribucion.mensualidades.reduce(
      (sum, m) => sum + m.monto_a_pagar,
      0
    );

    const diferencia = Math.abs(
      sumaMontosDistribuidos - distribucion.monto_total_distribuido
    );

    if (diferencia > 0.01) {
      errores.push('La suma de montos distribuidos no coincide con el total');
    }

    return {
      valida: errores.length === 0,
      errores,
    };
  }

  /**
   * Formatea la distribución para mostrar en UI
   */
  formatearDistribucion(distribucion: DistribucionCompleta): string {
    let texto = `📊 Distribución de Pago\n\n`;
    texto += `💰 Total a distribuir: Bs ${distribucion.monto_total_distribuido.toFixed(2)}\n\n`;

    distribucion.mensualidades.forEach((m, index) => {
      const estado = m.es_pago_completo ? '✅' : '⚠️';
      texto += `${estado} ${m.mes_correspondiente} (Cuota ${m.numero_cuota})\n`;
      texto += `   Pagar: Bs ${m.monto_a_pagar.toFixed(2)}`;

      if (m.es_pago_parcial) {
        texto += ` (${m.porcentaje_pago.toFixed(1)}%)`;
        texto += `\n   Restante: Bs ${m.saldo_restante.toFixed(2)}`;
      }

      texto += '\n';

      if (index < distribucion.mensualidades.length - 1) {
        texto += '\n';
      }
    });

    if (distribucion.monto_sobrante > 0.01) {
      texto += `\n⚠️ Sobrante: Bs ${distribucion.monto_sobrante.toFixed(2)}`;
    }

    return texto;
  }

  /**
   * Sugiere la mejor distribución para un monto dado
   */
  sugerirDistribucion(
    montoTotal: number,
    mensualidades: MensualidadParaDistribuir[]
  ): {
    tipo: 'completo' | 'parcial' | 'multiple';
    descripcion: string;
    distribucion: DistribucionCompleta;
  } {
    const distribucion = this.distribuirMonto(montoTotal, mensualidades);

    // Caso 1: Pago de una sola mensualidad completa
    if (
      distribucion.mensualidades_completas === 1 &&
      distribucion.mensualidades_parciales === 0
    ) {
      return {
        tipo: 'completo',
        descripcion: 'Pago completo de una mensualidad',
        distribucion,
      };
    }

    // Caso 2: Pago parcial de una mensualidad
    if (
      distribucion.mensualidades.length === 1 &&
      distribucion.mensualidades_parciales === 1
    ) {
      return {
        tipo: 'parcial',
        descripcion: 'Pago parcial de una mensualidad',
        distribucion,
      };
    }

    // Caso 3: Pago múltiple
    return {
      tipo: 'multiple',
      descripcion: `${distribucion.mensualidades_completas} completa(s) + ${distribucion.mensualidades_parciales} parcial(es)`,
      distribucion,
    };
  }
}

export default new PagoDistribuidoService();