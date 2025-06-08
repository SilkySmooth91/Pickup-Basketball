import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderComp from "../components/utils/HeaderComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faClock } from "@fortawesome/free-solid-svg-icons";
import { getUserEvents } from "../api/userApi";

export default function YourEvents() {
  const { user, accessToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          setEvents([]);
          return;
        }
        
        // Estrai l'ID dell'utente, considerando che potrebbe essere in user.id o user._id
        const userId = user.id || user._id;
        
        // Utilizza il nuovo endpoint per ottenere gli eventi dell'utente
        const data = await getUserEvents(userId, page, 10, { accessToken });
        
        setEvents(data.events);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError("Impossibile caricare gli eventi");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && user) {
      fetchUserEvents();
    }
  }, [accessToken, user, page]);

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="min-h-screen">
      <HeaderComp />
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl border-orange-500 border-l-4">
            <div className="bg-gradient-to-r from-orange-100 to-red-200 rounded-t-lg p-4 flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-xl text-orange-500" />
              <h2 className="font-semibold text-2xl ml-3">I tuoi eventi</h2>
            </div>            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mb-2"></div>
                  <p>Caricamento eventi...</p>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                  >
                    Riprova
                  </button>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Non sei iscritto a nessun evento al momento.</div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      onClick={() => handleEventClick(event._id)}
                      className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-lg text-orange-700">{event.title}</h3>
                      <div className="mt-2 text-gray-600 flex flex-col sm:flex-row sm:space-x-6">
                        <div className="flex items-center mt-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500 mr-2" />
                          <span>{event.court?.name || "Campo non specificato"}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-500 mr-2" />
                          <span>{formatDate(event.datetime)}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <FontAwesomeIcon icon={faClock} className="text-orange-500 mr-2" />
                          <span>{formatTime(event.datetime)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Paginazione */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className={`px-3 py-1 rounded ${
                            page === 1
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                        >
                          Precedente
                        </button>
                        
                        <div className="text-sm text-gray-500">
                          Pagina {page} di {totalPages}
                        </div>
                        
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className={`px-3 py-1 rounded ${
                            page === totalPages
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                        >
                          Successiva
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
