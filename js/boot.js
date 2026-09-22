/* Activa la carga antes del primer dibujo y garantiza su cierre. */
document.documentElement.classList.add('js');
window.portfolioLoadStarted = performance.now();
window.setTimeout(() => {
  document.documentElement.classList.add('is-loaded');
}, 3000);
