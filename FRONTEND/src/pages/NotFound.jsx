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

import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBasketball, faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';
import HeaderComp from '../components/utils/HeaderComp';
import Footer from '../components/utils/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderComp />
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center flex-grow">
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-xl border-orange-500 border-l-4 py-12 px-8">
            <div className="animate-bounce mb-8">
              <FontAwesomeIcon 
                icon={faBasketball} 
                className="text-8xl text-orange-500"
                style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
              />
            </div>
            
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-orange-600 mb-6">Pagina non trovata</h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Ops! Sembra che tu abbia perso palla.
              <br />
              La pagina che stai cercando non esiste.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                to="/"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md shadow-md hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center">
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Torna alla Home
              </Link>
              
              <button 
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md shadow-md hover:bg-gray-200 transition-all flex items-center justify-center cursor-pointer">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Torna indietro
              </button>
            </div>          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
