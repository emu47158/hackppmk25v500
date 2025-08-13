import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'
import { supabase, Post } from '../lib/supabase'

interface PostListProps {
  refreshTrigger: number
}

export function PostList({ refreshTrigger }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [refreshTrigger])

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Fetching posts...')
      
      // Simple approach: fetch posts and profiles separately
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Error fetching posts:', postsError)
        throw postsError
      }

      console.log('Posts data:', postsData)

      if (!postsData || postsData.length === 0) {
        console.log('No posts found')
        setPosts([])
        setLoading(false)
        return
      }

      // Get unique user IDs
      const userIds = [...new Set(postsData.map(post => post.user_id))]
      console.log('User IDs:', userIds)
      
      // Fetch all profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, username')
        .in('id', userIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        // Don't throw here, continue with posts even if profiles fail
      }

      console.log('Profiles data:', profilesData)

      // Combine posts with profiles
      const postsWithProfiles = postsData.map(post => {
        const profile = profilesData?.find(p => p.id === post.user_id)
        console.log(`Post ${post.id} - User ${post.user_id} - Profile:`, profile)
        return {
          ...post,
          profiles: profile || null
        }
      })

      console.log('Final posts with profiles:', postsWithProfiles)
      setPosts(postsWithProfiles)
      
    } catch (error: any) {
      console.error('Error in fetchPosts:', error)
      setError(error.message || 'Failed to fetch posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown User') return 'UU'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600">Loading posts...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading posts: {error}</p>
          <button 
            onClick={fetchPosts}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg text-center">
        <p className="text-gray-600">No posts yet. Be the first to share something!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const profile = post.profiles
        const displayName = profile?.display_name || profile?.full_name || 'Unknown User'
        const username = profile?.username
        const initials = getInitials(displayName)

        return (
          <div key={post.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-start space-x-4">
              {/* Profile Picture */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg flex-shrink-0">
                {initials}
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{displayName}</h3>
                    {username && (
                      <p className="text-sm text-gray-600">@{username}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(post.created_at)}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/20 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Post Text */}
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-sm">0</span>
                  </button>

                  <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm">0</span>
                  </button>

                  <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                      <Share className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
