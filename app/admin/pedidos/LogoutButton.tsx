"use client"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 16px", background: "transparent", color: "#fff",
        border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px",
        fontSize: "0.875rem", cursor: "pointer"
      }}
    >
      Sair
    </button>
  )
}