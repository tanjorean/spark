'use client'

import { useEffect } from 'react'
import UsaMap from '@mirawision/usa-map-react'

// Move this OUTSIDE the component so it doesn't recreate
const stateNames = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
}

export default function USMap({ onStateClick, selectedState, programCounts }) {
  useEffect(() => {
    // Wait a bit for the SVG to render
    const timer = setTimeout(() => {
      // Find all state paths by their class
      const states = document.querySelectorAll('.usa-state')
      
      console.log("Found states:", states.length)
      
      const handlers = new Map()
      
      states.forEach(statePath => {
        const stateId = statePath.getAttribute('data-name')
        console.log("Adding listener to:", stateId)
        
        const clickHandler = () => {
          console.log("State clicked:", stateId)
          const fullName = stateNames[stateId]
          console.log("Full name:", fullName)
          if (fullName) {
            onStateClick(fullName)
          }
        }
        
        handlers.set(statePath, clickHandler)
        statePath.addEventListener('click', clickHandler)
        statePath.style.cursor = 'pointer'
        
        // Update colors based on selection/program count
        const fullName = stateNames[stateId]
        const count = programCounts[fullName] || 0
        const isSelected = selectedState === fullName
        
        if (isSelected) {
          statePath.setAttribute('fill', '#3B82F6')
        } else if (count > 0) {
          statePath.setAttribute('fill', '#DBEAFE')
        } else {
          statePath.setAttribute('fill', '#E5E7EB')
        }
      })
      
      return () => {
        handlers.forEach((handler, statePath) => {
          statePath.removeEventListener('click', handler)
        })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [selectedState, programCounts])

  return (
    <div className="w-full max-w-6xl mx-auto bg-white p-6 rounded-lg">
      <div id="usa-map-container">
        <UsaMap />
      </div>
      
      {selectedState && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-gray-900">
            {selectedState} - {programCounts[selectedState] || 0} programs available
          </p>
        </div>
      )}
      
      <div className="mt-6 flex justify-center gap-6 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 border rounded"></div>
          <span>No programs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 border rounded"></div>
          <span>Has programs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded shadow-md"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}