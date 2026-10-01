'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  GraduationCap, 
  CreditCard, 
  ShieldCheck, 
  Building2, 
  Receipt,
  ExternalLink,
  Printer,
  RefreshCw
} from 'lucide-react';

interface PagoItem {
  id: number;
  codigo_pago: string;
  mes_correspondiente: string;
  numero_cuota: number;
  monto_pagado: number;
  estudiante_codigo: string;
  estudiante_nombre: string;
  grado?: string;
  paralelo?: string;
}

interface ReciboData {
  codigo_pago: string;
  fecha_pago: string;
  estado: string;
  anulado: boolean;
  motivo_anulacion?: string | null;
  metodo_pago: string;
  numero_comprobante?: string | null;
  numero_factura?: string | null;
  monto_total: number;
  moneda: string;
  estudiante: {
    codigo: string;
    nombre_completo: string;
    matricula?: string;
    grado: string;
    paralelo: string;
    periodo: string;
  };
  items: PagoItem[];
  emisor: {
    institucion: string;
    ciudad: string;
    tipo_sistema: string;
  };
}

export default function VerificarReciboPage() {
  const params = useParams();
  const codigo = params?.codigo as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReciboData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!codigo) return;

    const fetchVerificacion = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBaseUrl}/api/publico/verificar-recibo/${encodeURIComponent(codigo)}`);
        const json = await res.json();

        if (res.ok && json.success) {
          setData(json.data);
        } else {
          setError(json.message || 'No se pudo verificar el recibo');
        }
      } catch (err: any) {
        console.error('Error verificando recibo:', err);
        setError('Ocurrió un error al conectar con el servidor de verificación.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerificacion();
  }, [codigo, apiBaseUrl]);

  const formatearFecha = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return fechaStr;
    }
  };

  const handleDownloadPDF = () => {
    if (!codigo) return;
    window.open(`${apiBaseUrl}/api/publico/recibo-pdf/${encodeURIComponent(codigo)}?preview=false`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Header Institucional */}
      <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white shadow-md border-b-4 border-amber-400">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner">
              <Building2 className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                U.E.P. La Voz de Cristo
              </h1>
              <p className="text-xs text-blue-200">
                Portal de Validación y Autenticidad de Recibos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-blue-100 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verificación Oficial Segura</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mb-4" />
            <h2 className="text-lg font-semibold text-slate-800">Verificando comprobante en el sistema...</h2>
            <p className="text-sm text-slate-500 mt-1">Consultando registro de pago #{codigo}</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-red-200 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Comprobante no válido o inexistente</h2>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 font-mono border border-slate-200 mb-6">
              Código escaneado: {codigo}
            </div>
            <p className="text-xs text-slate-400">
              Si considera que esto es un error, por favor comuníquese con la administración del colegio con su comprobante físico.
            </p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Banner de Estado */}
            <div className={`rounded-2xl p-6 sm:p-8 shadow-sm border flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left ${
              data.anulado 
                ? 'bg-amber-50/70 border-amber-300 text-amber-900' 
                : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            }`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                data.anulado 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-emerald-600 text-white'
              }`}>
                {data.anulado ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      data.anulado 
                        ? 'bg-amber-200 text-amber-900' 
                        : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {data.anulado ? 'RECIBO ANULADO' : 'PAGO VÁLIDO Y REGISTRADO'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      {data.anulado ? 'Este recibo ha sido anulado' : 'Comprobante de Pago Verificado'}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Monto Total</div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-900">
                      Bs. {data.monto_total.toFixed(2)}
                    </div>
                  </div>
                </div>

                {data.anulado && data.motivo_anulacion && (
                  <div className="mt-3 p-3 bg-white/80 rounded-lg border border-amber-200 text-xs text-amber-900">
                    <strong className="font-semibold">Motivo de anulación:</strong> {data.motivo_anulacion}
                  </div>
                )}
              </div>
            </div>

            {/* Tarjetas de Detalle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del Recibo */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 font-semibold text-slate-900">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <h3>Detalles del Recibo</h3>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">N° de Recibo:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {data.codigo_pago}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Fecha de Pago:</span>
                    <span className="font-medium text-slate-800">{formatearFecha(data.fecha_pago)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Método de Pago:</span>
                    <span className="font-medium text-slate-800 capitalize">{data.metodo_pago || 'Efectivo'}</span>
                  </div>

                  {data.numero_comprobante && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">N° Comprobante:</span>
                      <span className="font-medium text-slate-800">{data.numero_comprobante}</span>
                    </div>
                  )}

                  {data.numero_factura && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">N° Factura:</span>
                      <span className="font-medium text-slate-800">{data.numero_factura}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Gestión:</span>
                    <span className="font-medium text-slate-800">{data.estudiante.periodo}</span>
                  </div>
                </div>
              </div>

              {/* Información del Estudiante */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 font-semibold text-slate-900">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <h3>Datos del Estudiante</h3>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Estudiante:</span>
                    <span className="font-bold text-slate-900 text-right">{data.estudiante.nombre_completo}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Código de Estudiante:</span>
                    <span className="font-mono text-slate-800">{data.estudiante.codigo}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Grado:</span>
                    <span className="font-medium text-slate-800">{data.estudiante.grado}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Paralelo:</span>
                    <span className="font-medium text-slate-800">{data.estudiante.paralelo}</span>
                  </div>

                  {data.estudiante.matricula && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">N° Matrícula:</span>
                      <span className="font-mono text-slate-800">{data.estudiante.matricula}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desglose de Conceptos Pagados */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3>Conceptos y Cuotas Pagadas ({data.items.length})</h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-y border-slate-100">
                      <th className="py-2.5 px-3 font-semibold">Concepto / Cuota</th>
                      <th className="py-2.5 px-3 font-semibold">Estudiante</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900">
                            {item.mes_correspondiente || `Cuota #${item.numero_cuota || idx + 1}`}
                          </span>
                          <div className="text-xs text-slate-400">Código: {item.codigo_pago}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs sm:text-sm">
                          {item.estudiante_nombre}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          Bs. {item.monto_pagado.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50/50 font-bold">
                      <td colSpan={2} className="py-3 px-3 text-slate-700 text-right">
                        Total Pagado:
                      </td>
                      <td className="py-3 px-3 text-right text-base text-blue-900">
                        Bs. {data.monto_total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleDownloadPDF}
                className="flex-1 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-medium py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Download className="w-5 h-5 text-amber-300" />
                <span>Descargar Recibo Oficial en PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="bg-white hover:bg-slate-100 text-slate-700 font-medium py-3.5 px-6 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-5 h-5 text-slate-500" />
                <span className="hidden sm:inline">Imprimir Vista</span>
              </button>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer Institucional */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-10">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Unidad Educativa Particular &quot;La Voz de Cristo&quot;</span>
          </div>
          <p>
            Documento respaldado digitalmente por el sistema institucional. Potosí - Bolivia.
          </p>
          <p className="text-slate-400 text-[11px]">
            Fecha y hora de consulta: {new Date().toLocaleString('es-BO')}
          </p>
        </div>
      </footer>
    </div>
  );
}
