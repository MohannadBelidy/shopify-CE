import {
  reactExtension,
  BlockStack,
  InlineStack,
  useApi,
  Image,
  TextBlock,
  Spinner,
  Pressable,
  Checkbox,
  useApplyCartLinesChange,
  useCartLines,
  useCartLineTarget,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const { query } = useApi();

  // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
  const [variantData, setVariantData] = useState(null);
  const [isSelected, setSelected] = useState(false);
  const cartLines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();
  const settings = useSettings();

  const variantId = settings.selected_variant;

  useEffect(() => {
    async function getVariantData() {
      const queryResult = await query(`{ 
        node(id: "${variantId}"){
          ... on ProductVariant{
            title
            price{
              amount
              currencyCode
            }
            product{
              title
              featuredImage{
                url
                altText
              }
            }
            image{
              url
              altText
            }
          }
        }
      }`);
      if (queryResult.data) {
        setVariantData(queryResult.data.node);
        console.log(queryResult);
      }
    }
    if (variantId) {
      getVariantData();
    }
  }, [query]);

  useEffect(() => {
    if (isSelected) {
      applyCartLinesChange({
        type: "addCartLine",
        quantity: 1,
        merchandiseId: variantId,
      });
    } else {
      const cartLineId = cartLines.find(
        (cartLine) => cartLine.merchandise.id == variantId
      )?.id;
      if (cartLineId) {
        applyCartLinesChange({
          type: "removeCartLine",
          id: cartLineId,
          quantity: 1,
        });
      }
    }
  }, [isSelected]);

  // 3. Render a UI
  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      <TextBlock>Hello people</TextBlock>
      {variantData && variantData.image ? (
        <>
          <InlineStack>
            <Image source={variantData.image.url} />
            <BlockStack>
              <TextBlock>
                {variantData.title} - {variantData.product.title}
              </TextBlock>
              <TextBlock>
                {variantData.price.amount} {variantData.price.currencyCode}
              </TextBlock>
            </BlockStack>
          </InlineStack>
          <Pressable onPress={() => setSelected(!isSelected)}>
            <InlineStack>
              <Checkbox checked={isSelected} />
              <TextBlock>
                This product fits with your cart! Add this item to cart{" "}
              </TextBlock>
            </InlineStack>
          </Pressable>
        </>
      ) : (
        <Spinner />
      )}
    </BlockStack>
  );
}
