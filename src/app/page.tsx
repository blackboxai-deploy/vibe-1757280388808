"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Mock data for demonstration
const mockStats = {
  totalCampaigns: 8,
  activeCampaigns: 3,
  totalCalls: 2847,
  totalContacts: 15420,
  overallSuccessRate: 68.5,
  averageCallDuration: 127,
  averageSentimentScore: 0.65,
  totalCallMinutes: 4825,
  callsToday: 247,
  callsThisWeek: 1834,
  callsThisMonth: 6921
}

const activeCampaigns = [
  {
    id: "1",
    name: "Product Launch Outreach",
    status: "active",
    progress: 78,
    callsCompleted: 1240,
    totalContacts: 1589,
    successRate: 72.3,
    averageSentiment: 0.78
  },
  {
    id: "2", 
    name: "Customer Satisfaction Survey",
    status: "active",
    progress: 45,
    callsCompleted: 567,
    totalContacts: 1260,
    successRate: 65.8,
    averageSentiment: 0.55
  },
  {
    id: "3",
    name: "Event Reminder Calls",
    status: "active", 
    progress: 92,
    callsCompleted: 2891,
    totalContacts: 3142,
    successRate: 85.1,
    averageSentiment: 0.72
  }
]

const recentCalls = [
  { id: "1", contact: "Sarah Johnson", campaign: "Product Launch", status: "completed", duration: 145, sentiment: 0.82 },
  { id: "2", contact: "Michael Chen", campaign: "Survey", status: "in-progress", duration: 67, sentiment: 0.61 },
  { id: "3", contact: "Emily Rodriguez", campaign: "Event Reminder", status: "completed", duration: 89, sentiment: 0.95 },
  { id: "4", contact: "David Kim", campaign: "Product Launch", status: "no-answer", duration: 0, sentiment: 0 },
  { id: "5", contact: "Lisa Thompson", campaign: "Survey", status: "completed", duration: 203, sentiment: 0.45 }
]

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200'
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'no-answer': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'failed': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Call Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time overview of your outbound calling campaigns
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Current Time</div>
            <div className="text-lg font-mono">{formatTime(currentTime)}</div>
          </div>
          <Button asChild>
            <Link href="/campaigns">Create Campaign</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <span className="text-xl">📞</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{mockStats.callsToday} today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <span className="text-xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.overallSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Call Duration</CardTitle>
            <span className="text-xl">⏱️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageCallDuration}s</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(mockStats.totalCallMinutes / 60)} hours total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <span className="text-xl">📢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.totalCampaigns} total campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="calls">Recent Calls</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {activeCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription>
                        {campaign.callsCompleted} of {campaign.totalContacts} contacts reached
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{campaign.progress}%</span>
                    </div>
                    <Progress value={campaign.progress} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-semibold">{campaign.successRate}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Sentiment</div>
                      <div className={`font-semibold ${getSentimentColor(campaign.averageSentiment)}`}>
                        {(campaign.averageSentiment * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Call Activity</CardTitle>
              <CardDescription>Latest calls across all campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="font-medium">{call.contact}</div>
                        <div className="text-sm text-muted-foreground">{call.campaign}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Badge variant="outline" className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                      {call.duration > 0 && (
                        <div className="text-muted-foreground">{call.duration}s</div>
                      )}
                      {call.sentiment > 0 && (
                        <div className={`font-medium ${getSentimentColor(call.sentiment)}`}>
                          {(call.sentiment * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Alert>
            <span className="text-lg">🟢</span>
            <AlertTitle>System Status: Operational</AlertTitle>
            <AlertDescription>
              All systems are running normally. OpenAI and Twilio APIs are responding correctly.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <span className="text-lg">⚠️</span>
            <AlertTitle>API Usage Notice</AlertTitle>
            <AlertDescription>
              You have used 45% of your monthly OpenAI token limit. Consider monitoring usage closely.
            </AlertDescription>
          </Alert>

          <Alert>
            <span className="text-lg">📊</span>
            <AlertTitle>Performance Insight</AlertTitle>
            <AlertDescription>
              Calls made between 2-4 PM show 23% higher success rates. Consider scheduling more campaigns during this window.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}