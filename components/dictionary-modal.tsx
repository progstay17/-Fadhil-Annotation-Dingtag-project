"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  getKnownEntities,
  addKnownEntity,
  removeKnownEntity,
  exportKnownEntities,
  importKnownEntities,
  KnownEntity,
} from "@/lib/known-entities"
import { Book, Trash2, Download, Upload, Plus } from "lucide-react"

export interface DictionaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DictionaryModal({ open, onOpenChange }: DictionaryModalProps) {
  const [dictionaryEntities, setDictionaryEntities] = useState<KnownEntity[]>([])
  const [newKey, setNewKey] = useState("")
  const [newCanonical, setNewCanonical] = useState("")
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [pendingImportJson, setPendingImportJson] = useState("")
  const [importMessage, setImportMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (open) {
      setDictionaryEntities(getKnownEntities())
      setImportMessage(null)
    }
  }, [open])

  const handleAddEntity = () => {
    if (!newKey.trim() || !newCanonical.trim()) return
    const updated = addKnownEntity(newKey, newCanonical)
    setDictionaryEntities(updated)
    setNewKey("")
    setNewCanonical("")
  }

  const handleRemoveEntity = (key: string) => {
    const updated = removeKnownEntity(key)
    setDictionaryEntities(updated)
  }

  const handleExport = () => {
    exportKnownEntities()
  }

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const existing = getKnownEntities()
      if (existing.length === 0) {
        // Direct import without confirmation
        const res = importKnownEntities(content, "merge")
        if (res.success) {
          setDictionaryEntities(getKnownEntities())
          setImportMessage({ text: `Berhasil import ${res.count} entry`, type: "success" })
        } else {
          setImportMessage({ text: res.error || "Gagal import file", type: "error" })
        }
      } else {
        setPendingImportJson(content)
        setShowImportConfirm(true)
      }
    }
    reader.readAsText(file)
    // Clear input so same file can be selected again
    e.target.value = ""
  }

  const executeImport = (mode: "merge" | "replace") => {
    const res = importKnownEntities(pendingImportJson, mode)
    setShowImportConfirm(false)
    setPendingImportJson("")
    if (res.success) {
      setDictionaryEntities(getKnownEntities())
      setImportMessage({ text: `Berhasil import ${res.count} entry`, type: "success" })
    } else {
      setImportMessage({ text: res.error || "Gagal import file", type: "error" })
    }
  }

  return (
    <>
      {/* Known Entities Dictionary Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              Kelola Dictionary (Brand/Tempat)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Form Tambah Entry */}
            <div className="flex flex-col gap-2 bg-secondary/30 p-3 rounded-lg border border-border">
              <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Tambah Entry Baru
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Kata asli (contoh: shopee)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="font-mono text-xs bg-card border border-border rounded px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Bentuk benar (contoh: Shopee)"
                  value={newCanonical}
                  onChange={(e) => setNewCanonical(e.target.value)}
                  className="font-mono text-xs bg-card border border-border rounded px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleAddEntity}
                disabled={!newKey.trim() || !newCanonical.trim()}
                className="font-mono text-xs font-bold uppercase bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded flex items-center justify-center gap-1 transition-all cursor-pointer mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>

            {/* List Entry */}
            <div className="border border-border rounded-lg overflow-hidden flex flex-col">
              <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/50 px-3 py-2 border-b border-border">
                List Entry ({dictionaryEntities.length})
              </p>
              <div className="max-h-48 overflow-y-auto divide-y divide-border/60 scrollbar-thin">
                {dictionaryEntities.length === 0 ? (
                  <p className="font-mono text-xs text-muted-foreground italic text-center py-6">
                    Belum ada entry dictionary.
                  </p>
                ) : (
                  dictionaryEntities.map((entity) => (
                    <div
                      key={entity.key}
                      className="flex items-center justify-between px-3 py-2 bg-card hover:bg-secondary/10 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-muted-foreground line-through decoration-muted-foreground/30">
                          {entity.key}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-bold text-foreground">{entity.canonical}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveEntity(entity.key)}
                        className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Export / Import */}
            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <button
                onClick={handleExport}
                className="font-mono text-xs font-bold uppercase bg-secondary text-foreground hover:bg-secondary/80 border border-border px-3 py-2 rounded flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>

              <label className="font-mono text-xs font-bold uppercase bg-secondary text-foreground hover:bg-secondary/80 border border-border px-3 py-2 rounded flex items-center gap-1.5 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Import Status Message */}
            {importMessage && (
              <p
                className={`font-mono text-xs text-center font-bold p-2 rounded ${
                  importMessage.type === "success"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-red-500/10 text-red-600"
                }`}
              >
                {importMessage.text}
              </p>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full font-mono text-xs font-bold uppercase bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2.5 rounded border border-border transition-all cursor-pointer"
            >
              Tutup
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Merge vs Replace */}
      <Dialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary">
              Konfirmasi Import Dictionary
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="font-mono text-xs text-foreground leading-relaxed">
              Ditemukan data dictionary yang sudah ada di browser ini. Pilih bagaimana Anda ingin
              memasukkan file dictionary yang baru:
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <div className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded">
                <p className="font-mono text-xs font-bold text-blue-600">Gabung (Merge)</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  Menambahkan entry baru dan memperbarui kata asli yang sama tanpa menghapus entry yang
                  sudah ada.
                </p>
              </div>
              <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded">
                <p className="font-mono text-xs font-bold text-red-600">Timpa Semua (Replace)</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  MENGHAPUS seluruh entry dictionary saat ini dan menggantinya dengan yang ada di file.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row items-center gap-2 justify-end">
            <button
              onClick={() => setShowImportConfirm(false)}
              className="font-mono text-xs font-bold uppercase bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2 rounded border border-border transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={() => executeImport("merge")}
              className="font-mono text-xs font-bold uppercase bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded transition-all cursor-pointer"
            >
              Gabung (Merge)
            </button>
            <button
              onClick={() => executeImport("replace")}
              className="font-mono text-xs font-bold uppercase bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded transition-all cursor-pointer"
            >
              Timpa (Replace)
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
