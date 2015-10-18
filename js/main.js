$(function() {

  /// GLOBAL VARS BEGIN ///


  /// GLOBAL VARS END ///



  /// DOM FUNCTIONS BEGIN ///
  $(document)
    .on("ready", function() {
      socket = io();

      socket.on("load_world", function(botInfo, time) {
        destroyAllBots();

        jQuery("body").addClass(time);

        var $botInfo = botInfo;
        drawCurrentBots($botInfo);
      });

      socket.on("walk", function(top, left, botName) {
        drawMovement(top, left, botName);
      });

      socket.on("think", function(botName, thinkMessage) {
        drawThink(botName, thinkMessage);
      });

      socket.on("talk", function(botName, talkMessage) {
        drawTalk(botName, talkMessage);
      });

      socket.on("clear_last_phrase", function(botName) {
        clearLastPhrase(botName);
      });

      socket.on("end_talk", function(botName, botPartnerName) {
        clearTalk(botName, botPartnerName);
      });

      socket.on("baby_bot", function(babyBot) {
        drawBabyBot(babyBot)
      });

    });

  /// DOM FUNCTIONS END ///

  function setDayTime(time) {
    jQuery("body").addClass("time");  
  }
  
  function drawCurrentBots($botInfo) {
    console.log("Drawning current bots");
    $totalBots = $botInfo.length;
    $maxBotIndex = $totalBots -1;
    for(var i = 0; i <= $maxBotIndex; i++) {
      var $currentIndex = i;
      var $currentBotName = $botInfo[i][0];
      var $currentBotGender = $botInfo[i][1];
      var $currentBotFace = $botInfo[i][2];
      var $currentBotTop = $botInfo[i][3];
      var $currentBotLeft = $botInfo[i][4];
      var $currentBotId = $botInfo[i][5];
      jQuery("body").append("<div class='bot' id='"+ $currentBotId +"' name='"+ $currentBotName + "'></div>");
      jQuery("#"+$currentBotId).css({top: $currentBotTop, left: $currentBotLeft});
      jQuery("#"+$currentBotId).css("background-image", "url(" + $currentBotFace + ")");
      jQuery("#"+$currentBotId).attr("bot-gender", $currentBotGender);
      jQuery("#"+$currentBotId).append("<div class='think'></div>");
      jQuery("#"+$currentBotId).append("<div class='talk'></div>");
    }
  }

  function drawBabyBot($babyBot) {
    var $currentBotName = $babyBot[0];
    var $currentBotGender = $babyBot[1];
    var $currentBotFace = $babyBot[2];
    var $currentBotTop = $babyBot[3];
    var $currentBotLeft = $babyBot[4];
    var $currentBotId = $botInfo[i][5];
    jQuery("body").append("<div class='bot' id='"+ $currentBotId +"' name='"+ $currentBotName + "'></div>");
    jQuery("#"+$currentBotId).css({top: $currentBotTop, left: $currentBotLeft});
    jQuery("#"+$currentBotId).css("background-image", "url(" + $currentBotFace + ")");
    jQuery("#"+$currentBotId).attr("bot-gender", $currentBotGender);
    jQuery("#"+$currentBotId).append("<div class='think'></div>");
    jQuery("#"+$currentBotId).append("<div class='talk'></div>");
  }

  function drawMovement(top, left, botName) {
    jQuery("#"+botName).animate({ 
      top: top, 
      left: left
    }, {
      duration: 3000,
      done:function() {
        console.log("ending move");
        socket.emit("end_walk");
      }
    });
  }

  function drawThink(botName, thinkMessage) {
    jQuery("#"+botName).find(".think").css("display", "block");
    jQuery("#"+botName).find(".think").text("[Thinking] " + thinkMessage);
  }

  function drawTalk(botName, talkMessage) {
    jQuery("#"+botName).find(".talk").css("display", "block");
    jQuery("#"+botName).find(".talk").text(talkMessage);
  }

  function clearLastPhrase(botName) {
    jQuery("#"+botName).find(".talk").text("");
    jQuery("#"+botName).find(".talk").css("display", "none");
  }

  function clearTalk(botName, botPartnerName) {
    jQuery("#"+botName).find(".talk").text("");
    jQuery("#"+botName).find(".talk").css("display", "none");
    jQuery("#"+botPartnerName).find(".talk").text("");
    jQuery("#"+botPartnerName).find(".talk").css("display", "none");
  }

  function destroyAllBots() {
    jQuery(".bot").remove();
  }

});