import { redirect } from "next/navigation";

/** Entry point — route guards on /dashboard handle auth redirects. */
export default function Home() {
  redirect("/dashboard");
}
