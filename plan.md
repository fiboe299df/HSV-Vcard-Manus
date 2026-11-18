# HSV-Visitenkarte: öffentlicher Umbau und sicherer Privatbereich

## Ziel und Grenzen
Die vorhandene HSV-Visitenkarte wird anhand von `BaukastenfürHSV.md` weiterentwickelt. Der bestehende HSV-Glasslook, Inhalte, sechs Sprachfassungen und funktionierende öffentliche Kontakt-/Ticketaktionen bleiben erhalten, soweit sie nicht private Daten offenlegen. Die Arbeit bleibt in der lokalen Cloud-Preview: kein Push, kein Checkpoint und keine Veröffentlichung.

Die aktualisierte öffentliche Lovable-Seite `https://hsv-pocket-presence.lovable.app/` und die Base44-Seite `https://hsv-visitenkarte.base44.app/` sind jetzt erreichbar und werden zusammen mit der schriftlichen Baukasten-Datei als Referenz benutzt. Die ältere Lovable-Preview-URL `https://preview--hsv-pocket-presence.lovable.app/?__lovable_sha=ac817058#interessen` leitete zur Anmeldung um; das Claude-Artefakt `https://claude.ai/artifact/KoFqUwCHieXtCxhUn7SQa9` bleibt an einer Cloudflare-Prüfung hängen.

Die Lovable-Referenz zeigt die kompakte Abschnittsleiste, einen dezenten Privat-Schlosszugang, klare Kontaktkarten mit Kopieraktionen, die geglättete Kurzbiografie, Lebenslauf-/Timeline-Bedienung und eine am Seitenende platzierte Spiel-/Tabellenfläche mit Top fünf plus vollständiger Tabelle. Die Base44-Referenz bestätigt die zusätzliche Tabellen-Navigation, Heim-/Auswärts-Spielkarten, einen auf Klick geöffneten Kartenlink und die private Zugangskachel. Bestehende Geschäfts- und Profilinhalte werden aus der Manus-Seite übernommen statt aus den Referenzseiten neu erfunden.

## Umsetzung

### Architektur und Berechtigungen
- Die bestehende einzelne HTML-Seite bleibt unter `public/index.html`; ein Node-Server ergänzt API-Routen für Anmeldung, Sitzung, Privatprofil, Dokumente und Adminfunktionen. Der konfigurierte Preview-Port 3000 bleibt bestehen.
- Anmeldung folgt standardmäßig Manus OAuth (kein selbst erfundenes Passwortsystem). Die Identität wird serverseitig geprüft. `fiboe02@outlook.de` ist die einzige anfängliche Admin-Adresse; neue Nutzer werden standardmäßig abgewiesen, bis sie vom Admin freigeschaltet werden. Zugelassene Nutzer benötigen ebenfalls ein Manus-Konto.
- Für den Admin wird zusätzlich anwendungsseitiges TOTP verpflichtend: Einrichtung mit QR-/`otpauth://`-Link und kopierbarem Schlüssel, Codebestätigung, einmalige Wiederherstellungscodes, Abmelden und inaktive Sitzung beenden. Nutzer-TOTP kann optional bleiben. Die Adminoberfläche kann Nutzerzugänge und TOTP-Resets verwalten.
- Sitzungen, Rollen, MFA-Metadaten, private Kontaktdaten und Dokumentindex liegen serverseitig in MySQL; Autorisierung erfolgt auf jedem Privat-API-Aufruf. Ein browserseitiger Passwortdialog wird nicht als Schutz verwendet. TOTP-Geheimnisse werden mit einem projektspezifischen Schlüssel aus der Secret-Eingabe verschlüsselt.
- Private Dateien werden aus `public/assets` entfernt und in den serverseitig autorisierten privaten Objektzugriff überführt. Eine signierte, zeitlich begrenzte Download-Adresse wird erst nach erfolgreicher Berechtigungsprüfung ausgegeben. Das Vorhandensein eines statischen Dateipfads ist keine Zugriffskontrolle.

### Öffentliche Karte und Bedienung
- Private Telefonnummer, private E-Mail-Adresse und Privatadresse werden aus dem öffentlichen HTML/JavaScript und der öffentlichen vCard entfernt. Öffentliche vCard und Kontaktaktionen enthalten nur die freigegebenen geschäftlichen Kontaktdaten.
- Ein dezenter runder Privat-/Schlosszugang erscheint in der Schnellnavigation, im Kontaktbereich und im Footer. Der Login- und Privatbereich erhält klare Status-, Fehlermeldungs-, Abmelden- und Zurück-zur-Karte-Zustände. Alle sechs auswählbaren Oberflächensprachen zeigen ihre jeweilige Landesflagge; die vier vorhandenen Sprachkenntnisse behalten ihre passenden Flaggen, ohne neue Kenntnisse hinzuzufügen.
- „Über mich“ wird mit der in der Vorlage vorgeschlagenen klareren Formulierung angepasst; die Interessen werden als getrennte, lesbare Chips dargestellt. Der Werdegang wird als gut lesbare Timeline mit klarer Rücknavigation gestaltet.
- Der Lebenslauf öffnet nach erfolgreicher Anmeldung in einer barrierearmen Dokumentansicht mit Schließen per X/Escape/Hintergrund, Download und neuem Tab; auf schmalen Mobilgeräten wird ein Vollbild-/Tab-Fallback genutzt.
- Die Schnellnavigation bleibt mobil platzsparend und horizontal erreichbar; eine gut kontrastierende Aktionsleiste und ein runder Hoch-/Runter-Button bleiben verfügbar. Hell-/Dunkelmodus, Reduced Motion, Tastaturbedienung und ausreichende Touchflächen werden beibehalten.
- Spiele und Ticketportal bleiben am Seitenende bzw. einklappbar. Die vom Nutzer genannte football-data.org-Abfrage lautet `https://api.football-data.org/v4/competitions/BL1/matches?status=LIVE`; für die Tabelle wird die offizielle `.../competitions/BL1/standings`-Ressource verwendet. Die API verlangt laut `https://www.football-data.org/documentation/api` einen `X-Auth-Token`. `https://www.football-data.org/coverage` führt die deutsche Bundesliga im Free Tier. Dessen Tarifseite `https://www.football-data.org/pricing` nennt 12 Wettbewerbe, verzögerte Scores/Spielpläne, Tabellen und 10 Aufrufe pro Minute; echte Live-Scores sind im separaten, kostenpflichtigen Tarif (auf der Seite mit 12 €/Monat ausgewiesen). Die Seite verwendet einen mindestens zehnminütigen serverseitigen Cache und bezeichnet die Free-Tier-Daten als verzögert, nicht live. Der bestehende OpenFootball-Snapshot `https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/de.1.json` enthielt 306 Fixtures, aber nur 33 Vollzeit-Ergebnisse und 48 bereits datierte Spiele ohne Endstand; er wird nicht als vollständige aktuelle Tabelle ausgegeben, wenn die API fehlt oder ausfällt. Datenquelle und Abrufzeit werden sichtbar benannt; Ticketaktionen bleiben auf HSV-Einstiege beschränkt.

### Projektstruktur und Verantwortung
- `public/index.html`: öffentliche HSV-Visitenkarte, Geschäftsaktionen und private-Zugangstüren; keine privaten Werte oder Dokumentbytes.
- `public/privat.html` und `public/privat.js`: Login-, TOTP-, geschützte Dokument- und responsive Adminoberfläche; nur die geschützten API-Antworten enthalten private Werte.
- `server/index.js`: Express-HTTP-Server, Health-/API-Routen und Auslieferung öffentlicher Assets auf Port 3000.
- `server/auth.js`, `server/mfa.js`, `server/db.js`, `server/storage.js` und `server/matches.js`: Manus-OAuth/Session, TOTP-Verschlüsselung und Recovery, MySQL-Zugriff, autorisierte temporäre Dokumentlinks und Fußball-Datenabruf/Tabellenberechnung.
- `db/migrations/`: additive, idempotente MySQL-Tabellen für Admin-Allowlist, Nutzerrollen/Zugänge, Sitzungen, MFA, private Profilfelder und Dokumentmetadaten; die erste Admin-Adresse wird aus der Datenbank-Allowlist zugewiesen.
- Managed Object Storage: private PDF-/Dokumentbytes unter zufälligen, nicht öffentlichen Schlüsseln; private Daten werden nicht im öffentlichen Ordner oder in Git abgelegt.
- `package.json`, `pnpm-lock.yaml` und `pnpm-workspace.yaml`: gepinnter Node-/pnpm-Server, reproduzierbare Abhängigkeiten und geprüfte Installationsrichtlinie. Ein späterer Container-Einstiegspunkt kann vorbereitet werden, wird aber nicht veröffentlicht.
- Vorhandene Projektdateien und bereits lokal geänderte Nutzerarbeit werden erhalten; kein Reset und keine Neuinitialisierung.

## Voraussetzungen und wichtige Folgen
- Server und verwaltete MySQL-Datenbank wurden im bestätigten Plan aktiviert (Konfigurationsrevision 3); beide Schalter sind laut Projektplattform **einwegig und später nicht abschaltbar**. Entwicklungs- und spätere Produktionsanwendung teilen denselben Datenbestand, daher bleiben Migrationen additiv und während dieser Arbeit unpubliziert.
- `APP_MFA_ENCRYPTION_KEY` wurde über die geschützte Geheimnis-Eingabe gespeichert (`all`-Umgebung); der Wert wird weder gelesen noch in Chat, Quellcode, Logs oder Git kopiert.
- Die Veröffentlichung bleibt durch `publishing.auto_publish: false` deaktiviert. Kein Push, Checkpoint oder Publish wird ausgelöst.
- Mit Manus OAuth können nur Personen mit Manus-Konto eintreten; ohne Admin-Freigabe gibt es keinen Privatbereichszugriff. Für E-Mail-/Passwort- oder Magic-Link-Zugang außerhalb von Manus wäre ein ausdrücklich gewählter externer Auth-Anbieter nötig.
- Vorhandene projektweite Analytics- und Datenschutzangaben werden nicht stillschweigend geändert; ein öffentlicher Einsatz bleibt gesperrt, bis die veraltete Hosting-/Datenschutzangabe fachlich geprüft ist.

## Design
- **Design Movement:** HSV-Sporteditorial mit zurückhaltendem Glaslook; die vorhandene Karte bleibt die gestalterische Ausgangsbasis.
- **Kernprinzipien:** öffentlich und privat sichtbar trennen; Inhalte schnell scannbar machen; HSV-Blau als Funktionsakzent einsetzen; mobile Bedienung und Kontrast zuerst prüfen.
- **Farbphilosophie:** tiefes HSV-Navy als ruhiger Grund, klares HSV-Blau für Aktionen und Schloss-/Statussignale, helle Glasflächen für Information; Darkmode erhält gleichwertige Lesbarkeit.
- **Layout:** asymmetrische Profil-/Hero-Fläche am Desktop; auf schmalen Geräten einspaltiger Fluss mit horizontaler Abschnittsleiste; Aktionen nahe dem Daumen erreichbar.
- **Signaturdetails:** dezentes HSV-Rautenzeichen im Hintergrund, blau gerahmtes Profilbild, private Inhalte mit ruhigem Schloss-/Freigabestatus.
- **Interaktionen und Bewegung:** klare, sofort verständliche Zustände; kurze Übergänge ohne Scroll-Jank; Reduced-Motion respektieren; keine privaten Vorschauen vor erfolgreicher Autorisierung.
- Für die ausdrücklich freigegebene lokale Vorschau dürfen Nutzer- und Adminoberfläche zusätzlich als klar gekennzeichnete, nicht authentifizierte Layoutdemo mit ausschließlich synthetischen Beispieldaten erscheinen. Diese Demo gewährt keinen Zugang zu echten privaten oder administrativen Daten und ersetzt weder Login noch MFA.
- **Typografie:** vorhandene Schriftfamilie und HSV-Hierarchie beibehalten; Überschriften kompakt, Fließtext mit ausreichender Zeilenhöhe, Labels kurz und kontrastreich.
- **Markenessenz:** persönliche HSV-Visitenkarte für Player Care und Sportadministration; persönlich, verlässlich, professionell.

## Verifikation
- Vorhandene Sprachwahl, Theme, Kontaktaktionen, Schnellnavigation, Ticketlinks und Lebenslaufablauf erhalten und nach Reload prüfen.
- Sicherstellen, dass private Kontaktwerte, MFA-Schlüssel, Backupcodes und private Dokumentbytes nicht aus öffentlichem HTML, JavaScript, vCard oder nicht autorisierten API-Antworten abrufbar sind.
- OAuth-State und Sitzung prüfen; ohne gültige Anmeldung, Freigabe und Admin-MFA bleiben Privatdaten gesperrt. Admin- und Nicht-Admin-Rollen, MFA-Einrichtung/-Bestätigung/-Reset, Recovery-Codes, Logout und Dokumentzugriff testen.
- Desktop, Tablet und Mobilgerät einschließlich Tastaturbedienung, Reduced Motion und relevanter Scrollzustände visuell prüfen; keine seitlichen Überläufe oder Konsolen-/Requestfehler.
- `git diff --check`, Preview-HTTP-Status und Projektänderungen prüfen. Kein Git-Push, Checkpoint oder Publish.


## Weitere konkrete Vorgaben aus dem Baukasten
- Die Abschnittsleiste erhält die Reihenfolge „Kontakt · Über mich · Werdegang · Interessen · Karriere · Sprachen · Spiele“; der aktuelle Abschnitt wird markiert. Auszeichnungen bleiben als erreichbarer Abschnitt erhalten. Auf dem Handy sind Anrufen, E-Mail, Kontakt speichern und Wallet die kompakte Schnellaktionsleiste.
- Kontaktzeilen sind als gut tappbare Karten mit passenden Icons, Wert und eigenem Kopierknopf umgesetzt. Eine Adressauswahl bietet Google Maps und Apple Maps; eine eingebettete Karte wird erst auf ausdrückliche Aktion geladen. Öffentliche Visitenkarte und vCard zeigen keine privaten Kontaktdaten.
- Karriere fasst die zwei bestehenden HSV-Stationen kompakt zusammen und verlinkt zum offiziellen HSV-Karriereportal. Wiederholte QR-, Wallet- und vCard-Aktionen werden auf eine klare Hauptstelle reduziert.
- Das HSV-Logo im Footer wird nach der neuesten Vorgabe rechteckig und füllend im Rahmen dargestellt; andere Logoformen bleiben von dieser gezielten Footer-Änderung unberührt. Das kleine Profilbild erhält einen HSV-blauen Akzentrand.
- Bilder bekommen aussagekräftige Alt-Texte, die Hell-/Dunkel-Flächen ausreichenden Kontrast und die Karte eine passende Open-Graph-Vorschau (Titel/Bild) für geteilte Links.
- Die Spiele-/Tabellenoberfläche bleibt am Ende oder einklappbar. Für die Tabelle werden Rang, Team, Spiele, Punkte und Stand dargestellt; Top fünf erscheinen zuerst, HSV ist blau hervorgehoben, die vollständige 18er-Tabelle öffnet als Dialog und scrollt die HSV-Zeile in Sicht. Die Aktualisierungszeit und Datenquelle werden aus dem tatsächlich abgerufenen Feed abgeleitet; bei Feed-Ausfall wird sichtbar auf Fallback umgeschaltet, ohne Fallbackdaten als live auszugeben.
- Die Infoleiste wird schmaler und die untere mobile Menüleiste auf die wichtigsten, verkleinerten Elemente reduziert. Wallet und vCard speichern bleiben dort dauerhaft sichtbar; zusätzlich stehen globale Zurück-/Vorwärts-Aktionen für die Website bereit. Im Bereich „Werdegang“ erscheint eine eigene Zurück-Schaltfläche. Unter „Über mich“ werden die drei größten bereits belegten Erfolge als Icon-Kacheln dargestellt; keine Erfolge werden hinzuerfunden.
