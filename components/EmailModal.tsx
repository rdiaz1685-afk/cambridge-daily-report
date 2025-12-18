import React, { useState } from 'react';
import { NeonButton } from './NeonButton';
import { X, Copy, Mail, Check } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail: string;
  subject: string;
  htmlContent: string; // For clipboard (Rich Text)
  textContent: string; // For preview/fallback
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  defaultEmail,
  subject,
  htmlContent,
  textContent
}) => {
  const [recipient, setRecipient] = useState(defaultEmail);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      const type = "text/html";
      const blob = new Blob([htmlContent], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      await navigator.clipboard.write(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback to text
      navigator.clipboard.writeText(textContent);
      setCopied(true);
    }
  };

  const handleOpenGmail = () => {
    // Open Gmail Compose Window with recipient and subject filled
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}`;
    window.open(gmailUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161622] border border-cyan-500/50 w-full max-w-2xl rounded-2xl shadow-[0_0_30px_rgba(0,243,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#0a0a12]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" /> Preparar Correo
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Recipient Input */}
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">Enviar a (Correo):</label>
            <input 
              type="email" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-cyan-400 outline-none font-mono"
            />
          </div>

          {/* Preview Area (Shows plain text representation for the user to see, but copies HTML) */}
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">Vista Previa del Mensaje:</label>
            <div className="bg-gray-100 text-gray-800 p-4 rounded-lg text-sm h-64 overflow-y-auto font-sans whitespace-pre-wrap border border-gray-600">
               {/* We render a simplified version here just for preview, 
                   but the 'Copy' button uses the Rich HTML */}
               <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              * El contenido tiene formato de colores pastel para copiar y pegar.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 bg-[#0a0a12] flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopy}
            className={`flex-1 py-3 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
            {copied ? 'Copiado!' : '1. Copiar Formato'}
          </button>

          <NeonButton 
            onClick={handleOpenGmail} 
            variant="blue" 
            className="flex-1"
          >
            2. Abrir Gmail y Pegar
          </NeonButton>
        </div>
      </div>
    </div>
  );
};