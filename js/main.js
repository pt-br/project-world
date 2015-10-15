$(function() {

  /// GLOBAL VARS BEGIN ///


  /// GLOBAL VARS END ///



  /// DOM FUNCTIONS BEGIN ///
  $(document)
    .on("ready", function() {
      socket = io();

      socket.on("load_world", function(botList, time) {
        destroyAllBots();

        jQuery("body").addClass(time);

        var $botList = botList;
        drawCurrentBots($botList)
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

    });

  /// DOM FUNCTIONS END ///

  function setDayTime(time) {
    jQuery("body").addClass("time");  
  }
  
  function drawCurrentBots($botList) {
    setTimeout(function() {
      console.log("Drawning current bots");
      $totalBots = $botList.length;
      $maxBotIndex = $totalBots -1;
      for(var i = 0; i <= $maxBotIndex; i++) {
        var $currentIndex = i;
        var $currentBotName = $botList[i].name;
        var $currentBotGender = $botList[i].gender;
        var $currentBotTop = $botList[i].top;
        var $currentBotLeft = $botList[i].left;
        jQuery("body").append("<div class='bot' id='"+ $currentBotName +"'></div>");
        jQuery("#"+$currentBotName).css({ top: $currentBotTop, left: $currentBotLeft });
        jQuery("#"+$currentBotName).attr("bot-gender", $currentBotGender);
        jQuery("#"+$currentBotName).append("<div class='think'></div>");
        jQuery("#"+$currentBotName).append("<div class='talk'></div>");
      }
    }, 300);
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
    jQuery("#"+botName).find(".think").text("[Thinking] " + thinkMessage);
  }

  function drawTalk(botName, talkMessage) {
    jQuery("#"+botName).find(".talk").text(talkMessage);
  }

  function clearLastPhrase(botName) {
    jQuery("#"+botName).find(".talk").text("");
  }

  function clearTalk(botName, botPartnerName) {
    jQuery("#"+botName).find(".talk").text("");
    jQuery("#"+botPartnerName).find(".talk").text("");
  }

  function destroyAllBots() {
    jQuery(".bot").remove();
  }

  // Will use it later...
  // function getMessages() {
  //   console.log("Getting messages");
  //   $.ajax({                                      
  //     url: $path+"php/get_messages.php",              
  //     dataType: "json",    
  //     success: function(data)          
  //     {
  //       var update_rate = data["message"][0]["update_rate"];    
  //       var message = data["message"][0]["message"];   
  //       console.log("sucess");
  //       console.log(message);
  //     } 
  //   });
  // }
  
  // function sendMessage() {    
  //   $('#formMessage').submit(function() {
  //     $.ajax({
  //       type: "POST",
  //       url: $path+"php/send_message.php",
  //       data: $("#formMessage").serialize(),
  //       success: function( data )
  //       {
  //         $(".boxInput").val("");
  //       }
  //     });
  //     event.preventDefault();
  //   });
  // }

  /******************************** LIFE FUNCTIONS END *****************************************/



});