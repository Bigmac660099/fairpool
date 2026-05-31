import { cn } from "@/lib/utils";

const sizes = {
  sm:  "h-9 w-9 text-sm",
  md:  "h-12 w-12 text-lg",
  lg:  "h-16 w-16 text-2xl",
  xl:  "h-24 w-24 text-4xl",
} as const;

/**
 * Candidate/user avatar. When a photo is present it renders as a full-bleed
 * circle with a subtle inner shadow. Without a photo it falls back to a teal
 * gradient circle with the person's initial.
 */
export function Avatar({
  name,
  photoUrl,
  size = "md",
  className,
}: {
  name: string;
  photoUrl?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-2 ring-border/40",
          sizes[size],
          className,
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 font-semibold text-primary-foreground",
        sizes[size],
        className,
      )}
    >
      {name.trim().charAt(0)}
    </div>
  );
}

/**
 * Large card-style candidate photo — full bleed with name overlay at the
 * bottom (inspired by Medicy's product cards). Used in the vote carousels.
 */
export function CandidatePhoto({
  name,
  photoUrl,
  department,
  className,
}: {
  name: string;
  photoUrl?: string | null;
  department?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5",
        className,
      )}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 text-5xl font-bold text-primary-foreground">
            {name.trim().charAt(0)}
          </div>
        </div>
      )}
      {/* Bottom gradient name bar */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pb-3 pt-8">
        <p className="font-bold text-white drop-shadow">{name}</p>
        {department && (
          <p className="text-xs text-white/75">{department}</p>
        )}
      </div>
    </div>
  );
}
