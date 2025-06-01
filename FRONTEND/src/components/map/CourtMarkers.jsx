import { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getNearbyCourts } from '../../api/courtApi';
import { useAuth } from '../../context/AuthContext';
import basketballMarker from '../../assets/basketball-marker.png';

// Icona personalizzata per i marker dei campetti
const courtIcon = new L.Icon({
  iconUrl: basketballMarker,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

export default function CourtMarkers({ searchedCoords }) {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();
  const map = useMap();

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
            icon={courtIcon}
          >
            <Popup>
              <div className="court-popup">
                <h3 className="font-bold text-lg text-orange-600">{court.name}</h3>
                <p className="text-gray-600">{court.address}</p>
                <div className="text-sm mt-2">
                  <p><span className="font-semibold">Canestri:</span> {court.baskets}</p>
                  <p>
                    <span className="font-semibold">Dimensioni regolamentari:</span> 
                    {court.officialsize ? ' Sì' : ' No'}
                  </p>
                  <p>
                    <span className="font-semibold">Illuminazione notturna:</span> 
                    {court.nightlights ? ' Sì' : ' No'}
                  </p>
                </div>
                {court.images && court.images.length > 0 && (
                  <div className="mt-2">
                    <img 
                      src={court.images[0].url} 
                      alt={court.name} 
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
