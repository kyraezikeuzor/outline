"use client";

import { useState } from "react";
import { weeklyClasses, type WeeklyClass } from "@/data/weeklyClasses";
import InstructorCard from "./InstructorCard";
import UpcomingClasses from "./UpcomingClasses";
import WeeklyClassesCalendar from "./WeeklyClassesCalendar";

/**
 * Weekly Classes: instructor credibility beside the live schedule.
 *
 * `classes` defaults to the mock array but is a prop, so a future page can
 * pass sessions fetched from a real source without touching this component.
 */
export default function WeeklyClassesSection({
  shellClassName,
  sectionClassName,
  titleClassName,
  eyebrowClassName,
  leadClassName,
  classes = weeklyClasses,
}: {
  shellClassName: string;
  sectionClassName: string;
  titleClassName: string;
  eyebrowClassName: string;
  leadClassName: string;
  classes?: WeeklyClass[];
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <section id="weekly-classes" className={`scroll-mt-20 ${sectionClassName}`}>
      <div className={`${shellClassName} flex flex-col items-center`}>
        <p className={eyebrowClassName}>Live SAT prep</p>
        <h2 className={`mt-3 max-w-2xl text-center ${titleClassName}`}>
          Weekly classes
        </h2>
        <p className={`mt-4 max-w-xl text-center ${leadClassName}`}>
          Join live SAT Math and Reading &amp; Writing sessions every weekend.
        </p>

        <div className="mt-12 grid w-full items-stretch gap-5 lg:grid-cols-[2fr_3fr] lg:gap-6">
          <InstructorCard />
          <UpcomingClasses
            classes={classes}
            onViewAll={() => setCalendarOpen(true)}
          />
        </div>
      </div>

      <WeeklyClassesCalendar
        open={calendarOpen}
        classes={classes}
        onClose={() => setCalendarOpen(false)}
      />
    </section>
  );
}
