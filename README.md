# Salon Beheer

Een complete, lokaal werkende salon-beheer-website. Geen server, geen installatie nodig — open gewoon `index.html` in je browser.

## Eerst: het brondocument (Salonware-export)

1. **Leg je export in deze map** — het bestand van Salonware “klanten download” (puntkomma-CSV), bv. `salonware-download (2).csv`. Dat is je **vaste bron** voor contacten + totalen + veel notities (`opmerkingen`, `recorddata`, eerste/laatste afspraak in de kolommen, enz.).
2. **Belangrijk — niet alleen `file:///...`:** in veel browsers mag JavaScript een lokaal CSV-bestand **niet** van schijf lezen tenzij je het kiest via **CSV importeren**, of tenzij je de site via een **lokale webserver** opent. Aanrader: in deze map in Terminal `python3 -m http.server 8765` en ga naar `http://localhost:8765` — bij een lege klantenlijst wordt `salonware-download (2).csv` dan **automatisch** geïmporteerd (als het bestand naast `index.html` staat). **Daarna** (zodra er klanten zijn) wordt ook **`Afspraken klanten.csv` automatisch** ingelezen: afspraken komen in de agenda bij de juiste klant, met behandeling afgeleid uit opmerkingen.
3. **Daarna in de app:** alsnog **Klanten → CSV importeren** als je op `file://` blijft werken.
4. **Volledige behandelgeschiedenis per bezoek** staat vaak **niet** als nette tabel in dit bestand; dat vul je later **klant per klant** (uit Salonware-scherm, export per klant, of handmatig). De import geeft je wél een complete klantenlijst om mee verder te werken.

*(Het CSV-bestand wordt niet “in code” gezet: het is te groot voor de browserbundle en bevat privacygevoelige data; het hoort als los bestand in de map + import.)*

## Functies

- **Home** – dashboard met:
  - Reserveringen vandaag
  - Openstaande bedragen (afgeronde, nog niet betaalde behandelingen)
  - Verjaardagen deze week
  - Bezetting van vandaag (%)
  - Volgende afspraken vandaag en morgen
- **Agenda** – afspraken inplannen, bewerken, verwijderen.
  Met één klik op **✓ Afronden** boek je de behandeling in (en verlaag je de productvoorraad). Daarna kun je hem op **€ Betaald** zetten.
- **Klanten**
  - CSV importeren (NL of EN kolomnamen; Salonware-export wordt ondersteund)
  - **Afspraken inplannen** — kies `Afspraken klanten.csv` (of dezelfde structuur): voor elke rij worden **eerste** en **laatste afspraakdatum** in de agenda gezet; de **behandeling** wordt afgeleid uit de kolom opmerkingen (trefwoorden zoals acne, IPL, dermapen). Eerst moeten de klanten in de app staan (zelfde export importeren via **CSV importeren**). Via `http://localhost:8765` kun je ook **Afspraken uit map** gebruiken om `Afspraken klanten.csv` automatisch te laden.
  - CSV exporteren
  - Per klant: contactgegevens, verjaardag, **historie** (afspraken die je zelf in de app zet of importeert)
  - Totaalomzet en openstaand bedrag per klant
- **Beheer** – behandelingen (naam, duur, prijs) en producten (naam, voorraad, prijs).
- **Rapportage per maand**
  - Totale omzet, aantal transacties, openstaand
  - Aggregatie per behandeling en per product (aantal + omzet)
  - Volledige transactielijst, te exporteren als CSV of af te drukken
- **Instellingen** – salonnaam, BTW, openingstijden, factuurgegevens, backup/import, optioneel testklant Burcu.

## Hoe te gebruiken

1. Zet je **Salonware-CSV** in deze map (zie boven), open `index.html`.
2. **Klanten → CSV importeren** en kies dat bestand.
3. **Instellingen → Data**: backup maken als je tevreden bent. Optioneel: vinkje “Testklant Burcu” alleen voor demo-data uit `burcu-akcay-appointments.js`.
4. **↺** (linksonder) wist alleen agenda/klanttransacties en zet voorraad terug; **Instellingen → Alle data wissen** reset ook sjablonen/instellingen naar standaard.

## CSV-import voor klanten

Klik op **CSV importeren** in het Klanten-scherm. Geaccepteerde kolommen (Nederlands of Engels):

| Veld        | Kolomnamen                                |
| ----------- | ----------------------------------------- |
| Naam        | `naam`, `name`, `klant`, `klantnaam`      |
| Telefoon    | `telefoon`, `phone`, `tel`, `mobiel`      |
| E-mail      | `email`, `e-mail`, `mail`                 |
| Verjaardag  | `verjaardag`, `birthday`, `geboortedatum` |
| Notities    | `notities`, `notes`, `opmerking`          |

Salonware gebruikt o.a. `voornaam`, `achternaam`, `external_id`, `opmerkingen` — die worden door de import meegenomen waar de parser die herkent.

Datums in `dd-mm-jjjj`, `dd/mm/jjjj` of `jjjj-mm-dd` werken allemaal.
Klik op **CSV-voorbeeld** om een simpel sjabloon te downloaden.

## Data en privacy

- Alles wordt **lokaal** in je browser opgeslagen (`localStorage`).
- Geen account, geen tracking, geen server.
- Maak regelmatig een **Backup** via Instellingen → "Backup downloaden (JSON)".
- Wil je naar een andere computer? Importeer daar de backup.

## Online zetten: GitHub Pages (vaste URL, https)

Je kunt deze map als **statische website** hosten — dan kun je naar `https://…` gaan zodat de browser **wel** jouw CSV’s uit de repo mag ophalen (automatische import zoals beschreven werkt daar goed bij).

Er staat een workflow klaar: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

### Stappen

1. Maak een **nieuwe repository** op GitHub (bijvoorbeeld `Salonwebsite`) — **nog niet** met README/licentie, zodat je vanaf deze map kunt pushen.

2. Zorg dat je standaard branch **`main`** heet (of pas in de workflow `.yml` de branch aan).

3. Lokaal, in deze map:

   ```bash
   cd /pad/naar/Salonwebsite
   git init -b main
   git add .
   git commit -m "Salon website + GitHub Pages"
   git remote add origin git@github.com:JOUW-USERNAME/JOUW-REPO.git
   git push -u origin main
   ```

4. Op GitHub: **Settings → Pages → Build and deployment → Source**: kies **GitHub Actions**.

5. Ga naar het tabje **Actions**, wacht tot **Deploy to GitHub Pages** groen is. Daarna vind je onder **Settings → Pages** bij **Visit site** de URL, meestal:

   **`https://JOUW-USERNAME.github.io/JOUW-REPO/`**

   Alle `fetch`-paden zijn **relatief**, dus de site hoort onder je **project-repository** nog steeds naar de juiste CSV’s te linken.

### Belangrijk: privacy bij een **publieke** repo

- Alles wat je pusht naar een **public** repository is voor iedereen te zien én vaak ook direct te downloaden (inclusief `salonware-download (2).csv` en `Afspraken klanten.csv`).
- **Wil je géén klanten online?** gebruik GitHub nog niet zo, hou alles offline, gebruik alleen lokale backup, of zet CSV’s in `.gitignore` en host zonder echte klantbestanden — dan ontbreken de automatische CSV-imports tenzij je ze later elders host.
- Privé hosting is ook mogelijk met een **paid** GitHub-plan (private Pages) of een andere aanbieder (Netlify/Vercel/Cloudflare Pages); de site zelf hoeft daar niet aan te worden aangepast.

## Bestanden

```
index.html                    - UI shell, laadt scripts
styles.css                    - Vormgeving
salon-app.js                  - Logica: data, schermen, CSV, rapportage
burcu-akcay-appointments.js   - Optionele demo-klant (alleen met vinkje in Instellingen → Data)
salonware-download (2).csv    - Voorbeeld/bron: jouw Salonware-export (bestandsnaam kan verschillen)
Afspraken klanten.csv          - Zelfde type export; gebruik bij Klanten → "Afspraken inplannen" om agenda te vullen
```

## Toekomstige uitbreidingen

Laat het me weten als je wilt:

- Online afspraken laten boeken door klanten
- WhatsApp/e-mail-herinneringen
- Tikkie / Mollie betaalkoppeling
- Multi-medewerker agenda
- Synchronisatie tussen meerdere apparaten (vereist een server)
