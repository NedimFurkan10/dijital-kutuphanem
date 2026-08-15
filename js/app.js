document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await db.auth.getSession();

    if (session) {
        const { data: profile } = await db
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .single();

        if (profile?.is_admin) {
            window.location.replace("admin-panel/index.html");
        } else {
            window.location.replace("library.html");
        }
    }

    if (new URLSearchParams(window.location.search).get("registered") === "1") {
        document.getElementById("registerSuccess").hidden = false;
    }

    document.getElementById("loginButton")?.addEventListener("click", async () => {
        const email = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const errorBox = document.getElementById("loginError");

        errorBox.hidden = true;

        const { data, error } = await db.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            errorBox.textContent = "E-posta veya şifre hatalı.";
            errorBox.hidden = false;
            return;
        }

        const { data: profile, error: profileError } = await db
            .from("profiles")
            .select("is_admin")
            .eq("id", data.user.id)
            .single();

        if (profileError || !profile) {
            errorBox.textContent = "Kullanıcı profili bulunamadı.";
            errorBox.hidden = false;
            return;
        }

        if (profile.is_admin) {
            window.location.href = "admin-panel/index.html";
        } else {
            window.location.href = "library.html";
        }
    });

    document.getElementById("registerLink")?.addEventListener("click", event => {
        event.preventDefault();
        window.location.href = "register.html";
    });
});
