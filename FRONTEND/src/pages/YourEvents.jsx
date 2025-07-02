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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderComp from "../components/utils/HeaderComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faClock, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { getUserEvents } from "../api/userApi";
import LoadingSpinner from '../components/utils/LoadingSpinner';
import Footer from '../components/utils/Footer';

export default function YourEvents() {
  const { user, accessToken } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stati per paginazione eventi futuri
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingTotalPages, setUpcomingTotalPages] = useState(1);
  
  // Stati per paginazione eventi passati
  const [pastPage, setPastPage] = useState(1);
  const [pastEvents, setPastEvents] = useState([]);
  const [pastTotalPages, setPastTotalPages] = useState(1);
  
  // Stato per la tab attiva
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const navigate = useNavigate();
  const eventsPerPage = 5;  // Funzione per separare e paginare gli eventi
  const processEvents = (events) => {
    const now = new Date();
    
    // Separa eventi futuri e passati
    const upcoming = events.filter(event => new Date(event.datetime) >= now);
    const past = events.filter(event => new Date(event.datetime) < now);
    
    // Ordina eventi futuri (dal più vicino al più lontano)
    upcoming.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    // Ordina eventi passati (dal più recente al più vecchio)
    past.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
    // Calcola paginazione per eventi futuri
    const upcomingTotal = Math.ceil(upcoming.length / eventsPerPage);
    const upcomingStart = (upcomingPage - 1) * eventsPerPage;
    const upcomingPaginated = upcoming.slice(upcomingStart, upcomingStart + eventsPerPage);
    
    // Calcola paginazione per eventi passati
    const pastTotal = Math.ceil(past.length / eventsPerPage);
    const pastStart = (pastPage - 1) * eventsPerPage;
    const pastPaginated = past.slice(pastStart, pastStart + eventsPerPage);
    
    setUpcomingEvents(upcomingPaginated);
    setUpcomingTotalPages(upcomingTotal);
    setPastEvents(pastPaginated);
    setPastTotalPages(pastTotal);
  };

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          setAllEvents([]);
          return;
        }
        
        // Estrai l'ID dell'utente, considerando che potrebbe essere in user.id o user._id
        const userId = user.id || user._id;
        
        // Fetch di tutti gli eventi dell'utente (senza paginazione backend)
        const data = await getUserEvents(userId, 1, 1000, { accessToken });
        
        setAllEvents(data.events);
      } catch (err) {
        setError("Impossibile caricare gli eventi");
        // Gestione silenziosa dell'errore
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && user) {
      fetchUserEvents();
    }
  }, [accessToken, user]);

  // Processa gli eventi quando cambiano gli eventi o le pagine
  useEffect(() => {
    if (allEvents.length > 0) {
      processEvents(allEvents);
    } else {
      // Reset quando non ci sono eventi
      setUpcomingEvents([]);
      setUpcomingTotalPages(1);
      setPastEvents([]);
      setPastTotalPages(1);
    }
  }, [allEvents, upcomingPage, pastPage]);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
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

  // Componente per la sezione eventi con paginazione
  const EventSection = ({ events, currentPage, totalPages, onPageChange, emptyMessage }) => (
    <div>
      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
          {emptyMessage}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => handleEventClick(event._id)}
                className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50 transition-colors cursor-pointer"
              >
                <h4 className="font-semibold text-lg text-orange-700">{event.title}</h4>
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
          </div>
          
          {/* Paginazione per questa sezione */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                  aria-label="Pagina precedente"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                
                <div className="text-sm text-gray-500 px-3">
                  {currentPage} di {totalPages}
                </div>
                
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                  aria-label="Pagina successiva"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderComp />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl border-orange-500 border-l-4">            
              <div className="bg-gradient-to-r from-orange-100 to-red-200 rounded-t-lg p-4 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-xl text-orange-500" />
                <h2 className="font-semibold text-2xl ml-3">I tuoi eventi</h2>
            </div>
              <div className="p-6">
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <div className="text-center text-red-500 py-8">
                    <p>{error}</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                      Riprova
                    </button>
                  </div>
                ) : allEvents.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Non sei iscritto a nessun evento al momento.
                  </div>
                ) : (
                  <div>
                    {/* Sistema di Tab */}
                    <div className="mb-6">
                      <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                          <button
                            onClick={() => {
                              setActiveTab('upcoming');
                              setUpcomingPage(1); // Reset della paginazione quando si cambia tab
                            }}
                            className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                              activeTab === 'upcoming'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}>
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                            Prossimi eventi
                            {upcomingEvents.length > 0 && (
                              <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {allEvents.filter(event => new Date(event.datetime) >= new Date()).length}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('past');
                              setPastPage(1); // Reset della paginazione quando si cambia tab
                            }}
                            className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                              activeTab === 'past'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                            Eventi passati
                            {pastEvents.length > 0 && (
                              <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {allEvents.filter(event => new Date(event.datetime) < new Date()).length}
                              </span>
                            )}
                          </button>
                        </nav>
                      </div>
                    </div>

                    {/* Contenuto delle Tab */}
                    <div className="mt-6">
                      {activeTab === 'upcoming' ? (
                        <EventSection
                          events={upcomingEvents}
                          currentPage={upcomingPage}
                          totalPages={upcomingTotalPages}
                          onPageChange={setUpcomingPage}
                          emptyMessage="Nessun evento futuro programmato."
                        />
                      ) : (
                        <EventSection
                          events={pastEvents}
                          currentPage={pastPage}
                          totalPages={pastTotalPages}
                          onPageChange={setPastPage}
                          emptyMessage="Nessun evento passato trovato."
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
