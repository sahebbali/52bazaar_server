import Category from "../models/categoryModel.js";

export const seedCategories = async () => {
  try {
    // await Category.deleteMany(); // optional reset

    const categories = [
      {
        name: "sai",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
        subcategories: [],
      },
      {
        name: "Fish & Meat",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340705/category%20icon/carp-fish_paxzrt.png",
        subcategories: ["Fish", "Meat"],
      },
      {
        name: "Fruits & Vegetable",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340704/category%20icon/cabbage_n59uv3.png",
        subcategories: ["Baby Food", "Fresh Fruits", "Dry Fruits"],
      },
      {
        name: "Biscuits & Cakes",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340705/category%20icon/cookie_1_ugipqa.png",
        subcategories: ["Biscuits", "Cakes"],
      },
      {
        name: "Household Tools",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340706/category%20icon/spray_pebsjt.png",
        subcategories: ["Water Filter", "Cleaning Tools", "Pest Control"],
      },
      {
        name: "Pet Care",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340707/category%20icon/cat_tznwmq.png",
        subcategories: ["Dog Care", "Cat Care"],
      },
      {
        name: "Beauty & Healths",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340706/category%20icon/beauty_vfbmzc.png",
        subcategories: ["Women", "Men"],
      },
      {
        name: "Jam & Jelly",
        icon: "https://i.postimg.cc/rmLvfsMC/strawberry-jam-1.png",
        subcategories: [],
      },
      {
        name: "Milk & Dairy",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340706/category%20icon/milk_dcl0dr.png",
        subcategories: ["Butter & Ghee", "Ice Cream", "Dairy"],
      },
      {
        name: "Drinks",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340705/category%20icon/juice_p5gv5k.png",
        subcategories: ["Tea", "Water", "Juice"],
      },
      {
        name: "Breakfast",
        icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340705/category%20icon/bagel_mt3fod.png",
        subcategories: ["Bread", "Cereal"],
      },
    ];

    for (const cat of categories) {
      // 🔹 Create parent
      const parent = await Category.create({
        name: cat.name,
        icon: cat.icon,
        subcategories: cat.subcategories,
      });

      // 🔹 Create children
    }

    console.log("✅ Categories seeded successfully");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
};
