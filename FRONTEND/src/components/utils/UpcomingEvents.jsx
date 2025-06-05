import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../context/fetchWithAuth';
import EventDetailsModal from './EventDetailsModal';

export default function UpcomingEvents({ courtId, refreshTrigger }) {  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  const fetchEvents = async () => {
    if (!courtId) return;
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetchWithAuth(`${API_URL}/events/court/${courtId}?limit=100`, {}, { accessToken });
      if (!res.ok) throw new Error('Errore nel recupero degli eventi');
      
      const data = await res.json();
      // Filtra solo eventi futuri
      const now = new Date();
      const futureEvents = (data.events || []).filter(ev => new Date(ev.datetime) > now);
      // Ordina per data (dal più vicino al più lontano)
      futureEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
      setEvents(futureEvents);
    } catch (err) {
      setError('Errore nel recupero degli eventi');
    } finally {
      setLoading(false);
    }
  };  useEffect(() => {
    fetchEvents();
    
    // Aggiungi un event listener per il refresh globale
    const refreshListener = () => fetchEvents();
    document.addEventListener('event-created', refreshListener);
    
    const componentRef = document.querySelector('[data-component="upcoming-events"]');
    if (componentRef) {
      componentRef.addEventListener('refresh', refreshListener);
    }
    
    // Cleanup dei listener
    return () => {
      document.removeEventListener('event-created', refreshListener);
      if (componentRef) {
        componentRef.removeEventListener('refresh', refreshListener);
      }
    };
  }, [courtId, accessToken, refreshTrigger]);
  return (
    <div data-component="upcoming-events">
        <div className="bg-gradient-to-r from-orange-100 to-red-200 rounded-t-lg p-4">          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-600" />
            Prossimi eventi
            {loading && <span className="ml-2 text-sm text-orange-400">(Aggiornamento...)</span>}
          </h3>
        </div>
        <div className="bg-white rounded-b-lg shadow p-4">
          {loading && <p>Caricamento eventi...</p>}
          {error && <p className="text-red-500">{error}</p>}            {!loading && !error && (
            events.length === 0 ? (
              <p className="text-gray-500 py-2">Non ci sono ancora eventi in programma</p>
            ) : (
              <ul className="divide-y divide-orange-100">
                {events.map(event => (
                  <li 
                    key={event._id} 
                    className="py-3 hover:bg-orange-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEventId(event._id)}
                  >
                    <div className="font-semibold text-orange-700">{event.title}</div>
                    <div className="text-gray-600 text-sm">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-orange-500" />{' '}
                      {new Date(event.datetime).toLocaleString()}
                    </div>
                    {event.description && (
                      <div className="text-gray-500 text-xs mt-1">{event.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
        
        {selectedEventId && (
          <EventDetailsModal 
            eventId={selectedEventId}
            onClose={() => setSelectedEventId(null)}
            onEventUpdated={() => fetchEvents()}
          />
        )}
    </div>
  );
}
