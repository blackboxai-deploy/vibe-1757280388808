import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateRange = searchParams.get('dateRange') || '30d'
    const campaignId = searchParams.get('campaignId')
    const metric = searchParams.get('metric') || 'overview'
    
    const analytics = await db.getAnalyticsMetrics()
    
    switch (metric) {
      case 'overview':
        return NextResponse.json({
          success: true,
          data: analytics,
          dateRange,
          generatedAt: new Date().toISOString()
        })
        
      case 'campaign-performance':
        return getCampaignPerformance(campaignId, dateRange)
        
      case 'sentiment-analysis':
        return getSentimentAnalysis(dateRange)
        
      case 'timing-analysis':
        return getTimingAnalysis(dateRange)
        
      case 'conversation-insights':
        return getConversationInsights(dateRange)
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid metric type',
          availableMetrics: ['overview', 'campaign-performance', 'sentiment-analysis', 'timing-analysis', 'conversation-insights']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        message: (error as Error).message
      },
      { status: 500 }
    )
  }
}

async function getCampaignPerformance(campaignId?: string | null, dateRange?: string) {
  try {
    const campaigns = await db.getAllCampaigns()
    const allCalls = []
    
    for (const campaign of campaigns) {
      if (campaignId && campaign.id !== campaignId) continue
      
      const calls = await db.getCallsByCampaign(campaign.id)
      const filteredCalls = filterCallsByDateRange(calls, dateRange)
      
      const campaignStats = {
        campaignId: campaign.id,
        campaignName: campaign.name,
        totalCalls: filteredCalls.length,
        completedCalls: filteredCalls.filter(c => c.status === 'completed').length,
        successRate: filteredCalls.length > 0 
          ? (filteredCalls.filter(c => c.status === 'completed').length / filteredCalls.length) * 100 
          : 0,
        averageDuration: filteredCalls.length > 0
          ? filteredCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / filteredCalls.length
          : 0,
        averageSentiment: filteredCalls.filter(c => c.sentimentScore).length > 0
          ? filteredCalls
              .filter(c => c.sentimentScore !== undefined)
              .reduce((sum, c) => sum + c.sentimentScore!, 0) / 
            filteredCalls.filter(c => c.sentimentScore !== undefined).length
          : 0,
        progressPercentage: campaign.totalContacts > 0 
          ? (campaign.contactsCalled / campaign.totalContacts) * 100 
          : 0,
        humanEscalationRate: filteredCalls.length > 0
          ? (filteredCalls.filter(c => c.humanEscalation).length / filteredCalls.length) * 100
          : 0,
        optOutRate: filteredCalls.length > 0
          ? (filteredCalls.filter(c => c.optedOut).length / filteredCalls.length) * 100
          : 0
      }
      
      allCalls.push(campaignStats)
    }
    
    return NextResponse.json({
      success: true,
      data: allCalls,
      dateRange,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    throw error
  }
}

async function getSentimentAnalysis(dateRange?: string) {
  try {
    const calls = await getAllCallsInDateRange(dateRange)
    const sentimentCalls = calls.filter(c => c.sentimentScore !== undefined)
    
    if (sentimentCalls.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          averageScore: 0,
          totalAnalyzed: 0,
          distribution: { positive: 0, neutral: 0, negative: 0 },
          trends: []
        },
        dateRange
      })
    }
    
    const averageScore = sentimentCalls.reduce((sum, c) => sum + c.sentimentScore!, 0) / sentimentCalls.length
    
    const distribution = {
      positive: sentimentCalls.filter(c => c.sentimentLabel === 'positive').length,
      neutral: sentimentCalls.filter(c => c.sentimentLabel === 'neutral').length,
      negative: sentimentCalls.filter(c => c.sentimentLabel === 'negative').length
    }
    
    // Generate daily sentiment trends (mock data for demo)
    const trends = generateDailyTrends(sentimentCalls, 'sentiment')
    
    return NextResponse.json({
      success: true,
      data: {
        averageScore,
        totalAnalyzed: sentimentCalls.length,
        distribution,
        trends,
        insights: generateSentimentInsights(averageScore, distribution)
      },
      dateRange,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    throw error
  }
}

async function getTimingAnalysis(dateRange?: string) {
  try {
    const calls = await getAllCallsInDateRange(dateRange)
    
    // Analyze by hour of day
    const hourlyStats = new Map()
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats.set(hour, { calls: 0, completed: 0 })
    }
    
    calls.forEach(call => {
      if (call.startedAt) {
        const hour = call.startedAt.getHours()
        const stats = hourlyStats.get(hour)
        stats.calls++
        if (call.status === 'completed') stats.completed++
      }
    })
    
    const bestHours = Array.from(hourlyStats.entries())
      .map(([hour, stats]) => ({
        hour,
        calls: stats.calls,
        successRate: stats.calls > 0 ? (stats.completed / stats.calls) * 100 : 0
      }))
      .filter(h => h.calls > 0)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5)
    
    // Analyze by day of week
    const dailyStats = new Map()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    dayNames.forEach((day, index) => {
      dailyStats.set(index, { day, calls: 0, completed: 0 })
    })
    
    calls.forEach(call => {
      if (call.startedAt) {
        const dayOfWeek = call.startedAt.getDay()
        const stats = dailyStats.get(dayOfWeek)
        stats.calls++
        if (call.status === 'completed') stats.completed++
      }
    })
    
    const dailyPerformance = Array.from(dailyStats.values())
      .map(stats => ({
        ...stats,
        successRate: stats.calls > 0 ? (stats.completed / stats.calls) * 100 : 0
      }))
      .filter(d => d.calls > 0)
    
    return NextResponse.json({
      success: true,
      data: {
        bestHours,
        dailyPerformance,
        recommendations: generateTimingRecommendations(bestHours, dailyPerformance)
      },
      dateRange,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    throw error
  }
}

async function getConversationInsights(dateRange?: string) {
  try {
    const calls = await getAllCallsInDateRange(dateRange)
    
    // Mock conversation analysis (in real implementation, this would analyze transcripts)
    const topicAnalysis = [
      { topic: 'Product Interest', mentions: 342, sentiment: 0.76, trend: 'up' },
      { topic: 'Pricing Questions', mentions: 189, sentiment: 0.42, trend: 'down' },
      { topic: 'Technical Support', mentions: 156, sentiment: 0.38, trend: 'stable' },
      { topic: 'Feature Requests', mentions: 134, sentiment: 0.68, trend: 'up' },
      { topic: 'Complaints', mentions: 89, sentiment: 0.21, trend: 'down' }
    ]
    
    const escalationReasons = {
      'Complex Technical Issues': 34,
      'Pricing Negotiations': 28,
      'Emotional Distress': 22,
      'Special Requests': 16
    }
    
    const aiQuality = {
      'General Inquiries': 94,
      'Technical Questions': 78,
      'Complaint Handling': 65,
      'Sales Inquiries': 87
    }
    
    const totalEscalations = calls.filter(c => c.humanEscalation).length
    const escalationRate = calls.length > 0 ? (totalEscalations / calls.length) * 100 : 0
    
    return NextResponse.json({
      success: true,
      data: {
        topicAnalysis,
        escalationReasons,
        aiQuality,
        totalEscalations,
        escalationRate,
        totalCallsAnalyzed: calls.length
      },
      dateRange,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    throw error
  }
}

// Helper functions
async function getAllCallsInDateRange(dateRange?: string) {
  const campaigns = await db.getAllCampaigns()
  const allCalls = []
  
  for (const campaign of campaigns) {
    const calls = await db.getCallsByCampaign(campaign.id)
    allCalls.push(...calls)
  }
  
  return filterCallsByDateRange(allCalls, dateRange)
}

function filterCallsByDateRange(calls: any[], dateRange?: string) {
  if (!dateRange || dateRange === 'all') return calls
  
  const now = new Date()
  let startDate: Date
  
  switch (dateRange) {
    case '1d':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    default:
      return calls
  }
  
  return calls.filter(call => call.startedAt && call.startedAt >= startDate)
}

function generateDailyTrends(calls: any[], metric: string) {
  // Generate mock daily trends data based on actual calls
  const days = 7
  const trends = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // In a real implementation, this would analyze actual call data
    const baseCalls = calls.length > 0 ? calls.length / days : 20
    const baseValue = metric === 'sentiment' ? 0.6 : 0.7
    
    trends.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() * 0.4 + baseValue - 0.2,
      calls: Math.floor(Math.random() * baseCalls) + Math.floor(baseCalls / 2)
    })
  }
  
  return trends
}

function generateSentimentInsights(averageScore: number, distribution: any) {
  const insights = []
  
  if (averageScore >= 0.7) {
    insights.push({ type: 'positive', message: 'Excellent overall sentiment - recipients are responding very positively' })
  } else if (averageScore >= 0.5) {
    insights.push({ type: 'neutral', message: 'Good sentiment overall with room for improvement in conversation quality' })
  } else {
    insights.push({ type: 'negative', message: 'Sentiment needs attention - consider reviewing call scripts and AI training' })
  }
  
  const totalCalls = distribution.positive + distribution.neutral + distribution.negative
  if (totalCalls > 0) {
    const negativePercentage = (distribution.negative / totalCalls) * 100
    if (negativePercentage > 30) {
      insights.push({ 
        type: 'warning', 
        message: `High negative sentiment rate (${negativePercentage.toFixed(1)}%) - investigate common complaint themes` 
      })
    }
  }
  
  return insights
}

function generateTimingRecommendations(bestHours: any[], dailyPerformance: any[]) {
  const recommendations = []
  
  if (bestHours.length > 0) {
    const topHour = bestHours[0]
    recommendations.push({
      type: 'peak_hours',
      message: `Best performance at ${topHour.hour}:00 with ${topHour.successRate.toFixed(1)}% success rate`,
      action: 'Schedule more calls during this time'
    })
  }
  
  if (dailyPerformance.length > 0) {
    const bestDay = dailyPerformance.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    )
    recommendations.push({
      type: 'best_day',
      message: `${bestDay.day} shows highest success rates (${bestDay.successRate.toFixed(1)}%)`,
      action: 'Consider concentrating campaigns on this day'
    })
  }
  
  return recommendations
}