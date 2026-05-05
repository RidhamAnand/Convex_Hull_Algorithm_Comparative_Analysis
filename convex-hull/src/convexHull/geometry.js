export const cross = (O, A, B) =>
  (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);

export const dist = (A, B) =>
  Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2);

export const polarAngle = (O, P) => Math.atan2(P.y - O.y, P.x - O.x);
