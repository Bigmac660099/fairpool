"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

/**
 * Embla-based carousel. Slides are 85% width with a soft border. Always pass
 * `dotLabels` (candidate first names). autoPlay defaults on (3s, stops on
 * interaction) — set false on the results page.
 */
export function MotionCarousel<T>({
  slides,
  renderSlide,
  dotLabels,
  autoPlay = true,
}: {
  slides: T[];
  renderSlide: (item: T, index: number) => ReactNode;
  dotLabels?: string[];
  autoPlay?: boolean;
}) {
  const plugins = autoPlay
    ? [Autoplay({ delay: 3000, stopOnInteraction: true })]
    : [];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: autoPlay, align: "center" }, plugins);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (slides.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((item, i) => (
            <div
              key={i}
              className="mr-3 min-w-0 flex-[0_0_85%] overflow-hidden rounded-lg border border-border/30"
            >
              {renderSlide(item, i)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs transition-colors",
              i === selected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent",
            )}
          >
            {dotLabels?.[i] ?? i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
