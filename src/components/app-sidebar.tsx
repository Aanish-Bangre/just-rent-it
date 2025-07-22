import { useEffect, useState } from "react"
import { account } from "@/lib/appwrite"
import { useRouter } from "next/navigation"
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
import axios from "axios"
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export function AppSidebar() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        let ignore = false
        account.get()
            .then((user) => { if (!ignore) { setIsLoggedIn(true); setUser(user); } })
            .catch(() => { if (!ignore) { setIsLoggedIn(false); setUser(null); } })
        return () => { ignore = true }
    }, [])

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
                            <Link href="/items">
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
                    {isLoggedIn === null ? null : isLoggedIn ? (
                        <>
                            <Link href="/profile" className="block w-full">
                                <div className="flex items-center gap-3 bg-card rounded-lg px-4 py-3 shadow hover:bg-accent transition cursor-pointer">
                                    <Avatar>
                                        {user?.prefs?.avatarUrl ? (
                                            <AvatarImage src={user.prefs.avatarUrl} alt={user?.name || user?.email || "User"} />
                                        ) : (
                                            <AvatarFallback>{user?.name ? user.name[0] : user?.email?.[0] || "U"}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold truncate">{user?.name || "User"}</span>
                                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                                    </div>
                                    <span className="ml-auto text-muted-foreground">
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg>
                                    </span>
                                </div>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button asChild variant="secondary" size="sm" title="Login">
                                    <span className="flex items-center gap-2">
                                        <User />
                                        <span>Login</span>
                                    </span>
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button asChild variant="secondary" size="sm" title="Signup">
                                    <span className="flex items-center gap-2">
                                        <UserPlus />
                                        <span>Signup</span>
                                    </span>
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}