
import { useState } from "react";
import { categoriesAPI } from "../../service/categoriesService";
import { Tag, Loader2, X, Check } from "lucide-react";

export default function CategoryForm({ initial = null, onSaved, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    type: initial?.type ?? "expense",
  });
  const [saving, setSaving] = useState(false);

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    setSaving(true);
    try {
      if (initial && initial._id) {
        const res = await categoriesAPI.update(initial._id, form);
        const updated = res.category || res;
        onSaved && onSaved(updated);
      } else {
        const res = await categoriesAPI.create(form);
        const created = res.category || res;
        onSaved && onSaved(created);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-[#0F172A]">
          {initial ? "Edit Category" : "New Category"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-[#0F172A]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
              Category Name
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
                placeholder="e.g. Groceries, Salary, Rent"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
            >
              <option value="expense">💸 Expense</option>
              <option value="income">💰 Income</option>
              <option value="transfer">🔄 Transfer</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[#0F172A] bg-[#F3F4F6] hover:bg-[#D1FAE5] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#0F172A] bg-[#4ADE80] hover:bg-[#14B8A6] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}