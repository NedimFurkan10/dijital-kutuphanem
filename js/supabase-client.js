const SUPABASE_URL = "https://fmbouoebxkjdfhbwixbz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_v3D_SiKs0SusD2AK6XTHbg_NRELPUvd";

window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

window.requireUser = async () => {
    const { data: { user } } = await window.db.auth.getUser();
    if (!user) {
        window.location.replace("index.html");
        return null;
    }
    return user;
};

window.logout = async () => {
    await window.db.auth.signOut();
    window.location.href = "index.html";
};
