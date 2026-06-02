import { cn } from "@/lib/utils";

const sizes = {
  xs:  "h-7  w-7  text-xs",
  sm:  "h-9  w-9  text-sm",
  md:  "h-12 w-12 text-lg",
  lg:  "h-16 w-16 text-2xl",
  xl:  "h-24 w-24 text-4xl",
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
  1: "ring-4 ring-yellow-400/70 shadow-lg shadow-yellow-400/30",
  2: "ring-4 ring-slate-300/70  shadow-md shadow-slate-300/20",
  3: "ring-4 ring-amber-600/60  shadow-md shadow-amber-600/20",
};

export function Avatar({ name, photoUrl, size = "md", className, glow, rank }: AvatarProps) {
  const ringClass = rank ? rankRing[rank] : glow ? "ring-2 ring-primary/50 shadow-glow-sm" : "";

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={cn("rounded-full object-cover", sizes[size], ringClass, className)}
      />
    );
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("");

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-primary via-teal-400 to-emerald-400 font-bold text-white",
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
 * Large card-style candidate photo with premium overlay.
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
        photoUrl
          ? "bg-black"
          : "bg-gradient-to-br from-primary/30 via-teal-500/15 to-emerald-400/10",
        selected && "ring-2 ring-primary/60",
        className,
      )}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} className="h-full w-full object-cover opacity-90" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-400 text-5xl font-bold text-white shadow-glow-md">
            {name.trim().charAt(0)}
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Name bar */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-6">
        <p className="font-bold leading-tight text-white drop-shadow-sm">{name}</p>
        {department && (
          <p className="mt-0.5 text-xs text-white/70">{department}</p>
        )}
      </div>

      {/* Premium shimmer on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
}
