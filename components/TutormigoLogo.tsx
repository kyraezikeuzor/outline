import Image from "next/image";

export default function TutormigoLogo({
  className = "h-8 w-8",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/tutormigo-mark-blue.png"
      alt="Tutormigo"
      width={128}
      height={128}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
