function getYtID(url){
  var ytID = /(?:(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\/?\?v=(.+))|(?:(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+))/.exec(url);
  if (ytID !== null)
    return ytID[1] || ytID[2];
  else
    invalidURL();
}

// Invalid URL message
function invalidURL(){
  $("div#alert").text("Invalid URL");
  $("div#alert").slideToggle();
};

function showFormats(response){
  //TODO: Show format buttons on page to be able to select quality
}

// Get Audio URL (best audio)
function getAudioURL(ytID, id){
  var queryAudio = null;
  if (ytID !== undefined){
    if (id === undefined){
      queryAudio = "https://yt-audio-api.herokuapp.com/api/"+ytID;
    } else {
      queryAudio = "https://yt-audio-api.herokuapp.com/api/"+ytID+"/"+id;
    }
  }

  if (queryAudio !== null){
    $.ajax({
      async: true,
      type: "GET",
      url: queryAudio,
      success: preparePlayer
    });
  }
}

function preparePlayer(response){
  var player = $("audio#player");
  player.attr("src", response.url);
  $("div#title").text(response.title);
  player.show();
  $("div.title").show();
}

$(document).ready(function(){
  // Test button
  $("input#test").click(function(){
    $("input#videoURL").val("https://www.youtube.com/watch?v=bM7SZ5SBzyY");
    $("input#videoURL").change();
  });

  // Switch color button
  $("button#changeSkinButton").click(function(){
    $("div#AppContainer").toggleClass("AppDark AppLight");
    $("header#AppHeader").toggleClass("App-headerDark App-headerLight");
    $(this).text($(this).text() == "Day mode" ? "Night mode" : "Day mode");
  });

  // URL Input AJAX
  $("input#videoURL").change(function(){
    // Clear alerts
    $("div#alert").slideUp();

    // Get valid YouTube ID
    if ($(this).val().trim() != "")
      var ytID = getYtID($(this).val());

    // AJAX
    if (ytID !== null || ytID !== undefined){
      $.ajax({
        async: true,
        type: "GET",
        url: "https://yt-audio-api.herokuapp.com/api/"+ytID+"/formats",
        success: function(response){
          showFormats(response);
          getAudioURL(ytID);
        }
      });
    }
  });
});