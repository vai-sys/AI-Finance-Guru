


// import { useEffect, useState } from "react";
// import { transactionsAPI } from "../../service/transactionsService"; 
// import TransactionForm from "./TransactionForm.jsx";
// import { Plus, Edit3, Trash2, Loader2, ChevronLeft, ChevronRight, Calendar, TrendingUp, Tag, Search, X, Filter } from "lucide-react";

// export default function TransactionsList() {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [total, setTotal] = useState(0);
//   const [pages, setPages] = useState(0);

//   const [editingTx, setEditingTx] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);

//   // Filter states
//   const [filters, setFilters] = useState({
//     startDate: "",
//     endDate: "",
//     category_id: "",
//     tag: "",
//     minAmount: "",
//     maxAmount: ""
//   });

//   async function loadTransactions(p = page, currentFilters = filters) {
//     try {
//       setLoading(true);
//       setError("");
      
//       const params = { page: p, limit };
      
//       // Add filters to params if they exist
//       if (currentFilters.startDate) params.startDate = currentFilters.startDate;
//       if (currentFilters.endDate) params.endDate = currentFilters.endDate;
//       if (currentFilters.category_id) params.category_id = currentFilters.category_id;
//       if (currentFilters.tag) params.tag = currentFilters.tag;
//       if (currentFilters.minAmount) params.minAmount = currentFilters.minAmount;
//       if (currentFilters.maxAmount) params.maxAmount = currentFilters.maxAmount;
      
//       const data = await transactionsAPI.list(params);
//       setTransactions(data.transactions || []);
//       setPage(data.page || p);
//       setTotal(data.total || 0);
//       setPages(data.pages || 0);
//     } catch (err) {
//       console.error("Failed to load transactions:", err);
//       setError(err.response?.data?.message || "Failed to load transactions");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadTransactions(1);
//   }, []);

//   async function handleDelete(id) {
//     if (!window.confirm("Are you sure you want to delete this transaction?")) return;
//     const old = transactions;
//     setTransactions((prev) => prev.filter((t) => (t._id ?? t.id) !== id));
//     try {
//       await transactionsAPI.remove(id);
//       loadTransactions(page); // Reload to get accurate count
//     } catch (err) {
//       alert("Delete failed");
//       setTransactions(old);
//       console.error(err);
//     }
//   }

//   function handleAdd() {
//     setEditingTx(null);
//     setShowForm(true);
//   }

//   function handleEdit(tx) {
//     setEditingTx(tx);
//     setShowForm(true);
//   }

//   function handleSaved(savedTx, isNew = false) {
//     setShowForm(false);
//     setEditingTx(null);
//     loadTransactions(1); // Reload from page 1
//   }

//   function handleFilterChange(key, value) {
//     setFilters(prev => ({ ...prev, [key]: value }));
//   }

//   function applyFilters() {
//     loadTransactions(1, filters);
//   }

//   function clearFilters() {
//     const emptyFilters = {
//       startDate: "",
//       endDate: "",
//       category_id: "",
//       tag: "",
//       minAmount: "",
//       maxAmount: ""
//     };
//     setFilters(emptyFilters);
//     loadTransactions(1, emptyFilters);
//   }

//   const hasActiveFilters = Object.values(filters).some(v => v !== "");

//   if (loading && transactions.length === 0) {
//     return (
//       <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="w-10 h-10 text-[#4ADE80] animate-spin" />
//           <p className="text-[#6B7280] text-sm font-medium">Loading transactions...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error && transactions.length === 0) {
//     return (
//       <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#EF4444]/30">
//           <p className="text-[#EF4444] font-semibold">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F3F4F6] py-8 px-4">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-[#0F172A] mb-1">Transactions</h1>
//             <p className="text-sm text-[#6B7280] font-medium">
//               {total > 0 ? `${total} transaction${total !== 1 ? 's' : ''} found` : 'Track your income and expenses'}
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 ${
//                 hasActiveFilters 
//                   ? 'text-white bg-[#14B8A6] hover:bg-[#0D9488]' 
//                   : 'text-[#0F172A] bg-white hover:bg-[#F3F4F6] border-2 border-[#D1FAE5]'
//               }`}
//             >
//               <Filter className="w-4 h-4" />
//               Filters
//               {hasActiveFilters && <span className="px-2 py-0.5 bg-white text-[#14B8A6] rounded-full text-xs font-bold">On</span>}
//             </button>
//             <button
//               onClick={handleAdd}
//               className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-[#0F172A] bg-[#4ADE80] hover:bg-[#14B8A6] rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
//             >
//               <Plus className="w-4 h-4" />
//               Add Transaction
//             </button>
//           </div>
//         </div>

//         {/* Filters Panel */}
//         {showFilters && (
//           <div className="bg-white rounded-2xl shadow-lg border-2 border-[#D1FAE5] p-6 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
//               {/* Date Range */}
//               <div>
//                 <label className="block text-xs font-bold text-[#6B7280] mb-2">Start Date</label>
//                 <input
//                   type="date"
//                   value={filters.startDate}
//                   onChange={(e) => handleFilterChange('startDate', e.target.value)}
//                   className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-xs font-bold text-[#6B7280] mb-2">End Date</label>
//                 <input
//                   type="date"
//                   value={filters.endDate}
//                   onChange={(e) => handleFilterChange('endDate', e.target.value)}
//                   className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
//                 />
//               </div>

//               {/* Tag Search */}
//               <div>
//                 <label className="block text-xs font-bold text-[#6B7280] mb-2">Tag</label>
//                 <input
//                   type="text"
//                   value={filters.tag}
//                   onChange={(e) => handleFilterChange('tag', e.target.value)}
//                   placeholder="Search by tag..."
//                   className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
//                 />
//               </div>

//               {/* Amount Range */}
//               <div>
//                 <label className="block text-xs font-bold text-[#6B7280] mb-2">Min Amount</label>
//                 <input
//                   type="number"
//                   value={filters.minAmount}
//                   onChange={(e) => handleFilterChange('minAmount', e.target.value)}
//                   placeholder="0"
//                   className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-[#6B7280] mb-2">Max Amount</label>
//                 <input
//                   type="number"
//                   value={filters.maxAmount}
//                   onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
//                   placeholder="999999"
//                   className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
//                 />
//               </div>
//             </div>

//             {/* Filter Actions */}
//             <div className="flex items-center gap-3 justify-end">
//               <button
//                 onClick={clearFilters}
//                 disabled={!hasActiveFilters}
//                 className="px-5 py-2 text-sm font-semibold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 Clear
//               </button>
//               <button
//                 onClick={applyFilters}
//                 className="px-5 py-2 text-sm font-bold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-lg transition-all shadow-md hover:shadow-lg"
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Form Modal Overlay */}
//         {showForm && (
//           <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <TransactionForm
//               initial={editingTx}
//               onSaved={(tx, isNew) => handleSaved(tx, isNew)}
//               onClose={() => { setShowForm(false); setEditingTx(null); }}
//             />
//           </div>
//         )}

//         {/* Transactions List */}
//         {transactions.length === 0 ? (
//           <div className="bg-white rounded-2xl shadow-lg border-2 border-[#D1FAE5] p-16 text-center">
//             <div className="w-20 h-20 bg-gradient-to-br from-[#4ADE80] to-[#14B8A6] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
//               <TrendingUp className="w-10 h-10 text-[#0F172A]" />
//             </div>
//             <h3 className="text-xl font-bold text-[#0F172A] mb-2">
//               {hasActiveFilters ? 'No transactions found' : 'No transactions yet'}
//             </h3>
//             <p className="text-sm text-[#6B7280] mb-8 font-medium">
//               {hasActiveFilters 
//                 ? 'Try adjusting your filters or clear them to see all transactions' 
//                 : 'Start your financial journey by adding your first transaction'}
//             </p>
//             <button
//               onClick={hasActiveFilters ? clearFilters : handleAdd}
//               className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#0F172A] bg-[#4ADE80] hover:bg-[#14B8A6] rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
//             >
//               {hasActiveFilters ? (
//                 <>
//                   <X className="w-4 h-4" />
//                   Clear Filters
//                 </>
//               ) : (
//                 <>
//                   <Plus className="w-4 h-4" />
//                   Add Transaction
//                 </>
//               )}
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {loading && (
//               <div className="flex items-center justify-center py-4">
//                 <Loader2 className="w-6 h-6 text-[#4ADE80] animate-spin" />
//               </div>
//             )}
//             {transactions.map((t) => {
//               const category = t.category_id ?? t.category;
//               const isIncome = category?.type === 'income';
              
//               return (
//                 <div
//                   key={t._id ?? t.id}
//                   className="bg-white rounded-xl border-2 border-[#D1FAE5] p-4 hover:border-[#4ADE80] hover:shadow-lg transition-all group"
//                 >
//                   <div className="flex items-start justify-between gap-6">
                 
//                      <div className="flex flex-col  gap-4 ">
//    <p className="text-[#0F172A] font-semibold text-base mb-1">
//      {t.description || t.note || "No description"}
//    </p>
//    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
//      <span>{new Date(t.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
//     {category && (
//       <>
//         <span className="w-1 h-1 bg-[#6B7280] rounded-full"></span>
//         <span>{category.name}</span>
//       </>
//     )}
//   </div>
//    {t.tags && t.tags.length > 0 && (
//                         <div className="flex items-center gap-2 flex-wrap">
//                           {t.tags.map((tag, idx) => (
//                             <span
//                               key={idx}
//                               className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F172A] bg-[#D1FAE5] rounded-lg"
//                             >
//                               <Tag className="w-3 h-3" />
//                               {tag}
//                             </span>
//                           ))}
//                         </div>
//                       )}
// </div>

//                     {/* Right side - Amount and Actions */}
//                     <div className="flex items-center gap-3 flex-shrink-0">
//                       {/* Amount */}
//                       <div className="text-right">
//                         <div className={`text-xl font-bold ${isIncome ? 'text-[#4ADE80]' : 'text-[#EF4444]'}`}>
//                           {isIncome ? '' : '-'}{t.currency === "INR" ? "₹" : t.currency}{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                         </div>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => handleEdit(t)}
//                           className="px-4 py-2 text-sm font-semibold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#D1FAE5] rounded-lg transition-all"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(t._id ?? t.id)}
//                           className="px-4 py-2 text-sm font-semibold text-[#EF4444] bg-white hover:bg-[#EF4444]/5 rounded-lg transition-all border border-[#EF4444]/20"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Pagination */}
//         {transactions.length > 0 && pages > 1 && (
//           <div className="mt-8 flex items-center justify-between">
//             <button
//               onClick={() => { if (page > 1) loadTransactions(page - 1); }}
//               disabled={page <= 1}
//               className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F172A] bg-white hover:bg-[#D1FAE5] rounded-xl border-2 border-[#D1FAE5] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white shadow-md hover:shadow-lg"
//             >
//               <ChevronLeft className="w-4 h-4" />
//               Previous
//             </button>

//             <div className="px-5 py-2 bg-white border-2 border-[#4ADE80] rounded-xl shadow-md">
//               <span className="text-sm font-bold text-[#0F172A]">
//                 Page {page} of {pages}
//               </span>
//             </div>

//             <button
//               onClick={() => loadTransactions(page + 1)}
//               disabled={page >= pages}
//               className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F172A] bg-white hover:bg-[#D1FAE5] rounded-xl border-2 border-[#D1FAE5] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white shadow-md hover:shadow-lg"
//             >
//               Next
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { transactionsAPI } from "../../service/transactionsService"; 
import TransactionForm from "./TransactionForm.jsx";
import { Plus, Edit3, Trash2, Loader2, ChevronLeft, ChevronRight, Calendar, TrendingUp, Tag, Search, X, Filter } from "lucide-react";
import { categoriesAPI } from "../../service/categoriesService.js";

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const [editingTx, setEditingTx] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  
  const [categories, setCategories] = useState([]);

 
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category_id: "", 
    tag: "",
    minAmount: "",
    maxAmount: ""
  });

 
  function toNumberOrUndefined(v) {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  function toISOStartOfDay(dateStr) {
    if (!dateStr) return undefined;
 
    const d = new Date(dateStr + "T00:00:00");
    return d.toISOString();
  }
  function toISOEndOfDay(dateStr) {
    if (!dateStr) return undefined;
    const d = new Date(dateStr + "T23:59:59.999");
    return d.toISOString();
  }
  
  function normalizeCategoryId(cat) {
    if (!cat) return undefined;
    if (typeof cat === "string") return cat.trim() || undefined;
    if (typeof cat === "object") {
      return cat._id ?? cat.id ?? undefined;
    }
    return undefined;
  }

 
  async function fetchCategories() {
    try {
      const data = await categoriesAPI.list();
      const list =
        data?.categories ??  
        data?.data ??        
        data?.items ??      
        data ?? [];         

      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("Could not fetch categories for dropdown:", err);
      setCategories([]);
    }
  }

  async function loadTransactions(p = page, currentFilters = filters) {
    try {
      setLoading(true);
      setError("");

      const params = { page: p, limit };

    
      const startDateIso = toISOStartOfDay(currentFilters.startDate);
      const endDateIso = toISOEndOfDay(currentFilters.endDate);
      if (startDateIso) params.startDate = startDateIso;
      if (endDateIso) params.endDate = endDateIso;

     
      const cid = normalizeCategoryId(currentFilters.category_id);
      if (cid) params.category_id = cid;

 
      if (currentFilters.tag) {
        const tagVal = String(currentFilters.tag).trim();
        if (tagVal) params.tag = tagVal;
      }

    
      const min = toNumberOrUndefined(currentFilters.minAmount);
      const max = toNumberOrUndefined(currentFilters.maxAmount);
      if (min !== undefined) params.minAmount = min;
      if (max !== undefined) params.maxAmount = max;

     
     

      const data = await transactionsAPI.list(params);
      setTransactions(data.transactions || []);
      setPage(data.page || p);
      setTotal(data.total || 0);
      setPages(data.pages || 0);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions(1);
    fetchCategories();
  
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    const old = transactions;
    setTransactions((prev) => prev.filter((t) => (t._id ?? t.id) !== id));
    try {
      await transactionsAPI.remove(id);
      loadTransactions(page); 
    } catch (err) {
      alert("Delete failed");
      setTransactions(old);
      console.error(err);
    }
  }

  function handleAdd() {
    setEditingTx(null);
    setShowForm(true);
  }

  function handleEdit(tx) {
    setEditingTx(tx);
    setShowForm(true);
  }

  function handleSaved(savedTx, isNew = false) {
    setShowForm(false);
    setEditingTx(null);
    loadTransactions(1); 
  }

  
  function handleFilterChange(key, value) {
    const v = (value === null || value === undefined) ? "" : value;
    setFilters(prev => ({ ...prev, [key]: v }));
  }

  function applyFilters() {
  
    loadTransactions(1, filters);
  }

  function clearFilters() {
    const emptyFilters = {
      startDate: "",
      endDate: "",
      category_id: "",
      tag: "",
      minAmount: "",
      maxAmount: ""
    };
    setFilters(emptyFilters);
    loadTransactions(1, emptyFilters);
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#4ADE80] animate-spin" />
          <p className="text-[#6B7280] text-sm font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#EF4444]/30">
          <p className="text-[#EF4444] font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-8 px-4">
      <div className="max-w-5xl mx-auto">
     
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-1">Transactions</h1>
            <p className="text-sm text-[#6B7280] font-medium">
              {total > 0 ? `${total} transaction${total !== 1 ? 's' : ''} found` : 'Track your income and expenses'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 ${
                hasActiveFilters 
                  ? 'text-white bg-[#14B8A6] hover:bg-[#0D9488]' 
                  : 'text-[#0F172A] bg-white hover:bg-[#F3F4F6] border-2 border-[#D1FAE5]'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="px-2 py-0.5 bg-white text-[#14B8A6] rounded-full text-xs font-bold">On</span>}
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-[#0F172A] bg-[#4ADE80] hover:bg-[#14B8A6] rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </div>

       
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#D1FAE5] p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            
              <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
                />
              </div>

              {/* Tag Search */}
              {/* <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-2">Tag</label>
                <input
                  type="text"
                  value={filters.tag}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                  placeholder="Search by tag..."
                  className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
                />
              </div> */}

         
              <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-2">Category</label>
                <select
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm bg-white"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c._id ?? c.id ?? c.name} value={c._id ?? c.id ?? c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

            
              <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-2">Min Amount</label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-2">Max Amount</label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  placeholder="999999"
                  className="w-full px-4 py-2 border-2 border-[#D1FAE5] rounded-lg focus:outline-none focus:border-[#4ADE80] text-sm"
                />
              </div>
            </div>

         
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="px-5 py-2 text-sm font-semibold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="px-5 py-2 text-sm font-bold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <TransactionForm
              initial={editingTx}
              onSaved={(tx, isNew) => handleSaved(tx, isNew)}
              onClose={() => { setShowForm(false); setEditingTx(null); }}
            />
          </div>
        )}

      
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#D1FAE5] p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4ADE80] to-[#14B8A6] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <TrendingUp className="w-10 h-10 text-[#0F172A]" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">
              {hasActiveFilters ? 'No transactions found' : 'No transactions yet'}
            </h3>
            <p className="text-sm text-[#6B7280] mb-8 font-medium">
              {hasActiveFilters 
                ? 'Try adjusting your filters or clear them to see all transactions' 
                : 'Start your financial journey by adding your first transaction'}
            </p>
            <button
              onClick={hasActiveFilters ? clearFilters : handleAdd}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#0F172A] bg-[#4ADE80] hover:bg-[#14B8A6] rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {hasActiveFilters ? (
                <>
                  <X className="w-4 h-4" />
                  Clear Filters
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-[#4ADE80] animate-spin" />
              </div>
            )}
            {transactions.map((t) => {
              const category = t.category_id ?? t.category;
              const isIncome = category?.type === 'income';
              
              return (
                <div
                  key={t._id ?? t.id}
                  className="bg-white rounded-xl border-2 border-[#D1FAE5] p-4 hover:border-[#4ADE80] hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex flex-col gap-4 ">
                      <p className="text-[#0F172A] font-semibold text-base mb-1">
                        {t.description || t.note || "No description"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <span>{new Date(t.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
                        {category && (
                          <>
                            <span className="w-1 h-1 bg-[#6B7280] rounded-full"></span>
                            <span>{category.name}</span>
                          </>
                        )}
                      </div>
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {t.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F172A] bg-[#D1FAE5] rounded-lg"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right side - Amount and Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Amount */}
                      <div className="text-right">
                        <div className={`text-xl font-bold ${isIncome ? 'text-[#4ADE80]' : 'text-[#EF4444]'}`}>
                          {isIncome ? '' : '-'}{t.currency === "INR" ? "₹" : t.currency}{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="px-4 py-2 text-sm font-semibold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#D1FAE5] rounded-lg transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t._id ?? t.id)}
                          className="px-4 py-2 text-sm font-semibold text-[#EF4444] bg-white hover:bg-[#EF4444]/5 rounded-lg transition-all border border-[#EF4444]/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

       
        {transactions.length > 0 && pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => { if (page > 1) loadTransactions(page - 1); }}
              disabled={page <= 1}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F172A] bg-white hover:bg-[#D1FAE5] rounded-xl border-2 border-[#D1FAE5] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white shadow-md hover:shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="px-5 py-2 bg-white border-2 border-[#4ADE80] rounded-xl shadow-md">
              <span className="text-sm font-bold text-[#0F172A]">
                Page {page} of {pages}
              </span>
            </div>

            <button
              onClick={() => loadTransactions(page + 1)}
              disabled={page >= pages}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F172A] bg-white hover:bg-[#D1FAE5] rounded-xl border-2 border-[#D1FAE5] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white shadow-md hover:shadow-lg"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
