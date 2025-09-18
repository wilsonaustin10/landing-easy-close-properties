export const criticalCSS = `
/* Minimal critical CSS for above-the-fold content */
*,*::before,*::after{box-sizing:border-box}
*{margin:0;padding:0}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{min-height:100vh;line-height:1.5;-webkit-font-smoothing:antialiased;font-family:var(--font-inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif)}
.font-sans{font-family:var(--font-inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif)}
img,picture,video,canvas,svg{display:block;max-width:100%;height:auto}
input,button,textarea,select{font:inherit}
p,h1,h2,h3,h4,h5,h6{overflow-wrap:break-word}
button{cursor:pointer;touch-action:manipulation}
a{text-decoration:none;color:inherit}

/* Essential layout for above-the-fold */
.min-h-screen{min-height:100vh}
.max-w-6xl{max-width:72rem}
.max-w-3xl{max-width:48rem}
.max-w-md{max-width:28rem}
.mx-auto{margin-left:auto;margin-right:auto}
.flex{display:flex}
.flex-col{flex-direction:column}
.items-center{align-items:center}
.justify-between{justify-content:space-between}
.hidden{display:none}
.block{display:block}
.relative{position:relative}
.absolute{position:absolute}

/* Critical spacing */
.p-6{padding:1.5rem}
.px-4{padding-left:1rem;padding-right:1rem}
.py-3{padding-top:0.75rem;padding-bottom:0.75rem}
.py-4{padding-top:1rem;padding-bottom:1rem}
.pt-20{padding-top:5rem}
.pb-16{padding-bottom:4rem}
.mb-6{margin-bottom:1.5rem}
.mb-8{margin-bottom:2rem}
.mt-12{margin-top:3rem}
.space-y-4>*+*{margin-top:1rem}

/* Critical typography */
.text-center{text-align:center}
.text-4xl{font-size:2.25rem;line-height:2.5rem}
.text-xl{font-size:1.25rem;line-height:1.75rem}
.text-lg{font-size:1.125rem;line-height:1.75rem}
.font-bold{font-weight:700}
.font-semibold{font-weight:600}

/* Critical colors */
.bg-white{background-color:#fff}
.bg-gradient-to-b{background:linear-gradient(to bottom,#f9fafb,#fff)}
.bg-gradient-to-br{background:linear-gradient(to bottom right,#002767,#bd0b31)}
.text-white{color:#fff}
.text-primary{color:#002767}
.text-secondary{color:#bd0b31}
.bg-opacity-90{opacity:0.9}

/* Critical form styles */
.rounded-lg{border-radius:0.5rem}
.border{border-width:1px}
.border-gray-300{border-color:#d1d5db}
.outline-none{outline:2px solid transparent;outline-offset:2px}
.focus\\:ring-2:focus{box-shadow:0 0 0 3px rgba(0,39,103,0.1)}
.focus\\:ring-primary:focus{box-shadow:0 0 0 3px rgba(0,39,103,0.1)}

/* Critical button styles */
.bg-secondary{background-color:#bd0b31}
.hover\\:bg-red-700:hover{background-color:#991b1b}
.transition-all{transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}

/* Critical styles for header */
.shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)}
header{position:sticky;top:0;z-index:50;background-color:rgba(255,255,255,0.95);backdrop-filter:blur(10px)}

/* Critical responsive */
@media (min-width:768px){
.md\\:text-5xl{font-size:3rem;line-height:1}
.md\\:text-6xl{font-size:3.75rem;line-height:1}
.md\\:flex{display:flex}
.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (min-width:1024px){
.lg\\:text-6xl{font-size:3.75rem;line-height:1}
}

/* Performance optimizations */
@media (prefers-reduced-motion:reduce){
*{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;scroll-behavior:auto !important}
}
`;