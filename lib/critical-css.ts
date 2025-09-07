export const criticalCSS = `
/* Minimal critical CSS for above-the-fold content */
*,*::before,*::after{box-sizing:border-box}
*{margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{min-height:100vh;line-height:1.5;-webkit-font-smoothing:antialiased;font-family:var(--font-inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif)}
.font-sans{font-family:var(--font-inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif)}
img,picture,video,canvas,svg{display:block;max-width:100%}
input,button,textarea,select{font:inherit}
p,h1,h2,h3,h4,h5,h6{overflow-wrap:break-word}
button{cursor:pointer}

/* Essential layout for above-the-fold */
.min-h-screen{min-height:100vh}
.max-w-6xl{max-width:72rem}
.max-w-3xl{max-width:48rem}
.mx-auto{margin-left:auto;margin-right:auto}
.flex{display:flex}
.items-center{align-items:center}
.justify-between{justify-content:space-between}
.hidden{display:none}
.block{display:block}

/* Critical spacing */
.p-6{padding:1.5rem}
.px-4{padding-left:1rem;padding-right:1rem}
.py-3{padding-top:0.75rem;padding-bottom:0.75rem}
.py-4{padding-top:1rem;padding-bottom:1rem}
.pt-20{padding-top:5rem}
.pb-16{padding-bottom:4rem}
.mb-6{margin-bottom:1.5rem}
.mb-8{margin-bottom:2rem}

/* Critical typography */
.text-center{text-align:center}
.text-4xl{font-size:2.25rem;line-height:2.5rem}
.text-xl{font-size:1.25rem;line-height:1.75rem}
.font-bold{font-weight:700}

/* Critical colors */
.bg-white{background-color:#fff}
.bg-gradient-to-b{background:linear-gradient(to bottom,#f9fafb,#fff)}
.bg-gradient-to-br{background:linear-gradient(to bottom right,#002767,#bd0b31)}
.text-white{color:#fff}

/* Critical styles for header */
.rounded-lg{border-radius:0.5rem}
.shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)}
header{background-color:rgba(255,255,255,0.95);backdrop-filter:blur(10px)}

/* Critical responsive */
@media (min-width:768px){
.md\\:text-5xl{font-size:3rem;line-height:1}
.md\\:text-6xl{font-size:3.75rem;line-height:1}
.md\\:flex{display:flex}
}
@media (min-width:1024px){
.lg\\:text-6xl{font-size:3.75rem;line-height:1}
}
`;