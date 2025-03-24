# RPM App Backend

Dit is de backend voor de RPM (Rapid Planning Method) applicatie. De backend is gebouwd met Express.js en biedt API-endpoints voor het beheren van categorieën, RPM blokken en kalender events.

## Installatie

1. Installeer de benodigde packages:
   ```
   npm install
   ```

2. Maak een `.env` bestand aan met de volgende variabelen:
   ```
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   ```

## Ontwikkeling

Start de ontwikkelingsserver:
```
npm run dev
```

## API Endpoints

### Categorieën
- `GET /api/categories` - Alle categorieën ophalen
- `GET /api/categories/:id` - Specifieke categorie ophalen
- `POST /api/categories` - Nieuwe categorie aanmaken
- `PUT /api/categories/:id` - Categorie bijwerken
- `DELETE /api/categories/:id` - Categorie verwijderen

### RPM Blokken
- `GET /api/rpmblocks` - Alle RPM blokken ophalen
- `GET /api/rpmblocks/:id` - Specifiek RPM blok ophalen
- `POST /api/rpmblocks` - Nieuw RPM blok aanmaken
- `PUT /api/rpmblocks/:id` - RPM blok bijwerken
- `DELETE /api/rpmblocks/:id` - RPM blok verwijderen

### Kalender Events
- `GET /api/calendar-events` - Alle kalender events ophalen
- `GET /api/calendar-events/:dateKey` - Events voor specifieke datum ophalen
- `POST /api/calendar-events` - Nieuw kalender event aanmaken
- `PUT /api/calendar-events/:dateKey/actions/:actionId` - Kalender actie bijwerken
- `DELETE /api/calendar-events/:dateKey/actions/:actionId` - Kalender actie verwijderen
