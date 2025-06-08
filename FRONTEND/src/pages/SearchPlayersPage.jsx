import React, { useState, useEffect } from "react";
import HeaderComp from "../components/utils/HeaderComp";
import { getUsers } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faCheck } from "@fortawesome/free-solid-svg-icons";
import { sendFriendRequest, getFriends } from "../api/friendApi";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/utils/LoadingSpinner";
import Footer from '../components/utils/Footer';

export default function SearchPlayersPage() {  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setError(null);
      return;
    }
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(async () => {
        setLoading(true);
        setError(null);          try {
          const data = await getUsers(1, 100, { accessToken });
          
          // Verifica che data.users esista
          if (!data || !data.users || !Array.isArray(data.users)) {
            setResults([]);
            return;
          }

          // Estrai l'ID dell'utente corrente in modo sicuro
          // Importante: l'oggetto user può avere l'ID come user.id oppure user._id
          const currentUserId = user?.id ? String(user.id) : user?._id ? String(user._id) : null;
          
          // Filtra prima per username e poi rimuovi l'utente corrente
          const filtered = data.users
            .filter(u => u.username.toLowerCase().includes(query.toLowerCase()))
            .filter(u => {
              const userId = u._id ? String(u._id) : "";
              const isCurrentUser = currentUserId && userId === currentUserId;
              // Ritorna false per l'utente corrente (da escludere)
              return !isCurrentUser;
            });          // Ordina i risultati
          filtered.sort((a, b) => {
            const aStart = a.username.toLowerCase().startsWith(query.toLowerCase());
            const bStart = b.username.toLowerCase().startsWith(query.toLowerCase());
            if (aStart && !bStart) return -1;
            if (!aStart && bStart) return 1;
            return a.username.localeCompare(b.username);
          });
          
          setResults(filtered);
        } catch (e) {
          setError("Errore nella ricerca utenti");
        } finally {
          setLoading(false);
        }
      }, 400)
    );
  }, [query, accessToken, user]);

  useEffect(() => {
    if (!accessToken || !user) return;
    getFriends(null, { accessToken })
      .then(friendsList => setFriends(friendsList.map(f => f._id)))
      .catch(() => setFriends([]));
  }, [accessToken, user]);  const handleAddFriend = async (userId) => {
    const currentUserId = user?.id ? String(user.id) : user?._id ? String(user._id) : "";
    const targetUserId = String(userId || "");
    
    // Controllo di sicurezza
    if (targetUserId === currentUserId) {
      toast.error("Non puoi inviare una richiesta a te stesso");
      return;
    }
    
    try {
      await sendFriendRequest(userId, { accessToken });
      toast.success("Richiesta inviata!");
    } catch (err) {
      toast.error(err?.message || "Errore invio richiesta");
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderComp />
      <div className="flex-grow flex flex-col items-center mt-8">
        <div className="w-full max-w-md px-4">
          <form className="bg-white shadow-xl rounded-full flex items-center p-2 gap-2 !mb-4 border border-orange-200">
            <input
              type="text"
              placeholder="Cerca giocatori per username..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 border border-orange-300 rounded-3xl p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"/>
          </form>        </div>        <div className="w-full max-w-md mt-4 space-y-3 px-4">
          {loading && <LoadingSpinner />}
          {error && <div className="text-center text-red-500">{error}</div>}
          
          {/* Debug info */}
          <div className="text-xs text-gray-500 mb-2">
            Query: {query} | Risultati: {results.length}
          </div>            
          {/* Risultati della ricerca */}
          {results
            // Controllo di sicurezza extra: non visualizzare mai l'utente corrente
            .filter(userResult => {
              // Estrai l'ID dell'utente corrente, considerando entrambe le proprietà
              const currentUserId = user?.id ? String(user.id) : user?._id ? String(user._id) : null;
              const resultUserId = String(userResult._id || "");
              
              // Se l'utente corrente non ha ID o gli ID sono diversi, mostra il risultato
              return !currentUserId || resultUserId !== currentUserId;
            })
            .map(userResult => {
            const isFriend = friends.includes(userResult._id);
            return (
              <div key={userResult._id} className="bg-white shadow-xl rounded-xl p-4 flex items-center gap-4 border border-orange-100">
                <img
                  src={userResult.avatar || "/default-avatar.png"}
                  alt={userResult.username}
                  className="w-12 h-12 rounded-full object-cover border border-orange-200"/>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    className="text-left w-full bg-transparent border-0 p-0 m-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${userResult._id}`)}>
                    <div className="font-semibold text-orange-700 hover:underline truncate">{userResult.username}</div>
                    {userResult.name && <div className="text-gray-500 text-sm truncate">{userResult.name}</div>}
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
            );
          })}
          {!loading && query.length >= 3 && results.length === 0 && !error && (
            <div className="text-center text-gray-400">Nessun giocatore trovato</div>          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
