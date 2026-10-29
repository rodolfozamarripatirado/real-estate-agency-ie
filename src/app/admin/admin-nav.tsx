"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import {
  Building,
  Calendar,
  House,
  Sliders,
  Users,
} from "@/components/icons";

export function AdminNav({
  mobile = false,
  role,
}: {
  mobile?: boolean;
  role: "ADMIN" | "AGENT";
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const items = [
    { href: "/admin", label: t.admin.dashboard, icon: House, adminOnly: false },
    {
      href: "/admin/properties",
      label: t.admin.properties,
      icon: Building,
      adminOnly: false,
    },
    {
      href: "/admin/enquiries",
      label: t.admin.enquiries,
      icon: Calendar,
      adminOnly: false,
    },
    {
      href: "/admin/users",
      label: t.admin.users.nav,
      icon: Users,
      adminOnly: true,
    },
    {
      href: "/admin/settings",
      label: t.admin.settings,
      icon: Sliders,
      adminOnly: true,
    },
  ].filter((item) => !item.adminOnly || role === "ADMIN");

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      className={mobile ? "flex items-center gap-1 overflow-x-auto" : "mt-9 space-y-1"}
      aria-label="Staff"
    >
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              mobile
                ? `flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                    active
                      ? "bg-pine text-cream"
                      : "text-muted hover:bg-pine/5 hover:text-pine"
                  }`
                : `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                    active
                      ? "bg-cream/12 text-cream"
                      : "text-cream/55 hover:bg-cream/5 hover:text-cream"
                  }`
            }
          >
            <item.icon className="text-base" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
