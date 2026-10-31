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

function livePreview(project) {
  if (!project.embed) return '';
  const url = new URL(project.embed);
  if (url.protocol !== 'https:') return '';
  return `<section class="live-preview"><h4>${esc(format(strings.project.liveDemo, project))}</h4><p>${esc(strings.project.frameHelp)}</p>${project.requiresCamera ? `<p class="camera-note">${esc(strings.project.cameraNote)}</p>` : ''}<iframe ${project.requiresCamera ? 'allow="camera"' : ''} data-src="${esc(url.href)}" title="${esc(format(strings.project.frameTitle, project))}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></section>`;
}

function screenshotGallery(project) {
  const id = `gallery-${project.id}`;
  return `<div class="gallery-wrapper"><div class="gallery-controls"><span>${esc(strings.project.galleryHint)}</span><div><button type="button" data-gallery-step="-1" aria-controls="${esc(id)}" disabled>${esc(strings.project.previous)}</button><span class="gallery-position" aria-live="polite">1 / ${project.screenshots.length}</span><button type="button" data-gallery-step="1" aria-controls="${esc(id)}">${esc(strings.project.next)}</button></div></div><div id="${esc(id)}" class="screenshot-gallery" tabindex="0" role="region" aria-label="${esc(format(strings.project.galleryLabel, project))}">${project.screenshots.map(shot => `<figure><img src="${esc(shot.src)}" alt="${esc(shot.caption)}" loading="lazy" width="2698" height="1316"><figcaption>${esc(shot.caption)}</figcaption></figure>`).join('')}</div></div>`;
}

function wireGalleries() {
  document.querySelectorAll('.gallery-wrapper').forEach(wrapper => {
    const gallery = wrapper.querySelector('.screenshot-gallery');
    const slides = [...gallery.querySelectorAll('figure')];
    const previous = wrapper.querySelector('[data-gallery-step="-1"]');
    const next = wrapper.querySelector('[data-gallery-step="1"]');
    const position = wrapper.querySelector('.gallery-position');
    const index = () => Math.round(gallery.scrollLeft / (slides[0].getBoundingClientRect().width + 16));
    const update = () => {
      const current = Math.max(0, Math.min(slides.length - 1, index()));
      position.textContent = `${current + 1} / ${slides.length}`;
      previous.disabled = current === 0;
      next.disabled = current === slides.length - 1;
    };
    for (const button of [previous, next]) button.addEventListener('click', () => {
      const target = Math.max(0, Math.min(slides.length - 1, index() + Number(button.dataset.galleryStep)));
      gallery.scrollTo({ left: target * (slides[0].getBoundingClientRect().width + 16), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
    gallery.addEventListener('scroll', update, { passive: true });
    update();
  });
}

function projectText(text, project) {
  const safe = esc(text);
  if (!project.collaborator) return safe;
  const { name, url } = project.collaborator;
  if (new URL(url).protocol !== 'https:') return safe;
  return safe.replace(esc(name), `<a href="${esc(url)}">${esc(name)}</a>`);
}

function featured(project, index) {
  return `<article class="project"><div class="project-copy"><span class="project-index">${String(index + 1).padStart(2, '0')} /</span><h3>${esc(project.name)}</h3><p class="tagline">${esc(project.tagline)}</p><p class="description">${esc(project.description)}</p>${project.details ? project.details.map(paragraph => `<p class="description">${projectText(paragraph, project)}</p>`).join('') : ''}${project.notes ? `<ul class="project-notes">${project.notes.map(note => `<li>${esc(note)}</li>`).join('')}</ul>` : ''}<div class="project-meta"><span>${esc(project.role)}</span><span>${esc(strings.project.roleSeparator)}</span><span>${(project.stack || []).map(esc).join(', ')}</span></div>${links(project)}</div><div class="preview-column"><div class="preview${project.previewImage ? ' preview-linked-image' : project.screenshots?.length ? ' preview-screenshots' : project.embed ? ' preview-live' : ''}">${project.previewImage ? `<a class="poc-preview" href="${esc(project.live)}" target="_blank" rel="noopener"><img src="${esc(project.previewImage.src)}" alt="${esc(project.previewImage.alt)}" width="2826" height="1296" loading="lazy"><span>${esc(strings.project.openPoc)}</span></a>` : project.screenshots?.length ? screenshotGallery(project) : project.embed ? `<iframe class="featured-frame" src="${esc(project.embed)}" title="${esc(format(strings.project.frameTitle, project))}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<div class="project-live-card"><p class="eyebrow">${esc(project.previewLabel)}</p><h4>${esc(project.name)}</h4><p>${esc(project.previewDescription)}</p><a href="${esc(project.live)}">${esc(strings.project.open)}</a></div>`}</div><div class="demo-caption"><span>${esc(project.screenshots?.length ? strings.project.screenshots : project.embed ? strings.project.realDemo : project.previewLabel)}</span>${project.id === 'cfp-manager' ? '' : '<span aria-hidden="true">↖ ↗</span>'}</div></div></article>`;
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
    for (const [id, text] of Object.entries({ barName: me.name, role: me.role, bio: me.intro, footSmall: me.name })) {
      document.getElementById(id).textContent = text;
    }
    document.getElementById('intro').replaceChildren(...(me.about || [me.intro]).map(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
    for (const id of ['barMail', 'mailto']) document.getElementById(id).href = `mailto:${me.email}`;
    document.getElementById('barGh').href = me.github;
    document.getElementById('barLi').href = me.linkedin;
    const featuredIds = ['lega11y', 'cfp-manager', 'math-kingdom'];
    document.getElementById('plates').innerHTML = featuredIds.map(id => data.projects.find(project => project.id === id)).filter(Boolean).map(featured).join('');
    document.getElementById('otherProjects').innerHTML = data.furtherExplorations.map(id => data.projects.find(project => project.id === id)).filter(Boolean).map((project, index) => `<details class="other-row" name="further-explorations"><summary class="other-row"><span class="number-label">${String(index + 4).padStart(2, '0')}</span><h3>${esc(project.name)}</h3><p>${esc(project.tagline)}</p><span class="expand" aria-label="${esc(strings.project.expand)}">+</span></summary><div class="other-detail"><p>${esc(project.description)}</p>${(project.details || []).map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}<p>${[project.role, (project.stack || []).join(', ')].filter(Boolean).map(esc).join(' · ')}</p>${links(project)}${livePreview(project)}</div></details>`).join('');
    document.querySelectorAll('details.other-row').forEach(details => {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        document.querySelectorAll('details.other-row').forEach(other => {
          if (other !== details) other.open = false;
        });
        const frame = details.querySelector('iframe[data-src]');
        if (frame) {
          frame.src = frame.dataset.src;
          frame.removeAttribute('data-src');
        }
      });
    });
    wireGalleries();
  })
  .catch(error => {
    console.error(strings.errors.console, error);
    document.getElementById('intro').textContent = location.protocol === 'file:' ? strings.errors.localFile : strings.errors.load;
  });
