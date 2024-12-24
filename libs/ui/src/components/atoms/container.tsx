import { BaseComponent } from '@foundation/util/types';

export const Container = ({ children, className }: BaseComponent) => (
  <div className={`container px-2 ${className}`}>{children}</div>
);
