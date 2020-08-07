#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
  
  // vec2 coord = gl_FragCoord.xy / u_resolution;
  // vec2 coord = (gl_FragCoord.xy - u_resolution / 2.0) / min(u_resolution.y, u_resolution.x);
  vec2 coord = (gl_FragCoord.xy - u_resolution) / min(u_resolution.y, u_resolution.x);
  coord += 0.5;
  // vec2 coord = vec2(0.5, 0.5);
  vec3 color = vec3(0.0, 0.0, 0.0);

  float d = length(coord);
  float m = 0.02 / d;

  color += m;

  gl_FragColor = vec4(color, 0.8);
}
