document.addEventListener("DOMContentLoaded", async () => {
    const user = await requireUser(); if (!user) return;
    document.getElementById("logoutButton").onclick = e => { e.preventDefault(); logout(); };

    function confirmModal(message) {
        return new Promise(resolve => {
            const overlay = document.getElementById("confirmModal");
            document.getElementById("confirmModalText").textContent = message;
            overlay.classList.remove("hidden");
            const okBtn = document.getElementById("confirmModalOk"), cancelBtn = document.getElementById("confirmModalCancel");
            const cleanup = result => { overlay.classList.add("hidden"); okBtn.onclick = null; cancelBtn.onclick = null; resolve(result); };
            okBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);
        });
    }

    const list = document.getElementById("libraryResults"), empty = document.getElementById("emptyLibrary");
    const { data: books, error } = await db.from("books").select("*").order("added_at", { ascending: false });
    if (error || !books?.length) { empty.classList.remove("hidden"); return; }
    books.forEach(book => {
        const card = document.createElement("article"); card.className = "book-card";
        const image = document.createElement("img"); image.src = book.cover_url || "https://placehold.co/300x420?text=Kapak+Yok"; image.alt = book.title; image.className = "book-cover";
        const title = document.createElement("h3"); title.className = "book-title"; title.textContent = book.title;
        const author = document.createElement("p"); author.className = "book-author"; author.textContent = book.author || "Bilinmeyen Yazar";
        const pages = document.createElement("p"); pages.className = "book-pages"; pages.textContent = `${book.page_count} sayfa`;
        const select = document.createElement("select"); select.className = "status-select";["okunacak", "okunuyor", "okundu"].forEach(status => { const option = new Option(status[0].toUpperCase() + status.slice(1), status, status === book.status, status === book.status); select.add(option); });
        select.onchange = async () => { const status = select.value; const { error } = await db.from("books").update({ status, finished_at: status === "okundu" ? new Date().toISOString() : null }).eq("id", book.id); if (error) alert(error.message); };
        const remove = document.createElement("button"); remove.className = "remove-book-button"; remove.type = "button"; remove.textContent = "Kütüphaneden Kaldır";
        remove.onclick = async () => {
            if (!(await confirmModal(`"${book.title}" kütüphaneden kaldırılsın mı?`))) return;
            remove.disabled = true;
            const { error } = await db.from("books").delete().eq("id", book.id);
            if (error) { alert(error.message); remove.disabled = false; return; }
            card.remove();
            if (!list.children.length) empty.classList.remove("hidden");
        };
        card.append(image, title, author, pages, select, remove); list.append(card);
    });
});
