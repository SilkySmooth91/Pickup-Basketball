import { useParams, useNavigate } from 'react-router-dom';
import HeaderComp from '../components/utils/HeaderComp';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../context/fetchWithAuth';
import { useAuth } from '../context/AuthContext';
import CourtImageCarousel from '../components/utils/CourtImageCarousel';
import PageContainer from '../components/utils/PageContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPen, faBasketball, faRulerCombined, faLightbulb, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import UpcomingEvents from '../components/utils/UpcomingEvents';
import EditCourtModal from '../components/utils/EditCourtModal';
import CreateEventModal from '../components/utils/CreateEventModal';
import CommentsSection from '../components/utils/CommentsSection';
import LoadingSpinner from '../components/utils/LoadingSpinner';
import Footer from '../components/utils/Footer';

export default function CourtInfo() {  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  // Stato per forzare l'aggiornamento della lista degli eventi
  const [eventsRefreshTrigger, setEventsRefreshTrigger] = useState(0);

  const fetchCourt = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetchWithAuth(`${API_URL}/courts/${id}`, {}, { accessToken });
      if (!res.ok) throw new Error('Errore nel recupero del campetto');
      const data = await res.json();
      setCourt(data);
    } catch (err) {
      setError('Impossibile caricare i dati del campetto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourt();
  }, [id, accessToken]);  return (
    <div className="min-h-screen flex flex-col">
      <HeaderComp />
      <div className="flex-grow">
        <PageContainer>
        <button 
          onClick={() => {
            // Controllo se ci sono coordinate salvate
            const savedCoords = localStorage.getItem('mapCoords');
            if (savedCoords) {
              // Se ci sono coordinate salvate, torna alla mappa
              navigate('/map');
            } else {
              // Altrimenti, vai semplicemente alla mappa senza coordinate specifiche
              navigate('/map');
            }
          }}
          className="mb-4 flex items-center gap-2 py-2 px-4 rounded-md shadow bg-white hover:bg-gray-100 text-orange-600 hover:text-orange-700 transition-colors font-medium cursor-pointer"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Torna alla mappa
        </button>
        
        <CourtImageCarousel
          images={court?.images || []} 
          courtName={court?.name} 
          courtId={court?._id}
          onUploadSuccess={() => fetchCourt()}
        />
        <div className="mt-8 flex flex-col md:flex-row gap-6">          {/* Card informazioni campetto */}
          <div className="bg-white rounded-lg shadow-xl min-w-[260px] border-orange-500 border-l-6 flex-1">
            {loading && <LoadingSpinner />}
            {error && <p className="text-red-500">{error}</p>}
            {court && (
              <div className="bg-white rounded shadow p-4">
                <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2'>
                  <h2 className="text-2xl text-orange-600 font-semibold mb-2 md:mb-0">{court.name}</h2>
                  <div className='hidden md:flex flex-row md:gap-2 mt-2 md:mt-0'>                    <button 
                      className='w-auto bg-white text-orange-600 font-semibold px-5 py-2 rounded-md shadow border border-orange-500 hover:bg-gray-100 transition cursor-pointer flex gap-2 items-center'
                      onClick={() => setShowEditModal(true)}
                    >
                      <FontAwesomeIcon icon={faPen} className='text-orange-600' />
                      Modifica
                    </button>
                    <button 
                      className='w-auto py-2 px-5 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-normal text-base hover:from-orange-600 hover:to-red-600 transition-colors shadow flex items-center gap-2 cursor-pointer'
                      onClick={() => setShowCreateEventModal(true)}
                    >
                      <FontAwesomeIcon icon={faCalendar} />
                      Crea Evento
                    </button>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faLocationDot} className='text-gray-600 mr-2' />
                  <p className="text-gray-600">{court.address}</p>
                </div>
                <div className="text-base mt-2">
                  <p className='flex items-center gap-3 py-3 rounded-md bg-orange-100 mb-2'>
                    <FontAwesomeIcon icon={faBasketball} className='ml-4 text-orange-600' />
                    <span className="font-light">Canestri:</span> 
                    <span className='py-1 px-2 bg-gray-200 rounded-full font-semibold'>{court.baskets}</span>
                  </p>
                  <p className='flex items-center gap-3 py-3 rounded-md bg-orange-100 mb-2'>
                    <FontAwesomeIcon icon={faRulerCombined} className='text-orange-600 ml-4' />
                    <span className="font-light">Dimensioni ufficiali:</span> 
                    <span className='py-1 px-2 bg-gray-200 rounded-full font-semibold'>{court.officialsize ? 'Sì' : 'No'}</span>
                  </p>
                  <p className='flex items-center gap-3 py-3 rounded-md bg-orange-100'>
                    <FontAwesomeIcon icon={faLightbulb} className='text-orange-600 ml-4' />
                    <span className="font-light">Illuminazione notturna:</span> 
                    <span className='py-1 px-2 bg-gray-200 rounded-full font-semibold'>{court.nightlights ? 'Sì' : 'No'}</span>
                  </p>
                </div>
                {/* Bottoni solo su mobile */}
                <div className='w-auto flex flex-col gap-2 mt-4 md:hidden'>                  <button 
                    className='w-auto self-start bg-white text-orange-600 font-semibold px-5 py-2 rounded-md shadow border border-orange-500 hover:bg-gray-100 transition cursor-pointer flex gap-2 items-center'
                    onClick={() => setShowEditModal(true)}
                  >
                    <FontAwesomeIcon icon={faPen} className='text-orange-600' />
                    Modifica
                  </button>
                  <button 
                    className='w-auto self-start py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-normal text-base hover:from-orange-600 hover:to-red-600 transition-colors shadow flex items-center gap-2 cursor-pointer'
                    onClick={() => setShowCreateEventModal(true)}
                  >
                    <FontAwesomeIcon icon={faCalendar} />
                    Crea Evento
                  </button>
                </div>
              </div>
            )}
          </div>          {/* Card prossimi eventi */}
          <div className="bg-white rounded-lg shadow-xl min-w-[260px] border-orange-500 border-l-6 flex-1 md:max-w-md">
            <UpcomingEvents courtId={court?._id} refreshTrigger={eventsRefreshTrigger} />
          </div>
        </div>          {showEditModal && court && (
          <EditCourtModal 
            court={court} 
            onClose={() => {
              setShowEditModal(false);
              fetchCourt(); // Aggiorna i dati quando il modale si chiude
            }} 
            onUpdate={(updatedCourt) => {
              setCourt(updatedCourt);
              fetchCourt(); 
            }}
          />
        )}        {showCreateEventModal && court && (
          <CreateEventModal 
            court={court}
            onClose={() => setShowCreateEventModal(false)}
            onEventCreated={(eventData) => {
              // Incrementa il trigger di refresh per forzare l'aggiornamento della lista eventi
              setEventsRefreshTrigger(prev => prev + 1);
              
              // Emetti anche un evento custom sul componente specifico
              const upcomingEventsComponent = document.querySelector('[data-component="upcoming-events"]');
              if (upcomingEventsComponent) {
                upcomingEventsComponent.dispatchEvent(new CustomEvent('refresh', {
                  detail: { eventId: eventData?._id, courtId: court._id }
                }));
              }
            }}
          />
        )}
        <div className="mt-8">
          {court && (
            <CommentsSection targetId={court._id} targetType="Courts" />
          )}
        </div>      </PageContainer>
      </div>
      <Footer />
    </div>
  );
}
