# Utiliser l'image officielle Node.js
FROM node:18-alpine

# Créer et définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port utilisé par l'application (Render utilise process.env.PORT)
EXPOSE 4000

# Démarrer le serveur
CMD ["node", "server.js"]