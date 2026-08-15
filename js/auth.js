document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("registerButton")?.addEventListener("click", async () => {
        const username = document.getElementById("registerUsername").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const again = document.getElementById("registerPasswordAgain").value;
        const errorBox = document.getElementById("registerError");
        errorBox.hidden = true;
        if (!username || !email || password.length < 6 || password !== again) {
            errorBox.textContent = "Tüm alanları doğru doldur; şifre en az 6 karakter olmalı."; errorBox.hidden = false; return;
        }
        const redirectTo = `${window.location.origin}${window.location.pathname.replace(/register\.html$/, "index.html")}?registered=1`;
        const { error } = await db.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: redirectTo } });
        if (error) { errorBox.textContent = error.message; errorBox.hidden = false; return; }
        window.location.href = "index.html?registered=1";
    });
});
