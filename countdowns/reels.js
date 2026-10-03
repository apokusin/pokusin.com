// A clipped strip of digits, shared by the paper clock and the console texture.
export function reelPlan(from, to, { spin = false, direction = -1, index = 0 } = {}) {
  const cells = [String(from)];
  if (spin) {
    const distance = ((Number(to) - Number(from)) * direction + 10) % 10;
    for (let step = 1; step <= 10 + distance; step++) {
      cells.push(String((Number(from) + direction * step + 30) % 10));
    }
  } else cells.push(String(to));
  if (direction < 0) cells.reverse();
  return {
    cells, from: direction < 0 ? cells.length - 1 : 0,
    to: direction < 0 ? 0 : cells.length - 1,
    duration: spin ? 1080 : 420, delay: index * (spin ? 45 : 18)
  };
}

export function reelPosition(plan, elapsed) {
  const progress = Math.max(0, Math.min(1, (elapsed - plan.delay) / plan.duration));
  return plan.from + (plan.to - plan.from) * (1 - Math.pow(1 - progress, 4));
}

export class NumberReel {
  constructor(node, { enabled, reducedMotion, direction = -1 }) {
    this.node = node; this.enabled = enabled; this.reducedMotion = reducedMotion;
    this.direction = direction; this.animations = []; this.generation = 0;
    node.classList.add('number-reel');
    reducedMotion.addEventListener('change', () => this.set(this.queued ?? this.value, { immediate: true }));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.set(this.queued ?? this.value, { immediate: true });
    });
  }

  set(text, { spin = false, immediate = false, index = 0 } = {}) {
    if (text === undefined) return;
    text = String(text);
    // Keep the reset spin intact; the next real tick waits for the reels to land.
    if (this.spinning && !spin && !immediate && !this.reducedMotion.matches && this.enabled()) {
      this.queued = text; return;
    }
    if (text === this.value && !spin && !immediate) return;
    const previous = this.value;
    const motion = previous !== undefined && !immediate && !this.reducedMotion.matches && this.enabled();
    const generation = ++this.generation;
    this.animations.forEach(animation => animation.cancel()); this.animations = [];
    this.spinning = motion && spin; this.queued = undefined; this.value = text;
    this.node.dataset.reelValue = text;
    this.node.replaceChildren();
    const readable = document.createElement('span'); readable.className = 'sr-only'; readable.textContent = text;
    this.node.append(readable);
    // Align from the right, so a new digit in the tally never displaces the old ones.
    const old = previous?.slice(-text.length).padStart(text.length, '0') ?? text;
    let digitIndex = index;
    [...text].forEach((char, i) => {
      const column = document.createElement('span'); column.setAttribute('aria-hidden', 'true');
      if (!/\d/.test(char)) {
        column.textContent = char; this.node.append(column); return;
      }
      column.className = 'digit-slot';
      const strip = document.createElement('span'); strip.className = 'digit-strip';
      column.append(strip); this.node.append(column);
      const moving = motion && (spin || old[i] !== char);
      if (!moving) { strip.textContent = char; digitIndex++; return; }
      const plan = reelPlan(old[i] ?? '0', char, { spin, direction: spin ? 1 : this.direction, index: digitIndex++ });
      plan.cells.forEach(value => {
        const cell = document.createElement('span'); cell.className = 'digit-cell'; cell.textContent = value; strip.append(cell);
      });
      const translate = position => `translateY(calc(var(--reel-cell) * ${-position}))`;
      const animation = strip.animate([
        { transform: translate(plan.from) }, { transform: translate(plan.to) }
      ], { duration: plan.duration, delay: plan.delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
      this.animations.push(animation);
      animation.finished.then(() => {
        if (generation !== this.generation) return;
        strip.replaceChildren(); strip.textContent = char; animation.cancel();
      }).catch(() => {});
    });
    Promise.all(this.animations.map(animation => animation.finished.catch(() => {}))).then(() => {
      if (generation !== this.generation) return;
      this.spinning = false; this.animations = [];
      if (this.queued !== undefined) this.set(this.queued);
    });
  }
}
