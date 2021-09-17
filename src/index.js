/**
 * @type {HTMLElement}
 */
const grapher = document.querySelector("#grapher");

const width = 720;
const height = 500;

grapher.style.setProperty("--height", height);
grapher.style.setProperty("--width", width);

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector("#graph-canvas");
const ctx = canvas.getContext("2d");

ctx.canvas.width = width;
ctx.canvas.height = height;

// -------

function getCenterViewPos() {
  const ret = {
    left: -10,
    right: 10,

    get bottom() {
      return this.top - ((this.right - this.left) * height) / width;
    },
  };
  ret.top = ((-(ret.right - ret.left) / width) * height) / 2;
  return ret;
}

let viewPos = getCenterViewPos();

let center = {
  get x() {
    return (-width * viewPos.left) / unitsOnWidth();
  },
  get y() {
    return height - (-width * viewPos.top) / unitsOnWidth();
  },
};

function unitsOnWidth() {
  return viewPos.right - viewPos.left;
}

// ----------

function getUnitSpace() {
  const aim = 100;

  let d = (unitsOnWidth() * aim) / width;

  let k = 1;

  while (d > 10) {
    k *= 10;
    d /= 10;
  }
  while (d < 1) {
    k /= 10;
    d *= 10;
  }

  const p = [
    [1.75, 1],
    [3.75, 2.5],
    [7.5, 5],
    [11, 10],
  ];

  for (let i = 0; i < p.length; i++) {
    if (d < p[i][0]) {
      d = p[i][1];
      break;
    }
  }

  d *= k;

  return d;
}

function getGridSpace() {
  let d = getUnitSpace();
  d = (d / unitsOnWidth()) * width;

  return d;
}

function drawGrid() {
  ctx.fillStyle = "#102024";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#f0f0f0";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(center.x, 0);
  ctx.lineTo(center.x, height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height - center.y);
  ctx.lineTo(width, height - center.y);
  ctx.stroke();

  ctx.fillStyle = "#f0f0f0";
  ctx.beginPath();
  ctx.arc(center.x, height - center.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f0f0f020";

  let d = getGridSpace();

  for (const [dd, lw] of [
    [d, 3],
    [d / 5, 1],
  ]) {
    ctx.lineWidth = lw;

    const offx = center.x - dd * Math.floor(center.x / dd);

    for (let x = offx; x < width; x += dd) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const offy = center.y - dd * Math.floor(center.y / dd);

    for (let y = height - offy; y > 0; y -= dd) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
}

function drawGraph(func) {
  ctx.strokeStyle = func.color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, getCY(func.f, 0));

  for (let cx = 1; cx <= width; cx++) {
    ctx.lineTo(cx, getCY(func.f, cx));
  }

  ctx.stroke();
}

function drawLabels() {
  let d = getGridSpace();
  let u = getUnitSpace();

  ctx.fillStyle = "#f0f0f0";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.font = "oblique bold 13px monospace";
  ctx.shadowColor = "#102024";
  ctx.shadowBlur = 15;

  const tx = Math.floor(center.x / d);
  const offx = center.x - d * tx;

  for (let x = offx, ux = -tx * u; x < width; x += d, ux += u) {
    if (Math.abs(ux) >= Number.EPSILON)
      ctx.fillText(ux.toPrecision(3), x, height - center.y + 5);
  }

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  const ty = Math.floor(center.y / d);
  const offy = center.y - d * Math.floor(center.y / d);

  for (let y = height - offy, uy = -ty * u; y > 0; y -= d, uy += u) {
    if (Math.abs(uy) >= Number.EPSILON)
      ctx.fillText(uy.toPrecision(3), center.x + 5, y);
  }
}

let Graph = {
  functions: [
    {
      name: "f(x)",
      f: (x) => 10 * Math.tan(x / 15),
      color: "#ff4040",
    },
    {
      name: "g(x)",
      f: (x) => 10 * Math.cos(x / 15),
      color: "#40ff40",
    },
    {
      name: "l(x)",
      f: (x) => 10 * Math.cos(x / 5),
      color: "#4040ff",
    },
  ],
};

function draw() {
  drawGrid();
  for (let i = 0; i < Graph.functions.length; i++) {
    drawGraph(Graph.functions[i]);
  }
  drawLabels();
}

draw();

function getCY(f, cx) {
  let x = ((cx - center.x) * unitsOnWidth()) / width;
  let y = f(x);
  return height - ((y * width) / unitsOnWidth() + center.y);
}

// ---------

/**
 * @type {HTMLCanvasElement}
 */
const hcanvas = document.querySelector("#hover-canvas");
const hctx = hcanvas.getContext("2d");

hctx.canvas.width = width;
hctx.canvas.height = height;

function getHMouse(e) {
  const br = hcanvas.getBoundingClientRect();
  return {
    x: e.clientX - br.left,
    y: e.clientY - br.top,
  };
}

/**
 *
 * @param {string} str
 * @returns
 */
function createElement(str) {
  str = str.trim();
  const template = document.createElement("template");
  template.innerHTML = str;
  return template.content.firstChild;
}

/**
 * @type {HTMLElement}
 */
const pinfo = grapher.querySelector(".pos-info");


const dragState = {
  prevMouse: {
    x: 0,
    y: 0,
  },
  isDown: false,
};


function hoverListener(e) {
  const mouse = getHMouse(e);

  hctx.clearRect(0, 0, width, height);
  hctx.strokeStyle = "#ffffff55";
  hctx.lineWidth = 2;
  hctx.setLineDash([6]);

  hctx.beginPath();
  hctx.moveTo(mouse.x, 0);
  hctx.lineTo(mouse.x, height);
  hctx.stroke();

  hctx.setLineDash([]);

  hctx.strokeStyle = "#ffffff";

  hctx.beginPath();
  hctx.moveTo(mouse.x, height - (center.y - 4));
  hctx.lineTo(mouse.x, height - (center.y + 4));
  hctx.stroke();

  for (let i = 0; i < Graph.functions.length; i++) {
    hctx.fillStyle = Graph.functions[i].color;

    hctx.beginPath();
    hctx.arc(mouse.x, getCY(Graph.functions[i].f, mouse.x), 5, 0, Math.PI * 2);
    hctx.fill();
  }

  const pbr = pinfo.getBoundingClientRect();

  const space = 5;

  if (mouse.y - pbr.height - space < 0) {
    pinfo.style.removeProperty("bottom");
    pinfo.style.top = mouse.y + space + "px";
  } else {
    pinfo.style.removeProperty("top");
    pinfo.style.bottom = height - mouse.y + 5 + "px";
  }

  if (mouse.x + pbr.width + space > width) {
    pinfo.style.removeProperty("left");
    pinfo.style.right = width - mouse.x + 5 + "px";
  } else {
    pinfo.style.removeProperty("right");
    pinfo.style.left = mouse.x + 5 + "px";
  }

  pinfo.innerHTML = "";

  const x = ((mouse.x - center.x) * unitsOnWidth()) / width;
  pinfo.appendChild(
    createElement(
      `<div class="pos-info__row">
         <span class="pos-info__left" style="">x:</span>
         ${x.toPrecision(10)}
       </div>`
    )
  );

  for (let i = 0; i < Graph.functions.length; i++) {
    pinfo.appendChild(
      createElement(`
       <div class="pos-info__row">
         <span class="pos-info__left" style="color: ${
           Graph.functions[i].color
         }">${Graph.functions[i].name}:</span>${Graph.functions[i]
        .f(x)
        .toPrecision(10)}
       </div>`)
    );
  }
}

hcanvas.addEventListener("mousemove", hoverListener);

hcanvas.addEventListener("mouseenter", (e) => {
  pinfo.style.opacity = 1;
});

hcanvas.addEventListener("mouseleave", (e) => {
  hctx.clearRect(0, 0, width, height);
  pinfo.style.opacity = 0;
});

hcanvas.addEventListener("mousedown", (e) => {
  dragState.prevMouse = getHMouse(e);
  dragState.isDown = true;
});

document.addEventListener("mouseup", (e) => {
  dragState.isDown = false;
});

document.addEventListener("mousemove", (e) => {
  if (!dragState.isDown) return;
  const mouse = getHMouse(e);

  const mx = ((dragState.prevMouse.x - mouse.x) / width) * unitsOnWidth();
  const my = ((dragState.prevMouse.y - mouse.y) / width) * unitsOnWidth();
  viewPos.left = viewPos.left + mx;
  viewPos.right = viewPos.right + mx;
  viewPos.top = viewPos.top + my;

  dragState.prevMouse = mouse;

  ctx.clearRect(0, 0, width, height);
  draw();
});

hcanvas.addEventListener("wheel", (e) => {
  let mult = 1.2;
  if (e.deltaY < 0) {
    // zoom in
    mult = 1 / mult;
  }
  mult -= 1;
  const diffx = viewPos.right - viewPos.left;
  viewPos.left -= (diffx * mult) / 2;
  viewPos.right += (diffx * mult) / 2;
  const diffy = diffx * height / width;
  viewPos.top -= (diffy * mult) / 2;

  ctx.clearRect(0, 0, width, height);
  draw();
  hoverListener(e);
});
