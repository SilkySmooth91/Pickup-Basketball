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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheckCircle, faCalendar, faArrowLeft, faBasketball, faWrench } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import HeaderComp from '../components/utils/HeaderComp';
import Footer from '../components/utils/Footer';
import { CHANGELOG_DATA } from '../data/changelog';

export default function WhatsNewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderComp />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">         
            <div className="flex items-center">
              <FontAwesomeIcon icon={faBasketball} className="text-orange-600 text-3xl mr-3" />
              <h2 className="text-3xl font-bold text-gray-800">Novità</h2>
            </div>
          </div>

          {/* Lista delle versioni */}
          <div className="space-y-6">
            {CHANGELOG_DATA.map((version, index) => (
              <div 
                key={version.version}
                className="bg-white rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg"
              >
                <div className="mb-4">
                  {/* Header responsive: versione + titolo + badge */}
                  <div className="flex items-center mb-2 md:mb-0">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium mr-3">
                      v{version.version}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-800">{version.title}</h2>
                    {index === 0 && (
                      <span className="ml-3 bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">
                        Ultimo
                      </span>
                    )}
                  </div>
                  
                  {/* Data: sotto su mobile, a destra su desktop */}
                  <div className="flex items-center text-gray-500 text-sm md:float-right md:-mt-8">
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    {version.date}
                  </div>
                  
                  {/* Clearfix per il float */}
                  <div className="clear-both"></div>
                </div>

                {/* Features */}
                {version.features && version.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-600 mb-2">
                        <span>
                            <FontAwesomeIcon icon={faBasketball} className='text-green-700 text-sm mr-2'/>
                        </span>  
                        Nuove funzionalità
                    </h4>
                    <ul className="space-y-2">
                      {version.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-gray-700">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm mt-1 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fixes */}
                {version.fixes && version.fixes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-600 mb-2">
                        <span>
                            <FontAwesomeIcon icon={faWrench} className='text-gray-600 text-sm mr-2'/>
                        </span> 
                        Correzioni
                    </h4>
                    <ul className="space-y-2">
                      {version.fixes.map((fix, fixIndex) => (
                        <li key={fixIndex} className="flex items-start text-gray-700">
                          <FontAwesomeIcon icon={faCheckCircle} className="!text-orange-500 text-sm mt-1 mr-3 flex-shrink-0" />
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>            
          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Tieni d'occhio questa pagina per rimanere aggiornato sulle ultime novità!</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
