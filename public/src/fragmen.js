
//import noise from './shader_snippet/noise.glsl';

const noise = `//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec2  mod289(vec2 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec3  mod289(vec3 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4  mod289(vec4 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}
float permute(float x){return mod289(((x*34.0)+1.0)*x);}
vec3  permute(vec3 x) {return mod289(((x*34.0)+1.0)*x);}
vec4  permute(vec4 x) {return mod289(((x*34.0)+1.0)*x);}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}
vec4  taylorInvSqrt(vec4 r) {return 1.79284291400159 - 0.85373472095314 * r;}
float snoise2D(vec2 v){
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  // First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

  // Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  // Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  // Gradients: 41 points uniformly over a line, mapped onto a diamond.
  // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  // Normalise gradients implicitly by scaling m
  // Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

  // Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float snoise3D(vec3 v){
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
}
float snoise4D(vec4 v){
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

  // First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

  // Other corners

  // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
  //  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

  // Permutations
  i = mod289(i);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

  // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

  // Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
                + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}
float fsnoise      (vec2 c){return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453);}
float fsnoiseDigits(vec2 c){return fract(sin(dot(c, vec2(0.129898, 0.78233))) * 437.585453);}
vec3 hsv(float h, float s, float v){
    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}
mat2 rotate2D(float r){
    return mat2(cos(r), sin(r), -sin(r), cos(r));
}
mat3 rotate3D(float angle, vec3 axis){
    vec3 a = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float r = 1.0 - c;
    return mat3(
        a.x * a.x * r + c,
        a.y * a.x * r + a.z * s,
        a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s,
        a.y * a.y * r + c,
        a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s,
        a.y * a.z * r - a.x * s,
        a.z * a.z * r + c
    );
}
const float PI = 3.141592653589793;
const float PI2 = PI * 2.0;

`;

export class Fragmen {
    /**
     * ES 3.0 ????????????????????????
     * @type {Array.<number>}
     */
    static get MODE_WITH_ES_300(){return [4, 5, 6, 7, 8, 9, 10, 11];}
    /**
     * resolution, mouse, time, backbuffer ????????? uniform ?????????????????????????????????????????????
     * @type {number}
     */
    static get MODE_CLASSIC(){return 0;}
    /**
     * r, m, t, b ???????????? uniform ???????????????????????????????????????
     * @type {number}
     */
    static get MODE_GEEK(){return 1;}
    /**
     * ???????????????????????????????????????precision ??? uniform ??????????????????????????????????????????????????????
     * @type {number}
     */
    static get MODE_GEEKER(){return 2;}
    /**
     * ??????????????????????????????????????????void main ??? gl_FragCoord ??????????????????????????? GLSL ????????????????????????????????????????????????????????????
     * @type {number}
     */
    static get MODE_GEEKEST(){return 3;}
    /**
     * classic ??? ES 3.0 ???
     * @type {number}
     */
    static get MODE_CLASSIC_300(){return 4;}
    /**
     * geek ??? ES 3.0 ???
     * @type {number}
     */
    static get MODE_GEEK_300(){return 5;}
    /**
     * geeker ??? ES 3.0 ???
     * @type {number}
     */
    static get MODE_GEEKER_300(){return 6;}
    /**
     * geekest ??? ES 3.0 ???
     * @type {number}
     */
    static get MODE_GEEKEST_300(){return 7;}
    /**
     * classic ??? ES 3.0 + MRT ???
     * @type {number}
     */
    static get MODE_CLASSIC_MRT(){return 8;}
    /**
     * geek ??? ES 3.0 + MRT ???
     * @type {number}
     */
    static get MODE_GEEK_MRT(){return 9;}
    /**
     * geeker ??? ES 3.0 + MRT ???
     * @type {number}
     */
    static get MODE_GEEKER_MRT(){return 10;}
    /**
     * geekest ??? ES 3.0 + MRT ???
     * @type {number}
     */
    static get MODE_GEEKEST_MRT(){return 11;}
    /**
     * MRT ?????????????????????
     * ??? MRT ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
     * ??? ?????????????????????????????????????????????????????????????????????????????????????????????????????????
     * @type {number}
     */
    static get MRT_TARGET_COUNT(){return 2;}
    /**
     * ?????????????????????????????????????????????
     * @type {Array.<string>}
     */
    static get DEFAULT_SOURCE(){
        // MRT declaration
        let declareOutColor = '';
        for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){
            declareOutColor += `layout (location = ${i}) out vec4 outColor${i};\n`;
        }
        let declareO = '';
        for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){
            declareO += `layout (location = ${i}) out vec4 o${i};\n`;
        }
        let outColor = '';
        for(let i = 1; i < Fragmen.MRT_TARGET_COUNT; ++i){
            outColor += `outColor${i}=outColor0;`;
        }
        let o = '';
        for(let i = 1; i < Fragmen.MRT_TARGET_COUNT; ++i){
            o += `o${i}=o0;`;
        }
        // sources
        const classic = `precision highp float;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D backbuffer;
void main(){vec2 r=resolution,p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y)-mouse;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(time*.2)*.4);}gl_FragColor=vec4(p.xxy,1);}`;

        const geek = `precision highp float;
uniform vec2 r;
uniform vec2 m;
uniform float t;
uniform sampler2D b;
void main(){vec2 p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y)-m;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(t*.2)*.4);}gl_FragColor=vec4(p.xxy,1);}`;
        const geeker = `void main(){vec2 p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y)-m;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(t*.2)*.4);}gl_FragColor=vec4(p.xxy,1);}`;
        const geekest = `vec2 p=(FC.xy*2.-r)/min(r.x,r.y)-m;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(t*.2)*.4);}gl_FragColor=vec4(p.xxy,1);`;

        const classic300 = `precision highp float;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D backbuffer;
out vec4 outColor;
void main(){vec2 r=resolution,p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y)-mouse;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(time*.2)*.4);}outColor=vec4(p.xxy,1);}`;

        const geek300 = `precision highp float;
uniform vec2 r;
uniform vec2 m;
uniform float t;
uniform sampler2D b;
out vec4 o;
void main(){vec2 p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y)-m;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(t*.2)*.4);}o=vec4(p.xxy,1);}`;
        const geeker300 = `void main(){vec2 p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y)-m;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(t*.2)*.4);}o=vec4(p.xxy,1);}`;
        const geekest300 = `vec2 p=(FC.xy*2.-r)/min(r.x,r.y)-m;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(t*.2)*.4);}o=vec4(p.xxy,1);`;

        const classicMRT = `precision highp float;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D backbuffer0;
uniform sampler2D backbuffer1;
${declareOutColor}void main(){vec2 r=resolution,p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y)-mouse;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(time*.2)*.4);}outColor0=vec4(p.xxy,1);${outColor}}`;

        const geekMRT = `precision highp float;
uniform vec2 r;
uniform vec2 m;
uniform float t;
uniform sampler2D b;
${declareO}void main(){vec2 p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y)-m;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(t*.2)*.4);}o0=vec4(p.xxy,1);${o}}`;

        const geekerMRT = `void main(){vec2 p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y)-m;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(t*.2)*.4);}o0=vec4(p.xxy,1);${o}}`;
        const geekestMRT = `vec2 p=(FC.xy*2.-r)/min(r.x,r.y)-m;for(int i=0;i<8;++i){p.xy=abs(p)/abs(dot(p,p))-vec2(.9+cos(t*.2)*.4);}o0=vec4(p.xxy,1);${o}`;
        return [classic, geek, geeker, geekest, classic300, geek300, geeker300, geekest300, classicMRT, geekMRT, geekerMRT, geekestMRT];
    }
    /**
     * GLSL ES 3.0 ???????????????????????????????????????????????????????????????
     * @type {string}
     */
    static get ES_300_CHUNK(){return '#version 300 es\n';}
    /**
     * ?????????????????????????????????????????????????????????????????????????????????????????????
     * @type {string}
     */
    static get GEEKER_CHUNK(){return 'precision highp float;uniform vec2 r;uniform vec2 m;uniform float t;uniform float f;uniform float s;uniform sampler2D b;\n';}
    /**
     * ????????????????????? + ES 3.0 ??????????????????????????? out ?????????????????????????????????
     * @type {string}
     */
    static get GEEKER_OUT_CHUNK(){return 'out vec4 o;\n';}
    /**
     * ????????????????????? + MRT ????????????????????????????????????????????????????????????????????????
     * @type {string}
     */
    static get GEEKER_MRT_CHUNK(){
        const chunk = [];
        for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){
            chunk.push(`uniform sampler2D b${i};`);
        }
        return `precision highp float;uniform vec2 r;uniform vec2 m;uniform float t;uniform float f;uniform float s;${chunk.join('')}\n`;
    }
    /**
     * ????????????????????? + ES 3.0 + MRT ??????????????????????????? out ?????????????????????????????????
     * @type {string}
     */
    static get GEEKER_OUT_MRT_CHUNK(){
        const chunk = [];
        for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){
            chunk.push(`layout (location = ${i}) out vec4 o${i};`);
        }
        return `${chunk.join('')}\n`;
    }
    /**
     * ????????????????????????????????????????????????????????????????????????????????????????????????
     * @type {string}
     */
    static get GEEKEST_CHUNK(){
        return `#define FC gl_FragCoord
precision highp float;uniform vec2 r;uniform vec2 m;uniform float t;uniform float f;uniform float s;uniform sampler2D b;
${noise}\n`;
    }
    /**
     * ???????????????????????? + ES 3.0 ??????????????????????????? out ?????????????????????????????????
     * @type {string}
     */
    static get GEEKEST_OUT_CHUNK(){return 'out vec4 o;\n';}
    /**
     * ???????????????????????? + ES 3.0 + MRT ??????????????????????????????????????????????????????????????????????????????
     * @type {string}
     */
    static get GEEKEST_MRT_CHUNK(){
        const chunk = [];
        for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){
            chunk.push(`uniform sampler2D b${i};`);
        }
        return `#define FC gl_FragCoord
precision highp float;uniform vec2 r;uniform vec2 m;uniform float t;uniform float f;uniform float s;${chunk.join('')}
${noise}\n`;
    }
    /**
     * ???????????????????????? + ES 3.0 + MRT ??????????????????????????? layout out ?????????????????????????????????
     * @type {string}
     */
    static get GEEKEST_OUT_MRT_CHUNK(){
        const chunk = [];
        for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){
            chunk.push(`layout (location = ${i}) out vec4 o${i};`);
        }
        return `${chunk.join('')}\n`;
    }

    /**
     * constructor of fragmen.js
     * @param {object} option - ???????????????
     * @property {HTMLElement} option.target - insert canvas to
     * @property {HTMLElement} [option.eventTarget=target] - event target element or window
     * @property {boolean} [option.mouse=false] - mouse event enable
     * @property {boolean} [option.escape=false] - keydown event enable
     * @property {boolean} [option.resize=false] - resize event enable
     */
    constructor(option){
        /**
         * WebGL ?????????????????????????????? canvas ????????????????????????????????????
         * @type {HTMLElement}
         */
        this.target = null;
        /**
         * ????????????????????????????????????????????????????????????????????? window???
         * @type {window|HTMLElement}
         */
        this.eventTarget = null;
        /**
         * WebGL ?????????????????????????????? canvas
         * @type {HTMLCanvasElement}
         */
        this.canvas = null;
        /**
         * WebGL 2.0 ?????????????????????????????????
         * @type {boolean}
         */
        this.isWebGL2 = false;
        /**
         * WebGL ???????????????????????????????????????
         * @type {WebGLRenderingContext}
         */
        this.gl = null;
        /**
         * ???????????????????????????????????????????????????
         * @type {boolean}
         */
        this.resize = false;
        /**
         * ????????????????????????
         * @type {number}
         */
        this.width  = 0;
        /**
         * ???????????????????????????
         * @type {number}
         */
        this.height = 0;
        /**
         * ??????????????????????????????
         * @type {Array.<number>}
         */
        this.mousePosition = [0.0, 0.0];
        /**
         * ????????????????????????????????????
         * @type {number}
         */
        this.mode = Fragmen.MODE_CLASSIC;
        /**
         * ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
         * @type {boolean}
         */
        this.animation = true;
        /**
         * ?????????????????????????????????
         * @type {boolean}
         */
        this.run = false;
        /**
         * ??????????????????????????????????????????????????????????????????
         * @type {number}
         */
        this.startTime = 0;
        /**
         * ??????????????????????????????????????????????????????
         * @type {number}
         */
        this.nowTime = 0;
        /**
         * ??????????????????????????????????????????????????????
         * @type {number}
         */
        this.frameCount = 0;
        /**
         * ???????????????????????????
         * @type {WebGLProgram}
         */
        this.program = null;
        /**
         * uniform ??????????????????
         * @type {object}
         */
        this.uniLocation = null;
        /**
         * attribute ??????????????????
         * @type {object}
         */
        this.attLocation = null;
        /**
         * Onomat.js ??????????????????????????????
         * @type {number}
         */
        this.frequency = 0;
        /**
         * ???????????????????????????????????????
         * @type {string}
         */
        this.VS = '';
        /**
         * ???????????????????????????????????????????????????
         * @type {string}
         */
        this.FS = '';
        /**
         * ???????????????????????????????????????
         * @type {WebGLProgram}
         */
        this.postProgram = null;
        /**
         * ???????????????????????? uniform ??????????????????
         * @type {object}
         */
        this.postUniLocation = null;
        /**
         * ???????????????????????? attribute ??????????????????
         * @type {object}
         */
        this.postAttLocation = null;
        /**
         * ???????????????????????????????????????????????????????????????
         * @type {string}
         */
        this.postVS = '';
        /**
         * ???????????????????????????????????????????????????????????????????????????
         * @type {string}
         */
        this.postFS = '';
        /**
         * ????????????????????????????????????????????????
         * @type {WebGLFrameBuffer}
         */
        this.fFront = null;
        /**
         * ????????????????????????????????????????????????
         * @type {WebGLFrameBuffer}
         */
        this.fBack = null;
        /**
         * ????????????????????????????????????????????????
         * @type {WebGLFrameBuffer}
         */
        this.fTemp = null;
        /**
         * MRT ??? gl.drawBuffers ??????????????????????????????????????????????????????????????????
         * @type {Array.<number>}
         */
        this.buffers = null;

        // self binding
        this.render    = this.render.bind(this);
        this.rect      = this.rect.bind(this);
        this.reset     = this.reset.bind(this);
        this.draw      = this.draw.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.keyDown   = this.keyDown.bind(this);
        // initial call
        this.init(option);
    }

    /**
     * initialize fragmen.js
     * @param {object} option - options
     */
    init(option){
        // option check
        if(option === null || option === undefined){return;}
        if(!option.hasOwnProperty('target') || option.target === null || option.target === undefined){return;}
        if(!(option.target instanceof HTMLElement)){return;}
        // init canvas
        this.target = this.eventTarget = option.target;
        if(this.target.tagName.match(/canvas/i)){
            this.canvas = this.target;
        }else{
            this.canvas = document.createElement('canvas');
            this.target.appendChild(this.canvas);
        }
        // init webgl context
        const opt = {alpha: false, preserveDrawingBuffer: true};
        this.gl = this.canvas.getContext('webgl2', opt);
        this.isWebGL2 = this.gl != null;
        if(this.isWebGL2 !== true){
            this.gl = this.canvas.getContext('webgl', opt);
            this.gl.getExtension('OES_standard_derivatives');
        }
        if(this.gl == null){
            console.log('webgl unsupported');
            return;
        }
        // check event
        if(option.hasOwnProperty('eventTarget') && option.eventTarget !== null && option.eventTarget !== undefined){
            this.eventTarget = option.eventTarget;
        }
        if(option.hasOwnProperty('mouse') && option.mouse === true){
            this.eventTarget.addEventListener('pointermove', this.mouseMove, false);
        }
        if(option.hasOwnProperty('escape') && option.escape === true){
            window.addEventListener('keydown', this.keyDown, false);
        }
        if(option.hasOwnProperty('resize') && option.resize === true){
            this.resize = true;
            window.addEventListener('resize', this.rect, false);
        }
        // render initial
        this.VS = 'attribute vec3 p;void main(){gl_Position=vec4(p,1.);}';
        this.postVS = `
attribute vec3 position;
varying   vec2 vTexCoord;
void main(){
    vTexCoord   = (position + 1.0).xy / 2.0;
    gl_Position = vec4(position, 1.0);
}`;
        this.postFS = `
precision mediump float;
uniform sampler2D texture;
varying vec2      vTexCoord;
void main(){
    gl_FragColor = texture2D(texture, vTexCoord);
}`;
        this.postProgram = this.gl.createProgram();
        let vs = this.createShader(this.postProgram, 0, this.postVS);
        let fs = this.createShader(this.postProgram, 1, this.postFS);
        this.gl.linkProgram(this.postProgram);
        this.gl.deleteShader(vs);
        this.gl.deleteShader(fs);
        this.postUniLocation = {};
        this.postUniLocation.texture = this.gl.getUniformLocation(this.postProgram, 'texture');
        this.postAttLocation = this.gl.getAttribLocation(this.postProgram, 'position');

        this.post300VS = `#version 300 es
in  vec3 position;
out vec2 vTexCoord;
void main(){
    vTexCoord   = (position + 1.0).xy / 2.0;
    gl_Position = vec4(position, 1.0);
}`;
        this.post300FS = `#version 300 es
precision mediump float;
uniform sampler2D drawTexture;
in vec2 vTexCoord;
layout (location = 0) out vec4 outColor;
void main(){
    outColor = texture(drawTexture, vTexCoord);
}`;
        if(this.isWebGL2 === true){
            this.post300Program = this.gl.createProgram();
            vs = this.createShader(this.post300Program, 0, this.post300VS);
            fs = this.createShader(this.post300Program, 1, this.post300FS);
            this.gl.linkProgram(this.post300Program);
            this.gl.deleteShader(vs);
            this.gl.deleteShader(fs);
            this.post300UniLocation = {};
            this.post300UniLocation.texture = this.gl.getUniformLocation(this.post300Program, 'drawTexture');
            this.post300AttLocation = this.gl.getAttribLocation(this.post300Program, 'position');
        }

        this.fFront = this.fBack = this.fTemp = null;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1,1,0,-1,-1,0,1,1,0,1,-1,0]), this.gl.STATIC_DRAW);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.disable(this.gl.BLEND);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    /**
     * rendering hub
     * @param {string} source - fragment shader source
     * @return {object} instance
     */
    render(source){
        if(source === null || source === undefined || source === ''){
            if(this.FS === ''){return;}
        }else{
            this.FS = source;
        }
        this.reset();
        return this;
    }

    /**
     * set rect
     */
    rect(){
        const bound = this.target.getBoundingClientRect();
        this.width = bound.width;
        this.height = bound.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.resetBuffer(this.fFront);
        this.resetBuffer(this.fBack);
        this.resetBuffer(this.fTemp);
        switch(this.mode){
            case Fragmen.MODE_CLASSIC_MRT:
            case Fragmen.MODE_GEEK_MRT:
            case Fragmen.MODE_GEEKER_MRT:
            case Fragmen.MODE_GEEKEST_MRT:
                this.fFront = this.createFramebufferMRT(this.width, this.height, Fragmen.MRT_TARGET_COUNT);
                this.fBack = this.createFramebufferMRT(this.width, this.height, Fragmen.MRT_TARGET_COUNT);
                break;
            default:
                this.fFront = this.createFramebuffer(this.width, this.height);
                this.fBack = this.createFramebuffer(this.width, this.height);
        }
        this.gl.viewport(0, 0, this.width, this.height);
    }

    /**
     * reset renderer
     */
    reset(){
        this.rect();
        let program = this.gl.createProgram();
        let vs = this.createShader(program, 0, this.preprocessVertexCode(this.VS));
        if(vs === false){
            return;
        }
        let fs = this.createShader(program, 1, this.preprocessFragmentCode(this.FS));
        if(fs === false){
            this.gl.deleteShader(vs);
            return;
        }
        this.gl.linkProgram(program);
        this.gl.deleteShader(vs);
        this.gl.deleteShader(fs);
        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
            let msg = this.gl.getProgramInfoLog(program);
            msg = this.formatErrorMessage(msg);
            console.warn(msg);
            if(this.onBuildCallback != null){
                const t = getTimeString();
                this.onBuildCallback('error', ` ??? [ ${t} ] ${msg}`);
            }
            program = null;
            return;
        }
        let resolution = 'resolution';
        let mouse      = 'mouse';
        let time       = 'time';
        let frame      = 'frame';
        let sound      = 'sound';
        let backbuffer = 'backbuffer';
        let mrtBuffers = [];
        for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){mrtBuffers.push(`backbuffer${i}`);}
        let mrtShortBuffers = [];
        for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){mrtShortBuffers.push(`b${i}`);}
        if(
            this.mode === Fragmen.MODE_GEEK ||
            this.mode === Fragmen.MODE_GEEKER ||
            this.mode === Fragmen.MODE_GEEKEST ||
            this.mode === Fragmen.MODE_GEEK_300 ||
            this.mode === Fragmen.MODE_GEEKER_300 ||
            this.mode === Fragmen.MODE_GEEKEST_300 ||
            this.mode === Fragmen.MODE_GEEK_MRT ||
            this.mode === Fragmen.MODE_GEEKER_MRT ||
            this.mode === Fragmen.MODE_GEEKEST_MRT
        ){
            resolution = 'r';
            mouse      = 'm';
            time       = 't';
            frame      = 'f';
            sound      = 's';
            backbuffer = 'b';
        }
        if(this.program != null){this.gl.deleteProgram(this.program);}
        this.program = program;
        this.gl.useProgram(this.program);
        this.uniLocation = {};
        this.uniLocation.resolution = this.gl.getUniformLocation(this.program, resolution);
        this.uniLocation.mouse = this.gl.getUniformLocation(this.program, mouse);
        this.uniLocation.time = this.gl.getUniformLocation(this.program, time);
        this.uniLocation.frame = this.gl.getUniformLocation(this.program, frame);
        this.uniLocation.sound = this.gl.getUniformLocation(this.program, sound);
        switch(this.mode){
            case Fragmen.MODE_CLASSIC_MRT:
                for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){
                    this.uniLocation[`sampler${i}`] = this.gl.getUniformLocation(this.program, mrtBuffers[i]);
                }
                break;
            case Fragmen.MODE_GEEK_MRT:
            case Fragmen.MODE_GEEKER_MRT:
            case Fragmen.MODE_GEEKEST_MRT:
                for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){
                    this.uniLocation[`sampler${i}`] = this.gl.getUniformLocation(this.program, mrtShortBuffers[i]);
                }
                break;
            default:
                this.uniLocation.sampler = this.gl.getUniformLocation(this.program, backbuffer);
        }
        this.attLocation = this.gl.getAttribLocation(this.program, 'p');
        this.mousePosition = [0.0, 0.0];
        this.startTime = Date.now();
        this.frameCount = 0;
        if(!this.run){
            this.run = true;
            this.draw();
        }
    }

    /**
     * rendering
     */
    draw(){
        if(!this.run){return;}
        if(this.animation === true){
            requestAnimationFrame(this.draw);
        }
        this.nowTime = (Date.now() - this.startTime) * 0.001;
        ++this.frameCount;
        this.gl.useProgram(this.program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fFront.f);
        if(Array.isArray(this.fBack.t) === true){
            this.gl.drawBuffers(this.buffers);
            for(let i = 0; i < Fragmen.MRT_TARGET_COUNT; ++i){
                this.gl.activeTexture(this.gl.TEXTURE0 + i);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.fBack.t[i]);
                this.gl.uniform1i(this.uniLocation[`sampler${i}`], i);
            }
        }else{
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.fBack.t);
            this.gl.uniform1i(this.uniLocation.sampler, 0);
        }
        this.gl.enableVertexAttribArray(this.attLocation);
        this.gl.vertexAttribPointer(this.attLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.uniform2fv(this.uniLocation.mouse, this.mousePosition);
        this.gl.uniform1f(this.uniLocation.time, this.nowTime);
        this.gl.uniform1f(this.uniLocation.frame, this.frameCount);
        this.gl.uniform2fv(this.uniLocation.resolution, [this.width, this.height]);
        this.gl.uniform1f(this.uniLocation.sound, this.frequency);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        if(Array.isArray(this.fBack.t) === true){
            this.gl.useProgram(this.post300Program);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.fFront.t[0]);
            this.gl.enableVertexAttribArray(this.post300AttLocation);
            this.gl.vertexAttribPointer(this.post300AttLocation, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.uniform1i(this.post300UniLocation.texture, 0);
        }else{
            this.gl.useProgram(this.postProgram);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.fFront.t);
            this.gl.enableVertexAttribArray(this.postAttLocation);
            this.gl.vertexAttribPointer(this.postAttLocation, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.uniform1i(this.postUniLocation.texture, 0);
        }
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        this.gl.flush();
        this.fTemp = this.fFront;
        this.fFront = this.fBack;
        this.fBack = this.fTemp;

        if(this.onDrawCallback != null){
            this.onDrawCallback();
        }
    }

    /**
     * create and compile shader
     * @param {WebGLProgram} p - target program object
     * @param {number} i - 0 or 1, 0 is vertex shader compile mode
     * @param {string} j - shader source
     * @return {boolean|WebGLShader} compiled shader object or false
     */
    createShader(p, i, j){
        if(!this.gl){return false;}
        const k = this.gl.createShader(this.gl.VERTEX_SHADER - i);
        this.gl.shaderSource(k, j);
        this.gl.compileShader(k);
        const t = getTimeString();
        if(!this.gl.getShaderParameter(k, this.gl.COMPILE_STATUS)){
            let msg = this.gl.getShaderInfoLog(k);
            msg = this.formatErrorMessage(msg);
            console.warn(msg);
            if(this.onBuildCallback != null){
                this.onBuildCallback('error', ` ??? [ ${t} ] ${msg}`);
            }
            return false;
        }
        if(this.onBuildCallback != null){
            this.onBuildCallback('success', ` ??? [ ${t} ] shader compile succeeded`);
        }
        this.gl.attachShader(p, k);
        const l = this.gl.getShaderInfoLog(k);
        if(l !== ''){console.info('shader info: ' + l);}
        return k;
    }

    /**
     * create framebuffer
     * @param {number} width - set to framebuffer width
     * @param {number} height - set to framebuffer height
     * @return {object} custom object
     * @property {WebGLFramebuffer} f
     * @property {WebGLRenderbuffer} d
     * @property {WebGLTexture} t
     */
    createFramebuffer(width, height){
        const frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
        const depthRenderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);
        const fTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, fTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return {f: frameBuffer, d: depthRenderBuffer, t: fTexture};
    }

    /**
     * create framebuffer
     * @param {number} width - set to framebuffer width
     * @param {number} height - set to framebuffer height
     * @param {number} count - colorbuffer count
     * @return {object} custom object
     * @property {WebGLFramebuffer} f
     * @property {WebGLRenderbuffer} d
     * @property {WebGLTexture} t
     */
    createFramebufferMRT(width, height, count){
        const frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
        const depthRenderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);
        const fTexture = [];
        this.buffers = [];
        for(let i = 0; i < count; ++i){
            const tex = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0 + i, this.gl.TEXTURE_2D, tex, 0);
            fTexture.push(tex);
            this.buffers.push(this.gl.COLOR_ATTACHMENT0 + i);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return {f: frameBuffer, d: depthRenderBuffer, t: fTexture};
    }

    /**
     * framebuffer reset
     * @param {object} obj - custom object(this.createFramebuffer return value)
     */
    resetBuffer(obj){
        if(!this.gl || !obj){return;}
        if(obj.hasOwnProperty('f') && obj.f != null && this.gl.isFramebuffer(obj.f)){
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.deleteFramebuffer(obj.f);
            obj.f = null;
        }
        if(obj.hasOwnProperty('d') && obj.d != null && this.gl.isRenderbuffer(obj.d)){
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
            this.gl.deleteRenderbuffer(obj.d);
            obj.d = null;
        }
        if(obj.hasOwnProperty('t') && Array.isArray(obj.t) === true){
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            obj.t.forEach((texture) => {
                this.gl.deleteTexture(texture);
                texture = null;
            });
        }else if(obj.hasOwnProperty('t') && obj.t != null && this.gl.isTexture(obj.t)){
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            this.gl.deleteTexture(obj.t);
            obj.t = null;
        }
        obj = null;
    }

    /**
     * mouse event
     */
    mouseMove(eve){
        if(eve.clientY > this.target.height){return;}
        const x = Math.min(eve.clientX, this.target.width);
        const y = Math.min(eve.clientY, this.target.height);
        this.mousePosition = [x / this.target.width, 1.0 - y / this.target.height];
    }

    /**
     * key event
     */
    keyDown(eve){
        if(this.gl === null){return;}
        this.run = (eve.keyCode !== 27);
    }

    /**
     * ??????????????????????????????????????????????????????????????????
     * @param {function}
     */
    onBuild(callback){
        this.onBuildCallback = callback;
    }
    /**
     * ???????????????????????????????????????????????????????????????
     * @param {function}
     */
    onDraw(callback){
        this.onDrawCallback = callback;
    }

    /**
     * ????????????????????????
     * @param {number} frequency - ???????????????????????????????????????????????????????????????
     */
    setFrequency(frequency){
        this.frequency = frequency;
    }

    /**
     * ?????????????????????????????????????????????????????????
     * @param {boolean} animate - ??????????????????????????????????????????????????????
     */
    setAnimation(animate){
        this.animation = animate;
    }

    /**
     * this.mode ??????????????????????????????????????????
     * @private
     * @param {string} source - ??????????????????????????????????????????????????????
     */
    preprocessVertexCode(source){
        switch(this.mode){
            case Fragmen.MODE_CLASSIC_300:
            case Fragmen.MODE_GEEK_300:
            case Fragmen.MODE_GEEKER_300:
            case Fragmen.MODE_GEEKEST_300:
            case Fragmen.MODE_CLASSIC_MRT:
            case Fragmen.MODE_GEEK_MRT:
            case Fragmen.MODE_GEEKER_MRT:
            case Fragmen.MODE_GEEKEST_MRT:
                return Fragmen.ES_300_CHUNK + source.replace(/attribute/g, 'in');
            default:
                return source;
        }
    }

    /**
     * this.mode ??????????????????????????????????????????
     * @private
     * @param {string} code - ??????????????????????????????????????????????????????????????????
     */
    preprocessFragmentCode(code){
        let chunk300 = '';
        let chunkOut = '';
        let chunkMain = ''
        let chunkClose = ''
        switch(this.mode){
            case Fragmen.MODE_GEEKER:
                chunkOut = Fragmen.GEEKER_CHUNK;
                break;
            case Fragmen.MODE_GEEKEST:
                chunkOut = Fragmen.GEEKEST_CHUNK;
                chunkMain = 'void main(){\n'
                chunkClose = '\n}'
                break;
            case Fragmen.MODE_CLASSIC_300:
            case Fragmen.MODE_GEEK_300:
            case Fragmen.MODE_CLASSIC_MRT:
            case Fragmen.MODE_GEEK_MRT:
                chunk300 = Fragmen.ES_300_CHUNK;
                break;
            case Fragmen.MODE_GEEKER_300:
                chunk300 = Fragmen.ES_300_CHUNK;
                chunkOut = Fragmen.GEEKER_CHUNK.substr(0, Fragmen.GEEKER_CHUNK.length - 1) + Fragmen.GEEKER_OUT_CHUNK;
                break;
            case Fragmen.MODE_GEEKER_MRT:
                chunk300 = Fragmen.ES_300_CHUNK;
                chunkOut = Fragmen.GEEKER_MRT_CHUNK.substr(0, Fragmen.GEEKER_MRT_CHUNK.length - 1) + Fragmen.GEEKER_OUT_MRT_CHUNK;
                break;
            case Fragmen.MODE_GEEKEST_300:
                chunk300 = Fragmen.ES_300_CHUNK;
                chunkOut = Fragmen.GEEKEST_CHUNK.substr(0, Fragmen.GEEKEST_CHUNK.length - 1) + Fragmen.GEEKEST_OUT_CHUNK;
                chunkMain = 'void main(){\n'
                chunkClose = '\n}'
                break;
            case Fragmen.MODE_GEEKEST_MRT:
                chunk300 = Fragmen.ES_300_CHUNK;
                chunkOut = Fragmen.GEEKEST_MRT_CHUNK.substr(0, Fragmen.GEEKEST_MRT_CHUNK.length - 1) + Fragmen.GEEKEST_OUT_MRT_CHUNK;
                chunkMain = 'void main(){\n'
                chunkClose = '\n}'
                break;
            default:
                break;
        }
        return chunk300 + chunkOut + chunkMain + code + chunkClose;
    }

    /**
     * this.mode ????????????????????????????????????????????????????????????
     * @param {string} message
     * @private
     */
    formatErrorMessage(message){
        let dec = 0;
        let noiseDec = noise.split('\n').length;
        switch(this.mode){
            case Fragmen.MODE_CLASSIC:
            case Fragmen.MODE_GEEK:
                dec = 0;
                break;
            case Fragmen.MODE_GEEKER:
                dec += 1;
                break;
            case Fragmen.MODE_GEEKEST:
                dec += 3 + noiseDec;
                break;
            case Fragmen.MODE_CLASSIC_300:
            case Fragmen.MODE_GEEK_300:
            case Fragmen.MODE_CLASSIC_MRT:
            case Fragmen.MODE_GEEK_MRT:
                dec += 1;
                break;
            case Fragmen.MODE_GEEKER_300:
                dec += 2;
                break;
            case Fragmen.MODE_GEEKER_MRT:
                dec += 2;
                break;
            case Fragmen.MODE_GEEKEST_300:
                dec += 4 + noiseDec;
                break;
            case Fragmen.MODE_GEEKEST_MRT:
                dec += 4 + noiseDec;
                break;
        }
        return message.replace(/^ERROR: (\d+):(\d+)/gm, (...args) => {
            const line = parseInt(args[2]) - dec;
            return `ERROR: ${args[1]}:${line}`;
        });
    }
}

/**
 * ?????????????????????????????????
 * @return {string}
 */
function getTimeString(){
    const d = new Date();
    const h = (new Array(2).join('0') + d.getHours()).substr(-2, 2);
    const m = (new Array(2).join('0') + d.getMinutes()).substr(-2, 2);
    return `${h}:${m}`;
}

