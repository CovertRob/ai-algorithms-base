import * as PIXI from 'pixi.js';

/**
 * Color interpolation for contour visualization
 */
export const interpolateColor = (value, min, max, colorScale = 'viridis') => {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Viridis-like color scale (blue -> green -> yellow)
  if (colorScale === 'viridis') {
    const r = Math.floor(255 * Math.min(1, Math.max(0, 1.5 * t - 0.5)));
    const g = Math.floor(255 * Math.sin(Math.PI * t));
    const b = Math.floor(255 * (1 - t));
    return (r << 16) | (g << 8) | b;
  }

  // Cool to warm (blue -> white -> red)
  if (colorScale === 'coolwarm') {
    if (t < 0.5) {
      const s = t * 2;
      const r = Math.floor(255 * s);
      const g = Math.floor(255 * s);
      const b = 255;
      return (r << 16) | (g << 8) | b;
    } else {
      const s = (t - 0.5) * 2;
      const r = 255;
      const g = Math.floor(255 * (1 - s));
      const b = Math.floor(255 * (1 - s));
      return (r << 16) | (g << 8) | b;
    }
  }

  // Grayscale
  const gray = Math.floor(255 * (1 - t));
  return (gray << 16) | (gray << 8) | gray;
};

/**
 * Draw contour map of fitness function
 */
export const drawContourMap = (
  graphics,
  fitnessFunction,
  domain,
  width,
  height,
  resolution = 100
) => {
  graphics.clear();

  const [xMin, xMax] = domain;
  const [yMin, yMax] = domain;

  const xStep = width / resolution;
  const yStep = height / resolution;
  const domainXStep = (xMax - xMin) / resolution;
  const domainYStep = (yMax - yMin) / resolution;

  // Calculate fitness values and find min/max
  let minFitness = Infinity;
  let maxFitness = -Infinity;
  const fitnessGrid = [];

  for (let i = 0; i <= resolution; i++) {
    fitnessGrid[i] = [];
    for (let j = 0; j <= resolution; j++) {
      const x = xMin + i * domainXStep;
      const y = yMin + j * domainYStep;
      const fitness = fitnessFunction(x, y);
      fitnessGrid[i][j] = fitness;
      minFitness = Math.min(minFitness, fitness);
      maxFitness = Math.max(maxFitness, fitness);
    }
  }

  // Draw filled rectangles for each grid cell
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const fitness = fitnessGrid[i][j];
      const color = interpolateColor(fitness, minFitness, maxFitness, 'coolwarm');

      graphics.rect(i * xStep, j * yStep, xStep, yStep);
      graphics.fill({ color, alpha: 0.6 });
    }
  }

  return { minFitness, maxFitness };
};

/**
 * Convert domain coordinates to canvas coordinates
 */
export const domainToCanvas = (x, y, domain, width, height) => {
  const [min, max] = domain;
  const canvasX = ((x - min) / (max - min)) * width;
  const canvasY = ((y - min) / (max - min)) * height;
  return { x: canvasX, y: canvasY };
};

/**
 * Convert canvas coordinates to domain coordinates
 */
export const canvasToDomain = (canvasX, canvasY, domain, width, height) => {
  const [min, max] = domain;
  const x = (canvasX / width) * (max - min) + min;
  const y = (canvasY / height) * (max - min) + min;
  return { x, y };
};

/**
 * Draw a point (individual/particle) on canvas
 */
export const drawPoint = (graphics, x, y, color, radius = 5) => {
  graphics.circle(x, y, radius);
  graphics.fill({ color });
  graphics.circle(x, y, radius);
  graphics.stroke({ width: 2, color: 0x000000, alpha: 0.3 });
};

/**
 * Draw an arrow (for velocity, direction, etc.)
 */
export const drawArrow = (graphics, x1, y1, x2, y2, color, width = 2) => {
  // Draw line
  graphics.moveTo(x1, y1);
  graphics.lineTo(x2, y2);
  graphics.stroke({ width, color });

  // Draw arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLength = 8;
  const arrowAngle = Math.PI / 6;

  const x3 = x2 - arrowLength * Math.cos(angle - arrowAngle);
  const y3 = y2 - arrowLength * Math.sin(angle - arrowAngle);
  const x4 = x2 - arrowLength * Math.cos(angle + arrowAngle);
  const y4 = y2 - arrowLength * Math.sin(angle + arrowAngle);

  graphics.moveTo(x2, y2);
  graphics.lineTo(x3, y3);
  graphics.moveTo(x2, y2);
  graphics.lineTo(x4, y4);
  graphics.stroke({ width, color });
};

/**
 * Draw an ellipse (for covariance visualization)
 */
export const drawEllipse = (
  graphics,
  centerX,
  centerY,
  width,
  height,
  rotation,
  color,
  alpha = 0.3
) => {
  graphics.ellipse(centerX, centerY, width, height);
  graphics.stroke({ width: 2, color, alpha });
  graphics.fill({ color, alpha: alpha * 0.3 });
};

/**
 * Draw a trail (for particle history)
 */
export const drawTrail = (graphics, points, color, width = 1, alpha = 0.5) => {
  if (points.length < 2) return;

  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.stroke({ width, color, alpha });
};

/**
 * Create text label
 */
export const createTextLabel = (text, x, y, style = {}) => {
  const defaultStyle = {
    fontFamily: 'Arial',
    fontSize: 12,
    fill: 0x000000,
    align: 'center',
    ...style,
  };

  const label = new PIXI.Text({
    text,
    style: defaultStyle,
  });

  label.x = x;
  label.y = y;
  label.anchor.set(0.5);

  return label;
};

/**
 * Clear and reset graphics object
 */
export const clearGraphics = (graphics) => {
  graphics.clear();
};
