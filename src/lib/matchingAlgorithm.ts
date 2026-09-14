// ── Domain types ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  full_name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  state: string
  category: 'General' | 'SC' | 'ST' | 'OBC'
  occupation: string
  income_bracket: string
  has_bpl_card: boolean
  family_size?: number
  phone?: string
  language_preference?: 'en' | 'hi'
}

export interface EligibilityCriteria {
  age_min?: number
  age_max?: number
  income_max?: number
  categories?: string[]
  states?: string[]
  occupation?: string
  gender?: string
  special_conditions?: string[]
}

export interface Scheme {
  id: string
  scheme_name: string
  scheme_name_hi?: string
  description?: string
  description_hi?: string
  benefit_amount?: string
  ministry?: string
  scheme_type?: 'central' | 'state'
  eligibility_criteria: EligibilityCriteria
  is_active: boolean
  application_url?: string
}

export interface MatchedScheme extends Scheme {
  match_score: number
  benefit_numeric: number
}

export interface SchemeFilters {
  scheme_type?: string
  ministry?: string
  min_benefit?: number
  max_benefit?: number
  category?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract numeric amount from benefit string.
 * Handles formats like "₹10,000", "₹50,000 per year", "Up to ₹2,00,000".
 */
export function extractAmount(benefitString: string | undefined): number {
  if (!benefitString) return 0

  // Remove commas and extract all number sequences
  const numbers = benefitString.match(/[\d,]+/g)
  if (!numbers) return 0

  const amounts = numbers.map((n) => parseInt(n.replace(/,/g, ''), 10))
  return Math.max(...amounts)
}

/**
 * Parse income bracket string to a numeric upper bound.
 * Handles "Below ₹50,000", "₹50,000 - ₹1,00,000", "Above ₹10,00,000".
 */
export function parseIncomeBracket(incomeBracket: string | undefined): number {
  if (!incomeBracket) return 0

  if (incomeBracket.toLowerCase().includes('above')) {
    return 100_000_000 // 10 crore sentinel — effectively unlimited
  }

  const numbers = incomeBracket.match(/[\d,]+/g)
  if (!numbers) return 0

  const amounts = numbers.map((n) => parseInt(n.replace(/,/g, ''), 10))
  return Math.max(...amounts)
}

// ── Core matching logic ───────────────────────────────────────────────────────

/**
 * Calculate a 0–100 match score for a single scheme against a user profile.
 * Hard-fail criteria (age, income, category, state) return 0 immediately.
 * Optional criteria (occupation, gender, BPL) contribute bonus points.
 */
export function calculateMatchScore(
  userProfile: UserProfile,
  eligibilityCriteria: EligibilityCriteria
): number {
  let totalChecks = 0
  let passedChecks = 0

  // Age (mandatory hard fail)
  totalChecks++
  const ageMin = eligibilityCriteria.age_min ?? 0
  const ageMax = eligibilityCriteria.age_max ?? 200
  if (userProfile.age >= ageMin && userProfile.age <= ageMax) {
    passedChecks++
  } else {
    return 0
  }

  // Income (mandatory hard fail if criterion is present)
  if (eligibilityCriteria.income_max) {
    totalChecks++
    const userIncome = parseIncomeBracket(userProfile.income_bracket)
    if (userIncome <= eligibilityCriteria.income_max) {
      passedChecks++
    } else {
      return 0
    }
  }

  // Category (mandatory hard fail)
  totalChecks++
  if (eligibilityCriteria.categories?.includes(userProfile.category)) {
    passedChecks++
  } else {
    return 0
  }

  // State (mandatory hard fail)
  totalChecks++
  if (
    eligibilityCriteria.states?.includes('All States') ||
    eligibilityCriteria.states?.includes(userProfile.state)
  ) {
    passedChecks++
  } else {
    return 0
  }

  // Occupation (optional — bonus)
  if (eligibilityCriteria.occupation && eligibilityCriteria.occupation !== 'Any') {
    totalChecks++
    if (userProfile.occupation === eligibilityCriteria.occupation) passedChecks++
  }

  // Gender (optional — bonus)
  if (eligibilityCriteria.gender) {
    totalChecks++
    if (userProfile.gender === eligibilityCriteria.gender) passedChecks++
  }

  // BPL card (optional — bonus)
  if (
    eligibilityCriteria.special_conditions?.some(
      (c) =>
        c.toLowerCase().includes('bpl') || c.toLowerCase().includes('below poverty')
    )
  ) {
    totalChecks++
    if (userProfile.has_bpl_card) passedChecks++
  }

  return Math.round((passedChecks / totalChecks) * 100)
}

/**
 * Main matching function — returns all active schemes the user is eligible for,
 * sorted by benefit amount descending then match score descending.
 */
export function matchSchemes(
  userProfile: UserProfile | null,
  allSchemes: Scheme[]
): MatchedScheme[] {
  if (!userProfile || allSchemes.length === 0) return []

  return allSchemes
    .filter((scheme) => {
      if (!scheme.is_active) return false

      const c = scheme.eligibility_criteria

      const ageMin = c.age_min ?? 0
      const ageMax = c.age_max ?? 200
      if (userProfile.age < ageMin || userProfile.age > ageMax) return false

      if (c.income_max) {
        if (parseIncomeBracket(userProfile.income_bracket) > c.income_max) return false
      }

      if (!c.categories?.includes(userProfile.category)) return false

      if (
        !c.states?.includes('All States') &&
        !c.states?.includes(userProfile.state)
      ) {
        return false
      }

      if (c.occupation && c.occupation !== 'Any' && userProfile.occupation !== c.occupation) {
        return false
      }

      if (c.gender && userProfile.gender !== c.gender) return false

      return true
    })
    .map((scheme) => ({
      ...scheme,
      match_score: calculateMatchScore(userProfile, scheme.eligibility_criteria),
      benefit_numeric: extractAmount(scheme.benefit_amount),
    }))
    .sort((a, b) => {
      if (b.benefit_numeric !== a.benefit_numeric) {
        return b.benefit_numeric - a.benefit_numeric
      }
      return b.match_score - a.match_score
    })
}

/**
 * Filter schemes by user-selected filter options.
 */
export function filterSchemes(schemes: MatchedScheme[], filters: SchemeFilters): MatchedScheme[] {
  if (!filters || Object.keys(filters).length === 0) return schemes

  return schemes.filter((scheme) => {
    if (filters.scheme_type && scheme.scheme_type !== filters.scheme_type) return false
    if (filters.ministry && scheme.ministry !== filters.ministry) return false

    if (filters.min_benefit !== undefined || filters.max_benefit !== undefined) {
      const amount = extractAmount(scheme.benefit_amount)
      if (filters.min_benefit !== undefined && amount < filters.min_benefit) return false
      if (filters.max_benefit !== undefined && amount > filters.max_benefit) return false
    }

    if (
      filters.category &&
      !scheme.eligibility_criteria.categories?.includes(filters.category)
    ) {
      return false
    }

    return true
  })
}

/**
 * Search schemes by name or description in the active language.
 */
export function searchSchemes(
  schemes: MatchedScheme[],
  searchQuery: string,
  language: 'en' | 'hi' = 'en'
): MatchedScheme[] {
  if (!searchQuery.trim()) return schemes

  const query = searchQuery.toLowerCase().trim()

  return schemes.filter((scheme) => {
    if (language === 'hi') {
      return (
        scheme.scheme_name_hi?.toLowerCase().includes(query) ||
        scheme.description_hi?.toLowerCase().includes(query)
      )
    }
    return (
      scheme.scheme_name?.toLowerCase().includes(query) ||
      scheme.description?.toLowerCase().includes(query) ||
      scheme.ministry?.toLowerCase().includes(query)
    )
  })
}
