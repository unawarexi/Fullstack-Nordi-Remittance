=> ERROR [api 5/6] RUN npm ci 19.8s
=> [ml 3/8] WORKDIR /app 0.1s
=> [ml 4/8] COPY requirements.txt . 0.0s
=> CANCELED [ml 5/8] RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt 7.1s

---

> [api 5/6] RUN npm ci:
> 19.61 npm error code ERESOLVE
> 19.61 npm error ERESOLVE could not resolve
> 19.61 npm error
> 19.61 npm error While resolving: multer-storage-cloudinary@4.0.0
> 19.61 npm error Found: cloudinary@2.8.0
> 19.61 npm error node_modules/cloudinary
> 19.61 npm error cloudinary@"^2.8.0" from the root project
> 19.61 npm error
> 19.61 npm error Could not resolve dependency:
> 19.61 npm error peer cloudinary@"^1.21.0" from multer-storage-cloudinary@4.0.0
> 19.61 npm error node_modules/multer-storage-cloudinary
> 19.61 npm error multer-storage-cloudinary@"^4.0.0" from the root project
> 19.61 npm error
> 19.61 npm error Conflicting peer dependency: cloudinary@1.41.3
> 19.61 npm error node_modules/cloudinary
> 19.61 npm error peer cloudinary@"^1.21.0" from multer-storage-cloudinary@4.0.0
> 19.61 npm error node_modules/multer-storage-cloudinary
> 19.61 npm error multer-storage-cloudinary@"^4.0.0" from the root project
> 19.61 npm error
> 19.61 npm error Fix the upstream dependency conflict, or retry
> 19.61 npm error this command with --force or --legacy-peer-deps
> 19.61 npm error to accept an incorrect (and potentially broken) dependency resolution.
> 19.61 npm error
> 19.61 npm error
> 19.61 npm error For a full report see:
> 19.61 npm error /root/.npm/\_logs/2026-06-16T04_29_07_928Z-eresolve-report.txt
> 19.62 npm notice
> 19.62 npm notice New major version of npm available! 10.8.2 -> 11.17.0
> 19.62 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.17.0
> 19.62 npm notice To update run: npm install -g npm@11.17.0
> 19.62 npm notice
> [+] up 11/14ror A complete log of this run can be found in: /root/.npm/\_logs/2026-06-16T04_29_07_928Z-debug-0.log
> ✔ Image mongo:7.0 Pulled 120.4s
> ⠙ Image fullstack-nordi-remittance-frontend Building 427.8s
> ⠙ Image fullstack-nordi-remittance-api Building 427.8s
> ⠙ Image fullstack-nordi-remittance-ml Building 427.8s
> Dockerfile.dev:17

---

15 |

16 | # Install all dependencies

17 | >>> RUN npm ci

18 |

19 | # Copy source code

---

target api: failed to solve: process "/bin/sh -c npm ci" did not complete successfully: exit code: 1

View build details: docker-desktop://dashboard/build/default/default/i5je4tw8zfstn8mqpcrycsyh2

make: \*\*\* [up] Error 1
