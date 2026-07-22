import { createClient } from './supabase'

export interface ChildProfile {
  id: string
  account_id: string
  nickname: string
  grade: number
  dream_job: string
  theme: string
  created_at?: string
}

export interface UserAccount {
  id: string
  email: string
  display_name?: string
  role: 'parent' | 'child'
}

export interface WishItem {
  id?: string
  child_id: string
  title: string
  target_points: number
  status?: string
}

const LOCAL_STORAGE_KEY_SESSION = 'kkum_jaram_session_user'
const LOCAL_STORAGE_KEY_CHILDREN = 'kkum_jaram_children'
const LOCAL_STORAGE_KEY_SECRETS = 'kkum_jaram_byok'
const LOCAL_STORAGE_KEY_WISHES = 'kkum_jaram_wishes'

// 데모용 기본 세션 유저 생성
function getFallbackUser(): UserAccount | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

export async function getCurrentUser(): Promise<UserAccount | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (user && !error) {
      // accounts 테이블 조회
      const { data: account } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        id: user.id,
        email: user.email || '',
        display_name: account?.display_name || user.email?.split('@')[0],
        role: account?.role || 'parent'
      }
    }
  } catch (e) {
    console.warn('Supabase auth failed or not configured, using fallback local session:', e)
  }

  return getFallbackUser()
}

export async function loginWithEmail(email: string, password?: string): Promise<UserAccount> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'defaultpass123!'
    })

    if (!error && data.user) {
      const userAcc: UserAccount = {
        id: data.user.id,
        email: data.user.email || email,
        display_name: email.split('@')[0],
        role: 'parent'
      }
      return userAcc
    }
  } catch (e) {
    console.warn('Supabase auth signin fallback:', e)
  }

  // Fallback demo login
  const demoUser: UserAccount = {
    id: 'demo-parent-uuid-001',
    email,
    display_name: email.split('@')[0] || '부모님',
    role: 'parent'
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(demoUser))
  }
  return demoUser
}

export async function registerParentAccount(email: string, displayName: string, password?: string): Promise<UserAccount> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || 'defaultpass123!',
      options: {
        data: { display_name: displayName }
      }
    })

    if (!error && data.user) {
      // accounts 테이블 저장 시도
      await supabase.from('accounts').insert({
        id: data.user.id,
        display_name: displayName,
        role: 'parent'
      })

      return {
        id: data.user.id,
        email: data.user.email || email,
        display_name: displayName,
        role: 'parent'
      }
    }
  } catch (e) {
    console.warn('Supabase auth signup fallback:', e)
  }

  const demoUser: UserAccount = {
    id: `parent-${Date.now()}`,
    email,
    display_name: displayName,
    role: 'parent'
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(demoUser))
  }
  return demoUser
}

export async function logoutUser() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch (e) {
    console.warn('Logout fallback:', e)
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION)
  }
}

// 아이 프로필 등록
export async function createChildProfile(
  accountId: string,
  nickname: string,
  grade: number,
  dreamJob: string,
  wishTitle?: string,
  wishTargetPoints: number = 100
): Promise<ChildProfile> {
  const childId = `child-${Date.now()}`
  const newChild: ChildProfile = {
    id: childId,
    account_id: accountId,
    nickname,
    grade,
    dream_job: dreamJob,
    theme: grade <= 6 ? 'elementary' : 'teen',
    created_at: new Date().toISOString()
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('children')
      .insert({
        account_id: accountId,
        nickname,
        grade,
        dream_job: dreamJob,
        theme: grade <= 6 ? 'elementary' : 'teen'
      })
      .select()
      .single()

    if (!error && data) {
      newChild.id = data.id
    }

    if (wishTitle) {
      await supabase.from('wishes').insert({
        child_id: newChild.id,
        title: wishTitle,
        target_points: wishTargetPoints,
        status: 'active'
      })
    }
  } catch (e) {
    console.warn('Children DB insert fallback:', e)
  }

  // Local storage fallback sync
  if (typeof window !== 'undefined') {
    const existing = getChildrenProfiles()
    existing.push(newChild)
    localStorage.setItem(LOCAL_STORAGE_KEY_CHILDREN, JSON.stringify(existing))

    if (wishTitle) {
      const wishes = getLocalWishes()
      wishes.push({
        id: `wish-${Date.now()}`,
        child_id: newChild.id,
        title: wishTitle,
        target_points: wishTargetPoints,
        status: 'active'
      })
      localStorage.setItem(LOCAL_STORAGE_KEY_WISHES, JSON.stringify(wishes))
    }
  }

  return newChild
}

export function getChildrenProfiles(): ChildProfile[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_CHILDREN)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

function getLocalWishes(): WishItem[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_WISHES)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

// BYOK (Anthropic API Key) 저장
export async function saveUserApiKey(accountId: string, apiKey: string) {
  try {
    const supabase = createClient()
    await supabase.from('user_secrets').upsert({
      account_id: accountId,
      anthropic_key_encrypted: apiKey, // Edge Function에서 암호화 처리 권장
      updated_at: new Date().toISOString()
    })
  } catch (e) {
    console.warn('API key save fallback:', e)
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_SECRETS, apiKey)
  }
}

export function getUserApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LOCAL_STORAGE_KEY_SECRETS)
}
