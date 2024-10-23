const DIV_WIDTH = 10;

$(function() {
  let isDragging = false;
  let currentDivider = null;

  $(".divider").css("width", DIV_WIDTH + "px");

  const down = (e) => {
    isDragging = true;
    currentDivider = $(e.target);
    console.log($(e.target));
    $('body').css('cursor', 'ew-resize');
  }

  const dragging = (e) => {
    if (!isDragging) return;
    console.log("movin");
    const container = $('.container');
    const containerOffset = container.offset();
    const containerWidth = container.width();

    // Get the two panes on either side of the current divider
    const prevPane = currentDivider.prevAll('.pane').filter(':visible').first();
    const nextPane = currentDivider.nextAll('.pane').filter(':visible').first();

    if (prevPane.length && nextPane.length) {
      // Calculate the new width for the previous pane based on the mouse position
      let newPrevWidth = e.pageX - prevPane.offset().left - DIV_WIDTH/2;

      if (!newPrevWidth) newPrevWidth = event.changedTouches[0].pageX - prevPane.offset().left - DIV_WIDTH/2;

      // Calculate the remaining space for the next pane
      const newNextWidth = prevPane.width() + nextPane.width() - newPrevWidth - DIV_WIDTH/2;

      // Only update if both panes are above the minimum width
      if (newPrevWidth > 50 && newNextWidth > 50) {
        prevPane.css('flex-basis', `${newPrevWidth}px`);
        nextPane.css('flex-basis', `${newNextWidth}px`);
      }
    }
  }

  const up = (e) => {
    console.log("up");
    isDragging = false;
    currentDivider = null;
    $('body').css('cursor', '');
  }

  // Handle mousedown on dividers
  $('.divider').on('mousedown', down);
  $('.divider').on('touchstart', down);
  // Handle mousemove to resize panes dynamically
  $(document).on('mousemove', dragging);
  $(document).on('touchmove', dragging);
  // Handle mouseup to stop resizing
  $(document).on('mouseup', up);
  $(document).on('touchend', up);

  $(".pane-checker").change(function (e) {
    const id = this.dataset.pane;
    $("#pane" + id).css("display", this.checked ? "flex" : "none");
    $("#divider" + id).css("display", this.checked ? "flex" : "none");
  });
  $("#vertical").change(function (e) {
    $(".container").css("flex-direction", this.checked ? "column" : "row");
  });
  $("#show-dividers").change(function (e) {
    $(".divider").css("display", this.checked ? "" : "none");
  });
});
   
