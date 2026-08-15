-- Dijital Kütüphanem: Supabase şeması ve Row Level Security (RLS) kuralları
-- Bu dosyayı Supabase Dashboard > SQL Editor içinde bir kez çalıştırın.

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique check (char_length(username) between 3 and 40),
    monthly_goal integer not null default 0 check (monthly_goal >= 0),
    is_admin boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.books (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    source_id text,
    title text not null check (char_length(title) between 1 and 500),
    author text,
    page_count integer not null check (page_count > 0),
    cover_url text,
    genre text,
    status text not null default 'okunacak' check (status in ('okunacak', 'okunuyor', 'okundu')),
    added_at timestamptz not null default now(),
    finished_at timestamptz,
    constraint finished_book_has_date check (
        (status = 'okundu' and finished_at is not null) or
        (status <> 'okundu' and finished_at is null)
    )
);

create index books_user_id_index on public.books(user_id);
create index books_status_index on public.books(user_id, status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, username)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and is_admin = true and is_active = true
    );
$$;

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    if auth.uid() = old.id and not public.is_admin() then
        new.is_admin := old.is_admin;
        new.is_active := old.is_active;
    end if;
    new.updated_at := now();
    return new;
end;
$$;

create trigger before_profile_update
    before update on public.profiles
    for each row execute procedure public.protect_profile_fields();

alter table public.profiles enable row level security;
alter table public.books enable row level security;

create policy "Users can read their own profile"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((id = auth.uid() and is_active = true) or public.is_admin())
with check ((id = auth.uid() and is_active = true) or public.is_admin());

create policy "Users can read their own books"
on public.books for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can add their own books"
on public.books for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own books"
on public.books for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Users can delete their own books"
on public.books for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

create or replace function public.admin_users()
returns table (
    id uuid,
    username text,
    email text,
    is_admin boolean,
    is_active boolean,
    created_at timestamptz
)
language plpgsql
security definer set search_path = public, auth
as $$
begin
    if not public.is_admin() then
        raise exception 'Yetkisiz işlem';
    end if;

    return query
    select p.id, p.username, u.email, p.is_admin, p.is_active, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_users() to authenticated;

-- İlk yönetici hesabını kayıt olduktan sonra yalnızca SQL Editor'da aşağıdaki
-- komutla atayın. 'admin' yerine seçtiğiniz yönetici kullanıcı adını yazın:
-- update public.profiles set is_admin = true where username = 'admin';
