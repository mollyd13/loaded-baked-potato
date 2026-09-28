import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'sign-in',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'sign-up',
    renderMode: RenderMode.Prerender
  },
  {
    // Protected pages depend on the user's session, so render them in the browser
    path: '**',
    renderMode: RenderMode.Client
  }
];
