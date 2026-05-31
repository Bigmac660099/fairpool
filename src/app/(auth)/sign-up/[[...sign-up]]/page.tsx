import { ClerkAuthScreen } from "@/components/auth/ClerkAuthScreen";

/**
 * Clerk sign-up route. Active only in Clerk mode; otherwise it shows the
 * local auth screen so the route never errors without Clerk keys.
 */
export default function ClerkSignUpPage() {
  return <ClerkAuthScreen mode="sign-up" />;
}
