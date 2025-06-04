import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../context/fetchWithAuth';

export default function UpcomingEvents({ courtId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!courtId) return;
    setLoading(true);
    setError(null);
    fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/events/court/${courtId}?limit=100`, {}, { accessToken })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        // Filtra solo eventi futuri
        const now = new Date();
        const futureEvents = (data.events || []).filter(ev => new Date(ev.datetime) > now);
        setEvents(futureEvents);
      })
      .catch(() => setError('Errore nel recupero degli eventi'))
      .finally(() => setLoading(false));
  }, [courtId, accessToken]);

  return (
    <>
        <div className="bg-gradient-to-r from-orange-100 to-red-200 rounded-t-lg p-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-600" />
            Prossimi eventi
          </h3>
        </div>
        <div className="bg-white rounded-b-lg shadow p-4">
          {loading && <p>Caricamento eventi...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            events.length === 0 ? (
              <p className="text-gray-500">Non ci sono ancora eventi in programma</p>
            ) : (
              <ul className="divide-y divide-orange-100">
                {events.map(event => (
                  <li key={event._id} className="py-2">
                    <div className="font-semibold text-orange-700">{event.title}</div>
                    <div className="text-gray-600 text-sm">{new Date(event.datetime).toLocaleString()}</div>
                    {event.description && <div className="text-gray-500 text-xs mt-1">{event.description}</div>}
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
    </>
  );
}
