/**
 * Moteur de dés pour Daggerheart.
 * Gère les dés standard, les Duality Dice (Hope/Fear), et les pools.
 */

/**
 * Lance un dé à N faces.
 * @param {number} sides - Nombre de faces (4, 6, 8, 10, 12, 20, 100)
 * @returns {number} Résultat entre 1 et sides (inclus)
 */
export function rollDie(sides) {
  if (!Number.isInteger(sides) || sides < 2) {
    throw new Error(`Nombre de faces invalide: ${sides}`)
  }
  return Math.floor(Math.random() * sides) + 1
}

/**
 * Lance N dés à X faces.
 * @param {number} count - Nombre de dés
 * @param {number} sides - Nombre de faces
 * @returns {number[]} Tableau des résultats individuels
 */
export function rollDice(count, sides) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Nombre de dés invalide: ${count}`)
  }
  const results = []
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides))
  }
  return results
}

/**
 * Lance les Duality Dice (2d12 : Hope + Fear).
 * Résolution Daggerheart :
 *   - hope > fear → Hope
 *   - fear > hope → Fear
 *   - hope === fear → Critical Success
 *
 * @param {number} modifier - Modificateur à ajouter au total
 * @returns {{ hope: number, fear: number, total: number, modifier: number, result: string }}
 */
export function rollDualityDice(modifier = 0) {
  const hope = rollDie(12)
  const fear = rollDie(12)
  const total = hope + fear + modifier

  let result
  if (hope === fear) {
    result = 'critical'
  } else if (hope > fear) {
    result = 'hope'
  } else {
    result = 'fear'
  }

  return { hope, fear, total, modifier, result }
}

/**
 * Parse une expression de dégâts comme "2d8+4" et la lance.
 * Supporte : NdX, NdX+M, NdX-M
 *
 * @param {string} expression - Expression de dés (ex: "2d8+4", "1d10", "3d6-2")
 * @returns {{ rolls: number[], modifier: number, total: number, expression: string }}
 */
export function rollExpression(expression) {
  const cleaned = expression.replace(/\s/g, '').toLowerCase()
  const match = cleaned.match(/^(\d+)d(\d+)([+-]\d+)?$/)

  if (!match) {
    throw new Error(`Expression de dés invalide: "${expression}"`)
  }

  const count = parseInt(match[1], 10)
  const sides = parseInt(match[2], 10)
  const modifier = match[3] ? parseInt(match[3], 10) : 0

  const rolls = rollDice(count, sides)
  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier

  return { rolls, modifier, total, expression: cleaned }
}

/**
 * Lance avec avantage (2 lancers, garde le meilleur total).
 * @param {string} expression - Expression de dés
 * @returns {{ chosen: object, discarded: object, type: string }}
 */
export function rollWithAdvantage(expression) {
  const roll1 = rollExpression(expression)
  const roll2 = rollExpression(expression)
  const chosen = roll1.total >= roll2.total ? roll1 : roll2
  const discarded = roll1.total >= roll2.total ? roll2 : roll1
  return { chosen, discarded, type: 'advantage' }
}

/**
 * Lance avec désavantage (2 lancers, garde le pire total).
 * @param {string} expression - Expression de dés
 * @returns {{ chosen: object, discarded: object, type: string }}
 */
export function rollWithDisadvantage(expression) {
  const roll1 = rollExpression(expression)
  const roll2 = rollExpression(expression)
  const chosen = roll1.total <= roll2.total ? roll1 : roll2
  const discarded = roll1.total <= roll2.total ? roll2 : roll1
  return { chosen, discarded, type: 'disadvantage' }
}

/**
 * Résultat formaté pour les Duality Dice (label en français).
 */
export const DUALITY_RESULT_LABELS = {
  hope: 'Espoir',
  fear: 'Peur',
  critical: 'Succès Critique'
}
