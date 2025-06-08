import { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getNearbyCourts } from '../../api/courtApi';
import { useAuth } from '../../context/AuthContext';
import basketballMarker from '../../assets/basketball-marker.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faLocationDot, faLocationPin } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/utils/LoadingSpinner';

// Icona personalizzata per i marker dei campetti
const courtIcon = new L.Icon({
  iconUrl: basketballMarker,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
  className: 'basketball-marker-icon'
});

export default function CourtMarkers({ searchedCoords }) {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();
  const map = useMap();
  const navigate = useNavigate();

  useEffect(() => {
    // Carica i campetti solo quando ci sono coordinate di ricerca
    if (searchedCoords) {
      const [lat, lng] = searchedCoords;
      setLoading(true);
      setError(null);

      getNearbyCourts(lat, lng, 5, { accessToken })
        .then(data => {
          setCourts(data.courts || []);
          
          // Se sono stati trovati campetti, aggiusta lo zoom per mostrare tutti i marker
          if (data.courts && data.courts.length > 0) {
            // Aggiungi tutti i punti includendo la posizione cercata
            const points = [
              [lat, lng], 
              ...data.courts.map(court => {
                // MongoDB usa [lng, lat], ma Leaflet usa [lat, lng]
                const [courtLng, courtLat] = court.coordinates.coordinates;
                return [courtLat, courtLng];
              })
            ];
            
            // Calcola i bounds per includere tutti i punti
            const bounds = L.latLngBounds(points);
            
            // Aggiungi un padding per una migliore visualizzazione
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 15 // Limita lo zoom massimo
            });
          }
        })
        .catch(err => {
          console.error('Errore nel caricamento dei campetti:', err);
          setError('Impossibile caricare i campetti vicini');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Resetta lo stato quando non ci sono coordinate
      setCourts([]);
    }
  }, [searchedCoords, accessToken, map]);

  if (!searchedCoords || loading || courts.length === 0) {
    return null;
  }

  return (
    <>
      {courts.map(court => {
        // MongoDB usa [lng, lat], ma Leaflet usa [lat, lng]
        const [lng, lat] = court.coordinates.coordinates;
        return (
          <Marker 
            key={court._id} 
            position={[lat, lng]}
            icon={courtIcon}>
            <Popup>
              <div className="court-popup p-5">
                <h3 className="font-bold text-2xl mb-4 text-orange-600">{court.name}</h3>
                
                {court.images && court.images.length > 0 && (
                  <div className="my-2">
                    <img 
                      src={court.images[0].url} 
                      alt={court.name} 
                      className="w-full h-40 object-cover rounded"/>
                  </div>
                )}
                <div className='flex items-center text-gray-600 mb-2'>
                  <FontAwesomeIcon icon={faLocationDot} className="text-orange-500 mr-2" />
                  <p className="text-gray-600 m-0">{court.address}</p>
                </div>
                <div className="text-base mt-2">
                  <p className='flex flex-row justify-between'>
                    <span className="font-semibold">Canestri:</span> {court.baskets}
                  </p>
                  <p className='flex flex-row justify-between'>
                    <span className="font-semibold">Dimensioni ufficiali:</span> 
                    {court.officialsize ? ' Sì' : ' No'}
                  </p>
                  <p className='flex flex-row justify-between'>
                    <span className="font-semibold">Illuminazione notturna:</span> 
                    {court.nightlights ? ' Sì' : ' No'}
                  </p>
                </div>
                <div className="w-full flex justify-center mt-4">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-md p-[1px]"></div>
                    <button
                      className="relative py-3 px-4 rounded-md bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-normal transition-colors duration-200 flex items-center justify-center gap-2"
                      onClick={() => navigate(`/court/${court._id}`)}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4" />
                      Dettagli Campetto
                    </button>
                  </div>
                </div>
                </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
