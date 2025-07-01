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

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes, faUser, faCalendarAlt, faBasketball } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../context/fetchWithAuth';
import { toast } from 'react-toastify';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { accessToken, refresh, logout } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetchWithAuth(
        `${API_URL}/notifications`,
        { method: 'GET' },
        { accessToken, refresh, logout }
      );
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Errore nel caricamento notifiche:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!accessToken || !notificationId) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetchWithAuth(
        `${API_URL}/notifications/${notificationId}/read`,
        { method: 'PATCH' },
        { accessToken, refresh, logout }
      );
      
      if (res.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Errore nel segnare notifica come letta:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!accessToken) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetchWithAuth(
        `${API_URL}/notifications/mark-all-read`,
        { method: 'PATCH' },
        { accessToken, refresh, logout }
      );
      
      if (res.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
        toast.success('Tutte le notifiche sono state segnate come lette');
      }
    } catch (err) {
      console.error('Errore nel segnare tutte come lette:', err);
      toast.error('Errore nel segnare le notifiche come lette');
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [accessToken]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return faUser;
      case 'event_invitation':
        return faCalendarAlt;
      case 'event_update':
        return faCalendarAlt;
      case 'court_favorite':
        return faBasketball;
      default:
        return faBell;
    }
  };

  // Format notification time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        className="relative flex items-center justify-center p-2 text-gray-600 hover:text-orange-600 focus:outline-none transition-colors"
        onClick={() => {
          setDropdownOpen(!dropdownOpen);
          if (!dropdownOpen) {
            fetchNotifications();
          }
        }}
        aria-label="Notifiche"
      >
        <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden"
          style={{ zIndex: 9999 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notifiche</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                Segna tutte come lette
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <FontAwesomeIcon icon={faBell} className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nessuna notifica</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 p-2 rounded-full ${
                      !notification.read ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <FontAwesomeIcon 
                        icon={getNotificationIcon(notification.type)} 
                        className={`w-4 h-4 ${
                          !notification.read ? 'text-orange-600' : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        !notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                className="w-full text-center text-sm text-orange-600 hover:text-orange-800 font-medium"
                onClick={() => {
                  fetchNotifications(); // Ricarica per mostrare più notifiche
                }}
              >
                Ricarica notifiche
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
