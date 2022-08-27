# Dyn-ingress

Add Label nodename / podname / namespace label to pod.
Maintain an Ingress to all your pods.

## Tag-only feature

### Minimal setup

You **MUST** define `APP_TAG_VALUE` to identify the pods you want to alter.
By default, only pods having the label `app`=`APP_TAG_VALUE` will be a concern.

If you use a label key different from `app`, you can choose another label with the `APP_TAG_NAME` env variable.

Minimal configuration:
```YAML
apiVersion: v1
kind: Pod
metadata:
  name: dyn-ingress
spec:
  containers:
  - name: dyn-ingress
    image: urielch/dyn-ingress:latest
    env:
    - name: APP_TAG_VALUE
      value: "app-to-tag"
```
Now all pod having label `app=app-to-tag` will receves an extra label `nodename=<nodename>`

### Tagging with more tags

Namespace and pod name can add two more labels to your pods. You can choose labels name with env vars: `LABEL_NODE_NAME`, `LABEL_NAMESPACE`, `LABEL_POD_NAME`:

Use custom labels names:
```YAML
apiVersion: v1
kind: Pod
metadata:
  name: dyn-ingress
spec:
  containers:
  - name: dyn-ingress
    image: urielch/dyn-ingress:latest
    ports:
    - containerPort: 8080
    env:
    - name: APP_TAG_VALUE
      value: "app-to-tag"
    - name: LABEL_NODE_NAME
      value: "NODE_NAME"
    - name: LABEL_NAMESPACE
      value: "NAMESPACE"
    - name: LABEL_POD_NAME
      value: "POD_NAME"
```
Now all pod having label `app=app-to-tag` will receives extras labels: `NODE_NAME=<nodename>`, `LABEL_NAMESPACE=<namespace>`, `LABEL_POD_NAME=<podname>`, 

## Enable Ingress

This image had been created to get direct access to all your pods via an Ingress. This is meant to be used with a DemonSet / Deployment or StateFulset.

To activate the Dynamique `Ingress`, you need five more env variables:
- `APP_TAG_NAME`: The label used to select pods. (optional default value is `app` as in Minimal setup)
- `APP_TAG_VALUE`: Value to find in the `APP_TAG_NAME` label. (as in Minimal setup)
- `GENERATE_NAME`: Pod name prefix ending with "-". This value is computed by Kubernetes from the DemonSet / Deployment or StateFulset name postfixed by a "-".
- `INGRESS_NAME`: The base Ingress to add routes to.
- `POD_PORT` pod port to expose, in service with the same port number. (default is 80)

### Ingress K3d sample configuration

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: dyn-ingress
spec:
  containers:
  - name: dyn-ingress
    image: urielch/dyn-ingress:latest
    env:
    - name: APP_TAG_VALUE
      value: "app-to-tag"
    - name: GENERATE_NAME
      value: "my-app-"
    - name: INGRESS_NAME
      value: "my-ingress"
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: traefik
    traefik.ingress.kubernetes.io/router.middlewares: default-strip-prefix@kubernetescrd
spec:
  rules:
    - http:
        paths:
          - path: /dummy
            pathType: Prefix
            backend:
              service:
                name: non-existing-service
                port:
                  number: 80
```
This configuration will add extra route: `http://<cluser>/nodename/url` to be redirect to `http://<podIP>:80/url`


### Full sample with RBAC

```YAML
# Middleware to drop prefix
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: strip-prefix
  annotations:
    kubernetes.io/ingress.class: traefik
spec:
  replacePathRegex:
    regex: ^/(?:[^/]+)/?(.*)
    replacement: /$1
---
# The dynamique ingress with an exact path /list to get all nodes
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: remote-droid-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: traefik
    traefik.ingress.kubernetes.io/router.middlewares: default-strip-prefix@kubernetescrd
spec:
  rules:
    - http:
        paths:
          - path: /list
            pathType: Exact
            backend:
              service:
                name: dyn-ingress-service
                port:
                  number: 8080
---
# Create a service account for dyn-ingress
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dyn-ingress-account
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: dyn-ingress-account
rules:
- apiGroups: [""] # "" indicates the core API group
  resources: ["pods"]
  verbs: ["get", "watch", "list", "patch"]
- apiGroups: [""] # "" indicates the core API group
  resources: ["services"]
  verbs: ["get", "watch", "list", "create", "delete", "update"]
- apiGroups: ["networking.k8s.io"] # "" indicates the core API group
  resources: ["ingresses"]
  verbs: ["get", "watch", "list", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dyn-ingress-account
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: dyn-ingress-account
subjects:
- kind: ServiceAccount
  name: dyn-ingress-account
---
# Dyn-ingress Deployement, dynamicaly manage ingresses and services
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dyn-ingress
  labels:
    app: dyn-ingress
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dyn-ingress
  template:
    metadata:
      labels:
        app: dyn-ingress
    spec:
      serviceAccountName: dyn-ingress-account
      #tolerations:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: node-role.kubernetes.io/master
                    operator: In
                    values:
                      - "true"
      containers:
        - name: dyn-ingress
          image: urielch/dyn-ingress:latest
          imagePullPolicy: Always
          resources:
            limits:
              memory: 128Mi
              cpu: "0.2"
          ports:
            - containerPort: 8080
          env:
            - name: APP_TAG_VALUE
              value: "remote-droid"
            - name: GENERATE_NAME
              value: "remote-droid-"
            - name: INGRESS_NAME
              value: "remote-droid-ingress"
            - name: POD_PORT
              value: "3009"
            - name: HTTP_PORT
              value: "8080"
---
# Service to list nodename having valud pods
apiVersion: v1
kind: Service
metadata:
  name: dyn-ingress-service
spec:
  type: ClusterIP
  selector:
    app: dyn-ingress
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
```

### TODO:

- Add options ton configure URL path.
- Publish a helm package.
- Remove "@kubernetes/client-node" dependency
- Add metric service.

## Note:

The image listens for HTTP requests to port `HTTP_PORT` (default value is 8080), and will respond with a JSON list containing all node names.