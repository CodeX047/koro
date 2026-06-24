import { SignupForm } from "~/components/signup-form";
import { requireUnAuth } from "~/feature/auth/auth";

export default async function SignupPage() {
  await requireUnAuth();
  return <SignupForm />;
}
