import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCartController } from './cartControllers';
import {
  emptyProfile,
  emptyAddress,
  type Profile,
  type Address,
  type AddressFormData,
  type Favorite,
  type Order,
} from '../models/Profile';

export type ProfileTab = 'personal' | 'favorites' | 'orders' | 'cart';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useProfileController() {
  const [tab, setTab] = useState<ProfileTab>('personal');

  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [favorites, setFavorites] = useState<Favorite[]>(() =>
    load('sole_favorites', [])
  );

  const [orders] = useState<Order[]>(() => load('sole_orders', []));

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { cart, totalItems, subtotal } = useCartController();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('Please log in to view your profile.');

      const [profileResult, addressResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, phone_number')
          .eq('id', user.id)
          .single(),

        supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false }),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (addressResult.error) throw addressResult.error;

      setProfile({
        id: user.id,
        first_name: profileResult.data.first_name ?? '',
        last_name: profileResult.data.last_name ?? '',
        phone_number: profileResult.data.phone_number ?? '',
        email: user.email ?? '',
      });

      setAddresses(addressResult.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load your profile.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function saveProfile(updated: Profile) {
    setSavingProfile(true);
    setError('');
    setMessage('');
    setSaved(false);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('You must be logged in.');

      const firstName = updated.first_name.trim();
      const lastName = updated.last_name.trim();
      const phone = updated.phone_number.trim();
      const email = updated.email.trim().toLowerCase();

      if (!firstName || !lastName || !email || !phone) {
        throw new Error('Please complete all personal information fields.');
      }

      // Update the public profile information.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Email is managed by Supabase Auth, not the profiles table.
      if (email !== (user.email ?? '').toLowerCase()) {
        const { error: emailError } = await supabase.auth.updateUser({
          email,
        });

        if (emailError) throw emailError;

        setMessage(
          'Your profile was saved. Check your new email address for a confirmation link to complete the email change.'
        );
      } else {
        setMessage('Your personal information has been updated.');
      }

      setProfile({
        ...updated,
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        email,
      });

      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to save your profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function addAddress(data: AddressFormData) {
    setSavingAddress(true);
    setError('');
    setMessage('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('You must be logged in.');

      const hasDefault = addresses.some(address => address.is_default);
      const shouldBeDefault = data.is_default || !hasDefault;

      // If this address is the new default, clear the previous default first.
      if (shouldBeDefault) {
        const { error: defaultError } = await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);

        if (defaultError) throw defaultError;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('addresses')
        .insert({
          ...data,
          user_id: user.id,
          is_default: shouldBeDefault,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setAddresses(previous => [
        inserted,
        ...previous.map(address => ({
          ...address,
          is_default: shouldBeDefault ? false : address.is_default,
        })),
      ]);

      setMessage('Delivery address added successfully.');
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to add address.'
      );
      return false;
    } finally {
      setSavingAddress(false);
    }
  }

  async function updateAddress(id: string, data: AddressFormData) {
    setSavingAddress(true);
    setError('');
    setMessage('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('You must be logged in.');

      if (data.is_default) {
        const { error: defaultError } = await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);

        if (defaultError) throw defaultError;
      }

      const { data: updated, error: updateError } = await supabase
        .from('addresses')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setAddresses(previous =>
        previous.map(address => {
          if (address.id === id) return updated;

          return {
            ...address,
            is_default: data.is_default ? false : address.is_default,
          };
        })
      );

      setMessage('Delivery address updated successfully.');
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update address.'
      );
      return false;
    } finally {
      setSavingAddress(false);
    }
  }

  async function deleteAddress(id: string) {
    setError('');
    setMessage('');

    try {
      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      const deleted = addresses.find(address => address.id === id);
      const remaining = addresses.filter(address => address.id !== id);

      setAddresses(remaining);

      // If the deleted address was the default, make another address default.
      if (deleted?.is_default && remaining.length > 0) {
        await setDefaultAddress(remaining[0].id);
      } else {
        setMessage('Delivery address deleted successfully.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to delete address.'
      );
    }
  }

  async function setDefaultAddress(id: string) {
    setError('');
    setMessage('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('You must be logged in.');

      const { error: clearError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      if (clearError) throw clearError;

      const { error: setErrorResult } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (setErrorResult) throw setErrorResult;

      setAddresses(previous =>
        previous.map(address => ({
          ...address,
          is_default: address.id === id,
        }))
      );

      setMessage('Default delivery address updated.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to set default address.'
      );
    }
  }

  function removeFavorite(id: string) {
    const updated = favorites.filter(item => item.id !== id);
    setFavorites(updated);
    localStorage.setItem('sole_favorites', JSON.stringify(updated));
  }

  function selectTab(next: ProfileTab) {
    setTab(next);
    setSaved(false);
    setError('');
    setMessage('');
  }

  return {
    tab,
    selectTab,
    profile,
    addresses,
    loading,
    savingProfile,
    savingAddress,
    saved,
    error,
    message,
    loadProfile,
    saveProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    emptyAddress,
    favorites,
    removeFavorite,
    orders,
    cart,
    totalItems,
    subtotal,
  };
}