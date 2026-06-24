import { requireUnAuth } from "~/features/auth/utils/auth";
import { LoginForm } from "~/features/auth/components/login-form";

export default async function Page() {
  await requireUnAuth();
  return <LoginForm />;
}
