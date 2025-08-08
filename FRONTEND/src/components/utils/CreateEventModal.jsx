// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useState, useReducer, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createEvent } from '../../api/eventApi';
import FloatingLabel from './FloatingLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faCalendar, faUsers, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import '../../styles/modal-animations.css';

// Stato iniziale del form
const initialState = {
  title: '',
  description: '',
  datetime: '',
  maxplayers: 10,
  isprivate: false
};

// Reducer per gestire lo stato del form
function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function CreateEventModal({ court, onClose, onEventCreated }) {
  const { accessToken, user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const [minDateTime, setMinDateTime] = useState('');

  useEffect(() => {
    // Imposta la data minima come oggi, formattata per l'input datetime-local
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    setMinDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validazione frontend
    if (!state.title.trim()) {
      setError("Il titolo è obbligatorio");
      return;
    }

    if (!state.datetime) {
      setError("Data e ora sono obbligatorie");
      return;
    }

    const selectedDate = new Date(state.datetime);
    const now = new Date();
    if (selectedDate <= now) {
      setError("La data dell'evento non può essere nel passato");
      return;
    }

    const maxPlayers = Number(state.maxplayers);
    if (isNaN(maxPlayers) || maxPlayers < 2) {
      setError("Il numero massimo di giocatori deve essere almeno 2");
      return;
    }

    setLoading(true);

    try {
      // Preparazione dei dati per l'API
      const eventData = {
        title: state.title.trim(),
        description: state.description.trim(),
        court: court._id,
        datetime: state.datetime,
        maxplayers: maxPlayers,
        isprivate: state.isprivate,
        // Il creator viene impostato automaticamente dal backend tramite il token
      };
      
      // Chiamata API per creare l'evento
      const result = await createEvent(eventData, { accessToken });
      
      // Emetti un evento personalizzato per il refresh a livello documento
      document.dispatchEvent(new CustomEvent('event-created', { 
        detail: { eventId: result._id }
      }));
        // Notifica il componente padre del successo
      if (typeof onEventCreated === 'function') {
        onEventCreated(result);
      }
      
      // Piccolo delay per mostrare lo stato di successo prima di chiudere
      setTimeout(() => {
        dispatch({ type: 'RESET' });
        onClose();
      }, 300);
    } catch (err) {
      setError(err.message || "Errore durante la creazione dell'evento");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-overlay">
      <div className="bg-white rounded-lg shadow-xl sm:w-11/12 md:w-full max-w-md p-6 relative max-h-[90vh] md:mt-12 animate-modal-bounce">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
          disabled={loading}>
          <FontAwesomeIcon icon={faClose} className="text-xl" />
        </button>
        
        <h2 className="text-2xl text-orange-600 font-semibold mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendar} />
          Crea Evento
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className='!mb-2'>
          <div className="space-y-4">            
            <FloatingLabel
              id="event-title"
              type="text"
              label="Titolo evento *"
              value={state.title}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })}
              disabled={loading}
            />
            
            <FloatingLabel
              id="event-description"
              type="text"
              label="Descrizione"
              value={state.description}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
              disabled={loading}
              asTextarea={true}
              rows={5}
            />
            
            <div className="mb-4">
              <label htmlFor="event-datetime" className="block text-sm font-medium text-gray-700 mb-1">
                Data e ora *
              </label>              
              <input
                id="event-datetime"
                type="datetime-local"
                className="block w-full p-2 border border-gray-300 rounded"
                min={minDateTime}
                value={state.datetime}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'datetime', value: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            
            <FloatingLabel
              id="event-maxplayers"
              type="number"
              label="Numero massimo di giocatori *"
              value={state.maxplayers}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'maxplayers', value: e.target.value })}
              min="2"
              disabled={loading}
            />
            
            <div className="flex items-center gap-2 mt-4">
              <input
              id="event-isprivate"              
              type="checkbox"
              checked={state.isprivate}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'isprivate', value: e.target.checked })}
              className="w-4 h-4 text-orange-600"
              disabled={loading}
              />
              <label htmlFor="event-isprivate" className="text-gray-700 flex items-center gap-2">
                {state.isprivate ? (
                  <>
                    <FontAwesomeIcon icon={faLock} className="text-orange-600" />
                    Evento privato
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLockOpen} className="text-green-600" />
                    Evento pubblico
                  </>
                )}
              </label>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              <p>Campetto: <span className="font-semibold">{court.name}</span></p>
              <p>Organizzatore: <span className="font-semibold">{user?.username || 'Tu'}</span></p>
            </div>
          </div>
            <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md shadow-sm mr-2 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              Annulla
            </button>            
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md shadow-sm hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-[130px] h-[40px] cursor-pointer"              
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creazione...
                </span>
              ) : 'Crea Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
