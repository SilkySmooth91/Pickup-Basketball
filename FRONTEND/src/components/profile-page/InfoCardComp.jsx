import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

export default function InfoCardComp({ profile, isOwner }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full mb-8">
      {/* Card principale */}
      <div className="w-full md:w-3/4 bg-white rounded-lg shadow-xl min-w-[260px] border-orange-500 border-l-6">
        <div className="bg-gradient-to-r from-orange-100 to-red-200 rounded-t-lg p-4">
          <FontAwesomeIcon icon={faEnvelope} className="text-xl text-orange-500 pl-2" />
          <span className="font-semibold text-2xl mb-4 p-4 pl-3">Informazioni</span>
        </div>
        <div className="p-6">
          {/* Email e azioni solo per il proprietario */}
          {isOwner ? (
            <div className="flex flex-col md:flex-row md:items-center justify-start mb-4 pb-4 border-b border-gray-200">
              <div>
                <span className="font-semibold text-gray-600 ">Email: </span>
                <span className="text-gray-700">{profile?.email || "email@email.com"}</span>
              </div>
              <button className="w-auto mt-2 md:mt-0 md:ml-4 px-3 py-2 font-semibold bg-orange-500 text-white rounded hover:bg-orange-600 transition text-sm">
                Cambia password
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 mt-2">
            <div>
              <span className="font-semibold text-gray-600">Altezza: </span>
              <span className="text-gray-800">{profile?.height || "185 cm"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Ruolo: </span>
              <span className="text-white bg-orange-600 py-1 px-2 rounded-2xl text-center font-semibold">{profile?.basketrole || "Playmaker"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Migliore caratteristica: </span>
              <span className="text-gray-800">{profile?.bestskill || "Velocità"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Colonna delle due card piccole */}
      <div className="flex flex-row md:flex-col gap-4 w-full md:w-1/4">
        {/* Card eventi */}
        <div className="flex-1 flex flex-col items-center bg-white rounded-lg shadow-xl p-4 min-w-[120px] border-orange-500 border border-l-6">
          <FontAwesomeIcon icon={faTrophy} className="text-orange-500 text-3xl mb-2" />
          <div className="text-3xl font-bold text-black">{profile?.userEvents?.length ?? 0}</div>
          <div className="text-gray-600 text-base mt-1 text-center">Partecipazioni a eventi</div>
        </div>
        {/* Card amici */}
        <div className="flex-1 bg-white rounded-lg shadow-xl p-4 flex flex-col items-center min-w-[120px] border-orange-500 border border-l-6">
          <FontAwesomeIcon icon={faUserGroup} className="text-orange-500 text-3xl mb-2" />
          <div className="text-3xl font-bold text-black">{profile?.friendsCount ?? 0}</div>
          <div className="text-gray-600 text-base mt-1 text-center">Amici</div>
        </div>
      </div>
    </div>
  );
}
