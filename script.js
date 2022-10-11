const Vec3 = require("./utils/vec3");
const Vec2 = require("./utils/vec2");
const parseModel = require("./utils/wavefrontParser");
const getTextureData = require("./utils/tgaParser");
const render = {};
render.getColor = (vec) => {
  vec = new Vec2(
    vec.x * render.texture.width,
    vec.y * render.texture.height
  ).floor();
  const offset = vec.y * (render.texture.width * 4) + vec.x * 4;
  const r = render.texture.data[offset];
  const g = render.texture.data[offset + 1];
  const b = render.texture.data[offset + 2];
  return [r, g, b, 255];
};
const canvas = document.getElementById("c1");
const width = canvas.width;
const height = canvas.height;
const ctx = canvas.getContext("2d");
let image = ctx.getImageData(0, 0, width, height);

const objInput = document.getElementById("objInput");
const textureInput = document.getElementById("textureInput");
const btn = document.getElementById("start");

btn.addEventListener("click", () => {
  let reader = new FileReader();
  reader.readAsText(objInput.files[0]);

  reader.onload = () => {
    render.model = parseModel(reader.result);
    render.nFaces = render.model.f.length;
    let reader2 = new FileReader();
    reader2.readAsArrayBuffer(textureInput.files[0]);
    reader2.onload = () => {
      render.texture = getTextureData(reader2.result);
      draw();
    };
  };
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  image = ctx.getImageData(0, 0, width, height);
  zBuffer.fill(-Infinity);
  for (let i = 0; i < render.model.f.length; i++) {
    const face = render.model.f[i];
    let sC = [];
    let wC = [];
    for (let k = 0; k < 3; k++) {
      let vert = render.model.v[face[k][0] - 1];
      wC.push(new Vec3(vert[0], vert[1], vert[2]));
      sC.push(
        new Vec3(
          Math.floor(((vert[0] + 1) * width) / 2),
          Math.floor(((vert[1] + 1) * height) / 2),
          vert[2]
        )
      );
    }

    let lightDir = new Vec3(0.707, 0, -0.707);
    //if (inten > 0) {
    let uv = [];
    let vns = [];
    for (let k = 0; k < 3; k++) {
      let vt = render.model.vt[face[k][1] - 1];
      uv[k] = new Vec2(vt[0], vt[1]);
      let vn = render.model.vn[face[k][2] - 1];
      vns[k] = new Vec3(vn[0], vn[1], vn[2]).mult(-1); // without reversing axes get flipped WTF!!!
    }
    let inten = vns.map((e) => e.multS(lightDir));
    if (!(i % 200)) console.log(inten);
    triangle(sC[0], sC[1], sC[2], inten, uv);
    //}
  }

  ctx.putImageData(image, 0, 0);
}

const setPixel = (x, y, color = [0, 0, 0, 255]) => {
  y = height - y - 1;
  const offset = y * (image.width * 4) + x * 4;
  image.data[offset] = color[0];
  image.data[offset + 1] = color[1];
  image.data[offset + 2] = color[2];
  image.data[offset + 3] = color[3];
};
const zBuffer = new Array(width * height).fill(-Infinity);

const triangle = (v0, v1, v2, intens, uv) => {
  if (v0.y == v1.y && v0.y == v2.y) return;
  if (v0.y > v1.y) {
    let temp = v0;
    v0 = v1;
    v1 = temp;
    uv = [uv[1], uv[0], uv[2]];
    intens = [intens[1], intens[0], intens[2]];
  }
  if (v0.y > v2.y) {
    let temp = v0;
    v0 = v2;
    v2 = temp;
    uv = [uv[2], uv[1], uv[0]];
    intens = [intens[2], intens[1], intens[0]];
  }
  if (v1.y > v2.y) {
    let temp = v1;
    v1 = v2;
    v2 = temp;
    uv = [uv[0], uv[2], uv[1]];
    intens = [intens[0], intens[2], intens[1]];
  }

  const totalHeight = v2.y - v0.y;

  for (let i = 0; i < totalHeight; i++) {
    const secondHalf = i > v1.y - v0.y || v1.y == v0.y;
    const segment_height = secondHalf ? v2.y - v1.y : v1.y - v0.y;
    const alpha = i / totalHeight;
    const beta = (i - (secondHalf ? v1.y - v0.y : 0)) / segment_height;

    let A = v0.add(v2.subtract(v0).mult(alpha));
    let B = secondHalf
      ? v1.add(v2.subtract(v1).mult(beta))
      : v0.add(v1.subtract(v0).mult(beta));

    let uvA = uv[0].add(uv[2].subtract(uv[0]).mult(alpha));
    let uvB = secondHalf
      ? uv[1].add(uv[2].subtract(uv[1]).mult(beta))
      : uv[0].add(uv[1].subtract(uv[0]).mult(beta));

    let intensA = intens[0] + (intens[2] - intens[0]) * alpha;
    let intensB = secondHalf
      ? intens[1] + (intens[2] - intens[1]) * beta
      : intens[0] + (intens[1] - intens[0]) * beta;

    if (A.x > B.x) {
      let temp = A;
      A = B;
      B = temp;

      temp = uvA;
      uvA = uvB;
      uvB = temp;
      temp = intensA;
      intensA = intensB;
      intensB = temp;
    }
    for (let j = Math.floor(A.x); j < Math.floor(B.x); j++) {
      const phi = B.x === A.x ? 1 : (j - A.x) / (B.x - A.x);
      const p = A.add(B.subtract(A).mult(phi));
      const P = new Vec3(Math.round(p.x), Math.round(p.y), p.z);
      const uvP = uvA.add(uvB.subtract(uvA).mult(phi));
      const iP = intensA + (intensB - intensA) * phi;
      let idx = P.x + P.y * width;
      if (zBuffer[idx] < P.z) {
        zBuffer[idx] = P.z;
        let color = render.getColor(uvP);
        color = [
          Math.floor(color[0] * iP),
          Math.floor(color[1] * iP),
          Math.floor(color[2] * iP),
          255,
        ];
        setPixel(P.x, P.y, color);
      }
    }
  }
};
