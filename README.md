# Botella · sitio web

La página para mandar por WhatsApp: cuenta qué es Botella, deja escuchar botellas de ejemplo y registra a los primeros 100 de Lima.
Sitio estático sin build: `index.html`, `site.css`, `site.js`, `config.js`. Diseño "Carta náutica": mapa del mar de Lima, bitácora que avanza con el scroll y pase de registro, sin librerías. Voces de ejemplo en `v/` (las mismas de la app).

## Registro
Quien se registra deja nombre, WhatsApp y distrito. La función `join_waitlist` lo guarda en la tabla `waitlist` del Supabase de la app:
- Si quedan lugares (100 por defecto), recibe al toque el link `https://botella-app.vercel.app/?c=BOTELLA-01`.
- Si no, queda en lista de espera y ve su número en la fila.
- Cada persona recibe su propio link para invitar (`?de=xxxx`) y la tabla guarda quién invitó a quién (`ref`).

## Puesta en marcha
1. Supabase > SQL Editor: pegar `supabase/waitlist.sql` y Run.
2. Vercel: Add New > Project > importar `botella-web`, Framework: Other, sin build.
3. Si el dominio cambia, cambiar la URL actual (botella-web-snowy.vercel.app) en las etiquetas `og:` y `canonical` de `index.html` (WhatsApp necesita la URL completa de la imagen).

## Desde el panel de Supabase
- Ver registros: `select created_at, name, phone, district, ref, granted from waitlist order by created_at desc;`
- Abrir más lugares: `update waitlist_config set cap = 150;`
- Dar acceso a alguien de la lista de espera: `update waitlist set granted = true where phone = '+51...';`
