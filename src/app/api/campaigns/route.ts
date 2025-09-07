import { NextRequest, NextResponse } from 'next/server'
import { db, generateId } from '@/lib/database'
import { Campaign } from '@/types/campaign'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    let campaigns = await db.getAllCampaigns()
    
    if (status && status !== 'all') {
      campaigns = campaigns.filter(campaign => campaign.status === status)
    }
    
    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaigns',
        message: (error as Error).message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign name is required' 
        },
        { status: 400 }
      )
    }
    
    // Create new campaign
    const campaign: Campaign = {
      id: await generateId(),
      name: body.name,
      description: body.description || '',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Call Configuration
      script: body.script || '',
      useAiConversation: body.useAiConversation ?? true,
      recordingUrl: body.recordingUrl,
      maxCallDuration: body.maxCallDuration || 300,
      maxRetries: body.maxRetries || 3,
      retryInterval: body.retryInterval || 60,
      
      // AI Configuration
      aiPersonality: body.aiPersonality || 'Professional and friendly',
      conversationGoals: body.conversationGoals || [],
      language: body.language || 'en-US',
      accent: body.accent,
      voiceModel: body.voiceModel || 'nova',
      
      // Personalization
      usePersonalization: body.usePersonalization ?? true,
      personalizationFields: body.personalizationFields || [],
      greetingTemplate: body.greetingTemplate,
      
      // Analytics (initialized to 0)
      totalContacts: 0,
      contactsCalled: 0,
      contactsAnswered: 0,
      contactsCompleted: 0,
      averageCallDuration: 0,
      successRate: 0
    }
    
    const createdCampaign = await db.createCampaign(campaign)
    
    return NextResponse.json({
      success: true,
      data: createdCampaign,
      message: 'Campaign created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create campaign',
        message: (error as Error).message
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign ID is required' 
        },
        { status: 400 }
      )
    }
    
    const updatedCampaign = await db.updateCampaign(id, {
      ...updates,
      updatedAt: new Date()
    })
    
    if (!updatedCampaign) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign not found' 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign updated successfully'
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update campaign',
        message: (error as Error).message
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign ID is required' 
        },
        { status: 400 }
      )
    }
    
    const deleted = await db.deleteCampaign(id)
    
    if (!deleted) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign not found' 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete campaign',
        message: (error as Error).message
      },
      { status: 500 }
    )
  }
}