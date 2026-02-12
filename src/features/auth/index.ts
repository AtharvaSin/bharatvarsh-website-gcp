// Auth feature -- public API
export { SignInButton } from './components/sign-in-button';
export { SignOutButton } from './components/sign-out-button';
export { AuthGuard } from './components/auth-guard';
export { RoleGate } from './components/role-gate';
export { UserMenu } from './components/user-menu';
export { useSession } from './hooks/use-session';
export {
  hasRequiredRole,
  type SessionUser,
  type AuthSession,
  type RequiredRole,
} from './types';
