/* ===== ログイン関連 ===== */
const loginScreen = document.getElementById("loginScreen");
const registerScreen = document.getElementById("registerScreen");
const dashboard = document.getElementById("dashboard");

const savedUser = localStorage.getItem("username");
const savedPass = localStorage.getItem("password");

// 初期表示
if (!savedUser || !savedPass) {
  registerScreen.style.display = "block";
} else {
  loginScreen.style.display = "block";
}

// 登録処理
document.addEventListener("DOMContentLoaded", () => {
  const regBtn = document.getElementById("registerBtn");
  if (regBtn) {
    regBtn.addEventListener("click", () => {
      const u = document.getElementById("regUser").value.trim();
      const p = document.getElementById("regPass").value.trim();

      if (!u || !p) {
        alert("ユーザー名とパスワードを入力してください");
        return;
      }

      localStorage.setItem("username", u);
      localStorage.setItem("password", p);
      alert("登録完了しました！ログインしてください。");

      // 直接 login.html に移動する
      window.location.href = "login.html";
    });
  }
});


// ログイン処理
document.getElementById("loginBtn").addEventListener("click", () => {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value.trim();

  if (u === localStorage.getItem("username") && p === localStorage.getItem("password")) {
    // ✅ 自動ログインチェック
    const chk = document.getElementById("autoLoginChk");
    if (chk && chk.checked) {
      localStorage.setItem("autoLoginUser", u);
    } else {
      localStorage.removeItem("autoLoginUser");
    }

    // ダッシュボード表示
    loginScreen.style.display = "none";
    dashboard.style.display = "block";
  } else {
    document.getElementById("loginMessage").textContent =
      "ユーザー名またはパスワードが違います";
  }
});


/* ====== 共通モーダル ====== */
const overlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

function openModal(title, contentHtml, onSave) {
  modalTitle.textContent = title;
  modalContent.innerHTML = contentHtml;
  overlay.style.display = "flex";

  function close() {
    overlay.style.display = "none";
    saveBtn.onclick = null;
    cancelBtn.onclick = null;
  }

  saveBtn.onclick = () => {
    onSave && onSave();
    close();
  };
  cancelBtn.onclick = () => {
    close();
  };
}

// 背景クリックで閉じる
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) overlay.style.display = "none";
});
window.addEventListener("keydown", (e) => { if (e.key === "Escape") overlay.style.display = "none"; });

/* ====== 永続化と初期データ読み込み ====== */
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let countdowns = JSON.parse(localStorage.getItem("countdowns") || "[]");
let zoomSettings = JSON.parse(localStorage.getItem("zoomSettings") || "null") || { link: "", time: "" };

const taskListEl = document.getElementById("taskList");
const countdownGrid = document.getElementById("countdownGrid");
const zoomStatusEl = document.getElementById("zoomStatus");
const joinBtn = document.getElementById("joinBtn");
const successBtn = document.getElementById("successBtn");

function saveAll() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("countdowns", JSON.stringify(countdowns));
  localStorage.setItem("zoomSettings", JSON.stringify(zoomSettings));
}

/* ====== 今日やること ====== */
function renderTasks() {
  taskListEl.innerHTML = "";
  if (tasks.length === 0) {
    const p = document.createElement("li");
    p.textContent = "（タップして追加）";
    p.style.opacity = 0.6;
    taskListEl.appendChild(p);
    return;
  }
  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t;
    li.style.padding = "6px 0";
    taskListEl.appendChild(li);
  });
}

document.getElementById("editTasks").addEventListener("click", () => {
  const html = `
    <div id="taskBox">
      <div style="margin-bottom:8px;"><strong>現在のタスク</strong></div>
      <div id="taskListEdit" style="max-height:180px; overflow:auto; margin-bottom:8px;"></div>
      <input type="text" id="newTask" placeholder="新しいタスクを入力">
    </div>
  `;
  openModal("今日やること", html, () => {
    const v = document.getElementById("newTask").value.trim();
    if (v) tasks.push(v);
    // 内部の削除ボタンからの操作も保持
    saveAll();
    renderTasks();
  });

  // モーダルが開いたら現在のタスクをリスト化
  setTimeout(() => {
    const editBox = document.getElementById("taskListEdit");
    editBox.innerHTML = "";
    tasks.forEach((t, idx) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.marginBottom = "6px";

      const span = document.createElement("span");
      span.textContent = t;
      row.appendChild(span);

      const del = document.createElement("button");
      del.textContent = "削除";
      del.style.background = "#efefef";
      del.style.border = "none";
      del.style.borderRadius = "6px";
      del.style.padding = "4px 8px";
      del.style.cursor = "pointer";
      del.onclick = () => {
        tasks.splice(idx, 1);
        saveAll();
        renderTasks();
        // 画面内も消す
        row.remove();
      };
      row.appendChild(del);

      editBox.appendChild(row);
    });
  }, 10);
});

/* ====== カウントダウン（2列・日付順） ====== */
function calcDaysLeft(dateStr) {
  const now = new Date();
  now.setHours(0,0,0,0);
  const target = new Date(dateStr);
  target.setHours(0,0,0,0);
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function renderCountdowns() {
  // 日付近い順
  countdowns.sort((a,b) => new Date(a.date) - new Date(b.date));
  countdownGrid.innerHTML = "";
  countdowns.forEach(c => {
    const days = calcDaysLeft(c.date);
    const card = document.createElement("div");
    card.className = "countdown-card";
    card.style.background = c.color || "#007aff";
    card.innerHTML = `
      <div class="card-header">
        <span>${c.name}</span>
        <button class="delete-btn" data-id="${c.id}">×</button>
      </div>
      <div class="card-sub">入試日: ${c.date}</div>
      <div class="card-body">${days}日</div>
    `;
    countdownGrid.appendChild(card);
  });

  // 削除イベント
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      countdowns = countdowns.filter(x => String(x.id) !== String(id));
      saveAll();
      renderCountdowns();
    });
  });
}

document.getElementById("editCountdown").addEventListener("click", () => {
  // モーダル内で追加＋現在一覧表示（簡易編集）
  const html = `
    <div>
      <input type="text" id="schoolName" placeholder="学校名">
      <input type="date" id="examDate">
      <input type="color" id="schoolColor" value="#007aff">
      <div style="margin-top:12px; font-weight:600;">現在の登録</div>
      <div id="countdownListEdit" style="max-height:180px; overflow:auto; margin-top:8px;"></div>
    </div>
  `;
  openModal("カウントダウン設定", html, () => {
    const name = document.getElementById("schoolName").value.trim();
    const date = document.getElementById("examDate").value;
    const color = document.getElementById("schoolColor").value;
    if (!name || !date) return;
    const id = Date.now();
    countdowns.push({ id, name, date, color });
    saveAll();
    renderCountdowns();
  });

  setTimeout(() => {
    const list = document.getElementById("countdownListEdit");
    list.innerHTML = "";
    countdowns.forEach((c, idx) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.padding = "6px 0";

      const left = document.createElement("div");
      left.innerHTML = `<strong>${c.name}</strong><div style="font-size:12px; opacity:0.8;">${c.date}</div>`;
      row.appendChild(left);

      const del = document.createElement("button");
      del.textContent = "削除";
      del.style.background = "#efefef";
      del.style.border = "none";
      del.style.borderRadius = "6px";
      del.style.padding = "6px 8px";
      del.style.cursor = "pointer";
      del.onclick = () => {
        countdowns.splice(idx, 1);
        saveAll();
        renderCountdowns();
        row.remove();
      };
      row.appendChild(del);

      list.appendChild(row);
    });
  }, 10);
});

/* ====== Zoom 自習室 ====== */
let startTime = null;
let joinTimer = null;

document.getElementById("editZoom").addEventListener("click", () => {
  const canChangeLink = !!zoomSettings.link ? `<label><input type="checkbox" id="changeLink"> リンクを変更する</label>` : "";
  const html = `
    <div>
      <label>開始時刻</label>
      <input type="time" id="zoomTime" value="${zoomSettings.time || ''}">
      <label style="display:block; margin-top:8px;">Zoomリンク</label>
      <input type="url" id="zoomUrl" placeholder="https://zoom.us/..." value="${zoomSettings.link || ''}" ${zoomSettings.link ? "disabled" : ""}>
      ${canChangeLink}
    </div>
  `;
  openModal("Zoom設定", html, () => {
    const time = document.getElementById("zoomTime").value;
    const url = document.getElementById("zoomUrl").value;
    zoomSettings.time = time || "";
    if (document.getElementById("changeLink") && document.getElementById("changeLink").checked) {
      zoomSettings.link = url || "";
    } else if (!zoomSettings.link && url) {
      // 初回保存
      zoomSettings.link = url || "";
    }
    saveAll();
    updateZoomStatus();
  });

  // モーダル内のトグル制御
  setTimeout(() => {
    const chk = document.getElementById("changeLink");
    const urlInput = document.getElementById("zoomUrl");
    if (chk) {
      chk.addEventListener("change", () => {
        urlInput.disabled = !chk.checked;
      });
    }
  }, 10);
});

joinBtn.addEventListener("click", () => {
  if (zoomSettings.link) {
    window.open(zoomSettings.link, "_blank");
    joinBtn.style.display = "none";
    successBtn.style.display = "inline-block";
  } else {
    alert("先にZoomリンクを設定してください（✏️をタップ）");
  }
});

successBtn.addEventListener("click", () => {
  startTime = new Date();
  successBtn.style.display = "none";
  if (joinTimer) clearInterval(joinTimer);
  joinTimer = setInterval(updateZoomStatus, 1000);
});

/* 表示更新 */
function updateZoomStatus() {
  if (!zoomSettings.time) {
    zoomStatusEl.textContent = "未設定";
    return;
  }

  if (startTime) {
    const diff = Date.now() - startTime.getTime();
    zoomStatusEl.textContent = "入室してから " + formatDuration(diff);
  } else {
    const [h,m] = zoomSettings.time.split(":").map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target - new Date();
    if (diff > 0) {
      zoomStatusEl.textContent = "開始まで " + formatDuration(diff);
    } else {
      zoomStatusEl.textContent = "開始時間を過ぎています";
    }
  }
}

/* ====== ユーティリティ ====== */
function formatDuration(ms) {
  // ms が負でも扱える（ただし表示は0秒以下なら 0:00 とする）
  let totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${m}:${String(s).padStart(2,"0")}`;
}

/* ====== 初期レンダリング & タイマー ====== */
renderTasks();
renderCountdowns();
updateZoomStatus();
setInterval(() => {
  renderCountdowns();
  updateZoomStatus();
}, 1000);

/* ====== Service Worker 登録 ====== */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("SW registered"))
    .catch(err => console.error("SW registration failed:", err));
}

// ログアウト処理
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // 自動ログイン設定を消す
      localStorage.removeItem("autoLoginUser");
      // login.html に戻る
      window.location.href = "login.html";
    });
  }
});

// register.html 専用の登録処理
document.addEventListener("DOMContentLoaded", () => {
  const regBtn = document.getElementById("registerBtn");
  if (regBtn) {
    regBtn.addEventListener("click", () => {
      const u = document.getElementById("regUser").value.trim();
      const p = document.getElementById("regPass").value.trim();

      if (!u || !p) {
        alert("ユーザー名とパスワードを入力してください");
        return;
      }

      // 保存
      localStorage.setItem("username", u);
      localStorage.setItem("password", p);

      alert("登録完了しました！ログインしてください。");
      // login.html に強制移動
      window.location.href = "login.html";
    });
  }
});
