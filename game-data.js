var G1 = { id: 1, tag: "Уровень 1", name: "Катакомбы Скелетов", boss: "Повелитель Костей", xp: 1000, gold: 150, cost: 5, hits: 3, red: false };
var G2 = { id: 2, tag: "Уровень 2 • КРОВАВЫЙ", name: "Кровавая Тюрьма", boss: "Кровавый Палач", xp: 2000, gold: 350, cost: 10, hits: 5, red: true };
var G3 = { id: 3, tag: "Уровень 3 • КОШМАР", name: "Трон Красного Дракона", boss: "Кровавая Виверна", xp: 2500, gold: 600, cost: 15, hits: 7, red: true };
var G4 = { id: 4, tag: "Уровень 4 • БЕЗДНА", name: "Алтарь Проклятых Душ", boss: "Архилич Мортис", xp: 3000, gold: 900, cost: 20, hits: 10, red: true };
var G5 = { id: 5, tag: "Уровень 5 • СМЕРТЕЛЬНЫЙ", name: "Сердце Чёрной Бездны", boss: "Монарх Разрушения", xp: 5000, gold: 1500, cost: 25, hits: 15, red: true };
var ALL_GATES = [G1, G2, G3, G4, G5];

var game = { lvl: 1, gold: 500, eng: 80, exp: 0, gid: 1 };
try {
  var raw = localStorage.getItem("srpg_v10");
  if (raw) { var obj = JSON.parse(raw); if (obj && obj.lvl) game = obj; }
} catch(e) {}

function activeGate() {
  if (game.gid === 2) return G2;
  if (game.gid === 3) return G3;
  if (game.gid === 4) return G4;
  if (game.gid === 5) return G5;
  return G1;
}

var fight = { on: false, gate: G1, hp: 3, max: 3, skip: false };

function sync() {
  try { localStorage.setItem("srpg_v10", JSON.stringify(game)); } catch(e) {}
  document.getElementById("ui-lvl").textContent = game.lvl;
  document.getElementById("ui-rnk").textContent = game.lvl >= 10 ? "S" : game.lvl >= 7 ? "A" : game.lvl >= 5 ? "B" : game.lvl >= 3 ? "C" : game.lvl >= 2 ? "D" : "E";
  document.getElementById("ui-gold").textContent = game.gold;
  document.getElementById("ui-eng").textContent = game.eng;
  document.getElementById("ui-exp").textContent = game.exp;
  document.getElementById("ui-nexp").textContent = game.lvl * 5000;

  var g = activeGate();
  document.getElementById("h-tag").textContent = g.tag;
  document.getElementById("h-tag").style.color = g.red ? "#e74c3c" : "#3498db";
  document.getElementById("h-name").textContent = g.name;

  var box = document.getElementById("g-list");
  box.innerHTML = "";
  ALL_GATES.forEach(function(item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gate-card";
    btn.innerHTML = '<div><small style="color:' + (item.red ? '#e74c3c' : '#5dade2') + ';font-weight:700">' + item.tag + '</small><br><b>' + item.name + '</b><br><small style="color:#9aa5b4">Босс: ' + item.boss + ' (' + item.hits + ' уд.)</small></div><div style="text-align:right"><b style="color:#5dade2">-' + item.cost + '⚡</b><br><small style="color:#f5b041">+' + item.gold + '🪙</small></div>';
    btn.onclick = function() { game.gid = item.id; sync(); askEnter(); };
    box.appendChild(btn);
  });
}

function goPage(name) {
  var pages = document.querySelectorAll(".page");
  for (var i = 0; i < pages.length; i++) pages.item(i).classList.remove("on");
  document.getElementById("p-" + name).classList.add("on");

  var btns = document.querySelectorAll(".nav button");
  for (var j = 0; j < btns.length; j++) btns.item(j).classList.remove("on");
  document.getElementById("nav-" + name).classList.add("on");

  var fighting = (name === "gates" && fight.on);
  document.getElementById("g-list").style.display = fighting ? "none" : "block";
  document.getElementById("g-fight").style.display = fighting ? "flex" : "none";
  document.body.className = (fighting && fight.gate.red) ? "blood" : "";
}

function askEnter() {
  var g = activeGate();
  if (game.eng < g.cost) {
    document.getElementById("m-title").textContent = "Мало энергии!";
    document.getElementById("m-text").textContent = "Нужно " + g.cost + " энергии.";
    document.getElementById("m-ok").style.display = "none";
    document.getElementById("modal").classList.add("open");
    return;
  }
  document.getElementById("m-title").textContent = "Начать зачистку?";
  document.getElementById("m-text").textContent = "Войти в «" + g.name + "»? (-" + g.cost + " энергии)";
  document.getElementById("m-ok").style.display = "block";
  document.getElementById("modal").classList.add("open");
}

function closeModal() { document.getElementById("modal").classList.remove("open"); }

function startFight() {
  closeModal();
  var g = activeGate();
  game.eng -= g.cost;
  fight = { on: true, gate: g, hp: g.hits, max: g.hits, skip: false };
  sync();
  document.getElementById("f-boss").textContent = g.boss;
  document.getElementById("f-log").innerHTML = "<div>> Вы вошли в «" + g.name + "»! Противник: " + g.boss + ".</div>";
  drawHp();
  goPage("gates");
}

function drawHp() {
  var h = Math.max(0, fight.hp);
  document.getElementById("f-hp").textContent = h + " / " + fight.max + " УД.";
  document.getElementById("f-bar").style.width = (h / fight.max * 100) + "%";
}

function addLog(msg) {
  var l = document.getElementById("f-log");
  l.innerHTML += "<div>> " + msg + "</div>";
  l.scrollTop = l.scrollHeight;
}

function hit(isHead) {
  if (!fight.on) return;
  if (fight.skip) { addLog("Пропуск хода после промаха..."); fight.skip = false; return; }
  if (isHead) {
    if (Math.random() < 0.6) { fight.hp = 0; drawHp(); addLog("ВАНШОТ В ГОЛОВУ! Победа!"); }
    else { fight.skip = true; addLog("Промах! Пропуск следующего хода."); return; }
  } else {
    fight.hp -= 1; drawHp(); addLog("Удар в корпус! Осталось: " + Math.max(0, fight.hp));
  }
  if (fight.hp <= 0) {
    fight.on = false;
    game.gold += fight.gate.gold;
    game.exp += fight.gate.xp;
    addLog("Награда: +" + fight.gate.gold + " золота, +" + fight.gate.xp + " опыта!");
    while (game.exp >= game.lvl * 5000) {
      game.exp -= game.lvl * 5000;
      game.lvl += 1;
      game.eng = 80;
      addLog("НОВЫЙ УРОВЕНЬ " + game.lvl + "!");
    }
    sync();
    setTimeout(function() { goPage("gates"); }, 2000);
  }
}

function wipe() { try { localStorage.clear(); } catch(e) {} location.reload(); }
sync();
    
