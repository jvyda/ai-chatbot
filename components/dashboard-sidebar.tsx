'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function DashboardSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setOpenMobile(false)}
              className="w-full flex items-center py-2 px-3 text-sm rounded-md hover:bg-muted"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpenMobile(false)}
              className="w-full flex items-center py-2 px-3 text-sm rounded-md hover:bg-muted"
            >
              Settings
            </Link>
            <Link
              href="/dashboard/system-prompts"
              onClick={() => setOpenMobile(false)}
              className="w-full flex items-center py-2 px-3 text-sm rounded-md hover:bg-muted"
            >
              System Prompts
            </Link>
            <Link
              href="/dashboard/api-integrations"
              onClick={() => setOpenMobile(false)}
              className="w-full flex items-center py-2 px-3 text-sm rounded-md hover:bg-muted"
            >
              API Integrations
            </Link>
            <Link
              href="/dashboard/billing"
              onClick={() => setOpenMobile(false)}
              className="w-full flex items-center py-2 px-3 text-sm rounded-md hover:bg-muted"
            >
              Billing
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setOpenMobile(false)}
              className="w-full flex items-center py-2 px-3 text-sm rounded-md hover:bg-muted"
            >
              User Profile
            </Link>
          </div>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
