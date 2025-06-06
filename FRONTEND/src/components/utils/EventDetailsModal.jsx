import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faCalendarAlt, faLock, faLockOpen, faPen, faUserPlus, faUserMinus, faUsers, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { joinEvent, leaveEvent } from '../../api/eventApi';
import { getEventWithUserDetails } from './EventDetailsModalService';
import { useNavigate } from 'react-router-dom';

export default function EventDetailsModal({ eventId, onClose, onEventUpdated }) {
  const { user, accessToken } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  // Verifica se l'utente corrente è il creatore dell'evento
  const isCreator = user && event?.creator?._id === user.id;
  
  // Verifica se l'utente corrente partecipa all'evento
  const isParticipant = user && event?.participants?.some(p => p._id === user.id);
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const eventData = await getEventWithUserDetails(eventId, { accessToken });
        setEvent(eventData);
      } catch (err) {
        setError("Errore nel caricamento dei dettagli dell'evento");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [eventId, accessToken]);
  const handleParticipation = async () => {
    if (!event || actionLoading) return;
    
    setActionLoading(true);
    
    try {
      const action = isParticipant ? leaveEvent : joinEvent;
      const result = await action(event._id, { accessToken });
      
      // Recupera i dati completi aggiornati dopo la partecipazione/annullamento
      const updatedEvent = await getEventWithUserDetails(event._id, { accessToken });
      
      // Aggiorna i dati dell'evento nel componente
      setEvent(updatedEvent);
      
      // Notifica il componente padre che l'evento è stato aggiornato
      if (typeof onEventUpdated === 'function') {
        onEventUpdated(updatedEvent);
      }
    } catch (err) {
      console.error(err);
      setError(isParticipant 
        ? "Errore durante l'annullamento della partecipazione" 
        : "Errore durante l'iscrizione all'evento");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faClose} className="text-xl" />
        </button>
        
        {loading ? (
          <div className="py-10 text-center text-gray-500">Caricamento dettagli...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">{error}</div>
        ) : event ? (
          <>
            <div className="flex items-center gap-2 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon 
                  icon={event.isprivate ? faLock : faLockOpen} 
                  className={event.isprivate ? "text-orange-600" : "text-green-600"} 
                />
                <h2 className="text-2xl text-orange-600 font-semibold">{event.title}</h2>
              </div>
              <button
                className="ml-2 mr-2 px-3 py-2 rounded-md bg-gradient-to-r from-orange-400 to-red-500 text-white shadow transition hover:scale-105 hover:from-orange-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                title="Dettagli evento"
                aria-label="Dettagli evento"
                onClick={() => navigate(`/events/${event._id}`)}>
                <FontAwesomeIcon icon={faCircleInfo} className="text-lg" />
              </button>
            </div>
            
            <div className="text-gray-600 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-500" />
              <span>{formatDate(event.datetime)}</span>
            </div>
            
            {event.description && (
              <div className="bg-orange-50 p-3 rounded-md mb-4 text-gray-700">
                {event.description}
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-orange-500" />
                Partecipanti ({event.participants?.length || 0}/{event.maxplayers})
              </h3>              {event.participants?.length > 0 ? (
                <ul className="grid grid-cols-1 gap-2">
                  {event.participants.map(participant => (
                    <li 
                      key={participant._id} 
                      className={`flex items-center py-2 px-3 rounded ${participant._id === event.creator._id ? 'bg-orange-100' : 'bg-gray-100'} cursor-pointer hover:bg-orange-50 transition-colors`}
                      onClick={() => navigate(`/profile/${participant._id}`)}>
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-gray-200 flex-shrink-0">
                        <img 
                          src={participant.avatar || '/vite.svg'} 
                          alt={participant.username} 
                          className="w-full h-full object-cover"/>
                      </div>
                      <span className="font-medium">{participant.username}</span>
                      {participant._id === event.creator._id && (
                        <span className="ml-1 text-xs text-orange-600">(organizzatore)</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Nessun partecipante registrato</p>
              )}
            </div>
            
            <div className="border-t pt-4 mt-4 flex justify-end gap-2">
              {isCreator ? (
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition"
                  onClick={() => {/* TODO: Implementare funzionalità di modifica */}}
                >
                  <FontAwesomeIcon icon={faPen} />
                  Modifica
                </button>
              ) : (
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                    isParticipant 
                      ? 'bg-red-50 text-red-600 border border-red-600 hover:bg-red-100' 
                      : 'bg-green-50 text-green-600 border border-green-600 hover:bg-green-100'
                  }`}
                  onClick={handleParticipation}
                  disabled={actionLoading || (event.participants?.length >= event.maxplayers && !isParticipant)}
                >
                  <FontAwesomeIcon icon={isParticipant ? faUserMinus : faUserPlus} />
                  {actionLoading 
                    ? 'Attendere...' 
                    : isParticipant 
                      ? 'Annulla partecipazione' 
                      : 'Partecipa'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="py-10 text-center text-gray-500">Evento non trovato</div>
        )}
      </div>
    </div>
  );
}
