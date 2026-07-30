(() => {
  const PASSWORDS = ["rizwana", "rukayya"];
  const screens = [...document.querySelectorAll(".screen")];
  const form = document.querySelector("#password-form");
  const code = document.querySelector("#secret-code");
  const message = document.querySelector("#password-message");
  const noBtn = document.querySelector("#no-btn");
  const yesBtn = document.querySelector("#yes-btn");
  const choiceArea = document.querySelector("#choice-area");
  const welcomeCard = document.querySelector(".welcome-card");
  const toast = document.querySelector("#toast");
  const audio = document.querySelector("#love-song");
  const musicBtn = document.querySelector("#music-btn");
  let noCount = 0, currentNote = 0;

  // ---- Gallery preview + overlay ----
  const galleryPreview = document.querySelector("#gallery-preview");
  const galleryPreviewStrip = document.querySelector("#gallery-preview-strip");
  const galleryOverlay = document.querySelector("#gallery-overlay");
  const galleryOverlayCount = document.querySelector("#gallery-overlay-count");
  const galleryGrid = document.querySelector("#gallery-grid");
  const galleryBackBtn = document.querySelector("#gallery-back-btn");
  const galleryLightbox = document.querySelector("#gallery-lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxCounter = document.querySelector("#lightbox-counter");
  const lightboxPrev = document.querySelector("#lightbox-prev");
  const lightboxNext = document.querySelector("#lightbox-next");
  const galleryPhotos = [
    {src:"assets/photos/photo-1.jpg", alt:"Rizwana smiling on a rooftop at sunset"},
    {src:"assets/photos/photo-2.jpg", alt:"Rizwana taking a mirror selfie"},
    {src:"assets/photos/photo-3.jpg", alt:"Rizwana holding a bouquet of pink roses"},
    {src:"assets/photos/photo-4.jpg", alt:"Rizwana smiling softly by warm fairy lights"},
    {src:"assets/photos/photo-5.jpg", alt:"A lovely portrait of Rizwana"}
  ];
  let lightboxIndex = 0, galleryLastFocused = null;

  // ---- Music playlist ----
  const PLAYLIST = ["assets/music/song1.mp3","assets/music/song2.mp3","assets/music/song3.mp3"];
  let currentTrackIndex = null, musicStarted = false;
  let longPressTimer = null;
  let longPressTriggered = false;
  const LONG_PRESS_DURATION = 400;

  const notes = [
    {title:"For when you want to smile", body:[
      "Rizwana, I hope you never forget how beautiful your smile is to me. It has a way of making even an ordinary moment feel warm and special.",
      "Whenever you smile, babe, I feel like the whole world becomes a little softer. So keep that beautiful smile close — and remember that there is someone who loves seeing it more than words can explain."
    ]},
    {title:"For when you miss me", body:[
      "My Rukayya, distance can change where we are, but it can never change what you mean to me. If you miss me, close your eyes and remember that my heart is always carrying you with it.",
      "Think of this little website as a tiny place where my words are waiting to hold you until I can do it myself. I miss you too, wifey. Always."
    ]},
    {title:"For when you need to feel loved", body:[
      "Babe, you are loved on the quiet days, the difficult days, the happy days, and every day in between. You never have to earn that love by being perfect.",
      "You are my beautiful wife, my comfort, and one of the sweetest gifts in my life. I choose you with a full heart, again and again."
    ]},
    {title:"What I love about you", body:[
      "I love your softness, your strength, your little expressions, and the way you can make a moment feel important without even trying.",
      "I love the person you are, Rizwana — not only the beautiful face I see in these pictures, but the heart behind it. You are special to me in ways I will keep discovering for the rest of my life."
    ]},
    {title:"A message for my beautiful wifey", body:[
      "Wifey, thank you for being you. Thank you for the laughter, the care, the little moments, and all the memories we are still creating.",
      "I want to be someone who makes you feel safe, appreciated, and deeply loved. I will keep finding new ways to remind you that you are my babe, my Rukayya, and my favorite person."
    ]},
    {title:"Open this one last ❤️", body:[
      "My beautiful Rizwana, this surprise is small, but the love behind it is not. I made it because I love seeing you happy, and because your smile is one of my favorite things in this world.",
      "No matter how many words I write, they may never fully explain what you mean to me. So for now, keep this simple truth close: I love you, cutie pie. Today, tomorrow, and through every chapter we share. 🦆🍼"
    ]}
  ];

  function showScreen(id){
    screens.forEach(s => s.classList.toggle("active", s.id === id));
    window.scrollTo({top:0, behavior:"smooth"});
  }
  function showToast(text){
    toast.textContent=text; toast.classList.add("show");
    clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove("show"),2600);
  }
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const value=code.value.trim().toLowerCase();
    if(PASSWORDS.includes(value)){
      message.textContent="";
      showScreen("welcome-screen");
      burstHearts();
    } else {
      message.textContent="That is not the secret name, babe. Try again ♡";
      document.querySelector(".password-card").classList.remove("shake");
      requestAnimationFrame(()=>document.querySelector(".password-card").classList.add("shake"));
      code.select();
    }
  });
  code.addEventListener("input", ()=>{ if(message.textContent) message.textContent=""; });

  const noTexts=["Are you sure? 🥺","Really, wifey? 😭","You can't escape, babe 😂","Nice try, Rukayya 😜","Wrong button, cutie pie 🦆","Just press YES PLEASE ❤️"];
  let noX=0, noY=0, noLastMove=0;
  const NO_ANIM_MS=500; // keep in sync with the .no-btn transition duration below

  function rectsOverlap(l1,t1,w1,h1,l2,t2,w2,h2,pad=6){
    return !(l1+w1+pad<l2 || l1>l2+w2+pad || t1+h1+pad<t2 || t1>t2+h2+pad);
  }

  // The button never leaves normal document flow (so YES never jumps around) --
  // it only ever gets a CSS transform, which the .no-btn transition animates
  // smoothly. Bounds are measured live each time against the visible slice of
  // the card, so it has real room to roam on every screen size, is never sent
  // somewhere off-screen, and never lands on top of the YES button. A short
  // debounce (matching the transition length) makes sure we only ever measure
  // it once it has fully arrived, not mid-flight.
  function moveNoButton(e){
    if(e && e.cancelable) e.preventDefault();
    const now=performance.now();
    if(now-noLastMove<NO_ANIM_MS) return;
    noLastMove=now;

    noBtn.textContent=noTexts[noCount%noTexts.length];
    noCount++;

    const cardRect=welcomeCard.getBoundingClientRect();
    const area={
      left:Math.max(cardRect.left,0),
      right:Math.min(cardRect.right,window.innerWidth),
      top:Math.max(cardRect.top,0),
      bottom:Math.min(cardRect.bottom,window.innerHeight)
    };
    const rect=noBtn.getBoundingClientRect();
    const yesRect=yesBtn.getBoundingClientRect();
    const naturalLeft=rect.left-noX, naturalTop=rect.top-noY;
    const pad=14;

    const minX=(area.left+pad)-naturalLeft;
    const maxX=Math.max(minX,(area.right-pad-rect.width)-naturalLeft);
    const minY=(area.top+pad)-naturalTop;
    const maxY=Math.max(minY,(area.bottom-pad-rect.height)-naturalTop);

    let nx=noX, ny=noY;
    for(let tries=0;tries<10;tries++){
      nx=minX+Math.random()*(maxX-minX);
      ny=minY+Math.random()*(maxY-minY);
      const left=naturalLeft+nx, top=naturalTop+ny;
      if(!rectsOverlap(left,top,rect.width,rect.height,yesRect.left,yesRect.top,yesRect.width,yesRect.height,10)) break;
    }

    noX=nx; noY=ny;
    const rotate=(Math.random()*14-7).toFixed(1);
    noBtn.style.transform=`translate(${noX}px,${noY}px) rotate(${rotate}deg)`;

    if(noCount===3) showToast("Nice try, cutie pie 😂");
  }

  noBtn.addEventListener("mouseenter",moveNoButton);
  noBtn.addEventListener("touchstart",moveNoButton,{passive:false});

  let noResizeTimer;
  window.addEventListener("resize",()=>{
    clearTimeout(noResizeTimer);
    noResizeTimer=setTimeout(()=>{ noX=0; noY=0; noLastMove=0; noBtn.style.transform=""; },150);
  });
  yesBtn.addEventListener("click",()=>{showScreen("reveal-screen");burstHearts(18)});
  document.querySelector("#open-letters-btn").addEventListener("click",()=>showScreen("letters-screen"));
  document.querySelector("#back-to-reveal").addEventListener("click",()=>showScreen("reveal-screen"));
  document.querySelector("#replay-btn").addEventListener("click",()=>showScreen("letters-screen"));

  const modal=document.querySelector("#note-modal"), title=document.querySelector("#note-title"), body=document.querySelector("#note-body");
  function openNote(index) {
  // ... your existing text population code ...
  
  modal.classList.add("open");
  modal.removeAttribute("inert");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  
  // Focus the button AFTER the modal is visible
  const nextBtn = document.querySelector("#next-letter-btn");
  if (nextBtn) nextBtn.focus();
}

function closeNote() {
  // Move focus back to the page background before hiding
  if (document.activeElement && modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }
  
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("inert", "");
  document.body.style.overflow = "";
});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("open"))closeNote()});

  // ---- Gallery preview ----
  function buildGalleryPreview(){
    const PREVIEW_COUNT=4;
    const shown=galleryPhotos.slice(0,PREVIEW_COUNT);
    const remaining=galleryPhotos.length-shown.length;
    galleryPreviewStrip.innerHTML=shown.map(p=>`<img src="${p.src}" alt="${p.alt}" loading="lazy">`).join("");
    if(remaining>0){
      const label=remaining===1?"photo":"photos";
      galleryPreviewStrip.insertAdjacentHTML("beforeend",`<span class="gallery-preview-more" aria-hidden="true"><span class="more-icon">📷</span><span class="more-count">+${remaining}</span><span class="more-label">${label}</span></span>`);
    }
  }
  buildGalleryPreview();

  // ---- Gallery overlay (modal, not a page) ----
  function buildGalleryGrid(){
    galleryGrid.innerHTML=galleryPhotos.map((p,i)=>`<button type="button" data-index="${i}" aria-label="Open photo ${i+1} of ${galleryPhotos.length}"><img src="${p.src}" alt="${p.alt}" loading="lazy"></button>`).join("");
    galleryOverlayCount.textContent=`${galleryPhotos.length} photos`;
  }
  buildGalleryGrid();

  function openGallery(){
    galleryLastFocused=document.activeElement;
    galleryOverlay.classList.add("open");
    galleryOverlay.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    galleryBackBtn.focus();
  }
  function closeGallery(){
    galleryOverlay.classList.remove("open");
    galleryOverlay.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
    closeLightbox();
    if(galleryLastFocused) galleryLastFocused.focus();
  }
  function updateLightboxImage(){
    const photo=galleryPhotos[lightboxIndex];
    lightboxImage.src=photo.src;lightboxImage.alt=photo.alt;
    lightboxCounter.textContent=`${lightboxIndex+1} / ${galleryPhotos.length}`;
  }
  function openLightbox(index){lightboxIndex=index;updateLightboxImage();galleryLightbox.classList.add("open")}
  function closeLightbox(){galleryLightbox.classList.remove("open")}
  function galleryGoBack(){
    if(galleryLightbox.classList.contains("open")) closeLightbox();
    else closeGallery();
  }
  function showNextPhoto(dir){
    lightboxIndex=(lightboxIndex+dir+galleryPhotos.length)%galleryPhotos.length;
    updateLightboxImage();
  }

  galleryPreview.addEventListener("click",openGallery);
  galleryPreview.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openGallery()}});
  galleryGrid.addEventListener("click",e=>{
    const btn=e.target.closest("button[data-index]");
    if(btn) openLightbox(Number(btn.dataset.index));
  });
  galleryBackBtn.addEventListener("click",galleryGoBack);
  document.querySelectorAll("[data-gallery-back]").forEach(el=>el.addEventListener("click",galleryGoBack));
  lightboxPrev.addEventListener("click",()=>showNextPhoto(-1));
  lightboxNext.addEventListener("click",()=>showNextPhoto(1));
  document.addEventListener("keydown",e=>{
    if(!galleryOverlay.classList.contains("open")) return;
    if(e.key==="Escape") galleryGoBack();
    else if(e.key==="ArrowRight"&&galleryLightbox.classList.contains("open")) showNextPhoto(1);
    else if(e.key==="ArrowLeft"&&galleryLightbox.classList.contains("open")) showNextPhoto(-1);
  });
  let galleryTouchX=0;
  galleryLightbox.addEventListener("touchstart",e=>{galleryTouchX=e.changedTouches[0].clientX},{passive:true});
  galleryLightbox.addEventListener("touchend",e=>{
    const dx=e.changedTouches[0].clientX-galleryTouchX;
    if(Math.abs(dx)>40) showNextPhoto(dx<0?1:-1);
  },{passive:true});

  // ---- Music playlist: one shared <audio>, no duplicate Audio objects ----
  function pickRandomTrack(excludeIndex){
    if(PLAYLIST.length===1) return 0;
    let idx;
    do{idx=Math.floor(Math.random()*PLAYLIST.length)}while(idx===excludeIndex);
    return idx;
  }
  function playTrack(index){
    currentTrackIndex=index;
    audio.src=PLAYLIST[index];
    audio.load();
    audio.play().then(()=>{
      musicBtn.classList.add("playing");
      musicBtn.setAttribute("aria-pressed","true");
      musicBtn.title="Skip to another song";
      showToast("Our song is playing ♫");
    }).catch(()=>{
      musicBtn.classList.remove("playing");
      musicBtn.setAttribute("aria-pressed","false");
      showToast("Add your MP3s to assets/music/ 🎵");
    });
  }
  function stopMusic() {
  longPressTriggered = true;

  audio.pause();
  audio.currentTime = 0;

  musicStarted = false;
  currentTrackIndex = null;

  musicBtn.classList.remove("playing");
  musicBtn.setAttribute("aria-pressed", "false");
  musicBtn.title = "Play our songs";

  showToast("Music stopped ♡");
}
  audio.addEventListener("ended",()=>{playTrack(pickRandomTrack(currentTrackIndex))});
  audio.addEventListener("error",()=>{
    musicBtn.classList.remove("playing");
    musicBtn.setAttribute("aria-pressed","false");
    showToast("Add your MP3s to assets/music/ 🎵");
  });
  musicBtn.addEventListener("click",()=>{
    if (longPressTriggered) {
  longPressTriggered = false;
  return;
    }
    if(!musicStarted){
      musicStarted=true;
      playTrack(pickRandomTrack(null));
    }else if(audio.paused){
      audio.play().then(()=>{musicBtn.classList.add("playing");musicBtn.setAttribute("aria-pressed","true")}).catch(()=>{showToast("Add your MP3s to assets/music/ 🎵")});
    }else{
      playTrack(pickRandomTrack(currentTrackIndex));
    }
  });

  function startLongPress() {
  longPressTriggered = false;

  clearTimeout(longPressTimer);

  longPressTimer = setTimeout(() => {
    stopMusic();
  }, LONG_PRESS_DURATION);
}

function cancelLongPress() {
  clearTimeout(longPressTimer);
}

musicBtn.addEventListener("pointerdown", startLongPress);
musicBtn.addEventListener("pointerup", cancelLongPress);
musicBtn.addEventListener("pointerleave", cancelLongPress);
musicBtn.addEventListener("pointercancel", cancelLongPress);
  function burstHearts(count=12){
    for(let i=0;i<count;i++){
      const h=document.createElement("span");h.textContent=["♡","♥","💕"][Math.floor(Math.random()*3)];
      h.style.cssText=`position:fixed;left:${35+Math.random()*30}%;top:${50+Math.random()*18}%;z-index:60;color:${Math.random()>.5?"#b94f76":"#7b1d43"};font-size:${15+Math.random()*25}px;pointer-events:none;transition:transform 1.5s ease,opacity 1.5s ease`;
      document.body.appendChild(h);requestAnimationFrame(()=>{h.style.transform=`translate(${(Math.random()-.5)*500}px,${-150-Math.random()*400}px) rotate(${Math.random()*360}deg)`;h.style.opacity="0"});
      setTimeout(()=>h.remove(),1600);
    }
  }
})();