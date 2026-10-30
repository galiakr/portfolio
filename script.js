const esc = value => String(value ?? "").replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const format = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
document.documentElement.lang = strings.language;
document.querySelectorAll('[data-copy]').forEach(element => {
  element.textContent = element.dataset.copy.split('.').reduce((value, key) => value[key], strings);
});

function links(project) {
  return `<div class="project-links">${project.live ? `<a href="${esc(project.live)}">${esc(strings.project.open)}</a>` : ''}${project.repo ? `<a href="${esc(project.repo)}">${esc(strings.project.source)}</a>` : ''}</div>`;
}

function demo(id) {
  const s = strings.demos;
  if (id === 'lega11y') return `<div class="demo"><div class="demo-top"><b class="demo-brand">${esc(s.audit.brand)}</b><span aria-hidden="true">↗</span></div><h4>${esc(s.audit.label)}</h4><p>${esc(s.audit.intro)}</p><div class="audit-checks">${s.audit.checks.map(label => `<div class="audit-row"><span>${esc(label)}</span><span class="audit-status">${esc(s.audit.pending)}</span></div>`).join('')}</div><div class="demo-actions"><button class="primary" id="auditButton" aria-pressed="false">${esc(s.audit.button)}</button></div><p id="auditMessage" role="status">${esc(s.audit.ready)}</p></div>`;
  if (id === 'cfp-manager') return `<div class="demo"><div class="demo-top"><b class="demo-brand">${esc(s.cfp.brand)}</b><span class="demo-dot" aria-hidden="true"></span></div><h4>${esc(s.cfp.heading)}</h4><p>${esc(s.cfp.intro)}</p><div class="demo-actions" role="group" aria-label="${esc(s.cfp.note)}">${s.cfp.filters.map((label, i) => `<button data-filter="${i}" aria-pressed="${i === 0}">${esc(label)}</button>`).join('')}</div><div id="events" aria-live="polite"></div></div>`;
  return `<div class="demo"><div class="demo-top"><b class="demo-brand">${esc(s.math.brand)}</b><span aria-hidden="true">✳</span></div><h4>${esc(s.math.heading)}</h4><p>${esc(s.math.intro)}</p><div class="number-grid">${Array.from({length: 30}, (_, i) => `<span class="number">${i + 1}</span>`).join('')}</div><div class="demo-bottom"><button id="primeButton" aria-pressed="false">${esc(s.math.show)}</button><span id="primeMessage" role="status">${esc(s.math.initial)}</span></div></div>`;
}

function featured(project, index) {
  return `<article class="project"><div class="project-copy"><span class="project-index">${String(index + 1).padStart(2, '0')} /</span><h3>${esc(project.name)}</h3><p class="tagline">${esc(project.tagline)}</p><p class="description">${esc(project.description)}</p><div class="project-meta"><span>${esc(project.role)}</span><span>${esc(strings.project.roleSeparator)}</span><span>${(project.stack || []).map(esc).join(', ')}</span></div>${links(project)}</div><div class="preview-column"><div class="preview">${demo(project.id)}</div><div class="demo-caption"><span>${esc(strings.project.demo)}</span><span aria-hidden="true">↖ ↗</span></div></div></article>`;
}

function wireDemos() {
  const auditButton = document.getElementById('auditButton');
  auditButton.addEventListener('click', () => {
    const active = auditButton.getAttribute('aria-pressed') !== 'true';
    auditButton.setAttribute('aria-pressed', active);
    auditButton.textContent = active ? strings.demos.audit.reset : strings.demos.audit.button;
    document.querySelectorAll('.audit-status').forEach((status, index) => {
      status.textContent = active ? (index === 2 ? strings.demos.audit.issue : strings.demos.audit.passed) : strings.demos.audit.pending;
    });
    document.getElementById('auditMessage').textContent = active ? strings.demos.audit.result : strings.demos.audit.ready;
  });
  const renderEvents = index => {
    document.getElementById('events').innerHTML = strings.demos.cfp.events
      .filter(event => index === 0 || event.status === strings.demos.cfp.filters[index])
      .map(event => `<div class="event"><div><strong>${esc(event.name)}</strong><br><small>${esc(event.topic)}</small></div><span class="badge">${esc(event.status)}</span></div>`).join('');
  };
  renderEvents(0);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', b === button));
    renderEvents(Number(button.dataset.filter));
  }));
  const primeButton = document.getElementById('primeButton');
  primeButton.addEventListener('click', () => {
    const active = primeButton.getAttribute('aria-pressed') !== 'true';
    primeButton.setAttribute('aria-pressed', active);
    primeButton.textContent = active ? strings.demos.math.hide : strings.demos.math.show;
    document.querySelectorAll('.number').forEach((element, i) => {
      const n = i + 1;
      const prime = n > 1 && !Array.from({length: Math.max(0, Math.floor(Math.sqrt(n)) - 1)}, (_, j) => j + 2).some(divisor => n % divisor === 0);
      element.classList.toggle('prime', active && prime);
    });
    document.getElementById('primeMessage').textContent = active ? strings.demos.math.result : strings.demos.math.initial;
  });
}

fetch('./projects.json', { cache: 'no-cache' })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    const me = data.person;
    document.title = format(strings.title, me);
    document.querySelector('meta[name="description"]').content = format(strings.description, me);
    for (const [id, text] of Object.entries({ barName: me.name, role: me.role, location: me.location, intro: me.intro, footSmall: me.name })) {
      document.getElementById(id).textContent = text;
    }
    for (const id of ['barMail', 'mailto']) document.getElementById(id).href = `mailto:${me.email}`;
    document.getElementById('barGh').href = me.github;
    document.getElementById('barLi').href = me.linkedin;
    const featuredIds = ['lega11y', 'cfp-manager', 'math-kingdom'];
    document.getElementById('plates').innerHTML = featuredIds.map(id => data.projects.find(project => project.id === id)).filter(Boolean).map(featured).join('');
    document.getElementById('otherProjects').innerHTML = data.projects.filter(project => !featuredIds.includes(project.id)).map((project, index) => `<details class="other-row"><summary class="other-row"><span class="number-label">${String(index + 4).padStart(2, '0')}</span><h3>${esc(project.name)}</h3><p>${esc(project.tagline)}</p><span class="expand" aria-label="${esc(strings.project.expand)}">+</span></summary><div class="other-detail"><p>${esc(project.description)}</p><p>${esc(project.role)} · ${(project.stack || []).map(esc).join(', ')}</p>${links(project)}</div></details>`).join('');
    wireDemos();
  })
  .catch(error => {
    console.error(strings.errors.console, error);
    document.getElementById('intro').textContent = location.protocol === 'file:' ? strings.errors.localFile : strings.errors.load;
  });
