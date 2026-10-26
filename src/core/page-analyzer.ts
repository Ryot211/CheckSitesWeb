import { getDomain } from 'tldts'
import type { Signal } from './url-analyzer'

export interface PageFacts {
  passwordFieldCount: number
  cardFieldCount: number
  formActions: string[]
}

export interface PageAnalysis {
  signals: Signal[]
}

function sendsDataToAnotherDomain(
  formActions: string[],
  pageUrl: string,
): boolean {
  const pageDomain = getDomain(pageUrl)

  return formActions.some((action) => getDomain(action) !== pageDomain)
}

export function analyzePage(facts: PageFacts, pageUrl: string): PageAnalysis {
  const signals: Signal[] = []

  if (facts.passwordFieldCount > 0) {
    signals.push({
      id: 'password-field',
      weight: 10,
      message: 'La página pide una contraseña.',
    })
  }

  if (facts.cardFieldCount > 0) {
    signals.push({
      id: 'card-field',
      weight: 20,
      message: 'La página pide un número de tarjeta.',
    })
  }

  if (sendsDataToAnotherDomain(facts.formActions, pageUrl)) {
    signals.push({
      id: 'external-form',
      weight: 35,
      message:
        'Un formulario envía tus datos a un dominio diferente al del sitio.',
    })
  }

  return { signals }
}
