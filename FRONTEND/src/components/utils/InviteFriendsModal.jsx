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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSearch, faUserPlus, faCheck, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { getFriends, getRecentFriends, searchFriends, inviteFriendToEvent } from '../../api/friendApi';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';
import ImageWithFallback from './ImageWithFallback';
import '../../styles/modal-animations.css';

export default function InviteFriendsModal({ eventId, event, isOpen, onClose }) {
  const { user, accessToken, refresh, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(new Set());
  const [invitedFriends, setInvitedFriends] = useState(new Set()); // Nuovo state per tracciare gli invitati

  // Verifica se l'utente può invitare amici
  const canInvite = !event?.isprivate || (event?.creator?._id === user?.id);

  // Carica amici recenti o risultati ricerca
  useEffect(() => {
    if (!isOpen || !canInvite) return;
    
    // Reset dello stato invitati quando si riapre il modal
    setInvitedFriends(new Set());
    
    const loadFriends = async () => {
      setLoading(true);
      try {
        const auth = { accessToken, refresh, logout };
        
        // Per ora usiamo getFriends con fallback se le nuove API non esistono
        let data;
        if (searchQuery.trim()) {
          // Prova prima searchFriends, poi fallback su getFriends
          try {
            data = await searchFriends(searchQuery, auth);
          } catch (searchErr) {
            console.log('API searchFriends non disponibile, usando getFriends');
            const allFriends = await getFriends(user?.id, auth);
            // Filtra localmente per la ricerca
            data = allFriends.filter(friend => 
              friend.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
        } else {
          // Prova prima getRecentFriends, poi fallback su getFriends
          try {
            data = await getRecentFriends(auth);
          } catch (recentErr) {
            console.log('API getRecentFriends non disponibile, usando getFriends');
            const allFriends = await getFriends(user?.id, auth);
            // Prendi i primi 5 come "recenti"
            data = allFriends.slice(0, 5);
          }
        }
        
        setFriends(data || []);
      } catch (err) {
        console.error('Errore nel caricamento amici:', err);
        toast.error('Errore nel caricamento amici. Le API potrebbero non essere ancora implementate.');
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce per la ricerca
    const timer = setTimeout(loadFriends, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [isOpen, searchQuery, accessToken, refresh, logout, user?.id]);

  const handleInvite = async (friendId) => {
    if (inviting.has(friendId) || invitedFriends.has(friendId)) return;
    
    console.log('Tentativo invito:', { friendId, eventId });
    
    setInviting(prev => new Set(prev).add(friendId));
    try {
      await inviteFriendToEvent(friendId, eventId, { accessToken, refresh, logout });
      toast.success('Invito inviato con successo!');
      
      // Aggiungi l'amico alla lista degli invitati invece di rimuoverlo
      setInvitedFriends(prev => new Set(prev).add(friendId));
    } catch (err) {
      console.error('Errore invito dettagliato:', {
        message: err.message,
        friendId,
        eventId,
        stack: err.stack
      });
      
      // Gestione specifica per diversi tipi di errore
      if (err.message.includes('Richiesta non valida')) {
        toast.error('Parametri invito non validi. Riprova o contatta il supporto.');
      } else if (err.message.includes('già stato invitato') || err.message.includes('già partecipante')) {
        toast.warning('Questo amico è già stato invitato all\'evento o è già partecipante.');
        // Segna come invitato anche in questo caso
        setInvitedFriends(prev => new Set(prev).add(friendId));
      } else if (err.message.includes('non trovato')) {
        toast.error('Evento o amico non trovato.');
      } else if (err.message.includes('500') || err.message.includes('API')) {
        toast.error('Funzionalità di invito non ancora disponibile. API in sviluppo.');
      } else {
        toast.error(err.message || 'Errore nell\'invio dell\'invito');
      }
    } finally {
      setInviting(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  };

  if (!isOpen) return null;

  // Se l'utente non può invitare, mostra un messaggio informativo
  if (!canInvite) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-overlay">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-modal-bounce">
          <button 
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            onClick={onClose}>
            <FontAwesomeIcon icon={faClose} className="text-xl" />
          </button>
          
          <h2 className="text-xl font-bold mb-4 text-orange-600">Invita amici</h2>
          
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faLock} className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-600">
              Solo il creatore può invitare amici a questo evento privato.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-overlay">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative max-h-[85vh] overflow-hidden flex flex-col animate-modal-bounce">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}>
          <FontAwesomeIcon icon={faClose} className="text-xl" />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-orange-600">Invita amici</h2>
        
        {/* Messaggio informativo */}
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <p className="text-sm text-orange-700">
            <FontAwesomeIcon icon={faSearch} className="mr-2" />
            Invita i tuoi amici a partecipare a questo evento!
          </p>
        </div>
        
        {/* Barra di ricerca */}
        <div className="relative mb-4">
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          />
          <input
            type="text"
            placeholder="Cerca tra i tuoi amici..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Titolo sezione */}
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700">
            {searchQuery.trim() 
              ? `Risultati ricerca "${searchQuery.trim()}"` 
              : 'Amici recenti'}
            {!loading && friends.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({friends.length})</span>
            )}
          </h3>
        </div>

        {/* Lista amici */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" showText={false} />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery.trim() ? 'Nessun amico trovato' : 'Nessun amico recente'}
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map(friend => (
                <div key={friend._id} className="flex items-center justify-between p-3 hover:bg-orange-50 rounded-lg transition">
                  <div className="flex items-center gap-3">
                    <ImageWithFallback 
                      src={friend.avatar} 
                      alt={friend.username} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-orange-500" 
                    />
                    <span className="font-medium text-gray-700">{friend.username}</span>
                  </div>
                  
                  <button
                    onClick={() => handleInvite(friend._id)}
                    disabled={inviting.has(friend._id) || invitedFriends.has(friend._id)}
                    className={`px-3 py-2 text-sm rounded-md transition flex items-center gap-1 cursor-pointer ${
                      invitedFriends.has(friend._id)
                        ? 'bg-blue-100 text-blue-700 border border-blue-400'
                        : 'bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {inviting.has(friend._id) ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : invitedFriends.has(friend._id) ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        Invitato
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
                        Invita
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
