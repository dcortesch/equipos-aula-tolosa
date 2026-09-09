# Equipos de aula · Tolosa

Versión adaptada para David Cortés Chaparro, curso 2026–2027.

## Funciones añadidas
- Acceso directo a 1.º E, 3.º A y 3.º B; selector general ampliado hasta E.
- Guardado local por grupo y copias JSON para exportar/restaurar todos los datos.
- Historial de distribuciones por fecha y actividad.
- Tamaños equilibrados sin superar el máximo solicitado.
- Separaciones obligatorias entre parejas; si no se encuentra solución, se informa sin aceptar un reparto que las incumpla.
- Reparto heterogéneo/homogéneo orientativo por perfiles, revisable por el docente.
- Vista de alumnado y PDF con colores neutros.
- Validación de copias, nombres duplicados y representación segura de nombres.

## Uso
Abrir index.html con conexión a Internet (se conservan las dependencias CDN del original). Elegir el grupo en «Mis grupos» y pulsar «Abrir grupo». Pegar un nombre por línea y pulsar «Guardar Datos». Clasificar según las necesidades de la actividad, indicar separaciones opcionales y distribuir. Guardar en historial si interesa recuperar esa composición.

Excel: primera columna de la primera hoja, sin encabezado. Para CSV, utilizar una sola columna de nombres; no se implementa un importador CSV multicolumna.

Los datos se guardan en el navegador y origen web actuales. No hay sincronización entre dispositivos ni autenticación. La vista de alumnado oculta información visualmente, no es un control de acceso. Descargar copias periódicamente; una copia JSON contiene nombres y perfiles y debe mantenerse fuera del repositorio. El repositorio incluye solamente código, sin datos reales.

## GitHub
Nombre propuesto: equipos-aula-tolosa. El ZIP coloca index.html y tolosa.js en la raíz, preparados para alojamiento estático. Se puede trabajar con el código en un repositorio privado. Publicar una web es una acción aparte; comprobar la disponibilidad de GitHub Pages según cuenta y visibilidad antes de activarlo.

## Procedencia
Aplicación original: Juan Manuel López Esparrell, «El loco de la mochila».
https://github.com/Juanmale14/creadora-equipos-aula.
https://juanmale14.github.io/creadora-equipos-aula./

Se conserva la atribución original. Modificaciones de esta versión en tolosa.js y en index.html. En la revisión del repositorio original no se encontró un archivo de licencia explícita; no se atribuye una licencia nueva al código de terceros.

## Verificación y límites
Comprobadas 400 combinaciones de tamaño/modo, integridad de alumnado, separaciones y caso incompatible; interacciones DOM de carga, distribución, historial, cambio de grupo y vista alumnado. No se ha realizado prueba visual en navegador ni verificado la descarga PDF o importación Excel con las dependencias remotas.

La búsqueda tiene límite de trabajo: una restricción muy compleja puede no resolverse aunque exista una solución. El criterio de mezcla de perfiles es heurístico. No incluye todavía gestión de ausencias ni roles rotatorios.
