## Qwen Added Memories

- 项目技术栈：Vue 3 + TypeScript + Vite + Pinia + Vue Router。UI 框架使用 Element Plus + TailwindCSS。包管理器为 pnpm，Node 版本要求 >= 20.19.0。
- 项目结构：src 目录下包含 api（接口层）、assets（资源）、components（组件）、config（配置）、directives（指令）、enums（枚举）、hooks（组合式函数）、locales（国际化）、mock（模拟数据）、plugins（插件）、router（路由）、store（状态管理）、types（类型定义）、utils（工具函数）、views（视图层）。
- 代码规范工具：ESLint + Prettier + Stylelint + Commitlint + Husky。提交规范使用 cz-git。自动导入：unplugin-auto-import + unplugin-vue-components 实现 Vue、Vue Router、Pinia、Element Plus 的按需导入。
- 路由架构：使用动态路由，路由模块化存储在 router/modules 和 router/routes 目录，路由守卫在 router/guards 目录。视图模块：auth（认证）、dashboard（仪表盘）、exception（异常页）、index（首页）、outside（外部页）、result（结果页）、system（系统管理）。
- 状态管理：Pinia + pinia-plugin-persistedstate 实现数据持久化，使用 StorageKeyManager 生成版本化存储键（格式：sys-v{version}-{storeId}）。国际化支持中英文，使用 localStorage 序列化。
- 构建工具：Vite，压缩算法使用 gzip，target 为 es2015，代码压缩使用 terser 并移除 console/debugger。API 代理配置在 vite.config.ts 中的 server.proxy。
- Temu1688Front 是一个 Vue 3 前端项目，使用 TypeScript + Vite + Pinia 技术栈。UI 框架为 Element Plus + TailwindCSS，包管理器是 pnpm。
- src 目录结构：api（接口）、assets（资源）、components（组件）、config（配置）、directives（指令）、enums（枚举）、hooks（组合式函数）、locales（国际化）、mock（模拟）、plugins（插件）、router（路由）、store（状态）、types（类型）、utils（工具）、views（视图）。
- 代码规范：ESLint + Prettier + Stylelint，提交规范用 cz-git + Husky。自动导入通过 unplugin-auto-import 和 unplugin-vue-components 实现。
- 路由采用模块化设计，路由文件在 router/modules 和 router/routes，守卫在 router/guards。视图按功能分为 auth、dashboard、exception、index、outside、result、system。
- 状态管理用 Pinia + pinia-plugin-persistedstate，存储键格式为 sys-v{version}-{storeId}。国际化支持中英文。
