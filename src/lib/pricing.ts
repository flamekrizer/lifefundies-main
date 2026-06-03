import { MENTOR_CATEGORIES, type MentorCategoryId } from '../types'

export { MENTOR_CATEGORIES }
export type { MentorCategoryId }

export const DEFAULT_MENTOR_CATEGORY: MentorCategoryId = 'peer-buddy'

export function getCategory(categoryId?: string) {
  return MENTOR_CATEGORIES.find(category => category.id === categoryId) || MENTOR_CATEGORIES[0]
}

export function getCategoryLabel(categoryId?: string) {
  return getCategory(categoryId).label
}

export function getCategoryPrices(categoryId?: string) {
  return getCategory(categoryId).prices
}

export function getSessionPrice(categoryId?: string, duration?: number) {
  const prices = getCategoryPrices(categoryId)
  const selected = prices.find(price => price.duration === duration) || prices[0]
  return selected.price
}

export function getLowestCategoryPrice(categoryIds?: string[]) {
  const categories = categoryIds?.length ? categoryIds : [DEFAULT_MENTOR_CATEGORY]
  return Math.min(...categories.flatMap(categoryId => getCategoryPrices(categoryId).map(price => price.price)))
}

export function buildCategoryPricing(categoryIds?: string[]) {
  const categories = categoryIds?.length ? categoryIds : [DEFAULT_MENTOR_CATEGORY]
  return categories.map(categoryId => ({
    ...getCategory(categoryId),
    prices: getCategoryPrices(categoryId),
  }))
}

export function normalizeMentorCategories(categoryIds?: unknown): MentorCategoryId[] {
  if (!Array.isArray(categoryIds)) return [DEFAULT_MENTOR_CATEGORY]
  const allowed = new Set(MENTOR_CATEGORIES.map(category => category.id))
  const normalized = categoryIds.filter((id): id is MentorCategoryId => typeof id === 'string' && allowed.has(id as MentorCategoryId))
  return normalized.length ? normalized : [DEFAULT_MENTOR_CATEGORY]
}
