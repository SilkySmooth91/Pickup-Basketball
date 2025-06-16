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
import { useAuth } from '../context/AuthContext';
import { updateLastSeenChangelog } from '../api/userApi';
import { CURRENT_CHANGELOG_VERSION } from '../data/changelog';

export function useChangelog() {
  const [showChangelog, setShowChangelog] = useState(false);
  const { user, accessToken, refresh, setUser } = useAuth();  // Controlla se deve mostrare il changelog al login
  useEffect(() => {
    if (user && user.lastSeenChangelog !== CURRENT_CHANGELOG_VERSION) {
      // Mostra il changelog se l'utente non ha visto l'ultima versione
      setShowChangelog(true);
    } else {
      setShowChangelog(false);
    }
  }, [user]);

  // Funzione per chiudere il changelog e aggiornare il backend
  const closeChangelog = async () => {
    if (user) {
      try {
        const userId = user.id || user._id;
        await updateLastSeenChangelog(userId, CURRENT_CHANGELOG_VERSION, { accessToken, refresh });
        
        // Aggiorna lo stato locale dell'utente
        const updatedUser = {
          ...user,
          lastSeenChangelog: CURRENT_CHANGELOG_VERSION
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setShowChangelog(false);
      } catch (error) {
        console.error('Errore nell\'aggiornamento del changelog:', error);
        // Anche se c'è un errore, chiudiamo il modal per non bloccare l'utente
        setShowChangelog(false);
      }
    }
  };

  return {
    showChangelog,
    closeChangelog
  };
}
