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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderComp from "../components/utils/HeaderComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketball, faMapMarkerAlt, faStar, faRulerCombined, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { getFavoriteCourts } from "../api/favoritesApi";
import LoadingSpinner from '../components/utils/LoadingSpinner';
import Footer from '../components/utils/Footer';
import FavoriteButton from '../components/utils/FavoriteButton';

export default function FavoriteCourts() {
  const { user, accessToken, refresh, logout } = useAuth();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Crea l'oggetto auth
  const auth = { accessToken, refresh, logout };

  useEffect(() => {
    const fetchFavoriteCourts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user || !accessToken) {
          setCourts([]);
          setLoading(false);
          return;
        }
        
        const data = await getFavoriteCourts(auth);
        setCourts(data.favoriteCourts || []);
        
      } catch (err) {
        console.error('Errore nel caricamento dei campetti preferiti:', err);
        setError(err.message || 'Errore nel caricamento dei campetti preferiti');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteCourts();
  }, [user, accessToken]);

  // Funzione per aggiornare la lista quando un campetto viene rimosso dai preferiti
  const handleFavoriteChange = (courtId, isFavorite) => {
    if (!isFavorite) {
      // Se è stato rimosso dai preferiti, rimuovilo dalla lista
      setCourts(prevCourts => prevCourts.filter(court => court._id !== courtId));
    }
  };

  const handleCourtClick = (courtId) => {
    navigate(`/court/${courtId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <HeaderComp />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Accesso richiesto</h1>
            <p className="text-gray-600 mb-6">Devi effettuare l'accesso per vedere i tuoi campetti preferiti.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Vai al Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderComp />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-3xl mr-4" />
            <h1 className="text-3xl font-bold text-gray-800">I tuoi campetti preferiti</h1>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faBasketball} className="text-red-400 text-xl" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Errore nel caricamento</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-md text-sm transition-colors">
                  Riprova
                </button>
              </div>
            </div>
          )}

          {!loading && !error && courts.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FontAwesomeIcon icon={faStar} className="text-gray-300 text-6xl mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Nessun campetto preferito</h2>
              <p className="text-gray-500 mb-6">
                Non hai ancora nessun campetto preferito. Inizia a esplorare e aggiungi i tuoi campetti preferiti!
              </p>
              <button 
                onClick={() => navigate('/map')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center">
                <FontAwesomeIcon icon={faBasketball} className="mr-2" />
                Esplora campetti
              </button>
            </div>
          )}

          {!loading && !error && courts.length > 0 && (
            <div className="space-y-6">
              <div className="text-sm text-gray-600 mb-4">
                {courts.length} campett{courts.length !== 1 ? 'i' : 'o'} preferit{courts.length !== 1 ? 'i' : 'o'}
              </div>
              
              {courts.map((court) => (
                <div 
                  key={court._id}
                  onClick={() => handleCourtClick(court._id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-orange-500">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="text-xl font-semibold text-gray-800 mr-3">{court.name}</h3>
                          <FavoriteButton 
                            courtId={court._id} 
                            courtName={court.name}
                            size="md"
                            className="flex-shrink-0"
                            onFavoriteChange={handleFavoriteChange}/>
                        </div>
                        
                        <div className="flex items-center text-gray-600 mb-4">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500 mr-2" />
                          <span className="text-sm">{court.address}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faBasketball} className="text-orange-500 mr-2 w-4" />
                            <span className="font-medium mr-1">Canestri:</span>
                            <span>{court.baskets}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faRulerCombined} className="text-orange-500 mr-2 w-4" />
                            <span className="font-medium mr-1">Dimensioni ufficiali:</span>
                            <span className={court.officialsize ? 'text-green-600' : 'text-red-600'}>
                              {court.officialsize ? 'Sì' : 'No'}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faLightbulb} className="text-orange-500 mr-2 w-4" />
                            <span className="font-medium mr-1">Illuminazione:</span>
                            <span className={court.nightlights ? 'text-green-600' : 'text-red-600'}>
                              {court.nightlights ? 'Sì' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {court.images && court.images.length > 0 && (
                        <div className="ml-6 flex-shrink-0">
                          <img 
                            src={court.images[0].url} 
                            alt={court.name}
                            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
