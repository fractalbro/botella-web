# Movimiento en Botella: 20 reglas

Reglas de Cesar para todo lo que se mueve en la web y en la app. Cada pantalla usa 4 o 5, no las 20.

| # | Regla | Cómo se aplica aquí |
|---|---|---|
| 1 | Squash and stretch | Botones y la perilla del deslizador se aplastan 100 ms al tocar (scaleX 1.04, scaleY 0.92). Nunca el texto. |
| 2 | Anticipación | El corcho baja un poco antes de saltar. Solo en lanzamientos y momentos grandes. |
| 3 | Stagger | Titulares palabra por palabra, 45 ms entre cada una. Bloques: 50 ms. Cascada total < 300 ms después de 6 elementos. |
| 4 | Follow through | Tentáculos y cintas siguen moviéndose y se asientan; resortes con poco rebote. |
| 5 | Slow in, slow out | Entrar: `cubic-bezier(.16,1,.3,1)`. Salir: `cubic-bezier(.7,0,.84,0)`. Mover: `cubic-bezier(.65,0,.35,1)`. Lineal solo en spinners. |
| 6 | Arcos | Las cintas de voz y los viajes de la botella van en curva, nunca en diagonal recta. |
| 7 | Acción secundaria | Al soltar el deslizador, la isla elegida sube un poco. Siempre más callada que la principal. |
| 8 | Tiempos ágiles | Hover y toque 100–150 ms; transiciones 150–300 ms; paneles hasta 400 ms. Más de 500 ms solo en la portada. |
| 9 | Feedback exagerado | Solo en momentos que importan: resultado del juego, botella lanzada. |
| 10 | Profundidad | Escenas 3D reales, inclinación de tarjetas hasta 10° con perspectiva 1000 px. |
| 11 | Origen | Lo que se abre crece desde lo que tocaste. |
| 12 | Fitts | Áreas táctiles de 44 px mínimo; botones principales de 52 px. |
| 13 | Rubber banding | El deslizador se estira en los bordes y vuelve con resorte. |
| 14 | Hick | Una acción principal por vista (turquesa). |
| 15 | Von Restorff | Lo único turquesa es lo que hay que hacer. |
| 16 | Doherty | Responder en menos de 400 ms. |
| 17 | Interrumpible | Todo se puede cambiar a mitad de camino (el scroll manda). |
| 18 | Cerrar rápido | Cerrar en menos tiempo del que tarda en abrir. |
| 19 | Peak-end | Terminar en alto: el resultado y el lanzamiento son los picos. |
| 20 | Frecuencia | Lo que se usa seguido se anima menos. |

Con "reducir movimiento" activado no hay animaciones: la escena queda quieta y el texto aparece sin transición.
