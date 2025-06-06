import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { faCircleInfo, faCalendar, faClock, faUserGroup, faBasketball, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/AuthContext";
import HeaderComp from '../components/utils/HeaderComp';
import PageContainer from '../components/utils/PageContainer';

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const { accessToken } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/events/${eventId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) throw new Error("Errore nel recupero evento");
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setError("Impossibile caricare l'evento.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, accessToken]);

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!event) return null;

  return (
    <>
      <HeaderComp />
      <PageContainer>
          <div className="bg-white rounded-lg shadow-xl min-w-[260px] border-orange-500 border-l-6 flex-1 p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faCircleInfo} className="text-orange-600 text-2xl mr-3" />
              <h2 className="text-2xl font-bold text-orange-600">Dettagli Evento</h2>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Titolo: </span>
              <span className="text-gray-900">{event.title}</span>
            </div>
            <div className="mb-2 flex items-center">
              <FontAwesomeIcon icon={faCalendar} className="text-orange-600 mr-2" />
              <span>{new Date(event.datetime).toLocaleDateString()} <FontAwesomeIcon icon={faClock} className="ml-2 mr-1" /> {new Date(event.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="mb-2 flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-600 mr-2" />
              <span>{event.court?.name || "Campo sconosciuto"}</span>
            </div>
            <div className="mb-2 flex items-center">
              <FontAwesomeIcon icon={faUserGroup} className="text-orange-600 mr-2" />
              <span>Partecipanti: {event.participants?.length ?? 0}</span>
            </div>
            <div className="mb-2 flex items-center">
              <FontAwesomeIcon icon={faBasketball} className="text-orange-600 mr-2" />
              <span>Livello: {event.level || "Non specificato"}</span>
            </div>
            {event.description && (
              <div className="mt-4">
                <span className="font-semibold text-gray-700">Descrizione:</span>
                <div className="text-gray-800 mt-1">{event.description}</div>
              </div>
            )}
          </div>
      </PageContainer>
    </>
  );
}
