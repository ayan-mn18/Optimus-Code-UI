import { Navigate, useLocation } from 'react-router-dom';

export function legacyDsaDestination({ search, hash }: { search: string; hash: string }) {
  return { pathname: '/dsa', search, hash };
}

/** Keep old Browse all links and bookmarks working without losing a search. */
export function LegacyDsaRedirect() {
  const location = useLocation();
  return <Navigate to={legacyDsaDestination(location)} replace />;
}
