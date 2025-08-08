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

import { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getNearbyCourts } from '../../api/courtApi';
import { useAuth } from '../../context/AuthContext';
import basketballMarker from '../../assets/basketball-marker.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from '../utils/FavoriteButton';


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

      // Imposta un timeout per evitare che la richiesta rimanga in sospeso troppo a lungo
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Timeout nella richiesta dei campetti');
      }, 15000); // 15 secondi di timeout

      getNearbyCourts(lat, lng, 5, { accessToken })
        .then(data => {
          clearTimeout(timeoutId);
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
            
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 15
            });
          }
        })
        .catch(err => {
          clearTimeout(timeoutId);
          console.error('Errore nel caricamento dei campetti:', err);
          setError(`Impossibile caricare i campetti vicini. ${err.message || ''}`);
        })
        .finally(() => {
          clearTimeout(timeoutId);
          setLoading(false);
        });
    } else {
      // Resetta lo stato quando non ci sono coordinate
      setCourts([]);
    }

    // Cleanup function per annullare il caricamento quando il componente viene smontato
    return () => {
      setLoading(false);
      setError(null);
    };
  }, [searchedCoords, accessToken, map]);
  if (!searchedCoords) {
    return null;
  }

  // Mostra un messaggio di errore se c'è stato un problema
  if (error) {
    return (
      <div className="error-toast" style={{
        position: 'absolute',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
      }}>
        {error}
      </div>
    );
  }

  // Mostra un indicatore di caricamento
  if (loading) {
    return (
      <div className="loading-toast" style={{
        position: 'absolute',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(34, 139, 230, 0.9)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
      }}>
        Caricamento campetti in corso...
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="info-toast" style={{
        position: 'absolute',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
      }}>
        Nessun campetto trovato in questa zona
      </div>
    );
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
            <Popup className="court-popup-container">
              <div className="court-popup p-5">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <h3 className="font-bold text-2xl text-orange-600 mr-2">{court.name}</h3>
                  <FavoriteButton 
                    courtId={court._id} 
                    courtName={court.name}
                    size="lg"
                    className="flex-shrink-0"
                  />
                </div>
                
                {court.images && court.images.length > 0 && (
                  <div className="my-2">
                    <img 
                      src={court.images[0].url} 
                      alt={court.name} 
                      className="w-full sm:h-30 md:h-40 object-cover rounded"/>
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
                      className="relative py-3 px-4 rounded-md bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-normal transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => navigate(`/court/${court._id}`)}>
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
