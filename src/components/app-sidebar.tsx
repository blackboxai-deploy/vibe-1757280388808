"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Navigation items
const navigationItems = [
  {
    title: "Overview",
    href: "/",
    icon: "📊",
    description: "Dashboard and metrics"
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    icon: "📢",
    description: "Manage call campaigns"
  },
  {
    title: "Contacts",
    href: "/contacts",
    icon: "👥",
    description: "Contact lists and imports"
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: "📈",
    description: "Detailed reports and insights"
  },
  {
    title: "Live Calls",
    href: "/live-calls",
    icon: "📞",
    description: "Active call monitoring"
  }
]

const settingsItems = [
  {
    title: "API Configuration",
    href: "/settings/api",
    icon: "⚙️",
    description: "OpenAI and Twilio settings"
  },
  {
    title: "Compliance",
    href: "/settings/compliance",
    icon: "🛡️",
    description: "Privacy and opt-out settings"
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const [activeCalls] = useState(3) // This would be real-time data

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            AI
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Call Agent</h2>
            <p className="text-xs text-muted-foreground">AI-Powered Outreach</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href} className="flex items-center space-x-3">
                      <span className="text-base">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      {item.title === "Live Calls" && activeCalls > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {activeCalls}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href} className="flex items-center space-x-3">
                      <span className="text-base">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">System Status</span>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Online
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            API Usage: 45% of limit
          </div>
          <Button variant="outline" size="sm" className="w-full">
            View System Health
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}