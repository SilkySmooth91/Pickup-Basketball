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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSentFriendRequests } from '../api/friendApi';

const FriendRequestContext = createContext();

export function useFriendRequests() {
  return useContext(FriendRequestContext);
}

export function FriendRequestProvider({ children }) {
  const { accessToken, user } = useAuth();
  const [sentRequests, setSentRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(new Set());
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [loading, setLoading] = useState(false);

  // Carica le richieste inviate - ora stabilizzata con useCallback
  const loadSentRequests = useCallback(async (force = false) => {    
    // Non caricare se non c'è un utente autenticato
    if (!user || !accessToken) {
      return;
    }

    // Non ricaricare i dati se l'ultima richiesta è stata fatta meno di 10 secondi fa
    // a meno che non sia forzata
    const now = Date.now();
    if (!force && now - lastFetchTime < 10000 && sentRequests.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const requests = await getSentFriendRequests({ accessToken });
      // Estrai gli ID degli utenti a cui sono state inviate richieste
      const sentRequestIds = requests.map(req => req.to._id || req.to);
      setSentRequests(sentRequestIds);
      setLastFetchTime(now);    } 
      catch (err) {
      // Gestione silenziosa degli errori
    } finally {
      setLoading(false);
    }
  }, [accessToken, user, lastFetchTime, sentRequests]);

  // Carica le richieste all'avvio e quando cambia l'utente
  useEffect(() => {
    loadSentRequests();
  }, [accessToken, user, loadSentRequests]);

  // Aggiungi una richiesta in corso
  const addPendingRequest = useCallback((userId) => {
    setPendingRequests(prev => new Set([...prev, userId]));
  }, []);

  // Rimuovi una richiesta in corso
  const removePendingRequest = useCallback((userId) => {
    setPendingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  // Aggiungi una richiesta completata
  const addSentRequest = useCallback((userId) => {
    if (!sentRequests.includes(userId)) {
      setSentRequests(prev => [...prev, userId]);
    }
  }, [sentRequests]);

  // Verifica se una richiesta è stata inviata
  const isRequestSent = useCallback((userId) => {
    return sentRequests.includes(userId);
  }, [sentRequests]);

  // Verifica se una richiesta è in corso
  const isRequestPending = useCallback((userId) => {
    return pendingRequests.has(userId);
  }, [pendingRequests]);

  const value = {
    sentRequests,
    pendingRequests,
    loading,
    loadSentRequests,
    addPendingRequest,
    removePendingRequest,
    addSentRequest,
    isRequestSent,
    isRequestPending
  };

  return (
    <FriendRequestContext.Provider value={value}>
      {children}
    </FriendRequestContext.Provider>
  );
}
