import { useParams } from 'react-router-dom';
import HeaderComp from '../components/utils/HeaderComp';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../context/fetchWithAuth';
import { useAuth } from '../context/AuthContext';
import CourtImageCarousel from '../components/utils/CourtImageCarousel';

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

  function handleUploadClick() {
    // Qui puoi aprire una modale o navigare alla pagina di upload immagini
    alert('Funzionalità di caricamento immagini non ancora implementata');
  }

  return (
    <>
      <HeaderComp />
      <div className="p-6 container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Scheda Campetto</h1>
        {loading && <p>Caricamento...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {court && (
          <>
            {/* Carosello immagini */}
            <div className="w-full flex flex-col items-center mb-6">
              <CourtImageCarousel 
                images={court.images || []} 
                courtName={court.name} 
                onUploadClick={handleUploadClick}/>
            </div>
            {/* Dati campetto */}
            <div className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-semibold mb-2">{court.name}</h2>
              <p className="text-gray-600 mb-1">{court.address}</p>
              <div className="text-base mt-2">
                <p><span className="font-semibold">Canestri:</span> {court.baskets}</p>
                <p><span className="font-semibold">Dimensioni ufficiali:</span> {court.officialsize ? 'Sì' : 'No'}</p>
                <p><span className="font-semibold">Illuminazione notturna:</span> {court.nightlights ? 'Sì' : 'No'}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
