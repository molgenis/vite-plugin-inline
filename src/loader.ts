import { dec } from "./Base85";
import { gunzipSync } from "fflate";

const doc = document;
const textDecoder = new TextDecoder("utf-8");

/**
 * Replace script tag with compressed data with script tag with uncompressed data
 */
function decodeScript(script: HTMLScriptElement): void {
  const text = script.textContent;
  if (text !== null) {
    const textDecoded = textDecoder.decode(gunzipSync(dec(text)));
    let element: HTMLElement;
    const className = script.className;
    if (className === "ldr-js") {
      element = doc.createElement("script");
    } else if (className === "ldr-css") {
      element = doc.createElement("style");
    } else {
      throw new Error(`unknown class '${className}'`);
    }
    element.textContent = textDecoded;
    script.replaceWith(element);
  }
}

// decode js and css
doc.querySelectorAll("script[type='application/gzip']").forEach((script) => decodeScript(script as HTMLScriptElement));

// remove loader
doc.getElementById("ldr")?.remove();
