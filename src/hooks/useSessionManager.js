// src/hooks/useSessionManager.js

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useSessionManager = () => {
  const [session, setSession]         = useState(null);
  const [isGuest, setIsGuest]         = useState(false);
  const [perfilOso, setPerfilOso]     = useState(null);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [iaMode, setIaMode]           = useState('off');
  const [userCredits, setUserCredits] = useState({ tokensRestantes: 0, tokensTotales: 1 });
  const [sessionCP, setSessionCP]     = useState('');
  const [sessionCity, setSessionCity] = useState('');
  const [sessionRef, setSessionRef]   = useState('');

  // Auth subscription
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Own profile load
  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (prof) {
        setPerfilOso(prof);
        setSessionCity(prof.city || '');
        setIsAdmin(prof.is_admin === true);
        setUserCredits({ tokensRestantes: prof.lunas || 0, tokensTotales: 1000000 });
      }
    };
    load();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/';
  };

  const handleToggleAdminIA  = () => setIaMode(prev => prev === 'admin'  ? 'off' : 'admin');
  const handleTogglePublicIA = () => setIaMode(prev => prev === 'public' ? 'off' : 'public');

  return {
    session, isGuest, setIsGuest,
    perfilOso, setPerfilOso,
    isAdmin, iaMode, setIaMode,
    userCredits,
    sessionCP, setSessionCP,
    sessionCity, setSessionCity,
    sessionRef, setSessionRef,
    handleLogout,
    handleToggleAdminIA,
    handleTogglePublicIA,
  };
};
