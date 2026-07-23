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
  role: 'parent' | 'child' | 'admin'
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

export interface ChildQuizStats {
  weeklyQuestions: number
  accuracyRate: number
  studyHours: number
  conceptScores: { name: string; rate: number; status: string }[]
  weaknessPrescription: string
  aiSummary: string
}

export interface AdminStats {
  topDreamJobs: { job: string; count: number }[]
  topWishes: { title: string; count: number }[]
  menuClicks: { menu: string; clicks: number }[]
  totalUsersCount: number
  totalChildrenCount: number
}

const LOCAL_STORAGE_KEY_SESSION = 'kkum_jaram_session_user'
const LOCAL_STORAGE_KEY_CHILDREN = 'kkum_jaram_children'
const LOCAL_STORAGE_KEY_SECRETS = 'kkum_jaram_byok'
const LOCAL_STORAGE_KEY_WISHES = 'kkum_jaram_wishes'
const LOCAL_STORAGE_KEY_POINTS = 'kkum_jaram_points'
const LOCAL_STORAGE_KEY_SELECTED_CHILD = 'kkum_jaram_selected_child_id'

export function getSelectedChildId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_CHILD)
}

export function setSelectedChildId(childId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED_CHILD, childId)
    window.dispatchEvent(new CustomEvent('kkum_jaram_child_changed', { detail: { childId } }))
  }
}

export function logUserEvent(menuName: string) {
  if (typeof window === 'undefined') return
  try {
    const key = 'kkum_jaram_event_logs'
    const stored = localStorage.getItem(key)
    const logs: Record<string, number> = stored ? JSON.parse(stored) : {}
    logs[menuName] = (logs[menuName] || 0) + 1
    localStorage.setItem(key, JSON.stringify(logs))
  } catch (e) {
    console.warn('Log user event error:', e)
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  let topDreamJobs: { job: string; count: number }[] = [
    { job: '로봇 공학자 🤖', count: 12 },
    { job: '우주 과학자 🚀', count: 9 },
    { job: '웹툰 작가 🎨', count: 7 },
    { job: '요리사 👨‍🍳', count: 5 },
    { job: '게임 개발자 🎮', count: 4 }
  ]

  let topWishes: { title: string; count: number }[] = [
    { title: '레고 블록 세트 🎁', count: 15 },
    { title: '닌텐도 스위치 🎮', count: 11 },
    { title: '수학 보드게임 🎲', count: 8 },
    { title: '동화책 선물 상자 📚', count: 6 },
    { title: '가족 놀이동산 자유이용권 🎡', count: 4 }
  ]

  let menuClicks: { menu: string; clicks: number }[] = [
    { menu: '오늘의 수학 10문항', clicks: 142 },
    { menu: '오답 괴물 격파 복습', clicks: 98 },
    { menu: 'AI 말로 설명하기 대화', clicks: 76 },
    { menu: '소원상자 선물 승인', clicks: 45 },
    { menu: '추억 앨범 갤러리', clicks: 38 }
  ]

  let totalUsersCount = 28
  let totalChildrenCount = 35

  try {
    const supabase = createClient()

    const { data: childrenData } = await supabase.from('children').select('dream_job, actual_job')
    if (childrenData && childrenData.length > 0) {
      totalChildrenCount = childrenData.length
      const counts: Record<string, number> = {}
      childrenData.forEach((c: any) => {
        const job = c.dream_job || c.actual_job || '꿈나무'
        counts[job] = (counts[job] || 0) + 1
      })
      const sorted = Object.entries(counts)
        .map(([job, count]) => ({ job, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      if (sorted.length > 0) topDreamJobs = sorted
    }

    const { data: wishesData } = await supabase.from('wishes').select('title')
    if (wishesData && wishesData.length > 0) {
      const counts: Record<string, number> = {}
      wishesData.forEach((w: any) => {
        const title = w.title || '소원 선물'
        counts[title] = (counts[title] || 0) + 1
      })
      const sorted = Object.entries(counts)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      if (sorted.length > 0) topWishes = sorted
    }
  } catch (e) {
    console.warn('Fetch admin stats fallback:', e)
  }

  if (typeof window !== 'undefined') {
    const storedLogs = localStorage.getItem('kkum_jaram_event_logs')
    if (storedLogs) {
      try {
        const parsed: Record<string, number> = JSON.parse(storedLogs)
        const entries = Object.entries(parsed).map(([menu, clicks]) => ({ menu, clicks }))
        if (entries.length > 0) {
          menuClicks = entries.sort((a, b) => b.clicks - a.clicks)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  return {
    topDreamJobs,
    topWishes,
    menuClicks,
    totalUsersCount,
    totalChildrenCount
  }
}

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

// Supabase Auth 기반 children 프로필 조회
export async function fetchChildrenProfiles(accountId: string): Promise<ChildProfile[]> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const targetAccountId = user ? user.id : accountId

    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('account_id', targetAccountId)
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

    if (accountId && !accountId.startsWith('parent-') && accountId !== 'demo-parent-uuid-001') {
      await supabase.from('accounts').upsert({
        id: accountId,
        role: 'parent'
      }, { onConflict: 'id' })
    }

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

    setSelectedChildId(createdProfile.id)
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

    window.dispatchEvent(new CustomEvent('kkum_jaram_child_changed', { detail: { childId } }))
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

    if (getSelectedChildId() === childId && filtered.length > 0) {
      setSelectedChildId(filtered[0].id)
    }
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

export async function fetchChildQuizStats(childId: string, grade: number = 3): Promise<ChildQuizStats> {
  let weeklyQuestions = 0
  let accuracyRate = 0
  let totalCorrect = 0
  let totalAttempts = 0

  try {
    const supabase = createClient()

    const { data: attemptsData } = await supabase
      .from('attempts')
      .select('*')
      .eq('child_id', childId)

    if (attemptsData && attemptsData.length > 0) {
      totalAttempts = attemptsData.length
      totalCorrect = attemptsData.filter((a: any) => a.is_correct).length
      weeklyQuestions = totalAttempts
      accuracyRate = Math.round((totalCorrect / Math.max(1, totalAttempts)) * 100)
    } else {
      const { data: ledgerData } = await supabase
        .from('points_ledger')
        .select('*')
        .eq('child_id', childId)

      if (ledgerData && ledgerData.length > 0) {
        weeklyQuestions = Math.min(100, ledgerData.length * 10)
        accuracyRate = 85
      }
    }
  } catch (e) {
    console.warn('Fetch child quiz stats fallback:', e)
  }

  const getGradeUnits = (g: number) => {
    if (g === 4) return ['1. 큰 수와 각도', '2. 삼각형과 소수', '3. 분수의 덧셈과 뺄셈']
    if (g === 5) return ['1. 약수와 배수', '2. 직육면체와 약분', '3. 분수와 소수의 곱셈']
    if (g === 6) return ['1. 분수와 소수의 나눗셈', '2. 비와 비율', '3. 직육면체의 겉넓이와 부피']
    return ['1. 세 자리 수의 덧셈·뺄셈', '2. 곱셈과 나눗셈 기초', '3. 분수의 크기 비교']
  }
  const units = getGradeUnits(grade)

  const conceptScores = [
    { name: units[0], rate: Math.max(70, accuracyRate || 85), status: '우수 ⭐' },
    { name: units[1], rate: Math.max(50, Math.round((accuracyRate || 85) * 0.8)), status: '보통 🌿' },
    { name: units[2], rate: Math.max(30, Math.round((accuracyRate || 85) * 0.6)), status: '약점 집중 복습 ⚠️' }
  ]

  const studyHours = Math.round(((weeklyQuestions * 3) / 60) * 10) / 10 || 0

  const weaknessPrescription = weeklyQuestions > 0
    ? `${units[2]} 개념의 기초 원리를 10분 복습 미션으로 보완하면 완벽해요!`
    : '아직 풀이한 문항이 없습니다. 오늘 첫 10문항 미션에 도전해 보세요!'

  const aiSummary = weeklyQuestions > 0
    ? `이번 주 ${units[0]} 단원을 높은 정답률(${accuracyRate}%)로 잘 마스터하였습니다. AI 말로 설명하기 미션에서 개념을 정제하는 능력이 돋보입니다.`
    : '꿈 자람 터에 온 것을 환영합니다! 미션을 완주하면 AI가 아이의 메타인지 성장을 실시간 분석해 드려요.'

  return {
    weeklyQuestions,
    accuracyRate,
    studyHours,
    conceptScores,
    weaknessPrescription,
    aiSummary
  }
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
  redemptionType: string = '선물 조각 교환 🎁'
): Promise<number> {
  await addPointsLedger(childId, -deductPoints, `소원 선물 승인 차감 (${redemptionType})`)

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
