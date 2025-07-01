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

import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    // A chi è destinata la notifica
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
      index: true
    },
    
    // Chi ha scatenato la notifica (può essere null per notifiche di sistema)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      default: null
    },
    
    // Tipo di notifica
    type: {
      type: String,
      required: true,
      enum: [
        'friend_request',      // Richiesta di amicizia
        'friend_accepted',     // Richiesta di amicizia accettata
        'event_invitation',    // Invito a evento
        'event_update',        // Aggiornamento evento
        'event_cancelled',     // Evento cancellato
        'event_reminder',      // Promemoria evento
        'court_favorite',      // Nuovo campetto preferito
        'system'               // Notifica di sistema
      ]
    },
    
    // Titolo della notifica
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    
    // Messaggio della notifica
    message: {
      type: String,
      required: true,
      maxlength: 500
    },
    
    // Dati aggiuntivi specifici per tipo di notifica
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // Stato di lettura
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // Data di lettura
    readAt: {
      type: Date,
      default: null
    },
    
    // Link di azione (opzionale)
    actionUrl: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indice composto per query efficienti
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, read: 1 });

// Metodo statico per creare una notifica
NotificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Errore nella creazione notifica:', error);
    throw error;
  }
};

// Metodo statico per creare notifiche di massa
NotificationSchema.statics.createBulkNotifications = async function(notifications) {
  try {
    return await this.insertMany(notifications);
  } catch (error) {
    console.error('Errore nella creazione notifiche bulk:', error);
    throw error;
  }
};

// Metodo per segnare come letta
NotificationSchema.methods.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Cleanup automatico delle notifiche vecchie (più di 30 giorni)
NotificationSchema.statics.cleanupOldNotifications = async function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  try {
    const result = await this.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      read: true
    });
    console.log(`Eliminate ${result.deletedCount} notifiche vecchie`);
    return result;
  } catch (error) {
    console.error('Errore nel cleanup notifiche:', error);
    throw error;
  }
};

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
