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

      socket.on("walk", function(top, left, botId) {
        drawMovement(top, left, botId);
      });

      socket.on("think", function(botId, thinkMessage) {
        drawThink(botId, thinkMessage);
      });

      socket.on("talk", function(botName, talkMessage) {
        drawTalk(botName, talkMessage);
      });

      socket.on("clear_last_phrase", function(botId) {
        clearLastPhrase(botId);
      });

      socket.on("end_talk", function(botId, botPartnerId) {
        clearTalk(botId, botPartnerId);
      });

      socket.on("baby_bot", function(babyBotInfo) {
        drawBabyBot(babyBotInfo);
      });

      socket.on("bot_death", function(botDeadId) {
        drawDeadBot(botDeadId);
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
      var $currentBotLife = $botInfo[i][6];
      jQuery("body").append("<div class='bot' id='"+ $currentBotId +"' name='"+ $currentBotName + "'></div>");
      jQuery("#"+$currentBotId).css({top: $currentBotTop, left: $currentBotLeft});
      jQuery("#"+$currentBotId).css("background-image", "url(" + $currentBotFace + ")");
      jQuery("#"+$currentBotId).attr("bot-gender", $currentBotGender);
      jQuery("#"+$currentBotId).append("<div class='think'></div>");
      jQuery("#"+$currentBotId).append("<div class='talk'></div>");

      if($currentBotLife == "dead") {
        drawDeadBot($currentBotId);
      }

    }
  }

  function drawBabyBot($babyBotInfo) {
    var $currentBotName = $babyBotInfo[0];
    var $currentBotGender = $babyBotInfo[1];
    var $currentBotFace = $babyBotInfo[2];
    var $currentBotTop = $babyBotInfo[3];
    var $currentBotLeft = $babyBotInfo[4];
    var $currentBotId = $babyBotInfo[5];
    jQuery("body").append("<div class='bot' id='"+ $currentBotId +"' name='"+ $currentBotName + "'></div>");
    jQuery("#"+$currentBotId).css({top: $currentBotTop, left: $currentBotLeft});
    jQuery("#"+$currentBotId).css("background-image", "url(" + $currentBotFace + ")");
    jQuery("#"+$currentBotId).attr("bot-gender", $currentBotGender);
    jQuery("#"+$currentBotId).append("<div class='think'></div>");
    jQuery("#"+$currentBotId).append("<div class='talk'></div>");
  }

  function drawMovement(top, left, botId) {
    jQuery("#"+botId).animate({ 
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

  function drawThink(botId, thinkMessage) {
    jQuery("#"+botId).find(".think").css("display", "block");
    jQuery("#"+botId).find(".think").text("[Thinking] " + thinkMessage);
  }

  function drawTalk(botId, talkMessage) {
    jQuery("#"+botId).find(".talk").css("display", "block");
    jQuery("#"+botId).find(".talk").text(talkMessage);
  }

  function clearLastPhrase(botId) {
    jQuery("#"+botId).find(".talk").text("");
    jQuery("#"+botId).find(".talk").css("display", "none");
  }

  function clearTalk(botId, botPartnerId) {
    jQuery("#"+botId).find(".talk").text("");
    jQuery("#"+botId).find(".talk").css("display", "none");
    jQuery("#"+botPartnerId).find(".talk").text("");
    jQuery("#"+botPartnerId).find(".talk").css("display", "none");
  }

  function drawDeadBot(botDeadId) {
    jQuery("#"+botDeadId).css("background-image", "url(/images/rip.png)");
    jQuery("#"+botDeadId).find(".think").text("[DEAD]");
    jQuery("#"+botDeadId).find(".think").css({left: "-5px", width: "50px", display: "block"});
  }

  function destroyAllBots() {
    jQuery(".bot").remove();
  }

});