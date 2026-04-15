document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const tocList = document.getElementById('tocList');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.docs-section');

  // ── Sidebar toggle (mobile) ──
  function openSidebar() {
    sidebar.classList.add('is-open');
    sidebarOverlay.classList.add('is-open');
    sidebarToggle?.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    sidebar.classList.remove('is-open');
    sidebarOverlay.classList.remove('is-open');
    sidebarToggle?.setAttribute('aria-expanded', 'false');
  }

  sidebarToggle?.addEventListener('click', () => {
    sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
  });
  sidebarOverlay?.addEventListener('click', closeSidebar);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  // ── Build right-side TOC ──
  if (tocList) {
    sections.forEach(section => {
      const h2 = section.querySelector('h2');
      if (section.id && h2) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${section.id}`;
        a.textContent = h2.textContent.trim();
        li.appendChild(a);
        tocList.appendChild(li);
      }
    });
  }

  // ── Active section tracking ──
  const tocLinks = tocList ? tocList.querySelectorAll('a') : [];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;

        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
        tocLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-80px 0px -65% 0px' });

  sections.forEach(s => observer.observe(s));

  // ── Code tabs ──
  document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const block = tab.closest('.code-block');
      block.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
      block.querySelectorAll('.code-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });

  // ── Copy buttons ──
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.code-block');
      const activePane = block.querySelector('.code-pane.active code') || block.querySelector('pre code');
      if (!activePane) return;

      navigator.clipboard.writeText(activePane.textContent).then(() => {
        const label = btn.querySelector('span');
        if (label) {
          const orig = label.textContent;
          label.textContent = 'Copied!';
          btn.style.color = 'var(--green)';
          setTimeout(() => { label.textContent = orig; btn.style.color = ''; }, 1500);
        }
      });
    });
  });

  // ── Lightbox ──
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  document.querySelectorAll('.showcase-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 200);
  }

  lightbox?.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) closeLightbox();
  });
  document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox?.classList.contains('is-open')) closeLightbox();
  });

  // ── Demo fallback ──
  const demoIframe = document.querySelector('.demo-iframe');
  const demoFallback = document.getElementById('demoFallback');

  function showDemoFallback() {
    if (demoIframe) demoIframe.style.display = 'none';
    if (demoFallback) demoFallback.style.display = 'flex';
  }

  if (demoIframe) {
    demoIframe.addEventListener('error', showDemoFallback);
    demoIframe.addEventListener('load', () => {
      try {
        const doc = demoIframe.contentDocument || demoIframe.contentWindow?.document;
        if (!doc?.body || doc.body.innerHTML.trim().length === 0) showDemoFallback();
      } catch {
        // cross-origin = loaded fine
      }
    });
  }
});
