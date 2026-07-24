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
  let topDreamJobs: { job: string; count: number }[] = []
  let topWishes: { title: string; count: number }[] = []
  let menuClicks: { menu: string; clicks: number }[] = []
  let totalUsersCount = 0
  let totalChildrenCount = 0

  try {
    const supabase = createClient()

    const { count: usersCount } = await supabase.from('accounts').select('*', { count: 'exact', head: true })
    if (usersCount !== null && usersCount !== undefined) totalUsersCount = usersCount

    const { data: childrenData } = await supabase.from('children').select('dream_job, actual_job')
    if (childrenData) {
      totalChildrenCount = childrenData.length
      const counts: Record<string, number> = {}
      childrenData.forEach((c: any) => {
        const job = c.dream_job || c.actual_job || '꿈나무'
        counts[job] = (counts[job] || 0) + 1
      })
      topDreamJobs = Object.entries(counts)
        .map(([job, count]) => ({ job, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }

    const { data: wishesData } = await supabase.from('wishes').select('title')
    if (wishesData) {
      const counts: Record<string, number> = {}
      wishesData.forEach((w: any) => {
        const title = w.title || '소원 선물'
        counts[title] = (counts[title] || 0) + 1
      })
      topWishes = Object.entries(counts)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }
  } catch (e) {
    console.error('Fetch admin stats error:', e)
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

// 현재 로그인 사용자 세션 조회 (Strict Supabase Auth & DB)
export async function getCurrentUser(): Promise<UserAccount | null> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email || '',
    display_name: account?.display_name || user.email?.split('@')[0],
    role: (account?.role as any) || 'parent'
  }
}

export async function loginWithEmail(email: string, password?: string): Promise<UserAccount> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || ''
  })

  if (error || !data?.user) {
    throw new Error(error?.message || '이메일 또는 비밀번호가 올바르지 않습니다.')
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', data.user.id)
    .single()

  return {
    id: data.user.id,
    email: data.user.email || email,
    display_name: account?.display_name || email.split('@')[0],
    role: (account?.role as any) || 'parent'
  }
}

export async function registerParentAccount(email: string, displayName: string, password?: string): Promise<UserAccount> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password: password || '',
    options: {
      data: { display_name: displayName }
    }
  })

  if (error || !data?.user) {
    throw new Error(error?.message || '회원가입 처리 중 오류가 발생했습니다.')
  }

  // 신규 가입 시 기본 role은 무조건 'parent'로 엄격 고정
  await supabase.from('accounts').upsert({
    id: data.user.id,
    display_name: displayName,
    role: 'parent'
  }, { onConflict: 'id' })

  return {
    id: data.user.id,
    email: data.user.email || email,
    display_name: displayName,
    role: 'parent'
  }
}

// 전체 가입자 계정 목록 조회 (관리자 전용 Strict DB 조회)
export async function fetchAllUserAccounts(): Promise<UserAccount[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')

  if (error || !data) {
    throw new Error(error?.message || '가입자 목록을 불러오지 못했습니다.')
  }

  return data.map((item: any) => ({
    id: item.id,
    email: item.email || `${item.display_name || 'user'}@kkumjaram.kr`,
    display_name: item.display_name || '사용자',
    role: (item.role as any) || 'parent'
  }))
}

// 회원 계정 권한(role: 'admin' | 'parent') 변경/승인 (Strict DB Update)
export async function updateUserAccountRole(userId: string, newRole: 'admin' | 'parent'): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('accounts')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message || '권한 변경에 실패했습니다.')
  }
}

export async function logoutUser() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch (e) {
    console.error('Logout error:', e)
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION)
  }
}

// Supabase Auth 기반 children 프로필 Strict 조회
export async function fetchChildrenProfiles(accountId: string): Promise<ChildProfile[]> {
  if (!accountId) return []
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const targetAccountId = user ? user.id : accountId

  if (!targetAccountId) return []

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('account_id', targetAccountId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

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

export async function createChildProfile(
  accountId: string,
  nickname: string,
  grade: number,
  dreamJob: string,
  wishTitle?: string,
  wishTargetPoints: number = 100
): Promise<ChildProfile> {
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

  if (res.error || !res.data) {
    throw new Error(res.error?.message || '자녀 프로필 생성 중 오류가 발생했습니다.')
  }

  const createdProfile: ChildProfile = {
    id: res.data.id,
    account_id: res.data.account_id,
    nickname: res.data.nickname,
    grade: res.data.grade,
    dream_job: res.data.dream_job || res.data.actual_job || dreamJob,
    actual_job: res.data.actual_job || res.data.dream_job || dreamJob,
    theme: res.data.theme,
    created_at: res.data.created_at
  }

  if (wishTitle && createdProfile.id) {
    await supabase.from('wishes').insert({
      child_id: createdProfile.id,
      title: wishTitle,
      target_points: wishTargetPoints,
      status: 'active'
    })
  }

  setSelectedChildId(createdProfile.id)
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

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kkum_jaram_child_changed', { detail: { childId } }))
  }
}

export async function deleteChildProfile(childId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('children').delete().eq('id', childId)
  if (error) {
    throw new Error(error.message || '자녀 프로필 삭제 실패')
  }
}

export async function fetchChildPoints(childId: string): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('points_ledger')
    .select('delta')
    .eq('child_id', childId)

  if (!error && data) {
    const sum = data.reduce((acc: number, cur: any) => acc + (cur.delta || 0), 0)
    return Math.max(120, sum)
  }
  return 120
}

export async function fetchChildQuizStats(childId: string, grade: number = 3): Promise<ChildQuizStats> {
  let weeklyQuestions = 0
  let accuracyRate = 0
  let totalCorrect = 0
  let totalAttempts = 0

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
  const supabase = createClient()
  await supabase.from('points_ledger').insert({
    child_id: childId,
    delta,
    reason
  })

  const newTotal = await fetchChildPoints(childId)
  return newTotal
}

export async function fetchWishes(childId: string): Promise<WishItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .eq('child_id', childId)

  if (!error && data) {
    return data
  }
  return []
}

export async function fetchAchievedWishes(childId: string): Promise<WishItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .eq('child_id', childId)
    .eq('status', 'achieved')
    .order('achieved_at', { ascending: false })

  if (!error && data) {
    return data
  }
  return []
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

  const newPoints = await fetchChildPoints(childId)
  return newPoints
}

export async function updateWishStatus(wishId: string, status: 'active' | 'achieved'): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('wishes')
    .update({
      status,
      achieved_at: status === 'achieved' ? new Date().toISOString() : null
    })
    .eq('id', wishId)
}

export async function saveUserApiKey(accountId: string, apiKey: string) {
  const supabase = createClient()
  await supabase.from('user_secrets').upsert({
    account_id: accountId,
    anthropic_key_encrypted: apiKey,
    updated_at: new Date().toISOString()
  })

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_SECRETS, apiKey)
  }
}

export function getUserApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LOCAL_STORAGE_KEY_SECRETS)
}
