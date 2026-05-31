import { ClerkAuthScreen } from "@/components/auth/ClerkAuthScreen";

/**
 * Clerk sign-in route. Active only in Clerk mode; otherwise it shows the
 * local auth screen so the route never errors without Clerk keys.
 */
export default function ClerkSignInPage() {
  return <ClerkAuthScreen mode="sign-in" />;
}
