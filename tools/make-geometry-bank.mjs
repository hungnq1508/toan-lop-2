// Sinh data/questions/geometry.json (chạy 1 lần lúc phát triển; file JSON là nguồn chính thức).
import fs from 'node:fs';
const P = (x, y, l, dx = 0, dy = -14) => `<circle class='g-pt' cx='${x}' cy='${y}' r='6'/><text class='g-lbl' x='${x + dx}' y='${y + dy}' text-anchor='middle'>${l}</text>`;
const L = (x1, y1, x2, y2) => `<line class='g-line' x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}'/>`;
const svg = (body, vb = '0 0 320 180') => `<svg viewBox='${vb}' xmlns='http://www.w3.org/2000/svg'>${body}</svg>`;
const KIND4 = ['Đoạn thẳng', 'Đường thẳng', 'Đường cong', 'Đường gấp khúc'];

const items = [];
const add = (o) => items.push({ id: `g${String(items.length + 1).padStart(2, '0')}`, ...o });

// ---------- DỄ ----------
add({ level: 1, type: 'choice', text: 'Hình vẽ dưới đây là gì?', choices: KIND4, answer: 'Đoạn thẳng',
  explain: 'Đoạn thẳng có hai điểm đầu và cuối: đoạn thẳng AB.',
  svg: svg(L(50, 100, 270, 100) + P(50, 100, 'A') + P(270, 100, 'B')) });
add({ level: 1, type: 'choice', text: 'Hình vẽ dưới đây là gì?', choices: KIND4, answer: 'Đường thẳng',
  explain: 'Kéo dài mãi đoạn thẳng AB về hai phía ta được đường thẳng AB.',
  svg: svg(L(10, 120, 310, 60) + P(100, 102, 'A') + P(220, 78, 'B')) });
add({ level: 1, type: 'choice', text: 'Hình vẽ dưới đây là gì?', choices: KIND4, answer: 'Đường cong',
  explain: 'Đường không thẳng, uốn lượn là đường cong.',
  svg: svg(`<path class='g-line' d='M30 120 C 90 20, 150 170, 200 80 S 280 40, 300 110'/>`) });
add({ level: 1, type: 'choice', text: 'Hình vẽ dưới đây là gì?', choices: KIND4, answer: 'Đường gấp khúc',
  explain: 'Các đoạn thẳng nối tiếp nhau tạo thành đường gấp khúc ABCD.',
  svg: svg(`<polyline class='g-line' points='30,140 110,50 200,130 290,40'/>` + P(30, 140, 'A', 0, 30) + P(110, 50, 'B') + P(200, 130, 'C', 0, 30) + P(290, 40, 'D')) });
add({ level: 1, type: 'input', text: 'Hình vẽ có bao nhiêu điểm?', answer: '5', explain: 'Có 5 điểm: A, B, C, D, E.',
  svg: svg(P(40, 60, 'A') + P(120, 130, 'B') + P(170, 50, 'C') + P(240, 120, 'D') + P(290, 60, 'E')) });
add({ level: 1, type: 'input', text: 'Hình vẽ có bao nhiêu điểm?', answer: '7', explain: 'Có 7 điểm: M, N, P, Q, R, S, T.',
  svg: svg(P(30, 50, 'M') + P(80, 140, 'N') + P(130, 70, 'P') + P(180, 150, 'Q') + P(220, 50, 'R') + P(260, 120, 'S') + P(300, 60, 'T')) });

const shape = {
  tri: (cx, cy) => `<polygon class='g-shape' points='${cx},${cy - 32} ${cx + 34},${cy + 26} ${cx - 34},${cy + 26}'/>`,
  quad: (cx, cy) => `<polygon class='g-shape' points='${cx - 34},${cy - 24} ${cx + 28},${cy - 30} ${cx + 36},${cy + 26} ${cx - 26},${cy + 22}'/>`,
  circ: (cx, cy) => `<circle class='g-shape' cx='${cx}' cy='${cy}' r='32'/>`,
  pent: (cx, cy) => `<polygon class='g-shape' points='${cx},${cy - 32} ${cx + 32},${cy - 8} ${cx + 20},${cy + 28} ${cx - 20},${cy + 28} ${cx - 32},${cy - 8}'/>`,
  rect: (cx, cy) => `<rect class='g-shape' x='${cx - 38}' y='${cy - 24}' width='76' height='48'/>`,
  sq: (cx, cy) => `<rect class='g-shape' x='${cx - 28}' y='${cy - 28}' width='56' height='56'/>`,
  trap: (cx, cy) => `<polygon class='g-shape' points='${cx - 18},${cy - 26} ${cx + 18},${cy - 26} ${cx + 38},${cy + 26} ${cx - 38},${cy + 26}'/>`,
};
const num = (x, n) => `<text class='g-num' x='${x}' y='170' text-anchor='middle'>${n}</text>`;
const row4 = (kinds) => svg(kinds.map((k, i) => shape[k](45 + i * 77, 80) + num(45 + i * 77, i + 1)).join(''));
const choices4 = ['Hình 1', 'Hình 2', 'Hình 3', 'Hình 4'];
add({ level: 1, type: 'choice', text: 'Hình nào là hình tứ giác?', choices: choices4, answer: 'Hình 2',
  explain: 'Hình 2 có 4 cạnh nên là hình tứ giác.', svg: row4(['tri', 'quad', 'circ', 'pent']) });
add({ level: 1, type: 'choice', text: 'Hình nào là hình tứ giác?', choices: choices4, answer: 'Hình 4',
  explain: 'Hình 4 có 4 cạnh nên là hình tứ giác.', svg: row4(['circ', 'pent', 'tri', 'trap']) });
add({ level: 1, type: 'choice', text: 'Hình nào là hình tam giác?', choices: choices4, answer: 'Hình 3',
  explain: 'Hình 3 có 3 cạnh nên là hình tam giác.', svg: row4(['sq', 'circ', 'tri', 'quad']) });
add({ level: 1, type: 'choice', text: 'Hình dưới đây là hình gì?', choices: ['Hình tứ giác', 'Hình tam giác', 'Hình tròn'], answer: 'Hình tứ giác',
  explain: 'Hình có 4 cạnh là hình tứ giác.', svg: svg(`<polygon class='g-shape' points='92,42 216,30 232,142 108,134'/>`) });
add({ level: 1, type: 'input', text: 'Hình tứ giác ABCD có mấy cạnh?', answer: '4', explain: 'Hình tứ giác có 4 cạnh: AB, BC, CD, DA.',
  svg: svg(`<polygon class='g-shape' points='90,40 240,30 270,150 60,140'/>` + P(90, 40, 'A', -14, -8) + P(240, 30, 'B', 14, -8) + P(270, 150, 'C', 16, 24) + P(60, 140, 'D', -16, 24)) });
add({ level: 1, type: 'truefalse', text: 'Ba điểm A, B, C thẳng hàng.', choices: ['Đúng', 'Sai'], answer: 'Đúng',
  explain: 'Ba điểm A, B, C cùng nằm trên một đường thẳng nên thẳng hàng.',
  svg: svg(`<line class='g-guide' x1='20' y1='140' x2='300' y2='40'/>` + P(60, 126, 'A') + P(160, 90, 'B') + P(260, 54, 'C')) });

// ---------- VỪA ----------
add({ level: 2, type: 'choice', text: 'Ba điểm nào thẳng hàng?', choices: ['A, B, C', 'A, B, D', 'B, C, D', 'A, C, D'], answer: 'A, B, C',
  explain: 'A, B, C cùng nằm trên một đường thẳng. Dùng thước để kiểm tra nhé!',
  svg: svg(P(40, 140, 'A', -14, -6) + P(140, 100, 'B', -4, -14) + P(240, 60, 'C') + P(190, 150, 'D', 0, 30)) });
add({ level: 2, type: 'choice', text: 'Ba điểm nào thẳng hàng?', choices: ['M, N, P', 'M, Q, P', 'N, P, Q', 'M, N, Q'], answer: 'M, Q, P',
  explain: 'M, Q, P cùng nằm trên một đường thẳng.',
  svg: svg(P(40, 90, 'M') + P(160, 90, 'Q') + P(280, 90, 'P') + P(110, 160, 'N', 0, -14) ) });
add({ level: 2, type: 'truefalse', text: 'Ba điểm D, E, G thẳng hàng.', choices: ['Đúng', 'Sai'], answer: 'Sai',
  explain: 'Điểm E không nằm trên đường thẳng đi qua D và G.',
  svg: svg(P(50, 130, 'D') + P(160, 50, 'E') + P(270, 130, 'G')) });
add({ level: 2, type: 'input', text: 'Hình vẽ có bao nhiêu đoạn thẳng?', answer: '5',
  explain: 'Có 5 đoạn thẳng: AB, BC, CD, DA và AC.',
  svg: svg(`<rect class='g-shape' x='90' y='30' width='140' height='120'/>` + L(90, 30, 230, 150) + P(90, 30, 'A', -14, -4) + P(230, 30, 'B', 14, -4) + P(230, 150, 'C', 14, 24) + P(90, 150, 'D', -14, 24)) });
add({ level: 2, type: 'input', text: 'Hình vẽ có bao nhiêu đoạn thẳng?', answer: '3',
  explain: 'Có 3 đoạn thẳng: AB, BC, CA.',
  svg: svg(`<polygon class='g-shape' points='160,25 270,150 50,150'/>` + P(160, 25, 'A', 18, 6) + P(270, 150, 'B', 14, 24) + P(50, 150, 'C', -14, 24)) });
add({ level: 2, type: 'input', text: 'Hình vẽ có bao nhiêu đường cong?', answer: '3',
  explain: 'Có 3 đường cong (đường uốn lượn), còn lại là đoạn thẳng.',
  svg: svg(`<path class='g-line' d='M20 50 Q 60 10, 100 50'/><path class='g-line' d='M130 40 Q 170 100, 210 40'/><path class='g-line' d='M60 120 C 90 90, 120 170, 150 130'/>` + L(180, 150, 300, 110) + L(240, 60, 300, 30)) });
add({ level: 2, type: 'choice', text: 'Đường gấp khúc ABCD gồm những đoạn thẳng nào?', choices: ['AB, BC, CD', 'AB, AC, CD', 'AB, BD, CD', 'AC, BD'], answer: 'AB, BC, CD',
  explain: 'Đường gấp khúc ABCD gồm 3 đoạn thẳng: AB, BC, CD.',
  svg: svg(`<polyline class='g-line' points='30,140 110,50 200,130 290,40'/>` + P(30, 140, 'A', 0, 30) + P(110, 50, 'B') + P(200, 130, 'C', 0, 30) + P(290, 40, 'D')) });
add({ level: 2, type: 'input', text: 'Hình dưới đây có bao nhiêu hình tứ giác?', answer: '3',
  explain: 'Hình 1, hình 3 và hình 5 có 4 cạnh nên là hình tứ giác.',
  svg: svg([shape.sq(40, 70), shape.tri(120, 70), shape.trap(200, 70), shape.circ(280, 70), shape.rect(360, 70)].join('') + [40, 120, 200, 280, 360].map((x, i) => `<text class='g-num' x='${x}' y='150' text-anchor='middle'>${i + 1}</text>`).join(''), '0 0 400 170') });
add({ level: 2, type: 'input', text: 'Hình dưới đây có bao nhiêu hình tam giác?', answer: '2',
  explain: 'Đường chéo chia hình vuông thành 2 hình tam giác.',
  svg: svg(`<rect class='g-shape' x='100' y='20' width='130' height='130'/>` + L(100, 20, 230, 150)) });

// ---------- KHÓ ----------
add({ level: 3, type: 'input', text: 'Hình dưới đây có bao nhiêu hình tứ giác?', answer: '3',
  explain: 'Có 2 hình tứ giác nhỏ và 1 hình tứ giác lớn ghép từ 2 hình nhỏ: 2 + 1 = 3.',
  svg: svg(`<rect class='g-shape' x='50' y='30' width='220' height='120'/>` + L(150, 30, 150, 150)) });
add({ level: 3, type: 'input', text: 'Hình dưới đây có bao nhiêu hình tứ giác?', answer: '6',
  explain: 'Có 3 hình nhỏ, 2 hình ghép từ 2 hình nhỏ và 1 hình lớn: 3 + 2 + 1 = 6.',
  svg: svg(`<rect class='g-shape' x='30' y='30' width='260' height='120'/>` + L(117, 30, 117, 150) + L(203, 30, 203, 150)) });
add({ level: 3, type: 'input', text: 'Hình dưới đây có bao nhiêu hình tam giác?', answer: '3',
  explain: 'Có 2 hình tam giác nhỏ và 1 hình tam giác lớn: 2 + 1 = 3.',
  svg: svg(`<polygon class='g-shape' points='160,20 290,155 30,155'/>` + L(160, 20, 150, 155)) });
add({ level: 3, type: 'input', text: 'Hình dưới đây có bao nhiêu hình tam giác?', answer: '6',
  explain: 'Có 3 hình nhỏ, 2 hình ghép từ 2 hình nhỏ và 1 hình lớn: 3 + 2 + 1 = 6.',
  svg: svg(`<polygon class='g-shape' points='160,20 300,155 20,155'/>` + L(160, 20, 110, 155) + L(160, 20, 210, 155)) });
add({ level: 3, type: 'input', text: 'Hình dưới đây có bao nhiêu hình tứ giác?', answer: '9',
  explain: '4 hình nhỏ + 4 hình ghép từ 2 hình nhỏ + 1 hình lớn: 4 + 4 + 1 = 9.',
  svg: svg(`<rect class='g-shape' x='90' y='20' width='140' height='140'/>` + L(160, 20, 160, 160) + L(90, 90, 230, 90)) });
add({ level: 3, type: 'input', text: 'Hình dưới đây có bao nhiêu đoạn thẳng?', answer: '6',
  explain: 'Các đoạn thẳng: AB, AC, AD, BD, DC, BC. Có 6 đoạn thẳng.',
  svg: svg(`<polygon class='g-shape' points='160,25 290,150 30,150'/>` + L(160, 25, 170, 150) + P(160, 25, 'A', 18, 4) + P(30, 150, 'B', -14, 26) + P(170, 150, 'D', 0, 28) + P(290, 150, 'C', 14, 26)) });
add({ level: 3, type: 'choice', text: 'Trong hình, ba điểm nào thẳng hàng?', choices: ['A, O, C', 'A, O, B', 'B, O, C', 'A, B, C'], answer: 'A, O, C',
  explain: 'A, O, C cùng nằm trên một đường thẳng (đường chéo của hình).',
  svg: svg(`<rect class='g-shape' x='90' y='25' width='140' height='130'/>` + L(90, 25, 230, 155) + P(90, 25, 'A', -14, -4) + P(230, 25, 'B', 14, -4) + P(230, 155, 'C', 14, 24) + P(90, 155, 'D', -14, 24) + P(160, 90, 'O', 22, 6)) });

fs.writeFileSync(process.argv[2], JSON.stringify({ version: 1, items }, null, 1) + '\n');
console.log(items.length, 'items');
