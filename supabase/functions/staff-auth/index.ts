import { createClient } from 'npm:@supabase/supabase-js@2.50.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

const internalEmail = (username: string) =>
  `${username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '_')}@staff.aile-pos.local`

const sha256Base64 = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
}

// Auth passwords must be >= 6 chars; legacy staff passwords can be shorter.
// Derive a deterministic strong password from the username + real password.
const authPassword = async (username: string, password: string) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`aile-pos:${username.trim().toLowerCase()}:${password}`),
  )
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const requireAdmin = async (req: Request) => {
  const authorization = req.headers.get('Authorization') ?? ''
  const token = authorization.replace(/^Bearer\s+/i, '')
  if (!token) return null

  const { data: authData } = await admin.auth.getUser(token)
  if (!authData.user) return null

  const { data: profile } = await admin
    .from('users')
    .select('id, role, is_active')
    .eq('auth_user_id', authData.user.id)
    .maybeSingle()

  return profile?.is_active && profile.role === 'admin' ? profile : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return reply({ error: 'method_not_allowed' }, 405)

  try {
    const body = await req.json()
    const action = String(body?.action ?? '')

    if (action === 'login') {
      const username = String(body?.username ?? '').trim()
      const password = String(body?.password ?? '')
      if (!username || !password) return reply({ success: false, message: 'Invalid credentials' }, 400)

      const { data: profile } = await admin
        .from('users')
        .select('id, username, full_name, role, is_active, password_hash, password_salt, auth_user_id, failed_login_attempts, locked_until')
        .ilike('username', username)
        .maybeSingle()

      if (!profile?.is_active) return reply({ success: false, message: 'Invalid credentials' }, 401)
      if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
        return reply({ success: false, message: 'Account temporarily locked' }, 423)
      }

      let valid = false
      if (!profile.auth_user_id) {
        valid = profile.password_salt
          ? await sha256Base64(password + profile.password_salt) === profile.password_hash
          : password === profile.password_hash
      }

      const email = internalEmail(profile.username)
      const derived = await authPassword(profile.username, password)
      if (!profile.auth_user_id && valid) {
        const { data: created, error: createError } = await admin.auth.admin.createUser({
          email,
          password: derived,
          email_confirm: true,
          user_metadata: { pos_user_id: profile.id, username: profile.username },
        })
        if (createError || !created.user) throw createError ?? new Error('account_creation_failed')

        const { error: linkError } = await admin.from('users').update({
          auth_user_id: created.user.id,
          failed_login_attempts: 0,
          locked_until: null,
          last_login: new Date().toISOString(),
        }).eq('id', profile.id)
        if (linkError) throw linkError
      }

      const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data: signedIn, error: signInError } = await authClient.auth.signInWithPassword({ email, password: derived })

      if (signInError || !signedIn.session) {
        const attempts = Number(profile.failed_login_attempts ?? 0) + 1
        await admin.from('users').update({
          failed_login_attempts: attempts,
          locked_until: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null,
        }).eq('id', profile.id)
        return reply({ success: false, message: 'Invalid credentials' }, 401)
      }

      await admin.from('users').update({ failed_login_attempts: 0, locked_until: null, last_login: new Date().toISOString() }).eq('id', profile.id)
      return reply({ success: true, session: signedIn.session })
    }

    const requester = await requireAdmin(req)
    if (!requester) return reply({ error: 'forbidden' }, 403)

    if (action === 'create') {
      const username = String(body?.username ?? '').trim()
      const password = String(body?.password ?? '')
      const role = ['admin', 'manager', 'staff'].includes(body?.role) ? body.role : 'staff'
      if (!username || password.length < 4) return reply({ error: 'invalid_input' }, 400)

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: internalEmail(username), password: await authPassword(username, password), email_confirm: true,
        user_metadata: { username },
      })
      if (createError || !created.user) throw createError ?? new Error('account_creation_failed')

      const { error: profileError } = await admin.from('users').insert({
        username, full_name: String(body?.full_name ?? username), role,
        password_hash: password, password_salt: null,
        auth_user_id: created.user.id, shop_id: body?.shop_id ?? null,
      })
      if (profileError) {
        await admin.auth.admin.deleteUser(created.user.id)
        throw profileError
      }
      return reply({ success: true })
    }

    const targetId = String(body?.user_id ?? '')
    const { data: target } = await admin.from('users').select('id, auth_user_id, username').eq('id', targetId).maybeSingle()
    if (!target) return reply({ error: 'user_not_found' }, 404)

    if (action === 'reset-password') {
      const password = String(body?.password ?? '')
      if (password.length < 4) return reply({ error: 'password_too_short' }, 400)
      const derived = await authPassword(target.username, password)
      let authUserId = target.auth_user_id
      if (!authUserId) {
        const { data: created, error } = await admin.auth.admin.createUser({
          email: internalEmail(target.username), password: derived, email_confirm: true,
          user_metadata: { pos_user_id: target.id, username: target.username },
        })
        if (error || !created.user) throw error ?? new Error('account_creation_failed')
        authUserId = created.user.id
      } else {
        const { error } = await admin.auth.admin.updateUserById(authUserId, { password: derived })
        if (error) throw error
      }
      await admin.from('users').update({
        auth_user_id: authUserId, password_hash: password, password_salt: null,
        failed_login_attempts: 0, locked_until: null,
      }).eq('id', target.id)
      return reply({ success: true })
    }

    if (action === 'delete') {
      if (target.auth_user_id) await admin.auth.admin.deleteUser(target.auth_user_id)
      await admin.from('users').delete().eq('id', target.id)
      return reply({ success: true })
    }

    return reply({ error: 'unknown_action' }, 400)
  } catch (error) {
    console.error('staff-auth error', error)
    return reply({ error: 'operation_failed' }, 500)
  }
})