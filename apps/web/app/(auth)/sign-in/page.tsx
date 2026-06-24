import { LoginForm } from "~/components/login-form";
import { requireUnAuth } from "~/lib/auth";

export default async function Page() {
  await requireUnAuth();
  return <LoginForm />;
}
