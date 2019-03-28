const DETECT = {
  // 是否支持js
  javascript: {
    enabled: function () {
      return !0
    }
  },
  // 是否支持cookie
  cookies: {
    enabled: function () {
      return !!navigator.cookieEnabled
    }
  },
  cookies_third_party: {
    enabled: function () {
      return "enabled" == window.wimb.data.cookies_third_party || "disabled" != window.wimb.data.cookies_third_party && null;
    },
    trigger_set_cookie: function (e) {
      const set_cookie_script_url = '//some_domain_different_with_current_location/set_cookie_script';
      const scriptDom = document.createElement('script');
      scriptDom.src = set_cookie_script_url;  
      // const check_cookie_script_url = '//some_domain_different_with_current_location/check_cookie_script';
      // 加载set_cookie_script_url 返回 javascript，set-cookie 并调用 
      // DETECT.cookies_third_party.cookie_has_now_been_set_by_third_party(check_cookie_script_url);
    },
    cookie_has_now_been_set_by_third_party: function (check_cookie_script_url) {
      const scriptDom = document.createElement('script');
      scriptDom.src = check_cookie_script_url; 
      // 加载check_cookie_script_url，服务端检查是否有cookie，并调用
      // DETECT.cookies_third_party.cookies_test_finished(result);
      document.detachEvent('')
    },
    cookies_test_finished: function (res) {
      
    }
  },
  flash: {
    version_array: function () {
      playerVersion = [0, 0, 0];
      var e, t, i = "Shockwave",
        n = "Flash",
        r = i + " " + n,
        a = "application/x-shockwave-flash",
        l = navigator,
        s = l.plugins,
        o = l.mimeTypes;
      if (s && "object" == typeof s[r]) {
        if ((e = s[r].description) && (!o || !o[a] || o[a].enabledPlugin))
          return e = e.replace(/^.*\s+(\S+\s+\S+$)/, "$1"),
            playerVersion[0] = parseInt(e.replace(/^(.*)\..*$/, "$1"), 10),
            playerVersion[1] = parseInt(e.replace(/^.*\.(.*)\s.*$/, "$1"), 10),
            playerVersion[2] = /[a-zA-Z]/.test(e) ? parseInt(e.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0,
            playerVersion
      } else if (window.ActiveXObject)
        try {
          if ((t = new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) && (e = t.GetVariable("$version")))
            return e = e.split(" ")[1].split(","),
              playerVersion = [parseInt(e[0], 10), parseInt(e[1], 10), parseInt(e[2], 10)],
              playerVersion
        } catch (e) {}
      return !1
    },
    enabled: function () {
      return !1 !== WIMB.detect.flash.version_array()
    },
    version_major: function () {
      return version_array = WIMB.detect.flash.version_array(),
        !1 !== version_array && version_array[0]
    },
    version_full: function () {
      return version_array = WIMB.detect.flash.version_array(),
        !1 !== version_array && version_array[0] + "." + version_array[1] + "." + version_array[2]
    },
    version: function () {
      return version_array = WIMB.detect.flash.version_array(),
        !1 !== version_array && version_array[0] + "." + version_array[1]
    }
  },
  java: {
    _get_version_string: function () {
      WIMB.init.namespace_the_window(),
        window.wimb.deployJava || (window.wimb.deployJava = function () {
          var e = {
              core: ["id", "class", "title", "style"],
              i18n: ["lang", "dir"],
              events: ["onclick", "ondblclick", "onmousedown", "onmouseup", "onmouseover", "onmousemove", "onmouseout", "onkeypress", "onkeydown", "onkeyup"],
              applet: ["codebase", "code", "name", "archive", "object", "width", "height", "alt", "align", "hspace", "vspace"],
              object: ["classid", "codebase", "codetype", "data", "type", "archive", "declare", "standby", "height", "width", "usemap", "name", "tabindex", "align", "border", "hspace", "vspace"]
            },
            o = (e.object.concat(e.core, e.i18n, e.events),
              e.applet.concat(e.core));

          function d(e) {
            t.debug && (console.log ? console.log(e) : alert(e))
          }

          function r(e) {
            var t = "http://java.com/dt-redirect";
            return null == e || 0 == e.length ? t : ("&" == e.charAt(0) && (e = e.substring(1, e.length)),
              t + "?" + e)
          }

          function u(e, t) {
            for (var i = e.length, n = 0; n < i; n++)
              if (e[n] === t)
                return !0;
            return !1
          }
          var t = {
            debug: null,
            version: "20120801",
            firefoxJavaVersion: null,
            myInterval: null,
            preInstallJREList: null,
            returnPage: null,
            brand: null,
            locale: null,
            installType: null,
            EAInstallEnabled: !1,
            EarlyAccessURL: null,
            oldMimeType: "application/npruntime-scriptable-plugin;DeploymentToolkit",
            mimeType: "application/java-deployment-toolkit",
            launchButtonPNG: function () {
              var t = "//java.com/js/webstart.png";
              try {
                return -1 != document.location.protocol.indexOf("http") ? t : "http:" + t
              } catch (e) {
                return "http:" + t
              }
            }(),
            browserName: null,
            browserName2: null,
            getJREs: function () {
              var e = new Array;
              if (this.isPluginInstalled())
                for (var t = this.getPlugin().jvms, i = 0; i < t.getLength(); i++)
                  e[i] = t.get(i).version;
              else {
                var n = this.getBrowser();
                "MSIE" == n ? this.testUsingActiveX("1.7.0") ? e[0] = "1.7.0" : this.testUsingActiveX("1.6.0") ? e[0] = "1.6.0" : this.testUsingActiveX("1.5.0") ? e[0] = "1.5.0" : this.testUsingActiveX("1.4.2") ? e[0] = "1.4.2" : this.testForMSVM() && (e[0] = "1.1") : "Netscape Family" == n && (this.getJPIVersionUsingMimeType(),
                  null != this.firefoxJavaVersion ? e[0] = this.firefoxJavaVersion : this.testUsingMimeTypes("1.7") ? e[0] = "1.7.0" : this.testUsingMimeTypes("1.6") ? e[0] = "1.6.0" : this.testUsingMimeTypes("1.5") ? e[0] = "1.5.0" : this.testUsingMimeTypes("1.4.2") ? e[0] = "1.4.2" : "Safari" == this.browserName2 && (this.testUsingPluginsArray("1.7.0") ? e[0] = "1.7.0" : this.testUsingPluginsArray("1.6") ? e[0] = "1.6.0" : this.testUsingPluginsArray("1.5") ? e[0] = "1.5.0" : this.testUsingPluginsArray("1.4.2") && (e[0] = "1.4.2")))
              }
              if (this.debug)
                for (i = 0; i < e.length; ++i)
                  d("[getJREs()] We claim to have detected Java SE " + e[i]);
              return e
            },
            installJRE: function (e, t) {
              if (this.isPluginInstalled() && this.isAutoInstallEnabled(e)) {
                var i = !1;
                return (i = this.isCallbackSupported() ? this.getPlugin().installJRE(e, t) : this.getPlugin().installJRE(e)) && (this.refresh(),
                    null != this.returnPage && (document.location = this.returnPage)),
                  i
              }
              return this.installLatestJRE()
            },
            isAutoInstallEnabled: function (e) {
              return !!this.isPluginInstalled() && (void 0 === e && (e = null),
                t = e,
                "MSIE" != deployJava.browserName || !!deployJava.compareVersionToPattern(deployJava.getPlugin().version, ["10", "0", "0"], !1, !0) || null != t && ! function (e, t) {
                  if (null == e || 0 == e.length)
                    return !0;
                  var i = e.charAt(e.length - 1);
                  if ("+" != i && "*" != i && -1 != e.indexOf("_") && "_" != i && (e += "*",
                      i = "*"),
                    0 < (e = e.substring(0, e.length - 1)).length) {
                    var n = e.charAt(e.length - 1);
                    "." != n && "_" != n || (e = e.substring(0, e.length - 1))
                  }
                  return "*" == i ? 0 == t.indexOf(e) : "+" == i && e <= t
                }("1.6.0_33+", t));
              var t
            },
            isCallbackSupported: function () {
              return this.isPluginInstalled() && this.compareVersionToPattern(this.getPlugin().version, ["10", "2", "0"], !1, !0)
            },
            installLatestJRE: function (e) {
              if (this.isPluginInstalled() && this.isAutoInstallEnabled()) {
                var t = !1;
                return (t = this.isCallbackSupported() ? this.getPlugin().installLatestJRE(e) : this.getPlugin().installLatestJRE()) && (this.refresh(),
                    null != this.returnPage && (document.location = this.returnPage)),
                  t
              }
              var i = this.getBrowser(),
                n = navigator.platform.toLowerCase();
              return "true" == this.EAInstallEnabled && -1 != n.indexOf("win") && null != this.EarlyAccessURL ? (this.preInstallJREList = this.getJREs(),
                null != this.returnPage && (this.myInterval = setInterval("deployJava.poll()", 3e3)),
                location.href = this.EarlyAccessURL,
                !1) : "MSIE" == i ? this.IEInstall() : "Netscape Family" == i && -1 != n.indexOf("win32") ? this.FFInstall() : (location.href = r((null != this.returnPage ? "&returnPage=" + this.returnPage : "") + (null != this.locale ? "&locale=" + this.locale : "") + (null != this.brand ? "&brand=" + this.brand : "")),
                !1)
            },
            runApplet: function (e, t, i) {
              "undefined" != i && null != i || (i = "1.1");
              var n = i.match("^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$");
              (null == this.returnPage && (this.returnPage = document.location),
                null != n) ? "?" != this.getBrowser() ? this.versionCheck(i + "+") ? this.writeAppletTag(e, t) : this.installJRE(i + "+") && (this.refresh(),
                location.href = document.location,
                this.writeAppletTag(e, t)) : this.writeAppletTag(e, t): d("[runApplet()] Invalid minimumVersion argument to runApplet():" + i)
            },
            writeAppletTag: function (e, t) {
              var i = "<applet ",
                n = "",
                r = !0;
              for (var a in null != t && "object" == typeof t || (t = new Object),
                  e)
                u(o, a.toLowerCase()) ? (i += " " + a + '="' + e[a] + '"',
                  "code" == a && (r = !1)) : t[a] = e[a];
              var l = !1;
              for (var s in t)
                "codebase_lookup" == s && (l = !0),
                "object" != s && "java_object" != s && "java_code" != s || (r = !1),
                n += '<param name="' + s + '" value="' + t[s] + '"/>';
              l || (n += '<param name="codebase_lookup" value="false"/>'),
                r && (i += ' code="dummy"'),
                i += ">",
                document.getElementsByTagName("body")[0].insertAdjacentHTML("afterbegin", i + "\n" + n + "\n</applet>")
            },
            versionCheck: function (e) {
              var t = 0,
                i = e.match("^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?(\\*|\\+)?$");
              if (null != i) {
                for (var n = !1, r = !1, a = new Array, l = 1; l < i.length; ++l)
                  "string" == typeof i[l] && "" != i[l] && (a[t] = i[l],
                    t++);
                "+" == a[a.length - 1] ? (n = !(r = !0),
                  a.length--) : "*" == a[a.length - 1] ? (n = !(r = !1),
                  a.length--) : a.length < 4 && (n = !(r = !1));
                var s = this.getJREs();
                for (l = 0; l < s.length; ++l)
                  if (this.compareVersionToPattern(s[l], a, n, r))
                    return !0;
                return !1
              }
              var o = "Invalid versionPattern passed to versionCheck: " + e;
              return d("[versionCheck()] " + o),
                alert(o),
                !1
            },
            isWebStartInstalled: function (e) {
              if ("?" == this.getBrowser())
                return !0;
              "undefined" != e && null != e || (e = "1.4.2");
              var t = !1;
              return null != e.match("^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$") ? t = this.versionCheck(e + "+") : (d("[isWebStartInstaller()] Invalid minimumVersion argument to isWebStartInstalled(): " + e),
                  t = this.versionCheck("1.4.2+")),
                t
            },
            getJPIVersionUsingMimeType: function () {
              for (var e = 0; e < navigator.mimeTypes.length; ++e) {
                var t = navigator.mimeTypes[e].type.match(/^application\/x-java-applet;jpi-version=(.*)$/);
                if (null != t && (this.firefoxJavaVersion = t[1],
                    "Opera" != this.browserName2))
                  break
              }
            },
            launchWebStartApplication: function (e) {
              navigator.userAgent.toLowerCase();
              if (this.getJPIVersionUsingMimeType(),
                0 == this.isWebStartInstalled("1.7.0") && (0 == this.installJRE("1.7.0+") || 0 == this.isWebStartInstalled("1.7.0")))
                return !1;
              var t = null;
              document.documentURI && (t = document.documentURI),
                null == t && (t = document.URL);
              var i, n = this.getBrowser();
              if ("MSIE" == n ? i = '<object classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93" width="0" height="0"><PARAM name="launchjnlp" value="' + e + '"><PARAM name="docbase" value="' + t + '"></object>' : "Netscape Family" == n && (i = '<embed type="application/x-java-applet;jpi-version=' + this.firefoxJavaVersion + '" width="0" height="0" launchjnlp="' + e + '"docbase="' + t + '" />'),
                "undefined" == document.body || null == document.body)
                document.getElementsByTagName("body")[0].insertAdjacentHTML("afterbegin", i),
                document.location = t;
              else {
                var r = document.createElement("div");
                r.id = "div1",
                  r.style.position = "relative",
                  r.style.left = "-10000px",
                  r.style.margin = "0px auto",
                  r.className = "dynamicDiv",
                  r.innerHTML = i,
                  document.body.appendChild(r)
              }
            },
            createWebStartLaunchButtonEx: function (e, t) {
              null == this.returnPage && (this.returnPage = e);
              var i = "javascript:deployJava.launchWebStartApplication('" + e + "');";
              document.getElementsByTagName("body")[0].insertAdjacentHTML("afterbegin", '<a href="' + i + '" onMouseOver="window.status=\'\'; return true;"><img src="' + this.launchButtonPNG + '" border="0" /></a>')
            },
            createWebStartLaunchButton: function (e, t) {
              null == this.returnPage && (this.returnPage = e);
              var i = "javascript:if (!deployJava.isWebStartInstalled(&quot;" + t + "&quot;)) {if (deployJava.installLatestJRE()) {if (deployJava.launch(&quot;" + e + "&quot;)) {}}} else {if (deployJava.launch(&quot;" + e + "&quot;)) {}}";
              document.getElementsByTagName("body")[0].insertAdjacentHTML("afterbegin", '<a href="' + i + '" onMouseOver="window.status=\'\'; return true;"><img src="' + this.launchButtonPNG + '" border="0" /></a>')
            },
            launch: function (e) {
              return document.location = e,
                !0
            },
            isPluginInstalled: function () {
              var e = this.getPlugin();
              return !(!e || !e.jvms)
            },
            isAutoUpdateEnabled: function () {
              return !!this.isPluginInstalled() && this.getPlugin().isAutoUpdateEnabled()
            },
            setAutoUpdateEnabled: function () {
              return !!this.isPluginInstalled() && this.getPlugin().setAutoUpdateEnabled()
            },
            setInstallerType: function (e) {
              return this.installType = e,
                !!this.isPluginInstalled() && this.getPlugin().setInstallerType(e)
            },
            setAdditionalPackages: function (e) {
              return !!this.isPluginInstalled() && this.getPlugin().setAdditionalPackages(e)
            },
            setEarlyAccess: function (e) {
              this.EAInstallEnabled = e
            },
            isPlugin2: function () {
              if (this.isPluginInstalled() && this.versionCheck("1.6.0_10+"))
                try {
                  return this.getPlugin().isPlugin2()
                } catch (e) {}
              return !1
            },
            allowPlugin: function () {
              return this.getBrowser(),
                "Safari" != this.browserName2 && "Opera" != this.browserName2
            },
            getPlugin: function () {
              this.refresh();
              var e = null;
              return this.allowPlugin() && (e = document.getElementById("deployJavaPlugin")),
                e
            },
            compareVersionToPattern: function (e, t, i, n) {
              if (null == e || null == t)
                return !1;
              var r = e.match("^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$");
              if (null != r) {
                for (var a = 0, l = new Array, s = 1; s < r.length; ++s)
                  "string" == typeof r[s] && "" != r[s] && (l[a] = r[s],
                    a++);
                var o = Math.min(l.length, t.length);
                if (n) {
                  for (s = 0; s < o; ++s) {
                    if (l[s] < t[s])
                      return !1;
                    if (l[s] > t[s])
                      return !0
                  }
                  return !0
                }
                for (s = 0; s < o; ++s)
                  if (l[s] != t[s])
                    return !1;
                return !!i || l.length == t.length
              }
              return !1
            },
            getBrowser: function () {
              if (null == this.browserName) {
                var e = navigator.userAgent.toLowerCase();
                d("[getBrowser()] navigator.userAgent.toLowerCase() -> " + e),
                  -1 != e.indexOf("msie") && -1 == e.indexOf("opera") ? (this.browserName = "MSIE",
                    this.browserName2 = "MSIE") : -1 != e.indexOf("trident") || -1 != e.indexOf("Trident") ? (this.browserName = "MSIE",
                    this.browserName2 = "MSIE") : -1 != e.indexOf("iphone") ? (this.browserName = "Netscape Family",
                    this.browserName2 = "iPhone") : -1 != e.indexOf("firefox") && -1 == e.indexOf("opera") ? (this.browserName = "Netscape Family",
                    this.browserName2 = "Firefox") : -1 != e.indexOf("chrome") ? (this.browserName = "Netscape Family",
                    this.browserName2 = "Chrome") : -1 != e.indexOf("safari") ? (this.browserName = "Netscape Family",
                    this.browserName2 = "Safari") : -1 != e.indexOf("mozilla") && -1 == e.indexOf("opera") ? (this.browserName = "Netscape Family",
                    this.browserName2 = "Other") : -1 != e.indexOf("opera") ? (this.browserName = "Netscape Family",
                    this.browserName2 = "Opera") : (this.browserName = "?",
                    this.browserName2 = "unknown"),
                  d("[getBrowser()] Detected browser name:" + this.browserName + ", " + this.browserName2)
              }
              return this.browserName
            },
            testUsingActiveX: function (e) {
              var t = "JavaWebStart.isInstalled." + e + ".0";
              if ("undefined" == typeof ActiveXObject || !ActiveXObject)
                return d("[testUsingActiveX()] Browser claims to be IE, but no ActiveXObject object?"),
                  !1;
              try {
                return null != new ActiveXObject(t)
              } catch (e) {
                return !1
              }
            },
            testForMSVM: function () {
              if ("undefined" != typeof oClientCaps) {
                var e = oClientCaps.getComponentVersion("{08B0E5C0-4FCB-11CF-AAA5-00401C608500}", "ComponentID");
                return "" != e && "5,0,5000,0" != e
              }
              return !1
            },
            testUsingMimeTypes: function (e) {
              if (!navigator.mimeTypes)
                return d("[testUsingMimeTypes()] Browser claims to be Netscape family, but no mimeTypes[] array?"),
                  !1;
              for (var t = 0; t < navigator.mimeTypes.length; ++t) {
                s = navigator.mimeTypes[t].type;
                var i = s.match(/^application\/x-java-applet\x3Bversion=(1\.8|1\.7|1\.6|1\.5|1\.4\.2)$/);
                if (null != i && this.compareVersions(i[1], e))
                  return !0
              }
              return !1
            },
            testUsingPluginsArray: function (e) {
              if (!navigator.plugins || !navigator.plugins.length)
                return !1;
              for (var t = navigator.platform.toLowerCase(), i = 0; i < navigator.plugins.length; ++i)
                if (s = navigator.plugins[i].description,
                  -1 != s.search(/^Java Switchable Plug-in (Cocoa)/)) {
                  if (this.compareVersions("1.5.0", e))
                    return !0
                } else if (-1 != s.search(/^Java/) && -1 != t.indexOf("win") && (this.compareVersions("1.5.0", e) || this.compareVersions("1.6.0", e)))
                return !0;
              return !1
            },
            IEInstall: function () {
              return location.href = r((null != this.returnPage ? "&returnPage=" + this.returnPage : "") + (null != this.locale ? "&locale=" + this.locale : "") + (null != this.brand ? "&brand=" + this.brand : "")),
                !1
            },
            done: function (e, t) {},
            FFInstall: function () {
              return location.href = r((null != this.returnPage ? "&returnPage=" + this.returnPage : "") + (null != this.locale ? "&locale=" + this.locale : "") + (null != this.brand ? "&brand=" + this.brand : "") + (null != this.installType ? "&type=" + this.installType : "")),
                !1
            },
            compareVersions: function (e, t) {
              for (var i = e.split("."), n = t.split("."), r = 0; r < i.length; ++r)
                i[r] = Number(i[r]);
              for (r = 0; r < n.length; ++r)
                n[r] = Number(n[r]);
              return 2 == i.length && (i[2] = 0),
                i[0] > n[0] || !(i[0] < n[0]) && (i[1] > n[1] || !(i[1] < n[1]) && (i[2] > n[2] || !(i[2] < n[2])))
            },
            enableAlerts: function () {
              this.browserName = null,
                this.debug = !0
            },
            poll: function () {
              this.refresh();
              var e = this.getJREs();
              0 == this.preInstallJREList.length && 0 != e.length && (clearInterval(this.myInterval),
                  null != this.returnPage && (location.href = this.returnPage)),
                0 != this.preInstallJREList.length && 0 != e.length && this.preInstallJREList[0] != e[0] && (clearInterval(this.myInterval),
                  null != this.returnPage && (location.href = this.returnPage))
            },
            writePluginTag: function () {
              var e = this.getBrowser();
              "MSIE" == e ? document.getElementsByTagName("body")[0].insertAdjacentHTML("afterbegin", '<object classid="clsid:CAFEEFAC-DEC7-0000-0001-ABCDEFFEDCBA" id="deployJavaPlugin" width="0" height="0"></object>') : "Netscape Family" == e && this.allowPlugin() && this.writeEmbedTag()
            },
            refresh: function () {
              (navigator.plugins.refresh(!1),
                "Netscape Family" == this.getBrowser() && this.allowPlugin()) && (null == document.getElementById("deployJavaPlugin") && this.writeEmbedTag())
            },
            writeEmbedTag: function () {
              var e = !1;
              if (null != navigator.mimeTypes) {
                for (var t = 0; t < navigator.mimeTypes.length; t++)
                  navigator.mimeTypes[t].type == this.mimeType && navigator.mimeTypes[t].enabledPlugin && (document.getElementsByTagName("body")[0].insertAdjacentHTML("afterbegin", '<embed id="deployJavaPlugin" type="' + this.mimeType + '" hidden="true" />'),
                    e = !0);
                if (!e)
                  for (t = 0; t < navigator.mimeTypes.length; t++)
                    navigator.mimeTypes[t].type == this.oldMimeType && navigator.mimeTypes[t].enabledPlugin && document.getElementsByTagName("body")[0].insertAdjacentHTML("afterbegin", '<embed id="deployJavaPlugin" type="' + this.oldMimeType + '" hidden="true" />')
              }
            }
          };
          if (t.writePluginTag(),
            null == t.locale) {
            var i = null;
            if (null == i)
              try {
                i = navigator.userLanguage
              } catch (e) {}
            if (null == i)
              try {
                i = navigator.systemLanguage
              } catch (e) {}
            if (null == i)
              try {
                i = navigator.language
              } catch (e) {}
            null != i && (i.replace("-", "_"),
              t.locale = i)
          }
          return t
        }());
      var e = window.wimb.deployJava.getJREs();
      return !!e[0] && e[0]
    },
    enabled: function () {
      return !1 !== WIMB.detect.java._get_version_string()
    },
    version_array: function () {
      var e = WIMB.detect.java._get_version_string();
      return !1 !== e && (version_array = WIMB_UTIL.decode_java_version(e),
        !1 !== version_array && version_array)
    },
    version: function () {
      if (java_version_array = WIMB.detect.java.version_array(),
        !1 !== java_version_array) {
        for (version_string = "",
          vai = 0; vai < java_version_array.version.length && vai <= 4; vai++)
          version_string = version_string + java_version_array.version[vai] + ".";
        return version_string = version_string.slice(0, -1),
          java_version_array.update && (version_string = version_string + " update " + java_version_array.update),
          version_string
      }
      return !1
    }
  },
  popup_windows: {
    allowed: function (e, t, i) {
      return e = void 0 !== e ? e : "/",
        t = void 0 !== t ? parseInt(t) : 1,
        i = void 0 !== i ? parseInt(i) : 1,
        popup_test_params = "width=" + t + ",height=" + i + ",left=0,top=0,location=no,toolbar=no,menubar=no,scrollbars=no,status=no,resizable=no,directories=no",
        popup_test_window = window.open(e, "wimb_popup_test", popup_test_params),
        !(!popup_test_window || popup_test_window.closed || void 0 === popup_test_window.closed || 0 == parseInt(popup_test_window.outerHeight) || 0 == parseInt(popup_test_window.outerWidth))
    }
  },
  browser_window_size: {
    width: function () {
      return void 0 !== window.outerWidth ? parseInt(window.outerWidth) : 0
    },
    height: function () {
      return void 0 !== window.outerHeight ? parseInt(window.outerHeight) : 0
    }
  },
  browser_viewport_size: {
    width: function () {
      var e = document.documentElement,
        t = document.getElementsByTagName("body")[0],
        i = window.innerWidth || e.clientWidth || t.clientWidth;
      return parseInt(i)
    },
    height: function () {
      var e = document.documentElement,
        t = document.getElementsByTagName("body")[0],
        i = window.innerHeight || e.clientHeight || t.clientHeight;
      return parseInt(i)
    }
  },
  computer_screen: {
    width: function () {
      return void 0 !== window.screen.width ? parseInt(WIMB.detect.computer_screen.device_pixel_ratio() * parseInt(window.screen.width)) : 0
    },
    height: function () {
      return void 0 !== window.screen.height ? parseInt(WIMB.detect.computer_screen.device_pixel_ratio() * parseInt(window.screen.height)) : 0
    },
    color_depth: function () {
      return void 0 !== window.screen.colorDepth ? parseInt(window.screen.colorDepth) : 0
    },
    device_pixel_ratio: function () {
      return "undefined" !== window.devicePixelRatio ? parseInt(window.devicePixelRatio) : 1
    }
  },
  local_ipv4_addresses: {
    retrieve: function () {
      if (void 0 !== window.wimb.ipv4_addresses)
        return window.wimb.ipv4_addresses
    },
    trigger_detection: function () {
      WIMB.init.namespace_the_window(),
        window.wimb.ipv4_addresses || (window.wimb.ipv4_addresses = []);
      var e = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
      return void 0 !== e && (e && function () {
          var t = function (e) {
              if ("" !== ipv4_address && "0.0.0.0" !== ipv4_address) {
                for (local_ipv4_address_key in window.wimb.ipv4_addresses)
                  if (window.wimb.ipv4_addresses[local_ipv4_address_key] == ipv4_address)
                    return !0;
                window.wimb.ipv4_addresses.push(ipv4_address)
              }
            },
            i = new e({
              iceServers: []
            });
          try {
            i.createDataChannel("", {
              reliable: !1
            })
          } catch (e) {}

          function n(e) {
            var n = "";
            return e.split("\r\n").forEach(function (e) {
                if (~e.indexOf("a=candidate")) {
                  var t = (i = e.split(" "))[4];
                  "host" === i[7] && (n = t)
                } else if (~e.indexOf("c=")) {
                  var i;
                  t = (i = e.split(" "))[2];
                  n = t
                }
              }),
              n
          }
          i.onicecandidate = function (e) {
              e.candidate && (ipv4_address = n("a=" + e.candidate.candidate),
                t(ipv4_address))
            },
            i.createOffer(function (e) {
              ipv4_address = n(e.sdp),
                t(ipv4_address),
                i.setLocalDescription(e)
            }, function (e) {})
        }(),
        !0)
    }
  },
  gmt_offset: function () {
    z = function (e) {
      return e < 10 ? "0" + e : e
    };
    var e = new Date,
      t = 0 < e.getTimezoneOffset() ? "-" : "+",
      i = Math.abs(e.getTimezoneOffset());
    return t + z(Math.floor(i / 60)) + ":" + z(i % 60)
  },
  addons: {
    get_all_names: function () {
      return addons = [],
        WIMB.detect.addons.adblock.enabled() && addons.push({
          code: "adblocker",
          name: "Ad blocker",
          version: null
        }),
        WIMB.detect.addons.silverlight.enabled() && addons.push({
          code: "silverlight",
          name: "Microsoft Silverlight",
          version: WIMB.detect.addons.silverlight.version()
        }),
        addons
    },
    adblock: {
      ad_div_id: "ads-advert-banner",
      _init: function () {
        var e = document.createElement("div");
        e.id = WIMB.detect.addons.adblock.ad_div_id,
          null !== document.body && document.body.appendChild(e)
      },
      enabled: function () {
        return WIMB.detect.addons.adblock._init(),
          advert_id = document.getElementById(WIMB.detect.addons.adblock.ad_div_id),
          "none" == WIMB_UTIL.get_style(advert_id, "display")
      }
    },
    silverlight: {
      _init: function () {
        window.Silverlight || (window.Silverlight = {}),
          Silverlight._silverlightCount = 0,
          Silverlight.__onSilverlightInstalledCalled = !1,
          Silverlight.fwlinkRoot = "http://go2.microsoft.com/fwlink/?LinkID=",
          Silverlight.__installationEventFired = !1,
          Silverlight.onGetSilverlight = null,
          Silverlight.onSilverlightInstalled = function () {
            window.location.reload(!1)
          },
          Silverlight.isInstalled = function (e) {
            null == e && (e = null);
            var t = !1;
            try {
              var i = null,
                n = !1;
              if (window.ActiveXObject)
                try {
                  i = new ActiveXObject("AgControl.AgControl"),
                    null === e ? t = !0 : i.IsVersionSupported(e) && (t = !0),
                    i = null
                } catch (e) {
                  n = !0
                }
              else
                n = !0;
              if (n) {
                var r = navigator.plugins["Silverlight Plug-In"];
                if (r)
                  if (null === e)
                    t = !0;
                  else {
                    var a = r.description;
                    "1.0.30226.2" === a && (a = "2.0.30226.2");
                    for (var l = a.split("."); 3 < l.length;)
                      l.pop();
                    for (; l.length < 4;)
                      l.push(0);
                    for (var s = e.split("."); 4 < s.length;)
                      s.pop();
                    for (var o, d, u = 0; o = parseInt(s[u]),
                      d = parseInt(l[u]),
                      ++u < s.length && o === d;)
                    ;
                    o <= d && !isNaN(o) && (t = !0)
                  }
              }
            } catch (e) {
              t = !1
            }
            return t
          },
          Silverlight.WaitForInstallCompletion = function () {
            if (!Silverlight.isBrowserRestartRequired && Silverlight.onSilverlightInstalled) {
              try {
                navigator.plugins.refresh()
              } catch (e) {}
              Silverlight.isInstalled(null) && !Silverlight.__onSilverlightInstalledCalled ? (Silverlight.onSilverlightInstalled(),
                Silverlight.__onSilverlightInstalledCalled = !0) : setTimeout(Silverlight.WaitForInstallCompletion, 3e3)
            }
          },
          Silverlight.__startup = function () {
            if (navigator.plugins.refresh(),
              Silverlight.isBrowserRestartRequired = Silverlight.isInstalled(null),
              Silverlight.isBrowserRestartRequired) {
              if (window.navigator.mimeTypes) {
                var e = navigator.mimeTypes["application/x-silverlight-2"],
                  t = navigator.mimeTypes["application/x-silverlight-2-b2"],
                  i = navigator.mimeTypes["application/x-silverlight-2-b1"],
                  n = i;
                t && (n = t),
                  e || !i && !t ? e && n && e.enabledPlugin && n.enabledPlugin && e.enabledPlugin.description != n.enabledPlugin.description && (Silverlight.__installationEventFired || (Silverlight.onRestartRequired(),
                    Silverlight.__installationEventFired = !0)) : Silverlight.__installationEventFired || (Silverlight.onUpgradeRequired(),
                    Silverlight.__installationEventFired = !0)
              }
            } else
              Silverlight.WaitForInstallCompletion(),
              Silverlight.__installationEventFired || (Silverlight.onInstallRequired(),
                Silverlight.__installationEventFired = !0);
            Silverlight.disableAutoStartup || (window.removeEventListener ? window.removeEventListener("load", Silverlight.__startup, !1) : window.detachEvent("onload", Silverlight.__startup))
          },
          Silverlight.disableAutoStartup || (window.addEventListener ? window.addEventListener("load", Silverlight.__startup, !1) : window.attachEvent("onload", Silverlight.__startup)),
          Silverlight.createObject = function (e, t, i, n, r, a, l) {
            var s = {},
              o = n,
              d = r;
            if (s.version = o.version,
              o.source = e,
              s.alt = o.alt,
              a && (o.initParams = a),
              o.isWindowless && !o.windowless && (o.windowless = o.isWindowless),
              o.framerate && !o.maxFramerate && (o.maxFramerate = o.framerate),
              i && !o.id && (o.id = i),
              delete o.ignoreBrowserVer,
              delete o.inplaceInstallPrompt,
              delete o.version,
              delete o.isWindowless,
              delete o.framerate,
              delete o.data,
              delete o.src,
              delete o.alt,
              Silverlight.isInstalled(s.version)) {
              for (var u in d)
                if (d[u]) {
                  if ("onLoad" == u && "function" == typeof d[u] && 1 != d[u].length) {
                    var c = d[u];
                    d[u] = function (e) {
                      return c(document.getElementById(i), l, e)
                    }
                  }
                  var v = Silverlight.__getHandlerName(d[u]);
                  if (null == v)
                    throw "typeof events." + u + " must be 'function' or 'string'";
                  o[u] = v,
                    d[u] = null
                }
              slPluginHTML = Silverlight.buildHTML(o)
            } else
              slPluginHTML = Silverlight.buildPromptHTML(s);
            if (!t)
              return slPluginHTML;
            t.innerHTML = slPluginHTML
          },
          Silverlight.buildHTML = function (e) {
            var t = [];
            for (var i in t.push('<object type="application/x-silverlight" data="data:application/x-silverlight,"'),
                null != e.id && t.push(' id="' + Silverlight.HtmlAttributeEncode(e.id) + '"'),
                null != e.width && t.push(' width="' + e.width + '"'),
                null != e.height && t.push(' height="' + e.height + '"'),
                t.push(" >"),
                delete e.id,
                delete e.width,
                delete e.height,
                e)
              e[i] && t.push('<param name="' + Silverlight.HtmlAttributeEncode(i) + '" value="' + Silverlight.HtmlAttributeEncode(e[i]) + '" />');
            return t.push("</object>"),
              t.join("")
          },
          Silverlight.createObjectEx = function (e) {
            var t = e,
              i = Silverlight.createObject(t.source, t.parentElement, t.id, t.properties, t.events, t.initParams, t.context);
            if (null == t.parentElement)
              return i
          },
          Silverlight.buildPromptHTML = function (e) {
            var t = "",
              i = Silverlight.fwlinkRoot,
              n = e.version;
            return e.alt ? t = e.alt : (n || (n = ""),
                t = (t = (t = "<a href='javascript:Silverlight.getSilverlight(\"{1}\");' style='text-decoration: none;'><img src='{2}' alt='Get Microsoft Silverlight' style='border-style: none'/></a>").replace("{1}", n)).replace("{2}", i + "161376")),
              t
          },
          Silverlight.getSilverlight = function (e) {
            Silverlight.onGetSilverlight && Silverlight.onGetSilverlight();
            var t = "",
              i = String(e).split(".");
            if (1 < i.length) {
              var n = parseInt(i[0]);
              t = isNaN(n) || n < 2 ? "1.0" : i[0] + "." + i[1]
            }
            var r = "";
            t.match(/^\d+\056\d+$/) && (r = "&v=" + t),
              Silverlight.followFWLink("149156" + r)
          },
          Silverlight.followFWLink = function (e) {
            top.location = Silverlight.fwlinkRoot + String(e)
          },
          Silverlight.HtmlAttributeEncode = function (e) {
            var t, i = "";
            if (null == e)
              return null;
            for (var n = 0; n < e.length; n++)
              96 < (t = e.charCodeAt(n)) && t < 123 || 64 < t && t < 91 || 43 < t && t < 58 && 47 != t || 95 == t ? i += String.fromCharCode(t) : i = i + "&#" + t + ";";
            return i
          },
          Silverlight.default_error_handler = function (e, t) {
            var i = t.ErrorType,
              n = "\nSilverlight error message     \n";
            n += "ErrorCode: " + t.ErrorCode + "\n",
              n += "ErrorType: " + i + "       \n",
              n += "Message: " + t.ErrorMessage + "     \n",
              "ParserError" == i ? (n += "XamlFile: " + t.xamlFile + "     \n",
                n += "Line: " + t.lineNumber + "     \n",
                n += "Position: " + t.charPosition + "     \n") : "RuntimeError" == i && (0 != t.lineNumber && (n += "Line: " + t.lineNumber + "     \n",
                  n += "Position: " + t.charPosition + "     \n"),
                n += "MethodName: " + t.methodName + "     \n"),
              alert(n)
          },
          Silverlight.__cleanup = function () {
            for (var e = Silverlight._silverlightCount - 1; 0 <= e; e--)
              window["__slEvent" + e] = null;
            Silverlight._silverlightCount = 0,
              window.removeEventListener ? window.removeEventListener("unload", Silverlight.__cleanup, !1) : window.detachEvent("onunload", Silverlight.__cleanup)
          },
          Silverlight.__getHandlerName = function (e) {
            var t = "";
            if ("string" == typeof e)
              t = e;
            else if ("function" == typeof e) {
              0 == Silverlight._silverlightCount && (window.addEventListener ? window.addEventListener("unload", Silverlight.__cleanup, !1) : window.attachEvent("onunload", Silverlight.__cleanup)),
                t = "__slEvent" + Silverlight._silverlightCount++,
                window[t] = e
            } else
              t = null;
            return t
          },
          Silverlight.onRequiredVersionAvailable = function () {},
          Silverlight.onRestartRequired = function () {},
          Silverlight.onUpgradeRequired = function () {},
          Silverlight.onInstallRequired = function () {},
          Silverlight.IsVersionAvailableOnError = function (e, t) {
            var i = !1;
            try {
              8001 != t.ErrorCode || Silverlight.__installationEventFired ? 8002 != t.ErrorCode || Silverlight.__installationEventFired ? 5014 == t.ErrorCode || 2106 == t.ErrorCode ? Silverlight.__verifySilverlight2UpgradeSuccess(t.getHost()) && (i = !0) : i = !0 : (Silverlight.onRestartRequired(),
                Silverlight.__installationEventFired = !0) : (Silverlight.onUpgradeRequired(),
                Silverlight.__installationEventFired = !0)
            } catch (e) {}
            return i
          },
          Silverlight.IsVersionAvailableOnLoad = function (e) {
            var t = !1;
            try {
              Silverlight.__verifySilverlight2UpgradeSuccess(e.getHost()) && (t = !0)
            } catch (e) {}
            return t
          },
          Silverlight.__verifySilverlight2UpgradeSuccess = function (e) {
            var t = !1,
              i = "4.0.50401",
              n = null;
            try {
              e.IsVersionSupported(i + ".99") ? (n = Silverlight.onRequiredVersionAvailable,
                  t = !0) : n = e.IsVersionSupported(i + ".0") ? Silverlight.onRestartRequired : Silverlight.onUpgradeRequired,
                n && !Silverlight.__installationEventFired && (n(),
                  Silverlight.__installationEventFired = !0)
            } catch (e) {}
            return t
          }
      },
      version: function () {
        if (WIMB.detect.addons.silverlight._init(),
          !Silverlight.isInstalled("1.0"))
          return !1;
        for (var e = 1; e <= 5; e++)
          for (var t = 0; t < 10; t++)
            if (!0 === Silverlight.isInstalled(e + "." + t))
              return e + "." + t
      },
      enabled: function () {
        return WIMB.detect.addons.silverlight._init(),
          !!Silverlight.isInstalled("1.0")
      }
    }
  }
}