const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getAllProducts(request, response) {
  const mode = request.query.mode || "";

  if (mode === "admin") {
    try {
      const adminProducts = await prisma.product.findMany({});
      return response.json(adminProducts);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      return response.status(500).json({ error: "Error fetching products" });
    }
  } else {
    const page = Number(request.query.page) || 1;
    let whereClause = {};
    let sortObj = {};
    let sortByValue = "defaultSort";

    // Get the query string, e.g., "filters[price][$lte]=3000&filters[rating][$gte]=0"
    const queryString = request.url.split('?')[1] || "";
    const queryArray = queryString ? queryString.split("&") : [];

    queryArray.forEach((queryParam) => {
      const [rawKey, rawValue] = queryParam.split("=");
      const key = decodeURIComponent(rawKey);
      const value = decodeURIComponent(rawValue || "");

      if (key.startsWith("filters")) {
        // Match either: filters[field] or filters[field][$operator]
        const regex = /^filters\[(\w+)\](\[\$(\w+)\])?$/;
        const match = key.match(regex);
        if (match) {
          const field = match[1]; // e.g., "price" or "category"
          const operator = match[3]; // e.g., "lte", "gte", etc.

          if (operator) {
            // Build or extend the nested filtering object for this field.
            if (!whereClause[field]) {
              whereClause[field] = {};
            }
            // Convert value to a number if it appears numeric.
            whereClause[field][operator] = isNaN(value) ? value : Number(value);
          } else {
            // No operator provided: use equality.
            whereClause[field] = isNaN(value) ? value : Number(value);
          }
        }
      } else if (key.startsWith("sort")) {
        sortByValue = value;
      }
    });

    // Transform the category filter to use nested relation filtering if provided.
    // This handles queries like: filters[category]=mouses or filters[category][$equals]=mouses.
    if (whereClause.category) {
      if (typeof whereClause.category === "object" && whereClause.category.hasOwnProperty("equals")) {
        whereClause.category = { is: { name: whereClause.category.equals } };
      } else if (typeof whereClause.category === "string" || typeof whereClause.category === "number") {
        whereClause.category = { is: { name: whereClause.category } };
      }
    }

    // Sorting logic.
    sortObj = {
      ...(sortByValue === "titleAsc" && { title: "asc" }),
      ...(sortByValue === "titleDesc" && { title: "desc" }),
      ...(sortByValue === "lowPrice" && { price: "asc" }),
      ...(sortByValue === "highPrice" && { price: "desc" }),
    };

    try {
      const products = await prisma.Product.findMany({
        skip: (page - 1) * 10,
        take: 12,
        where: Object.keys(whereClause).length ? whereClause : undefined,
        orderBy: Object.keys(sortObj).length ? sortObj : undefined,
        select: {
          categoryId: true,
          title: true,
          price: true,
          mainImage: true,
        },
      });

      // Fetch category details separately (if needed)
      const categoryIds = [
        ...new Set(products.map((p) => p.categoryId).filter(Boolean)),
      ];
      const categories = await prisma.Category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      });

      // Merge category data into products.
      const enrichedProducts = products.map((product) => ({
        ...product,
        category: categories.find((c) => c.id === product.categoryId) || null,
      }));

      return response.json(enrichedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      return response.status(500).json({ error: "Error fetching products" });
    }
  }
}



async function getAllProductsOld(request, response) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    response.status(200).json(products);
  } catch (error) {
    console.log(error);
  }
}


async function createProduct(request, response) {
  try {
    const {
      slug,
      title,
      mainImage,
      price,
      description,
      manufacturer,
      categoryId,
      inStock,
    } = request.body;
    const product = await prisma.product.create({
      data: {
        slug,
        title,
        mainImage,
        price,
        rating: 5,
        description,
        manufacturer,
        categoryId,
        inStock,
      },
    });
    return response.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error); // Dodajemo log za proveru
    return response.status(500).json({ error: "Error creating product" });
  }
}

// Method for updating existing product
async function updateProduct(request, response) {
  try {
    const { id } = request.params; // Getting a slug from params
    const {
      slug,
      title,
      mainImage,
      price,
      rating,
      description,
      manufacturer,
      categoryId,
      inStock,
    } = request.body;
    // Finding a product by slug
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return response.status(404).json({ error: "Product not found" });
    }

    // Updating found product
    const updatedProduct = await prisma.product.update({
      where: {
        id, // Using id of the found product
      },
      data: {
        title: title,
        mainImage: mainImage,
        slug: slug,
        price: price,
        rating: rating,
        description: description,
        manufacturer: manufacturer,
        categoryId: categoryId,
        inStock: inStock,
      },
    });

    return response.status(200).json(updatedProduct);
  } catch (error) {
    return response.status(500).json({ error: "Error updating product" });
  }
}

// Method for deleting a product
async function deleteProduct(request, response) {
  try {
    const { id } = request.params;

        // Check for related records in wishlist table
        const relatedOrderProductItems = await prisma.customer_order_product.findMany({
          where: {
            productId: id,
          },
        });
        if(relatedOrderProductItems.length > 0){
          return response.status(400).json({ error: 'Cannot delete product because of foreign key constraint. ' });
        }

    await prisma.product.delete({
      where: {
        id,
      },
    });
    return response.status(204).send();
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Error deleting product" });
  }
}

async function searchProducts(request, response) {
  try {
    const { query } = request.query;
    if (!query) {
      return response
        .status(400)
        .json({ error: "Query parameter is required" });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
        ],
      },
    });

    return response.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    return response.status(500).json({ error: "Error searching products" });
  }
}

async function getProductById(request, response) {
  const { id } = request.params;
  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    include: {
      category: true,
    },
  });
  if (!product) {
    return response.status(404).json({ error: "Product not found" });
  }
  return response.status(200).json(product);
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
};