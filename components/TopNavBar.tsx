"use client"

import * as React from "react"
import { Bell, ChevronDown, Home, Key, LogOut, Moon, Package, Search, Settings, Shield } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuthenticator } from "@aws-amplify/ui-react"

export default function Component() {
  const [isSearchVisible, setIsSearchVisible] = React.useState(false)
  const { user, signOut } = useAuthenticator();

  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 top-4 z-50 w-[500px] sm:w-[650px] md:w-[900px] lg:w-[1000px] xl:w-[1200px] rounded-xl">
      <div className="rounded-lg bg-zinc-900/95 px-4 py-3 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-white border border-gray-200">
              <span className="text-xl font-bold">
                <Shield className="h-5 w-5 " />
              </span>
            </div>
            <span className="text-lg font-semibold text-white">NexCrypt</span>
          </div>
          
          <nav className="hidden md:flex md:gap-2">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-gray-900">
              <Shield className="mr-2 h-4 w-4" />
              Encrypt
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-gray-900">
              <Key className="mr-2 h-4 w-4" />
              Decrypt
            </Button>
          </nav>

          <div className="ml-auto flex items-center gap-4">

            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-gray-900">
              <Moon className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-gray-900">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-transparent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>Nx</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start text-left md:flex">
                    <span className="text-sm font-medium text-white">{user?.signInDetails?.loginId?.split('@')[0].toUpperCase()}</span>
                    <span className="text-xs text-zinc-400">{user?.signInDetails?.loginId}</span>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-zinc-400 md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <Button variant='ghost' onClick={signOut}>
                        <div className="flex flex-row items-center gap-1 font-bold">
                            <LogOut className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Sign Out</span>
                        </div>
                    </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}