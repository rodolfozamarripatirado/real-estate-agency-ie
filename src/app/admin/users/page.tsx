import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getI18n } from "@/lib/i18n-server";
import { Check, Users } from "@/components/icons";
import { CreateUserForm, UserRow } from "./user-manager";

type SearchParams = Promise<{ status?: string }>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const admin = await requireAdmin();
  const { t } = await getI18n();
  const params = await searchParams;

  const status = typeof params.status === "string" ? params.status : "";
  const notice =
    status === "deleted"
      ? t.admin.users.deleted
      : status === "self"
        ? t.admin.users.cannotDeleteSelf
        : status === "lastAdmin"
          ? t.admin.users.lastAdmin
          : status === "notFound"
            ? t.admin.users.notFound
            : "";

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start gap-3">
        <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-pine/5 text-lg text-pine">
          <Users />
        </span>
        <div>
          <p className="eyebrow">{t.admin.dashboard}</p>
          <h1 className="mt-1 font-display text-3xl text-ink">
            {t.admin.users.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{t.admin.users.help}</p>
        </div>
      </div>

      {notice ? (
        <p className="mt-6 flex items-center gap-2 rounded-xl border border-pine/20 bg-pine/5 px-4 py-3 text-sm text-pine">
          <Check className="text-base" />
          {notice}
        </p>
      ) : null}

      <CreateUserForm />

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">{t.admin.users.nav}</h2>
        {users.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t.admin.users.noUsers}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {users.map((account) => (
              <UserRow
                key={account.id}
                account={account}
                isCurrentUser={account.id === admin.sub}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
