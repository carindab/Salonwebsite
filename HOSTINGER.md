# Salon Beheer op Hostinger (MySQL)

Deze handleiding zet je salon-app op Hostinger met een **MySQL-database**. Daarna werken telefoon en computer met **dezelfde klanten en afspraken**.

## GitHub koppelen (belangrijk)

Repository: **https://github.com/carindab/Salonwebsite**

### Fout: "Niet-ondersteund framework of ongeldige projectstructuur"

Je ziet deze melding als je **Node.js Web App → Import Git** gebruikt zonder build-instellingen. Kies één van deze twee manieren:

#### Optie A — Aanbevolen: PHP-website + Git (geen Node.js)

1. hPanel → **Websites** → voeg een **gewone PHP/HTML-website** toe (niet "Node.js Web App")
2. Klik **Beheren** bij die website
3. Sidebar → **Geavanceerd → Git** (of zoek "Git")
4. **Deploy from GitHub** → kies repo **carindab/Salonwebsite**
5. Branch: **main**
6. Root directory: **public_html** (standaard)
7. Klik **Deploy**

Geen build-commando nodig — Hostinger ziet `composer.json`, `index.php` en de `api/`-map.

#### Optie B — Node.js Web App met build

Als je per se via "Node.js Web App" wilt deployen:

| Instelling | Waarde |
|------------|--------|
| Framework | **Other** |
| Build command | `npm run build` |
| Output directory | **dist** |

Daarna opnieuw **Deploy** klikken.

---

## Wat je nodig hebt

- Hostinger-webhosting met **MySQL** (zit in de meeste pakketten)
- Je domein (bijv. `eliminstituut.nl` of een subdomein)
- GitHub-repo gekoppeld (zie boven) **of** FTP / Bestandsbeheer

---

## Stap 1 — Bestanden op Hostinger

Via **Git deploy** (optie A) gebeurt dit automatisch bij elke push naar `main`.

Handmatig uploaden naar `public_html`:

- `index.html`, `index.php`, `salon-app.js`, `styles.css`
- `salon-seed.json` (klanten + afspraken)
- map `api/` (met alle `.php`-bestanden)
- map `database/` (schema.sql)
- `.htaccess`

**Niet uploaden:** CSV-bestanden met klantgegevens (die staan al in `salon-seed.json`).

---

## Stap 2 — MySQL-database aanmaken

1. Log in op **Hostinger hPanel**
2. Ga naar **Databases → MySQL Databases**
3. Maak een nieuwe database aan (bijv. `u123456789_salon`)
4. Maak een database-gebruiker met wachtwoord
5. Koppel de gebruiker aan de database (alle rechten)
6. Noteer:
   - Database-naam
   - Gebruikersnaam
   - Wachtwoord
   - Host (meestal `localhost`)

---

## Stap 3 — config.php instellen

1. In de map `api/` staat `config.example.php`
2. Kopieer die naar **`api/config.php`**
3. Vul je gegevens in:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_salon');      // jouw database-naam
define('DB_USER', 'u123456789_salon');      // jouw gebruiker
define('DB_PASS', 'jouw-wachtwoord');

define('SALON_API_KEY', 'kies-een-lang-willekeurig-wachtwoord-min-20tekens');
define('SALON_INSTALL_KEY', 'tijdelijk-installatie-123');
```

4. **Onthoud de SALON_API_KEY** — die voer je later in de app in.

---

## Stap 4 — Database-tabellen aanmaken

Open in je browser (vervang `jouwdomein.nl`):

```
https://jouwdomein.nl/api/install.php?key=tijdelijk-installatie-123
```

Je zou moeten zien: `"ok": true`

---

## Fout: config.php ontbreekt

Zie je `config.php ontbreekt`? Open in je browser:

```
https://agenda.eliminstituut.nl/api/configure.php?key=tijdelijk-installatie-wachtwoord
```

Vul je MySQL-gegevens uit hPanel in → daarna automatisch install → setup-user voor je login.

---

## Stap 4b — Login aanmaken (beveiliging)

1. Voer eerst opnieuw **install** uit (nieuwe tabellen voor login):
   ```
   https://agenda.eliminstituut.nl/api/install.php?key=JOUW_INSTALL_KEY
   ```
2. Maak je account aan (eenmalig):
   ```
   https://agenda.eliminstituut.nl/api/setup-user.php?key=JOUW_INSTALL_KEY
   ```
3. Vul e-mail + wachtwoord in (min. 8 tekens)
4. Ga naar **https://agenda.eliminstituut.nl/** en log in
5. Vink **Onthouden op dit apparaat** aan (standaard aan) — je telefoon blijft ingelogd

**Beveiliging:** zonder login zien bezoekers alleen het inlogscherm. Klantdata (`salon-seed.json`, CSV's) is niet meer publiek downloadbaar.

---

## Stap 5 — Klanten en afspraken importeren

Open:

```
https://jouwdomein.nl/api/seed-import.php
```

Dit vereist de API-sleutel. Eenvoudiger via de app:

1. Open `https://jouwdomein.nl`
2. Ga naar **Instellingen → Data**
3. Vul je **API-sleutel** in (zelfde als `SALON_API_KEY` in config.php)
4. Klik **Seed naar database importeren**

Je krijgt: **2404 klanten · 10613 afspraken**

---

## Stap 6 — App verbinden (desktop + mobiel)

1. Open de site op je **computer**
2. Instellingen → Data → API-sleutel invullen → **Verbinden & laden**
3. Herhaal op je **telefoon** (zelfde URL, zelfde API-sleutel)

Vanaf nu:
- Wijzigingen worden opgeslagen in **MySQL** (server) — ook vanaf mobiel direct bij nieuwe afspraken
- Op mobiel wordt niet alles lokaal bewaard (te groot); data komt van de server
- Beide apparaten zien dezelfde data na inloggen

---

## Stap 7 — Gmail koppelen (automatische herinneringen 24 uur van tevoren)

1. Zet **2-stapsverificatie** aan op `eliminstituut@gmail.com`
2. Maak een **App-wachtwoord** in Google (Beveiliging → App-wachtwoorden)
3. Open:
   ```
   https://agenda.eliminstituut.nl/api/setup-mail.php?key=tijdelijk-installatie-wachtwoord
   ```
4. Vul Gmail + app-wachtwoord in → **Testmail sturen**
5. In Hostinger **Cron Jobs** (elk uur):
   ```
   0 * * * * /bin/sh /home/u721044854/domains/agenda.eliminstituut.nl/public_html/scripts/send-reminders.sh
   ```
   Script staat in `public_html/scripts/send-reminders.sh` (zie Hostinger support of `scripts/send-reminders.sh` in repo).
   Log: `public_html/cron-logs/send-reminders.log`

Herinneringen gaan naar klanten met status **gepland** en een e-mailadres, ~24 uur voor de afspraak.

---

## Controleren of het werkt

Open:

```
https://jouwdomein.nl/api/health.php
```

Verwacht:

```json
{
  "ok": true,
  "database": true,
  "counts": { "clients": 2404, "appointments": 10613 }
}
```

---

## Veiligheid

- **`api/config.php` nooit delen** — bevat database-wachtwoord
- Kies een **sterke API-sleutel** (minimaal 20 willekeurige tekens)
- Wijzig `SALON_INSTALL_KEY` na installatie of verwijder `install.php` na gebruik
- Maak regelmatig een **JSON-backup** via Instellingen → Data

---

## Problemen?

| Probleem | Oplossing |
|----------|-----------|
| **Niet-ondersteund framework** | Gebruik Git onder PHP-website (optie A), of Node.js met `npm run build` + output `dist` |
| `config.php ontbreekt` | Kopieer config.example.php → config.php |
| `Unauthorized` | API-sleutel in app ≠ SALON_API_KEY in config.php |
| Database-fout | Controleer DB-naam, user, wachtwoord in hPanel |
| Lege agenda | Klik Seed naar database importeren |
| Oude data op telefoon | Instellingen → Verbinden & laden |

---

## GitHub Pages vs Hostinger

Je kunt GitHub Pages **uitschakelen** als je alles op Hostinger hebt staan. Of beide laten staan: Hostinger is dan je **werk-versie** met database; GitHub Pages blijft een backup zonder sync.
