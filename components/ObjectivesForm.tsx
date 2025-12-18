import React from 'react';

// This component has been deprecated and removed as per user request.
// Keeping the file placeholder to avoid import errors if referenced elsewhere, 
// though it should be safely deleted from the file system.

interface ObjectivesFormProps {
  onBack: () => void;
}

export const ObjectivesForm: React.FC<ObjectivesFormProps> = ({ onBack }) => {
  return (
    <div className="text-center p-8 text-gray-500">
      Componente eliminado.
      <button onClick={onBack} className="block mx-auto mt-4 text-cyan-400 underline">Volver</button>
    </div>
  );
};