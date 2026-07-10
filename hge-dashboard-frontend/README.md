# HGE Technology - Dashboard comercial

Demo frontend para presentar el futuro sistema comercial de HGE Technology. Representa las ocho líneas de negocio de la empresa, muestra inventario por local, promociones, filtros y cotización directa por WhatsApp.

## Tecnologías

- HTML5 y CSS moderno
- JavaScript
- Módulos nativos del navegador
- Vue 3 mediante CDN
- Lucide Icons mediante CDN
- Archivos JSON locales
- Sin npm, backend ni base de datos

## Estructura

- `index.html`: marcado principal y carga de librerías.
- `styles.css`: diseño visual completo.
- `app.js`: estado, filtros, eventos y métodos de Vue.
- `scripts/catalog.js`: configuración, categorías, locales y carga de productos.
- `data/`: productos en JSON.
- `assets/`: logos e imágenes del catálogo.

## Datos incluidos

- `data/products.json`: productos demostrativos usados únicamente para las líneas que todavía no tienen fotografías reales.
- `data/phones.json`: 34 celulares del catálogo proporcionado por HGE Technology. Sus imágenes fueron tomadas del PDF original.
- `data/real-products.json`: 46 productos reales creados a partir de las fichas compartidas por HGE Technology, con sus imágenes separadas del texto.
- `assets/products/clean/`: recortes PNG transparentes que muestran únicamente cada producto.

El stock y el local de los productos reales aparecen como **Consultar** cuando esa información no consta en el material recibido. El dashboard elimina automáticamente los productos demo de una categoría cuando ya existe material real para reemplazarlos.

## Cómo ejecutar

Los navegadores bloquean la carga de JSON cuando se abre `index.html` directamente. Inicia un servidor local sencillo desde esta carpeta:

```powershell
python -m http.server 8000
```

Luego abre `http://localhost:8000` en el navegador. No se requiere instalación ni npm.

## Personalización

### Cambiar el logo

Reemplaza `assets/logo/hge-logo.jpeg` por la nueva imagen manteniendo el mismo nombre. El recorte visual para cabecera y pie se controla con `.brand-logo-image` en `styles.css`.

### Cambiar los colores

Edita las variables al inicio de `styles.css`, especialmente:

```css
--color-bg: #050705;
--color-primary: #8bff00;
--color-text: #ffffff;
```

### Cambiar el WhatsApp

Modifica una sola variable al inicio de `app.js`:

```javascript
const whatsappNumber = "593939271656";
```

Todos los enlaces de cotización se actualizan automáticamente.

### Agregar productos

Añade un objeto a `data/products.json` o `data/phones.json` con estos campos:

```json
{
  "id": 1000,
  "name": "Nombre del producto",
  "brand": "HGE",
  "category": "Accesorios",
  "description": "Descripción comercial.",
  "stock": 10,
  "local": "Plaza París",
  "image": "assets/products/imagen.png",
  "status": "Nuevo",
  "isFeatured": false,
  "isPromotion": false,
  "createdAt": "2026-06-29"
}
```

Usa únicamente una de las ocho categorías definidas en `app.js` para mantener consistentes los filtros y gráficos.

## Futura conexión a backend

En una fase posterior se pueden sustituir los JSON por una API para conectar inventario, promociones, locales, imágenes y métricas en tiempo real. Los precios deben mantenerse en un sistema privado y enviarse únicamente a clientes autorizados. El login, usuarios, roles, CRUD y panel administrativo no forman parte de esta demo.
