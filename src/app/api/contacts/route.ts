import { NextRequest, NextResponse } from 'next/server'
import { db, generateId, validatePhoneNumber, formatPhoneNumber } from '@/lib/database'
import { Contact, ContactImportResult } from '@/types/contact'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const optedOut = searchParams.get('optedOut')
    const source = searchParams.get('source')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    let contacts = await db.getAllContacts()
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      contacts = contacts.filter(contact => 
        `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.company}`
          .toLowerCase().includes(searchLower)
      )
    }
    
    if (optedOut !== null) {
      const isOptedOut = optedOut === 'true'
      contacts = contacts.filter(contact => contact.optedOut === isOptedOut)
    }
    
    if (source) {
      contacts = contacts.filter(contact => contact.source === source)
    }
    
    // Apply pagination
    const total = contacts.length
    contacts = contacts.slice(offset, offset + limit)
    
    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch contacts',
        message: (error as Error).message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle bulk import
    if (Array.isArray(body)) {
      return await handleBulkImport(body)
    }
    
    // Handle single contact creation
    const { firstName, lastName, phoneNumber, email, company, title, customFields } = body
    
    // Validate required fields
    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'First name, last name, and phone number are required' 
        },
        { status: 400 }
      )
    }
    
    // Validate and format phone number
    if (!await validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid phone number format' 
        },
        { status: 400 }
      )
    }
    
    const formattedPhoneNumber = await formatPhoneNumber(phoneNumber)
    
    // Check for existing contact with same phone number
    const existingContacts = await db.getContactsByPhoneNumbers([formattedPhoneNumber])
    if (existingContacts.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Contact with this phone number already exists' 
        },
        { status: 409 }
      )
    }
    
    // Create new contact
    const contact: Contact = {
      id: await generateId(),
      firstName,
      lastName,
      email: email || undefined,
      phoneNumber: formattedPhoneNumber,
      company: company || undefined,
      title: title || undefined,
      customFields: customFields || {},
      totalCalls: 0,
      optedOut: false,
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    }
    
    const createdContact = await db.createContact(contact)
    
    return NextResponse.json({
      success: true,
      data: createdContact,
      message: 'Contact created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create contact',
        message: (error as Error).message
      },
      { status: 500 }
    )
  }
}

async function handleBulkImport(contactsData: any[]): Promise<NextResponse> {
  const result: ContactImportResult = {
    success: true,
    totalRows: contactsData.length,
    validContacts: 0,
    invalidContacts: 0,
    duplicateContacts: 0,
    errors: [],
    contacts: []
  }
  
  const validContacts: Contact[] = []
  const existingPhoneNumbers = new Set<string>()
  
  // Get all existing phone numbers to check for duplicates
  const allContacts = await db.getAllContacts()
  allContacts.forEach(contact => existingPhoneNumbers.add(contact.phoneNumber))
  
  for (let i = 0; i < contactsData.length; i++) {
    const rowData = contactsData[i]
    const rowNumber = i + 1
    
    try {
      // Validate required fields
      if (!rowData.firstName || !rowData.lastName || !rowData.phoneNumber) {
        result.errors.push({
          row: rowNumber,
          field: 'required',
          value: JSON.stringify(rowData),
          error: 'Missing required fields (firstName, lastName, phoneNumber)',
          type: 'required'
        })
        result.invalidContacts++
        continue
      }
      
      // Validate phone number
      if (!await validatePhoneNumber(rowData.phoneNumber)) {
        result.errors.push({
          row: rowNumber,
          field: 'phoneNumber',
          value: rowData.phoneNumber,
          error: 'Invalid phone number format',
          type: 'validation'
        })
        result.invalidContacts++
        continue
      }
      
      const formattedPhoneNumber = await formatPhoneNumber(rowData.phoneNumber)
      
      // Check for duplicates
      if (existingPhoneNumbers.has(formattedPhoneNumber)) {
        result.errors.push({
          row: rowNumber,
          field: 'phoneNumber',
          value: formattedPhoneNumber,
          error: 'Phone number already exists',
          type: 'duplicate'
        })
        result.duplicateContacts++
        continue
      }
      
      // Add to existing numbers set to catch duplicates within this import
      existingPhoneNumbers.add(formattedPhoneNumber)
      
      // Create valid contact
      const contact: Contact = {
        id: await generateId(),
        firstName: rowData.firstName.trim(),
        lastName: rowData.lastName.trim(),
        email: rowData.email?.trim() || undefined,
        phoneNumber: formattedPhoneNumber,
        company: rowData.company?.trim() || undefined,
        title: rowData.title?.trim() || undefined,
        timezone: rowData.timezone,
        preferredLanguage: rowData.preferredLanguage,
        customFields: {},
        totalCalls: 0,
        optedOut: false,
        source: 'upload',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: rowData.tags ? (Array.isArray(rowData.tags) ? rowData.tags : [rowData.tags]) : []
      }
      
      // Add any additional custom fields
      Object.keys(rowData).forEach(key => {
        if (!['firstName', 'lastName', 'email', 'phoneNumber', 'company', 'title', 'timezone', 'preferredLanguage', 'tags'].includes(key)) {
          contact.customFields![key] = rowData[key]
        }
      })
      
      validContacts.push(contact)
      result.validContacts++
    } catch (error) {
      result.errors.push({
        row: rowNumber,
        field: 'general',
        value: JSON.stringify(rowData),
        error: `Processing error: ${(error as Error).message}`,
        type: 'validation'
      })
      result.invalidContacts++
    }
  }
  
  // Bulk create valid contacts
  if (validContacts.length > 0) {
    try {
      result.contacts = await db.bulkCreateContacts(validContacts)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to save contacts to database',
        message: (error as Error).message,
        importResult: result
      }, { status: 500 })
    }
  }
  
  return NextResponse.json({
    success: result.invalidContacts + result.duplicateContacts < result.totalRows,
    data: result,
    message: `Import completed. ${result.validContacts} contacts imported, ${result.invalidContacts} invalid, ${result.duplicateContacts} duplicates.`
  })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Contact ID is required' 
        },
        { status: 400 }
      )
    }
    
    // If phone number is being updated, validate it
    if (updates.phoneNumber) {
      if (!await validatePhoneNumber(updates.phoneNumber)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid phone number format' 
          },
          { status: 400 }
        )
      }
      updates.phoneNumber = await formatPhoneNumber(updates.phoneNumber)
    }
    
    const updatedContact = await db.updateContact(id, {
      ...updates,
      updatedAt: new Date()
    })
    
    if (!updatedContact) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Contact not found' 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: updatedContact,
      message: 'Contact updated successfully'
    })
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update contact',
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
          error: 'Contact ID is required' 
        },
        { status: 400 }
      )
    }
    
    const deleted = await db.deleteContact(id)
    
    if (!deleted) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Contact not found' 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete contact',
        message: (error as Error).message
      },
      { status: 500 }
    )
  }
}