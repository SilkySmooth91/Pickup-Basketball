import { useParams } from 'react-router-dom';
import HeaderComp from '../components/utils/HeaderComp';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../context/fetchWithAuth';
import { useAuth } from '../context/AuthContext';
import CourtImageCarousel from '../components/utils/CourtImageCarousel';
import PageContainer from '../components/utils/PageContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPen, faBasketball } from '@fortawesome/free-solid-svg-icons';

export default function CourtInfo() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourt() {
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
    }
    fetchCourt();
  }, [id, accessToken]);

  return (
    <>
      <HeaderComp />
      <PageContainer>
        <CourtImageCarousel 
          images={court?.images || []} 
          courtName={court?.name} 
          courtId={court?._id}
          onUploadSuccess={() => {
            setLoading(true);
            setError(null);
            fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/courts/${court._id}`, {}, { accessToken })
              .then(res => res.ok ? res.json() : Promise.reject())
              .then(data => setCourt(data))
              .catch(() => setError('Impossibile aggiornare le immagini'))
              .finally(() => setLoading(false));
          }}/>
        <div className="mt-8 bg-white rounded-lg shadow-xl min-w-[260px] border-orange-500 border-l-6">
          {loading && <p>Caricamento...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {court && (
            <div className="bg-white rounded shadow p-4">
              <div className='flex justify-between items-center mb-2'>
                <h2 className="text-2xl text-orange-600 font-semibold mb-2">{court.name}</h2>
                <button className='py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-normal text-base hover:from-orange-600 hover:to-red-600 transition-colors shadow flex items-center gap-2 cursor-pointer'>
                  <FontAwesomeIcon icon={faPen} className='text-white' />
                  Modifica
                </button>
              </div>
              <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={faLocationDot} className='text-gray-600 mr-2' />
                <p className="text-gray-600">{court.address}</p>
              </div>
              <div className="text-base mt-2">
                <p>
                  <FontAwesomeIcon icon={faBasketball} />
                  <span className="font-semibold">Canestri:</span> 
                  {court.baskets}</p>
                <p><span className="font-semibold">Dimensioni ufficiali:</span> {court.officialsize ? 'Sì' : 'No'}</p>
                <p><span className="font-semibold">Illuminazione notturna:</span> {court.nightlights ? 'Sì' : 'No'}</p>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
}
