import { clsx } from "clsx"

export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  return clsx(inputs)
}
