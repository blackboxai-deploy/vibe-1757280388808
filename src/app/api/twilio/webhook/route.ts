import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    
    // Extract Twilio webhook data
    const callSid = body.get('CallSid') as string
    const callStatus = body.get('CallStatus') as string
    const from = body.get('From') as string
    const to = body.get('To') as string
    const duration = body.get('CallDuration') as string
    const recordingUrl = body.get('RecordingUrl') as string
    
    console.log('Twilio webhook received:', { callSid, callStatus, from, to, duration })
    
    // Find the call in our database
    // In a real implementation, you'd store the Twilio CallSid when initiating the call
    const calls = await db.getActiveCalls()
    const call = calls.find(c => c.twilioCallSid === callSid)
    
    if (!call) {
      console.warn('Call not found in database:', callSid)
      return NextResponse.json({ 
        success: false, 
        error: 'Call not found' 
      }, { status: 404 })
    }
    
    // Update call status based on Twilio status
    const updates: any = {
      twilioStatus: callStatus
    }
    
    switch (callStatus) {
      case 'initiated':
        updates.status = 'dialing'
        updates.startedAt = new Date()
        break
        
      case 'ringing':
        updates.status = 'dialing'
        break
        
      case 'in-progress':
        updates.status = 'in-progress'
        updates.answered = true
        if (!call.startedAt) {
          updates.startedAt = new Date()
        }
        break
        
      case 'completed':
        updates.status = 'completed'
        updates.endedAt = new Date()
        if (duration) {
          updates.duration = parseInt(duration)
        }
        if (recordingUrl) {
          updates.recording = recordingUrl
        }
        break
        
      case 'busy':
        updates.status = 'busy'
        updates.endedAt = new Date()
        break
        
      case 'no-answer':
        updates.status = 'no-answer'
        updates.endedAt = new Date()
        break
        
      case 'failed':
        updates.status = 'failed'
        updates.endedAt = new Date()
        updates.error = 'Call failed'
        break
        
      case 'canceled':
        updates.status = 'failed'
        updates.endedAt = new Date()
        updates.error = 'Call canceled'
        break
    }
    
    // Update the call in database
    await db.updateCall(call.id, updates)
    
    // Log the call event
    await db.addCallEvent(call.id, {
      id: `evt_${Date.now()}`,
      callId: call.id,
      type: mapStatusToEventType(callStatus),
      timestamp: new Date(),
      data: {
        twilioStatus: callStatus,
        duration: duration ? parseInt(duration) : undefined,
        recordingUrl
      }
    })
    
    // Update contact information if call completed
    if (callStatus === 'completed') {
      const contact = await db.getContact(call.contactId)
      if (contact) {
        await db.updateContact(contact.id, {
          totalCalls: contact.totalCalls + 1,
          lastCalled: new Date(),
          lastCallStatus: 'completed'
        })
      }
    }
    
    // Return appropriate TwiML based on call status
    let twimlResponse = ''
    
    if (callStatus === 'in-progress') {
      // Call was answered, start the conversation
      twimlResponse = generateInitialTwiML(call)
    }
    
    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml'
      }
    })
  } catch (error) {
    console.error('Error handling Twilio webhook:', error)
    
    // Return basic TwiML to end call gracefully
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">We're sorry, there was a technical issue. Goodbye.</Say>
      <Hangup/>
    </Response>`
    
    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml'
      }
    })
  }
}

export async function GET(request: NextRequest) {
  // Handle Twilio webhook validation if needed
  const searchParams = request.nextUrl.searchParams
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'Twilio webhook endpoint is active' 
  })
}

function mapStatusToEventType(status: string): 'call-started' | 'call-answered' | 'call-ended' | 'error' {
  switch (status) {
    case 'initiated':
    case 'ringing':
      return 'call-started'
    case 'in-progress':
      return 'call-answered'
    case 'completed':
    case 'busy':
    case 'no-answer':
    case 'canceled':
      return 'call-ended'
    case 'failed':
      return 'error'
    default:
      return 'error'
  }
}

function generateInitialTwiML(call: any): string {
  // This would generate the initial TwiML based on campaign configuration
  // For now, return a basic greeting
  return `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Say voice="nova" language="en-US">
      Hello! This is an automated call from AI Call Agent. Please hold while we connect you.
    </Say>
    <Pause length="1"/>
    <Redirect>${typeof window === 'undefined' ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com') : window.location.origin}/api/twilio/conversation?callId=${call.id}</Redirect>
  </Response>`
}