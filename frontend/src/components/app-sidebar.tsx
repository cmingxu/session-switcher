import { useContext, useEffect } from "react"
import { AppContext } from "@/contexts/appContext"
import * as React from "react"
import { ArchiveX, Command, File, Inbox, Send, Trash2 } from "lucide-react"
import { useLocation } from "react-router"
import { CreateSession, GetSessions } from "../../wailsjs/go/main/App"

import { NavUser } from "@/components/nav-user"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { CirclePlus } from "lucide-react"

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "账号",
      url: "/account",
      icon: Inbox,
      isActive: true,
    },
    {
      title: "私信",
      url: "/message",
      icon: File,
      isActive: false,
    },
    {
      title: "发布",
      url: "/upload",
      icon: Send,
      isActive: false,
    },
  ],
  sessions: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
  const { setOpen } = useSidebar()
  const {sessions, currentSession, setCurrentSession, setSessions } = useContext(AppContext)
  const location = useLocation()

  useEffect(() => {
    const fetchSessions = async () => {
      setSessions(await GetSessions())
    }

    fetchSessions()
  }, [])

  const createNewSession = async () => {
    setCurrentSession(await CreateSession())
    setSessions(await GetSessions())
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setOpen(true)
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
        <Sidebar collapsible="none" className="hidden flex-1 md:flex">
          <SidebarHeader className="gap-3.5 border-b p-4">
            <div className="flex w-full items-center justify-between">
              <div className="text-foreground text-base font-medium">
                {activeItem?.title}
              </div>
              <Label className="flex items-center gap-2 text-sm">
                共 <span>{sessions?.length || 0}</span> 个
              </Label>
            </div>
            <SidebarInput placeholder="搜索..." />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="px-4">
              <SidebarGroupContent>
                <Button className="justify-center text-sm cursor-pointer w-full" 
                  variant="outline"
                  onClick={ createNewSession }>
                  新账号 <CirclePlus className="mr-2 size-4" />
                </Button>

                {sessions.map((sess) => ( <a onClick={() => { setCurrentSession(sess)}} key={sess.uid} 
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0" >
                  <div className="flex w-full items-center gap-2">
                    <span>{sess.name}</span>{" "}
                    <span className="ml-auto text-xs">{sess.uid}</span>
                  </div>
                  <span className="font-medium">{sess.icon}</span>
                </a>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
    </Sidebar>
  )
}
