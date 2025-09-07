export const criticalCSS = `
/* Critical CSS - Inlined to prevent render-blocking */

/* Base reset and typography */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
body { 
  min-height: 100vh; 
  line-height: 1.5; 
  -webkit-font-smoothing: antialiased;
  font-family: var(--font-inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);
}
.font-sans {
  font-family: var(--font-inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);
}
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
button { cursor: pointer; }

/* Layout utilities */
.min-h-screen { min-height: 100vh; }
.container { width: 100%; margin: 0 auto; padding: 0 1rem; }
.max-w-6xl { max-width: 72rem; }
.max-w-4xl { max-width: 56rem; }
.max-w-3xl { max-width: 48rem; }
.max-w-2xl { max-width: 42rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-grow { flex-grow: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.hidden { display: none; }
.block { display: block; }
.inline-block { display: inline-block; }
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.top-0 { top: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.z-50 { z-index: 50; }
.overflow-hidden { overflow: hidden; }

/* Spacing */
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.pt-20 { padding-top: 5rem; }
.pb-16 { padding-bottom: 4rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.space-y-8 > * + * { margin-top: 2rem; }

/* Typography */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }

/* Colors and backgrounds */
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-blue-600 { background-color: #2563eb; }
.bg-blue-700 { background-color: #1d4ed8; }
.bg-gradient-to-b { background: linear-gradient(to bottom, #f9fafb, #ffffff); }
.bg-gradient-to-br { background: linear-gradient(to bottom right, #002767, #bd0b31); }
.text-white { color: #ffffff; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-900 { color: #111827; }

/* Borders and shadows */
.rounded { border-radius: 0.25rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.shadow { box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
.border { border-width: 1px; }
.border-gray-200 { border-color: #e5e7eb; }

/* Forms */
input, textarea, select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #fff;
}
input:focus, textarea:focus, select:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

/* Header styles */
header {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* Hover states */
.hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
.hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }

/* Responsive breakpoints */
@media (min-width: 640px) {
  .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .sm\\:py-8 { padding-top: 2rem; padding-bottom: 2rem; }
  .sm\\:text-5xl { font-size: 3rem; line-height: 1; }
  .sm\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
}

@media (min-width: 768px) {
  .md\\:text-6xl { font-size: 3.75rem; line-height: 1; }
  .md\\:text-5xl { font-size: 3rem; line-height: 1; }
  .md\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:flex-row { flex-direction: row; }
  .md\\:space-y-0 > * + * { margin-top: 0; }
  .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .md\\:py-12 { padding-top: 3rem; padding-bottom: 3rem; }
  .md\\:block { display: block; }
}

@media (min-width: 1024px) {
  .lg\\:text-7xl { font-size: 4.5rem; line-height: 1; }
  .lg\\:text-6xl { font-size: 3.75rem; line-height: 1; }
  .lg\\:text-5xl { font-size: 3rem; line-height: 1; }
  .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .lg\\:py-16 { padding-top: 4rem; padding-bottom: 4rem; }
  .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

/* Animation placeholders */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn { animation: fadeIn 0.3s ease-in; }
`;