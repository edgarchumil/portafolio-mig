# Portafolio de Migdalia

Sitio profesional en español, con HTML, CSS y JavaScript separados. Las fuentes, los iconos y los recursos visuales se incluyen localmente.

## Abrir el sitio

Abre `index.html` en tu navegador. No requiere instalación ni conexión a un CDN.

Para una vista previa local mediante HTTP, con Node.js 20 o superior:

```sh
npm run dev
```

Abre la dirección que aparece en la terminal (por defecto, `http://127.0.0.1:4173/`). Para cambiar el puerto: `npm run dev -- --port 4174`.

## Archivos principales

- `index.html`: contenido, secciones, metadatos y enlaces de contacto.
- `css/styles.css`: colores, tipografía, diseño adaptable y animaciones.
- `js/main.js`: carga inicial, menú e interacciones.
- `assets/`: fotografías, CV, fuentes e iconos locales.
- `scripts/`: servidor de desarrollo y preparación del sitio para alojamiento.

El CV descargable en `assets/docs/CV-Migdalia-Giron.pdf` es una versión seleccionada de dos páginas, preparada a partir del documento de referencia.

## Personalización

Edita los textos y los enlaces de contacto en `index.html`, la apariencia en `css/styles.css` y el comportamiento en `js/main.js`. Conserva las rutas relativas para poder abrir el sitio directamente desde una carpeta.

Los enlaces de correo y teléfono abren la aplicación correspondiente del visitante. El formulario de contacto prepara un mensaje mediante `mailto:` y lo abre en la aplicación de correo; el visitante lo revisa y lo envía desde allí. El sitio no envía ni almacena mensajes por su cuenta.

## Verificación y alojamiento

```sh
npm run check
```

Comprueba la sintaxis de JavaScript, valida las referencias locales del HTML y regenera `dist/client` con el sitio estático, retirando archivos de compilaciones anteriores. Para cualquier alojamiento estático, publica el contenido de esa carpeta. La compilación también prepara `dist/server/index.js` y los metadatos requeridos por Sites.

Las licencias de Lucide (versión 0.468.0), Manrope y Cormorant Garamond están junto a sus archivos en `assets/vendor` y `assets/fonts`.
