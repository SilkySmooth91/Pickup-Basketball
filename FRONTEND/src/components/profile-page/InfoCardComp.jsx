import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function InfoCardComp({ profile }) {
  const { user, accessToken } = useAuth();
  const [userProfile, setUserProfile] = useState(profile);

  useEffect(() => {
    if (!user?.id || !accessToken) return;

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/users/${user.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => setUserProfile(data));
  }, [user, accessToken]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Card principale */}
      <div className="w-full md:w-3/4 bg-white rounded-lg shadow-xl p-6 min-w-[260px] border-orange-500 border border-l-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-lg">Informazioni</div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <span className="font-semibold text-gray-600">Email:</span>
          <span className="text-gray-700">{userProfile?.email || "email@email.com"}</span>
          <button className="w-auto mt-2 md:mt-0 md:ml-4 px-3 py-2 font-semibold bg-orange-500 text-white rounded hover:bg-orange-600 transition text-sm">
            Cambia password
          </button>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div>
            <span className="font-semibold text-gray-600">Altezza: </span>
            <span className="text-gray-800">{userProfile?.height || "185 cm"}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Ruolo: </span>
            <span className="text-gray-800">{userProfile?.basketrole || "Playmaker"}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Migliore caratteristica: </span>
            <span className="text-gray-800">{userProfile?.bestskill || "Velocità"}</span>
          </div>
        </div>
      </div>

      {/* Colonna delle due card piccole */}
      <div className="flex flex-row md:flex-col gap-4 w-full md:w-1/4">
        {/* Card eventi */}
        <div className="flex-1 flex flex-col items-center bg-white rounded-lg shadow-xl p-4 min-w-[120px] border-orange-500 border border-l-6">
            <FontAwesomeIcon icon={faTrophy} className="text-orange-500 text-3xl mb-2" />
          <div className="text-3xl font-bold text-black">{userProfile?.userEvents?.length ?? 0}</div>
          <div className="text-gray-600 text-base mt-1 text-center">Partecipazioni a eventi</div>
        </div>
        {/* Card amici */}
        <div className="flex-1 bg-white rounded-lg shadow-xl p-4 flex flex-col items-center min-w-[120px] border-orange-500 border border-l-6">
            <FontAwesomeIcon icon={faUserGroup} className="text-orange-500 text-3xl mb-2"/>
          <div className="text-3xl font-bold text-black">{userProfile?.friendsCount ?? 0}</div>
          <div className="text-gray-600 text-base mt-1 text-center">Amici</div>
        </div>
      </div>
    </div>
  );
}
