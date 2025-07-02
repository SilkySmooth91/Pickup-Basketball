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

import cron from 'node-cron';
import eventModel from '../models/EventsSchema.js';
import NotificationService from './NotificationService.js';

class EventReminderService {
  
  static isRunning = false;

  // Avvia il servizio di promemoria eventi
  static startReminderService() {
    if (this.isRunning) {
      console.log('Servizio promemoria eventi già in esecuzione');
      return;
    }

    // Esegui ogni 15 minuti per controllare eventi che iniziano tra 45-60 minuti
    const cronJob = cron.schedule('*/15 * * * *', async () => {
      try {
        await this.checkUpcomingEvents();
      } catch (error) {
        console.error('Errore nel controllo eventi imminenti:', error);
      }
    }, {
      scheduled: false
    });

    cronJob.start();
    this.isRunning = true;
    console.log('Servizio promemoria eventi avviato (controllo ogni 15 minuti)');
  }

  // Ferma il servizio di promemoria eventi
  static stopReminderService() {
    this.isRunning = false;
    console.log('Servizio promemoria eventi fermato');
  }

  // Controlla eventi che iniziano presto e invia promemoria
  static async checkUpcomingEvents() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const fortyFiveMinutesFromNow = new Date(now.getTime() + 45 * 60 * 1000);

      // Trova eventi che iniziano tra 45 e 60 minuti da ora
      const upcomingEvents = await eventModel.find({
        datetime: {
          $gte: fortyFiveMinutesFromNow,
          $lte: oneHourFromNow
        },
        reminderSent: { $ne: true } // Solo eventi per cui non è già stato inviato il promemoria
      }).populate('participants', '_id');

      console.log(`Trovati ${upcomingEvents.length} eventi per promemoria`);

      for (const event of upcomingEvents) {
        try {
          if (event.participants && event.participants.length > 0) {
            const participantIds = event.participants.map(p => p._id);
            
            await NotificationService.createEventReminderNotification(
              event._id,
              event.title,
              participantIds
            );

            // Marca l'evento come già notificato
            await eventModel.findByIdAndUpdate(event._id, {
              reminderSent: true
            });

            console.log(`Promemoria inviato per evento: ${event.title}`);
          }
        } catch (error) {
          console.error(`Errore nel promemoria per evento ${event._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Errore nel controllo eventi imminenti:', error);
    }
  }

  // Metodo per testare il sistema di promemoria manualmente
  static async sendTestReminder(eventId) {
    try {
      const event = await eventModel.findById(eventId).populate('participants', '_id');
      
      if (!event) {
        throw new Error('Evento non trovato');
      }

      if (event.participants && event.participants.length > 0) {
        const participantIds = event.participants.map(p => p._id);
        
        await NotificationService.createEventReminderNotification(
          event._id,
          event.title,
          participantIds
        );

        console.log(`Promemoria di test inviato per evento: ${event.title}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Errore nel promemoria di test:', error);
      throw error;
    }
  }
}

export default EventReminderService;
