import { ipcMain, shell } from "electron";
import { spawn } from "child_process";

// Feed a Buffer into a writable stream in chunks, honoring backpressure so a
// large input doesn't get buffered/flushed in one blocking write. Resolves once
// fully written; rejects on stream error (e.g. EPIPE if ffmpeg exits early).
function writeBufferToStream(stream, buffer, chunkSize = 64 * 1024) {
        return new Promise((resolve, reject) => {
                let offset = 0;

                stream.on("error", reject);

                function writeNext() {
                        while (offset < buffer.length) {
                                const end = Math.min(offset + chunkSize, buffer.length);
                                const chunk = buffer.subarray(offset, end);
                                offset = end;

                                if (offset >= buffer.length) {
                                        stream.end(chunk, resolve);
                                        return;
                                }

                                if (!stream.write(chunk)) {
                                        stream.once("drain", writeNext);
                                        return;
                                }
                        }
                }

                writeNext();
        });
}

if (!ipcMain.listenerCount("nmc:convert-mp3")) {
        ipcMain.handle("nmc:convert-mp3", (_event, audioData) => {
                const sender = _event.sender;
                return new Promise((resolve) => {
                        const ff = spawn("ffmpeg", [
                                "-i",
                                "pipe:0",
                                "-vn",
                                "-acodec",
                                "libmp3lame",
                                "-q:a",
                                "2",
                                "-compression_level",
                                "0",
                                "-map_metadata",
                                "-1",
                                "-f",
                                "mp3",
                                "pipe:1",
                        ]);

                        const chunks = [];
                        let duration = 0;

                        ff.stdout.on("data", (c) => chunks.push(c));

                        ff.stderr.on("data", (data) => {
                                const s = data.toString();
                                const dm = s.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d*)/);
                                if (dm) duration = +dm[1] * 3600 + +dm[2] * 60 + +dm[3];
                                const tm = s.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d*)/);
                                if (tm && duration > 0 && !sender.isDestroyed()) {
                                        const cur = +tm[1] * 3600 + +tm[2] * 60 + +tm[3];
                                        sender.send("nmc:convert-progress", Math.min(cur / duration, 0.99));
                                }
                        });

                        ff.on("error", () => resolve(null));
                        ff.on("close", (code) =>
                                resolve(code === 0 && chunks.length ? Buffer.concat(chunks) : null),
                        );

                        // Errors here (e.g. EPIPE when ffmpeg exits early) are surfaced via
                        // the 'error'/'close' handlers above, which settle the promise.
                        writeBufferToStream(ff.stdin, Buffer.from(audioData)).catch(() => {});
                });
        });
}

export default function registerEvents(mainWindow) {
        // Titlebar
        ipcMain.on("nmc-minimize", () => mainWindow.minimize());

        ipcMain.on("nmc-maximize", () => {
                if (mainWindow.isMaximized()) mainWindow.unmaximize();
                else mainWindow.maximize();
        });

        ipcMain.on("nmc-close", () => mainWindow.hide());

        ipcMain.handle("nmc-is-maximized", () => {
                return mainWindow.isMaximized();
        });

        if (!ipcMain.listenerCount("settings:open-external")) {
                ipcMain.handle("settings:open-external", (_event, url) => {
                        shell.openExternal(url);
                });
        }
}
