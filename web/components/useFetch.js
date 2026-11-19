'use client';
import { useEffect, useState } from 'react';

export function useFetch(url) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok) setState({ data: null, error: body.error || 'Request failed', loading: false });
        else setState({ data: body, error: '', loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, error: 'Network error', loading: false });
      });
    return () => { cancelled = true; };
  }, [url]);
  return state;
}
