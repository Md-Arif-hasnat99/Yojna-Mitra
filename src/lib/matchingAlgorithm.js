/**
 * Extract numeric amount from benefit string
 * Handles formats like "₹10,000", "₹50,000 per year", "Up to ₹2,00,000"
 */
export function extractAmount(benefitString) {
  if (!benefitString) return 0
  
  // Remove commas and extract all numbers
  const numbers = benefitString.match(/[\d,]+/g)
  if (!numbers) return 0
  
  // Convert to integers and find the maximum
  const amounts = numbers.map(n => parseInt(n.replace(/,/g, '')))
  return Math.max(...amounts)
}

/**
 * Parse income bracket string to numeric value
 * Handles formats like "₹50,000 - ₹1,00,000", "Below ₹50,000", "Above ₹10,00,000"
 */
export function parseIncomeBracket(incomeBracket) {
  if (!incomeBracket) return 0
  
  // Extract the upper limit for "Below X" or range "X - Y"
  const numbers = incomeBracket.match(/[\d,]+/g)
  if (!numbers) return 0
  
  // If it's a range, take the upper limit (last number)
  // If it's "Below X", take that number
  // If it's "Above X", take a very high number
  if (incomeBracket.toLowerCase().includes('above')) {
    return 100000000 // 10 crore (very high number)
  }
  
  const amounts = numbers.map(n => parseInt(n.replace(/,/g, '')))
  return Math.max(...amounts)
}

/**
 * Calculate match score based on how well user profile matches scheme criteria
 * Returns a score from 0-100
 */
export function calculateMatchScore(userProfile, eligibilityCriteria) {
  let score = 100
  let totalChecks = 0
  let passedChecks = 0
  
  // Age match (mandatory)
  totalChecks++
  const ageMin = eligibilityCriteria.age_min || 0
  const ageMax = eligibilityCriteria.age_max || 200
  if (userProfile.age >= ageMin && userProfile.age <= ageMax) {
    passedChecks++
  } else {
    return 0 // Hard fail on age
  }
  
  // Income match (if specified)
  if (eligibilityCriteria.income_max) {
    totalChecks++
    const userIncome = parseIncomeBracket(userProfile.income_bracket)
    if (userIncome <= eligibilityCriteria.income_max) {
      passedChecks++
    } else {
      return 0 // Hard fail on income
    }
  }
  
  // Category match (mandatory)
  totalChecks++
  if (eligibilityCriteria.categories?.includes(userProfile.category)) {
    passedChecks++
  } else {
    return 0 // Hard fail on category
  }
  
  // State match (mandatory)
  totalChecks++
  if (
    eligibilityCriteria.states?.includes('All States') ||
    eligibilityCriteria.states?.includes(userProfile.state)
  ) {
    passedChecks++
  } else {
    return 0 // Hard fail on state
  }
  
  // Occupation match (optional - bonus points)
  if (eligibilityCriteria.occupation && eligibilityCriteria.occupation !== 'Any') {
    totalChecks++
    if (userProfile.occupation === eligibilityCriteria.occupation) {
      passedChecks++
    }
  }
  
  // Gender match (optional - bonus points)
  if (eligibilityCriteria.gender) {
    totalChecks++
    if (userProfile.gender === eligibilityCriteria.gender) {
      passedChecks++
    }
  }
  
  // BPL card match (optional - bonus points)
  if (eligibilityCriteria.special_conditions?.some(c => 
    c.toLowerCase().includes('bpl') || c.toLowerCase().includes('below poverty')
  )) {
    totalChecks++
    if (userProfile.has_bpl_card) {
      passedChecks++
    }
  }
  
  // Calculate final score
  score = Math.round((passedChecks / totalChecks) * 100)
  return score
}

/**
 * Main matching function - returns schemes that user is eligible for
 * Sorted by benefit amount (highest first)
 */
export function matchSchemes(userProfile, allSchemes) {
  if (!userProfile || !allSchemes || allSchemes.length === 0) {
    return []
  }
  
  const eligibleSchemes = allSchemes
    .filter(scheme => {
      // Only active schemes
      if (!scheme.is_active) return false
      
      const criteria = scheme.eligibility_criteria
      
      // Age check
      const ageMin = criteria.age_min || 0
      const ageMax = criteria.age_max || 200
      if (userProfile.age < ageMin || userProfile.age > ageMax) {
        return false
      }
      
      // Income check (if specified)
      if (criteria.income_max) {
        const userIncome = parseIncomeBracket(userProfile.income_bracket)
        if (userIncome > criteria.income_max) {
          return false
        }
      }
      
      // Category check
      if (!criteria.categories?.includes(userProfile.category)) {
        return false
      }
      
      // State check
      if (
        !criteria.states?.includes('All States') &&
        !criteria.states?.includes(userProfile.state)
      ) {
        return false
      }
      
      // Occupation check (if specified and not "Any")
      if (
        criteria.occupation &&
        criteria.occupation !== 'Any' &&
        userProfile.occupation !== criteria.occupation
      ) {
        return false
      }
      
      // Gender check (if specified)
      if (criteria.gender && userProfile.gender !== criteria.gender) {
        return false
      }
      
      return true
    })
    .map(scheme => ({
      ...scheme,
      match_score: calculateMatchScore(userProfile, scheme.eligibility_criteria),
      benefit_numeric: extractAmount(scheme.benefit_amount)
    }))
    .sort((a, b) => {
      // First sort by benefit amount (highest first)
      if (b.benefit_numeric !== a.benefit_numeric) {
        return b.benefit_numeric - a.benefit_numeric
      }
      // Then by match score
      return b.match_score - a.match_score
    })
  
  return eligibleSchemes
}

/**
 * Filter schemes based on user-selected filters
 */
export function filterSchemes(schemes, filters) {
  if (!filters || Object.keys(filters).length === 0) {
    return schemes
  }
  
  return schemes.filter(scheme => {
    // Scheme type filter
    if (filters.scheme_type && scheme.scheme_type !== filters.scheme_type) {
      return false
    }
    
    // Ministry filter
    if (filters.ministry && scheme.ministry !== filters.ministry) {
      return false
    }
    
    // Benefit range filter
    if (filters.min_benefit || filters.max_benefit) {
      const amount = extractAmount(scheme.benefit_amount)
      if (filters.min_benefit && amount < filters.min_benefit) {
        return false
      }
      if (filters.max_benefit && amount > filters.max_benefit) {
        return false
      }
    }
    
    // Category filter
    if (filters.category && !scheme.eligibility_criteria.categories?.includes(filters.category)) {
      return false
    }
    
    return true
  })
}

/**
 * Search schemes by name or description
 */
export function searchSchemes(schemes, searchQuery, language = 'en') {
  if (!searchQuery || searchQuery.trim() === '') {
    return schemes
  }
  
  const query = searchQuery.toLowerCase().trim()
  
  return schemes.filter(scheme => {
    if (language === 'hi') {
      return (
        scheme.scheme_name_hi?.toLowerCase().includes(query) ||
        scheme.description_hi?.toLowerCase().includes(query)
      )
    } else {
      return (
        scheme.scheme_name?.toLowerCase().includes(query) ||
        scheme.description?.toLowerCase().includes(query) ||
        scheme.ministry?.toLowerCase().includes(query)
      )
    }
  })
}
