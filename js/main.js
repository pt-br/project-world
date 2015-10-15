$(function() {

  /// GLOBAL VARS BEGIN ///


  /// GLOBAL VARS END ///



  /// DOM FUNCTIONS BEGIN ///
  $(document)
    .on("ready", function() {
      socket = io();

      socket.on("load_world", function(botList) {
        destroyAllBots();
        var $botList = botList;
        drawInitialBots($botList)
      });

      socket.on("walk", function(top, left, botName) {
        drawMovement(top, left, botName);
      });

    });

  /// DOM FUNCTIONS END ///
  
  function drawInitialBots($botList) {
    console.log("DRAW BOTS");
    $totalBots = $botList.length;
    $maxBotIndex = $totalBots -1;
    for(var i = 0; i <= $maxBotIndex; i++) {
      var $currentIndex = i;
      var $currentBotName = $botList[i].name;
      var $currentBotTop = $botList[i].top;
      var $currentBotLeft = $botList[i].left;
      jQuery("body").append("<div class='bot' id='"+ $currentBotName +"'></div>");
      jQuery("#"+$currentBotName).css({ top: $currentBotTop, left: $currentBotLeft });
    }
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