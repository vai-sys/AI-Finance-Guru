

import { useEffect, useState } from "react";
import { transactionsAPI } from "../../service/transactionsService";
import { categoriesAPI } from "../../service/categoriesService";
import { Calendar, FileText, Tag, Loader2, X, Plus } from "lucide-react";

export default function TransactionForm({ initial = null, onSaved, onClose }) {
 
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('modal-animations')) {
      const style = document.createElement('style');
      style.id = 'modal-animations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

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

  // modal state for creating category
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("expense");
  const [creatingCategory, setCreatingCategory] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit() {
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

  // === Create Category handlers ===
  function openCreate() {
    setNewCatName("");
    setNewCatType("expense");
    setIsCreateOpen(true);
  }
  function closeCreate() {
    setIsCreateOpen(false);
    setCreatingCategory(false);
  }

  async function handleCreateCategory() {
    const name = String(newCatName || "").trim();
    if (!name) {
      alert("Category name is required");
      return;
    }

    setCreatingCategory(true);
    try {
      const payload = { name, type: newCatType || "expense", parent_id: null };
      const res = await categoriesAPI.create(payload);
      const created = res.category ?? res;

      // add created to categories and select it
      setCategories((prev) => {
        const exists = prev.some((c) => (c._id ?? c.id) === (created._id ?? created.id));
        return exists ? prev : [created, ...prev];
      });

      // set selected category id in form
      setForm((p) => ({ ...p, category_id: created._id ?? created.id ?? String(created) }));

      closeCreate();
    } catch (err) {
      console.error("Create category failed:", err);
      const serverMsg = err?.response?.data?.message || err?.message || "Failed to create category";
      alert("Create category failed: " + serverMsg);
      setCreatingCategory(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCategoryKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateCategory();
    }
  };

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
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
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
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Category</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  <select
                    value={form.category_id || ""}
                    onChange={(e) => updateField("category_id", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-all text-[#0F172A] text-sm appearance-none cursor-pointer hover:bg-[#E5E7EB]"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="">— Select Category —</option>
                    {categories.map((c) => (
                      <option key={c._id ?? c.id} value={c._id ?? c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* + button to open create category modal */}
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-transparent bg-gradient-to-br from-[#4ADE80] to-[#14B8A6] hover:from-[#22C55E] hover:to-[#0D9488] transition-all shadow-sm hover:shadow-md text-white transform hover:scale-105 active:scale-95"
                  aria-label="Create category"
                  title="Create new category"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Currency</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                onKeyPress={handleKeyPress}
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
                onKeyPress={handleKeyPress}
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
                onKeyPress={handleKeyPress}
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
            type="button"
            onClick={handleSubmit}
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
      </div>

      {/* ===== Create Category Modal ===== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md transform transition-all animate-slideUp">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#14B8A6] flex items-center justify-center shadow-sm">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Create Category</h3>
                </div>
                <button 
                  onClick={closeCreate} 
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/80 transition-colors text-[#6B7280] hover:text-[#0F172A]"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Category Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyPress={handleCategoryKeyPress}
                    className="w-full px-4 py-3 rounded-xl bg-[#F3F4F6] border border-transparent focus:bg-white focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/20 outline-none transition-all text-[#0F172A]"
                    placeholder="e.g. Coffee, Rent, Groceries"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewCatType("expense")}
                      className={`relative px-4 py-3 rounded-xl border-2 font-medium transition-all transform hover:scale-105 active:scale-95 ${
                        newCatType === "expense" 
                          ? "bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] border-[#EF4444] text-[#991B1B] shadow-md" 
                          : "bg-[#F9FAFB] border-gray-200 text-[#6B7280] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      <span className="text-xl mr-2">💸</span>
                      Expense
                      {newCatType === "expense" && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full animate-pulse"></div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCatType("income")}
                      className={`relative px-4 py-3 rounded-xl border-2 font-medium transition-all transform hover:scale-105 active:scale-95 ${
                        newCatType === "income" 
                          ? "bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] border-[#10B981] text-[#065F46] shadow-md" 
                          : "bg-[#F9FAFB] border-gray-200 text-[#6B7280] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      <span className="text-xl mr-2">💰</span>
                      Income
                      {newCatType === "income" && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeCreate}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F3F4F6] text-[#0F172A] font-medium hover:bg-[#E5E7EB] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#14B8A6] text-white font-semibold hover:from-[#22C55E] hover:to-[#0D9488] transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 disabled:transform-none"
                  >
                    {creatingCategory ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// import { useEffect, useState } from "react";
// import { transactionsAPI } from "../../service/transactionsService";
// import { categoriesAPI } from "../../service/categoriesService";
// import { Calendar, FileText, Tag, Loader2, X, Plus } from "lucide-react";

// export default function TransactionForm({ initial = null, onSaved, onClose }) {
//   const getId = (obj) => (obj ? obj._id ?? obj.id ?? null : null);

//   const [form, setForm] = useState({
//     amount: initial?.amount ?? "",
//     date:
//       initial?.date
//         ? (initial.date.slice?.(0, 10) ?? new Date(initial.date).toISOString().slice(0, 10))
//         : new Date().toISOString().slice(0, 10),
//     description: initial?.description ?? initial?.note ?? "",
//     category_id:
//       typeof initial?.category_id === "string"
//         ? initial.category_id
//         : initial?.category_id?._id ?? initial?.category?._id ?? initial?.category_id ?? "",
//     currency: initial?.currency ?? "INR",
//     tags: (initial?.tags || []).join?.(", ") ?? "",
//   });

//   const [categories, setCategories] = useState([]);
//   const [saving, setSaving] = useState(false);

//   // modal state for creating category
//   const [isCreateOpen, setIsCreateOpen] = useState(false);
//   const [newCatName, setNewCatName] = useState("");
//   const [newCatType, setNewCatType] = useState("expense");
//   const [creatingCategory, setCreatingCategory] = useState(false);

//   useEffect(() => {
//     let mounted = true;

//     async function load() {
//       try {
//         const res = await categoriesAPI.list();
//         const list = res.items || res.categories || res;
//         const normalized = Array.isArray(list) ? list : [];
//         if (!mounted) return;
//         setCategories(normalized);

//         const catId = form.category_id;
//         if (catId) {
//           const found = normalized.find((c) => (c._id ?? c.id) === catId);
//           if (!found) {
//             try {
//               const byIdRes = await categoriesAPI.getById(catId);
//               const catObj = byIdRes.category ?? byIdRes;
//               if (catObj && mounted) {
//                 setCategories((prev) => {
//                   const exists = prev.some((c) => (c._id ?? c.id) === (catObj._id ?? catObj.id));
//                   return exists ? prev : [catObj, ...prev];
//                 });
//               }
//             } catch (err) {
//               console.warn("Failed to fetch category by id:", catId, err?.response?.data || err?.message);
//             }
//           }
//         }
//       } catch (err) {
//         console.warn("Failed to load categories list:", err?.response?.data || err?.message || err);
//       }
//     }

//     load();
//     return () => { mounted = false; };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   function updateField(key, value) {
//     setForm((p) => ({ ...p, [key]: value }));
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();

//     const amountNum = Number(form.amount);
//     if (!form.amount || Number.isNaN(amountNum)) {
//       alert("Enter a valid amount");
//       return;
//     }

//     const parsedDate = new Date(form.date);
//     if (isNaN(parsedDate.getTime())) {
//       alert("Enter a valid date");
//       return;
//     }

//     setSaving(true);

//     let catId = form.category_id;
//     if (typeof catId === "object" && catId !== null) {
//       catId = catId._id ?? catId.id ?? String(catId);
//     }
//     if (catId === "") catId = null;

//     const tagsPayload = Array.isArray(form.tags) ? form.tags : String(form.tags || "").trim();

//     const payload = {
//       amount: amountNum,
//       date: parsedDate.toISOString(),
//       description: String(form.description || "").trim(),
//       category_id: catId,
//       currency: form.currency || "INR",
//       tags: tagsPayload,
//     };

//     try {
//       const txId = getId(initial);
//       let res;
//       if (txId) {
//         res = await transactionsAPI.update(txId, payload);
//       } else {
//         res = await transactionsAPI.create(payload);
//       }
//       const resultTx = res.transaction ?? res;
//       onSaved && onSaved(resultTx, !txId);
//     } catch (err) {
//       console.error("Transaction save failed - full error:", err);
//       const serverMsg = err?.response?.data?.message || JSON.stringify(err?.response?.data) || err.message;
//       alert("Save failed: " + serverMsg);
//     } finally {
//       setSaving(false);
//     }
//   }

//   // === Create Category handlers ===
//   function openCreate() {
//     setNewCatName("");
//     setNewCatType("expense");
//     setIsCreateOpen(true);
//   }
//   function closeCreate() {
//     setIsCreateOpen(false);
//     setCreatingCategory(false);
//   }

//   async function handleCreateCategory(e) {
//     e.preventDefault();
//     const name = String(newCatName || "").trim();
//     if (!name) {
//       alert("Category name is required");
//       return;
//     }

//     setCreatingCategory(true);
//     try {
//       const payload = { name, type: newCatType || "expense", parent_id: null };
//       const res = await categoriesAPI.create(payload);
//       const created = res.category ?? res;

//       // add created to categories and select it
//       setCategories((prev) => {
//         const exists = prev.some((c) => (c._id ?? c.id) === (created._id ?? created.id));
//         return exists ? prev : [created, ...prev];
//       });

//       // set selected category id in form
//       setForm((p) => ({ ...p, category_id: created._id ?? created.id ?? String(created) }));

//       closeCreate();
//     } catch (err) {
//       console.error("Create category failed:", err);
//       const serverMsg = err?.response?.data?.message || err?.message || "Failed to create category";
//       alert("Create category failed: " + serverMsg);
//       setCreatingCategory(false);
//     }
//   }

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl w-full">
//       <div className="flex items-center justify-between p-6 border-b border-gray-100">
//         <h2 className="text-xl font-bold text-[#0F172A]">
//           {initial ? "Edit Transaction" : "New Transaction"}
//         </h2>
//         <button
//           type="button"
//           onClick={onClose}
//           className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-[#0F172A]"
//           aria-label="Close"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       <form onSubmit={handleSubmit} className="p-6">
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Date</label>
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
//                 <input
//                   type="date"
//                   value={form.date}
//                   onChange={(e) => updateField("date", e.target.value)}
//                   className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Amount</label>
//               <div className="relative">
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={form.amount}
//                   onChange={(e) => updateField("amount", e.target.value)}
//                   className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
//                   placeholder="0.00"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
//             <div>
//               <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Category</label>
//               <div className="flex gap-2">
//                 <select
//                   value={form.category_id || ""}
//                   onChange={(e) => updateField("category_id", e.target.value)}
//                   className="flex-1 px-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
//                 >
//                   <option value="">— Select Category —</option>
//                   {categories.map((c) => (
//                     <option key={c._id ?? c.id} value={c._id ?? c.id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>

//                 {/* + button to open create category modal */}
//                 <button
//                   type="button"
//                   onClick={openCreate}
//                   className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-transparent bg-[#D1FAE5] hover:bg-[#BEEFD8] transition-colors"
//                   aria-label="Create category"
//                   title="Create new category"
//                 >
//                   <Plus className="w-4 h-4" style={{ color: "#0F172A" }} />
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Currency</label>
//               <input
//                 type="text"
//                 value={form.currency}
//                 onChange={(e) => updateField("currency", e.target.value)}
//                 className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
//                 placeholder="INR"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
//             <div className="relative">
//               <FileText className="absolute left-3 top-3 w-4 h-4 text-[#6B7280]" />
//               <input
//                 type="text"
//                 value={form.description}
//                 onChange={(e) => updateField("description", e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
//                 placeholder="Enter transaction details"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Tags</label>
//             <div className="relative">
//               <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
//               <input
//                 type="text"
//                 value={form.tags}
//                 onChange={(e) => updateField("tags", e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:border-[#4ADE80] focus:outline-none transition-colors text-[#0F172A] text-sm"
//                 placeholder="food, groceries, shopping"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
//           <button
//             type="button"
//             onClick={onClose}
//             className="flex-1 px-4 py-2.5 text-sm font-medium text-[#0F172A] bg-[#F3F4F6] hover:bg-[#D1FAE5] rounded-xl transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={saving}
//             className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#0F172A] bg-[#4ADE80] hover:bg-[#14B8A6] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
//           >
//             {saving ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               "Save Transaction"
//             )}
//           </button>
//         </div>
//       </form>

//       {/* ===== Create Category Modal (inline simple modal) ===== */}
//       {isCreateOpen && (
//         <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(2,6,23,0.35)" }}>
//           <div className="w-full max-w-md mx-4">
//             <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
//               <div className="flex items-center justify-between p-4 border-b">
//                 <h3 className="text-md font-semibold text-[#0F172A]">Create Category</h3>
//                 <button onClick={closeCreate} className="p-2 rounded hover:bg-[#F3F4F6]">
//                   <X className="w-4 h-4 text-[#6B7280]" />
//                 </button>
//               </div>

//               <form onSubmit={handleCreateCategory} className="p-4 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-[#0F172A] mb-1">Name</label>
//                   <input
//                     type="text"
//                     value={newCatName}
//                     onChange={(e) => setNewCatName(e.target.value)}
//                     className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] focus:bg-white focus:border-[#4ADE80] outline-none"
//                     placeholder="e.g. Coffee, Rent, Groceries"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-[#0F172A] mb-1">Type</label>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setNewCatType("expense")}
//                       className={`px-3 py-2 rounded-xl border ${newCatType === "expense" ? "bg-[#4ADE80] text-[#0F172A]" : "bg-[#F3F4F6]"}`}
//                     >
//                       Expense
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setNewCatType("income")}
//                       className={`px-3 py-2 rounded-xl border ${newCatType === "income" ? "bg-[#4ADE80] text-[#0F172A]" : "bg-[#F3F4F6]"}`}
//                     >
//                       Income
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <button
//                     type="button"
//                     onClick={closeCreate}
//                     className="px-3 py-2 rounded-xl bg-[#F3F4F6] text-[#0F172A]"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={creatingCategory}
//                     className="px-3 py-2 rounded-xl bg-[#4ADE80] text-[#0F172A] font-medium"
//                   >
//                     {creatingCategory ? "Creating..." : "Create"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
