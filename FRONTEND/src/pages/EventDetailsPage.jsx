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
import { useParams } from "react-router-dom";
import { faCircleInfo, faCalendar, faClock, faUserGroup, faBasketball, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/AuthContext";
import HeaderComp from '../components/utils/HeaderComp';
import PageContainer from '../components/utils/PageContainer';
import { joinEvent, leaveEvent, getEventById } from '../api/eventApi';
import { faUserPlus, faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import CommentsSection from '../components/utils/CommentsSection';
import EditEventModal from '../components/utils/EditEventModal';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../components/utils/LoadingSpinner';
import ImageWithFallback from '../components/utils/ImageWithFallback';
import Footer from '../components/utils/Footer';

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const { user, accessToken } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isCreator = user && event?.creator?._id === user.id;
  const isParticipant = user && event?.participants?.some(p => p._id === user.id);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventId, { accessToken });
        setEvent(data);
      } catch (err) {
        setError("Impossibile caricare l'evento.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, accessToken]);

  // Formatta la data in stile: Giovedì 12 Giugno 2025
  function formatLongDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // Gestione partecipazione evento
  const handleParticipation = async () => {
    if (!event || actionLoading) return;
    setActionLoading(true);
    try {
      const action = isParticipant ? leaveEvent : joinEvent;
      await action(event._id, { accessToken });
      // Refetch evento dopo join/leave
      const updated = await getEventById(event._id, { accessToken });
      setEvent(updated);
      toast.success(isParticipant ? 'Hai annullato la partecipazione' : 'Iscrizione avvenuta con successo!');
    } catch (err) {
      toast.error(err?.message || 'Errore durante la partecipazione all\'evento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditModalClose = (updatedEvent) => {
    setShowEditModal(false);
    if (updatedEvent) {
      setEvent(prev => ({ ...prev, ...updatedEvent }));
    }
  };
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!event) return null;
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderComp />
      <div className="flex-grow">
        <PageContainer>
          <div className="flex gap-6 flex-row flex-wrap md:flex-nowrap">
          {/* Card evento principale */}
          <div className="bg-white rounded-lg shadow-xl min-w-[260px] border-orange-500 border-l-6 flex-1 p-0 overflow-hidden">
            {/* Header immagine + titolo + organizzatore */}
            <div className="relative h-70 flex flex-col justify-end" style={{background: event.court?.images?.[0]?.url ? `url(${event.court.images[0].url}) center/cover no-repeat` : '#f3f3f3'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0" />
              {/* Pulsante modifica SOLO per il creatore*/}
              {isCreator && (
                <button
                  className="absolute top-3 right-3 z-20 bg-white text-orange-600 rounded-lg p-2 shadow-xl hover:bg-gray-100 transition cursor-pointer"
                  title="Modifica evento"
                  onClick={() => setShowEditModal(true)}>
                  <FontAwesomeIcon icon={faPen} className="mr-2" />
                  Modifica
                </button>
              )}
              <div className="relative z-10 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-3xl font-bold text-white drop-shadow">{event.title}</h2>
                  <FontAwesomeIcon 
                    icon={event.isprivate ? faLock : faLockOpen} 
                    className={event.isprivate ? "text-orange-600" : "text-green-500"}                    title={event.isprivate ? 'Evento privato' : 'Evento pubblico'}/>
                </div>
                {event.creator && (
                  <div className="flex items-center gap-2">
                    <ImageWithFallback src={event.creator.avatar || '/vite.svg'} alt={event.creator.username} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <span className="text-orange-500 font-medium drop-shadow">{event.creator.username}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Body info evento */}
            <div className="p-6">
              <div className="grid gap-x-6 gap-y-2 md:gap-y-4 mb-4 grid-cols-1 md:grid-cols-2">
                {/* Data */}
                <div className="flex items-center text-sm">
                  <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center px-3 py-2 mr-2">
                    <FontAwesomeIcon icon={faCalendar} className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-600">Data</p>
                    <div className="text-gray-500">
                    {formatLongDate(event.datetime)}
                    </div>
                  </div>
                </div>
                {/* Ora */}
                <div className="flex items-center text-sm">
                  <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center px-3 py-2 mr-2">
                    <FontAwesomeIcon icon={faClock} className="text-orange-600 text-xl" />
                  </div>
                  <div className="flex flex-col justify-center items-start">
                    <div>
                        <p className="font-semibold text-orange-600">Ora</p>
                        <div className="text-gray-500">{new Date(event.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>
                {/* Indirizzo */}
                <div className="flex items-center text-sm">
                  <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center px-4 py-2 mr-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-600 text-xl" />
                  </div>
                  <div className="flex flex-col justify-center items-start">
                    <div className="font-semibold text-orange-600">{event.court?.name || "Campo sconosciuto"}</div>
                    <div className="text-gray-500 text-sm">{event.court?.address || "Indirizzo sconosciuto"}</div>
                  </div>
                </div>
                {/* Partecipanti */}
                <div className="flex items-center text-sm">
                  <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center px-3 py-2 mr-2">
                    <FontAwesomeIcon icon={faUserGroup} className="text-orange-600 text-xl" />
                  </div>
                  <div className="flex flex-col justify-center items-start">
                    <span className="font-semibold text-orange-600">
                        <span>Partecipanti:</span> 
                        <span className="text-gray-500 ml-2">{event.participants?.length ?? 0} / {event.maxplayers ?? '-'}</span>
                    </span>
                    <span className="text-green-700 text-xs">Posti liberi: {event.maxplayers ? Math.max(event.maxplayers - (event.participants?.length ?? 0), 0) : '-'}</span>
                  </div>
                </div>
              </div>
              {event.description && (
                <div className="mt-2">
                  <span className="font-semibold text-gray-700">Descrizione:</span>
                  <div className="text-gray-800 mt-1">{event.description}</div>
                </div>
              )}
              {/* Pulsante partecipa, con logica evento privato */}
              {!isCreator && (
                <button
                  className={`cursor-pointer mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-lg font-semibold transition shadow-sm
                    ${isParticipant
                      ? 'bg-red-50 text-red-600 border border-red-600 hover:bg-red-100'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'}
                    disabled:opacity-60 disabled:cursor-not-allowed`
                  }
                  onClick={handleParticipation}
                  disabled={
                    actionLoading ||
                    (event.maxplayers && event.participants?.length >= event.maxplayers && !isParticipant) ||
                    (event.isprivate && !isCreator) // BLOCCA partecipazione se l'evento è privato
                  }>
                  <FontAwesomeIcon icon={isParticipant ? faUserMinus : faUserPlus} />
                  {actionLoading
                    ? 'Attendere...'
                    : isParticipant
                      ? 'Annulla partecipazione'
                      : event.isprivate ? 'Solo su invito' : 'Partecipa'}
                </button>
              )}
            </div>
          </div>
          {/* Colonna partecipanti */}
          <div className="w-full md:w-1/5 bg-white rounded-lg shadow-xl p-4 flex flex-col gap-2 h-fit self-start mt-6 md:mt-0">
            <div className="font-semibold text-orange-700 mb-2">Partecipanti</div>
            {event.participants?.length > 0 ? (
              <>                {(showAllParticipants ? event.participants : event.participants.slice(0, 9)).map(p => (
                  <div key={p._id} className="flex items-center gap-2 cursor-pointer hover:bg-orange-50 rounded p-1 transition" onClick={() => window.location.href = `/profile/${p._id}` }>
                    <ImageWithFallback src={p.avatar || '/vite.svg'} alt={p.username} className="w-8 h-8 rounded-full object-cover border-2 border-orange-600" />
                    <span className="font-medium text-gray-700">{p.username}</span>
                  </div>
                ))}
                {event.participants.length > 9 && (
                  <button
                    className="text-xs text-orange-600 font-semibold mt-1 px-2 py-1 rounded hover:bg-orange-100 transition self-start border border-orange-200"
                    onClick={() => setShowAllParticipants(v => !v)}>
                    {showAllParticipants ? 'Nascondi' : `Espandi (+${event.participants.length - 9})`}
                  </button>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm">Nessun partecipante</span>
            )}
          </div>
        </div>        {/* Sezione commenti */}
        <div className="mt-8">
          <CommentsSection targetId={eventId} targetType="Events" />
        </div>
      </PageContainer>
      <EditEventModal
        eventId={eventId}
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        onEventUpdated={setEvent} 
      />
      </div>
      <Footer />
    </div>
  );
}
