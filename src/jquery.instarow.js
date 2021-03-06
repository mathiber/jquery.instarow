(function ($) {
    $.fn.instaRow = function( options ) {

        var openCorsProxies = [
            'http://cors.io/?u={url}',
            'https://jsonp.afeld.me/?url={url}',
            'https://crossorigin.me/{url}'
        ];
        var injectString = function(source, placeholder, value) {
            return source.replace(placeholder, value);
        };
        var injectCorsProxyUrl = function(index, url) {
            var u = openCorsProxies[index];
            if (u && u.indexOf('{url}') >= 0) {
                return injectString(u, '{url}', url)
            } else {
                return false;
            }
        };
        var measureLuminance = function(hex) {
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            }
            var c = 0, i;
            for (i = 0; i < 3; i++) {
                c += Math.round(Math.min(Math.max(0, parseInt(hex.substr(i*2,2), 16)), 255));
            }
            return c/3;
        }

        return this.each(function() {
            var $this = $(this),
                defaultSettings,
                settings,
                openCorsProxyIndex,
                url,
                parseData,
                onSuccess,
                onError,
                retry,
                getData,
                getCaption,
                getSrc,
                getHref,
                renderInstaRow;

            defaultSettings = {
                onSuccess: null,
                onError: null,
                user: 'self',
                items: 10,
                target: '_blank',
                linkText: '{user} on Instagram',
                linkColor: null,
                proxy: null,
                timeout: 2000
            };

            if ($this.data('instarow-user')) {
                defaultSettings.user = $this.data('instarow-user');
            }
            if ($this.data('instarow-items')) {
                defaultSettings.items = $this.data('instarow-items');
            }
            if ($this.data('instarow-link-text')) {
                defaultSettings.linkText = $this.data('instarow-link-text');
            }
            if ($this.data('instarow-link-color')) {
                defaultSettings.linkColor = $this.data('instarow-link-color');
            }
            if ($this.data('instarow-target')) {
                defaultSettings.target = $this.data('instarow-target');
            }
            if ($this.data('instarow-proxy')) {
                defaultSettings.proxy = $this.data('instarow-proxy');
            }
            if ($this.data('instarow-timeout')) {
                defaultSettings.timeout = $this.data('instarow-timeout');
            }

            settings = $.extend(defaultSettings, options);

            openCorsProxyIndex = 0;

            url = 'https://www.instagram.com/'+settings.user;

            parseData = function(data) {
                var ret = false;
                $(data + ':contains("script")').each(function(){
                    if($(this).children().length < 1 && $.trim($(this).text()).length != ''){
                        var text = $(this).text();
                        if (text.match(/^window._sharedData/) != null){
                            ret = $.parseJSON(text.replace('window._sharedData = ','').slice(0,-1));
                        }
                    }
                });
                return ret;
            };

            onSuccess = function(data) {
                var json = parseData(data)
                    arg = arguments;
                try {
                    if (json.entry_data.ProfilePage[0].user.media.nodes) {
                        renderInstaRow(json.entry_data.ProfilePage[0].user.media.nodes);
                        if (typeof settings.onSuccess === 'function') {
                            settings.onSuccess.apply(this, arguments);
                        }
                    } else {
                        onError.apply(this, arg);
                    }
                } catch (e) {
                    onError.apply(this, arg);
                }
            };

            onError = function () {
                if (typeof settings.onError === 'function') {
                    settings.onError.apply(this, arguments);
                }
            };

            retry = function() {
                openCorsProxyIndex++;
                if (!getData()) {
                    onError.apply(this, arguments);
                }
            };

            getData = function() {
                var corsUrl;
                settings.proxy
                if (settings.proxy) {
                  if (openCorsProxyIndex === 0) {
                    corsUrl = injectString(settings.proxy, '{url}', url)
                  } else {
                    corsUrl = injectCorsProxyUrl(openCorsProxyIndex-1, url);
                  }
                } else {
                  corsUrl = injectCorsProxyUrl(openCorsProxyIndex, url);
                }
                if (corsUrl) {
                    return $.ajax({
                        method: 'GET',
                        url: corsUrl,
                        success: onSuccess.bind(this),
                        error: retry.bind(this),
                        timeout: settings.timeout
                    });
                } else {
                    return false;
                }
            };

            getCaption = function(item) {
                var ret;
                if (item.caption) {
                    if (typeof item.caption === 'string') {
                        ret = item.caption;
                    } else {
                        ret = item.caption.text;
                    }
                } else {
                    ret = 'Image';
                }
                return ret;
            };

            getSrc = function(item) {
                var ret;
                if (item.thumbnail_src) {
                    ret = item.thumbnail_src;
                } else if (item.images) {
                    if (item.images.standard_resolution && item.images.standard_resolution.url) {
                        ret = item.images.standard_resolution.url;
                    } else if (item.images.low_resolution && item.images.low_resolution.url) {
                        ret = item.images.low_resolution.url;
                    } else if (item.images.thumbnail && item.images.thumbnail.url) {
                        ret = item.images.thumbnail.url;
                    }
                }
                return ret;
            };

            getHref = function(item) {
                var ret;
                if (typeof item.link === 'string') {
                    ret = item.link;
                } else if (item.code) {
                    ret = 'http://www.instagram.com/p/'+item.code;
                } else {
                    ret = url;
                }
                return ret;
            };

            renderInstaRow = function(items) {
                var itemCount = 0;
                $this.html('').addClass('instarow');
                for (var i in items) {
                    var item = items[i],
                        image, caption, src, href;
                    if (itemCount >= settings.items) {
                        break;
                    } else if (item.type && item.type !== 'image') {
                        continue;
                    }

                    src = getSrc(item);
                    if (!src) {
                        continue;
                    }

                    caption = getCaption(item);
                    href = getHref(item);

                    $this.append($('<div>').addClass('instarow__image').append(
                        $('<a>')
                            .css('background-image', 'url('+src+')')
                            .attr({
                                'href': href,
                                'title': caption,
                                'target': settings.target
                            })
                            .html(caption)
                    ));
                    itemCount++;
                }
                $this.append($('<div>')
                  .addClass('instarow__link')
                  .css('background-color', function() {
                    if (settings.linkColor) {
                      var lum = measureLuminance(settings.linkColor);
                      if (lum < 130) {
                        $(this).addClass('instarow__link--dark');
                      }
                      return settings.linkColor;
                    }
                    return null;
                  })
                  .append(
                    $('<a>')
                        .attr({
                            'href': url,
                            'target': settings.target
                        })
                        .append(
                            $('<span>').append(
                                $('<span>').html(injectString(settings.linkText, '{user}', settings.user)
                            )
                        )
                    )
                ));
            };

            getData();
        });
    };
}( jQuery ));
