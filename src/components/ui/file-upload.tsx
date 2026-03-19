'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, X, File, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  accept?: string
  maxSize?: number // MB, default 10
  multiple?: boolean
  onUpload: (files: File[]) => Promise<void>
  className?: string
  label?: string
}

interface PreviewFile {
  file: File
  preview: string | null
  uploading: boolean
  error?: string
}

export function FileUpload({
  accept = 'image/*',
  maxSize = 10,
  multiple = false,
  onUpload,
  className,
  label = 'Arrastra archivos aquí o haz clic para seleccionar',
}: FileUploadProps) {
  const [files, setFiles] = useState<PreviewFile[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(fileList: FileList) {
    const newFiles: PreviewFile[] = []
    for (const file of Array.from(fileList)) {
      if (file.size > maxSize * 1024 * 1024) {
        newFiles.push({ file, preview: null, uploading: false, error: `Máximo ${maxSize}MB` })
        continue
      }

      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      newFiles.push({ file, preview, uploading: false })
    }

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles])
    } else {
      setFiles(newFiles.slice(0, 1))
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  function removeFile(index: number) {
    setFiles(prev => {
      const copy = [...prev]
      if (copy[index].preview) URL.revokeObjectURL(copy[index].preview!)
      copy.splice(index, 1)
      return copy
    })
  }

  async function handleUpload() {
    const validFiles = files.filter(f => !f.error)
    if (validFiles.length === 0) return

    setFiles(prev => prev.map(f => ({ ...f, uploading: true })))

    try {
      await onUpload(validFiles.map(f => f.file))
      setFiles([])
    } catch (err: any) {
      setFiles(prev => prev.map(f => ({ ...f, uploading: false, error: err.message })))
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all',
          dragging
            ? 'border-cyan-400 bg-cyan-500/5'
            : 'border-white/10 hover:border-white/20 bg-white/5'
        )}
      >
        <Upload className={cn('h-8 w-8 mb-2', dragging ? 'text-cyan-400' : 'text-[#94A3B8]')} />
        <p className="text-sm text-[#94A3B8]">{label}</p>
        <p className="text-xs text-[#94A3B8]/50 mt-1">Máximo {maxSize}MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3"
            >
              {f.preview ? (
                <img src={f.preview} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                  <File className="h-5 w-5 text-[#94A3B8]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#FAFAFA] truncate">{f.file.name}</p>
                <p className="text-xs text-[#94A3B8]">
                  {(f.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                {f.error && <p className="text-xs text-red-400">{f.error}</p>}
              </div>
              {f.uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              ) : (
                <button onClick={(e) => { e.stopPropagation(); removeFile(i) }} className="p-1 hover:text-red-400 text-[#94A3B8]">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={files.some(f => f.uploading) || files.every(f => !!f.error)}
            className="w-full rounded-lg bg-cyan-500/10 border border-cyan-500/30 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
          >
            {files.some(f => f.uploading) ? 'Subiendo...' : `Subir ${files.filter(f => !f.error).length} archivo(s)`}
          </button>
        </div>
      )}
    </div>
  )
}
