//////////
// common section
/**
 * label name used to identify application we are working on
 */
export const APP_TAG_NAME = process.env.APP_TAG_NAME || "app";
/**
 * label value used to identify application we are working on
 */
export const APP_TAG_VALUE = process.env.APP_TAG_VALUE || "";

export const HTTP_PORT = Number(process.env.HTTP_PORT || "8080");

/////////////
// tagging section
/**
 * Mandatory label with default value set to nodename
 */
export const LABEL_NODE_NAME = process.env.LABEL_NODE_NAME || "nodename";
export const LABEL_NAMESPACE = process.env.LABEL_NAMESPACE || "";
export const LABEL_POD_NAME = process.env.LABEL_POD_NAME || "";

////////////
// for ingress configuration

export const GENERATE_NAME = process.env.GENERATE_NAME || "";
export const NAMESPACE = process.env.NAMESPACE || "default";
export const INGRESS_NAME = process.env.INGRESS_NAME || "";
export const INGRESS_HOST = process.env.INGRESS_HOST || "";

/**
 * port used as service and pod port
 */
export const POD_PORT = Number(process.env.POD_PORT || "8080");

export const NO_INGRESS = !APP_TAG_NAME || !APP_TAG_VALUE || !GENERATE_NAME || !INGRESS_NAME;

if (GENERATE_NAME && !GENERATE_NAME.endsWith("-")) {
  console.error(`Invalid GENERATE_NAME: "${GENERATE_NAME}"; GENERATE_NAME is your Deployement/DemonSet/StateFulset name postfixed with a "-"`);
  process.exit(-1);
}

if (!(POD_PORT > 1) || POD_PORT > 65535) {
  console.error(`Invalid POD_PORT: "${POD_PORT}"; POD_PORT must be a valid port [1-65535]`);
  process.exit(-1);
}

if (!APP_TAG_VALUE) {
  console.error(`APP_TAG_VALUE must be define as a selector to identify the pod to work with`);
  process.exit(-1);
}

if (NO_INGRESS) {
  console.error(`Warning Ingress generation is not enabled, it requiere the following configurartion keys:`);
  if (!APP_TAG_NAME) console.error(`- "APP_TAG_NAME" (default value is "app" if not set)`);
  if (!APP_TAG_VALUE) console.error(`- "APP_TAG_VALUE": value to find in label APP_TAG_NAME`);
  if (!GENERATE_NAME) console.error(`- "GENERATE_NAME": Deployement/DemonSet/StateFulset name (metadata.name) postfixed with a "-"`);
  if (!INGRESS_NAME) console.error(`- "INGRESS_NAME": the ingress to alter`);
}

export const prevNode = {
  txt: "[]",
};
