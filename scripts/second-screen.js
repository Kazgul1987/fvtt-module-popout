/**
 * Utilities for PF2e second-screen interactions.
 * Adjusted for PF2e v13 DOM structure.
 */

/**
 * Trigger a PF2e skill roll.
 * @param {JQuery} html - jQuery object for the actor sheet.
 * @param {string} slug - Skill slug (e.g., "acrobatics").
 */
function triggerSkillRoll(html, slug) {
  const button = html
    .find(
      `[data-skill="${slug}"] [data-action='roll-check'], [data-skill="${slug}"] .skill-name`,
    )
    .first();
  if (button.length) button.trigger("click");
}

/**
 * Trigger a generic roll based on a selector that resolves to an element with
 * `data-action="roll-check"`.
 * @param {JQuery} html - jQuery object for the actor sheet.
 * @param {string} selector - Additional selector to locate the roll element.
 */
function triggerRollCheck(html, selector) {
  const button = html
    .find(`${selector} [data-action='roll-check'], ${selector}`)
    .filter('[data-action="roll-check"]')
    .first();
  if (button.length) button.trigger("click");
}

// Expose functions for external use
if (typeof window !== "undefined") {
  window.triggerSkillRoll = triggerSkillRoll;
  window.triggerRollCheck = triggerRollCheck;
}
