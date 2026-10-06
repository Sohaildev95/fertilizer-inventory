"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface DialogContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType>({
  open: false,
  onOpenChange: () => {},
})

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function Dialog({ open = false, onOpenChange = () => {}, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({
  children,
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <button
      type="button"
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  )
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DialogOverlay({ className }: { className?: string }) {
  return null
}

function DialogClose({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DialogContext)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    React.useEffect(() => {
      if (!open) return

      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onOpenChange(false)
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = prevOverflow
        window.removeEventListener("keydown", handleKeyDown)
      }
    }, [open, onOpenChange])

    if (!mounted || !open) return null

    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop overlay covering 100% of viewport including sidebar and navbar */}
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />

        {/* Modal Card - Persistent height, flex-col, outer container does NOT scroll */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-[101] w-full max-w-xl bg-slate-900 border border-slate-800 text-white shadow-2xl rounded-3xl max-h-[85vh] flex flex-col overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>,
      document.body
    )
  }
)
DialogContent.displayName = "DialogContent"

function DialogHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <div
      className={cn(
        "flex-shrink-0 flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-800 relative bg-slate-900",
        className
      )}
      {...props}
    >
      <div className="flex-1 pr-6">{children}</div>
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        aria-label="Close"
        className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95 cursor-pointer mt-0.5"
      >
        <X className="h-4 w-4 stroke-[2.5]" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
DialogHeader.displayName = "DialogHeader"

function DialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto px-6 py-5 custom-scrollbar space-y-4 overscroll-contain",
        className
      )}
      {...props}
    />
  )
}
DialogBody.displayName = "DialogBody"

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-shrink-0 px-6 py-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-2 mt-auto",
        className
      )}
      {...props}
    />
  )
}
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold text-white leading-tight tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-slate-400 mt-0.5", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
