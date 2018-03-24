function getYtID(url){
  var ytID = /(?:(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\/?\?v=(.+))|(?:(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+))/.exec(url);
  return ytID[1] || ytID[2];
}

function showFormats(response){
  //TODO: Show format buttons on page to be able to select quality
}

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
  $("div#input").css("padding-bottom", "0px");
}

$(document).ready(function(){
  $("input#test").click(function(){
    $("input#videoURL").val("https://www.youtube.com/watch?v=hUJElYE6FFw");
    $("input#videoURL").change();
  });
  $("input#videoURL").change(function(){
    if ($(this).val().trim() != "")
      var ytID = getYtID($(this).val());
    if (ytID !== null){
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