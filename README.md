# Detector de sitios falsos

Extensión de navegador (Chrome / Edge) que analiza la pestaña actual y calcula un **puntaje de riesgo** para ayudar a detectar sitios de phishing, clones de marcas y dominios fraudulentos.

> 🚧 Proyecto en desarrollo activo. Se construye por etapas, priorizando entender cada concepto antes de agregar el siguiente.

## ¿Cómo funciona?

Un sitio falso rara vez se delata con una sola señal. El detector **suma señales sospechosas** de la dirección y del contenido de la página, cada una con un peso, y devuelve un puntaje de 0 a 100 junto con los motivos.

```
Pestaña activa
  ├─► URL ─────────► Analizador de URL ───────┐
  └─► Recolector ──► Analizador de página ────┤
                                              └─► Puntaje + motivos ─► Popup
```

- **Recolector** (`src/content/`): se inyecta en la página solo cuando el usuario hace clic en el ícono y cuenta campos de contraseña, campos de tarjeta y destinos de formularios. No toma decisiones.
- **Analizadores** (`src/core/`): funciones puras que deciden qué es sospechoso. No dependen de React ni de las APIs del navegador, por lo que se prueban de forma aislada con tests unitarios.

## Señales de la URL

| Señal                                     | Peso | Ejemplo                                          |
| ----------------------------------------- | ---- | ------------------------------------------------ |
| Sin HTTPS                                 | 10   | `http://ejemplo.com`                             |
| Hosting gratuito                          | 15   | `mi-tienda.vercel.app`, `usuario.github.io`      |
| Extensión de dominio de riesgo (TLD)      | 15   | `ofertas.xyz`, `promo.top`                       |
| Exceso de guiones en el dominio           | 15   | `tienda-de-ofertas-online.com`                   |
| Palabras gancho en el dominio             | 20   | `secure-login-banco.com`, `verificar-cuenta.com` |
| Punycode (caracteres de otro alfabeto)    | 25   | `аpple.com` (con "а" cirílica)                   |
| Dirección IP en lugar de dominio          | 30   | `http://192.168.1.10/login`                      |
| Destino oculto con `@`                    | 35   | `https://www.paypal.com@cuenta-segura.xyz`       |
| Typosquatting (dominio mal escrito)       | 40   | `paypa1.com`, `gooogle.com`, `faceb00k.com`      |
| Suplantación de marca en un dominio ajeno | 50   | `www.paypal.com.cuenta-segura.xyz`               |

## Señales del contenido de la página

| Señal                               | Peso | Qué detecta                                                           |
| ----------------------------------- | ---- | --------------------------------------------------------------------- |
| Campo de contraseña                 | 10   | Un `<input type="password">`                                          |
| Campo de tarjeta                    | 20   | Inputs con `autocomplete="cc-number"` o "card"/"tarjeta" en el nombre |
| Formulario que envía a otro dominio | 35   | Un `<form>` cuyo `action` apunta a un dominio distinto al del sitio   |

El campo de contraseña pesa poco por sí solo, porque todo login legítimo lo tiene. Su valor está en sumarse a una URL sospechosa.

### Detalles técnicos

- **Dominio registrado:** se obtiene con [`tldts`](https://github.com/remusao/tldts), que usa la Public Suffix List. Así, `checkout.paypal.com` se reconoce como legítimo y `paypal.com.cuenta-segura.xyz` no.
- **Hosting gratuito:** se aprovecha que `tldts`, por defecto, trata dominios como `vercel.app` o `github.io` como el dominio registrado.
- **Typosquatting:** se normalizan los homoglifos (`0 → o`, `1 → l`, `rn → m`, etc.) y luego se mide la [distancia de Levenshtein](https://es.wikipedia.org/wiki/Distancia_de_Levenshtein) contra una lista de marcas conocidas.
- **Destino oculto con `@`:** el parser de URL interpreta todo lo que está antes del `@` como usuario, así que basta con revisar si la URL trae uno.
- **Palabras gancho:** se buscan solo en el dominio, no en la ruta, porque casi todos los sitios legítimos tienen rutas como `/login`.
- **Punycode:** el parser de URL convierte los caracteres no latinos al formato `xn--`, que es lo que se detecta. Al contar guiones, ese prefijo se descarta.
- **Formularios a otro dominio:** se compara el dominio registrado del `action` con el de la página, así un banco que envía su login a `auth.banco.com` desde `www.banco.com` no se marca.
- **Inyección bajo demanda:** el recolector se ejecuta con `chrome.scripting.executeScript` en lugar de un content script permanente. La extensión solo pide los permisos `activeTab` y `scripting`, y no lee ninguna página hasta que el usuario hace clic.

## Stack

- TypeScript + React
- Vite
- Manifest V3
- Vitest
- ESLint + Prettier

## Instalación

```bash
npm install
npm run build
```

Luego, en el navegador:

1. Abrir `chrome://extensions` (o `edge://extensions`).
2. Activar el **Modo desarrollador**.
3. Hacer clic en **Cargar descomprimida** y seleccionar la carpeta `dist`.

## Scripts

```bash
npm test         # Ejecuta los tests en modo observación
npm run lint     # Revisa el código con ESLint
npm run format   # Formatea el código con Prettier
```

## Estructura

```
public/
  manifest.json          # Configuración de la extensión
src/
  content/               # Código que se ejecuta dentro de la página analizada
    collect-page-facts.ts
  core/                  # Lógica de detección (pura, sin dependencias del navegador)
    url-analyzer.ts      # Señales de la URL
    page-analyzer.ts     # Señales del contenido de la página
    score.ts             # Cálculo del puntaje final
    levenshtein.ts
    *.test.ts
  App.tsx                # Popup
```

## Hoja de ruta

- [x] Popup que muestra la URL de la pestaña activa
- [x] Analizador de URL con puntaje y motivos
- [x] Señales de hosting gratuito y TLDs de riesgo
- [x] Señales de palabras gancho, punycode, `@` en la URL y exceso de guiones
- [x] Análisis del contenido de la página (contraseñas, tarjetas, formularios a otro dominio)
- [ ] Service worker con indicador de riesgo en el ícono
- [ ] Backend para consultas de WHOIS, certificados SSL y listas negras
- [ ] Modelo de machine learning

## Limitaciones conocidas

- La lista de marcas y dominios oficiales es reducida.
- El umbral de typosquatting es fijo, lo que puede generar falsos positivos con marcas de nombre corto.
- Algunas URLs pueden activar varias señales relacionadas a la vez, lo que infla el puntaje.
- Las palabras gancho no consideran los dominios oficiales: `accounts.google.com` se marca por contener "account".
- El punycode también se activa con dominios legítimos con ñ o tildes, como `españa.com`.
- La detección de campos de tarjeta se basa en nombres de atributos, por lo que un sitio puede evitarla usando nombres genéricos.
- El navegador no permite inyectar el recolector en algunas páginas, como la Chrome Web Store. En esos casos solo se analiza la URL.

## Autor

Desarrollado por **Bryan Gallardo**.
