import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = ({ ...props }: DialogPrimitive.DialogProps) => (
    <DialogPrimitive.Root modal={false} {...props} />
);
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetContent = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <SheetPortal>
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed inset-y-0 right-0 z-50 h-full w-[380px] border-l border-zinc-800 bg-zinc-900 p-0 shadow-2xl",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                "duration-300 ease-in-out",
                className,
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-zinc-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <X className="h-4 w-4 text-zinc-400" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-1.5 px-5 py-4 border-b border-zinc-800", className)}
        {...props}
    />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-base font-semibold text-zinc-100", className)}
        {...props}
    />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-zinc-500", className)}
        {...props}
    />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription };
