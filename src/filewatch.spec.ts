import * as ts from "typescript";
import fs from "fs";
import os from "os";
import path from "path";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe("typescript", () => {
  it("watchfile", async () => {
    console.log("Platform: " + os.platform());
    console.log("Architecture: " + os.arch());
    console.log("CPU details: " + JSON.stringify(os.cpus(), null, 2));
    // Convert bytes to gigabytes for easier reading
    const totalMemoryInGB = (os.totalmem() / 1024 ** 3).toFixed(2);
    const freeMemoryInGB = (os.freemem() / 1024 ** 3).toFixed(2);
    console.log(
      "Total Memory: " + Number(totalMemoryInGB).toLocaleString() + " GB"
    );
    console.log(
      "Free Memory: " + Number(freeMemoryInGB).toLocaleString() + " GB"
    );
    console.log("Uptime: " + os.uptime() + " seconds");

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
      250
    );
    fs.writeFileSync(filename, "export function g() {}");
    await updated;
    watcher.close();
    fs.rmSync("tmp", { recursive: true });
  });
});
