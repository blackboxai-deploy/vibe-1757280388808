"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"

// Mock campaigns data
const mockCampaigns = [
  {
    id: "1",
    name: "Product Launch Outreach",
    description: "Reach out to existing customers about our new product line",
    status: "active" as const,
    createdAt: new Date("2024-01-15"),
    totalContacts: 1589,
    contactsCalled: 1240,
    contactsAnswered: 896,
    contactsCompleted: 723,
    averageCallDuration: 145,
    successRate: 72.3,
    useAiConversation: true,
    language: "en-US",
    voiceModel: "nova" as const
  },
  {
    id: "2",
    name: "Customer Satisfaction Survey", 
    description: "Follow-up survey for recent purchases",
    status: "active" as const,
    createdAt: new Date("2024-01-20"),
    totalContacts: 1260,
    contactsCalled: 567,
    contactsAnswered: 398,
    contactsCompleted: 311,
    averageCallDuration: 203,
    successRate: 65.8,
    useAiConversation: true,
    language: "en-US",
    voiceModel: "alloy" as const
  },
  {
    id: "3",
    name: "Event Reminder Calls",
    description: "Remind registered attendees about upcoming webinar",
    status: "completed" as const,
    createdAt: new Date("2024-01-10"),
    totalContacts: 3142,
    contactsCalled: 3142,
    contactsAnswered: 2876,
    contactsCompleted: 2891,
    averageCallDuration: 89,
    successRate: 85.1,
    useAiConversation: false,
    language: "en-US",
    voiceModel: "shimmer" as const
  },
  {
    id: "4",
    name: "Appointment Scheduling",
    description: "Schedule follow-up consultations with prospects",
    status: "paused" as const,
    createdAt: new Date("2024-01-25"),
    totalContacts: 892,
    contactsCalled: 234,
    contactsAnswered: 167,
    contactsCompleted: 89,
    averageCallDuration: 267,
    successRate: 53.2,
    useAiConversation: true,
    language: "en-US",
    voiceModel: "echo" as const
  }
]

export default function CampaignsPage() {
  const [campaigns] = useState(mockCampaigns)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    script: "",
    useAiConversation: true,
    language: "en-US",
    voiceModel: "nova",
    maxCallDuration: 300,
    maxRetries: 3,
    personality: "Professional and friendly"
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200'
      case 'paused': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const handleCreateCampaign = () => {
    // In a real app, this would make an API call
    console.log('Creating campaign:', newCampaign)
    setIsCreateDialogOpen(false)
    // Reset form
    setNewCampaign({
      name: "",
      description: "",
      script: "",
      useAiConversation: true,
      language: "en-US",
      voiceModel: "nova",
      maxCallDuration: 300,
      maxRetries: 3,
      personality: "Professional and friendly"
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const calculateProgress = (campaign: any) => {
    return Math.round((campaign.contactsCalled / campaign.totalContacts) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Management</h1>
          <p className="text-muted-foreground">
            Create and manage your outbound calling campaigns
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Campaign</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Set up a new outbound calling campaign with AI-powered conversations
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="Enter campaign name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this campaign"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ai-conversation"
                  checked={newCampaign.useAiConversation}
                  onCheckedChange={(checked) => 
                    setNewCampaign(prev => ({ ...prev, useAiConversation: checked }))
                  }
                />
                <Label htmlFor="ai-conversation">Enable AI Conversation</Label>
              </div>

              {newCampaign.useAiConversation && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="personality">AI Personality</Label>
                    <Input
                      id="personality"
                      placeholder="e.g., Professional and friendly, Casual and upbeat"
                      value={newCampaign.personality}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, personality: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Voice Model</Label>
                      <Select 
                        value={newCampaign.voiceModel}
                        onValueChange={(value) => 
                          setNewCampaign(prev => ({ ...prev, voiceModel: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                          <SelectItem value="echo">Echo (Male)</SelectItem>
                          <SelectItem value="fable">Fable (British Male)</SelectItem>
                          <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
                          <SelectItem value="nova">Nova (Female)</SelectItem>
                          <SelectItem value="shimmer">Shimmer (Soft Female)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select 
                        value={newCampaign.language}
                        onValueChange={(value) => 
                          setNewCampaign(prev => ({ ...prev, language: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="script">Call Script / Instructions</Label>
                <Textarea
                  id="script"
                  placeholder={
                    newCampaign.useAiConversation 
                      ? "Enter instructions for the AI agent about the conversation goals and key points to cover"
                      : "Enter the exact script to be read during calls"
                  }
                  rows={4}
                  value={newCampaign.script}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, script: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-duration">Max Call Duration (seconds)</Label>
                  <Input
                    id="max-duration"
                    type="number"
                    value={newCampaign.maxCallDuration}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      maxCallDuration: parseInt(e.target.value) 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-retries">Max Retry Attempts</Label>
                  <Input
                    id="max-retries"
                    type="number"
                    value={newCampaign.maxRetries}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      maxRetries: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={!newCampaign.name}>
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <span className="text-xl">📢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <span className="text-xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.totalContacts, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
            <span className="text-xl">📞</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.contactsCalled, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns.reduce((sum, c) => sum + c.contactsAnswered, 0).toLocaleString()} answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <span className="text-xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(campaigns.reduce((sum, c) => sum + c.successRate, 0) / campaigns.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{campaign.name}</CardTitle>
                  <CardDescription>{campaign.description}</CardDescription>
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(campaign.createdAt)} • 
                    Voice: {campaign.voiceModel} • 
                    AI: {campaign.useAiConversation ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Campaign Progress</span>
                  <span>{calculateProgress(campaign)}%</span>
                </div>
                <Progress value={calculateProgress(campaign)} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {campaign.contactsCalled} of {campaign.totalContacts} contacts called
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Answered</div>
                  <div className="font-semibold">{campaign.contactsAnswered}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((campaign.contactsAnswered / campaign.contactsCalled) * 100)}% rate
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Completed</div>
                  <div className="font-semibold">{campaign.contactsCompleted}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((campaign.contactsCompleted / campaign.contactsAnswered) * 100)}% rate
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Success Rate</div>
                  <div className="font-semibold text-green-600">{campaign.successRate}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Avg Duration</div>
                  <div className="font-semibold">{campaign.averageCallDuration}s</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Minutes</div>
                  <div className="font-semibold">
                    {Math.round((campaign.contactsCompleted * campaign.averageCallDuration) / 60)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t">
                {campaign.status === 'active' && (
                  <Button variant="outline" size="sm">
                    Pause Campaign
                  </Button>
                )}
                {campaign.status === 'paused' && (
                  <Button size="sm">
                    Resume Campaign
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  View Analytics
                </Button>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  Edit Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <span className="text-6xl mb-4">📢</span>
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Create your first campaign to start making AI-powered outbound calls
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}