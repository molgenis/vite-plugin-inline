import { expect, test } from "vitest";
import { dec, enc } from "../Base85";

function toBytes(str: string): Uint8Array {
  return Uint8Array.from(str.split("").map((letter) => letter.charCodeAt(0)));
}

function toString(bytes: Uint8Array) {
  return new TextDecoder("utf-8").decode(bytes);
}

test("encode 'lorum ipsum'", () => {
  const str = "lorum ipsum";
  expect(enc(toBytes(str))).toBe("Y;SUPZ6IlIb9HS");
});

test("decode 'lorum ipsum'", () => {
  const str = "Y;SUPZ6IlIb9HS";
  expect(toString(dec(str))).toBe("lorum ipsum");
});

test("encode and decode one character", () => {
  const str = "a";
  expect(toString(dec(enc(toBytes(str))))).toBe(str);
});

test("encode and decode two characters", () => {
  const str = "ab";
  expect(toString(dec(enc(toBytes(str))))).toBe(str);
});

test("encode and decode three characters", () => {
  const str = "abc";
  expect(toString(dec(enc(toBytes(str))))).toBe(str);
});

test("encode and decode four characters", () => {
  const str = "abcd";
  expect(toString(dec(enc(toBytes(str))))).toBe(str);
});

test("encode and decode five characters", () => {
  const str = "abcde";
  expect(toString(dec(enc(toBytes(str))))).toBe(str);
});
