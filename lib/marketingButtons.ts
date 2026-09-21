/** Public landing-page actions, matching the filled and outlined pill design. */
export function marketingButtonClass(variant: "primary" | "secondary" = "primary", compact = false) {
  return [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 font-dm font-medium leading-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arc-accent disabled:opacity-40",
    compact ? "min-h-10 px-3 py-2 text-sm sm:px-4" : "min-h-12 px-6 py-3 text-base sm:px-7",
    variant === "primary"
      ? "border-[#171717] bg-[#171717] text-white hover:border-[#333333] hover:bg-[#333333]"
      : "border-[#E5E5E5] bg-white text-[#747474] hover:border-[#CFCFCF] hover:text-[#525252]",
  ].join(" ");
}
