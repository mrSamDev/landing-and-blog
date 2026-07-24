import type { AstroIntegration } from 'astro';
import { createRequire } from 'node:module';

// createRequire needs a file URL in ESM context — use import.meta.url
const _require = createRequire(import.meta.url);

type MermaidOptions = {
    /** Default mermaid theme ('default' | 'dark' | 'forest' | 'neutral') */
    theme?: string;
    /** Auto-switch between light/dark based on the `dark` class on <html> */
    autoTheme?: boolean;
    /** Additional mermaid config passed to mermaid.initialize() */
    mermaidConfig?: Record<string, unknown>;
};

/* -------------------------------------------------------------------------- */
/* CSS injected into every page                                              */
/* -------------------------------------------------------------------------- */

const MERMAID_CSS = `
pre.mermaid {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin: 2rem 0 !important;
    padding: 1rem !important;
    background: transparent !important;
    background-color: transparent !important;
    border: none !important;
    overflow: auto !important;
    visibility: hidden !important;
}
pre.mermaid[data-processed] {
    background: transparent !important;
    background-color: transparent !important;
    visibility: visible !important;
}
pre.mermaid svg {
    max-width: 100% !important;
    height: auto !important;
}
html.dark pre.mermaid[data-processed] {
    background: transparent !important;
    background-color: transparent !important;
    border-radius: 0.5rem !important;
}
html:not(.dark) pre.mermaid[data-processed] {
    background: transparent !important;
    background-color: transparent !important;
    border-radius: 0.5rem !important;
}
`;

/* -------------------------------------------------------------------------- */
/* Client-side rendering script builder                                      */
/* -------------------------------------------------------------------------- */

function buildClientScript(opts: {
    theme: string;
    autoTheme: boolean;
    mermaidConfig: Record<string, unknown>;
}): string {
    const configJson = JSON.stringify({
        startOnLoad: false,
        theme: opts.theme,
        ...opts.mermaidConfig,
    });

    // The theme observer block is only included when autoTheme is true.
    // A debounce prevents race conditions when the 'dark' class toggles
    // rapidly (e.g. during View Transitions the class is removed by the DOM
    // swap, then re-added by the ThemeToggle — both within the same tick).
    const themeObserverBlock = opts.autoTheme
        ? `
  var renderTimer = null;
  var lastTheme = getCurrentTheme();
  function scheduleRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(function () {
      renderTimer = null;
      var nowTheme = getCurrentTheme();
      if (nowTheme === lastTheme) return;
      lastTheme = nowTheme;
      document.querySelectorAll('pre.mermaid[data-processed]').forEach(function (d) {
        d.removeAttribute('data-processed');
      });
      initMermaid();
    }, 50);
  }
  var themeObserver = new MutationObserver(scheduleRender);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });`
        : '';

    return `
(function () {
  var mermaidPromise = null;
  var defaultConfig = ${configJson};

  function loadMermaid() {
    if (mermaidPromise) return mermaidPromise;
    mermaidPromise = import('mermaid').then(function (m) { return m.default; });
    return mermaidPromise;
  }

  function getCurrentTheme() {
    ${opts.autoTheme ? "var saved = null; try { saved = localStorage.getItem('theme'); } catch (e) {} if (saved === 'dark') return 'dark'; if (saved === 'light') return 'default'; return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default';" : "return defaultConfig.theme;"}
  }

  function initMermaid() {
    var diagrams = document.querySelectorAll('pre.mermaid');
    if (diagrams.length === 0) return;

    loadMermaid().then(function (mermaid) {
      var currentTheme = getCurrentTheme();
      mermaid.initialize(Object.assign({}, defaultConfig, {
        theme: currentTheme,
        themeVariables: { background: 'transparent' },
        gitGraph: {
          mainBranchName: 'main',
          showCommitLabel: true,
          showBranches: true,
          rotateCommitLabel: true
        }
      }));

      diagrams.forEach(function (diagram) {
        if (diagram.hasAttribute('data-processed')) return;
        if (!diagram.hasAttribute('data-diagram')) {
          diagram.setAttribute('data-diagram', diagram.textContent || '');
        }
        var definition = diagram.getAttribute('data-diagram') || '';
        var id = 'mermaid-' + Math.random().toString(36).slice(2, 11);

        mermaid.render(id, definition).then(function (result) {
          diagram.innerHTML = result.svg;
          var svg = diagram.querySelector('svg');
          if (svg) svg.style.setProperty('background', 'transparent', 'important');
          diagram.setAttribute('data-processed', 'true');
        }).catch(function (error) {
          console.error('[mermaid] Render error for', id, error);
          var div = document.createElement('div');
          div.style.cssText = 'color:red;padding:1rem;border:1px solid red;border-radius:0.5rem';
          var strong = document.createElement('strong');
          strong.textContent = 'Error rendering diagram:';
          var span = document.createElement('span');
          span.textContent = ' ' + (error.message || 'Unknown error');
          div.appendChild(strong);
          div.appendChild(span);
          diagram.textContent = '';
          diagram.appendChild(div);
          diagram.setAttribute('data-processed', 'true');
        });
      });
    }).catch(function (error) {
      console.error('[mermaid] Failed to load:', error);
    });
  }

  if (document.querySelectorAll('pre.mermaid').length > 0) {
    initMermaid();
  }
${themeObserverBlock}

  // Use 'astro:page-load' (not 'astro:after-swap') so the theme is already
  // synced by ThemeToggle before we read it.  'astro:page-load' fires after
  // all post-swap work is done, including theme restoration.
  // Also re-inject CSS on each page load because View Transitions replace
  // the <head>, removing our injected <style> element.
  function injectMermaidCSS() {
    if (document.getElementById('mermaid-css')) return;
    var s = document.createElement('style');
    s.id = 'mermaid-css';
    s.textContent = ${JSON.stringify(MERMAID_CSS)};
    document.head.appendChild(s);
  }
  injectMermaidCSS();
  document.addEventListener('astro:page-load', function () {
    injectMermaidCSS();
    if (document.querySelectorAll('pre.mermaid').length > 0) {
      initMermaid();
    }
  });
})();
`;
}

/* -------------------------------------------------------------------------- */
/* Sätteri hast plugin (Astro 7)                                             */
/*                                                                            */
/* The astro-mermaid package uses a Sätteri mdast plugin that returns        */
/* `{ type: 'html' }` nodes. In Sätteri's MDX pipeline these are rendered as   */
/* escaped text, not raw HTML — so <pre class="mermaid"> ends up as           */
/* &lt;pre class=&quot;mermaid&quot;&gt; in the output.                        */
/*                                                                            */
/* This plugin operates one stage later, at the hast level. After Sätteri     */
/* converts the mdast `code` node to a <pre><code class="language-mermaid">   */
/* element, we swap it for <pre class="mermaid"> with the raw diagram text.  */
/* `mermaid` must also be excluded from syntax highlighting (done in the     */
/* integration setup) so the built-in Shiki highlighter doesn't transform     */
/* the code block before this plugin sees it.                                 */
/* -------------------------------------------------------------------------- */

function mermaidHastPlugin(logger?: any) {
    return {
        name: 'mermaid-hast',
        element: {
            filter: ['pre'],
            visit(node: any, ctx: any) {
                const codeChild = node.children?.find(
                    (c: any) => c.type === 'element' && c.tagName === 'code',
                );
                if (!codeChild || codeChild.type !== 'element') return;

                const lang = codeChild.data?.lang;
                const className = codeChild.properties?.className;
                const isMermaid =
                    lang === 'mermaid' ||
                    (Array.isArray(className) && className.includes('language-mermaid'));
                if (!isMermaid) return;

                const diagramSource = ctx.textContent(codeChild).replace(/\n$/, '');

                if (logger) {
                    logger.info(
                        `Mermaid hast transformed block in ${ctx.fileURL?.pathname || 'unknown file'}`,
                    );
                }

                return {
                    type: 'element',
                    tagName: 'pre',
                    properties: { className: ['mermaid'] },
                    children: [{ type: 'text', value: diagramSource }],
                };
            },
        },
    };
}

/* -------------------------------------------------------------------------- */
/* Remark plugin (Astro < 7 fallback)                                         */
/* -------------------------------------------------------------------------- */

function remarkMermaidPlugin(logger?: any) {
    return async function transformer(tree: any, _file: any) {
        const { visit } = await import('unist-util-visit');
        let count = 0;
        visit(tree, 'code', (node: any, index: any, parent: any) => {
            if (node.lang === 'mermaid' && parent && typeof index === 'number') {
                count++;
                parent.children[index] = {
                    type: 'html',
                    value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>`,
                };
            }
        });
        if (count > 0 && logger) logger.info(`Remark transformed ${count} mermaid blocks`);
    };
}

/* -------------------------------------------------------------------------- */
/* Rehype plugin (Astro < 7 fallback)                                         */
/* -------------------------------------------------------------------------- */

function rehypeMermaidPlugin(logger?: any) {
    return async function transformer(tree: any, _file: any) {
        const { visit } = await import('unist-util-visit');
        let count = 0;
        visit(tree, 'element', (node: any) => {
            if (
                node.tagName === 'pre' &&
                node.children?.length === 1 &&
                node.children[0].tagName === 'code'
            ) {
                const codeNode = node.children[0];
                const className = codeNode.properties?.className;
                if (Array.isArray(className) && className.includes('language-mermaid')) {
                    count++;
                    const diagramContent = serializeHastChildren(codeNode.children || []);
                    node.properties = { ...node.properties, className: ['mermaid'] };
                    node.children = [{ type: 'text', value: escapeHtml(diagramContent) }];
                }
            }
        });
        if (count > 0 && logger) logger.info(`Rehype transformed ${count} mermaid blocks`);
    };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return char;
        }
    });
}

const ALLOWED_TAGS = new Set([
    'b', 'i', 'u', 'em', 'strong', 'br', 'hr', 'sub', 'sup', 'span', 'div',
    'code', 'pre', 'img', 'a', 'p', 'ul', 'ol', 'li',
]);

function serializeHastChildren(children: any[]): string {
    let result = '';
    for (const child of children) {
        if (child.type === 'text') {
            result += child.value;
        } else if (child.type === 'element') {
            const tag = child.tagName;
            if (!ALLOWED_TAGS.has(tag)) {
                if (child.children?.length) result += serializeHastChildren(child.children);
                continue;
            }
            const selfClosing = ['br', 'hr', 'img'].includes(tag);
            result += `<${tag}`;
            if (child.properties) {
                for (const [key, value] of Object.entries(child.properties)) {
                    if (key === 'className' && Array.isArray(value)) {
                        result += ` class="${value.join(' ')}"`;
                    } else if (key !== 'className') {
                        result += ` ${key}="${String(value)}"`;
                    }
                }
            }
            result += selfClosing
                ? '/>'
                : `>${child.children?.length ? serializeHastChildren(child.children) : ''}</${tag}>`;
        }
    }
    return result;
}

/* -------------------------------------------------------------------------- */
/* Integration                                                                */
/* -------------------------------------------------------------------------- */

export default function mermaid(options: MermaidOptions = {}): AstroIntegration {
    const { theme = 'dark', autoTheme = true, mermaidConfig = {} } = options;

    return {
        name: 'mermaid',
        hooks: {
            'astro:config:setup': async ({ config, updateConfig, injectScript, logger }) => {
                logger.info('Setting up Mermaid integration');

                const existingProcessor = config.markdown?.processor;
                let usedProcessor = false;

                /* --- Sätteri (Astro 7 default) --- */
                if (existingProcessor?.name === 'satteri') {
                    try {
                        const { satteri, isSatteriProcessor } = _require('@astrojs/markdown-satteri');
                        if (isSatteriProcessor(existingProcessor)) {
                            const existingOptions: any = existingProcessor.options || {};

                            // Exclude mermaid from syntax highlighting so the
                            // built-in highlight plugin doesn't transform the
                            // <pre><code> before our hast plugin runs.
                            const existingSH = config.markdown?.syntaxHighlight as any;
                            let updatedSH: Record<string, unknown> | undefined;

                            if (existingSH === false) {
                                // highlighting disabled — no change needed
                            } else if (typeof existingSH === 'string') {
                                updatedSH = {
                                    type: existingSH,
                                    excludeLangs: ['math', 'mermaid'],
                                };
                            } else if (existingSH && typeof existingSH === 'object') {
                                const excludes = existingSH.excludeLangs || ['math'];
                                if (!excludes.includes('mermaid')) {
                                    updatedSH = {
                                        ...existingSH,
                                        excludeLangs: [...excludes, 'mermaid'],
                                    };
                                }
                            } else {
                                updatedSH = { type: 'shiki', excludeLangs: ['math', 'mermaid'] };
                            }

                            const markdownUpdate: Record<string, unknown> = {
                                processor: satteri({
                                    ...existingOptions,
                                    hastPlugins: [
                                        ...(existingOptions.hastPlugins || []),
                                        mermaidHastPlugin(logger),
                                    ],
                                }),
                            };
                            if (updatedSH) markdownUpdate.syntaxHighlight = updatedSH;

                            updateConfig({ markdown: markdownUpdate });
                            usedProcessor = true;
                        }
                    } catch (error) {
                        logger.warn(
                            `Could not configure Sätteri processor: ${error instanceof Error ? error.message : error}`,
                        );
                    }
                }

                /* --- Unified / remark (Astro < 7 fallback) --- */
                if (!usedProcessor) {
                    try {
                        const { unified, isUnifiedProcessor } = _require('@astrojs/markdown-remark');
                        if (existingProcessor && isUnifiedProcessor(existingProcessor)) {
                            const existingOptions: any = existingProcessor.options || {};
                            updateConfig({
                                markdown: {
                                    processor: unified({
                                        ...existingOptions,
                                        remarkPlugins: [
                                            ...(existingOptions.remarkPlugins || []),
                                            [remarkMermaidPlugin, { logger }],
                                        ],
                                        rehypePlugins: [
                                            ...(existingOptions.rehypePlugins || []),
                                            [rehypeMermaidPlugin, { logger }],
                                        ],
                                    }),
                                },
                            });
                            usedProcessor = true;
                        }
                    } catch {
                        // fall through to legacy arrays
                    }
                }

                if (!usedProcessor) {
                    updateConfig({
                        markdown: {
                            remarkPlugins: [
                                ...(config.markdown?.remarkPlugins || []),
                                [remarkMermaidPlugin, { logger }],
                            ],
                            rehypePlugins: [
                                ...(config.markdown?.rehypePlugins || []),
                                [rehypeMermaidPlugin, { logger }],
                            ],
                        },
                    });
                }

                /* --- Preload mermaid to reduce dynamic import delay --- */
                updateConfig({
                    vite: {
                        optimizeDeps: {
                            include: ['mermaid'],
                        },
                    },
                });

                /* --- Client-side script (includes CSS injection) --- */
                injectScript('page', buildClientScript({ theme, autoTheme, mermaidConfig }));
            },
        },
    };
}