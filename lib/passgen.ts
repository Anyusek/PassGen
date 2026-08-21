export const CHARSETS = {
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lowercase: 'abcdefghijkmnopqrstuvwxyz',
  numbers: '23456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
} as const

export type PasswordOptions = {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

export type HistoryItem = { id: string; value: string; type: 'Пароль' | 'Фраза'; createdAt: string }

const ambiguous = /[O0Il1|]/g

function secureIndex(max: number) {
  if (max <= 0) throw new Error('Недопустимый диапазон')
  const limit = 256 - (256 % max)
  if (max <= 256) {
    const bytes = new Uint8Array(1)
    do crypto.getRandomValues(bytes)
    while (bytes[0] >= limit)
    return bytes[0] % max
  }

  const values = new Uint32Array(1)
  const range = 0x100000000
  const accepted = Math.floor(range / max) * max
  do crypto.getRandomValues(values)
  while (values[0] >= accepted)
  return values[0] % max
}

function pick(source: string) { return source[secureIndex(source.length)] }

export function generatePassword(options: PasswordOptions) {
  const selected = [
    options.uppercase ? CHARSETS.uppercase : '',
    options.lowercase ? CHARSETS.lowercase : '',
    options.numbers ? CHARSETS.numbers : '',
    options.symbols ? CHARSETS.symbols : '',
  ].join('')
  if (!selected) throw new Error('Выберите хотя бы одну категорию символов')
  const categories = [
    options.uppercase ? CHARSETS.uppercase : '',
    options.lowercase ? CHARSETS.lowercase : '',
    options.numbers ? CHARSETS.numbers : '',
    options.symbols ? CHARSETS.symbols : '',
  ].filter(Boolean)
  const filtered = options.excludeAmbiguous ? selected.replace(ambiguous, '') : selected
  const pool = filtered || selected
  const result = categories.map((category) => pick(options.excludeAmbiguous ? category.replace(ambiguous, '') || category : category))
  while (result.length < Math.max(4, Math.min(128, options.length))) result.push(pick(pool))
  for (let i = result.length - 1; i > 0; i--) { const j = secureIndex(i + 1); [result[i], result[j]] = [result[j], result[i]] }
  return result.join('').slice(0, Math.max(4, Math.min(128, options.length)))
}

export const phraseWords = ['River', 'Cobalt', 'Moon', 'Velvet', 'Harbor', 'Lumen', 'Pine', 'Orbit', 'Meadow', 'Quartz', 'Cedar', 'Nova', 'Amber', 'Summit', 'Willow', 'Comet', 'Moss', 'Breeze', 'Pixel', 'Dawn']

export function generatePhrase(words: number, separator: string, addNumbers: boolean, addSymbol: boolean, capitalize: boolean) {
  const result = Array.from({ length: Math.max(2, Math.min(8, words)) }, () => phraseWords[secureIndex(phraseWords.length)])
  const formatted = capitalize ? result : result.map((word) => word.toLowerCase())
  let value = formatted.join(separator)
  if (addNumbers) value += `${separator}${secureIndex(90) + 10}`
  if (addSymbol) value += pick('!@#$%&*?')
  return value
}

export function analyzePassword(value: string) {
  const categories = [/[a-z]/.test(value), /[A-Z]/.test(value), /[0-9]/.test(value), /[^A-Za-z0-9]/.test(value)]
  const pool = categories.reduce((sum, yes, i) => sum + (yes ? [26, 26, 10, 32][i] : 0), 0)
  const entropy = value ? Math.round(value.length * Math.log2(Math.max(pool, 1))) : 0
  const score = entropy >= 90 ? 4 : entropy >= 65 ? 3 : entropy >= 45 ? 2 : entropy >= 28 ? 1 : 0
  const labels = ['Очень слабый', 'Слабый', 'Средний', 'Сильный', 'Очень сильный']
  const tips = []
  if (value.length < 12) tips.push('Используйте не менее 12 символов')
  if (!categories[0] || !categories[1]) tips.push('Добавьте строчные и заглавные буквы')
  if (!categories[2]) tips.push('Добавьте цифры')
  if (!categories[3]) tips.push('Добавьте специальные символы')
  if (!tips.length) tips.push('Отличный баланс длины и разнообразия')
  return { length: value.length, categories, entropy, score, label: labels[score], tips }
}

export function makeHistory(value: string, type: HistoryItem['type']): HistoryItem { return { id: `${Date.now()}-${secureIndex(100000)}`, value, type, createdAt: new Date().toISOString() } }
