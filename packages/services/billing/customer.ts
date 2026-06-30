import { dodo } from "@repo/billing";

export async function getCustomerPortalUrl({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const portal = await dodo.customers.customerPortal.create(customerId, {
    return_url: returnUrl,
  });
  
  return portal.link;
}
