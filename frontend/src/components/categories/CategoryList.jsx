

import { useEffect, useState } from "react";
import { categoriesAPI } from "../../service/categoriesService";
import CategoryForm from "./CategoryForm";
import { Plus, Edit3, Trash2, Loader2, Tag, TrendingDown, TrendingUp, RefreshCw } from "lucide-react";

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");
      const res = await categoriesAPI.list();
      const list = res.items || res.categories || res;
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function handleEdit(cat) {
    setEditing(cat);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) return;
    const backup = categories;
    setCategories(categories.filter(c => c._id !== id));
    try {
      await categoriesAPI.remove(id);
    } catch (err) {
      alert("Delete failed");
      setCategories(backup);
      console.error(err);
    }
  }

  function handleSaved(savedCategory, isNew = false) {
    setShowForm(false);
    setEditing(null);

    if (isNew) {
      setCategories(prev => [savedCategory, ...prev]);
      return;
    }
    setCategories(prev => prev.map(c => (c._id === savedCategory._id ? savedCategory : c)));
  }

  // Get icon and color based on category type
  function getCategoryIcon(type) {
    switch (type) {
      case "income":
        return { icon: TrendingUp, color: "text-[#4ADE80]", bg: "bg-[#D1FAE5]" };
      case "expense":
        return { icon: TrendingDown, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" };
      case "transfer":
        return { icon: RefreshCw, color: "text-[#14B8A6]", bg: "bg-[#D1FAE5]" };
      default:
        return { icon: Tag, color: "text-[#6B7280]", bg: "bg-[#F3F4F6]" };
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#4ADE80] animate-spin" />
          <p className="text-[#6B7280] text-sm">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EF4444]/20">
          <p className="text-[#EF4444] font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Categories</h1>
            <p className="text-sm text-[#6B7280] mt-1">Organize your transactions</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0F172A] bg-[#4ADE80] hover:bg-[#14B8A6] rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Form Modal Overlay */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <CategoryForm
              initial={editing}
              onSaved={(cat) => handleSaved(cat, !editing)}
              onClose={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        )}

        {/* Categories List */}
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-[#14B8A6]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No categories yet</h3>
            <p className="text-sm text-[#6B7280] mb-6">Create categories to organize your transactions better</p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0F172A] bg-[#4ADE80] hover:bg-[#14B8A6] rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c) => {
              const { icon: Icon, color, bg } = getCategoryIcon(c.type);
              return (
                <div
                  key={c._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Category info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0F172A] mb-1 truncate">{c.name}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-[#F3F4F6] text-[#6B7280] capitalize">
                          {c.type || "uncategorized"}
                        </span>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-2 text-[#14B8A6] hover:bg-[#D1FAE5] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-2 text-[#EF4444] hover:bg-[#EF4444]/5 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}