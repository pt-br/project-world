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
    this.name = $botName;
    this.thinkTime;

    jQuery("body").append("<div class='bot' id='"+ this.name +"'></div>");
    $$world.setBotThinkTime(this);
    
    var $this = this;

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
    $$world = new World("Project01");
    $$world.setDayTime();
    $$botHonki = new Bot("Honki");
    $$botHonki = new Bot("Anna");
    console.log("[ World Info ] TimeThink of Honki on his creation: " + $$botHonki.getThinkTime());
    console.log("[ World Info ] TimeThink of Anna on his creation: " + $$botHonki.getThinkTime());
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
    
    var $worldHeight = $(window).height() - 10;
    var $worldWidth = $(window).width() - 10;
    
    var $moveHeigth = Math.floor(Math.random() * $worldHeight);
    var $moveWidth = Math.floor(Math.random() * $worldWidth);
    
    var $newPosition = [$moveHeigth, $moveWidth];    
    
    jQuery("#"+this.getName()).animate({ 
      top: $newPosition[0], 
      left: $newPosition[1]
    }, 3000);

  }

  Bot.prototype.think = function() {
    var $bot = this;
    console.log("[ " + $bot.getName() + " ] Hm... I'm thinking...");
    var $newDesire = Math.floor((Math.random() * 2) + 1);
    switch($newDesire) {
      case 1: 
        $$world.setBotThinkTime($bot);
        $bot.doNothing();
        break;
      case 2: 
        $bot.setThinkTime(3000);
        $bot.walk();
        break;
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


  function getMessages() {
    console.log("Getting messages");
    $.ajax({                                      
      url: $path+"php/get_messages.php",              
      dataType: "json",    
      success: function(data)          
      {
        var update_rate = data["message"][0]["update_rate"];    
        var message = data["message"][0]["message"];   
        console.log("sucess");
        console.log(message);
      } 
    });
  }
  
  function sendMessage() {    
    $('#formMessage').submit(function() {
      $.ajax({
        type: "POST",
        url: $path+"php/send_message.php",
        data: $("#formMessage").serialize(),
        success: function( data )
        {
          $(".boxInput").val("");
        }
      });
      event.preventDefault();
    });

  }

  /******************************** LIFE FUNCTIONS END *****************************************/



});