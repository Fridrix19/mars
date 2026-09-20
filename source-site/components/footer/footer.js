document.addEventListener('DOMContentLoaded', async () => {
  const footerTarget = document.querySelector('[data-footer-mount]') || document.querySelector('footer[data-component="footer"]');
  if (!footerTarget) return;

  const head = document.head || document.querySelector('head');
  const resolveBasePrefix = () => {
    const metaBase = document.querySelector('meta[name="base-path"]')?.getAttribute('content') || '';
    if (metaBase) return metaBase;

    const currentPath = window.location.pathname || '/';
    const parts = currentPath.split('/').filter(Boolean);
    const depth = Math.max(0, parts.length - 1);
    return depth ? '../'.repeat(depth) : '';
  };

  const basePrefix = resolveBasePrefix();

  const normalizeUrl = (value) => {
    if (!value) return value;
    if (/^(?:[a-z]+:|#|\/\/)/i.test(value)) return value;
    if (value.startsWith('/')) return value;
    if (value.startsWith(basePrefix)) return value;
    return `${basePrefix}${value.replace(/^\.\//, '')}`;
  };

  const ensureBaseMeta = () => {
    if (!head) return;
    let meta = document.querySelector('meta[name="base-path"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'base-path';
      head.prepend(meta);
    }
    meta.setAttribute('content', basePrefix);
  };

  ensureBaseMeta();

  try {
    const response = await fetch(`${basePrefix}components/footer/footer.html`, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Footer load failed');

    const wrapper = document.createElement('div');
    wrapper.innerHTML = (await response.text()).trim();
    const footer = wrapper.firstElementChild;
    if (!footer) throw new Error('Footer template empty');

    footer.querySelectorAll('[href]').forEach((el) => {
      el.setAttribute('href', normalizeUrl(el.getAttribute('href')));
    });
    footer.querySelectorAll('[src]').forEach((el) => {
      el.setAttribute('src', normalizeUrl(el.getAttribute('src')));
    });

    footerTarget.replaceWith(footer);
  } catch (error) {
    console.error(error);
  }
});
