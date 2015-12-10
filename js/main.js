$(function() {

  /// GLOBAL VARS BEGIN ///

  var $botInspector = [];

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

        drawInspector($botInfo);

      });

      socket.on("walk", function(top, left, botId) {
        drawMovement(top, left, botId);
      });

      socket.on("learn_walk", function(top, left, botId) {
        drawLearnWalk(top, left, botId);
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

      socket.on("draw_inspector", function(botInfo) {
        drawInspector(botInfo);
      });

      socket.on("send_bot_info_complete", function(botComplete) {
        $botInspector = [];
        $botInspector = botComplete;
        startBotInspector($botInspector);
      });

      // Menu functions
      $(".sideBarButton").click(function() {
        var barButton = $(this);
        var barIcon = barButton.find(".barIcon");
        var sideBar = $(".sideBar");
        if(barButton.hasClass("barClosed")) {
          // Must open menu
          sideBar.css("right", 0);
          barIcon.css("opacity", 0);
          setTimeout(function() {
            barIcon.removeClass("fa-bars");
            barIcon.addClass("fa-close");
            barIcon.css("opacity", 1);
          }, 500);
          
          barButton.removeClass("barClosed");
          barButton.addClass("barOpened");
        } else {
          // Must close menu
          sideBar.css("right", -300);
          barIcon.css("opacity", 0);
          setTimeout(function() {
            barIcon.removeClass("fa-close");
            barIcon.addClass("fa-bars");
            barIcon.css("opacity", 1);
          }, 500);          

          barButton.removeClass("barOpened");
          barButton.addClass("barClosed");
        }
      });

      // Change the navigation content 
      $(".menuItem").click(function() {
        var menuItem = $(this);
        var toActiveClass = menuItem.attr("data-bar");
        var currentActive = $(".sideBarType.active");

        currentActive.css("opacity", 0);
        setTimeout(function() {
          currentActive.removeClass("active");
          currentActive.addClass("inactive");
          var newActive = $(".sideBarType." + toActiveClass);
          newActive.removeClass("inactive");
          newActive.addClass("active");
          newActive.css("opacity", 1);

          if(toActiveClass == "sideBarInspector") {
            socket.emit("inspector_opened");
          }
        }, 500); 
      });

      // Controlling togglers
      $(".inspectingBotArray").click(function() {
        var li = $(this);
        var content = li.find(".inspectingContent");
        var icon = li.find(".inspectingIcon");

        if(content.hasClass("inactive")) {
          content.removeClass("inactive");
          content.addClass("active");
          icon.addClass("open");
        } else {
            icon.removeClass("open");
            content.removeClass("active");
            content.addClass("inactive");
        }
      });

      // Clicking on github's icon should open the repository too
      $(".fa-github").click(function() {
        window.open("https://github.com/pt-br/project-world","_blank");
      });

    });

  /// DOM FUNCTIONS END ///

  function setDayTime(time) {
    jQuery("body").addClass("time");  
  }
  
  function drawCurrentBots($botInfo) {
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
        socket.emit("end_walk");
      }
    });
  }

  function drawLearnWalk(top, left, botId) {
    jQuery("#"+botId).animate({ 
      top: top, 
      left: left
    }, {
      duration: 3000,
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

  function drawInspector($botInfo) {
    jQuery(".inspectBotListContainer").html("");

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

      jQuery(".inspectBotListContainer").append("<div class='inspectBot " + $currentBotId + "' data-bot-id='" + $currentBotId + "'></div>");
      
      var currentInspect = jQuery(".inspectBot." + $currentBotId);
      
      currentInspect.append("<div class='inspectBotPhoto'></div>");
      currentInspect.append("<div class='inspectBotName'>" + $currentBotName + "</div>");

      currentInspect.find(".inspectBotPhoto").css("background-image", "url(" + $currentBotFace + ")");
    }

    // Inspect a bot
    $(".inspectBot").click(function() {
      var $bot = $(this);
      var $botId = $bot.attr("data-bot-id");
      socket.emit("require_bot_info", $botId);
    });
  }

  function startBotInspector($botInfoComplete) {
    var sideBarInspector = $(".sideBarInspector");
    sideBarInspector.css("opacity", 0);
    setTimeout(function() {
      sideBarInspector.removeClass("active");
      sideBarInspector.addClass("inactive");
      var newActive = $(".sideBarInspecting");
      newActive.removeClass("inactive");
      newActive.addClass("active");
      newActive.css("opacity", 1);
    }, 500); 

    var $botName = $botInfoComplete[0];
    var $botGender = $botInfoComplete[1];
    var $botFace = $botInfoComplete[2];
    var $botStatus = $botInfoComplete[3];
    var $botFriends = $botInfoComplete[4].slice(0);
    var $botEnemies = $botInfoComplete[5].slice(0);
    var $botParents = $botInfoComplete[6].slice(0);
    var $botKnowledge = $botInfoComplete[7].slice(0);

    var inspectingContainer = $(".inspectingBotContainer");

    inspectingContainer.find(".inspectingBotPhoto").css("background-image", "url(" + $botFace + ")");
    inspectingContainer.find(".inspectingBotName").text($botName);

    
    if($botGender == "male") {
      inspectingContainer.find(".inspectingBotGender")
        .text($botGender)
        .attr("data-gender", "male");
    } else {
      inspectingContainer.find(".inspectingBotGender")
        .text($botGender)
        .attr("data-gender", "female");
    }

    if($botStatus) {
      inspectingContainer.find(".inspectingBotStatus")
        .text("Live")
        .attr("data-status", "live");
    } else {
      inspectingContainer.find(".inspectingBotStatus")
        .text("Dead")
        .attr("data-status", "dead");
    }

    // Clean togglers
    $(".inspectingContent").html("");

    // Fill togglers
    // Friends
    var totalItems = $botFriends.length;
    if(totalItems == 0) {
      $(".friendsContent").append("<div class='inspectItem'>Has no friends</div>");
    } else {
      maxIndex = totalItems -1;
      for(var i = 0; i <= maxIndex; i++) {
        var currentIndex = i;
        var currentItem = $botFriends[i];
        $(".friendsContent").append("<div class='inspectItem'>" + currentItem +"</div>");
      }
    }

    // Enemies
    var totalItems = $botEnemies.length;
    if(totalItems == 0) {
      $(".enemiesContent").append("<div class='inspectItem'>Has no enemies</div>");
    } else {
      maxIndex = totalItems -1;
      for(var i = 0; i <= maxIndex; i++) {
        var currentIndex = i;
        var currentItem = $botEnemies[i];
        $(".enemiesContent").append("<div class='inspectItem'>" + currentItem +"</div>");
      }
    }

    // Parents
    var totalItems = $botParents.length; 
    maxIndex = totalItems -1;
    for(var i = 0; i <= maxIndex; i++) {
      var currentIndex = i;
      var currentItem = $botParents[i];
      $(".parentsContent").append("<div class='inspectItem'>" + currentItem +"</div>");
    }

    // Knowledge
    var totalItems = $botKnowledge.length; 
    if(totalItems == 0) {
      $(".knowledgeContent").append("<div class='inspectItem'>Has no knowledge</div>");
    } else {
      maxIndex = totalItems -1;
      for(var i = 0; i <= maxIndex; i++) {
        var currentIndex = i;
        var currentItem = $botKnowledge[i];
        $(".knowledgeContent").append("<div class='inspectItem'>" + currentItem[0] +"</div>");
      }
    }
  }

});