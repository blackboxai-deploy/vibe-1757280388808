"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock contact data
const mockContacts = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phoneNumber: "+1-555-0123",
    company: "Tech Solutions Inc",
    title: "Marketing Manager",
    totalCalls: 3,
    lastCalled: new Date("2024-01-28"),
    lastCallStatus: "completed",
    optedOut: false,
    tags: ["customer", "high-priority"],
    source: "upload"
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@business.com",
    phoneNumber: "+1-555-0124",
    company: "Global Enterprises",
    title: "Director of Sales",
    totalCalls: 1,
    lastCalled: new Date("2024-01-29"),
    lastCallStatus: "in-progress",
    optedOut: false,
    tags: ["prospect"],
    source: "manual"
  },
  {
    id: "3",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.r@startup.io",
    phoneNumber: "+1-555-0125",
    company: "InnovateCorp",
    title: "Product Manager",
    totalCalls: 2,
    lastCalled: new Date("2024-01-27"),
    lastCallStatus: "completed",
    optedOut: false,
    tags: ["customer", "tech"],
    source: "api"
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@company.net",
    phoneNumber: "+1-555-0126",
    company: "DataDriven LLC",
    title: "CEO",
    totalCalls: 5,
    lastCalled: new Date("2024-01-25"),
    lastCallStatus: "no-answer",
    optedOut: true,
    tags: ["opted-out"],
    source: "upload"
  }
]

const mockContactLists = [
  {
    id: "1",
    name: "Q1 2024 Prospects",
    description: "High-value prospects for Q1 outreach campaign",
    source: "csv",
    totalContacts: 1247,
    validContacts: 1189,
    invalidContacts: 58,
    createdAt: new Date("2024-01-15"),
    processingStatus: "completed"
  },
  {
    id: "2",
    name: "Customer Survey List",
    description: "Existing customers for satisfaction survey",
    source: "excel",
    totalContacts: 892,
    validContacts: 876,
    invalidContacts: 16,
    createdAt: new Date("2024-01-22"),
    processingStatus: "completed"
  },
  {
    id: "3",
    name: "Event Attendees",
    description: "Webinar registrants from last month",
    source: "google-sheets",
    totalContacts: 2341,
    validContacts: 2298,
    invalidContacts: 43,
    createdAt: new Date("2024-01-10"),
    processingStatus: "completed"
  }
]

export default function ContactsPage() {
  const [contacts] = useState(mockContacts)
  const [contactLists] = useState(mockContactLists)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportProgress(0)

    // Simulate file processing
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsImporting(false)
          setIsImportDialogOpen(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.company}`
      .toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "opted-out" && contact.optedOut) ||
      (filterStatus === "active" && !contact.optedOut)
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200'
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'no-answer': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'failed': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'upload': return '📁'
      case 'manual': return '✏️'
      case 'api': return '🔗'
      case 'google-sheets': return '📊'
      default: return '📋'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Management</h1>
          <p className="text-muted-foreground">
            Import, organize, and manage your contact lists for campaigns
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Import Contacts</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Contact List</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file with your contact information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {!isImporting ? (
                  <>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-2">📁</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Drag and drop your file here, or click to browse
                      </div>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                      >
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Supported formats: CSV, Excel (.xlsx, .xls)<br/>
                      Required columns: First Name, Last Name, Phone Number<br/>
                      Optional: Email, Company, Title
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔄</div>
                      <div className="font-medium">Processing contacts...</div>
                      <div className="text-sm text-muted-foreground">
                        Validating phone numbers and checking for duplicates
                      </div>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                    <div className="text-center text-sm text-muted-foreground">
                      {importProgress}% complete
                    </div>
                  </div>
                )}
              </div>

              {!isImporting && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
          
          <Button>Add Contact Manually</Button>
        </div>
      </div>

      {/* Contact Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <span className="text-xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {contacts.filter(c => !c.optedOut).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Lists</CardTitle>
            <span className="text-xl">📋</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactLists.length}</div>
            <p className="text-xs text-muted-foreground">
              {contactLists.reduce((sum, list) => sum + list.totalContacts, 0).toLocaleString()} total contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opted Out</CardTitle>
            <span className="text-xl">🚫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.filter(c => c.optedOut).length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((contacts.filter(c => c.optedOut).length / contacts.length) * 100)}% rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Calls</CardTitle>
            <span className="text-xl">📞</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.reduce((sum, c) => sum + c.totalCalls, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {contacts.filter(c => c.lastCalled && c.lastCalled > new Date(Date.now() - 24 * 60 * 60 * 1000)).length} today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contacts">Individual Contacts</TabsTrigger>
          <TabsTrigger value="lists">Contact Lists</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search contacts by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="opted-out">Opted Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contacts Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Call History</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contact.email}
                          </div>
                          {contact.tags.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {contact.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contact.company}</div>
                          <div className="text-sm text-muted-foreground">{contact.title}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {contact.phoneNumber}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{contact.totalCalls} calls</div>
                          {contact.lastCalled && (
                            <div className="text-muted-foreground">
                              Last: {formatDate(contact.lastCalled)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.optedOut ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            opted-out
                          </Badge>
                        ) : (
                          <Badge variant="outline" className={getStatusColor(contact.lastCallStatus)}>
                            {contact.lastCallStatus || 'not-called'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{getSourceIcon(contact.source)}</span>
                          <span className="text-sm">{contact.source}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {filteredContacts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <span className="text-6xl mb-4">🔍</span>
                <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {searchTerm || filterStatus !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Import your first contact list to get started"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lists" className="space-y-4">
          <div className="grid gap-4">
            {contactLists.map((list) => (
              <Card key={list.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{list.name}</CardTitle>
                      <CardDescription>{list.description}</CardDescription>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created: {formatDate(list.createdAt)} • Source: {list.source}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {list.processingStatus}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Contacts
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Contacts</div>
                      <div className="font-semibold text-lg">{list.totalContacts.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Valid</div>
                      <div className="font-semibold text-green-600">{list.validContacts.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Invalid</div>
                      <div className="font-semibold text-red-600">{list.invalidContacts.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-semibold">
                        {Math.round((list.validContacts / list.totalContacts) * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                    <Button size="sm">Create Campaign</Button>
                    <Button variant="outline" size="sm">Export List</Button>
                    <Button variant="outline" size="sm">Edit List</Button>
                    <Button variant="outline" size="sm">Delete List</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {contactLists.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <span className="text-6xl mb-4">📋</span>
                <h3 className="text-lg font-semibold mb-2">No contact lists yet</h3>
                <p className="text-muted-foreground text-center max-w-sm mb-4">
                  Import your first contact list to organize your outreach campaigns
                </p>
                <Button onClick={() => setIsImportDialogOpen(true)}>
                  Import Contact List
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}