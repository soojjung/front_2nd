// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from "react";
import http from "http";
import { renderToPipeableStream } from "react-dom/server";
import { App } from "./App.tsx";
import zlib from "zlib";

const port = 3333;

const cache = new Map<string, Buffer>();

function htmlTemplate(appHtml: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple SSR</title>
    </head>
    <body>
      <div id="root">${appHtml}</div>
    </body>
    </html>
  `;
}

const requestListener = (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  const url = req.url || "/";

  if (cache.has(url)) {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Encoding", "gzip");
    return res.end(cache.get(url));
  }

  const stream = renderToPipeableStream(<App url={url} />, {
    onShellReady() {
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Content-Encoding", "gzip");

      const gzip = zlib.createGzip();
      const chunks: Buffer[] = [];

      gzip.on("data", (chunk) => chunks.push(chunk));

      gzip.on("end", () => {
        const fullResponse = Buffer.concat(chunks);
        cache.set(url, fullResponse);
        res.end(fullResponse); // 최종 응답 전송
      });

      const fullHtml = htmlTemplate('<div id="root"></div>');
      stream.pipe(gzip).end(fullHtml);
    },
    onError(err) {
      console.error(err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    },
  });
};

const server = http.createServer(requestListener);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
