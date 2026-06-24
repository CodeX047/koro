import { LoginForm } from "~/components/login-form";
import { requireUnAuth } from "~/feature/auth/auth";

export default async function Page() {
  await requireUnAuth();
  return <LoginForm />;
}
