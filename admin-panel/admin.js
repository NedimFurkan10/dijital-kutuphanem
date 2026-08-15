document.addEventListener("DOMContentLoaded", async () => {

    // =====================================================
    // KULLANICI KONTROLÜ
    // =====================================================

    const user = await requireUser();

    if (!user) {
        return;
    }


    // =====================================================
    // ÇIKIŞ
    // =====================================================

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", async (event) => {

            event.preventDefault();

            await logout();

        });
    }


    // =====================================================
    // ADMIN KONTROLÜ
    // =====================================================

    const {
        data: me,
        error: profileError
    } = await db
        .from("profiles")
        .select("username, is_admin, is_active")
        .eq("id", user.id)
        .single();


    if (profileError || !me?.is_admin || !me?.is_active) {

        window.location.replace("../library.html");

        return;
    }


    // =====================================================
    // ADMIN BİLGİSİ
    // =====================================================

    const adminName = document.querySelector(".admin-user-text strong");
    const adminAvatar = document.querySelector(".admin-avatar");

    if (adminName) {
        adminName.textContent = me.username || "Yönetici";
    }

    if (adminAvatar) {
        adminAvatar.textContent =
            (me.username || "A").charAt(0).toUpperCase();
    }


    // =====================================================
    // KULLANICILARI GETİR
    // =====================================================

    const {
        data: users,
        error: usersError
    } = await db.rpc("admin_users");


    if (usersError) {

        console.error("ADMIN USERS ERROR:", usersError);

        const summary =
            document.getElementById("summary");

        if (summary) {
            summary.textContent =
                "Kullanıcılar yüklenirken hata oluştu.";
        }

        return;
    }


    // =====================================================
    // KİTAPLARI GETİR
    // =====================================================

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

        console.error("BOOKS ERROR:", booksError);

    }


    const userList = users || [];
    const bookList = books || [];


    // =====================================================
    // ÖZET
    // =====================================================

    const summary =
        document.getElementById("summary");

    if (summary) {

        summary.textContent =
            `${userList.length} kullanıcı · ${bookList.length} kitap`;

    }


    // =====================================================
    // ÜSTTEKİ İSTATİSTİKLER
    // =====================================================

    const userCount =
        document.getElementById("userCount");

    const bookCount =
        document.getElementById("bookCount");


    if (userCount) {
        userCount.textContent =
            userList.length;
    }


    if (bookCount) {
        bookCount.textContent =
            bookList.length;
    }


    // =====================================================
    // KULLANICILAR
    // =====================================================

    const target =
        document.getElementById("users");


    if (target) {

        target.innerHTML = "";


        if (userList.length === 0) {

            target.innerHTML = `
                <div class="empty-state">
                    Henüz kayıtlı kullanıcı bulunmuyor.
                </div>
            `;

        }


        userList.forEach(item => {

            const card =
                document.createElement("article");


            // ---------------------------------------------
            // KULLANICI ADI
            // ---------------------------------------------

            const title =
                document.createElement("h3");

            title.textContent =
                item.username || "Kullanıcı";


            // ---------------------------------------------
            // E-POSTA
            // ---------------------------------------------

            const email =
                document.createElement("p");

            email.textContent =
                item.email || "E-posta bulunamadı";


            // ---------------------------------------------
            // DURUM BİLGİSİ
            // ---------------------------------------------

            const status =
                document.createElement("p");

            status.style.marginTop = "4px";

            status.textContent =
                item.is_active
                    ? "● Aktif kullanıcı"
                    : "● Pasif kullanıcı";


            status.style.color =
                item.is_active
                    ? "#1f5a4e"
                    : "#b94b4b";


            // ---------------------------------------------
            // ADMIN BUTONU
            // ---------------------------------------------

            const admin =
                document.createElement("button");


            admin.textContent =
                item.is_admin
                    ? "Adminliği kaldır"
                    : "Admin yap";


            admin.onclick = async () => {

                admin.disabled = true;

                const {
                    error
                } = await db
                    .from("profiles")
                    .update({
                        is_admin: !item.is_admin
                    })
                    .eq("id", item.id);


                if (error) {

                    console.error(
                        "ADMIN UPDATE ERROR:",
                        error
                    );

                    alert(
                        "Admin yetkisi değiştirilirken hata oluştu."
                    );

                    admin.disabled = false;

                    return;
                }


                location.reload();

            };


            // ---------------------------------------------
            // AKTİF / PASİF BUTONU
            // ---------------------------------------------

            const active =
                document.createElement("button");


            active.style.marginTop =
                "8px";


            active.textContent =
                item.is_active
                    ? "Pasife al"
                    : "Aktifleştir";


            active.onclick = async () => {

                active.disabled = true;


                const {
                    error
                } = await db
                    .from("profiles")
                    .update({
                        is_active: !item.is_active
                    })
                    .eq("id", item.id);


                if (error) {

                    console.error(
                        "ACTIVE UPDATE ERROR:",
                        error
                    );

                    alert(
                        "Kullanıcı durumu değiştirilirken hata oluştu."
                    );

                    active.disabled = false;

                    return;
                }


                location.reload();

            };


            // ---------------------------------------------
            // KART
            // ---------------------------------------------

            card.append(
                title,
                email,
                status,
                admin,
                active
            );


            target.append(card);

        });

    }


    // =====================================================
    // KİTAPLAR
    // =====================================================

    const bookTarget =
        document.getElementById("books");


    if (bookTarget) {

        bookTarget.innerHTML = "";


        if (bookList.length === 0) {

            bookTarget.innerHTML = `
                <div class="empty-state">
                    Henüz kayıtlı kitap bulunmuyor.
                </div>
            `;

        }


        bookList.forEach(book => {

            const card =
                document.createElement("article");


            // ---------------------------------------------
            // KİTAP ADI
            // ---------------------------------------------

            const title =
                document.createElement("input");


            title.type = "text";

            title.value =
                book.title || "";


            title.placeholder =
                "Kitap adı";


            // ---------------------------------------------
            // SAYFA SAYISI
            // ---------------------------------------------

            const pages =
                document.createElement("input");


            pages.type = "number";

            pages.min = "1";

            pages.value =
                book.page_count || "";


            pages.placeholder =
                "Sayfa sayısı";


            // ---------------------------------------------
            // KAYDET
            // ---------------------------------------------

            const save =
                document.createElement("button");


            save.textContent =
                "Kaydet";


            save.onclick = async () => {

                const newTitle =
                    title.value.trim();


                const newPages =
                    Number(pages.value);


                if (!newTitle) {

                    alert(
                        "Kitap adı boş bırakılamaz."
                    );

                    return;
                }


                if (!newPages || newPages < 1) {

                    alert(
                        "Geçerli bir sayfa sayısı gir."
                    );

                    return;
                }


                save.disabled = true;

                save.textContent =
                    "Kaydediliyor...";


                const {
                    error
                } = await db
                    .from("books")
                    .update({
                        title: newTitle,
                        page_count: newPages
                    })
                    .eq("id", book.id);


                if (error) {

                    console.error(
                        "BOOK UPDATE ERROR:",
                        error
                    );

                    alert(
                        "Kitap güncellenirken hata oluştu."
                    );

                    save.disabled = false;

                    save.textContent =
                        "Kaydet";

                    return;
                }


                save.textContent =
                    "Kaydedildi ✓";


                setTimeout(() => {

                    save.textContent =
                        "Kaydet";

                    save.disabled = false;

                }, 1200);

            };


            // ---------------------------------------------
            // SİL
            // ---------------------------------------------

            const remove =
                document.createElement("button");


            remove.style.marginTop =
                "8px";


            remove.textContent =
                "Sil";


            remove.onclick = async () => {

                const confirmed =
                    confirm(
                        `"${book.title}" kitabı silinsin mi?`
                    );


                if (!confirmed) {
                    return;
                }


                remove.disabled = true;

                remove.textContent =
                    "Siliniyor...";


                const {
                    error
                } = await db
                    .from("books")
                    .delete()
                    .eq("id", book.id);


                if (error) {

                    console.error(
                        "BOOK DELETE ERROR:",
                        error
                    );

                    alert(
                        "Kitap silinirken hata oluştu."
                    );

                    remove.disabled = false;

                    remove.textContent =
                        "Sil";

                    return;
                }


                location.reload();

            };


            // ---------------------------------------------
            // KART
            // ---------------------------------------------

            card.append(
                title,
                pages,
                save,
                remove
            );


            bookTarget.append(card);

        });

    }

});
