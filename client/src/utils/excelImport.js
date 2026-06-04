import * as XLSX from "xlsx";
import api from "../services/api";

export const importProductsFromExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          throw new Error("Excel file is empty");
        }

        // Group products by name to handle multiple variants
        const productMap = {};

        rows.forEach((row) => {
          const productName = row["Product Name"]?.toString().trim();
          const category = row["Category"]?.toString().trim();
          const icon = row["Icon"]?.toString().trim() || "📦";
          const flavor = row["Flavor"]?.toString().trim();
          const size = row["Size"]?.toString().trim();
          const price = parseFloat(row["Price"]);
          const barcode = row["Barcode"]?.toString().trim();

          if (!productName || !category || isNaN(price)) {
            throw new Error(
              `Missing or invalid required fields in row: ${JSON.stringify(row)}. Required: Product Name, Category, Price (number)`,
            );
          }

          const key = `${productName}-${category}`;

          if (!productMap[key]) {
            productMap[key] = {
              name: productName,
              category,
              icon,
              variants: [],
            };
          }

          productMap[key].variants.push({
            flavor: flavor || null,
            size: size || null,
            price,
            barcode: barcode || null,
          });
        });

        // Get all categories to find category IDs
        (async () => {
          try {
            const categoriesRes = await api.get("/categories");
            const existingCategories = categoriesRes.data;

            let imported = 0;
            let errors = [];

            // Create or get categories and products
            for (const [key, productData] of Object.entries(productMap)) {
              try {
                // Find or create category
                let category = existingCategories.find(
                  (c) =>
                    c.name.toLowerCase() === productData.category.toLowerCase(),
                );

                if (!category) {
                  const categoryRes = await api.post("/categories", {
                    name: productData.category,
                    icon: productData.icon,
                    sort_order: existingCategories.length + 1,
                  });
                  category = categoryRes.data;
                }

                // Create product
                await api.post("/products", {
                  name: productData.name,
                  category_id: category.id,
                  variants: productData.variants,
                });

                imported++;
              } catch (err) {
                errors.push(
                  `Failed to import "${productData.name}": ${err.response?.data?.error || err.message}`,
                );
              }
            }

            resolve({
              success: imported > 0,
              imported,
              total: Object.keys(productMap).length,
              errors,
            });
          } catch (err) {
            reject(new Error(`API Error: ${err.message}`));
          }
        })();
      } catch (err) {
        reject(new Error(`Excel parse error: ${err.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });
};

export const downloadExcelTemplate = () => {
  const template = [
    {
      "Product Name": "Lays Chips",
      Category: "Snacks",
      Icon: "🍪",
      Flavor: "Regular",
      Size: "",
      Price: 15,
      Barcode: "12345678",
    },
    {
      "Product Name": "Lays Chips",
      Category: "Snacks",
      Icon: "🍪",
      Flavor: "Regular",
      Size: "Large",
      Price: 25,
      Barcode: "12345679",
    },
    {
      "Product Name": "Coca Cola",
      Category: "Beverages",
      Icon: "🥤",
      Flavor: "",
      Size: "250ml",
      Price: 35,
      Barcode: "87654321",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Set column widths
  worksheet["!cols"] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
  ];

  XLSX.writeFile(workbook, "sari-pos-products-template.xlsx");
};
