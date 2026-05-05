import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const AlertDialog = DialogPrimitive.Root;
const AlertDialogTrigger = DialogPrimitive.Trigger;

const AlertDialogContent = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-1/2 top-1/2 z-[100] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-xl",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "duration-200",
                className,
            )}
            {...props}
        />
    </DialogPrimitive.Portal>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogTitle = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold text-zinc-100", className)}
        {...props}
    />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("mt-2 text-sm text-zinc-400", className)}
        {...props}
    />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

interface ConfirmDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
}

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
}: ConfirmDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
                <div className="mt-6 flex justify-end gap-3">
                    <DialogPrimitive.Close asChild>
                        <Button variant="outline" size="sm">
                            Cancel
                        </Button>
                    </DialogPrimitive.Close>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
};
