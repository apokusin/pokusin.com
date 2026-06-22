$(".toggle_trigger").on("click", function (event){
  event.preventDefault();
  $(this).children(".toggle").toggleClass("active");
  $(this).children(".toggle").toggleClass("inactive");
  return false;
});