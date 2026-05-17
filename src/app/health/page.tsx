import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function checkTable(table: string) {
  const { error } = await supabaseAdmin.from(table).select("count", { count: "exact", head: true });
  return { table, ok: !error, error: error?.message ?? null };
}

export default async function HealthPage() {
  const tables = [
    "items", "notifications", "user_collections", "profiles",
    "admins", "admin_notifications", "friendships", "messages", "feedback",
  ];

  const results = await Promise.all(tables.map(checkTable));

  // Check profiles columns
  let profileCols: string[] = [];
  const { data: profileData } = await supabaseAdmin.from("profiles").select("*").limit(1);
  if (profileData && profileData.length > 0) {
    profileCols = Object.keys(profileData[0]);
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>数据库状态检查</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>表名</th>
            <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>状态</th>
            <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>错误</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.table} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px 12px" }}>{r.table}</td>
              <td style={{ padding: "8px 12px", color: r.ok ? "green" : "red" }}>
                {r.ok ? "OK" : "FAIL"}
              </td>
              <td style={{ padding: "8px 12px", color: "#999", fontSize: 12 }}>{r.error ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 12 }}>profiles 表字段</h2>
      <div style={{ background: "#f5f5f5", padding: 12, borderRadius: 6 }}>
        {profileCols.length > 0
          ? profileCols.join(", ")
          : "profiles 表为空或无数据"}
      </div>

      <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 12 }}>缺少的字段</h2>
      <div style={{ background: "#fff3cd", padding: 12, borderRadius: 6 }}>
        {["avatar_url", "bio", "banner_url", "cabinet_views"]
          .filter((col) => !profileCols.includes(col))
          .map((col) => (
            <div key={col} style={{ color: "#856404" }}>
              缺少: {col} → ALTER TABLE profiles ADD COLUMN IF NOT EXISTS {col} ...
            </div>
          ))}
        {["avatar_url", "bio", "banner_url", "cabinet_views"].every((c) => profileCols.includes(c)) &&
          "所有字段完整"}
      </div>
    </div>
  );
}
