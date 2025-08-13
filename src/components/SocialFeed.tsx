import React, { useState } from 'react'
import { TopNavigation } from './TopNavigation'
import { PostList } from './PostList'
import { ProfilePage } from './ProfilePage'
import { FloatingPostBubble } from './FloatingPostBubble'
import { Profile } from '../lib/supabase'

interface SocialFeedProps {
  profile: Profile
  onLogout: () => void
}

export function SocialFeed({ profile, onLogout }: SocialFeedProps) {
  const [currentView, setCurrentView] = useState<'feed' | 'profile'>('feed')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleProfileClick = () => {
    setCurrentView('profile')
  }

  const handleBackToFeed = () => {
    setCurrentView('feed')
  }

  if (currentView === 'profile') {
    return <ProfilePage profile={profile} onBack={handleBackToFeed} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        {/* Top Navigation */}
        <TopNavigation 
          profile={profile} 
          onProfileClick={handleProfileClick}
          onLogout={onLogout} 
        />

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Posts List */}
          <PostList refreshTrigger={refreshTrigger} />
        </div>

        {/* Floating Post Creation Bubble */}
        <FloatingPostBubble onPostCreated={handlePostCreated} />
      </div>
    </div>
  )
}
