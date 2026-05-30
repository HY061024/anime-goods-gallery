"use client";

import { useState } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import type { CarouselImage } from "@/components/ImageCarousel";
import Lightbox from "@/components/Lightbox";

type LightboxClientProps = {
  images: CarouselImage[];
  type: "official" | "real";
};

export default function LightboxClient({ images, type }: LightboxClientProps) {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  function handleOpen(index: number) {
    setStartIndex(index);
    setOpen(true);
  }

  return (
    <>
      <ImageCarousel images={images} type={type} onImageClick={handleOpen} />
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
