import { useState } from "react";
import {
  updateProduct,
  deleteProduct,
  updateVariant,
  deleteVariant,
  addVariant,
} from "../../services/api";

function EditProductModal({ product, categories, onClose, onSave }) {
  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [variants, setVariants] = useState(product.variants || []);
  const [newVariant, setNewVariant] = useState({
    flavor: "",
    size: "",
    price: "",
  });

  const handleSaveProduct = async () => {
    await updateProduct(product.id, { name, category_id: categoryId });
    alert("Product updated!");
    onSave();
  };

  const handleDeleteProduct = async () => {
    if (!confirm("Delete this product? It will be hidden from the store."))
      return;
    await deleteProduct(product.id);
    onSave();
    onClose();
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const handleSaveVariant = async (variant) => {
    await updateVariant(variant.id, {
      flavor: variant.flavor,
      size: variant.size,
      price: variant.price,
    });
    alert("Variant updated!");
    onSave();
  };

  const handleDeleteVariant = async (variantId) => {
    if (!confirm("Remove this variant?")) return;
    await deleteVariant(variantId);
    setVariants(variants.filter((v) => v.id !== variantId));
    onSave();
  };

  const handleAddVariant = async () => {
    if (!newVariant.price) return alert("Please enter a price");
    await addVariant({ ...newVariant, product_id: product.id });
    setNewVariant({ flavor: "", size: "", price: "" });
    onSave();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 20,
          width: "100%",
          maxWidth: 500,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 18 }}>Edit Product</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 22 }}
          >
            ✕
          </button>
        </div>

        {/* Product name */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontSize: 13,
              color: "#888",
              display: "block",
              marginBottom: 4,
            }}
          >
            Product Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 15,
            }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              color: "#888",
              display: "block",
              marginBottom: 4,
            }}
          >
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 15,
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSaveProduct}
          style={{
            width: "100%",
            padding: 10,
            background: "#f97316",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Save Product Name / Category
        </button>

        {/* Variants */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Variants</div>

          {variants.map((v, i) => (
            <div
              key={v.id}
              style={{
                background: "#fff7ed",
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <input
                  placeholder="Flavor"
                  value={v.flavor || ""}
                  onChange={(e) =>
                    handleVariantChange(i, "flavor", e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    fontSize: 13,
                  }}
                />
                <input
                  placeholder="Size"
                  value={v.size || ""}
                  onChange={(e) =>
                    handleVariantChange(i, "size", e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    fontSize: 13,
                  }}
                />
                <input
                  placeholder="₱"
                  type="number"
                  value={v.price}
                  onChange={(e) =>
                    handleVariantChange(i, "price", e.target.value)
                  }
                  style={{
                    width: 70,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    fontSize: 13,
                  }}
                />
              </div>
              <input
                placeholder="Barcode (optional)"
                value={v.barcode || ""}
                onChange={(e) =>
                  handleVariantChange(i, "barcode", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => handleSaveVariant(v)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => handleDeleteVariant(v.id)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Add new variant */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
              Add new variant
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input
                placeholder="Flavor"
                value={newVariant.flavor}
                onChange={(e) =>
                  setNewVariant({ ...newVariant, flavor: e.target.value })
                }
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                }}
              />
              <input
                placeholder="Size"
                value={newVariant.size}
                onChange={(e) =>
                  setNewVariant({ ...newVariant, size: e.target.value })
                }
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                }}
              />
              <input
                placeholder="₱"
                type="number"
                value={newVariant.price}
                onChange={(e) =>
                  setNewVariant({ ...newVariant, price: e.target.value })
                }
                style={{
                  width: 70,
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                }}
              />
            </div>
            <input
              placeholder="Barcode (optional)"
              value={newVariant.barcode || ""}
              onChange={(e) =>
                setNewVariant({ ...newVariant, barcode: e.target.value })
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #ddd",
                fontSize: 13,
                marginBottom: 6,
              }}
            />
            <button
              onClick={handleAddVariant}
              style={{
                width: "100%",
                padding: 8,
                background: "none",
                border: "1px dashed #ddd",
                borderRadius: 8,
                color: "#888",
              }}
            >
              + Add Variant
            </button>
          </div>
        </div>

        {/* Delete product */}
        <button
          onClick={handleDeleteProduct}
          style={{
            width: "100%",
            marginTop: 20,
            padding: 10,
            background: "none",
            border: "1px solid #ef4444",
            color: "#ef4444",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Delete Product
        </button>
      </div>
    </div>
  );
}

export default EditProductModal;
