/**
 * Packages the production build into one self-contained HTML file.
 *
 * The output is body content only — no doctype, html, head or body tags — because
 * the hosting page supplies that skeleton. CSS and JS are inlined so the page makes
 * no network requests at all.
 *
 * Usage: npm run build && npm run build:artifact
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const html = readFileSync(resolve(dist, 'index.html'), 'utf8')

const cssName = html.match(/href="\/assets\/([^"]+\.css)"/)?.[1]
const jsName = html.match(/src="\/assets\/([^"]+\.js)"/)?.[1]
if (!cssName || !jsName) {
  throw new Error('Could not find the built CSS and JS in dist/index.html. Run `npm run build` first.')
}

const css = readFileSync(resolve(dist, 'assets', cssName), 'utf8')
const js = readFileSync(resolve(dist, 'assets', jsName), 'utf8')

// A literal </script> inside a bundled string would close the tag early.
const safeJs = js.replaceAll('</script', '<\\/script')

const out = `<title>Westfield Branch Command Center</title>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${safeJs}
</script>
`

const target = resolve(dist, 'westfield-command-center.html')
writeFileSync(target, out, 'utf8')

const kb = (n) => `${(n / 1024).toFixed(0)} kB`
console.log(`Wrote ${target}`)
console.log(`  css ${kb(css.length)} · js ${kb(js.length)} · total ${kb(out.length)}`)
if (out.includes('url(/assets')) {
  console.warn('  WARNING: an asset URL was not inlined — the page would make a network request.')
}
