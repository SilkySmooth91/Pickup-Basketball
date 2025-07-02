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

// Versione attuale del changelog (aggiorna questo quando aggiungi nuove features)
export const CURRENT_CHANGELOG_VERSION = '1.2.0';

// Dati del changelog - aggiungi nuove versioni in cima
export const CHANGELOG_DATA = [
    {
    version: '1.2.0',
    date: '2 Luglio 2025',
    title: 'Sistema di Notifiche',
    features: [
      'Nuovo sistema di notifiche! Clicca sulla campanellina per visualizzare notifiche per richieste di amicizia, nuovi eventi, aggiornamenti e altro!',
      'Sistema di campetti preferiti implementato! Ora puoi aggiungere campetti ai tuoi preferiti e ricevere notifiche quando ci sono aggiornamenti o vengono creati nuovi eventi!',
      'Suddivisione fra eventi passati e futuri nella pagina "I tuoi eventi" per una migliore visualizzazione e organizzazione'
    ],
    fixes: [
      'Migliorata la responsività della navbar su dispositivi mobili',
      'Bloccata la partecipazione a eventi passati',
      'Corretti alcuni bug di visualizzazione degli avatar di default nella navbar'
    ]
  },
  {
    version: '1.1.1',
    date: '18 Giugno 2025',
    title: 'Miglioramenti UX/UI',
    features: [
      'Aggiunta paginazione dei risultati per la ricerca dei giocatori: adesso saranno visualizzati solo 10 risultati alla volta, con la possibilità di navigare tra le pagine dei risultati'
    ],
    fixes: [
      'Ottimizzata la funzionalità di alcuni pulsanti per una migliore esperienza utente',
      'Risolto un bug per cui il modale del changelog veniva mostrato ad ogni refresh della pagina, anche se l\'utente lo aveva già chiuso in precedenza',
      'Risolti alcuni bug grafici minori'
    ]
  },
  {
    version: '1.1.0',
    date: '16 Giugno 2025',
    title: 'Miglioramenti UX e Sicurezza',
    features: [
      'Sistema changelog con modal automatico: puoi vedere le ultime novità al tuo primo accesso!',
      'Notifiche chiare per logout automatico',
      'Ricerca giocatori migliorata: ora puoi filtrare per città'
    ],
    fixes: [
      'Risolti problemi di sicurezza regex: validazione email più sicura',
      'Ottimizzata gestione delle sessioni'
    ]
  },
  {
    version: '1.0.0',
    date: '13 Giugno 2025',
    title: 'Lancio Ufficiale',
    features: [
      'Creazione e gestione eventi basket',
      'Mappa interattiva dei campetti',
      'Sistema di autenticazione',
      'Profili utente personalizzabili',
      'Invio richieste di amicizia',
    ],
    fixes: []
  }
];
