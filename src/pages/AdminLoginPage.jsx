import LoginForm from '../components/auth/LoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <LoginForm isAdmin={true} />
    </div>
  )
}
