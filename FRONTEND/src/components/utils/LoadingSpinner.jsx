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

import '../../styles/BasketballSpinner.css';
import basketballImage from '../../assets/basketball-marker.png';

export default function LoadingSpinner({ size = "default", showText = true }) {
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "scale-50 w-4 h-4";
      case "md":
        return "scale-75 w-6 h-6";
      case "lg":
        return "scale-100 w-8 h-8";
      default:
        return "scale-100 w-8 h-8";
    }
  };

  return (
    <div className={`flex items-center justify-center ${size === "default" ? "min-h-screen" : ""} bg-transparent`}>
      <div className="flex flex-col items-center">
        <div className={`basketball-spinner-container ${size !== "default" ? "mb-0" : "mb-4"} ${getSizeClass()}`}>
          <img 
            src={basketballImage} 
            alt="Basketball" 
            className="basketball-spinner-ball"/>
          <div className="basketball-spinner-shadow"></div>
        </div>
        {showText && size === "default" && <span className="text-gray-700">Caricamento...</span>}
      </div>
    </div>
  );
}
