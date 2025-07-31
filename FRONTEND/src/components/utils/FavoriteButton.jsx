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
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { isCourtInFavorites, toggleCourtFavorite } from '../../api/favoritesApi';

/**
 * Componente pulsante per gestire i campetti preferiti
 * @param {string} courtId - ID del campetto
 * @param {string} courtName - Nome del campetto (per i messaggi)
 * @param {string} className - Classi CSS aggiuntive
 * @param {string} size - Dimensione dell'icona ('sm', 'md', 'lg')
 * @param {function} onFavoriteChange - Callback chiamato quando cambia lo stato (courtId, isFavorite)
 */
export default function FavoriteButton({ courtId, courtName, className = '', size = 'md', onFavoriteChange }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { user, accessToken, refresh, logout } = useAuth();

  // Crea l'oggetto auth
  const auth = { accessToken, refresh, logout };

  // Definisci le dimensioni delle icone
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  // Carica lo status iniziale
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!user || !accessToken || !courtId) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const favoriteStatus = await isCourtInFavorites(courtId, auth);
        setIsFavorite(favoriteStatus);
      } catch (error) {
        console.error('Errore nel caricamento status preferiti:', error);
        // Non mostrare toast per errori di caricamento iniziale
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadFavoriteStatus();
  }, [courtId, user, accessToken]);

  // Gestisce il click sulla stella
  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !accessToken) {
      toast.error('Devi essere autenticato per aggiungere ai preferiti');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const result = await toggleCourtFavorite(courtId, isFavorite, auth);
      
      setIsFavorite(result.isFavorite);
      
      // Chiama il callback se fornito
      if (onFavoriteChange) {
        onFavoriteChange(courtId, result.isFavorite);
      }
      
      // Mostra messaggio di successo
      const message = result.isFavorite 
        ? `${courtName} aggiunto ai preferiti!` 
        : `${courtName} rimosso dai preferiti`;
      
      toast.success(message);

    } catch (error) {
      console.error('Errore nel toggle preferiti:', error);
      
      // Gestione errori specifici
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        toast.error('Sessione scaduta. Effettua nuovamente l\'accesso.');
      } else if (error.message.includes('404')) {
        toast.error('Campetto non trovato');
      } else {
        toast.error(error.message || 'Errore nell\'aggiornamento dei preferiti');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Non renderizzare se l'utente non è autenticato
  if (!user) {
    return null;
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading || isInitialLoading}
      className={`
        transition-all duration-200 ease-in-out
        hover:scale-110 active:scale-95
        ${isLoading || isInitialLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        ${isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}
        ${sizeClasses[size]}
        ${className}
      `}
      title={
        isInitialLoading 
          ? 'Caricamento...' 
          : isFavorite 
            ? `Rimuovi ${courtName} dai preferiti` 
            : `Aggiungi ${courtName} ai preferiti`
      }
      aria-label={
        isFavorite 
          ? `Rimuovi ${courtName} dai preferiti` 
          : `Aggiungi ${courtName} ai preferiti`
      }
    >
      {isInitialLoading ? (
        // Icona di caricamento
        <FontAwesomeIcon 
          icon={faStarRegular} 
          className="animate-pulse opacity-50" 
        />
      ) : (
        <FontAwesomeIcon 
          icon={isFavorite ? faStarSolid : faStarRegular}
          className={isLoading ? 'animate-pulse' : ''}
        />
      )}
    </button>
  );
}
