import axe, { RunOptions } from 'axe-core';

/**
 * Runs axe-core accessibility checks on the given element and throws
 * a descriptive error if any violations are found.
 *
 * Note: `color-contrast` is disabled by default because jsdom has no
 * layout engine — contrast checks require a real browser.
 *
 * @example
 * await checkA11y(fixture.nativeElement);
 */
export async function checkA11y(
  element: HTMLElement,
  options?: RunOptions,
): Promise<void> {
  const results = await axe.run(element, {
    rules: { 'color-contrast': { enabled: false } },
    ...options,
  });

  if (results.violations.length > 0) {
    const msg = results.violations
      .map(
        (v) =>
          `[${v.impact}] ${v.id}: ${v.description}\n` +
          v.nodes.map((n) => `  - ${n.html}`).join('\n'),
      )
      .join('\n\n');
    throw new Error(`axe violations:\n${msg}`);
  }
}
