// A short script that converts each page into an embeddable page
// It makes the page ignore external styling
// however it requires the images/css to be hosted somewhere
// divs that can be altered by js should be tagged with !WIDGET! in a comment above
// and js that alters stuff, should be after the </html> tag! <3
// todo: just embed css, no point redirecting it

// commonjs imports:
/*
const fs = require("fs");
const path = require("path");
*/

// module: 
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://thegreengrocerbymef.com/";
const SRC_DIR = "src";

const shadowScript =
  `<script>
  class StyleBlocker extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      const widgetClasses = $widgets^;

      const widgets = widgetClasses
        .map(className => this.embedWidget(className))
        .filter(Boolean);

      // move EVERYTHING (except external widgets) into the shadow realm 
      // or smth idk https://matthewjamestaylor.com/style-blocker
      [...this.childNodes].forEach(node => {
        if (!widgets.includes(node)) {
          this.shadowRoot.appendChild(node);
        }
      });

      // we still want SOME swag
      const cssFiles = this.getAttribute('css-files');
      if (cssFiles) {
          const arrCssFiles = cssFiles.split(',');
          for(let i = 0; i < arrCssFiles.length; i++){
              let link = document.createElement('link');
              link.setAttribute('rel', 'stylesheet');
              link.setAttribute('href', arrCssFiles[i]);
              this.shadowRoot.appendChild(link);
          }
      }
    }

    embedWidget(className) {
      const widget = this.querySelector("." + className);

      if (!widget) return null;

      const slot = document.createElement("slot");
      slot.name = className;

      widget.parentNode.replaceChild(slot, widget);

      widget.slot = className;
      this.appendChild(widget);

      return widget;
    }
  }

  customElements.define("style-blocker", StyleBlocker);
</script>`

fs.rmSync("embed-build", { recursive: true, force: true })

function embedAllFiles(dir) {
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      embedAllFiles(filePath)
    } else {
      stripFile(filePath);
    }
  }
}

embedAllFiles(`./${SRC_DIR}`);

function stripFile(filePath) {
  if (path.basename(filePath) !== "index.html") return;

  let content = fs.readFileSync(filePath).toString();

  // matches src="name/" but not src="any:" 
  // if there is a : before the first / its likely a link alr
  content = content.replaceAll(/src\s*=\s*"([^":]*)"/g, (match, captured) => {
    return match.replace(captured, fixLocalLink(captured, filePath))
  });

  // ditto but for href
  content = content.replaceAll(/href\s*=\s*"([^":]*)"/g, (match, captured) => {
    return match.replace(captured, fixLocalLink(captured, filePath))
  });

  const output = filePath.replace(SRC_DIR, "embed-build");
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, applyShadow(content));
}

// local link will be in the form "../images/logo.jpg"
// file will be in the form "SRC_DIR/about-us/x/y/index.html"
// we only care about the path, eg. "about-us/x/y"
// if a ref has a "../" then we make the link "about-us/x"
// we can then append the localLink after, making it "about-us/x/images/logo.jpg"
function fixLocalLink(localLink, file) {
    if (!localLink) return "";

    const pagePath = path.dirname(path.relative(SRC_DIR, file));
    const resolvedPath = path.posix.normalize(path.posix.join(pagePath, localLink));

    return new URL(resolvedPath, BASE_URL).href;
}

function applyShadow(content) {
  let cssFiles = [];

  // matches <link rel="stylesheet" href="../style/base.css">
  const styles = content
    .matchAll(/<\s*link\s*rel\s*=\s*"stylesheet"\s*href\s*=\s*"([^"]*)"\s*>/g)
  for (const match of styles) {
    cssFiles.push(match[1]);
  }

  const cssFileData = cssFiles.length > 0
    ? ` css-files="${cssFiles.join(",")}"`
    : "";

  const body = content
    .split("<body>")[1]
    .split("</body>")[0];

  return `<style-blocker${cssFileData}>
${body}
</style-blocker>
${addScripts(content)}`
}

function addScripts(content) {
  const widgets = [...content.matchAll(
    /* magical regex, matches:
    <!-- !WIDGET! -->
    <[anything except >]class="widget_name"*/
    /<!--\s*!WIDGET!\s*-->\s*<[^>]*class\s*=\s*"([^"\s]*)[^"]*"/g
  )].map(match => match[1]);

  return content.split("</html>")[1]
    + shadowScript.replace("$widgets^", JSON.stringify(widgets));
}