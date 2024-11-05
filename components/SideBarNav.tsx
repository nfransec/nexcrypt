"use client"

import * as React from "react"
import { Activity, Bell, BookMarked, CreditCard, FileText, HelpCircle, Home, Inbox, Key, LogOut, MessageSquare, Moon, Search, Settings, Shield, Users } from "lucide-react"
import { useAuthenticator } from "@aws-amplify/ui-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Component() {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { user, signOut } = useAuthenticator()
  const [inboxCount] = React.useState(5)
  const [activityCount] = React.useState(1)

  const NavItem = ({ icon: Icon, label, badge, beta }: { icon: any; label: string; badge?: number; beta?: boolean }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start gap-4 px-4 hover:bg-zinc-800/50"
          onClick={() => setIsExpanded(false)}
        >
          <Icon className={`h-5 w-5 ${isExpanded ? '' : 'mx-auto'}`} />
          {isExpanded && (
            <span className="flex-1 text-left">
              {label}
              {badge && <Badge variant='destructive' className="ml-2">{badge}</Badge>}
              {beta && <Badge variant='destructive' className="ml-2">BETA</Badge>}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      {!isExpanded && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  )

  return (
    <TooltipProvider delayDuration={0}>
      <div className={`ml-7 mt-20 mr-5 text-white left-4 top-4 z-50 flex h-[calc(100vh-2rem)] flex-col gap-2 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
        <div className="outline outline-gray-800 rounded-lg bg-gray-900/95 px-2 py-3 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
          <div className="flex flex-col gap-2">
            {/* Profile Section */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                {!isExpanded && (
                  <div className="flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Avatar className="h-10 w-10 border-2 border-zinc-800">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>Nx</AvatarFallback>
                      </Avatar>
                    </Button>
                  </div>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                {isExpanded && (
                  <div className="px-2 flex items-center" onClick={() => setIsExpanded(false)}>
                    <Avatar className="h-10 w-10 border-2 border-zinc-800">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>Nx</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col ml-2">
                      <div className="text-sm font-medium text-white">
                        {user?.signInDetails?.loginId?.split('@')[0].toUpperCase()}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {user?.signInDetails?.loginId}
                      </div>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Main Navigation */}
            <div className="flex flex-col gap-6 mt-10">
              <NavItem icon={Key} label="Decrypt" />
              <NavItem icon={Search} label="Search" />
              <NavItem icon={Inbox} label="Inbox" badge={inboxCount} />
              <NavItem icon={Activity} label="Activity" badge={activityCount} />
            </div>

            {/* Personal Section */}
            {isExpanded && <div className="mt-10 px-4 text-xs text-zinc-500">Profile</div>}
            <div className="flex flex-col gap-4">
              <NavItem icon={Users} label="My Account" />
            </div>

            {/* Support Section */}
            {isExpanded && <div className="mt-10 px-4 text-xs text-zinc-500">Support</div>}
            <div className={`flex flex-col gap-4 ${isExpanded ? 'mt-10' : 'mt-10 pt-4'}`}>
              <NavItem icon={MessageSquare} label="Feedback" beta />
              <NavItem icon={HelpCircle} label="Help" />
              <NavItem icon={Settings} label="Settings" />
            </div>

            <div className="mt-auto flex flex-col gap-4">
              {/* Sign Out */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={`${isExpanded ? 'w-full' : ''} hover:bg-zinc-800/50`}>
                    <LogOut className="h-5 w-5 text-red-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-500">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Usage */}
            {isExpanded && (
              <div className="mt-2 space-y-2 border-t border-zinc-800 px-4 pt-4 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">15 inputs processed</span>
                  <span className="text-xs text-zinc-500"></span>
                </div>
                <div className="h-1 rounded-full bg-zinc-800">
                  <div className="h-1 w-1/3 rounded-full bg-blue-600" />
                </div>
                {/* <Button variant="ghost" className="w-full justify-center hover:bg-zinc-800/50">
                  Button
                </Button> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}