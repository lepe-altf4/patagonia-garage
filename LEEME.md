# Patagonia Garage — sitio web

Web cinematográfica de una sola página (HTML + CSS + JavaScript puro). Sin build, sin npm.
Escena 3D de fuego y brasas (Three.js), animaciones al scroll (GSAP), tipografía brutal y
estética garage industrial + Patagonia.

---

## WhatsApp (ya configurado)

El número ya está cargado: **+54 9 2995 72-5204** (`lib/manifest.js`).
Si algún día cambia, editá esa única línea:

```js
var WHATSAPP_NUMBER = "5492995725204"; // 54 9 + area + numero, sin + ni espacios
```

Ese número se usa automáticamente en TODOS los botones de WhatsApp del sitio
(nav, hero, reservas, footer). El mensaje pre-cargado dice:
*"Hola! Quiero hacer una reserva en Patagonia Garage"*.

> El resto de los datos (dirección, Instagram, horarios) también salen de
> `lib/manifest.js`. Cambialos ahí y se actualizan en todo el sitio.
>
> **¿Querés cambiar un precio o un plato de la carta?** Eso está en otro archivo:
> `assets/data/menu.json`. Mirá **`LEEME-CARTA.md`** para el paso a paso.

---

## Cómo verlo

- **Preview local:** ya hay un servidor corriendo en `http://localhost:8765/`
  (panel de la derecha). Si no, abrí una terminal en esta carpeta y corré:
  `node tools/serve.mjs 8765`
- Abrir `index.html` con doble clic también funciona, salvo la página de créditos
  (necesita servidor para leer el JSON).

## Cómo publicarlo (Netlify)

1. Entrá a [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually**.
2. Arrastrá **esta carpeta entera** a la zona de subida.
3. Listo. El archivo `_headers` ya configura el caché correcto.

(También sirve para Hostinger por FTP: subí todo a `public_html`. El `.htaccess`
ya está incluido para el caché en Apache.)

---

## Secciones

1. **Hero** — escena 3D de brasas/humo + nombre con tipografía brutal.
2. **El Ahumador** — brisket (12 h), ribs (5 h), vacío (6 h), asado ventana (6 h) con tiempos de cocción.
3. **Tragos** — cocktails presentados como fichas técnicas de auto (Fangio, Fórmula 1, etc.).
4. **Carta** — carta digital integrada con pestañas por categoría y precios. Lee
   `assets/data/menu.json` y se arma sola. Para editar precios: ver `LEEME-CARTA.md`.
5. **Reservas** — botón directo a WhatsApp con mensaje pre-cargado.
6. **Cómo llegar** — dirección + Google Maps embebido + horarios + Instagram.

## Cambiar fotos

Reemplazá los archivos en `assets/img/` manteniendo el mismo nombre
(`brisket.jpg`, `ribs.jpg`, `vacio.jpg`, `asado.jpg`, `garage.jpg`, `patagonia.jpg`).
Si subís fotos propias, podés borrar la página `creditos.html` y el link del pie.

Las imágenes actuales son de **Openverse** con licencias Creative Commons aptas para
uso comercial (BY / BY-SA / CC0). La atribución está en `creditos.html`.

---

## Archivos (qué es qué)

| Sirve al sitio | Solo desarrollo (podés ignorar/borrar) |
|---|---|
| `index.html`, `creditos.html` | `tools/` (servidor y scripts) |
| `styles.css`, `main.js` | `.claude/` (config de preview) |
| `lib/` (gsap, scrolltrigger, three, datos) | `LEEME.md`, `LEEME-CARTA.md` |
| `assets/` (imágenes, favicon, créditos) | |
| `assets/data/menu.json` (precios de la carta) | |
| `.htaccess`, `_headers` (caché) | |

Hecho con foco en que funcione en cualquier navegador y se vea impecable en celular.
