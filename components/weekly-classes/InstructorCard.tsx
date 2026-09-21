import Image from "next/image";

/**
 * The instructor half of Weekly Classes, built on the original homepage card:
 * a light-grey outer card, a white inner panel holding a large circular
 * portrait with the credential pills pinned to its edges, then the copy on the
 * grey below.
 *
 * `self-start` keeps the row's stretch from padding the card out to the
 * schedule column's height. The card stays `relative` so the score report can
 * be re-anchored to its bottom-right corner when it comes back.
 */
export default function InstructorCard() {
  return (
    <div className="relative self-start rounded-[28px] bg-mkt-surface p-5 sm:p-7 lg:p-7">
      <div className="rounded-[20px] bg-white p-4 sm:p-5">
        <div className="relative mx-auto aspect-square w-full">
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <Image
              src="/landing/kyra-hero.jpg"
              alt="Kyra, Tutormigo's instructor"
              fill
              sizes="(max-width: 1024px) 80vw, 460px"
              className="object-cover object-[center_20%]"
            />
          </div>
          <span className="absolute right-0 top-[6%] z-10 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-medium text-[#166534]">
            1560 SAT
          </span>
          <span className="absolute bottom-[6%] left-0 z-10 rounded-full bg-[#FCE7F3] px-3 py-1 text-xs font-medium text-[#9D174D]">
            Columbia University
          </span>
        </div>
      </div>

      <div className="mt-7">
        <h3 className="text-[1.75rem] font-medium leading-[1.15] tracking-[-0.015em] text-[#0A0A0A]">
          Learn from a 1560 scorer.
        </h3>
        <p className="mt-3 text-base leading-relaxed text-[#5A5A5A]">
          Live SAT Math and Reading &amp; Writing classes every weekend with
          Kyra, a Columbia computer science student.
        </p>
      </div>

      {/* Score report hidden for now. To restore: re-import
          ./SATScoreReport, render it here with
          className="mx-auto mt-8 lg:absolute lg:-bottom-6 lg:-right-4 lg:mx-0 lg:mt-0 lg:w-[13.5rem]"
          and put lg:pb-52 back on the card to reserve the band it sits in. */}
    </div>
  );
}

