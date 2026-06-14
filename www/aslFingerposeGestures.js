(() => {
  // Provides window.ASL_FINGERPOSE_GESTURES = [GestureDescription... A-Z]
  // Uses global `fp` from fingerpose CDN.

  if (!window.fp) {
    console.warn("fingerpose (fp) not loaded yet");
    window.ASL_FINGERPOSE_GESTURES = [];
    return;
  }

  const { Finger, FingerCurl, FingerDirection, GestureDescription } = window.fp;

  const gestures = [];

  // Helper: most letters keep curled fingers vertical up
  function curledFinger(letter, finger) {
    letter.addCurl(finger, FingerCurl.FullCurl, 1.0);
    letter.addDirection(finger, FingerDirection.VerticalUp, 0.7);
  }

  // A
  const A = new GestureDescription("A");
  A.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
  A.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.7);
  curledFinger(A, Finger.Index);
  curledFinger(A, Finger.Middle);
  curledFinger(A, Finger.Ring);
  curledFinger(A, Finger.Pinky);
  gestures.push(A);

  // B
  const B = new GestureDescription("B");
  B.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
  B.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.7);
  B.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  B.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  B.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
  B.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
  B.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
  B.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.7);
  B.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.7);
  B.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.7);
  gestures.push(B);

  // C
  const C = new GestureDescription("C");
  C.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
  C.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
  C.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
  C.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
  C.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);
  C.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.7);
  C.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.6);
  C.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.6);
  C.addDirection(Finger.Ring, FingerDirection.DiagonalUpRight, 0.6);
  C.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.6);
  gestures.push(C);

  // D
  const D = new GestureDescription("D");
  D.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
  D.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  curledFinger(D, Finger.Middle);
  curledFinger(D, Finger.Ring);
  curledFinger(D, Finger.Pinky);
  D.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
  gestures.push(D);

  // E
  const E = new GestureDescription("E");
  E.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
  curledFinger(E, Finger.Index);
  curledFinger(E, Finger.Middle);
  curledFinger(E, Finger.Ring);
  curledFinger(E, Finger.Pinky);
  gestures.push(E);

  // F (OK sign)
  const F = new GestureDescription("F");
  F.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.8);
  F.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
  F.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  F.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
  F.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
  F.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.8);
  F.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.8);
  F.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.8);
  gestures.push(F);

  // G
  const G = new GestureDescription("G");
  G.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
  G.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  curledFinger(G, Finger.Middle);
  curledFinger(G, Finger.Ring);
  curledFinger(G, Finger.Pinky);
  G.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1.0);
  G.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.9);
  gestures.push(G);

  // H
  const H = new GestureDescription("H");
  H.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  H.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  curledFinger(H, Finger.Ring);
  curledFinger(H, Finger.Pinky);
  H.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
  H.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1.0);
  H.addDirection(Finger.Middle, FingerDirection.HorizontalRight, 1.0);
  gestures.push(H);

  // I
  const I = new GestureDescription("I");
  curledFinger(I, Finger.Index);
  curledFinger(I, Finger.Middle);
  curledFinger(I, Finger.Ring);
  I.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
  I.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
  I.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
  gestures.push(I);

  // J (similar to I; motion ignored)
  const J = new GestureDescription("J");
  curledFinger(J, Finger.Index);
  curledFinger(J, Finger.Middle);
  curledFinger(J, Finger.Ring);
  J.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
  J.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
  J.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.8);
  J.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.6);
  gestures.push(J);

  // K
  const K = new GestureDescription("K");
  K.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  K.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  curledFinger(K, Finger.Ring);
  curledFinger(K, Finger.Pinky);
  K.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
  K.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 1.0);
  K.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.8);
  gestures.push(K);

  // L
  const L = new GestureDescription("L");
  L.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  L.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
  curledFinger(L, Finger.Middle);
  curledFinger(L, Finger.Ring);
  curledFinger(L, Finger.Pinky);
  L.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
  L.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.9);
  gestures.push(L);

  // M
  const M = new GestureDescription("M");
  M.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
  M.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
  M.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
  M.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
  M.addCurl(Finger.Pinky, FingerCurl.NoCurl, 0.6);
  gestures.push(M);

  // N
  const N = new GestureDescription("N");
  N.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
  N.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
  N.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
  N.addCurl(Finger.Ring, FingerCurl.NoCurl, 0.6);
  N.addCurl(Finger.Pinky, FingerCurl.NoCurl, 0.6);
  gestures.push(N);

  // O
  const O = new GestureDescription("O");
  O.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
  O.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
  O.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
  O.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
  O.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);
  gestures.push(O);

  // P (like K pointing down; approximate)
  const P = new GestureDescription("P");
  P.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  P.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  curledFinger(P, Finger.Ring);
  curledFinger(P, Finger.Pinky);
  P.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
  P.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 1.0);
  P.addDirection(Finger.Middle, FingerDirection.DiagonalDownRight, 0.8);
  gestures.push(P);

  // Q (like G pointing down; approximate)
  const Q = new GestureDescription("Q");
  Q.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
  Q.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  curledFinger(Q, Finger.Middle);
  curledFinger(Q, Finger.Ring);
  curledFinger(Q, Finger.Pinky);
  Q.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 1.0);
  Q.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.8);
  gestures.push(Q);

  // R (crossed fingers; approximate as index+middle up)
  const R = new GestureDescription("R");
  R.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  R.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  curledFinger(R, Finger.Ring);
  curledFinger(R, Finger.Pinky);
  R.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
  R.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
  R.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
  gestures.push(R);

  // S
  const S = new GestureDescription("S");
  S.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
  curledFinger(S, Finger.Index);
  curledFinger(S, Finger.Middle);
  curledFinger(S, Finger.Ring);
  curledFinger(S, Finger.Pinky);
  gestures.push(S);

  // T
  const T = new GestureDescription("T");
  T.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
  curledFinger(T, Finger.Index);
  curledFinger(T, Finger.Middle);
  curledFinger(T, Finger.Ring);
  curledFinger(T, Finger.Pinky);
  gestures.push(T);

  // U
  const U = new GestureDescription("U");
  U.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  U.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  curledFinger(U, Finger.Ring);
  curledFinger(U, Finger.Pinky);
  U.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
  U.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
  U.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
  gestures.push(U);

  // V
  const V = new GestureDescription("V");
  V.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  V.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  curledFinger(V, Finger.Ring);
  curledFinger(V, Finger.Pinky);
  V.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
  V.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.8);
  V.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.8);
  gestures.push(V);

  // W
  const W = new GestureDescription("W");
  W.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  W.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  W.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
  curledFinger(W, Finger.Pinky);
  W.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
  W.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
  W.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.8);
  W.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.8);
  gestures.push(W);

  // X
  const X = new GestureDescription("X");
  X.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
  curledFinger(X, Finger.Middle);
  curledFinger(X, Finger.Ring);
  curledFinger(X, Finger.Pinky);
  X.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
  X.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
  gestures.push(X);

  // Y
  const Y = new GestureDescription("Y");
  Y.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
  curledFinger(Y, Finger.Index);
  curledFinger(Y, Finger.Middle);
  curledFinger(Y, Finger.Ring);
  Y.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
  Y.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.9);
  Y.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.8);
  gestures.push(Y);

  // Z (motion ignored; approximate as index up)
  const Z = new GestureDescription("Z");
  Z.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
  curledFinger(Z, Finger.Middle);
  curledFinger(Z, Finger.Ring);
  curledFinger(Z, Finger.Pinky);
  Z.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
  Z.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.8);
  Z.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
  gestures.push(Z);

  window.ASL_FINGERPOSE_GESTURES = gestures;
})();

