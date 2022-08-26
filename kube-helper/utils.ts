import { V1Pod } from "@kubernetes/client-node";
import * as config from "./config";

/**
 * getPod name if concern by routing
 * @param pod
 * @returns
 */
export function getPodName(pod: V1Pod): string {
  const metadata = pod.metadata;
  if (!metadata) return "";
  if (metadata.generateName !== config.GENERATE_NAME) return "";
  return metadata.name || "";
}

export function getPodNodeName(pod: V1Pod): string {
  return pod.spec?.nodeName || "";
}

export function isPodValid(pod: V1Pod): boolean {
  if (pod.status && pod.status.conditions) {
    let conditions = pod.status.conditions;
    conditions = conditions.filter((cond) => cond.type === "Ready");
    if (conditions.length) {
      if (conditions[0].status === "False") return false;
      else return true;
    }
  }
  return false;
}

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
