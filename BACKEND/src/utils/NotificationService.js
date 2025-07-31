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

import Notification from '../models/NotificationSchema.js';
import Users from '../models/UsersSchema.js';

// Servizio per creare notifiche automatiche
class NotificationService {
  
  // Notifica per richiesta di amicizia
  static async createFriendRequestNotification(senderId, recipientId) {
    try {
      console.log('Creando notifica richiesta amicizia:', { senderId, recipientId });
      
      // Recupera le informazioni del mittente
      const sender = await Users.findById(senderId).select('username');
      if (!sender) {
        throw new Error('Utente mittente non trovato');
      }
      
      const notification = await Notification.createNotification({
        recipient: recipientId,
        sender: senderId,
        type: 'friend_request',
        title: 'Nuova richiesta di amicizia',
        message: `${sender.username} ti ha inviato una richiesta di amicizia`,
        data: {
          senderId: senderId,
          senderUsername: sender.username
        },
        actionUrl: '/profile'
      });
      
      console.log('Notifica richiesta amicizia creata:', notification._id);
      return notification;
    } catch (error) {
      console.error('Errore nella creazione notifica richiesta amicizia:', error);
      throw error;
    }
  }

  // Notifica per richiesta di amicizia accettata
  static async createFriendAcceptedNotification(accepterId, requesterId) {
    try {
      // Recupera le informazioni di chi ha accettato
      const accepter = await Users.findById(accepterId).select('username');
      if (!accepter) {
        throw new Error('Utente che ha accettato non trovato');
      }
      
      const notification = await Notification.createNotification({
        recipient: requesterId,
        sender: accepterId,
        type: 'friend_accepted',
        title: 'Richiesta di amicizia accettata!',
        message: `${accepter.username} ha accettato la tua richiesta di amicizia!`,
        data: {
          accepterId: accepterId,
          accepterUsername: accepter.username
        },
        actionUrl: '/profile'
      });
      
      console.log('Notifica amicizia accettata creata:', notification._id);
      return notification;
    } catch (error) {
      console.error('Errore nella creazione notifica amicizia accettata:', error);
      throw error;
    }
  }

  // Notifica per invito a evento
  static async createEventInvitationNotification(senderId, recipientId, eventId, eventTitle) {
    try {
      // Recupera le informazioni di chi ha inviato l'invito
      const sender = await Users.findById(senderId).select('username');
      if (!sender) {
        throw new Error('Utente che ha inviato l\'invito non trovato');
      }
      
      const notification = await Notification.createNotification({
        recipient: recipientId,
        sender: senderId,
        type: 'event_invitation',
        title: 'Sei stato invitato ad un evento!',
        message: `${sender.username} ti ha appena invitato ad un evento: ${eventTitle}`,
        data: {
          eventId: eventId,
          eventTitle: eventTitle,
          senderUsername: sender.username
        },
        actionUrl: `/events/${eventId}`
      });
      
      console.log('Notifica invito evento creata:', notification._id);
      return notification;
    } catch (error) {
      console.error('Errore nella creazione notifica invito evento:', error);
      throw error;
    }
  }

  // Notifica per aggiornamento evento
  static async createEventUpdateNotification(eventId, eventTitle, participantIds, updateMessage) {
    try {
      const notifications = [];
      
      for (const participantId of participantIds) {
        const notification = await Notification.createNotification({
          recipient: participantId,
          sender: null, // Notifica di sistema
          type: 'event_update',
          title: 'Aggiornamento evento',
          message: `L'evento "${eventTitle}" è stato aggiornato: ${updateMessage}`,
          data: {
            eventId: eventId,
            eventTitle: eventTitle,
            updateMessage: updateMessage
          },
          actionUrl: `/events/${eventId}`
        });
        
        notifications.push(notification);
      }
      
      console.log(`${notifications.length} notifiche aggiornamento evento create`);
      return notifications;
    } catch (error) {
      console.error('Errore nella creazione notifiche aggiornamento evento:', error);
      throw error;
    }
  }

  // Notifica per evento cancellato
  static async createEventCancelledNotification(eventId, eventTitle, participantIds, reason = '') {
    try {
      const notifications = [];
      
      for (const participantId of participantIds) {
        const notification = await Notification.createNotification({
          recipient: participantId,
          sender: null, // Notifica di sistema
          type: 'event_cancelled',
          title: 'Evento cancellato',
          message: `L'evento "${eventTitle}" è stato cancellato. ${reason}`,
          data: {
            eventId: eventId,
            eventTitle: eventTitle,
            reason: reason
          },
          actionUrl: '/events'
        });
        
        notifications.push(notification);
      }
      
      console.log(`${notifications.length} notifiche cancellazione evento create`);
      return notifications;
    } catch (error) {
      console.error('Errore nella creazione notifiche cancellazione evento:', error);
      throw error;
    }
  }

  // Notifica promemoria evento (1 ora prima)
  static async createEventReminderNotification(eventId, eventTitle, participantIds) {
    try {
      const notifications = [];
      
      for (const participantId of participantIds) {
        const notification = await Notification.createNotification({
          recipient: participantId,
          sender: null, // Notifica di sistema
          type: 'event_reminder',
          title: 'Promemoria evento',
          message: `L'evento "${eventTitle}" inizia tra un'ora!`,
          data: {
            eventId: eventId,
            eventTitle: eventTitle
          },
          actionUrl: `/events/${eventId}`
        });
        
        notifications.push(notification);
      }
      
      console.log(`${notifications.length} notifiche promemoria evento create`);
      return notifications;
    } catch (error) {
      console.error('Errore nella creazione notifiche promemoria evento:', error);
      throw error;
    }
  }

  // Notifica di sistema generica
  static async createSystemNotification(recipientId, title, message, data = {}, actionUrl = null) {
    try {
      const notification = await Notification.createNotification({
        recipient: recipientId,
        sender: null,
        type: 'system',
        title: title,
        message: message,
        data: data,
        actionUrl: actionUrl
      });
      
      console.log('Notifica di sistema creata:', notification._id);
      return notification;
    } catch (error) {
      console.error('Errore nella creazione notifica di sistema:', error);
      throw error;
    }
  }

  // Pulisci notifiche vecchie (da chiamare periodicamente)
  static async cleanupOldNotifications() {
    try {
      return await Notification.cleanupOldNotifications();
    } catch (error) {
      console.error('Errore nel cleanup notifiche:', error);
      throw error;
    }
  }

  // Notifica per nuovo evento su campo preferato
  static async createNewEventOnFavoriteCourtNotification(eventId, eventTitle, courtName, userIds) {
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notification = await Notification.createNotification({
          recipient: userId,
          sender: null, // Notifica di sistema
          type: 'court_favorite',
          title: 'Nuovo evento sul tuo campo preferito!',
          message: `È stato creato l'evento "${eventTitle}" su ${courtName}`,
          data: {
            eventId: eventId,
            eventTitle: eventTitle,
            courtName: courtName
          },
          actionUrl: `/events/${eventId}`
        });
        
        notifications.push(notification);
      }
      
      console.log(`${notifications.length} notifiche nuovo evento su campo preferito create`);
      return notifications;
    } catch (error) {
      console.error('Errore nella creazione notifiche nuovo evento su campo preferito:', error);
      throw error;
    }
  }

  // Ottieni statistiche notifiche per un utente
  static async getNotificationStats(userId) {
    try {
      const totalCount = await Notification.countDocuments({ recipient: userId });
      const unreadCount = await Notification.countDocuments({ 
        recipient: userId, 
        read: false 
      });
      
      const typeStats = await Notification.aggregate([
        { $match: { recipient: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      
      return {
        totalCount,
        unreadCount,
        readCount: totalCount - unreadCount,
        typeStats: typeStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Errore nel recupero statistiche notifiche:', error);
      throw error;
    }
  }
}

export default NotificationService;
