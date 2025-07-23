import { KeyTextField, RichTextField, ImageField } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

interface HeroSlice {
  id: string;
  slice_type: "hero";
  slice_label: string | null;
  primary: {
    title?: KeyTextField;
    description?: RichTextField;
    background_image: ImageField;
  };
  items: never[];
}

export type HeroProps = SliceComponentProps<HeroSlice>;

const Hero = ({ slice }: HeroProps) => {
  return (
    <section className="relative min-h-[400px] flex items-center justify-center text-white">
      {slice.primary.background_image.url && (
        <div className="absolute inset-0 z-0">
          <PrismicNextImage
            field={slice.primary.background_image}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {slice.primary.title}
        </h1>
        {slice.primary.description && (
          <div className="text-lg md:text-xl">
            <PrismicRichText field={slice.primary.description} />
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;