declare module "framer-motion" {
  import type { ComponentType, HTMLAttributes, RefAttributes } from "react";

  type MotionComponentProps = Omit<HTMLAttributes<HTMLElement>, "style"> &
    RefAttributes<HTMLElement> & {
      initial?: unknown;
      animate?: unknown;
      whileInView?: unknown;
      viewport?: unknown;
      transition?: unknown;
      style?: Record<string, unknown>;
    };

  export const motion: {
    div: ComponentType<MotionComponentProps>;
  };

  export function useScroll(options?: unknown): {
    scrollYProgress: unknown;
  };

  export function useTransform(
    value: unknown,
    inputRange: number[],
    outputRange: unknown[]
  ): unknown;
}
