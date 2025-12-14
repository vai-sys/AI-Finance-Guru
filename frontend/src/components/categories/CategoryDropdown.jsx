import { Combobox } from "@headlessui/react";
import { ChevronsUpDown, Plus } from "lucide-react"

export default function CategoryDropdown({ categories, selected, onChange, onCreate }) {
  const [query, setQuery] = useState("");

  const filtered =
    query === ""
      ? categories
      : categories.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase())
        );

  const showCreate = query.trim().length > 0;

  return (
    <Combobox value={selected} onChange={onChange}>
      <div className="relative">
        {/* Input */}
        <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-[#F3F4F6] text-left shadow-sm focus-within:border-[#4ADE80] focus-within:bg-white transition-all">
          <Combobox.Input
            className="w-full border-none py-2.5 pl-4 pr-10 text-sm text-[#0F172A] bg-transparent focus:outline-none"
            displayValue={(cat) => cat?.name || ""}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Select Category"
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronsUpDown className="w-4 h-4 text-[#6B7280]" />
          </Combobox.Button>
        </div>

        {/* Dropdown */}
        <Combobox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-2 shadow-lg z-20 border border-gray-100">
          {filtered.map((c) => (
            <Combobox.Option
              key={c._id ?? c.id}
              value={c}
              className={({ active }) =>
                `cursor-pointer select-none px-4 py-2 text-sm rounded-lg ${
                  active ? "bg-[#D1FAE5]" : ""
                }`
              }
            >
              {c.name}
            </Combobox.Option>
          ))}

          {/* Create new category option */}
          {showCreate && (
            <div
              onClick={() => onCreate(query)}
              className="cursor-pointer px-4 py-2 text-sm text-[#0F172A] flex items-center gap-2 hover:bg-[#D1FAE5] rounded-lg mt-1"
            >
              <Plus className="w-4 h-4" />
              Create “{query}”
            </div>
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}
