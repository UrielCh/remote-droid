// node_modules/.deno/preact@10.26.9/node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var r;
var o;
var e;
var f;
var c;
var s;
var a;
var h;
var p = {};
var v = [];
var y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var w = Array.isArray;
function d(n2, l2) {
  for (var u2 in l2)
    n2[u2] = l2[u2];
  return n2;
}
function g(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _(l2, u2, t2) {
  var i2, r2, o2, e2 = {};
  for (o2 in u2)
    o2 == "key" ? i2 = u2[o2] : o2 == "ref" ? r2 = u2[o2] : e2[o2] = u2[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t2), typeof l2 == "function" && l2.defaultProps != null)
    for (o2 in l2.defaultProps)
      e2[o2] === undefined && (e2[o2] = l2.defaultProps[o2]);
  return m(l2, e2, i2, r2, null);
}
function m(n2, t2, i2, r2, o2) {
  var e2 = { type: n2, props: t2, key: i2, ref: r2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: undefined, __v: o2 == null ? ++u : o2, __i: -1, __u: 0 };
  return o2 == null && l.vnode != null && l.vnode(e2), e2;
}
function k(n2) {
  return n2.children;
}
function x(n2, l2) {
  this.props = n2, this.context = l2;
}
function S(n2, l2) {
  if (l2 == null)
    return n2.__ ? S(n2.__, n2.__i + 1) : null;
  for (var u2;l2 < n2.__k.length; l2++)
    if ((u2 = n2.__k[l2]) != null && u2.__e != null)
      return u2.__e;
  return typeof n2.type == "function" ? S(n2) : null;
}
function C(n2) {
  var l2, u2;
  if ((n2 = n2.__) != null && n2.__c != null) {
    for (n2.__e = n2.__c.base = null, l2 = 0;l2 < n2.__k.length; l2++)
      if ((u2 = n2.__k[l2]) != null && u2.__e != null) {
        n2.__e = n2.__c.base = u2.__e;
        break;
      }
    return C(n2);
  }
}
function M(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !$.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)($);
}
function $() {
  for (var n2, u2, t2, r2, o2, f2, c2, s2 = 1;i.length; )
    i.length > s2 && i.sort(e), n2 = i.shift(), s2 = i.length, n2.__d && (t2 = undefined, o2 = (r2 = (u2 = n2).__v).__e, f2 = [], c2 = [], u2.__P && ((t2 = d({}, r2)).__v = r2.__v + 1, l.vnode && l.vnode(t2), O(u2.__P, t2, r2, u2.__n, u2.__P.namespaceURI, 32 & r2.__u ? [o2] : null, f2, o2 == null ? S(r2) : o2, !!(32 & r2.__u), c2), t2.__v = r2.__v, t2.__.__k[t2.__i] = t2, z(f2, t2, c2), t2.__e != o2 && C(t2)));
  $.__r = 0;
}
function I(n2, l2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, y2, w2, d2, g2, _2 = t2 && t2.__k || v, m2 = l2.length;
  for (f2 = P(u2, l2, _2, f2, m2), a2 = 0;a2 < m2; a2++)
    (y2 = u2.__k[a2]) != null && (h2 = y2.__i == -1 ? p : _2[y2.__i] || p, y2.__i = a2, g2 = O(n2, y2, h2, i2, r2, o2, e2, f2, c2, s2), w2 = y2.__e, y2.ref && h2.ref != y2.ref && (h2.ref && q(h2.ref, null, y2), s2.push(y2.ref, y2.__c || w2, y2)), d2 == null && w2 != null && (d2 = w2), 4 & y2.__u || h2.__k === y2.__k ? f2 = A(y2, f2, n2) : typeof y2.type == "function" && g2 !== undefined ? f2 = g2 : w2 && (f2 = w2.nextSibling), y2.__u &= -7);
  return u2.__e = d2, f2;
}
function P(n2, l2, u2, t2, i2) {
  var r2, o2, e2, f2, c2, s2 = u2.length, a2 = s2, h2 = 0;
  for (n2.__k = new Array(i2), r2 = 0;r2 < i2; r2++)
    (o2 = l2[r2]) != null && typeof o2 != "boolean" && typeof o2 != "function" ? (f2 = r2 + h2, (o2 = n2.__k[r2] = typeof o2 == "string" || typeof o2 == "number" || typeof o2 == "bigint" || o2.constructor == String ? m(null, o2, null, null, null) : w(o2) ? m(k, { children: o2 }, null, null, null) : o2.constructor == null && o2.__b > 0 ? m(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : o2).__ = n2, o2.__b = n2.__b + 1, e2 = null, (c2 = o2.__i = L(o2, u2, f2, a2)) != -1 && (a2--, (e2 = u2[c2]) && (e2.__u |= 2)), e2 == null || e2.__v == null ? (c2 == -1 && (i2 > s2 ? h2-- : i2 < s2 && h2++), typeof o2.type != "function" && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
  if (a2)
    for (r2 = 0;r2 < s2; r2++)
      (e2 = u2[r2]) != null && (2 & e2.__u) == 0 && (e2.__e == t2 && (t2 = S(e2)), B(e2, e2));
  return t2;
}
function A(n2, l2, u2) {
  var t2, i2;
  if (typeof n2.type == "function") {
    for (t2 = n2.__k, i2 = 0;t2 && i2 < t2.length; i2++)
      t2[i2] && (t2[i2].__ = n2, l2 = A(t2[i2], l2, u2));
    return l2;
  }
  n2.__e != l2 && (l2 && n2.type && !u2.contains(l2) && (l2 = S(n2)), u2.insertBefore(n2.__e, l2 || null), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (l2 != null && l2.nodeType == 8);
  return l2;
}
function L(n2, l2, u2, t2) {
  var i2, r2, o2 = n2.key, e2 = n2.type, f2 = l2[u2];
  if (f2 === null && n2.key == null || f2 && o2 == f2.key && e2 == f2.type && (2 & f2.__u) == 0)
    return u2;
  if (t2 > (f2 != null && (2 & f2.__u) == 0 ? 1 : 0))
    for (i2 = u2 - 1, r2 = u2 + 1;i2 >= 0 || r2 < l2.length; ) {
      if (i2 >= 0) {
        if ((f2 = l2[i2]) && (2 & f2.__u) == 0 && o2 == f2.key && e2 == f2.type)
          return i2;
        i2--;
      }
      if (r2 < l2.length) {
        if ((f2 = l2[r2]) && (2 & f2.__u) == 0 && o2 == f2.key && e2 == f2.type)
          return r2;
        r2++;
      }
    }
  return -1;
}
function T(n2, l2, u2) {
  l2[0] == "-" ? n2.setProperty(l2, u2 == null ? "" : u2) : n2[l2] = u2 == null ? "" : typeof u2 != "number" || y.test(l2) ? u2 : u2 + "px";
}
function j(n2, l2, u2, t2, i2) {
  var r2, o2;
  n:
    if (l2 == "style")
      if (typeof u2 == "string")
        n2.style.cssText = u2;
      else {
        if (typeof t2 == "string" && (n2.style.cssText = t2 = ""), t2)
          for (l2 in t2)
            u2 && l2 in u2 || T(n2.style, l2, "");
        if (u2)
          for (l2 in u2)
            t2 && u2[l2] == t2[l2] || T(n2.style, l2, u2[l2]);
      }
    else if (l2[0] == "o" && l2[1] == "n")
      r2 = l2 != (l2 = l2.replace(f, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n2 || l2 == "onFocusOut" || l2 == "onFocusIn" ? o2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t2 ? u2.u = t2.u : (u2.u = c, n2.addEventListener(l2, r2 ? a : s, r2)) : n2.removeEventListener(l2, r2 ? a : s, r2);
    else {
      if (i2 == "http://www.w3.org/2000/svg")
        l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (l2 != "width" && l2 != "height" && l2 != "href" && l2 != "list" && l2 != "form" && l2 != "tabIndex" && l2 != "download" && l2 != "rowSpan" && l2 != "colSpan" && l2 != "role" && l2 != "popover" && l2 in n2)
        try {
          n2[l2] = u2 == null ? "" : u2;
          break n;
        } catch (n3) {}
      typeof u2 == "function" || (u2 == null || u2 === false && l2[4] != "-" ? n2.removeAttribute(l2) : n2.setAttribute(l2, l2 == "popover" && u2 == 1 ? "" : u2));
    }
}
function F(n2) {
  return function(u2) {
    if (this.l) {
      var t2 = this.l[u2.type + n2];
      if (u2.t == null)
        u2.t = c++;
      else if (u2.t < t2.u)
        return;
      return t2(l.event ? l.event(u2) : u2);
    }
  };
}
function O(n2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, p2, v2, y2, _2, m2, b, S2, C2, M2, $2, P2, A2, H, L2, T2, j2 = u2.type;
  if (u2.constructor != null)
    return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f2 = u2.__e = t2.__e]), (a2 = l.__b) && a2(u2);
  n:
    if (typeof j2 == "function")
      try {
        if (b = u2.props, S2 = "prototype" in j2 && j2.prototype.render, C2 = (a2 = j2.contextType) && i2[a2.__c], M2 = a2 ? C2 ? C2.props.value : a2.__ : i2, t2.__c ? m2 = (h2 = u2.__c = t2.__c).__ = h2.__E : (S2 ? u2.__c = h2 = new j2(b, M2) : (u2.__c = h2 = new x(b, M2), h2.constructor = j2, h2.render = D), C2 && C2.sub(h2), h2.props = b, h2.state || (h2.state = {}), h2.context = M2, h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), S2 && h2.__s == null && (h2.__s = h2.state), S2 && j2.getDerivedStateFromProps != null && (h2.__s == h2.state && (h2.__s = d({}, h2.__s)), d(h2.__s, j2.getDerivedStateFromProps(b, h2.__s))), v2 = h2.props, y2 = h2.state, h2.__v = u2, p2)
          S2 && j2.getDerivedStateFromProps == null && h2.componentWillMount != null && h2.componentWillMount(), S2 && h2.componentDidMount != null && h2.__h.push(h2.componentDidMount);
        else {
          if (S2 && j2.getDerivedStateFromProps == null && b !== v2 && h2.componentWillReceiveProps != null && h2.componentWillReceiveProps(b, M2), !h2.__e && h2.shouldComponentUpdate != null && h2.shouldComponentUpdate(b, h2.__s, M2) === false || u2.__v == t2.__v) {
            for (u2.__v != t2.__v && (h2.props = b, h2.state = h2.__s, h2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
              n3 && (n3.__ = u2);
            }), $2 = 0;$2 < h2._sb.length; $2++)
              h2.__h.push(h2._sb[$2]);
            h2._sb = [], h2.__h.length && e2.push(h2);
            break n;
          }
          h2.componentWillUpdate != null && h2.componentWillUpdate(b, h2.__s, M2), S2 && h2.componentDidUpdate != null && h2.__h.push(function() {
            h2.componentDidUpdate(v2, y2, _2);
          });
        }
        if (h2.context = M2, h2.props = b, h2.__P = n2, h2.__e = false, P2 = l.__r, A2 = 0, S2) {
          for (h2.state = h2.__s, h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), H = 0;H < h2._sb.length; H++)
            h2.__h.push(h2._sb[H]);
          h2._sb = [];
        } else
          do {
            h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
          } while (h2.__d && ++A2 < 25);
        h2.state = h2.__s, h2.getChildContext != null && (i2 = d(d({}, i2), h2.getChildContext())), S2 && !p2 && h2.getSnapshotBeforeUpdate != null && (_2 = h2.getSnapshotBeforeUpdate(v2, y2)), L2 = a2, a2 != null && a2.type === k && a2.key == null && (L2 = N(a2.props.children)), f2 = I(n2, w(L2) ? L2 : [L2], u2, t2, i2, r2, o2, e2, f2, c2, s2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), m2 && (h2.__E = h2.__ = null);
      } catch (n3) {
        if (u2.__v = null, c2 || o2 != null)
          if (n3.then) {
            for (u2.__u |= c2 ? 160 : 128;f2 && f2.nodeType == 8 && f2.nextSibling; )
              f2 = f2.nextSibling;
            o2[o2.indexOf(f2)] = null, u2.__e = f2;
          } else
            for (T2 = o2.length;T2--; )
              g(o2[T2]);
        else
          u2.__e = t2.__e, u2.__k = t2.__k;
        l.__e(n3, u2, t2);
      }
    else
      o2 == null && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = V(t2.__e, u2, t2, i2, r2, o2, e2, c2, s2);
  return (a2 = l.diffed) && a2(u2), 128 & u2.__u ? undefined : f2;
}
function z(n2, u2, t2) {
  for (var i2 = 0;i2 < t2.length; i2++)
    q(t2[i2], t2[++i2], t2[++i2]);
  l.__c && l.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l.__e(n3, u3.__v);
    }
  });
}
function N(n2) {
  return typeof n2 != "object" || n2 == null || n2.__b && n2.__b > 0 ? n2 : w(n2) ? n2.map(N) : d({}, n2);
}
function V(u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, v2, y2, d2, _2, m2, b = i2.props, k2 = t2.props, x2 = t2.type;
  if (x2 == "svg" ? o2 = "http://www.w3.org/2000/svg" : x2 == "math" ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), e2 != null) {
    for (a2 = 0;a2 < e2.length; a2++)
      if ((d2 = e2[a2]) && "setAttribute" in d2 == !!x2 && (x2 ? d2.localName == x2 : d2.nodeType == 3)) {
        u2 = d2, e2[a2] = null;
        break;
      }
  }
  if (u2 == null) {
    if (x2 == null)
      return document.createTextNode(k2);
    u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l.__m && l.__m(t2, e2), c2 = false), e2 = null;
  }
  if (x2 == null)
    b === k2 || c2 && u2.data == k2 || (u2.data = k2);
  else {
    if (e2 = e2 && n.call(u2.childNodes), b = i2.props || p, !c2 && e2 != null)
      for (b = {}, a2 = 0;a2 < u2.attributes.length; a2++)
        b[(d2 = u2.attributes[a2]).name] = d2.value;
    for (a2 in b)
      if (d2 = b[a2], a2 == "children")
        ;
      else if (a2 == "dangerouslySetInnerHTML")
        v2 = d2;
      else if (!(a2 in k2)) {
        if (a2 == "value" && "defaultValue" in k2 || a2 == "checked" && "defaultChecked" in k2)
          continue;
        j(u2, a2, null, d2, o2);
      }
    for (a2 in k2)
      d2 = k2[a2], a2 == "children" ? y2 = d2 : a2 == "dangerouslySetInnerHTML" ? h2 = d2 : a2 == "value" ? _2 = d2 : a2 == "checked" ? m2 = d2 : c2 && typeof d2 != "function" || b[a2] === d2 || j(u2, a2, d2, b[a2], o2);
    if (h2)
      c2 || v2 && (h2.__html == v2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
    else if (v2 && (u2.innerHTML = ""), I(t2.type == "template" ? u2.content : u2, w(y2) ? y2 : [y2], t2, i2, r2, x2 == "foreignObject" ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && S(i2, 0), c2, s2), e2 != null)
      for (a2 = e2.length;a2--; )
        g(e2[a2]);
    c2 || (a2 = "value", x2 == "progress" && _2 == null ? u2.removeAttribute("value") : _2 != null && (_2 !== u2[a2] || x2 == "progress" && !_2 || x2 == "option" && _2 != b[a2]) && j(u2, a2, _2, b[a2], o2), a2 = "checked", m2 != null && m2 != u2[a2] && j(u2, a2, m2, b[a2], o2));
  }
  return u2;
}
function q(n2, u2, t2) {
  try {
    if (typeof n2 == "function") {
      var i2 = typeof n2.__u == "function";
      i2 && n2.__u(), i2 && u2 == null || (n2.__u = n2(u2));
    } else
      n2.current = u2;
  } catch (n3) {
    l.__e(n3, t2);
  }
}
function B(n2, u2, t2) {
  var i2, r2;
  if (l.unmount && l.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || q(i2, null, u2)), (i2 = n2.__c) != null) {
    if (i2.componentWillUnmount)
      try {
        i2.componentWillUnmount();
      } catch (n3) {
        l.__e(n3, u2);
      }
    i2.base = i2.__P = null;
  }
  if (i2 = n2.__k)
    for (r2 = 0;r2 < i2.length; r2++)
      i2[r2] && B(i2[r2], u2, t2 || typeof n2.type != "function");
  t2 || g(n2.__e), n2.__c = n2.__ = n2.__e = undefined;
}
function D(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function E(u2, t2, i2) {
  var r2, o2, e2, f2;
  t2 == document && (t2 = document.documentElement), l.__ && l.__(u2, t2), o2 = (r2 = typeof i2 == "function") ? null : i2 && i2.__k || t2.__k, e2 = [], f2 = [], O(t2, u2 = (!r2 && i2 || t2).__k = _(k, null, [u2]), o2 || p, p, t2.namespaceURI, !r2 && i2 ? [i2] : o2 ? null : t2.firstChild ? n.call(t2.childNodes) : null, e2, !r2 && i2 ? i2 : o2 ? o2.__e : t2.firstChild, r2, f2), z(e2, u2, f2);
}
function G(n2, l2) {
  E(n2, l2, G);
}
function K(n2) {
  function l2(n3) {
    var u2, t2;
    return this.getChildContext || (u2 = new Set, (t2 = {})[l2.__c] = this, this.getChildContext = function() {
      return t2;
    }, this.componentWillUnmount = function() {
      u2 = null;
    }, this.shouldComponentUpdate = function(n4) {
      this.props.value != n4.value && u2.forEach(function(n5) {
        n5.__e = true, M(n5);
      });
    }, this.sub = function(n4) {
      u2.add(n4);
      var l3 = n4.componentWillUnmount;
      n4.componentWillUnmount = function() {
        u2 && u2.delete(n4), l3 && l3.call(n4);
      };
    }), n3.children;
  }
  return l2.__c = "__cC" + h++, l2.__ = n2, l2.Provider = l2.__l = (l2.Consumer = function(n3, l3) {
    return n3.children(l3);
  }).contextType = l2, l2;
}
n = v.slice, l = { __e: function(n2, l2, u2, t2) {
  for (var i2, r2, o2;l2 = l2.__; )
    if ((i2 = l2.__c) && !i2.__)
      try {
        if ((r2 = i2.constructor) && r2.getDerivedStateFromError != null && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), i2.componentDidCatch != null && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2)
          return i2.__E = i2;
      } catch (l3) {
        n2 = l3;
      }
  throw n2;
} }, u = 0, t = function(n2) {
  return n2 != null && n2.constructor == null;
}, x.prototype.setState = function(n2, l2) {
  var u2;
  u2 = this.__s != null && this.__s != this.state ? this.__s : this.__s = d({}, this.state), typeof n2 == "function" && (n2 = n2(d({}, u2), this.props)), n2 && d(u2, n2), n2 != null && this.__v && (l2 && this._sb.push(l2), M(this));
}, x.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
}, x.prototype.render = k, i = [], o = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, $.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = F(false), a = F(true), h = 0;

// node_modules/.deno/preact@10.26.9/node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = l;
var e2 = c2.__b;
var a2 = c2.__r;
var v2 = c2.diffed;
var l2 = c2.__c;
var m2 = c2.unmount;
var s2 = c2.__;
function p2(n2, t3) {
  c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;
  var u3 = r2.__H || (r2.__H = { __: [], __h: [] });
  return n2 >= u3.__.length && u3.__.push({}), u3.__[n2];
}
function d2(n2) {
  return o2 = 1, h2(D2, n2);
}
function h2(n2, u3, i3) {
  var o3 = p2(t2++, 2);
  if (o3.t = n2, !o3.__c && (o3.__ = [i3 ? i3(u3) : D2(undefined, u3), function(n3) {
    var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
    t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
  }], o3.__c = r2, !r2.__f)) {
    var f3 = function(n3, t3, r3) {
      if (!o3.__c.__H)
        return true;
      var u4 = o3.__c.__H.__.filter(function(n4) {
        return !!n4.__c;
      });
      if (u4.every(function(n4) {
        return !n4.__N;
      }))
        return !c3 || c3.call(this, n3, t3, r3);
      var i4 = o3.__c.props !== n3;
      return u4.forEach(function(n4) {
        if (n4.__N) {
          var t4 = n4.__[0];
          n4.__ = n4.__N, n4.__N = undefined, t4 !== n4.__[0] && (i4 = true);
        }
      }), c3 && c3.call(this, n3, t3, r3) || i4;
    };
    r2.__f = true;
    var { shouldComponentUpdate: c3, componentWillUpdate: e3 } = r2;
    r2.componentWillUpdate = function(n3, t3, r3) {
      if (this.__e) {
        var u4 = c3;
        c3 = undefined, f3(n3, t3, r3), c3 = u4;
      }
      e3 && e3.call(this, n3, t3, r3);
    }, r2.shouldComponentUpdate = f3;
  }
  return o3.__N || o3.__;
}
function y2(n2, u3) {
  var i3 = p2(t2++, 3);
  !c2.__s && C2(i3.__H, u3) && (i3.__ = n2, i3.u = u3, r2.__H.__h.push(i3));
}
function A2(n2) {
  return o2 = 5, T2(function() {
    return { current: n2 };
  }, []);
}
function T2(n2, r3) {
  var u3 = p2(t2++, 7);
  return C2(u3.__H, r3) && (u3.__ = n2(), u3.__H = r3, u3.__h = n2), u3.__;
}
function j2() {
  for (var n2;n2 = f2.shift(); )
    if (n2.__P && n2.__H)
      try {
        n2.__H.__h.forEach(z2), n2.__H.__h.forEach(B2), n2.__H.__h = [];
      } catch (t3) {
        n2.__H.__h = [], c2.__e(t3, n2.__v);
      }
}
c2.__b = function(n2) {
  r2 = null, e2 && e2(n2);
}, c2.__ = function(n2, t3) {
  n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), s2 && s2(n2, t3);
}, c2.__r = function(n2) {
  a2 && a2(n2), t2 = 0;
  var i3 = (r2 = n2.__c).__H;
  i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = undefined;
  })) : (i3.__h.forEach(z2), i3.__h.forEach(B2), i3.__h = [], t2 = 0)), u2 = r2;
}, c2.diffed = function(n2) {
  v2 && v2(n2);
  var t3 = n2.__c;
  t3 && t3.__H && (t3.__H.__h.length && (f2.push(t3) !== 1 && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.forEach(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = undefined;
  })), u2 = r2 = null;
}, c2.__c = function(n2, t3) {
  t3.some(function(n3) {
    try {
      n3.__h.forEach(z2), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B2(n4);
      });
    } catch (r3) {
      t3.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t3 = [], c2.__e(r3, n3.__v);
    }
  }), l2 && l2(n2, t3);
}, c2.unmount = function(n2) {
  m2 && m2(n2);
  var t3, r3 = n2.__c;
  r3 && r3.__H && (r3.__H.__.forEach(function(n3) {
    try {
      z2(n3);
    } catch (n4) {
      t3 = n4;
    }
  }), r3.__H = undefined, t3 && c2.__e(t3, r3.__v));
};
var k2 = typeof requestAnimationFrame == "function";
function w2(n2) {
  var t3, r3 = function() {
    clearTimeout(u3), k2 && cancelAnimationFrame(t3), setTimeout(n2);
  }, u3 = setTimeout(r3, 35);
  k2 && (t3 = requestAnimationFrame(r3));
}
function z2(n2) {
  var t3 = r2, u3 = n2.__c;
  typeof u3 == "function" && (n2.__c = undefined, u3()), r2 = t3;
}
function B2(n2) {
  var t3 = r2;
  n2.__c = n2.__(), r2 = t3;
}
function C2(n2, t3) {
  return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
    return t4 !== n2[r3];
  });
}
function D2(n2, t3) {
  return typeof t3 == "function" ? t3(n2) : t3;
}
// node_modules/.deno/preact@10.26.9/node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f3 = 0;
var i3 = Array.isArray;
function u3(e3, t3, n2, o3, i4, u4) {
  t3 || (t3 = {});
  var a3, c3, p3 = t3;
  if ("ref" in p3)
    for (c3 in p3 = {}, t3)
      c3 == "ref" ? a3 = t3[c3] : p3[c3] = t3[c3];
  var l3 = { type: e3, props: p3, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: undefined, __v: --f3, __i: -1, __u: 0, __source: i4, __self: u4 };
  if (typeof e3 == "function" && (a3 = e3.defaultProps))
    for (c3 in a3)
      p3[c3] === undefined && (p3[c3] = a3[c3]);
  return l.vnode && l.vnode(l3), l3;
}

// public/icons/icons.tsx
var defaultContext = {
  color: undefined,
  size: undefined,
  class: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var defaultIconContext = K && K(defaultContext);
var CAMEL_PROPS = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
var CAMEL_REPLACE = /[A-Z0-9]/g;
function filterKebabCase(attrs) {
  const newAttrs = {};
  for (const key in attrs) {
    if (key.indexOf("-") === -1 && CAMEL_PROPS.test(key))
      newAttrs[key.replace(CAMEL_REPLACE, "-$&").toLowerCase()] = attrs[key];
    else
      newAttrs[key] = attrs[key];
  }
  return newAttrs;
}
function IconBase(props) {
  const elem = (conf) => {
    const { attr, size, title, class: clazz, className, ...svgProps } = props;
    let computedClazz = clazz || className || "";
    const computedSize = size || conf.size || "1em";
    if (conf.class) {
      computedClazz = `${computedClazz} ${conf.class}`;
    }
    if (conf.className) {
      computedClazz = `${computedClazz} ${conf.className}`;
    }
    let attrs = {
      stroke: conf.stroke || "currentColor",
      fill: conf.fill || "currentColor",
      strokeWidth: conf.strokeWidth || 0,
      class: computedClazz,
      ...conf.attr,
      ...attr,
      ...svgProps,
      height: computedSize,
      width: computedSize
    };
    attrs = filterKebabCase(attrs);
    return /* @__PURE__ */ u3("svg", {
      ...attrs,
      style: filterKebabCase({
        color: props.color || conf.color,
        ...conf.style,
        ...props.style
      }),
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        title && /* @__PURE__ */ u3("title", {
          children: title
        }, undefined, false, undefined, this),
        props.children
      ]
    }, undefined, true, undefined, this);
  };
  return defaultIconContext !== undefined ? /* @__PURE__ */ u3(defaultIconContext.Consumer, {
    children: (conf) => elem(conf)
  }, undefined, false, undefined, this) : elem(defaultIconContext);
}
function Tree2Element(tree) {
  return tree && tree.map((node, i4) => _(node.tag, { key: i4, ...filterKebabCase(node.attr) }, Tree2Element(node.child || [])));
}
function GenIcon(data) {
  return (props) => /* @__PURE__ */ u3(IconBase, {
    attr: { ...data.attr },
    ...props,
    children: Tree2Element(data.child || [])
  }, undefined, false, undefined, this);
}
function IoMdHome(props) {
  return GenIcon({ tag: "svg", attr: { viewBox: "0 0 512 512" }, child: [{ tag: "path", attr: { d: "M208 448V320h96v128h97.6V256H464L256 64 48 256h62.4v192z" } }] })(props);
}
function MdOutlineKeyboardReturn(props) {
  return GenIcon({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { fill: "none", d: "M0 0h24v24H0V0z" } }, { tag: "path", attr: { d: "M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7h-2z" }, child: [] }] })(props);
}
function FaPowerOff(props) {
  return GenIcon({ tag: "svg", attr: { viewBox: "0 0 512 512" }, child: [{ tag: "path", attr: { d: "M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 224c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z" } }] })(props);
}

// public/services/KeyCodes.ts
var KeyCodesMap = {
  KEYCODE_UNKNOWN: 0,
  KEYCODE_SOFT_LEFT: 1,
  KEYCODE_SOFT_RIGHT: 2,
  KEYCODE_HOME: 3,
  KEYCODE_BACK: 4,
  KEYCODE_CALL: 5,
  KEYCODE_ENDCALL: 6,
  KEYCODE_0: 7,
  KEYCODE_1: 8,
  KEYCODE_2: 9,
  KEYCODE_3: 10,
  KEYCODE_4: 11,
  KEYCODE_5: 12,
  KEYCODE_6: 13,
  KEYCODE_7: 14,
  KEYCODE_8: 15,
  KEYCODE_9: 16,
  KEYCODE_STAR: 17,
  KEYCODE_POUND: 18,
  KEYCODE_DPAD_UP: 19,
  KEYCODE_DPAD_DOWN: 20,
  KEYCODE_DPAD_LEFT: 21,
  KEYCODE_DPAD_RIGHT: 22,
  KEYCODE_DPAD_CENTER: 23,
  KEYCODE_VOLUME_UP: 24,
  KEYCODE_VOLUME_DOWN: 25,
  KEYCODE_POWER: 26,
  KEYCODE_CAMERA: 27,
  KEYCODE_CLEAR: 28,
  KEYCODE_A: 29,
  KEYCODE_B: 30,
  KEYCODE_C: 31,
  KEYCODE_D: 32,
  KEYCODE_E: 33,
  KEYCODE_F: 34,
  KEYCODE_G: 35,
  KEYCODE_H: 36,
  KEYCODE_I: 37,
  KEYCODE_J: 38,
  KEYCODE_K: 39,
  KEYCODE_L: 40,
  KEYCODE_M: 41,
  KEYCODE_N: 42,
  KEYCODE_O: 43,
  KEYCODE_P: 44,
  KEYCODE_Q: 45,
  KEYCODE_R: 46,
  KEYCODE_S: 47,
  KEYCODE_T: 48,
  KEYCODE_U: 49,
  KEYCODE_V: 50,
  KEYCODE_W: 51,
  KEYCODE_X: 52,
  KEYCODE_Y: 53,
  KEYCODE_Z: 54,
  KEYCODE_COMMA: 55,
  KEYCODE_PERIOD: 56,
  KEYCODE_ALT_LEFT: 57,
  KEYCODE_ALT_RIGHT: 58,
  KEYCODE_SHIFT_LEFT: 59,
  KEYCODE_SHIFT_RIGHT: 60,
  KEYCODE_TAB: 61,
  KEYCODE_SPACE: 62,
  KEYCODE_SYM: 63,
  KEYCODE_EXPLORER: 64,
  KEYCODE_ENVELOPE: 65,
  KEYCODE_ENTER: 66,
  KEYCODE_DEL: 67,
  KEYCODE_GRAVE: 68,
  KEYCODE_MINUS: 69,
  KEYCODE_EQUALS: 70,
  KEYCODE_LEFT_BRACKET: 71,
  KEYCODE_RIGHT_BRACKET: 72,
  KEYCODE_BACKSLASH: 73,
  KEYCODE_SEMICOLON: 74,
  KEYCODE_APOSTROPHE: 75,
  KEYCODE_SLASH: 76,
  KEYCODE_AT: 77,
  KEYCODE_NUM: 78,
  KEYCODE_HEADSETHOOK: 79,
  KEYCODE_FOCUS: 80,
  KEYCODE_PLUS: 81,
  KEYCODE_MENU: 82,
  KEYCODE_NOTIFICATION: 83,
  KEYCODE_SEARCH: 84,
  KEYCODE_MEDIA_PLAY_PAUSE: 85,
  KEYCODE_MEDIA_STOP: 86,
  KEYCODE_MEDIA_NEXT: 87,
  KEYCODE_MEDIA_PREVIOUS: 88,
  KEYCODE_MEDIA_REWIND: 89,
  KEYCODE_MEDIA_FAST_FORWARD: 90,
  KEYCODE_MUTE: 91,
  KEYCODE_PAGE_UP: 92,
  KEYCODE_PAGE_DOWN: 93,
  KEYCODE_PICTSYMBOLS: 94,
  KEYCODE_SWITCH_CHARSET: 95,
  KEYCODE_BUTTON_A: 96,
  KEYCODE_BUTTON_B: 97,
  KEYCODE_BUTTON_C: 98,
  KEYCODE_BUTTON_X: 99,
  KEYCODE_BUTTON_Y: 100,
  KEYCODE_BUTTON_Z: 101,
  KEYCODE_BUTTON_L1: 102,
  KEYCODE_BUTTON_R1: 103,
  KEYCODE_BUTTON_L2: 104,
  KEYCODE_BUTTON_R2: 105,
  KEYCODE_BUTTON_THUMBL: 106,
  KEYCODE_BUTTON_THUMBR: 107,
  KEYCODE_BUTTON_START: 108,
  KEYCODE_BUTTON_SELECT: 109,
  KEYCODE_BUTTON_MODE: 110,
  KEYCODE_ESCAPE: 111,
  KEYCODE_FORWARD_DEL: 112,
  KEYCODE_CTRL_LEFT: 113,
  KEYCODE_CTRL_RIGHT: 114,
  KEYCODE_CAPS_LOCK: 115,
  KEYCODE_SCROLL_LOCK: 116,
  KEYCODE_META_LEFT: 117,
  KEYCODE_META_RIGHT: 118,
  KEYCODE_FUNCTION: 119,
  KEYCODE_SYSRQ: 120,
  KEYCODE_BREAK: 121,
  KEYCODE_MOVE_HOME: 122,
  KEYCODE_MOVE_END: 123,
  KEYCODE_INSERT: 124,
  KEYCODE_FORWARD: 125,
  KEYCODE_MEDIA_PLAY: 126,
  KEYCODE_MEDIA_PAUSE: 127,
  KEYCODE_MEDIA_CLOSE: 128,
  KEYCODE_MEDIA_EJECT: 129,
  KEYCODE_MEDIA_RECORD: 130,
  KEYCODE_F1: 131,
  KEYCODE_F2: 132,
  KEYCODE_F3: 133,
  KEYCODE_F4: 134,
  KEYCODE_F5: 135,
  KEYCODE_F6: 136,
  KEYCODE_F7: 137,
  KEYCODE_F8: 138,
  KEYCODE_F9: 139,
  KEYCODE_F10: 140,
  KEYCODE_F11: 141,
  KEYCODE_F12: 142,
  KEYCODE_NUM_LOCK: 143,
  KEYCODE_NUMPAD_0: 144,
  KEYCODE_NUMPAD_1: 145,
  KEYCODE_NUMPAD_2: 146,
  KEYCODE_NUMPAD_3: 147,
  KEYCODE_NUMPAD_4: 148,
  KEYCODE_NUMPAD_5: 149,
  KEYCODE_NUMPAD_6: 150,
  KEYCODE_NUMPAD_7: 151,
  KEYCODE_NUMPAD_8: 152,
  KEYCODE_NUMPAD_9: 153,
  KEYCODE_NUMPAD_DIVIDE: 154,
  KEYCODE_NUMPAD_MULTIPLY: 155,
  KEYCODE_NUMPAD_SUBTRACT: 156,
  KEYCODE_NUMPAD_ADD: 157,
  KEYCODE_NUMPAD_DOT: 158,
  KEYCODE_NUMPAD_COMMA: 159,
  KEYCODE_NUMPAD_ENTER: 160,
  KEYCODE_NUMPAD_EQUALS: 161,
  KEYCODE_NUMPAD_LEFT_PAREN: 162,
  KEYCODE_NUMPAD_RIGHT_PAREN: 163,
  KEYCODE_VOLUME_MUTE: 164,
  KEYCODE_INFO: 165,
  KEYCODE_CHANNEL_UP: 166,
  KEYCODE_CHANNEL_DOWN: 167,
  KEYCODE_ZOOM_IN: 168,
  KEYCODE_ZOOM_OUT: 169,
  KEYCODE_TV: 170,
  KEYCODE_WINDOW: 171,
  KEYCODE_GUIDE: 172,
  KEYCODE_DVR: 173,
  KEYCODE_BOOKMARK: 174,
  KEYCODE_CAPTIONS: 175,
  KEYCODE_SETTINGS: 176,
  KEYCODE_TV_POWER: 177,
  KEYCODE_TV_INPUT: 178,
  KEYCODE_STB_POWER: 179,
  KEYCODE_STB_INPUT: 180,
  KEYCODE_AVR_POWER: 181,
  KEYCODE_AVR_INPUT: 182,
  KEYCODE_PROG_RED: 183,
  KEYCODE_PROG_GREEN: 184,
  KEYCODE_PROG_YELLOW: 185,
  KEYCODE_PROG_BLUE: 186,
  KEYCODE_APP_SWITCH: 187,
  KEYCODE_BUTTON_1: 188,
  KEYCODE_BUTTON_2: 189,
  KEYCODE_BUTTON_3: 190,
  KEYCODE_BUTTON_4: 191,
  KEYCODE_BUTTON_5: 192,
  KEYCODE_BUTTON_6: 193,
  KEYCODE_BUTTON_7: 194,
  KEYCODE_BUTTON_8: 195,
  KEYCODE_BUTTON_9: 196,
  KEYCODE_BUTTON_10: 197,
  KEYCODE_BUTTON_11: 198,
  KEYCODE_BUTTON_12: 199,
  KEYCODE_BUTTON_13: 200,
  KEYCODE_BUTTON_14: 201,
  KEYCODE_BUTTON_15: 202,
  KEYCODE_BUTTON_16: 203,
  KEYCODE_LANGUAGE_SWITCH: 204,
  KEYCODE_MANNER_MODE: 205,
  KEYCODE_3D_MODE: 206,
  KEYCODE_CONTACTS: 207,
  KEYCODE_CALENDAR: 208,
  KEYCODE_MUSIC: 209,
  KEYCODE_CALCULATOR: 210,
  KEYCODE_ZENKAKU_HANKAKU: 211,
  KEYCODE_EISU: 212,
  KEYCODE_MUHENKAN: 213,
  KEYCODE_HENKAN: 214,
  KEYCODE_KATAKANA_HIRAGANA: 215,
  KEYCODE_YEN: 216,
  KEYCODE_RO: 217,
  KEYCODE_KANA: 218,
  KEYCODE_ASSIST: 219,
  KEYCODE_BRIGHTNESS_DOWN: 220,
  KEYCODE_BRIGHTNESS_UP: 221,
  KEYCODE_MEDIA_AUDIO_TRACK: 222,
  KEYCODE_SLEEP: 223,
  KEYCODE_WAKEUP: 224,
  KEYCODE_PAIRING: 225,
  KEYCODE_MEDIA_TOP_MENU: 226,
  KEYCODE_11: 227,
  KEYCODE_12: 228,
  KEYCODE_LAST_CHANNEL: 229,
  KEYCODE_TV_DATA_SERVICE: 230,
  KEYCODE_VOICE_ASSIST: 231,
  KEYCODE_TV_RADIO_SERVICE: 232,
  KEYCODE_TV_TELETEXT: 233,
  KEYCODE_TV_NUMBER_ENTRY: 234,
  KEYCODE_TV_TERRESTRIAL_ANALOG: 235,
  KEYCODE_TV_TERRESTRIAL_DIGITAL: 236,
  KEYCODE_TV_SATELLITE: 237,
  KEYCODE_TV_SATELLITE_BS: 238,
  KEYCODE_TV_SATELLITE_CS: 239,
  KEYCODE_TV_SATELLITE_SERVICE: 240,
  KEYCODE_TV_NETWORK: 241,
  KEYCODE_TV_ANTENNA_CABLE: 242,
  KEYCODE_TV_INPUT_HDMI_1: 243,
  KEYCODE_TV_INPUT_HDMI_2: 244,
  KEYCODE_TV_INPUT_HDMI_3: 245,
  KEYCODE_TV_INPUT_HDMI_4: 246,
  KEYCODE_TV_INPUT_COMPOSITE_1: 247,
  KEYCODE_TV_INPUT_COMPOSITE_2: 248,
  KEYCODE_TV_INPUT_COMPONENT_1: 249,
  KEYCODE_TV_INPUT_COMPONENT_2: 250,
  KEYCODE_TV_INPUT_VGA_1: 251,
  KEYCODE_TV_AUDIO_DESCRIPTION: 252,
  KEYCODE_TV_AUDIO_DESCRIPTION_MIX_UP: 253,
  KEYCODE_TV_AUDIO_DESCRIPTION_MIX_DOWN: 254,
  KEYCODE_TV_ZOOM_MODE: 255,
  KEYCODE_TV_CONTENTS_MENU: 256,
  KEYCODE_TV_MEDIA_CONTEXT_MENU: 257,
  KEYCODE_TV_TIMER_PROGRAMMING: 258,
  KEYCODE_HELP: 259,
  KEYCODE_NAVIGATE_PREVIOUS: 260,
  KEYCODE_NAVIGATE_NEXT: 261,
  KEYCODE_NAVIGATE_IN: 262,
  KEYCODE_NAVIGATE_OUT: 263,
  KEYCODE_STEM_PRIMARY: 264,
  KEYCODE_STEM_1: 265,
  KEYCODE_STEM_2: 266,
  KEYCODE_STEM_3: 267,
  KEYCODE_DPAD_UP_LEFT: 268,
  KEYCODE_DPAD_DOWN_LEFT: 269,
  KEYCODE_DPAD_UP_RIGHT: 270,
  KEYCODE_DPAD_DOWN_RIGHT: 271,
  KEYCODE_MEDIA_SKIP_FORWARD: 272,
  KEYCODE_MEDIA_SKIP_BACKWARD: 273,
  KEYCODE_MEDIA_STEP_FORWARD: 274,
  KEYCODE_MEDIA_STEP_BACKWARD: 275,
  KEYCODE_SOFT_SLEEP: 276,
  KEYCODE_CUT: 277,
  KEYCODE_COPY: 278,
  KEYCODE_PASTE: 279,
  KEYCODE_SYSTEM_NAVIGATION_UP: 280,
  KEYCODE_SYSTEM_NAVIGATION_DOWN: 281,
  KEYCODE_SYSTEM_NAVIGATION_LEFT: 282,
  KEYCODE_SYSTEM_NAVIGATION_RIGHT: 283,
  KEYCODE_ALL_APPS: 284,
  KEYCODE_REFRESH: 285,
  KEYCODE_THUMBS_UP: 286,
  KEYCODE_THUMBS_DOWN: 287,
  KEYCODE_PROFILE_SWITCH: 288,
  KEYCODE_VIDEO_APP_1: 289,
  KEYCODE_VIDEO_APP_2: 290,
  KEYCODE_VIDEO_APP_3: 291,
  KEYCODE_VIDEO_APP_4: 292,
  KEYCODE_VIDEO_APP_5: 293,
  KEYCODE_VIDEO_APP_6: 294,
  KEYCODE_VIDEO_APP_7: 295,
  KEYCODE_VIDEO_APP_8: 296,
  KEYCODE_FEATURED_APP_1: 297,
  KEYCODE_FEATURED_APP_2: 298,
  KEYCODE_FEATURED_APP_3: 299,
  KEYCODE_FEATURED_APP_4: 300,
  KEYCODE_DEMO_APP_1: 301,
  KEYCODE_DEMO_APP_2: 302,
  KEYCODE_DEMO_APP_3: 303,
  KEYCODE_DEMO_APP_4: 304,
  KEYCODE_KEYBOARD_BACKLIGHT_DOWN: 305,
  KEYCODE_KEYBOARD_BACKLIGHT_UP: 306,
  KEYCODE_KEYBOARD_BACKLIGHT_TOGGLE: 307,
  KEYCODE_STYLUS_BUTTON_PRIMARY: 308,
  KEYCODE_STYLUS_BUTTON_SECONDARY: 309,
  KEYCODE_STYLUS_BUTTON_TERTIARY: 310,
  KEYCODE_STYLUS_BUTTON_TAIL: 311,
  KEYCODE_RECENT_APPS: 312,
  KEYCODE_MACRO_1: 313,
  KEYCODE_MACRO_2: 314,
  KEYCODE_MACRO_3: 315,
  KEYCODE_MACRO_4: 316,
  KEYCODE_EMOJI_PICKER: 317,
  KEYCODE_SCREENSHOT: 318,
  KEYCODE_DICTATE: 319,
  KEYCODE_NEW: 320,
  KEYCODE_CLOSE: 321,
  KEYCODE_DO_NOT_DISTURB: 322,
  KEYCODE_PRINT: 323,
  KEYCODE_LOCK: 324,
  KEYCODE_FULLSCREEN: 325,
  KEYCODE_F13: 326,
  KEYCODE_F14: 327,
  KEYCODE_F15: 328,
  KEYCODE_F16: 329,
  KEYCODE_F17: 330,
  KEYCODE_F18: 331,
  KEYCODE_F19: 332,
  KEYCODE_F20: 333,
  KEYCODE_F21: 334,
  KEYCODE_F22: 335,
  KEYCODE_F23: 336,
  KEYCODE_F24: 337
};

// public/services/RemoteDeviceWs.ts
var KEY_MAPPING = {
  Enter: KeyCodesMap.KEYCODE_ENTER,
  Backspace: KeyCodesMap.KEYCODE_DEL,
  ArrowLeft: KeyCodesMap.KEYCODE_DPAD_LEFT,
  ArrowRight: KeyCodesMap.KEYCODE_DPAD_RIGHT,
  ArrowUp: KeyCodesMap.KEYCODE_DPAD_UP,
  ArrowDown: KeyCodesMap.KEYCODE_DPAD_DOWN,
  Tab: KeyCodesMap.KEYCODE_TAB,
  Escape: KeyCodesMap.KEYCODE_ESCAPE,
  ShiftLeft: KeyCodesMap.KEYCODE_SHIFT_LEFT,
  ShiftRight: KeyCodesMap.KEYCODE_SHIFT_RIGHT,
  ControlLeft: KeyCodesMap.KEYCODE_CTRL_LEFT,
  ControlRight: KeyCodesMap.KEYCODE_CTRL_RIGHT,
  CapsLock: KeyCodesMap.KEYCODE_CAPS_LOCK,
  AltLeft: KeyCodesMap.KEYCODE_ALT_LEFT,
  AltRight: KeyCodesMap.KEYCODE_ALT_RIGHT,
  F1: KeyCodesMap.KEYCODE_F1,
  F2: KeyCodesMap.KEYCODE_F2,
  F3: KeyCodesMap.KEYCODE_F3,
  F4: KeyCodesMap.KEYCODE_F4,
  F5: KeyCodesMap.KEYCODE_F5,
  F6: KeyCodesMap.KEYCODE_F6,
  F7: KeyCodesMap.KEYCODE_F7,
  F8: KeyCodesMap.KEYCODE_F8,
  F9: KeyCodesMap.KEYCODE_F9,
  F10: KeyCodesMap.KEYCODE_F10,
  F11: KeyCodesMap.KEYCODE_F11,
  F12: KeyCodesMap.KEYCODE_F12,
  PageUp: KeyCodesMap.KEYCODE_PAGE_UP,
  PageDown: KeyCodesMap.KEYCODE_PAGE_DOWN,
  Home: KeyCodesMap.KEYCODE_MOVE_HOME,
  End: KeyCodesMap.KEYCODE_MOVE_END,
  Insert: KeyCodesMap.KEYCODE_INSERT,
  Delete: KeyCodesMap.KEYCODE_DEL
};

class RemoteDeviceWs {
  phoneWs;
  constructor(baseUrl, token) {
    const phoneUrl = baseUrl.replace(/^http/, "ws");
    this.phoneWs = new WebSocket(phoneUrl);
    this.phoneWs.binaryType = "blob";
    this.phoneWs.onopen = () => {
      const displayMode = "MJPEG";
      const action = "on";
      if (token) {
        this.phoneWs.send(`auth ${token}`);
      }
      this.phoneWs.send(`${displayMode} ${action}`);
    };
    this.phoneWs.onmessage = (message) => {
      if (message.data instanceof Blob) {
        this.onMJPEG(message.data);
      }
    };
    this.phoneWs.onclose = (_e) => {
      console.log("closed");
    };
    this.phoneWs.onerror = (_e) => {
      console.log("error");
    };
  }
  onMJPEG = (_blob) => {};
  screenMouseUp(px, py) {
    this.phoneWs.send(`u ${px.toFixed(4)} ${py.toFixed(4)}`);
  }
  screenMouseDown(px, py) {
    this.phoneWs.send(`d ${px.toFixed(4)} ${py.toFixed(4)}`);
  }
  screenMouseDrag(px, py) {
    this.phoneWs.send(`m ${px.toFixed(4)} ${py.toFixed(4)}`);
  }
  screenMouseOut() {
    this.phoneWs.send(`u`);
  }
  keyPress(keyCode) {
    this.phoneWs.send(`key PRESS ${keyCode}`);
  }
  keyDown(keyCode) {
    this.phoneWs.send(`key DOWN ${keyCode}`);
  }
  keyUp(keyCode) {
    this.phoneWs.send(`key UP ${keyCode}`);
  }
  screenKeypress(event) {
    const { key, code } = event;
    if (key.length > 1) {
      const keycode = KEY_MAPPING[code] || 0;
      if (keycode) {
        this.phoneWs.send(`key press ${keycode}`);
      } else {
        console.log(`need to map ${code}`);
      }
      return;
    } else {
      this.phoneWs.send(`text ${key}`);
    }
  }
  close() {
    this.phoneWs.close();
  }
}

// public/services/RemoteDroidDeviceApi.ts
class RemoteDroidDeviceApi {
  headers;
  baseUrl;
  token;
  constructor(baseUrl, prefix, token) {
    this.baseUrl = `${baseUrl}/device/${prefix}/`;
    const headers = {};
    if (token) {
      const Authorization = `Bearer ${token}`;
      headers.Authorization = Authorization;
    }
    this.headers = headers;
  }
  async getProps(prefixs) {
    const url = new URL(`./props`, this.baseUrl);
    if (prefixs)
      url.searchParams.append("prefix", prefixs);
    const req = await fetch(url, { method: "GET", headers: this.headers });
    return req.json();
  }
  get remoteDeviceWs() {
    return new RemoteDeviceWs(this.baseUrl, this.token);
  }
  async getChromeVersion() {
    const url = new URL("dumpsys/package/com.android.chrome?", this.baseUrl);
    url.searchParams.append("grep", "versionName");
    const req = await fetch(url, { method: "GET", headers: this.headers });
    let text = await req.text();
    text = text.replace(/versionName=/g, "");
    const versions = text.split(/[\r\n]/g).map((a3) => a3.trim()).filter((a3) => a3);
    versions.sort((a3, b) => Number(b.split(".")[0]) - Number(a3.split(".")[0]));
    return versions[0];
  }
}

// public/PhoneScreen.tsx
function PhoneScreen({ baseUrl, serial }) {
  const canvasRef = A2(null);
  const [deviceWs, setDeviceWs] = d2(null);
  const redmoteApi = new RemoteDroidDeviceApi(baseUrl, serial);
  const [deviceProps, setDeviceProps] = d2({});
  y2(() => {
    async function getData() {
      const props = await redmoteApi.getProps("gsm.sim.operator.alpha,ro.product.system.model");
      const chromeVersion = await redmoteApi.getChromeVersion();
      props["chrome.version"] = chromeVersion;
      setDeviceProps(props);
      console.log(props);
    }
    getData();
  }, []);
  y2(() => {
    const canvas = canvasRef.current;
    if (!canvas)
      return;
    let isDragging = false;
    const toPent = (event) => {
      const rect = canvas.getBoundingClientRect();
      let x2 = 0;
      let y3 = 0;
      if (event instanceof MouseEvent || event instanceof Touch) {
        x2 = event.clientX;
        y3 = event.clientY;
      } else if (event instanceof TouchEvent) {
        x2 = event.touches[0].clientX;
        y3 = event.touches[0].clientY;
      } else {
        throw Error("event is not MouseEvent or TouchEvent");
      }
      let px = x2 - rect.left;
      let py = y3 - rect.top;
      px /= rect.width;
      py /= rect.height;
      return [px, py];
    };
    let dragStart = [0, 0];
    const onMouseDown = (e3) => {
      isDragging = true;
      dragStart = toPent(e3);
      deviceWs?.screenMouseDown(...dragStart);
    };
    const onMouseMove = (e3) => {
      if (!isDragging)
        return;
      deviceWs?.screenMouseDrag(...toPent(e3));
    };
    const onMouseUp = (e3) => {
      if (!isDragging)
        return;
      isDragging = false;
      deviceWs?.screenMouseUp(...toPent(e3));
    };
    const onTouchStart = (e3) => {
      if (e3.touches.length !== 1)
        return;
      dragStart = toPent(e3);
      isDragging = true;
      deviceWs?.screenMouseDown(...dragStart);
    };
    const onTouchEnd = (e3) => {
      if (!isDragging)
        return;
      isDragging = false;
      const touch = e3.changedTouches && e3.changedTouches[0] || null;
      if (!touch)
        return;
      deviceWs?.screenMouseUp(...toPent(touch));
    };
    const onKeyPress = (e3) => {
      deviceWs?.screenKeypress(e3);
    };
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("keypress", onKeyPress);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("keypress", onKeyPress);
    };
  }, [canvasRef, deviceWs]);
  y2(() => {
    if (!serial)
      return;
    console.log("serial", serial);
    const ws = redmoteApi.remoteDeviceWs;
    setDeviceWs(ws);
    console.log("Set setDeviceWs");
    ws.onMJPEG = (blob) => {
      const img = new window.Image;
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        }
        URL.revokeObjectURL(img.src);
      };
    };
    return () => {
      console.log("Close setDeviceWs");
      ws.close();
    };
  }, [serial]);
  return /* @__PURE__ */ u3("div", {
    style: { width: "100%", display: "flex", flexDirection: "column", alignItems: "center" },
    children: [
      /* @__PURE__ */ u3("div", {
        style: { width: "100%", textAlign: "center", fontWeight: "bold", margin: "12px 0" },
        children: [
          "serial:",
          serial
        ]
      }, undefined, true, undefined, this),
      /* @__PURE__ */ u3("div", {
        style: { display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center", width: "100%" },
        children: [
          /* @__PURE__ */ u3("div", {
            style: { display: "flex", justifyContent: "center", alignItems: "center" },
            children: /* @__PURE__ */ u3("canvas", {
              ref: canvasRef,
              tabIndex: 0,
              style: {
                touchAction: "none",
                userSelect: "none",
                width: "20vw"
              }
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          /* @__PURE__ */ u3("div", {
            style: { display: "flex", flexDirection: "column", marginLeft: 12, gap: 6 },
            children: [
              /* @__PURE__ */ u3("button", {
                type: "button",
                style: { padding: "4px 8px" },
                onClick: () => deviceWs?.keyPress(KeyCodesMap.KEYCODE_BACK),
                children: /* @__PURE__ */ u3(MdOutlineKeyboardReturn, {
                  size: 24
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u3("button", {
                type: "button",
                style: { padding: "4px 8px" },
                onClick: () => deviceWs?.keyPress(KeyCodesMap.KEYCODE_HOME),
                children: /* @__PURE__ */ u3(IoMdHome, {
                  size: 24
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u3("button", {
                type: "button",
                style: { padding: "4px 8px" },
                onClick: () => deviceWs?.keyPress(KeyCodesMap.KEYCODE_POWER),
                children: /* @__PURE__ */ u3(FaPowerOff, {
                  size: 24
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ u3("div", {
            style: { display: "flex", flexDirection: "column", marginLeft: 12, gap: 6 },
            children: [
              /* @__PURE__ */ u3("div", {
                style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 6 },
                children: [
                  /* @__PURE__ */ u3("div", {
                    style: { fontWeight: "bold" },
                    children: "Model:"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ u3("div", {
                    children: deviceProps["ro.product.system.model"]
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ u3("div", {
                style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 6 },
                children: [
                  /* @__PURE__ */ u3("div", {
                    style: { fontWeight: "bold" },
                    children: "Operator:"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ u3("div", {
                    children: deviceProps["gsm.sim.operator.alpha"]
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ u3("div", {
                style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 6 },
                children: [
                  /* @__PURE__ */ u3("div", {
                    style: { fontWeight: "bold" },
                    children: "Chrome:"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ u3("div", {
                    children: deviceProps["chrome.version"]
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

// public/services/RemoteDroidApi.ts
class RemoteDroidApi {
  baseUrl;
  #prefix;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    if (!baseUrl) {
      const { protocol, host } = window.location;
      this.baseUrl = `${protocol}//${host}`;
    }
  }
  async getPrefix() {
    if (this.#prefix)
      return this.#prefix;
    const url = new URL("/prefix", this.baseUrl);
    const response = await fetch(url);
    const data = await response.json();
    this.#prefix = data.prefix;
    return this.#prefix;
  }
  async listDevices() {
    const prefix = await this.getPrefix();
    const url = new URL(`${prefix}/device`, this.baseUrl);
    const deviceResponse = await fetch(url);
    const deviceData = await deviceResponse.json();
    return deviceData;
  }
}

// public/App.tsx
function App() {
  const [prefix, setPrefix] = d2("");
  const [device, setDevice] = d2(null);
  const [error, setError] = d2(null);
  y2(() => {
    const fetchData = async () => {
      try {
        const remoteDroisApi = new RemoteDroidApi;
        const deviceData = await remoteDroisApi.listDevices();
        const baseUrl = remoteDroisApi.baseUrl;
        const prefix2 = await remoteDroisApi.getPrefix();
        setPrefix(baseUrl + prefix2);
        setDevice(deviceData);
      } catch (e3) {
        if (e3 instanceof Error) {
          setError(e3.message);
        } else {
          setError(`${e3}`);
        }
      }
    };
    fetchData();
  }, []);
  if (error)
    return /* @__PURE__ */ u3("div", {
      children: [
        "Error: ",
        error
      ]
    }, undefined, true, undefined, this);
  if (!device)
    return /* @__PURE__ */ u3("div", {
      children: "Loading devices..."
    }, undefined, false, undefined, this);
  return /* @__PURE__ */ u3("div", {
    children: device.map((d3) => /* @__PURE__ */ u3(PhoneScreen, {
      baseUrl: prefix,
      serial: d3.id
    }, undefined, false, undefined, this))
  }, undefined, false, undefined, this);
}

// public/client.tsx
G(/* @__PURE__ */ u3(App, {}, undefined, false, undefined, this), document.body.querySelector("main > div") ?? document.body);
