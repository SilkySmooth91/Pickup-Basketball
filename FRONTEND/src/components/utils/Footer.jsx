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

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBasketball, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';

export default function Footer({ showAboutLink }) {  return (
    <footer className="bg-transparent p-2 sm:p-4">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-100 mx-auto max-w-4xl p-2 sm:p-4 transform hover:translate-y-[-5px] transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between">            
            <div className="flex items-center mb-1 md:mb-0">
              <FontAwesomeIcon icon={faBasketball} className="text-orange-500 text-sm sm:text-xl mr-1 sm:mr-2" bounce />
              <span className="font-semibold text-orange-600 text-xs sm:text-base">Pickup Basketball</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center">
              <p className="text-center text-gray-600 text-xs sm:text-sm mb-1 md:mb-0">
                &copy; {new Date().getFullYear()} Pickup Basketball. Tutti i diritti riservati.
              </p>
              
              {showAboutLink && (
                <Link to="/about" className="md:ml-10 text-orange-500 hover:text-orange-700 transition-colors flex items-center text-xs sm:text-sm">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                  <span>Scopri come funziona</span>
                </Link>
              )}
            </div>
            
            <div className="flex space-x-3 sm:space-x-4 mt-1 md:mt-0">
              <a href="https://github.com/SilkySmooth91" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 transition-colors">
                <FontAwesomeIcon icon={faGithub} size="1x" className="sm:text-lg" />
              </a>
              <a href="https://www.linkedin.com/in/lorenzo-olivieri-64215157/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 transition-colors">
                <FontAwesomeIcon icon={faLinkedin} size="1x" className="sm:text-lg" />
              </a>            
            </div>
          </div>
        </div>
      </div>
    </footer>  
  );
}
