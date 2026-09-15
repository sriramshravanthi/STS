(function(){try{var t=localStorage.getItem('nk-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
/* Launch placeholders. [DOMAIN]/[PHONE]/[NAME] stay literal in the repo so nothing
   is invented; when the page is served from a real origin they resolve here, which
   keeps canonical, og:url and the JSON-LD graph valid in production. */
(function(){
  var o = location.origin;
  if (!o || o === 'null' || location.protocol === 'file:') return;
  var c = document.querySelector('link[rel=canonical]');
  if (c) c.href = o + '/';
  var g = document.querySelector('meta[property="og:url"]');
  if (g) g.content = o + '/';
  var ld = document.querySelector('script[type="application/ld+json"]');
  if (!ld) return;
  var t = ld.textContent;
  if (t.indexOf('[DOMAIN]') < 0) return;
  t = t.split('https://[DOMAIN]').join(o);
  try {
    var j = JSON.parse(t);
    (function strip(x){                       // drop nodes still holding placeholders
      if (Array.isArray(x)) return x.forEach(strip);
      if (x && typeof x === 'object') for (var k in x){
        if (typeof x[k] === 'string' && /\[[A-Z]+\]/.test(x[k])) delete x[k];
        else strip(x[k]);
      }
    })(j);
    ld.textContent = JSON.stringify(j);
  } catch(e){}
})();