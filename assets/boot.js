(function(){try{var t=localStorage.getItem('nk-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
/* Launch placeholders. [DOMAIN]/[PHONE]/[NAME] stay literal in the repo so nothing
   is invented; when the page is served from a real origin they resolve here, which
   keeps canonical, og:url and the JSON-LD graph valid in production.

   The site is flat — every page sits in one directory — but that directory is not
   necessarily the origin root: GitHub Pages serves a project repo from /<repo>/.
   So resolve against the directory this page is actually in, not the bare origin,
   or every canonical points at a site that isn't this one. */
(function(){
  var o = location.origin;
  if (!o || o === 'null' || location.protocol === 'file:') return;

  var dir  = location.pathname.replace(/[^/]*$/, '');      // '/' or '/STS/'
  var base = o + dir.replace(/\/$/, '');                   // no trailing slash
  var here = o + location.pathname.replace(/index\.html$/, '');

  var c = document.querySelector('link[rel=canonical]');
  if (c) c.href = here;
  var g = document.querySelector('meta[property="og:url"]');
  if (g) g.content = here;
  var im = document.querySelector('meta[property="og:image"]');
  if (im && im.content.indexOf('[DOMAIN]') > -1)
    im.content = im.content.split('https://[DOMAIN]').join(base);

  var ld = document.querySelector('script[type="application/ld+json"]');
  if (!ld) return;
  var t = ld.textContent;
  if (t.indexOf('[DOMAIN]') < 0) return;
  t = t.split('https://[DOMAIN]').join(base);
  try {
    var j = JSON.parse(t);
    (function strip(x){                       // drop nodes still holding placeholders
      if (Array.isArray(x)) return x.forEach(strip);
      if (x && typeof x === 'object') for (var k in x){
        if (typeof x[k] === 'string' && /\[[A-Z][A-Z ]*\]/.test(x[k])) delete x[k];
        else strip(x[k]);
      }
    })(j);
    ld.textContent = JSON.stringify(j);
  } catch(e){}
})();
