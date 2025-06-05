import HeaderComp from '../components/utils/HeaderComp';
import MapComp from '../components/map/MapComp';
import SearchBar from '../components/map/SearchBar';
import { useState, useEffect } from 'react';

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
  };
  
  return (
    <div className="h-screen flex flex-col">
      <HeaderComp />
      <div className="relative flex-1">
        <SearchBar onLocationSelect={handleLocationSelect} />
        
        <div className="absolute inset-0">
          <MapComp 
            searchedCoords={searchedCoords} 
            locationName={locationName}
            onMapClick={handleMapClick} 
          />
        </div>
      </div>
    </div>
  );
}
