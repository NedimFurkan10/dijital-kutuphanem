document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await db.auth.getSession();
    if (session) window.location.replace("library.html");
    if (new URLSearchParams(window.location.search).get("registered") === "1") {
        document.getElementById("registerSuccess").hidden = false;
    }

    document.getElementById("loginButton")?.addEventListener("click", async () => {
        const email = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const errorBox = document.getElementById("loginError");
        errorBox.hidden = true;
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) { errorBox.textContent = "E-posta veya şifre hatalı."; errorBox.hidden = false; return; }
        window.location.href = "library.html";
    });
    document.getElementById("registerLink")?.addEventListener("click", event => { event.preventDefault(); window.location.href = "register.html"; });
});
