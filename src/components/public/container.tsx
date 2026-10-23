import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav" | "main" | "article";
};

/**
 * The one place the public page width and side gutters are defined. Nav,
 * footer and every public page/section wrap their content in it, so all
 * their left and right edges line up at every width: 16px gutters on a
 * phone, growing to 64px from `xl`, and at most 1600px wide (centred) on
 * large screens. Safe in client components (no server-only imports).
 */
export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
