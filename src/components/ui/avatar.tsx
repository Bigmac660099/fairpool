import { cn } from "@/lib/utils";

const sizes = {
  xs:    "h-7  w-7  text-xs",
  sm:    "h-9  w-9  text-sm",
  md:    "h-12 w-12 text-lg",
  lg:    "h-16 w-16 text-2xl",
  xl:    "h-24 w-24 text-4xl",
  "2xl": "h-32 w-32 text-5xl",
} as const;

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: keyof typeof sizes;
  className?: string;
  glow?: boolean;
  rank?: 1 | 2 | 3;
}

const rankRing: Record<1 | 2 | 3, string> = {
  1: "ring-2 ring-amber-400/70",
  2: "ring-2 ring-slate-300/70",
  3: "ring-2 ring-amber-600/60",
};

export function Avatar({ name, photoUrl, size = "md", className, rank }: AvatarProps) {
  const ringClass = rank ? rankRing[rank] : "";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("");

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={cn("rounded-full object-cover ring-border/30", sizes[size], ringClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/15 font-semibold text-primary",
        sizes[size],
        ringClass,
        className,
      )}
    >
      {initials}
    </div>
  );
}

/**
 * Candidate photo card with gradient overlay.
 */
export function CandidatePhoto({
  name,
  photoUrl,
  department,
  className,
  selected,
}: {
  name: string;
  photoUrl?: string | null;
  department?: string;
  className?: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        photoUrl ? "bg-muted" : "bg-gradient-to-br from-primary/15 via-teal-500/10 to-transparent",
        selected && "ring-2 ring-primary/50",
        className,
      )}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-4xl font-bold text-primary">
            {name.trim().charAt(0)}
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-6">
        <p className="font-semibold leading-tight text-white">{name}</p>
        {department && <p className="mt-0.5 text-xs text-white/65">{department}</p>}
      </div>
    </div>
  );
}
