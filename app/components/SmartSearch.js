'use client'

import { useState } from 'react'

export default function SmartSearch({ onSearch }) {
  const [query, setQuery] = useState('')

  const parseQuery = (text) => {
    const lowerText = text.toLowerCase()
    
    // Extract state
    const states = [
      "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
      "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
      "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana",
      "maine", "maryland", "massachusetts", "michigan", "minnesota", "mississippi",
      "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey",
      "new mexico", "new york", "north carolina", "north dakota", "ohio",
      "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina",
      "south dakota", "tennessee", "texas", "utah", "vermont", "virginia",
      "washington", "west virginia", "wisconsin", "wyoming"
    ]
    
    let detectedState = null
    for (const state of states) {
      if (lowerText.includes(state)) {
        detectedState = state.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        break
      }
    }

    // Extract fields
    const fieldKeywords = {
      "Computer Science & Technology": ["coding", "programming", "computer science", "tech", "technology", "software", "cs"],
      "Engineering": ["engineering", "robotics", "mechanical", "electrical"],
      "STEM": ["stem", "science", "math", "physics", "chemistry", "biology"],
      "Healthcare & Medicine": ["medical", "medicine", "healthcare", "health", "doctor", "nursing"],
      "Business & Entrepreneurship": ["business", "entrepreneurship", "startup", "marketing"],
      "Visual Arts": ["art", "painting", "drawing", "visual", "design"],
      "Performing Arts": ["music", "theater", "theatre", "dance", "performance"],
      "Writing & Literature": ["writing", "literature", "poetry", "creative writing"],
      "Leadership & Civic Engagement": ["leadership", "civic", "government", "policy", "advocacy"],
      "Law & Legal Studies": ["law", "legal", "justice"],
      "Mathematics": ["math", "mathematics", "calculus", "algebra"],
      "Life Sciences": ["biology", "life science", "biotechnology"],
      "Environmental Science": ["environmental", "climate", "sustainability"],
      "Social Sciences": ["social science", "psychology", "sociology"],
      "Community Service": ["volunteer", "community service", "service"]
    }

    let detectedFields = []
    for (const [field, keywords] of Object.entries(fieldKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          detectedFields.push(field)
          break
        }
      }
    }

    // Extract category/type
    const categoryKeywords = {
      "Summer Program": ["summer"],
      "Research": ["research"],
      "Internship": ["internship", "intern"],
      "Competition": ["competition", "contest"],
      "Leadership Opportunity": ["leadership"],
      "Volunteer Opportunity": ["volunteer"]
    }

    let detectedCategory = null
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          detectedCategory = category
          break
        }
      }
      if (detectedCategory) break
    }

    // Extract grade
    const gradeMatch = lowerText.match(/grade (\d+)|(\d+)th grade/)
    let detectedGrade = null
    if (gradeMatch) {
      detectedGrade = parseInt(gradeMatch[1] || gradeMatch[2])
    }

    return {
      state: detectedState,
      fields: detectedFields,
      category: detectedCategory,
      grade: detectedGrade,
      searchTerm: text
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const parsed = parseQuery(query)
    onSearch(parsed)
  }

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: 'engineering programs in Massachusetts' or 'summer STEM opportunities'"
          className="w-full px-6 py-4 pr-32 text-lg border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>
      
      {query && (
        <div className="mt-3 text-sm text-gray-600 flex flex-wrap gap-2">
          <span>Searching for:</span>
          {parseQuery(query).state && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
               {parseQuery(query).state}
            </span>
          )}
          {parseQuery(query).fields.map(field => (
            <span key={field} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
               {field}
            </span>
          ))}
          {parseQuery(query).category && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
               {parseQuery(query).category}
            </span>
          )}
          {parseQuery(query).grade && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
              Grade {parseQuery(query).grade}
            </span>
          )}
        </div>
      )}
    </form>
  )
}