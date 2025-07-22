import { useAuthen } from '@/context/AuthenProvider';

/**
 * PublicRoute component for routes that are accessible to everyone
 * Can optionally redirect authenticated users away from auth-specific pages
 */
export default function PublicRoute({ children, redirectIfAuthenticated = false, redirectTo = '/' }) {
    const { user } = useAuthen();

    // If user is authenticated and we want to redirect them away
    if (user && redirectIfAuthenticated) {
        // This could be used for login/register pages where authenticated users shouldn't go
        // For now, we'll just render the children since we don't have dedicated auth pages
        return children;
    }

    // Always render children for public routes
    return children;
}
