export default function decorate(block) {
  if (block.dataset.decorated) return;
  [...block.children].forEach((row) => {
    row.classList.add('blueprint-step');
    const [context, commands] = row.children;
    context?.classList.add('blueprint-context');
    commands?.classList.add('blueprint-command');
    if (!commands?.querySelector('pre')) return;
    const copy = block.ownerDocument.createElement('button');
    copy.type = 'button';
    copy.className = 'blueprint-copy';
    copy.textContent = 'Copy commands';
    copy.addEventListener('click', async () => {
      if (block.ownerDocument.documentElement.getAttribute('quick-edit') === 'true') return;
      try {
        await navigator.clipboard.writeText(commands.querySelector('pre').textContent);
        copy.textContent = 'Copied';
      } catch {
        copy.textContent = 'Select code to copy';
      }
    });
    commands.append(copy);
  });
  block.dataset.decorated = 'true';
}
