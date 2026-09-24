# Portafolio de Migdalia Girón

Página creada únicamente con **HTML, CSS y JavaScript nativo**, en archivos separados. No requiere instalaciones, Node.js, npm, frameworks, compilación ni un servidor.

## Cómo abrirla

Haz doble clic en `index.html`. Mantén las carpetas `css`, `js` y `assets` junto a ese archivo. También puedes copiar estos archivos directamente a cualquier alojamiento de páginas estáticas.

## Archivos

- `index.html`: contenido, secciones, iconos SVG integrados y enlaces.
- `css/styles.css`: colores, tipografías, diseño para móviles y animaciones.
- `js/main.js`: pantalla de carga, menú, animaciones, trayectoria desplegable y contacto.
- `assets/`: fotografía, fuentes locales, licencias y CV descargable.

La sección de participación internacional incluye tres fotografías en `assets/images/panel/`, con animaciones de entrada y una galería ampliada. Se puede recorrer con los botones o las flechas del teclado y cerrar con Escape. Las imágenes mantienen su formato original y las animaciones respetan la preferencia de movimiento reducido.

El sitio incluye todos sus recursos y puede abrirse sin conexión. Para utilizar correo, teléfono o WhatsApp se necesita la aplicación o conexión correspondiente.

## Publicar en Netlify desde GitHub

En Netlify, selecciona **Add new project → Import an existing project → GitHub** y el repositorio `edgarchumil/portafolio-mig`.

- Rama: `main`.
- Directorio base: vacío (raíz del repositorio).
- Comando de compilación: vacío.
- Directorio de publicación: `.`.

El archivo `netlify.toml` ya establece la publicación desde la raíz sin compilación. Selecciona **Deploy site** para iniciar la publicación. Después de conectar el repositorio, Netlify actualizará el sitio con los nuevos cambios enviados a `main`.

No se necesitan archivos ZIP ni subir carpetas manualmente.

Guía oficial: https://docs.netlify.com/manage/projects/add-new-project/#import-from-an-existing-repository

## Personalización

Cambia textos y datos de contacto en `index.html`, los colores y estilos en `css/styles.css`, y las interacciones en `js/main.js`. Conserva las rutas relativas de los recursos.

El formulario prepara un mensaje en la aplicación de correo del visitante; el visitante lo revisa y lo envía desde allí. No hay un servidor que envíe o almacene mensajes.

Los iconos SVG proceden de Lucide y están integrados directamente en el HTML: no se carga ninguna librería. Su licencia está en `assets/vendor/lucide-LICENSE.txt`. Las licencias de las fuentes están en `assets/fonts/`.

El botón flotante de WhatsApp abre una conversación con el número `+502 3748 3258` y prepara un mensaje de presentación para que el visitante lo revise y lo envíe. El enlace y el mensaje se pueden editar en `index.html`, en el parámetro `text` de la dirección de WhatsApp. El icono local procede de Bootstrap Icons; su licencia está en `assets/vendor/bootstrap-icons-LICENSE.txt`.
