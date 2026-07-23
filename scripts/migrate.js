const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })
const { Client } = require('pg')

async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL
  const migrationsDir = path.join(__dirname, '../supabase/migrations')

  console.log('🚀 [Supabase DB Auto Migration Pipeline Start]')

  if (!dbUrl || dbUrl.includes('[YOUR-PASSWORD]')) {
    console.warn('\n⚠️ [DATABASE_URL 비밀번호 미설정 안내]')
    console.warn('-> .env.local 파일의 DATABASE_URL 에 Supabase DB 비밀번호가 설정되어 있지 않습니다.')
    console.warn('-> 예시: DATABASE_URL=postgresql://postgres.kbpfojpjmooiditlfxsi:실제비밀번호@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres\n')
    console.warn('💡 Supabase SQL Editor를 사용하시는 경우, 아래 최신 마이그레이션 파일들을 순서대로 실행해 주세요:')

    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
      files.forEach((f, idx) => {
        console.warn(`   ${idx + 1}. supabase/migrations/${f}`)
      })
    }
    process.exit(0)
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('✅ 데이터베이스 직접 연결 성공!')

    // 1. 마이그레이션 이력 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations_history (
        name text PRIMARY KEY,
        applied_at timestamptz DEFAULT now()
      );
    `)

    // 2. 이미 실행된 이력 조회
    const { rows: appliedRows } = await client.query('SELECT name FROM _migrations_history;')
    const appliedSet = new Set(appliedRows.map(r => r.name))

    // 3. supabase/migrations 디렉터리 .sql 파일 스캔 및 정렬
    if (!fs.existsSync(migrationsDir)) {
      console.log('📂 supabase/migrations 폴더가 존재하지 않습니다.')
      process.exit(0)
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log(`📁 총 ${migrationFiles.length}개의 마이그레이션 파일 탐색 완료.`)

    let appliedCount = 0

    for (const file of migrationFiles) {
      if (appliedSet.has(file)) {
        console.log(` ⏩ [Skip] ${file} (이미 반영됨)`)
        continue
      }

      console.log(` ⚡ [Applying] ${file} ...`)
      const filePath = path.join(migrationsDir, file)
      const sqlContent = fs.readFileSync(filePath, 'utf-8')

      try {
        await client.query('BEGIN')
        await client.query(sqlContent)
        await client.query('INSERT INTO _migrations_history (name) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(` 🎉 [Applied Success] ${file}`)
        appliedCount++
      } catch (sqlErr) {
        await client.query('ROLLBACK')
        console.error(` ❌ [Error applying ${file}]:`, sqlErr.message)
        process.exit(1)
      }
    }

    console.log(`\n✨ [Complete] 총 ${appliedCount}개의 신규 마이그레이션 스크립트 적용 완료!`)
  } catch (err) {
    console.error('❌ 데이터베이스 연결 또는 마이그레이션 오류:', err.message)
  } finally {
    await client.end()
  }
}

runMigrations()
