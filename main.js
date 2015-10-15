var express = require('express');
var app = express();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use("/css", express.static(__dirname + '/css'));
app.use("/lib", express.static(__dirname + '/lib'));
app.use("/js", express.static(__dirname + '/js'));

app.get('/', function (req, res) {
    fs.readFile(__dirname + '/index.html', function(err, data) {               
        var $ = cheerio.load(data);

        //$("body").addClass("timeNight");

        res.send($.html());
    });
 });

io.on('connection', function(socket) {
  console.log("User connected");

  console.log("Load world - New socket connected");
  socket.emit("load_world", $botList, $$world.dayTimeClass);
  
  socket.on('walk', function(top, left) {
    console.log("top: " + top);
    console.log("left: " + left);
  });

  socket.on('end_walk', function() {
    checkProximity();
  });

  socket.on('disconnect', function() {
    console.log("User disconnected");
  });

});

var port = 8080;

http.listen(port, function() {
  console.log("Runing server on port: " + port);
});

function loadWords() {
  fs.readFile('lib/words.txt', function(err, data) {
    if(err) throw err;
    var $allText = data.toString();
    $$wordList = $allText.split(/\n/);
    //console.log($$wordList);
  });
}

function Bot($botName, $gender) {
  var $this = this;
  $this.name = $botName;
  $this.gender = $gender;
  $this.thinkTime;
  $this.busy = false;
  $this.enjoyingConversation = 0;
  $this.top = 0;
  $this.left = 0;
  $this.face = "";
  $this.friends = [];
  $this.enemies = [];
  $this.nextTo = [];

  request('http://api.randomuser.me/?gender='+$gender, function (error, response, data) {
  if (!error && response.statusCode == 200) {
      jsonObject = JSON.parse(data);
      $this.face = jsonObject.results[0].user.picture.thumbnail;
    }
  });


  $botList.push($this);
  $$world.setBotThinkTime($this);

  console.warn("[ World Info ] TimeThink of " + $this.name + " on his creation: " + $this.getThinkTime());

  setInterval(function() {
    $this.think();
  }, $this.thinkTime);
}

function World($worldName) {
  this.name = $worldName;
  this.dayTime;
  this.dayTimeClass;
  this.hour;
}

World.prototype.setDayTime = function() {
  var $date = new Date();
  var $hour = $date.getHours();
  $hour < 10 ? this.hour = "0" + $hour : this.hour = $hour;
  if($hour > 19 || $hour < 5) {
    this.dayTime = "night";
    this.dayTimeClass =  "timeNight";
  } else {
    this.dayTime = "day";
    this.dayTimeClass =  "timeDay";
  }
}

World.prototype.getDayTime = function() {
  return this.dayTime;
}

World.prototype.getHour = function() {
  return this.hour;
}

World.prototype.setBotThinkTime = function($$botObject) {
  var $newThinkTime = Math.floor((Math.random() * 5000) + 2000);
  $$botObject.thinkTime = $newThinkTime;
}

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
  io.emit("think", this.getName(), "I'm bored. I don't wanna do nothing now...");
}
Bot.prototype.walk = function() {
  var $this = this;
  console.log("[ " + $this.getName() + " ] I'd like to take a walk!");
  io.emit("think", $this.getName(), "I'd like to take a walk!");

  cleanProximity($this);

  var $worldHeight = 1024 - 20;
  var $worldWidth = 780 - 20;
  
  var $moveHeigth = Math.floor(Math.random() * $worldHeight);
  var $moveWidth = Math.floor(Math.random() * $worldWidth);
  
  var $newPosition = [$moveHeigth, $moveWidth]; 

  // Save the cordinates in the bot's object
  $this.top = $moveHeigth;
  $this.left = $moveWidth;

  console.log("top: " + $moveHeigth);
  console.log("left: " + $moveWidth);

  io.emit('walk', $moveHeigth, $moveWidth, $this.getName()); 
}
Bot.prototype.talk = function() {
  var $this = this;
  console.log("[ THINKING ] " + $this.getName() + " thinks: I wanna talk a little, but with who?");
  io.emit("think", $this.getName(), "I wanna talk a little, but with who?");
  var $nextTotal = $this.nextTo.length;
  var $nextMax = $nextTotal -1;

  if($nextTotal > 0) {
    // Choice one of the next elements to talk to
    var $choosenBotId = Math.floor(Math.random() * $nextMax);
    var $talkingPartner = $this.nextTo[$choosenBotId];
    
    if(!$talkingPartner.busy) {
      // Partner is not busy
      var $relationShip = checkRelationship($this, $talkingPartner);
      if($relationShip == "none" || $relationShip == "friend") {
        // Partnet is not an enemy, start a chat
        $talkingPartner.busy = true;
        console.log("[ " + $this.getName() + " ] Aha! I'll talk to " + $talkingPartner.getName());
        io.emit("think", $this.getName(), "Aha! I'll talk to " + $talkingPartner.getName());
        var $nextPhraseTime = Math.floor((Math.random() * 5000) + 2000);
        var $talkingNow = 1;
        var $chatInterval = setInterval(function() {
          if($this.enjoyingConversation > -3 && $this.enjoyingConversation < 3 && $talkingPartner.enjoyingConversation > -3 && $talkingPartner.enjoyingConversation < 3) {
            // Keep talking
            var $toSay = say();
            
            if($talkingNow == 1) {

              // Clean the last phrase
              io.emit("clear_last_phrase", $talkingPartner.getName());

              console.log("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": " + $toSay);
              io.emit("talk", $this.getName(), "says to " + $talkingPartner.getName() + ": " + $toSay);
              var $like = Math.floor(Math.random() * 2);
              if($like == 0) {
                // Didn't like 
                console.warn("[ THINKING ] " + $talkingPartner.getName() + " thinks: Hmm... I didn't like this...");
                io.emit("think", $talkingPartner.getName(), "Hmm... I didn't like this...");
                $talkingPartner.enjoyingConversation--;
              } else {
                // Like
                console.log("[ THINKING ] " + $talkingPartner.getName() + " thinks: Wow! Interesting");
                io.emit("think", $this.getName(), "Wow! Interesting");
                $talkingPartner.enjoyingConversation++;
              }

              $talkingNow = 2;

            } else {

              // Clean the last phrase
              io.emit("clear_last_phrase", $this.getName());

              console.log("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": " + $toSay);
              io.emit("talk", $talkingPartner.getName(), "says to " + $this.getName() + ": " + $toSay);
              var $like = Math.floor(Math.random() * 2);
              if($like == 0) {
                // Didn't like 
                console.warn("[ THINKING ] " + $this.getName() + " thinks: Hmm... I didn't like this...");
                io.emit("think", $this.getName(), "Hmm... I didn't like this...");
                $this.enjoyingConversation--;
              } else {
                // Like
                console.log("[ THINKING ] " + $this.getName() + " thinks: Wow! Interesting");
                io.emit("think", $this.getName(), "Wow! Interesting");
                $this.enjoyingConversation++;
              }

              $talkingNow = 1;
            }
            $nextPhraseTime = Math.floor((Math.random() * 10000) + 5000);
          } else {
            // Stop the talking
            clearInterval($chatInterval);
            $this.busy = false;
            $talkingPartner.busy = false;

            // Define new friends/enemies
            if($this.enjoyingConversation == 3) {
              var $relationShip = checkRelationship($this, $talkingPartner);
              if($relationShip == "none") {
                $this.friends.push($talkingPartner);
                $talkingPartner.friends.push($this);
                console.log("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": I really liked to talk to you, consider yourself my friend! Goodbye");
                io.emit("talk", $this.getName(), "says to " + $talkingPartner.getName() + ": I really liked to talk to you, consider yourself my friend! Goodbye");
              }
              else if($relationShip == "friend") {
                console.log("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": It's always good to talk with you, my friend! Goodbye");
                io.emit("talk", $this.getName(), "says to " + $talkingPartner.getName() + ": It's always good to talk with you, my friend! Goodbye");
              }
            }
            else if($this.enjoyingConversation == -3) {
              var $relationShip = checkRelationship($this, $talkingPartner);
              if($relationShip == "none") {
                $this.enemies.push($talkingPartner);
                $talkingPartner.enemies.push($this);
                console.error("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": You are a bullshit! Don't be crazy to get in my way again!");
                io.emit("final_talk", $this.getName(), "says to " + $talkingPartner.getName() + ": You are a bullshit! Don't be crazy to get in my way again!");
              }
              else if($relationShip == "friend") {
                $this.enemies.push($talkingPartner);
                removeFriend($this, $talkingPartner);
                $talkingPartner.enemies.push($this);
                removeFriend($talkingPartner, $this);
                console.error("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": I used to be your friend, but after this conversation... NO MORE!");
                io.emit("talk", $this.getName(), "says to " + $talkingPartner.getName() + ": I used to be your friend, but after this conversation... NO MORE!");
              }
            }
            else if($talkingPartner.enjoyingConversation == 3) {
              var $relationShip = checkRelationship($talkingPartner, $this);
              if($relationShip == "none") {
                $talkingPartner.friends.push($this);
                $this.friends.push($talkingPartner);
                console.log("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": I really liked to talk to you, consider yourself my friend! Goodbye");
                io.emit("talk", $talkingPartner.getName(), "says to " + $this.getName() + ": I really liked to talk to you, consider yourself my friend! Goodbye");
              }
              else if($relationShip == "friend") {
                console.log("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": It's always good to talk with you, my friend! Goodbye");
                io.emit("talk", $talkingPartner.getName(), "says to " + $this.getName() + ": It's always good to talk with you, my friend! Goodbye");
              }
            }
            else if($talkingPartner.enjoyingConversation == -3) {
              var $relationShip = checkRelationship($talkingPartner, $this);
              if($relationShip == "none") {
                $talkingPartner.enemies.push($this);
                $this.enemies.push($talkingPartner);
                console.error("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": You are a bullshit! Don't be crazy to get in my way again!");
                io.emit("talk", $talkingPartner.getName(), "says to " + $this.getName() + ": You are a bullshit! Don't be crazy to get in my way again!");
              }
              else if($relationShip == "friend") {
                $talkingPartner.enemies.push($this);
                removeFriend($talkingPartner, $this);
                $this.enemies.push($talkingPartner);
                removeFriend($this, $talkingPartner);
                console.error("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": I used to be your friend, but after this conversation... NO MORE!");
                io.emit("talk", $talkingPartner.getName(), "says to " + $this.getName() + ": I used to be your friend, but after this conversation... NO MORE!");
              }
            }
            // Clean the enjoyingConversation value
            $this.enjoyingConversation = 0;
            $talkingPartner.enjoyingConversation = 0;

            // Clean talk box
            setTimeout(function() {
              io.emit("end_talk", $this.getName(), $talkingPartner.getName());
            }, 6000);
            
          }
        }, $nextPhraseTime);
      } 
      else if ($relationShip == "enemy") {
        console.error("[ THINKING ] " + $this.getName() + " thinks: I don't wanna talk to " + $talkingPartner.getName() + "!");
        io.emit("think", $this.getName(), "I don't wanna talk to " + $talkingPartner.getName() + "!");
        $this.busy = false;
      }
    } else {
      // Partner busy, can't talk now
      console.log("[ THINKING ] " + $this.getName() + " thinks: Oh... I would talk with " + $talkingPartner.getName() + " but he's busy now :/");
      io.emit("think", $this.getName(), "Oh... I would talk with " + $talkingPartner.getName() + " but he's busy now :/");
      $this.busy = false;
    }

  } else {
    // Nobody near
    console.log("[ THINKING ] " + $this.getName() + " thinks: There is nobody near me to talk :/");
    io.emit("think", $this.getName(), "There is nobody near me to talk :/");
    $this.busy = false;
  }
}
Bot.prototype.fight = function() {
  var $this = this;
  $this.busy = true;
}

Bot.prototype.think = function() {
  var $this = this;
  if(!$this.busy) {
    console.log("[ THINKING ] " + $this.getName() + " thinks: Hm... I'm thinking...");
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

function say() {
  var $wordsMax = $$wordList.length - 1;
  var $phraseSize = Math.floor((Math.random() * 5) + 1);
  var $phrase = "";
  for(var i = 0; i <= $phraseSize; i++) {
    var $wordIndex = Math.floor(Math.random() * $wordsMax);
    var $word = $$wordList[$wordIndex];
    $phrase = $phrase + " " + $word; 
  }
  return $phrase;
}

function removeFriend($$bot, $$friend) {
  var $maxFriends = $$bot.friends.length -1 ;
  for(var i = 0; i <= $maxFriends; i++) {
    if($$friend == $$bot.friends[i]) {
      var $index = $$bot.friends.indexOf($$bot.friends[i]);
      $$bot.friends.splice($index, 1);
    }
  }
}

function cleanProximity($$botObject) {
  // Clean only the nextTo property of the bots affected by a walk
  var $totalNextBots = $$botObject.nextTo.length;
  var $maxNextBots = $$botObject.nextTo.length -1;
  for(var i = 0; i <= $maxNextBots; i++) {
    $nextObject = $$botObject.nextTo[i];
    $nextObject.nextTo = [];
  }
  $$botObject.nextTo = [];
}

function checkRelationship($$bot1, $$bot2) {
  var $maxEnemies = $$bot1.enemies.length -1;
  var $maxFriends = $$bot1.friends.length -1;
  var $relationShip = "none";
  // Enemy check
  for(var i = 0; i <= $maxEnemies; i++) {
    if($$bot2 == $$bot1.enemies[i]) {
      // Enemy detected
      $relationShip = "enemy";
    }
  }
  // Friend check
  for(var i = 0; i <= $maxFriends; i++) {
    if($$bot2 == $$bot1.friends[i]) {
      // Friend detected
      $relationShip = "friend";
    }
  }

  return $relationShip;
}

function checkProximity() {
  $totalBots = $botList.length;
  $maxBotIndex = $totalBots -1;
  for(var i = 0; i <= $maxBotIndex; i++) {
    var $currentIndex = i;
    var $currentBotTop = $botList[i].top;
    var $currentBotLeft = $botList[i].left;
    var $currentPosition = $currentBotLeft + $currentBotTop;
    for(var i2 = 0; i2 <= $maxBotIndex; i2++) {
      if($currentIndex != i2) {
        // Matching another bot
        $otherBotTop = $botList[i2].top;
        $otherBotLeft = $botList[i2].left;
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

          var $relationShip = checkRelationship($botList[$currentIndex], $botList[i2]);
          if(!$botList[$currentIndex].busy | !$botList[i2].getName()) {
            if($relationShip == "none") {
              console.log("[ " + $botList[$currentIndex].getName() + " ] I don't know you, " + $botList[i2].getName());
              io.emit("think", $botList[$currentIndex].getName(), "I don't know you, " + $botList[i2].getName());
            }
            else if($relationShip == "friend") {
              console.log("[ " + $botList[$currentIndex].getName() + " ] Hey " + $botList[i2].getName() + ", my friend!");
              io.emit("think", $botList[$currentIndex].getName(), "Hey " + $botList[i2].getName() + ", my friend!");
            }
            else if($relationShip == "enemy") {
              console.error("[ " + $botList[$currentIndex].getName() + " ] I HATE YOU " + $botList[i2].getName() + "!");
              io.emit("think", $botList[$currentIndex].getName(), "I HATE YOU " + $botList[i2].getName() + "!");
            }
          }
        }         

      } else {
        // Matching same bot, just ignore
      }
    }
  }
}

function timeInfo() {
  var $hour = $$world.getHour();
  var $time = $$world.getDayTime();
  var $suffix;
  $time == "day" ? $suffix = "am" : $suffix = "pm";    
  console.warn("[ World Info ] The time now is " + $hour + " " + $suffix);
}

function initializeMatrix() {
  console.warn("[Initializing Life...]");

  $$world = new World("Project01");
  $$world.setDayTime();
  loadWords();

  $botList = [];
  $$botHonki = new Bot("Honki", "male");
  $$botAnna = new Bot("Anna", "female");
  $$botBob = new Bot("Bob", "male");

  timeInfo();
}

initializeMatrix();