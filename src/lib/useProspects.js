'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { MOCK_PROSPECTS } from './constants'

export function useProspects() {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    fetchProspects()
  }, [])

  async function fetchProspects() {
    if (!supabase) {
      setProspects(MOCK_PROSPECTS)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('score', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        // Map Supabase data to match our component format
        const mapped = data.map(p => ({
          id: p.id,
          name: p.name,
          owner: p.owner_name || '',
          phone: p.phone || '',
          phoneType: p.phone_type || 'unverified',
          trade: p.trade || '',
          city: p.city || '',
          state: p.state || '',
          rating: parseFloat(p.rating) || 0,
          reviews: p.review_count || 0,
          stage: p.stage || 'new',
          demoUrl: p.demo_url || '',
          demoSlug: p.demo_slug || '',
          pageViews: 0,
          timeOnPage: 0,
          lastVisit: null,
          score: p.score || 0,
          notes: p.notes || '',
          brand: p.brand || 'mj',
          fromNumber: p.from_number || '',
          batchId: p.batch_id || null,
          topReviewerName: p.top_reviewer_name || '',
          googlePlaceUrl: p.google_place_url || '',
          messages: [],
        }))

        // Fetch messages for each prospect
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .order('sent_at', { ascending: true })

        if (msgs) {
          for (const prospect of mapped) {
            prospect.messages = msgs
              .filter(m => m.prospect_id === prospect.id)
              .map(m => ({
                type: m.direction === 'outbound' ? 'out' : 'in',
                text: m.body,
                time: m.sent_at,
                step: m.sequence_step || null,
                brand: m.brand || null,
                fromNumber: m.from_number || null,
              }))
          }
        }

        // Fetch page visits
        const { data: visits } = await supabase
          .from('page_visits')
          .select('*')

        if (visits) {
          for (const prospect of mapped) {
            const pVisits = visits.filter(v => v.prospect_id === prospect.id)
            prospect.pageViews = pVisits.reduce((sum, v) => sum + (v.page_views || 0), 0)
            prospect.timeOnPage = pVisits.reduce((sum, v) => sum + (v.time_on_page || 0), 0)
            if (pVisits.length > 0) {
              prospect.lastVisit = pVisits.sort((a, b) =>
                new Date(b.visit_date) - new Date(a.visit_date)
              )[0].visit_date
            }
          }
        }

        setProspects(mapped)
        setIsLive(true)
      } else {
        // No data in Supabase yet, use mock data
        setProspects(MOCK_PROSPECTS)
      }
    } catch (err) {
      console.error('Supabase error, falling back to mock:', err)
      setProspects(MOCK_PROSPECTS)
    }

    setLoading(false)
  }

  async function updateStage(prospectId, newStage) {
    if (supabase && isLive) {
      await supabase
        .from('prospects')
        .update({ stage: newStage })
        .eq('id', prospectId)
    }
    setProspects(prev =>
      prev.map(p => p.id === prospectId ? { ...p, stage: newStage } : p)
    )
  }

  async function addNote(prospectId, note) {
    if (supabase && isLive) {
      await supabase
        .from('prospects')
        .update({ notes: note })
        .eq('id', prospectId)
    }
    setProspects(prev =>
      prev.map(p => p.id === prospectId ? { ...p, notes: note } : p)
    )
  }

  return { prospects, loading, isLive, updateStage, addNote, refetch: fetchProspects }
}

export function useDailyStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('stat_date', today)
        .single()

      if (data) setStats(data)
    } catch (err) {
      // No stats for today yet
    }

    setLoading(false)
  }

  return { stats, loading }
}
