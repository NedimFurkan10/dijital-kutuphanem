const API_URL = "https://openlibrary.org/search.json";
document.addEventListener("DOMContentLoaded", async () => {
    const user = await requireUser(); if (!user) return;
    const results = document.getElementById("bookResults"), loading = document.getElementById("loading"), empty = document.getElementById("noResults");
    document.getElementById("logoutButton").addEventListener("click", e => { e.preventDefault(); logout(); });
    async function search() {
        const q = document.getElementById("bookSearchInput").value.trim(); if (!q) return;
        results.replaceChildren(); empty.classList.add("hidden"); loading.classList.remove("hidden");
        try {
            const response = await fetch(`${API_URL}?q=${encodeURIComponent(q)}&limit=10`); const data = await response.json();
            if (!data.docs?.length) empty.classList.remove("hidden");
            await Promise.all(data.docs.map(book => render(book)));
        } catch { empty.textContent = "Kitaplar alınamadı. Lütfen tekrar dene."; empty.classList.remove("hidden"); }
        loading.classList.add("hidden");
    }
    async function render(book) {
        const title = book.title || "Bilinmeyen Kitap", author = book.author_name?.join(", ") || "Bilinmeyen Yazar";
        const sourceId = book.key || crypto.randomUUID(), cover = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "https://placehold.co/300x420?text=Kapak+Yok";
        let pages = await pageCount(book);
        const card = document.createElement("article"); card.className = "book-card";
        const image = document.createElement("img"); image.src = cover; image.alt = title; image.className = "book-cover";
        card.append(image, text("h3", "book-title", title), text("p", "book-author", author));
        const input = document.createElement("input"); input.type = "number"; input.min = "1"; input.value = pages || ""; input.placeholder = "Sayfa sayısı"; input.className = "page-count-input";
        const button = document.createElement("button"); button.className = "add-book-button"; button.textContent = "Kütüphaneme Ekle";
        button.onclick = async () => { const count = Number(input.value); if (!Number.isInteger(count) || count < 1) return input.focus(); const { error } = await db.from("books").insert({ user_id:user.id, source_id:sourceId, title, author, page_count:count, cover_url:cover, genre:book.subject?.[0] || null }); if (error) return alert(error.message); button.disabled=true; button.textContent="✓ Kütüphanede"; };
        card.append(input, button); results.append(card);
    }
    const text = (tag, className, value) => { const el=document.createElement(tag); el.className=className; el.textContent=value; return el; };
    async function pageCount(book) { try { const isbn=book.isbn?.[0]; if (!isbn) return 0; const r=await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`); return Number((await r.json())[`ISBN:${isbn}`]?.number_of_pages)||0; } catch { return 0; } }
    document.getElementById("searchButton").onclick = search; document.getElementById("bookSearchInput").onkeydown = e => { if(e.key === "Enter") search(); };
});
