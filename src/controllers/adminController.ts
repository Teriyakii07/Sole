
export interface DashboardOrder {
  id: number
  customer: string
  product: string
  amount: number
  status: 'Paid' | 'Shipped' | 'Processing' | 'Pending'
}

export interface DashboardProduct {
  id: number
  name: string
  units: number
  revenue: number
}

export function useAdminController() {
  const stats = [
    {
      title: 'TOTAL REVENUE',
      value: '₱47,383',
      change: 'Vs previous period',
    },
    {
      title: 'TOTAL ORDERS',
      value: '200',
      change: 'Vs previous period',
    },
    {
      title: 'ACTIVE CUSTOMERS',
      value: '13',
      change: 'Vs previous period',
    },
    {
      title: 'UNITS SOLD',
      value: '110',
      change: 'Vs previous period',
    },
  ]

  const revenueData = [
    { week: 'W1', value: 65 },
    { week: 'W2', value: 100 },
    { week: 'W3', value: 75 },
    { week: 'W4', value: 105 },
    { week: 'W5', value: 48 },
    { week: 'W6', value: 85 },
  ]

  const salesStatus = [
    { name: 'Delivered', percentage: 52.1 },
    { name: 'Shipped', percentage: 22.8 },
    { name: 'Processing', percentage: 13.9 },
    { name: 'Pending', percentage: 11.2 },
  ]

  const products: DashboardProduct[] = [
    { id: 1, name: 'Air Jordan Legacy', units: 186, revenue: 942 },
    { id: 2, name: 'Air Zoom Pulse', units: 142, revenue: 881 },
    { id: 3, name: 'Air Jordan Flow', units: 118, revenue: 409 },
    { id: 4, name: 'Superstar Street', units: 97, revenue: 953 },
    { id: 5, name: 'Messi', units: 87, revenue: 907 },
  ]

  const orders: DashboardOrder[] = [
    {
      id: 10234,
      customer: 'Jether Aguatani',
      product: 'Air Jordan Legacy x1',
      amount: 7383,
      status: 'Paid',
    },
    {
      id: 10235,
      customer: 'Jether Aguatani',
      product: 'Air Zoom Pulse x1',
      amount: 2383,
      status: 'Shipped',
    },
    {
      id: 10236,
      customer: 'Jether Aguatani',
      product: 'Air Jordan Flow x1',
      amount: 3383,
      status: 'Processing',
    },
    {
      id: 10237,
      customer: 'Jether Aguatani',
      product: 'Superstar Street x1',
      amount: 1383,
      status: 'Paid',
    },
    {
      id: 10238,
      customer: 'Jether Aguatani',
      product: 'Messi x1',
      amount: 2383,
      status: 'Paid',
    },
  ]

  return {
    stats,
    revenueData,
    salesStatus,
    products,
    orders,
  }
}
