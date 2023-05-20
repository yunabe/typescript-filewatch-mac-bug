import * as ts from "typescript";
import fs from "fs";
import path from "path";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe("typescript", () => {
  it("watchfile", async () => {
    fs.mkdirSync("tmp", { recursive: true });
    const filename = path.join("tmp", "mysrc.ts");
    fs.writeFileSync(filename, "export function f() {}");

    let notifyChange: (value: void | PromiseLike<void>) => void;
    let updated = new Promise<void>((resolve) => {
      notifyChange = resolve;
    });

    let watcher = ts.sys.watchFile(
      filename,
      (
        fileName: string,
        eventKind: ts.FileWatcherEventKind,
        modifiedTime?: Date
      ) => {
        console.log("notified:", { fileName, eventKind, modifiedTime });
        if (fileName.endsWith("mysrc.ts")) {
          console.log("found the change of mysrc.ts");
          notifyChange();
        }
      },
      250,
      { watchFile: ts.WatchFileKind.FixedPollingInterval }
    );
    fs.writeFileSync(filename, "export function g() {}");
    await updated;
    watcher.close();
    fs.rmSync("tmp", { recursive: true });
  });
});
