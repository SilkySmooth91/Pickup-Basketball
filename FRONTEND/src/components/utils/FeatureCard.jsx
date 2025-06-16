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

/**
 * Componente riutilizzabile per le schede delle caratteristiche dell'app
 * 
 * @param {object} props - Le props del componente
 * @param {object} props.icon - L'icona FontAwesome da visualizzare 
 * @param {string} props.title - Il titolo della caratteristica
 * @param {string} props.description - La descrizione della caratteristica
 * @returns {JSX.Element} Scheda della caratteristica
 */
export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-orange-100 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mr-4">
          <FontAwesomeIcon icon={icon} className="text-2xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 ml-16">{description}</p>
    </div>
  );
}
