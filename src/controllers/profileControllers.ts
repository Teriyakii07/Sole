import { useState } from 'react'
import { useCartController } from './cartControllers'
import { emptyProfile, type Profile, type Favorite, type Order } from '../models/Profile'

export type ProfileTab = 'personal' | 'favorites' | 'orders' | 'cart'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

export function useProfileController() {
  const [tab, setTab] = useState<ProfileTab>('personal')
  const [profile, setProfile] = useState<Profile>(() => load('sole_profile', emptyProfile))
  const [draft, setDraft] = useState<Profile>(profile)
  const [favorites, setFavorites] = useState<Favorite[]>(() => load('sole_favorites', []))
  const [orders] = useState<Order[]>(() => load('sole_orders', []))
  const [saved, setSaved] = useState(false)
  const { cart, totalItems, subtotal } = useCartController()

  function changeField(field: keyof Profile, value: string) {
    setDraft(previous => ({ ...previous, [field]: value }))
    setSaved(false)
  }

  function saveProfile() {
    const updated = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
    }
    setProfile(updated)
    setDraft(updated)
    localStorage.setItem('sole_profile', JSON.stringify(updated))
    setSaved(true)
  }

  function resetProfile() {
    setDraft(profile)
    setSaved(false)
  }

  function removeFavorite(id: string) {
    const updated = favorites.filter(item => item.id !== id)
    setFavorites(updated)
    localStorage.setItem('sole_favorites', JSON.stringify(updated))
  }

  function selectTab(next: ProfileTab) {
    setTab(next)
    setSaved(false)
  }

  return {
    tab, selectTab, profile, draft, changeField, saveProfile, resetProfile,
    saved, favorites, removeFavorite, orders, cart, totalItems, subtotal,
  }
}
