# TODO

## Profilseite und Seitenaktionen
- [x] Die bestehende HSV-Profilseite aus der separaten HTML-Kopie als Website übernehmen; die Originaldatei `/home/ubuntu/upload/index(17).html` unverändert lassen.
- [x] Profil-, Kontakt-, Karriere- und bestehende Navigationsinhalte beibehalten.
- [x] Auf Mobilgeräten einen Schnellzugriff auf zentrale Seitenaktionen bereitstellen.
- [x] Eine druckfreundliche Ansicht der Profilseite bereitstellen.
- [x] Die vorhandene `noindex, nofollow`-Einstellung beibehalten.

## HSV-Spiele und Tickets
- [x] Die Spielekarte zeigt die letzten zwei bestätigten Spiele und die nächsten zwei Spiele der HSV-Erstmannschaft.
- [x] Den bestehenden öffentlichen OpenFootball-Feed verwenden und bei Nichterreichbarkeit die vorhandenen Fallback-Daten anzeigen.
- [x] Für Heim- und Auswärtsspiele offizielle HSV-Ticketeinstiege anbieten.
- [x] Spiele und Ticketportal in blauen aufklappbaren Bereichen darstellen.

## Lebenslauf und Vorschaubilder
- [x] Die frühere öffentliche PDF-Datei aus der Website entfernen; ein CV-Download mit dem Dateinamen `Lebenslauf.pdf` ist nur über den serverseitig geschützten Dokumentzugriff nach Admin-Upload vorgesehen.
- [x] Alle drei früheren PDF-Seitenbilder aus `public/assets/` entfernen; die Seitenbilder werden nicht mehr öffentlich ausgeliefert.
- [x] Die bereitgestellte PDF war vor der Entfernung bytegleich übertragen worden (SHA-256 `1fbc6260f9e14c8047ea1525d135b2a0348bf3d5b6ad7a1ee7c9b9c32cd1381f`); eine öffentliche PDF-Kopie verbleibt nicht.

## Profilbild und Stadionmotiv
- [x] Die links stehende Person aus dem Profilfoto entfernen, Lasses Identität erhalten und das HSV-Wappen großflächig in den Hintergrund setzen.
- [x] Ein Bild des Volksparkstadions als abgedunkeltes Hintergrundmotiv im Kopfbereich einbinden, sodass Text und Profilbild gut lesbar bleiben.

## Statische Bereitstellung
- [x] Die Manus-Site mit Node-Server für geschützte Routen bereitstellen; der aktuelle Zugriff ist auf den Eigentümer begrenzt (`owner`).
- [x] Öffentliche Sichtbarkeit entziehen (Einstellung `owner`).
- [x] Auto Publish bleibt während der Arbeit deaktiviert (`publishing.auto_publish: false`); es wurde kein Push, Checkpoint oder Publish ausgelöst.
- [x] Keine API-Schlüssel in öffentlichen HTML-Dateien hinterlegen.

## Bildfeinschliff
- [x] Das Profilbild bis zum oberen Brustbereich neu rahmen, sodass Hände und Unterarme vollständig aus dem Bild sind; Lasses Erscheinung und HSV-Wappen erhalten.
- [x] Ein großes HSV-Wappen über den gesamten Website-Hintergrund legen und harmonisch mit den Blautönen verschmelzen.

## Kontakt & Standort
- [x] Telefon-, E-Mail- und Standorticons in kräftigem HSV-Blau mit gutem Kontrast darstellen.

## Domain und externe Subdomains
- [x] Kostenlose externe Hosting-Subdomains ohne Personennamen prüfen: Cloudflare Pages (`*.pages.dev`), Netlify (`*.netlify.app`) und Vercel (`*.vercel.app`). Der konkrete Netlify-Kandidat `hsv-profilkarte.netlify.app` wurde bei der Site-Erstellung als verfügbar bestätigt; andere Kandidaten bleiben ungeprüft.
- [x] Netlify Free wurde gewählt; ein neues Projekt mit dem namensfreien Slug `hsv-profilkarte` wurde im kostenlosen persönlichen Team angelegt.
- [x] Frühere Manus-Storage-Dateien waren nach `public/assets/` übertragen worden; in der aktuellen lokalen Vorschau sind CV-PDF, drei WebP-Seitenbilder und deren öffentliche Dateiverweise entfernt.
- [x] Keinen öffentlichen Netlify-Deploy abschließen: Die spätere Anweisung verlangt keine Veröffentlichung. Frühere Deployversuche wurden von Netlify mit „Skipped due to account credit usage exceeded“ übersprungen; `/`, `/assets/hsv-background.png` und `/assets/Lebenslauf.pdf` lieferten HTTP 404. Es wurde keine Netlify-Version veröffentlicht.

## Sprachen und Flaggen
- [x] Die vier Sprachen in der Profilkarte zusätzlich mit passenden Länderflaggen kennzeichnen: Deutsch, Englisch, Spanisch und Französisch.
- [x] Im bestehenden Dropdown zur Sprachauswahl passende Landesflaggen für alle sechs auswählbaren Sprachen anzeigen: Deutsch, Englisch, Französisch, Spanisch, Italienisch und Portugiesisch; die vier vorhandenen Sprachkenntnisse ebenfalls mit den jeweiligen Flaggen darstellen, ohne Sprachkenntnisse hinzuzufügen.

## HSV-Logos und Glasslook
- [x] Das bereitgestellte quadratische HSV-Logo als lokale Website-Datei unter `public/assets/logo_rund.png` einbinden.
- [x] Das Logo zwischen Darkmode und „Home | HSV“ zentriert in der durchgehend HSV-blau ausgefüllten Rechteckfläche darstellen; das Wappen unverzerrt einpassen und das Bild nach der neuesten Spezifikation 45 px hoch setzen (die spätere Angabe 45 px ersetzt die frühere Angabe 40 px).
- [x] „Home | HSV“ rechteckig gestalten und die übrigen HSV-Logos kreisförmig, bis zum blauen Kreisrand gefüllt und unverzerrt belassen.
- [x] Alle vier HSV-Logos mit einem weißen Rand von genau 2 px darstellen.
- [x] Den Glasslook auf die Oberflächen und Bedienelemente der gesamten Website anwenden; Textkontrast, Darkmode, Druckansicht und PDF-Vorschau lesbar halten.

## Zusätzliche Vorschau-Überarbeitung
- [x] Das `.brand-logo > img` bei 1431 px Viewportbreite auf 50 × 50 px und bei 519 px Viewportbreite auf 52 × 52 px einstellen; die runde Form, den weißen Rand und die übrigen Logo-Elemente unverändert lassen.
- [x] Im Bereich „Werdegang“ einen sichtbaren Zurück-zur-Übersicht-Button bereitstellen; er führt zurück zum Hauptinhalt und hat in allen sechs vorhandenen Sprachen eine passende Beschriftung.
- [x] „Impressum“ und „Datenschutz“ mit besserer Abstands-, Überschriften-, Link- und Zeilenführung lesbarer darstellen, ohne rechtliche Tatsachen zu erfinden oder vorhandene Angaben umzuschreiben; den vorhandenen Hosting-Anbieter-Hinweis zur Prüfung markieren.
- [x] Spiele- und Ticketbereiche mit klar erkennbaren blauen Buttons und blauen Ticket-Icons darstellen; offiziellen HSV-Ticketeinstieg, Spiel-Feed, Fallback-Daten, Spielinhalte und aufklappbare Bereiche beibehalten.
- [x] Die Lesbarkeit der Website-Texte durch gut kontrastierende Farben, angemessene Schriftgrößen und Zeilenabstände verbessern, ohne Profil- oder Lebenslaufinhalte zu ändern.
- [x] Im Sprachauswahl-Dropdown Fokus-, Kontrast- und Touch-Zustände verbessern; die vorhandenen Flaggen für Deutsch, Englisch, Französisch, Spanisch, Italienisch und Portugiesisch sowie die Flaggen bei den vier aufgeführten Sprachkenntnissen erhalten.
- [x] Das niedrig aufgelöste Hintergrundlogo durch das vorhandene hochaufgelöste HSV-Wappen ersetzen, großflächig und dezent als Raute im blauen Gesamthintergrund darstellen und die Lesbarkeit durch den bestehenden Kontrastschleier bewahren.
- [x] Die geänderte HTML-Seite nach einem Preview-Reload bei 1431 × 732 und 519 × 732 visuell prüfen und die aufklappbaren Bereiche sowie den Zurück-Button anhand ihrer Navigation kontrollieren.

## Vercel-Referenz – nur lokale Vorschau
- [x] Die bestehende Manus-Seite an die bereitgestellte Vercel-Karte `https://hsv-profil-card.vercel.app/` angleichen und optimieren; nur Preview, kein Push und keine Veröffentlichung. Vorhandene Inhalte, Funktionen, Assets und Projektstruktur bleiben erhalten.
- [x] Die Sprachauswahl als kompakten Flaggen-/Ländercode-Dropdown nach dem Vorbild der Vercel-Karte darstellen; alle sechs Sprachen und die bestehenden Übersetzungen bleiben erhalten.
- [x] Die mobile Schnellnavigation mit vollständig lesbaren Menüeinträgen und einem erkennbaren Hinweis auf horizontales Wischen optimieren. Die Schnellaktionsleiste verdeckt das Profilbild beim Einstieg nicht, bleibt beim Scrollen nach unten verborgen und erscheint beim Hochscrollen wieder.
- [x] Die Änderungen nach Reload auf Desktop und Mobil visuell prüfen sowie Sprachauswahl, Schnellnavigation und Kontakt-/Wallet-Aktionen kontrollieren.

## Responsive Verhalten – lokale Vorschau
- [x] Den Seitenrahmen mit fließenden Außenabständen und einer konsistenten maximalen Inhaltsbreite abstimmen; Tablet-Layouts bis zur passenden Breite einspaltig halten.
- [x] Kopfzeile und Kontakt-Kurzfelder für sehr schmale Handys anpassen, sodass keine Inhalte aus dem Seitenrahmen herauslaufen.
- [x] Auf schmalen Tablets den horizontalen Wischhinweis der Schnellnavigation zeigen, den letzten Navigationspunkt vollständig erreichbar halten und Sprungziele unterhalb der fixierten Navigation platzieren.
- [x] Vertikales Scrollen, Wiedererscheinen der mobilen Aktionsleiste beim Hochscrollen, alle drei Lebenslauf-Seiten im eigenen Scrollfeld und die Reduced-Motion-Einstellung prüfen.
- [x] Nach Reload 21 Breiten von 320 bis 1920 px testen; kein Seitenüberlauf, keine fehlgeschlagenen Requests, JavaScript- oder Konsolenfehler.

## Öffentliche Visitenkarte – Umbau nach Baukasten
- [x] „Über mich“ sprachlich glätten; Interessen als getrennte, gut lesbare Chips statt aneinanderhängender Begriffe zeigen.
- [x] Werdegang als klare Timeline gestalten; „Zurück zum Werdegang“ springt eindeutig an die richtige Stelle. Den Lebenslauf nur nach erfolgreicher Anmeldung als scrollbare Dokumentansicht anbieten, auf Mobilgeräten mit Vollbild-/neuem-Tab-Fallback sowie Schließen, Download und neuem Tab.
- [x] Abschnittsleiste in der Reihenfolge Kontakt, Über mich, Werdegang, Interessen, Karriere, Sprachen, Spiele darstellen; aktuellen Abschnitt hervorheben und bestehende Auszeichnungen erreichbar lassen. Mobil die Schnellaktionen Anrufen, E-Mail, Kontakt speichern und Wallet platzsparend und gut tappbar anbieten.
- [x] Infoleiste schmaler gestalten und das mobile Burger-Menü unten auf die wichtigsten, verkleinerten Einträge reduzieren. Wallet und vCard speichern bleiben dort dauerhaft sichtbar; zusätzliche Website-weite Zurück-/Vorwärts-Aktionen ergänzen. Im Werdegang eine eigene Zurück-Schaltfläche bereitstellen und unter „Über mich“ die drei größten bereits belegten Erfolge als Icon-Kacheln darstellen, ohne Erfolge hinzuzuerfinden.
- [x] Kontaktzeilen als klickbare Karten mit Icons und eigenen Kopieraktionen gestalten; Adresswahl für Google Maps/Apple Maps anbieten und externe eingebettete Karte erst nach Klick laden.
- [x] Karriere kompakt mit den beiden bestehenden HSV-Stationen und Link zum offiziellen HSV-Karriereportal darstellen; doppelte QR-, Wallet- und Kontakt-speichern-Aktionen auf klare Hauptstellen reduzieren.
- [x] Footer-HSV-Logo rechteckig und den Rahmen füllend darstellen; übrige HSV-Logoformen erhalten. Kleines Profilbild mit HSV-blauem Rahmen versehen.
- [x] Hell-/Dunkel-Kontrast, Alt-Texte, Tastaturbedienung, Open-Graph-Titel/-Bild, Touchflächen und Reduced Motion berücksichtigen.
- [ ] Spiele/Tabelle am Ende der Karte oder einklappbar belassen; Heim-/Auswärtskennzeichnung, Wappen und offizielle Ticketlinks beibehalten. Top fünf anzeigen, HSV-Zeile hervorheben, komplette 18er-Tabelle in einem Dialog mit HSV-Zeile im sichtbaren Bereich zeigen und Quelle/Aktualisierungszeit korrekt aus dem football-data.org-Free-Tier ausweisen; kostenlose Scores als verzögert und niemals als live bezeichnen. Bei Feed-Ausfall Fallback klar kennzeichnen und keine lückenhafte Tabelle als vollständig darstellen. Eine Tabelle gilt nur mit 18 Positionen und 18 eindeutigen Teamnamen als vollständig.
- [x] Die Karte nach Reload in der lokalen Vorschau an relevanten Breiten einschließlich 320, 375, 768, 1280 und 1920 px visuell prüfen; Inhalt und Schnellaktionen sind bedienbar und ohne seitlichen Seitenüberlauf.
- Stand: Die Match-API lieferte klar gekennzeichnete OpenFootball-Fallbackdaten (zwei vergangene und zwei kommende Spiele); mangels vollständiger Tabelle wird keine vollständige 18er-Tabelle angezeigt. football-data.org-Free-Tier-Zugang ist nicht eingerichtet, es wurde keine kostenpflichtige API aktiviert und kein Echtzeit-Liveticker getestet.

## Echter Privatbereich – serverseitig geschützt
- [x] Server und verwaltete MySQL-Datenbank wurden nach ausdrücklicher Freigabe aktiviert; die Plattform meldet beide wirksam. Diese beiden Fähigkeiten sind nicht rückgängig machbar, und Entwicklungs-/Produktionsumgebung teilen dieselbe Datenbank.
- [x] Node-Server auf dem bestehenden Preview-Port bereitstellen; Manus-OAuth-Login und sichere Sitzungsprüfung implementieren, statt eine clientseitige Passwortsperre zu verwenden. Anfangs nur `fiboe02@outlook.de` als Admin zulassen; andere Personen bleiben gesperrt, bis sie serverseitig freigegeben wurden. OAuth-Anmeldung wurde nicht end-to-end getestet.
- [x] Admin-MFA per TOTP verpflichtend machen; QR-/`otpauth://`-Einrichtung, Codebestätigung, 8–10 Wiederherstellungscodes, optional 30-Tage-Gerät, Abmelden und automatische Abmeldung bei Inaktivität bereitstellen. TOTP für weitere freigegebene Nutzer zunächst optional halten; Admin kann MFA zurücksetzen. Anmeldung und MFA-Reset wurden nicht durch Login getestet.
- [x] Nutzerrollen, Zugriffsliste, Sitzungen, MFA-Metadaten, private Kontaktangaben und Dokumentmetadaten in additiven MySQL-Migrationen serverseitig verwalten; private API-Routen bei jedem Abruf autorisieren. Keine Migration oder Datenbankschreiboperation wurde in der Vorschau ausgeführt.
- [x] Private Telefonnummer, private E-Mail-Adresse und Privatadresse aus öffentlichem HTML/JavaScript, nicht geschützten API-Antworten und öffentlicher vCard entfernen; geschäftliche Kontaktaktionen bleiben erhalten. `pnpm audit:privacy` meldet keine geprüften privaten Kontaktdaten oder PDF-Assets in öffentlichen Dateien.
- [x] Lebenslauf und private Dokumente aus öffentlich erreichbaren Dateien entfernen und nur nach Berechtigungsprüfung über zeitlich begrenzte, signierte Dokumentzugriffe bereitstellen. Der Storage-Vertrag bestätigt eine Gültigkeit von einer Stunde; die API meldet dieselbe Dauer über eine gemeinsame Konstante. Auf iOS/Android direkten PDF-Neutab-Fallback anbieten.
- [x] Privatzugang in Schnellnavigation, Kontaktbereich und Footer ergänzen. Nach Anmeldung freundliche Begrüßung, private Kontaktkarten, Dokumente, klare Status-/Fehlertexte, sichtbares „Zurück zur Karte“ und Abmelden anbieten.
- [x] Adminbereich mit Dokumentliste, Drag-and-drop-Upload, Sichtbar/Gesperrt-Schalter, freigeschalteten Personen und Sperrmöglichkeit implementieren; auf Mobilgeräten einspaltig mit großen Tippflächen. Drag-and-drop und Tastaturauswahl ergänzt.
- [x] TOTP-Verschlüsselungsschlüssel wurde ausschließlich über die geschützte Geheimnis-Eingabe hinterlegt; der Wert wurde nicht gelesen oder in Browsercode, Git, Logs oder Screenshots abgelegt. Private Dokumente und Kontaktwerte bleiben ebenfalls außerhalb dieser Orte.

## Lokale Vorschau und Abschluss
- [x] Passende Server-/Containerstruktur und Datenbankmigrationen anlegen; Preview auf Port 3000 nach Umstellung mit HTTP 200, Rollen- und Schutzverhalten prüfen. Ungeschützte private/Admin-GETs liefern HTTP 401; keine Datenbank-Schreibtests durchgeführt. Keine Veröffentlichung, kein Push und kein Checkpoint.
- [x] `git diff --check` ausführen und einen unabhängigen read-only Validierungsagenten gegen Plan, Zugriffsschutz, öffentliche Daten und bestehende Funktionen prüfen lassen; bestätigte Fehler beheben. Teamnamen-Eindeutigkeit, vCard-Hinweise in sechs Sprachen und Dokumentlink-TTL nachgearbeitet; `pnpm check`, `pnpm audit:privacy` und `git diff --check` erfolgreich.

## Vor einer möglichen öffentlichen Freigabe
- [ ] Den vorhandenen Datenschutztext fachlich prüfen: Er nennt weiterhin GitHub Pages, während das aktuelle Projekt eine Manus-Website ist; außerdem ist im Projekt `analytics.enabled: true` gesetzt, sodass die Aussage zu Analyse-Tools geprüft werden sollte. Keine Verarbeitungsdetails ohne Bestätigung ergänzen; die Website bleibt bis zu einer ausdrücklichen Freigabe unveröffentlicht.


## Freigegebene lokale Vorschau – UI-Überarbeitung
- [ ] Das Burger-Menü kompakt rechts anordnen und für Mobilgeräte zugänglich auf- und zuklappbar machen; vorhandene Schnellnavigation und Inhalte erhalten.
- [ ] Den Zurück-zur-Übersicht-Button im Werdegang ans Abschnittsende verschieben.
- [ ] Impressum und Datenschutz ausschließlich visuell lesbarer gestalten; vorhandene Rechtstexte und Tatsachen unverändert lassen.
- [ ] Das HSV-Footerlogo optisch aufwerten und zentriert darstellen.
- [ ] Spiel- und Tabellendaten aus dem vorhandenen kostenlosen Feed klar als verzögert kennzeichnen; keinen Echtzeit-Liveticker oder kostenpflichtigen API-Zugriff vortäuschen. Ticketlinks bleiben offizielle HSV-Einstiege.
- [ ] Nutzer- und Adminoberfläche als klar gekennzeichnete Layoutdemos mit ausschließlich synthetischen Beispieldaten zeigen; keine Authentifizierung umgehen und keine privaten API-Aufrufe für die Demos ergänzen.
- [ ] Die vorhandenen Flaggen der sechs auswählbaren Sprachen erhalten.
- [ ] Die lokale Vorschau nach dem Reload auf Desktop, Tablet und Mobilgerät visuell prüfen; kein Commit, Push, Checkpoint oder Publish.
