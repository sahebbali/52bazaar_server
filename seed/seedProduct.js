import Product from "../models/productModel.js";

export const products = [
  {
    id: 1,
    name: "Mint",
    category: "Vegetables",
    price: 30.78,
    originalPrice: 30.78,
    rating: 2.9,
    reviews: 7,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738770585/product/Mint-6-5ct-removebg-preview.png",
    slug: "mint",
  },
  {
    id: 2,
    name: "Clementine",
    category: "Fruits",
    price: 48.12,
    originalPrice: 48.12,
    rating: 3.2,
    reviews: 10,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738768992/product/Clementine-5ct-removebg-preview.png",
    slug: "clementine",
  },
  {
    id: 3,
    name: "Yellow Sweet Corn",
    category: "Vegetables",
    price: 80.97,
    originalPrice: 80.97,
    rating: 2.6,
    reviews: 5,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738769999/product/Yellow-Sw-eet-Corn-Bag-each-removebg-preview.png",
    slug: "yellow-sweet-corn",
  },
  {
    id: 4,
    name: "Organic Baby Carrot",
    category: "Vegetables",
    price: 150.0,
    originalPrice: 168.23,
    rating: 4.3,
    reviews: 4,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738770398/product/Organic-Baby-Carrot-1oz-removebg-preview.png",
    slug: "organic-baby-carrot",
  },
  {
    id: 5,
    name: "Organic Cherry Tomato",
    category: "Vegetables",
    price: 15.56,
    originalPrice: 15.56,
    rating: 2.2,
    reviews: 5,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738770456/product/Orange-Cherry-Tomato-5qt-removebg-preview.png",
    slug: "organic-cherry-tomato",
  },
  {
    id: 6,
    name: "Atlantic Salmon",
    category: "Fish & Meat",
    price: 10.36,
    originalPrice: 10.36,
    rating: 2.5,
    reviews: 6,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
    slug: "atlantic-salmon",
  },
  {
    id: 7,
    name: "Dates Loose",
    category: "Fruits",
    price: 102.33,
    originalPrice: 102.33,
    rating: 3.5,
    reviews: 6,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738773409/product/Dates-Khejur-Lulu-Loose-Kg-removebg-preview.png",
    slug: "dates-loose",
  },
  {
    id: 8,
    name: "Rainbow Chard",
    category: "Vegetables",
    price: 7.07,
    originalPrice: 7.07,
    rating: 3.3,
    reviews: 6,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738768919/product/Rainbow-Chard-Package-per-lb-removebg-preview.png",
    slug: "rainbow-chard",
  },
  {
    id: 9,
    name: "Green Cauliflower",
    category: "Vegetables",
    price: 94.12,
    originalPrice: 94.12,
    rating: 3.7,
    reviews: 6,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738770041/product/Green-Cauliflower-12ct-removebg-preview.png",
    slug: "green-cauliflower",
  },
  {
    id: 10,
    name: "Fresh Dates",
    category: "Fruits",
    price: 226.98,
    originalPrice: 226.98,
    rating: 0.0,
    reviews: 0,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738773208/product/Fresh-Dates-Package-10oz-removebg-preview.png",
    slug: "fresh-dates",
  },
  {
    id: 11,
    name: "Organic Green Cauliflower",
    category: "Vegetables",
    price: 142.4,
    originalPrice: 142.4,
    rating: 1.6,
    reviews: 5,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738770181/product/Organic-Green-Cauliflower-1lb-removebg-preview.png",
    slug: "organic",
  },
  {
    id: 12,
    name: "Green Leaf Lettuce",
    category: "Vegetables",
    price: 112.72,
    originalPrice: 112.72,
    rating: 3.1,
    reviews: 8,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738768876/product/Green-Leaf-Lettuce-each__1_-removebg-preview%25281%2529.png",
    slug: "green-leaf-lettuce",
  },
  {
    id: 13,
    name: "Radicchio",
    category: "Vegetables",
    price: 45.0,
    originalPrice: 58.66,
    rating: 2.5,
    reviews: 2,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738769310/product/Radicchio-12ct-removebg-preview.png",
    slug: "radicchio",
  },
  {
    id: 14,
    name: "Escarole",
    category: "Vegetables",
    price: 0.0,
    originalPrice: 0.0,
    rating: 1.8,
    reviews: 6,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738773078/product/Escarole-1ct-removebg-preview.png",
    slug: "escarole",
  },
  {
    id: 15,
    name: "Himalaya Powder",
    category: "Baby Care",
    price: 160.0,
    originalPrice: 174.97,
    rating: 3.6,
    reviews: 5,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738768685/product/Himalaya-Baby-Powder-100g-removebg-preview.png",
    slug: "himalaya-powder",
  },
  {
    id: 16,
    name: "Rainbow Peppers",
    category: "Vegetables",
    price: 90.85,
    originalPrice: 90.85,
    rating: 0.0,
    reviews: 0,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738769097/product/Rainbow-Peppers-4ct-removebg-preview.png",
    slug: "rainbow-peppers",
  },
  {
    id: 17,
    name: "Parsley",
    category: "Vegetables",
    price: 134.63,
    originalPrice: 134.63,
    rating: 1.0,
    reviews: 1,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738769346/product/Parsley-each-removebg-preview%25281%2529.png",
    slug: "parsley",
  },
  {
    id: 18,
    name: "Cauliflower",
    category: "Vegetables",
    price: 139.15,
    originalPrice: 139.15,
    rating: 2.4,
    reviews: 7,
    image:
      "https://res.cloudinary.com/ahossain/image/upload/v1738769405/product/Cauliflower-1-35lb-removebg-preview.png",
    slug: "cauliflower",
  },
];

async function seedProducts() {
  try {
    for (const product of products) {
      // Check if product already exists
      const existingProduct = await Product.findOne({ slug: product.slug });

      if (existingProduct) {
        console.log(`Updating product: ${product.name}`);
        await Product.updateOne(
          { slug: product.slug },
          {
            $set: {
              name: product.name,
              category: product.category,
              regularPrice: product.price,
              originalPrice: product.originalPrice,
              rating: product.rating,
              reviews: product.reviews,
              imageUrl: product.image,
              slug: product.slug,
              is_active: true,
              stockQuantity: 100, // Default value
            },
          },
        );
      } else {
        console.log(`Creating product: ${product.name}`);
        await Product.create({
          name: product.name,
          category: product.category,
          regularPrice: product.price,
          originalPrice: product.originalPrice,
          rating: product.rating,
          reviews: product.reviews,
          imageUrl: product.image,
          slug: product.slug,
          is_active: true,
          stockQuantity: 100,
          // Convert single image to images array if needed
          images: product.image
            ? [
                {
                  url: product.image,
                  publicId: `products/${product.slug}`,
                  isFeatured: true,
                  order: 0,
                },
              ]
            : [],
        });
      }
    }

    console.log("✅ Products imported successfully!");
  } catch (error) {
    console.error("❌ Error importing products:", error);
  }
}

export default seedProducts;
