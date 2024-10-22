$(function() {
     let isDragging = false;
     let currentDivider = null;
   
     // Handle mousedown on dividers
     $('.divider').on('mousedown', function(e) {
       isDragging = true;
       currentDivider = $(this);
       $('body').css('cursor', 'ew-resize');
     });
   
     // Handle mousemove to resize panes dynamically
     $(document).on('mousemove', function(e) {
       if (!isDragging) return;
   
       const container = $('.container');
       const containerOffset = container.offset();
       const containerWidth = container.width();
   
       // Get the two panes on either side of the current divider
       const prevPane = currentDivider.prev('.pane');
       const nextPane = currentDivider.next('.pane');
   
       if (prevPane.length && nextPane.length) {
         // Calculate the new width for the previous pane based on the mouse position
         const newPrevWidth = e.pageX - prevPane.offset().left;
         
         // Calculate the remaining space for the next pane
         const newNextWidth = prevPane.width() + nextPane.width() - newPrevWidth;
   
         // Only update if both panes are above the minimum width
         if (newPrevWidth > 50 && newNextWidth > 50) {
           prevPane.css('flex-basis', `${newPrevWidth}px`);
           nextPane.css('flex-basis', `${newNextWidth}px`);
         }
       }
     });
   
     // Handle mouseup to stop resizing
     $(document).on('mouseup', function() {
       isDragging = false;
       currentDivider = null;
       $('body').css('cursor', '');
     });
   });
   