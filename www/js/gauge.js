/**
 * SVG arc speedometer. 240° sweep starting at 150° (bottom-left) through
 * 390° (bottom-right). The gauge scale adapts to the configured limit and
 * a red marker shows where the limit sits on the arc.
 */

const CX = 100;
const CY = 95;
const R = 78;
const START_DEG = 150;
const SWEEP_DEG = 240;
const STROKE = 14;

function polar(deg, radius = R) {
    const rad = (deg * Math.PI) / 180;
    return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function arcPath(fromDeg, toDeg) {
    const from = polar(fromDeg);
    const to = polar(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

export class Gauge {
    constructor(svg) {
        this.svg = svg;
        this.maxValue = 120;
        this._build();
    }

    _build() {
        const ns = 'http://www.w3.org/2000/svg';
        this.svg.innerHTML = '';

        this.bg = document.createElementNS(ns, 'path');
        this.bg.setAttribute('class', 'arc-bg');
        this.bg.setAttribute('d', arcPath(START_DEG, START_DEG + SWEEP_DEG));
        this.bg.setAttribute('fill', 'none');
        this.bg.setAttribute('stroke-width', STROKE);
        this.bg.setAttribute('stroke-linecap', 'round');
        this.svg.appendChild(this.bg);

        this.value = document.createElementNS(ns, 'path');
        this.value.setAttribute('class', 'arc-value safe');
        this.value.setAttribute('fill', 'none');
        this.value.setAttribute('stroke-width', STROKE);
        this.value.setAttribute('stroke-linecap', 'round');
        this.svg.appendChild(this.value);

        this.marker = document.createElementNS(ns, 'line');
        this.marker.setAttribute('class', 'limit-marker');
        this.marker.setAttribute('stroke-width', 3);
        this.svg.appendChild(this.marker);

        this.minLabel = document.createElementNS(ns, 'text');
        this.minLabel.setAttribute('text-anchor', 'middle');
        this.minLabel.textContent = '0';
        this.svg.appendChild(this.minLabel);

        this.maxLabel = document.createElementNS(ns, 'text');
        this.maxLabel.setAttribute('text-anchor', 'middle');
        this.svg.appendChild(this.maxLabel);

        const lo = polar(START_DEG, R + STROKE / 2 + 8);
        this.minLabel.setAttribute('x', lo.x);
        this.minLabel.setAttribute('y', lo.y + 4);
        const hi = polar(START_DEG + SWEEP_DEG, R + STROKE / 2 + 8);
        this.maxLabel.setAttribute('x', hi.x);
        this.maxLabel.setAttribute('y', hi.y + 4);
    }

    /** limit & value in display units. */
    setLimit(limit) {
        // Scale tops out at ~1.5x the limit rounded up to a clean number.
        this.limit = limit;
        this.maxValue = Math.max(60, Math.ceil((limit * 1.5) / 20) * 20);
        this.maxLabel.textContent = String(Math.round(this.maxValue));

        const deg = START_DEG + SWEEP_DEG * Math.min(1, limit / this.maxValue);
        const inner = polar(deg, R - STROKE / 2 - 2);
        const outer = polar(deg, R + STROKE / 2 + 2);
        this.marker.setAttribute('x1', inner.x);
        this.marker.setAttribute('y1', inner.y);
        this.marker.setAttribute('x2', outer.x);
        this.marker.setAttribute('y2', outer.y);
    }

    setValue(value) {
        const frac = Math.min(1, Math.max(0, value / this.maxValue));
        if (frac <= 0.002) {
            this.value.setAttribute('d', '');
        } else {
            this.value.setAttribute('d', arcPath(START_DEG, START_DEG + SWEEP_DEG * frac));
        }
        let cls = 'safe';
        if (this.limit && value > this.limit) cls = 'danger';
        else if (this.limit && value > this.limit * 0.85) cls = 'warn';
        this.value.setAttribute('class', `arc-value ${cls}`);
    }
}
