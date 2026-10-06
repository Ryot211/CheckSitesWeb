# Detector de sitios falsos

Extensión de navegador (Chrome / Edge) que analiza la pestaña actual y calcula un **puntaje de riesgo** para ayudar a detectar sitios de phishing, clones de marcas y dominios fraudulentos.

> 🚧 Proyecto en desarrollo activo. Se construye por etapas, priorizando entender cada concepto antes de agregar el siguiente.

## ¿Cómo funciona?

Un sitio falso rara vez se delata con una sola señal. El detector **suma señales sospechosas**, cada una con un peso, y devuelve un puntaje de 0 a 100 junto con los motivos.

```
Pestaña activa → URL → Analizador (funciones puras) → Puntaje + motivos → Popup
```

La lógica de detección vive en `src/core/` y no depende de React ni de las APIs del navegador, por lo que se prueba de forma aislada con tests unitarios.

## Señales detectadas

| Señal | Peso | Ejemplo |
|---|---|---|
| Sin HTTPS | 10 | `http://ejemplo.com` |
| Dirección IP en lugar de dominio | 30 | `http://192.168.1.10/login` |
| Typosquatting (dominio mal escrito) | 40 | `paypa1.com`, `gooogle.com`, `faceb00k.com` |
| Suplantación de marca en un dominio ajeno | 50 | `www.paypal.com.cuenta-segura.xyz` |

### Detalles técnicos

- **Dominio registrado:** se obtiene con [`tldts`](https://github.com/remusao/tldts), que usa la Public Suffix List. Así, `checkout.paypal.com` se reconoce como legítimo y `paypal.com.cuenta-segura.xyz` no.
- **Typosquatting:** se normalizan los homoglifos (`0 → o`, `1 → l`, `rn → m`, etc.) y luego se mide la [distancia de Levenshtein](https://es.wikipedia.org/wiki/Distancia_de_Levenshtein) contra una lista de marcas conocidas.

## Stack

- TypeScript + React
- Vite
- Manifest V3
- Vitest

## Instalación

```bash
npm install
npm run build
```

Luego, en el navegador:

1. Abrir `chrome://extensions` (o `edge://extensions`).
2. Activar el **Modo desarrollador**.
3. Hacer clic en **Cargar descomprimida** y seleccionar la carpeta `dist`.

## Tests

```bash
npm test
```

## Estructura

```
public/
  manifest.json          # Configuración de la extensión
src/
  core/                  # Lógica de detección (pura, sin dependencias del navegador)
    url-analyzer.ts
    url-analyzer.test.ts
    levenshtein.ts
  App.tsx                # Popup
```

## Hoja de ruta

- [x] Popup que muestra la URL de la pestaña activa
- [x] Analizador de URL con puntaje y motivos
- [ ] Más señales de URL: hosting gratuito, TLDs de riesgo, palabras gancho, punycode
- [ ] Content script que analiza el contenido de la página (formularios de login, tarjetas)
- [ ] Service worker con indicador de riesgo en el ícono
- [ ] Backend para consultas de WHOIS, certificados SSL y listas negras
- [ ] Modelo de machine learning

## Limitaciones conocidas

- La lista de marcas y dominios oficiales es reducida.
- El umbral de typosquatting es fijo, lo que puede generar falsos positivos con marcas de nombre corto.
- Algunas URLs pueden activar varias señales relacionadas a la vez, lo que infla el puntaje.

## Autor

Desarrollado por **Bryan Gallardo**.
