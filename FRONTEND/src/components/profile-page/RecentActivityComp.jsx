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
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faTrophy } from "@fortawesome/free-solid-svg-icons";
import ImageWithFallback from '../utils/ImageWithFallback';
import { Link } from 'react-router-dom';

export default function RecentActivityComp({ userId }) {
  const { accessToken } = useAuth();
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/recent-activity`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(setActivity);
  }, [userId, accessToken]);

  if (!activity) return <div>Caricamento attività recente...</div>;

  return (
    <div className="w-full bg-white rounded-lg shadow-xl min-w-[260px] border-orange-500 border-l-6 ">
      <div className="bg-gradient-to-r from-orange-100 to-red-200 rounded-t-lg p-4">
        <FontAwesomeIcon icon={faChartLine} className="text-xl text-orange-500 pl-2" />    
        <span className="font-semibold text-2xl mb-4 p-4 pl-3">Attività recente</span>
      </div>
      <div className="p-6">
        {/* Sezione Eventi Recenti */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4 text-gray-800">Ultimi 3 eventi</h3>
          {activity.recentEvents.length === 0 ? (
            <p className="text-gray-400 italic">Nessun evento recente</p>
          ) : (
            <div className="space-y-3">
              {activity.recentEvents.slice(0, 3).map(event => (
                <Link 
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 border border-gray-100 hover:border-orange-200 group"
                >
                  {/* Icona Evento */}
                  <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors duration-200">
                    <FontAwesomeIcon icon={faTrophy} className="text-orange-600 text-lg" />
                  </div>
                  
                  {/* Info Evento */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors duration-200 truncate">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.datetime).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })} alle {new Date(event.datetime).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sezione Amici Recenti */}
        <div>
          <h3 className="font-semibold mb-4 text-gray-800">Ultimi 3 amici aggiunti</h3>
          {activity.recentFriends.length === 0 ? (
            <p className="text-gray-400 italic">Nessun amico aggiunto di recente</p>
          ) : (
            <div className="space-y-3">
              {activity.recentFriends.slice(0, 3).map(friend => (
                <Link 
                  key={friend._id}
                  to={`/profile/${friend._id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 border border-gray-100 hover:border-orange-200 group"
                >
                  {/* Avatar Amico */}
                  <div className="w-11 h-11 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                    <ImageWithFallback
                      src={friend.avatar}
                      alt={friend.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info Amico */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors duration-200 truncate">
                      {friend.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {friend.city ? `${friend.city}` : 'Città non specificata'}
                      {friend.age ? ` • ${friend.age} anni` : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}