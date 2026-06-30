import { dodo } from "@repo/billing";

export async function createCheckoutSession({
  organizationId,
  planId,
  email,
  returnUrl,
}: {
  organizationId: string;
  planId: string;
  email: string;
  returnUrl: string;
}) {
  // Assume a mapping between Plan ID and Dodo Product ID is maintained in env or config
  // For simplicity, using a static mapping or prefix
  const productId = `prod_${planId.toLowerCase()}`;
  
  const session = await dodo.checkoutSessions.create({
    product_cart: [
      { product_id: productId, quantity: 1 }
    ],
    customer: {
      email,
      name: `Organization ${organizationId}`, // Using Org ID as name or lookup real name
    },
    metadata: {
      organizationId,
      planId,
    },
    return_url: returnUrl,
  });
  
  return session.checkout_url;
}
