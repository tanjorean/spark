'use client'

import { useState } from 'react'
import Link from 'next/link'
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Navbar from "@/app/components/Navbar"

export default function SubmitProgramPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    state: '',
    fields: [],
    otherField: '', 
    gradeLevel: [],
    deadline: '',
    cost: '',
    duration: '',
    website: '',
    contactEmail: '',
    organizationName: ''
  })
  
  const [submitted, setSubmitted] = useState(false)

  const allFields = [
    "Computer Science & Technology",
    "Healthcare & Medicine",
    "Engineering",
    "Business & Entrepreneurship",
    "Law & Legal Studies",
    "Environmental Science",
    "Visual Arts",
    "Performing Arts",
    "Writing & Literature",
    "Social Sciences",
    "Public Health",
    "Education",
    "Communications & Media",
    "Mathematics",
    "Life Sciences",
    "Community Service",
    "Leadership & Civic Engagement"
  ]

  const states = [
    "All States", "Alabama", "Alaska", "Arizona", "Arkansas", "California", 
    "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", 
    "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", 
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", 
    "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ]

  const handleFieldToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field]
    }))
  }

  const handleGradeToggle = (grade) => {
    setFormData(prev => ({
      ...prev,
      gradeLevel: prev.gradeLevel.includes(grade)
        ? prev.gradeLevel.filter(g => g !== grade)
        : [...prev.gradeLevel, grade]
    }))
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    // Save to Firestore
    await addDoc(collection(db, "program_submissions"), {
      ...formData,
      submittedAt: new Date(),
      status: "pending" // You can use this to track review status
    })
    
    setSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        title: '',
        description: '',
        state: '',
        fields: [],
        otherField: '',
        gradeLevel: [],
        deadline: '',
        cost: '',
        duration: '',
        website: '',
        contactEmail: '',
        organizationName: ''
      })
      setSubmitted(false)
    }, 3000)
  } catch (error) {
    console.error("Error submitting program:", error)
    alert("Error submitting program. Please try again.")
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-8 text-center">
        <h1 className="text-5xl font-bold mb-4">Submit a Program</h1>
        <p className="text-xl text-blue-50 max-w-3xl mx-auto">
          Help high school students discover amazing opportunities by submitting your program to Spark
        </p>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        {submitted ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">Thank You!</h2>
            <p className="text-xl text-green-700">
              Your program has been submitted successfully. We'll review it and add it to Spark soon!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Organization Info */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., MIT, Stanford University, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Program Details */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Program Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Program Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Summer Research Program"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description * (Max 500 characters)
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe your program, what students will learn, and key benefits..."
                  />
                  <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Program Website *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourprogram.com"
                  />
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Eligibility</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State/Location *
                  </label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Grade Levels * (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[9, 10, 11, 12].map(grade => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => handleGradeToggle(grade)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          formData.gradeLevel.includes(grade)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Fields of Interest * (Select all that apply)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {allFields.map(field => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => handleFieldToggle(field)}
                        className={`px-4 py-3 rounded-xl font-medium text-left transition-all ${
                          formData.fields.includes(field)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {field}
                      </button>
                    ))}
                        <button
      type="button"
      onClick={() => handleFieldToggle('Other')}
      className={`px-4 py-3 rounded-xl font-medium text-left transition-all ${
        formData.fields.includes('Other')
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      Other
    </button>
  </div>
  
  {/* Show text input when "Other" is selected */}
  {formData.fields.includes('Other') && (
    <div className="mt-4">
      <input
        type="text"
        value={formData.otherField}
        onChange={(e) => setFormData({...formData, otherField: e.target.value})}
        placeholder="Please specify the field"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required={formData.fields.includes('Other')}
      />
    </div>
  )}
</div>
                  </div>
                </div>
          

            {/* Program Info */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Program Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Free, $500, $1000-$2000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2 weeks, 6 weeks, Full summer"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Submit Program for Review →
            </button>

            <p className="text-sm text-gray-600 text-center">
              By submitting, you agree that the information provided is accurate and you have permission to list this program.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}