"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalCalls: 2847,
    totalCallMinutes: 4825,
    averageCallDuration: 127,
    successRate: 68.5,
    answeredRate: 72.3,
    completionRate: 58.9
  },
  sentiment: {
    averageScore: 0.65,
    positive: 1423,
    neutral: 987,
    negative: 437
  },
  timeBasedMetrics: {
    peakHours: [
      { hour: 10, calls: 234, successRate: 75.2 },
      { hour: 11, calls: 267, successRate: 73.8 },
      { hour: 14, calls: 198, successRate: 71.1 },
      { hour: 15, calls: 223, successRate: 69.5 },
      { hour: 16, calls: 201, successRate: 67.8 }
    ],
    dailyTrends: [
      { day: "Mon", calls: 412, success: 287 },
      { day: "Tue", calls: 456, success: 321 },
      { day: "Wed", calls: 389, success: 267 },
      { day: "Thu", calls: 534, success: 378 },
      { day: "Fri", calls: 398, success: 284 }
    ]
  },
  campaignPerformance: [
    {
      name: "Product Launch Outreach",
      calls: 1240,
      successRate: 72.3,
      avgDuration: 145,
      avgSentiment: 0.78,
      cost: 248.50
    },
    {
      name: "Customer Survey",
      calls: 567,
      successRate: 65.8,
      avgDuration: 203,
      avgSentiment: 0.55,
      cost: 113.40
    },
    {
      name: "Event Reminders", 
      calls: 1040,
      successRate: 85.1,
      avgDuration: 89,
      avgSentiment: 0.72,
      cost: 208.80
    }
  ]
}

const conversationAnalytics = [
  {
    topic: "Product Interest",
    mentions: 342,
    sentiment: 0.76,
    trend: "up"
  },
  {
    topic: "Pricing Questions",
    mentions: 189,
    sentiment: 0.42,
    trend: "down"
  },
  {
    topic: "Technical Support",
    mentions: 156,
    sentiment: 0.38,
    trend: "stable"
  },
  {
    topic: "Feature Requests",
    mentions: 134,
    sentiment: 0.68,
    trend: "up"
  },
  {
    topic: "Complaints",
    mentions: 89,
    sentiment: 0.21,
    trend: "down"
  }
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedCampaign, setSelectedCampaign] = useState("all")

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return "text-green-600"
    if (score >= 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "📈"
      case "down": return "📉"
      default: return "➡️"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Detailed analysis of your campaign performance and conversation insights
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="product-launch">Product Launch</SelectItem>
              <SelectItem value="customer-survey">Customer Survey</SelectItem>
              <SelectItem value="event-reminders">Event Reminders</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.overview.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(mockAnalytics.overview.totalCallMinutes / 60)} hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockAnalytics.overview.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">+2.1% vs last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answer Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockAnalytics.overview.answeredRate}%
            </div>
            <p className="text-xs text-muted-foreground">-1.3% vs last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalytics.overview.averageCallDuration}s
            </div>
            <p className="text-xs text-muted-foreground">+12s vs last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSentimentColor(mockAnalytics.sentiment.averageScore)}`}>
              {Math.round(mockAnalytics.sentiment.averageScore * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">+5% vs last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(570.70)}
            </div>
            <p className="text-xs text-muted-foreground">${(570.70 / mockAnalytics.overview.totalCalls).toFixed(3)} per call</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Campaign Performance</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="timing">Optimal Timing</TabsTrigger>
          <TabsTrigger value="conversations">Conversation Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Comparison</CardTitle>
              <CardDescription>Key metrics across all active campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.campaignPerformance.map((campaign, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Calls</div>
                        <div className="font-semibold text-lg">{campaign.calls.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-semibold text-green-600">{campaign.successRate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Duration</div>
                        <div className="font-semibold">{campaign.avgDuration}s</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Sentiment</div>
                        <div className={`font-semibold ${getSentimentColor(campaign.avgSentiment)}`}>
                          {Math.round(campaign.avgSentiment * 100)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Cost</div>
                        <div className="font-semibold">{formatCurrency(campaign.cost)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Overall emotional response from call recipients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Positive</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {mockAnalytics.sentiment.positive} ({Math.round((mockAnalytics.sentiment.positive / mockAnalytics.overview.totalCalls) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Neutral</span>
                    </div>
                    <span className="font-semibold text-yellow-600">
                      {mockAnalytics.sentiment.neutral} ({Math.round((mockAnalytics.sentiment.neutral / mockAnalytics.overview.totalCalls) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Negative</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      {mockAnalytics.sentiment.negative} ({Math.round((mockAnalytics.sentiment.negative / mockAnalytics.overview.totalCalls) * 100)}%)
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Average Sentiment Score</div>
                  <div className={`text-3xl font-bold ${getSentimentColor(mockAnalytics.sentiment.averageScore)}`}>
                    {Math.round(mockAnalytics.sentiment.averageScore * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {mockAnalytics.sentiment.averageScore >= 0.6 ? "Generally positive reception" :
                     mockAnalytics.sentiment.averageScore >= 0.4 ? "Neutral reception" :
                     "Needs improvement"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trends</CardTitle>
                <CardDescription>How sentiment has changed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-muted-foreground">
                    Detailed sentiment trend charts would be displayed here
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Integration with charting library (Chart.js, Recharts) recommended
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Best Call Times</CardTitle>
                <CardDescription>Optimal hours for maximum success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.timeBasedMetrics.peakHours.map((hour) => (
                    <div key={hour.hour} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          {hour.hour}:00 - {hour.hour + 1}:00
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {hour.calls} calls made
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {hour.successRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          success rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
                <CardDescription>Success rates by day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.timeBasedMetrics.dailyTrends.map((day) => (
                    <div key={day.day} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{day.day}</div>
                        <div className="text-sm text-muted-foreground">
                          {day.calls} calls
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">
                          {Math.round((day.success / day.calls) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {day.success} successful
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Timing Recommendations</CardTitle>
              <CardDescription>AI-generated insights for optimal calling times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="font-medium text-green-700">Peak Performance Window</div>
                <div className="text-sm text-muted-foreground">
                  Tuesday and Thursday between 10 AM - 12 PM show the highest success rates (75%+)
                </div>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="font-medium text-yellow-700">Avoid These Times</div>
                <div className="text-sm text-muted-foreground">
                  Monday mornings and Friday afternoons have 23% lower success rates
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium text-blue-700">Opportunity</div>
                <div className="text-sm text-muted-foreground">
                  Consider extending calling hours to 5 PM - early evening shows potential
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Topic Analysis</CardTitle>
              <CardDescription>Most discussed topics and their sentiment impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversationAnalytics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTrendIcon(topic.trend)}</span>
                      <div>
                        <div className="font-medium">{topic.topic}</div>
                        <div className="text-sm text-muted-foreground">
                          {topic.mentions} mentions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${getSentimentColor(topic.sentiment)}`}>
                        {Math.round(topic.sentiment * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        avg sentiment
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Response Quality</CardTitle>
                <CardDescription>How well the AI handled different conversation types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>General Inquiries</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Questions</span>
                    <span className="font-semibold text-yellow-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complaint Handling</span>
                    <span className="font-semibold text-red-600">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Inquiries</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escalation Analysis</CardTitle>
                <CardDescription>When and why calls were escalated to humans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Complex Technical Issues</span>
                    <span className="font-semibold">34%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pricing Negotiations</span>
                    <span className="font-semibold">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emotional Distress</span>
                    <span className="font-semibold">22%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Requests</span>
                    <span className="font-semibold">16%</span>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Total escalations: 127 (4.5% of all calls)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}