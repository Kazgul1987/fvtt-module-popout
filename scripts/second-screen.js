
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
"use strict";

const origAdd = EventTarget.prototype.addEventListener;
const origRemove = EventTarget.prototype.removeEventListener;
const pairs = [];
let isPatched = false;

async function openSecondScreen(sheet) {
  const popout = await sheet.render(true, { popOut: true });

  const jq = popout.jQuery || window.jQuery;
  const cloneDelegated = (source, target) => {
    const events = window.jQuery._data(source, "events");
    if (!events) return;
    for (const [type, handlers] of Object.entries(events)) {
      for (const handler of handlers) {
        const namespace = handler.namespace ? `.${handler.namespace}` : "";
        const eventName = `${type}${namespace}`;
        if (handler.selector) {
          if (handler.data !== undefined) {
            jq(target).on(
              eventName,
              handler.selector,
              handler.data,
              handler.handler,
            );
          } else {
            jq(target).on(eventName, handler.selector, handler.handler);
          }
        } else {
          if (handler.data !== undefined) {
            jq(target).on(eventName, handler.data, handler.handler);
          } else {
            jq(target).on(eventName, handler.handler);
          }
        }
      }
    }
  };

  cloneDelegated(window.document, popout.document);
  if (document.body && popout.document.body) {
    cloneDelegated(document.body, popout.document.body);
  }

  const newPairs = [
    [window.document, popout.document],
    [window.document.body, popout.document.body],
  ];
  pairs.push(...newPairs);

  const seed = (source, target) => {
    if (!source || !target) return;
    const getter =
      typeof getEventListeners === "function" ? getEventListeners : null;
    if (getter) {
      try {
        const listeners = getter(source);
        for (const [type, arr] of Object.entries(listeners)) {
          for (const l of arr) {
            const opts = l.options ?? l.useCapture ?? l.capture ?? false;
            origAdd.call(target, type, l.listener, opts);
          }
        }
        return;
      } catch (_err) {
        /* ignore */
      }
    }
    for (const key in source) {
      if (key.startsWith("on") && typeof source[key] === "function") {
        const type = key.slice(2);
        origAdd.call(target, type, source[key], false);
      }
    }
  };

  for (const [src, tgt] of newPairs) seed(src, tgt);

  if (!isPatched) {
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      const result = origAdd.call(this, type, listener, options);
      for (const [src, tgt] of pairs) {
        if (this === src && tgt) {
          origAdd.call(tgt, type, listener, options);
        }
      }
      return result;
    };

    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      const result = origRemove.call(this, type, listener, options);
      for (const [src, tgt] of pairs) {
        if (this === src && tgt) {
          origRemove.call(tgt, type, listener, options);
        }
      }
      return result;
    };

    isPatched = true;
  }

  return popout;
}

window.openSecondScreen = openSecondScreen;
