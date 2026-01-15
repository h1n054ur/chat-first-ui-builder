import type { FC, PropsWithChildren } from 'hono/jsx';

export const MainLayout: FC<PropsWithChildren<{ title?: string }>> = ({ children, title = '02 Builder' }) => {
  return (
    <html lang="en" class="h-full bg-slate-950">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>
        <script src="https://unpkg.com/htmx.org/dist/ext/ws.js"></script>
        <link rel="stylesheet" href="/src/style.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'Inter', sans-serif; }
          .font-geist { font-family: 'Geist', sans-serif; }
          .font-mono { font-family: 'Geist Mono', monospace; }
        `}</style>
      </head>
      <body class="h-full overflow-hidden text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200">
        <div id="app-root" class="h-full">
          {children}
        </div>
      </body>
    </html>
  );
};
