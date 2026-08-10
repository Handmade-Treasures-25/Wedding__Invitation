const openBtn = document.getElementById("openInvitation");
const invitation = document.getElementById("invitation");
const sparkleField = document.getElementById("sparkleField");

openBtn.addEventListener("click", () => {
  if (openBtn.classList.contains("loading")) return;
  openBtn.classList.add("loading");
  openBtn.querySelector(".btn-label").textContent = "Unveiling…";

  setTimeout(() => {
    openBtn.classList.remove("loading");
    openBtn.querySelector(".btn-label").textContent = "Invitation Opened";
    invitation.classList.add("visible");
    invitation.setAttribute("aria-hidden", "false");

    // IMPORTANT: the invitation was hidden before opening, so the scratch
    // canvas initially had 0x0 dimensions. Rebuild it after the section is visible.
    requestAnimationFrame(() => {
      resizeCanvas();
      burstSparkles(28);
      revealOnScroll();
    });
    setTimeout(() => document.getElementById("invitation").scrollIntoView({behavior:"smooth"}), 250);
  }, 1100);
});

/* Premium floating shimmer particles */
function createSpark() {
  const s = document.createElement("span");
  s.className = "spark";
  s.style.left = Math.random() * 100 + "%";
  s.style.top = (70 + Math.random() * 35) + "%";
  s.style.animationDuration = (5 + Math.random() * 6) + "s";
  s.style.animationDelay = Math.random() * 2 + "s";
  s.style.transform = `scale(${0.4 + Math.random() * 1.4})`;
  sparkleField.appendChild(s);
  setTimeout(() => s.remove(), 12000);
}
setInterval(createSpark, 700);
for(let i=0;i<12;i++) createSpark();

function burstSparkles(count=45) {
  for(let i=0;i<count;i++){
    const s = document.createElement("span");
    s.className = "spark";
    s.style.left = (45 + Math.random()*10) + "%";
    s.style.top = (45 + Math.random()*10) + "%";
    s.style.animationDuration = (1.8 + Math.random()*2.2) + "s";
    sparkleField.appendChild(s);
    setTimeout(()=>s.remove(),4500);
  }
}

/* Reveal sections on scroll */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add("show");
  });
},{threshold:.12});
function revealOnScroll(){ document.querySelectorAll(".reveal").forEach(el=>observer.observe(el)); }
revealOnScroll();

const scratchVisibilityObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      requestAnimationFrame(() => resizeCanvas());
    }
  });
}, {threshold: 0.05});
scratchVisibilityObserver.observe(document.getElementById("scratchCard"));

/* Scratch card */
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");
const card = document.getElementById("scratchCard");
const hint = document.getElementById("scratchHint");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const revealBurst = document.getElementById("revealBurst");

let drawing = false;
let completed = false;

function resizeCanvas(){
  const rect = card.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width*dpr;
  canvas.height = rect.height*dpr;
  canvas.style.width = rect.width+"px";
  canvas.style.height = rect.height+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);

  const w=rect.width,h=rect.height;
  const g=ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,"#9f776f");
  g.addColorStop(.3,"#dfc09c");
  g.addColorStop(.5,"#b8897e");
  g.addColorStop(.7,"#f0d6aa");
  g.addColorStop(1,"#8f655e");
  ctx.fillStyle=g;
  ctx.fillRect(0,0,w,h);

  /* subtle foil texture */
  for(let i=0;i<850;i++){
    ctx.fillStyle=`rgba(255,255,255,${Math.random()*.10})`;
    ctx.fillRect(Math.random()*w,Math.random()*h,1,1);
  }
  ctx.globalCompositeOperation="source-over";
  hint.style.opacity=1;
  progressBar.style.width="0%";
  progressText.textContent="0% revealed";
  completed=false;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function point(e){
  const r=canvas.getBoundingClientRect();
  const src=e.touches ? e.touches[0] : e;
  return {x:src.clientX-r.left,y:src.clientY-r.top};
}
function scratch(e){
  if(!drawing || completed) return;
  e.preventDefault();
  const p=point(e);
  ctx.globalCompositeOperation="destination-out";
  ctx.beginPath();
  ctx.arc(p.x,p.y,23,0,Math.PI*2);
  ctx.fill();
  checkProgress();
}
function start(e){drawing=true;scratch(e)}
function stop(){drawing=false}

canvas.addEventListener("mousedown",start);
canvas.addEventListener("mousemove",scratch);
window.addEventListener("mouseup",stop);
canvas.addEventListener("touchstart",start,{passive:false});
canvas.addEventListener("touchmove",scratch,{passive:false});
window.addEventListener("touchend",stop);

function checkProgress(){
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let transparent=0;
  /* sample every 16th pixel for performance */
  for(let i=3;i<pixels.length;i+=64){
    if(pixels[i]<90) transparent++;
  }
  const estimated = Math.min(100, Math.round((1-transparent/(pixels.length/64))*100));
  progressBar.style.width=estimated+"%";
  progressText.textContent=estimated+"% revealed";

  if(estimated>=60 && !completed){
    completed=true;
    finishScratch();
  }
}
function finishScratch(){
  hint.style.opacity=0;
  ctx.globalCompositeOperation="destination-out";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  progressBar.style.width="100%";
  progressText.textContent="100% revealed · ✦ revealed";
  createBurst();
  burstSparkles(35);
}
function createBurst(){
  for(let i=0;i<55;i++){
    const p=document.createElement("span");
    p.className="burst-particle";
    const angle=Math.random()*Math.PI*2;
    const dist=120+Math.random()*260;
    p.style.setProperty("--x",Math.cos(angle)*dist+"px");
    p.style.setProperty("--y",Math.sin(angle)*dist+"px");
    p.style.width=(4+Math.random()*6)+"px";
    p.style.height=(4+Math.random()*6)+"px";
    revealBurst.appendChild(p);
    setTimeout(()=>p.remove(),1700);
  }
}

/* Countdown: 18 October 2026, 6:30 PM local browser time */
const weddingDate = new Date("2026-10-18T18:30:00");
function updateCountdown(){
  const diff=Math.max(0,weddingDate-new Date());
  const sec=Math.floor(diff/1000);
  const days=Math.floor(sec/86400);
  const hours=Math.floor(sec%86400/3600);
  const mins=Math.floor(sec%3600/60);
  const seconds=sec%60;
  document.getElementById("days").textContent=String(days).padStart(2,"0");
  document.getElementById("hours").textContent=String(hours).padStart(2,"0");
  document.getElementById("minutes").textContent=String(mins).padStart(2,"0");
  document.getElementById("seconds").textContent=String(seconds).padStart(2,"0");
}
updateCountdown();
setInterval(updateCountdown,1000);

/* Location tracking button */
document.getElementById("trackLocation").addEventListener("click",()=>{
  const query=encodeURIComponent("Lake Como Italy");
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`,"_blank","noopener");
});
