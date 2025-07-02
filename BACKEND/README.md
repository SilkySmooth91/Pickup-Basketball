# Pickup-Basketball API

Backend API per l'applicazione Pickup-Basketball.

## Installazione

```bash
npm install
```

## Configurazione

Crea un file `.env` nella root del progetto con le seguenti variabili (vedi `.env.example` per riferimento).

## Funzionalità principali

### Sistema di Notifiche

- ✅ Notifiche per richieste di amicizia
- ✅ Notifiche per eventi (aggiornamenti, cancellazioni, inviti)
- ✅ Notifiche per nuovi eventi su campi preferiti
- ✅ **Sistema di promemoria automatici** (con scheduling)

### Scheduling automatico

Il sistema utilizza **node-cron** per inviare promemoria automatici:

- Controlla ogni 15 minuti se ci sono eventi che iniziano tra 45-60 minuti
- Invia notifiche di promemoria a tutti i partecipanti
- Evita invii duplicati grazie al flag `reminderSent`

### API Endpoints principali

- `/auth/*` - Autenticazione e autorizzazione
- `/users/*` - Gestione utenti
- `/courts/*` - Gestione campi da basket
- `/events/*` - Gestione eventi e partite
- `/notifications/*` - Sistema notifiche completo
- `/friends/*` - Gestione amicizie

## Avvio in sviluppo

```bash
npm run dev
```

## Avvio in produzione

```bash
npm start
```

## Dipendenze principali

- **Express.js** - Framework web
- **Mongoose** - ODM per MongoDB
- **Passport.js** - Autenticazione (Google OAuth)
- **Cloudinary** - Gestione immagini
- **node-cron** - ⭐ **Scheduling automatico promemoria eventi**
- **Swagger** - Documentazione API
