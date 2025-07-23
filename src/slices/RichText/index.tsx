import { RichTextField } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

interface RichTextSlice {
  id: string;
  slice_type: "rich_text";
  slice_label: string | null;
  primary: {
    content: RichTextField;
  };
  items: never[];
}

export type RichTextProps = SliceComponentProps<RichTextSlice>;

const RichText = ({ slice }: RichTextProps) => {
  return (
    <section className="max-w-4xl mx-auto px-6 py-8">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <PrismicRichText field={slice.primary.content} />
      </div>
    </section>
  );
};

export default RichText;