import * as handlers from "./handler";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function runHandler(funcName: string, eventData: any, chainId: number) {
  for (const [name, handler] of Object.entries(handlers)) {
    if (name === funcName) {
      await handler(eventData, chainId);
    }
  }
}
