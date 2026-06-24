import { requireUnAuth } from "~/features/auth/utils/auth";
import { SignupForm } from "~/features/auth/components/signup-form";

export default async function SignupPage() {
  await requireUnAuth();
  return <SignupForm />;
}
