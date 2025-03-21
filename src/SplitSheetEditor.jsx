import React, { useState, useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Componente Input separado y optimizado con React.memo
const Input = React.memo(({ label, name, value, onChange, placeholder, type = "text" }) => {
  const inputRef = useRef(null);
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          ref={inputRef}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full p-2 border rounded bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          placeholder={placeholder}
          rows="3"
        />
      ) : (
        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full p-2 border rounded bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          placeholder={placeholder}
        />
      )}
    </div>
  );
});

// Evitar re-renderizados innecesarios
Input.displayName = 'Input';

const SplitSheetEditor = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [logoImage, setLogoImage] = useState(null);
  const fileInputRef = useRef(null);
  const documentRef = useRef(null);
  
  // Convertimos el formData a un estado plano para minimizar re-renderizados
  const [formData, setFormData] = useState({
    // Información general
    fecha: '',
    tituloCancion: '',
    nombreInterprete: '',
    
    // Información de compositores (derechos de composición)
    compositores: [
      { 
        id: 1,
        nombreCompleto: '', 
        nombreArtistico: '',
        ipiNumero: '', 
        porcentaje: '', 
        sociedadGestion: '', 
        ipiEditorial: '', 
        editorial: '', 
        rol: ''
      }
    ],
    
    // Información de colaboradores (derechos del máster)
    colaboradoresMaster: [
      {
        id: 1,
        nombreCompleto: '',
        porcentaje: '',
        rol: ''
      }
    ],
    
    // Autores
    autoresLetra1: '',
    autoresLetra2: '',
    autoresLetra3: '',
    autoresLetra4: '',
    
    // Compositores
    compositoresMusica1: '',
    compositoresMusica2: '',
    compositoresMusica3: '',
    compositoresMusica4: '',
    
    // Información de disquera/sello
    nombreDisquera: '',
    nombrePropietario: '',
    
    // Créditos
    nombreInterprete1: '',
    nombreInterprete2: '',
    nombreInterprete3: '',
    nombreProduccion1: '',
    nombreProduccion2: '',
    nombresMezcla: '',
    nombresMasterizacion: '',
    otrosCreditos: '',
    
    // País
    pais: '',
    
    // Fechas
    dia: '',
    mes: '',
    ano: ''
  });

  const [showPreview, setShowPreview] = useState(false);

  // Simplificamos el handleChange para que sea lo más directo posible
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Actualización directa sin funciones anidadas
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerLogoUpload = () => {
    fileInputRef.current.click();
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    // Scroll hacia arriba al cambiar de paso
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    // Scroll hacia arriba al cambiar de paso
    window.scrollTo(0, 0);
  };

  const generatePreview = () => {
    setShowPreview(true);
    // Scroll hacia arriba al mostrar la vista previa
    window.scrollTo(0, 0);
  };

// Creamos una versión simplificada para exportar a PDF
const generateSimplePDF = () => {
  // Primero recuperamos el logo original para asegurarnos de cargarlo correctamente
  let logoSrc = "";
  if (logoImage) {
    logoSrc = logoImage;
  }
  
  // Añadimos un mensaje en la interfaz para indicar que se está procesando
  const processingMessageId = 'pdf-processing-message';
  let processingMessage = document.getElementById(processingMessageId);
  
  // Si el mensaje ya existe, lo eliminamos primero
  if (processingMessage) {
    document.body.removeChild(processingMessage);
  }
  
  // Creamos un nuevo mensaje
  processingMessage = document.createElement('div');
  processingMessage.id = processingMessageId;
  processingMessage.style.position = 'fixed';
  processingMessage.style.top = '50%';
  processingMessage.style.left = '50%';
  processingMessage.style.transform = 'translate(-50%, -50%)';
  processingMessage.style.padding = '20px';
  processingMessage.style.background = 'rgba(0, 0, 0, 0.7)';
  processingMessage.style.color = 'white';
  processingMessage.style.borderRadius = '8px';
  processingMessage.style.zIndex = '9999';
  processingMessage.style.fontFamily = 'Arial, sans-serif';
  processingMessage.style.fontSize = '16px';
  processingMessage.style.fontWeight = 'bold';
  processingMessage.style.textAlign = 'center';
  processingMessage.className = 'pdf-message'; // Clase para identificarlo fácilmente
  processingMessage.textContent = 'Generando PDF...';
  document.body.appendChild(processingMessage);

  // Configuración para html2pdf
  const options = {
    filename: `SplitSheet_${formData.tituloCancion || 'Documento'}.pdf`,
    margin: [10, 10, 10, 10],
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { 
      scale: 3,
      useCORS: true,
      imageTimeout: 15000, // Mayor tiempo para cargar imágenes
      logging: true  // Activamos logging para diagnosticar problemas
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    }
  };

  // Contenido HTML para cada página
  const page1Content = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 20px;">
        ${logoSrc ? `<img src="${logoSrc}" alt="Logo" style="height: 70px; max-width: 100%; object-fit: contain; margin-bottom: 10px;" />` : ''}
        <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px; text-transform: uppercase;">ACUERDO DE DIVISIÓN DE REGALÍAS EDITORIALES (SPLIT SHEET)</h1>
        <p style="font-size: 12px; margin-top: 5px;">Efectivo a partir del: ${formData.dia || "[DÍA]"}/${formData.mes || "[MES]"}/${formData.ano || "[AÑO]"}</p>
      </div>
      
      <p style="font-size: 12px; margin-bottom: 20px; line-height: 1.4;">
        Este reconocimiento dividido de compositores confirmará que las personas ("Los Autores y Compositores") que se enumeran a continuación son los únicos participantes en la elaboración de la composición musical titulada "<strong>${formData.tituloCancion || "[TÍTULO DE LA CANCIÓN]"}</strong>" ("La Composición") interpretada por <strong>${formData.nombreInterprete || "[NOMBRE DEL INTÉRPRETE]"}</strong>. Por una buena y valiosa consideración, los Escritores acuerdan reconocer las acciones de los siguientes escritores, en función de sus respectivas contribuciones a la Composición.
      </p>
      
      <!-- Tabla principal -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Máster/Composición</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Propiedad de las Composiciones</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Créditos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">
              <strong>${formData.tituloCancion || "[TÍTULO DE LA CANCIÓN]"}</strong>
            </td>
            <td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">
              ${formData.nombreCompleto1 ? `
                <div style="margin-bottom: 8px;">
                  <p style="font-weight: bold; margin: 0;">${formData.nombreCompleto1}</p>
                  ${formData.ipiNumero1 ? `<p style="margin: 2px 0;">IPI# ${formData.ipiNumero1}</p>` : ''}
                  ${formData.porcentaje1 ? `<p style="margin: 2px 0;"><strong>${formData.porcentaje1}%</strong></p>` : ''}
                  
                  ${(formData.sociedadGestion1 || formData.ipiEditorial1 || formData.editorial1) ? `
                    <p style="margin: 4px 0 2px; font-weight: bold;">PUBLISHER</p>
                    ${formData.sociedadGestion1 ? `<p style="margin: 2px 0;">${formData.sociedadGestion1}</p>` : ''}
                    ${formData.ipiEditorial1 ? `<p style="margin: 2px 0;">IPI# ${formData.ipiEditorial1}</p>` : ''}
                    ${(formData.editorial1 && formData.porcentaje1) ? `<p style="margin: 2px 0;">${formData.editorial1} -- ${formData.porcentaje1}%</p>` : ''}
                  ` : ''}
                </div>
              ` : ''}
              
              ${formData.nombreCompleto2 ? `
                <div style="margin-bottom: 8px; border-top: 1px solid #ccc; padding-top: 8px;">
                  <p style="font-weight: bold; margin: 0;">${formData.nombreCompleto2}</p>
                  ${formData.ipiNumero2 ? `<p style="margin: 2px 0;">IPI# ${formData.ipiNumero2}</p>` : ''}
                  ${formData.porcentaje2 ? `<p style="margin: 2px 0;"><strong>${formData.porcentaje2}%</strong></p>` : ''}
                  
                  ${(formData.sociedadGestion2 || formData.ipiEditorial2 || formData.editorial2) ? `
                    <p style="margin: 4px 0 2px; font-weight: bold;">PUBLISHER</p>
                    ${formData.sociedadGestion2 ? `<p style="margin: 2px 0;">${formData.sociedadGestion2}</p>` : ''}
                    ${formData.ipiEditorial2 ? `<p style="margin: 2px 0;">IPI# ${formData.ipiEditorial2}</p>` : ''}
                    ${(formData.editorial2 && formData.porcentaje2) ? `<p style="margin: 2px 0;">${formData.editorial2} -- ${formData.porcentaje2}%</p>` : ''}
                  ` : ''}
                </div>
              ` : ''}
              
              ${formData.nombreCompleto3 ? `
                <div style="margin-bottom: 8px; border-top: 1px solid #ccc; padding-top: 8px;">
                  <p style="font-weight: bold; margin: 0;">${formData.nombreCompleto3}</p>
                  ${formData.ipiNumero3 ? `<p style="margin: 2px 0;">IPI# ${formData.ipiNumero3}</p>` : ''}
                  ${formData.porcentaje3 ? `<p style="margin: 2px 0;"><strong>${formData.porcentaje3}%</strong></p>` : ''}
                  
                  ${(formData.sociedadGestion3 || formData.ipiEditorial3 || formData.editorial3) ? `
                    <p style="margin: 4px 0 2px; font-weight: bold;">PUBLISHER</p>
                    ${formData.sociedadGestion3 ? `<p style="margin: 2px 0;">${formData.sociedadGestion3}</p>` : ''}
                    ${formData.ipiEditorial3 ? `<p style="margin: 2px 0;">IPI# ${formData.ipiEditorial3}</p>` : ''}
                    ${(formData.editorial3 && formData.porcentaje3) ? `<p style="margin: 2px 0;">${formData.editorial3} -- ${formData.porcentaje3}%</p>` : ''}
                  ` : ''}
                </div>
              ` : ''}
              
              ${formData.nombreCompleto4 ? `
                <div style="margin-bottom: 8px; border-top: 1px solid #ccc; padding-top: 8px;">
                  <p style="font-weight: bold; margin: 0;">${formData.nombreCompleto4}</p>
                  ${formData.ipiNumero4 ? `<p style="margin: 2px 0;">IPI# ${formData.ipiNumero4}</p>` : ''}
                  ${formData.porcentaje4 ? `<p style="margin: 2px 0;"><strong>${formData.porcentaje4}%</strong></p>` : ''}
                  
                  ${(formData.sociedadGestion4 || formData.ipiEditorial4 || formData.editorial4) ? `
                    <p style="margin: 4px 0 2px; font-weight: bold;">PUBLISHER</p>
                    ${formData.sociedadGestion4 ? `<p style="margin: 2px 0;">${formData.sociedadGestion4}</p>` : ''}
                    ${formData.ipiEditorial4 ? `<p style="margin: 2px 0;">IPI# ${formData.ipiEditorial4}</p>` : ''}
                    ${(formData.editorial4 && formData.porcentaje4) ? `<p style="margin: 2px 0;">${formData.editorial4} -- ${formData.porcentaje4}%</p>` : ''}
                  ` : ''}
                </div>
              ` : ''}
            </td>
            <td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">
              <div style="margin-bottom: 10px;">
                <p style="font-weight: bold; margin: 0 0 4px;">Autor(es)</p>
                ${formData.autoresLetra1 ? `<p style="margin: 2px 0;">${formData.autoresLetra1}</p>` : ''}
                ${formData.autoresLetra2 ? `<p style="margin: 2px 0;">${formData.autoresLetra2}</p>` : ''}
                ${formData.autoresLetra3 ? `<p style="margin: 2px 0;">${formData.autoresLetra3}</p>` : ''}
                ${formData.autoresLetra4 ? `<p style="margin: 2px 0;">${formData.autoresLetra4}</p>` : ''}
              </div>
              
              <div>
                <p style="font-weight: bold; margin: 0 0 4px;">Compositor(es)</p>
                ${formData.compositoresMusica1 ? `<p style="margin: 2px 0;">${formData.compositoresMusica1}</p>` : ''}
                ${formData.compositoresMusica2 ? `<p style="margin: 2px 0;">${formData.compositoresMusica2}</p>` : ''}
                ${formData.compositoresMusica3 ? `<p style="margin: 2px 0;">${formData.compositoresMusica3}</p>` : ''}
                ${formData.compositoresMusica4 ? `<p style="margin: 2px 0;">${formData.compositoresMusica4}</p>` : ''}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const page2Content = `
    <div style="padding: 20px; font-family: Arial, sans-serif; font-size: 11px;">
      <h2 style="font-size: 16px; font-weight: bold; text-align: center; margin-top: 0; margin-bottom: 15px; text-transform: uppercase;">DIVISIÓN DE OBRA EN COLABORACIÓN (EXPLOTACIÓN DEL MÁSTER)</h2>
      
      <p style="margin-bottom: 12px;">
        ${formData.nombreCompleto1 ? `<span style="font-weight: bold;">${formData.nombreCompleto1}</span>${formData.nombreArtistico1 ? ` P/k/a <span style="font-weight: bold;">${formData.nombreArtistico1}</span>` : ''}` : ''}
        ${formData.nombreCompleto2 ? `, <span style="font-weight: bold;">${formData.nombreCompleto2}</span>${formData.nombreArtistico2 ? ` P/k/a <span style="font-weight: bold;">${formData.nombreArtistico2}</span>` : ''}` : ''}
        ${formData.nombreCompleto3 ? `, <span style="font-weight: bold;">${formData.nombreCompleto3}</span>${formData.nombreArtistico3 ? ` P/k/a <span style="font-weight: bold;">${formData.nombreArtistico3}</span>` : ''}` : ''}
        ${(formData.nombreCompleto1 || formData.nombreCompleto2 || formData.nombreCompleto3) ? `, todos los mencionados anteriormente en conjunto como LOS COLABORADORES.` : ''}
      </p>
      
      <p style="font-weight: bold; margin-bottom: 10px;">LOS COLABORADORES PACTAN LO SIGUIENTE:</p>
      
      <p style="margin-bottom: 10px;">
        LOS COLABORADORES han suministrado sus servicios artísticos profesionales en y para EL MÁSTER de la canción titulada "<span style="font-weight: bold;">${formData.tituloCancion || "[TÍTULO DE LA CANCIÓN]"}</span>" (en lo que sigue, EL MÁSTER) interpretada por <span style="font-weight: bold;">${formData.nombreInterprete || "[NOMBRE DEL INTÉRPRETE]"}</span>.
      </p>
      
      <p style="margin-bottom: 10px;">
        LOS COLABORADORES confirman que suministran sus servicios como "obra hecha en colaboración" para <span style="font-weight: bold;">${formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span>. De hecho, LOS COLABORADORES confirman que <span style="font-weight: bold;">${formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> y/o <span style="font-weight: bold;">${formData.nombrePropietario || "[NOMBRE DEL PROPIETARIO PRINCIPAL]"}</span>, sus asignados, licenciados, sucesores, designados, dispondrán del libre derecho a perpetuidad en el universo de utilizar el nombre, caricatura, foto, y materiales biográficos, en relación con la explotación y/o promoción de EL MÁSTER en cualquier medio ahora conocido o a ser desarrollado en el futuro, sin excepción o restricción alguna.
      </p>
      
      <p style="margin-bottom: 5px;">Para los propósitos de este Acuerdo, el término "explotación" incluirá sin estar limitado a:</p>
      <ul style="list-style-type: disc; margin-left: 25px; margin-bottom: 10px; padding-left: 0;">
        <li style="margin-bottom: 3px;">Anuncios comerciales</li>
        <li style="margin-bottom: 3px;">Sincronización audiovisual</li>
        <li style="margin-bottom: 3px;">Vehículos de mercadeo y promoción de EL MÁSTER</li>
        <li style="margin-bottom: 3px;">Difusión televisiva, radial y vía internet</li>
        <li style="margin-bottom: 3px;">Distribución en cualquier plataforma actualmente en existencia o a ser descubierta en el futuro</li>
        <li style="margin-bottom: 3px;">Uso en presentaciones en vivo</li>
        <li style="margin-bottom: 3px;">Cualquier otro uso comercial o promocional</li>
      </ul>
      
      <p style="margin-bottom: 10px;">
        LOS COLABORADORES ceden a <span style="font-weight: bold;">${formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> y/o <span style="font-weight: bold;">${formData.nombrePropietario || "[NOMBRE DEL PROPIETARIO PRINCIPAL]"}</span> dichos derechos sin compensación adicional a lo estipulado en este Acuerdo.
      </p>
      
      <p style="margin-bottom: 10px;">
        <span style="font-weight: bold;">${formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> utilizará sus mejores esfuerzos en causar que los créditos aparezcan según las normas de la industria en todas las plataformas digitales ("DSP'S").
      </p>

      <p style="margin-bottom: 10px;">
        A partir de la incepción de la creación de EL MÁSTER, <span style="font-weight: bold;">${formData.nombrePropietario || "[NOMBRE DEL PROPIETARIO PRINCIPAL]"}</span> y/o <span style="font-weight: bold;">${formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> será considerado el exclusivo propietario mundial a perpetuidad de este, y todos los derechos relacionados a dicha PRODUCCIÓN sin excepción alguna.
      </p>
      
      <p style="margin-bottom: 5px;">
        Para los propósitos de este Acuerdo, el término "PRODUCCIÓN" incluirá individual y colectivamente (sin estar limitado a):
      </p>
      <div style="margin-left: 25px; margin-bottom: 10px;">
        <p style="margin-bottom: 4px;"><span style="display: inline-block; width: 18px; font-weight: bold;">1.</span>Todas las versiones y ediciones EL MASTER y la versión final aprobada por LOS COLABORADORES, ("La Versión Final")</p>
        <p style="margin-bottom: 4px;"><span style="display: inline-block; width: 18px; font-weight: bold;">2.</span>Todos los archivos digitales, individuales y separadas</p>
        <p style="margin-bottom: 4px;"><span style="display: inline-block; width: 18px; font-weight: bold;">3.</span>Acapellas, instrumentales y los dichos "TV tracks"</p>
        <p style="margin-bottom: 4px;"><span style="display: inline-block; width: 18px; font-weight: bold;">4.</span>Videos musicales (si los hubiere)</p>
        <p style="margin-bottom: 4px;"><span style="display: inline-block; width: 18px; font-weight: bold;">5.</span>Cualquier material derivado del MASTER</p>
      </div>
    </div>
  `;

  const page3Content = `
    <div style="padding: 20px; font-family: Arial, sans-serif; font-size: 11px;">
      <p style="margin-top: 0; margin-bottom: 10px;">
        En relación a lo mismo, <span style="font-weight: bold;">${formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> dispondrá del derecho exclusivo de administrar todos los derechos de EL MASTER (para los propósitos de este Acuerdo, el término "Administrar" significará el derecho de explotar EL MASTER (o no hacerlo a su discreción), ceder licencias a terceros para la explotación de EL MASTER, recaudar las sumas generadas por la explotación de EL MASTER y de hacer negocios de cualquier manera o forma sin restricción alguna.
      </p>
      
      <p style="margin-bottom: 10px;">
        LOS COLABORADORES confirman que <span style="font-weight: bold;">${formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> y/o <span style="font-weight: bold;">${formData.nombrePropietario || "[NOMBRE DEL PROPIETARIO PRINCIPAL]"}</span> dispone del derecho exclusivo a perpetuidad de inscribir EL MÁSTER en su nombre en la Oficina de Copyright y/o en cualquier otra agencia semejante en el mundo entero. <span style="font-weight: bold;">${formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> será el propietario de dicho "copyright" durante el plazo completo de protección bajo las leyes de cada país en el mundo, incluyendo renovaciones y/o extensiones.
      </p>
      
      <p style="margin-bottom: 10px;">
        En cambio, por los servicios artísticos, de producción y/o de dirección suministrados, <span style="font-weight: bold;">${formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> para fines de división del 100% de los ingresos del Máster se entregará de la forma descrita abajo:
      </p>
    
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Nombre completo</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Porcentaje (%)</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Rol</th>
          </tr>
        </thead>
        <tbody>
          ${formData.colaboradorMaster1 ? `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.colaboradorMaster1}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.porcentajeMaster1 || "0"}%</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.rolMaster1 || "[ESPECIFICAR ROL]"}</td>
            </tr>
          ` : ''}
          
          ${formData.colaboradorMaster2 ? `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.colaboradorMaster2}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.porcentajeMaster2 || "0"}%</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.rolMaster2 || "[ESPECIFICAR ROL]"}</td>
            </tr>
          ` : ''}
          
          ${formData.colaboradorMaster3 ? `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.colaboradorMaster3}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.porcentajeMaster3 || "0"}%</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.rolMaster3 || "[ESPECIFICAR ROL]"}</td>
            </tr>
          ` : ''}
          
          ${formData.colaboradorMaster4 ? `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.colaboradorMaster4}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.porcentajeMaster4 || "0"}%</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${formData.rolMaster4 || "[ESPECIFICAR ROL]"}</td>
            </tr>
          ` : ''}
          
          <tr style="font-weight: bold; background-color: #f0f0f0;">
            <td style="border: 1px solid #ccc; padding: 8px;">TOTAL</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${[
              Number(formData.porcentajeMaster1) || 0,
              Number(formData.porcentajeMaster2) || 0,
              Number(formData.porcentajeMaster3) || 0,
              Number(formData.porcentajeMaster4) || 0
            ].reduce((sum, value) => sum + value, 0)}%</td>
            <td style="border: 1px solid #ccc; padding: 8px;"></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const page4Content = `
    <div style="padding: 20px; font-family: Arial, sans-serif; font-size: 11px;">
      <div style="margin-bottom: 15px;">
        <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 8px; text-transform: uppercase;">CONFIDENCIALIDAD:</h3>
        <p style="margin-bottom: 10px;">
          La información contenida en este contrato es confidencial. En consecuencia, LOS COLABORADORES acuerdan que será exclusivamente para su uso confidencial, y en el entendimiento expreso de que, sin el permiso previo, LOS COLABORADORES no podrán dar a conocer, enviar ni hacer reproducciones o utilizar lo contenido en este acuerdo ni cualquier material o acto con carácter accesorio o complementario del mismo.
        </p>
        
        <p style="margin-bottom: 10px;">
          Este Acuerdo será interpretado y gobernado exclusivamente según las leyes de <span style="font-weight: bold;">${formData.pais || "[PAÍS]"}</span>.
        </p>
        
        <p style="margin-bottom: 10px;">
          Este Acuerdo podrá ser ejecutado vía e-mail, escaneado y en contraparte.
        </p>
      </div>
      
      <div>
        <p style="text-align: center; margin-bottom: 15px;">
          Firmado el ${formData.dia || "[DÍA]"} de ${formData.mes || "[MES]"} de ${formData.ano || "[AÑO]"}.
        </p>
        
        <p style="text-align: center; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">LEIDO, DE ACUERDO Y ACEPTADO POR:</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; grid-gap: 30px 20px;">
          ${(() => {
            // Recopilamos nombres únicos de ambas divisiones
            const firmantes = [];
            
            // Añadimos compositores
            if (formData.nombreCompleto1 && !firmantes.includes(formData.nombreCompleto1)) {
              firmantes.push(formData.nombreCompleto1);
            }
            if (formData.nombreCompleto2 && !firmantes.includes(formData.nombreCompleto2)) {
              firmantes.push(formData.nombreCompleto2);
            }
            if (formData.nombreCompleto3 && !firmantes.includes(formData.nombreCompleto3)) {
              firmantes.push(formData.nombreCompleto3);
            }
            if (formData.nombreCompleto4 && !firmantes.includes(formData.nombreCompleto4)) {
              firmantes.push(formData.nombreCompleto4);
            }
            
            // Añadimos colaboradores del máster (si no están ya en la lista)
            if (formData.colaboradorMaster1 && !firmantes.includes(formData.colaboradorMaster1)) {
              firmantes.push(formData.colaboradorMaster1);
            }
            if (formData.colaboradorMaster2 && !firmantes.includes(formData.colaboradorMaster2)) {
              firmantes.push(formData.colaboradorMaster2);
            }
            if (formData.colaboradorMaster3 && !firmantes.includes(formData.colaboradorMaster3)) {
              firmantes.push(formData.colaboradorMaster3);
            }
            if (formData.colaboradorMaster4 && !firmantes.includes(formData.colaboradorMaster4)) {
              firmantes.push(formData.colaboradorMaster4);
            }
            
            // Devolvemos los espacios para firmas
            return firmantes.map(firmante => `
              <div>
                <p style="font-weight: bold; margin-bottom: 15px;">${firmante}</p>
                <p style="margin-bottom: 8px;">Firma: ___________________________</p>
                <p>Fecha: ${formData.dia || "___"}/${formData.mes || "___"}/${formData.ano || "___"}</p>
              </div>
            `).join('');
          })()}
        </div>
      </div>
    </div>
  `;

  // Si el logoImage está vacío, intentamos usar la función de impresión normal
  if (!logoImage) {
    // Crear documento HTML completo con saltos de página
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page {
            margin: 0;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .page {
            page-break-after: always;
            height: 100%;
          }
          .last-page {
            page-break-after: auto;
          }
        </style>
      </head>
      <body>
        <div class="page">${page1Content}</div>
        <div class="page">${page2Content}</div>
        <div class="page">${page3Content}</div>
        <div class="last-page">${page4Content}</div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const tempUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    iframe.onload = function() {
      html2pdf().from(iframe.contentWindow.document.body).set(options).save().then(() => {
        URL.revokeObjectURL(tempUrl);
        document.body.removeChild(iframe);
      });
    };

    iframe.src = tempUrl;
    return;
  }

  // Si hay una imagen de logo, primero la precargamos para asegurarnos de que esté disponible
  const img = new Image();
  img.crossOrigin = "Anonymous";  // Importante para imágenes externas
  
  img.onload = function() {
    // Una vez que la imagen está cargada, creamos un canvas para convertirla a una URL de datos
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Convertir a URL de datos
    const dataUrl = canvas.toDataURL('image/png');
    
    // Ahora usamos esta URL de datos en nuestro documento
    const logoHtml = `<img src="${dataUrl}" alt="Logo" style="height: 70px; max-width: 100%; object-fit: contain; margin-bottom: 10px;" />`;
    
    // Reemplazar el marcador de posición del logo en page1Content
    const updatedPage1Content = page1Content.replace(
      `${logoSrc ? `<img src="${logoSrc}" alt="Logo" style="height: 70px; max-width: 100%; object-fit: contain; margin-bottom: 10px;" />` : ''}`,
      logoHtml
    );
    
    // Crear documento HTML completo con saltos de página
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page {
            margin: 0;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .page {
            page-break-after: always;
            height: 100%;
          }
          .last-page {
            page-break-after: auto;
          }
        </style>
      </head>
      <body>
        <div class="page">${updatedPage1Content}</div>
        <div class="page">${page2Content}</div>
        <div class="page">${page3Content}</div>
        <div class="last-page">${page4Content}</div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const tempUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    iframe.onload = function() {
      html2pdf().from(iframe.contentWindow.document.body).set(options).save().then(() => {
        URL.revokeObjectURL(tempUrl);
        document.body.removeChild(iframe);
      });
    };

    iframe.src = tempUrl;
  };
  
  img.onerror = function() {
    // Si hay error al cargar la imagen, proceder sin ella
    console.error("Error al cargar la imagen del logo");
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page {
            margin: 0;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .page {
            page-break-after: always;
            height: 100%;
          }
          .last-page {
            page-break-after: auto;
          }
        </style>
      </head>
      <body>
        <div class="page">${page1Content}</div>
        <div class="page">${page2Content}</div>
        <div class="page">${page3Content}</div>
        <div class="last-page">${page4Content}</div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const tempUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    iframe.onload = function() {
      html2pdf().from(iframe.contentWindow.document.body).set(options).save().then(() => {
        URL.revokeObjectURL(tempUrl);
        document.body.removeChild(iframe);
      });
    };

    iframe.src = tempUrl;
  };
  
  // Iniciar la carga de la imagen
  img.src = logoImage;
};

// Usamos la nueva función en lugar de la anterior
const generatePDF = generateSimplePDF;

// Versión alternativa para navegadores móviles
const printDocument = () => {
  // Ocultar instrucciones antes de imprimir
  const instructionsElement = document.querySelector('.pdf-instructions');
  if (instructionsElement) instructionsElement.style.display = 'none';
  
  // Imprimir
  window.print();
  
  // Restaurar instrucciones después de imprimir
  setTimeout(() => {
    if (instructionsElement) instructionsElement.style.display = 'block';
  }, 1000);
};

  const DocumentPreview = () => {
    // Calcular los porcentajes totales del máster
    const totalPorcentajeMaster = [
      Number(formData.porcentajeMaster1) || 0,
      Number(formData.porcentajeMaster2) || 0,
      Number(formData.porcentajeMaster3) || 0,
      Number(formData.porcentajeMaster4) || 0
    ].reduce((sum, value) => sum + value, 0);
    
    return (
      <div className="p-6 max-w-5xl mx-auto bg-white text-black transition-colors duration-300">
        <div className="fixed top-4 right-4 flex print:hidden z-10">
          <button 
            onClick={() => setShowPreview(false)}
            className="mr-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            Volver al Editor
          </button>
          <button
            onClick={generatePDF}
            className="mr-2 px-4 py-2 rounded flex items-center bg-green-500 hover:bg-green-600 text-white transition-colors"
          >
            <Download size={18} className="mr-1" /> Descargar PDF
          </button>
          <button
            onClick={printDocument}
            className="px-4 py-2 rounded flex items-center bg-purple-500 hover:bg-purple-600 text-white transition-colors"
          >
            <Printer size={18} className="mr-1" /> Imprimir
          </button>
        </div>
        
        {/* Contenido del documento */}
        <div 
          ref={documentRef}
          className="bg-white p-4 shadow-lg rounded-lg print:shadow-none print:p-0"
        >
          {/* Logo */}
          <div className="flex justify-center mb-2 print:mt-0">
            {logoImage ? (
              <img src={logoImage} alt="Logo" className="h-32 max-w-full object-contain print:h-24" />
            ) : (
              <div className="flex items-center justify-center h-16 w-full max-w-sm mx-auto bg-gray-100 rounded-md print:hidden">
                <span className="text-xl text-gray-500">Logo</span>
              </div>
            )}
          </div>
          
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold uppercase print:text-xl">ACUERDO DE DIVISIÓN DE REGALÍAS EDITORIALES (SPLIT SHEET)</h1>
            
            <p className="text-sm mt-1">
              Efectivo a partir del: {formData.dia || "[DÍA]"}/{formData.mes || "[MES]"}/{formData.ano || "[AÑO]"}
            </p>
          </div>
          
          <div className="mb-8 leading-relaxed text-sm">
            <p>Este reconocimiento dividido de compositores confirmará que las personas ("Los Autores y Compositores") que se enumeran a continuación son los únicos participantes en la elaboración de la composición musical titulada "<strong>{formData.tituloCancion || "[TÍTULO DE LA CANCIÓN]"}</strong>" ("La Composición") interpretada por <strong>{formData.nombreInterprete || "[NOMBRE DEL INTÉRPRETE]"}</strong>. Por una buena y valiosa consideración, los Escritores acuerdan reconocer las acciones de los siguientes escritores, en función de sus respectivas contribuciones a la Composición.</p>
          </div>
          
          <div className="mb-6 overflow-x-auto print:page-break-inside-avoid">
            <table className="w-full border-collapse border-gray-300 transition-colors duration-300 print:text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left font-bold print:p-1">Máster/Composición</th>
                  <th className="border border-gray-300 p-2 text-left font-bold print:p-1">Propiedad de las Composiciones</th>
                  <th className="border border-gray-300 p-2 text-left font-bold print:p-1">Créditos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 align-top print:p-1" rowSpan="1">
                    <strong>{formData.tituloCancion || "[TÍTULO DE LA CANCIÓN]"}</strong>
                  </td>
                  <td className="border border-gray-300 p-2 align-top print:p-1">
                    {formData.nombreCompleto1 && (
                      <div className="mb-2">
                        <p className="font-bold">{formData.nombreCompleto1}</p>
                        {formData.ipiNumero1 && <p>IPI# {formData.ipiNumero1}</p>}
                        {formData.porcentaje1 && <p><strong>{formData.porcentaje1}%</strong></p>}
                        
                        {(formData.sociedadGestion1 || formData.ipiEditorial1 || formData.editorial1) && (
                          <>
                            <p className="mt-1 font-bold">PUBLISHER</p>
                            {formData.sociedadGestion1 && <p>{formData.sociedadGestion1}</p>}
                            {formData.ipiEditorial1 && <p>IPI# {formData.ipiEditorial1}</p>}
                            {formData.editorial1 && formData.porcentaje1 && 
                              <p>{formData.editorial1} -- {formData.porcentaje1}%</p>
                            }
                          </>
                        )}
                      </div>
                    )}
                    
                    {formData.nombreCompleto2 && (
                      <div className="mb-2 pt-2 border-t border-gray-300">
                        <p className="font-bold">{formData.nombreCompleto2}</p>
                        {formData.ipiNumero2 && <p>IPI# {formData.ipiNumero2}</p>}
                        {formData.porcentaje2 && <p><strong>{formData.porcentaje2}%</strong></p>}
                        
                        {(formData.sociedadGestion2 || formData.ipiEditorial2 || formData.editorial2) && (
                          <>
                            <p className="mt-1 font-bold">PUBLISHER</p>
                            {formData.sociedadGestion2 && <p>{formData.sociedadGestion2}</p>}
                            {formData.ipiEditorial2 && <p>IPI# {formData.ipiEditorial2}</p>}
                            {formData.editorial2 && formData.porcentaje2 && 
                              <p>{formData.editorial2} -- {formData.porcentaje2}%</p>
                            }
                          </>
                        )}
                      </div>
                    )}
                    
                    {formData.nombreCompleto3 && (
                      <div className="mb-2 pt-2 border-t border-gray-300">
                        <p className="font-bold">{formData.nombreCompleto3}</p>
                        {formData.ipiNumero3 && <p>IPI# {formData.ipiNumero3}</p>}
                        {formData.porcentaje3 && <p><strong>{formData.porcentaje3}%</strong></p>}
                        
                        {(formData.sociedadGestion3 || formData.ipiEditorial3 || formData.editorial3) && (
                          <>
                            <p className="mt-1 font-bold">PUBLISHER</p>
                            {formData.sociedadGestion3 && <p>{formData.sociedadGestion3}</p>}
                            {formData.ipiEditorial3 && <p>IPI# {formData.ipiEditorial3}</p>}
                            {formData.editorial3 && formData.porcentaje3 && 
                              <p>{formData.editorial3} -- {formData.porcentaje3}%</p>
                            }
                          </>
                        )}
                      </div>
                    )}
                    
                    {formData.nombreCompleto4 && (
                      <div className="mb-2 pt-2 border-t border-gray-300">
                        <p className="font-bold">{formData.nombreCompleto4}</p>
                        {formData.ipiNumero4 && <p>IPI# {formData.ipiNumero4}</p>}
                        {formData.porcentaje4 && <p><strong>{formData.porcentaje4}%</strong></p>}
                        
                        {(formData.sociedadGestion4 || formData.ipiEditorial4 || formData.editorial4) && (
                          <>
                            <p className="mt-1 font-bold">PUBLISHER</p>
                            {formData.sociedadGestion4 && <p>{formData.sociedadGestion4}</p>}
                            {formData.ipiEditorial4 && <p>IPI# {formData.ipiEditorial4}</p>}
                            {formData.editorial4 && formData.porcentaje4 && 
                              <p>{formData.editorial4} -- {formData.porcentaje4}%</p>
                            }
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 align-top print:p-1">
                    <div className="mb-4">
                      <p className="font-bold mb-1">Autor(es)</p>
                      {formData.autoresLetra1 && <p>{formData.autoresLetra1}</p>}
                      {formData.autoresLetra2 && <p>{formData.autoresLetra2}</p>}
                      {formData.autoresLetra3 && <p>{formData.autoresLetra3}</p>}
                      {formData.autoresLetra4 && <p>{formData.autoresLetra4}</p>}
                    </div>
                    
                    <div>
                      <p className="font-bold mb-1">Compositor(es)</p>
                      {formData.compositoresMusica1 && <p>{formData.compositoresMusica1}</p>}
                      {formData.compositoresMusica2 && <p>{formData.compositoresMusica2}</p>}
                      {formData.compositoresMusica3 && <p>{formData.compositoresMusica3}</p>}
                      {formData.compositoresMusica4 && <p>{formData.compositoresMusica4}</p>}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mb-8 print:page-break-after-avoid">
            <h2 className="text-xl font-bold text-center mb-6 uppercase print:text-lg">DIVISIÓN DE OBRA EN COLABORACIÓN (EXPLOTACIÓN DEL MÁSTER)</h2>
            
            <p className="mb-6 print:text-sm">
              {formData.nombreCompleto1 && <><span className="font-bold">{formData.nombreCompleto1}</span>{formData.nombreArtistico1 && <> P/k/a <span className="font-bold">{formData.nombreArtistico1}</span></>}</>}
              {formData.nombreCompleto2 && <>, <span className="font-bold">{formData.nombreCompleto2}</span>{formData.nombreArtistico2 && <> P/k/a <span className="font-bold">{formData.nombreArtistico2}</span></>}</>}
              {formData.nombreCompleto3 && <>, <span className="font-bold">{formData.nombreCompleto3}</span>{formData.nombreArtistico3 && <> P/k/a <span className="font-bold">{formData.nombreArtistico3}</span></>}</>}
              {(formData.nombreCompleto1 || formData.nombreCompleto2 || formData.nombreCompleto3) && <>, todos los mencionados anteriormente en conjunto como LOS COLABORADORES.</>}
            </p>
            
            <p className="font-bold mb-4 print:text-sm">LOS COLABORADORES PACTAN LO SIGUIENTE:</p>
            
            <p className="mb-4 print:text-sm">
              LOS COLABORADORES han suministrado sus servicios artísticos profesionales en y para EL MÁSTER de la canción titulada "<span className="font-bold">{formData.tituloCancion || "[TÍTULO DE LA CANCIÓN]"}</span>" (en lo que sigue, EL MÁSTER) interpretada por <span className="font-bold">{formData.nombreInterprete || "[NOMBRE DEL INTÉRPRETE]"}</span>.
            </p>
            
            <p className="mb-4 print:text-sm">
              LOS COLABORADORES confirman que suministran sus servicios como "obra hecha en colaboración" para <span className="font-bold">{formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span>. De hecho, LOS COLABORADORES confirman que <span className="font-bold">{formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> y/o <span className="font-bold">{formData.nombrePropietario || "[NOMBRE DEL PROPIETARIO PRINCIPAL]"}</span>, sus asignados, licenciados, sucesores, designados, dispondrán del libre derecho a perpetuidad en el universo de utilizar el nombre, caricatura, foto, y materiales biográficos, en relación con la explotación y/o promoción de EL MÁSTER en cualquier medio ahora conocido o a ser desarrollado en el futuro, sin excepción o restricción alguna.
            </p>
            
            <p className="mb-2 print:text-sm">Para los propósitos de este Acuerdo, el término "explotación" incluirá sin estar limitado a:</p>
            <ul className="list-disc pl-8 mb-4 print:text-sm">
              <li>Anuncios comerciales</li>
              <li>Sincronización audiovisual</li>
              <li>Vehículos de mercadeo y promoción de EL MÁSTER</li>
              <li>Difusión televisiva, radial y vía internet</li>
              <li>Distribución en cualquier plataforma actualmente en existencia o a ser descubierta en el futuro</li>
              <li>Uso en presentaciones en vivo</li>
              <li>Cualquier otro uso comercial o promocional</li>
            </ul>
            
            <p className="mb-4 print:text-sm">
              LOS COLABORADORES ceden a <span className="font-bold">{formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> y/o <span className="font-bold">{formData.nombrePropietario || "[NOMBRE DEL PROPIETARIO PRINCIPAL]"}</span> dichos derechos sin compensación adicional a lo estipulado en este Acuerdo.
            </p>
            
            <p className="mb-4 print:text-sm">
              <span className="font-bold">{formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> utilizará sus mejores esfuerzos en causar que los créditos aparezcan según las normas de la industria en todas las plataformas digitales ("DSP'S").
            </p>
            
            {(formData.nombreInterprete1 || formData.nombreInterprete2 || formData.nombreInterprete3 || formData.nombreProduccion1 || formData.nombreProduccion2 || formData.nombresMezcla || formData.nombresMasterizacion || formData.otrosCreditos) && (
              <div className="mb-4">
                <p className="font-bold mb-2 print:text-sm">Créditos acordados:</p>
                <ul className="list-disc pl-8 space-y-1 print:text-sm">
                  {(formData.nombreInterprete1 || formData.nombreInterprete2 || formData.nombreInterprete3) && (
                    <li>
                      {formData.nombreInterprete1 && <span>Intérprete principal: <span className="font-bold">{formData.nombreInterprete1}</span></span>}
                      {formData.nombreInterprete2 && <span>, Intérprete principal: <span className="font-bold">{formData.nombreInterprete2}</span></span>}
                      {formData.nombreInterprete3 && <span>, Intérprete principal: <span className="font-bold">{formData.nombreInterprete3}</span></span>}
                    </li>
                  )}
                  
                  {(formData.nombreProduccion1 || formData.nombreProduccion2) && (
                    <li>
                      {formData.nombreProduccion1 && <span>Producción: <span className="font-bold">{formData.nombreProduccion1}</span></span>}
                      {formData.nombreProduccion2 && <span>, Producción: <span className="font-bold">{formData.nombreProduccion2}</span></span>}
                    </li>
                  )}
                  
                  {formData.nombresMezcla && (
                    <li>Mezcla: <span className="font-bold">{formData.nombresMezcla}</span></li>
                  )}
                  
                  {formData.nombresMasterizacion && (
                    <li>Masterización: <span className="font-bold">{formData.nombresMasterizacion}</span></li>
                  )}
                  
                  {formData.otrosCreditos && (
                    <li>Otros créditos técnicos: <span className="font-bold">{formData.otrosCreditos}</span></li>
                  )}
                </ul>
              </div>
            )}
            
            <p className="mb-4 print:text-sm">
              A partir de la incepción de la creación de EL MÁSTER, <span className="font-bold">{formData.nombrePropietario || "[NOMBRE DEL PROPIETARIO PRINCIPAL]"}</span> y/o <span className="font-bold">{formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> será considerado el exclusivo propietario mundial a perpetuidad de este, y todos los derechos relacionados a dicha PRODUCCIÓN sin excepción alguna.
            </p>
            
            <p className="mb-4 print:text-sm">
              Para los propósitos de este Acuerdo, el término "PRODUCCIÓN" incluirá individual y colectivamente (sin estar limitado a):
            </p>
            <ol className="list-decimal pl-8 mb-4 print:text-sm">
              <li>Todas las versiones y ediciones EL MASTER y la versión final aprobada por LOS COLABORADORES, ("La Versión Final")</li>
              <li>Todos los archivos digitales, individuales y separadas</li>
              <li>Acapellas, instrumentales y los dichos "TV tracks"</li>
              <li>Videos musicales (si los hubiere)</li>
              <li>Cualquier material derivado del MASTER</li>
            </ol>
            
            <p className="mb-4 print:text-sm">
              En relación a lo mismo, <span className="font-bold">{formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> dispondrá del derecho exclusivo de administrar todos los derechos de EL MASTER (para los propósitos de este Acuerdo, el término "Administrar" significará el derecho de explotar EL MASTER (o no hacerlo a su discreción), ceder licencias a terceros para la explotación de EL MASTER, recaudar las sumas generadas por la explotación de EL MASTER y de hacer negocios de cualquier manera o forma sin restricción alguna.
            </p>
            
            <p className="mb-4 print:text-sm">
              LOS COLABORADORES confirman que <span className="font-bold">{formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> y/o <span className="font-bold">{formData.nombrePropietario || "[NOMBRE DEL PROPIETARIO PRINCIPAL]"}</span> dispone del derecho exclusivo a perpetuidad de inscribir EL MÁSTER en su nombre en la Oficina de Copyright y/o en cualquier otra agencia semejante en el mundo entero. <span className="font-bold">{formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> será el propietario de dicho "copyright" durante el plazo completo de protección bajo las leyes de cada país en el mundo, incluyendo renovaciones y/o extensiones.
            </p>
            
            <p className="mb-4 print:text-sm">
              En cambio, por los servicios artísticos, de producción y/o de dirección suministrados, <span className="font-bold">{formData.nombreDisquera || "[NOMBRE DE LA DISQUERA/SELLO/PROPIETARIO]"}</span> para fines de división del 100% de los ingresos del Máster se entregará de la forma descrita abajo:
            </p>
          </div>
          
          <div className="mb-8 overflow-x-auto print:page-break-inside-avoid">
            <table className="w-full border-collapse border-gray-300 transition-colors duration-300 print:text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left font-bold print:p-1">Nombre completo</th>
                  <th className="border border-gray-300 p-2 text-left font-bold print:p-1">Porcentaje (%)</th>
                  <th className="border border-gray-300 p-2 text-left font-bold print:p-1">Rol</th>
                </tr>
              </thead>
              <tbody>
                {formData.colaboradorMaster1 && (
                  <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="border border-gray-300 p-2 print:p-1">{formData.colaboradorMaster1}</td>
                    <td className="border border-gray-300 p-2 print:p-1">{formData.porcentajeMaster1 || "0"}%</td>
                    <td className="border border-gray-300 p-2 print:p-1">{formData.rolMaster1 || "[ESPECIFICAR ROL]"}</td>
                  </tr>
                )}
                
                {formData.colaboradorMaster2 && (
                  <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="border border-gray-300 p-2 print:p-1">{formData.colaboradorMaster2}</td>
                    <td className="border border-gray-300 p-2 print:p-1">{formData.porcentajeMaster2 || "0"}%</td>
                    <td className="border border-gray-300 p-2 print:p-1">{formData.rolMaster2 || "[ESPECIFICAR ROL]"}</td>
                  </tr>
                )}
                
                {formData.colaboradorMaster3 && (
                  <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="border border-gray-300 p-2 print:p-1">{formData.colaboradorMaster3}</td>
                    <td className="border border-gray-300 p-2 print:p-1">{formData.porcentajeMaster3 || "0"}%</td>
                    <td className="border border-gray-300 p-2 print:p-1">{formData.rolMaster3 || "[ESPECIFICAR ROL]"}</td>
                  </tr>
                )}
                
                {formData.colaboradorMaster4 && (
                  <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="border border-gray-300 p-2 print:p-1">{formData.colaboradorMaster4}</td>
                    <td className="border border-gray-300 p-2 print:p-1">{formData.porcentajeMaster4 || "0"}%</td>
                    <td className="border border-gray-300 p-2 print:p-1">{formData.rolMaster4 || "[ESPECIFICAR ROL]"}</td>
                  </tr>
                )}
                
                <tr className="font-bold bg-gray-100">
                  <td className="border border-gray-300 p-2 print:p-1">TOTAL</td>
                  <td className="border border-gray-300 p-2 print:p-1">{totalPorcentajeMaster}%</td>
                  <td className="border border-gray-300 p-2 print:p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mb-8 print:page-break-inside-avoid">
            <h3 className="font-bold mb-2 uppercase print:text-base">CONFIDENCIALIDAD:</h3>
            <p className="mb-4 text-sm">
              La información contenida en este contrato es confidencial. En consecuencia, LOS COLABORADORES acuerdan que será exclusivamente para su uso confidencial, y en el entendimiento expreso de que, sin el permiso previo, LOS COLABORADORES no podrán dar a conocer, enviar ni hacer reproducciones o utilizar lo contenido en este acuerdo ni cualquier material o acto con carácter accesorio o complementario del mismo.
            </p>
            
            <p className="mb-4 text-sm">
              Este Acuerdo será interpretado y gobernado exclusivamente según las leyes de <span className="font-bold">{formData.pais || "[PAÍS]"}</span>.
            </p>
            
            <p className="mb-4 text-sm">
              Este Acuerdo podrá ser ejecutado vía e-mail, escaneado y en contraparte.
            </p>
          </div>
          
          <div className="mb-8 print:page-break-inside-avoid">
            <p className="text-center mb-4 print:text-sm">
              Firmado el {formData.dia || "[DÍA]"} de {formData.mes || "[MES]"} de {formData.ano || "[AÑO]"}.
            </p>
            
            <p className="text-center font-bold mb-8 uppercase print:text-base">LEIDO, DE ACUERDO Y ACEPTADO POR:</p>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 print:text-sm">
              {/* Recopilamos todos los firmantes únicos de ambas divisiones (composición y máster) */}
              {(() => {
                // Recopilamos nombres únicos de ambas divisiones
                const firmantes = [];
                
                // Añadimos compositores
                if (formData.nombreCompleto1 && !firmantes.includes(formData.nombreCompleto1)) {
                  firmantes.push(formData.nombreCompleto1);
                }
                if (formData.nombreCompleto2 && !firmantes.includes(formData.nombreCompleto2)) {
                  firmantes.push(formData.nombreCompleto2);
                }
                if (formData.nombreCompleto3 && !firmantes.includes(formData.nombreCompleto3)) {
                  firmantes.push(formData.nombreCompleto3);
                }
                if (formData.nombreCompleto4 && !firmantes.includes(formData.nombreCompleto4)) {
                  firmantes.push(formData.nombreCompleto4);
                }
                
                // Añadimos colaboradores del máster (si no están ya en la lista)
                if (formData.colaboradorMaster1 && !firmantes.includes(formData.colaboradorMaster1)) {
                  firmantes.push(formData.colaboradorMaster1);
                }
                if (formData.colaboradorMaster2 && !firmantes.includes(formData.colaboradorMaster2)) {
                  firmantes.push(formData.colaboradorMaster2);
                }
                if (formData.colaboradorMaster3 && !firmantes.includes(formData.colaboradorMaster3)) {
                  firmantes.push(formData.colaboradorMaster3);
                }
                if (formData.colaboradorMaster4 && !firmantes.includes(formData.colaboradorMaster4)) {
                  firmantes.push(formData.colaboradorMaster4);
                }
                
                // Devolvemos los espacios para firmas
                return firmantes.map((firmante, index) => (
                  <div key={index}>
                    <p className="font-bold mb-4">{firmante}</p>
                    <p className="mb-2">Firma: ___________________________</p>
                    <p>Fecha: {formData.dia || "___"}/{formData.mes || "___"}/{formData.ano || "___"}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
          
          <div className="print:hidden text-center mt-10">
            <p className="text-sm mb-2">Para guardar este documento como PDF:</p>
            <ol className="text-xs inline-block text-left mx-auto text-gray-600">
              <li>1. Presione Ctrl+P (Windows) o Cmd+P (Mac)</li>
              <li>2. Seleccione "Guardar como PDF" en las opciones de la impresora</li>
              <li>3. Ajuste los márgenes si es necesario (recomendado: Ninguno)</li>
              <li>4. Haga clic en "Guardar" o "Imprimir"</li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex justify-center mt-0 mb-0">
              <div className="relative">
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="h-64 max-w-full object-contain" />
                ) : (
                  <div 
                    onClick={triggerLogoUpload} 
                    className="flex items-center justify-center h-40 w-80 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
                  >
                    <span className="text-xl text-gray-500">
                      + Añadir Logo
                    </span>
                  </div>
                )}
                {logoImage && (
                  <button 
                    onClick={() => setLogoImage(null)}
                    className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xl"
                  >
                    ×
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Información General
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Día"
                name="dia"
                value={formData.dia}
                onChange={handleChange}
                placeholder="Día"
              />
              <Input
                label="Mes"
                name="mes"
                value={formData.mes}
                onChange={handleChange}
                placeholder="Mes"
              />
              <Input
                label="Año"
                name="ano"
                value={formData.ano}
                onChange={handleChange}
                placeholder="Año"
              />
            </div>
            
            <Input
              label="Título de la Canción"
              name="tituloCancion"
              value={formData.tituloCancion}
              onChange={handleChange}
              placeholder="Título de la canción"
            />
            
            <Input
              label="Nombre del Intérprete"
              name="nombreInterprete"
              value={formData.nombreInterprete}
              onChange={handleChange}
              placeholder="Nombre del intérprete"
            />
            
            <Input
              label="País"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              placeholder="País"
            />
            
            <Input
              label="Nombre de la Disquera/Sello/Propietario"
              name="nombreDisquera"
              value={formData.nombreDisquera}
              onChange={handleChange}
              placeholder="Nombre de la disquera/sello"
            />
            
            <Input
              label="Nombre del Propietario Principal"
              name="nombrePropietario"
              value={formData.nombrePropietario}
              onChange={handleChange}
              placeholder="Nombre del propietario principal"
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Información de Compositor #1
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre Completo"
                name="nombreCompleto1"
                value={formData.nombreCompleto1}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
              
              <Input
                label="Nombre Artístico"
                name="nombreArtistico1"
                value={formData.nombreArtistico1}
                onChange={handleChange}
                placeholder="Nombre artístico"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Número IPI"
                name="ipiNumero1"
                value={formData.ipiNumero1}
                onChange={handleChange}
                placeholder="Número IPI"
              />
              
              <Input
                label="Porcentaje (%)"
                name="porcentaje1"
                value={formData.porcentaje1}
                onChange={handleChange}
                placeholder="Porcentaje"
                type="text"
              />
            </div>
            
            <Input
              label="Sociedad de Gestión"
              name="sociedadGestion1"
              value={formData.sociedadGestion1}
              onChange={handleChange}
              placeholder="Sociedad de gestión"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="IPI Editorial"
                name="ipiEditorial1"
                value={formData.ipiEditorial1}
                onChange={handleChange}
                placeholder="IPI Editorial"
              />
              
              <Input
                label="Editorial"
                name="editorial1"
                value={formData.editorial1}
                onChange={handleChange}
                placeholder="Editorial"
              />
            </div>
            
            <Input
              label="Rol"
              name="rol1"
              value={formData.rol1}
              onChange={handleChange}
              placeholder="Rol (ej. Cantante, Productor, etc.)"
            />
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Información de Compositor #2
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre Completo"
                name="nombreCompleto2"
                value={formData.nombreCompleto2}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
              
              <Input
                label="Nombre Artístico"
                name="nombreArtistico2"
                value={formData.nombreArtistico2}
                onChange={handleChange}
                placeholder="Nombre artístico"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Número IPI"
                name="ipiNumero2"
                value={formData.ipiNumero2}
                onChange={handleChange}
                placeholder="Número IPI"
              />
              
              <Input
                label="Porcentaje (%)"
                name="porcentaje2"
                value={formData.porcentaje2}
                onChange={handleChange}
                placeholder="Porcentaje"
                type="text"
              />
            </div>
            
            <Input
              label="Sociedad de Gestión"
              name="sociedadGestion2"
              value={formData.sociedadGestion2}
              onChange={handleChange}
              placeholder="Sociedad de gestión"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="IPI Editorial"
                name="ipiEditorial2"
                value={formData.ipiEditorial2}
                onChange={handleChange}
                placeholder="IPI Editorial"
              />
              
              <Input
                label="Editorial"
                name="editorial2"
                value={formData.editorial2}
                onChange={handleChange}
                placeholder="Editorial"
              />
            </div>
            
            <Input
              label="Rol"
              name="rol2"
              value={formData.rol2}
              onChange={handleChange}
              placeholder="Rol (ej. Cantante, Productor, etc.)"
            />
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Información de Compositor #3
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre Completo"
                name="nombreCompleto3"
                value={formData.nombreCompleto3}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
              
              <Input
                label="Nombre Artístico"
                name="nombreArtistico3"
                value={formData.nombreArtistico3}
                onChange={handleChange}
                placeholder="Nombre artístico"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Número IPI"
                name="ipiNumero3"
                value={formData.ipiNumero3}
                onChange={handleChange}
                placeholder="Número IPI"
              />
              
              <Input
                label="Porcentaje (%)"
                name="porcentaje3"
                value={formData.porcentaje3}
                onChange={handleChange}
                placeholder="Porcentaje"
                type="text"
              />
            </div>
            
            <Input
              label="Sociedad de Gestión"
              name="sociedadGestion3"
              value={formData.sociedadGestion3}
              onChange={handleChange}
              placeholder="Sociedad de gestión"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="IPI Editorial"
                name="ipiEditorial3"
                value={formData.ipiEditorial3}
                onChange={handleChange}
                placeholder="IPI Editorial"
              />
              
              <Input
                label="Editorial"
                name="editorial3"
                value={formData.editorial3}
                onChange={handleChange}
                placeholder="Editorial"
              />
            </div>
            
            <Input
              label="Rol"
              name="rol3"
              value={formData.rol3}
              onChange={handleChange}
              placeholder="Rol (ej. Cantante, Productor, etc.)"
            />
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Información de Compositor #4
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre Completo"
                name="nombreCompleto4"
                value={formData.nombreCompleto4}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
              
              <Input
                label="Nombre Artístico"
                name="nombreArtistico4"
                value={formData.nombreArtistico4}
                onChange={handleChange}
                placeholder="Nombre artístico"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Número IPI"
                name="ipiNumero4"
                value={formData.ipiNumero4}
                onChange={handleChange}
                placeholder="Número IPI"
              />
              
              <Input
                label="Porcentaje (%)"
                name="porcentaje4"
                value={formData.porcentaje4}
                onChange={handleChange}
                placeholder="Porcentaje"
                type="text"
              />
            </div>
            
            <Input
              label="Sociedad de Gestión"
              name="sociedadGestion4"
              value={formData.sociedadGestion4}
              onChange={handleChange}
              placeholder="Sociedad de gestión"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="IPI Editorial"
                name="ipiEditorial4"
                value={formData.ipiEditorial4}
                onChange={handleChange}
                placeholder="IPI Editorial"
              />
              
              <Input
                label="Editorial"
                name="editorial4"
                value={formData.editorial4}
                onChange={handleChange}
                placeholder="Editorial"
              />
            </div>
            
            <Input
              label="Rol"
              name="rol4"
              value={formData.rol4}
              onChange={handleChange}
              placeholder="Rol (ej. Cantante, Productor, etc.)"
            />
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Autores y Compositores
            </h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-700">
                Autores de Letra
              </h3>
              <div className="space-y-3">
                <Input
                  label="Autor de Letra #1"
                  name="autoresLetra1"
                  value={formData.autoresLetra1}
                  onChange={handleChange}
                  placeholder="Nombre del autor"
                />
                
                <Input
                  label="Autor de Letra #2"
                  name="autoresLetra2"
                  value={formData.autoresLetra2}
                  onChange={handleChange}
                  placeholder="Nombre del autor"
                />
                
                <Input
                  label="Autor de Letra #3"
                  name="autoresLetra3"
                  value={formData.autoresLetra3}
                  onChange={handleChange}
                  placeholder="Nombre del autor"
                />
                
                <Input
                  label="Autor de Letra #4"
                  name="autoresLetra4"
                  value={formData.autoresLetra4}
                  onChange={handleChange}
                  placeholder="Nombre del autor"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">
                Compositores de Música
              </h3>
              <div className="space-y-3">
                <Input
                  label="Compositor de Música #1"
                  name="compositoresMusica1"
                  value={formData.compositoresMusica1}
                  onChange={handleChange}
                  placeholder="Nombre del compositor"
                />
                
                <Input
                  label="Compositor de Música #2"
                  name="compositoresMusica2"
                  value={formData.compositoresMusica2}
                  onChange={handleChange}
                  placeholder="Nombre del compositor"
                />
                
                <Input
                  label="Compositor de Música #3"
                  name="compositoresMusica3"
                  value={formData.compositoresMusica3}
                  onChange={handleChange}
                  placeholder="Nombre del compositor"
                />
                
                <Input
                  label="Compositor de Música #4"
                  name="compositoresMusica4"
                  value={formData.compositoresMusica4}
                  onChange={handleChange}
                  placeholder="Nombre del compositor"
                />
              </div>
            </div>
          </div>
        );
      
      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              División del Máster
            </h2>
            
            <div className="p-4 bg-blue-50 border-blue-200 border rounded mb-4">
              <p className="text-sm">Esta sección define cómo se repartirán los ingresos por la explotación del máster, que puede ser diferente a la división de derechos de composición.</p>
            </div>
            
            <div className="space-y-5">
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-2 text-gray-700">
                  Colaborador #1
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="Nombre Completo"
                      name="colaboradorMaster1"
                      value={formData.colaboradorMaster1}
                      onChange={handleChange}
                      placeholder="Nombre del colaborador"
                    />
                  </div>
                  <Input
                    label="Porcentaje (%)"
                    name="porcentajeMaster1"
                    value={formData.porcentajeMaster1}
                    onChange={handleChange}
                    placeholder="Porcentaje"
                    type="text"
                  />
                </div>
                <div className="mt-2">
                  <Input
                    label="Rol"
                    name="rolMaster1"
                    value={formData.rolMaster1}
                    onChange={handleChange}
                    placeholder="Rol (ej. Cantante, Productor, etc.)"
                  />
                </div>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-2 text-gray-700">
                  Colaborador #2
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="Nombre Completo"
                      name="colaboradorMaster2"
                      value={formData.colaboradorMaster2}
                      onChange={handleChange}
                      placeholder="Nombre del colaborador"
                    />
                  </div>
                  <Input
                    label="Porcentaje (%)"
                    name="porcentajeMaster2"
                    value={formData.porcentajeMaster2}
                    onChange={handleChange}
                    placeholder="Porcentaje"
                    type="text"
                  />
                </div>
                <div className="mt-2">
                  <Input
                    label="Rol"
                    name="rolMaster2"
                    value={formData.rolMaster2}
                    onChange={handleChange}
                    placeholder="Rol (ej. Cantante, Productor, etc.)"
                  />
                </div>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-2 text-gray-700">
                  Colaborador #3
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="Nombre Completo"
                      name="colaboradorMaster3"
                      value={formData.colaboradorMaster3}
                      onChange={handleChange}
                      placeholder="Nombre del colaborador"
                    />
                  </div>
                  <Input
                    label="Porcentaje (%)"
                    name="porcentajeMaster3"
                    value={formData.porcentajeMaster3}
                    onChange={handleChange}
                    placeholder="Porcentaje"
                    type="text"
                  />
                </div>
                <div className="mt-2">
                  <Input
                    label="Rol"
                    name="rolMaster3"
                    value={formData.rolMaster3}
                    onChange={handleChange}
                    placeholder="Rol (ej. Cantante, Productor, etc.)"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 text-gray-700">
                  Colaborador #4
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="Nombre Completo"
                      name="colaboradorMaster4"
                      value={formData.colaboradorMaster4}
                      onChange={handleChange}
                      placeholder="Nombre del colaborador"
                    />
                  </div>
                  <Input
                    label="Porcentaje (%)"
                    name="porcentajeMaster4"
                    value={formData.porcentajeMaster4}
                    onChange={handleChange}
                    placeholder="Porcentaje"
                    type="text"
                  />
                </div>
                <div className="mt-2">
                  <Input
                    label="Rol"
                    name="rolMaster4"
                    value={formData.rolMaster4}
                    onChange={handleChange}
                    placeholder="Rol (ej. Cantante, Productor, etc.)"
                  />
                </div>
              </div>
            </div>
            
            {/* Total de porcentajes del máster */}
            {(() => {
              const totalPorcentajeMaster = [
                Number(formData.porcentajeMaster1) || 0,
                Number(formData.porcentajeMaster2) || 0,
                Number(formData.porcentajeMaster3) || 0,
                Number(formData.porcentajeMaster4) || 0
              ].reduce((sum, value) => sum + value, 0);
              
              return (
                <div className="mt-6 p-4 rounded bg-gray-100">
                  <div className="flex justify-between items-center">
                    <p className="font-bold">Total del Máster:</p>
                    <p className={`font-bold ${totalPorcentajeMaster === 100 ? 'text-green-500' : 'text-red-500'}`}>
                      {totalPorcentajeMaster}%
                    </p>
                  </div>
                  
                  {totalPorcentajeMaster !== 100 && (
                    <p className="text-xs text-red-500 mt-2">
                      <strong>Importante:</strong> La suma de porcentajes debe ser exactamente 100%.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        );
      
      case 8:
        // Calcular el porcentaje total para mostrar en la vista previa
        const totalPorcentaje = [
          Number(formData.porcentaje1) || 0,
          Number(formData.porcentaje2) || 0,
          Number(formData.porcentaje3) || 0,
          Number(formData.porcentaje4) || 0
        ].reduce((sum, value) => sum + value, 0);
        
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Vista Previa
            </h2>
            
            <div className="p-4 bg-blue-50 border-blue-200 border rounded transition-colors duration-300">
              <p>Has completado todos los campos necesarios para el Split Sheet.</p>
              <p className="mt-2">Revisa la información y si todo está correcto, haz clic en "Generar Vista Previa" para ver el documento.</p>
            </div>
            
            {/* Logo Preview */}
            <div className="p-4 rounded bg-gray-50 transition-colors duration-300">
              <h3 className="font-medium mb-2 text-gray-700">
                Logo:
              </h3>
              <div className="flex items-center">
                {logoImage ? (
                  <div className="h-16 overflow-hidden">
                    <img src={logoImage} alt="Logo" className="h-16 object-contain" />
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No se ha subido logo</p>
                )}
                <button 
                  onClick={triggerLogoUpload}
                  className="ml-4 px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                >
                  {logoImage ? 'Cambiar' : 'Subir'}
                </button>
              </div>
            </div>
            
            <div className="p-4 rounded bg-gray-50 transition-colors duration-300">
              <h3 className="font-medium mb-2 text-gray-700">
                Información General:
              </h3>
              <p><strong>Título:</strong> {formData.tituloCancion || "[No especificado]"}</p>
              <p><strong>Intérprete:</strong> {formData.nombreInterprete || "[No especificado]"}</p>
              <p><strong>Fecha:</strong> {formData.dia || "[Día]"}/{formData.mes || "[Mes]"}/{formData.ano || "[Año]"}</p>
            </div>
            
          <div className="p-4 pt-0 rounded bg-gray-50 transition-colors duration-300">
              <h3 className="font-medium mb-2 text-gray-700">
                Colaboradores:
              </h3>
              {formData.nombreCompleto1 && (
                <div className="flex justify-between items-center mb-1">
                  <p><strong>{formData.nombreCompleto1}:</strong></p>
                  <p>{formData.porcentaje1 || "0"}%</p>
                </div>
              )}
              {formData.nombreCompleto2 && (
                <div className="flex justify-between items-center mb-1">
                  <p><strong>{formData.nombreCompleto2}:</strong></p>
                  <p>{formData.porcentaje2 || "0"}%</p>
                </div>
              )}
              {formData.nombreCompleto3 && (
                <div className="flex justify-between items-center mb-1">
                  <p><strong>{formData.nombreCompleto3}:</strong></p>
                  <p>{formData.porcentaje3 || "0"}%</p>
                </div>
              )}
              {formData.nombreCompleto4 && (
                <div className="flex justify-between items-center mb-1">
                  <p><strong>{formData.nombreCompleto4}:</strong></p>
                  <p>{formData.porcentaje4 || "0"}%</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 mt-2 font-bold border-t border-gray-300">
                <p>Total:</p>
                <p className={totalPorcentaje === 100 ? 'text-green-500' : 'text-red-500'}>
                  {totalPorcentaje}%
                </p>
              </div>
              
              {totalPorcentaje !== 100 && (
                <p className="text-xs text-red-500 mt-2">
                  <strong>Importante:</strong> La suma de porcentajes debe ser exactamente 100%.
                </p>
              )}
            </div>
            
            <button 
              onClick={generatePreview}
              className="w-full py-3 px-4 rounded font-medium transition-colors duration-300 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Generar Vista Previa
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (showPreview) {
    return <DocumentPreview />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-100 text-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Editor de Split Sheet</h1>
            <p className="text-gray-600">
              Completa el formulario para generar tu documento
            </p>
          </div>
        </div>
        
        <div className="mb-6 bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          ></div>
        </div>
        
        <div className="mb-2 flex justify-between text-sm">
          <span className={currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}>
            General
          </span>
          <span className={currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}>
            Compositores
          </span>
          <span className={currentStep >= 6 ? 'text-blue-600' : 'text-gray-500'}>
            Créditos
          </span>
          <span className={currentStep >= 8 ? 'text-blue-600' : 'text-gray-500'}>
            Finalizar
          </span>
        </div>
        
        <div className="bg-white shadow-lg p-6 rounded-lg mb-6 transition-colors duration-300">
          {renderStep()}
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={prevStep}
            className={`px-6 py-2 rounded border transition-colors ${
              currentStep === 1 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            disabled={currentStep === 1}
          >
            Anterior
          </button>
          
          {currentStep < 8 ? (
            <button 
              onClick={nextStep}
              className="px-6 py-2 rounded transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              Siguiente
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SplitSheetEditor;