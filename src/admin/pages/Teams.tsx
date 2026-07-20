import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { SITE } from "@/data/site"
import {
  fetchTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  fetchDesignations,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  ApiError,
  type TeamMember,
  type Role,
} from "@/lib/api"
import { LeadTable, DeleteButton } from "@/admin/components/LeadTable"
import { PageHeader } from "@/admin/components/PageHeader"
import { StatusBadge } from "@/admin/components/StatusBadge"
import { Modal } from "@/components/dashboard/Modal"
import { useConfirm } from "@/admin/components/ConfirmDialog"
import { useToast } from "@/admin/components/Toast"
import { useRequireMenu } from "@/admin/useAdminAuth"

const STORE_OPTIONS = [...SITE.addresses.map((a) => a.city), "Lapsoo"]

const MENU_OPTIONS = [
  { key: "products", label: "Products" },
  { key: "blog", label: "Blog" },
  { key: "leads", label: "Leads" },
  { key: "repair", label: "Repair" },
  { key: "sell", label: "Sell" },
  { key: "exchange", label: "Exchange" },
  { key: "customers", label: "Customers" },
  { key: "teams", label: "Teams" },
]

export default function Teams() {
  useRequireMenu("teams")
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null)
  const [adding, setAdding] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ["admin-team"], queryFn: fetchTeamMembers })
  const { data: roles } = useQuery({ queryKey: ["admin-roles"], queryFn: fetchRoles })

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateTeamMember(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-team"] }),
    onError: () => toast.error("Could not update team member."),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] })
      toast.success("Team member removed.")
    },
    onError: () => toast.error("Could not remove team member."),
  })

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Teams"
        subtitle="Staff accounts that can log into the admin panel."
        actions={
          <Button variant="accent" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add Team Member
          </Button>
        }
      />

      <div className="mt-6">
        <LeadTable
          isLoading={isLoading}
          empty={!data?.length}
          columns={["Name", "Email", "Phone", "Designation", "Store", "Role", "Status", ""]}
          rows={data?.map((m) => [
            m.name,
            m.email || "—",
            m.phone || "—",
            m.designation || "—",
            m.store || "—",
            m.role?.name || "—",
            <button onClick={() => toggleActive.mutate({ id: m.id, active: !m.active })}>
              <StatusBadge>{m.active ? "Active" : "Suspended"}</StatusBadge>
            </button>,
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setEditTarget(m)} className="p-2 rounded-lg hover:bg-ink/5">
                <Pencil className="h-4 w-4 text-ink/50" />
              </button>
              <DeleteButton
                onClick={async () => {
                  const ok = await confirm({ title: `Remove ${m.name}?`, description: "This cannot be undone.", confirmLabel: "Remove", danger: true })
                  if (ok) remove.mutate(m.id)
                }}
              />
            </div>,
          ])}
        />
      </div>

      <RolesSection roles={roles ?? []} />

      {editTarget && <EditTeamMemberModal member={editTarget} roles={roles ?? []} onClose={() => setEditTarget(null)} />}
      {adding && <AddTeamMemberModal roles={roles ?? []} onClose={() => setAdding(false)} />}
    </div>
  )
}

function DesignationField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: designations } = useQuery({ queryKey: ["admin-designations"], queryFn: fetchDesignations })
  return (
    <div>
      <Label htmlFor="designation">Designation</Label>
      <Input
        id="designation"
        list="designation-options"
        placeholder="e.g. Technician, Store Manager"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id="designation-options">
        {designations?.map((d) => <option key={d} value={d} />)}
      </datalist>
    </div>
  )
}

function TeamMemberFields({
  name, setName, email, setEmail, phone, setPhone, designation, setDesignation, store, setStore, roleId, setRoleId, roles,
}: {
  name: string; setName: (v: string) => void
  email: string; setEmail: (v: string) => void
  phone: string; setPhone: (v: string) => void
  designation: string; setDesignation: (v: string) => void
  store: string; setStore: (v: string) => void
  roleId: string; setRoleId: (v: string) => void
  roles: Role[]
}) {
  return (
    <>
      <div>
        <Label htmlFor="tm-name">Full Name</Label>
        <Input id="tm-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div>
        <Label htmlFor="tm-email">Email</Label>
        <Input id="tm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="tm-phone">Phone</Label>
        <Input id="tm-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <DesignationField value={designation} onChange={setDesignation} />
      <div>
        <Label htmlFor="tm-store">Store</Label>
        <Select id="tm-store" value={store} onChange={(e) => setStore(e.target.value)}>
          <option value="">Select store</option>
          {STORE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="tm-role">Role</Label>
        <Select id="tm-role" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
          <option value="">Select role</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select>
      </div>
    </>
  )
}

function AddTeamMemberModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [designation, setDesignation] = useState("")
  const [store, setStore] = useState("")
  const [roleId, setRoleId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () => createTeamMember({ name, email, phone, designation, store, roleId: roleId || null, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] })
      toast.success("Team member created.")
      onClose()
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create team member. Please try again."),
  })

  return (
    <Modal open onClose={onClose} title="Add Team Member" maxWidth="max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
          }
          create.mutate()
        }}
        className="mt-4 space-y-3"
      >
        <TeamMemberFields
          name={name} setName={setName}
          email={email} setEmail={setEmail}
          phone={phone} setPhone={setPhone}
          designation={designation} setDesignation={setDesignation}
          store={store} setStore={setStore}
          roleId={roleId} setRoleId={setRoleId}
          roles={roles}
        />
        <div>
          <Label htmlFor="tm-password">Password</Label>
          <Input id="tm-password" type="text" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Team Member"}
        </Button>
      </form>
    </Modal>
  )
}

function EditTeamMemberModal({ member, roles, onClose }: { member: TeamMember; roles: Role[]; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [name, setName] = useState(member.name)
  const [email, setEmail] = useState(member.email ?? "")
  const [phone, setPhone] = useState(member.phone ?? "")
  const [designation, setDesignation] = useState(member.designation ?? "")
  const [store, setStore] = useState(member.store ?? "")
  const [roleId, setRoleId] = useState(member.role?.id ?? "")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const update = useMutation({
    mutationFn: () =>
      updateTeamMember(member.id, {
        name,
        email,
        phone,
        designation,
        store,
        roleId: roleId || null,
        ...(newPassword ? { newPassword } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] })
      toast.success("Team member updated.")
      onClose()
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update team member. Please try again."),
  })

  return (
    <Modal open onClose={onClose} title="Edit Team Member" maxWidth="max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (newPassword && newPassword.length < 8) {
            setError("Password must be at least 8 characters")
            return
          }
          update.mutate()
        }}
        className="mt-4 space-y-3"
      >
        <TeamMemberFields
          name={name} setName={setName}
          email={email} setEmail={setEmail}
          phone={phone} setPhone={setPhone}
          designation={designation} setDesignation={setDesignation}
          store={store} setStore={setStore}
          roleId={roleId} setRoleId={setRoleId}
          roles={roles}
        />
        <div>
          <Label htmlFor="tm-new-password">New Password (optional)</Label>
          <Input id="tm-new-password" type="text" placeholder="Leave blank to keep current" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Modal>
  )
}

function RolesSection({ roles }: { roles: Role[] }) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [adding, setAdding] = useState(false)

  const remove = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      toast.success("Role deleted.")
    },
    onError: () => toast.error("Could not delete role."),
  })

  return (
    <div className="mt-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Roles</h2>
          <p className="mt-1 text-sm text-ink/50">Control which admin panel sections each role can access.</p>
        </div>
        <Button variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add Role
        </Button>
      </div>

      <div className="mt-4">
        <LeadTable
          isLoading={false}
          empty={roles.length === 0}
          columns={["Role", "Menu Access", "Members", ""]}
          rows={roles.map((r) => [
            <span className="font-medium">{r.name}</span>,
            <span className="text-ink/60">{r.menuKeys.join(", ") || "—"}</span>,
            <span className="text-ink/60">{r._count?.teamMembers ?? 0}</span>,
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setEditingRole(r)} className="p-2 rounded-lg hover:bg-ink/5">
                <Pencil className="h-4 w-4 text-ink/50" />
              </button>
              <DeleteButton
                onClick={async () => {
                  const ok = await confirm({ title: `Delete role "${r.name}"?`, confirmLabel: "Delete", danger: true })
                  if (ok) remove.mutate(r.id)
                }}
              />
            </div>,
          ])}
        />
      </div>

      {editingRole && <RoleModal role={editingRole} onClose={() => setEditingRole(null)} />}
      {adding && <RoleModal onClose={() => setAdding(false)} />}
    </div>
  )
}

function RoleModal({ role, onClose }: { role?: Role; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [name, setName] = useState(role?.name ?? "")
  const [menuKeys, setMenuKeys] = useState<string[]>(role?.menuKeys ?? [])
  const [error, setError] = useState<string | null>(null)

  const toggleKey = (key: string) => {
    setMenuKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const save = useMutation({
    mutationFn: () => (role ? updateRole(role.id, { name, menuKeys }) : createRole({ name, menuKeys })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      toast.success(role ? "Role updated." : "Role created.")
      onClose()
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not save role. Please try again."),
  })

  return (
    <Modal open onClose={onClose} title={role ? "Edit Role" : "Add Role"} maxWidth="max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          save.mutate()
        }}
        className="mt-4 space-y-3"
      >
        <div>
          <Label htmlFor="role-name">Role Name</Label>
          <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label>Menu Access</Label>
          <div className="mt-1.5 space-y-1.5">
            {MENU_OPTIONS.map((m) => (
              <label key={m.key} className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" className="h-4 w-4" checked={menuKeys.includes(m.key)} onChange={() => toggleKey(m.key)} />
                {m.label}
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={save.isPending}>
          {save.isPending ? "Saving..." : "Save Role"}
        </Button>
      </form>
    </Modal>
  )
}
