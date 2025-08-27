import { useLocation } from 'react-router-dom';
import { getRouteNameByPath } from '../config/routes';

export function useRouteName(): string {
  const location = useLocation();
  return getRouteNameByPath(location.pathname);
}