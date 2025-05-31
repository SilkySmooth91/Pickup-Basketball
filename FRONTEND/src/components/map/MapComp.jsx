import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../src/styles/map-fixes.css';
import { useEffect } from 'react';
import L from 'leaflet';
import MapClickHandler from './MapClickHandler';

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
    return (
    <MapContainer 
      center={center} 
      zoom={13}
      style={{ height: 'calc(100% - 1.5rem)', width: '100%', marginBottom: '1.5rem' }}
      className="absolute inset-0"
      zoomControl={false}
      // Add tabIndex to ensure it doesn't interfere with dropdown navigation
      containerProps={{
        tabIndex: -1,
        'aria-hidden': 'true' // This helps with accessibility and event bubbling
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CustomZoomControl />
      <Marker position={center}>
        <Popup>
          {locationName || (searchedCoords ? 'Località cercata!' : 'Milano')}
        </Popup>
      </Marker>
      <MapFlyTo coords={searchedCoords} />
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
    </MapContainer>
  );
}