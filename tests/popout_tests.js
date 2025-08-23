const { Selector } = require("testcafe");

/**
 * This scenario is specific to the Pathfinder Second Edition (PF2e) system.
 * It verifies that skill-check dialogs triggered from popped-out actor sheets
 * still submit rolls correctly. The selectors used below match PF2e's markup
 * and may need adjustment if the system changes.
 */
fixture`Foundry`.page`http://localhost:30000/game`;

test("PF2e skill check dialog rolls from a popped-out sheet", async (t) => {
  // Assume user is already logged in and an actor is present in the directory

  // Open the first actor in the directory
  const firstActor = Selector("#actors .directory-list .directory-item").nth(0);
  await t.click(firstActor);

  // Pop out the actor sheet
  const popoutButton = Selector(".popout-module-button").filterVisible();
  await t.click(popoutButton);

  // Capture the main window and switch to the pop-out
  const mainWindow = await t.getCurrentWindow();
  await t.switchToWindow((w) => w.url.includes("popout"));

  // Trigger a PF2e skill check (e.g., Perception)
  const perceptionSkill = Selector('[data-skill="perception"] .skill-name');
  await t.click(perceptionSkill);

  // Submit the skill-check dialog
  const messageSelector = Selector("#chat-log .message");
  const initialCount = await messageSelector.count;
  const rollButton = Selector(
    '.dialog button[type="submit"], .dialog button.roll',
  );
  await t.click(rollButton);

  // A new chat message should appear as the result of the roll
  await t.expect(messageSelector.count).gt(initialCount);

  // Return focus to the main window
  await t.switchToWindow(mainWindow);
});
