import type { FC, PropsWithChildren } from 'hono/jsx';
import { Link, ViteClient } from 'vite-ssr-components/hono';

export const MainLayout: FC<PropsWithChildren<{ title?: string }>> = ({ children, title = '02 Builder' }) => {
  return (
    <html lang="en" class="h-full bg-slate-950">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>
        <script src="https://unpkg.com/htmx.org/dist/ext/ws.js"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body class="h-full overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <div id="app-root" class="h-full">
          {children}
        </div>
      </body>
    </html>
  );
};
