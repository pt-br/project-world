$(function() {

  /// GLOBAL VARS BEGIN ///


  /// GLOBAL VARS END ///



  /// DOM FUNCTIONS BEGIN ///
  $(document)
    .on("ready", function() {
      initializeMatrix();
    });

  /// DOM FUNCTIONS END ///
    

  /// OBJECTS BEGIN ///

  function Bot($botName) {
    var $this = this;
    $this.name = $botName;
    $this.thinkTime;
    $this.busy = false;
    $this.enjoyingConversation = 0;
    $this.nextTo = [];

    jQuery("body").append("<div class='bot' id='"+ $this.name +"'></div>");
    $botList.push($this);
    $$world.setBotThinkTime($this);

    console.log("[ World Info ] TimeThink of " + $this.name + " on his creation: " + $this.getThinkTime());

    setInterval(function() {
      $this.think();
    }, $this.thinkTime);
  }

  function World($worldName) {
    this.name = $worldName;
    this.dayTime;
    this.hour;
  }

  /// OBJECTS END ///
    
  /// LIFE FUNCTIONS BEGIN ///

  function initializeMatrix() {
    console.log("[Initializing Life...]");

    $$world = new World("Project01");
    $$world.setDayTime();
    loadWords("lib/words.txt");

    $botList = [];
    $$botHonki = new Bot("Honki");
    $$botAnna = new Bot("Anna");
    $$botBob = new Bot("Bob");
    timeInfo();
  }
  
  // World Functions //
  World.prototype.setBotThinkTime = function($$botObject) {
    var $newThinkTime = Math.floor((Math.random() * 5000) + 2000);
    $$botObject.thinkTime = $newThinkTime;
  }

  World.prototype.getDayTime = function() {
    return this.dayTime;
  }

  World.prototype.getHour = function() {
    return this.hour;
  }

  World.prototype.setDayTime = function() {
    var $date = new Date();
    var $hour = $date.getHours();
    $hour < 10 ? this.hour = "0" + $hour : this.hour = $hour;
    if($hour > 19 || $hour < 5) {
      this.dayTime = "night";
      jQuery("body").addClass("timeNight");  
    } else {
      this.dayTime = "day";
      jQuery("body").addClass("timeDay");
    }
  }


  // World Functions End //

  /// Bot Functions ///
  Bot.prototype.getName = function() {
    return this.name;
  }
  Bot.prototype.setThinkTime = function($manualThinkTime) {
    //this.thinkTime = $manualThinkTime;
    this.thinkTime = Math.floor((Math.random() * 5000) + $manualThinkTime);
  }
  Bot.prototype.getThinkTime = function() {
    return this.thinkTime;
  }
  Bot.prototype.doNothing = function() {
    console.log("[ " + this.getName() + " ] I'm bored. I don't wanna do nothing now...");
  }
  Bot.prototype.walk = function() {
    console.log("[ " + this.getName() + " ] I'd like to take a walk!");
      
    var $this = this;

    cleanProximity($this);

    var $worldHeight = $(window).height() - 20;
    var $worldWidth = $(window).width() - 20;
    
    var $moveHeigth = Math.floor(Math.random() * $worldHeight);
    var $moveWidth = Math.floor(Math.random() * $worldWidth);
    
    var $newPosition = [$moveHeigth, $moveWidth];    
    
    jQuery("#"+$this.getName()).animate({ 
      top: $newPosition[0], 
      left: $newPosition[1]
    }, 3000, function() {
      checkProximity();
    });  
  }
  Bot.prototype.say = function() {
    var $phraseSize = Math.floor((Math.random() * 5000) + $manualThinkTime);
  }
  Bot.prototype.talk = function() {
    var $this = this;
    console.log("[ " + $this.getName() + " ] I wanna talk a little, but with who?");
    var $nextTotal = $this.nextTo.length;
    var $nextMax = $nextTotal -1;

    if($nextTotal > 0) {
      // Choice one of the next elements to talk to
      var $choosenBotId = Math.floor(Math.random() * $nextMax);
      var $talkingPartner = $this.nextTo[$choosenBotId];
      
      if(!$talkingPartner.busy) {
        // Partner is not busy, it will start a chat
        $talkingPartner.busy = true;
        console.log("[ " + $this.getName() + " ] Aha! I'll talk to " + $talkingPartner.getName());



      } else {
        // Partner busy, can't talk now
        console.log("[ " + $this.getName() + " ] Oh... I would talk with " + $talkingPartner.getName() + " but he's busy now :/");
        $this.busy = false;
      }

    } else {
      // Nobody near
      console.log("[ " + $this.getName() + " ] There is nobody near me to talk :/");
      $this.busy = false;
    }
  }

  Bot.prototype.think = function() {
    var $this = this;
    if(!$this.busy) {
      console.log("[ " + $this.getName() + " ] Hm... I'm thinking...");
      var $newDesire = Math.floor((Math.random() * 3) + 1);
      switch($newDesire) {
        case 1: 
          $$world.setBotThinkTime($this);
          $this.doNothing();
          break;
        case 2: 
          $this.setThinkTime(3000);
          $this.walk();
          break;
        case 3: 
          $$world.setBotThinkTime($this);
          $this.busy = true;
          $this.talk();
          break;
      }
    }
  }

  /// Bot Functions End ///

  function timeInfo() {
    var $hour = $$world.getHour();
    var $time = $$world.getDayTime();
    var $suffix;
    $time == "day" ? $suffix = "am" : $suffix = "pm";    
    console.log("[ World Info ] The time now is " + $hour + " " + $suffix);
  }

  function loadWords(file) {
    var $rawFile = new XMLHttpRequest();
    $rawFile.open("GET", file, false);
    $rawFile.onreadystatechange = function () {
      if($rawFile.readyState === 4) {
        if($rawFile.status === 200 || $rawFile.status == 0) {
          var $allText = $rawFile.responseText;
          $$wordList = $allText.split(",");
        }
      }
    } 
    $rawFile.send(null);
  }

  function cleanProximity($$botObject) {
    // Clean only the nextTo property of the bots affected by a walk
    $totalNextBots = $$botObject.nextTo.length;
    $maxNextBots = $$botObject.nextTo.length -1;
    for(var i = 0; i <= $maxNextBots; i++) {
      $nextObject = $$botObject.nextTo[i];
      $nextObject.nextTo = [];
    }
    $$botObject.nextTo = [];
  }

  function checkProximity() {
    //cleanProximity();
    $totalBots = $botList.length;
    $maxBotIndex = $totalBots -1;
    for(var i = 0; i <= $maxBotIndex; i++) {
      var $currentIndex = i;
      var $currentBotTop = jQuery("#"+$botList[i].getName()).position().top;
      var $currentBotLeft = jQuery("#"+$botList[i].getName()).position().left;
      var $currentPosition = $currentBotLeft + $currentBotTop;
      for(var i2 = 0; i2 <= $maxBotIndex; i2++) {
        if($currentIndex != i2) {
          // Matching another bot
          var $otherBotTop = jQuery("#"+$botList[i2].getName()).position().top;
          var $otherBotLeft = jQuery("#"+$botList[i2].getName()).position().left;
          var $otherPosition = $otherBotLeft + $otherBotTop;

          if($currentPosition > $otherPosition) {
            var $proximityValue = $currentPosition - $otherPosition;
          } else {
            var $proximityValue = $otherPosition - $currentPosition;
          }

          if($proximityValue <= 100) {
            // The current element is next to this element
            console.log("[INFO] "+ $botList[$currentIndex].getName() + " is next to " + $botList[i2].getName());
            $botList[$currentIndex].nextTo.push($botList[i2]);
          }         

        } else {
          // Matching same bot, just ignore
        }
      }
    }
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