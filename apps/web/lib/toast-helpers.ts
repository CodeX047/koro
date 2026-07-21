import { toast } from "sonner";

interface ToastPromiseOptions<T> {
  promise: Promise<T>;
  loading: string;
  success: string | ((data: T) => string);
  error?: string | ((err: any) => string);
}

/**
 * Standardized wrapper around sonner's toast.promise
 * Automatically extracts server error messages if custom error text is not provided.
 */
export function executeToastPromise<T>({
  promise,
  loading,
  success,
  error,
}: ToastPromiseOptions<T>): Promise<T> {
  toast.promise(promise, {
    loading,
    success: (data) => (typeof success === "function" ? success(data) : success),
    error: (err) => {
      if (typeof error === "function") return error(err);
      if (typeof error === "string") return error;
      return err?.message || "An unexpected error occurred. Please try again.";
    },
  });
  return promise;
}
