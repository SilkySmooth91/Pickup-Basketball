import HeaderComp from '../components/utils/HeaderComp';
import MapComp from '../components/map/MapComp';
import SearchBar from '../components/map/SearchBar';
import { useState } from 'react';

export default function MainMap() {
  const [searchedCoords, setSearchedCoords] = useState(null);
  const [locationName, setLocationName] = useState("");
  
  const handleLocationSelect = (coords, name) => {
    setSearchedCoords(coords);
    setLocationName(name);
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
            onMapClick={(coords) => {
              setSearchedCoords(coords);
              setLocationName("");
            }} 
          />
        </div>
      </div>
    </div>
  );
}
