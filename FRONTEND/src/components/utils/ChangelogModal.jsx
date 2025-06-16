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
import { faClose, faWrench, faCheckCircle, faBasketball } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/newLogo.jpg';
import { CURRENT_CHANGELOG_VERSION, CHANGELOG_DATA } from '../../data/changelog';

export { CURRENT_CHANGELOG_VERSION };

export default function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const latestVersion = CHANGELOG_DATA[0];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-full max-w-md p-6 md:mt-8 relative max-h-[70vh] overflow-y-auto">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
          onClick={onClose}>
          <FontAwesomeIcon icon={faClose} className="text-xl" />
        </button>        
        <div className="flex items-center mb-4">
          <img 
            src={logo} 
            alt="Pickup Basketball Logo" 
            className="w-16 h-14 rounded-lg mr-3 object-cover"
          />
          <div>
            <h2 className="text-2xl text-orange-600 font-semibold">Novità!</h2>
            <p className="text-sm text-gray-600">Versione {latestVersion.version}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">{latestVersion.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{latestVersion.date}</p>
            
            {latestVersion.features && latestVersion.features.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-600 mb-2">
                    <span>
                        <FontAwesomeIcon icon={faBasketball} className='text-green-700 text-sm mr-2'/>
                    </span>  
                    Nuove funzionalità
                </h4>
                <ul className="space-y-1">
                  {latestVersion.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xs mt-1 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {latestVersion.fixes && latestVersion.fixes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-600 mb-2">
                    <span>
                        <FontAwesomeIcon icon={faWrench} className='text-gray-600 text-sm mr-2'/>
                    </span> 
                    Correzioni
                </h4>
                <ul className="space-y-1">
                  {latestVersion.fixes.map((fix, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-orange-500 text-xs mt-1 mr-2 flex-shrink-0" />
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md shadow-sm hover:from-orange-600 hover:to-red-600 transition-colors cursor-pointer">
            Perfetto!
          </button>
        </div>
      </div>
    </div>
  );
}
