registerPaint('highlighter', class {
  static get inputProperties () {
    return [
      'border-image-source',
      '--highlighter-progress',
      '--highlighter-color',
      '--highlighter-opacity',
      '--highlighter-path',
      '--highlighter-size',
      '--highlighter-smooth',
      '--highlighter-easing',
    ]
  }
  paint (ctx, geom, props) {

    const { width, height } = geom;

    const img = props.get('border-image-source');
    const color = props.get('--highlighter-color').toString();
    const opacity = props.get('--highlighter-opacity').toString();
    let progress = props.get('--highlighter-progress').toString();
    const paintSize = props.get('--highlighter-size').toString();
    const smooth = (props.get('--highlighter-smooth') || 1).toString();
    const paths = props.get('--highlighter-path').toString().split(/,?\s*path\(/);

    let bezierCurves = [];
    for (let i = 1; i < paths.length; i++) {
      const path = paths[i].replace(')', '');
      // get points from SVG path
      let pts = pathDataToBezier(path);
      bezierCurves.push({ points: [ pts[0] ] });
      for (let j = 1; j < pts.length; j += 3) {
        bezierCurves.push({ points: [ pts[j], pts[j + 1], pts[j + 2] ] })
      }
    }

    let beziers = [];
    let bbox = {};
    let ptStart;
    for (let i = 0; i < bezierCurves.length; i++) {
      if (bezierCurves[i].points.length === 1) {
        // start new Bezier
        ptStart = bezierCurves[i].points[0];
        continue;
      }
      if (bezierCurves[i - 1].points.length > 1) {
        ptStart = bezierCurves[i - 1].points[2];
      }
      const bz = new Bezier(
        ptStart.x,
        ptStart.y,
        bezierCurves[i].points[0].x,
        bezierCurves[i].points[0].y,
        bezierCurves[i].points[1].x,
        bezierCurves[i].points[1].y,
        bezierCurves[i].points[2].x,
        bezierCurves[i].points[2].y
      );
      const bzbbox = bz.bbox();
      if (!bbox.min) {
        bbox.min = {
          x: bzbbox.x.min,
          y: bzbbox.y.min
        };
        bbox.max = {
          x: bzbbox.x.max,
          y: bzbbox.y.max
        };
      } else {
        if (bzbbox.x.min < bbox.min.x) {
          bbox.min.x = bzbbox.x.min;
        }
        if (bzbbox.x.max > bbox.max.x) {
          bbox.max.x = bzbbox.x.max;
        }
        if (bzbbox.y.min < bbox.min.y) {
          bbox.min.y = bzbbox.y.min;
        }
        if (bzbbox.y.max > bbox.max.y) {
          bbox.max.y = bzbbox.y.max;
        }
      }
      beziers.push(bz);
    }

    // HOTFIX for Canary
    // CSSImageValue no longer contains intrinsicWidth/intrinsicHeight
    if (!img.intrinsicWidth) {
      const splitUrl = img.toString().split('/');
      const pen = splitUrl[splitUrl.length - 1].replace('.png")', '');
      const intrinsicSizes = {
        highlighter: [38, 59],
        gelpen: [21, 21],
        pencil: [11, 10]
      };
      img.intrinsicWidth = intrinsicSizes[pen][0];
      img.intrinsicHeight = intrinsicSizes[pen][1];
    }

    // set intrinsicWidth/height for image
    let { intrinsicWidth, intrinsicHeight } = img;
    const intrinsicSize = Math.max(intrinsicWidth, intrinsicHeight);
    const intrinsicSizeRatio = intrinsicSize / paintSize;
    intrinsicWidth *= (bbox.max.x - bbox.min.x) / width;
    intrinsicHeight *= (bbox.max.x - bbox.min.x) / width;
    intrinsicWidth /= intrinsicSizeRatio;
    intrinsicHeight /= intrinsicSizeRatio;
    // set bbox width/height/center
    bbox.max.x += intrinsicWidth;
    bbox.max.y += intrinsicHeight;
    bbox.width = Math.max(1, bbox.max.x - bbox.min.x);
    bbox.height = Math.max(1, bbox.max.y - bbox.min.y);
    bbox.c = {
      x: bbox.min.x + bbox.width / 2,
      y: bbox.min.y + bbox.height / 2
    };

    // bbox total
    let points = [];
    for (var i = 0; i < beziers.length; i++) {
      const bz = beziers[i];
      const size = Math.max(bbox.width, bbox.height);

      const lut = Math.max(25, bz.length() / size * smooth * 120);

      const addPoints = bz.getLUT(lut);
      // remove last point
      addPoints.pop();
      // concat all points
      points = points.concat(addPoints);
    }

    let actualPoint = Math.floor(progress * points.length);

    let scale = {
      x: (width) / (bbox.width),
      y: (height) / (bbox.height)
    };

    if (Math.abs(scale.x) < Math.abs(scale.y)) {
      scale = scale.x;
      ctx.translate(0, height/2 - bbox.height * scale / 2)
    } else {
      scale = scale.y;
      ctx.translate(width/2 - bbox.width * scale / 2, 0)
    }

    ctx.scale(scale, scale)
    ctx.translate(bbox.width/2 + -(bbox.c.x), bbox.height/2 + -(bbox.c.y))
    for (let i = 0; i < actualPoint; i++) {
      let pt = points[i];
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, pt.x, pt.y, intrinsicWidth, intrinsicHeight);

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = color;
      ctx.fillRect(bbox.min.x, bbox.min.y, bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y);
    }
  }
})
