# 私有文档系统部署指南（Cloudflare）

本项目是基于 React + Vite + Tailwind 的前端，以及 Cloudflare Workers + KV + Pages Functions 的后端代理，整合 Github 私有仓库文档同步的私有文档系统。本文档提供完整的 Cloudflare 部署教程，并说明关键环境变量与安全要求。

## 架构概览
- 前端：Cloudflare Pages（构建并托管静态资源），通过 Pages Functions 代理后端接口到 Workers。
- 后端：Cloudflare Workers；KV 用于缓存文档索引与会话；Cron 任务定期同步 Github 文档。
- 文档仓库：Github 私有仓库（例如 `wepo-Document`），分支与目录通过环境变量指定。

## 前置条件
- 一个 Cloudflare 账号，已启用 Pages 与 Workers。
- 一个 Github 仓库，保存 Markdown 文档（UTF-8 无 BOM），例如目录 `docs/`。
- 准备好管理员用户名与密码（密码使用 bcrypt 哈希存储）。

## 代码仓库与技术栈
- 默认分支：`main`
- 辅助分支：`deploy/pages`（可用于 Pages 构建或预发布）
- 关键代码位置：
  - 前端入口：`src/App.tsx`
  - 布局与侧边栏：`src/layouts/AppLayout.tsx`
  - 接口封装：`src/utils/api.ts`
  - Pages Functions 代理：`functions/api/[[path]].ts`
  - Workers 主逻辑：`workers/sync-worker.ts`
  - Cloudflare 配置：`wrangler.toml`

## Cloudflare Workers 部署
1. 创建 KV 命名空间（DOCS_CACHE）
   - 方式 A（Cloudflare Dashboard）：创建 KV 并记录 `id`。
   - 方式 B（Wrangler CLI）：使用 `wrangler kv:namespace create DOCS_CACHE`（需本地已登录 Cloudflare）。
   - 将 KV `id` 填入 `wrangler.toml` 的 `[[kv_namespaces]]` 对应条目。

2. 配置 Workers 环境变量（生产）
   - 在 Cloudflare Dashboard 的 Workers 设置中添加以下变量：
     - `REPO_OWNER`：Github 仓库所有者（例如 `njwujinyu`）
     - `REPO_NAME`：仓库名（例如 `wepo-Document`）
     - `DOCS_DIR`：文档根目录（默认 `docs`）
     - `BRANCH`：文档分支（默认 `main`）
     - `ALLOWED_ORIGIN`：允许的前端来源（例如 `https://online-document.pages.dev` 或你的自定义域）
     - `ADMIN_USERNAME`：管理员用户名（例如 `admin`）
     - `ADMIN_PASSWORD_HASH`：管理员密码的 bcrypt 哈希
     - `SESSION_SECRET`：用于会话签名的随机字符串
   - 哈希生成示例（Node 环境）：
     - `node -e "console.log(require('bcryptjs').hashSync('你的强密码', 10))"`

3. 部署 Workers
   - 本地（Windows 10，仓库在 `E:` 或项目根目录，不在 `C:/D:`）执行：
     - `npm run cf:deploy`
   - 成功后将获得 Workers 的外网地址，例如：
     - `https://online-document-sync.<你的子域>.workers.dev`

4. 定时同步（可选）
   - `wrangler.toml` 中已配置示例 Cron（每 2 小时一次）。确保账号启用 Cron 触发器。

5. 接口验证（生产）
   - `GET /status`：检查环境变量与配置加载情况。
   - `POST /login`：使用 `ADMIN_USERNAME` 与原始密码（Workers 会用哈希校验）。
   - `GET /session`：登录后返回 `{ authenticated: true }`。
   - `POST /logout`：清理会话。

## Cloudflare Pages 部署
1. 连接 Github 仓库
   - 在 Cloudflare Pages 选择 `njwujinyu/Online-Document`（或你的仓库），默认构建分支可选 `main` 或 `deploy/pages`。
   - 构建设置：
     - 构建命令：`npm run build`
     - 产物目录：`dist`

2. Pages Functions 代理到 Workers
   - 项目已包含 `functions/api/[[path]].ts`，会将 `/api` 下的请求代理到 Workers。
   - 在 Pages 项目环境变量中设置：
     - `WORKER_BASE_URL`：你的 Workers 外网地址（例如 `https://online-document-sync.<你的子域>.workers.dev`）
   - 前端默认使用 `'/api'` 作为后端基座，因此无需设置 `VITE_WORKER_BASE_URL`；生产环境将通过 Functions 完成代理。

3. CORS 与会话
   - 确保 Workers 的 `ALLOWED_ORIGIN` 与 Pages 域名一致（含协议）。
   - Workers 已设置 `SameSite=Lax` 的会话 Cookie；前端会携带 `credentials: 'include'`。

## Github 文档仓库要求
- 所有 Markdown 文档必须使用 UTF-8（无 BOM）编码。
- 建议通过 VS Code 或 Notepad++ 进行编码转换与校验。
- 文档存放目录与分支由 `DOCS_DIR` 与 `BRANCH` 指定。

## 常见问题
- 登录页无法进入：检查 Workers 是否部署成功、`WORKER_BASE_URL` 是否正确、`ALLOWED_ORIGIN` 是否匹配 Pages 域名、管理员密码哈希是否有效。
- 文档为空或 404：检查 KV 是否存在索引，触发 `/sync` 后查看 `/status` 与 Workers 日志；确认 Github Token 权限（若需私有仓库访问，在 Workers 中配置 `GITHUB_TOKEN` 并启用对应权限）。
- CORS 报错：`ALLOWED_ORIGIN` 必须与 Pages 完整域名一致；多域名时需在 Workers 逻辑中扩展允许列表。

## 安全建议
- `ADMIN_PASSWORD_HASH` 与 `SESSION_SECRET` 必须在生产环境变量中设置，不要提交到仓库。
- 若需要访问私有仓库，使用 `GITHUB_TOKEN` 并开启最小必要权限；切勿在前端暴露。

## 开发与维护
- 开发在本地仓库进行，遵循官方文档与本文档规范；完成后更新本地文档并推送。
- 不在 `C:/D:` 安装依赖与生成临时文件；统一使用项目根目录或 `E:` 盘。

---

编码要求：本文档与所有 Markdown 文档均使用 UTF-8（无 BOM）。