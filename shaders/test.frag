#ifdef GL_ES
precision mediump float;
#endif

const float PI = 3.1415926535;

uniform vec2 u_resolution;
uniform float u_time;

float circleshape(vec2 position, float radius) {
  return step(radius, length(position - vec2(0.5)));
}

float rectshape(vec2 position, vec2 scale) {
  scale = vec2(0.5) - scale * 0.5;
  vec2 shaper = vec2(step(scale.x, position.x), step(scale.y, position.y));
  shaper *= vec2(step(scale.x, 1.0 - position.x), step(scale.y, 1.0 - position.y));
  return shaper.x * shaper.y;
}

float polygonShape(vec2 position, float radius, float sides) {
  position = position * 2.0 - 1.0;
  float angle = atan(position.x, position.y);
  float slice = PI * 2.0 / sides;
  return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}

mat2 scale(vec2 scale) {
  return mat2(scale.x, 0.0, 0.0, scale.y);
}

mat2 rotate(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {
  
  vec2 coord = gl_FragCoord.xy / u_resolution;

  vec3 color = vec3(0.0);
  
  // TRANSLATE
  // vec2 translate = vec2(sin(u_time / 5.0), cos(u_time / 5.0));
  // coord += translate * 0.5;

  // SCALE
  // coord -= vec2(0.5);
  // coord = scale(vec2(sin(u_time) + 2.0)) * coord;
  // coord += vec2(0.5);

  // ROTATE
  coord -= vec2(0.5);
  coord = rotate(0.2) * coord;
  coord += vec2(0.5);

  
  float circle = circleshape(coord, 0.2);  
  float rect = rectshape(coord, vec2(0.3, 0.3));
  float polygon = polygonShape(coord, 0.4, 8.0);

  // color += vec3(circle);
  color += vec3(rect);
  // color = vec3(polygon);

  gl_FragColor = vec4(color, 1.0);
}

void _main() {
  float time = u_time * 1.0;
  vec2 uv = (gl_FragCoord.xy / u_resolution.xx - 0.5) * 8.0;
  vec2 uv0 = uv;
  float i0 = 1.0;
  float i1 = 1.0;
  float i2 = 1.0;
  float i4 = 0.0;
  for (int s = 0; s < 7; s++) {
    vec2 r;
    r = vec2(cos(uv.y * i0 - i4 + time / i1), sin(uv.x * i0 - i4 + time / i1)) / i2;
    r += vec2(-r.y, r.x) * 0.3;
    uv.xy += r;

    i0 *= 1.93;
    i1 *= 1.15;
    i2 *= 1.7;
    i4 += 0.05 + 0.1 * time * i1;
  }
  float r = sin(uv.x - time) * 0.5 + 0.5;
  float b = sin(uv.y + time) * 0.5 + 0.5;
  float g = sin((uv.x + uv.y + sin(time * 0.5)) * 0.5) * 0.5 + 0.5;
  gl_FragColor = vec4(r, g, b, 1.0);
}
