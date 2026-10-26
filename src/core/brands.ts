export interface Brand {
  // Nombre que se muestra en los mensajes.
  name: string
  // Palabras completas que identifican a la marca dentro de un dominio.
  keywords: string[]
  // Dominios registrados que pertenecen oficialmente a la marca.
  domains: string[]
}

// Los dominios de los bancos de Ecuador se verificaron el 2026-10-25:
// responden y redirigen a su propio sitio. Ante la duda, no agregar un
// dominio: si falta uno oficial, el sitio real del banco se marcaría como riesgo.
export const KNOWN_BRANDS: Brand[] = [
  { name: 'PayPal', keywords: ['paypal'], domains: ['paypal.com'] },
  {
    name: 'Google',
    keywords: ['google'],
    domains: ['google.com', 'google.com.ec'],
  },
  {
    name: 'Facebook',
    keywords: ['facebook'],
    domains: ['facebook.com', 'fb.com'],
  },
  {
    name: 'Instagram',
    keywords: ['instagram'],
    domains: ['instagram.com'],
  },
  {
    name: 'WhatsApp',
    keywords: ['whatsapp'],
    domains: ['whatsapp.com', 'whatsapp.net'],
  },
  {
    name: 'Microsoft',
    keywords: ['microsoft', 'outlook', 'office365'],
    domains: ['microsoft.com', 'live.com', 'office.com', 'outlook.com'],
  },
  {
    name: 'Amazon',
    keywords: ['amazon'],
    domains: ['amazon.com', 'amazonaws.com'],
  },
  { name: 'Netflix', keywords: ['netflix'], domains: ['netflix.com'] },
  {
    name: 'Mercado Libre',
    keywords: ['mercadolibre'],
    domains: ['mercadolibre.com', 'mercadolibre.com.ec'],
  },
  {
    name: 'Banco Pichincha',
    keywords: ['pichincha', 'bancopichincha'],
    domains: ['pichincha.com'],
  },
  {
    name: 'Banco Guayaquil',
    keywords: ['bancoguayaquil'],
    domains: ['bancoguayaquil.com'],
  },
  {
    name: 'Produbanco',
    keywords: ['produbanco'],
    domains: ['produbanco.com.ec'],
  },
  {
    name: 'Banco del Pacífico',
    keywords: ['bancodelpacifico', 'intermatico'],
    domains: ['bancodelpacifico.com', 'intermatico.com'],
  },
]

// Sufijos que solo pueden registrar entidades verificadas (gobierno,
// educación, ejército). Un estafador no puede obtener uno de estos dominios.
export const RESTRICTED_SUFFIXES = [
  'gob.ec',
  'edu.ec',
  'mil.ec',
  'gov',
  'edu',
  'mil',
]
