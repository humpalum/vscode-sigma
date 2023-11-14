

var SIGMACONVERTERCSS = `
/* Color Definitions */
:root {
    --sigma-blue: #00bbe6;
    --sigma-dark: #12141c;
  }
  
  ::selection {
    color: white;
    background: var(--sigma-blue);
  }
  
  .text-sigma-blue {
    color: var(--sigma-blue);
  }
  
  .bg-sigma-blue {
    background-color: var(--sigma-blue);
  }
  
  .border-sigma-blue {
    border-style: solid;
    border-color: var(--sigma-blue);
    border-width: 1px;
  }
  
  .text-sigma-dark {
    color: var(--sigma-dark);
  }
  
  .bg-sigma-dark {
    background-color: var(--sigma-dark);
  }
  
  .border-sigma-dark {
    border-width: 1px;
    border-style: solid;
    border-color: var(--sigma-dark);
  }
  
  /* Code Area CSS */
  pre:has(> #rule-code),
  pre:has(> #pipeline-code),
  pre:has(> #query-code) {
    /* min-height: 200px; */
    cursor: text;
    padding: 8px;
  }
  
  pre:has(> #rule-code:empty)::after {
    content: "start writing your sigma rule...";
    color: #c5c8c6;
    width: 20px;
  }
  
  pre:has(> #pipeline-code:empty)::after {
    content: "start writing your post processing pipeline...";
    color: #c5c8c6;
    width: 20px;
  }
  
  div[class*="language-"],
  code[class*="language-"],
  code[class*="language-"] *,
  pre[class*="language-"] {
    word-break: break-word !important;
    white-space: pre-line !important;
  }
  
  :not(pre) > code[class*="language-"],
  pre[class*="language-"] {
    background-color: var(--sigma-dark) !important;
  }
  
  div[class*="language-"]::selection,
  div[class*="language-"] span::selection,
  code[class*="language-"]::selection,
  code[class*="language-"] span::selection {
    background: var(--sigma-blue);
    color: var(--sigma-dark);
  }
  
  .token.atrule,
  .token.attr-value,
  .token.function,
  .token.property,
  .token.keyword,
  .token.string {
    color: var(--sigma-blue) !important;
  }
  
  .token.attr-name,
  .token.builtin,
  .token.char,
  .token.inserted,
  .token.selector,
  .token.string {
    color: white !important;
  }
  
  /* tom-select css override */
  .select-sigma > .ts-control,
  .select-sigma > .ts-control input {
    color: white;
    background-color: var(--sigma-dark) !important;
    border-color: var(--sigma-blue) !important;
  }
  
  .select-sigma > .ts-dropdown [data-selectable].option {
    color: var(--sigma-blue);
    background-color: var(--sigma-dark);
  }
  
  .select-sigma > .ts-dropdown [data-selectable].option.active {
    color: white;
    background-color: var(--sigma-blue);
  }
  
  .select-sigma input[type="checkbox"] {
    background-color: var(--sigma-dark);
  }
  
  .select-sigma input[type="checkbox"]:checked {
    background-color: var(--sigma-blue);
    border-color: var(--sigma-dark);
  }
  
  .select-sigma.ts-wrapper.multi .ts-control > div {
    color: white;
    background-color: var(--sigma-dark);
    border: 1px solid var(--sigma-blue);
    border-radius: 2px;
  }
  
  .select-sigma > .ts-dropdown,
  .select-sigma.ts-wrapper.plugin-remove_button:not(.rtl) .item .remove {
    border-color: var(--sigma-blue);
  }
`

export var SIGMACONVERTERHEAD= `
<head>
  <!-- PrismJS -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.28.0/prism.min.js" integrity="sha512-RDQSW3KoqJMiX0L/UBgwBmH1EmRYp8LBOiLaA8rBHIy+7OGP/7Gxg8vbt8wG4ZYd29P0Fnoq6+LOytCqx3cyoQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.28.0/components/prism-yaml.min.js" integrity="sha512-6O/PZimM3TD1NN3yrazePA4AbZrPcwt1QCGJrVY7WoHDJROZFc9TlBvIKMe+QfqgcslW4lQeBzNJEJvIMC8WhA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.28.0/components/prism-splunk-spl.min.js" integrity="sha512-RLhcqVEXOdbZPCJ8YG5fZDRIK3nXiS6erMtnzLyaKzS17H7mRi/9a1o+s2TM2XlWk4Nk7E579LyL63R7nUlrgQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.28.0/components/prism-bash.min.js" integrity="sha512-ZqfG//sXQwAA7DOArFJyMmZQ3knKe+0ft3tPQZPvDPJR04IatmhVO5pTazVV+fLVDYSy28PhoBeUj5wxGRiGAA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  
  <style>
    ${SIGMACONVERTERCSS}
  </style>
</head>
`
