import type { PageFacts } from '../core/page-analyzer'

// Se ejecuta dentro de la página analizada mediante chrome.scripting.executeScript.
// Chrome serializa esta función, así que debe ser autocontenida: no puede usar
// imports en tiempo de ejecución ni variables definidas fuera de su cuerpo.
export function collectPageFacts(): PageFacts {
  const passwordFieldCount = document.querySelectorAll(
    'input[type="password"]',
  ).length

  const cardFieldCount = document.querySelectorAll(
    [
      'input[autocomplete="cc-number"]',
      'input[name*="card" i]',
      'input[id*="card" i]',
      'input[name*="tarjeta" i]',
      'input[id*="tarjeta" i]',
    ].join(', '),
  ).length

  const formActions = Array.from(document.forms)
    .map(
      (form) =>
        new URL(form.getAttribute('action') ?? '', document.baseURI).href,
    )
    .filter((action) => action.startsWith('http'))

  return { passwordFieldCount, cardFieldCount, formActions }
}
