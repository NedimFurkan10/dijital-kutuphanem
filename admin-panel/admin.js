document.addEventListener("DOMContentLoaded", async () => {

    const user = await requireUser();

    if (!user) return;


    document.getElementById("logoutButton").onclick = async (e) => {

        e.preventDefault();

        await logout();

    };


    // ADMIN KONTROLÜ
    const { data: me } = await db
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();


    if (!me?.is_admin) {

        window.location.replace("../library.html");

        return;

    }


    // KULLANICILAR
    const {
        data: users,
        error: usersError
    } = await db.rpc("admin_users");


    if (usersError) {

        console.error("admin_users hatası:", usersError);

        document.getElementById("summary").textContent =
            "Kullanıcılar yüklenemedi.";

        return;

    }


    // KİTAPLAR
    const {
        data: books,
        error: booksError
    } = await db
        .from("books")
        .select("*")
        .order("added_at", {
            ascending: false
        });


    if (booksError) {

        console.error("books hatası:", booksError);

    }


    // ÖZET
    document.getElementById("summary").textContent =
        `${users.length} kullanıcı · ${books?.length || 0} kitap`;


    // =========================
    // KULLANICI SAYISI
    // =========================

    const userCount = document.getElementById("userCount");

    if (userCount) {

        userCount.textContent = users.length;

    }


    // =========================
    // KİTAP SAYISI
    // =========================

    const bookCount = document.getElementById("bookCount");

    if (bookCount) {

        bookCount.textContent = books?.length || 0;

    }


    // =========================
    // KULLANICILAR
    // =========================

    const target = document.getElementById("users");

    target.innerHTML = "";


    users.forEach(item => {

        const card = document.createElement("article");

        card.className = "book-card";


        const title = document.createElement("h3");

        title.className = "book-title";

        title.textContent = item.username;


        const email = document.createElement("p");

        email.className = "book-author";

        email.textContent = item.email;


        const admin = document.createElement("button");

        admin.className = "add-book-button";

        admin.textContent =
            item.is_admin
                ? "Adminliği kaldır"
                : "Admin yap";


        admin.onclick = async () => {

            const { error } = await db
                .from("profiles")
                .update({
                    is_admin: !item.is_admin
                })
                .eq("id", item.id);


            if (error) {

                alert("İşlem başarısız.");

                console.error(error);

                return;

            }


            location.reload();

        };


        const active = document.createElement("button");

        active.className = "add-book-button";

        active.style.marginTop = "8px";

        active.textContent =
            item.is_active
                ? "Pasife al"
                : "Aktifleştir";


        active.onclick = async () => {

            const { error } = await db
                .from("profiles")
                .update({
                    is_active: !item.is_active
                })
                .eq("id", item.id);


            if (error) {

                alert("İşlem başarısız.");

                console.error(error);

                return;

            }


            location.reload();

        };


        card.append(
            title,
            email,
            admin,
            active
        );


        target.appendChild(card);

    });


    // =========================
    // KİTAPLAR
    // =========================

    const bookTarget = document.getElementById("books");

    bookTarget.innerHTML = "";


    (books || []).forEach(book => {

        const card = document.createElement("article");

        card.className = "book-card";


        const title = document.createElement("input");

        title.value = book.title;

        title.placeholder = "Kitap adı";


        const pages = document.createElement("input");

        pages.type = "number";

        pages.min = "1";

        pages.value = book.page_count;

        pages.placeholder = "Sayfa sayısı";


        const save = document.createElement("button");

        save.className = "add-book-button";

        save.textContent = "Kaydet";


        save.onclick = async () => {

            const { error } = await db
                .from("books")
                .update({
                    title: title.value,
                    page_count: Number(pages.value)
                })
                .eq("id", book.id);


            if (error) {

                alert("Kitap güncellenemedi.");

                console.error(error);

                return;

            }


            alert("Kitap güncellendi.");

        };


        const remove = document.createElement("button");

        remove.className = "add-book-button";

        remove.style.marginTop = "8px";

        remove.textContent = "Sil";


        remove.onclick = async () => {

            if (!confirm("Bu kitap silinsin mi?")) {

                return;

            }


            const { error } = await db
                .from("books")
                .delete()
                .eq("id", book.id);


            if (error) {

                alert("Kitap silinemedi.");

                console.error(error);

                return;

            }


            location.reload();

        };


        card.append(
            title,
            pages,
            save,
            remove
        );


        bookTarget.appendChild(card);

    });

});
