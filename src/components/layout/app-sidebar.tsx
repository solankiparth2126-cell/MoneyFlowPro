"use client"

import { LayoutDashboard, ReceiptText, NotebookTabs, LogOut, Settings, Wallet, ShieldAlert, Users, CreditCard, PieChart, Lock, Database, Tag, Clock, PanelLeft, Target } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { usePermissions } from "@/hooks/use-permissions"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MenuItem {
  title: string
  icon: any
  url: string
  section: "CORE" | "ADMIN"
  page: any
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/", section: "CORE", page: "DASHBOARD" },
  { title: "Transactions", icon: ReceiptText, url: "/transactions", section: "CORE", page: "TRANSACTIONS" },
  { title: "Ledgers", icon: NotebookTabs, url: "/ledgers", section: "CORE", page: "LEDGERS" },
  { title: "Categories", icon: Tag, url: "/categories", section: "CORE", page: "CATEGORIES" },
  { title: "Budgets", icon: PieChart, url: "/budgets", section: "CORE", page: "BUDGETS" },
  { title: "Goals", icon: Target, url: "/goals", section: "CORE", page: "GOALS" },
  { title: "Recurring", icon: Clock, url: "/recurring", section: "CORE", page: "RECURRING" },
]

const adminItems: MenuItem[] = [
  { title: "Users", icon: Users, url: "/admin/users", section: "ADMIN", page: "USER_MANAGEMENT" },
  { title: "Access", icon: Lock, url: "/admin/access-control", section: "ADMIN", page: "ACCESS_CONTROL" },
  { title: "Masters", icon: Database, url: "/masters", section: "ADMIN", page: "MASTERS" },
  { title: "Audit", icon: ShieldAlert, url: "/admin/audit", section: "ADMIN", page: "SYSTEM_AUDIT" },
]

export function AppSidebar({ 
  isExpanded, 
  isMobileOpen = false, 
  toggle, 
  closeMobile 
}: { 
  isExpanded: boolean; 
  isMobileOpen?: boolean; 
  toggle: () => void; 
  closeMobile?: () => void; 
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { canView } = usePermissions()

  // Match the reference site's slim layout:
  // - Fixed left sidebar
  // - Icons only
  // - Simple purple active states
  
  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "h-screen bg-white flex flex-col py-6 shrink-0 z-50 transition-all duration-300 ease-in-out fixed lg:sticky top-0 left-0 border-r border-gray-100",
          isExpanded ? "w-[80px]" : "w-[80px]", // Keeping it slim like the reference
          !isMobileOpen ? "-translate-x-full lg:translate-x-0" : "translate-x-0 w-[80px] shadow-2xl"
        )}
      >
        {/* Branding Logo */}
        <div className="mb-10 px-3 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 w-full px-3 flex flex-col gap-4 overflow-y-auto no-scrollbar items-center">
          {menuItems.map((item) => {
            if (!canView(item.section, item.page)) return null
            const isActive = pathname === item.url
            return (
              <SidebarItem key={item.url} item={item} isActive={isActive} isExpanded={false} />
            )
          })}

          <div className="w-8 h-[1px] bg-gray-100 m-2" />

          {adminItems.map((item) => {
            if (!canView(item.section, item.page)) return null
            const isActive = pathname === item.url
            return (
              <SidebarItem key={item.url} item={item} isActive={isActive} isExpanded={false} />
            )
          })}
        </nav>

        {/* Footer section */}
        <div className="mt-auto px-3 flex flex-col gap-6 w-full items-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-indigo-600 flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
            {(user?.username || user?.name || "P").substring(0, 1).toUpperCase()}
          </div>

          <button 
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-gray-50 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}

function SidebarItem({ item, isActive, isExpanded, isDestructive = false }: { item: MenuItem; isActive: boolean; isExpanded: boolean; isDestructive?: boolean }) {
  const content = (
    <Link
      href={item.url}
      className={cn(
        "relative flex items-center justify-center rounded-xl transition-all duration-300 w-11 h-11",
          isActive 
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
            : "text-gray-400 hover:bg-gray-50 hover:text-indigo-600",
      )}
    >
      <item.icon className={cn("w-[18px] h-[18px] shrink-0")} />
      
      {isActive && (
        <motion.div
          layoutId="active-dot"
          className="absolute -right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full border-2 border-white shadow-sm"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        />
      )}
    </Link>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="bg-gray-900 text-white border-0 font-bold uppercase tracking-widest text-[10px] px-3 py-1.5">
        {item.title}
      </TooltipContent>
    </Tooltip>
  )
}