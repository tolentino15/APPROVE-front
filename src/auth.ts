// Helpers simples; troque pelos seus serviços reais quando integrar
export type UserRole = 'admin' | 'client'

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

// Exemplo: role guardada a parte (pode vir do JWT ou da API)
export function getRole(): UserRole | null {
  return (localStorage.getItem('role') as UserRole | null) ?? null
}
export function setRole(role: UserRole) {
  localStorage.setItem('role', role)
}

export function clearRole() {
  localStorage.removeItem('role')
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
}

// Caso seu backend mande JWT com claim "role", você pode decodificar:
// (deixe para quando integrar de verdade)
// export function roleFromJwt(token: string): UserRole | null { ... }
