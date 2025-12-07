
import { useEffect, useState } from "react";
import { transactionsAPI } from "../../service/transactionsService"; 
import { categoriesAPI } from "../../service/categoriesService";
import { Calendar, DollarSign, Tag, FileText, Loader2, X } from "lucide-react";

export default function TransactionForm({ initial = null, onSaved, onClose }) {
  const getId = (obj) => (obj ? obj._id ?? obj.id ?? null : null);

  const [form, setForm] = useState({
    amount: initial?.amount ?? "",
    date:
      initial?.date
        ? (initial.date.slice?.(0, 10) ?? new Date(initial.date).toISOString().slice(0, 10))
        : new Date().toISOString().slice(0, 10),
    description: initial?.description ?? initial?.note ?? "",
    category_id:
      typeof initial?.category_id === "string"
        ? initial.category_id
        : initial?.category_id?._id ?? initial?.category?._id ?? initial?.category_id ?? "",
    currency: initial?.currency ?? "INR",
    tags: (initial?.tags || []).join?.(", ") ?? "",
  });

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await categoriesAPI.list();
        const list = res.items || res.categories || res;
        const normalized = Array.isArray(list) ? list : [];
        if (!mounted) return;
        setCategories(normalized);

        const catId = form.category_id;
        if (catId) {
          const found = normalized.find((c) => (c._id ?? c.id) === catId);
          if (!found) {
            try {
              const byIdRes = await categoriesAPI.getById(catId);
              const catObj = byIdRes.category ?? byIdRes;
              if (catObj && mounted) {
                setCategories((prev) => {
                  const exists = prev.some((c) => (c._id ?? c.id) === (catObj._id ?? catObj.id));
                  return exists ? prev : [catObj, ...prev];
                });
              }
            } catch (err) {
              console.warn("Failed to fetch category by id:", catId, err?.response?.data || err?.message);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load categories list:", err?.response?.data || err?.message || err);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  function updateField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const amountNum = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNum)) {
      alert("Enter a valid amount");
      return;
    }

    const parsedDate = new Date(form.date);
    if (isNaN(parsedDate.getTime())) {
      alert("Enter a valid date");
      return;
    }

    setSaving(true);

    let catId = form.category_id;
    if (typeof catId === "object" && catId !== null) {
      catId = catId._id ?? catId.id ?? String(catId);
    }
    if (catId === "") catId = null;

    const tagsPayload = Array.isArray(form.tags) ? form.tags : String(form.tags || "").trim();

    const payload = {
      amount: amountNum,
      date: parsedDate.toISOString(),
      description: String(form.description || "").trim(),
      category_id: catId,
      currency: form.currency || "INR",
      tags: tagsPayload,
    };

    try {
      const txId = getId(initial);
      let res;
      if (txId) {
        res = await transactionsAPI.update(txId, payload);
      } else {
        res = await transactionsAPI.create(payload);
      }
      const resultTx = res.transaction ?? res;
      onSaved && onSaved(resultTx, !txId);
    } catch (err) {
      console.error("Transaction save failed - full error:", err);
      const serverMsg = err?.response?.data?.message || JSON.stringify(err?.response?.data) || err.message;
      alert("Save failed: " + serverMsg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl w-full">
    
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-[#0F172A]">
          {initial ? "Edit Transaction" : "New Transaction"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-[#0F172A]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

     
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
        
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
                />
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Amount</label>
              <div className="relative">
                {/* <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" /> */}
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

        
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Category</label>
              <select
                value={form.category_id || ""}
                onChange={(e) => updateField("category_id", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
              >
                <option value="">— Select Category —</option>
                {categories.map((c) => (
                  <option key={c._id ?? c.id} value={c._id ?? c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

         
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Currency</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
                placeholder="INR"
              />
            </div>
          </div>

        
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
                placeholder="Enter transaction details"
              />
            </div>
          </div>

      
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Tags</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
                placeholder="food, groceries, shopping"
              />
            </div>
          </div>
        </div>

      
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
              "Save Transaction"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}