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

// CustomZoomControl è stato rimosso per disabilitare completamente i controlli di zoom

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
      />      
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