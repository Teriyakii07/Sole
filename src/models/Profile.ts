export interface Profile {
  name: string
  email: string
  phone: string
  address: string
}

export interface Favorite {
  id: string
  name: string
  price: number
  image?: string
}

export interface Order {
  id: string
  date: string
  total: number
  status: string
}

export const emptyProfile: Profile = {
  name: '', email: '', phone: '', address: ''
}
