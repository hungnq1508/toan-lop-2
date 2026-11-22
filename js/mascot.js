/**
 * Linh vật: bạn Cú "Tròn" (SVG tự vẽ).
 * mood: 'happy' (mặc định) | 'cheer' (giơ cánh) | 'sad' (buồn, rơi nước mắt)
 */
export const MASCOT_NAME = 'Cú Tròn';

export function mascot(mood = 'happy', cls = '') {
  const eyes =
    mood === 'sad'
      ? `<path d="M62 82 q12 8 24 0" class="m-lid"/><path d="M114 82 q12 8 24 0" class="m-lid"/>
         <circle cx="74" cy="90" r="7" fill="#1e293b"/><circle cx="126" cy="90" r="7" fill="#1e293b"/>
         <path d="M70 106 q-4 10 0 14 q4 -4 0 -14z" fill="#60a5fa" class="m-tear"/>`
      : mood === 'cheer'
        ? `<path d="M60 88 q14 -16 28 0" class="m-happy-eye"/><path d="M112 88 q14 -16 28 0" class="m-happy-eye"/>`
        : `<circle cx="74" cy="86" r="10" fill="#1e293b"/><circle cx="126" cy="86" r="10" fill="#1e293b"/>
           <circle cx="78" cy="82" r="3.5" fill="#fff"/><circle cx="130" cy="82" r="3.5" fill="#fff"/>`;
  const brows =
    mood === 'sad'
      ? `<path d="M58 62 l26 8" class="m-brow"/><path d="M142 62 l-26 8" class="m-brow"/>`
      : '';
  const mouth = mood === 'sad' ? `<path d="M90 128 q10 -8 20 0" class="m-mouth"/>` : `<path d="M88 122 q12 12 24 0" class="m-mouth"/>`;
  const wings =
    mood === 'cheer'
      ? `<path d="M40 120 q-34 -30 -22 -66 q16 26 36 40z" class="m-wing"/><path d="M160 120 q34 -30 22 -66 q-16 26 -36 40z" class="m-wing"/>`
      : `<path d="M36 112 q-16 34 10 60 q10 -30 8 -56z" class="m-wing"/><path d="M164 112 q16 34 -10 60 q-10 -30 -8 -56z" class="m-wing"/>`;
  return `<svg class="mascot mascot-${mood} ${cls}" viewBox="0 0 200 220" role="img" aria-label="${MASCOT_NAME}">
    <path d="M52 40 l-6 -30 l30 20z" class="m-ear"/><path d="M148 40 l6 -30 l-30 20z" class="m-ear"/>
    ${wings}
    <ellipse cx="100" cy="118" rx="68" ry="86" class="m-body"/>
    <ellipse cx="100" cy="150" rx="42" ry="46" class="m-belly"/>
    <path d="M78 156 q6 6 12 0 M98 166 q6 6 12 0 M110 150 q6 6 12 0" class="m-feather"/>
    <circle cx="74" cy="86" r="24" fill="#fff"/><circle cx="126" cy="86" r="24" fill="#fff"/>
    ${eyes}${brows}
    <path d="M92 102 l8 14 l8 -14z" class="m-beak"/>
    ${mood === 'sad' ? '' : '<ellipse cx="54" cy="112" rx="9" ry="5" class="m-cheek"/><ellipse cx="146" cy="112" rx="9" ry="5" class="m-cheek"/>'}
    ${mouth}
    <path d="M76 202 l-8 12 M84 204 l0 12 M92 202 l8 12 M108 202 l-8 12 M116 204 l0 12 M124 202 l8 12" class="m-feet"/>
  </svg>`;
}
