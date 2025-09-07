// ===== モーダル制御 =====
const overlay = document.getElementById("modalOverlay");
const sheet = document.getElementById("modalSheet");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

function openModal(contentHtml) {
  modalContent.innerHTML = contentHtml;
  overlay.style.display = "flex";
  setTimeout(() => sheet.classList.add("show"), 10);
}

function closeModalFn() {
  sheet.classList.remove("show");
  setTimeout(() => { overlay.style.display = "none"; }, 300);
}

closeModal.onclick = closeModalFn;
overlay.onclick = e => { if (e.target === overlay) closeModalFn(); };

// ===== 編集アイコンの動き =====
document.getElementById("editTasks").onclick = () => {
  openModal("<h3>やること編集</h3><input type='text' placeholder='追加…'>");
};

document.getElementById("editZoom").onclick = () => {
  openModal("<h3>Zoom設定</h3><input type='time'>");
};

document.getElementById("editCountdown").onclick = () => {
  openModal("<h3>カウントダウン設定</h3><p>ここで学校の日付や色を設定できるようにする予定</p>");
};

// ===== Zoom 入室ボタンの動き =====
const joinBtn = document.getElementById("joinBtn");
const successBtn = document.getElementById("successBtn");
const zoomStatus = document.getElementById("zoomStatus");

let joinTime = null;

joinBtn.onclick = () => {
  window.open("https://zoom.us", "_blank"); // ← 本番は固定リンクに差し替え
  joinBtn.style.display = "none";
  successBtn.style.display = "inline-block";
};

successBtn.onclick = () => {
  joinTime = new Date();
  zoomStatus.textContent = "入室中…";
  successBtn.style.display = "none";
  // 経過時間を表示するタイマー開始
  setInterval(() => {
    if (joinTime) {
      const diff = Math.floor((Date.now() - joinTime.getTime()) / 1000);
      zoomStatus.textContent = "入室してから " + formatTime(diff);
    }
  }, 1000);
};

// ===== 時間フォーマット（35:10 / 1:21:34 形式） =====
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  } else {
    return `${m}:${String(s).padStart(2,"0")}`;
  }
}
