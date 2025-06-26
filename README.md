# 🏀 Pickup Basketball App

Un'applicazione web completa per trovare, organizzare e partecipare a partite di basket nei campetti della tua zona.

![Pickup Basketball App](FRONTEND/public/newLogo.jpg)

## 📋 Descrizione

Pickup Basketball è una piattaforma che connette giocatori di basket di ogni livello per permettergli di trovare altri giocatori e campetti vicino a loro. L'app consente agli utenti di:

- 🗺️ Trovare campetti da basket sulla mappa interattiva
- 🏆 Organizzare e partecipare a eventi/partite
- 👥 Connettersi con altri giocatori e fare amicizia
- ⭐ Aggiungere nuovi campetti al database
- 💬 Commentare eventi e campetti

## 🚀 Demo

L'applicazione è disponibile online all'indirizzo: [https://pickup-basketball.vercel.app](https://pickup-basketball.vercel.app)

## 🛠️ Tecnologie Utilizzate

### Frontend

- **React**: Libreria UI
- **Vite**: Build tool
- **React Router**: Gestione routing
- **Tailwind CSS**: Framework CSS utility-first
- **Leaflet/OpenStreetMap**: Mappe interattive
- **FontAwesome**: Icone
- **Cloudinary**: Gestione immagini
- **React-Toastify**: Notifiche UI
- **Google reCAPTCHA**: Protezione da spam

### Backend

- **Node.js**: Runtime
- **Express**: Framework web
- **MongoDB**: Database
- **Mongoose**: ODM per MongoDB
- **JWT**: Autenticazione
- **Passport**: Strategie di autenticazione (incluso OAuth Google)
- **Swagger**: Documentazione API
- **Multer**: Upload file
- **Cloudinary**: Storage immagini cloud
- **SendGrid**: Servizio email

## 🏗️ Architettura

Il progetto è strutturato in due parti principali:

### FRONTEND

```
FRONTEND/
├── public/              # Risorse statiche
├── src/
│   ├── api/             # Client API per interazione con il backend
│   ├── assets/          # Immagini e risorse
│   ├── components/      # Componenti React riutilizzabili
│   ├── context/         # Context API React per gestione stato
│   ├── pages/           # Componenti pagina
│   └── styles/          # File CSS e stili
```

### BACKEND

```
BACKEND/
├── src/
│   ├── auth/            # Strategie di autenticazione
│   ├── config/          # Configurazioni (DB, Cloudinary, ecc.)
│   ├── middlewares/     # Middleware Express
│   ├── models/          # Modelli Mongoose
│   ├── routes/          # Route API
│   └── utils/           # Utility e helper
├── tests/               # Test automatizzati
```

## ⚙️ Funzionalità Principali

1. **Autenticazione Utenti**

   - Registrazione e login
   - Login con Google OAuth
   - Recupero password via email
   - JWT con refresh token

2. **Mappa Interattiva**

   - Visualizzazione campetti nelle vicinanze
   - Filtri e ricerca campetti
   - Aggiunta di nuovi campetti

3. **Gestione Eventi**

   - Creazione eventi/partite
   - Partecipazione a eventi
   - Visualizzazione eventi in corso e futuri

4. **Profili Utente**

   - Informazioni personali e preferenze
   - Statistiche di gioco
   - Gestione amicizie

5. **Sistema di Amicizie**

   - Richieste di amicizia
   - Lista amici
   - Visualizzazione profili

6. **Sistema di Commenti**

   - Commenti su campetti
   - Commenti su eventi

7. **Upload Media**

   - Foto profilo utente
   - Gallerie immagini campetti

8. **Sistema di Segnalazioni**
   - Segnalazione bug con reCAPTCHA
   - Comunicazione via email

## 🚀 Installazione e Avvio

### Prerequisiti

- Node.js (v14 o superiore)
- npm o yarn
- MongoDB
- Account Google OAuth (per autenticazione)
- Account Cloudinary (per storage immagini)
- Account SendGrid (per email e segnalazioni bug)

### Configurazione Backend

1. Clona la repository

   ```bash
   git clone https://github.com/tuonome/pickup-basketball.git
   cd pickup-basketball/BACKEND
   ```

2. Installa le dipendenze

   ```bash
   npm install
   ```

3. Crea un file `.env` nella cartella BACKEND con le seguenti variabili:

   ```
   MONGO_URI=mongodb+srv://...
   PORT=3001
   FE_URL=http://localhost:5173
   BE_URL=http://localhost:3001
   JWT_SECRET_KEY=...
   JWT_EXPIRES=1d
   JWT_REFRESH_KEY=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
   SENDGRID_API_KEY=...
   SENDGRID_SENDER=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

4. Avvia il server in modalità sviluppo
   ```bash
   npm run dev
   ```

### Configurazione Frontend

1. Naviga nella cartella FRONTEND

   ```bash
   cd ../FRONTEND
   ```

2. Installa le dipendenze

   ```bash
   npm install
   ```

3. Crea un file `.env` nella cartella FRONTEND con le seguenti variabili:

   ```
   VITE_API_URL=http://localhost:3001
   VITE_RECAPTCHA_SITE_KEY=...
   ```

4. Avvia l'applicazione in modalità sviluppo

   ```bash
   npm run dev
   ```

5. Apri il browser e vai a `http://localhost:5173`

## 📱 Responsive Design

L'applicazione è completamente responsive e ottimizzata per:

- 💻 Desktop
- 📱 Tablet
- 📱 Smartphone

## 🔒 Sicurezza

- Autenticazione JWT con refresh token
- Password criptate con bcrypt
- Validazione input
- Protezione contro XSS e CSRF
- reCAPTCHA per prevenzione spam

## 📄 API Documentation

La documentazione Swagger delle API è disponibile all'indirizzo:

```
http://localhost:3001/api-docs
```

quando il server backend è in esecuzione.

## 🤝 Contributi

I contributi sono benvenuti! Sentiti libero di inviare pull request o aprire issue per miglioramenti o bug.

## 📜 Licenza

Questo progetto è sotto licenza GNU GPL v3.

Per maggiori dettagli, consulta il file [LICENSE](./LICENSE).

## 📧 Contatti

Per domande o informazioni, contattare [lorenzo.olivieri13@gmail.com](mailto:lorenzo.olivieri13@gmail.com).
