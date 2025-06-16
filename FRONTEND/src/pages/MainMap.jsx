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

import HeaderComp from '../components/utils/HeaderComp';
import MapComp from '../components/map/MapComp';
import SearchBar from '../components/map/SearchBar';
import Footer from '../components/utils/Footer';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default function MainMap() {
  // Recupera le coordinate e il nome della posizione salvati, o usa null come default
  const [searchedCoords, setSearchedCoords] = useState(() => {
    const savedCoords = localStorage.getItem('mapCoords');
    return savedCoords ? JSON.parse(savedCoords) : null;
  });
  
  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem('mapLocationName') || "";
  });
  
  const handleLocationSelect = (coords, name) => {
    setSearchedCoords(coords);
    setLocationName(name);
    
    // Salva i dati nel localStorage
    localStorage.setItem('mapCoords', JSON.stringify(coords));
    localStorage.setItem('mapLocationName', name);
  };
  
  // Salva le coordinate anche quando si fa click sulla mappa
  const handleMapClick = (coords) => {
    setSearchedCoords(coords);
    setLocationName("");
    localStorage.setItem('mapCoords', JSON.stringify(coords));
    localStorage.setItem('mapLocationName', "");
  };  return (
    <div className="map-page">
      <div className="map-page-header">
        <HeaderComp />
      </div>
      
      <SearchBar onLocationSelect={handleLocationSelect} />
        <div className="w-full h-full">
        <MapComp 
          searchedCoords={searchedCoords} 
          locationName={locationName}
          onMapClick={handleMapClick} />
      </div>
      
      <button 
        onClick={() => window.location.href = "/add-court"}
        className="add-court-button cursor-pointer">
        <FontAwesomeIcon icon={faPlus} />
        <span className="hidden sm:inline">Aggiungi un campetto</span>
      </button>
      
      <div className="map-page-footer">
        <Footer />
      </div>
    </div>
  );
}
