document.addEventListener("DOMContentLoaded", async () => {
    const user=await requireUser(); if(!user)return;
    document.getElementById("logoutButton").onclick=e=>{e.preventDefault();logout();};
    const [{data:profile},{data:books,error}]=await Promise.all([db.from("profiles").select("monthly_goal").eq("id",user.id).single(),db.from("books").select("*")]);
    if(error)return;
    const list=books||[], read=list.filter(b=>b.status==="okundu"), now=new Date();
    const pages=read.reduce((n,b)=>n+b.page_count,0), month=read.filter(b=>b.finished_at&&new Date(b.finished_at).getMonth()===now.getMonth()&&new Date(b.finished_at).getFullYear()===now.getFullYear()).reduce((n,b)=>n+b.page_count,0);
    const set=(id,v)=>document.getElementById(id).textContent=v;
    set("totalBooks",list.length);set("readBooks",read.length);set("readPages",pages);set("monthlyPages",month);set("readCount",read.length);set("readingCount",list.filter(b=>b.status==="okunuyor").length);set("toReadCount",list.filter(b=>b.status==="okunacak").length);
    const counts={};read.forEach(b=>counts[b.author||"Bilinmeyen Yazar"]=(counts[b.author||"Bilinmeyen Yazar"]||0)+1);set("topAuthor",Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0]||"Henüz kitap okunmadı.");
    const input=document.getElementById("monthlyGoal"), progress=document.getElementById("goalProgress"); input.value=profile?.monthly_goal||"";
    const draw=goal=>progress.textContent=goal?`Bu ay ${month} / ${goal} sayfa okudun.`:"Henüz aylık bir hedef belirlemedin.";draw(profile?.monthly_goal||0);
    document.getElementById("saveGoalButton").onclick=async()=>{const goal=Number(input.value);if(!Number.isInteger(goal)||goal<0)return;const {error}=await db.from("profiles").update({monthly_goal:goal}).eq("id",user.id);if(!error)draw(goal);};
});
