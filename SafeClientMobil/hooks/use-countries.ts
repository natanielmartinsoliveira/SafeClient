import { useState, useEffect, useRef } from 'react';

export interface Country {
  code: string;   // cca2 ex: "BR"
  dialCode: string; // ex: "+55"
  flag: string;   // emoji ex: "🇧🇷"
  name: string;   // ex: "Brazil"
}

// Cache em memória — só busca uma vez por sessão
let cache: Country[] | null = null;

function parseDialCode(idd: { root?: string; suffixes?: string[] }): string | null {
  if (!idd?.root) return null;
  const suffix = idd.suffixes?.length === 1 ? idd.suffixes[0] : '';
  const code = `${idd.root}${suffix}`;
  // Ignora códigos incompletos (ex: "+1" com múltiplos suffixes fica só "+1")
  return code.replace(/[^+\d]/g, '') || null;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (cache || fetchedRef.current) return;
    fetchedRef.current = true;

    fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2,flag')
      .then((r) => r.json())
      .then((data: any[]) => {
        const parsed: Country[] = data
          .map((c) => ({
            code: c.cca2,
            dialCode: parseDialCode(c.idd) ?? '',
            flag: c.flag ?? '',
            name: c.name?.common ?? c.cca2,
          }))
          .filter((c) => c.dialCode)
          .sort((a, b) => a.name.localeCompare(b.name));

        cache = parsed;
        setCountries(parsed);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return { countries, loading, error };
}
