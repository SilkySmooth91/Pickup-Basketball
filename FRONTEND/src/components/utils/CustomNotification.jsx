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

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faInfoCircle, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

let notificationId = 0;
const notifications = [];
let setNotifications = null;

// API per mostrare notifiche
export const customNotify = {
  success: (message) => showNotification(message, 'success'),
  error: (message) => showNotification(message, 'error'),
  info: (message) => showNotification(message, 'info'),
  warning: (message) => showNotification(message, 'warning')
};

function showNotification(message, type) {
  const id = ++notificationId;
  const notification = { id, message, type, timestamp: Date.now() };
  
  notifications.push(notification);
  if (setNotifications) {
    setNotifications([...notifications]);
  }
  
  // Auto rimozione dopo 3.5 secondi
  setTimeout(() => {
    removeNotification(id);
  }, 3500);
}

function removeNotification(id) {
  const index = notifications.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.splice(index, 1);
    if (setNotifications) {
      setNotifications([...notifications]);
    }
  }
}

const typeConfig = {
  success: {
    icon: faCheckCircle,
    bgColor: 'bg-green-500',
    textColor: 'text-white'
  },
  error: {
    icon: faTimesCircle,
    bgColor: 'bg-red-500',
    textColor: 'text-white'
  },
  info: {
    icon: faInfoCircle,
    bgColor: 'bg-blue-500',
    textColor: 'text-white'
  },
  warning: {
    icon: faExclamationTriangle,
    bgColor: 'bg-yellow-500',
    textColor: 'text-white'
  }
};

export default function CustomNotification() {
  const [notificationList, setNotificationList] = useState([]);
  
  useEffect(() => {
    setNotifications = setNotificationList;
    setNotificationList([...notifications]);
    
    return () => {
      setNotifications = null;
    };
  }, []);
  
  if (notificationList.length === 0) return null;
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] pointer-events-none">
      <div className="flex flex-col gap-2">
        {notificationList.map((notification) => {
          const config = typeConfig[notification.type];
          return (
            <div
              key={notification.id}
              className={`
                ${config.bgColor} ${config.textColor}
                px-4 py-3 rounded-lg shadow-lg
                flex items-center gap-3
                animate-slide-in
                max-w-md
                pointer-events-auto
              `}
            >
              <FontAwesomeIcon icon={config.icon} className="flex-shrink-0" />
              <span className="flex-1 text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
