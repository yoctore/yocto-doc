define([
  'jquery',
  'lodash'
], function($, _) {

    function SampleRequest ($, _) {
        // default timer
        this.timer;

        this.initCodeStyle = function () {
            $('pre').each(function() {
                $(this).addClass('prettyprint source lang-javascript');
            });
            $('pre code').each(function(i, block) {
                hljs.highlightBlock(block);
            });
        }

        this.init = function () {
            this.initCodeStyle();
            this.initPreRequestHeader();
            this.listenNoUniqueId();
            this.checkUniqueId();
            this.listen();
        }

        this.initPreRequestHeader = function () {
            
        }

        this.listenNoUniqueId = function () {
            $('form').each(function () {
                $(this).on('datachange', function() {
                    // procedure here
                    if ($(this).data('nb-items') > 1) {
                        $(this).find('.error-too-many-items').each(function() {
                            $(this).show();
                            $(this).next().addClass('hide');
                        });
                    }
                }); 
            });
            $('form').each(function () {
                $(this).off('datachange');
            });
        }

        this.checkUniqueId = function () {
            var items = [];
            var forms = $('form').each(function() {
                items.push($(this).data('id'));
            });

            // parse all items
            _.each(items, function (item) {
                $('form').each(function () {
                    if ($(this).data('id') === item) {
                        $(this).data('nb-items', $(this).data('nb-items') + 1).trigger('datachange');
                    }
                });
            });
        }

        this.displayError = function (message) {
            var time = this.startOrEndTimer(false);
            // init editor
            var editor = new JsonEditor('#'+this.article.find('.sample-request-response-json-editor').attr('id'), {});
            this.article.find('.template-spinner').hide();
            if  (this.article.find(".sample-request-response").is(":visible")) {
                this.article.find(".sample-request-response").fadeTo(1, 0.1);
            }

            this.article.find('.sample-request-response-time').html(time + ' ms');
            this.article.find(".sample-request-response").fadeTo(250, 1);
            this.article.find(".sample-request-response-json").html(message);
            // refresh view
            this.refreshScrollSpy();
        }

        this.refreshScrollSpy = function () {
            $('[data-spy="scroll"]').each(function () {
                $(this).scrollspy("refresh");
            });
        }

        this.clearSampleRequest = function () {
            var article = $('article[data-group="' + this.group + '"][data-name="' + this.name + '"][data-version="' + this.version + '"]');
            // hide sample response
            article.find(".sample-request-response-json").html("");
            article.find(".sample-request-response").hide();
            // refresh current view
            this.refreshScrollSpy();
        }

        this.listenCleanResponse = function (context) {
            $('.sample-request-clear').click(function(e) {
                e.preventDefault();
                context.clearSampleRequest();
            });
        }

        this.displayResponse = function (data, status, jqXHR) {
            var time = this.startOrEndTimer(false);
            // init editor
            var editor = new JsonEditor('#'+this.article.find('.sample-request-response-json-editor').attr('id'), {});

            var jsonResponse;
            try {
                jsonResponse = JSON.parse(jqXHR.responseText);
                jsonResponse = JSON.stringify(jsonResponse, null, 4);
            } catch (e) {
                jsonResponse = data;
            }
            this.article.find('.template-spinner').hide();
            this.article.find('.sample-request-response').fadeTo(1, 250);
            editor.load(JSON.parse(jsonResponse));
            this.article.find('.sample-request-response-json').html(jsonResponse);
            this.article.find('.sample-request-response-time').html(time + ' ms');
            this.article.find('.sample-request-response-http-code')
                .removeClass('label-success')
                .removeClass('label-danger')
                .addClass('label-success')
                .html([ jqXHR.status, jqXHR.statusText ].join(' - '));
            this.refreshScrollSpy();
            this.initCodeStyle();
        }

        this.processError = function (jqXHR, textStatus, error) {
            var message = "Error : " + jqXHR.status + ": " + error;
            var jsonResponse;
            try {
                jsonResponse = JSON.parse(jqXHR.responseText);
                jsonResponse = JSON.stringify(jsonResponse, null, 4);
            } catch (e) {
                jsonResponse = escape(jqXHR.responseText);
            }
  
            if (jsonResponse) {
                message += "<br>" + jsonResponse;
            }
            this.article.find('.sample-request-response-http-code')
                .removeClass('label-success')
                .removeClass('label-danger')
                .addClass('label-danger')
                .html([ jqXHR.status, jqXHR.statusText ].join(' - '));
            this.displayError(message);
        };

        this.startOrEndTimer = function (start) {
            // in case we need diff time
            if (!start) {
                // update timer
                return new Date().getTime() - this.timer; // time in ms
            } else {
                // update timer
                this.timer = new Date().getTime();
            }
             
            // default statement
            return this.timer;
        }

        this.listen = function () {
            // save context for internal process
            var context = this;
            // wait to click event
            $('.sample-request-send').click(function(e) {
                context.startOrEndTimer(true);
                $('.sample-request-clear').off('click');
                // avoid click
                e.preventDefault();
                context.article = $(this).parents("article");
                context.group   = context.article.data("group");
                context.name    = context.article.data("name");
                context.version = context.article.data("version");

                context.article.find('.template-spinner').show();

                // listen response
                context.listenCleanResponse(context);
                // Try to get data first
                var form        = $(this).data('sample-request-reference');
                var type        = $(this).data('sample-request-type');
                var endpoint    = $(this).data('sample-endpoint');

                // data to get
                var headers     = {};
                var body        = {};
                var qr          = {};
                var url         = '';

                // by default we use this config
                var ajaxRequest = {
                    url         : '',
                    type        : type.toUpperCase(),
                    headers     : {},
                    data        : {},
                    success     : context.displayResponse.bind(context),
                    error       : context.processError.bind(context),
                    start_time  : new Date().getTime()
                };
                
               // Try to get sample url parameters
                $('form[data-id='+form+']').find('.sample-request-url').each(function() {
                   url = $(this).val();
                });


                // Try to get sample query parameters
                $('form[data-id='+form+']').find('.sample-query-request-param').each(function() {
                    _.set(qr, $(this).data('sample-request-param-name'), $(this).val() ? $(this).val() : ':'+$(this).data('sample-request-param-name'));
                });

                // parse headers
                $('form[data-id='+form+']').find('.sample-request-header').each(function() {
                    _.set(headers, $(this).data('sample-request-header-name'), $(this).val());
                });

                // parse body
                $('form[data-id='+form+']').find('.sample-request-param').each(function() {
                    _.set(body, $(this).data('sample-request-param-name'), $(this).val());
                });

                // update request
                _.set(ajaxRequest, 'headers', headers);
                _.set(ajaxRequest, 'url', url);

                // normalize qr
                qr = !_.isEmpty(qr) ? qr : _.includes([ 'get', 'delete' ], type) ? body : {};

                // only if query parameters is defined
                if (!_.isEmpty(qr)) {
                    try {
                        endpoint = _.template(endpoint.replace(/(:\w+)/g, '<%= $1 %>').replace(/:/g, ''))(qr);
                        // update url value
                        _.set(ajaxRequest, 'url', [ _.get(ajaxRequest, 'url'), endpoint ].join('/'));
                    } catch (e) {
                        return context.displayError('Invalid template property your query parameters is not matching : ' + e);
                    }
                }

                // in case of no body request
                if (!_.includes([ 'get', 'delete' ], type)) {
                    // append body to request
                    _.set(ajaxRequest, 'data', body);
                }

                // send the request
                $.ajax(ajaxRequest);
            });
        }
    }

    function customInit() {
        $(document).ready(function() {
            // custom process for navbar
            var timeout = setTimeout(function() {
            clearTimeout(timeout);  
            // on init change size of fixed element
            $('.nav-list-api-group').width($('#sidenav').width());
            // on resize we must do the same thing
            $(window).resize(function() {
                $('.nav-list-api-group').width($('#sidenav').width());
            });
            // get initial position go scroll properly
            var initialPosition = $('.nav-list-api-group').offset().top;
        
            // bind scroll
            $(document).scroll(function() {
                // scroll to position
                $('.nav-list-api-group').animate({
                top : $(this).scrollTop() > initialPosition ? 0 : initialPosition
                }, 0, function() {
                // Animation complete.
                });
            });
        
            // init sample request
            var sample = new SampleRequest($, _);
            // init the project
            sample.init();
            //sample.listen();
            }, 200);
        });    
    }
  /**
   * Exports.
   */
  return {
      //initDynamic: initDynamic
      initDynamic : customInit
  };

});
