// ─────────────────────────────────────────────────────────────────────────────
// Libas Collection — Auth Module (Production Ready)
// Strategy: Use onAuthStateChange as SINGLE SOURCE OF TRUTH.
//           Every page waits for the first auth event before acting.
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://hkdenuzxxrcvcgtbqgxq.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZGVudXp4eHJjdmNndGJxZ3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NTM5MjIsImV4cCI6MjA4NzMyOTkyMn0.2GgEChu1H-1vyKorxjDm_p4VHP7YOuSpFMo_wF8f6vY';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'libas-auth' }
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function _cleanPhone(phone) {
    return String(phone).replace(/\D/g, '').slice(-10);
}
function _virtualEmail(phone) {
    return `${_cleanPhone(phone)}@libas.app`;
}
function _virtualPwd(phone) {
    return `LB@${_cleanPhone(phone)}#2024!`;
}

// ── Session Promise ───────────────────────────────────────────────────────────
// Resolves ONCE with the current session (null for guests).
// All code that needs the session awaits this promise.
const _sessionReady = new Promise((resolve) => {
    // onAuthStateChange fires immediately with INITIAL_SESSION or SIGNED_OUT
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            subscription.unsubscribe();        // only need the first event
            resolve(session);
        }
    });
    // Hard fallback: if supabase doesn't fire within 3 s, treat as guest
    setTimeout(() => resolve(null), 3000);
});

// ── Auth API ──────────────────────────────────────────────────────────────────
const Auth = {
    /* Returns the current user, waiting for session init first */
    async getUser() {
        const session = await _sessionReady;
        return session ? session.user : null;
    },

    /* Returns the profile row, using localStorage as a cache */
    async getProfile(forceRefresh = false) {
        const user = await this.getUser();
        if (!user) return null;

        if (!forceRefresh) {
            try {
                const cached = JSON.parse(localStorage.getItem('libas_profile') || 'null');
                if (cached && cached.id === user.id) return cached;
            } catch (_) {}
        }

        const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (!data) return null;  // maybeSingle returns null (not error) when no row found

        localStorage.setItem('libas_profile', JSON.stringify(data));
        return data;
    },

    /* Phone-only sign-in.  Tries signIn; on bad credentials, gives clear message */
    async signIn(phone) {
        const email    = _virtualEmail(phone);
        const password = _virtualPwd(phone);

        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
            if (error.message.includes('Invalid login credentials') ||
                error.message.includes('invalid_credentials')) {
                throw new Error('Phone number not registered. Please create an account first.');
            }
            throw error;
        }
        // Pre-warm the profile cache
        localStorage.removeItem('libas_profile');
        await this.getProfile(true);
        return data;
    },

    async signUp(phone, profileData) {
        const cleanPhone = _cleanPhone(phone);
        const email      = _virtualEmail(phone);
        const password   = _virtualPwd(phone);

        // 1. Check if profile row already exists → just sign in
        const { data: existing } = await sb
            .from('profiles').select('id').eq('phone', cleanPhone).maybeSingle();
        if (existing) {
            return await this.signIn(phone);   // account exists completely → sign in silently
        }

        // 2. Create auth user
        let userToInsert = null;
        const { data: authData, error: authError } = await sb.auth.signUp({ email, password });

        if (authError) {
            if (authError.message.toLowerCase().includes('already registered') ||
                authError.message.toLowerCase().includes('user already')) {
                const signInData = await this.signIn(phone);
                userToInsert = signInData?.user;
            } else {
                throw authError;
            }
        } else if (authData && authData.user) {
            userToInsert = authData.user;
        } else if (authData && !authData.user) {
            // Prevent Email Enumeration ON: returns no error but user=null
            const signInData = await this.signIn(phone);
            userToInsert = signInData?.user;
        }

        // 3. Insert profile row
        if (userToInsert) {
            const { data: existingProf } = await sb.from('profiles').select('id').eq('id', userToInsert.id).maybeSingle();
            if (!existingProf) {
                const { error: pErr } = await sb.from('profiles').insert({
                    id:    userToInsert.id,
                    phone: cleanPhone,
                    ...profileData
                });
                if (pErr) throw pErr;
            }
        }
        return { user: userToInsert };
    },

    async signOut() {
        localStorage.removeItem('libas_profile');
        await sb.auth.signOut();
        window.location.href = 'index.html';
    },

    /* Return-URL helpers for checkout resurrection */
    setReturnUrl(url) { sessionStorage.setItem('libas_return_url', url); },
    consumeReturnUrl() {
        const url = sessionStorage.getItem('libas_return_url');
        sessionStorage.removeItem('libas_return_url');
        return url;
    }
};

// ── Header UI update ──────────────────────────────────────────────────────────
async function updateProfileUI() {
    // Wait for session before touching the DOM
    const user = await Auth.getUser();

    const profileBtn = document.getElementById('profileBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (profileBtn) {
        if (user) {
            profileBtn.innerHTML = `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#E8CC6A" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`;
            profileBtn.onclick = () => { window.location.href = 'profile.html'; };
            profileBtn.title = 'My Profile';
        } else {
            profileBtn.innerHTML = `<span style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:#E8CC6A;letter-spacing:1px;border:1px solid rgba(212,175,55,.5);padding:5px 12px;border-radius:6px;white-space:nowrap;background:rgba(212,175,55,0.1)">LOGIN</span>`;
            profileBtn.onclick = () => {
                Auth.setReturnUrl(window.location.href);
                window.location.href = 'signin.html';
            };
            profileBtn.title = 'Sign In';
        }
    }

    if (mobileMenu) {
        let authLink = mobileMenu.querySelector('.mobile-auth-link');
        if (!authLink) {
            authLink = document.createElement('button');
            authLink.className = 'nav-link mobile-auth-link';
            Object.assign(authLink.style, {
                display: 'block', marginTop: '14px', fontSize: '14px',
                width: '100%', textAlign: 'left'
            });
            mobileMenu.appendChild(authLink);
        }
        if (user) {
            authLink.textContent = 'My Profile';
            authLink.onclick = () => { window.location.href = 'profile.html'; if (typeof toggleMobileMenu==='function') toggleMobileMenu(); };
        } else {
            authLink.textContent = 'Login / Register';
            authLink.onclick = () => {
                Auth.setReturnUrl(window.location.href);
                window.location.href = 'signin.html';
                if (typeof toggleMobileMenu==='function') toggleMobileMenu();
            };
        }
    }
}

// Keep UI in sync when session changes (e.g., tab sign-out)
sb.auth.onAuthStateChange(() => updateProfileUI());

// Initial call once DOM is ready
document.addEventListener('DOMContentLoaded', updateProfileUI);
