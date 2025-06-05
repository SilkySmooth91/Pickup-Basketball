import { getEventById as apiGetEventById } from '../../api/eventApi';

/**
 * Recupera i dettagli completi di un evento, includendo i dati degli utenti partecipanti
 * @param {string} eventId - ID dell'evento
 * @param {Object} auth - Dati di autenticazione
 * @returns {Promise} Promise che risolve con i dati completi dell'evento
 */
export async function getEventWithUserDetails(eventId, auth) {
  const eventData = await apiGetEventById(eventId, auth);
  
  if (!eventData) return null;
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Raccoglie tutti gli ID utente unici
    const userIds = new Set([
      eventData.creator, 
      ...(eventData.participants || [])
    ].filter(Boolean));
    
    // Recupera i dettagli per ogni utente
    const userDetailsPromises = Array.from(userIds).map(userId => 
      fetch(`${API_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      }).then(res => {
        if (!res.ok) throw new Error(`Errore nel recupero utente ${userId}`);
        return res.json();
      })
    );
    
    const usersData = await Promise.all(userDetailsPromises);
    
    // Crea una mappa di ID utente -> dettagli utente
    const usersMap = usersData.reduce((map, user) => {
      map[user._id] = user;
      return map;
    }, {});
    

    const populateEvent = {
      ...eventData,
      creator: usersMap[eventData.creator] || { _id: eventData.creator },
      participants: (eventData.participants || []).map(participantId => 
        usersMap[participantId] || { _id: participantId }
      )
    };
    
    return populateEvent;
  } catch (error) {
    console.error('Errore nel recupero dettagli utenti:', error);
    return eventData;
  }
}
