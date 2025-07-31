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

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faUser, faUserPlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFriends, getReceivedFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../../api/friendApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/utils/LoadingSpinner';
import ImageWithFallback from '../../components/utils/ImageWithFallback';

export default function FriendsModalComp({ isOpen, onClose, isOwner, profileId }) {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const { accessToken, refresh } = useAuth();
  
  // Fetch friends and friend requests
  useEffect(() => {
    if (isOpen) {
      fetchFriendsData();
    }
  }, [isOpen, accessToken, profileId, isOwner]);

  const fetchFriendsData = async () => {
    if (!accessToken || !profileId) return;
    setLoadingFriends(true);
    try {
      let friendsData = [];
      let requestsData = [];
      friendsData = await getFriends(profileId, { accessToken, refresh });
      if (isOwner) {
        requestsData = await getReceivedFriendRequests({ accessToken, refresh });
      }
      setFriends(friendsData);      setFriendRequests(requestsData);
    } catch (err) {
      toast.error('Errore nel caricamento degli amici');
      // Gestione silenziosa dell'errore
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleAcceptFriend = async (requestId) => {
    try {
      await acceptFriendRequest(requestId, { accessToken, refresh });
      toast.success('Richiesta accettata!');
      fetchFriendsData(); // Refresh data
    } catch (err) {
      toast.error('Errore nell\'accettare la richiesta');      // Gestione silenziosa dell'errore
    }
  };

  const handleRejectFriend = async (requestId) => {
    try {
      await rejectFriendRequest(requestId, { accessToken, refresh });
      toast.success('Richiesta rifiutata');
      fetchFriendsData(); // Refresh data
    } catch (err) {
      toast.error('Errore nel rifiutare la richiesta');      // Gestione silenziosa dell'errore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:w-11/12 md:w-full max-w-lg relative h-[70vh] max-h-[80vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose} aria-label="Chiudi">×</button>
        <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faUsers} className="mr-2 text-orange-600"/>
            <h2 className="text-xl font-bold text-gray-600">Lista Amici</h2>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 cursor-pointer ${activeTab === 'friends' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('friends')}>
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Amici
          </button>
          {isOwner && (
            <button 
              className={`px-4 py-2 cursor-pointer ${activeTab === 'requests' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('requests')}>
                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              Richieste
              {friendRequests.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {friendRequests.length}
                </span>
              )}
            </button>
          )}
        </div>
        
        {/* Lista amici */}        
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {loadingFriends ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nessun amico da mostrare</div>
            ) : (
              friends.map(friend => (
                <Link 
                  key={friend._id} 
                  to={`/profile/${friend._id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition"
                  onClick={onClose}                >
                  <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                    {friend.avatar ? (
                      <ImageWithFallback src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-200">
                        <FontAwesomeIcon icon={faUser} className="text-orange-500" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{friend.username}</div>
                    <div className="text-sm text-gray-500">{friend.email}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
        
        {/* Lista richieste */}        
        {activeTab === 'requests' && isOwner && (
          <div className="space-y-4">
            {loadingFriends ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : friendRequests.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nessuna richiesta di amicizia</div>
            ) : (
              friendRequests.map(request => (
                <div key={request._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100">                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                      {request.from && request.from.avatar ? (
                        <ImageWithFallback 
                          src={request.from.avatar} 
                          alt={request.from.username || 'Utente'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-200">
                          <FontAwesomeIcon icon={faUser} className="text-orange-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{request.from ? request.from.username : 'Utente sconosciuto'}</div>
                      <div className="text-sm text-gray-500">{request.from ? request.from.email : ''}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAcceptFriend(request._id)} 
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 px-3 cursor-pointer"
                      title="Accetta"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button 
                      onClick={() => handleRejectFriend(request._id)} 
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 px-3 cursor-pointer"
                      title="Rifiuta"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}