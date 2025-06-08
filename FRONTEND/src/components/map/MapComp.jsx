import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../src/styles/map-fixes.css';
import { useEffect } from 'react';
import L from 'leaflet';
import MapClickHandler from './MapClickHandler';
import CourtMarkers from './CourtMarkers';
import searchMarkerIcon from '../../assets/search-marker.png';

function MapFlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 15, { animate: true });
    }
  }, [coords, map]);
  return null;
}

function CustomZoomControl() {
  const map = useMap();
  
  useEffect(() => {
    if (map.zoomControl) {
      map.zoomControl.remove();
    }
    const zoomControl = new L.Control.Zoom({
      position: window.innerWidth < 640 ? 'bottomleft' : 'topleft'
    });
    zoomControl.addTo(map);
    const handleResize = () => {
      zoomControl.remove();

      const newZoomControl = new L.Control.Zoom({
        position: window.innerWidth < 640 ? 'bottomleft' : 'topleft'
      });
      
      newZoomControl.addTo(map);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (map && zoomControl) zoomControl.remove();
    };
  }, [map]);
  
  return null;
}

export default function MapComp({ searchedCoords, locationName, onMapClick }) {
  const defaultCenter = [45.4642, 9.19];
  const center = searchedCoords || defaultCenter;
  
  // Icona personalizzata per il marker della posizione cercata
  const searchIcon = new L.Icon({
    iconUrl: searchMarkerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });  return (
    <MapContainer 
      center={center} 
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
      className="leaflet-container"
      zoomControl={false}
      containerProps={{
        tabIndex: -1,
        'aria-hidden': 'true'
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />      <CustomZoomControl />      
      {searchedCoords ? (
        <Marker position={center} icon={searchIcon}>
          <Popup>
            {locationName || 'Posizione cercata'}
          </Popup>
        </Marker>
      ) : (
        <Marker position={center}>
          <Popup>Milano</Popup>
        </Marker>
      )}
      <MapFlyTo coords={searchedCoords} />
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      <CourtMarkers searchedCoords={searchedCoords} />
    </MapContainer>
  );
}