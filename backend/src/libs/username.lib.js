const slug = (value) => String(value || "coder")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 24) || "coder";

export async function createAvailableUsername(db, name, email) {
  const base = slug(name || String(email).split("@")[0]);
  for (let suffix = 0; suffix < 10_000; suffix += 1) {
    const username = suffix ? `${base.slice(0, 24)}-${suffix}` : base;
    const existing = await db.user.findUnique({ where: { username }, select: { id: true } });
    if (!existing) return username;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
