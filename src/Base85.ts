const encodeMap: string[] =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~".split("");

function toAscii(val: number): string {
  return encodeMap[val % 85];
}

function getUint32BigEndianPadding(byteArray: Uint8Array, offset: number): number {
  const b0 = byteArray[offset];
  const b1 = offset + 1 < byteArray.length ? byteArray[offset + 1] : 0;
  const b2 = offset + 2 < byteArray.length ? byteArray[offset + 2] : 0;
  const b3 = offset + 3 < byteArray.length ? byteArray[offset + 3] : 0;
  return ((b0 << 24) >>> 0) + ((b1 << 16) | (b2 << 8) | b3);
}

/**
 * Base85 encode (RFC 1924)
 */
export function enc(bytes: Uint8Array): string {
  let s = "";
  const length = bytes.length;
  const remainder = length % 4;
  let val: number;
  let c0, c1, c2, c3, c4;
  for (let i = 0; i < length; i += 4) {
    val = getUint32BigEndianPadding(bytes, i);

    c4 = toAscii(val);
    val = Math.floor(val / 85);
    c3 = toAscii(val);
    val = Math.floor(val / 85);
    c2 = toAscii(val);
    val = Math.floor(val / 85);
    c1 = toAscii(val);
    val = Math.floor(val / 85);
    c0 = toAscii(val);
    s += c0 + c1 + c2 + c3 + c4;
  }
  if (remainder > 0) {
    s = s.substring(0, s.length - (4 - remainder));
  }
  return s;
}

const decodeMap: Uint8Array = new Uint8Array([
  62, -1, 63, 64, 65, 66, -1, 67, 68, 69, 70, -1, 71, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 72, 73, 74, 75, 76, 77,
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, -1, -1, -1,
  78, 79, 80, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  81, 82, 83, 84,
]);

function fromAscii(str: string, offset: number, exponent: number): number {
  return (offset < str.length ? decodeMap[str.charCodeAt(offset) - 33] : 84) * Math.pow(85, exponent);
}

function toUint32(str: string, offset: number): number {
  return (
    fromAscii(str, offset, 4) +
    fromAscii(str, offset + 1, 3) +
    fromAscii(str, offset + 2, 2) +
    fromAscii(str, offset + 3, 1) +
    fromAscii(str, offset + 4, 0)
  );
}

/**
 * Base85 decode (RFC 1924)
 */
export function dec(str: string): Uint8Array {
  const length = str.length;
  const nrBytes = length % 5 === 0 ? (length / 5) * 4 : Math.floor(length / 5) * 4 + ((length % 5) - 1);
  const byteArray = new Uint8Array(nrBytes);
  let val: number,
    offset = 0;
  for (let i = 0; i < length; i += 5) {
    val = toUint32(str, i);

    byteArray[offset++] = val >> 24;
    if (offset < nrBytes) byteArray[offset++] = val >> 16;
    if (offset < nrBytes) byteArray[offset++] = val >> 8;
    if (offset < nrBytes) byteArray[offset++] = val;
  }
  return byteArray;
}
