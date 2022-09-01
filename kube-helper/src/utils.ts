import { HttpError } from "@kubernetes/client-node";

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function logWatchError(url: string, e: unknown, errorCnt: number) {
  const pause = Math.min(errorCnt * 6, 60);
  if (pause < 60 || errorCnt % 5 === 0) {
    if (e instanceof HttpError) {
      console.log(`Watch ${url} failed and return: ${e.statusCode}: ${e.message}" retrys in ${pause} sec`);
      console.log(`Body:`, e.body);
    } else if (e instanceof Error) {
      console.log(`Watch ${url} failed and return: ${e.message}" retrys in ${pause} sec`);
    } else {
      console.log(`Watch ${url} failed retrys in ${pause} sec`, e);
    }
  }
  await delay(pause * 1000);
}
