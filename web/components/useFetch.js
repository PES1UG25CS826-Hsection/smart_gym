'use client';
import { useEffect, useState } from 'react';

export function useFetch(url) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then(async (r) => {
        if (r.status === 401) { window.location.assign('/login'); return; }
        const body = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok) setState({ data: null, error: body.error || 'Something went wrong', loading: false });
        else setState({ data: body, error: '', loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, error: 'Network error. Please try again.', loading: false });
      });
    return () => { cancelled = true; };
  }, [url]);
  return state;
}
