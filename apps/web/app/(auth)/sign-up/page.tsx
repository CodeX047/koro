import { SignupForm } from "~/components/signup-form";
import { requireUnAuth } from "~/lib/auth";

export default async function SignupPage() {
  await requireUnAuth();
  return <SignupForm />;
}
