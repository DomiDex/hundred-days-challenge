import { RichTextField } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { RichTextRenderer } from "@/components/blog/RichTextRenderer";

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
      <RichTextRenderer field={slice.primary.content} className="prose prose-lg dark:prose-invert max-w-none" />
    </section>
  );
};

export default RichText;