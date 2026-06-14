"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MedicineMaster,
  getMedicineActive,
  getMedicineId,
  medicineService,
} from "@/src/services/medicine.service";
import QuickAddMedicineModal from "./QuickAddMedicineModal";

type Props = {
  value?: string | null;
  onChange: (value: string) => void;
  onSelectMedicine: (medicine: MedicineMaster) => void;
  placeholder?: string;
  className?: string;
};

const SEARCH_DELAY_MS = 300;

const medicineLabel = (medicine: MedicineMaster) =>
  [medicine.medicineName, medicine.strength].filter(Boolean).join(" ");

export default function MedicineAutocomplete({
  value,
  onChange,
  onSelectMedicine,
  placeholder = "Medicine name",
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<MedicineMaster[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const inputValue = value ?? "";
  const keyword = inputValue.trim();
  const activeResults = useMemo(
    () => results.filter((medicine) => getMedicineActive(medicine)),
    [results]
  );
  const canQuickAdd = keyword.length > 0 && !loading;
  const showNotFound = open && keyword.length > 0 && !loading && !error && activeResults.length === 0;

  const updateDropdownPosition = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDropdownStyle({
      left: rect.left,
      top: rect.bottom + 4,
      width: rect.width,
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || keyword.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      setHighlightedIndex(-1);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const medicines = await medicineService.searchMedicines(keyword);
        if (!cancelled) {
          setResults(medicines);
          setHighlightedIndex(medicines.length > 0 ? 0 : -1);
        }
      } catch (searchError: any) {
        if (!cancelled) {
          setResults([]);
          setHighlightedIndex(-1);
          setError(searchError?.message || "Unable to search medicines.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [keyword, open]);

  useEffect(() => {
    if (!open) return;

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open, keyword]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const selectMedicine = (medicine: MedicineMaster) => {
    onSelectMedicine(medicine);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleCreated = async (medicine: MedicineMaster) => {
    onChange(medicine.medicineName || keyword);
    onSelectMedicine(medicine);
    setResults((current) => {
      const createdId = getMedicineId(medicine);
      const withoutDuplicate = current.filter((item) => getMedicineId(item) !== createdId);
      return [medicine, ...withoutDuplicate];
    });

    if (medicine.medicineName) {
      try {
        const refreshed = await medicineService.searchMedicines(medicine.medicineName);
        setResults(refreshed);
      } catch {
        setResults([medicine]);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((current) => {
        if (activeResults.length === 0) return -1;
        return current >= activeResults.length - 1 ? 0 : current + 1;
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => {
        if (activeResults.length === 0) return -1;
        return current <= 0 ? activeResults.length - 1 : current - 1;
      });
    }

    if (event.key === "Enter" && open && highlightedIndex >= 0) {
      event.preventDefault();
      const selected = activeResults[highlightedIndex];
      if (selected) selectMedicine(selected);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            window.requestAnimationFrame(updateDropdownPosition);
          }}
          onFocus={() => {
            setOpen(true);
            window.requestAnimationFrame(updateDropdownPosition);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("h-8 pl-8 pr-9 text-sm", className)}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {loading ? (
          <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {mounted && open && keyword.length > 0 ? createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg"
          style={{
            left: dropdownStyle.left,
            top: dropdownStyle.top,
            width: dropdownStyle.width,
          }}
        >
          <div className="max-h-72 overflow-y-auto p-1">
            {error ? (
              <div className="px-3 py-2 text-xs text-destructive">{error}</div>
            ) : null}

            {!error && keyword.length < 2 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Type at least 2 characters to search.
              </div>
            ) : null}

            {!error && activeResults.map((medicine, index) => (
              <button
                key={String(getMedicineId(medicine) ?? `${medicine.medicineName}-${index}`)}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectMedicine(medicine)}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm outline-none",
                  index === highlightedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{medicineLabel(medicine)}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[medicine.dosageForm, medicine.defaultDosage, medicine.defaultFrequency]
                      .filter(Boolean)
                      .join(" • ") || "Master medicine"}
                  </span>
                </span>
                {medicine.manufacturer ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {medicine.manufacturer}
                  </span>
                ) : null}
              </button>
            ))}

            {loading ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">Searching medicines...</div>
            ) : null}

            {showNotFound ? (
              <div className="space-y-2 px-3 py-3">
                <p className="text-sm font-medium">No medicines found.</p>
                <p className="text-xs text-muted-foreground">Medicine not found. Add to Master?</p>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setQuickAddOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Medicine
                </Button>
              </div>
            ) : null}

            {!showNotFound && canQuickAdd ? (
              <div className="border-t p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-start gap-1 text-xs"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setQuickAddOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Medicine
                </Button>
              </div>
            ) : null}
          </div>
        </div>,
        document.body
      ) : null}

      <QuickAddMedicineModal
        open={quickAddOpen}
        medicineName={keyword}
        onOpenChange={setQuickAddOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
