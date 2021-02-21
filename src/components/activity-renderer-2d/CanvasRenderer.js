import { getPosNeg, TWO_PI, } from '../../services/Math.js';

const jitter = magnitude => getPosNeg() * magnitude * Math.random();

const alphaFloatToHex = (num = 0) => {
  const hexValue = Math.floor(num * 255).toString(16);
  if (hexValue.length < 2) {
    return `0${hexValue}`;
  }
  return hexValue;
};

const calculateAdjustedPoint = (point, width, height, jitterParam) => {
  if (jitterParam.value) {
    return {
      lat: point.lat * height + jitter(jitterParam.value),
      lon: point.lon * width + jitter(jitterParam.value),
    };
  } else {
    return {
      lat: point.lat * height,
      lon: point.lon * width,
    };
  }
};

export default function renderCanvas({ ctx, renderOptions, activities, width, height, }) {
  const fillAlphaHex = alphaFloatToHex(renderOptions.fillAlpha.value);
  const fillStyle = `${renderOptions.fillColor.value}${fillAlphaHex}`;
  const strokeAlphaHex = alphaFloatToHex(renderOptions.strokeAlpha.value);  
  const strokeStyle = `${renderOptions.strokeColor.value}${strokeAlphaHex}`;
  const shadowAlphaHex = alphaFloatToHex(renderOptions.shadowAlpha.value);  
  const shadowStyle = `${renderOptions.shadowColor.value}${shadowAlphaHex}`;
  if (renderOptions.canvasColor.value) {
    ctx.fillStyle = renderOptions.canvasColor.value;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = renderOptions.strokeWidth.value;
  ctx.shadowColor = shadowStyle;
  ctx.shadowBlur = renderOptions.shadowSpread.value;

  if (renderOptions.renderPoint.value) {
    activities.forEach(activity => {
      ctx.beginPath();
      activity.points
        .forEach((point) => {
          const { lat, lon, } = calculateAdjustedPoint(point, width, height, renderOptions.jitter);
          ctx.moveTo(lon, lat);
          ctx.arc(lon, lat, renderOptions.radius.value, 0, TWO_PI);
        });
      ctx.fill();
    });
  }

  if (renderOptions.renderLine.value) {
    activities.forEach(activity => {
      if (renderOptions.shadowSpread.value) {
        const spread = renderOptions.shadowSpread.value + jitter(10);
        const shadowBlur = Math.max(spread, renderOptions.shadowSpread.value);
        ctx.shadowBlur = shadowBlur;
      }
      ctx.beginPath();
      activity.points.forEach((point, index) => {
        const { lat, lon, } = calculateAdjustedPoint(point, width, height, renderOptions.jitter);
        if (index === 0) {
          ctx.moveTo(lon, lat);
        } else {
          ctx.lineTo(lon, lat);
        }
      });
      ctx.stroke();
    });
  }
}

