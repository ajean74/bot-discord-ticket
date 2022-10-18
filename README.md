# Bot Discord pour la création de ticket

Ceci est un bot pour la création de ticket sur Discord.

## Comment l'installer ?

Vous avez besoin de Node.js

``````bash
git clone https://github.com/ajean74/bot-discord-ticket.git
cd ticket-bot
npm i
``````

## Comment le configurer ?

Sur le fichier config.json modifié :

```json
{
  "clientId": "ID du bot",


  "parentOpened": "ID de la catégorie ou le ticket s'ouvre",
  "parentTransactions": "ID de la catégorie ou le ticket s'ouvre",
  "parentJeux": "ID de la catégorie ou le ticket s'ouvre",
  "parentAutres": "ID de la catégorie ou le ticket s'ouvre",


  "roleSupport": "ID du rôle du bot",

  
  "logsTicket": "ID du canal ou les logs seront",
  "ticketChannel": "ID du canal ou on ouvrira les tickets",
  
  "footerText": "Texte situé dans le footer (info sur la sauvegarde des tickets)"
}
```

Sur le fichier token.json modifié :

```json
{
  "token": "Tocken du bot"
}
```

Si vous souhaitez ajouter des commandes, il vous faudra mettre les fichier .js de votre commande dans le dossier commands.

## Comment démarrer le bot ? 

```bash
node deploy-commands.js # Pour déployer les commandes
node index.js # Pour démarrer le bot
```