export interface Profile {
  id: string 
  first_name: string
  last_name:string
  email: string
  phone_number: string
}

export interface Address {
  id: string
  user_id: string
  recipient_name: string
  phone_number:string
  address_line: string;
  address_line_2: string;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at?: string;
}

export type AddressFormData = Omit<Address, 'id' | 'user_id' | 'created_at'>;

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
  id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
}

export const emptyAddress: AddressFormData = {
  recipient_name: '',
  phone_number: '',
  address_line: '',
  address_line_2: '',
  barangay: '',
  city: '',
  province: '',
  postal_code: '',
  country: 'Philippines',
  is_default: false,
};
