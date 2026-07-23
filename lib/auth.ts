import { createClient } from './supabase'

export interface ChildProfile {
  id: string
  account_id: string
  nickname: string
  grade: number
  dream_job?: string
  actual_job?: string
  theme?: string
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
  proof_image_path?: string
  parent_message?: string
  redemption_type?: string
  achieved_at?: string
}

const LOCAL_STORAGE_KEY_SESSION = 'kkum_jaram_session_user'
const LOCAL_STORAGE_KEY_CHILDREN = 'kkum_jaram_children'
const LOCAL_STORAGE_KEY_SECRETS = 'kkum_jaram_byok'
const LOCAL_STORAGE_KEY_WISHES = 'kkum_jaram_wishes'
const LOCAL_STORAGE_KEY_POINTS = 'kkum_jaram_points'

// 현재 로그인 사용자 세션 조회
export async function getCurrentUser(): Promise<UserAccount | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (user && !error) {
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
    console.warn('Supabase auth check failed or not configured, using fallback:', e)
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
  }
  return null
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

// DB 기반 자녀 프로필 CRUD
export async function fetchChildrenProfiles(accountId: string): Promise<ChildProfile[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        account_id: item.account_id,
        nickname: item.nickname,
        grade: item.grade,
        dream_job: item.dream_job || item.actual_job || '꿈나무 🌟',
        actual_job: item.actual_job || item.dream_job || '꿈나무 🌟',
        theme: item.theme || (item.grade <= 6 ? 'elementary' : 'teen'),
        created_at: item.created_at
      }))
    }
  } catch (e) {
    console.warn('Supabase fetch children fallback:', e)
  }

  return getChildrenProfiles()
}

export async function createChildProfile(
  accountId: string,
  nickname: string,
  grade: number,
  dreamJob: string,
  wishTitle?: string,
  wishTargetPoints: number = 100
): Promise<ChildProfile> {
  const childId = `child-${Date.now()}`
  let createdProfile: ChildProfile = {
    id: childId,
    account_id: accountId,
    nickname,
    grade,
    dream_job: dreamJob,
    actual_job: dreamJob,
    theme: grade <= 6 ? 'elementary' : 'teen',
    created_at: new Date().toISOString()
  }

  try {
    const supabase = createClient()

    // 1. accounts 테이블 부모 계정 레코드 보장 (외래키 제약조건 방지)
    if (accountId && !accountId.startsWith('parent-') && accountId !== 'demo-parent-uuid-001') {
      await supabase.from('accounts').upsert({
        id: accountId,
        role: 'parent'
      }, { onConflict: 'id' })
    }

    // 2. children 테이블에 데이터 삽입 (actual_job 포함 시도 ➔ 실패 시 fallback 시도)
    let res = await supabase
      .from('children')
      .insert({
        account_id: accountId,
        nickname,
        grade,
        dream_job: dreamJob,
        actual_job: dreamJob,
        theme: grade <= 6 ? 'elementary' : 'teen'
      })
      .select()
      .single()

    if (res.error) {
      // actual_job 컬럼 미존재 스키마 환경 대비 Fallback 쿼리
      res = await supabase
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
    }

    if (!res.error && res.data) {
      createdProfile = {
        id: res.data.id,
        account_id: res.data.account_id,
        nickname: res.data.nickname,
        grade: res.data.grade,
        dream_job: res.data.dream_job || res.data.actual_job || dreamJob,
        actual_job: res.data.actual_job || res.data.dream_job || dreamJob,
        theme: res.data.theme,
        created_at: res.data.created_at
      }
    } else if (res.error) {
      console.warn('Supabase children insert error:', res.error)
    }

    // 3. 소원상자 등록
    if (wishTitle && createdProfile.id) {
      await supabase.from('wishes').insert({
        child_id: createdProfile.id,
        title: wishTitle,
        target_points: wishTargetPoints,
        status: 'active'
      })
    }
  } catch (e) {
    console.warn('Children DB insert fallback:', e)
  }

  // 4. 로컬스토리지 보완 동기화 (목록 최상단 추가)
  if (typeof window !== 'undefined') {
    const existing = getChildrenProfiles()
    const isAlreadyIn = existing.some(item => item.id === createdProfile.id)
    if (!isAlreadyIn) {
      existing.unshift(createdProfile)
      localStorage.setItem(LOCAL_STORAGE_KEY_CHILDREN, JSON.stringify(existing))
    }

    if (wishTitle) {
      const wishes = getLocalWishes()
      wishes.unshift({
        id: `wish-${Date.now()}`,
        child_id: createdProfile.id,
        title: wishTitle,
        target_points: wishTargetPoints,
        status: 'active'
      })
      localStorage.setItem(LOCAL_STORAGE_KEY_WISHES, JSON.stringify(wishes))
    }
  }

  return createdProfile
}

export async function updateChildProfile(
  childId: string,
  nickname: string,
  grade: number,
  dreamJob: string,
  wishTitle?: string,
  wishTargetPoints: number = 100
): Promise<void> {
  try {
    const supabase = createClient()

    let res = await supabase
      .from('children')
      .update({
        nickname,
        grade,
        dream_job: dreamJob,
        actual_job: dreamJob,
        theme: grade <= 6 ? 'elementary' : 'teen'
      })
      .eq('id', childId)

    if (res.error) {
      await supabase
        .from('children')
        .update({
          nickname,
          grade,
          dream_job: dreamJob,
          theme: grade <= 6 ? 'elementary' : 'teen'
        })
        .eq('id', childId)
    }

    if (wishTitle) {
      const { data: existingWishes } = await supabase
        .from('wishes')
        .select('*')
        .eq('child_id', childId)
        .eq('status', 'active')

      if (existingWishes && existingWishes.length > 0) {
        await supabase
          .from('wishes')
          .update({
            title: wishTitle,
            target_points: wishTargetPoints
          })
          .eq('id', existingWishes[0].id)
      } else {
        await supabase.from('wishes').insert({
          child_id: childId,
          title: wishTitle,
          target_points: wishTargetPoints,
          status: 'active'
        })
      }
    }
  } catch (e) {
    console.warn('Update child profile fallback:', e)
  }

  if (typeof window !== 'undefined') {
    const existing = getChildrenProfiles()
    const updated = existing.map((item) =>
      item.id === childId
        ? {
            ...item,
            nickname,
            grade,
            dream_job: dreamJob,
            actual_job: dreamJob,
            theme: grade <= 6 ? 'elementary' : 'teen'
          }
        : item
    )
    localStorage.setItem(LOCAL_STORAGE_KEY_CHILDREN, JSON.stringify(updated))

    if (wishTitle) {
      const wishes = getLocalWishes()
      const wishIdx = wishes.findIndex((w) => w.child_id === childId && w.status === 'active')
      if (wishIdx >= 0) {
        wishes[wishIdx].title = wishTitle
        wishes[wishIdx].target_points = wishTargetPoints
      } else {
        wishes.unshift({
          id: `wish-${Date.now()}`,
          child_id: childId,
          title: wishTitle,
          target_points: wishTargetPoints,
          status: 'active'
        })
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_WISHES, JSON.stringify(wishes))
    }
  }
}

export async function deleteChildProfile(childId: string): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('children').delete().eq('id', childId)
  } catch (e) {
    console.warn('Delete child profile fallback:', e)
  }

  if (typeof window !== 'undefined') {
    const existing = getChildrenProfiles()
    const filtered = existing.filter((item) => item.id !== childId)
    localStorage.setItem(LOCAL_STORAGE_KEY_CHILDREN, JSON.stringify(filtered))

    const wishes = getLocalWishes()
    const filteredWishes = wishes.filter((w) => w.child_id !== childId)
    localStorage.setItem(LOCAL_STORAGE_KEY_WISHES, JSON.stringify(filteredWishes))
  }
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

export async function fetchChildPoints(childId: string): Promise<number> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('points_ledger')
      .select('delta')
      .eq('child_id', childId)

    if (!error && data) {
      const sum = data.reduce((acc: number, cur: any) => acc + (cur.delta || 0), 0)
      return Math.max(120, sum)
    }
  } catch (e) {
    console.warn('Fetch points ledger fallback:', e)
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY_POINTS}_${childId}`)
    if (stored) {
      return Number(stored) || 120
    }
  }
  return 120
}

export async function addPointsLedger(childId: string, delta: number, reason: string): Promise<number> {
  try {
    const supabase = createClient()
    await supabase.from('points_ledger').insert({
      child_id: childId,
      delta,
      reason
    })
  } catch (e) {
    console.warn('Add points ledger fallback:', e)
  }

  const current = await fetchChildPoints(childId)
  const newTotal = current + delta
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_POINTS}_${childId}`, String(newTotal))
  }
  return newTotal
}

export async function fetchWishes(childId: string): Promise<WishItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('child_id', childId)

    if (!error && data && data.length > 0) {
      return data
    }
  } catch (e) {
    console.warn('Fetch wishes fallback:', e)
  }

  return getLocalWishes()
}

export async function fetchAchievedWishes(childId: string): Promise<WishItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('child_id', childId)
      .eq('status', 'achieved')
      .order('achieved_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data
    }
  } catch (e) {
    console.warn('Fetch achieved wishes fallback:', e)
  }

  const wishes = getLocalWishes()
  return wishes.filter((w) => w.child_id === childId && w.status === 'achieved')
}

export async function approveWishAndCreateAlbum(
  wishId: string,
  childId: string,
  deductPoints: number,
  proofImageDataUrl?: string,
  parentMessage?: string,
  redemptionType: string = '포인트 교환 🎁'
): Promise<number> {
  // 1. 포인트 원장 차감 기록
  await addPointsLedger(childId, -deductPoints, `소원 선물 승인 차감 (${redemptionType})`)

  // 2. wishes 테이블 UPDATE
  try {
    const supabase = createClient()
    let res = await supabase
      .from('wishes')
      .update({
        status: 'achieved',
        proof_image_path: proofImageDataUrl || null,
        parent_message: parentMessage || null,
        redemption_type: redemptionType,
        achieved_at: new Date().toISOString()
      })
      .eq('id', wishId)

    if (res.error) {
      // fallback (parent_message 컬럼 미존재 스키마 대비)
      await supabase
        .from('wishes')
        .update({
          status: 'achieved',
          proof_image_path: proofImageDataUrl || null,
          achieved_at: new Date().toISOString()
        })
        .eq('id', wishId)
    }
  } catch (e) {
    console.warn('Approve wish & album fallback:', e)
  }

  // 3. 로컬 스토리지 동기화
  if (typeof window !== 'undefined') {
    const wishes = getLocalWishes()
    const updated = wishes.map((w) =>
      w.id === wishId || (w.child_id === childId && w.status === 'active')
        ? {
            ...w,
            status: 'achieved',
            proof_image_path: proofImageDataUrl || w.proof_image_path,
            parent_message: parentMessage,
            redemption_type: redemptionType,
            achieved_at: new Date().toISOString()
          }
        : w
    )
    localStorage.setItem(LOCAL_STORAGE_KEY_WISHES, JSON.stringify(updated))
  }

  const newPoints = await fetchChildPoints(childId)
  return newPoints
}

export async function updateWishStatus(wishId: string, status: 'active' | 'achieved'): Promise<void> {
  try {
    const supabase = createClient()
    await supabase
      .from('wishes')
      .update({
        status,
        achieved_at: status === 'achieved' ? new Date().toISOString() : null
      })
      .eq('id', wishId)
  } catch (e) {
    console.warn('Update wish status fallback:', e)
  }

  if (typeof window !== 'undefined') {
    const wishes = getLocalWishes()
    const updated = wishes.map((w) => (w.id === wishId ? { ...w, status } : w))
    localStorage.setItem(LOCAL_STORAGE_KEY_WISHES, JSON.stringify(updated))
  }
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

export async function saveUserApiKey(accountId: string, apiKey: string) {
  try {
    const supabase = createClient()
    await supabase.from('user_secrets').upsert({
      account_id: accountId,
      anthropic_key_encrypted: apiKey,
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
