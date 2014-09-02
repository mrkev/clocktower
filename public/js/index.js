/**
 * Scripts for UI tweaks and other things that should be executed right after load.
 */


 // Add stuff from
 // http://stackoverflow.com/questions/5244976/horizontal-scroll-detecting-scroll-position-relative-to-anchors
 $(function() {
     $('ul#nav li a').bind('click',function(event){
         var $anchor = $(this);
         console.log($anchor)
         /*
         if you want to use one of the easing effects:
         $('html, body').stop().animate({
             scrollLeft: $($anchor.attr('href')).offset().left
         }, 1500,'easeInOutCirc');
          */
         $('html, body, .horizontal-container').stop().animate({
             scrollLeft: $($anchor.attr('href')).offset().left - 20
         }, 360);
         event.preventDefault();
     });
 });