import React, { useState } from 'react';
import { Printer, Download, FileText, CheckCircle2, Building2, Phone, Mail, MapPin, Globe, CreditCard, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PaperworkCustomizationModule({ paperworkSettings, setPaperworkSettings, bcvRate = 755.90 }) {
  const [activeDocType, setActiveDocType] = useState('factura'); // 'factura' | 'cotizacion' | 'recibo'
  
  // Local state for header & footer fields
  const [clinicName, setClinicName] = useState(paperworkSettings?.clinicName || 'Centro Médico Odontológico Vida Sana, C.A.');
  const [clinicRif, setClinicRif] = useState(paperworkSettings?.clinicRif || 'RIF: J-50781755-5');
  const [clinicAddress, setClinicAddress] = useState(paperworkSettings?.clinicAddress || 'Av. Principal, Edif. Vida Sana, Piso 1, Consultorio 102');
  const [clinicPhone, setClinicPhone] = useState(paperworkSettings?.clinicPhone || '+58 412 1234567 / +58 212 9876543');
  const [clinicEmail, setClinicEmail] = useState(paperworkSettings?.clinicEmail || 'contacto@vidasanacmo.com');
  const [logoUrl, setLogoUrl] = useState(paperworkSettings?.logoUrl || 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png');
  
  // Banking & Footer text
  const [invoiceFooter, setInvoiceFooter] = useState(paperworkSettings?.invoiceFooter || 'Gracias por confiar en Centro Médico Odontológico Vida Sana. Documento de control administrativo interno.');
  const [quoteFooter, setQuoteFooter] = useState(paperworkSettings?.quoteFooter || 'Presupuesto válido por 15 días continuos a la tasa oficial del Banco Central de Venezuela (BCV).');
  const [receiptFooter, setReceiptFooter] = useState(paperworkSettings?.receiptFooter || 'Pago Móvil Banesco (0134) - C.I./RIF: J-50781755-5 - Teléf: 0412-1234567. Conserve este comprobante.');
  const [consentTemplate, setConsentTemplate] = useState(paperworkSettings?.consentTemplate || 'Declaro haber sido informado sobre los procedimientos clínicos descritos en este presupuesto y autorizo la ejecución de los tratamientos bajo la tasa oficial BCV de la clínica.');

  const handleSaveSettings = () => {
    const updated = {
      clinicName,
      clinicRif,
      clinicAddress,
      clinicPhone,
      clinicEmail,
      logoUrl,
      invoiceFooter,
      quoteFooter,
      receiptFooter,
      consentTemplate
    };
    if (typeof setPaperworkSettings === 'function') {
      setPaperworkSettings(updated);
    }
    Swal.fire({
      title: '¡Papelería Guardada!',
      text: 'La plantilla de encabezado, logotipo y pie de página se han actualizado con éxito.',
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });
  };

  const handlePrintPreview = () => {
    window.print();
  };

  const handleDownloadPDFPreview = () => {
    Swal.fire({
      title: 'Descargando PDF Oficial...',
      text: `Se ha generado el PDF comprimido de la plantilla de ${activeDocType.toUpperCase()}.`,
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-teal-600 w-7 h-7" />
            14. Personalización de Papelería, Documentos & Plantillas PDF
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
            Configura el encabezado oficial, logotipo y pie de página para Facturas, Cotizaciones y Recibos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrintPreview}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={handleDownloadPDFPreview}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Tabs Selector de Documentos */}
      <div className="flex border-b border-slate-200 dark:border-[#1e2d5a] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveDocType('factura')}
          className={`pb-3 px-4 font-black text-xs transition-all border-b-2 ${
            activeDocType === 'factura'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          📄 Plantilla Factura
        </button>
        <button
          onClick={() => setActiveDocType('cotizacion')}
          className={`pb-3 px-4 font-black text-xs transition-all border-b-2 ${
            activeDocType === 'cotizacion'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          📋 Plantilla Cotización / Presupuesto
        </button>
        <button
          onClick={() => setActiveDocType('recibo')}
          className={`pb-3 px-4 font-black text-xs transition-all border-b-2 ${
            activeDocType === 'recibo'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          💳 Plantilla Recibo de Pago
        </button>
      </div>

      {/* Formulario de Configuración & Vista Previa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Editor de Datos de Encabezado y Pie de Página (Izquierda) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b pb-2 border-slate-200 dark:border-[#1e2d5a] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Configuración de Membrete Oficial
          </h3>

          <div className="space-y-3 text-xs font-bold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre Comercial de la Clínica</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">RIF de la Empresa</label>
                <input
                  type="text"
                  value={clinicRif}
                  onChange={(e) => setClinicRif(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Teléfonos de Contacto</label>
                <input
                  type="text"
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Dirección Física</label>
              <input
                type="text"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Logotipo Oficial de la Clínica</label>
              
              {/* Opción de Adjuntar Archivo o Ingresar URL */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-sm transition-all">
                    <ImageIcon className="w-4 h-4" />
                    📁 Adjuntar / Subir Imagen de Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            setLogoUrl(evt.target.result);
                            Swal.fire({
                              title: '¡Logo Adjuntado!',
                              text: 'La imagen del logotipo fue cargada exitosamente.',
                              icon: 'success',
                              timer: 1500,
                              showConfirmButton: false
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo Prev" className="w-10 h-10 object-contain rounded-xl border-2 border-teal-500 p-1 bg-white shadow-sm shrink-0" />
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">O ingresa la URL web de la imagen:</span>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white text-[11px] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#1e2d5a] space-y-2">
              <label className="block text-slate-800 dark:text-slate-200 font-extrabold">
                Pie de Página del Documento ({activeDocType.toUpperCase()})
              </label>

              {activeDocType === 'factura' && (
                <textarea
                  rows="3"
                  value={invoiceFooter}
                  onChange={(e) => setInvoiceFooter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white text-xs font-normal"
                />
              )}

              {activeDocType === 'cotizacion' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Pie de Página (Vigilancia / Validez)
                    </label>
                    <textarea
                      rows="2"
                      value={quoteFooter}
                      onChange={(e) => setQuoteFooter(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white text-xs font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-teal-700 dark:text-teal-400 mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Texto Predeterminado del Consentimiento Informado (Presupuesto)
                    </label>
                    <textarea
                      rows="3"
                      value={consentTemplate}
                      onChange={(e) => setConsentTemplate(e.target.value)}
                      placeholder="Declaro haber sido informado sobre los procedimientos..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-teal-300 dark:border-teal-800 rounded-xl text-slate-900 dark:text-white text-xs font-medium"
                    />
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      Este es el texto base que aparecerá predeterminado en cada nuevo presupuesto. Podrás editarlo de forma en vivo al emitir la cotización.
                    </span>
                  </div>
                </div>
              )}

              {activeDocType === 'recibo' && (
                <textarea
                  rows="3"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white text-xs font-normal"
                />
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Guardar Cambios de Papelería
            </button>
          </div>
        </div>

        {/* Vista Previa Interactiva del Documento (Derecha) */}
        <div className="lg:col-span-7 bg-white text-slate-900 border border-slate-300 p-8 rounded-2xl shadow-xl space-y-6 printable-paperwork">
          
          {/* Encabezado Impreso */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Logo Oficial" className="w-14 h-14 object-contain" />
              <div>
                <h1 className="text-base font-black uppercase text-slate-900 tracking-wide">{clinicName}</h1>
                <p className="text-xs font-mono font-bold text-teal-800">{clinicRif}</p>
                <p className="text-[10px] text-slate-600">{clinicAddress}</p>
                <p className="text-[10px] text-slate-600">Teléf: {clinicPhone} • {clinicEmail}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-black uppercase tracking-wider">
                {activeDocType === 'factura' ? 'FACTURA DE CONTROL' : activeDocType === 'cotizacion' ? 'PRESUPUESTO MÉDICO' : 'RECIBO DE PAGO'}
              </div>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">N° Documento: 002026-0891</p>
              <p className="text-[10px] text-slate-500 font-bold">Fecha: {new Date().toLocaleDateString('es-VE')}</p>
              <p className="text-[10px] font-mono text-emerald-800 font-bold">Tasa BCV: {bcvRate} Bs/$</p>
            </div>
          </div>

          {/* Cuerpo Ficticio de la Vista Previa */}
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[10px]">PACIENTE / CLIENTE:</span>
                <span className="text-slate-900 font-black">María Alejandra Gómez</span>
                <span className="text-slate-600 block text-[10px]">C.I.: V-19.876.543 | Teléf: +58 414 7654321</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">ESPECIALISTA TRATANTE:</span>
                <span className="text-slate-900 font-black">Dra. Vanessa Parra</span>
                <span className="text-slate-600 block text-[10px]">Odontología General & Estética</span>
              </div>
            </div>

            {/* Tabla de Conceptos */}
            <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-900 font-black border-b border-slate-300 uppercase">
                <tr>
                  <th className="p-2.5">Código / Descripción del Servicio</th>
                  <th className="p-2.5 text-center">Cant.</th>
                  <th className="p-2.5 text-right">Precio ($ USD)</th>
                  <th className="p-2.5 text-right">Total (Bs BCV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="p-2.5 font-bold">PRO-001 • Limpieza Ultrasónica & Profilaxis</td>
                  <td className="p-2.5 text-center">1</td>
                  <td className="p-2.5 text-right font-mono">$35.00</td>
                  <td className="p-2.5 text-right font-mono font-bold">{(35 * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">PRO-004 • Obturación Resina Fotocurada Pieza 16</td>
                  <td className="p-2.5 text-center">1</td>
                  <td className="p-2.5 text-right font-mono">$45.00</td>
                  <td className="p-2.5 text-right font-mono font-bold">{(45 * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</td>
                </tr>
              </tbody>
            </table>

            {/* Totales */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono">$80.00 USD</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Monto en Bolívares (BCV):</span>
                  <span className="font-mono text-emerald-800">{(80 * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 border-t-2 border-slate-900 pt-1">
                  <span>TOTAL FINAL:</span>
                  <span className="font-mono text-teal-800">$80.00 USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pie de Página Personalizado */}
          <div className="pt-6 border-t border-slate-300 text-[10px] text-slate-600 font-bold space-y-2">
            <p className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg italic">
              📌 {activeDocType === 'factura' ? invoiceFooter : activeDocType === 'cotizacion' ? quoteFooter : receiptFooter}
            </p>

            <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
              <span>{clinicName} • RIF {clinicRif}</span>
              <span>Página 1 de 1 • Generado por Sistema Multidisciplinario</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
