import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateEvent, getEventById } from '../../api/eventApi';
import FloatingLabel from './FloatingLabel';

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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
          onClick={() => onClose()}
        >×</button>
        <h2 className="text-xl font-bold mb-4 text-orange-600">Modifica evento</h2>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Caricamento dettagli...</div>
        ) : (
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-2 w-full">
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
              <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded font-semibold hover:bg-orange-600 transition">Salva</button>
              <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition" onClick={onClose}>Annulla</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
