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

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateEvent, getEventById } from '../../api/eventApi';
import FloatingLabel from './FloatingLabel';
import LoadingSpinner from './LoadingSpinner';
import '../../styles/modal-animations.css';

export default function EditEventModal({ eventId, isOpen, onClose, onEventUpdated }) {
  const { accessToken } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    datetime: '',
    maxplayers: '',
    isprivate: false
  });
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getEventById(eventId, { accessToken })
      .then(data => {
        setEvent(data);
        setEditForm({
          title: data.title || '',
          description: data.description || '',
          datetime: data.datetime ? data.datetime.slice(0, 16) : '',
          maxplayers: data.maxplayers || '',
          isprivate: !!data.isprivate
        });
      })
      .catch(() => setEditError("Errore nel caricamento dell'evento"))
      .finally(() => setLoading(false));
  }, [eventId, accessToken, isOpen]);

  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    setEditForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditError(null);
    try {
      // Dopo updateEvent, refetch completo dei dati evento
      await updateEvent(eventId, {
        ...editForm,
        maxplayers: Number(editForm.maxplayers)
      }, { accessToken });
      const refetched = await getEventById(eventId, { accessToken });
      if (onEventUpdated) onEventUpdated(refetched);
      onClose(refetched); // Passa l'evento AGGIORNATO E COMPLETO alla chiusura
    } catch (err) {
      setEditError(err.message || "Errore durante l'aggiornamento dell'evento");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-overlay">
      <div className="bg-white rounded-lg shadow-xl sm:w-11/12 md:w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto animate-modal-bounce">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
          onClick={() => onClose()}
        >×</button>        
        <h2 className="text-xl font-bold mb-4 text-orange-600">Modifica evento</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-2 w-full !mb-2">
            <FloatingLabel
              id="edit-title"
              type="text"
              label="Titolo evento"
              value={editForm.title}
              onChange={e => handleEditChange({ target: { name: 'title', value: e.target.value, type: 'text' } })}
            />
            <FloatingLabel
              id="edit-description"
              asTextarea
              label="Descrizione"
              value={editForm.description}
              onChange={e => handleEditChange({ target: { name: 'description', value: e.target.value, type: 'textarea' } })}
              rows={3}
            />
            <FloatingLabel
              id="edit-datetime"
              type="datetime-local"
              label="Data e ora"
              value={editForm.datetime}
              onChange={e => handleEditChange({ target: { name: 'datetime', value: e.target.value, type: 'datetime-local' } })}
            />
            <FloatingLabel
              id="edit-maxplayers"
              type="number"
              label="Numero massimo giocatori"
              value={editForm.maxplayers}
              onChange={e => handleEditChange({ target: { name: 'maxplayers', value: e.target.value, type: 'number' } })}
            />
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                name="isprivate"
                checked={editForm.isprivate}
                onChange={handleEditChange}
                className="accent-orange-600"
              />
              Evento privato
            </label>
            {editError && <div className="text-red-500 text-sm mb-2">{editError}</div>}
            <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md shadow-sm hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[40px] cursor-pointer"              
              disabled={loading}
            >
              Salva
            </button>
              <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition cursor-pointer" onClick={onClose}>Annulla</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
