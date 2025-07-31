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

import React, { useState, useEffect } from "react";
import HeaderComp from "../components/utils/HeaderComp";
import { getUsers } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faCheck, faFilter, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { sendFriendRequest, getFriends } from "../api/friendApi";
import LoadingSpinner from "../components/utils/LoadingSpinner";
import ImageWithFallback from "../components/utils/ImageWithFallback";
import Footer from '../components/utils/Footer';
import { useFriendRequests } from "../context/FriendRequestContext";
import FloatingLabel from "../components/utils/FloatingLabel";
import { useAuthErrorHandler } from "../hooks/useAuthErrorHandler";

export default function SearchPlayersPage() {  
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const { handleAuthError } = useAuthErrorHandler();  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [friends, setFriends] = useState([]);
  
  // Usiamo il contesto globale per le richieste di amicizia
  const { 
    sentRequests, 
    pendingRequests, 
    addPendingRequest, 
    removePendingRequest,
    addSentRequest,
    isRequestSent,
    isRequestPending,
    loadSentRequests
  } = useFriendRequests();  useEffect(() => {
    // Cerca anche se non c'è query (per cercare solo per città)
    const shouldSearch = query.length >= 3 || cityFilter.length >= 2;
    
    if (!shouldSearch) {
      setResults([]);
      setError(null);
      return;
    }
    
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(async () => {
        setLoading(true);
        setError(null);          
        try {
          const data = await getUsers(1, 100, { accessToken });
          
          if (!data || !data.users || !Array.isArray(data.users)) {
            setResults([]);
            return;
          }

          const currentUserId = user?.id ? String(user.id) : user?._id ? String(user._id) : null;
          
          const filtered = data.users
            .filter(u => {
              const matchesName = !query || u.username.toLowerCase().includes(query.toLowerCase());
              const matchesCity = !cityFilter || (u.city && u.city.toLowerCase().includes(cityFilter.toLowerCase()));
              return matchesName && matchesCity;
            })
            .filter(u => {
              const userId = u._id ? String(u._id) : "";
              return !(currentUserId && userId === currentUserId);
            });

          filtered.sort((a, b) => {
            const aStartsWithName = query && a.username.toLowerCase().startsWith(query.toLowerCase());
            const bStartsWithName = query && b.username.toLowerCase().startsWith(query.toLowerCase());
            if (aStartsWithName && !bStartsWithName) return -1;
            if (!aStartsWithName && bStartsWithName) return 1;
            return a.username.localeCompare(b.username);
          });
            setResults(filtered);
        } catch (e) {
          console.error("Errore nella ricerca utenti:", e);
          // Gestisci errori di autenticazione
          if (!handleAuthError(e)) {
            setError("Errore nella ricerca utenti");
          }
        } finally {
          setLoading(false);
        }
      }, 400)
    );
  }, [query, cityFilter, accessToken, user]);useEffect(() => {
    if (!accessToken || !user) return;
      // Carica la lista degli amici
    getFriends(null, { accessToken })
      .then(friendsList => setFriends(friendsList.map(f => f._id)))
      .catch((err) => {
        console.error("Errore nel caricamento degli amici:", err);
        if (!handleAuthError(err)) {
          setFriends([]);
        }
      });
    
    // Carica le richieste di amicizia inviate usando il contesto
    // Non forziamo il ricaricamento, usiamo la cache implementata nel contesto
    loadSentRequests();
  }, [accessToken, user, loadSentRequests]);  const handleAddFriend = async (userId) => {
    // Assicuriamoci che gli ID siano stringhe valide
    const currentUserId = user?.id ? String(user.id) : user?._id ? String(user._id) : "";
    const targetUserId = userId ? String(userId).trim() : "";
    
    // Controllo di sicurezza
    if (!targetUserId) {
      return;
    }
    
    if (targetUserId === currentUserId) {
      return;
    }

    // Verifica se esiste già una richiesta inviata usando il contesto
    if (isRequestSent(targetUserId)) {
      return;
    }    
    
    // Verifica se è già in corso una richiesta per questo utente usando il contesto
    if (isRequestPending(targetUserId)) {
      // Richiesta già in corso per questo utente
      return;
    }

    // Aggiungi l'utente alla lista delle richieste in corso usando il contesto
    addPendingRequest(targetUserId);
    
    try {
      // Invia la richiesta di amicizia
      const response = await sendFriendRequest(targetUserId, { accessToken });
      
      // Aggiorna l'UI
      updateUIAfterRequest(targetUserId);
      // Aggiungi alla lista delle richieste inviate usando il contesto
      addSentRequest(targetUserId);
    } catch (err) {
      console.error("Errore durante l'invio della richiesta di amicizia:", err);
      
      // Gestisci errori di autenticazione prima
      if (handleAuthError(err, "La tua sessione è scaduta durante l'invio della richiesta")) {
        return;
      }
      
      // Gestione errori più dettagliata
      if (err?.response?.status === 409) {
        // Considera la richiesta come inviata anche in caso di errore 409
        updateUIAfterRequest(targetUserId);
        addSentRequest(targetUserId);
      }
    } finally {
      // Rimuovi l'utente dalla lista delle richieste in corso usando il contesto
      removePendingRequest(targetUserId);
    }
  };
  
  // Funzione di supporto per aggiornare l'UI dopo l'invio di una richiesta  // Funzione per calcolare la rilevanza di un risultato
  const calculateRelevance = (userResult, searchQuery, cityQuery) => {
    let score = 0;
    
    if (!userResult || !userResult.username) return score;
    
    const username = userResult.username.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    const cityLower = cityQuery.toLowerCase();
    const userCity = (userResult.city || "").toLowerCase();
    
    // Punteggio per match del username
    if (username === searchLower) score += 100; // Match esatto
    else if (username.startsWith(searchLower)) score += 50; // Inizia con la query
    else if (username.includes(searchLower)) score += 25; // Contiene la query
    
    // Punteggio per match della città
    if (cityQuery && userCity) {
      if (userCity === cityLower) score += 30; // Match esatto città
      else if (userCity.startsWith(cityLower)) score += 15; // Città inizia con query
      else if (userCity.includes(cityLower)) score += 10; // Città contiene query
    }
    
    return score;
  };

  // Calcola risultati filtrati, ordinati e paginati
  const getFilteredAndPaginatedResults = () => {
    // Filtra i risultati escludendo l'utente corrente
    const currentUserId = user?.id ? String(user.id) : user?._id ? String(user._id) : null;
    
    let filteredResults = results.filter(userResult => {
      const resultUserId = String(userResult._id || "");
      return !currentUserId || resultUserId !== currentUserId;
    });

    // Ordina per rilevanza se c'è una query di ricerca
    if (query.trim() || cityFilter.trim()) {
      filteredResults = filteredResults
        .map(userResult => ({
          ...userResult,
          relevanceScore: calculateRelevance(userResult, query, cityFilter)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Calcola la paginazione
    const totalResults = filteredResults.length;
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return {
      results: paginatedResults,
      totalResults,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  };

  const paginationData = getFilteredAndPaginatedResults();
  // Reset della pagina quando cambia la query o il filtro città
  useEffect(() => {
    setCurrentPage(1);
  }, [query, cityFilter]);

  // Funzioni per la navigazione delle pagine
  const goToNextPage = () => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (paginationData.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Funzione di supporto per aggiornare l'UI dopo l'invio di una richiesta
  const updateUIAfterRequest = (userId) => {
    const updatedResults = results.map(r => 
      r._id === userId ? { ...r, requestSent: true } : r
    );
    setResults(updatedResults);
  };
  
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <HeaderComp />        
        <div className="flex-grow flex flex-col items-center mt-8">
        <div className="w-full max-w-md px-4 relative">
          <div className="bg-white shadow-xl rounded-full border border-orange-200 !mb-4">
            <div className="flex items-center p-2 gap-2">
              <input
                type="text"
                placeholder="Cerca giocatori per username..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 border border-orange-300 rounded-3xl p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`py-2 px-3 rounded-full transition-colors ${showFilters ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
              >
                <FontAwesomeIcon icon={faFilter} />
              </button>
            </div>
          </div>          
          {/* Dropdown filtri - Responsive: desktop a destra, mobile sotto */}
          {showFilters && (
            <>
              {/* Desktop: posizionato a destra */}
              <div className="hidden md:block absolute top-0 left-full ml-4 w-64 bg-white shadow-xl rounded-lg border border-orange-200 p-4 z-10">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtri di ricerca</h3>
                <FloatingLabel
                  id="cityFilter"
                  type="text"
                  label="Filtra per città"
                  value={cityFilter}
                  onChange={e => setCityFilter(e.target.value)}
                />
              </div>
              
              {/* Mobile: posizionato sotto la barra di ricerca */}
              <div className="md:hidden absolute top-full mt-2 left-0 right-0 bg-white shadow-xl rounded-lg border border-orange-200 p-4 z-10">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtri di ricerca</h3>
                <FloatingLabel
                  id="cityFilterMobile"
                  type="text"
                  label="Filtra per città"
                  value={cityFilter}
                  onChange={e => setCityFilter(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        <div className="w-full max-w-md mt-4 space-y-3 px-4">
          {loading && <LoadingSpinner />}
          {error && <div className="text-center text-red-500">{error}</div>}          
          {/* Debug info */}
          <div className="text-xs text-gray-500 mb-2">
            Query: {query} | Città: {cityFilter} | Risultati: {paginationData.totalResults} | Pagina: {paginationData.currentPage}/{paginationData.totalPages}
          </div>
          
          {/* Risultati della ricerca */}
          {paginationData.results.map(userResult => {const isFriend = friends.includes(userResult._id);
            const isRequestSent = sentRequests.includes(userResult._id) || userResult.requestSent;
            const isPending = pendingRequests.has(userResult._id);
            return (
              <div key={userResult._id} className="bg-white shadow-xl rounded-xl p-4 flex items-center gap-4 border border-orange-100">
                <ImageWithFallback
                  src={userResult.avatar || "/default-avatar.png"}
                  alt={userResult.username}
                  className="w-12 h-12 rounded-full object-cover border border-orange-200"/>
                <div className="flex-1 min-w-0">                  
                  <button
                    type="button"
                    className="text-left w-full bg-transparent border-0 p-0 m-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${userResult._id}`)}>
                    <div className="font-semibold text-orange-700 hover:underline truncate">{userResult.username}</div>
                    {userResult.city && <div className="text-gray-500 text-sm truncate">{userResult.city}</div>}
                  </button>
                </div>                {
                  (() => {
                    // Estrai l'ID dell'utente corrente, considerando entrambe le proprietà
                    const currentUserId = user?.id ? String(user.id) : user?._id ? String(user._id) : null;
                    const resultUserId = String(userResult._id || "");
                    const isCurrentUser = currentUserId && resultUserId === currentUserId;
                    
                    if (isCurrentUser) {
                      return <span className="ml-2 py-2 px-3 text-gray-400 text-sm">Tu</span>;
                    } else if (isFriend) {
                      return (
                        <button
                          type="button"
                          className="ml-2 py-2 px-3 rounded-full bg-green-100 text-green-700 border border-green-400 flex items-center gap-2 cursor-default"
                          disabled>
                          <FontAwesomeIcon icon={faCheck} />
                          <span>Amico</span>
                        </button>
                      );                    
                    } else if (isRequestSent) {
                      return (
                        <button
                          type="button"
                          className="ml-2 py-2 px-3 rounded-full bg-blue-100 text-blue-700 border border-blue-400 flex items-center gap-2 cursor-default"
                          disabled>
                          <FontAwesomeIcon icon={faCheck} />
                          <span>Richiesta inviata</span>
                        </button>
                      );
                    } else if (isPending) {
                      return (
                        <button
                          type="button"
                          className="ml-2 py-2 px-3 rounded-full bg-gray-100 text-gray-500 border border-gray-300 flex items-center gap-2 cursor-default"
                          disabled>
                          <span>Invio...</span>
                        </button>
                      );
                    } else {
                      return (
                        <button
                          type="button"
                          className="ml-2 py-2 px-3 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors cursor-pointer"
                          title="Aggiungi amico"
                          onClick={() => handleAddFriend(userResult._id)}>
                          <FontAwesomeIcon icon={faUserPlus} />
                        </button>
                      );
                    }
                  })()
                }
              </div>
            );          })}
          
          {/* Controlli di paginazione */}
          {paginationData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 mb-4">
              <button
                onClick={goToPrevPage}
                disabled={!paginationData.hasPrevPage}
                className={`p-3 rounded-full transition-colors ${
                  paginationData.hasPrevPage 
                    ? 'bg-orange-100 hover:bg-orange-200 text-orange-600 cursor-pointer' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title="Pagina precedente">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-orange-100">
                <span className="text-sm text-gray-600">
                  Pagina <span className="font-semibold text-orange-600">{paginationData.currentPage}</span> di <span className="font-semibold">{paginationData.totalPages}</span>
                </span>
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={!paginationData.hasNextPage}
                className={`p-3 rounded-full transition-colors ${
                  paginationData.hasNextPage 
                    ? 'bg-orange-100 hover:bg-orange-200 text-orange-600 cursor-pointer' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title="Pagina successiva">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}

          {!loading && (query.length >= 3 || cityFilter.length >= 2) && paginationData.totalResults === 0 && !error && (
            <div className="text-center text-gray-400">Nessun giocatore trovato</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
