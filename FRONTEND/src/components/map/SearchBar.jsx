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

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function SearchBar({ onLocationSelect }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [mobileDropdownActive, setMobileDropdownActive] = useState(false);
  // Controlla se il dropdown è aperto per modificare lo z-index della barra di ricerca
  useEffect(() => {
    // Flag per gestire il rilevamento dei dropdown
    const handleBodyClick = (e) => {
      // Se c'è un dropdown aperto, imposta lo stato per abbassare lo z-index della barra di ricerca
      const dropdownsAreOpen = document.querySelector('.dropdown-menu') !== null;
      const mobileMenuIsOpen = document.querySelector('.mobile-menu-open') !== null;
      
      setMobileDropdownActive(dropdownsAreOpen || mobileMenuIsOpen);
    };
    
    document.body.addEventListener('click', handleBodyClick);
    
    return () => {
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, []);

  async function performSearch(query, shouldUpdateCoords = false) {
    if (!query) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchTerm = query.length < 4 ? `${query}*` : query;
      
      const searchUrl = `https://nominatim.openstreetmap.org/search?` + 
        `format=json&q=${encodeURIComponent(searchTerm)}&` +
        `addressdetails=1&limit=10&polygon_geojson=0&countrycodes=it`;
      
      const res = await fetch(searchUrl);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const isCityLike = (result) => {
          let score = 0;
          
          const placeTypeScores = {
            'city': 10,
            'town': 9,
            'village': 8,
            'administrative': 7,
            'suburb': 6,
            'county': 5,
            'state': 4
          };
          
          if (result.type && placeTypeScores[result.type]) {
            score += placeTypeScores[result.type];
          }
          
          if (result.class === 'highway' || result.class === 'railway') {
            score -= 5;
          }
          
          if (result.address) {
            if (result.address.city || result.address.town || result.address.village) {
              score += 3;
            }
          }
          
          if (result.place_rank) {
            score += Math.max(0, (30 - result.place_rank) / 3);
          }
          
          const firstNamePart = result.display_name.split(',')[0].toLowerCase().trim();
          if (firstNamePart === query.toLowerCase()) {
            score += 5;
          } else if (firstNamePart.startsWith(query.toLowerCase())) {
            score += 3;
          }
          
          return score;
        };

        const scoredResults = data.map(result => ({
          ...result,
          cityScore: isCityLike(result)
        }));
        
        let filteredResults = scoredResults.filter(result => {
          if (result.cityScore < 0) return false;
          
          if (query.length < 4 && (result.type === 'stop' || result.class === 'railway')) {
            return false;
          }
          
          return true;
        });
        
        if (filteredResults.length === 0 && scoredResults.length > 0) {
          filteredResults = scoredResults;
        }

        const sortedResults = filteredResults.sort((a, b) => {
          return b.cityScore - a.cityScore;
        });
        
        setSearchResults(sortedResults);
        
        if (shouldUpdateCoords && sortedResults.length > 0) {
          const result = sortedResults[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          
          if (!isNaN(lat) && !isNaN(lon)) {
            onLocationSelect([lat, lon], result.name || result.display_name.split(',')[0]);
          }
        }
        
        setShowResults(!shouldUpdateCoords && sortedResults.length > 0); 
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Errore nella ricerca:", error);
    } finally {
      setIsSearching(false);
    }
  }  const handleSearch = (e) => {
    e.preventDefault();
    if (!search) return;
    
  
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    
    performSearch(search, true);
    setShowResults(false);
    setSearch("");
  }
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (value.length > 2) {
      setTypingTimeout(
        setTimeout(() => {
          performSearch(value, false);
        }, 500)
      );
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      onLocationSelect([lat, lon], result.name || result.display_name.split(',')[0]);
      setSearch("");
      setShowResults(false);
    }
  };  return (
    <div className={`fixed left-1/2 transform -translate-x-1/2 search-bar-container ${mobileDropdownActive ? 'mobile-dropdown-active' : ''}`} style={{ top: '4rem', zIndex: 'var(--z-search-bar)', marginBottom: 0 }}>
      <div className="relative">
        <form
          onSubmit={handleSearch}
          className="bg-white shadow-xl rounded-full flex items-center p-2 gap-2 border border-orange-200 mx-4"
          style={{ width: '90vw', maxWidth: '28rem', marginBottom: 0 }}
        >
          <input
            type="text"
            placeholder="Cerca una località..."
            value={search}
            onChange={handleInputChange}
            className="flex-1 border border-orange-300 rounded-3xl p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button 
            type="submit" 
            className="relative py-3 px-3 rounded-full
                      bg-gradient-to-r from-orange-500 to-red-500
                      hover:from-orange-600 hover:to-red-600
                      text-white font-normal
                      transition-colors duration-200
                      flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>
        
        {showResults && (
          <div 
            className="absolute left-4 right-4 bg-white shadow-xl rounded-xl mt-2 border border-orange-200 max-h-60 overflow-y-auto"
            style={{ top: 'calc(100% - 5px)', zIndex: 'var(--z-search-results)' }}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => selectResult(result)}
                className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 text-sm"
              >
                <div className="font-medium">{result.display_name.split(',')[0]}</div>
                <div className="text-gray-500 text-xs truncate">{result.display_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
