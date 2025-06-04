import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../context/fetchWithAuth';
import FloatingLabel from './FloatingLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

export default function EditCourtModal({ court, onClose, onUpdate }) {
  const { accessToken } = useAuth();
  // Memorizziamo l'ID del campetto in una variabile separata per garantire che sia disponibile
  const courtId = court?._id;

  const [formData, setFormData] = useState({
    name: court?.name || '',
    address: court?.address || '',
    baskets: court?.baskets || 2,
    officialsize: court?.officialsize || false,
    nightlights: court?.nightlights || false
  });
  const [changedFields, setChangedFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
      // Traccia solo i campi che sono stati effettivamente modificati
    if (court && court[name] !== newValue) {
      setChangedFields(prev => ({
        ...prev,
        [name]: newValue
      }));
    } else {
      // Se il valore è tornato uguale all'originale, rimuovilo dai campi modificati
      setChangedFields(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Debug info
    console.log('Court object:', court);
    console.log('Court ID:', court?._id);

    // Se non ci sono campi modificati, chiudi semplicemente il modale
    if (Object.keys(changedFields).length === 0) {
      onClose();
      return;
    }    // Verifica che l'ID del campetto sia definito
    if (!courtId) {
      setError('ID del campetto mancante. Impossibile procedere con l\'aggiornamento.');
      setLoading(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetchWithAuth(
        `${API_URL}/courts/${courtId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changedFields) // Invia solo i campi modificati
        },
        { accessToken }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore durante l\'aggiornamento del campetto');
      }      const updatedCourt = await res.json();
      
      // Notifica il componente padre dell'aggiornamento
      onUpdate(updatedCourt);
      
      // Chiudi il modale - il componente padre si occuperà di fare un refresh completo
      onClose();
    } catch (err) {
      setError(err.message || 'Errore durante l\'aggiornamento del campetto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faClose} className="text-xl" />
        </button>
        
        <h2 className="text-2xl text-orange-600 font-semibold mb-4">Modifica campetto</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">            
            <FloatingLabel
              id="court-name"
              type="text"
              label="Nome campetto"
              value={formData.name}
              onChange={(e) => handleChange({...e, target: {...e.target, name: 'name'}})}
              required
            />
            
            <FloatingLabel
              id="court-address"
              type="text"
              label="Indirizzo"
              value={formData.address}
              onChange={(e) => handleChange({...e, target: {...e.target, name: 'address'}})}
              required
            />
            
            <FloatingLabel
              id="court-baskets"
              type="number"
              label="Numero di canestri"
              value={formData.baskets}
              onChange={(e) => handleChange({...e, target: {...e.target, name: 'baskets'}})}
              min="1"
              max="10"
              required
            />
            
            <div className="flex items-center gap-2 mt-4">
              <input
                id="court-officialsize"
                type="checkbox"
                name="officialsize"
                checked={formData.officialsize}
                onChange={handleChange}
                className="w-4 h-4 text-orange-600"
              />
              <label htmlFor="court-officialsize" className="text-gray-700">
                Dimensioni ufficiali
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="court-nightlights"
                type="checkbox"
                name="nightlights"
                checked={formData.nightlights}
                onChange={handleChange}
                className="w-4 h-4 text-orange-600"
              />
              <label htmlFor="court-nightlights" className="text-gray-700">
                Illuminazione notturna
              </label>
            </div>
          </div>
            <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md shadow-sm mr-2 hover:bg-gray-50"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md shadow-sm hover:from-orange-600 hover:to-red-600 transition-colors"
              disabled={loading || Object.keys(changedFields).length === 0}
            >
              {loading ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>
          
          {Object.keys(changedFields).length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Campi modificati: {Object.keys(changedFields).map(field => {
                const fieldNames = {
                  name: 'Nome',
                  address: 'Indirizzo',
                  baskets: 'N° canestri',
                  officialsize: 'Dimensioni ufficiali',
                  nightlights: 'Illuminazione'
                };
                return fieldNames[field] || field;
              }).join(', ')}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
