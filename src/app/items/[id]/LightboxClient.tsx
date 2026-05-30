"use client";

import { useState } from "react";
import type { CarouselImage } from "@/components/ImageCarousel";
import Lightbox from "@/components/Lightbox";

type LightboxClientProps = {
  images: CarouselImage[];
  type: "official" | "real";
  children: (props: { onOpen: (index: number) => void }) => React.ReactNode;
};

export default function LightboxClient({ images, type, children }: LightboxClientProps) {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  function handleOpen(index: number) {
    setStartIndex(index);
    setOpen(true);
  }

  return (
    <>
      {children({ onOpen: handleOpen })}
      {open && images.length > 0 && (
        <Lightbox
          images={images}
          currentIndex={startIndex}
          type={type}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
