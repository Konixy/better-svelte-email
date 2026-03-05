export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
