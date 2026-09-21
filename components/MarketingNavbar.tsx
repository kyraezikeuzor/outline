import Image from "next/image";
import Link from "next/link";
import { marketingButtonClass } from "@/lib/marketingButtons";

type MarketingNavbarProps = {
  currentPage?: "home" | "pricing";
  /**
   * "onDark" makes the bar transparent so it can sit on the landing hero's
   * navy. Everything else keeps the default white bar.
   */
  variant?: "light" | "onDark";
};

const NAV_ITEMS = [
  { label: "How it works", homeHref: "#steps", pricingHref: "/#steps" },
  {
    label: "Weekly classes",
    homeHref: "#weekly-classes",
    pricingHref: "/#weekly-classes",
  },
  { label: "Reviews", homeHref: "#reviews", pricingHref: "/#reviews" },
  { label: "Pricing", homeHref: "/pricing", pricingHref: "#plans" },
  { label: "FAQs", homeHref: "#faqs", pricingHref: "#faqs" },
] as const;

export default function MarketingNavbar({
  currentPage = "home",
  variant = "light",
}: MarketingNavbarProps) {
  const onDark = variant === "onDark";

  const shell = onDark
    ? "absolute inset-x-0 top-0 z-40 bg-transparent"
    : "sticky top-0 z-40 border-b-2 border-[#E8E8E8] bg-white/95 backdrop-blur";
  const wordmark = onDark ? "text-white" : "text-[#0A0A0A]";
  const navLink = onDark
    ? "text-white/70 hover:text-white"
    : "text-[#747474] hover:text-[#0A0A0A]";
  const navCurrent = onDark ? "text-white" : "text-[#0A0A0A]";
  const loginBtn = onDark
    ? "text-white/80 hover:text-white"
    : "bg-[#F2F2F2] text-[#525252] hover:bg-[#E8E8E8]";
  const ctaBtn = onDark
    ? "bg-white text-mkt-navy hover:bg-white/90"
    : "bg-[#0A0A0A] text-white hover:bg-[#2D2D2D]";

  return (
    <header className={shell}>
      <div className="mx-auto flex h-16 max-w-[78rem] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src={onDark ? "/tutormigo-mark-white.png" : "/tutormigo-mark-blue.png"}
            alt="Tutormigo"
            width={34}
            height={34}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className={`font-dm text-xl font-medium tracking-[-0.025em] ${wordmark}`}>
            Tutormigo
          </span>
        </Link>

        <nav className="hidden items-center gap-5 font-sans text-sm font-medium lg:flex xl:gap-7">
          {NAV_ITEMS.map((item) => {
            const href =
              currentPage === "pricing" ? item.pricingHref : item.homeHref;
            const isCurrent =
              item.label === "Pricing" && currentPage === "pricing";

            return (
              <Link
                key={item.label}
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`whitespace-nowrap transition ${navLink} ${
                  isCurrent ? navCurrent : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className={currentPage === "home" ? marketingButtonClass("secondary", true) : `rounded-full px-3 py-2.5 font-sans text-sm font-semibold transition sm:px-4 ${loginBtn}`}
          >
            Log in
          </Link>
          <Link
            href="/login"
            className={currentPage === "home" ? marketingButtonClass("primary", true) : `rounded-full px-4 py-2.5 font-sans text-sm font-semibold transition sm:px-5 ${ctaBtn}`}
          >
            Open app
          </Link>
        </div>
      </div>
    </header>
  );
}
