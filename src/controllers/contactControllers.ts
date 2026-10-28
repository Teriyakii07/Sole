import { useState, type FormEvent } from 'react'

export type ContactFormData = {
  fullName: string
  email: string
  category: string
  orderNum: string
  message: string
}

const initialForm: ContactFormData = {
  fullName: '', email: '', category: '', orderNum: '', message: '',
}

export function useContactController() {
  const [form, setForm] = useState<ContactFormData>(initialForm)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [notice, setNotice] = useState('')

  function updateField(field: keyof ContactFormData, value: string) {
    setForm(previous => ({ ...previous, [field]: value }))
    setNotice('')
  }

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // No backend is connected yet. Do not claim that the message was delivered.
    setNotice('Your message is ready, but sending is not connected yet. Please email support directly.')
  }

  function toggleFaq(index: number) {
    setOpenFaq(previous => previous === index ? null : index)
  }

  return { form, updateField, submitContact, openFaq, toggleFaq, notice }
}
