export function getMockShopifyData() {
  return {
    shop: {
      name: "Demo Store",
      domain: "demo.myshop.com",
    },
    products: [
      {
        id: 1,
        title: "Sample Product",
        price: 19.99,
        images: [{ src: "https://via.placeholder.com/300" }],
        description: "A sample product for preview.",
        handle: "sample-product",
      },
      // Add more mock products as needed
    ],
    collections: [],
    cart: {
      items: [],
      total_price: 0,
    },
    // Add more Shopify-like objects as needed
  };
}