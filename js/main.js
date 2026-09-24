/* Portafolio de Migdalia: JavaScript nativo, sin librerías ni compilación. */
(() => {
  'use strict';

  // La pantalla de carga se activa antes del primer dibujo y siempre se cierra.
  document.documentElement.classList.add('js');
  const loadStarted = performance.now();
  window.setTimeout(() => document.documentElement.classList.add('is-loaded'), 3000);

  const initializePortfolio = () => {

    const root = document.documentElement;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = () => motionPreference.matches;
    const emailAddress = 'isagiron20.m@gmail.com';
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    root.classList.add('js');

    // The indicator expresses activity; it does not pretend to measure network progress.
    const loader = $('.site-loader');
    const loaderProgress = $('.loader-progress');
    const loaderLabel = $('.loader-percent');
    const startedAt = loadStarted;
    let loaderFinished = false;
    let loaderTimer;
    let loaderAnimation;

    if (loaderLabel) loaderLabel.textContent = 'Cargando…';
    if (loaderProgress && !reducedMotion() && loaderProgress.animate) {
      loaderAnimation = loaderProgress.animate(
        [{ transform: 'scaleX(0.18)', opacity: 0.45 }, { transform: 'scaleX(1)', opacity: 1 }],
        { duration: 1050, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }
      );
    }

    const finishLoading = () => {
      if (loaderFinished) return;
      loaderFinished = true;
      window.clearTimeout(loaderTimer);
      loaderAnimation?.cancel();
      if (loaderProgress) loaderProgress.style.transform = 'scaleX(1)';
      if (loaderLabel) loaderLabel.textContent = 'Listo';
      root.classList.add('is-loaded');
      document.body?.classList.add('is-loaded');
      if (loader) {
        loader.setAttribute('aria-hidden', 'true');
        window.setTimeout(() => { loader.hidden = true; }, reducedMotion() ? 0 : 550);
      }
    };

    const pageLoaded = () => {
      const delay = reducedMotion() ? 0 : Math.max(0, 800 - (performance.now() - startedAt));
      loaderTimer = window.setTimeout(finishLoading, delay);
    };
    if (document.readyState === 'complete') pageLoaded();
    else window.addEventListener('load', pageLoaded, { once: true });
    window.setTimeout(finishLoading, 3000);

    $$('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear(); });

    const menuToggle = $('#menu-toggle');
    const navigation = $('#site-nav');
    const setMenu = (open, restoreFocus = false) => {
      if (!menuToggle || !navigation) return;
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      navigation.classList.toggle('is-open', open);
      menuToggle.classList.toggle('is-active', open);
      if (restoreFocus) menuToggle.focus({ preventScroll: true });
    };

    if (menuToggle && navigation) {
      menuToggle.addEventListener('click', () => {
        setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
      });
      navigation.addEventListener('click', (event) => {
        if (event.target.closest('a')) setMenu(false);
      });
      document.addEventListener('click', (event) => {
        if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
          setMenu(false, true);
        }
      });
    }

    const header = $('#site-header');
    const scrollProgress = $('#scroll-progress');
    const backToTop = $('#back-to-top');
    const navLinks = $$('nav a[data-section]');
    const sectionLinks = navLinks.map((link) => {
      const id = link.dataset.section || link.hash.slice(1);
      return { link, section: document.getElementById(id.replace(/^#/, '')) };
    }).filter((item) => item.section);

    const setActiveSection = (id) => {
      sectionLinks.forEach(({ link, section }) => {
        const active = section.id === id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };

    let scrollScheduled = false;
    const updateScroll = () => {
      scrollScheduled = false;
      const position = window.scrollY || root.scrollTop;
      const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
      if (header) header.classList.toggle('is-scrolled', position > 24);
      if (scrollProgress) scrollProgress.style.transform = `scaleX(${maxScroll ? Math.min(1, position / maxScroll) : 0})`;
      if (backToTop) {
        const visible = position > 600;
        backToTop.classList.toggle('is-visible', visible);
        backToTop.setAttribute('aria-hidden', String(!visible));
        backToTop.tabIndex = visible ? 0 : -1;
      }
      if (sectionLinks.length) {
        if (position < 50) setActiveSection(null);
        else if (maxScroll > 0 && position >= maxScroll - 4) {
          setActiveSection(sectionLinks[sectionLinks.length - 1].section.id);
        }
      }
    };
    const scheduleScroll = () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        window.requestAnimationFrame(updateScroll);
      }
    };
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', () => {
      scheduleScroll();
      if (menuToggle && getComputedStyle(menuToggle).display === 'none') setMenu(false);
    }, { passive: true });
    updateScroll();

    if ('IntersectionObserver' in window && sectionLinks.length) {
      const activeSections = new Map();
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) activeSections.set(entry.target.id, entry.target);
          else activeSections.delete(entry.target.id);
        });
        const candidates = [...activeSections.values()].sort((a, b) => {
          const marker = window.innerHeight * 0.2;
          return Math.abs(a.getBoundingClientRect().top - marker) - Math.abs(b.getBoundingClientRect().top - marker);
        });
        if (candidates[0]) setActiveSection(candidates[0].id);
      }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
      sectionLinks.forEach(({ section }) => sectionObserver.observe(section));
    }

    const revealElements = $$('[data-reveal]');
    let revealObserver;
    const reveal = (element) => {
      const delay = reducedMotion() ? 0 : Math.min(600, Math.max(0, Number(element.dataset.delay) || 0));
      element.style.transitionDelay = `${delay}ms`;
      element.classList.add('is-revealed');
      revealObserver?.unobserve(element);
    };
    if (reducedMotion() || !('IntersectionObserver' in window)) revealElements.forEach(reveal);
    else {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) reveal(entry.target); });
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      revealElements.forEach((element) => revealObserver.observe(element));
      root.classList.add('reveal-ready');
    }

    const counterElements = $$('[data-count]');
    const completedCounters = new WeakSet();
    const animateCount = (element) => {
      if (completedCounters.has(element)) return;
      completedCounters.add(element);
      const finalValue = Number(element.dataset.count);
      if (!Number.isFinite(finalValue)) return;
      if (reducedMotion()) {
        element.textContent = String(finalValue);
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const progress = reducedMotion() ? 1 : Math.min(1, (now - start) / 1000);
        element.textContent = String(Math.round(finalValue * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window && !reducedMotion()) {
      const countObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counterElements.forEach((element) => countObserver.observe(element));
    } else counterElements.forEach(animateCount);

    const experienceToggle = $('#experience-toggle');
    const moreExperience = $('#more-experience');
    if (experienceToggle && moreExperience) {
      experienceToggle.addEventListener('click', () => {
        const expanded = experienceToggle.getAttribute('aria-expanded') !== 'true';
        experienceToggle.setAttribute('aria-expanded', String(expanded));
        moreExperience.hidden = !expanded;
        const label = $('[data-toggle-label]', experienceToggle);
        if (label) label.textContent = expanded ? 'Ver menos' : 'Ver trayectoria completa';
        const icon = $('[data-lucide], .lucide', experienceToggle);
        if (icon) icon.style.transform = expanded ? 'rotate(45deg)' : '';
        if (expanded) $$('[data-reveal]', moreExperience).forEach(reveal);
        scheduleScroll();
      });
    }

    const contactStatus = $('#contact-status');
    const announce = (message) => {
      if (!contactStatus) return;
      contactStatus.setAttribute('role', 'status');
      contactStatus.setAttribute('aria-live', 'polite');
      contactStatus.textContent = message;
    };

    const fallbackCopy = (text) => {
      const focused = document.activeElement;
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.setAttribute('aria-label', 'Correo electrónico para copiar');
      field.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none;';
      document.body.append(field);
      field.select();
      field.setSelectionRange(0, text.length);
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      field.remove();
      if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
      return copied;
    };

    const copyEmail = $('#copy-email');
    if (copyEmail) copyEmail.addEventListener('click', async () => {
      const address = copyEmail.dataset.email || emailAddress;
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(address);
          copied = true;
        }
      } catch { /* An unavailable clipboard can still have a browser fallback. */ }
      if (!copied) copied = fallbackCopy(address);
      announce(copied ? 'Correo copiado al portapapeles.' : `No se pudo copiar automáticamente. Puedes copiar este correo: ${address}`);
    });

    const contactForm = $('#contact-form');
    if (contactForm) contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const fields = new FormData(contactForm);
      const value = (name) => String(fields.get(name) || '').trim();
      const subject = value('subject') || 'Consulta profesional desde el portafolio';
      const body = `Nombre: ${value('name')}\nCorreo: ${value('email')}\n\n${value('message')}`;
      const url = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const formStatus = $('#form-status', contactForm);
      const feedback = 'Se abrirá tu aplicación de correo con el mensaje preparado. Revisa el contenido y envíalo desde allí. Si no se abre, escribe a ' + emailAddress + '.';
      if (formStatus) formStatus.textContent = feedback;
      else announce(feedback);
      window.location.href = url;
    });

    const contactDialog = $('#contact-dialog');
    let dialogTrigger;
    if (contactDialog) {
      const closeDialog = () => {
        if (typeof contactDialog.close === 'function') contactDialog.close();
        else {
          contactDialog.removeAttribute('open');
          dialogTrigger?.focus({ preventScroll: true });
        }
      };
      $$('[data-open-contact]').forEach((button) => button.addEventListener('click', (event) => {
        event.preventDefault();
        dialogTrigger = button;
        setMenu(false);
        if (typeof contactDialog.showModal === 'function') {
          if (!contactDialog.open) contactDialog.showModal();
        } else {
          contactDialog.setAttribute('open', '');
          $('input, textarea, button', contactDialog)?.focus();
        }
      }));
      $$('[data-close-contact]', contactDialog).forEach((button) => button.addEventListener('click', closeDialog));
      contactDialog.addEventListener('click', (event) => {
        if (event.target !== contactDialog) return;
        const bounds = contactDialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
          closeDialog();
        }
      });
      contactDialog.addEventListener('close', () => {
        if (dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
      });
      contactDialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && typeof contactDialog.close !== 'function') closeDialog();
      });
    }

    // La galería conserva los enlaces a las fotos cuando no hay diálogo nativo.
    const galleryDialog = $('#panel-gallery-dialog');
    const galleryImage = galleryDialog && $('#gallery-image', galleryDialog);
    const galleryCaption = galleryDialog && $('#gallery-caption', galleryDialog);
    const galleryCounter = galleryDialog && $('#gallery-counter', galleryDialog);
    const galleryItems = $$('a[data-gallery-item][href]').filter((item) => (
      item.getAttribute('href') && $('img', item)
    ));

    if (galleryDialog && galleryImage && galleryCaption && galleryCounter && galleryItems.length
      && typeof galleryDialog.showModal === 'function' && !galleryDialog.dataset.galleryInitialized) {
      galleryDialog.dataset.galleryInitialized = 'true';
      let galleryIndex = 0;
      let galleryTrigger;

      const showGalleryImage = (index) => {
        galleryIndex = (index + galleryItems.length) % galleryItems.length;
        const item = galleryItems[galleryIndex];
        const thumbnail = $('img', item);
        galleryImage.alt = thumbnail.alt;
        galleryImage.src = item.getAttribute('href');
        galleryCaption.textContent = item.dataset.caption || thumbnail.alt;
        galleryCounter.textContent = `Fotografía ${galleryIndex + 1} de ${galleryItems.length}`;
      };

      galleryItems.forEach((item, index) => {
        item.addEventListener('click', (event) => {
          if (event.defaultPrevented || event.button !== 0
            || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          galleryTrigger = item;
          showGalleryImage(index);
          if (!galleryDialog.open) galleryDialog.showModal();
          event.preventDefault();
          root.classList.add('gallery-open');
          setMenu(false);
        });
      });

      const closeGallery = () => {
        if (galleryDialog.open) galleryDialog.close();
      };
      $$('[data-gallery-close]', galleryDialog).forEach((button) => {
        button.addEventListener('click', closeGallery);
      });
      $$('[data-gallery-prev]', galleryDialog).forEach((button) => {
        button.addEventListener('click', () => {
          if (galleryDialog.open) showGalleryImage(galleryIndex - 1);
        });
      });
      $$('[data-gallery-next]', galleryDialog).forEach((button) => {
        button.addEventListener('click', () => {
          if (galleryDialog.open) showGalleryImage(galleryIndex + 1);
        });
      });
      galleryDialog.addEventListener('keydown', (event) => {
        if (!galleryDialog.open || event.defaultPrevented
          || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          showGalleryImage(galleryIndex + (event.key === 'ArrowLeft' ? -1 : 1));
        }
      });
      galleryDialog.addEventListener('click', (event) => {
        if (event.target !== galleryDialog) return;
        const bounds = galleryDialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right
          || event.clientY < bounds.top || event.clientY > bounds.bottom) closeGallery();
      });
      galleryDialog.addEventListener('close', () => {
        if (galleryDialog.open) return;
        root.classList.remove('gallery-open');
        if (galleryTrigger?.isConnected) galleryTrigger.focus({ preventScroll: true });
      });
    }

    const portrait = $('.portrait-composition');
    const resetPortrait = () => {
      if (!portrait) return;
      portrait.style.setProperty('--pointer-x', '0px');
      portrait.style.setProperty('--pointer-y', '0px');
    };
    if (portrait) {
      let pointerFrame;
      portrait.addEventListener('pointermove', (event) => {
        if (reducedMotion() || !finePointer.matches) return;
        if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
        pointerFrame = window.requestAnimationFrame(() => {
          const bounds = portrait.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
          portrait.style.setProperty('--pointer-x', `${x.toFixed(2)}px`);
          portrait.style.setProperty('--pointer-y', `${y.toFixed(2)}px`);
        });
      }, { passive: true });
      portrait.addEventListener('pointerleave', () => {
        if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
        resetPortrait();
      });
    }

    motionPreference.addEventListener?.('change', () => {
      if (!reducedMotion()) return;
      loaderAnimation?.cancel();
      if (document.readyState === 'complete') finishLoading();
      revealElements.forEach(reveal);
      counterElements.forEach(animateCount);
      resetPortrait();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio, { once: true });
  } else {
    initializePortfolio();
  }
})();
