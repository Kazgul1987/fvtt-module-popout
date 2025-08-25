const { Selector } = require("testcafe");

fixture`Foundry`.page`http://localhost:30000/game`;

test("new document events are mirrored to pop-outs", async (t) => {
  const firstActor = Selector("#actors .directory-list .directory-item").nth(0);
  await t.click(firstActor);
  const popoutButton = Selector(".popout-module-button").filterVisible();
  await t.click(popoutButton);
  const mainWindow = await t.getCurrentWindow();
  await t.switchToWindow((w) => w.url.includes("popout"));
  const popoutWindow = await t.getCurrentWindow();
  await t.switchToWindow(mainWindow);
  await t.eval(() => {
    window.__popoutEvent = false;
    jQuery(document).on("popout-test", function () {
      this.defaultView.__popoutEvent = true;
    });
  });
  await t.switchToWindow(popoutWindow);
  await t.eval(() => {
    document.dispatchEvent(new Event("popout-test"));
  });
  await t.expect(t.eval(() => window.__popoutEvent)).ok();
  await t.switchToWindow(mainWindow);
});
