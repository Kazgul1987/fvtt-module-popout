const { Selector } = require("testcafe");

/**
 * This scenario is specific to the Pathfinder Second Edition (PF2e) system.
 * It verifies that skill-check dialogs triggered from popped-out actor sheets
 * still submit rolls correctly. The selectors used below match PF2e's markup
 * and may need adjustment if the system changes.
 */
fixture`Foundry`
  .page`http://localhost:30000/game`
  .beforeEach(async (t) => {
    await t.eval(() =>
      game.settings.set("popout", "cloneDocumentEvents", true),
    );
  });

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

test("PF2e skill check after re-render in pop-out still triggers a roll", async (t) => {
  // Open the first actor in the directory
  const firstActor = Selector("#actors .directory-list .directory-item").nth(0);
  await t.click(firstActor);

  // Pop out the actor sheet
  const popoutButton = Selector(".popout-module-button").filterVisible();
  await t.click(popoutButton);

  // Capture the main window and switch to the pop-out
  const mainWindow = await t.getCurrentWindow();
  await t.switchToWindow((w) => w.url.includes("popout"));

  // Click the first rollable element
  const rollable = Selector(".rollable").filterVisible().nth(0);
  const messageSelector = Selector("#chat-log .message");
  let initialCount = await messageSelector.count;
  await t.click(rollable);

  // A dialog or new chat message should appear
  const dialog = Selector(".dialog").filterVisible();
  try {
    await t.expect(dialog.exists).ok({ timeout: 1000 });
  } catch {
    await t.expect(messageSelector.count).gt(initialCount);
  }

  // Force a re-render of the sheet to ensure listeners re-bind
  await t.eval(() => game.actors.contents[0].sheet.render(true));

  // Trigger a PF2e skill check (e.g., Perception)
  const perceptionSkill = Selector('[data-skill="perception"] .skill-name');
  await t.click(perceptionSkill);

  // Submit the skill-check dialog
  initialCount = await messageSelector.count;
  const rollButton = Selector(
    '.dialog button[type="submit"], .dialog button.roll',
  );
  await t.click(rollButton);

  // A new chat message should appear as the result of the roll
  await t.expect(messageSelector.count).gt(initialCount);

  // Return focus to the main window
  await t.switchToWindow(mainWindow);
});
