'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '../atoms/sheet';
import { Menu } from 'lucide-react';
import { BaseComponent } from '@foundation/util/types';

import { useDialogState } from '@foundation/util/hooks';
export const Sidebar = ({ children }: BaseComponent) => {
  const session = useSession();

  const [open, setOpen] = useDialogState();

  if (!session.data?.user) {
    return <Link href="/sign-in">Sign In</Link>;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* when asChild is true, it prevents Radix (Shadcn is built on Radix) from rendering a default DOM element (e.g., button in this case). Instead, it transfers functionality like onClick to the child component (e.g., the Menu SVG). */}
      <SheetTrigger asChild>
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent>{children}</SheetContent>
    </Sheet>
  );
};
