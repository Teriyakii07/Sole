
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Ticket,
  Star,
  Bell,
  ClipboardList,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

export type AdminTab =
  | 'Dashboard'
  | 'Orders'
  | 'Products'
  | 'Customers'
  | 'Discounts & Vouchers'
  | 'Reviews'
  | 'Notifications'
  | 'Audit Logs'

type AdminSidebarProps = {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
}

const menuGroups: {
  title: string
  items: {
    name: AdminTab
    icon: LucideIcon
  }[]
}[] = [
  {
    title: 'MAIN MENU',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard },
      { name: 'Orders', icon: ShoppingBag },
      { name: 'Products', icon: Package },
      { name: 'Customers', icon: Users },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'Discounts & Vouchers', icon: Ticket },
      { name: 'Reviews', icon: Star },
      { name: 'Notifications', icon: Bell },
      { name: 'Audit Logs', icon: ClipboardList },
    ],
  },
]

export default function AdminSidebar({
  activeTab,
  onTabChange,
}: AdminSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-gray-200 bg-white text-gray-800">

      {/* Logo */}
      <div className="flex h-20 items-center border-b border-gray-100 px-6">
        <h1 className="text-2xl font-extrabold tracking-wide text-[#123A8C]">
          SOLE<span className="text-[#D7192D]">.</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8 overflow-y-auto px-3 py-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-3 px-3 text-xs font-bold tracking-wider text-gray-400">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <button
                    key={item.name}
                    onClick={() => onTabChange(item.name)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-[13px] font-medium transition ${
                      isActive
                        ? 'bg-blue-50 text-[#123A8C]'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-[#123A8C]'
                    }`}
                  >
                    <Icon
                      size={18}
                      className="shrink-0"
                    />

                    <span className="whitespace-nowrap">
                      {item.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Profile */}
      <div className="border-t border-gray-100 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-[#F5F6F8] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123A8C] text-sm font-bold text-white">
            A
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              Admin
            </p>
            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            window.location.href = '/login'
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#D7192D] transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
