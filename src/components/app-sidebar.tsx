import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Home, ShoppingBag, Calendar, MessageCircle, User, UserPlus } from "lucide-react"
import Link from "next/link"

export function AppSidebar() {
    return (
        <Sidebar className="invert">
            <SidebarHeader>
                <div className="flex items-center gap-3 px-3 py-4">
                    <span className="font-bold text-lg tracking-tight">JustRent-It</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/">
                                <SidebarMenuButton tooltip="Home">
                                    <Home />
                                    <span>Home</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/rent-items">
                                <SidebarMenuButton tooltip="Rent Items">
                                    <ShoppingBag />
                                    <span>Rent Items</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/booking">
                                <SidebarMenuButton tooltip="Booking">
                                    <Calendar />
                                    <span>Booking</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/chat">
                                <SidebarMenuButton tooltip="Chat">
                                    <MessageCircle />
                                    <span>Chat</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex justify-center w-full gap-2 pb-2">
                    <Link href="/login">
                        <SidebarMenuButton tooltip="Login">
                            <User />
                            <span>Login</span>
                        </SidebarMenuButton>
                    </Link>
                    <Link href="/signup">
                        <SidebarMenuButton tooltip="Signup">
                            <UserPlus />
                            <span>Signup</span>
                        </SidebarMenuButton>
                    </Link>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}