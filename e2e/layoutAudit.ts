import type { Page } from '@playwright/test';

/**
 * Runs in the browser and returns human-readable layout problems inside `rootSelector`:
 *  - text outside the viewport horizontally (would cause sideways scroll / cut-off)
 *  - text truncated with an ellipsis (label doesn't fit)
 *  - text clipped by an ancestor that hides overflow (e.g. squeezed inside a card)
 *  - two pieces of text overlapping each other
 * React Native Web renders <Text> as `[dir="auto"]`, so those are our text leaves.
 */
export async function auditLayout(page: Page, rootSelector: string): Promise<string[]> {
  return page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) return [`root ${selector} not found`];
    const vw = document.documentElement.clientWidth;
    const T = 1.5; // px tolerance for sub-pixel rounding

    const leaves = [...root.querySelectorAll<HTMLElement>('[dir="auto"]')].filter((el) => {
      if (el.querySelector('[dir="auto"]')) return false; // only innermost text
      if (el.closest('[data-testid="dev-switcher"]')) return false;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && el.textContent!.trim() !== '';
    });

    const label = (el: HTMLElement) => `"${el.textContent!.trim().slice(0, 40)}"`;
    const issues: string[] = [];

    for (const el of leaves) {
      const r = el.getBoundingClientRect();
      if (r.left < -T || r.right > vw + T) issues.push(`off-screen ${label(el)} (${Math.round(r.left)}→${Math.round(r.right)} of ${vw})`);
      // RN Web truncates via text-overflow (1 line) or -webkit-line-clamp (n lines); either way the content is bigger than the box
      const ts = getComputedStyle(el);
      const clamps = ts.textOverflow === 'ellipsis' || (ts.webkitLineClamp && ts.webkitLineClamp !== 'none');
      if (clamps && (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)) // exact: 1px over already shows "…"
        issues.push(`truncated ${label(el)}`);

      // clipped by the nearest overflow:hidden ancestor (scroll containers are fine)
      for (let p = el.parentElement; p && p !== root.parentElement; p = p.parentElement) {
        const o = getComputedStyle(p);
        if (o.overflowX === 'auto' || o.overflowX === 'scroll' || o.overflowY === 'auto' || o.overflowY === 'scroll') break;
        if (o.overflow === 'hidden') {
          const pr = p.getBoundingClientRect();
          if (r.left < pr.left - T || r.right > pr.right + T) issues.push(`clipped ${label(el)} by its container`);
          break;
        }
      }
    }

    // any in-flow box (not absolutely positioned decoration) sticking out of its parent horizontally,
    // e.g. a fixed-size level badge pushed past the edge of a squeezed row
    for (const el of root.querySelectorAll<HTMLElement>('div')) {
      const parent = el.parentElement;
      if (!parent || el.closest('[data-testid="dev-switcher"]')) continue;
      const s = getComputedStyle(el);
      const ps = getComputedStyle(parent);
      if (s.position === 'absolute' || s.position === 'fixed' || ps.overflowX === 'auto' || ps.overflowX === 'scroll') continue;
      const r = el.getBoundingClientRect();
      const pr = parent.getBoundingClientRect();
      if (r.width === 0 || pr.width === 0) continue;
      if (r.right > pr.right + T || r.left < pr.left - T) {
        const txt = el.textContent!.trim().slice(0, 30) || el.getAttribute('data-testid') || 'box';
        issues.push(`overflows parent "${txt}" by ${Math.round(Math.max(r.right - pr.right, pr.left - r.left))}px`);
      }
    }

    // pairwise overlap, only within the same region (the fixed tab bar sits over scrolled content by design)
    const region = (el: HTMLElement) => (el.closest('[data-testid="tab-bar"]') ? 'tabs' : 'content');
    const rects = leaves.map((el) => ({ el, r: el.getBoundingClientRect(), region: region(el) }));
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        if (a.region !== b.region || a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (w > 3 && h > 3) issues.push(`overlap ${label(a.el)} × ${label(b.el)}`);
      }
    }
    return [...new Set(issues)];
  }, rootSelector);
}
