// aHR0cHM6Ly9naXRodWIuY29tL2x1b3N0MjYvYWNhZGVtaWMtaG9tZXBhZ2U=
$(function () {
    lazyLoadOptions = {
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        effectTime: 300,
        placeholder: "", 
        threshold: 0,
        visibleOnly: true,
        combined: false,
        onError: function(element) {
            console.log('[lazyload] Error loading ' + element.data('src'));
        },
        afterLoad: function(element) {
            if (element.is('img')) {
                // remove background-image style
                element.css('background-image', 'none');
            } else if (element.is('div')) {
                // set the style to background-size: cover; 
                element.css('background-size', 'cover');
                element.css('background-position', 'center');
            }
        }
    }

    // Initialize lazy loading for visible elements
    $('img.lazy, div.lazy:not(.always-load)').Lazy(lazyLoadOptions);
    
    // Initialize lazy loading for elements that should always be loaded 
    $('div.lazy.always-load').Lazy({visibleOnly: false, ...lazyLoadOptions});
});

// Initialize masonry grid
$(window).on('load', function() {
    $('.grid').each(function() {
        var $grid = $(this);
        // Initialize masonry after all images have loaded
        $grid.imagesLoaded(function() {
            $grid.masonry({
                itemSelector: '.grid-item',
                columnWidth: '.grid-sizer',
                percentPosition: true
            });
        });
    });
});