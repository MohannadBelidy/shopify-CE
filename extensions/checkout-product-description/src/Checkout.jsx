import {
  reactExtension,
  Text,
  useApi,
  useCartLineTarget,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

const thankYouPageExtension = reactExtension(
  "purchase.thank-you.cart-line-item.render-after",
  () => <Extension />
);
export { thankYouPageExtension };

const checkoutPageExtension = reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />
);
export { checkoutPageExtension };

const orderPageExtension = reactExtension(
  "customer-account.order-status.cart-line-item.render-after",
  () => <Extension />
);
export { orderPageExtension };

function Extension() {
  const { query } = useApi();
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const target = useCartLineTarget();

  useEffect(() => {
    async function getCheckoutMessage() {
      const result = await query(`{
          product(id: "${target.merchandise.product.id}"){
            metafield(namespace: "custom" , key:"special_description"){
            value}
          }
        }`);
      if (result.errors) {
        console.error(result.errors);
      } else if (result.data && result.data.product.metafield.value) {
        setCheckoutMessage(result.data.product.metafield.value);
      }
    }
    getCheckoutMessage();
  }, [target]);

  return <Text>{checkoutMessage}</Text>;
}
