
import { useState } from 'react'
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  MoreHorizontal,
  ArrowUpRight,
} from 'lucide-react'

import AdminSidebar, {
  type AdminTab,
} from '../components/Admin/AdminSidebar'

import { useAdminController } from '../../controllers/adminController'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('Dashboard')

  const {
    stats,
    revenueData,
    salesStatus,
    products,
    orders,
  } = useAdminController()

  const statIcons = [
    ShoppingBag,
    TrendingUp,
    Users,
    Package,
  ]

  const statusColors = [
    'bg-[#123A8C]',
    'bg-[#F59E0B]',
    'bg-[#D7192D]',
    'bg-gray-300',
  ]

  return (
    <div className="min-h-screen bg-[#F5F6F8]">

      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="min-h-screen pl-56">

        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <p className="text-sm text-gray-400">
              Admin Console / {activeTab}
            </p>

            <h2 className="text-xl font-bold text-[#123A8C]">
              {activeTab}
              <span className="text-[#D7192D]">.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                Admin
              </p>
              <p className="text-xs text-gray-400">
                Administrator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123A8C] font-bold text-white">
              A
            </div>
          </div>
        </header>

        <div className="p-8">

          {activeTab === 'Dashboard' ? (
            <>
              {/* Dashboard Heading */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#123A8C]">
                  Dashboard{' '}
                  <span className="text-[#D7192D]">
                    Overview
                  </span>
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Welcome back! Here's what's happening with your store.
                </p>
              </div>

              {/* Statistics Cards */}
              <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat: any, index: number) => {
                  const Icon = statIcons[index % statIcons.length]

                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-blue-50 p-3 text-[#123A8C]">
                          <Icon size={22} />
                        </div>

                        <MoreHorizontal
                          className="text-gray-400"
                          size={20}
                        />
                      </div>

                      <p className="mt-4 text-sm text-gray-500">
                        {stat.title}
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-gray-800">
                        {stat.value}
                      </h3>

                      <p className="mt-2 text-xs font-medium text-[#D7192D]">
                        {stat.change}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Charts */}
              <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

                {/* Revenue Chart */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        Revenue Overview
                      </h3>

                      <p className="text-sm text-gray-400">
                        Monthly revenue performance
                      </p>
                    </div>

                    <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-[#123A8C] hover:text-[#123A8C]">
                      This Year
                    </button>
                  </div>

                  <div className="flex h-64 items-end justify-around gap-3 border-b border-gray-200 px-2">
                    {revenueData.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        <div
                          className="w-full max-w-10 rounded-t-md bg-[#123A8C] transition hover:bg-[#D7192D]"
                          style={{
                            height: `${item.value}%`,
                          }}
                        />

                        <span className="mb-2 text-xs text-gray-500">
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales Status */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800">
                    Sales Status
                  </h3>

                  <p className="mb-6 text-sm text-gray-400">
                    Orders by status
                  </p>

                  <div className="space-y-5">
                    {salesStatus.map((item: any, index: number) => (
                      <div key={index}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.label}
                          </span>

                          <span className="font-semibold text-gray-800">
                            {item.value}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${statusColors[index % statusColors.length]}`}
                            style={{
                              width: `${item.value}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products and Orders */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                {/* Top Products */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">
                      Top Products
                    </h3>

                    <button
                      onClick={() => setActiveTab('Products')}
                      className="flex items-center gap-1 text-sm font-medium text-[#123A8C] transition hover:text-[#D7192D]"
                    >
                      View all
                      <ArrowUpRight size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {products.map((product: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {product.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {product.category}
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-[#D7192D]">
                          {product.sales} sold
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">
                      Recent Orders
                    </h3>

                    <button
                      onClick={() => setActiveTab('Orders')}
                      className="flex items-center gap-1 text-sm font-medium text-[#123A8C] transition hover:text-[#D7192D]"
                    >
                      View all
                      <ArrowUpRight size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {orders.map((order: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {order.id}
                          </p>

                          <p className="text-xs text-gray-400">
                            {order.customer}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">
                            {order.total}
                          </p>

                          <span className="text-xs font-medium text-[#D7192D]">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Other Tabs */
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-[#123A8C]">
                {activeTab}
                <span className="text-[#D7192D]">.</span>
              </h1>

              <p className="mt-2 text-gray-500">
                Manage your store's {activeTab.toLowerCase()} here.
              </p>

              <div className="mt-8 rounded-lg bg-[#F5F6F8] p-6 text-center">
                <p className="font-semibold text-[#123A8C]">
                  {activeTab} Section
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  This section is ready for its content and functionality.
                </p>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  )
}
