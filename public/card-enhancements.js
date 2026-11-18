(() => {
  'use strict';

  const COPY = {
    de: {
      private: 'Privater Bereich', privateTitle: 'Geschützter Privatbereich', previous: 'Zurück', next: 'Weiter',
      save: 'vCard speichern', wallet: 'Wallet', copy: 'Kopieren', copied: 'Kontaktdatum kopiert.',
      copyFailed: 'Kopieren ist auf diesem Gerät nicht verfügbar.', highlights: 'Erfolge im Überblick',
      firstTitle: 'First Class Honours', firstDetail: 'UCFB Wembley · Abschlussarbeit 88/100',
      scholarshipTitle: 'Stipendium 2018', scholarshipDetail: 'Auszeichnung im Jahr 2018',
      faTitle: 'FA Talent Identification Level 1', faDetail: 'Weiterbildung / Zertifizierung',
      moreAwards: 'Weitere Auszeichnungen', backOverview: '↑ Zurück zur Übersicht',
      loading: 'Spiele und Tabelle werden geladen …', unavailable: 'Spieldaten sind derzeit nicht verfügbar.',
      updated: 'Letzter erfolgreicher Abruf', noTimestamp: 'Kein Abrufzeitpunkt verfügbar',
      delayed: 'Free-Tier-Daten können verzögert sein; kein Echtzeit-Liveticker.',
      fallback: 'Fallback-Quelle; Angaben können lückenhaft sein.',
      tableFallback: 'Keine verlässliche vollständige Tabelle verfügbar.',
      source: 'Quelle', refresh: 'Daten aktualisieren', topFive: 'Top 5 · Bundesliga', fullTable: 'Komplette Tabelle (18 Mannschaften)',
      noTable: 'Derzeit sind keine verlässlichen Tabellendaten verfügbar.', noMatches: 'Keine passenden Spieltermine verfügbar.',
      home: 'Heimspiel', away: 'Auswärtsspiel', finished: 'Beendet', scheduled: 'Geplant', kickoffUnknown: 'Anstoßzeit nicht angegeben',
      ticket: 'Tickets', rank: 'Platz', club: 'Verein', played: 'Sp', won: 'S', drawn: 'U', lost: 'N', gd: 'TD', points: 'Pkt',
      close: 'Schließen', about: 'Über mich',
      menuOpen: 'Menü öffnen', menuClose: 'Menü schließen',
      ticketNote: 'Ticketverfügbarkeit und Preise werden im offiziellen HSV-Ticketshop angezeigt; diese Seite bietet keinen eigenen Live-Ticketfeed.'
    },
    en: {
      private: 'Private area', privateTitle: 'Protected private area', previous: 'Back', next: 'Forward',
      save: 'Save vCard', wallet: 'Wallet', copy: 'Copy', copied: 'Contact detail copied.',
      copyFailed: 'Copying is not available on this device.', highlights: 'Career highlights',
      firstTitle: 'First Class Honours', firstDetail: 'UCFB Wembley · thesis mark 88/100',
      scholarshipTitle: '2018 scholarship', scholarshipDetail: 'Awarded in 2018',
      faTitle: 'FA Talent Identification Level 1', faDetail: 'Professional development / certification',
      moreAwards: 'More awards', backOverview: '↑ Back to overview',
      loading: 'Loading matches and standings …', unavailable: 'Match data is currently unavailable.',
      updated: 'Last successful fetch', noTimestamp: 'No fetch time available',
      delayed: 'Free-tier data may be delayed; this is not a real-time live-score feed.',
      fallback: 'Fallback source; coverage may be incomplete.',
      tableFallback: 'No reliable complete standings table is available.',
      source: 'Source', refresh: 'Refresh data', topFive: 'Top 5 · Bundesliga', fullTable: 'Complete table (18 teams)',
      noTable: 'Reliable standings data is currently unavailable.', noMatches: 'No matching fixtures are available.',
      home: 'Home', away: 'Away', finished: 'Full time', scheduled: 'Scheduled', kickoffUnknown: 'Kick-off time not provided',
      ticket: 'Tickets', rank: 'Pos', club: 'Club', played: 'P', won: 'W', drawn: 'D', lost: 'L', gd: 'GD', points: 'Pts',
      close: 'Close', about: 'About me',
      menuOpen: 'Open menu', menuClose: 'Close menu',
      ticketNote: 'Ticket availability and prices are shown in the official HSV ticket shop; this page does not provide its own live ticket feed.'
    },
    fr: {
      private: 'Espace privé', privateTitle: 'Espace privé protégé', previous: 'Précédent', next: 'Suivant',
      save: 'Enregistrer la vCard', wallet: 'Wallet', copy: 'Copier', copied: 'Coordonnée copiée.',
      copyFailed: 'La copie n’est pas disponible sur cet appareil.', highlights: 'Réalisations',
      firstTitle: 'First Class Honours', firstDetail: 'UCFB Wembley · mémoire 88/100',
      scholarshipTitle: 'Bourse 2018', scholarshipDetail: 'Distinction obtenue en 2018',
      faTitle: 'FA Talent Identification Level 1', faDetail: 'Formation / certification',
      moreAwards: 'Autres distinctions', backOverview: '↑ Retour à la présentation',
      loading: 'Chargement des matchs et du classement …', unavailable: 'Les données des matchs sont indisponibles.',
      updated: 'Dernière récupération réussie', noTimestamp: 'Heure de récupération indisponible',
      delayed: 'Les données gratuites peuvent être différées ; aucun score en temps réel.',
      fallback: 'Source de secours ; les données peuvent être incomplètes.',
      tableFallback: 'Aucun classement complet fiable n’est disponible.',
      source: 'Source', refresh: 'Actualiser les données', topFive: 'Top 5 · Bundesliga', fullTable: 'Classement complet (18 équipes)',
      noTable: 'Aucune donnée fiable de classement n’est actuellement disponible.', noMatches: 'Aucun match correspondant n’est disponible.',
      home: 'À domicile', away: 'À l’extérieur', finished: 'Terminé', scheduled: 'Programmé', kickoffUnknown: 'Heure du coup d’envoi non indiquée',
      ticket: 'Billets', rank: 'Pos.', club: 'Club', played: 'J', won: 'G', drawn: 'N', lost: 'P', gd: 'Diff.', points: 'Pts',
      close: 'Fermer', about: 'À propos',
      menuOpen: 'Ouvrir le menu', menuClose: 'Fermer le menu',
      ticketNote: 'La disponibilité et les prix des billets sont indiqués dans la billetterie officielle du HSV ; cette page ne fournit pas de flux de billetterie en direct.'
    },
    es: {
      private: 'Área privada', privateTitle: 'Área privada protegida', previous: 'Atrás', next: 'Adelante',
      save: 'Guardar vCard', wallet: 'Wallet', copy: 'Copiar', copied: 'Dato de contacto copiado.',
      copyFailed: 'La copia no está disponible en este dispositivo.', highlights: 'Logros destacados',
      firstTitle: 'First Class Honours', firstDetail: 'UCFB Wembley · trabajo final 88/100',
      scholarshipTitle: 'Beca 2018', scholarshipDetail: 'Distinción obtenida en 2018',
      faTitle: 'FA Talent Identification Level 1', faDetail: 'Formación / certificación',
      moreAwards: 'Más reconocimientos', backOverview: '↑ Volver al resumen',
      loading: 'Cargando partidos y clasificación …', unavailable: 'Los datos de los partidos no están disponibles.',
      updated: 'Última consulta correcta', noTimestamp: 'Hora de consulta no disponible',
      delayed: 'Los datos gratuitos pueden llevar retraso; no es un marcador en tiempo real.',
      fallback: 'Fuente alternativa; los datos pueden estar incompletos.',
      tableFallback: 'No hay una clasificación completa y fiable disponible.',
      source: 'Fuente', refresh: 'Actualizar datos', topFive: 'Top 5 · Bundesliga', fullTable: 'Clasificación completa (18 equipos)',
      noTable: 'No hay datos fiables de clasificación en este momento.', noMatches: 'No hay partidos correspondientes disponibles.',
      home: 'En casa', away: 'Fuera', finished: 'Finalizado', scheduled: 'Programado', kickoffUnknown: 'Hora de inicio no indicada',
      ticket: 'Entradas', rank: 'Pos.', club: 'Club', played: 'PJ', won: 'G', drawn: 'E', lost: 'P', gd: 'DG', points: 'Pts',
      close: 'Cerrar', about: 'Sobre mí',
      menuOpen: 'Abrir menú', menuClose: 'Cerrar menú',
      ticketNote: 'La disponibilidad y los precios de las entradas se muestran en la taquilla oficial del HSV; esta página no ofrece un feed propio en directo.'
    },
    it: {
      private: 'Area privata', privateTitle: 'Area privata protetta', previous: 'Indietro', next: 'Avanti',
      save: 'Salva vCard', wallet: 'Wallet', copy: 'Copia', copied: 'Dato di contatto copiato.',
      copyFailed: 'La copia non è disponibile su questo dispositivo.', highlights: 'Risultati principali',
      firstTitle: 'First Class Honours', firstDetail: 'UCFB Wembley · tesi 88/100',
      scholarshipTitle: 'Borsa di studio 2018', scholarshipDetail: 'Riconoscimento nel 2018',
      faTitle: 'FA Talent Identification Level 1', faDetail: 'Formazione / certificazione',
      moreAwards: 'Altri riconoscimenti', backOverview: '↑ Torna alla panoramica',
      loading: 'Caricamento partite e classifica …', unavailable: 'I dati delle partite non sono disponibili.',
      updated: 'Ultimo recupero riuscito', noTimestamp: 'Orario di recupero non disponibile',
      delayed: 'I dati gratuiti possono essere in ritardo; non è un live score in tempo reale.',
      fallback: 'Fonte di riserva; i dati possono essere incompleti.',
      tableFallback: 'Non è disponibile una classifica completa affidabile.',
      source: 'Fonte', refresh: 'Aggiorna i dati', topFive: 'Top 5 · Bundesliga', fullTable: 'Classifica completa (18 squadre)',
      noTable: 'I dati affidabili della classifica non sono disponibili.', noMatches: 'Nessuna partita corrispondente disponibile.',
      home: 'In casa', away: 'In trasferta', finished: 'Conclusa', scheduled: 'In programma', kickoffUnknown: 'Orario di inizio non indicato',
      ticket: 'Biglietti', rank: 'Pos.', club: 'Club', played: 'PG', won: 'V', drawn: 'N', lost: 'P', gd: 'DR', points: 'Pt',
      close: 'Chiudi', about: 'Chi sono',
      menuOpen: 'Apri il menu', menuClose: 'Chiudi il menu',
      ticketNote: 'Disponibilità e prezzi dei biglietti sono indicati nel negozio ufficiale HSV; questa pagina non offre un feed biglietti in tempo reale.'
    },
    pt: {
      private: 'Área privada', privateTitle: 'Área privada protegida', previous: 'Voltar', next: 'Avançar',
      save: 'Guardar vCard', wallet: 'Wallet', copy: 'Copiar', copied: 'Contacto copiado.',
      copyFailed: 'A cópia não está disponível neste dispositivo.', highlights: 'Principais conquistas',
      firstTitle: 'First Class Honours', firstDetail: 'UCFB Wembley · dissertação 88/100',
      scholarshipTitle: 'Bolsa de estudo 2018', scholarshipDetail: 'Distinção em 2018',
      faTitle: 'FA Talent Identification Level 1', faDetail: 'Formação / certificação',
      moreAwards: 'Mais distinções', backOverview: '↑ Voltar à visão geral',
      loading: 'A carregar jogos e classificação …', unavailable: 'Os dados dos jogos não estão disponíveis.',
      updated: 'Última consulta bem-sucedida', noTimestamp: 'Hora da consulta indisponível',
      delayed: 'Os dados gratuitos podem ter atraso; não são resultados em tempo real.',
      fallback: 'Fonte de recurso; os dados podem estar incompletos.',
      tableFallback: 'Não há uma classificação completa e fiável disponível.',
      source: 'Fonte', refresh: 'Atualizar dados', topFive: 'Top 5 · Bundesliga', fullTable: 'Classificação completa (18 equipas)',
      noTable: 'Os dados fiáveis da classificação não estão disponíveis.', noMatches: 'Não há jogos correspondentes disponíveis.',
      home: 'Em casa', away: 'Fora', finished: 'Terminado', scheduled: 'Agendado', kickoffUnknown: 'Hora de início não indicada',
      ticket: 'Bilhetes', rank: 'Pos.', club: 'Clube', played: 'J', won: 'V', drawn: 'E', lost: 'D', gd: 'DG', points: 'Pts',
      close: 'Fechar', about: 'Sobre mim',
      menuOpen: 'Abrir menu', menuClose: 'Fechar menu',
      ticketNote: 'A disponibilidade e os preços dos bilhetes são apresentados na bilheteira oficial do HSV; esta página não oferece um feed próprio em tempo real.'
    }
  };

  const ABOUT = {
    de: 'Ich arbeite international in Player Care und Sportadministration und verbinde Erfahrung aus Bundesliga und Premier League mit strukturierter Spielerbetreuung, Transferabwicklung im TMS sowie der Koordination von Signing-Prozessen und Beraternetzwerken. Mein Studium Football Business & Marketing am UCFB Wembley schloss ich mit First Class Honours ab.',
    en: 'I work internationally across player care and football administration, combining Bundesliga and Premier League experience with player support, TMS transfer operations, and the coordination of signing processes and agent networks. I graduated in Football Business & Marketing from UCFB Wembley with First Class Honours.',
    fr: 'J’exerce dans le player care et l’administration du football à l’international. Mon expérience en Bundesliga et en Premier League couvre l’accompagnement des joueurs, les opérations de transfert via TMS et la coordination des signatures et des réseaux d’agents. J’ai obtenu un diplôme en Football Business & Marketing à l’UCFB Wembley avec la mention First Class Honours.',
    es: 'Trabajo a nivel internacional en player care y administración del fútbol, combinando experiencia en la Bundesliga y la Premier League con la atención a jugadores, la gestión de transferencias mediante TMS y la coordinación de procesos de firma y redes de agentes. Me gradué en Football Business & Marketing en UCFB Wembley con First Class Honours.',
    it: 'Lavoro a livello internazionale nel player care e nell’amministrazione calcistica, unendo l’esperienza in Bundesliga e Premier League all’assistenza ai giocatori, alla gestione dei trasferimenti tramite TMS e al coordinamento delle firme e delle reti di agenti. Ho conseguito la laurea in Football Business & Marketing presso UCFB Wembley con First Class Honours.',
    pt: 'Trabalho internacionalmente em player care e administração do futebol, reunindo experiência na Bundesliga e na Premier League com apoio aos jogadores, operações de transferência no TMS e coordenação de processos de assinatura e redes de agentes. Concluí Football Business & Marketing na UCFB Wembley com First Class Honours.'
  };

  const langSelect = document.querySelector('#lang-select');
  const language = () => COPY[langSelect?.value] ? langSelect.value : 'de';
  const t = (key) => COPY[language()][key] || COPY.de[key] || key;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function localizeEnhancements() {
    document.querySelectorAll('[data-card-copy]').forEach((node) => {
      node.textContent = t(node.dataset.cardCopy);
    });
    const aboutText = document.querySelector('#ueber-mich [data-i18n="aboutText"]');
    if (aboutText) aboutText.textContent = ABOUT[language()];
    const back = document.querySelector('#werdegang .career-back');
    if (back) back.textContent = t('backOverview');
    const menuToggle = document.querySelector('.quick-nav-toggle');
    if (menuToggle) {
      const label = t(document.querySelector('.quick-nav')?.classList.contains('is-open') ? 'menuClose' : 'menuOpen');
      menuToggle.setAttribute('aria-label', label);
      menuToggle.title = label;
    }
    if (window.hsvMatchesData) renderMatches(window.hsvMatchesData);
  }

  function appendIcon(container, kind) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const paths = {
      lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3',
      back: 'M19 12H5m7 7-7-7 7-7', forward: 'M5 12h14m-7-7 7 7-7 7',
      cap: 'm2 9 10-5 10 5-10 5L2 9Zm4 2v5c3 2 9 2 12 0v-5M22 9v6',
      star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
      award: 'M8 21h8m-4-4v4M12 3l2.5 5.2 5.8.8-4.2 4.1 1 5.8-5.1-2.7-5.1 2.7 1-5.8-4.2-4.1 5.8-.8L12 3Z',
      wallet: 'M3 6.5A2.5 2.5 0 0 1 5.5 4H20v16H5.5A2.5 2.5 0 0 1 3 17.5v-11ZM3 7h17m-5 6h5',
      card: 'M4 5h16v14H4zM4 9h16m-12 4h4'
    };
    path.setAttribute('d', paths[kind] || paths.star);
    svg.append(path);
    container.append(svg);
  }

  function buildHighlights() {
    const about = document.querySelector('#ueber-mich');
    if (!about || about.querySelector('.achievement-grid')) return;
    const heading = el('h3', 'achievement-heading');
    heading.dataset.cardCopy = 'highlights';
    const grid = el('div', 'achievement-grid');
    const items = [
      { icon: 'cap', title: 'firstTitle', detail: 'firstDetail' },
      { icon: 'star', title: 'scholarshipTitle', detail: 'scholarshipDetail' },
      { icon: 'award', title: 'faTitle', detail: 'faDetail' }
    ];
    for (const item of items) {
      const card = el('article', 'achievement-tile');
      const icon = el('span', 'achievement-icon');
      appendIcon(icon, item.icon);
      const title = el('strong', '', t(item.title));
      title.dataset.cardCopy = item.title;
      const detail = el('span', 'achievement-detail', t(item.detail));
      detail.dataset.cardCopy = item.detail;
      card.append(icon, title, detail);
      grid.append(card);
    }
    const awardsLink = el('a', 'awards-inline-link', t('moreAwards'));
    awardsLink.href = '#auszeichnungen';
    awardsLink.dataset.cardCopy = 'moreAwards';
    about.append(heading, grid, awardsLink);
  }

  function makePrivateLink(className) {
    const link = el('a', className);
    link.href = '/privat.html';
    link.title = t('privateTitle');
    link.setAttribute('aria-label', t('privateTitle'));
    appendIcon(link, 'lock');
    const label = el('span', 'private-link-label', t('private'));
    label.dataset.cardCopy = 'private';
    link.append(label);
    return link;
  }

  function compactNavigation() {
    const nav = document.querySelector('.quick-nav');
    if (!nav) return;
    const desired = ['kontakt', 'ueber-mich', 'werdegang', 'interessen', 'karriere', 'sprachen', 'spiele'];
    const anchors = [...nav.querySelectorAll('a[href^="#"]')];
    const byTarget = new Map(anchors.map((anchor) => [anchor.getAttribute('href').slice(1), anchor]));
    const kept = desired.map((id) => byTarget.get(id)).filter(Boolean);
    const discarded = byTarget.get('auszeichnungen');
    if (discarded) discarded.remove();
    const keepSet = new Set(kept);
    const controls = [...nav.children].filter((child) => !anchors.includes(child));
    const otherAnchors = anchors.filter((anchor) => !keepSet.has(anchor) && anchor !== discarded);
    const privateLink = nav.querySelector('.private-nav-entry') || makePrivateLink('private-nav-entry');
    nav.replaceChildren(...kept, ...controls, ...otherAnchors, privateLink);
  }

  function addCompactMenu() {
    const nav = document.querySelector('.quick-nav');
    const header = document.querySelector('.header-right');
    if (!nav || !header || header.querySelector('.quick-nav-toggle')) return;
    if (!nav.id) nav.id = 'quick-nav';
    const button = el('button', 'quick-nav-toggle');
    button.type = 'button';
    button.setAttribute('aria-controls', nav.id);
    button.setAttribute('aria-expanded', 'false');
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    icon.append(path);
    button.append(icon);
    const setOpen = (open, restoreFocus = false) => {
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      const label = t(open ? 'menuClose' : 'menuOpen');
      button.setAttribute('aria-label', label);
      button.title = label;
      if (restoreFocus) button.focus();
    };
    button.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) setOpen(false);
    });
    document.addEventListener('pointerdown', (event) => {
      if (nav.classList.contains('is-open') && !nav.contains(event.target) && !button.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, true);
    });
    header.append(button);
    document.body.classList.add('has-compact-menu');
    setOpen(false);
  }

  async function copyText(value) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const area = document.createElement('textarea');
        area.value = value;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.append(area);
        area.select();
        const copied = document.execCommand('copy');
        area.remove();
        if (!copied) throw new Error('copy unavailable');
      }
      announce(t('copied'));
    } catch {
      announce(t('copyFailed'));
    }
  }

  function prepareContactCards() {
    document.querySelectorAll('#kontakt .contact-list > .contact-item').forEach((item) => {
      if (item.parentElement?.classList.contains('contact-action-row')) return;
      const value = item.querySelector('.contact-value')?.textContent?.trim();
      if (!value) return;
      const wrapper = el('div', 'contact-action-row');
      const button = el('button', 'contact-copy-button', t('copy'));
      button.type = 'button';
      button.dataset.cardCopy = 'copy';
      button.setAttribute('aria-label', `${t('copy')}: ${item.querySelector('strong')?.textContent?.trim() || ''}`);
      button.addEventListener('click', () => copyText(value));
      item.replaceWith(wrapper);
      wrapper.append(item, button);
    });
  }

  function addPrivateEntries() {
    const contact = document.querySelector('#kontakt');
    if (contact && !contact.querySelector('.private-contact-entry')) {
      const link = makePrivateLink('private-contact-entry');
      const mapsButton = contact.querySelector('#open-work-maps-modal');
      if (mapsButton) mapsButton.insertAdjacentElement('afterend', link);
      else contact.append(link);
    }
    const footer = document.querySelector('footer');
    if (footer && !footer.querySelector('.private-footer-entry')) footer.append(makePrivateLink('private-footer-entry'));
  }

  function lazyLoadWorkMap() {
    const frame = document.querySelector('#kontakt iframe[data-map-src]');
    if (!frame) return;
    const details = frame.closest('details');
    if (!details) return;
    details.addEventListener('toggle', () => {
      if (details.open && !frame.hasAttribute('src')) frame.setAttribute('src', frame.dataset.mapSrc);
    });
  }

  function createActionBar() {
    if (document.querySelector('.site-action-bar')) return;
    const bar = el('nav', 'site-action-bar');
    bar.setAttribute('aria-label', 'Website-Navigation und Kontaktaktionen');
    const actions = [
      ['back', 'previous', () => { if (history.length > 1) history.back(); else window.scrollTo({ top: 0, behavior: 'smooth' }); }],
      ['forward', 'next', () => history.forward()],
      ['wallet', 'wallet', () => document.querySelector('#open-wallet-modal')?.click()],
      ['card', 'save', () => document.querySelector('#save-contact')?.click()]
    ];
    for (const [iconName, key, action] of actions) {
      const button = el('button', `site-action-button site-action-${iconName}`);
      button.type = 'button';
      button.dataset.cardCopy = key;
      button.setAttribute('aria-label', t(key));
      appendIcon(button, iconName);
      const label = el('span', '', t(key));
      label.dataset.cardCopy = key;
      button.append(label);
      button.addEventListener('click', action);
      bar.append(button);
    }
    document.body.append(bar);
  }

  function ensureCareerBack() {
    const section = document.querySelector('#werdegang');
    if (!section) return;
    let back = section.querySelector('.career-back');
    if (!back) {
      back = el('a', 'career-back', t('backOverview'));
      section.querySelector('h2')?.insertAdjacentElement('afterend', back);
    }
    back.href = '#main-content';
    back.dataset.cardCopy = 'backOverview';
    section.append(back);
  }

  function ensureMatchDisclosures() {
    const section = document.querySelector('#spiele');
    if (!section) return;
    const firstMatch = section.querySelector('.match-acc');
    if (firstMatch && !section.querySelector('.feed-disclosure')) {
      const notice = el('p', 'feed-disclosure', t('delayed'));
      notice.dataset.cardCopy = 'delayed';
      notice.setAttribute('role', 'note');
      firstMatch.before(notice);
    }
    const ticketPanel = section.querySelector('.match-ticket-panel');
    if (ticketPanel && !ticketPanel.querySelector('.ticket-data-note')) {
      const notice = el('p', 'ticket-data-note', t('ticketNote'));
      notice.dataset.cardCopy = 'ticketNote';
      const intro = ticketPanel.querySelector('.match-note');
      if (intro) intro.insertAdjacentElement('afterend', notice);
      else ticketPanel.prepend(notice);
    }
  }

  function ensureStandingsUi() {
    const section = document.querySelector('#spiele');
    if (!section || section.querySelector('#match-standings')) return;
    const sourceStatus = section.querySelector('.match-source');
    if (sourceStatus) {
      sourceStatus.replaceChildren();
      sourceStatus.id = 'match-source-status';
      sourceStatus.setAttribute('aria-live', 'polite');
    }
    const updated = section.querySelector('#matches-updated');
    const panel = el('div', 'standings-panel');
    panel.id = 'match-standings';
    const header = el('div', 'standings-heading');
    const heading = el('h3', '', t('topFive'));
    heading.dataset.cardCopy = 'topFive';
    const refresh = el('button', 'standings-refresh', t('refresh'));
    refresh.type = 'button';
    refresh.dataset.cardCopy = 'refresh';
    refresh.addEventListener('click', fetchMatchData);
    header.append(heading, refresh);
    const status = el('p', 'standings-status', t('loading'));
    status.id = 'standings-status';
    const tableHost = el('div', 'table-scroll standings-top-five');
    tableHost.id = 'standings-top-five';
    const fullButton = el('button', 'standings-full-button', t('fullTable'));
    fullButton.type = 'button';
    fullButton.dataset.cardCopy = 'fullTable';
    fullButton.hidden = true;
    fullButton.addEventListener('click', openFullTable);
    panel.append(header, status, tableHost, fullButton);
    if (updated) updated.insertAdjacentElement('afterend', panel);
    else section.append(panel);

    const dialog = el('dialog', 'standings-dialog');
    dialog.id = 'full-standings-dialog';
    dialog.setAttribute('aria-labelledby', 'full-standings-title');
    const dialogHead = el('div', 'standings-dialog-head');
    const dialogTitle = el('h2', '', t('fullTable'));
    dialogTitle.id = 'full-standings-title';
    dialogTitle.dataset.cardCopy = 'fullTable';
    const close = el('button', 'standings-close', t('close'));
    close.type = 'button';
    close.dataset.cardCopy = 'close';
    close.addEventListener('click', () => dialog.close());
    dialogHead.append(dialogTitle, close);
    const fullTable = el('div', 'table-scroll full-standings-table');
    fullTable.id = 'full-standings-table';
    dialog.append(dialogHead, fullTable);
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => document.querySelector('#open-full-table')?.focus());
    document.body.append(dialog);
    fullButton.id = 'open-full-table';
  }

  function formatDate(value, withTime = true) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    const options = withTime ? { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' } : { dateStyle: 'medium', timeZone: 'Europe/Berlin' };
    return new Intl.DateTimeFormat(language(), options).format(date);
  }

  function teamNode(name, crest, hsv) {
    const team = el('div', `match-team${hsv ? ' is-hsv' : ''}`);
    if (crest && /^https:\/\//i.test(crest)) {
      const img = el('img', 'match-crest');
      img.src = crest;
      img.alt = '';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.addEventListener('error', () => img.remove(), { once: true });
      team.append(img);
    } else if (hsv) {
      const img = el('img', 'match-crest');
      img.src = '/assets/logo_rund.png';
      img.alt = '';
      img.loading = 'lazy';
      team.append(img);
    }
    team.append(el('strong', '', name || '—'));
    return team;
  }

  function renderMatchCard(match) {
    const homeIsHsv = /hamburg/i.test(String(match.home || ''));
    const awayIsHsv = /hamburg/i.test(String(match.away || ''));
    const isHsvHome = homeIsHsv || !awayIsHsv;
    const card = el('article', 'server-match-card');
    const top = el('div', 'server-match-meta');
    const badge = el('span', `home-away-badge ${isHsvHome ? 'badge-home' : 'badge-away'}`, isHsvHome ? t('home') : t('away'));
    const dateLabel = formatDate(match.date, Boolean(match.timeKnown));
    top.append(badge, el('time', '', dateLabel || t('kickoffUnknown')));
    const teams = el('div', 'server-match-teams');
    teams.append(teamNode(match.home, match.homeCrest, homeIsHsv));
    const scoreText = match.completed && Number.isFinite(Number(match.homeScore)) && Number.isFinite(Number(match.awayScore))
      ? `${match.homeScore}–${match.awayScore}` : 'vs';
    teams.append(el('strong', 'server-match-score', scoreText));
    teams.append(teamNode(match.away, match.awayCrest, awayIsHsv));
    const bottom = el('div', 'server-match-bottom');
    const status = match.completed ? t('finished') : t('scheduled');
    bottom.append(el('span', 'server-match-status', status));
    const ticket = el('a', 'match-ticket-btn', t('ticket'));
    ticket.href = isHsvHome ? 'https://www.ticket-onlineshop.com/ols/hsv-heimspiele' : 'https://www.hsv.de/tickets';
    ticket.target = '_blank';
    ticket.rel = 'noopener noreferrer';
    bottom.append(ticket);
    card.append(top, teams, bottom);
    return card;
  }

  function makeStandingsTable(rows) {
    const table = el('table', 'standings-table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const key of ['rank', 'club', 'played', 'won', 'drawn', 'lost', 'gd', 'points']) headRow.append(el('th', '', t(key)));
    thead.append(headRow);
    const tbody = document.createElement('tbody');
    for (const row of rows) {
      const tr = document.createElement('tr');
      const isHsv = /hamburg/i.test(String(row.name || ''));
      if (isHsv) tr.className = 'hsv-standings-row';
      const pos = el('th', '', String(row.position));
      pos.scope = 'row';
      tr.append(pos);
      const nameCell = document.createElement('td');
      const team = el('span', 'standings-team');
      if (row.crest && /^https:\/\//i.test(row.crest)) {
        const img = el('img', 'standings-crest');
        img.src = row.crest;
        img.alt = '';
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.addEventListener('error', () => img.remove(), { once: true });
        team.append(img);
      } else if (isHsv) {
        const img = el('img', 'standings-crest');
        img.src = '/assets/logo_rund.png';
        img.alt = '';
        team.append(img);
      }
      team.append(el('span', '', row.name));
      nameCell.append(team);
      tr.append(nameCell);
      for (const value of [row.played, row.won, row.draw, row.lost, row.goalDifference, row.points]) tr.append(el('td', 'numeric-cell', String(value)));
      tbody.append(tr);
    }
    table.append(thead, tbody);
    return table;
  }

  function isCompleteStandingsTable(rows) {
    if (!Array.isArray(rows) || rows.length !== 18) return false;
    const positions = new Set(rows.map((row) => Number(row.position)));
    const teams = new Set(rows.map((row) => String(row.name || '').normalize('NFKC').trim().toLocaleLowerCase('de-DE')));
    return positions.size === 18
      && Array.from({ length: 18 }, (_, index) => index + 1).every((position) => positions.has(position))
      && teams.size === 18
      && rows.every((row) => String(row.name || '').trim());
  }

  function renderMatches(data) {
    const matches = data?.matches;
    const recent = document.querySelector('#last-match-list');
    const next = document.querySelector('#next-match-list');
    if (!matches || !recent || !next) return;
    recent.replaceChildren();
    next.replaceChildren();
    for (const [target, list] of [[recent, matches.recent || []], [next, matches.next || []]]) {
      if (!list.length) target.append(el('p', 'match-empty', t('noMatches')));
      else list.forEach((match) => target.append(renderMatchCard(match)));
    }
    const stamp = matches.fetchedAt ? `${t('updated')}: ${formatDate(matches.fetchedAt)}` : t('noTimestamp');
    const updated = document.querySelector('#matches-updated');
    if (updated) updated.textContent = stamp;
    const source = document.querySelector('#match-source-status');
    if (source) {
      const sourceName = matches.source || t('source');
      const warning = matches.fallback ? t('fallback') : t('delayed');
      source.textContent = `${t('source')}: ${sourceName} · ${warning}`;
    }
    const standings = data.standings || {};
    const completeStandings = !standings.fallback && isCompleteStandingsTable(standings.table);
    const status = document.querySelector('#standings-status');
    const host = document.querySelector('#standings-top-five');
    const fullHost = document.querySelector('#full-standings-table');
    const fullButton = document.querySelector('#open-full-table');
    if (status) status.textContent = standings.fallback ? (standings.notice || t('tableFallback')) : (standings.fetchedAt ? `${t('updated')}: ${formatDate(standings.fetchedAt)}` : t('noTable'));
    if (host) {
      host.replaceChildren();
      if (Array.isArray(standings.table) && standings.table.length) host.append(makeStandingsTable(standings.table.slice(0, 5)));
      else host.append(el('p', 'match-empty', t('noTable')));
    }
    if (fullHost) {
      fullHost.replaceChildren();
      if (completeStandings) fullHost.append(makeStandingsTable(standings.table));
    }
    if (fullButton) fullButton.hidden = !completeStandings;
    if (status && standings.fetchedAt && !standings.fallback) {
      status.textContent += standings.stale ? ` · ${t('fallback')}` : '';
      status.textContent += ` · ${t('delayed')}`;
    }
  }

  async function fetchMatchData() {
    const refresh = document.querySelector('.standings-refresh');
    if (refresh) refresh.disabled = true;
    const status = document.querySelector('#standings-status');
    if (status) status.textContent = t('loading');
    try {
      const response = await fetch('/api/matches', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('match service unavailable');
      const data = await response.json();
      window.hsvMatchesData = data;
      renderMatches(data);
    } catch {
      const recent = document.querySelector('#last-match-list');
      const next = document.querySelector('#next-match-list');
      recent?.replaceChildren(el('p', 'match-empty', t('unavailable')));
      next?.replaceChildren(el('p', 'match-empty', t('unavailable')));
      if (status) status.textContent = t('tableFallback');
      const source = document.querySelector('#match-source-status');
      if (source) source.textContent = t('unavailable');
      const updated = document.querySelector('#matches-updated');
      if (updated) updated.textContent = t('noTimestamp');
    } finally {
      if (refresh) refresh.disabled = false;
    }
  }

  function openFullTable() {
    const dialog = document.querySelector('#full-standings-dialog');
    if (!dialog || dialog.open) return;
    dialog.showModal();
    requestAnimationFrame(() => dialog.querySelector('.hsv-standings-row')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  }

  function announce(message) {
    const live = document.querySelector('#a11y-live');
    if (live) live.textContent = message;
  }

  compactNavigation();
  addCompactMenu();
  buildHighlights();
  prepareContactCards();
  addPrivateEntries();
  lazyLoadWorkMap();
  createActionBar();
  ensureCareerBack();
  ensureMatchDisclosures();
  ensureStandingsUi();
  localizeEnhancements();
  langSelect?.addEventListener('change', localizeEnhancements);
  fetchMatchData();
})();
