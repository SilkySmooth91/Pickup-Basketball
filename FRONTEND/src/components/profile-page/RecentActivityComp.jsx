import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from "@fortawesome/free-solid-svg-icons";

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
        <div>
          <h3 className="font-semibold mb-2">Ultimi eventi</h3>
          <ul>
            {activity.recentEvents.length === 0 && (
              <li className="text-gray-400">Nessun evento recente</li>
            )}
            {activity.recentEvents.map(ev => (
              <li key={ev._id}>
                {ev.title} - {new Date(ev.datetime).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Amici aggiunti di recente</h3>
          <ul>
            {activity.recentFriends.length === 0 && (
              <li className="text-gray-400">Nessun amico aggiunto di recente</li>
            )}
            {activity.recentFriends.map(friend => (
              <li key={friend._id}>{friend.username}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}