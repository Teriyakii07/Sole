
import { Link, useNavigate } from 'react-router-dom';
import { type ProfileTab, useProfileController } from '../../controllers/profileControllers';
import { formatPrice } from '../../models/Cart';
import { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import type { Profile as ProfileData, Address, AddressFormData } from '../../models/Profile';
import { handleLogout } from '../../controllers/authController';
import { useFavorites } from '../../context/Favoritescontext';
import ProductCard from '../components/Home/ProductCard';
import { CartItemView } from '../components/Cart/CartItemView';

const inputClass = 'w-full min-w-0 rounded-lg border border-[#DDE1E7] bg-white px-3 py-3 text-xs outline-none focus:border-[#123A8C] focus:ring-2 focus:ring-blue-100';
const primaryClass = 'inline-flex min-h-11 items-center justify-center rounded-lg bg-[#123A8C] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#0D2D70]';

function Icon({ name, size = 21 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    package: <><path d="m3 7 9-4 9 4v10l-9 4-9-4Z"/><path d="m3 7 9 4 9-4M12 11v10"/></>,
    bag: <><rect x="3" y="7" width="18" height="15" rx="2"/><path d="M7 7V6a5 5 0 0 1 10 0v1"/></>,
    shield: <><path d="m12 2 9 4v6c0 5-3.5 8.5-9 10-5.5-1.5-9-5-9-10V6Z"/><path d="m8 12 3 3 5-6"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
    save: <><path d="M4 3h14l3 3v15H3V3Z"/><path d="M7 3v7h10V3M7 21v-8h10v8"/></>,
    check: <><circle cx="12" cy="12" r="10"/><path d="m7 12 3 3 7-7"/></>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const tabs: { id: ProfileTab; label: string; icon: string }[] = [
  { id: 'personal', label: 'Personal Information', icon: 'user' },
  { id: 'favorites', label: 'My Favorites', icon: 'heart' },
  { id: 'orders', label: 'Order History', icon: 'package' },
  { id: 'cart', label: 'Shopping Cart', icon: 'bag' },
];

function EmptyState({ icon, title, message, action }: { icon: string; title: string; message: string; action: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 py-9 text-center">
      <div className="mb-5 flex h-[78px] w-[78px] items-center justify-center rounded-3xl bg-[#EEF3FC] text-[#123A8C]">
        <Icon name={icon} size={35}/>
      </div>
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="mb-5 max-w-[330px] text-xs leading-6 text-[#666]">{message}</p>
      <Link to="/shop" className={primaryClass}>{action}</Link>
    </div>
  );
}

function PersonalInformation({
  profile,
  addresses,
  savingProfile,
  savingAddress,
  message,
  error,
  saveProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
}: {
  profile: ProfileData;
  addresses: Address[];
  savingProfile: boolean;
  savingAddress: boolean;
  message: string;
  error: string;
  saveProfile: (profile: ProfileData) => Promise<void>;
  addAddress: (address: AddressFormData) => Promise<boolean>;
  updateAddress: (id: string, address: AddressFormData) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}) {
  const [personalDraft, setPersonalDraft] = useState(profile);
  const [editingPersonal, setEditingPersonal] = useState(false);

  const [addressDraft, setAddressDraft] = useState<AddressFormData>({
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
  });

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    setPersonalDraft(profile);
  }, [profile]);

  function updatePersonalField(field: keyof ProfileData, value: string) {
    setPersonalDraft(previous => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateAddressField(field: keyof AddressFormData, value: string | boolean) {
    setAddressDraft(previous => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handlePersonalSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await saveProfile(personalDraft);
    setEditingPersonal(false);
  }

  function startAddAddress() {
    setAddressDraft({
      recipient_name: '',
      phone_number: '',
      address_line: '',
      address_line_2: '',
      barangay: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'Philippines',
      is_default: addresses.length === 0,
    });

    setEditingAddressId(null);
    setShowAddressForm(true);
  }

  function startEditAddress(address: Address) {
    setAddressDraft({
      recipient_name: address.recipient_name,
      phone_number: address.phone_number,
      address_line: address.address_line,
      address_line_2: address.address_line_2 ?? '',
      barangay: address.barangay,
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });

    setEditingAddressId(address.id);
    setShowAddressForm(true);
  }

  async function handleAddressSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const requiredFields: (keyof AddressFormData)[] = [
      'recipient_name',
      'phone_number',
      'address_line',
      'barangay',
      'city',
      'province',
      'postal_code',
      'country',
    ];

    const missingField = requiredFields.some(field => {
      const value = addressDraft[field];
      return typeof value !== 'string' || !value.trim();
    });

    if (missingField) {
      alert('Please complete all required address fields.');
      return;
    }

    let success: boolean;

    if (editingAddressId) {
      success = await updateAddress(editingAddressId, addressDraft);
    } else {
      success = await addAddress(addressDraft);
    }

    if (success) {
      setShowAddressForm(false);
      setEditingAddressId(null);
    }
  }

  return (
    <div className="space-y-9">
      {/* Personal information */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-bold text-[#123A8C]">Personal Information</h3>
            <p className="mt-1 text-xs text-[#666]">Manage your name and account contact details.</p>
          </div>

          {!editingPersonal && (
            <button
              type="button"
              onClick={() => setEditingPersonal(true)}
              className="rounded-lg border border-[#123A8C] px-4 py-2 text-xs font-bold text-[#123A8C] hover:bg-[#EEF3FC]"
            >
              Edit Information
            </button>
          )}
        </div>

        <form onSubmit={handlePersonalSave}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold">First Name</label>
              <input className={inputClass} value={personalDraft.first_name} onChange={e => updatePersonalField('first_name', e.target.value)} disabled={!editingPersonal} required/>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold">Last Name</label>
              <input className={inputClass} value={personalDraft.last_name} onChange={e => updatePersonalField('last_name', e.target.value)} disabled={!editingPersonal} required/>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold">Email Address</label>
              <input type="email" className={inputClass} value={personalDraft.email} onChange={e => updatePersonalField('email', e.target.value)} disabled={!editingPersonal} required/>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold">Phone Number</label>
              <input type="tel" className={inputClass} value={personalDraft.phone_number} onChange={e => updatePersonalField('phone_number', e.target.value)} disabled={!editingPersonal} placeholder="09XXXXXXXXX" required/>
            </div>
          </div>

          {editingPersonal && (
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => { setPersonalDraft(profile); setEditingPersonal(false); }} className="rounded-lg border border-[#DDE1E7] px-5 py-3 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={savingProfile} className={primaryClass}>
                {savingProfile ? 'Saving...' : 'Save Information'}
              </button>
            </div>
          )}
        </form>
      </section>

      <div className="border-t border-[#E5E7EB]"/>

      {/* Delivery addresses */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-bold text-[#123A8C]">Delivery Addresses</h3>
            <p className="mt-1 text-xs text-[#666]">Manage the addresses where you receive your orders.</p>
          </div>

          {!showAddressForm && (
            <button type="button" onClick={startAddAddress} className={primaryClass}>
              + Add Address
            </button>
          )}
        </div>

        {showAddressForm && (
          <form onSubmit={handleAddressSave} className="mb-6 rounded-xl border border-[#DDE1E7] bg-[#F9FAFC] p-4 sm:p-5">
            <h4 className="mb-5 text-sm font-bold">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h4>

            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ['recipient_name', 'Recipient Name', 'Full name of recipient'],
                ['phone_number', 'Recipient Phone Number', '09XXXXXXXXX'],
                ['address_line', 'House Number / Building / Street', 'House number, building, street'],
                ['address_line_2', 'Additional Address Details (Optional)', 'Apartment, unit, landmark'],
                ['barangay', 'Barangay', 'Enter barangay'],
                ['city', 'City / Municipality', 'Enter city or municipality'],
                ['province', 'Province', 'Enter province'],
                ['postal_code', 'Postal Code', 'Enter postal code'],
                ['country', 'Country', 'Enter country'],
              ] as const).map(([field, label, placeholder]) => (
                <div key={field} className={field === 'address_line' || field === 'address_line_2' ? 'sm:col-span-2' : ''}>
                  <label className="mb-2 block text-xs font-bold">
                    {label}
                    {field === 'address_line_2' && <span className="ml-1 font-normal text-[#888]">Optional</span>}
                  </label>
                  <input
                    className={inputClass}
                    value={addressDraft[field]}
                    onChange={e => updateAddressField(field, e.target.value)}
                    placeholder={placeholder}
                    required={field !== 'address_line_2'}
                  />
                </div>
              ))}
            </div>

            <label className="mt-5 flex items-center gap-2 text-xs font-semibold">
              <input type="checkbox" checked={addressDraft.is_default} onChange={e => updateAddressField('is_default', e.target.checked)} className="h-4 w-4 accent-[#123A8C]"/>
              Set as my default delivery address
            </label>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setShowAddressForm(false)} className="rounded-lg border border-[#DDE1E7] px-5 py-3 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={savingAddress} className={primaryClass}>
                {savingAddress ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        )}

        {addresses.length === 0 && !showAddressForm && (
          <div className="rounded-xl border border-dashed border-[#DDE1E7] px-4 py-10 text-center">
            <p className="text-sm font-bold">No delivery addresses yet</p>
            <p className="mt-2 text-xs text-[#666]">Add an address to make checkout easier.</p>
          </div>
        )}

        <div className="space-y-4">
          {addresses.map(address => (
            <article key={address.id} className="rounded-xl border border-[#E5E7EB] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="break-words text-sm font-bold">{address.recipient_name}</h4>
                    {address.is_default && (
                      <span className="rounded-full bg-[#EEF3FC] px-3 py-1 text-[10px] font-bold text-[#123A8C]">DEFAULT</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-[#555]">{address.phone_number}</p>
                  <p className="mt-2 break-words text-xs leading-6 text-[#666]">
                    {address.address_line}
                    {address.address_line_2 && `, ${address.address_line_2}`}
                    {`, Barangay ${address.barangay}, ${address.city}, ${address.province}, ${address.postal_code}, ${address.country}`}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button type="button" onClick={() => startEditAddress(address)} className="rounded-lg border border-[#DDE1E7] px-3 py-2 text-xs font-bold hover:bg-gray-50">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this delivery address?')) {
                        void deleteAddress(address.id);
                      }
                    }}
                    className="rounded-lg border border-[#F2C8CC] px-3 py-2 text-xs font-bold text-[#D7192D] hover:bg-[#FFF0F1]"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {!address.is_default && (
                <button type="button" onClick={() => void setDefaultAddress(address.id)} className="mt-4 text-xs font-bold text-[#123A8C] hover:underline">
                  Set as Default Address
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {message && <p role="status" className="rounded-lg bg-[#ECF8F0] p-3 text-xs text-[#176534]">{message}</p>}
      {error && <p role="alert" className="rounded-lg bg-[#FFF0F1] p-3 text-xs text-[#B42332]">{error}</p>}
    </div>
  );
}

export default function Profile() {
  const c = useProfileController();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const onLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const result = await handleLogout();

      if (!result.success) {
        setLogoutError(result.message || 'Unable to log out. Please try again.');
        return;
      }

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError('Something went wrong while logging out.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const count: Record<ProfileTab, number | null> = {
    personal: null,
    favorites: c.favorites.length,
    orders: c.orders.length,
    cart: c.totalItems,
  };

  const active = tabs.find(t => t.id === c.tab)!;

  const descriptions: Record<ProfileTab, string> = {
    personal: 'Update your contact details and delivery address.',
    favorites: 'Your saved sneakers, all in one place.',
    orders: 'View your previous purchases and order status.',
    cart: 'Review the sneakers you are planning to buy.',
  };

  return (
    <main className="min-h-[75vh] bg-[#F3F4F6] py-8 text-[#111] sm:py-12">
      <div className="mx-auto w-[92%] max-w-[1180px]">
        <header className="mb-8">
          <p className="mb-1 text-[11px] font-extrabold tracking-[2px] text-[#D7192D]">YOUR ACCOUNT</p>
          <h1 className="font-montserrat text-[30px] font-extrabold tracking-tight sm:text-[38px]">My Profile</h1>
          <p className="mt-2 text-sm text-[#666]">Manage your personal information, favorites, and orders.</p>
        </header>

        <div className="grid items-start gap-5 md:grid-cols-[235px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          <aside className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm lg:p-5">
            <div className="flex min-w-0 items-center gap-3 border-b border-gray-200 px-1 pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#123A8C] text-white">
                <Icon name="user" size={24}/>
              </div>
              <div className="min-w-0">
                <h2 className="break-words text-sm font-bold">{`${c.profile.first_name} ${c.profile.last_name}`.trim() || 'Welcome!'}</h2>
                <p className="break-words text-[11px] text-[#666]">{c.profile.email || 'Your SOLE. account'}</p>
              </div>
            </div>

            <p className="mb-3 mt-6 px-2 text-[10px] font-extrabold tracking-[1.4px] text-[#888]">ACCOUNT MENU</p>

            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col" aria-label="Account menu">
              {tabs.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => c.selectTab(t.id)}
                  className={`relative flex min-h-[52px] min-w-0 items-center gap-2 rounded-[10px] px-2 py-3 text-left text-[11px] font-semibold transition lg:gap-3 lg:px-3 lg:text-xs ${c.tab === t.id ? 'bg-[#EEF3FC] font-bold text-[#123A8C] before:absolute before:bottom-3 before:left-0 before:top-3 before:w-[3px] before:rounded-r before:bg-[#D7192D]' : 'text-[#555] hover:bg-[#F5F7FC] hover:text-[#123A8C]'}`}
                >
                  <span className="shrink-0"><Icon name={t.icon} size={18}/></span>
                  <span className="min-w-0 flex-1">{t.label}</span>
                  {count[t.id] !== null && (
                    <span className={`flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-full px-1 text-[10px] ${c.tab === t.id ? 'bg-[#123A8C] text-white' : 'bg-[#ECEFF4] text-[#555]'}`}>
                      {count[t.id]}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-7 flex gap-3 rounded-xl border border-[#EDF0F4] bg-[#F7F8FA] p-3">
              <span className="shrink-0 text-[#123A8C]"><Icon name="shield" size={20}/></span>
              <div>
                <strong className="text-[11px]">Your account, your way.</strong>
                <p className="mt-1 text-[10px] leading-5 text-[#666]">Keep your information updated for a smoother shopping experience.</p>
              </div>
            </div>

            {/* Logout */}
            <div className="mt-5 border-t border-[#E5E7EB] pt-5">
              {logoutError && (
                <p role="alert" className="mb-3 rounded-lg bg-[#FFF0F1] p-3 text-xs text-[#B42332]">{logoutError}</p>
              )}
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="flex min-h-[46px] w-full items-center gap-3 rounded-xl border border-[#F2C8CC] px-4 py-3 text-xs font-bold text-[#D7192D] transition hover:bg-[#FFF0F1] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="logout" size={19}/>
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </aside>

          <section className="min-h-[470px] min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6 lg:p-[30px]">
            {c.loading ? (
              <div className="flex min-h-[300px] items-center justify-center text-sm text-[#666]">
                Loading your profile...
              </div>
            ) : (
              <>
                {c.saved && c.tab === 'personal' && (
                  <div role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-[#CDEBD6] bg-[#ECF8F0] p-3 text-xs font-semibold text-[#176534]">
                    <Icon name="check" size={18}/>
                    Your personal information has been updated.
                  </div>
                )}

                {/* TAB HEADING */}
                <div className="mb-6 flex items-center gap-3 border-b border-[#E5E7EB] pb-6">
                  <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-[#EEF3FC] text-[#123A8C]">
                    <Icon name={active.icon}/>
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-montserrat text-lg font-bold">{active.label}</h2>
                    <p className="mt-1 text-xs text-[#666]">{descriptions[c.tab]}</p>
                  </div>
                </div>

                {/* PERSONAL INFORMATION */}
                {c.tab === 'personal' && (
                  <PersonalInformation
                    profile={c.profile}
                    addresses={c.addresses}
                    savingProfile={c.savingProfile}
                    savingAddress={c.savingAddress}
                    message={c.message}
                    error={c.error}
                    saveProfile={c.saveProfile}
                    addAddress={c.addAddress}
                    updateAddress={c.updateAddress}
                    deleteAddress={c.deleteAddress}
                    setDefaultAddress={c.setDefaultAddress}
                  />
                )}

                {/* FAVORITES */}
                {c.tab === 'favorites' && (
                  c.favorites.length === 0 ? (
                    <EmptyState
                      icon="heart"
                      title="No favorites yet"
                      message="Save the sneakers you love so you can find them easily later."
                      action="Explore Sneakers"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                      {c.favorites.map(f => (
                        <article
                          key={f.id}
                          onClick={() => navigate(`/product/${f.id}`)}
                          className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 transition hover:-translate-y-1 hover:shadow-md"
                        >
                          <div className="flex h-[130px] items-center justify-center bg-[#F7F8FA] p-3 sm:h-[175px]">
                            {f.image ? (
                              <img src={f.image} alt={f.name} className="h-full w-full object-contain"/>
                            ) : (
                              <Icon name="bag" size={35}/>
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="break-words text-xs font-bold">{f.name}</h3>
                            <p className="mt-2 text-sm font-extrabold text-[#D7192D]">{formatPrice(f.price)}</p>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                c.removeFavorite(f.id);
                              }}
                              className="mt-4 w-full rounded-lg bg-[#FFF0F1] py-3 text-xs font-bold text-[#D7192D] hover:bg-[#FFE1E4]"
                            >
                              Remove
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )
                )}

                {/* ORDERS */}
                {c.tab === 'orders' && (
                  c.orders.length === 0 ? (
                    <EmptyState icon="package" title="No orders yet" message="Your completed and ongoing orders will appear here." action="Start Shopping"/>
                  ) : (
                    <div className="space-y-3">
                      {c.orders.map(o => (
                        <article key={o.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 p-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FC] text-[#123A8C]"><Icon name="package"/></div>
                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-sm font-bold">Order #{o.id}</h3>
                            <p className="mt-1 text-xs text-[#666]">Date: {o.date}</p>
                            <p className="mt-1 text-xs font-bold">Total: {formatPrice(o.total)}</p>
                          </div>
                          <span className="rounded-full bg-[#EAF6EE] px-3 py-2 text-[10px] font-bold text-[#247440]">{o.status || 'Processing'}</span>
                        </article>
                      ))}
                    </div>
                  )
                )}

                {/* CART */}
                {c.tab === 'cart' && (
                  c.cart.length === 0 ? (
                    <EmptyState icon="bag" title="Your cart is empty" message="Find your next favorite pair and add it to your cart." action="Browse Sneakers"/>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {c.cart.map(item => (
                          <article key={item.id} className="flex min-w-0 items-center gap-4 rounded-xl border border-gray-200 p-3">
                            <img src={item.image} alt={item.name} className="h-[70px] w-[70px] shrink-0 rounded-lg bg-[#F7F8FA] object-contain sm:h-[85px] sm:w-[85px]"/>
                            <div className="min-w-0">
                              <h3 className="break-words text-[13px] font-bold">{item.name}</h3>
                              <p className="mt-1 text-xs text-[#666]">Quantity: {item.quantity}</p>
                              <strong className="mt-1 block text-[13px] text-[#D7192D]">{formatPrice(item.price * item.quantity)}</strong>
                            </div>
                          </article>
                        ))}
                      </div>
                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-5">
                        <span className="text-sm text-[#666]">Estimated Total</span>
                        <strong className="font-montserrat text-xl text-[#D7192D]">{formatPrice(c.subtotal)}</strong>
                      </div>
                      <Link to="/cart" className={`${primaryClass} mt-5 flex w-full gap-2`}>
                        View Full Cart <Icon name="arrow" size={17}/>
                      </Link>
                    </>
                  )
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
